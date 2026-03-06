import { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Calendar as CalendarIcon, Filter as FilterIcon } from 'lucide-react';
import { ModernMultiSelect } from './ui/modern-multiselect';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { DateRangeFilter } from './filters/DateRangeFilter';
import { MatchRangeFilter } from './filters/MatchRangeFilter';

export interface AlertFilters {
  name: string;
  alertTypes: string[];
  matchRange: { min: number; max: number } | null;
  statuses: string[];
  dateRange: { start: string; end: string } | null;
  entities: string[];
}

interface AlertFilterBarProps {
  filters: AlertFilters;
  onFiltersChange: (filters: AlertFilters) => void;
  availableEntities: string[];
  totalCount: number;
  filteredCount: number;
}

// Options pour les types d'alerte
const ALERT_TYPE_OPTIONS = ['Membercheck', 'ORIAS'];

// Options pour les statuts
const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Rejected'];

export function AlertFilterBar({ 
  filters, 
  onFiltersChange, 
  availableEntities,
  totalCount,
  filteredCount
}: AlertFilterBarProps) {
  const [nameSearch, setNameSearch] = useState(filters.name);
  const [selectedAlertTypes, setSelectedAlertTypes] = useState<string[]>(filters.alertTypes);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(filters.statuses);
  const [selectedEntities, setSelectedEntities] = useState<string[]>(filters.entities);
  const [matchFilterOpen, setMatchFilterOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  // Mettre à jour les filtres à chaque changement d'état
  useEffect(() => {
    onFiltersChange({
      ...filters,
      name: nameSearch,
      alertTypes: selectedAlertTypes,
      statuses: selectedStatuses,
      entities: selectedEntities
    });
  }, [nameSearch, selectedAlertTypes, selectedStatuses, selectedEntities]);

  const handleNameSearchChange = (value: string) => {
    setNameSearch(value);
  };

  const handleMatchApply = (range: { min: number; max: number } | null) => {
    onFiltersChange({ ...filters, matchRange: range });
    setMatchFilterOpen(false);
  };

  const handleDateApply = (range: { start: string; end: string } | null) => {
    onFiltersChange({ ...filters, dateRange: range });
    setDateFilterOpen(false);
  };

  const hasActiveFilters = 
    nameSearch !== '' ||
    selectedAlertTypes.length > 0 ||
    filters.matchRange !== null ||
    selectedStatuses.length > 0 ||
    filters.dateRange !== null ||
    selectedEntities.length > 0;

  const resetAllFilters = () => {
    setNameSearch('');
    setSelectedAlertTypes([]);
    setSelectedStatuses([]);
    setSelectedEntities([]);
    onFiltersChange({
      name: '',
      alertTypes: [],
      matchRange: null,
      statuses: [],
      dateRange: null,
      entities: []
    });
  };

  const getMatchLabel = () => {
    if (filters.matchRange) {
      return `${filters.matchRange.min}% - ${filters.matchRange.max}%`;
    }
    return 'Match';
  };

  const getDateLabel = () => {
    if (filters.dateRange) {
      return 'Date (filtrée)';
    }
    return 'Date';
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Nom - Champ de recherche */}
          <div className="relative w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Nom"
              value={nameSearch}
              onChange={(e) => handleNameSearchChange(e.target.value)}
              className="w-full h-[42px] pl-9 pr-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
            />
          </div>

          {/* Type d'alerte - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={ALERT_TYPE_OPTIONS}
              value={selectedAlertTypes}
              onChange={setSelectedAlertTypes}
              placeholder="Type d'alerte"
              searchPlaceholder="Rechercher un type..."
            />
          </div>

          {/* Match - Popover avec MatchRangeFilter */}
          <Popover open={matchFilterOpen} onOpenChange={setMatchFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[200px] h-[42px] justify-between gap-2 ${
                  filters.matchRange 
                    ? 'ring-2 ring-gray-900 dark:ring-gray-100 ring-offset-2 border-gray-900 dark:border-gray-100' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <FilterIcon className="w-4 h-4" />
                  <span className="text-sm">{getMatchLabel()}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <MatchRangeFilter onApply={handleMatchApply} />
            </PopoverContent>
          </Popover>

          {/* Statut - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={STATUS_OPTIONS}
              value={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="Statut"
              searchPlaceholder="Rechercher un statut..."
            />
          </div>

          {/* Entité - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={availableEntities}
              value={selectedEntities}
              onChange={setSelectedEntities}
              placeholder="Entité"
              searchPlaceholder="Rechercher une entité..."
            />
          </div>

          {/* Date - Popover avec DateRangeFilter */}
          <Popover open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-[200px] h-[42px] justify-between gap-2 ${
                  filters.dateRange 
                    ? 'ring-2 ring-gray-900 dark:ring-gray-100 ring-offset-2 border-gray-900 dark:border-gray-100' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span className="text-sm">{getDateLabel()}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DateRangeFilter onApply={handleDateApply} />
            </PopoverContent>
          </Popover>

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

        {/* Indicateur de résultats filtrés */}
        {hasActiveFilters && filteredCount !== totalCount && (
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {filteredCount} sur {totalCount} alerte{totalCount > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}