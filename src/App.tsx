import { useEffect, useMemo, useState } from 'react';
import { Download, Menu, Plus } from 'lucide-react';
import {
  ActiveTab,
  CurrencyCode,
  DateRangePreset,
  IncomeCategory,
  IncomeEntry,
  IncomeStatus,
  SortField,
  SortOrder,
  ThemeMode,
} from './types/income';
import {
  createSeedEntries,
  exportEntriesToCSV,
  formatDateWeekday,
  generateId,
  getEndOfMonthISO,
  getPresetDateRange,
  getStartOfMonthISO,
  getTodayISO,
} from './utils/incomeHelpers';
import { Sidebar } from './components/Sidebar';
import { SummaryStrip } from './components/SummaryStrip';
import { QuickAddForm } from './components/QuickAddForm';
import { IncomeChart } from './components/IncomeChart';
import { IncomeTable } from './components/IncomeTable';
import { IncomeModal } from './components/IncomeModal';
import {
  CategoryBreakdownView,
  DateBreakdownView,
} from './components/DateAndCategoryViews';

const STORAGE_ENTRIES_KEY = 'afluencia_ingresos_v1';
const STORAGE_CURRENCY_KEY = 'afluencia_moneda_v1';
const STORAGE_THEME_KEY = 'afluencia_tema_v1';

function loadInitialEntries(): IncomeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_ENTRIES_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fallback to seed data if storage is unavailable or corrupted
  }
  return createSeedEntries();
}

function loadInitialCurrency(): CurrencyCode {
  try {
    const saved = localStorage.getItem(STORAGE_CURRENCY_KEY);
    if (saved) {
      return saved as CurrencyCode;
    }
  } catch {
    // Ignore storage error
  }
  return 'MXN';
}

function loadInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // Ignore storage error
  }
  return 'light';
}

export default function App() {
  const [entries, setEntries] = useState<IncomeEntry[]>(loadInitialEntries);
  const [currency, setCurrency] = useState<CurrencyCode>(loadInitialCurrency);
  const [theme, setTheme] = useState<ThemeMode>(loadInitialTheme);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters & Sorting
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<IncomeCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IncomeStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null);

  // Sync theme class on <html> and persist to localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Persist entries and currency
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(entries));
    } catch {
      // Ignore storage quota errors
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CURRENCY_KEY, currency);
    } catch {
      // Ignore storage errors
    }
  }, [currency]);

  const handleChangeDatePreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      return;
    }
    const range = getPresetDateRange(preset);
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const handleChangeDateFrom = (val: string) => {
    setDateFrom(val);
    setDatePreset(val || dateTo ? 'custom' : 'all');
  };

  const handleChangeDateTo = (val: string) => {
    setDateTo(val);
    setDatePreset(dateFrom || val ? 'custom' : 'all');
  };

  const handleResetFilters = () => {
    setDatePreset('all');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
  };

  const handleToggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'concept' ? 'asc' : 'desc');
    }
  };

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return entries
      .filter((entry) => {
        if (dateFrom && entry.date < dateFrom) return false;
        if (dateTo && entry.date > dateTo) return false;
        if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
        if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
        if (query) {
          const haystack = `${entry.concept} ${entry.source} ${entry.category} ${entry.method} ${entry.notes || ''}`.toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'date') {
          cmp = a.date.localeCompare(b.date);
          if (cmp === 0) cmp = a.createdAt - b.createdAt;
        } else if (sortField === 'amount') {
          cmp = a.amount - b.amount;
        } else {
          cmp = a.concept.localeCompare(b.concept, 'es');
        }
        return sortOrder === 'asc' ? cmp : -cmp;
      });
  }, [
    entries,
    dateFrom,
    dateTo,
    categoryFilter,
    statusFilter,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  const isFiltered =
    datePreset !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    statusFilter !== 'all';

  const handleAddEntry = (data: Omit<IncomeEntry, 'id' | 'createdAt'>) => {
    const newEntry: IncomeEntry = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  const handleSaveModal = (
    data: Omit<IncomeEntry, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === existingId ? { ...item, ...data } : item
        )
      );
    } else {
      handleAddEntry(data);
    }
  };

  const handleDuplicate = (entry: IncomeEntry) => {
    const copy: IncomeEntry = {
      ...entry,
      id: generateId(),
      date: getTodayISO(),
      createdAt: Date.now(),
    };
    setEntries((prev) => [copy, ...prev]);
  };

  const handleToggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'Recibido' ? 'Pendiente' : 'Recibido',
            }
          : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectMonthFromBreakdown = (yearMonth: string) => {
    const [y, m] = yearMonth.split('-').map(Number);
    const refDate = new Date(y, (m || 1) - 1, 1);
    setDateFrom(getStartOfMonthISO(refDate));
    setDateTo(getEndOfMonthISO(refDate));
    setDatePreset('custom');
    setActiveTab('overview');
  };

  const tabTitles: Record<ActiveTab, string> = {
    overview: 'Resumen y registro',
    by_date: 'Por fecha y mes',
    by_category: 'Por categoría',
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        theme={theme}
        onChangeTheme={setTheme}
        currency={currency}
        onChangeCurrency={setCurrency}
        totalEntriesCount={entries.length}
        onLoadSampleData={() => setEntries(createSeedEntries())}
        onClearAllData={() => setEntries([])}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 transition-colors duration-150">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <span>Control de ingresos</span>
                <span aria-hidden="true">/</span>
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {tabTitles[activeTab]}
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {formatDateWeekday(getTodayISO())}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => exportEntriesToCSV(filteredEntries, currency)}
              disabled={filteredEntries.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingEntry(null);
                setModalOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-teal-800 dark:hover:bg-teal-600 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Nuevo ingreso</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1280px] w-full mx-auto space-y-6">
          <SummaryStrip
            filteredEntries={filteredEntries}
            allEntries={entries}
            currency={currency}
            isFiltered={isFiltered}
          />

          {activeTab === 'overview' && (
            <>
              <QuickAddForm currency={currency} onAdd={handleAddEntry} />

              <IncomeChart entries={filteredEntries} currency={currency} />

              <IncomeTable
                entries={filteredEntries}
                totalUnfilteredCount={entries.length}
                currency={currency}
                datePreset={datePreset}
                onChangeDatePreset={handleChangeDatePreset}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onChangeDateFrom={handleChangeDateFrom}
                onChangeDateTo={handleChangeDateTo}
                searchQuery={searchQuery}
                onChangeSearch={setSearchQuery}
                categoryFilter={categoryFilter}
                onChangeCategoryFilter={setCategoryFilter}
                statusFilter={statusFilter}
                onChangeStatusFilter={setStatusFilter}
                sortField={sortField}
                sortOrder={sortOrder}
                onToggleSort={handleToggleSort}
                onResetFilters={handleResetFilters}
                onEdit={(entry) => {
                  setEditingEntry(entry);
                  setModalOpen(true);
                }}
                onDuplicate={handleDuplicate}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onOpenNewModal={() => {
                  setEditingEntry(null);
                  setModalOpen(true);
                }}
              />
            </>
          )}

          {activeTab === 'by_date' && (
            <DateBreakdownView
              entries={entries}
              currency={currency}
              onSelectMonthFilter={handleSelectMonthFromBreakdown}
            />
          )}

          {activeTab === 'by_category' && (
            <CategoryBreakdownView
              entries={filteredEntries}
              currency={currency}
            />
          )}
        </main>
      </div>

      <IncomeModal
        isOpen={modalOpen}
        editingEntry={editingEntry}
        currency={currency}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveModal}
      />
    </div>
  );
}
