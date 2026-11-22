import React, { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  CurrencyCode,
  DateRangePreset,
  IncomeCategory,
  IncomeEntry,
  IncomeStatus,
  SortField,
  SortOrder,
} from '../types/income';
import {
  CATEGORIES,
  formatCurrency,
  formatDateShort,
  formatDateWeekday,
} from '../utils/incomeHelpers';

interface IncomeTableProps {
  entries: IncomeEntry[];
  totalUnfilteredCount: number;
  currency: CurrencyCode;
  datePreset: DateRangePreset;
  onChangeDatePreset: (preset: DateRangePreset) => void;
  dateFrom: string;
  dateTo: string;
  onChangeDateFrom: (val: string) => void;
  onChangeDateTo: (val: string) => void;
  searchQuery: string;
  onChangeSearch: (val: string) => void;
  categoryFilter: IncomeCategory | 'all';
  onChangeCategoryFilter: (val: IncomeCategory | 'all') => void;
  statusFilter: IncomeStatus | 'all';
  onChangeStatusFilter: (val: IncomeStatus | 'all') => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onToggleSort: (field: SortField) => void;
  onResetFilters: () => void;
  onEdit: (entry: IncomeEntry) => void;
  onDuplicate: (entry: IncomeEntry) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenNewModal: () => void;
}

