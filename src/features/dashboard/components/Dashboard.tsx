'use client';

import Link from 'next/link';
import { Alert, Button, Card, CardHeader, EmptyState, PageHeader } from '@/shared/ui';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { DashboardSkeleton } from './DashboardSkeleton';
import { ProcessTypeSplit } from './ProcessTypeSplit';
import { RecentList } from './RecentList';
import { StatTiles } from './StatTiles';
import { TransportModeCards } from './TransportModeCards';
import { WeeklyChart } from './WeeklyChart';
import styles from './Dashboard.module.scss';

export function Dashboard() {
  const { data, isPending, isError, error, refetch, isRefetching } = useDashboardStats();

  const header = (
    <PageHeader
      title="Visão geral"
      description="Indicadores dos documentos enviados para averbação no recinto."
      actions={
        <Link href="/endorsements" className={styles.cta}>
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
              <Link href="/endorsements" className={styles.cta}>
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
        <StatTiles stats={data} />

        <section className={styles.section} aria-labelledby="transport-modes-title">
          <h2 id="transport-modes-title" className={styles.sectionTitle}>
            Documentos por modalidade
          </h2>
          <TransportModeCards byTransportMode={data.byTransportMode} total={data.total} />
        </section>

        <div className={styles.charts}>
          <Card>
            <CardHeader title="Envios nos últimos 7 dias" description="Total de averbações enviadas por dia" />
            <WeeklyChart days={data.lastDays} />
          </Card>
          <Card>
            <CardHeader title="Tipo de processo" description="Distribuição entre DUIMP e DI" />
            <ProcessTypeSplit byProcessType={data.byProcessType} />
          </Card>
        </div>

        <Card padding="none">
          <div className={styles.recentHeader}>
            <CardHeader
              title="Últimos envios"
              actions={
                <Link href="/documents" className={styles.link}>
                  Ver todos
                </Link>
              }
            />
          </div>
          <RecentList documents={data.recent} />
        </Card>
      </div>
    </>
  );
}
