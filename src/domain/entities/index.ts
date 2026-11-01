import type { TransportMode } from './transportMode';

export * from './transportMode';

export type UserRole = 'OPERATOR' | 'BROKER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Importer {
  companyName: string;
  cnpj: string;
  registeredAt: string; // ISO
}

/** DTA (Declaração de Trânsito Aduaneiro) — the cargo that arrived at the bonded facility. */
export interface Dta {
  number: string; // 25/0000000-1
  importer: Importer;
  originCountry: string;
  transportMode: TransportMode;
  billOfLadingNumber: string;
}

/** Customs broker ("comissária") responsible for the clearance. */
export interface CustomsBroker {
  id: string;
  name: string;
  cnpj: string;
}

export type ProcessType = 'DUIMP' | 'DI';

export type ProcessingStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type FileType = 'PDF' | 'XML';

export interface UploadedFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // bytes
}

/** Endorsed document ("averbação"): links the DTA to the import declaration (DI/DUIMP). */
export interface EndorsedDocument {
  id: string;
  dta: string;
  processType: ProcessType;
  documentNumber: string;
  importer: string;
  originCountry: string;
  transportMode: TransportMode;
  billOfLadingNumber: string;
  customsBroker: string;
  referenceCode?: string;
  foreignExchangeCoverage: boolean;
  submittedAt: string; // ISO
  status: ProcessingStatus;
  errorMessage?: string;
  files: UploadedFile[];
}

interface NewEndorsementBase {
  dta: string;
  customsBrokerId: string;
  referenceCode?: string;
  foreignExchangeCoverage: boolean;
  pdf: File;
}

export type NewEndorsement =
  | (NewEndorsementBase & { processType: 'DUIMP'; duimpNumber: string; accessKey: string })
  | (NewEndorsementBase & { processType: 'DI'; diNumber: string; xml: File });

export interface EndorsementStatus {
  id: string;
  status: ProcessingStatus;
  errorMessage?: string;
}

export interface StatusBreakdown {
  total: number;
  completed: number;
  processing: number;
  failed: number;
}

export interface DashboardStats extends StatusBreakdown {
  byTransportMode: Record<TransportMode, StatusBreakdown>;
  byProcessType: Record<ProcessType, number>;
  lastDays: { date: string; total: number }[];
  recent: EndorsedDocument[];
}
