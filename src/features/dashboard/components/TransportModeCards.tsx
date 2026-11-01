import { TRANSPORT_MODES, TRANSPORT_MODE_LABEL, type DashboardStats } from '@/domain/entities';
import { TRANSPORT_MODE_ICON } from '@/shared/components/TransportModeTag';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { Icon } from '@/shared/ui';
import styles from './TransportModeCards.module.scss';

interface TransportModeCardsProps {
  byTransportMode: DashboardStats['byTransportMode'];
  total: number;
}

export function TransportModeCards({ byTransportMode, total }: TransportModeCardsProps) {
  return (
    <ul className={styles.cards}>
      {TRANSPORT_MODES.map((mode) => {
        const { total: modeTotal, completed, processing, failed } = byTransportMode[mode];
        const share = total ? (modeTotal / total) * 100 : 0;
        return (
          <li key={mode} className={styles.card} data-mode={mode}>
            <div className={styles.head}>
              <span className={styles.icon}>
                <Icon name={TRANSPORT_MODE_ICON[mode]} size={20} />
              </span>
              <span className={styles.name}>{TRANSPORT_MODE_LABEL[mode]}</span>
              <span className={styles.share}>{formatPercent(modeTotal, total)}</span>
            </div>

            <p className={styles.value}>
              {formatNumber(modeTotal)}
              <span className={styles.unit}>documento{modeTotal === 1 ? '' : 's'}</span>
            </p>

            <div
              className={styles.track}
              role="img"
              aria-label={`${TRANSPORT_MODE_LABEL[mode]}: ${formatPercent(modeTotal, total)} dos documentos`}
            >
              <span className={styles.bar} style={{ width: `${share}%` }} />
            </div>

            <dl className={styles.breakdown}>
              <div>
                <dt>Concluídos</dt>
                <dd>{completed}</dd>
              </div>
              <div>
                <dt>Processando</dt>
                <dd>{processing}</dd>
              </div>
              <div>
                <dt>Com erro</dt>
                <dd className={failed ? styles.danger : undefined}>{failed}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
