import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, X, Calendar, FileText, Sparkles, Search, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { SelectFilter } from './filters/SelectFilter';
import { DateFilter } from './filters/DateFilter';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useTranslation } from '../utils/languageContext';

interface DocumentFilterBarProps {
  onFilterChange: (filters: any[]) => void;
}

export function DocumentFilterBar({ onFilterChange }: DocumentFilterBarProps) {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);

  const statusOptions = [
    { value: 'published', label: t('ged.filterBar.status.published') },
    { value: 'draft', label: t('ged.filterBar.status.draft') },
  ];

  const typeOptions = [
    { value: 'pdf', label: t('ged.filterBar.type.pdf') },
    { value: 'word', label: t('ged.filterBar.type.word') },
    { value: 'excel', label: t('ged.filterBar.type.excel') },
    { value: 'image', label: t('ged.filterBar.type.image') },
    { value: 'video', label: t('ged.filterBar.type.video') },
    { value: 'folder', label: t('ged.filterBar.type.folder') },
  ];

  const targetOptions = [
    { value: 'all', label: t('ged.filterBar.target.all') },
    { value: 'investors', label: t('ged.filterBar.target.investors') },
    { value: 'distributors', label: t('ged.filterBar.target.distributors') },
    { value: 'subscriptions', label: t('ged.filterBar.target.subscriptions') },
  ];

  const handleAddFilter = (type: string, value: any, label: string) => {
    const newFilter = { type, value, label };
    const updatedFilters = [...activeFilters.filter(f => f.type !== type), newFilter];
    setActiveFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleRemoveFilter = (filterToRemove: any) => {
    const updatedFilters = activeFilters.filter(f => f !== filterToRemove);
    setActiveFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleClearAll = () => {
    setActiveFilters([]);
    onFilterChange([]);
  };

  return (
    <div className="border-b border-gray-100 bg-white">
      {/* Filter Toggle Bar */}
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Input */}
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('ged.filterBar.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Ask AI Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.info(t('ged.toast.aiAssistantTitle'), { description: t('ged.toast.aiAssistantDesc') })}
            className="px-3 py-1.5 bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] text-white rounded-lg text-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('ged.filterBar.askAi')}
          </motion.button>

          {/* Status Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                {t('ged.filterBar.statusLabel')}
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <SelectFilter
                options={statusOptions}
                onApply={(value) => handleAddFilter('status', value, t('ged.filterBar.statusPrefix', { value: statusOptions.find(o => o.value === value)?.label ?? '' }))}
              />
            </PopoverContent>
          </Popover>

          {/* Type Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                {t('ged.filterBar.typeLabel')}
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <SelectFilter
                options={typeOptions}
                onApply={(value) => handleAddFilter('type', value, t('ged.filterBar.typePrefix', { value: typeOptions.find(o => o.value === value)?.label ?? '' }))}
              />
            </PopoverContent>
          </Popover>

          {/* Date Updated Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" />
                {t('ged.filterBar.periodLabel')}
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <DateFilter
                icon={Calendar}
                label={t('ged.filterBar.dateUpdatedLabel')}
                placeholder={t('ged.filterBar.datePlaceholder')}
                onSelect={(value, label) => handleAddFilter('updated', value, t('ged.filterBar.periodPrefix', { value: label }))}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {activeFilters.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 py-3 border-t border-gray-100 flex items-center gap-2 flex-wrap"
          >
            <span className="text-xs text-gray-500">{t('ged.filterBar.activeFilters')}</span>
            {activeFilters.map((filter, index) => (
              <motion.div
                key={`${filter.type}-${index}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Badge 
                  className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-100 transition-colors"
                >
                  <span className="text-xs">{filter.label}</span>
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleRemoveFilter(filter)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
            >
              {t('ged.filterBar.clearAll')}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
