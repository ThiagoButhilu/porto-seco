import Link from 'next/link';
import type { EndorsedDocument } from '@/domain/entities';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { TransportModeTag } from '@/shared/components/TransportModeTag';
import { formatDateTime } from '@/shared/lib/format';
import styles from './RecentList.module.scss';

export function RecentList({ documents }: { documents: EndorsedDocument[] }) {
  return (
    <ul className={styles.list}>
      {documents.map((doc) => (
        <li key={doc.id}>
          <Link href={`/documents?q=${encodeURIComponent(doc.dta)}`} className={styles.row}>
            <div className={styles.main}>
              <span className={styles.doc}>
                <span className={styles.processType}>{doc.processType}</span>
                <span className={styles.mono}>{doc.documentNumber}</span>
              </span>
              <span className={styles.importer}>{doc.importer}</span>
            </div>
            <span className={styles.dta}>
              <span className={styles.caption}>DTA</span>
              <span className={styles.mono}>{doc.dta}</span>
            </span>
            <span className={styles.mode}>
              <TransportModeTag mode={doc.transportMode} />
            </span>
            <time className={styles.date} dateTime={doc.submittedAt}>
              {formatDateTime(doc.submittedAt)}
            </time>
            <span className={styles.status}>
              <StatusBadge status={doc.status} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
