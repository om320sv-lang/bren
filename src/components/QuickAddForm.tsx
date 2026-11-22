import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  CurrencyCode,
  IncomeCategory,
  IncomeEntry,
  IncomeStatus,
  PaymentMethod,
} from '../types/income';
import {
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  getOffsetDateISO,
  getTodayISO,
} from '../utils/incomeHelpers';

interface QuickAddFormProps {
  currency: CurrencyCode;
  onAdd: (entry: Omit<IncomeEntry, 'id' | 'createdAt'>) => void;
}

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ currency, onAdd }) => {
  const [date, setDate] = useState<string>(getTodayISO());
  const [concept, setConcept] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [category, setCategory] = useState<IncomeCategory>('Servicios');
  const [method, setMethod] = useState<PaymentMethod>('Transferencia');
  const [amountStr, setAmountStr] = useState<string>('');
  const [status, setStatus] = useState<IncomeStatus>('Recibido');
  const [error, setError] = useState<string>('');

  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amountStr.replace(/,/g, '.'));

    if (!date) {
      setError('Selecciona una fecha válida para el ingreso.');
      return;
    }
    if (!concept.trim()) {
      setError('Escribe un concepto o descripción del ingreso.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto numérico mayor a cero.');
      return;
    }

    setError('');
    onAdd({
      date,
      concept: concept.trim(),
      source: source.trim(),
      category,
      method,
      amount: Math.round(parsedAmount * 100) / 100,
      status,
    });

    setConcept('');
    setSource('');
    setAmountStr('');
  };

  const inputClass =
    'h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20';

  return (
    <section
      aria-label="Registrar nuevo ingreso"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-150"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Registrar ingreso
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Captura fecha, concepto y monto para sumarlo al control general.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setDate(getTodayISO())}
            className={`h-8 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              date === getTodayISO()
                ? 'border-teal-700 dark:border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setDate(getOffsetDateISO(-1))}
            className={`h-8 rounded-md border px-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              date === getOffsetDateISO(-1)
                ? 'border-teal-700 dark:border-teal-600 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Ayer
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-2">
            <label
              htmlFor="quick-date"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Fecha
            </label>
            <input
              id="quick-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (error) setError('');
              }}
              className={`${inputClass} font-mono`}
              required
            />
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="quick-concept"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Concepto
            </label>
            <input
              id="quick-concept"
              type="text"
              value={concept}
              onChange={(e) => {
                setConcept(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. Pago diseño, Venta #42"
              className={inputClass}
              required
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="quick-source"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Cliente / Origen
            </label>
            <input
              id="quick-source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Opcional"
              className={inputClass}
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="quick-category"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Categoría
            </label>
            <select
              id="quick-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as IncomeCategory)}
              className={inputClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="quick-amount"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Monto recibido
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-sm text-slate-500 dark:text-slate-400">
                {currencySymbol}
              </span>
              <input
                id="quick-amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (error) setError('');
                }}
                placeholder="0.00"
                className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 text-right font-mono text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="quick-method"
                className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap"
              >
                Método:
              </label>
              <select
                id="quick-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
              role="group"
              aria-label="Estado del ingreso"
            >
              <button
                type="button"
                onClick={() => setStatus('Recibido')}
                className={`h-7 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  status === 'Recibido'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Recibido
              </button>
              <button
                type="button"
                onClick={() => setStatus('Pendiente')}
                className={`h-7 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  status === 'Pendiente'
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Pendiente
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-teal-800 dark:hover:bg-teal-600 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span>Agregar ingreso</span>
          </button>
        </div>

        {error && (
          <p role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-400">
            {error}
          </p>
        )}
      </form>
    </section>
  );
};
