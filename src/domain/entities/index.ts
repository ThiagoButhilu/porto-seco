import type { Modal } from './modal';

export * from './modal';

export type Perfil = 'OPERADOR' | 'DESPACHANTE' | 'ADMINISTRADOR';

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface Importador {
  razaoSocial: string;
  cnpj: string;
  dataCadastro: string; // ISO
}

/** Declaração de Trânsito Aduaneiro — a carga que chegou ao recinto. */
export interface Dta {
  numero: string; // 25/0000000-1
  importador: Importador;
  paisOrigem: string;
  modal: Modal;
  numeroConhecimento: string;
}

export interface Comissaria {
  id: string;
  nome: string;
  cnpj: string;
}

export type TipoProcesso = 'DUIMP' | 'DI';

export type StatusProcessamento = 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';

export type TipoArquivo = 'PDF' | 'XML';

export interface ArquivoEnviado {
  id: string;
  nome: string;
  tipo: TipoArquivo;
  tamanho: number; // bytes
}

/** Documento averbado: vínculo entre a DTA e a declaração de importação (DI/DUIMP). */
export interface DocumentoAverbado {
  id: string;
  dta: string;
  tipoProcesso: TipoProcesso;
  numeroDocumento: string;
  importador: string;
  paisOrigem: string;
  modal: Modal;
  numeroConhecimento: string;
  comissaria: string;
  codigoReferencia?: string;
  coberturaCambial: boolean;
  enviadoEm: string; // ISO
  status: StatusProcessamento;
  mensagemErro?: string;
  arquivos: ArquivoEnviado[];
}

interface NovaAverbacaoBase {
  dta: string;
  comissariaId: string;
  codigoReferencia?: string;
  coberturaCambial: boolean;
  pdf: File;
}

export type NovaAverbacao =
  | (NovaAverbacaoBase & { tipoProcesso: 'DUIMP'; numeroDuimp: string; chaveAcesso: string })
  | (NovaAverbacaoBase & { tipoProcesso: 'DI'; numeroDi: string; xml: File });

export interface StatusAverbacao {
  id: string;
  status: StatusProcessamento;
  mensagemErro?: string;
}

export interface IndicadorModal {
  total: number;
  concluidos: number;
  processando: number;
  erros: number;
}

export interface IndicadoresDashboard {
  total: number;
  concluidos: number;
  processando: number;
  erros: number;
  porModal: Record<Modal, IndicadorModal>;
  porTipo: Record<TipoProcesso, number>;
  ultimosDias: { data: string; total: number }[];
  recentes: DocumentoAverbado[];
}
