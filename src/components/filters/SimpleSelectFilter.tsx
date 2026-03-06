import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface SimpleSelectFilterProps {
  label: string;
  icon?: LucideIcon;
  options: string[];
  onSelect: (value: string) => void;
  triggerClassName?: string;
}

export function SimpleSelectFilter({
  label,
  icon: Icon,
  options,
  onSelect,
  triggerClassName = '',
}: SimpleSelectFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${triggerClassName}`}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {options.map((option) => (
            <motion.button
              key={option}
              whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
              onClick={() => onSelect(option)}
              className="w-full px-3 py-2 text-left text-sm rounded-lg transition-all flex items-center justify-between text-gray-700 hover:bg-gray-50"
            >
              <span>{option}</span>
            </motion.button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
