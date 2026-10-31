import clsx from 'clsx';
import type { ReactNode } from 'react';
import styles from './Badge.module.scss';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'danger' | 'warning' | 'brand';

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md';
}

export function Badge({ tone = 'neutral', icon, size = 'md', children }: BadgeProps) {
  return (
    <span className={clsx(styles.badge, styles[tone], styles[size])}>
      {icon}
      {children}
    </span>
  );
}
