import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { CurrencyCode, IncomeEntry } from '../types/income';
import {
  formatCurrency,
  formatDateShort,
  formatMonthYear,
} from '../utils/incomeHelpers';

interface DateBreakdownViewProps {
  entries: IncomeEntry[];
  currency: CurrencyCode;
  onSelectMonthFilter: (yearMonth: string) => void;
}

export const DateBreakdownView: React.FC<DateBreakdownViewProps> = ({
  entries,
  currency,
  onSelectMonthFilter,
}) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const months = useMemo(() => {
    const map = new Map<
      string,
      {
        yearMonth: string;
        label: string;
        receivedSum: number;
        pendingSum: number;
        count: number;
        items: IncomeEntry[];
      }
    >();

    for (const entry of entries) {
      const ym = entry.date.slice(0, 7);
      const existing = map.get(ym);
      const rec = entry.status === 'Recibido' ? entry.amount : 0;
      const pend = entry.status === 'Pendiente' ? entry.amount : 0;
      if (existing) {
        existing.receivedSum += rec;
        existing.pendingSum += pend;
        existing.count += 1;
        existing.items.push(entry);
      } else {
        map.set(ym, {
          yearMonth: ym,
          label: formatMonthYear(ym),
          receivedSum: rec,
          pendingSum: pend,
          count: 1,
          items: [entry],
        });
      }
    }

    return Array.from(map.values())
      .map((m) => ({
        ...m,
        items: [...m.items].sort((a, b) => b.date.localeCompare(a.date)),
      }))
      .sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
  }, [entries]);

  const maxMonthTotal = useMemo(
    () => Math.max(...months.map((m) => m.receivedSum), 1),
    [months]
  );

  const grandTotal = useMemo(
    () => months.reduce((acc, m) => acc + m.receivedSum, 0),
    [months]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-150">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Acumulado mensual por fecha
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Desglose mes a mes con la suma total recibida en cada periodo.
            </p>
          </div>
          <div className="text-right">
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Suma total acumulada
            </span>
            <span className="font-mono text-xl font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatCurrency(grandTotal, currency)}
            </span>
          </div>
        </div>

        {months.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No hay registros con fecha para agrupar mensualmente.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {months.map((m) => {
              const isOpen = expandedMonth === m.yearMonth;
              const widthPct = Math.max((m.receivedSum / maxMonthTotal) * 100, 2);
              return (
                <div key={m.yearMonth} className="py-3.5 first:pt-1 last:pb-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMonth(isOpen ? null : m.yearMonth)
                      }
                      className="flex items-center gap-2 text-left text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-800 dark:hover:text-teal-400 transition-colors"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                      )}
                      <span>{m.label}</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        · {m.count} {m.count === 1 ? 'registro' : 'registros'}
                      </span>
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onSelectMonthFilter(m.yearMonth)}
                        className="text-xs font-medium text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline whitespace-nowrap"
                      >
                        Ver en tabla
                      </button>
                      <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {formatCurrency(m.receivedSum, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="h-full rounded-full bg-teal-700 dark:bg-teal-500 transition-all duration-200"
                    />
                  </div>

                  {isOpen && (
                    <div className="mt-3 pl-6 border-t border-slate-100 dark:border-slate-800 pt-2">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {m.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-slate-100 dark:border-slate-800/70 last:border-b-0 text-xs"
                            >
                              <td className="py-2 pr-3 font-mono text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                                {formatDateShort(item.date)}
                              </td>
                              <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-medium">
                                {item.concept}
                                {item.source ? ` · ${item.source}` : ''}
                              </td>
                              <td className="py-2 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                {item.category} · {item.status}
                              </td>
                              <td className="py-2 pl-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                                {formatCurrency(item.amount, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

interface CategoryBreakdownViewProps {
  entries: IncomeEntry[];
  currency: CurrencyCode;
}

export const CategoryBreakdownView: React.FC<CategoryBreakdownViewProps> = ({
  entries,
  currency,
}) => {
  const received = useMemo(
    () => entries.filter((e) => e.status === 'Recibido'),
    [entries]
  );

  const totalReceived = useMemo(
    () => received.reduce((acc, e) => acc + e.amount, 0),
    [received]
  );

  const byCategory = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    for (const item of received) {
      const cur = map.get(item.category);
      if (cur) {
        cur.total += item.amount;
        cur.count += 1;
      } else {
        map.set(item.category, { name: item.category, total: item.amount, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [received]);

  const byMethod = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number }>();
    for (const item of received) {
      const cur = map.get(item.method);
      if (cur) {
        cur.total += item.amount;
        cur.count += 1;
      } else {
        map.set(item.method, { name: item.method, total: item.amount, count: 1 });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [received]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-150">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Ingresos por categoría
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Participación sobre el total recibido
            </p>
          </div>
          <span className="font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalReceived, currency)}
          </span>
        </div>

        {byCategory.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No hay ingresos recibidos para desglosar.
          </p>
        ) : (
          <div className="space-y-4">
            {byCategory.map((cat) => {
              const pct = totalReceived > 0 ? (cat.total / totalReceived) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {cat.count} {cat.count === 1 ? 'ingreso' : 'ingresos'} ·{' '}
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatCurrency(cat.total, currency)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(pct, 2)}%` }}
                      className="h-full rounded-full bg-teal-700 dark:bg-teal-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-colors duration-150">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 flex items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Ingresos por método de pago
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Canales donde se recibieron los cobros
            </p>
          </div>
          <span className="font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {formatCurrency(totalReceived, currency)}
          </span>
        </div>

        {byMethod.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No hay ingresos recibidos para desglosar.
          </p>
        ) : (
          <div className="space-y-4">
            {byMethod.map((m) => {
              const pct = totalReceived > 0 ? (m.total / totalReceived) * 100 : 0;
              return (
                <div key={m.name} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {m.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {m.count} {m.count === 1 ? 'ingreso' : 'ingresos'} ·{' '}
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatCurrency(m.total, currency)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(pct, 2)}%` }}
                      className="h-full rounded-full bg-slate-700 dark:bg-slate-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
