import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Check, X } from 'lucide-react';
import { Button } from '../ui/button';

interface DateRangeOption {
  value: string;
  label: string;
  getDates: () => { start: Date; end: Date };
}

interface DateRangeFilterProps {
  onApply: (range: { start: string; end: string } | null) => void;
}

const DATE_RANGE_OPTIONS: DateRangeOption[] = [
  {
    value: 'last_7_days',
    label: '7 derniers jours',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start, end };
    }
  },
  {
    value: 'last_30_days',
    label: '30 derniers jours',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start, end };
    }
  },
  {
    value: 'last_90_days',
    label: '3 derniers mois',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 90);
      return { start, end };
    }
  },
  {
    value: 'this_month',
    label: 'Ce mois-ci',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start, end };
    }
  },
  {
    value: 'last_month',
    label: 'Mois dernier',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, end };
    }
  },
  {
    value: 'this_year',
    label: 'Cette année',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return { start, end };
    }
  }
];

export function DateRangeFilter({ onApply }: DateRangeFilterProps) {
  const [selectedRange, setSelectedRange] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelectedRange(value);
  };

  const handleApply = () => {
    if (selectedRange) {
      const option = DATE_RANGE_OPTIONS.find(opt => opt.value === selectedRange);
      if (option) {
        const { start, end } = option.getDates();
        onApply({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        });
      }
    }
  };

  const handleClear = () => {
    setSelectedRange(null);
    onApply(null);
  };

  return (
    <div className="p-4 w-80">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-900">Sélectionner une période</h4>
          {selectedRange && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Effacer
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {DATE_RANGE_OPTIONS.map((option) => {
            const isSelected = selectedRange === option.value;
            
            return (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(option.value)}
                className={`
                  flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border
                  ${isSelected 
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'bg-blue-100' 
                      : 'bg-gray-100'
                    }
                  `}>
                    <Calendar className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                  </div>
                  
                  <div>
                    <p className={`font-medium text-sm ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                      {option.label}
                    </p>
                  </div>
                </div>

                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected 
                    ? 'bg-white border-blue-600' 
                    : 'border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-2 border-t border-gray-200">
          <Button
            onClick={handleApply}
            disabled={!selectedRange}
            className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] disabled:opacity-50"
            size="sm"
          >
            <Check className="w-4 h-4 mr-2" />
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
}
