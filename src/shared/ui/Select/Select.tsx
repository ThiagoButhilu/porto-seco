'use client';

import clsx from 'clsx';
import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { Field, fieldMessageId, type FieldBaseProps } from '../Field/Field';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends FieldBaseProps, SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, optional, options, placeholder, id: idProp, className, ...props },
  ref,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      <div className={clsx(styles.control, error && styles.invalid)}>
        <select
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-required={required}
          aria-describedby={error || hint ? fieldMessageId(id) : undefined}
          className={styles.select}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg className={styles.chevron} viewBox="0 0 24 24" width="16" height="16" aria-hidden>
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </Field>
  );
});
