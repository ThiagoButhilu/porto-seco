import { useQuery } from '@tanstack/react-query';
import { repositories } from '@/infra/container';

export function useDta(number: string | null) {
  return useQuery({
    queryKey: ['dta', number],
    queryFn: () => repositories.dta.findByNumber(number!),
    enabled: Boolean(number),
    staleTime: 5 * 60_000,
  });
}

export function useCustomsBrokers() {
  return useQuery({
    queryKey: ['customs-brokers'],
    queryFn: () => repositories.customsBroker.list(),
    staleTime: Infinity,
  });
}
