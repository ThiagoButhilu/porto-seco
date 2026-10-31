import Link from 'next/link';
import { EmptyState } from '@/shared/ui';

export default function NotFound() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 16 }}>
      <EmptyState
        icon="search"
        title="Página não encontrada"
        description="O endereço acessado não existe ou foi movido."
        action={<Link href="/dashboard">Voltar ao dashboard</Link>}
      />
    </main>
  );
}
