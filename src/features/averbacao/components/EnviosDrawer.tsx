'use client';

import { Modal } from '@/shared/ui';
import { EnviosList } from './EnviosList';
import styles from './EnviosDrawer.module.scss';

interface EnviosDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function EnviosDrawer({ open, onClose }: EnviosDrawerProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      placement="right"
      title="Envios da sessão"
      subtitle="Acompanhe o processamento de cada averbação"
    >
      <div className={styles.body}>
        <EnviosList />
      </div>
    </Modal>
  );
}
