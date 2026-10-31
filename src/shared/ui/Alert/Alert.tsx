import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './Alert.module.scss';

type Tone = 'info' | 'success' | 'danger' | 'warning';

const ICONS: Record<Tone, IconName> = {
  info: 'info',
  success: 'checkCircle',
  danger: 'alert',
  warning: 'alert',
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function Alert({ tone = 'info', title, children, action }: AlertProps) {
  return (
    <div className={clsx(styles.alert, styles[tone])} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon name={ICONS[tone]} size={18} className={styles.icon} />
      <div className={styles.body}>
        {title && <p className={styles.title}>{title}</p>}
        {children && <div className={styles.text}>{children}</div>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
