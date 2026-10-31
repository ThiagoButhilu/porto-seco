import type { Metadata } from 'next';
import { AverbacaoPage } from '@/features/averbacao/components/AverbacaoPage';

export const metadata: Metadata = { title: 'Averbação' };

export default function Page() {
  return <AverbacaoPage />;
}
