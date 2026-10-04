import React from 'react';
import { Sparkles, FileText, RotateCcw, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  onLoadExample: () => void;
  onOpenPromptModal: () => void;
  onClearAll: () => void;
  totalChars: number;
  hasReferences: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadExample,
  onOpenPromptModal,
  onClearAll,
  totalChars,
  hasReferences,
}) => {
  const estimatedTokens = Math.round(totalChars / 4);
  const isHighContext = totalChars > 120000;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-[1px] shadow-lg shadow-amber-500/10 flex-shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                Roteirista <span className="text-amber-400">Espelho</span>
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                YouTube Brasil
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Roteiros originais para canais de cidades, baseados em padrões de canais de referência
            </p>
          </div>
        </div>

        {/* Status and Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Context gauge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border ${
              isHighContext
                ? 'bg-amber-950/40 border-amber-700/50 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title="Total de caracteres colados nos campos de referência"
          >
            {isHighContext ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            )}
            <span>
              {totalChars.toLocaleString('pt-BR')} chars (~{estimatedTokens.toLocaleString('pt-BR')} tokens)
            </span>
          </div>

          {/* Quick example loader */}
          <button
            type="button"
            onClick={onLoadExample}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/70 hover:border-zinc-600 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Carregar Exemplo</span>
          </button>

          {/* Prompt editor trigger */}
          <button
            type="button"
            onClick={onOpenPromptModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors"
            title="Ver ou personalizar a instrução de sistema do Gemini"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>Instrução de Sistema</span>
          </button>

          {/* Reset form */}
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
            title="Limpar todos os campos"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden lg:inline">Limpar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
