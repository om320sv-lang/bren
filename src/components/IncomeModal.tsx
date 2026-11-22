import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
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
  getTodayISO,
} from '../utils/incomeHelpers';

interface IncomeModalProps {
  isOpen: boolean;
  editingEntry: IncomeEntry | null;
  currency: CurrencyCode;
  onClose: () => void;
  onSave: (
    data: Omit<IncomeEntry, 'id' | 'createdAt'>,
    existingId?: string
  ) => void;
}

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  editingEntry,
  currency,
  onClose,
  onSave,
}) => {
  const [date, setDate] = useState(getTodayISO());
  const [concept, setConcept] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Servicios');
  const [method, setMethod] = useState<PaymentMethod>('Transferencia');
  const [amountStr, setAmountStr] = useState('');
  const [status, setStatus] = useState<IncomeStatus>('Recibido');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingEntry) {
      setDate(editingEntry.date);
      setConcept(editingEntry.concept);
      setSource(editingEntry.source);
      setCategory(editingEntry.category);
      setMethod(editingEntry.method);
      setAmountStr(String(editingEntry.amount));
      setStatus(editingEntry.status);
      setNotes(editingEntry.notes || '');
    } else {
      setDate(getTodayISO());
      setConcept('');
      setSource('');
      setCategory('Servicios');
      setMethod('Transferencia');
      setAmountStr('');
      setStatus('Recibido');
      setNotes('');
    }
    setError('');
  }, [isOpen, editingEntry]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currencySymbol = CURRENCIES[currency]?.symbol || '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(amountStr.replace(/,/g, '.'));
    if (!date) {
      setError('La fecha es obligatoria.');
      return;
    }
    if (!concept.trim()) {
      setError('El concepto es obligatorio.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }

    onSave(
      {
        date,
        concept: concept.trim(),
        source: source.trim(),
        category,
        method,
        amount: Math.round(parsedAmount * 100) / 100,
        status,
        notes: notes.trim() || undefined,
      },
      editingEntry?.id
    );
    onClose();
  };

  const inputClass =
    'h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="income-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/45 dark:bg-black/65 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
          <div>
            <h2
              id="income-modal-title"
              className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {editingEntry ? 'Editar ingreso' : 'Nuevo ingreso'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Completa los datos y la fecha de recepción.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="modal-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Fecha de recepción
              </label>
              <input
                id="modal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputClass} font-mono`}
                required
              />
            </div>

            <div>
              <label
                htmlFor="modal-amount"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Monto
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-mono text-sm text-slate-500 dark:text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  id="modal-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 text-right font-mono text-sm font-medium text-slate-900 dark:text-slate-100 tabular-nums focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="modal-concept"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Concepto o descripción
            </label>
            <input
              id="modal-concept"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Pago de servicios profesionales"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="modal-source"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Cliente / Origen
              </label>
              <input
                id="modal-source"
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Nombre o entidad (opcional)"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="modal-category"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Categoría
              </label>
              <select
                id="modal-category"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="modal-method"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Método de pago
              </label>
              <select
                id="modal-method"
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className={inputClass}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Estado
              </span>
              <div className="inline-flex h-10 w-full items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setStatus('Recibido')}
                  className={`flex-1 h-8 rounded-md text-xs font-medium transition-colors ${
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
                  className={`flex-1 h-8 rounded-md text-xs font-medium transition-colors ${
                    status === 'Pendiente'
                      ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Pendiente
                </button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="modal-notes"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Notas adicionales
            </label>
            <textarea
              id="modal-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referencia bancaria, número de factura o comentarios..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs font-medium text-rose-700 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-teal-700 px-5 text-sm font-medium text-white hover:bg-teal-800 dark:hover:bg-teal-600 transition-colors whitespace-nowrap"
            >
              {editingEntry ? 'Guardar cambios' : 'Guardar ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
