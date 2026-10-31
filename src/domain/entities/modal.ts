export const MODAIS = ['MARITIMO', 'RODOVIARIO', 'AEREO'] as const;

export type Modal = (typeof MODAIS)[number];

export const MODAL_LABEL: Record<Modal, string> = {
  MARITIMO: 'Marítimo',
  RODOVIARIO: 'Rodoviário',
  AEREO: 'Aéreo',
};
