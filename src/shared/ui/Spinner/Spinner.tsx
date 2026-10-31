import styles from './Spinner.module.scss';

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 18, label }: SpinnerProps) {
  return (
    <span
      className={styles.spinner}
      style={{ width: size, height: size }}
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
