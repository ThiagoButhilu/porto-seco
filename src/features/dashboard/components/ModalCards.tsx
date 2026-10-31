import { MODAIS, MODAL_LABEL, type IndicadoresDashboard } from '@/domain/entities';
import { MODAL_ICON } from '@/shared/components/ModalTag';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import { Icon } from '@/shared/ui';
import styles from './ModalCards.module.scss';

interface ModalCardsProps {
  porModal: IndicadoresDashboard['porModal'];
  total: number;
}

export function ModalCards({ porModal, total }: ModalCardsProps) {
  return (
    <ul className={styles.cards}>
      {MODAIS.map((modal) => {
        const { total: doModal, concluidos, processando, erros } = porModal[modal];
        const share = total ? (doModal / total) * 100 : 0;
        return (
          <li key={modal} className={styles.card} data-modal={modal}>
            <div className={styles.head}>
              <span className={styles.icon}>
                <Icon name={MODAL_ICON[modal]} size={20} />
              </span>
              <span className={styles.name}>{MODAL_LABEL[modal]}</span>
              <span className={styles.share}>{formatPercent(doModal, total)}</span>
            </div>

            <p className={styles.value}>
              {formatNumber(doModal)}
              <span className={styles.unit}>documento{doModal === 1 ? '' : 's'}</span>
            </p>

            <div
              className={styles.track}
              role="img"
              aria-label={`${MODAL_LABEL[modal]}: ${formatPercent(doModal, total)} dos documentos`}
            >
              <span className={styles.bar} style={{ width: `${share}%` }} />
            </div>

            <dl className={styles.breakdown}>
              <div>
                <dt>Concluídos</dt>
                <dd>{concluidos}</dd>
              </div>
              <div>
                <dt>Processando</dt>
                <dd>{processando}</dd>
              </div>
              <div>
                <dt>Com erro</dt>
                <dd className={erros ? styles.danger : undefined}>{erros}</dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}
