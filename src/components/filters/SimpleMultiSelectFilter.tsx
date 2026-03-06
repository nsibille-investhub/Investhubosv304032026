import { useState } from 'react';
import { LucideIcon, Check } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { motion } from 'motion/react';

interface SimpleMultiSelectFilterProps {
  label: string;
  icon?: LucideIcon;
  options: { value: string; label: string }[];
  onSelectionChange: (selected: string[]) => void;
  triggerClassName?: string;
}

export function SimpleMultiSelectFilter({
  label,
  icon: Icon,
  options,
  onSelectionChange,
  triggerClassName = '',
}: SimpleMultiSelectFilterProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    setSelected(newSelected);
    onSelectionChange(newSelected);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${triggerClassName}`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
          {selected.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
              {selected.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <motion.div
              key={option.value}
              whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
              onClick={() => toggleOption(option.value)}
              className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-all flex items-center gap-3 cursor-pointer ${
                selected.includes(option.value)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-all ${
                selected.includes(option.value)
                  ? 'bg-blue-600 border-blue-600'
                  : 'border-gray-300'
              }`}>
                {selected.includes(option.value) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span>{option.label}</span>
            </motion.div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
