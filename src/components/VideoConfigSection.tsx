import React, { useState } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Clock,
  Database,
  ShoppingBag,
  Info,
  CheckCircle,
  HelpCircle,
  Hash,
  Layers,
} from 'lucide-react';
import {
  GeneratorFormState,
  VideoType,
  BaseStyle,
  ItemOrder,
  ClosingType,
} from '../types';

interface VideoConfigSectionProps {
  form: GeneratorFormState;
  onChangeForm: (updates: Partial<GeneratorFormState>) => void;
  onSubmit: () => void;
  isGenerating: boolean;
  validationError: string | null;
}

export const VideoConfigSection: React.FC<VideoConfigSectionProps> = ({
  form,
  onChangeForm,
  onSubmit,
  isGenerating,
  validationError,
}) => {
  const [showVerifiedDataHelp, setShowVerifiedDataHelp] = useState(false);
  const calculatedWords = form.targetDurationMinutes * 150;

  const quickThemeSuggestions = [
    '10 cidades mais ricas de Santa Catarina',
    '7 cidades mais baratas do interior de SP para morar',
    '8 melhores cidades para aposentados em Minas Gerais',
    '5 cidades do interior do Paraná com padrão europeu',
  ];

  return (
    <section className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 shadow-xl shadow-black/20">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-500/20">
              2
            </span>
            <h2 className="text-base font-bold text-zinc-100">
              Configuração do Novo Vídeo
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Defina o tema, formato, duração e especificidades do roteiro original que será gerado.
          </p>
        </div>
      </div>

      <div className="space-y-5 mt-5">
        {/* Tema do vídeo */}
        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Tema do Vídeo <span className="text-amber-400">*</span>
          </label>
          <input
            type="text"
            value={form.videoTheme}
            onChange={(e) => onChangeForm({ videoTheme: e.target.value })}
            placeholder="Ex.: 10 cidades mais ricas de Santa Catarina ou 8 cidades tranquilas para viver com 1 salário"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 font-medium"
          />

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-zinc-500 mr-1">Sugestões rápidas:</span>
            {quickThemeSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChangeForm({ videoTheme: suggestion })}
                className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-700/50 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Grid: Tipo de vídeo, Estilo base, Quantidade, Ordem */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tipo de Vídeo */}
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Tipo de Vídeo
            </label>
            <select
              value={form.videoType}
              onChange={(e) => onChangeForm({ videoType: e.target.value as VideoType })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="ranking_economico">Ranking econômico (mais ricas/mais pobres)</option>
              <option value="melhores_morar_aposentar">Melhores cidades para morar / aposentar</option>
              <option value="custo_vida_minimo">Custo de vida com salário mínimo</option>
              <option value="turismo">Turismo e roteiros de viagem</option>
              <option value="tese_cidade">Tese aprofundada de uma cidade</option>
            </select>
          </div>

          {/* Estilo Base */}
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Estilo Base
            </label>
            <select
              value={form.baseStyle}
              onChange={(e) => onChangeForm({ baseStyle: e.target.value as BaseStyle })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="canal_a">Canal A (neutro e didático - Enciclopédia)</option>
              <option value="canal_b">Canal B (persona e conversa de amigo - Zé do Mapa)</option>
              <option value="canal_c">Canal C (direto, rápido e curto - Extraindo)</option>
              <option value="misto">Misto (o app decide e combina o melhor)</option>
            </select>
          </div>

          {/* Quantidade de itens */}
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Quantidade de Itens <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={30}
                value={form.itemCount}
                onChange={(e) => onChangeForm({ itemCount: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-500 font-mono">
                cidades
              </span>
            </div>
          </div>

          {/* Ordem */}
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Ordem dos Itens
            </label>
            <select
              value={form.itemOrder}
              onChange={(e) => onChangeForm({ itemOrder: e.target.value as ItemOrder })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            >
              <option value="regressiva">Contagem regressiva até o 1º lugar</option>
              <option value="primeiro_ao_ultimo">Do 1º ao último lugar</option>
            </select>
          </div>
        </div>

        {/* Duração Alvo e Meta de Palavras */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-200">Duração Alvo do Vídeo:</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {form.targetDurationMinutes} minutos
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Padrão de fala do YouTube: ~150 palavras por minuto
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <input
              type="range"
              min={3}
              max={25}
              step={1}
              value={form.targetDurationMinutes}
              onChange={(e) => onChangeForm({ targetDurationMinutes: parseInt(e.target.value, 10) })}
              className="w-full md:w-48 accent-amber-500 cursor-pointer"
            />
            <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg text-xs font-mono text-zinc-300 whitespace-nowrap">
              Meta: <strong className="text-amber-400">~{calculatedWords.toLocaleString('pt-BR')}</strong> palavras
            </div>
          </div>
        </div>

        {/* Nome do Canal & Persona do Narrador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Nome do Meu Canal (opcional)
            </label>
            <input
              type="text"
              value={form.channelName}
              onChange={(e) => onChangeForm({ channelName: e.target.value })}
              placeholder="Ex.: Rotas e Cidades Brasil"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Nome e Persona do Narrador (opcional)
            </label>
            <input
              type="text"
              value={form.narratorPersona}
              onChange={(e) => onChangeForm({ narratorPersona: e.target.value })}
              placeholder="Ex.: Carlos (amigável, direto, experiente em mudanças)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Dados Verificados (Regra de Ouro) e Fonte */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-semibold text-zinc-200">
                Dados Verificados (Opcional - Regra de Ouro)
              </label>
            </div>
            <button
              type="button"
              onClick={() => setShowVerifiedDataHelp(!showVerifiedDataHelp)}
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Como funciona?</span>
            </button>
          </div>

          {showVerifiedDataHelp && (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-700/30 text-emerald-200 text-xs leading-relaxed">
              <strong>Regra de Qualidade nº 1:</strong> Cole aqui a sua tabela ou lista de dados (população, PIB, valor médio de aluguel, distância da capital). O aplicativo instrui o modelo a usar <strong>SOMENTE</strong> estes dados verificados para números. Qualquer número que faltar será marcado com <code className="bg-emerald-900/50 px-1 py-0.5 rounded font-mono">[CONFERIR: dado]</code>, eliminando alucinações.
            </div>
          )}

          <textarea
            value={form.verifiedData}
            onChange={(e) => onChangeForm({ verifiedData: e.target.value })}
            placeholder="Exemplo de lista para o app usar exclusivamente:&#10;1. Joinville: PIB R$ 45 bilhões, 616 mil habitantes&#10;2. Itajaí: PIB R$ 41 bilhões, aluguel médio R$ 2.400&#10;3. Florianópolis: PIB R$ 23 bilhões..."
            className="w-full h-24 bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono resize-y"
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Fonte Oficial dos Dados (para ser citada na narração)
            </label>
            <input
              type="text"
              value={form.dataSource}
              onChange={(e) => onChangeForm({ dataSource: e.target.value })}
              placeholder="Ex.: IBGE Censo 2022 / FipeZap 2024 / SEFAZ-SC"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* Fechamento do Vídeo */}
        <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3.5 space-y-3">
          <label className="block text-xs font-semibold text-zinc-200">
            Fechamento do Vídeo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <label
              className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                form.closingType === 'comentario_inscricao'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="closingType"
                checked={form.closingType === 'comentario_inscricao'}
                onChange={() => onChangeForm({ closingType: 'comentario_inscricao' })}
                className="mt-0.5 accent-amber-500"
              />
              <div>
                <p className="text-xs font-semibold text-zinc-200">Só Comentário e Inscrição</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Encerramento padrão de engajamento</p>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                form.closingType === 'proximo_video'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="closingType"
                checked={form.closingType === 'proximo_video'}
                onChange={() => onChangeForm({ closingType: 'proximo_video' })}
                className="mt-0.5 accent-amber-500"
              />
              <div>
                <p className="text-xs font-semibold text-zinc-200">Indicar Próximo Vídeo</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Gancho para reter audiência no canal</p>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                form.closingType === 'venda_produto'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <input
                type="radio"
                name="closingType"
                checked={form.closingType === 'venda_produto'}
                onChange={() => onChangeForm({ closingType: 'venda_produto' })}
                className="mt-0.5 accent-amber-500"
              />
              <div>
                <p className="text-xs font-semibold text-zinc-200">Venda de Produto (Pitch)</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">Dor, solução, preço e garantia</p>
              </div>
            </label>
          </div>

          {/* Subcampos quando "Venda de produto" estiver ativo */}
          {form.closingType === 'venda_produto' && (
            <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-zinc-900/40 p-3 rounded-lg">
              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={form.productConfig.productName}
                  onChange={(e) =>
                    onChangeForm({
                      productConfig: { ...form.productConfig, productName: e.target.value },
                    })
                  }
                  placeholder="Ex.: Guia do Interior SP 2025"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Preço
                </label>
                <input
                  type="text"
                  value={form.productConfig.price}
                  onChange={(e) =>
                    onChangeForm({
                      productConfig: { ...form.productConfig, price: e.target.value },
                    })
                  }
                  placeholder="Ex.: R$ 47 ou 12x de R$ 5"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Link / Onde Comprar
                </label>
                <input
                  type="text"
                  value={form.productConfig.purchaseLinkOrQR}
                  onChange={(e) =>
                    onChangeForm({
                      productConfig: { ...form.productConfig, purchaseLinkOrQR: e.target.value },
                    })
                  }
                  placeholder="Ex.: Primeiro link fixado e QR code"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                  Garantia
                </label>
                <input
                  type="text"
                  value={form.productConfig.warranty}
                  onChange={(e) =>
                    onChangeForm({
                      productConfig: { ...form.productConfig, warranty: e.target.value },
                    })
                  }
                  placeholder="Ex.: 7 dias incondicional"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-700/50 text-red-200 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Botão Gerar Roteiro */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isGenerating}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2.5 ${
              isGenerating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:via-orange-400 hover:to-amber-500 text-zinc-950 shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                <span>Analisando Concorrentes e Criando Roteiro Original...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-zinc-950" />
                <span>Gerar Roteiro Original</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
