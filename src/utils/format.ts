export const formatPrice = (price: number | null | undefined): string => {
  if (price == null || Number.isNaN(price) || price < 0) return '0';
  return new Intl.NumberFormat('vi-VN').format(price);
};

/**
 * Format a number as Vietnamese currency input display (e.g. 850000 → "850.000").
 * Uses explicit dot separator instead of Intl.NumberFormat to avoid locale-specific
 * non-printing characters (NNBSP \u202f, NBSP \u00a0) on some browsers/OS.
 */
export const formatCurrencyInput = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
  if (Number.isNaN(num) || num < 0) return '';
  // Format with dot thousand separator explicitly
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseCurrencyInput = (formattedStr: string): number => {
  const clean = formattedStr.replace(/\D/g, '');
  if (!clean) return 0;
  return parseInt(clean, 10);
};

export const formatDate = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateTime = (dateStr: string | Date): string => {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTourDuration = (durationDays: number): string => {
  return `${durationDays} ngày`;
};
