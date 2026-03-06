import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ModernMultiSelect } from './ui/modern-multiselect';

interface RetrocessionFilterBarProps {
  onFilterChange: (filters: any) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchValue?: string;
  resetTrigger?: number;
  allData?: any[];
}

// Types de rétrocession
const TYPE_OPTIONS = ['Droits d\'entrée', 'Commissions'];

// Statuts de rétrocession
const STATUT_OPTIONS = ['En attente', 'À facturer', 'Facturé - A payer', 'Facturé - Payé'];

export function RetrocessionFilterBar({ 
  onFilterChange, 
  onSearchChange, 
  searchValue = '', 
  resetTrigger, 
  allData 
}: RetrocessionFilterBarProps) {
  const [nameSearch, setNameSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuts, setSelectedStatuts] = useState<string[]>([]);
  const [selectedPartenaires, setSelectedPartenaires] = useState<string[]>([]);
  const [selectedFonds, setSelectedFonds] = useState<string[]>([]);

  // Extraire les valeurs uniques pour les filtres
  const availablePartenaires = Array.from(
    new Set(allData?.map(r => r.partenaire).filter(Boolean) || [])
  ).sort() as string[];

  const availableFonds = Array.from(
    new Set(allData?.map(r => r.fonds).filter(Boolean) || [])
  ).sort() as string[];

  // Gérer les changements de recherche
  const handleNameSearchChange = (value: string) => {
    setNameSearch(value);
    onSearchChange?.(value);
  };

  // Mettre à jour les filtres à chaque changement d'état
  useEffect(() => {
    const filters: any = {};
    if (selectedTypes.length > 0) filters.types = selectedTypes;
    if (selectedStatuts.length > 0) filters.statuts = selectedStatuts;
    if (selectedPartenaires.length > 0) filters.partenaires = selectedPartenaires;
    if (selectedFonds.length > 0) filters.fonds = selectedFonds;
    onFilterChange(filters);
  }, [selectedTypes, selectedStatuts, selectedPartenaires, selectedFonds]);

  const hasActiveFilters = 
    selectedTypes.length > 0 ||
    selectedStatuts.length > 0 ||
    selectedPartenaires.length > 0 ||
    selectedFonds.length > 0;

  const resetAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuts([]);
    setSelectedPartenaires([]);
    setSelectedFonds([]);
  };

  // Réinitialiser les filtres si resetTrigger change
  useEffect(() => {
    if (resetTrigger !== undefined) {
      resetAllFilters();
      setNameSearch('');
    }
  }, [resetTrigger]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Recherche globale */}
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par partenaire, numéro..."
              value={nameSearch}
              onChange={(e) => handleNameSearchChange(e.target.value)}
              className="w-full h-[42px] pl-9 pr-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
            />
          </div>

          {/* Type - MultiSelect */}
          <div className="w-[180px]">
            <ModernMultiSelect
              options={TYPE_OPTIONS}
              value={selectedTypes}
              onChange={setSelectedTypes}
              placeholder="Type"
              searchPlaceholder="Rechercher un type..."
            />
          </div>

          {/* Partenaire - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={availablePartenaires}
              value={selectedPartenaires}
              onChange={setSelectedPartenaires}
              placeholder="Partenaire"
              searchPlaceholder="Rechercher un partenaire..."
            />
          </div>

          {/* Fonds - MultiSelect */}
          <div className="w-[180px]">
            <ModernMultiSelect
              options={availableFonds}
              value={selectedFonds}
              onChange={setSelectedFonds}
              placeholder="Fonds"
              searchPlaceholder="Rechercher un fonds..."
            />
          </div>

          {/* Statut - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={STATUT_OPTIONS}
              value={selectedStatuts}
              onChange={setSelectedStatuts}
              placeholder="Statut"
              searchPlaceholder="Rechercher un statut..."
            />
          </div>

          {/* Bouton Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="h-[42px] px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
