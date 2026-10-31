import { delay, http, HttpResponse } from 'msw';
import type {
  ArquivoEnviado,
  IndicadoresDashboard,
  StatusAverbacao,
  TipoProcesso,
} from '@/domain/entities';
import { MODAIS } from '@/domain/entities';
import { unmask } from '@/domain/validation/masks';
import { COMISSARIAS, DTAS, MENSAGENS_ERRO } from './data/seed';
import { gerarPdfExemplo, gerarXmlExemplo } from './data/sampleFiles';
import { db } from './db';
import { fileStore } from './fileStore';

const API = '/api';

const latencia = (min: number, max: number) => delay(min + Math.random() * (max - min));
const erro = (status: number, message: string, code?: string) =>
  HttpResponse.json({ message, code }, { status });

/** Código de referência contendo "FALHA" força erro no processamento (útil para demonstração). */
const FORCAR_FALHA = /FALHA/i;
const TAXA_FALHA_PROCESSAMENTO = 0.2;
const TAXA_FALHA_UPLOAD = 0.06;

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    await latencia(500, 900);
    const { email, senha } = (await request.json()) as { email: string; senha: string };
    if (senha === 'senhaerrada') return erro(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');

    const nome = email
      .split('@')[0]
      .split(/[._-]/)
      .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
      .join(' ');

    return HttpResponse.json({
      token: crypto.randomUUID(),
      usuario: { id: 'u1', nome, email, perfil: 'OPERADOR' },
    });
  }),

  http.get(`${API}/dtas/:numero`, async ({ params }) => {
    await latencia(500, 1000);
    const dta = DTAS.find((d) => unmask(d.numero) === params.numero);
    if (!dta) {
      return erro(404, 'DTA não encontrada. Confira o número informado e tente novamente.', 'DTA_NOT_FOUND');
    }
    return HttpResponse.json(dta);
  }),

  http.get(`${API}/comissarias`, async () => {
    await latencia(200, 500);
    return HttpResponse.json(COMISSARIAS);
  }),

  http.post(`${API}/averbacoes`, async ({ request }) => {
    const form = await request.formData();
    await latencia(1200, 2200); // tempo de upload

    if (Math.random() < TAXA_FALHA_UPLOAD) {
      return erro(503, 'Instabilidade na comunicação com o servidor. O envio não foi recebido.', 'UPLOAD_FAILED');
    }

    const dta = DTAS.find((d) => d.numero === form.get('dta'));
    const comissaria = COMISSARIAS.find((c) => c.id === form.get('comissariaId'));
    const tipoProcesso = form.get('tipoProcesso') as TipoProcesso;
    const pdf = form.get('pdf');
    const xml = form.get('xml');
    const numeroDocumento = String(form.get(tipoProcesso === 'DUIMP' ? 'numeroDuimp' : 'numeroDi') ?? '');

    if (!dta || !comissaria || !(pdf instanceof File) || !numeroDocumento) {
      return erro(400, 'Dados obrigatórios ausentes no envio.', 'VALIDATION_ERROR');
    }
    if (tipoProcesso === 'DI' && !(xml instanceof File)) {
      return erro(400, 'O XML da DI é obrigatório.', 'VALIDATION_ERROR');
    }

    const id = `doc-${crypto.randomUUID()}`;
    const arquivos: ArquivoEnviado[] = [{ id: `${id}-pdf`, nome: pdf.name, tipo: 'PDF', tamanho: pdf.size }];
    await fileStore.save(`${id}-pdf`, pdf);
    if (xml instanceof File) {
      arquivos.push({ id: `${id}-xml`, nome: xml.name, tipo: 'XML', tamanho: xml.size });
      await fileStore.save(`${id}-xml`, xml);
    }

    const codigoReferencia = (form.get('codigoReferencia') as string | null) ?? undefined;
    const falhou = FORCAR_FALHA.test(codigoReferencia ?? '') || Math.random() < TAXA_FALHA_PROCESSAMENTO;

    db.inserir({
      id,
      dta: dta.numero,
      tipoProcesso,
      numeroDocumento,
      importador: dta.importador.razaoSocial,
      paisOrigem: dta.paisOrigem,
      modal: dta.modal,
      numeroConhecimento: dta.numeroConhecimento,
      comissaria: comissaria.nome,
      codigoReferencia,
      coberturaCambial: form.get('coberturaCambial') === 'true',
      enviadoEm: new Date().toISOString(),
      status: 'PROCESSANDO',
      arquivos,
      processarEm: Date.now() + 4000 + Math.random() * 6000,
      resultado: falhou
        ? { status: 'ERRO', mensagemErro: MENSAGENS_ERRO[Math.floor(Math.random() * MENSAGENS_ERRO.length)] }
        : { status: 'CONCLUIDO' },
    });

    return HttpResponse.json<StatusAverbacao>({ id, status: 'PROCESSANDO' }, { status: 202 });
  }),

  http.get(`${API}/averbacoes/:id/status`, async ({ params }) => {
    await latencia(150, 400);
    const registro = db.obter(String(params.id));
    if (!registro) return erro(404, 'Envio não encontrado.');
    return HttpResponse.json<StatusAverbacao>({
      id: registro.id,
      status: registro.status,
      mensagemErro: registro.mensagemErro,
    });
  }),

  http.get(`${API}/documentos`, async ({ request }) => {
    await latencia(400, 800);
    const termo = unmask(new URL(request.url).searchParams.get('q') ?? '');
    const documentos = db
      .listar()
      .filter(
        (doc) =>
          !termo || unmask(doc.dta).includes(termo) || unmask(doc.numeroDocumento).includes(termo),
      )
      .sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
    return HttpResponse.json(documentos);
  }),

  http.get(`${API}/arquivos/:id`, async ({ params }) => {
    await latencia(300, 700);
    const encontrado = db.encontrarArquivo(String(params.id));
    if (!encontrado) return erro(404, 'Arquivo não encontrado.');

    const { arquivo, documento } = encontrado;
    const blob =
      (await fileStore.get(arquivo.id)) ??
      (arquivo.tipo === 'PDF' ? gerarPdfExemplo(documento) : gerarXmlExemplo(documento));

    return new HttpResponse(blob, {
      headers: {
        'Content-Type': arquivo.tipo === 'PDF' ? 'application/pdf' : 'application/xml',
        'Content-Disposition': `attachment; filename="${arquivo.nome}"`,
      },
    });
  }),

  http.get(`${API}/dashboard/indicadores`, async () => {
    await latencia(500, 900);
    const documentos = db.listar().sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
    const contar = (status: string) => documentos.filter((d) => d.status === status).length;

    const porModal = Object.fromEntries(
      MODAIS.map((modal) => {
        const doModal = documentos.filter((d) => d.modal === modal);
        return [
          modal,
          {
            total: doModal.length,
            concluidos: doModal.filter((d) => d.status === 'CONCLUIDO').length,
            processando: doModal.filter((d) => d.status === 'PROCESSANDO').length,
            erros: doModal.filter((d) => d.status === 'ERRO').length,
          },
        ];
      }),
    ) as IndicadoresDashboard['porModal'];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ultimosDias = Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(hoje.getTime() - (6 - i) * 86_400_000);
      const fim = dia.getTime() + 86_400_000;
      return {
        data: dia.toISOString(),
        total: documentos.filter((d) => {
          const t = new Date(d.enviadoEm).getTime();
          return t >= dia.getTime() && t < fim;
        }).length,
      };
    });

    return HttpResponse.json<IndicadoresDashboard>({
      total: documentos.length,
      concluidos: contar('CONCLUIDO'),
      processando: contar('PROCESSANDO'),
      erros: contar('ERRO'),
      porModal,
      porTipo: {
        DUIMP: documentos.filter((d) => d.tipoProcesso === 'DUIMP').length,
        DI: documentos.filter((d) => d.tipoProcesso === 'DI').length,
      },
      ultimosDias,
      recentes: documentos.slice(0, 5),
    });
  }),
];
