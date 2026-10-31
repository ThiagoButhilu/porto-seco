import { create } from 'zustand';
import { enviarAverbacao, type EtapaEnvio } from '@/application/averbacao/enviarAverbacao';
import type { NovaAverbacao } from '@/domain/entities';
import { repositories } from '@/infra/container';

export interface Envio {
  id: string;
  remoteId?: string;
  etapa: EtapaEnvio;
  mensagem?: string;
  dta: string;
  importador: string;
  tipoProcesso: NovaAverbacao['tipoProcesso'];
  numeroDocumento: string;
  criadoEm: string;
  atualizadoEm: string;
  tentativas: number;
  /** Mantido em memória para permitir "tentar novamente" sem redigitar nada. */
  payload: NovaAverbacao;
}

interface EnviosState {
  envios: Envio[];
  iniciar: (payload: NovaAverbacao, importador: string) => string;
  tentarNovamente: (id: string) => void;
  remover: (id: string) => void;
  limparFinalizados: () => void;
}

export const isFinalizado = (envio: Envio) => envio.etapa === 'CONCLUIDO' || envio.etapa === 'ERRO';

/**
 * Fila de envios da sessão. Cada envio roda de forma independente (fire-and-forget),
 * fora do ciclo de vida dos componentes: trocar de tela não cancela nada, um envio
 * lento não bloqueia o próximo e uma falha fica isolada no próprio item.
 */
export const useEnviosStore = create<EnviosState>((set, get) => {
  const atualizar = (id: string, patch: Partial<Envio>) =>
    set({
      envios: get().envios.map((envio) =>
        envio.id === id ? { ...envio, ...patch, atualizadoEm: new Date().toISOString() } : envio,
      ),
    });

  const executar = (id: string) => {
    const envio = get().envios.find((e) => e.id === id);
    if (!envio) return;
    void enviarAverbacao(repositories.averbacao, envio.payload, ({ etapa, remoteId, mensagem }) =>
      atualizar(id, { etapa, remoteId, mensagem }),
    );
  };

  return {
    envios: [],

    iniciar: (payload, importador) => {
      const agora = new Date().toISOString();
      const id = crypto.randomUUID();
      const envio: Envio = {
        id,
        etapa: 'ENVIANDO',
        dta: payload.dta,
        importador,
        tipoProcesso: payload.tipoProcesso,
        numeroDocumento: payload.tipoProcesso === 'DUIMP' ? payload.numeroDuimp : payload.numeroDi,
        criadoEm: agora,
        atualizadoEm: agora,
        tentativas: 1,
        payload,
      };
      set({ envios: [envio, ...get().envios] });
      executar(id);
      return id;
    },

    tentarNovamente: (id) => {
      const envio = get().envios.find((e) => e.id === id);
      if (!envio || envio.etapa !== 'ERRO') return;
      atualizar(id, { etapa: 'ENVIANDO', mensagem: undefined, remoteId: undefined, tentativas: envio.tentativas + 1 });
      executar(id);
    },

    remover: (id) => set({ envios: get().envios.filter((e) => e.id !== id) }),

    limparFinalizados: () => set({ envios: get().envios.filter((e) => !isFinalizado(e)) }),
  };
});

export const useEnviosAtivos = () =>
  useEnviosStore((state) => state.envios.filter((e) => !isFinalizado(e)).length);
