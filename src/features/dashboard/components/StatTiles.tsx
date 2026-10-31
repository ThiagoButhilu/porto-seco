import type { IndicadoresDashboard } from '@/domain/entities';
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

export function StatTiles({ indicadores }: { indicadores: IndicadoresDashboard }) {
  const { total, concluidos, processando, erros } = indicadores;
  const tiles: Tile[] = [
    { label: 'Total enviados', value: total, icon: 'layers', tone: 'brand', detail: 'Todas as averbações' },
    { label: 'Concluídos', value: concluidos, icon: 'checkCircle', tone: 'success', detail: `${formatPercent(concluidos, total)} do total` },
    { label: 'Em processamento', value: processando, icon: 'clock', tone: 'info', detail: processando ? 'Atualizando automaticamente' : 'Nenhum na fila' },
    { label: 'Com erro', value: erros, icon: 'alert', tone: 'danger', detail: `${formatPercent(erros, total)} do total` },
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
