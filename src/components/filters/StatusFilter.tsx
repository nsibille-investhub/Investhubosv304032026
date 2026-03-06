import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, AlertCircle, Clock, Check, Circle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface StatusOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  options: StatusOption[];
  onApply: (value: string[]) => void;
}

export function StatusFilter({ options, onApply }: StatusFilterProps) {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleToggle = (value: string) => {
    setSelectedStatuses(prev => 
      prev.includes(value)
        ? prev.filter(s => s !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    if (selectedStatuses.length > 0) {
      onApply(selectedStatuses);
    }
  };

  const handleClear = () => {
    setSelectedStatuses([]);
  };

  const getStatusIcon = (value: string) => {
    switch (value) {
      case 'clear':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'true_hit':
        return <AlertCircle className="w-4 h-4" />;
      case 'new_hit':
        return <Circle className="w-4 h-4 fill-current" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (value: string) => {
    switch (value) {
      case 'clear':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100';
      case 'true_hit':
        return 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100';
      case 'new_hit':
        return 'bg-purple-50 text-[#7C3AED] border-purple-300 hover:bg-purple-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100';
    }
  };

  const getStatusLabel = (value: string) => {
    switch (value) {
      case 'pending':
        return 'Pending';
      case 'clear':
        return 'Clear';
      case 'true_hit':
        return 'True Hit';
      case 'new_hit':
        return 'New Hit';
      default:
        return value;
    }
  };

  return (
    <div className="p-4 w-80">
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-900">Sélectionner un ou plusieurs statuts</h4>
        
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selectedStatuses.includes(option.value);
            
            return (
              <motion.div
                key={option.value}
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleToggle(option.value)}
                className={`
                  flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border
                  ${isSelected 
                    ? getStatusColor(option.value) + ' shadow-sm' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-9 h-9 rounded-lg flex items-center justify-center transition-all
                    ${isSelected 
                      ? getStatusColor(option.value).replace('hover:', '').replace('bg-', 'bg-opacity-100 bg-')
                      : 'bg-gray-100'
                    }
                  `}>
                    <div className={isSelected ? '' : 'text-gray-500'}>
                      {getStatusIcon(option.value)}
                    </div>
                  </div>
                  
                  <div>
                    <p className={`font-medium text-sm ${isSelected ? '' : 'text-gray-700'}`}>
                      {getStatusLabel(option.value)}
                    </p>
                  </div>
                </div>

                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${isSelected 
                    ? 'bg-white border-current' 
                    : 'border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <button
            onClick={handleClear}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Effacer
          </button>
          <Button
            onClick={handleApply}
            disabled={selectedStatuses.length === 0}
            className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] disabled:opacity-50"
            size="sm"
          >
            Appliquer ({selectedStatuses.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
