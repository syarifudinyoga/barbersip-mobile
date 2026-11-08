export function formatRupiah(value?: number | string | null): string {
  const num = Number(value || 0);
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export function formatDateID(dateString?: string | null): string {
  if (!dateString) return '-';

  // Handle DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    const [d, m, y] = dateString.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTimeID(dateString?: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  });
}

export const formatDateTime = formatDateTimeID;

export function formatTimeID(timeString?: string | null): string {
  if (!timeString) return '--:--';
  return timeString.slice(0, 5);
}
