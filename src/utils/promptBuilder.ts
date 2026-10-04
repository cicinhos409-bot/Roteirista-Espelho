import { GeneratorFormState } from '../types';

export function buildUserPrompt(form: GeneratorFormState): string {
  const parts: string[] = [];

  parts.push(`=== ROTEIROS DE REFERÊNCIA FORNECIDOS PELO USUÁRIO ===`);

  if (form.canalA_scripts.trim()) {
    parts.push(`--- CANAL A: Enciclopédia das Cidades (Rankings com dados oficiais) ---`);
    parts.push(form.canalA_scripts.trim());
  } else {
    parts.push(`--- CANAL A: Enciclopédia das Cidades ---`);
    parts.push(`[Nenhum roteiro colado - use estritamente o DNA padrão do Canal A definido nas instruções de sistema]`);
  }

  if (form.canalB_scripts.trim()) {
    parts.push(`\n--- CANAL B: Zé do Mapa (Persona forte, custo de vida e conversa de amigo) ---`);
    parts.push(form.canalB_scripts.trim());
  } else {
    parts.push(`\n--- CANAL B: Zé do Mapa ---`);
    parts.push(`[Nenhum roteiro colado - use estritamente o DNA padrão do Canal B definido nas instruções de sistema]`);
  }

  if (form.canalC_scripts.trim()) {
    parts.push(`\n--- CANAL C: Extraindo o Mundo (Listas curtas, dinâmicas e qualidade de vida) ---`);
    parts.push(form.canalC_scripts.trim());
  } else {
    parts.push(`\n--- CANAL C: Extraindo o Mundo ---`);
    parts.push(`[Nenhum roteiro colado - use estritamente o DNA padrão do Canal C definido nas instruções de sistema]`);
  }

  parts.push(`\n=== CONFIGURAÇÃO DO NOVO VÍDEO ===`);
  parts.push(`- Tema do vídeo: ${form.videoTheme.trim()}`);

  const typeLabels: Record<string, string> = {
    ranking_economico: 'Ranking econômico (mais ricas / mais pobres)',
    melhores_morar_aposentar: 'Melhores cidades para morar ou se aposentar',
    custo_vida_minimo: 'Custo de vida com salário mínimo',
    turismo: 'Turismo e roteiros de viagem',
    tese_cidade: 'Tese aprofundada de uma cidade específica',
  };
  parts.push(`- Tipo de vídeo: ${typeLabels[form.videoType] || form.videoType}`);

  const styleLabels: Record<string, string> = {
    canal_a: 'Canal A (neutro e didático - Enciclopédia das Cidades)',
    canal_b: 'Canal B (persona forte e conversa de amigo - Zé do Mapa)',
    canal_c: 'Canal C (direto, rápido e curto - Extraindo o Mundo)',
    misto: 'Misto (combine o melhor dos três estilos: dados do A, intimidade e lado B do B, ritmo ágil do C)',
  };
  parts.push(`- Estilo base escolhido: ${styleLabels[form.baseStyle] || form.baseStyle}`);

  parts.push(`- Quantidade EXATA de itens: ${form.itemCount} itens (OBRIGATÓRIO: entregue exatamente ${form.itemCount} itens numerados no roteiro)`);

  const orderLabels: Record<string, string> = {
    regressiva: `Contagem regressiva até o 1º lugar (do item ${form.itemCount}º até o 1º colocado)`,
    primeiro_ao_ultimo: `Do 1º lugar ao último (do 1º colocado até o ${form.itemCount}º item)`,
  };
  parts.push(`- Ordem da lista: ${orderLabels[form.itemOrder] || form.itemOrder}`);

  const targetWords = form.targetDurationMinutes * 150;
  parts.push(`- Duração alvo: ${form.targetDurationMinutes} minutos (cerca de 150 palavras por minuto = meta de aproximadamente ${targetWords} palavras no texto corrido narrado)`);

  if (form.channelName.trim()) {
    parts.push(`- Nome do canal: ${form.channelName.trim()}`);
  }
  if (form.narratorPersona.trim()) {
    parts.push(`- Nome e Persona do narrador: ${form.narratorPersona.trim()}`);
  }

  if (form.verifiedData.trim()) {
    parts.push(`\n- DADOS VERIFICADOS FORNECIDOS (ATENÇÃO MÁXIMA):`);
    parts.push(form.verifiedData.trim());
    parts.push(`IMPORTANTE: Você deve usar SOMENTE estes dados para números (população, PIB, aluguéis etc.). Nunca invente outros números. Se algum dado não constar aqui e for necessário na narrativa, marque como [CONFERIR: dado que falta].`);
  } else {
    parts.push(`\n- Dados verificados: O usuário NÃO forneceu tabela de dados. Lembre-se da Regra 1: Nunca invente números. Use apenas dados públicos consolidados ou marque [CONFERIR: número da população / PIB / etc.] no texto.`);
  }

  if (form.dataSource.trim()) {
    parts.push(`- Fonte dos dados a ser citada no roteiro: ${form.dataSource.trim()}`);
  }

  parts.push(`\n- Fechamento solicitado:`);
  if (form.closingType === 'comentario_inscricao') {
    parts.push(`Apenas pergunta engajadora para comentários e chamada para inscrição.`);
  } else if (form.closingType === 'proximo_video') {
    parts.push(`Pergunta para comentários, indicação clara do próximo vídeo temático complementar (loop de visualização) e inscrição.`);
  } else if (form.closingType === 'venda_produto') {
    const prod = form.productConfig;
    parts.push(`Incluir bloco de venda de produto integrado à narrativa, estruturado com: dor concreta do espectador, solução apresentada, dados da oferta, garantia e suporte.`);
    parts.push(`  * Nome do produto: ${prod.productName || 'Guia Prático de Mudança e Custo de Vida'}`);
    parts.push(`  * Preço: ${prod.price || 'preço promocional'}`);
    parts.push(`  * Link/QR: ${prod.purchaseLinkOrQR || 'primeiro link fixado nos comentários e QR code na tela'}`);
    parts.push(`  * Garantia: ${prod.warranty || 'garantia incondicional de 7 dias'}`);
  }

  parts.push(`\n=== INSTRUÇÃO FINAL DE GERAÇÃO ===`);
  parts.push(`Siga rigidamente o PROCESSO e as REGRAS DE QUALIDADE. Gere o roteiro ORIGINAL com as quatro seções obrigatórias:
# 1. Roteiro final
# 2. Análise dos concorrentes
# 3. Pacote de publicação
# 4. Checklist de conferência`);

  return parts.join('\n');
}

