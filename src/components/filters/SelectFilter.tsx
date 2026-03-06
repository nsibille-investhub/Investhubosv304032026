import { useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Button } from '../ui/button';

interface SelectFilterProps {
  options: { value: string; label: string }[];
  onApply: (value: string) => void;
}

export function SelectFilter({ options, onApply }: SelectFilterProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleApply = () => {
    if (selected) {
      const selectedOption = options.find(opt => opt.value === selected);
      onApply(selectedOption?.label || selected);
    }
  };

  return (
    <div className="p-4">
      <h4 className="font-medium text-sm text-gray-900 mb-3">Sélectionner une option</h4>
      
      <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
        {options.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
            onClick={() => setSelected(option.value)}
            className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-all flex items-center justify-between ${
              selected === option.value
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{option.label}</span>
            {selected === option.value && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </motion.button>
        ))}
      </div>

      <Button
        onClick={handleApply}
        disabled={!selected}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50"
      >
        <Check className="w-4 h-4 mr-2" />
        Appliquer
      </Button>
    </div>
  );
}
