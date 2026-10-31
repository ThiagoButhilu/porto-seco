import type { Comissaria, DocumentoAverbado, Dta, StatusProcessamento } from '@/domain/entities';

export const DTAS: Dta[] = [
  {
    numero: '25/0412387-3',
    importador: { razaoSocial: 'Atlântica Comércio de Máquinas Ltda', cnpj: '12345678000190', dataCadastro: '2019-03-14' },
    paisOrigem: 'China',
    modal: 'MARITIMO',
    numeroConhecimento: 'MSCU7845123',
  },
  {
    numero: '25/0398451-0',
    importador: { razaoSocial: 'Vale Verde Equipamentos Médicos S.A.', cnpj: '23456789000101', dataCadastro: '2021-08-02' },
    paisOrigem: 'Alemanha',
    modal: 'AEREO',
    numeroConhecimento: '020-48731295',
  },
  {
    numero: '25/0501276-8',
    importador: { razaoSocial: 'Pampa Alimentos Importadora Ltda', cnpj: '34567890000112', dataCadastro: '2017-11-23' },
    paisOrigem: 'Argentina',
    modal: 'RODOVIARIO',
    numeroConhecimento: 'AR.512.004871',
  },
  {
    numero: '25/0377002-5',
    importador: { razaoSocial: 'Horizonte Eletrônicos do Brasil Ltda', cnpj: '45678901000123', dataCadastro: '2020-01-09' },
    paisOrigem: 'Coreia do Sul',
    modal: 'MARITIMO',
    numeroConhecimento: 'HDMU2209874',
  },
  {
    numero: '25/0455910-2',
    importador: { razaoSocial: 'Cerrado Agro Insumos S.A.', cnpj: '56789012000134', dataCadastro: '2022-05-30' },
    paisOrigem: 'Estados Unidos',
    modal: 'AEREO',
    numeroConhecimento: '001-77215408',
  },
  {
    numero: '25/0520033-7',
    importador: { razaoSocial: 'Fronteira Têxtil Comércio Exterior Ltda', cnpj: '67890123000145', dataCadastro: '2018-07-17' },
    paisOrigem: 'Paraguai',
    modal: 'RODOVIARIO',
    numeroConhecimento: 'PY.220.019334',
  },
  {
    numero: '25/0489164-4',
    importador: { razaoSocial: 'Mediterrâneo Vinhos e Azeites Ltda', cnpj: '78901234000156', dataCadastro: '2016-02-11' },
    paisOrigem: 'Itália',
    modal: 'MARITIMO',
    numeroConhecimento: 'MAEU5531907',
  },
  {
    numero: '25/0433718-9',
    importador: { razaoSocial: 'Sakura Componentes Automotivos Ltda', cnpj: '89012345000167', dataCadastro: '2023-04-05' },
    paisOrigem: 'Japão',
    modal: 'AEREO',
    numeroConhecimento: '131-60982741',
  },
];

export const COMISSARIAS: Comissaria[] = [
  { id: 'c1', nome: 'Rota Sul Comissária de Despachos', cnpj: '11222333000144' },
  { id: 'c2', nome: 'Aduana Express Assessoria Aduaneira', cnpj: '22333444000155' },
  { id: 'c3', nome: 'Porto Firme Despachos Aduaneiros', cnpj: '33444555000166' },
  { id: 'c4', nome: 'Transcomex Comissária Ltda', cnpj: '44555666000177' },
  { id: 'c5', nome: 'Interior Log Despachante Aduaneiro', cnpj: '55666777000188' },
];

export const MENSAGENS_ERRO = [
  'XML da DI com estrutura inválida. Verifique o arquivo gerado no Siscomex.',
  'Chave de acesso não confere com o número da DUIMP informado.',
  'Número do conhecimento divergente entre a DTA e o documento de importação.',
  'PDF ilegível ou protegido por senha. Envie uma cópia digitalizada sem restrições.',
  'Declaração ainda não registrada na Receita Federal.',
];

/** PRNG determinístico para gerar sempre a mesma massa de dados. */
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

export function gerarDocumentosIniciais(agora = Date.now()): DocumentoAverbado[] {
  const random = mulberry32(42);
  const documentos: DocumentoAverbado[] = [];
  const total = 26;

  for (let i = 0; i < total; i++) {
    const dta = DTAS[Math.floor(random() * DTAS.length)];
    const tipo = random() > 0.45 ? 'DUIMP' : 'DI';
    const diasAtras = Math.floor(random() * 7);
    const enviadoEm = new Date(agora - diasAtras * 86_400_000 - Math.floor(random() * 9) * 3_600_000);
    const status: StatusProcessamento = random() > 0.84 ? 'ERRO' : 'CONCLUIDO';
    const numeroDocumento =
      tipo === 'DUIMP'
        ? `${pad(25 + Math.floor(random() * 2), 2)}BR${pad(Math.floor(random() * 1e10), 10)}-${Math.floor(random() * 10)}`
        : `25/${pad(Math.floor(random() * 1e7), 7)}-${Math.floor(random() * 10)}`;
    const comissaria = COMISSARIAS[Math.floor(random() * COMISSARIAS.length)];
    const slug = numeroDocumento.replace(/\W/g, '');
    const id = `doc-seed-${i + 1}`;

    documentos.push({
      id,
      dta: dta.numero,
      tipoProcesso: tipo,
      numeroDocumento,
      importador: dta.importador.razaoSocial,
      paisOrigem: dta.paisOrigem,
      modal: dta.modal,
      numeroConhecimento: dta.numeroConhecimento,
      comissaria: comissaria.nome,
      codigoReferencia: random() > 0.5 ? `REF-${pad(Math.floor(random() * 9999), 4)}` : undefined,
      coberturaCambial: random() > 0.6,
      enviadoEm: enviadoEm.toISOString(),
      status,
      mensagemErro:
        status === 'ERRO' ? MENSAGENS_ERRO[Math.floor(random() * MENSAGENS_ERRO.length)] : undefined,
      arquivos: [
        { id: `${id}-pdf`, nome: `${tipo}_${slug}.pdf`, tipo: 'PDF', tamanho: 180_000 + Math.floor(random() * 900_000) },
        ...(tipo === 'DI'
          ? [{ id: `${id}-xml`, nome: `DI_${slug}.xml`, tipo: 'XML' as const, tamanho: 8_000 + Math.floor(random() * 40_000) }]
          : []),
      ],
    });
  }

  return documentos.sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
}
