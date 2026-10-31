import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import styles from './Field.module.scss';

export interface FieldBaseProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  optional?: boolean;
}

interface FieldProps extends FieldBaseProps {
  id: string;
  counter?: { current: number; max: number };
  children: ReactNode;
  className?: string;
  /** Para grupos (radio) o rótulo é renderizado pelo próprio componente. */
  as?: 'div' | 'fieldset';
}

export const fieldMessageId = (id: string) => `${id}-message`;

export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  counter,
  children,
  className,
  as = 'div',
}: FieldProps) {
  const Wrapper = as;
  const LabelTag = as === 'fieldset' ? 'legend' : 'label';
  const hasMessage = Boolean(error || hint);

  return (
    <Wrapper className={clsx(styles.field, as === 'fieldset' && styles.fieldset, className)}>
      <LabelTag className={styles.label} {...(as === 'div' ? { htmlFor: id } : {})}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden>
            *
          </span>
        )}
        {optional && <span className={styles.optional}>(opcional)</span>}
      </LabelTag>

      {children}

      {(hasMessage || counter) && (
        <div className={styles.footer}>
          {hasMessage && (
            <p
              id={fieldMessageId(id)}
              className={clsx(styles.message, error && styles.error)}
              role={error ? 'alert' : undefined}
            >
              {error && <Icon name="alert" size={14} />}
              <span>{error ?? hint}</span>
            </p>
          )}
          {counter && (
            <span
              className={clsx(
                styles.counter,
                counter.current >= counter.max && styles.counterLimit,
              )}
              aria-live="polite"
            >
              {counter.current}/{counter.max}
            </span>
          )}
        </div>
      )}
    </Wrapper>
  );
}
