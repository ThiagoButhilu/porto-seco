'use client';

import clsx from 'clsx';
import { useId, useRef, useState, type DragEvent } from 'react';
import { formatBytes } from '@/shared/lib/format';
import { Field, fieldMessageId, type FieldBaseProps } from '../Field/Field';
import { Icon } from '../Icon/Icon';
import styles from './FileDropzone.module.scss';

interface FileDropzoneProps extends FieldBaseProps {
  value: File | null;
  onChange: (file: File | null) => void;
  onBlur?: () => void;
  accept: string;
  /** Rótulo curto exibido no ícone do arquivo (ex.: PDF, XML). */
  fileTag: string;
  disabled?: boolean;
}

export function FileDropzone({
  value,
  onChange,
  onBlur,
  accept,
  fileTag,
  disabled,
  ...fieldProps
}: FileDropzoneProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { error, hint } = fieldProps;

  const select = (file: File | null) => {
    onChange(file);
    onBlur?.();
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) select(file);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = '';
    select(null);
  };

  return (
    <Field id={id} {...fieldProps}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className={styles.input}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? fieldMessageId(id) : undefined}
        onChange={(event) => select(event.target.files?.[0] ?? null)}
      />

      {value ? (
        <div className={clsx(styles.selected, error && styles.selectedInvalid)}>
          <span className={styles.fileTag}>{fileTag}</span>
          <div className={styles.fileInfo}>
            <span className={styles.fileName} title={value.name}>
              {value.name}
            </span>
            <span className={styles.fileSize}>{formatBytes(value.size)}</span>
          </div>
          <button
            type="button"
            className={styles.action}
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
          >
            Trocar
          </button>
          <button
            type="button"
            className={styles.remove}
            onClick={clear}
            disabled={disabled}
            aria-label={`Remover ${value.name}`}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={clsx(
            styles.dropzone,
            dragging && styles.dragging,
            error && styles.invalid,
            disabled && styles.disabled,
          )}
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <span className={styles.iconWrap}>
            <Icon name="upload" size={18} />
          </span>
          <span className={styles.copy}>
            <strong>Clique para selecionar</strong> ou arraste o arquivo {fileTag}
          </span>
        </label>
      )}
    </Field>
  );
}
