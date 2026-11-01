'use client';

import clsx from 'clsx';
import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from '../Button/Button';
import styles from './Modal.module.scss';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  size?: 'md' | 'lg';
  placement?: 'center' | 'right';
  children: ReactNode;
}

/** Uses the native `<dialog>`: focus trap, ESC and backdrop for free, no library needed. */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  actions,
  size = 'md',
  placement = 'center',
  children,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={clsx(styles.dialog, styles[size], styles[placement])}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className={styles.content}>
          <header className={styles.header}>
            <div className={styles.headings}>
              <h2 className={styles.title}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
            <div className={styles.headerActions}>
              {actions}
              <Button variant="ghost" icon="x" iconOnly aria-label="Fechar" onClick={onClose} />
            </div>
          </header>
          <div className={styles.body}>{children}</div>
        </div>
      )}
    </dialog>
  );
}
