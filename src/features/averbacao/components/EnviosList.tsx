'use client';

import clsx from 'clsx';
import type { EtapaEnvio } from '@/application/averbacao/enviarAverbacao';
import { formatTime } from '@/shared/lib/format';
import { Button, EmptyState, Icon, Spinner } from '@/shared/ui';
import { isFinalizado, useEnviosStore, type Envio } from '../store/enviosStore';
import styles from './EnviosList.module.scss';

const ETAPAS: { etapa: EtapaEnvio; label: string }[] = [
  { etapa: 'ENVIANDO', label: 'Enviando' },
  { etapa: 'PROCESSANDO', label: 'Processando' },
  { etapa: 'CONCLUIDO', label: 'Concluído' },
];

const STATUS_TEXTO: Record<EtapaEnvio, string> = {
  ENVIANDO: 'Enviando arquivos…',
  PROCESSANDO: 'Em processamento no recinto…',
  CONCLUIDO: 'Averbação concluída',
  ERRO: 'Falha no envio',
};

function indiceEtapa(envio: Envio) {
  if (envio.etapa === 'ERRO') return envio.remoteId ? 1 : 0;
  return ETAPAS.findIndex((e) => e.etapa === envio.etapa);
}

function EnvioItem({ envio }: { envio: Envio }) {
  const tentarNovamente = useEnviosStore((state) => state.tentarNovamente);
  const remover = useEnviosStore((state) => state.remover);
  const atual = indiceEtapa(envio);
  const erro = envio.etapa === 'ERRO';

  return (
    <li className={clsx(styles.item, styles[envio.etapa.toLowerCase()])}>
      <div className={styles.head}>
        <span className={styles.statusIcon} aria-hidden>
          {isFinalizado(envio) ? (
            <Icon name={erro ? 'alert' : 'check'} size={16} />
          ) : (
            <Spinner size={14} />
          )}
        </span>
        <div className={styles.headText}>
          <p className={styles.doc}>
            <span className={styles.tipo}>{envio.tipoProcesso}</span>
            <span className={styles.mono}>{envio.numeroDocumento}</span>
          </p>
          <p className={styles.meta}>
            DTA <span className={styles.mono}>{envio.dta}</span> · {envio.importador}
          </p>
        </div>
        <time className={styles.time} dateTime={envio.atualizadoEm}>
          {formatTime(envio.criadoEm)}
        </time>
      </div>

      <ol className={styles.steps} aria-label="Progresso do envio">
        {ETAPAS.map((etapa, index) => {
          const estado =
            index < atual || envio.etapa === 'CONCLUIDO'
              ? 'done'
              : index === atual
                ? erro
                  ? 'failed'
                  : 'current'
                : 'todo';
          return (
            <li key={etapa.etapa} className={clsx(styles.step, styles[estado])}>
              <span className={styles.stepBar} />
              <span className={styles.stepLabel}>{etapa.label}</span>
            </li>
          );
        })}
      </ol>

      <p className={styles.statusText} role={erro ? 'alert' : 'status'}>
        <strong>{STATUS_TEXTO[envio.etapa]}</strong>
        {envio.mensagem && <span> — {envio.mensagem}</span>}
        {envio.tentativas > 1 && !erro && <span> (tentativa {envio.tentativas})</span>}
      </p>

      {isFinalizado(envio) && (
        <div className={styles.actions}>
          {erro && (
            <Button size="sm" variant="secondary" icon="refresh" onClick={() => tentarNovamente(envio.id)}>
              Tentar novamente
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => remover(envio.id)}>
            Remover da lista
          </Button>
        </div>
      )}
    </li>
  );
}

export function EnviosList() {
  const envios = useEnviosStore((state) => state.envios);
  const limparFinalizados = useEnviosStore((state) => state.limparFinalizados);
  const finalizados = envios.filter(isFinalizado).length;
  const ativos = envios.length - finalizados;

  if (envios.length === 0) {
    return (
      <EmptyState
        icon="layers"
        title="Nenhum envio nesta sessão"
        description="Os envios aparecem aqui assim que você os iniciar. Você pode continuar trabalhando enquanto eles são processados."
      />
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.summary}>
        <span>
          <strong>{ativos}</strong> em andamento · <strong>{finalizados}</strong> finalizado
          {finalizados === 1 ? '' : 's'}
        </span>
        {finalizados > 0 && (
          <Button size="sm" variant="ghost" icon="trash" onClick={limparFinalizados}>
            Limpar finalizados
          </Button>
        )}
      </div>
      <ul className={styles.list} aria-live="polite">
        {envios.map((envio) => (
          <EnvioItem key={envio.id} envio={envio} />
        ))}
      </ul>
    </div>
  );
}
