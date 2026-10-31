import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DocumentosPage } from '@/features/documentos/components/DocumentosPage';

export const metadata: Metadata = { title: 'Consulta de documentos' };

export default function Page() {
  return (
    <Suspense>
      <DocumentosPage />
    </Suspense>
  );
}
