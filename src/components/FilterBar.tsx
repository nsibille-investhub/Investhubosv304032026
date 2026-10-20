import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from './ui/utils';
import { Checkbox } from './ui/checkbox';
import { DateRangePicker } from './ui/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useTranslation } from '../utils/languageContext';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  /** dateRange : valeur [début, fin] en dates ISO, chaîne vide pour une borne ouverte. */
  type: 'select' | 'multiselect' | 'search' | 'dateRange';
  options?: FilterOption[];
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean; // Si true, affiché en permanence
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  activeFilters?: Record<string, string | string[]>;
  onFilterChange?: (filterId: string, value: string | string[] | null) => void;
  onClearAll?: () => void;
  className?: string;
  onAskAI?: () => void;
  onAskAIDirect?: (query: string) => void;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  className,
  onAskAI,
  onAskAIDirect
}: FilterBarProps) {
  const { t, lang } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resolvedSearchPlaceholder = searchPlaceholder ?? t('common.filterBar.searchPlaceholder');

  const primaryFilters = filters?.filter(f => f.isPrimary) || [];
  const secondaryFilters = filters?.filter(f => !f.isPrimary) || [];

  const activeFiltersCount = Object.values(activeFilters || {}).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== '';
  }).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Ligne principale de filtres */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Recherche - toujours visible */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={resolvedSearchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
          />
        </div>

        {/* Filtres primaires */}
        {primaryFilters.map(filter => (
          <FilterSelect
            key={filter.id}
            filter={filter}
            value={activeFilters[filter.id]}
            onChange={(value) => onFilterChange?.(filter.id, value)}
          />
        ))}

        {/* Bouton "Filtres supplémentaires" */}
        {secondaryFilters.length > 0 && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  'px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium',
                showAdvanced || activeFiltersCount > 0
                  ? 'bg-[#E8EFF6] border-[#AFC2D9] text-[#060D19]'
                  : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>{t('common.filterBar.additionalFilters')}</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#060D19] text-white text-xs font-bold min-w-[20px] text-center">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 transition-transform',
                  showAdvanced && 'rotate-180'
                )}
              />
            </motion.button>

            {/* Dropdown filtres supplémentaires */}
            <AnimatePresence>
              {showAdvanced && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAdvanced(false)}
                    className="fixed inset-0 z-40"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-full mt-2 w-[420px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {t('common.filterBar.additionalFilters')}
                        </span>
                      </div>
                      {hasActiveFilters && onClearAll && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClearAll();
                          }}
                          className="text-xs text-[#060D19] hover:text-[#0B3C49] font-medium transition-colors"
                        >
                          {t('common.filterBar.clearAll')}
                        </button>
                      )}
                    </div>

                    {/* Filtres */}
                    <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                      {secondaryFilters.map(filter => (
                        <div key={filter.id}>
                          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {filter.label}
                          </label>
                          <FilterSelect
                            filter={filter}
                            value={activeFilters[filter.id]}
                            onChange={(value) => onFilterChange?.(filter.id, value)}
                            fullWidth
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Bouton "Effacer tout" */}
        {hasActiveFilters && onClearAll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearAll}
            className="px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            title={t('common.filterBar.clearAllTooltip')}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Chips des filtres actifs */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {t('common.filterBar.activeFilters')}
            </span>
            {Object.entries(activeFilters).map(([filterId, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const filter = filters.find(f => f.id === filterId);
              if (!filter) return null;

              const displayValue = filterValueLabel(filter, value, t, lang);

              return (
                <motion.div
                  key={filterId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-2.5 py-1 rounded-md bg-[#E8EFF6] border border-[#AFC2D9] flex items-center gap-1.5 group"
                >
                  <span className="text-xs font-medium text-[#060D19]">
                    {filter.label}:
                  </span>
                  <span className="text-xs text-[#0B3C49]">
                    {displayValue}
                  </span>
                  <button
                    onClick={() => onFilterChange?.(filterId, null)}
                    className="ml-0.5 p-0.5 rounded hover:bg-[#D8E4F0] transition-colors"
                  >
                    <X className="w-3 h-3 text-[#0B3C49]" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

function formatIsoDate(iso: string, lang: string) {
  return new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
}

function filterValueLabel(filter: FilterConfig, value: string | string[], t: Translate, lang: string): string {
  if (filter.type === 'dateRange' && Array.isArray(value)) {
    const [from = '', to = ''] = value;
    if (from && to) return t('common.filterBar.dateRange', { from: formatIsoDate(from, lang), to: formatIsoDate(to, lang) });
    if (from) return t('common.filterBar.dateFrom', { from: formatIsoDate(from, lang) });
    return t('common.filterBar.dateTo', { to: formatIsoDate(to, lang) });
  }
  if (Array.isArray(value)) {
    if (value.length === 1) return filter.options?.find(o => o.value === value[0])?.label || value[0];
    return t('common.filterBar.selectedMany', { count: value.length });
  }
  return filter.options?.find(o => o.value === value)?.label || value;
}

const toIsoDay = (date: Date | undefined) =>
  date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';

const fromIsoDay = (iso: string | undefined) => {
  if (!iso) return undefined;
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

function FilterDateRange({
  filter,
  value,
  onChange,
  fullWidth,
}: {
  filter: FilterConfig;
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null) => void;
  fullWidth: boolean;
}) {
  const { t } = useTranslation();
  const [from, to] = Array.isArray(value) ? value : [];
  return (
    <DateRangePicker
      from={fromIsoDay(from)}
      to={fromIsoDay(to)}
      onRangeChange={(start, end) => onChange(start || end ? [toIsoDay(start), toIsoDay(end)] : null)}
      placeholder={filter.placeholder || filter.label}
      clearLabel={t('common.filterBar.clear')}
      className={fullWidth ? 'w-full' : 'w-[240px] shrink-0'}
    />
  );
}

function FilterMultiSelect({
  filter,
  value,
  onChange,
  fullWidth,
}: {
  filter: FilterConfig;
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null) => void;
  fullWidth: boolean;
}) {
  const { t, lang } = useTranslation();
  const [query, setQuery] = useState('');
  const selected = Array.isArray(value) ? value : [];
  const hasValue = selected.length > 0;
  const options = filter.options ?? [];
  const visibleOptions = query.trim()
    ? options.filter(option => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const toggle = (optionValue: string) => {
    const next = selected.includes(optionValue)
      ? selected.filter(item => item !== optionValue)
      : [...selected, optionValue];
    onChange(next.length > 0 ? next : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'relative px-3 py-2.5 pr-8 bg-white dark:bg-gray-900 border rounded-lg text-sm font-medium text-left truncate transition-all focus:outline-none focus:ring-2 focus:ring-[#0B3C49]',
            fullWidth ? 'w-full' : 'w-[200px] shrink-0',
            hasValue
              ? 'border-[#AFC2D9] text-[#060D19] bg-[#E8EFF6]'
              : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
          )}
        >
          {hasValue ? filterValueLabel(filter, selected, t, lang) : filter.placeholder || filter.label}
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-0">
        {options.length > 8 && (
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('common.filterBar.searchOptions')}
                aria-label={t('common.filterBar.searchOptions')}
                className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3C49]"
              />
            </div>
          </div>
        )}
        <div className="max-h-64 overflow-y-auto p-1">
          {visibleOptions.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">{t('common.filterBar.noOption')}</p>
          ) : (
            visibleOptions.map(option => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
              >
                <Checkbox checked={selected.includes(option.value)} onCheckedChange={() => toggle(option.value)} />
                <span className="truncate">{option.label}</span>
              </label>
            ))
          )}
        </div>
        {hasValue && (
          <div className="border-t border-border p-1">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="w-full rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#060D19] hover:bg-muted"
            >
              {t('common.filterBar.clearSelection')}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Composant de sélection de filtre
function FilterSelect({
  filter,
  value,
  onChange,
  fullWidth = false
}: {
  filter: FilterConfig;
  value: string | string[] | null | undefined;
  onChange: (value: string | string[] | null) => void;
  fullWidth?: boolean;
}) {
  if (filter.type === 'multiselect') {
    return <FilterMultiSelect filter={filter} value={value} onChange={onChange} fullWidth={fullWidth} />;
  }
  if (filter.type === 'dateRange') {
    return <FilterDateRange filter={filter} value={value} onChange={onChange} fullWidth={fullWidth} />;
  }

  const hasValue = value && (Array.isArray(value) ? value.length > 0 : true);

  return (
    <div className={cn('relative', fullWidth ? 'w-full' : 'min-w-[160px]')}>
      <select
        value={Array.isArray(value) ? '' : value || ''}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(newValue === '' ? null : newValue);
        }}
        className={cn(
          'w-full px-3 py-2.5 pr-8 bg-white dark:bg-gray-900 border rounded-lg text-sm font-medium appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-[#0B3C49]',
          hasValue
            ? 'border-[#AFC2D9] text-[#060D19] bg-[#E8EFF6]'
            : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
        )}
      >
        <option value="">{filter.placeholder || filter.label}</option>
        {filter.options?.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
