import React from 'react';
import { BookOpen, User, Zap, AlertCircle, PlusCircle, Trash2, HelpCircle } from 'lucide-react';
import { SAMPLE_CANAL_A, SAMPLE_CANAL_B, SAMPLE_CANAL_C } from '../data/sampleData';

interface ReferenceScriptsSectionProps {
  canalA: string;
  canalB: string;
  canalC: string;
  onChangeCanalA: (val: string) => void;
  onChangeCanalB: (val: string) => void;
  onChangeCanalC: (val: string) => void;
}

export const ReferenceScriptsSection: React.FC<ReferenceScriptsSectionProps> = ({
  canalA,
  canalB,
  canalC,
  onChangeCanalA,
  onChangeCanalB,
  onChangeCanalC,
}) => {
  const countScripts = (text: string) => {
    if (!text.trim()) return 0;
    return text.split(/\n\s*-----\s*\n/).filter((s) => s.trim().length > 0).length || 1;
  };

  const totalChars = canalA.length + canalB.length + canalC.length;
  const isContextHeavy = totalChars > 100000;
  const atLeastOneFilled = Boolean(canalA.trim() || canalB.trim() || canalC.trim());

  return (
    <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-xl shadow-black/20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800/70 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
              1
            </span>
            <h2 className="text-base font-bold text-zinc-100">
              Roteiros de Referência dos Concorrentes
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Cole roteiros reais para extrair estilo e estrutura. Pelo menos um campo deve ser preenchido. Separe múltiplos roteiros com uma linha contendo <code className="text-amber-300 font-mono bg-zinc-800 px-1 py-0.5 rounded">-----</code>.
          </p>
        </div>

        {/* Global indicator */}
        {!atLeastOneFilled && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs self-start">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Preencha pelo menos um campo ou use exemplo</span>
          </div>
        )}
      </div>

      {/* Context limit advisory banner */}
      {isContextHeavy && (
        <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-300">
              Atenção ao volume de texto ({totalChars.toLocaleString('pt-BR')} caracteres):
            </p>
            <p className="text-amber-200/80 mt-0.5">
              Campos muito longos podem aproximar o limite de contexto ou aumentar o tempo de resposta. Se necessário, deixe apenas 2 a 3 roteiros mais emblemáticos por canal para garantir foco analítico máximo.
            </p>
          </div>
        </div>
      )}

      {/* 3 Reference Fields Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">
        {/* Campo 1: Canal A */}
        <div className="flex flex-col bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 transition-colors focus-within:border-amber-500/50">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">Canal A: Rankings com dados oficiais</h3>
                <p className="text-[11px] text-zinc-400">Enciclopédia das Cidades (didático/oficial)</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!canalA && (
                <button
                  type="button"
                  onClick={() => onChangeCanalA(SAMPLE_CANAL_A)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded transition-colors"
                  title="Inserir trecho de exemplo deste canal"
                >
                  Exemplo
                </button>
              )}
              {canalA && (
                <button
                  type="button"
                  onClick={() => onChangeCanalA('')}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                  title="Limpar campo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={canalA}
            onChange={(e) => onChangeCanalA(e.target.value)}
            placeholder="Cole aqui roteiros do canal Enciclopédia das Cidades...&#10;&#10;Separe mais de um roteiro com:&#10;-----"
            className="w-full h-56 resize-y bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono leading-relaxed"
          />

          <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
            <span>
              {canalA.length.toLocaleString('pt-BR')} caracteres
            </span>
            <span className="text-zinc-400">
              {canalA ? `${countScripts(canalA)} roteiro(s)` : 'Vazio (usará DNA padrão)'}
            </span>
          </div>
        </div>

        {/* Campo 2: Canal B */}
        <div className="flex flex-col bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 transition-colors focus-within:border-amber-500/50">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">Canal B: Persona forte e custo de vida</h3>
                <p className="text-[11px] text-zinc-400">Zé do Mapa (conversa de amigo, lado B)</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!canalB && (
                <button
                  type="button"
                  onClick={() => onChangeCanalB(SAMPLE_CANAL_B)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded transition-colors"
                  title="Inserir trecho de exemplo deste canal"
                >
                  Exemplo
                </button>
              )}
              {canalB && (
                <button
                  type="button"
                  onClick={() => onChangeCanalB('')}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                  title="Limpar campo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={canalB}
            onChange={(e) => onChangeCanalB(e.target.value)}
            placeholder="Cole aqui roteiros do canal Zé do Mapa...&#10;&#10;Separe mais de um roteiro com:&#10;-----"
            className="w-full h-56 resize-y bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono leading-relaxed"
          />

          <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
            <span>
              {canalB.length.toLocaleString('pt-BR')} caracteres
            </span>
            <span className="text-zinc-400">
              {canalB ? `${countScripts(canalB)} roteiro(s)` : 'Vazio (usará DNA padrão)'}
            </span>
          </div>
        </div>

        {/* Campo 3: Canal C */}
        <div className="flex flex-col bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 transition-colors focus-within:border-amber-500/50">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-200">Canal C: Listas curtas de qualidade</h3>
                <p className="text-[11px] text-zinc-400">Extraindo o Mundo (ágil, dinâmico)</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {!canalC && (
                <button
                  type="button"
                  onClick={() => onChangeCanalC(SAMPLE_CANAL_C)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded transition-colors"
                  title="Inserir trecho de exemplo deste canal"
                >
                  Exemplo
                </button>
              )}
              {canalC && (
                <button
                  type="button"
                  onClick={() => onChangeCanalC('')}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                  title="Limpar campo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <textarea
            value={canalC}
            onChange={(e) => onChangeCanalC(e.target.value)}
            placeholder="Cole aqui roteiros do canal Extraindo o Mundo...&#10;&#10;Separe mais de um roteiro com:&#10;-----"
            className="w-full h-56 resize-y bg-zinc-900/80 border border-zinc-800/80 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 font-mono leading-relaxed"
          />

          <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
            <span>
              {canalC.length.toLocaleString('pt-BR')} caracteres
            </span>
            <span className="text-zinc-400">
              {canalC ? `${countScripts(canalC)} roteiro(s)` : 'Vazio (usará DNA padrão)'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
