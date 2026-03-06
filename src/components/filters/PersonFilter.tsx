import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Search } from 'lucide-react';
import { Button } from '../ui/button';

interface PersonOption {
  value: string;
  label: string;
  email: string;
  avatar: string;
}

interface PersonFilterProps {
  options: PersonOption[];
  onApply: (value: string) => void;
}

export function PersonFilter({ options, onApply }: PersonFilterProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = () => {
    if (selected) {
      const selectedOption = options.find(opt => opt.value === selected);
      onApply(selectedOption?.label || selected);
    }
  };

  const getAvatarColor = (avatar: string) => {
    const colors = [
      'from-[#0066FF] to-[#00C2FF]',
      'from-[#7C3AED] to-[#A78BFA]',
      'from-[#10B981] to-[#34D399]',
      'from-[#F59E0B] to-[#FBBF24]',
    ];
    const index = avatar.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="p-4">
      <h4 className="font-medium text-sm text-gray-900 mb-3">Sélectionner une personne</h4>
      
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
        {filteredOptions.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
            onClick={() => setSelected(option.value)}
            className={`w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all flex items-center gap-3 ${
              selected === option.value
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(option.avatar)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-white text-xs font-medium">{option.avatar}</span>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{option.label}</div>
              <div className="text-xs text-gray-500 truncate">{option.email}</div>
            </div>

            {/* Check */}
            {selected === option.value && (
              <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
            )}
          </motion.button>
        ))}
      </div>

      {filteredOptions.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          Aucune personne trouvée
        </div>
      )}

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
