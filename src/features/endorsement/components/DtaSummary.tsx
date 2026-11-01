import type { Dta } from '@/domain/entities';
import { TransportModeTag } from '@/shared/components/TransportModeTag';
import { formatCnpj, formatDate } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';
import styles from './DtaSummary.module.scss';

export function DtaSummary({ dta }: { dta: Dta }) {
  const fields = [
    { label: 'Número da DTA', value: <span className={styles.mono}>{dta.number}</span> },
    {
      label: 'Razão social do importador',
      value: (
        <>
          {dta.importer.companyName}
          <span className={styles.sub}>CNPJ {formatCnpj(dta.importer.cnpj)}</span>
        </>
      ),
      wide: true,
    },
    { label: 'Cadastro do importador', value: formatDate(dta.importer.registeredAt) },
    { label: 'País de origem', value: dta.originCountry },
    { label: 'Modal', value: <TransportModeTag mode={dta.transportMode} /> },
    { label: 'Número do conhecimento', value: <span className={styles.mono}>{dta.billOfLadingNumber}</span> },
  ];

  return (
    <dl className={styles.grid}>
      {fields.map((field) => (
        <div key={field.label} className={field.wide ? styles.wide : undefined}>
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function DtaSummarySkeleton() {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Consultando DTA">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={i === 1 ? styles.wide : undefined}>
          <Skeleton width="50%" height={10} />
          <Skeleton width="80%" height={16} className={styles.skeletonValue} />
        </div>
      ))}
    </div>
  );
}
