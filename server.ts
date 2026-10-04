import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { DEFAULT_SYSTEM_INSTRUCTION } from './src/config/systemPrompt.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Mutable in-memory system prompt if user edits it during the session
let currentSystemInstruction = DEFAULT_SYSTEM_INSTRUCTION;

// Initialize GoogleGenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models in order of priority.
// gemini-3.1-flash-lite is fastest and highly available; gemini-3.8-flash and gemini-flash-latest as backups
const CANDIDATE_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

function formatErrorMessage(err: unknown): string {
  if (!err) return 'Erro desconhecido ao se comunicar com o modelo de IA.';
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message);
      if (parsed?.error?.message) {
        try {
          const inner = JSON.parse(parsed.error.message);
          if (inner?.error?.message) {
            return inner.error.message;
          }
        } catch {
          return parsed.error.message;
        }
      }
    } catch {
      // Not JSON string
    }
    return err.message;
  }
  return String(err);
}

// GET current system prompt and models
app.get('/api/system-prompt', (req, res) => {
  res.json({
    systemPrompt: currentSystemInstruction,
    isDefault: currentSystemInstruction === DEFAULT_SYSTEM_INSTRUCTION,
    availableModels: CANDIDATE_MODELS,
  });
});

// POST update system prompt
app.post('/api/system-prompt', (req, res) => {
  const { systemPrompt } = req.body;
  if (typeof systemPrompt === 'string' && systemPrompt.trim().length > 0) {
    currentSystemInstruction = systemPrompt;
    res.json({ success: true, systemPrompt: currentSystemInstruction });
  } else {
    res.status(400).json({ error: 'Instrução de sistema inválida.' });
  }
});

// POST reset system prompt to default
app.post('/api/system-prompt/reset', (req, res) => {
  currentSystemInstruction = DEFAULT_SYSTEM_INSTRUCTION;
  res.json({ success: true, systemPrompt: currentSystemInstruction });
});

// POST streaming generation via Server-Sent Events with fallback
app.post('/api/generate', async (req, res) => {
  const { prompt, customSystemInstruction, preferredModel } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt não fornecido ou inválido.' });
  }

  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY não configurada no servidor. Configure a chave no ambiente do AI Studio.',
    });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  const instructionToUse = customSystemInstruction || currentSystemInstruction;

  // Determine model chain
  const modelChain = preferredModel
    ? [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)]
    : CANDIDATE_MODELS;

  let clientAborted = false;
  // Proper client abort detection on res:
  res.on('close', () => {
    if (!res.writableEnded) {
      clientAborted = true;
    }
  });

  let streamSucceeded = false;
  let lastError: unknown = null;

  for (const modelName of modelChain) {
    if (clientAborted) break;

    try {
      console.log(`[Roteirista Espelho] Conectando ao modelo: ${modelName}...`);
      
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: prompt,
        config: {
          systemInstruction: instructionToUse,
          temperature: 0.8,
        },
      });

      // Notify client which model is generating
      res.write(`data: ${JSON.stringify({ activeModel: modelName })}\n\n`);

      for await (const chunk of responseStream) {
        if (clientAborted) break;
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      streamSucceeded = true;
      console.log(`[Roteirista Espelho] Transmissão concluída com sucesso usando ${modelName}`);
      break;
    } catch (err: unknown) {
      lastError = err;
      console.warn(`[Roteirista Espelho] Erro no modelo ${modelName}:`, err instanceof Error ? err.message : err);
      
      const nextIndex = modelChain.indexOf(modelName) + 1;
      if (nextIndex < modelChain.length && !clientAborted) {
        const nextModel = modelChain[nextIndex];
        res.write(
          `data: ${JSON.stringify({
            statusMessage: `Modelo ${modelName} indisponível momentaneamente. Conectando a ${nextModel}...`,
          })}\n\n`
        );
      }
    }
  }

  if (clientAborted) {
    res.end();
    return;
  }

  if (streamSucceeded) {
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  } else {
    const errorMsg = formatErrorMessage(lastError);
    res.write(
      `data: ${JSON.stringify({
        error: `Falha na geração: ${errorMsg}. Por favor, tente novamente.`,
      })}\n\n`
    );
  }

  res.end();
});

// Serve frontend in dev (Vite middlewares) or production (static)
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Roteirista Espelho] Servidor rodando em http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Falha ao iniciar o servidor:', err);
});
