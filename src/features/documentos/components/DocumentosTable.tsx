import type { ArquivoEnviado, DocumentoAverbado } from '@/domain/entities';
import { ModalTag } from '@/shared/components/ModalTag';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { formatDate, formatTime } from '@/shared/lib/format';
import { Card, Skeleton } from '@/shared/ui';
import { ArquivoItem } from './ArquivoItem';
import styles from './DocumentosTable.module.scss';

interface DocumentosTableProps {
  documentos: DocumentoAverbado[];
  onVisualizar: (arquivo: ArquivoEnviado, documento: DocumentoAverbado) => void;
}

/**
 * Tabela semântica que, abaixo de 1024px, vira lista de cartões via CSS
 * (cada célula exibe seu rótulo com `data-label`) — uma única marcação para todos os tamanhos.
 */
export function DocumentosTable({ documentos, onVisualizar }: DocumentosTableProps) {
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
          {documentos.map((doc) => (
            <tr key={doc.id}>
              <td data-label="DTA" className={styles.dta}>
                <span className={styles.mono}>{doc.dta}</span>
              </td>
              <td data-label={doc.tipoProcesso} className={styles.documento}>
                <span className={styles.tipo}>{doc.tipoProcesso}</span>
                <span className={styles.mono}>{doc.numeroDocumento}</span>
              </td>
              <td data-label="Importador" className={styles.importador}>
                <span title={doc.importador}>{doc.importador}</span>
              </td>
              <td data-label="Envio" className={styles.nowrap}>
                <time dateTime={doc.enviadoEm}>
                  {formatDate(doc.enviadoEm)}
                  <span className={styles.muted}> {formatTime(doc.enviadoEm)}</span>
                </time>
              </td>
              <td data-label="Origem">{doc.paisOrigem}</td>
              <td data-label="Modal">
                <ModalTag modal={doc.modal} />
              </td>
              <td data-label="Conhecimento">
                <span className={styles.mono}>{doc.numeroConhecimento}</span>
              </td>
              <td data-label="Status" className={styles.status}>
                <StatusBadge status={doc.status} />
                {doc.mensagemErro && <span className={styles.erro}>{doc.mensagemErro}</span>}
              </td>
              <td data-label="Arquivos" className={styles.arquivos}>
                <ul>
                  {doc.arquivos.map((arquivo) => (
                    <li key={arquivo.id}>
                      <ArquivoItem arquivo={arquivo} onVisualizar={() => onVisualizar(arquivo, doc)} />
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

export function DocumentosTableSkeleton() {
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
