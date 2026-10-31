'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch, type Resolver } from 'react-hook-form';
import type { Dta } from '@/domain/entities';
import { EXEMPLOS, MASKS } from '@/domain/validation/masks';
import {
  averbacaoDefaults,
  averbacaoSchema,
  LIMITES,
  type AverbacaoFormValues,
  type AverbacaoOutput,
} from '@/domain/validation/schemas';
import { Button, FileDropzone, SegmentedControl, Select, TextField, toast } from '@/shared/ui';
import { useComissarias } from '../hooks/useAverbacaoQueries';
import { useEnviosStore } from '../store/enviosStore';
import { toNovaAverbacao } from '../mappers';
import styles from './AverbacaoForm.module.scss';

interface AverbacaoFormProps {
  dta: Dta;
  onEnviado: () => void;
}

const TIPOS = [
  { value: 'DUIMP' as const, label: 'DUIMP', description: 'Declaração Única de Importação' },
  { value: 'DI' as const, label: 'DI', description: 'Declaração de Importação' },
];

const COBERTURA = [
  { value: 'NAO' as const, label: 'Não' },
  { value: 'SIM' as const, label: 'Sim' },
];

export function AverbacaoForm({ dta, onEnviado }: AverbacaoFormProps) {
  const iniciarEnvio = useEnviosStore((state) => state.iniciar);
  const comissarias = useComissarias();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AverbacaoFormValues, unknown, AverbacaoOutput>({
    resolver: zodResolver(averbacaoSchema) as unknown as Resolver<AverbacaoFormValues, unknown, AverbacaoOutput>,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    defaultValues: averbacaoDefaults,
    shouldUnregister: false,
  });

  // Validação "ao vivo" do formulário inteiro para controlar o botão de envio,
  // sem exibir erros em campos que o usuário ainda não tocou.
  const valores = useWatch({ control }) as AverbacaoFormValues;
  const validacao = averbacaoSchema.safeParse(valores);
  const pendencias = validacao.success
    ? 0
    : new Set(validacao.error.issues.map((issue) => issue.path[0])).size;
  const tipoProcesso = valores.tipoProcesso;

  const enviar = handleSubmit((dados) => {
    iniciarEnvio(toNovaAverbacao(dta.numero, dados), dta.importador.razaoSocial);
    toast.info('Envio iniciado', 'Acompanhe o status no painel de envios. Você já pode averbar outra DTA.');
    onEnviado();
  });

  return (
    <form className={styles.form} onSubmit={enviar} noValidate>
      <Controller
        control={control}
        name="tipoProcesso"
        render={({ field }) => (
          <SegmentedControl
            label="Tipo de processo"
            required
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            options={TIPOS}
          />
        )}
      />

      <fieldset className={styles.group}>
        <legend className={styles.groupTitle}>
          {tipoProcesso === 'DUIMP' ? 'Dados da DUIMP' : 'Dados da DI'}
        </legend>

        {tipoProcesso === 'DUIMP' ? (
          <div className={styles.row}>
            <TextField
              key="numeroDuimp"
              label="Número da DUIMP"
              placeholder={EXEMPLOS.DUIMP}
              mask={MASKS.DUIMP}
              mono
              required
              autoCapitalize="characters"
              hint={`Formato: ${EXEMPLOS.DUIMP}`}
              error={errors.numeroDuimp?.message}
              {...register('numeroDuimp')}
            />
            <TextField
              key="chaveAcesso"
              label="Chave de acesso"
              placeholder="Informada no Portal Único"
              maxLength={LIMITES.CHAVE_ACESSO_MAX}
              showCounter
              mono
              required
              autoComplete="off"
              spellCheck={false}
              error={errors.chaveAcesso?.message}
              {...register('chaveAcesso')}
            />
          </div>
        ) : (
          <div className={styles.row}>
            <TextField
              key="numeroDi"
              label="Número da DI"
              placeholder={EXEMPLOS.DI}
              mask={MASKS.DI}
              inputMode="numeric"
              mono
              required
              hint={`Formato: ${EXEMPLOS.DI}`}
              error={errors.numeroDi?.message}
              {...register('numeroDi')}
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
                label={`PDF da ${tipoProcesso}`}
                required
                accept="application/pdf,.pdf"
                fileTag="PDF"
                hint={`Apenas .pdf, até ${LIMITES.PDF_MB} MB`}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.pdf?.message}
              />
            )}
          />
          {tipoProcesso === 'DI' && (
            <Controller
              control={control}
              name="xml"
              render={({ field }) => (
                <FileDropzone
                  label="XML da DI"
                  required
                  accept="application/xml,text/xml,.xml"
                  fileTag="XML"
                  hint={`Apenas .xml, até ${LIMITES.XML_MB} MB`}
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
            placeholder={comissarias.isPending ? 'Carregando comissárias…' : 'Selecione a comissária'}
            disabled={comissarias.isPending || comissarias.isError}
            options={(comissarias.data ?? []).map((c) => ({ value: c.id, label: c.nome }))}
            error={
              errors.comissariaId?.message ??
              (comissarias.isError ? 'Não foi possível carregar as comissárias.' : undefined)
            }
            {...register('comissariaId')}
          />
          <TextField
            label="Código de referência"
            optional
            placeholder="Ex.: PED-2025-0042"
            maxLength={LIMITES.CODIGO_REFERENCIA}
            showCounter
            error={errors.codigoReferencia?.message}
            {...register('codigoReferencia')}
          />
        </div>
        {comissarias.isError && (
          <Button size="sm" variant="secondary" icon="refresh" onClick={() => comissarias.refetch()}>
            Recarregar comissárias
          </Button>
        )}

        <Controller
          control={control}
          name="coberturaCambial"
          render={({ field }) => (
            <SegmentedControl
              label="Cobertura cambial"
              required
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              options={COBERTURA}
              hint="Indica se a importação envolve pagamento ao exterior (contrato de câmbio)."
              className={styles.cobertura}
            />
          )}
        />
      </fieldset>

      <footer className={styles.footer}>
        <p className={styles.footerHint} aria-live="polite">
          {pendencias > 0 ? (
            <>
              Preencha os campos obrigatórios para enviar —{' '}
              <strong>
                {pendencias} pendente{pendencias > 1 ? 's' : ''}
              </strong>
            </>
          ) : (
            <span className={styles.ready}>Tudo certo. Pronto para enviar.</span>
          )}
        </p>
        <Button type="submit" size="lg" icon="upload" disabled={pendencias > 0}>
          Enviar averbação
        </Button>
      </footer>
    </form>
  );
}
