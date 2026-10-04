import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../config/systemPrompt';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePrompt: string;
  onSavePrompt: (newPrompt: string) => void;
  onResetPrompt: () => void;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  activePrompt,
  onSavePrompt,
  onResetPrompt,
}) => {
  const [localPrompt, setLocalPrompt] = useState(activePrompt);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalPrompt(activePrompt);
  }, [activePrompt, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSavePrompt(localPrompt);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setLocalPrompt(DEFAULT_SYSTEM_INSTRUCTION);
    onResetPrompt();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 1200);
  };

  const isDefault = localPrompt.trim() === DEFAULT_SYSTEM_INSTRUCTION.trim();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-zinc-100">
                Instrução de Sistema do Roteirista (Gemini)
              </h3>
              {!isDefault && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Personalizado
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Arquivo editável com DNA dos canais concorrentes, regras de qualidade obrigatórias e ordem de processo.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Editor da Instrução Ativa:</span>
            <span className="font-mono text-zinc-500">
              {localPrompt.length.toLocaleString('pt-BR')} caracteres
            </span>
          </div>

          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            className="w-full h-[450px] bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500/60 resize-y"
          />

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              Qualquer alteração feita aqui guiará as próximas gerações do Gemini. Se desejar retornar às regras originais (DNA dos 3 canais e 15 regras de qualidade), basta clicar em &quot;Restaurar Padrão&quot;.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <button
            type="button"
            onClick={handleReset}
            disabled={isDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Padrão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-zinc-950" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <span>Salvar Instrução</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
