import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Search, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';

interface LinkFilterProps {
  options: string[];
  onApply: (values: string[]) => void;
}

export function LinkFilter({ options, onApply }: LinkFilterProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (value: string) => {
    setSelected(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  const handleApply = () => {
    if (selected.length > 0) {
      onApply(selected);
    }
  };

  const clearAll = () => {
    setSelected([]);
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm text-gray-900">Sélectionner des liens</h4>
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

      {/* Search with autocomplete */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un lien..."
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Selected badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 p-2 bg-gray-50 rounded-lg max-h-24 overflow-y-auto">
          {selected.map((value) => (
            <Badge
              key={value}
              className="bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 flex items-center gap-1"
            >
              <span className="text-xs">{value}</span>
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
          ))}
        </div>
      )}
      
      {/* Options list */}
      <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
        {filteredOptions.map((option) => (
          <motion.div
            key={option}
            whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
            onClick={() => toggleOption(option)}
            className="w-full px-3 py-2 text-left text-sm rounded-lg transition-all flex items-center gap-3 cursor-pointer"
          >
            <Checkbox
              checked={selected.includes(option)}
              className="pointer-events-none"
            />
            <span className="text-gray-700">{option}</span>
          </motion.div>
        ))}
      </div>

      {filteredOptions.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          Aucun lien trouvé
        </div>
      )}

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
