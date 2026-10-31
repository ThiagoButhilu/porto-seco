import type { Dta } from '@/domain/entities';
import { ModalTag } from '@/shared/components/ModalTag';
import { formatCnpj, formatDate } from '@/shared/lib/format';
import { Skeleton } from '@/shared/ui';
import styles from './DtaSummary.module.scss';

export function DtaSummary({ dta }: { dta: Dta }) {
  const campos = [
    { label: 'Número da DTA', valor: <span className={styles.mono}>{dta.numero}</span> },
    {
      label: 'Razão social do importador',
      valor: (
        <>
          {dta.importador.razaoSocial}
          <span className={styles.sub}>CNPJ {formatCnpj(dta.importador.cnpj)}</span>
        </>
      ),
      largo: true,
    },
    { label: 'Cadastro do importador', valor: formatDate(dta.importador.dataCadastro) },
    { label: 'País de origem', valor: dta.paisOrigem },
    { label: 'Modal', valor: <ModalTag modal={dta.modal} /> },
    { label: 'Número do conhecimento', valor: <span className={styles.mono}>{dta.numeroConhecimento}</span> },
  ];

  return (
    <dl className={styles.grid}>
      {campos.map((campo) => (
        <div key={campo.label} className={campo.largo ? styles.wide : undefined}>
          <dt>{campo.label}</dt>
          <dd>{campo.valor}</dd>
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
