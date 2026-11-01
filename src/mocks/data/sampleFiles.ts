import type { EndorsedDocument } from '@/domain/entities';
import { TRANSPORT_MODE_LABEL } from '@/domain/entities';

const ascii = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');
const escapePdf = (text: string) => ascii(text).replace(/[\\()]/g, (m) => `\\${m}`);

/** Builds a minimal, valid PDF (1 page, Helvetica) for the sample documents. */
export function generateSamplePdf(doc: EndorsedDocument): Blob {
  const lines = [
    `${doc.processType} ${doc.documentNumber}`,
    '',
    `DTA: ${doc.dta}`,
    `Importador: ${doc.importer}`,
    `Pais de origem: ${doc.originCountry}`,
    `Modal: ${TRANSPORT_MODE_LABEL[doc.transportMode]}`,
    `Conhecimento: ${doc.billOfLadingNumber}`,
    `Comissaria: ${doc.customsBroker}`,
    '',
    'Documento gerado automaticamente pelo ambiente de demonstracao.',
  ];

  const content = [
    'BT',
    '/F1 20 Tf',
    '56 770 Td',
    `(${escapePdf(lines[0])}) Tj`,
    '/F1 12 Tf',
    ...lines.slice(1).flatMap((line) => ['0 -24 Td', `(${escapePdf(line)}) Tj`]),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function generateSampleXml(doc: EndorsedDocument): Blob {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<declaracaoImportacao>
  <numeroDI>${doc.documentNumber}</numeroDI>
  <dta>${doc.dta}</dta>
  <importador>
    <razaoSocial>${doc.importer}</razaoSocial>
  </importador>
  <carga>
    <paisProcedencia>${doc.originCountry}</paisProcedencia>
    <viaTransporte>${TRANSPORT_MODE_LABEL[doc.transportMode]}</viaTransporte>
    <conhecimento>${doc.billOfLadingNumber}</conhecimento>
  </carga>
  <dataRegistro>${doc.submittedAt}</dataRegistro>
</declaracaoImportacao>
`;
  return new Blob([xml], { type: 'application/xml' });
}
