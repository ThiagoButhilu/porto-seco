import type { EndorsedDocument, ProcessingStatus } from '@/domain/entities';
import { generateInitialDocuments } from './data/seed';

/** Internal record: the processing outcome is drawn on submit and revealed at `processAt`. */
export interface DocumentRecord extends EndorsedDocument {
  processAt?: number;
  outcome?: { status: ProcessingStatus; errorMessage?: string };
}

const STORAGE_KEY = 'porto-seco:mock-db:v2';

function load(): DocumentRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as DocumentRecord[];
  } catch {
    /* storage unavailable: fall back to the seed data */
  }
  return generateInitialDocuments();
}

let records: DocumentRecord[] | null = null;

function all(): DocumentRecord[] {
  records ??= load();
  return records;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* no persistence — data lives in memory only */
  }
}

/** Applies the processing outcome once the simulated time has elapsed. */
function resolveStatus(record: DocumentRecord): DocumentRecord {
  if (record.status === 'PROCESSING' && record.processAt && Date.now() >= record.processAt) {
    record.status = record.outcome?.status ?? 'COMPLETED';
    record.errorMessage = record.outcome?.errorMessage;
    persist();
  }
  return record;
}

function withoutInternalFields({ processAt: _p, outcome: _o, ...document }: DocumentRecord): EndorsedDocument {
  return document;
}

export const db = {
  list(): EndorsedDocument[] {
    return all().map(resolveStatus).map(withoutInternalFields);
  },
  get(id: string): DocumentRecord | undefined {
    const record = all().find((r) => r.id === id);
    return record && resolveStatus(record);
  },
  insert(record: DocumentRecord) {
    all().unshift(record);
    persist();
  },
  findFile(fileId: string) {
    for (const record of all()) {
      const file = record.files.find((f) => f.id === fileId);
      if (file) return { file, document: withoutInternalFields(record) };
    }
    return undefined;
  },
};
