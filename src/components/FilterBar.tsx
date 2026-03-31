import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { cn } from './ui/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'search';
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
  searchPlaceholder = 'Rechercher...',
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearAll,
  className,
  onAskAI,
  onAskAIDirect
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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
      <div className="flex items-center gap-3">
        {/* Recherche - toujours visible */}
        <div className="relative flex-1 min-w-[200px] max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
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
              <span>Filtres supplémentaires</span>
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
                          Filtres supplémentaires
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
                          Tout effacer
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
            title="Effacer tous les filtres"
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
              Filtres actifs :
            </span>
            {Object.entries(activeFilters).map(([filterId, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const filter = filters.find(f => f.id === filterId);
              if (!filter) return null;

              const displayValue = Array.isArray(value)
                ? `${value.length} sélectionné${value.length > 1 ? 's' : ''}`
                : filter.options?.find(o => o.value === value)?.label || value;

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
  const displayValue = value
    ? Array.isArray(value)
      ? value.length > 0
        ? `${value.length} sélectionné${value.length > 1 ? 's' : ''}`
        : filter.placeholder || filter.label
      : filter.options?.find(o => o.value === value)?.label || value
    : filter.placeholder || filter.label;

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
