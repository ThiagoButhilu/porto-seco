import type { IndicadoresDashboard, TipoProcesso } from '@/domain/entities';
import { formatNumber, formatPercent } from '@/shared/lib/format';
import styles from './TipoProcessoSplit.module.scss';

const TIPOS: { tipo: TipoProcesso; descricao: string }[] = [
  { tipo: 'DUIMP', descricao: 'Declaração Única de Importação' },
  { tipo: 'DI', descricao: 'Declaração de Importação' },
];

export function TipoProcessoSplit({ porTipo }: { porTipo: IndicadoresDashboard['porTipo'] }) {
  const total = porTipo.DI + porTipo.DUIMP;
  const maior = Math.max(porTipo.DI, porTipo.DUIMP, 1);

  return (
    <ul className={styles.list}>
      {TIPOS.map(({ tipo, descricao }) => (
        <li key={tipo} className={styles.row}>
          <div className={styles.head}>
            <span className={styles.tipo}>{tipo}</span>
            <span className={styles.value}>
              {formatNumber(porTipo[tipo])}
              <span className={styles.percent}>{formatPercent(porTipo[tipo], total)}</span>
            </span>
          </div>
          <span className={styles.descricao}>{descricao}</span>
          <span className={styles.track} aria-hidden>
            <span className={styles.bar} style={{ width: `${(porTipo[tipo] / maior) * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
