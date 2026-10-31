'use client';

import clsx from 'clsx';
import { Icon, type IconName } from '../Icon/Icon';
import { useToastStore, type ToastTone } from './toastStore';
import styles from './Toaster.module.scss';

const ICONS: Record<ToastTone, IconName> = {
  success: 'checkCircle',
  danger: 'alert',
  info: 'info',
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className={styles.region} aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div key={t.id} className={clsx(styles.toast, styles[t.tone])} role="status">
          <Icon name={ICONS[t.tone]} size={18} className={styles.icon} />
          <div className={styles.text}>
            <p className={styles.title}>{t.title}</p>
            {t.description && <p className={styles.description}>{t.description}</p>}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismiss(t.id)}
            aria-label="Fechar notificação"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
