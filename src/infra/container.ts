/**
 * Composition root: the only place that knows the concrete implementations.
 * To swap the mock for a real backend, point NEXT_PUBLIC_API_URL to it or
 * replace the factories below — no screen needs to change.
 */
import { httpClient } from './http/httpClient';
import {
  createAuthRepository,
  createCustomsBrokerRepository,
  createDashboardRepository,
  createDocumentRepository,
  createDtaRepository,
  createEndorsementRepository,
} from './repositories/httpRepositories';

export const repositories = {
  auth: createAuthRepository(httpClient),
  dta: createDtaRepository(httpClient),
  customsBroker: createCustomsBrokerRepository(httpClient),
  endorsement: createEndorsementRepository(httpClient),
  document: createDocumentRepository(httpClient),
  dashboard: createDashboardRepository(httpClient),
};
