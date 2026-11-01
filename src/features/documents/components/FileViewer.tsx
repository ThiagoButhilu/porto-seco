'use client';

import { useEffect, useState } from 'react';
import type { EndorsedDocument, UploadedFile } from '@/domain/entities';
import { formatBytes } from '@/shared/lib/format';
import { Alert, Button, Modal, Spinner } from '@/shared/ui';
import { saveBlob, useFileContent } from '../hooks/useDocuments';
import styles from './FileViewer.module.scss';

interface FileViewerProps {
  file: UploadedFile | null;
  document: EndorsedDocument | null;
  onClose: () => void;
}

export function FileViewer({ file, document, onClose }: FileViewerProps) {
  const { data: blob, isPending, isError, error, refetch } = useFileContent(file);
  const [url, setUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (!blob || !file) return;
    if (file.type === 'XML') {
      void blob.text().then(setText);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [blob, file]);

  useEffect(() => {
    if (!file) setText(null);
  }, [file]);

  return (
    <Modal
      open={Boolean(file)}
      onClose={onClose}
      size="lg"
      title={file?.name}
      subtitle={
        file &&
        document &&
        `${document.processType} ${document.documentNumber} · DTA ${document.dta} · ${formatBytes(file.size)}`
      }
      actions={
        <Button
          size="sm"
          variant="secondary"
          icon="download"
          disabled={!blob}
          onClick={() => blob && file && saveBlob(blob, file.name)}
        >
          Baixar
        </Button>
      }
    >
      <div className={styles.viewer}>
        {isPending ? (
          <div className={styles.center}>
            <Spinner size={24} label="Carregando arquivo" />
            <span>Carregando arquivo…</span>
          </div>
        ) : isError ? (
          <div className={styles.center}>
            <Alert
              tone="danger"
              title="Não foi possível abrir o arquivo"
              action={
                <Button size="sm" variant="secondary" icon="refresh" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              }
            >
              {error.message}
            </Alert>
          </div>
        ) : file?.type === 'XML' ? (
          <pre className={styles.code}>
            <code>{text}</code>
          </pre>
        ) : (
          url && <iframe className={styles.frame} src={url} title={`Visualização de ${file?.name}`} />
        )}
      </div>
    </Modal>
  );
}
