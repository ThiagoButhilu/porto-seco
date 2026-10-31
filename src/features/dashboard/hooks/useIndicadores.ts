import { useQuery } from '@tanstack/react-query';
import { repositories } from '@/infra/container';

export function useIndicadores() {
  return useQuery({
    queryKey: ['dashboard', 'indicadores'],
    queryFn: () => repositories.dashboard.obterIndicadores(),
    // Enquanto houver documentos em processamento, mantém os números atualizados
    refetchInterval: (query) => ((query.state.data?.processando ?? 0) > 0 ? 5000 : false),
  });
}
