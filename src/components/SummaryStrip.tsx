import React from 'react';
import { CurrencyCode, IncomeEntry } from '../types/income';
import { formatCurrency, formatDateShort } from '../utils/incomeHelpers';

interface SummaryStripProps {
  filteredEntries: IncomeEntry[];
  allEntries: IncomeEntry[];
  currency: CurrencyCode;
  isFiltered: boolean;
}

export const SummaryStrip: React.FC<SummaryStripProps> = ({
  filteredEntries,
  allEntries,
  currency,
  isFiltered,
}) => {
  const filteredReceived = filteredEntries.filter((e) => e.status === 'Recibido');
  const filteredPending = filteredEntries.filter((e) => e.status === 'Pendiente');
  const allReceived = allEntries.filter((e) => e.status === 'Recibido');

  const filteredSum = filteredReceived.reduce((acc, e) => acc + e.amount, 0);
  const filteredPendingSum = filteredPending.reduce((acc, e) => acc + e.amount, 0);
  const allTimeSum = allReceived.reduce((acc, e) => acc + e.amount, 0);

  const averageAmount =
    filteredReceived.length > 0 ? filteredSum / filteredReceived.length : 0;

  const highestEntry = filteredReceived.reduce<IncomeEntry | null>(
    (max, current) => (!max || current.amount > max.amount ? current : max),
    null
  );

  return (
    <section
      aria-label="Resumen de suma total e indicadores"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-150"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {isFiltered ? 'Suma total del periodo' : 'Suma total recibida'}
            </span>
          </div>
          <p className="font-mono text-2xl sm:text-[26px] font-semibold tracking-tight text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatCurrency(filteredSum, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {filteredReceived.length}{' '}
            {filteredReceived.length === 1 ? 'ingreso recibido' : 'ingresos recibidos'}
            {filteredPending.length > 0 && (
              <>
                {' · '}
                <span className="text-amber-700 dark:text-amber-400">
                  +{formatCurrency(filteredPendingSum, currency)} pendiente
                </span>
              </>
            )}
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Acumulado histórico recibido
          </span>
          <p className="font-mono text-2xl sm:text-[26px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(allTimeSum, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {allReceived.length}{' '}
            {allReceived.length === 1 ? 'registro cobrado' : 'registros cobrados'} en total
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Promedio por ingreso
          </span>
          <p className="font-mono text-2xl sm:text-[26px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(averageAmount, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Media aritmética de los ingresos recibidos en vista
          </p>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Ingreso individual más alto
          </span>
          <p className="font-mono text-2xl sm:text-[26px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
            {highestEntry ? formatCurrency(highestEntry.amount, currency) : formatCurrency(0, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {highestEntry
              ? `${highestEntry.concept} · ${formatDateShort(highestEntry.date)}`
              : 'Sin registros recibidos en la selección'}
          </p>
        </div>
      </div>
    </section>
  );
};
