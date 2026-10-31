/**
 * Contratos (ports) consumidos pela aplicação. A UI e os casos de uso dependem
 * apenas destas interfaces — a implementação concreta (HTTP, mock, etc.) é
 * injetada em `infra/container.ts`.
 */
import type {
  Comissaria,
  DocumentoAverbado,
  Dta,
  IndicadoresDashboard,
  NovaAverbacao,
  StatusAverbacao,
  Usuario,
} from './entities';

export interface AuthRepository {
  login(email: string, senha: string): Promise<{ usuario: Usuario; token: string }>;
}

export interface DtaRepository {
  buscarPorNumero(numero: string): Promise<Dta>;
}

export interface ComissariaRepository {
  listar(): Promise<Comissaria[]>;
}

export interface AverbacaoRepository {
  enviar(dados: NovaAverbacao): Promise<StatusAverbacao>;
  consultarStatus(id: string): Promise<StatusAverbacao>;
}

export interface DocumentoRepository {
  pesquisar(termo: string): Promise<DocumentoAverbado[]>;
  baixarArquivo(arquivoId: string): Promise<Blob>;
}

export interface DashboardRepository {
  obterIndicadores(): Promise<IndicadoresDashboard>;
}
