import Link from 'next/link';
import type { DocumentoAverbado } from '@/domain/entities';
import { ModalTag } from '@/shared/components/ModalTag';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDateTime } from '@/shared/lib/format';
import styles from './RecentesList.module.scss';

export function RecentesList({ documentos }: { documentos: DocumentoAverbado[] }) {
  return (
    <ul className={styles.list}>
      {documentos.map((doc) => (
        <li key={doc.id}>
          <Link href={`/documentos?q=${encodeURIComponent(doc.dta)}`} className={styles.row}>
            <div className={styles.main}>
              <span className={styles.doc}>
                <span className={styles.tipo}>{doc.tipoProcesso}</span>
                <span className={styles.mono}>{doc.numeroDocumento}</span>
              </span>
              <span className={styles.importador}>{doc.importador}</span>
            </div>
            <span className={styles.dta}>
              <span className={styles.caption}>DTA</span>
              <span className={styles.mono}>{doc.dta}</span>
            </span>
            <span className={styles.modal}>
              <ModalTag modal={doc.modal} />
            </span>
            <time className={styles.date} dateTime={doc.enviadoEm}>
              {formatDateTime(doc.enviadoEm)}
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
