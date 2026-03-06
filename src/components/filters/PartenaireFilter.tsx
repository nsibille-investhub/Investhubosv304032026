import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Check, Search, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface PartenaireFilterProps {
  label?: string;
  partners: string[];
  onSelectionChange: (selected: string[]) => void;
  triggerClassName?: string;
  initialSelected?: string[];
}

export function PartenaireFilter({
  label = 'Partenaire',
  partners,
  onSelectionChange,
  triggerClassName = '',
  initialSelected = []
}: PartenaireFilterProps) {
  const [open, setOpen] = useState(false);
  const [selectedPartners, setSelectedPartners] = useState<string[]>(initialSelected);
  const [searchTerm, setSearchTerm] = useState('');

  // Option "Direct" est toujours en haut
  const DIRECT_OPTION = 'Direct';

  // Filtrer les partenaires par recherche
  const filteredPartners = partners.filter(partner =>
    partner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (partner: string) => {
    const newSelection = selectedPartners.includes(partner)
      ? selectedPartners.filter(p => p !== partner)
      : [...selectedPartners, partner];
    
    setSelectedPartners(newSelection);
  };

  const handleApply = () => {
    onSelectionChange(selectedPartners);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedPartners([]);
    setSearchTerm('');
  };

  const isDirectSelected = selectedPartners.includes(DIRECT_OPTION);
  const selectedPartnersCount = selectedPartners.filter(p => p !== DIRECT_OPTION).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 relative ${triggerClassName}`}
        >
          <Building2 className="w-4 h-4 text-gray-600" />
          {label}
          {selectedPartners.length > 0 && (
            <Badge className="ml-1 h-5 min-w-5 px-1.5 bg-blue-600 text-white">
              {selectedPartners.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="start">
        <div className="flex flex-col max-h-[400px]">
          {/* Header with search */}
          <div className="p-3 border-b border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-900">Sélectionner partenaire(s)</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un partenaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Option "Direct" toujours en haut */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
            <motion.button
              whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
              onClick={() => handleToggle(DIRECT_OPTION)}
              className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-blue-50/50 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-all ${
                  isDirectSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300 group-hover:border-blue-400'
                }`}>
                  {isDirectSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">Direct</span>
                  <span className="text-xs text-gray-500">Investisseurs sans partenaire</span>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                Sans partenaire
              </Badge>
            </motion.button>
          </div>

          {/* Liste des partenaires avec scroll */}
          <div className="flex-1 overflow-y-auto">
            {filteredPartners.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Aucun partenaire trouvé
              </div>
            ) : (
              <div className="p-2">
                {filteredPartners.map((partner) => {
                  const isSelected = selectedPartners.includes(partner);
                  return (
                    <motion.button
                      key={partner}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                      onClick={() => handleToggle(partner)}
                      className="w-full px-3 py-2 flex items-center gap-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`flex items-center justify-center w-4 h-4 rounded border-2 transition-all ${
                        isSelected
                          ? 'bg-gray-900 border-gray-900'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm flex-1 text-left ${
                        isSelected ? 'font-medium text-gray-900' : 'text-gray-700'
                      }`}>
                        {partner}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with actions */}
          <div className="p-3 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between gap-2">
            <div className="text-xs text-gray-600">
              {selectedPartners.length > 0 ? (
                <>
                  {isDirectSelected && selectedPartnersCount > 0 && (
                    <span>Direct + {selectedPartnersCount} partenaire{selectedPartnersCount > 1 ? 's' : ''}</span>
                  )}
                  {isDirectSelected && selectedPartnersCount === 0 && (
                    <span>Direct seulement</span>
                  )}
                  {!isDirectSelected && selectedPartnersCount > 0 && (
                    <span>{selectedPartnersCount} partenaire{selectedPartnersCount > 1 ? 's' : ''}</span>
                  )}
                </>
              ) : (
                <span>Aucune sélection</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={selectedPartners.length === 0}
                className="h-7 px-2 text-xs"
              >
                Effacer
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                className="h-7 px-3 text-xs text-white hover:opacity-90"
              >
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
