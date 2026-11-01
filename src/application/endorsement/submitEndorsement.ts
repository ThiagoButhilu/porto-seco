import type { EndorsementStatus, NewEndorsement } from '@/domain/entities';
import type { EndorsementRepository } from '@/domain/repositories';

export type SubmissionStage = 'SENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SubmissionUpdate {
  stage: SubmissionStage;
  remoteId?: string;
  message?: string;
}

interface Options {
  pollIntervalMs?: number;
  timeoutMs?: number;
  /** Consecutive network failures tolerated while polling. */
  statusRetries?: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Use case: submits the endorsement and follows its asynchronous processing
 * (POST → 202 → status polling). It knows nothing about React or global state:
 * it only reports each stage through `onUpdate`. It never throws — failures become
 * the `FAILED` stage, which guarantees a failing submission never interrupts the others.
 */
export async function submitEndorsement(
  repository: EndorsementRepository,
  data: NewEndorsement,
  onUpdate: (update: SubmissionUpdate) => void,
  { pollIntervalMs = 1500, timeoutMs = 90_000, statusRetries = 3 }: Options = {},
): Promise<void> {
  onUpdate({ stage: 'SENDING' });

  let received: EndorsementStatus;
  try {
    received = await repository.submit(data);
  } catch (error) {
    onUpdate({ stage: 'FAILED', message: messageOf(error) });
    return;
  }

  const remoteId = received.id;
  onUpdate({ stage: 'PROCESSING', remoteId });

  const deadline = Date.now() + timeoutMs;
  let consecutiveFailures = 0;

  while (Date.now() < deadline) {
    await wait(pollIntervalMs);
    try {
      const { status, errorMessage } = await repository.getStatus(remoteId);
      consecutiveFailures = 0;
      if (status === 'COMPLETED') return onUpdate({ stage: 'COMPLETED', remoteId });
      if (status === 'FAILED') return onUpdate({ stage: 'FAILED', remoteId, message: errorMessage });
    } catch (error) {
      if (++consecutiveFailures >= statusRetries) {
        return onUpdate({ stage: 'FAILED', remoteId, message: messageOf(error) });
      }
    }
  }

  onUpdate({
    stage: 'FAILED',
    remoteId,
    message: 'Tempo de processamento excedido. Consulte o documento mais tarde.',
  });
}

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Falha inesperada no envio.';
