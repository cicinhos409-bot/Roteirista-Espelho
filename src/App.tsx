/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ReferenceScriptsSection } from './components/ReferenceScriptsSection';
import { VideoConfigSection } from './components/VideoConfigSection';
import { OutputTabs } from './components/OutputTabs';
import { SystemPromptModal } from './components/SystemPromptModal';
import { GeneratorFormState, GeneratedOutput } from './types';
import { DEFAULT_SYSTEM_INSTRUCTION } from './config/systemPrompt';
import {
  SAMPLE_CANAL_A,
  SAMPLE_CANAL_B,
  SAMPLE_CANAL_C,
  SAMPLE_DATA_CONFIG,
} from './data/sampleData';
import { buildUserPrompt, parseMarkdownSections } from './utils/promptBuilder';
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_FORM = 'roteirista_espelho_form_v1';
const STORAGE_KEY_PROMPT = 'roteirista_espelho_prompt_v1';
const STORAGE_KEY_OUTPUT = 'roteirista_espelho_last_output_v1';

const INITIAL_FORM: GeneratorFormState = {
  canalA_scripts: '',
  canalB_scripts: '',
  canalC_scripts: '',
  videoTheme: '',
  videoType: 'ranking_economico',
  baseStyle: 'canal_a',
  itemCount: 10,
  itemOrder: 'regressiva',
  targetDurationMinutes: 12,
  channelName: '',
  narratorPersona: '',
  verifiedData: '',
  dataSource: '',
  closingType: 'comentario_inscricao',
  productConfig: {
    productName: '',
    price: '',
    purchaseLinkOrQR: '',
    warranty: '',
  },
};

