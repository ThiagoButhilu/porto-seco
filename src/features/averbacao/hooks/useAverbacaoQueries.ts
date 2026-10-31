import { useQuery } from '@tanstack/react-query';
import { repositories } from '@/infra/container';

export function useDta(numero: string | null) {
  return useQuery({
    queryKey: ['dta', numero],
    queryFn: () => repositories.dta.buscarPorNumero(numero!),
    enabled: Boolean(numero),
    staleTime: 5 * 60_000,
  });
}

export function useComissarias() {
  return useQuery({
    queryKey: ['comissarias'],
    queryFn: () => repositories.comissaria.listar(),
    staleTime: Infinity,
  });
}
