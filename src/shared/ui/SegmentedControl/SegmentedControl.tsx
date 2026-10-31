'use client';

import clsx from 'clsx';
import { useId } from 'react';
import { Field, type FieldBaseProps } from '../Field/Field';
import styles from './SegmentedControl.module.scss';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface SegmentedControlProps<T extends string> extends FieldBaseProps {
  name: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}

/** Grupo de rádio com aparência de botões segmentados (acessível via teclado). */
export function SegmentedControl<T extends string>({
  name,
  value,
  options,
  onChange,
  disabled,
  ...fieldProps
}: SegmentedControlProps<T>) {
  const id = useId();

  return (
    <Field id={id} as="fieldset" {...fieldProps}>
      <div className={clsx(styles.group, options.some((o) => o.description) && styles.rich)}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={clsx(styles.option, checked && styles.checked)}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className={styles.input}
              />
              <span className={styles.radio} aria-hidden />
              <span className={styles.text}>
                <span className={styles.label}>{option.label}</span>
                {option.description && (
                  <span className={styles.description}>{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </Field>
  );
}
