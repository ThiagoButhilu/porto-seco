export const TRANSPORT_MODES = ['SEA', 'ROAD', 'AIR'] as const;

export type TransportMode = (typeof TRANSPORT_MODES)[number];

export const TRANSPORT_MODE_LABEL: Record<TransportMode, string> = {
  SEA: 'Marítimo',
  ROAD: 'Rodoviário',
  AIR: 'Aéreo',
};
