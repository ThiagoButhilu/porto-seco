'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { EXAMPLES, MASKS } from '@/domain/validation/masks';
import { dtaLookupSchema, type DtaLookupInput } from '@/domain/validation/schemas';
import { Alert, Button, TextField } from '@/shared/ui';
import styles from './DtaSearch.module.scss';

export interface DtaSearchHandle {
  focus: () => void;
}

interface DtaSearchProps {
  onSearch: (number: string) => void;
  loading: boolean;
  error?: string;
}

/** DTAs that exist in the demo data — a shortcut for whoever is evaluating the flow. */
const DEMO_DTAS = ['25/0412387-3', '25/0398451-0', '25/0501276-8'];

export const DtaSearch = forwardRef<DtaSearchHandle, DtaSearchProps>(function DtaSearch(
  { onSearch, loading, error },
  ref,
) {
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<DtaLookupInput>({
    resolver: zodResolver(dtaLookupSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { dta: '' },
  });

  useImperativeHandle(ref, () => ({ focus: () => setFocus('dta') }), [setFocus]);

  const search = handleSubmit(({ dta }) => onSearch(dta));

  const pickExample = (number: string) => {
    setValue('dta', number, { shouldValidate: true });
    onSearch(number);
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={search} noValidate>
        <TextField
          label="Número da DTA"
          placeholder={EXAMPLES.DTA}
          mask={MASKS.DTA}
          inputMode="numeric"
          mono
          required
          className={styles.field}
          error={errors.dta?.message}
          hint="Formato: 25/0000000-1"
          {...register('dta')}
        />
        <Button type="submit" icon="search" loading={loading} className={styles.button}>
          Consultar
        </Button>
      </form>

      {error && (
        <Alert tone="danger" title="DTA não localizada">
          {error}
        </Alert>
      )}

      <p className={styles.examples}>
        <span>Para testar:</span>
        {DEMO_DTAS.map((number) => (
          <button key={number} type="button" className={styles.chip} onClick={() => pickExample(number)}>
            {number}
          </button>
        ))}
      </p>
    </div>
  );
});
