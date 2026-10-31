const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const timeFormatter = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });
const weekdayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });
const numberFormatter = new Intl.NumberFormat('pt-BR');

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso));
export const formatTime = (iso: string) => timeFormatter.format(new Date(iso));
export const formatWeekday = (iso: string) =>
  weekdayFormatter.format(new Date(iso)).replace('.', '');
export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatPercent = (part: number, total: number) =>
  total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
}

export function formatCnpj(cnpj: string): string {
  const d = cnpj.replace(/\D/g, '').padStart(14, '0');
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}
