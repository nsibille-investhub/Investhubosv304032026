import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Filter } from 'lucide-react';
import { Button } from '../ui/button';

interface MatchRangeOption {
  value: string;
  label: string;
  range: { min: number; max: number };
}

interface MatchRangeFilterProps {
  onApply: (range: { min: number; max: number } | null) => void;
}

const MATCH_RANGE_OPTIONS: MatchRangeOption[] = [
  {
    value: 'high',
    label: '80% - 100% (Élevé)',
    range: { min: 80, max: 100 }
  },
  {
    value: 'medium_high',
    label: '60% - 79% (Moyen-Élevé)',
    range: { min: 60, max: 79 }
  },
  {
    value: 'medium',
    label: '40% - 59% (Moyen)',
    range: { min: 40, max: 59 }
  },
  {
    value: 'low',
    label: '0% - 39% (Faible)',
    range: { min: 0, max: 39 }
  }
];

export function MatchRangeFilter({ onApply }: MatchRangeFilterProps) {
  const [selectedRange, setSelectedRange] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelectedRange(value);
  };

  const handleApply = () => {
    if (selectedRange) {
      const option = MATCH_RANGE_OPTIONS.find(opt => opt.value === selectedRange);
      if (option) {
        onApply(option.range);
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
          <h4 className="font-medium text-sm text-gray-900">Sélectionner un % de match</h4>
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
          {MATCH_RANGE_OPTIONS.map((option) => {
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
                    <Filter className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
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
