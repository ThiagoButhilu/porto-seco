'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import type { Dta } from '@/domain/entities';
import { EXAMPLES, MASKS } from '@/domain/validation/masks';
import {
  endorsementDefaults,
  endorsementSchema,
  LIMITS,
  type EndorsementFormValues,
  type EndorsementOutput,
} from '@/domain/validation/schemas';
import { Button, FileDropzone, SegmentedControl, Select, TextField, toast } from '@/shared/ui';
import { useCustomsBrokers } from '../hooks/useEndorsementQueries';
import { toNewEndorsement } from '../mappers';
import { useSubmissionsStore } from '../store/submissionsStore';
import styles from './EndorsementForm.module.scss';

interface EndorsementFormProps {
  dta: Dta;
  onSubmitted: () => void;
}

const PROCESS_TYPES = [
  { value: 'DUIMP' as const, label: 'DUIMP', description: 'Declaração Única de Importação' },
  { value: 'DI' as const, label: 'DI', description: 'Declaração de Importação' },
];

const COVERAGE_OPTIONS = [
  { value: 'NO' as const, label: 'Não' },
  { value: 'YES' as const, label: 'Sim' },
];

export function EndorsementForm({ dta, onSubmitted }: EndorsementFormProps) {
  const startSubmission = useSubmissionsStore((state) => state.start);
  const customsBrokers = useCustomsBrokers();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EndorsementFormValues, unknown, EndorsementOutput>({
    resolver: zodResolver(endorsementSchema) as unknown as Resolver<
      EndorsementFormValues,
      unknown,
      EndorsementOutput
    >,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: endorsementDefaults,
    shouldUnregister: false,
  });

  // Live validation of the whole form drives the submit button,
  // without showing errors on fields the user has not touched yet.
  const values = useWatch({ control }) as EndorsementFormValues;
  const validation = endorsementSchema.safeParse(values);
  const pendingCount = validation.success
    ? 0
    : new Set(validation.error.issues.map((issue) => issue.path[0])).size;
  const processType = values.processType;

  const submit = handleSubmit((data) => {
    startSubmission(toNewEndorsement(dta.number, data), dta.importer.companyName);
    toast.info('Envio iniciado', 'Acompanhe o status no painel de envios. Você já pode averbar outra DTA.');
    onSubmitted();
  });

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <Controller
        control={control}
        name="processType"
        render={({ field }) => (
          <SegmentedControl
            label="Tipo de processo"
            required
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            options={PROCESS_TYPES}
          />
        )}
      />

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>
          {processType === 'DUIMP' ? 'Dados da DUIMP' : 'Dados da DI'}
        </legend>

        {processType === 'DUIMP' ? (
          <div className={styles.row}>
            <TextField
              key="duimpNumber"
              label="Número da DUIMP"
              placeholder={EXAMPLES.DUIMP}
              mask={MASKS.DUIMP}
              mono
              required
              autoCapitalize="characters"
              hint={`Formato: ${EXAMPLES.DUIMP}`}
              error={errors.duimpNumber?.message}
              {...register('duimpNumber')}
            />
            <TextField
              key="accessKey"
              label="Chave de acesso"
              placeholder="Informada no Portal Único"
              maxLength={LIMITS.ACCESS_KEY_MAX}
              showCounter
              mono
              required
              autoComplete="off"
              spellCheck={false}
              error={errors.accessKey?.message}
              {...register('accessKey')}
            />
          </div>
        ) : (
          <div className={styles.row}>
            <TextField
              key="diNumber"
              label="Número da DI"
              placeholder={EXAMPLES.DI}
              mask={MASKS.DI}
              inputMode="numeric"
              mono
              required
              hint={`Formato: ${EXAMPLES.DI}`}
              error={errors.diNumber?.message}
              {...register('diNumber')}
            />
          </div>
        )}
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Arquivos</legend>
        <div className={styles.row}>
          <Controller
            control={control}
            name="pdf"
            render={({ field }) => (
              <FileDropzone
                label={`PDF da ${processType}`}
                required
                accept="application/pdf,.pdf"
                fileTag="PDF"
                hint={`Apenas .pdf, até ${LIMITS.PDF_MB} MB`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.pdf?.message}
              />
            )}
          />
          {processType === 'DI' && (
            <Controller
              control={control}
              name="xml"
              render={({ field }) => (
                <FileDropzone
                  label="XML da DI"
                  required
                  accept="application/xml,text/xml,.xml"
                  fileTag="XML"
                  hint={`Apenas .xml, até ${LIMITS.XML_MB} MB`}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.xml?.message}
                />
              )}
            />
          )}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>Informações complementares</legend>
        <div className={styles.row}>
          <Select
            label="Comissária"
            required
            placeholder={customsBrokers.isPending ? 'Carregando comissárias…' : 'Selecione a comissária'}
            disabled={customsBrokers.isPending || customsBrokers.isError}
            options={(customsBrokers.data ?? []).map((broker) => ({ value: broker.id, label: broker.name }))}
            error={
              errors.customsBrokerId?.message ??
              (customsBrokers.isError ? 'Não foi possível carregar as comissárias.' : undefined)
            }
            {...register('customsBrokerId')}
          />
          <TextField
            label="Código de referência"
            optional
            placeholder="Ex.: PED-2025-0042"
            maxLength={LIMITS.REFERENCE_CODE}
            showCounter
            error={errors.referenceCode?.message}
            {...register('referenceCode')}
          />
        </div>
        {customsBrokers.isError && (
          <Button size="sm" variant="secondary" icon="refresh" onClick={() => customsBrokers.refetch()}>
            Recarregar comissárias
          </Button>
        )}

        <Controller
          control={control}
          name="foreignExchangeCoverage"
          render={({ field }) => (
            <SegmentedControl
              label="Cobertura cambial"
              required
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              options={COVERAGE_OPTIONS}
              hint="Indica se a importação envolve pagamento ao exterior (contrato de câmbio)."
              className={styles.coverage}
            />
          )}
        />
      </fieldset>

      <footer className={styles.footer}>
        <p className={styles.footerHint} aria-live="polite">
          {pendingCount > 0 ? (
            <>
              Preencha os campos obrigatórios para enviar —{' '}
              <strong>
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </strong>
            </>
          ) : (
            <span className={styles.ready}>Tudo certo. Pronto para enviar.</span>
          )}
        </p>
        <Button type="submit" size="lg" icon="upload" disabled={pendingCount > 0}>
          Enviar averbação
        </Button>
      </footer>
    </form>
  );
}
