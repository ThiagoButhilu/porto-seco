import type { NovaAverbacao, StatusAverbacao } from '@/domain/entities';
import type { AverbacaoRepository } from '@/domain/repositories';

export type EtapaEnvio = 'ENVIANDO' | 'PROCESSANDO' | 'CONCLUIDO' | 'ERRO';

export interface AtualizacaoEnvio {
  etapa: EtapaEnvio;
  remoteId?: string;
  mensagem?: string;
}

interface Opcoes {
  intervaloMs?: number;
  timeoutMs?: number;
  /** Falhas de rede consecutivas toleradas durante o polling. */
  tentativasStatus?: number;
}

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Caso de uso: envia a averbação e acompanha o processamento assíncrono
 * (POST → 202 → polling de status). Não conhece React nem estado global:
 * apenas reporta cada etapa via `onAtualizacao`. Nunca lança — falhas viram etapa `ERRO`,
 * o que garante que um envio com problema não interrompe os demais.
 */
export async function enviarAverbacao(
  repository: AverbacaoRepository,
  dados: NovaAverbacao,
  onAtualizacao: (atualizacao: AtualizacaoEnvio) => void,
  { intervaloMs = 1500, timeoutMs = 90_000, tentativasStatus = 3 }: Opcoes = {},
): Promise<void> {
  onAtualizacao({ etapa: 'ENVIANDO' });

  let recebido: StatusAverbacao;
  try {
    recebido = await repository.enviar(dados);
  } catch (error) {
    onAtualizacao({ etapa: 'ERRO', mensagem: mensagemDe(error) });
    return;
  }

  const remoteId = recebido.id;
  onAtualizacao({ etapa: 'PROCESSANDO', remoteId });

  const limite = Date.now() + timeoutMs;
  let falhasSeguidas = 0;

  while (Date.now() < limite) {
    await esperar(intervaloMs);
    try {
      const { status, mensagemErro } = await repository.consultarStatus(remoteId);
      falhasSeguidas = 0;
      if (status === 'CONCLUIDO') return onAtualizacao({ etapa: 'CONCLUIDO', remoteId });
      if (status === 'ERRO') return onAtualizacao({ etapa: 'ERRO', remoteId, mensagem: mensagemErro });
    } catch (error) {
      if (++falhasSeguidas >= tentativasStatus) {
        return onAtualizacao({ etapa: 'ERRO', remoteId, mensagem: mensagemDe(error) });
      }
    }
  }

  onAtualizacao({
    etapa: 'ERRO',
    remoteId,
    mensagem: 'Tempo de processamento excedido. Consulte o documento mais tarde.',
  });
}

const mensagemDe = (error: unknown) =>
  error instanceof Error ? error.message : 'Falha inesperada no envio.';
