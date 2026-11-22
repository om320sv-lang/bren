import React, { useState } from 'react';
import {
  CalendarDays,
  Layers,
  LayoutDashboard,
  Moon,
  RotateCcw,
  Sun,
  Trash2,
  X,
} from 'lucide-react';
import { ActiveTab, CurrencyCode, ThemeMode } from '../types/income';
import { CURRENCIES } from '../utils/incomeHelpers';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  currency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  totalEntriesCount: number;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onChangeTheme,
  currency,
  onChangeCurrency,
  totalEntriesCount,
  onLoadSampleData,
  onClearAllData,
  mobileOpen,
  onCloseMobile,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Resumen y registro',
      icon: <LayoutDashboard className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'by_date',
      label: 'Por fecha y mes',
      icon: <CalendarDays className="h-4 w-4 shrink-0" />,
    },
    {
      id: 'by_category',
      label: 'Por categoría',
      icon: <Layers className="h-4 w-4 shrink-0" />,
    },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 transition-colors duration-150">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0">
            Afluencia
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Navegación principal" className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-5">
        <div className="space-y-2">
          <span className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            Tema de apariencia
          </span>
          <div
            className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-1"
            role="group"
            aria-label="Selector de tema"
          >
            <button
              type="button"
              onClick={() => onChangeTheme('light')}
              aria-pressed={theme === 'light'}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sun className="h-3.5 w-3.5 shrink-0" />
              <span>Claro</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-slate-900 text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Moon className="h-3.5 w-3.5 shrink-0" />
              <span>Oscuro</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="currency-selector"
            className="block text-xs font-medium text-slate-600 dark:text-slate-400"
          >
            Moneda de visualización
          </label>
          <select
            id="currency-selector"
            value={currency}
            onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
            className="h-10 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm font-medium text-slate-900 dark:text-slate-100 transition-colors focus:border-teal-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {totalEntriesCount}{' '}
            {totalEntriesCount === 1 ? 'registro guardado' : 'registros guardados'}
          </p>

          <button
            type="button"
            onClick={() => {
              onLoadSampleData();
              setConfirmClear(false);
            }}
            className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <RotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span>Restaurar datos de ejemplo</span>
          </button>

          {totalEntriesCount > 0 && !confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Limpiar todos los registros</span>
            </button>
          )}

          {confirmClear && (
            <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 p-3 space-y-2.5">
              <p className="text-xs font-medium text-rose-900 dark:text-rose-200">
                ¿Eliminar todos los ingresos guardados?
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllData();
                    setConfirmClear(false);
                  }}
                  className="flex-1 h-8 rounded-md bg-rose-700 px-2.5 text-xs font-medium text-white hover:bg-rose-800 transition-colors whitespace-nowrap"
                >
                  Sí, limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-60 shrink-0">{sidebarContent}</aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
