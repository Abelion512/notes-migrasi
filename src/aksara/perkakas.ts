export function formatTanggal(tglStr: string | undefined): string {
  if (!tglStr) return '';
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = new Date(tglStr);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTanggalRelative(tglStr: string | undefined): string {
  if (!tglStr) return '';
  const date = new Date(tglStr);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Baru saja';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)} menit yang lalu`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)} jam yang lalu`;
  if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} hari yang lalu`;
  return formatTanggal(tglStr);
}

export function debounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function generateId(prefix = 'uid'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
