export type VideoType =
  | 'ranking_economico'
  | 'melhores_morar_aposentar'
  | 'custo_vida_minimo'
  | 'turismo'
  | 'tese_cidade';

export type BaseStyle =
  | 'canal_a'
  | 'canal_b'
  | 'canal_c'
  | 'misto';

export type ItemOrder =
  | 'regressiva'
  | 'primeiro_ao_ultimo';

export type ClosingType =
  | 'comentario_inscricao'
  | 'proximo_video'
  | 'venda_produto';

export interface ProductSaleConfig {
  productName: string;
  price: string;
  purchaseLinkOrQR: string;
  warranty: string;
}

export interface GeneratorFormState {
  // Seção 1 - Roteiros de referência
  canalA_scripts: string;
  canalB_scripts: string;
  canalC_scripts: string;

  // Seção 2 - Configuração do novo vídeo
  videoTheme: string;
  videoType: VideoType;
  baseStyle: BaseStyle;
  itemCount: number;
  itemOrder: ItemOrder;
  targetDurationMinutes: number;
  channelName: string;
  narratorPersona: string;
  verifiedData: string;
  dataSource: string;
  closingType: ClosingType;
  productConfig: ProductSaleConfig;
}

export interface GeneratedOutput {
  raw: string;
  roteiroFinal: string;
  analiseConcorrentes: string;
  pacotePublicacao: string;
  checklistConferencia: string;
  createdAt: number;
  wordCount: number;
  estimatedMinutes: number;
  theme: string;
}

export interface ParsedPublicationPackage {
  titles: string[];
  thumbnails: string[];
  description: string;
  tags: string[];
}
