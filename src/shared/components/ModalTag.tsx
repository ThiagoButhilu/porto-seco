import { MODAL_LABEL, type Modal } from '@/domain/entities';
import { Icon, type IconName } from '@/shared/ui';
import styles from './ModalTag.module.scss';

export const MODAL_ICON: Record<Modal, IconName> = {
  MARITIMO: 'ship',
  RODOVIARIO: 'truck',
  AEREO: 'plane',
};

export function ModalTag({ modal }: { modal: Modal }) {
  return (
    <span className={styles.tag} data-modal={modal}>
      <Icon name={MODAL_ICON[modal]} size={14} />
      {MODAL_LABEL[modal]}
    </span>
  );
}
