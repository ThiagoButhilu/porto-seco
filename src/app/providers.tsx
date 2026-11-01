'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { ApiError } from '@/infra/http/httpClient';
import { Spinner, Toaster } from '@/shared/ui';

const MOCK_ENABLED = process.env.NEXT_PUBLIC_API_MOCKING !== 'disabled';

let mockReady: Promise<unknown> | null = null;

/** Starts MSW only once (StrictMode runs effects twice in dev). */
function startMock() {
  mockReady ??= import('@/mocks/browser').then(({ startMockApi }) => startMockApi());
  return mockReady;
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // 4xx errors are final (e.g. unknown DTA) — only network/server failures are retried
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) &&
          failureCount < 2,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [ready, setReady] = useState(!MOCK_ENABLED);

  useEffect(() => {
    if (MOCK_ENABLED) startMock().then(() => setReady(true));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {ready ? (
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
