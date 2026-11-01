'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { EndorsedDocument, UploadedFile } from '@/domain/entities';
import { unmask } from '@/domain/validation/masks';
import { LIMITS } from '@/domain/validation/schemas';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Alert, Button, Card, EmptyState, Icon, PageHeader, Spinner } from '@/shared/ui';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentsTable, DocumentsTableSkeleton } from './DocumentsTable';
import { FileViewer } from './FileViewer';
import styles from './DocumentsPage.module.scss';

export function DocumentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const term = useDebouncedValue(query.trim());
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useDocuments(term);
  const [viewing, setViewing] = useState<{ file: UploadedFile; document: EndorsedDocument } | null>(null);

  // Keeps the search in the URL (shareable and preserved when navigating back)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) params.set('q', term);
    else params.delete('q');
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const invalidTerm = query.length > 0 && unmask(query).length === 0;

  return (
    <>
      <PageHeader
        title="Consulta de documentos"
        description="Localize averbações enviadas pelo número da DTA, da DUIMP ou da DI. Visualize ou baixe os arquivos anexados."
      />

      <Card padding="md" className={styles.searchCard}>
        <form role="search" className={styles.search} onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="document-search" className={styles.srOnly}>
            Buscar por DTA, DUIMP ou DI
          </label>
          <Icon name="search" size={20} className={styles.searchIcon} />
          <input
            id="document-search"
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por DTA, DUIMP ou DI"
            value={query}
            maxLength={LIMITS.SEARCH}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="search-help"
          />
          {isFetching && !isPending && <Spinner size={16} label="Atualizando resultados" />}
          {query && (
            <button type="button" className={styles.clear} onClick={() => setQuery('')} aria-label="Limpar busca">
              <Icon name="x" size={16} />
            </button>
          )}
        </form>
        <p id="search-help" className={styles.help}>
          {invalidTerm
            ? 'Digite números ou letras do documento. Pontuação é opcional.'
            : 'Ex.: 25/0412387-3 ou 26BR0000123456-7. Pontuação é opcional e parte do número já basta.'}
        </p>
      </Card>

      {isPending ? (
        <DocumentsTableSkeleton />
      ) : isError ? (
        <Alert
          tone="danger"
          title="Não foi possível carregar os documentos"
          action={
            <Button size="sm" variant="secondary" icon="refresh" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        >
          {error.message}
        </Alert>
      ) : data.length === 0 ? (
        <Card>
          {term ? (
            <EmptyState
              icon="search"
              title="Nenhum documento encontrado"
              description={
                <>
                  Não há averbações com DTA, DUIMP ou DI contendo <strong>“{term}”</strong>. Confira o número
                  digitado.
                </>
              }
              action={
                <Button variant="secondary" onClick={() => setQuery('')}>
                  Limpar busca
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="Nenhum documento enviado"
              description="As averbações enviadas aparecerão aqui."
            />
          )}
        </Card>
      ) : (
        <section aria-labelledby="results-title" className={isPlaceholderData ? styles.stale : undefined}>
          <h2 id="results-title" className={styles.resultCount} aria-live="polite">
            {data.length} documento{data.length > 1 ? 's' : ''}
            {term ? ` para “${term}”` : ' enviados'}
          </h2>
          <DocumentsTable documents={data} onView={(file, document) => setViewing({ file, document })} />
        </section>
      )}

      <FileViewer
        file={viewing?.file ?? null}
        document={viewing?.document ?? null}
        onClose={() => setViewing(null)}
      />
    </>
  );
}
