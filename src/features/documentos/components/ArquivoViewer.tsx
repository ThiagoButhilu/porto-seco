'use client';

import { useEffect, useState } from 'react';
import type { ArquivoEnviado, DocumentoAverbado } from '@/domain/entities';
import { formatBytes } from '@/shared/lib/format';
import { Alert, Button, Modal, Spinner } from '@/shared/ui';
import { salvarBlob, useArquivoConteudo } from '../hooks/useDocumentos';
import styles from './ArquivoViewer.module.scss';

interface ArquivoViewerProps {
  arquivo: ArquivoEnviado | null;
  documento: DocumentoAverbado | null;
  onClose: () => void;
}

export function ArquivoViewer({ arquivo, documento, onClose }: ArquivoViewerProps) {
  const { data: blob, isPending, isError, error, refetch } = useArquivoConteudo(arquivo);
  const [url, setUrl] = useState<string | null>(null);
  const [texto, setTexto] = useState<string | null>(null);

  useEffect(() => {
    if (!blob || !arquivo) return;
    if (arquivo.tipo === 'XML') {
      void blob.text().then(setTexto);
      return;
    }
    const objectUrl = URL.createObjectURL(blob);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
      setUrl(null);
    };
  }, [blob, arquivo]);

  useEffect(() => {
    if (!arquivo) setTexto(null);
  }, [arquivo]);

  return (
    <Modal
      open={Boolean(arquivo)}
      onClose={onClose}
      size="lg"
      title={arquivo?.nome}
      subtitle={
        arquivo &&
        documento &&
        `${documento.tipoProcesso} ${documento.numeroDocumento} · DTA ${documento.dta} · ${formatBytes(arquivo.tamanho)}`
      }
      actions={
        <Button
          size="sm"
          variant="secondary"
          icon="download"
          disabled={!blob}
          onClick={() => blob && arquivo && salvarBlob(blob, arquivo.nome)}
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
        ) : arquivo?.tipo === 'XML' ? (
          <pre className={styles.code}>
            <code>{texto}</code>
          </pre>
        ) : (
          url && <iframe className={styles.frame} src={url} title={`Visualização de ${arquivo?.nome}`} />
        )}
      </div>
    </Modal>
  );
}
