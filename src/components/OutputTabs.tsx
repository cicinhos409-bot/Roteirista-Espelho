import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Download,
  RotateCw,
  Eye,
  FileText,
  BarChart3,
  Share2,
  CheckSquare,
  AlertCircle,
  Sparkles,
  Maximize2,
  Type,
} from 'lucide-react';
import { countWords } from '../utils/promptBuilder';

interface OutputTabsProps {
  roteiroFinal: string;
  analiseConcorrentes: string;
  pacotePublicacao: string;
  checklistConferencia: string;
  rawText: string;
  isStreaming: boolean;
  onRegenerate: () => void;
  videoTheme: string;
  targetDurationMinutes?: number;
  itemCount?: number;
}

export const OutputTabs: React.FC<OutputTabsProps> = ({
  roteiroFinal,
  analiseConcorrentes,
  pacotePublicacao,
  checklistConferencia,
  rawText,
  isStreaming,
  onRegenerate,
  videoTheme,
  targetDurationMinutes = 12,
  itemCount = 10,
}) => {
  const [activeTab, setActiveTab] = useState<'roteiro' | 'analise' | 'publicacao' | 'checklist'>('roteiro');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [teleprompterSize, setTeleprompterSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const wordCount = useMemo(() => countWords(roteiroFinal), [roteiroFinal]);
  const estimatedMinutes = Math.max(0.1, Math.round((wordCount / 150) * 10) / 10);
  const targetWords = targetDurationMinutes * 150;
  const adherencePercent = targetWords > 0 ? Math.round((wordCount / targetWords) * 100) : 100;

  // Count [CONFERIR: ...] tags
  const conferirMatches = useMemo(() => {
    return (roteiroFinal.match(/\[CONFERIR:[^\]]+\]/gi) || []).length;
  }, [roteiroFinal]);

  // Handle copy with feedback
  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(identifier);
    setTimeout(() => {
      setCopiedTab(null);
    }, 2000);
  };

  // Download .txt of roteiro
  const handleDownloadTxt = (content: string, filenameSuffix: string) => {
    const safeTitle = (videoTheme || 'roteiro').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${safeTitle}_${filenameSuffix}.txt`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download complete project package (.txt)
  const handleDownloadFullPackage = () => {
    const safeTitle = (videoTheme || 'roteiro_completo').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fullContent = `=====================================================
ROTEIRISTA ESPELHO - PACOTE COMPLETO DE PRODUÇÃO
Tema: ${videoTheme}
Palavras: ~${wordCount} (~${estimatedMinutes} min de narração)
Data de Geração: ${new Date().toLocaleString('pt-BR')}
=====================================================

# 1. ROTEIRO FINAL
${roteiroFinal}

=====================================================
# 2. ANÁLISE DOS CONCORRENTES
${analiseConcorrentes}

=====================================================
# 3. PACOTE DE PUBLICAÇÃO
${pacotePublicacao}

=====================================================
# 4. CHECKLIST DE CONFERÊNCIA
${checklistConferencia}
`;
    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}_pacote_completo.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render highlighted text for [CONFERIR: ...]
  const renderHighlightedScript = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\[CONFERIR:[^\]]+\])/gi);
    return parts.map((part, index) => {
      if (part.toLowerCase().startsWith('[conferir:')) {
        return (
          <mark
            key={index}
            className="bg-amber-500/25 text-amber-200 border border-amber-500/40 rounded px-1.5 py-0.5 mx-0.5 font-semibold inline-flex items-center gap-1"
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 inline" />
            <span>{part}</span>
          </mark>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Parse checklist lines into interactive check items
  const checklistLines = useMemo(() => {
    if (!checklistConferencia) return [];
    return checklistConferencia
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
  }, [checklistConferencia]);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
      {/* Top Bar with Tabs and Master Actions */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setActiveTab('roteiro')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'roteiro'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Roteiro Final</span>
            {wordCount > 0 && (
              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.2 rounded font-mono text-zinc-300">
                {wordCount} pal
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analise')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'analise'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>2. Análise dos Concorrentes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('publicacao')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'publicacao'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>3. Pacote de Publicação</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'checklist'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>4. Checklist de Conferência</span>
            {conferirMatches > 0 && (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono border border-amber-500/30">
                {conferirMatches}
              </span>
            )}
          </button>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {/* Regenerate Button */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isStreaming}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-zinc-700 transition-colors disabled:opacity-50"
            title="Gerar novamente mantendo os parâmetros atuais"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin text-amber-400' : ''}`} />
            <span>Gerar novamente</span>
          </button>

          {/* Download Complete Package */}
          <button
            type="button"
            onClick={handleDownloadFullPackage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 hover:border-amber-500/50 transition-colors"
            title="Baixar roteiro, análise, títulos, tags e checklist em um único arquivo .txt"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Baixar Tudo (.txt)</span>
          </button>
        </div>
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-medium">Gerando conteúdo em streaming... O texto é atualizado em tempo real.</span>
          </div>
          <span className="font-mono text-[11px] text-amber-400/80">
            {countWords(rawText)} palavras geradas
          </span>
        </div>
      )}

      {/* Tab Contents Area */}
      <div className="p-5 sm:p-6">
        {/* ==================================================== */}
        {/* TAB 1: ROTEIRO FINAL */}
        {/* ==================================================== */}
        {activeTab === 'roteiro' && (
          <div className="space-y-4">
            {/* Header info & local actions */}
            <div className="flex flex-col gap-3 pb-3 border-b border-zinc-800/80">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800 text-zinc-300">
                    Palavras geradas: <strong className="text-amber-400">{wordCount.toLocaleString('pt-BR')}</strong> / {targetWords.toLocaleString('pt-BR')} meta
                  </span>
                  <span className="text-xs font-mono bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800 text-zinc-300">
                    Duração: <strong className="text-amber-400">~{estimatedMinutes} min</strong> / {targetDurationMinutes} min alvo
                  </span>
                  <span
                    className={`text-xs font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                      adherencePercent >= 85 && adherencePercent <= 115
                        ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                        : adherencePercent > 115
                        ? 'bg-blue-950/40 border-blue-700/50 text-blue-300'
                        : 'bg-amber-950/40 border-amber-700/50 text-amber-300'
                    }`}
                  >
                    <span>{adherencePercent}% da meta de palavras</span>
                  </span>
                  {conferirMatches > 0 ? (
                    <span className="text-xs font-mono bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      <strong>{conferirMatches}</strong> pontos para conferir
                    </span>
                  ) : (
                    <span className="text-xs font-mono bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Sem pendências [CONFERIR]
                    </span>
                  )}
                </div>

                {/* Reader font toggles & Download/Copy */}
                <div className="flex items-center gap-2">
                  {/* Font size picker for teleprompter */}
                  <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setTeleprompterSize('normal')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        teleprompterSize === 'normal' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Fonte padrão"
                    >
                      1x
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeleprompterSize('large')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        teleprompterSize === 'large' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Fonte média (leitura confortável)"
                    >
                      1.25x
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeleprompterSize('xlarge')}
                      className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                        teleprompterSize === 'xlarge' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      title="Fonte teleprompter (gravação em voz alta)"
                    >
                      1.5x
                    </button>
                  </div>

                  {/* Baixar .txt */}
                  <button
                    type="button"
                    onClick={() => handleDownloadTxt(roteiroFinal, 'roteiro_narracao')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Baixar .txt</span>
                  </button>

                  {/* Copiar */}
                  <button
                    type="button"
                    onClick={() => handleCopy(roteiroFinal, 'roteiro')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                  >
                    {copiedTab === 'roteiro' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Roteiro</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress bar visual for word budget adherence */}
              <div className="w-full bg-zinc-950 rounded-full h-1.5 border border-zinc-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    adherencePercent >= 85
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-400'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, adherencePercent)}%` }}
                />
              </div>
            </div>

            {/* Script Display */}
            <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-6 min-h-[380px] shadow-inner">
              {roteiroFinal ? (
                <div
                  className={`leading-relaxed text-zinc-100 whitespace-pre-wrap selection:bg-amber-500/30 ${
                    teleprompterSize === 'xlarge'
                      ? 'text-lg leading-loose font-normal tracking-wide'
                      : teleprompterSize === 'large'
                      ? 'text-base leading-relaxed'
                      : 'text-sm leading-relaxed'
                  }`}
                >
                  {renderHighlightedScript(roteiroFinal)}
                </div>
              ) : isStreaming ? (
                <div className="text-sm font-mono text-zinc-400 whitespace-pre-wrap">
                  {rawText || 'Aguardando primeiros blocos de narração...'}
                </div>
              ) : (
                <div className="text-center py-16 text-zinc-500 text-sm">
                  Nenhum roteiro gerado ainda. Configure os campos acima e clique em &quot;Gerar Roteiro Original&quot;.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: ANÁLISE DOS CONCORRENTES */}
        {/* ==================================================== */}
        {activeTab === 'analise' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <p className="text-xs text-zinc-400">
                Detalhamento da estrutura média extraída dos canais concorrentes, padrões de gancho, ritmo, o que foi reaproveitado e correções aplicadas.
              </p>
              <button
                type="button"
                onClick={() => handleCopy(analiseConcorrentes, 'analise')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
              >
                {copiedTab === 'analise' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Análise</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-6 min-h-[380px] text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
              {analiseConcorrentes || (
                <div className="text-center py-16 text-zinc-500 text-sm">
                  {isStreaming ? 'Gerando análise comparativa...' : 'Análise não disponível.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: PACOTE DE PUBLICAÇÃO */}
        {/* ==================================================== */}
        {activeTab === 'publicacao' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <p className="text-xs text-zinc-400">
                5 opções de título de alto clique, 3 textos curtos para thumbnail (até 4 palavras), descrição otimizada para SEO e 15 tags prontas para o YouTube.
              </p>
              <button
                type="button"
                onClick={() => handleCopy(pacotePublicacao, 'publicacao')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
              >
                {copiedTab === 'publicacao' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Pacote Completo</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-6 min-h-[380px] text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {pacotePublicacao || (
                <div className="text-center py-16 text-zinc-500 text-sm">
                  {isStreaming ? 'Gerando títulos, thumbnails, descrição e tags...' : 'Pacote de publicação não disponível.'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: CHECKLIST DE CONFERÊNCIA */}
        {/* ==================================================== */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Checklist pré-gravação (Regras de Ouro)
                </p>
                <p className="text-xs text-zinc-400">
                  Marque cada afirmação, número ou nome verificado antes de ligar a câmera ou o microfone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(checklistConferencia, 'checklist')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
              >
                {copiedTab === 'checklist' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Checklist</span>
                  </>
                )}
              </button>
            </div>

            {checklistLines.length > 0 ? (
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-4 sm:p-5 divide-y divide-zinc-900 space-y-2">
                {checklistLines.map((line, idx) => {
                  const id = `check-${idx}`;
                  const isChecked = Boolean(checkedItems[id]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(id)}
                      className={`flex items-start gap-3 py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-950/15 text-zinc-400' : 'hover:bg-zinc-900/60 text-zinc-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheck(id)}
                        className="mt-1 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-amber-500/40 cursor-pointer"
                      />
                      <span className={`text-xs leading-relaxed ${isChecked ? 'line-through text-zinc-500' : ''}`}>
                        {line.replace(/^[-*•]\s*/, '').replace(/^\[\s*\]\s*/, '')}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-xl p-6 min-h-[380px] text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {checklistConferencia || (
                  <div className="text-center py-16 text-zinc-500 text-sm">
                    {isStreaming ? 'Gerando checklist de conferência...' : 'Checklist não disponível.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
