import type { DashboardStats } from '@/domain/entities';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { Icon, type IconName } from '@/shared/ui';
import styles from './StatTiles.module.scss';

interface Tile {
  label: string;
  value: number;
  icon: IconName;
  tone: 'brand' | 'success' | 'info' | 'danger';
  detail?: string;
}

export function StatTiles({ stats }: { stats: DashboardStats }) {
  const { total, completed, processing, failed } = stats;
  const tiles: Tile[] = [
    { label: 'Total enviados', value: total, icon: 'layers', tone: 'brand', detail: 'Todas as averbações' },
    { label: 'Concluídos', value: completed, icon: 'checkCircle', tone: 'success', detail: `${formatPercent(completed, total)} do total` },
    { label: 'Em processamento', value: processing, icon: 'clock', tone: 'info', detail: processing ? 'Atualizando automaticamente' : 'Nenhum na fila' },
    { label: 'Com erro', value: failed, icon: 'alert', tone: 'danger', detail: `${formatPercent(failed, total)} do total` },
  ];

  return (
    <ul className={styles.tiles}>
      {tiles.map((tile) => (
        <li key={tile.label} className={styles.tile} data-tone={tile.tone}>
          <span className={styles.icon}>
            <Icon name={tile.icon} size={18} />
          </span>
          <span className={styles.label}>{tile.label}</span>
          <span className={styles.value}>{formatNumber(tile.value)}</span>
          {tile.detail && <span className={styles.detail}>{tile.detail}</span>}
        </li>
      ))}
    </ul>
  );
}
