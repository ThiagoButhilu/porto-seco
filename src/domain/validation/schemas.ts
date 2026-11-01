import { z } from 'zod';
import { EXAMPLES, PATTERNS } from './masks';

export const LIMITS = {
  EMAIL: 100,
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 32,
  ACCESS_KEY_MIN: 6,
  ACCESS_KEY_MAX: 60,
  REFERENCE_CODE: 30,
  SEARCH: 20,
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
    .max(LIMITS.EMAIL, `Máximo de ${LIMITS.EMAIL} caracteres`)
    .email('E-mail inválido. Ex.: nome@empresa.com.br'),
  password: z
    .string()
    .min(1, 'Informe sua senha')
    .min(LIMITS.PASSWORD_MIN, `A senha deve ter ao menos ${LIMITS.PASSWORD_MIN} caracteres`)
    .max(LIMITS.PASSWORD_MAX, `Máximo de ${LIMITS.PASSWORD_MAX} caracteres`),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------- DTA lookup ----------

export const dtaLookupSchema = z.object({
  dta: z
    .string()
    .min(1, 'Informe o número da DTA')
    .regex(PATTERNS.DTA, `DTA incompleta. Formato: ${EXAMPLES.DTA}`),
});

export type DtaLookupInput = z.infer<typeof dtaLookupSchema>;

// ---------- Endorsement ----------

const isFile = (value: unknown): value is File =>
  typeof File !== 'undefined' && value instanceof File;

const fileField = (extension: 'pdf' | 'xml', maxMb: number) =>
  z
    .custom<File>(isFile, { message: `Anexe o arquivo ${extension.toUpperCase()}` })
    .refine(
      (file) => file.name.toLowerCase().endsWith(`.${extension}`),
      `O arquivo deve estar no formato ${extension.toUpperCase()}`,
    )
    .refine((file) => file.size > 0, 'O arquivo está vazio')
    .refine((file) => file.size <= maxMb * MB, `Tamanho máximo: ${maxMb} MB`);

const commonFields = {
  customsBrokerId: z.string().min(1, 'Selecione a comissária'),
  referenceCode: z
    .string()
    .trim()
    .max(LIMITS.REFERENCE_CODE, `Máximo de ${LIMITS.REFERENCE_CODE} caracteres`)
    .regex(/^[A-Za-z0-9\-_/. ]*$/, 'Use apenas letras, números e os símbolos - _ / .'),
  foreignExchangeCoverage: z.enum(['YES', 'NO']),
  pdf: fileField('pdf', LIMITS.PDF_MB),
};

const duimpSchema = z.object({
  ...commonFields,
  processType: z.literal('DUIMP'),
  duimpNumber: z
    .string()
    .min(1, 'Informe o número da DUIMP')
    .regex(PATTERNS.DUIMP, `DUIMP inválida. Formato: ${EXAMPLES.DUIMP}`),
  accessKey: z
    .string()
    .trim()
    .min(1, 'Informe a chave de acesso')
    .min(LIMITS.ACCESS_KEY_MIN, `Mínimo de ${LIMITS.ACCESS_KEY_MIN} caracteres`)
    .max(LIMITS.ACCESS_KEY_MAX, `Máximo de ${LIMITS.ACCESS_KEY_MAX} caracteres`)
    .regex(/^[A-Za-z0-9]+$/, 'Use apenas letras e números, sem espaços'),
});

const diSchema = z.object({
  ...commonFields,
  processType: z.literal('DI'),
  diNumber: z
    .string()
    .min(1, 'Informe o número da DI')
    .regex(PATTERNS.DI, `DI inválida. Formato: ${EXAMPLES.DI}`),
  xml: fileField('xml', LIMITS.XML_MB),
});

export const endorsementSchema = z.discriminatedUnion('processType', [duimpSchema, diSchema]);

export type EndorsementOutput = z.infer<typeof endorsementSchema>;

/** Form values before validation (files start empty). */
export interface EndorsementFormValues {
  processType: 'DUIMP' | 'DI';
  customsBrokerId: string;
  referenceCode: string;
  foreignExchangeCoverage: 'YES' | 'NO';
  duimpNumber: string;
  accessKey: string;
  diNumber: string;
  pdf: File | null;
  xml: File | null;
}

export const endorsementDefaults: EndorsementFormValues = {
  processType: 'DUIMP',
  customsBrokerId: '',
  referenceCode: '',
  foreignExchangeCoverage: 'NO',
  duimpNumber: '',
  accessKey: '',
  diNumber: '',
  pdf: null,
  xml: null,
};
