'use client';

import { useRef, useState } from 'react';
import { Card, CardHeader, PageHeader } from '@/shared/ui';
import { useDta } from '../hooks/useAverbacaoQueries';
import { AverbacaoForm } from './AverbacaoForm';
import { DtaSearch, type DtaSearchHandle } from './DtaSearch';
import { DtaSummary, DtaSummarySkeleton } from './DtaSummary';
import { EnviosList } from './EnviosList';
import { Step } from './Step';
import styles from './AverbacaoPage.module.scss';

export function AverbacaoPage() {
  const [numeroDta, setNumeroDta] = useState<string | null>(null);
  const [rodada, setRodada] = useState(0);
  const searchRef = useRef<DtaSearchHandle>(null);
  const dtaQuery = useDta(numeroDta);
  const dta = dtaQuery.data;

  const buscarDta = (numero: string) => {
    if (numero === numeroDta) void dtaQuery.refetch();
    else setNumeroDta(numero);
  };

  /** Após iniciar um envio, o fluxo volta ao início para a próxima DTA — sem esperar o processamento. */
  const novaAverbacao = () => {
    setNumeroDta(null);
    setRodada((r) => r + 1);
    requestAnimationFrame(() => searchRef.current?.focus());
  };

  return (
    <>
      <PageHeader
        title="Averbação de documentos"
        description="Consulte a DTA, informe o documento de importação e anexe os arquivos. Você pode iniciar um novo envio enquanto os anteriores são processados."
      />

      <div className={styles.layout}>
        <div className={styles.flow}>
          <Step numero={1} titulo="Consultar DTA" concluido={Boolean(dta)}>
            <DtaSearch
              key={`busca-${rodada}`}
              ref={searchRef}
              onBuscar={buscarDta}
              carregando={dtaQuery.isFetching}
              erro={dtaQuery.isError && !dtaQuery.isFetching ? dtaQuery.error.message : undefined}
            />
          </Step>

          <Step numero={2} titulo="Dados da DTA" concluido={Boolean(dta)} desabilitado={!numeroDta}>
            {dtaQuery.isFetching && !dta ? (
              <DtaSummarySkeleton />
            ) : dta ? (
              <DtaSummary dta={dta} />
            ) : (
              <p className={styles.placeholder}>Os dados aparecem aqui após a consulta da DTA.</p>
            )}
          </Step>

          <Step numero={3} titulo="Documento e arquivos" desabilitado={!dta} ultimo>
            {dta ? (
              <AverbacaoForm key={`${dta.numero}-${rodada}`} dta={dta} onEnviado={novaAverbacao} />
            ) : (
              <p className={styles.placeholder}>Disponível após consultar uma DTA válida.</p>
            )}
          </Step>
        </div>

        <aside className={styles.aside}>
          <Card className={styles.enviosCard}>
            <CardHeader
              title="Envios da sessão"
              description="Status de cada averbação em tempo real"
              titleAs="h2"
            />
            <EnviosList />
          </Card>
        </aside>
      </div>
    </>
  );
}
