import { useState } from 'react';
import { LucideIcon, Search } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { motion } from 'motion/react';

interface SimplePersonFilterProps {
  label: string;
  icon?: LucideIcon;
  people: string[];
  onSelect: (value: string) => void;
  triggerClassName?: string;
}

export function SimplePersonFilter({
  label,
  icon: Icon,
  people,
  onSelect,
  triggerClassName = '',
}: SimplePersonFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredPeople = people.filter(person =>
    person.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-[#0066FF] to-[#00C2FF]',
      'from-[#7C3AED] to-[#A78BFA]',
      'from-[#10B981] to-[#34D399]',
      'from-[#F59E0B] to-[#FBBF24]',
      'from-[#EF4444] to-[#F87171]',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleSelect = (person: string) => {
    onSelect(person);
    setIsOpen(false);
    setSearchQuery('');
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
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredPeople.map((person) => (
            <motion.button
              key={person}
              whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
              onClick={() => handleSelect(person)}
              className="w-full px-3 py-2.5 text-left text-sm rounded-lg transition-all flex items-center gap-3 hover:bg-gray-50"
            >
              {/* Avatar */}
              <div className={`w-8 h-8 bg-gradient-to-br ${getAvatarColor(person)} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-white text-xs font-medium">{getAvatarInitials(person)}</span>
              </div>
              
              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{person}</div>
              </div>
            </motion.button>
          ))}
        </div>

        {filteredPeople.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-500">
            Aucune personne trouvée
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
