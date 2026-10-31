import type { DocumentoAverbado, StatusProcessamento } from '@/domain/entities';
import { gerarDocumentosIniciais } from './data/seed';

/** Registro interno: o resultado do processamento é sorteado no envio e revelado em `processarEm`. */
export interface Registro extends DocumentoAverbado {
  processarEm?: number;
  resultado?: { status: StatusProcessamento; mensagemErro?: string };
}

const STORAGE_KEY = 'porto-seco:mock-db:v1';

function load(): Registro[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Registro[];
  } catch {
    /* storage indisponível: segue com a massa inicial */
  }
  return gerarDocumentosIniciais();
}

let registros: Registro[] | null = null;

function all(): Registro[] {
  registros ??= load();
  return registros;
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
  } catch {
    /* sem persistência — os dados ficam apenas em memória */
  }
}

/** Aplica o resultado do processamento quando o tempo simulado já passou. */
function resolverStatus(registro: Registro): Registro {
  if (registro.status === 'PROCESSANDO' && registro.processarEm && Date.now() >= registro.processarEm) {
    registro.status = registro.resultado?.status ?? 'CONCLUIDO';
    registro.mensagemErro = registro.resultado?.mensagemErro;
    persist();
  }
  return registro;
}

function semCamposInternos({ processarEm: _p, resultado: _r, ...documento }: Registro): DocumentoAverbado {
  return documento;
}

export const db = {
  listar(): DocumentoAverbado[] {
    return all().map(resolverStatus).map(semCamposInternos);
  },
  obter(id: string): Registro | undefined {
    const registro = all().find((r) => r.id === id);
    return registro && resolverStatus(registro);
  },
  inserir(registro: Registro) {
    all().unshift(registro);
    persist();
  },
  encontrarArquivo(arquivoId: string) {
    for (const registro of all()) {
      const arquivo = registro.arquivos.find((a) => a.id === arquivoId);
      if (arquivo) return { arquivo, documento: semCamposInternos(registro) };
    }
    return undefined;
  },
};
