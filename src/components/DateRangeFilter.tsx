import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import { DatePicker } from './ui/date-picker';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = 'Filtrer par date',
  className
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasDateRange = startDate || endDate;

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} - ${endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
    }
    if (startDate) {
      return `Depuis le ${startDate.toLocaleDateString('fr-FR')}`;
    }
    if (endDate) {
      return `Jusqu'au ${endDate.toLocaleDateString('fr-FR')}`;
    }
    return placeholder;
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartDateChange(null);
    onEndDateChange(null);
  };

  return (
    <div className={cn('relative', className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'min-h-[42px] px-3 py-2 pr-8 rounded-lg border text-sm transition-all flex items-center gap-2 min-w-[160px]',
              hasDateRange
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            )}
          >
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1 text-left">{formatDateRange()}</span>
            {hasDateRange && (
              <button
                onClick={handleClear}
                className="absolute right-2 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            {hasDateRange ? (
              <div className="space-y-1">
                {startDate && (
                  <div>
                    <span className="font-semibold">Début :</span> {startDate.toLocaleDateString('fr-FR')}
                  </div>
                )}
                {endDate && (
                  <div>
                    <span className="font-semibold">Fin :</span> {endDate.toLocaleDateString('fr-FR')}
                  </div>
                )}
              </div>
            ) : (
              'Sélectionner une période'
            )}
          </div>
        </TooltipContent>
      </Tooltip>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute left-0 top-full mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden min-w-[320px]"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Période
                    </span>
                  </div>
                  {hasDateRange && (
                    <button
                      onClick={handleClear}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Date de début */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date de début
                  </label>
                  <DatePicker
                    date={startDate || undefined}
                    onDateChange={onStartDateChange}
                    placeholder="Aucune limite"
                  />
                  {startDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Affiche les actualités à partir du {startDate.toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                {/* Date de fin */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date de fin
                  </label>
                  <DatePicker
                    date={endDate || undefined}
                    onDateChange={onEndDateChange}
                    placeholder="Aucune limite"
                  />
                  {endDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      Affiche les actualités jusqu'au {endDate.toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                {/* Validation visuelle */}
                {startDate && endDate && startDate > endDate && (
                  <div className="p-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      ⚠️ La date de début doit être antérieure à la date de fin
                    </p>
                  </div>
                )}
              </div>

              {/* Footer - Raccourcis */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-semibold">
                  Raccourcis :
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastWeek = new Date(today);
                      lastWeek.setDate(today.getDate() - 7);
                      onStartDateChange(lastWeek);
                      onEndDateChange(today);
                    }}
                    className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    7 derniers jours
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today);
                      lastMonth.setMonth(today.getMonth() - 1);
                      onStartDateChange(lastMonth);
                      onEndDateChange(today);
                    }}
                    className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    30 derniers jours
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastYear = new Date(today);
                      lastYear.setFullYear(today.getFullYear() - 1);
                      onStartDateChange(lastYear);
                      onEndDateChange(today);
                    }}
                    className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Année écoulée
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const startOfYear = new Date(today.getFullYear(), 0, 1);
                      onStartDateChange(startOfYear);
                      onEndDateChange(today);
                    }}
                    className="px-2 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cette année
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}