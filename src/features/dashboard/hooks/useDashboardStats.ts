import { useQuery } from '@tanstack/react-query';
import { repositories } from '@/infra/container';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => repositories.dashboard.getStats(),
    // While documents are processing, keep the numbers fresh
    refetchInterval: (query) => ((query.state.data?.processing ?? 0) > 0 ? 5000 : false),
  });
}
