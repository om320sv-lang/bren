export type IncomeCategory =
  | 'Servicios'
  | 'Ventas'
  | 'Honorarios'
  | 'Salario'
  | 'Inversiones'
  | 'Reembolsos'
  | 'Otros';

export type PaymentMethod =
  | 'Transferencia'
  | 'Efectivo'
  | 'Tarjeta'
  | 'Depósito'
  | 'Digital';

export type IncomeStatus = 'Recibido' | 'Pendiente';

export type CurrencyCode = 'MXN' | 'USD' | 'EUR' | 'COP' | 'ARS' | 'CLP' | 'PEN';

export type DateRangePreset =
  | 'all'
  | 'today'
  | 'week'
  | 'month'
  | 'prev_month'
  | 'custom';

export type SortField = 'date' | 'amount' | 'concept';
export type SortOrder = 'asc' | 'desc';

export type ActiveTab = 'overview' | 'by_date' | 'by_category';

export type ThemeMode = 'light' | 'dark';

export interface IncomeEntry {
  id: string;
  date: string; // YYYY-MM-DD local date
  concept: string;
  source: string;
  category: IncomeCategory;
  method: PaymentMethod;
  amount: number;
  status: IncomeStatus;
  notes?: string;
  createdAt: number;
}

export interface CurrencyConfig {
  code: CurrencyCode;
  label: string;
  symbol: string;
  locale: string;
}