export function parseMarkdownSections(markdown: string): {
  roteiroFinal: string;
  analiseConcorrentes: string;
  pacotePublicacao: string;
  checklistConferencia: string;
} {
  // Extract sections based on "# 1. Roteiro final", "# 2. Análise dos concorrentes", etc.
  const regex1 = /#\s*1\.\s*Roteiro final([\s\S]*?)(?=#\s*2\.\s*Análise dos concorrentes|$)/i;
  const regex2 = /#\s*2\.\s*Análise dos concorrentes([\s\S]*?)(?=#\s*3\.\s*Pacote de publicação|$)/i;
  const regex3 = /#\s*3\.\s*Pacote de publicação([\s\S]*?)(?=#\s*4\.\s*Checklist de conferência|$)/i;
  const regex4 = /#\s*4\.\s*Checklist de conferência([\s\S]*?)$/i;

  const m1 = markdown.match(regex1);
  const m2 = markdown.match(regex2);
  const m3 = markdown.match(regex3);
  const m4 = markdown.match(regex4);

  return {
    roteiroFinal: m1 ? m1[1].trim() : '',
    analiseConcorrentes: m2 ? m2[1].trim() : '',
    pacotePublicacao: m3 ? m3[1].trim() : '',
    checklistConferencia: m4 ? m4[1].trim() : '',
  };
}

export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
