import { delay, http, HttpResponse } from 'msw';
import type {
  DashboardStats,
  EndorsedDocument,
  EndorsementStatus,
  ProcessType,
  UploadedFile,
} from '@/domain/entities';
import { TRANSPORT_MODES } from '@/domain/entities';
import { unmask } from '@/domain/validation/masks';
import { CUSTOMS_BROKERS, DTAS, ERROR_MESSAGES } from './data/seed';
import { generateSamplePdf, generateSampleXml } from './data/sampleFiles';
import { db } from './db';
import { fileStore } from './fileStore';

const API = '/api';

const latency = (min: number, max: number) => delay(min + Math.random() * (max - min));
const error = (status: number, message: string, code?: string) =>
  HttpResponse.json({ message, code }, { status });

/** A reference code containing "FALHA" forces a processing failure (handy for demos). */
const FORCE_FAILURE = /FALHA/i;
const PROCESSING_FAILURE_RATE = 0.2;
const UPLOAD_FAILURE_RATE = 0.06;

const byNewest = (a: EndorsedDocument, b: EndorsedDocument) =>
  b.submittedAt.localeCompare(a.submittedAt);

const countBy = (documents: EndorsedDocument[]) => ({
  total: documents.length,
  completed: documents.filter((d) => d.status === 'COMPLETED').length,
  processing: documents.filter((d) => d.status === 'PROCESSING').length,
  failed: documents.filter((d) => d.status === 'FAILED').length,
});

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    await latency(500, 900);
    const { email, password } = (await request.json()) as { email: string; password: string };
    if (password === 'senhaerrada') return error(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');

    const name = email
      .split('@')[0]
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return HttpResponse.json({
      token: crypto.randomUUID(),
      user: { id: 'u1', name, email, role: 'OPERATOR' },
    });
  }),

  http.get(`${API}/dtas/:number`, async ({ params }) => {
    await latency(500, 1000);
    const dta = DTAS.find((d) => unmask(d.number) === params.number);
    if (!dta) {
      return error(404, 'DTA não encontrada. Confira o número informado e tente novamente.', 'DTA_NOT_FOUND');
    }
    return HttpResponse.json(dta);
  }),

  http.get(`${API}/customs-brokers`, async () => {
    await latency(200, 500);
    return HttpResponse.json(CUSTOMS_BROKERS);
  }),

  http.post(`${API}/endorsements`, async ({ request }) => {
    const form = await request.formData();
    await latency(1200, 2200); // upload time

    if (Math.random() < UPLOAD_FAILURE_RATE) {
      return error(503, 'Instabilidade na comunicação com o servidor. O envio não foi recebido.', 'UPLOAD_FAILED');
    }

    const dta = DTAS.find((d) => d.number === form.get('dta'));
    const broker = CUSTOMS_BROKERS.find((c) => c.id === form.get('customsBrokerId'));
    const processType = form.get('processType') as ProcessType;
    const pdf = form.get('pdf');
    const xml = form.get('xml');
    const documentNumber = String(form.get(processType === 'DUIMP' ? 'duimpNumber' : 'diNumber') ?? '');

    if (!dta || !broker || !(pdf instanceof File) || !documentNumber) {
      return error(400, 'Dados obrigatórios ausentes no envio.', 'VALIDATION_ERROR');
    }
    if (processType === 'DI' && !(xml instanceof File)) {
      return error(400, 'O XML da DI é obrigatório.', 'VALIDATION_ERROR');
    }

    const id = `doc-${crypto.randomUUID()}`;
    const files: UploadedFile[] = [{ id: `${id}-pdf`, name: pdf.name, type: 'PDF', size: pdf.size }];
    await fileStore.save(`${id}-pdf`, pdf);
    if (xml instanceof File) {
      files.push({ id: `${id}-xml`, name: xml.name, type: 'XML', size: xml.size });
      await fileStore.save(`${id}-xml`, xml);
    }

    const referenceCode = (form.get('referenceCode') as string | null) ?? undefined;
    const fails = FORCE_FAILURE.test(referenceCode ?? '') || Math.random() < PROCESSING_FAILURE_RATE;

    db.insert({
      id,
      dta: dta.number,
      processType,
      documentNumber,
      importer: dta.importer.companyName,
      originCountry: dta.originCountry,
      transportMode: dta.transportMode,
      billOfLadingNumber: dta.billOfLadingNumber,
      customsBroker: broker.name,
      referenceCode,
      foreignExchangeCoverage: form.get('foreignExchangeCoverage') === 'true',
      submittedAt: new Date().toISOString(),
      status: 'PROCESSING',
      files,
      processAt: Date.now() + 4000 + Math.random() * 6000,
      outcome: fails
        ? { status: 'FAILED', errorMessage: ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)] }
        : { status: 'COMPLETED' },
    });

    return HttpResponse.json<EndorsementStatus>({ id, status: 'PROCESSING' }, { status: 202 });
  }),

  http.get(`${API}/endorsements/:id/status`, async ({ params }) => {
    await latency(150, 400);
    const record = db.get(String(params.id));
    if (!record) return error(404, 'Envio não encontrado.');
    return HttpResponse.json<EndorsementStatus>({
      id: record.id,
      status: record.status,
      errorMessage: record.errorMessage,
    });
  }),

  http.get(`${API}/documents`, async ({ request }) => {
    await latency(400, 800);
    const term = unmask(new URL(request.url).searchParams.get('q') ?? '');
    const documents = db
      .list()
      .filter(
        (doc) => !term || unmask(doc.dta).includes(term) || unmask(doc.documentNumber).includes(term),
      )
      .sort(byNewest);
    return HttpResponse.json(documents);
  }),

  http.get(`${API}/files/:id`, async ({ params }) => {
    await latency(300, 700);
    const found = db.findFile(String(params.id));
    if (!found) return error(404, 'Arquivo não encontrado.');

    const { file, document } = found;
    const blob =
      (await fileStore.get(file.id)) ??
      (file.type === 'PDF' ? generateSamplePdf(document) : generateSampleXml(document));

    return new HttpResponse(blob, {
      headers: {
        'Content-Type': file.type === 'PDF' ? 'application/pdf' : 'application/xml',
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
    });
  }),

  http.get(`${API}/dashboard/stats`, async () => {
    await latency(500, 900);
    const documents = db.list().sort(byNewest);

    const byTransportMode = Object.fromEntries(
      TRANSPORT_MODES.map((mode) => [mode, countBy(documents.filter((d) => d.transportMode === mode))]),
    ) as DashboardStats['byTransportMode'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today.getTime() - (6 - i) * 86_400_000);
      const end = day.getTime() + 86_400_000;
      return {
        date: day.toISOString(),
        total: documents.filter((d) => {
          const t = new Date(d.submittedAt).getTime();
          return t >= day.getTime() && t < end;
        }).length,
      };
    });

    return HttpResponse.json<DashboardStats>({
      ...countBy(documents),
      byTransportMode,
      byProcessType: {
        DUIMP: documents.filter((d) => d.processType === 'DUIMP').length,
        DI: documents.filter((d) => d.processType === 'DI').length,
      },
      lastDays,
      recent: documents.slice(0, 5),
    });
  }),
];
