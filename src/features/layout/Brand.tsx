import clsx from 'clsx';
import styles from './Brand.module.scss';

/** System brand: stylized container mark + name. */
export function Brand({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <span className={clsx(styles.brand, inverse && styles.inverse, compact && styles.compact)}>
      <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="8" className={styles.markBg} />
        <path d="M7 12h18v11H7z" className={styles.markBox} />
        <path d="M11 12v11M16 12v11M21 12v11" className={styles.markLines} />
        <path d="M7 9.5h18" className={styles.markAccent} />
      </svg>
      <span className={styles.text}>
        <span className={styles.name}>Porto Seco</span>
        <span className={styles.tagline}>Averbação digital</span>
      </span>
    </span>
  );
}
