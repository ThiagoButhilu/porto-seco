import clsx from 'clsx';
import { formatDate, formatWeekday } from '@/shared/lib/format';
import styles from './WeeklyChart.module.scss';

interface WeeklyChartProps {
  dias: { data: string; total: number }[];
}

/** Arredonda o topo da escala para um valor "redondo" (múltiplo de 2/5/10). */
function escalaMaxima(valor: number) {
  if (valor <= 4) return 4;
  const passo = valor <= 10 ? 2 : valor <= 25 ? 5 : 10;
  return Math.ceil(valor / passo) * passo;
}

export function WeeklyChart({ dias }: WeeklyChartProps) {
  const maximo = escalaMaxima(Math.max(...dias.map((d) => d.total)));
  const linhas = [maximo, maximo / 2, 0];
  const ultimo = dias.length - 1;

  return (
    <figure className={styles.figure}>
      <div className={styles.plot} aria-hidden>
        <div className={styles.axis}>
          {linhas.map((valor) => (
            <span key={valor} className={styles.tick}>
              {valor}
            </span>
          ))}
        </div>
        <div className={styles.area}>
          {linhas.map((valor) => (
            <span
              key={valor}
              className={clsx(styles.gridline, valor === 0 && styles.baseline)}
              style={{ bottom: `${(valor / maximo) * 100}%` }}
            />
          ))}
          <div className={styles.bars}>
            {dias.map((dia, index) => (
              <div key={dia.data} className={styles.column} tabIndex={0}>
                <span
                  className={clsx(styles.bar, index === ultimo && styles.today)}
                  style={{ height: `${(dia.total / maximo) * 100}%` }}
                />
                <span className={styles.tooltip} role="tooltip">
                  <span className={styles.tooltipValue}>
                    <strong>{dia.total}</strong> envio{dia.total === 1 ? '' : 's'}
                  </span>
                  <span className={styles.tooltipDate}>{formatDate(dia.data)}</span>
                </span>
                {index === ultimo && dia.total > 0 && (
                  <span className={styles.directLabel} style={{ bottom: `${(dia.total / maximo) * 100}%` }}>
                    {dia.total}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.labels} aria-hidden>
        {dias.map((dia, index) => (
          <span key={dia.data} className={clsx(index === ultimo && styles.labelToday)}>
            {index === ultimo ? 'Hoje' : formatWeekday(dia.data)}
          </span>
        ))}
      </div>

      <table className={styles.srOnly}>
        <caption>Envios por dia nos últimos 7 dias</caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Envios</th>
          </tr>
        </thead>
        <tbody>
          {dias.map((dia) => (
            <tr key={dia.data}>
              <td>{formatDate(dia.data)}</td>
              <td>{dia.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
