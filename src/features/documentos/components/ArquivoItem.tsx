'use client';

import type { ArquivoEnviado } from '@/domain/entities';
import { formatBytes } from '@/shared/lib/format';
import { Button } from '@/shared/ui';
import { useDownloadArquivo } from '../hooks/useDocumentos';
import styles from './ArquivoItem.module.scss';

interface ArquivoItemProps {
  arquivo: ArquivoEnviado;
  onVisualizar: () => void;
}

export function ArquivoItem({ arquivo, onVisualizar }: ArquivoItemProps) {
  const download = useDownloadArquivo();

  return (
    <div className={styles.item}>
      <span className={styles.tag} data-tipo={arquivo.tipo}>
        {arquivo.tipo}
      </span>
      <span className={styles.info}>
        <span className={styles.nome} title={arquivo.nome}>
          {arquivo.nome}
        </span>
        <span className={styles.tamanho}>{formatBytes(arquivo.tamanho)}</span>
      </span>
      <span className={styles.actions}>
        <Button
          size="sm"
          variant="ghost"
          icon="eye"
          iconOnly
          aria-label={`Visualizar ${arquivo.nome}`}
          title="Visualizar"
          onClick={onVisualizar}
        />
        <Button
          size="sm"
          variant="ghost"
          icon="download"
          iconOnly
          aria-label={`Baixar ${arquivo.nome}`}
          title="Baixar"
          loading={download.isPending}
          onClick={() => download.mutate(arquivo)}
        />
      </span>
    </div>
  );
}
