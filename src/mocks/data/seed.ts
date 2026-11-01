import type { CustomsBroker, Dta, EndorsedDocument, ProcessingStatus } from '@/domain/entities';

export const DTAS: Dta[] = [
  {
    number: '25/0412387-3',
    importer: { companyName: 'Atlântica Comércio de Máquinas Ltda', cnpj: '12345678000190', registeredAt: '2019-03-14' },
    originCountry: 'China',
    transportMode: 'SEA',
    billOfLadingNumber: 'MSCU7845123',
  },
  {
    number: '25/0398451-0',
    importer: { companyName: 'Vale Verde Equipamentos Médicos S.A.', cnpj: '23456789000101', registeredAt: '2021-08-02' },
    originCountry: 'Alemanha',
    transportMode: 'AIR',
    billOfLadingNumber: '020-48731295',
  },
  {
    number: '25/0501276-8',
    importer: { companyName: 'Pampa Alimentos Importadora Ltda', cnpj: '34567890000112', registeredAt: '2017-11-23' },
    originCountry: 'Argentina',
    transportMode: 'ROAD',
    billOfLadingNumber: 'AR.512.004871',
  },
  {
    number: '25/0377002-5',
    importer: { companyName: 'Horizonte Eletrônicos do Brasil Ltda', cnpj: '45678901000123', registeredAt: '2020-01-09' },
    originCountry: 'Coreia do Sul',
    transportMode: 'SEA',
    billOfLadingNumber: 'HDMU2209874',
  },
  {
    number: '25/0455910-2',
    importer: { companyName: 'Cerrado Agro Insumos S.A.', cnpj: '56789012000134', registeredAt: '2022-05-30' },
    originCountry: 'Estados Unidos',
    transportMode: 'AIR',
    billOfLadingNumber: '001-77215408',
  },
  {
    number: '25/0520033-7',
    importer: { companyName: 'Fronteira Têxtil Comércio Exterior Ltda', cnpj: '67890123000145', registeredAt: '2018-07-17' },
    originCountry: 'Paraguai',
    transportMode: 'ROAD',
    billOfLadingNumber: 'PY.220.019334',
  },
  {
    number: '25/0489164-4',
    importer: { companyName: 'Mediterrâneo Vinhos e Azeites Ltda', cnpj: '78901234000156', registeredAt: '2016-02-11' },
    originCountry: 'Itália',
    transportMode: 'SEA',
    billOfLadingNumber: 'MAEU5531907',
  },
  {
    number: '25/0433718-9',
    importer: { companyName: 'Sakura Componentes Automotivos Ltda', cnpj: '89012345000167', registeredAt: '2023-04-05' },
    originCountry: 'Japão',
    transportMode: 'AIR',
    billOfLadingNumber: '131-60982741',
  },
];

export const CUSTOMS_BROKERS: CustomsBroker[] = [
  { id: 'c1', name: 'Rota Sul Comissária de Despachos', cnpj: '11222333000144' },
  { id: 'c2', name: 'Aduana Express Assessoria Aduaneira', cnpj: '22333444000155' },
  { id: 'c3', name: 'Porto Firme Despachos Aduaneiros', cnpj: '33444555000166' },
  { id: 'c4', name: 'Transcomex Comissária Ltda', cnpj: '44555666000177' },
  { id: 'c5', name: 'Interior Log Despachante Aduaneiro', cnpj: '55666777000188' },
];

export const ERROR_MESSAGES = [
  'XML da DI com estrutura inválida. Verifique o arquivo gerado no Siscomex.',
  'Chave de acesso não confere com o número da DUIMP informado.',
  'Número do conhecimento divergente entre a DTA e o documento de importação.',
  'PDF ilegível ou protegido por senha. Envie uma cópia digitalizada sem restrições.',
  'Declaração ainda não registrada na Receita Federal.',
];

/** Deterministic PRNG so the seed data is always the same. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (value: number, size: number) => String(value).padStart(size, '0');

export function generateInitialDocuments(now = Date.now()): EndorsedDocument[] {
  const random = mulberry32(42);
  const documents: EndorsedDocument[] = [];
  const total = 26;

  for (let i = 0; i < total; i++) {
    const dta = DTAS[Math.floor(random() * DTAS.length)];
    const processType = random() > 0.45 ? 'DUIMP' : 'DI';
    const daysAgo = Math.floor(random() * 7);
    const submittedAt = new Date(now - daysAgo * 86_400_000 - Math.floor(random() * 9) * 3_600_000);
    const status: ProcessingStatus = random() > 0.84 ? 'FAILED' : 'COMPLETED';
    const documentNumber =
      processType === 'DUIMP'
        ? `${pad(25 + Math.floor(random() * 2), 2)}BR${pad(Math.floor(random() * 1e10), 10)}-${Math.floor(random() * 10)}`
        : `25/${pad(Math.floor(random() * 1e7), 7)}-${Math.floor(random() * 10)}`;
    const broker = CUSTOMS_BROKERS[Math.floor(random() * CUSTOMS_BROKERS.length)];
    const slug = documentNumber.replace(/\W/g, '');
    const id = `doc-seed-${i + 1}`;

    documents.push({
      id,
      dta: dta.number,
      processType,
      documentNumber,
      importer: dta.importer.companyName,
      originCountry: dta.originCountry,
      transportMode: dta.transportMode,
      billOfLadingNumber: dta.billOfLadingNumber,
      customsBroker: broker.name,
      referenceCode: random() > 0.5 ? `REF-${pad(Math.floor(random() * 9999), 4)}` : undefined,
      foreignExchangeCoverage: random() > 0.6,
      submittedAt: submittedAt.toISOString(),
      status,
      errorMessage:
        status === 'FAILED' ? ERROR_MESSAGES[Math.floor(random() * ERROR_MESSAGES.length)] : undefined,
      files: [
        { id: `${id}-pdf`, name: `${processType}_${slug}.pdf`, type: 'PDF', size: 180_000 + Math.floor(random() * 900_000) },
        ...(processType === 'DI'
          ? [{ id: `${id}-xml`, name: `DI_${slug}.xml`, type: 'XML' as const, size: 8_000 + Math.floor(random() * 40_000) }]
          : []),
      ],
    });
  }

  return documents.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
}
