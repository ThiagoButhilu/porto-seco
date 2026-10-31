import type { DocumentoAverbado } from '@/domain/entities';
import { MODAL_LABEL } from '@/domain/entities';

const ascii = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '');
const escapePdf = (text: string) => ascii(text).replace(/[\\()]/g, (m) => `\\${m}`);

/** Gera um PDF mínimo e válido (1 página, Helvetica) para os documentos de exemplo. */
export function gerarPdfExemplo(doc: DocumentoAverbado): Blob {
  const linhas = [
    `${doc.tipoProcesso} ${doc.numeroDocumento}`,
    '',
    `DTA: ${doc.dta}`,
    `Importador: ${doc.importador}`,
    `Pais de origem: ${doc.paisOrigem}`,
    `Modal: ${MODAL_LABEL[doc.modal]}`,
    `Conhecimento: ${doc.numeroConhecimento}`,
    `Comissaria: ${doc.comissaria}`,
    '',
    'Documento gerado automaticamente pelo ambiente de demonstracao.',
  ];

  const content = [
    'BT',
    '/F1 20 Tf',
    '56 770 Td',
    `(${escapePdf(linhas[0])}) Tj`,
    '/F1 12 Tf',
    ...linhas.slice(1).flatMap((linha) => ['0 -24 Td', `(${escapePdf(linha)}) Tj`]),
    'ET',
  ].join('\n');

  const objetos = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objetos.forEach((objeto, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${objeto}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function gerarXmlExemplo(doc: DocumentoAverbado): Blob {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<declaracaoImportacao>
  <numeroDI>${doc.numeroDocumento}</numeroDI>
  <dta>${doc.dta}</dta>
  <importador>
    <razaoSocial>${doc.importador}</razaoSocial>
  </importador>
  <carga>
    <paisProcedencia>${doc.paisOrigem}</paisProcedencia>
    <viaTransporte>${MODAL_LABEL[doc.modal]}</viaTransporte>
    <conhecimento>${doc.numeroConhecimento}</conhecimento>
  </carga>
  <dataRegistro>${doc.enviadoEm}</dataRegistro>
</declaracaoImportacao>
`;
  return new Blob([xml], { type: 'application/xml' });
}
