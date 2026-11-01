import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from '@/shared/ui';
import { useSubmissionsStore, type Submission } from '../store/submissionsStore';

/**
 * Watches the queue: when a submission finishes, notifies the user (on any screen)
 * and invalidates the data that depends on it (dashboard and document search).
 */
export function useSubmissionNotifications() {
  const queryClient = useQueryClient();
  const previousStages = useRef(new Map<string, Submission['stage']>());

  useEffect(
    () =>
      useSubmissionsStore.subscribe(({ submissions }) => {
        for (const submission of submissions) {
          const previous = previousStages.current.get(submission.id);
          previousStages.current.set(submission.id, submission.stage);
          if (previous === submission.stage) continue;

          const label = `${submission.processType} ${submission.documentNumber}`;
          if (submission.stage === 'COMPLETED') {
            toast.success('Averbação concluída', `${label} · DTA ${submission.dta}`);
          } else if (submission.stage === 'FAILED') {
            toast.error('Falha na averbação', `${label} · ${submission.message ?? 'Tente novamente.'}`);
          }
          if (submission.stage !== 'SENDING') {
            void queryClient.invalidateQueries({ queryKey: ['documents'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }
        }
      }),
    [queryClient],
  );
}
