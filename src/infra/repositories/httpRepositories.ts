import type { NovaAverbacao } from '@/domain/entities';
import type {
  AuthRepository,
  AverbacaoRepository,
  ComissariaRepository,
  DashboardRepository,
  DocumentoRepository,
  DtaRepository,
} from '@/domain/repositories';
import { unmask } from '@/domain/validation/masks';
import type { HttpClient } from '../http/httpClient';

export const createAuthRepository = (http: HttpClient): AuthRepository => ({
  login: (email, senha) => http.post('/auth/login', { email, senha }),
});

export const createDtaRepository = (http: HttpClient): DtaRepository => ({
  buscarPorNumero: (numero) => http.get(`/dtas/${unmask(numero)}`),
});

export const createComissariaRepository = (http: HttpClient): ComissariaRepository => ({
  listar: () => http.get('/comissarias'),
});

function toFormData(dados: NovaAverbacao): FormData {
  const form = new FormData();
  form.append('dta', dados.dta);
  form.append('tipoProcesso', dados.tipoProcesso);
  form.append('comissariaId', dados.comissariaId);
  form.append('coberturaCambial', String(dados.coberturaCambial));
  if (dados.codigoReferencia) form.append('codigoReferencia', dados.codigoReferencia);
  form.append('pdf', dados.pdf);

  if (dados.tipoProcesso === 'DUIMP') {
    form.append('numeroDuimp', dados.numeroDuimp);
    form.append('chaveAcesso', dados.chaveAcesso);
  } else {
    form.append('numeroDi', dados.numeroDi);
    form.append('xml', dados.xml);
  }
  return form;
}

export const createAverbacaoRepository = (http: HttpClient): AverbacaoRepository => ({
  enviar: (dados) => http.post('/averbacoes', toFormData(dados)),
  consultarStatus: (id) => http.get(`/averbacoes/${id}/status`),
});

export const createDocumentoRepository = (http: HttpClient): DocumentoRepository => ({
  pesquisar: (termo) => http.get(`/documentos?q=${encodeURIComponent(unmask(termo))}`),
  baixarArquivo: (arquivoId) => http.blob(`/arquivos/${arquivoId}`),
});

export const createDashboardRepository = (http: HttpClient): DashboardRepository => ({
  obterIndicadores: () => http.get('/dashboard/indicadores'),
});
