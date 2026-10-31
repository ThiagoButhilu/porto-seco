import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from '@/shared/ui';
import { useEnviosStore, type Envio } from '../store/enviosStore';

/**
 * Observa a fila: quando um envio termina, notifica o usuário (em qualquer tela)
 * e invalida os dados que dependem dele (dashboard e consulta).
 */
export function useEnviosNotificacoes() {
  const queryClient = useQueryClient();
  const anteriores = useRef(new Map<string, Envio['etapa']>());

  useEffect(
    () =>
      useEnviosStore.subscribe(({ envios }) => {
        for (const envio of envios) {
          const etapaAnterior = anteriores.current.get(envio.id);
          anteriores.current.set(envio.id, envio.etapa);
          if (etapaAnterior === envio.etapa) continue;

          const ref = `${envio.tipoProcesso} ${envio.numeroDocumento}`;
          if (envio.etapa === 'CONCLUIDO') {
            toast.success('Averbação concluída', `${ref} · DTA ${envio.dta}`);
          } else if (envio.etapa === 'ERRO') {
            toast.error('Falha na averbação', `${ref} · ${envio.mensagem ?? 'Tente novamente.'}`);
          }
          if (envio.etapa === 'PROCESSANDO' || envio.etapa === 'CONCLUIDO' || envio.etapa === 'ERRO') {
            void queryClient.invalidateQueries({ queryKey: ['documentos'] });
            void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          }
        }
      }),
    [queryClient],
  );
}
