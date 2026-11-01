/**
 * Contracts (ports) consumed by the application. The UI and use cases depend
 * only on these interfaces — the concrete implementation (HTTP, mock, etc.) is
 * injected in `infra/container.ts`.
 */
import type {
  CustomsBroker,
  DashboardStats,
  Dta,
  EndorsedDocument,
  EndorsementStatus,
  NewEndorsement,
  User,
} from './entities';

export interface AuthRepository {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
}

export interface DtaRepository {
  findByNumber(number: string): Promise<Dta>;
}

export interface CustomsBrokerRepository {
  list(): Promise<CustomsBroker[]>;
}

export interface EndorsementRepository {
  submit(data: NewEndorsement): Promise<EndorsementStatus>;
  getStatus(id: string): Promise<EndorsementStatus>;
}

export interface DocumentRepository {
  search(term: string): Promise<EndorsedDocument[]>;
  downloadFile(fileId: string): Promise<Blob>;
}

export interface DashboardRepository {
  getStats(): Promise<DashboardStats>;
}
