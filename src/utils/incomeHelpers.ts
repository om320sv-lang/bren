import {
  CurrencyCode,
  CurrencyConfig,
  DateRangePreset,
  IncomeCategory,
  IncomeEntry,
  PaymentMethod,
} from '../types/income';

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  MXN: { code: 'MXN', label: 'MXN ($)', symbol: '$', locale: 'es-MX' },
  USD: { code: 'USD', label: 'USD ($)', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', label: 'EUR (€)', symbol: '€', locale: 'es-ES' },
  COP: { code: 'COP', label: 'COP ($)', symbol: '$', locale: 'es-CO' },
  ARS: { code: 'ARS', label: 'ARS ($)', symbol: '$', locale: 'es-AR' },
  CLP: { code: 'CLP', label: 'CLP ($)', symbol: '$', locale: 'es-CL' },
  PEN: { code: 'PEN', label: 'PEN (S/)', symbol: 'S/', locale: 'es-PE' },
};

export const CATEGORIES: IncomeCategory[] = [
  'Servicios',
  'Ventas',
  'Honorarios',
  'Salario',
  'Inversiones',
  'Reembolsos',
  'Otros',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Transferencia',
  'Efectivo',
  'Tarjeta',
  'Depósito',
  'Digital',
];

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  return toLocalISODate(new Date());
}

export function getOffsetDateISO(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return toLocalISODate(d);
}

export function getStartOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as start of week
  d.setDate(d.getDate() + diff);
  return toLocalISODate(d);
}

export function getStartOfMonthISO(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

export function getEndOfMonthISO(date = new Date()): string {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return toLocalISODate(end);
}

export function getPreviousMonthRange(): { from: string; to: string } {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    from: getStartOfMonthISO(prev),
    to: getEndOfMonthISO(prev),
  };
}

export function getPresetDateRange(preset: DateRangePreset): { from: string; to: string } {
  const today = getTodayISO();
  switch (preset) {
    case 'today':
      return { from: today, to: today };
    case 'week':
      return { from: getStartOfWeekISO(), to: today };
    case 'month':
      return { from: getStartOfMonthISO(), to: getEndOfMonthISO() };
    case 'prev_month':
      return getPreviousMonthRange();
    case 'all':
    case 'custom':
    default:
      return { from: '', to: '' };
  }
}

export function parseLocalISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDateShort(iso: string): string {
  if (!iso) return '—';
  const date = parseLocalISODate(iso);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateWeekday(iso: string): string {
  if (!iso) return '—';
  const date = parseLocalISODate(iso);
  const formatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatMonthYear(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, 1);
  const formatted = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const cfg = CURRENCIES[currency] || CURRENCIES.MXN;
  const formatted = new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.code,
    minimumFractionDigits: cfg.code === 'CLP' ? 0 : 2,
    maximumFractionDigits: cfg.code === 'CLP' ? 0 : 2,
  }).format(amount);
  return formatted;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `inc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createSeedEntries(): IncomeEntry[] {
  const now = Date.now();
  return [
    {
      id: generateId(),
      date: getTodayISO(),
      concept: 'Consultoría de arquitectura digital',
      source: 'Estudio Norte S.A.',
      category: 'Servicios',
      method: 'Transferencia',
      amount: 14500,
      status: 'Recibido',
      notes: 'Liquidación de factura #F-208 correspondiente a noviembre.',
      createdAt: now - 1000 * 60 * 60 * 2,
    },
    {
      id: generateId(),
      date: getTodayISO(),
      concept: 'Venta directa de licencias',
      source: 'Comercial del Valle',
      category: 'Ventas',
      method: 'Tarjeta',
      amount: 3850,
      status: 'Recibido',
      notes: 'Paquete anual de 5 puestos.',
      createdAt: now - 1000 * 60 * 60 * 5,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-1),
      concept: 'Asesoría fiscal mensual',
      source: 'Clínica San Martín',
      category: 'Honorarios',
      method: 'Transferencia',
      amount: 6200,
      status: 'Recibido',
      createdAt: now - 1000 * 60 * 60 * 24,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-3),
      concept: 'Venta mostrador lote #14',
      source: 'Cliente particular',
      category: 'Ventas',
      method: 'Efectivo',
      amount: 1940,
      status: 'Recibido',
      createdAt: now - 1000 * 60 * 60 * 72,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-5),
      concept: 'Rendimiento de portafolio',
      source: 'Fondo Renta Fija',
      category: 'Inversiones',
      method: 'Depósito',
      amount: 2780.5,
      status: 'Recibido',
      createdAt: now - 1000 * 60 * 60 * 120,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-7),
      concept: 'Mantenimiento plataforma web',
      source: 'Grupo Logístico Atlas',
      category: 'Servicios',
      method: 'Transferencia',
      amount: 8900,
      status: 'Recibido',
      createdAt: now - 1000 * 60 * 60 * 168,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-11),
      concept: 'Nómina primera quincena',
      source: 'Dirección Operativa',
      category: 'Salario',
      method: 'Transferencia',
      amount: 16500,
      status: 'Recibido',
      createdAt: now - 1000 * 60 * 60 * 264,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-14),
      concept: 'Anticipo desarrollo módulo inventario',
      source: 'Ferretería Central',
      category: 'Servicios',
      method: 'Digital',
      amount: 7500,
      status: 'Pendiente',
      notes: 'Pendiente de confirmación bancaria.',
      createdAt: now - 1000 * 60 * 60 * 336,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-26),
      concept: 'Consultoría de procesos',
      source: 'Textiles del Sur',
      category: 'Honorarios',
      method: 'Transferencia',
      amount: 11200,
      status: 'Recibido',
      createdAt: now - 1000 * 60 * 60 * 624,
    },
    {
      id: generateId(),
      date: getOffsetDateISO(-33),
      concept: 'Reembolso de viáticos',
      source: 'Congreso Industrial',
      category: 'Reembolsos',
      method: 'Depósito',
      amount: 2150,
      status: 'Recibido',
      createdAt: now - 1000 * 60 * 60 * 792,
    },
  ];
}

export function exportEntriesToCSV(entries: IncomeEntry[], currency: CurrencyCode): void {
  const headers = [
    'Fecha',
    'Concepto',
    'Origen / Cliente',
    'Categoría',
    'Método de pago',
    'Estado',
    `Monto (${currency})`,
    'Notas',
  ];

  const escapeCSV = (val: string | number | undefined): string => {
    const str = String(val ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const receivedSum = entries
    .filter((e) => e.status === 'Recibido')
    .reduce((acc, e) => acc + e.amount, 0);

  const rows = entries.map((e) => [
    e.date,
    e.concept,
    e.source || '',
    e.category,
    e.method,
    e.status,
    e.amount.toFixed(2),
    e.notes || '',
  ]);

  rows.push([
    '',
    'SUMA TOTAL RECIBIDA',
    '',
    '',
    '',
    '',
    receivedSum.toFixed(2),
    '',
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `ingresos_${getTodayISO()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
