'use client';

import type { UploadedFile } from '@/domain/entities';
import { formatBytes } from '@/shared/lib/format';
import { Button } from '@/shared/ui';
import { useFileDownload } from '../hooks/useDocuments';
import styles from './FileItem.module.scss';

interface FileItemProps {
  file: UploadedFile;
  onView: () => void;
}

export function FileItem({ file, onView }: FileItemProps) {
  const download = useFileDownload();

  return (
    <div className={styles.item}>
      <span className={styles.tag} data-type={file.type}>
        {file.type}
      </span>
      <span className={styles.info}>
        <span className={styles.name} title={file.name}>
          {file.name}
        </span>
        <span className={styles.size}>{formatBytes(file.size)}</span>
      </span>
      <span className={styles.actions}>
        <Button
          size="sm"
          variant="ghost"
          icon="eye"
          iconOnly
          aria-label={`Visualizar ${file.name}`}
          title="Visualizar"
          onClick={onView}
        />
        <Button
          size="sm"
          variant="ghost"
          icon="download"
          iconOnly
          aria-label={`Baixar ${file.name}`}
          title="Baixar"
          loading={download.isPending}
          onClick={() => download.mutate(file)}
        />
      </span>
    </div>
  );
}
