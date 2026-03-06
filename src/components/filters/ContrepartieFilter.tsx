import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Check, Building2, TrendingUp, Users, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ContrepartieOption {
  id: string;
  name: string;
  type: 'investor' | 'distributor' | 'participation';
  reference: string;
}

interface ContrepartieFilterProps {
  options: ContrepartieOption[];
  onApply: (value: string[]) => void;
}

export function ContrepartieFilter({ options, onApply }: ContrepartieFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContreparties, setSelectedContreparties] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    
    const query = searchQuery.toLowerCase();
    return options.filter(option => 
      option.name.toLowerCase().includes(query) ||
      option.reference.toLowerCase().includes(query)
    );
  }, [searchQuery, options]);

  const handleToggle = (contrepartie: ContrepartieOption) => {
    setSelectedContreparties(prev => 
      prev.includes(contrepartie.name)
        ? prev.filter(s => s !== contrepartie.name)
        : [...prev, contrepartie.name]
    );
  };

  const handleRemove = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedContreparties(prev => prev.filter(s => s !== name));
  };

  const handleApply = () => {
    if (selectedContreparties.length > 0) {
      onApply(selectedContreparties);
    }
  };

  const handleClear = () => {
    setSelectedContreparties([]);
    setSearchQuery('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'investor':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'distributor':
        return <Users className="w-3.5 h-3.5 text-purple-600" />;
      case 'participation':
        return <Building2 className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'investor':
        return 'Investisseur';
      case 'distributor':
        return 'Distributeur';
      case 'participation':
        return 'Participation';
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'investor':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'distributor':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'participation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 w-96">
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-gray-900">Rechercher par contrepartie</h4>
        
        {/* Search input with autocomplete */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Nom ou référence..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
        </div>

        {/* Selected contreparties */}
        {selectedContreparties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
            {selectedContreparties.map((name) => {
              const option = options.find(o => o.name === name);
              return (
                <motion.div
                  key={name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Badge className="bg-white text-gray-700 border border-gray-300 px-2 py-1 flex items-center gap-1.5">
                    {option && getTypeIcon(option.type)}
                    <span className="text-xs">{name}</span>
                    <button
                      onClick={(e) => handleRemove(name, e)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Dropdown list */}
        {showDropdown && filteredOptions.length > 0 && (
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
            {filteredOptions.map((option) => {
              const isSelected = selectedContreparties.includes(option.name);
              
              return (
                <motion.div
                  key={option.id}
                  whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                  onClick={() => handleToggle(option)}
                  className="flex items-start gap-3 px-3 py-2.5 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                    isSelected 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(option.type)}
                      <span className="text-sm font-medium text-gray-900 truncate">{option.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{option.reference}</span>
                      <Badge className={`text-xs px-1.5 py-0.5 ${getTypeBadgeColor(option.type)}`}>
                        {getTypeLabel(option.type)}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {showDropdown && filteredOptions.length === 0 && searchQuery && (
          <div className="text-center py-8 text-gray-400 border border-gray-200 rounded-lg">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune contrepartie trouvée</p>
          </div>
        )}

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
            disabled={selectedContreparties.length === 0}
            className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] disabled:opacity-50"
            size="sm"
          >
            Appliquer ({selectedContreparties.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
