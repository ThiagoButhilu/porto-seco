import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { ArquivoEnviado } from '@/domain/entities';
import { repositories } from '@/infra/container';
import { toast } from '@/shared/ui';

export function useDocumentos(termo: string) {
  return useQuery({
    queryKey: ['documentos', termo],
    queryFn: () => repositories.documento.pesquisar(termo),
    placeholderData: keepPreviousData,
    // Documentos em processamento mudam de status sozinhos — atualiza enquanto existirem
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === 'PROCESSANDO') ? 4000 : false,
  });
}

export function useArquivoConteudo(arquivo: ArquivoEnviado | null) {
  return useQuery({
    queryKey: ['arquivo', arquivo?.id],
    queryFn: () => repositories.documento.baixarArquivo(arquivo!.id),
    enabled: Boolean(arquivo),
    staleTime: Infinity,
    gcTime: 60_000,
  });
}

export function salvarBlob(blob: Blob, nome: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function useDownloadArquivo() {
  return useMutation({
    mutationFn: async (arquivo: ArquivoEnviado) => {
      const blob = await repositories.documento.baixarArquivo(arquivo.id);
      salvarBlob(blob, arquivo.nome);
    },
    onError: (error, arquivo) => toast.error(`Falha ao baixar ${arquivo.nome}`, error.message),
  });
}
