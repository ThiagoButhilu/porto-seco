import clsx from 'clsx';
import { formatDate, formatWeekday } from '@/shared/lib/format';
import styles from './WeeklyChart.module.scss';

interface WeeklyChartProps {
  days: { date: string; total: number }[];
}

/** Rounds the top of the scale to a "nice" value (multiple of 2/5/10). */
function scaleMax(value: number) {
  if (value <= 4) return 4;
  const step = value <= 10 ? 2 : value <= 25 ? 5 : 10;
  return Math.ceil(value / step) * step;
}

export function WeeklyChart({ days }: WeeklyChartProps) {
  const max = scaleMax(Math.max(...days.map((d) => d.total)));
  const gridlines = [max, max / 2, 0];
  const lastIndex = days.length - 1;

  return (
    <figure className={styles.figure}>
      <div className={styles.plot} aria-hidden>
        <div className={styles.axis}>
          {gridlines.map((value) => (
            <span key={value} className={styles.tick}>
              {value}
            </span>
          ))}
        </div>
        <div className={styles.area}>
          {gridlines.map((value) => (
            <span
              key={value}
              className={clsx(styles.gridline, value === 0 && styles.baseline)}
              style={{ bottom: `${(value / max) * 100}%` }}
            />
          ))}
          <div className={styles.bars}>
            {days.map((day, index) => (
              <div key={day.date} className={styles.column} tabIndex={0}>
                <span
                  className={clsx(styles.bar, index === lastIndex && styles.today)}
                  style={{ height: `${(day.total / max) * 100}%` }}
                />
                <span className={styles.tooltip} role="tooltip">
                  <span className={styles.tooltipValue}>
                    <strong>{day.total}</strong> envio{day.total === 1 ? '' : 's'}
                  </span>
                  <span className={styles.tooltipDate}>{formatDate(day.date)}</span>
                </span>
                {index === lastIndex && day.total > 0 && (
                  <span className={styles.directLabel} style={{ bottom: `${(day.total / max) * 100}%` }}>
                    {day.total}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.labels} aria-hidden>
        {days.map((day, index) => (
          <span key={day.date} className={clsx(index === lastIndex && styles.labelToday)}>
            {index === lastIndex ? 'Hoje' : formatWeekday(day.date)}
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
          {days.map((day) => (
            <tr key={day.date}>
              <td>{formatDate(day.date)}</td>
              <td>{day.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
