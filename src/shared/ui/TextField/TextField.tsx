'use client';

import clsx from 'clsx';
import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { applyMask } from '@/domain/validation/masks';
import { Field, fieldMessageId, type FieldBaseProps } from '../Field/Field';
import { Icon, type IconName } from '../Icon/Icon';
import styles from './TextField.module.scss';

export interface TextFieldProps
  extends FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Mask in the `domain/validation/masks` format (e.g. `99/9999999-9`). */
  mask?: string;
  showCounter?: boolean;
  icon?: IconName;
  endSlot?: ReactNode;
  mono?: boolean;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hint,
    error,
    required,
    optional,
    mask,
    showCounter,
    icon,
    endSlot,
    mono,
    id: idProp,
    maxLength,
    onChange,
    className,
    ...inputProps
  },
  forwardedRef,
) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const innerRef = useRef<HTMLInputElement | null>(null);
  const [length, setLength] = useState(0);
  const limit = mask ? mask.length : maxLength;

  useLayoutEffect(() => {
    setLength(innerRef.current?.value.length ?? 0);
  }, []);

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (mask) event.target.value = applyMask(event.target.value, mask);
    setLength(event.target.value.length);
    onChange?.(event);
  };

  return (
    <Field
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      counter={showCounter && limit ? { current: length, max: limit } : undefined}
      className={className}
    >
      <div
        className={clsx(
          styles.control,
          error && styles.invalid,
          inputProps.disabled && styles.disabled,
        )}
      >
        {icon && <Icon name={icon} size={18} className={styles.icon} />}
        <input
          ref={setRefs}
          id={id}
          maxLength={limit}
          aria-invalid={Boolean(error)}
          aria-required={required}
          aria-describedby={error || hint ? fieldMessageId(id) : undefined}
          className={clsx(styles.input, mono && styles.mono)}
          onChange={handleChange}
          autoComplete={mask ? 'off' : inputProps.autoComplete}
          spellCheck={mask ? false : inputProps.spellCheck}
          {...inputProps}
        />
        {endSlot}
      </div>
    </Field>
  );
});
