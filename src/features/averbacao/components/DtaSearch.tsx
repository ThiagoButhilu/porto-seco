'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { EXEMPLOS, MASKS } from '@/domain/validation/masks';
import { dtaConsultaSchema, type DtaConsultaInput } from '@/domain/validation/schemas';
import { Alert, Button, TextField } from '@/shared/ui';
import styles from './DtaSearch.module.scss';

export interface DtaSearchHandle {
  focus: () => void;
}

interface DtaSearchProps {
  onBuscar: (numero: string) => void;
  carregando: boolean;
  erro?: string;
}

/** DTAs existentes na massa de demonstração — atalho para quem estiver avaliando o fluxo. */
const EXEMPLOS_DEMO = ['25/0412387-3', '25/0398451-0', '25/0501276-8'];

export const DtaSearch = forwardRef<DtaSearchHandle, DtaSearchProps>(function DtaSearch(
  { onBuscar, carregando, erro },
  ref,
) {
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = useForm<DtaConsultaInput>({
    resolver: zodResolver(dtaConsultaSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: { dta: '' },
  });

  useImperativeHandle(ref, () => ({ focus: () => setFocus('dta') }), [setFocus]);

  const buscar = handleSubmit(({ dta }) => onBuscar(dta));

  const usarExemplo = (numero: string) => {
    setValue('dta', numero, { shouldValidate: true });
    onBuscar(numero);
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={buscar} noValidate>
        <TextField
          label="Número da DTA"
          placeholder={EXEMPLOS.DTA}
          mask={MASKS.DTA}
          inputMode="numeric"
          mono
          required
          className={styles.field}
          error={errors.dta?.message}
          hint="Formato: 25/0000000-1"
          {...register('dta')}
        />
        <Button type="submit" icon="search" loading={carregando} className={styles.button}>
          Consultar
        </Button>
      </form>

      {erro && (
        <Alert tone="danger" title="DTA não localizada">
          {erro}
        </Alert>
      )}

      <p className={styles.examples}>
        <span>Para testar:</span>
        {EXEMPLOS_DEMO.map((numero) => (
          <button key={numero} type="button" className={styles.chip} onClick={() => usarExemplo(numero)}>
            {numero}
          </button>
        ))}
      </p>
    </div>
  );
});
