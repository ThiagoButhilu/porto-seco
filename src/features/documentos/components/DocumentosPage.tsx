'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ArquivoEnviado, DocumentoAverbado } from '@/domain/entities';
import { unmask } from '@/domain/validation/masks';
import { LIMITES } from '@/domain/validation/schemas';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { Alert, Button, Card, EmptyState, Icon, PageHeader, Spinner } from '@/shared/ui';
import { useDocumentos } from '../hooks/useDocumentos';
import { ArquivoViewer } from './ArquivoViewer';
import { DocumentosTable, DocumentosTableSkeleton } from './DocumentosTable';
import styles from './DocumentosPage.module.scss';

export function DocumentosPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get('q') ?? '');
  const termo = useDebouncedValue(busca.trim());
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } = useDocumentos(termo);
  const [visualizando, setVisualizando] = useState<{ arquivo: ArquivoEnviado; documento: DocumentoAverbado } | null>(null);

  // Mantém a busca na URL (compartilhável e preservada ao voltar)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (termo) params.set('q', termo);
    else params.delete('q');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termo]);

  const termoInvalido = busca.length > 0 && unmask(busca).length === 0;

  return (
    <>
      <PageHeader
        title="Consulta de documentos"
        description="Localize averbações enviadas pelo número da DTA, da DUIMP ou da DI. Visualize ou baixe os arquivos anexados."
      />

      <Card padding="md" className={styles.searchCard}>
        <form role="search" className={styles.search} onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="busca-documentos" className={styles.srOnly}>
            Buscar por DTA, DUIMP ou DI
          </label>
          <Icon name="search" size={20} className={styles.searchIcon} />
          <input
            id="busca-documentos"
            type="search"
            className={styles.searchInput}
            placeholder="Buscar por DTA, DUIMP ou DI"
            value={busca}
            maxLength={LIMITES.BUSCA}
            onChange={(e) => setBusca(e.target.value.toUpperCase())}
            autoComplete="off"
            spellCheck={false}
            aria-describedby="busca-ajuda"
          />
          {isFetching && !isPending && <Spinner size={16} label="Atualizando resultados" />}
          {busca && (
            <button type="button" className={styles.clear} onClick={() => setBusca('')} aria-label="Limpar busca">
              <Icon name="x" size={16} />
            </button>
          )}
        </form>
        <p id="busca-ajuda" className={styles.help}>
          {termoInvalido
            ? 'Digite números ou letras do documento. Pontuação é opcional.'
            : 'Ex.: 25/0412387-3 ou 26BR0000123456-7. Pontuação é opcional e parte do número já basta.'}
        </p>
      </Card>

      {isPending ? (
        <DocumentosTableSkeleton />
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
          {termo ? (
            <EmptyState
              icon="search"
              title="Nenhum documento encontrado"
              description={
                <>
                  Não há averbações com DTA, DUIMP ou DI contendo <strong>“{termo}”</strong>. Confira o número
                  digitado.
                </>
              }
              action={
                <Button variant="secondary" onClick={() => setBusca('')}>
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
        <section aria-labelledby="resultados-titulo" className={isPlaceholderData ? styles.stale : undefined}>
          <h2 id="resultados-titulo" className={styles.resultCount} aria-live="polite">
            {data.length} documento{data.length > 1 ? 's' : ''}
            {termo ? ` para “${termo}”` : ' enviados'}
          </h2>
          <DocumentosTable
            documentos={data}
            onVisualizar={(arquivo, documento) => setVisualizando({ arquivo, documento })}
          />
        </section>
      )}

      <ArquivoViewer
        arquivo={visualizando?.arquivo ?? null}
        documento={visualizando?.documento ?? null}
        onClose={() => setVisualizando(null)}
      />
    </>
  );
}
