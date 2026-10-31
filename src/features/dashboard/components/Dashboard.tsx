'use client';

import Link from 'next/link';
import { Alert, Button, Card, CardHeader, EmptyState, PageHeader } from '@/shared/ui';
import { useIndicadores } from '../hooks/useIndicadores';
import { DashboardSkeleton } from './DashboardSkeleton';
import { ModalCards } from './ModalCards';
import { RecentesList } from './RecentesList';
import { StatTiles } from './StatTiles';
import { TipoProcessoSplit } from './TipoProcessoSplit';
import { WeeklyChart } from './WeeklyChart';
import styles from './Dashboard.module.scss';

export function Dashboard() {
  const { data, isPending, isError, error, refetch, isRefetching } = useIndicadores();

  const header = (
    <PageHeader
      title="Visão geral"
      description="Indicadores dos documentos enviados para averbação no recinto."
      actions={
        <Link href="/averbacao" className={styles.cta}>
          Nova averbação
        </Link>
      }
    />
  );

  if (isPending) {
    return (
      <>
        {header}
        <DashboardSkeleton />
      </>
    );
  }

  if (isError) {
    return (
      <>
        {header}
        <Alert
          tone="danger"
          title="Não foi possível carregar os indicadores"
          action={
            <Button size="sm" variant="secondary" icon="refresh" loading={isRefetching} onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        >
          {error.message}
        </Alert>
      </>
    );
  }

  if (data.total === 0) {
    return (
      <>
        {header}
        <Card>
          <EmptyState
            icon="fileUp"
            title="Nenhum documento enviado ainda"
            description="Assim que as primeiras averbações forem enviadas, os indicadores aparecem aqui."
            action={
              <Link href="/averbacao" className={styles.cta}>
                Fazer primeira averbação
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      {header}
      <div className={styles.grid}>
        <StatTiles indicadores={data} />

        <section className={styles.section} aria-labelledby="modais-titulo">
          <h2 id="modais-titulo" className={styles.sectionTitle}>
            Documentos por modalidade
          </h2>
          <ModalCards porModal={data.porModal} total={data.total} />
        </section>

        <div className={styles.charts}>
          <Card>
            <CardHeader title="Envios nos últimos 7 dias" description="Total de averbações enviadas por dia" />
            <WeeklyChart dias={data.ultimosDias} />
          </Card>
          <Card>
            <CardHeader title="Tipo de processo" description="Distribuição entre DUIMP e DI" />
            <TipoProcessoSplit porTipo={data.porTipo} />
          </Card>
        </div>

        <Card padding="none">
          <div className={styles.recentesHeader}>
            <CardHeader
              title="Últimos envios"
              actions={
                <Link href="/documentos" className={styles.link}>
                  Ver todos
                </Link>
              }
            />
          </div>
          <RecentesList documentos={data.recentes} />
        </Card>
      </div>
    </>
  );
}
