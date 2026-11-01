import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DocumentsPage } from '@/features/documents/components/DocumentsPage';

export const metadata: Metadata = { title: 'Consulta de documentos' };

export default function Page() {
  return (
    <Suspense>
      <DocumentsPage />
    </Suspense>
  );
}
