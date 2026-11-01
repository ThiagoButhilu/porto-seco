import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { UploadedFile } from '@/domain/entities';
import { repositories } from '@/infra/container';
import { toast } from '@/shared/ui';

export function useDocuments(term: string) {
  return useQuery({
    queryKey: ['documents', term],
    queryFn: () => repositories.document.search(term),
    placeholderData: keepPreviousData,
    // Documents being processed change status on their own — keep refreshing while any exist
    refetchInterval: (query) =>
      query.state.data?.some((d) => d.status === 'PROCESSING') ? 4000 : false,
  });
}

export function useFileContent(file: UploadedFile | null) {
  return useQuery({
    queryKey: ['file', file?.id],
    queryFn: () => repositories.document.downloadFile(file!.id),
    enabled: Boolean(file),
    staleTime: Infinity,
    gcTime: 60_000,
  });
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function useFileDownload() {
  return useMutation({
    mutationFn: async (file: UploadedFile) => {
      const blob = await repositories.document.downloadFile(file.id);
      saveBlob(blob, file.name);
    },
    onError: (error, file) => toast.error(`Falha ao baixar ${file.name}`, error.message),
  });
}
