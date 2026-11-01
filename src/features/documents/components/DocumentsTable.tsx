import type { EndorsedDocument, UploadedFile } from '@/domain/entities';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { TransportModeTag } from '@/shared/components/TransportModeTag';
import { formatDate, formatTime } from '@/shared/lib/format';
import { Card, Skeleton } from '@/shared/ui';
import { FileItem } from './FileItem';
import styles from './DocumentsTable.module.scss';

interface DocumentsTableProps {
  documents: EndorsedDocument[];
  onView: (file: UploadedFile, document: EndorsedDocument) => void;
}

/**
 * Semantic table that turns into a card list below 1024px via CSS
 * (each cell shows its label through `data-label`) — a single markup for every size.
 */
export function DocumentsTable({ documents, onView }: DocumentsTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">DTA</th>
            <th scope="col">DUIMP / DI</th>
            <th scope="col">Importador</th>
            <th scope="col">Envio</th>
            <th scope="col">Origem</th>
            <th scope="col">Modal</th>
            <th scope="col">Conhecimento</th>
            <th scope="col">Status</th>
            <th scope="col">Arquivos</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td data-label="DTA" className={styles.dta}>
                <span className={styles.mono}>{doc.dta}</span>
              </td>
              <td data-label={doc.processType} className={styles.documentNumber}>
                <span className={styles.processType}>{doc.processType}</span>
                <span className={styles.mono}>{doc.documentNumber}</span>
              </td>
              <td data-label="Importador" className={styles.importer}>
                <span title={doc.importer}>{doc.importer}</span>
              </td>
              <td data-label="Envio" className={styles.nowrap}>
                <time dateTime={doc.submittedAt}>
                  {formatDate(doc.submittedAt)}
                  <span className={styles.muted}> {formatTime(doc.submittedAt)}</span>
                </time>
              </td>
              <td data-label="Origem">{doc.originCountry}</td>
              <td data-label="Modal">
                <TransportModeTag mode={doc.transportMode} />
              </td>
              <td data-label="Conhecimento">
                <span className={styles.mono}>{doc.billOfLadingNumber}</span>
              </td>
              <td data-label="Status" className={styles.status}>
                <StatusBadge status={doc.status} />
                {doc.errorMessage && <span className={styles.errorMessage}>{doc.errorMessage}</span>}
              </td>
              <td data-label="Arquivos" className={styles.files}>
                <ul>
                  {doc.files.map((file) => (
                    <li key={file.id}>
                      <FileItem file={file} onView={() => onView(file, doc)} />
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocumentsTableSkeleton() {
  return (
    <Card padding="none" aria-busy="true" aria-label="Carregando documentos">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton width={110} />
          <Skeleton width={150} />
          <Skeleton width="30%" />
          <Skeleton width={80} />
          <Skeleton width={90} height={22} radius={999} />
        </div>
      ))}
    </Card>
  );
}
