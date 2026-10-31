/**
 * Composition root: o único lugar que conhece as implementações concretas.
 * Para trocar o mock por um backend real basta apontar NEXT_PUBLIC_API_URL
 * ou substituir as fábricas abaixo — nenhuma tela precisa mudar.
 */
import { httpClient } from './http/httpClient';
import {
  createAuthRepository,
  createAverbacaoRepository,
  createComissariaRepository,
  createDashboardRepository,
  createDocumentoRepository,
  createDtaRepository,
} from './repositories/httpRepositories';

export const repositories = {
  auth: createAuthRepository(httpClient),
  dta: createDtaRepository(httpClient),
  comissaria: createComissariaRepository(httpClient),
  averbacao: createAverbacaoRepository(httpClient),
  documento: createDocumentoRepository(httpClient),
  dashboard: createDashboardRepository(httpClient),
};