export default function App() {
  // Form state
  const [form, setForm] = useState<GeneratorFormState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FORM);
      if (saved) {
        return { ...INITIAL_FORM, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Falha ao ler formulário salvo:', e);
    }
    return INITIAL_FORM;
  });

  // System instruction state
  const [systemInstruction, setSystemInstruction] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMPT);
      if (saved) return saved;
    } catch (e) {
      console.error('Falha ao ler prompt salvo:', e);
    }
    return DEFAULT_SYSTEM_INSTRUCTION;
  });

  // Output state
  const [lastOutput, setLastOutput] = useState<GeneratedOutput | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OUTPUT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Falha ao ler último roteiro:', e);
    }
    return null;
  });

  // Streaming and runtime state
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawText, setRawText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  const outputRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-save form to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(form));
    } catch (e) {
      console.error('Erro ao salvar formulário no localStorage:', e);
    }
  }, [form]);

  // Auto-save custom prompt
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROMPT, systemInstruction);
    } catch (e) {
      console.error('Erro ao salvar instrução no localStorage:', e);
    }
  }, [systemInstruction]);

  // Partial update helper
  const handleUpdateForm = (updates: Partial<GeneratorFormState>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    if (validationError) setValidationError(null);
  };

  // Load sample data
  const handleLoadExample = () => {
    setForm({
      canalA_scripts: SAMPLE_CANAL_A,
      canalB_scripts: SAMPLE_CANAL_B,
      canalC_scripts: SAMPLE_CANAL_C,
      videoTheme: SAMPLE_DATA_CONFIG.theme,
      videoType: SAMPLE_DATA_CONFIG.type,
      baseStyle: SAMPLE_DATA_CONFIG.style,
      itemCount: SAMPLE_DATA_CONFIG.itemCount,
      itemOrder: SAMPLE_DATA_CONFIG.order,
      targetDurationMinutes: SAMPLE_DATA_CONFIG.durationMinutes,
      channelName: SAMPLE_DATA_CONFIG.channelName,
      narratorPersona: SAMPLE_DATA_CONFIG.narratorPersona,
      verifiedData: SAMPLE_DATA_CONFIG.verifiedData,
      dataSource: SAMPLE_DATA_CONFIG.dataSource,
      closingType: 'comentario_inscricao',
      productConfig: {
        productName: 'Guia de Moradia e Custo de Vida SC 2025',
        price: 'R$ 47,00',
        purchaseLinkOrQR: 'Link fixado nos comentários e QR code na tela',
        warranty: 'Garantia incondicional de 7 dias',
      },
    });
    setValidationError(null);
  };

  // Clear all fields
  const handleClearAll = () => {
    if (window.confirm('Deseja realmente limpar todos os campos preenchidos?')) {
      setForm(INITIAL_FORM);
      setValidationError(null);
    }
  };

  // Validation before generating
  const validateForm = (): boolean => {
    if (!form.videoTheme.trim()) {
      setValidationError('Por favor, informe o Tema do Vídeo antes de gerar.');
      return false;
    }
    if (!form.itemCount || form.itemCount < 1) {
      setValidationError('Por favor, defina a Quantidade de Itens (mínimo 1).');
      return false;
    }
    const hasAtLeastOneReference = Boolean(
      form.canalA_scripts.trim() || form.canalB_scripts.trim() || form.canalC_scripts.trim()
    );
    if (!hasAtLeastOneReference) {
      setValidationError(
        'Pelo menos um campo de roteiro de referência deve estar preenchido (ou clique em "Carregar Exemplo" para testar com roteiros reais).'
      );
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Generate Handler with Server-Sent Events Streaming
  const handleGenerate = async () => {
    if (!validateForm()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setRawText('');

    // Smoothly scroll down to output area
    setTimeout(() => {
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);

    const userPrompt = buildUserPrompt(form);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          customSystemInstruction: systemInstruction,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro do servidor (${response.status})`);
      }

      if (!response.body) {
        throw new Error('Nenhum fluxo de dados recebido do servidor.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.replace('data: ', '').trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                setValidationError(data.error);
                setIsGenerating(false);
                return;
              }
              if (data.statusMessage) {
                setValidationError(data.statusMessage);
              }
              if (data.text) {
                // Clear any temporary status messages once text starts flowing
                setValidationError((prev) => (prev?.startsWith('Modelo') ? null : prev));
                accumulatedText += data.text;
                setRawText(accumulatedText);
              }
              if (data.done) {
                // Generation completed
              }
            } catch (jsonErr) {
              console.warn('Erro ao decodificar chunk SSE:', jsonErr);
            }
          }
        }
      }

      // Final parsed result
      const parsed = parseMarkdownSections(accumulatedText);
      const newOutput: GeneratedOutput = {
        raw: accumulatedText,
        roteiroFinal: parsed.roteiroFinal || accumulatedText,
        analiseConcorrentes: parsed.analiseConcorrentes,
        pacotePublicacao: parsed.pacotePublicacao,
        checklistConferencia: parsed.checklistConferencia,
        createdAt: Date.now(),
        wordCount: accumulatedText.split(/\s+/).filter(Boolean).length,
        estimatedMinutes: Math.round((accumulatedText.split(/\s+/).filter(Boolean).length / 150) * 10) / 10,
        theme: form.videoTheme,
      };

      setLastOutput(newOutput);
      try {
        localStorage.setItem(STORAGE_KEY_OUTPUT, JSON.stringify(newOutput));
      } catch (e) {
        console.error('Falha ao salvar cache de saída:', e);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        console.log('Geração cancelada pelo usuário.');
      } else {
        console.error('Erro na chamada da API:', err);
        setValidationError(
          err instanceof Error
            ? err.message
            : 'Falha na conexão com o servidor. Verifique a chave de API e tente novamente.'
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const parsedCurrentSections = parseMarkdownSections(rawText);
  const activeRoteiro = isGenerating
    ? parsedCurrentSections.roteiroFinal || rawText
    : lastOutput?.roteiroFinal || parsedCurrentSections.roteiroFinal || '';
  const activeAnalise = isGenerating
    ? parsedCurrentSections.analiseConcorrentes
    : lastOutput?.analiseConcorrentes || parsedCurrentSections.analiseConcorrentes || '';
  const activePublicacao = isGenerating
    ? parsedCurrentSections.pacotePublicacao
    : lastOutput?.pacotePublicacao || parsedCurrentSections.pacotePublicacao || '';
  const activeChecklist = isGenerating
    ? parsedCurrentSections.checklistConferencia
    : lastOutput?.checklistConferencia || parsedCurrentSections.checklistConferencia || '';

  const totalChars =
    form.canalA_scripts.length + form.canalB_scripts.length + form.canalC_scripts.length;
  const hasReferences = totalChars > 0;
  const hasAnyOutput = Boolean(activeRoteiro || isGenerating);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header bar */}
      <Header
        onLoadExample={handleLoadExample}
        onOpenPromptModal={() => setIsPromptModalOpen(true)}
        onClearAll={handleClearAll}
        totalChars={totalChars}
        hasReferences={hasReferences}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Intro banner / mission */}
        <div className="bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-zinc-900/90 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Engenharia Reversa de Sucesso no YouTube de Cidades</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-3xl leading-relaxed">
              O Roteirista Espelho decodifica ganchos, ganchos de retenção e ritmo de canais como{' '}
              <strong className="text-zinc-200">Enciclopédia das Cidades</strong>,{' '}
              <strong className="text-zinc-200">Zé do Mapa</strong> e{' '}
              <strong className="text-zinc-200">Extraindo o Mundo</strong> para criar um roteiro 100% original, eliminando erros amadores, exageros e alucinações de dados.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleLoadExample}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors whitespace-nowrap"
            >
              Testar com Exemplo SC
            </button>
          </div>
        </div>

        {/* Seção 1: Roteiros de Referência */}
        <ReferenceScriptsSection
          canalA={form.canalA_scripts}
          canalB={form.canalB_scripts}
          canalC={form.canalC_scripts}
          onChangeCanalA={(val) => handleUpdateForm({ canalA_scripts: val })}
          onChangeCanalB={(val) => handleUpdateForm({ canalB_scripts: val })}
          onChangeCanalC={(val) => handleUpdateForm({ canalC_scripts: val })}
        />

        {/* Seção 2: Configuração do Novo Vídeo */}
        <VideoConfigSection
          form={form}
          onChangeForm={handleUpdateForm}
          onSubmit={handleGenerate}
          isGenerating={isGenerating}
          validationError={validationError}
        />

        {/* Seção de Saída em Abas */}
        <div ref={outputRef} className="pt-2">
          {hasAnyOutput ? (
            <OutputTabs
              roteiroFinal={activeRoteiro}
              analiseConcorrentes={activeAnalise}
              pacotePublicacao={activePublicacao}
              checklistConferencia={activeChecklist}
              rawText={rawText}
              isStreaming={isGenerating}
              onRegenerate={handleGenerate}
              videoTheme={form.videoTheme}
            />
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center bg-zinc-900/30">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-500 mx-auto flex items-center justify-center mb-3 border border-zinc-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">
                Seu roteiro original aparecerá aqui
              </h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
                Preencha as referências e a configuração acima e clique em &quot;Gerar Roteiro Original&quot; para iniciar o streaming das 4 seções.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Roteirista Espelho &copy; {new Date().getFullYear()} &bull; Desenvolvido para criadores e canais de cidades do YouTube Brasil.
          </p>
          <p className="text-[11px] text-zinc-500 font-mono">
            Powered by Gemini &bull; Temperatura 0.8
          </p>
        </div>
      </footer>

      {/* System Prompt Customization Modal */}
      <SystemPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        activePrompt={systemInstruction}
        onSavePrompt={(newPrompt) => setSystemInstruction(newPrompt)}
        onResetPrompt={() => setSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION)}
      />
    </div>
  );
}
