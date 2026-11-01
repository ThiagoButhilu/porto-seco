import { Card, Skeleton } from '@/shared/ui';
import styles from './DashboardSkeleton.module.scss';

export function DashboardSkeleton() {
  return (
    <div className={styles.wrapper} aria-busy="true" aria-label="Carregando indicadores">
      <div className={styles.tiles}>
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} padding="md">
            <Skeleton width="50%" />
            <Skeleton width="40%" height={30} className={styles.gap} />
            <Skeleton width="70%" height={10} className={styles.gap} />
          </Card>
        ))}
      </div>
      <div className={styles.modes}>
        {Array.from({ length: 3 }, (_, i) => (
          <Card key={i} padding="md">
            <Skeleton width="45%" height={20} />
            <Skeleton width="35%" height={32} className={styles.gap} />
            <Skeleton height={8} className={styles.gap} />
          </Card>
        ))}
      </div>
      <Card>
        <Skeleton width="30%" height={18} />
        <Skeleton height={200} className={styles.gap} />
      </Card>
    </div>
  );
}
