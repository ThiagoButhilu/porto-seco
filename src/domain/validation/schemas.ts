import { z } from 'zod';
import { EXEMPLOS, PATTERNS } from './masks';

export const LIMITES = {
  EMAIL: 100,
  SENHA_MIN: 6,
  SENHA_MAX: 32,
  CHAVE_ACESSO_MIN: 6,
  CHAVE_ACESSO_MAX: 60,
  CODIGO_REFERENCIA: 30,
  BUSCA: 20,
  PDF_MB: 10,
  XML_MB: 5,
} as const;

const MB = 1024 * 1024;

// ---------- Login ----------

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail')
    .max(LIMITES.EMAIL, `Máximo de ${LIMITES.EMAIL} caracteres`)
    .email('E-mail inválido. Ex.: nome@empresa.com.br'),
  senha: z
    .string()
    .min(1, 'Informe sua senha')
    .min(LIMITES.SENHA_MIN, `A senha deve ter ao menos ${LIMITES.SENHA_MIN} caracteres`)
    .max(LIMITES.SENHA_MAX, `Máximo de ${LIMITES.SENHA_MAX} caracteres`),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------- Consulta de DTA ----------

export const dtaConsultaSchema = z.object({
  dta: z
    .string()
    .min(1, 'Informe o número da DTA')
    .regex(PATTERNS.DTA, `DTA incompleta. Formato: ${EXEMPLOS.DTA}`),
});

export type DtaConsultaInput = z.infer<typeof dtaConsultaSchema>;

// ---------- Averbação ----------

const isFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File;

const arquivo = (extensao: 'pdf' | 'xml', limiteMb: number) =>
  z
    .custom<File>(isFile, { message: `Anexe o arquivo ${extensao.toUpperCase()}` })
    .refine(
      (file) => file.name.toLowerCase().endsWith(`.${extensao}`),
      `O arquivo deve estar no formato ${extensao.toUpperCase()}`,
    )
    .refine((file) => file.size > 0, 'O arquivo está vazio')
    .refine((file) => file.size <= limiteMb * MB, `Tamanho máximo: ${limiteMb} MB`);

const camposComuns = {
  comissariaId: z.string().min(1, 'Selecione a comissária'),
  codigoReferencia: z
    .string()
    .trim()
    .max(LIMITES.CODIGO_REFERENCIA, `Máximo de ${LIMITES.CODIGO_REFERENCIA} caracteres`)
    .regex(/^[A-Za-z0-9\-_/. ]*$/, 'Use apenas letras, números e os símbolos - _ / .'),
  coberturaCambial: z.enum(['SIM', 'NAO']),
  pdf: arquivo('pdf', LIMITES.PDF_MB),
};

const duimpSchema = z.object({
  ...camposComuns,
  tipoProcesso: z.literal('DUIMP'),
  numeroDuimp: z
    .string()
    .min(1, 'Informe o número da DUIMP')
    .regex(PATTERNS.DUIMP, `DUIMP inválida. Formato: ${EXEMPLOS.DUIMP}`),
  chaveAcesso: z
    .string()
    .trim()
    .min(1, 'Informe a chave de acesso')
    .min(LIMITES.CHAVE_ACESSO_MIN, `Mínimo de ${LIMITES.CHAVE_ACESSO_MIN} caracteres`)
    .max(LIMITES.CHAVE_ACESSO_MAX, `Máximo de ${LIMITES.CHAVE_ACESSO_MAX} caracteres`)
    .regex(/^[A-Za-z0-9]+$/, 'Use apenas letras e números, sem espaços'),
});

const diSchema = z.object({
  ...camposComuns,
  tipoProcesso: z.literal('DI'),
  numeroDi: z
    .string()
    .min(1, 'Informe o número da DI')
    .regex(PATTERNS.DI, `DI inválida. Formato: ${EXEMPLOS.DI}`),
  xml: arquivo('xml', LIMITES.XML_MB),
});

export const averbacaoSchema = z.discriminatedUnion('tipoProcesso', [duimpSchema, diSchema]);

export type AverbacaoOutput = z.infer<typeof averbacaoSchema>;

/** Valores do formulário antes da validação (arquivos começam vazios). */
export interface AverbacaoFormValues {
  tipoProcesso: 'DUIMP' | 'DI';
  comissariaId: string;
  codigoReferencia: string;
  coberturaCambial: 'SIM' | 'NAO';
  numeroDuimp: string;
  chaveAcesso: string;
  numeroDi: string;
  pdf: File | null;
  xml: File | null;
}

export const averbacaoDefaults: AverbacaoFormValues = {
  tipoProcesso: 'DUIMP',
  comissariaId: '',
  codigoReferencia: '',
  coberturaCambial: 'NAO',
  numeroDuimp: '',
  chaveAcesso: '',
  numeroDi: '',
  pdf: null,
  xml: null,
};
