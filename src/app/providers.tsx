'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { ApiError } from '@/infra/http/httpClient';
import { Spinner, Toaster } from '@/shared/ui';

const MOCK_ATIVO = process.env.NEXT_PUBLIC_API_MOCKING !== 'disabled';

let workerPronto: Promise<unknown> | null = null;

/** Inicia o MSW uma única vez (StrictMode monta efeitos duas vezes em dev). */
function iniciarMock() {
  workerPronto ??= import('@/mocks/browser').then(({ iniciarMockApi }) => iniciarMockApi());
  return workerPronto;
}

function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Erros 4xx são definitivos (ex.: DTA inexistente) — só repetimos falhas de rede/servidor
        retry: (falhas, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && falhas < 2,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(criarQueryClient);
  const [pronto, setPronto] = useState(!MOCK_ATIVO);

  useEffect(() => {
    if (MOCK_ATIVO) iniciarMock().then(() => setPronto(true));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {pronto ? (
        children
      ) : (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', color: 'var(--color-brand-700)' }}>
          <Spinner size={28} label="Carregando aplicação" />
        </div>
      )}
      <Toaster />
    </QueryClientProvider>
  );
}
