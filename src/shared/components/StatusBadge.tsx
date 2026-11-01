import type { ProcessingStatus } from '@/domain/entities';
import { Badge, Icon, Spinner, type BadgeTone } from '@/shared/ui';

const CONFIG: Record<ProcessingStatus, { label: string; tone: BadgeTone }> = {
  PROCESSING: { label: 'Processando', tone: 'info' },
  COMPLETED: { label: 'Concluído', tone: 'success' },
  FAILED: { label: 'Erro', tone: 'danger' },
};

/** Status always shown with icon + text, never color alone. */
export function StatusBadge({ status }: { status: ProcessingStatus }) {
  const { label, tone } = CONFIG[status];
  const icon =
    status === 'PROCESSING' ? (
      <Spinner size={11} />
    ) : (
      <Icon name={status === 'COMPLETED' ? 'check' : 'alert'} size={13} />
    );

  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  );
}
