import type { StatusProcessamento } from '@/domain/entities';
import { Badge, Icon, Spinner, type BadgeTone } from '@/shared/ui';

const CONFIG: Record<StatusProcessamento, { label: string; tone: BadgeTone }> = {
  PROCESSANDO: { label: 'Processando', tone: 'info' },
  CONCLUIDO: { label: 'Concluído', tone: 'success' },
  ERRO: { label: 'Erro', tone: 'danger' },
};

/** Status sempre com ícone + texto, nunca apenas cor. */
export function StatusBadge({ status }: { status: StatusProcessamento }) {
  const { label, tone } = CONFIG[status];
  const icon =
    status === 'PROCESSANDO' ? (
      <Spinner size={11} />
    ) : (
      <Icon name={status === 'CONCLUIDO' ? 'check' : 'alert'} size={13} />
    );

  return (
    <Badge tone={tone} icon={icon}>
      {label}
    </Badge>
  );
}
