import type { NovaAverbacao } from '@/domain/entities';
import type { AverbacaoOutput } from '@/domain/validation/schemas';

/** Converte os dados validados do formulário no payload do domínio. */
export function toNovaAverbacao(dta: string, dados: AverbacaoOutput): NovaAverbacao {
  const base = {
    dta,
    comissariaId: dados.comissariaId,
    codigoReferencia: dados.codigoReferencia || undefined,
    coberturaCambial: dados.coberturaCambial === 'SIM',
    pdf: dados.pdf,
  };

  return dados.tipoProcesso === 'DUIMP'
    ? { ...base, tipoProcesso: 'DUIMP', numeroDuimp: dados.numeroDuimp, chaveAcesso: dados.chaveAcesso }
    : { ...base, tipoProcesso: 'DI', numeroDi: dados.numeroDi, xml: dados.xml };
}
