import { TRANSPORT_MODE_LABEL, type TransportMode } from '@/domain/entities';
import { Icon, type IconName } from '@/shared/ui';
import styles from './TransportModeTag.module.scss';

export const TRANSPORT_MODE_ICON: Record<TransportMode, IconName> = {
  SEA: 'ship',
  ROAD: 'truck',
  AIR: 'plane',
};

export function TransportModeTag({ mode }: { mode: TransportMode }) {
  return (
    <span className={styles.tag} data-mode={mode}>
      <Icon name={TRANSPORT_MODE_ICON[mode]} size={14} />
      {TRANSPORT_MODE_LABEL[mode]}
    </span>
  );
}
