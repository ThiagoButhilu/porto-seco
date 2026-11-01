'use client';

import { useRef, useState } from 'react';
import { Card, CardHeader, PageHeader } from '@/shared/ui';
import { useDta } from '../hooks/useEndorsementQueries';
import { DtaSearch, type DtaSearchHandle } from './DtaSearch';
import { DtaSummary, DtaSummarySkeleton } from './DtaSummary';
import { EndorsementForm } from './EndorsementForm';
import { Step } from './Step';
import { SubmissionList } from './SubmissionList';
import styles from './EndorsementPage.module.scss';

export function EndorsementPage() {
  const [dtaNumber, setDtaNumber] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const searchRef = useRef<DtaSearchHandle>(null);
  const dtaQuery = useDta(dtaNumber);
  const dta = dtaQuery.data;

  const searchDta = (number: string) => {
    if (number === dtaNumber) void dtaQuery.refetch();
    else setDtaNumber(number);
  };

  /** After a submission starts, the flow resets for the next DTA — without waiting for processing. */
  const startNewEndorsement = () => {
    setDtaNumber(null);
    setRound((r) => r + 1);
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
          <Step number={1} title="Consultar DTA" done={Boolean(dta)}>
            <DtaSearch
              key={`search-${round}`}
              ref={searchRef}
              onSearch={searchDta}
              loading={dtaQuery.isFetching}
              error={dtaQuery.isError && !dtaQuery.isFetching ? dtaQuery.error.message : undefined}
            />
          </Step>

          <Step number={2} title="Dados da DTA" done={Boolean(dta)} disabled={!dtaNumber}>
            {dtaQuery.isFetching && !dta ? (
              <DtaSummarySkeleton />
            ) : dta ? (
              <DtaSummary dta={dta} />
            ) : (
              <p className={styles.placeholder}>Os dados aparecem aqui após a consulta da DTA.</p>
            )}
          </Step>

          <Step number={3} title="Documento e arquivos" disabled={!dta} last>
            {dta ? (
              <EndorsementForm key={`${dta.number}-${round}`} dta={dta} onSubmitted={startNewEndorsement} />
            ) : (
              <p className={styles.placeholder}>Disponível após consultar uma DTA válida.</p>
            )}
          </Step>
        </div>

        <aside className={styles.aside}>
          <Card className={styles.submissionsCard}>
            <CardHeader
              title="Envios da sessão"
              description="Status de cada averbação em tempo real"
              titleAs="h2"
            />
            <SubmissionList />
          </Card>
        </aside>
      </div>
    </>
  );
}
