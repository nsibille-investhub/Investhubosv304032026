import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Check, X, Sparkles, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';

interface DateFilterProps {
  onApply: (value: string) => void;
}

type PresetOption = {
  id: string;
  label: string;
  shortLabel: string;
  icon?: string;
  badge?: string;
  getDates: () => { start: Date; end: Date };
};

export function DateFilter({ onApply }: DateFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>('last_30_days');
  const [customRange, setCustomRange] = useState<{ start?: Date; end?: Date }>({});
  const [isCustomMode, setIsCustomMode] = useState(false);

  const presetOptions: PresetOption[] = [
    {
      id: 'today',
      label: 'Aujourd\'hui',
      shortLabel: 'Today',
      icon: '📅',
      badge: 'Hot',
      getDates: () => {
        const today = new Date();
        return { start: today, end: today };
      }
    },
    {
      id: 'yesterday',
      label: 'Hier',
      shortLabel: 'Yesterday',
      icon: '⏮️',
      getDates: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: yesterday };
      }
    },
    {
      id: 'last_7_days',
      label: '7 derniers jours',
      shortLabel: 'Last 7d',
      icon: '📊',
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        return { start, end };
      }
    },
    {
      id: 'last_30_days',
      label: '30 derniers jours',
      shortLabel: 'Last 30d',
      icon: '📈',
      badge: 'Popular',
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return { start, end };
      }
    },
    {
      id: 'last_90_days',
      label: '90 derniers jours',
      shortLabel: 'Last 90d',
      icon: '🗓️',
      getDates: () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 90);
        return { start, end };
      }
    },
    {
      id: 'this_month',
      label: 'Ce mois-ci',
      shortLabel: 'This month',
      icon: '📅',
      getDates: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start, end };
      }
    },
    {
      id: 'last_month',
      label: 'Mois dernier',
      shortLabel: 'Last month',
      icon: '⏪',
      getDates: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start, end };
      }
    },
    {
      id: 'this_year',
      label: 'Cette année',
      shortLabel: 'This year',
      icon: '🎯',
      getDates: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return { start, end };
      }
    }
  ];

  const handlePresetClick = (presetId: string) => {
    setSelectedPreset(presetId);
    setIsCustomMode(false);
    setCustomRange({});
  };

  const handleCustomClick = () => {
    setIsCustomMode(true);
    setSelectedPreset(null);
  };

  const handleClear = () => {
    setSelectedPreset(null);
    setIsCustomMode(false);
    setCustomRange({});
  };

  const handleApply = () => {
    if (selectedPreset) {
      const preset = presetOptions.find(p => p.id === selectedPreset);
      if (preset) {
        onApply(preset.label);
      }
    } else if (customRange.start && customRange.end) {
      const dateRange = `${customRange.start.toLocaleDateString('fr-FR')} - ${customRange.end.toLocaleDateString('fr-FR')}`;
      onApply(dateRange);
    }
  };

  const formatDateRange = () => {
    if (selectedPreset) {
      const preset = presetOptions.find(p => p.id === selectedPreset);
      if (preset) {
        const { start, end } = preset.getDates();
        return `${start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
    } else if (customRange.start && customRange.end) {
      return `${customRange.start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${customRange.end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    } else if (customRange.start) {
      return `Depuis ${customRange.start.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return 'Aucune période sélectionnée';
  };

  const isApplyDisabled = !selectedPreset && !(customRange.start && customRange.end);

  return (
    <div className="w-[420px] p-0 bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <CalendarIcon className="w-4 h-4 text-blue-600" />
            </motion.div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Last Update Filter</h4>
              <p className="text-xs text-gray-500">Sélectionnez une période</p>
            </div>
          </div>
          {(selectedPreset || customRange.start) && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Quick Presets */}
      <div className="px-5 py-4 bg-gradient-to-b from-gray-50/50 to-transparent">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Quick Select</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presetOptions.map((preset) => (
            <motion.button
              key={preset.id}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handlePresetClick(preset.id)}
              className={`relative group px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedPreset === preset.id
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {preset.icon && <span className="text-xs">{preset.icon}</span>}
                <span>{preset.shortLabel}</span>
              </div>
              
              {/* Badge */}
              {preset.badge && selectedPreset !== preset.id && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold rounded-full shadow-sm"
                >
                  {preset.badge}
                </motion.span>
              )}
              
              {/* Active indicator */}
              {selectedPreset === preset.id && (
                <motion.div
                  layoutId="activePreset"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="px-5 py-3 flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <span className="text-xs text-gray-400 font-medium">ou</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      {/* Custom Range */}
      <div className="px-5 pb-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleCustomClick}
          className={`w-full px-4 py-3 rounded-xl border-2 border-dashed transition-all duration-200 ${
            isCustomMode
              ? 'border-blue-400 bg-blue-50/50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className={`w-4 h-4 ${isCustomMode ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${isCustomMode ? 'text-blue-900' : 'text-gray-600'}`}>
                Sélection personnalisée
              </span>
            </div>
            <motion.div
              animate={{ rotate: isCustomMode ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <CalendarIcon className={`w-4 h-4 ${isCustomMode ? 'text-blue-600' : 'text-gray-400'}`} />
            </motion.div>
          </div>
        </motion.button>

        <AnimatePresence>
          {isCustomMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Date début</label>
                    <Calendar
                      mode="single"
                      selected={customRange.start}
                      onSelect={(date) => setCustomRange(prev => ({ ...prev, start: date }))}
                      className="rounded-lg border border-gray-200 bg-white p-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">Date fin</label>
                    <Calendar
                      mode="single"
                      selected={customRange.end}
                      onSelect={(date) => setCustomRange(prev => ({ ...prev, end: date }))}
                      disabled={(date) => customRange.start ? date < customRange.start : false}
                      className="rounded-lg border border-gray-200 bg-white p-2"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {(selectedPreset || customRange.start) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 pb-4"
          >
            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">Période sélectionnée</span>
              </div>
              <p className="text-sm font-medium text-blue-900">{formatDateRange()}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex gap-2">
        <Button
          onClick={handleClear}
          variant="outline"
          className="flex-1"
          disabled={!selectedPreset && !customRange.start}
        >
          Réinitialiser
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
          disabled={isApplyDisabled}
        >
          <Check className="w-4 h-4 mr-2" />
          Appliquer
        </Button>
      </div>
    </div>
  );
}
