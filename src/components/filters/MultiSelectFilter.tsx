import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

interface MultiSelectFilterProps {
  options: { value: string; label: string }[];
  onApply: (values: string[]) => void;
}

export function MultiSelectFilter({ options, onApply }: MultiSelectFilterProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (value: string) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    if (selected.length > 0) {
      const selectedLabels = selected.map(val => 
        options.find(opt => opt.value === val)?.label || val
      );
      onApply(selectedLabels);
    }
  };

  const clearAll = () => {
    setSelected([]);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm text-gray-900">Sélectionner des options</h4>
        {selected.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAll}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Effacer
          </motion.button>
        )}
      </div>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-50 rounded-lg">
          {selected.map((value) => {
            const option = options.find(opt => opt.value === value);
            return (
              <Badge
                key={value}
                className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 flex items-center gap-1"
              >
                <span className="text-xs">{option?.label}</span>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleOption(value);
                  }}
                  className="cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </motion.div>
              </Badge>
            );
          })}
        </div>
      )}
      
      <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
        {options.map((option) => (
          <motion.div
            key={option.value}
            whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
            onClick={() => toggleOption(option.value)}
            className="w-full px-3 py-2 text-left text-sm rounded-lg transition-all flex items-center gap-3 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(option.value)}
              className="pointer-events-none"
            />
            <span className="text-gray-700">{option.label}</span>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={handleApply}
        disabled={selected.length === 0}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
      >
        <Check className="w-4 h-4 mr-2" />
        Appliquer ({selected.length})
      </Button>
    </div>
  );
}