export const IncomeTable: React.FC<IncomeTableProps> = ({
  entries,
  totalUnfilteredCount,
  currency,
  datePreset,
  onChangeDatePreset,
  dateFrom,
  dateTo,
  onChangeDateFrom,
  onChangeDateTo,
  searchQuery,
  onChangeSearch,
  categoryFilter,
  onChangeCategoryFilter,
  statusFilter,
  onChangeStatusFilter,
  sortField,
  sortOrder,
  onToggleSort,
  onResetFilters,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onOpenNewModal,
}) => {
  const [groupByDate, setGroupByDate] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: 'all', label: 'Todo' },
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
    { id: 'prev_month', label: 'Mes pasado' },
    { id: 'custom', label: 'Rango' },
  ];

  const receivedSum = useMemo(
    () =>
      entries
        .filter((e) => e.status === 'Recibido')
        .reduce((acc, e) => acc + e.amount, 0),
    [entries]
  );

  const pendingSum = useMemo(
    () =>
      entries
        .filter((e) => e.status === 'Pendiente')
        .reduce((acc, e) => acc + e.amount, 0),
    [entries]
  );

  const groupedByDate = useMemo(() => {
    const map = new Map<string, { date: string; items: IncomeEntry[]; receivedTotal: number }>();
    for (const item of entries) {
      const existing = map.get(item.date);
      const addVal = item.status === 'Recibido' ? item.amount : 0;
      if (existing) {
        existing.items.push(item);
        existing.receivedTotal += addVal;
      } else {
        map.set(item.date, {
          date: item.date,
          items: [item],
          receivedTotal: addVal,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      sortOrder === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
    );
  }, [entries, sortOrder]);

  const hasActiveFilters =
    datePreset !== 'all' ||
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all';

  const renderRow = (entry: IncomeEntry) => {
    const isConfirming = confirmDeleteId === entry.id;
    const isReceived = entry.status === 'Recibido';

    return (
      <tr
        key={entry.id}
        className="group border-b border-slate-100 dark:border-slate-800/80 last:border-b-0 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
      >
        <td className="py-2.5 pl-5 pr-3 font-mono text-xs text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
          {formatDateShort(entry.date)}
        </td>

        <td className="py-2.5 px-3 min-w-[200px]">
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
            {entry.concept}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
            {entry.source && <span>{entry.source}</span>}
            {entry.source && <span aria-hidden="true">·</span>}
            <span>{entry.category}</span>
            <span aria-hidden="true">·</span>
            <span>{entry.method}</span>
            {entry.notes && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[240px]" title={entry.notes}>
                  {entry.notes}
                </span>
              </>
            )}
          </div>
        </td>

        <td className="py-2.5 px-3 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onToggleStatus(entry.id)}
            title="Cambiar estado entre Recibido y Pendiente"
            className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors rounded px-1.5 py-1 -ml-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap ${
              isReceived
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-700 dark:text-amber-400'
            }`}
          >
            {isReceived ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Clock className="h-3.5 w-3.5 shrink-0" />
            )}
            <span>{entry.status}</span>
          </button>
        </td>

        <td
          className={`py-2.5 px-3 text-right font-mono text-sm font-semibold tabular-nums whitespace-nowrap ${
            isReceived
              ? 'text-slate-900 dark:text-slate-100'
              : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {formatCurrency(entry.amount, currency)}
        </td>

        <td className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
          {isConfirming ? (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onDelete(entry.id);
                  setConfirmDeleteId(null);
                }}
                aria-label="Confirmar eliminación"
                className="inline-flex h-8 items-center gap-1 rounded-md bg-rose-700 px-2.5 text-xs font-medium text-white hover:bg-rose-800 transition-colors whitespace-nowrap"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Eliminar</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                aria-label="Cancelar eliminación"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(entry)}
                aria-label={`Editar ${entry.concept}`}
                title="Editar ingreso"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDuplicate(entry)}
                aria-label={`Duplicar ${entry.concept}`}
                title="Duplicar ingreso"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(entry.id)}
                aria-label={`Eliminar ${entry.concept}`}
                title="Eliminar ingreso"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </td>
      </tr>
    );
  };

  return (
    <section
      aria-label="Control y listado de ingresos"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-150"
    >
      <div className="border-b border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
              Historial de ingresos
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Mostrando {entries.length} de {totalUnfilteredCount}{' '}
              {totalUnfilteredCount === 1 ? 'registro' : 'registros'}
            </p>
          </div>

          <div
            className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
            role="group"
            aria-label="Modo de visualización de la tabla"
          >
            <button
              type="button"
              onClick={() => setGroupByDate(false)}
              className={`h-8 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                !groupByDate
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Lista continua
            </button>
            <button
              type="button"
              onClick={() => setGroupByDate(true)}
              className={`h-8 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                groupByDate
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Agrupado por fecha
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
            role="group"
            aria-label="Filtro rápido por fecha"
          >
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangeDatePreset(preset.id)}
                className={`h-8 rounded-md px-3 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  datePreset === preset.id
                    ? 'bg-white dark:bg-slate-900 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="filter-from"
                className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"
              >
                Desde
              </label>
              <input
                id="filter-from"
                type="date"
                value={dateFrom}
                onChange={(e) => onChangeDateFrom(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-mono text-xs text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="filter-to"
                className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"
              >
                Hasta
              </label>
              <input
                id="filter-to"
                type="date"
                value={dateTo}
                onChange={(e) => onChangeDateTo(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 font-mono text-xs text-slate-900 dark:text-slate-100 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="relative sm:col-span-6">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Buscar por concepto, cliente o nota..."
              aria-label="Buscar ingresos"
              className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) =>
                onChangeCategoryFilter(e.target.value as IncomeCategory | 'all')
              }
              aria-label="Filtrar por categoría"
              className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-800 dark:text-slate-200 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="all">Todas las categorías</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) =>
                onChangeStatusFilter(e.target.value as IncomeStatus | 'all')
              }
              aria-label="Filtrar por estado"
              className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm text-slate-800 dark:text-slate-200 focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
            >
              <option value="all">Todos los estados</option>
              <option value="Recibido">Solo recibidos</option>
              <option value="Pendiente">Solo pendientes</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                title="Restablecer filtros"
                className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-14 text-center space-y-3">
          <p className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
            {totalUnfilteredCount === 0
              ? 'Aún no hay ingresos registrados'
              : 'Ningún ingreso coincide con los filtros actuales'}
          </p>
          <p className="mx-auto max-w-md text-sm text-slate-500 dark:text-slate-400">
            {totalUnfilteredCount === 0
              ? 'Registra tu primer cobro con su fecha arriba o desde el botón principal para comenzar a calcular la suma total.'
              : 'Prueba cambiando el rango de fechas o limpiando la búsqueda para ver tus registros.'}
          </p>
          <div className="pt-2">
            {totalUnfilteredCount === 0 ? (
              <button
                type="button"
                onClick={onOpenNewModal}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800 dark:hover:bg-teal-600 transition-colors whitespace-nowrap"
              >
                Registrar primer ingreso
              </button>
            ) : (
              <button
                type="button"
                onClick={onResetFilters}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-xs font-medium text-slate-600 dark:text-slate-300">
                <th className="py-2.5 pl-5 pr-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleSort('date')}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span>Fecha</span>
                    <ArrowDownUp
                      className={`h-3 w-3 ${
                        sortField === 'date'
                          ? 'text-teal-700 dark:text-teal-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  </button>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleSort('concept')}
                    className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <span>Concepto y detalle</span>
                    <ArrowDownUp
                      className={`h-3 w-3 ${
                        sortField === 'concept'
                          ? 'text-teal-700 dark:text-teal-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  </button>
                </th>
                <th className="py-2.5 px-3 whitespace-nowrap">Estado</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleSort('amount')}
                    className="inline-flex items-center justify-end gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto"
                  >
                    <span>Monto</span>
                    <ArrowDownUp
                      className={`h-3 w-3 ${
                        sortField === 'amount'
                          ? 'text-teal-700 dark:text-teal-400'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    />
                  </button>
                </th>
                <th className="py-2.5 pl-3 pr-5 text-right whitespace-nowrap">
                  Acciones
                </th>
              </tr>
            </thead>

            {!groupByDate ? (
              <tbody>{entries.map((entry) => renderRow(entry))}</tbody>
            ) : (
              groupedByDate.map((group) => (
                <tbody key={group.date}>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
                    <td colSpan={3} className="py-2 pl-5 pr-3 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {formatDateWeekday(group.date)} ·{' '}
                      <span className="font-normal text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                        {group.items.length}{' '}
                        {group.items.length === 1 ? 'movimiento' : 'movimientos'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-xs font-semibold text-teal-800 dark:text-teal-300 tabular-nums whitespace-nowrap">
                      {formatCurrency(group.receivedTotal, currency)}
                    </td>
                    <td className="py-2 pl-3 pr-5 text-right text-[11px] text-slate-500 dark:text-slate-400">
                      Subtotal del día
                    </td>
                  </tr>
                  {group.items.map((entry) => renderRow(entry))}
                </tbody>
              ))
            )}

            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/70">
                <td colSpan={3} className="py-3.5 pl-5 pr-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Suma total recibida (selección actual)
                  {pendingSum > 0 && (
                    <span className="ml-2 font-normal text-xs text-amber-700 dark:text-amber-400 font-mono tabular-nums">
                      · Pendiente por cobrar: {formatCurrency(pendingSum, currency)}
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-base font-bold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                  {formatCurrency(receivedSum, currency)}
                </td>
                <td className="py-3.5 pl-3 pr-5" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
};
