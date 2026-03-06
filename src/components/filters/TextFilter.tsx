import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Search } from 'lucide-react';
import { Button } from '../ui/button';

interface TextFilterProps {
  onApply: (value: string) => void;
  suggestions?: string[];
}

export function TextFilter({ onApply, suggestions = [] }: TextFilterProps) {
  const [value, setValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(s =>
    s.toLowerCase().includes(value.toLowerCase())
  );

  const handleApply = () => {
    if (value.trim()) {
      onApply(value);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setValue(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="p-4">
      <h4 className="font-medium text-sm text-gray-900 mb-3">Rechercher</h4>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Saisir un texte..."
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        
        {/* Autocomplete suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
          >
            {filteredSuggestions.map((suggestion, idx) => (
              <motion.button
                key={idx}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      <Button
        onClick={handleApply}
        disabled={!value.trim()}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 mt-4"
      >
        <Check className="w-4 h-4 mr-2" />
        Appliquer
      </Button>
    </div>
  );
}
