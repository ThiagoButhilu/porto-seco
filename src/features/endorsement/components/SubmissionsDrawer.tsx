'use client';

import { Modal } from '@/shared/ui';
import { SubmissionList } from './SubmissionList';
import styles from './SubmissionsDrawer.module.scss';

interface SubmissionsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function SubmissionsDrawer({ open, onClose }: SubmissionsDrawerProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      placement="right"
      title="Envios da sessão"
      subtitle="Acompanhe o processamento de cada averbação"
    >
      <div className={styles.body}>
        <SubmissionList />
      </div>
    </Modal>
  );
}
