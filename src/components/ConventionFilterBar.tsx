import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ModernMultiSelect } from './ui/modern-multiselect';

interface ConventionFilterBarProps {
  onFilterChange: (filters: any) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchValue?: string;
  resetTrigger?: number;
  allData?: any[];
}

// Statuts de convention
const STATUT_OPTIONS = ['Initiale', 'À valider', 'Validé'];

export function ConventionFilterBar({ 
  onFilterChange, 
  onSearchChange, 
  searchValue = '', 
  resetTrigger, 
  allData 
}: ConventionFilterBarProps) {
  const [nameSearch, setNameSearch] = useState('');
  const [selectedStatuts, setSelectedStatuts] = useState<string[]>([]);
  const [selectedPartenaires, setSelectedPartenaires] = useState<string[]>([]);
  const [emailFilter, setEmailFilter] = useState('');
  const [initialFilter, setInitialFilter] = useState('');

  // Extraire les valeurs uniques pour les filtres
  const availablePartenaires = Array.from(
    new Set(allData?.map(c => c.partenaire).filter(Boolean) || [])
  ).sort() as string[];

  // Gérer les changements de recherche
  const handleNameSearchChange = (value: string) => {
    setNameSearch(value);
    onSearchChange?.(value);
  };

  // Mettre à jour les filtres à chaque changement d'état
  useEffect(() => {
    const filters: any = {};
    if (selectedStatuts.length > 0) filters.statuts = selectedStatuts;
    if (selectedPartenaires.length > 0) filters.partenaires = selectedPartenaires;
    if (emailFilter) filters.email = emailFilter;
    if (initialFilter) filters.initial = initialFilter;
    onFilterChange(filters);
  }, [selectedStatuts, selectedPartenaires, emailFilter, initialFilter]);

  const hasActiveFilters = 
    selectedStatuts.length > 0 ||
    selectedPartenaires.length > 0 ||
    emailFilter !== '' ||
    initialFilter !== '';

  const resetAllFilters = () => {
    setSelectedStatuts([]);
    setSelectedPartenaires([]);
    setEmailFilter('');
    setInitialFilter('');
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

          {/* Statut - MultiSelect */}
          <div className="w-[180px]">
            <ModernMultiSelect
              options={STATUT_OPTIONS}
              value={selectedStatuts}
              onChange={setSelectedStatuts}
              placeholder="Statut"
              searchPlaceholder="Rechercher un statut..."
            />
          </div>

          {/* Email Filter */}
          <div className="w-[200px]">
            <input
              type="text"
              placeholder="Email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="w-full h-[42px] px-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
            />
          </div>

          {/* Initial Filter */}
          <div className="w-[140px]">
            <input
              type="text"
              placeholder="Initial"
              value={initialFilter}
              onChange={(e) => setInitialFilter(e.target.value)}
              className="w-full h-[42px] px-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
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