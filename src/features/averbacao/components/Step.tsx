import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from '@/shared/ui';
import styles from './Step.module.scss';

interface StepProps {
  numero: number;
  titulo: string;
  concluido?: boolean;
  desabilitado?: boolean;
  ultimo?: boolean;
  children: ReactNode;
}

/** Etapa numerada do fluxo de averbação, com linha de progresso vertical. */
export function Step({ numero, titulo, concluido, desabilitado, ultimo, children }: StepProps) {
  return (
    <section
      className={clsx(styles.step, concluido && styles.done, desabilitado && styles.disabled, ultimo && styles.last)}
      aria-labelledby={`etapa-${numero}`}
    >
      <div className={styles.rail} aria-hidden>
        <span className={styles.marker}>{concluido ? <Icon name="check" size={14} /> : numero}</span>
      </div>
      <div className={styles.body}>
        <h2 id={`etapa-${numero}`} className={styles.title}>
          <span className={styles.srOnly}>Etapa {numero}: </span>
          {titulo}
        </h2>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
