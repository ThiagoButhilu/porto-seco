import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from '@/shared/ui';
import styles from './Step.module.scss';

interface StepProps {
  number: number;
  title: string;
  done?: boolean;
  disabled?: boolean;
  last?: boolean;
  children: ReactNode;
}

/** Numbered step of the endorsement flow, with a vertical progress rail. */
export function Step({ number, title, done, disabled, last, children }: StepProps) {
  return (
    <section
      className={clsx(styles.step, done && styles.done, disabled && styles.disabled, last && styles.last)}
      aria-labelledby={`step-${number}`}
    >
      <div className={styles.rail} aria-hidden>
        <span className={styles.marker}>{done ? <Icon name="check" size={14} /> : number}</span>
      </div>
      <div className={styles.body}>
        <h2 id={`step-${number}`} className={styles.title}>
          <span className={styles.srOnly}>Etapa {number}: </span>
          {title}
        </h2>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
