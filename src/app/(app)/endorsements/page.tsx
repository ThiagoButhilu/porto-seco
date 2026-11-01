import type { Metadata } from 'next';
import { EndorsementPage } from '@/features/endorsement/components/EndorsementPage';

export const metadata: Metadata = { title: 'Averbação' };

export default function Page() {
  return <EndorsementPage />;
}
