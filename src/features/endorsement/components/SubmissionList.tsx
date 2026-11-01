'use client';

import clsx from 'clsx';
import type { SubmissionStage } from '@/application/endorsement/submitEndorsement';
import { formatTime } from '@/shared/lib/format';
import { Button, EmptyState, Icon, Spinner } from '@/shared/ui';
import { isFinished, useSubmissionsStore, type Submission } from '../store/submissionsStore';
import styles from './SubmissionList.module.scss';

const STEPS: { stage: SubmissionStage; label: string }[] = [
  { stage: 'SENDING', label: 'Enviando' },
  { stage: 'PROCESSING', label: 'Processando' },
  { stage: 'COMPLETED', label: 'Concluído' },
];

const STATUS_TEXT: Record<SubmissionStage, string> = {
  SENDING: 'Enviando arquivos…',
  PROCESSING: 'Em processamento no recinto…',
  COMPLETED: 'Averbação concluída',
  FAILED: 'Falha no envio',
};

const STAGE_CLASS: Record<SubmissionStage, string | undefined> = {
  SENDING: undefined,
  PROCESSING: undefined,
  COMPLETED: styles.completed,
  FAILED: styles.failed,
};

function currentStepIndex(submission: Submission) {
  if (submission.stage === 'FAILED') return submission.remoteId ? 1 : 0;
  return STEPS.findIndex((step) => step.stage === submission.stage);
}

function SubmissionItem({ submission }: { submission: Submission }) {
  const retry = useSubmissionsStore((state) => state.retry);
  const remove = useSubmissionsStore((state) => state.remove);
  const current = currentStepIndex(submission);
  const failed = submission.stage === 'FAILED';

  return (
    <li className={clsx(styles.item, STAGE_CLASS[submission.stage])}>
      <div className={styles.head}>
        <span className={styles.statusIcon} aria-hidden>
          {isFinished(submission) ? (
            <Icon name={failed ? 'alert' : 'check'} size={16} />
          ) : (
            <Spinner size={14} />
          )}
        </span>
        <div className={styles.headText}>
          <p className={styles.doc}>
            <span className={styles.processType}>{submission.processType}</span>
            <span className={styles.mono}>{submission.documentNumber}</span>
          </p>
          <p className={styles.meta}>
            DTA <span className={styles.mono}>{submission.dta}</span> · {submission.importer}
          </p>
        </div>
        <time className={styles.time} dateTime={submission.updatedAt}>
          {formatTime(submission.createdAt)}
        </time>
      </div>

      <ol className={styles.steps} aria-label="Progresso do envio">
        {STEPS.map((step, index) => {
          const state =
            index < current || submission.stage === 'COMPLETED'
              ? 'done'
              : index === current
                ? failed
                  ? 'stepFailed'
                  : 'current'
                : 'todo';
          return (
            <li key={step.stage} className={clsx(styles.step, styles[state])}>
              <span className={styles.stepBar} />
              <span className={styles.stepLabel}>{step.label}</span>
            </li>
          );
        })}
      </ol>

      <p className={styles.statusText} role={failed ? 'alert' : 'status'}>
        <strong>{STATUS_TEXT[submission.stage]}</strong>
        {submission.message && <span> — {submission.message}</span>}
        {submission.attempts > 1 && !failed && <span> (tentativa {submission.attempts})</span>}
      </p>

      {isFinished(submission) && (
        <div className={styles.actions}>
          {failed && (
            <Button size="sm" variant="secondary" icon="refresh" onClick={() => retry(submission.id)}>
              Tentar novamente
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => remove(submission.id)}>
            Remover da lista
          </Button>
        </div>
      )}
    </li>
  );
}

export function SubmissionList() {
  const submissions = useSubmissionsStore((state) => state.submissions);
  const clearFinished = useSubmissionsStore((state) => state.clearFinished);
  const finishedCount = submissions.filter(isFinished).length;
  const activeCount = submissions.length - finishedCount;

  if (submissions.length === 0) {
    return (
      <EmptyState
        icon="layers"
        title="Nenhum envio nesta sessão"
        description="Os envios aparecem aqui assim que você os iniciar. Você pode continuar trabalhando enquanto eles são processados."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <span>
          <strong>{activeCount}</strong> em andamento · <strong>{finishedCount}</strong> finalizado
          {finishedCount === 1 ? '' : 's'}
        </span>
        {finishedCount > 0 && (
          <Button size="sm" variant="ghost" icon="trash" onClick={clearFinished}>
            Limpar finalizados
          </Button>
        )}
      </div>
      <ul className={styles.list} aria-live="polite">
        {submissions.map((submission) => (
          <SubmissionItem key={submission.id} submission={submission} />
        ))}
      </ul>
    </div>
  );
}
