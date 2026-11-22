import React, { useMemo, useState } from 'react';
import { CurrencyCode, IncomeEntry } from '../types/income';
import {
  formatCurrency,
  formatDateShort,
  formatMonthYear,
} from '../utils/incomeHelpers';

interface IncomeChartProps {
  entries: IncomeEntry[];
  currency: CurrencyCode;
}

type ChartGranularity = 'day' | 'month';

export const IncomeChart: React.FC<IncomeChartProps> = ({ entries, currency }) => {
  const [granularity, setGranularity] = useState<ChartGranularity>('day');
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const buckets = useMemo(() => {
    const received = entries.filter((e) => e.status === 'Recibido');
    const map = new Map<string, { key: string; label: string; fullLabel: string; total: number; count: number }>();

    for (const item of received) {
      const key = granularity === 'day' ? item.date : item.date.slice(0, 7);
      const existing = map.get(key);
      if (existing) {
        existing.total += item.amount;
        existing.count += 1;
      } else {
        const label =
          granularity === 'day'
            ? item.date.slice(8, 10) + '/' + item.date.slice(5, 7)
            : item.date.slice(5, 7) + '/' + item.date.slice(2, 4);
        const fullLabel =
          granularity === 'day' ? formatDateShort(item.date) : formatMonthYear(key);
        map.set(key, {
          key,
          label,
          fullLabel,
          total: item.amount,
          count: 1,
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-18);
  }, [entries, granularity]);

  const maxTotal = useMemo(() => {
    const max = Math.max(...buckets.map((b) => b.total), 0);
    return max > 0 ? max : 1;
  }, [buckets]);

  const activeBucket = buckets.find((b) => b.key === hoveredKey) || buckets[buckets.length - 1] || null;

  return (
    <section
      aria-label="Distribución de ingresos por fecha"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-150"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            Evolución por fecha
          </h2>
          {activeBucket ? (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
              {activeBucket.fullLabel} ·{' '}
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(activeBucket.total, currency)}
              </span>{' '}
              · {activeBucket.count}{' '}
              {activeBucket.count === 1 ? 'ingreso' : 'ingresos'}
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Suma agrupada cronológicamente según los filtros activos.
            </p>
          )}
        </div>

        <div
          className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
          role="group"
          aria-label="Agrupación del gráfico"
        >
          <button
            type="button"
            onClick={() => setGranularity('day')}
            className={`h-8 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              granularity === 'day'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Por día
          </button>
          <button
            type="button"
            onClick={() => setGranularity('month')}
            className={`h-8 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              granularity === 'month'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Por mes
          </button>
        </div>
      </div>

      {buckets.length === 0 ? (
        <div className="flex h-44 items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No hay ingresos recibidos para graficar en este rango de fechas.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto pb-1">
          <div className="min-w-[460px] h-48 flex items-end gap-2 pt-6 px-1 border-b border-slate-200 dark:border-slate-800">
            {buckets.map((bucket) => {
              const heightPct = Math.max((bucket.total / maxTotal) * 100, 4);
              const isSelected = activeBucket?.key === bucket.key;
              return (
                <button
                  key={bucket.key}
                  type="button"
                  onMouseEnter={() => setHoveredKey(bucket.key)}
                  onFocus={() => setHoveredKey(bucket.key)}
                  onClick={() => setHoveredKey(bucket.key)}
                  aria-label={`${bucket.fullLabel}: ${formatCurrency(bucket.total, currency)}`}
                  className="group flex-1 min-w-[26px] h-full flex flex-col items-center justify-end gap-2 focus:outline-none"
                >
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[38px] rounded-t-md transition-colors duration-150 ${
                        isSelected
                          ? 'bg-teal-700 dark:bg-teal-500'
                          : 'bg-teal-600/35 dark:bg-teal-500/30 group-hover:bg-teal-700/75 dark:group-hover:bg-teal-500/70'
                      }`}
                    />
                  </div>
                  <span
                    className={`font-mono text-[11px] tabular-nums pb-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'font-semibold text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {bucket.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
