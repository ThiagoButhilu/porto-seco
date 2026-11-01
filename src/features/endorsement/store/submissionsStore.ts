import { create } from 'zustand';
import { submitEndorsement, type SubmissionStage } from '@/application/endorsement/submitEndorsement';
import type { NewEndorsement } from '@/domain/entities';
import { repositories } from '@/infra/container';

export interface Submission {
  id: string;
  remoteId?: string;
  stage: SubmissionStage;
  message?: string;
  dta: string;
  importer: string;
  processType: NewEndorsement['processType'];
  documentNumber: string;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  /** Kept in memory so "try again" works without retyping anything. */
  payload: NewEndorsement;
}

interface SubmissionsState {
  submissions: Submission[];
  start: (payload: NewEndorsement, importer: string) => string;
  retry: (id: string) => void;
  remove: (id: string) => void;
  clearFinished: () => void;
}

export const isFinished = (submission: Submission) =>
  submission.stage === 'COMPLETED' || submission.stage === 'FAILED';

/**
 * Session submission queue. Each submission runs independently (fire-and-forget),
 * outside the component lifecycle: changing screens cancels nothing, a slow
 * submission never blocks the next one and a failure stays isolated in its own item.
 */
export const useSubmissionsStore = create<SubmissionsState>((set, get) => {
  const update = (id: string, patch: Partial<Submission>) =>
    set({
      submissions: get().submissions.map((submission) =>
        submission.id === id
          ? { ...submission, ...patch, updatedAt: new Date().toISOString() }
          : submission,
      ),
    });

  const run = (id: string) => {
    const submission = get().submissions.find((s) => s.id === id);
    if (!submission) return;
    void submitEndorsement(repositories.endorsement, submission.payload, ({ stage, remoteId, message }) =>
      update(id, { stage, remoteId, message }),
    );
  };

  return {
    submissions: [],

    start: (payload, importer) => {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const submission: Submission = {
        id,
        stage: 'SENDING',
        dta: payload.dta,
        importer,
        processType: payload.processType,
        documentNumber: payload.processType === 'DUIMP' ? payload.duimpNumber : payload.diNumber,
        createdAt: now,
        updatedAt: now,
        attempts: 1,
        payload,
      };
      set({ submissions: [submission, ...get().submissions] });
      run(id);
      return id;
    },

    retry: (id) => {
      const submission = get().submissions.find((s) => s.id === id);
      if (!submission || submission.stage !== 'FAILED') return;
      update(id, {
        stage: 'SENDING',
        message: undefined,
        remoteId: undefined,
        attempts: submission.attempts + 1,
      });
      run(id);
    },

    remove: (id) => set({ submissions: get().submissions.filter((s) => s.id !== id) }),

    clearFinished: () => set({ submissions: get().submissions.filter((s) => !isFinished(s)) }),
  };
});

export const useActiveSubmissions = () =>
  useSubmissionsStore((state) => state.submissions.filter((s) => !isFinished(s)).length);
