import type { DashboardStats, ProcessType } from '@/domain/entities';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import styles from './ProcessTypeSplit.module.scss';

const PROCESS_TYPES: { type: ProcessType; description: string }[] = [
  { type: 'DUIMP', description: 'Declaração Única de Importação' },
  { type: 'DI', description: 'Declaração de Importação' },
];

export function ProcessTypeSplit({ byProcessType }: { byProcessType: DashboardStats['byProcessType'] }) {
  const total = byProcessType.DI + byProcessType.DUIMP;
  const largest = Math.max(byProcessType.DI, byProcessType.DUIMP, 1);

  return (
    <ul className={styles.list}>
      {PROCESS_TYPES.map(({ type, description }) => (
        <li key={type} className={styles.row}>
          <div className={styles.head}>
            <span className={styles.type}>{type}</span>
            <span className={styles.value}>
              {formatNumber(byProcessType[type])}
              <span className={styles.percent}>{formatPercent(byProcessType[type], total)}</span>
            </span>
          </div>
          <span className={styles.description}>{description}</span>
          <span className={styles.track} aria-hidden>
            <span className={styles.bar} style={{ width: `${(byProcessType[type] / largest) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
