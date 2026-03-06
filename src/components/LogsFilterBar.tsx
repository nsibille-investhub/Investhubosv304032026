import { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  Code, 
  Activity, 
  Globe, 
  X, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModernMultiSelect } from './ui/modern-multiselect';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Button } from './ui/button';

interface LogsFilterBarProps {
  onFilterChange: (filters: any) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchValue?: string;
  resetTrigger?: number;
  allData?: any[];
}

// Méthodes HTTP
const HTTP_METHODS = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'PATCH', label: 'PATCH' },
];

// Codes de statut HTTP
const STATUS_CODES = [
  { value: '200', label: '200 - OK' },
  { value: '201', label: '201 - Created' },
  { value: '204', label: '204 - No Content' },
  { value: '400', label: '400 - Bad Request' },
  { value: '401', label: '401 - Unauthorized' },
  { value: '403', label: '403 - Forbidden' },
  { value: '404', label: '404 - Not Found' },
  { value: '500', label: '500 - Server Error' },
];

// Options de plage de dates
const DATE_RANGE_OPTIONS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: 'last_7_days', label: '7 derniers jours' },
  { value: 'last_30_days', label: '30 derniers jours' },
  { value: 'last_90_days', label: '3 derniers mois' },
  { value: 'this_month', label: 'Ce mois-ci' },
  { value: 'last_month', label: 'Mois dernier' },
];

export function LogsFilterBar({ 
  onFilterChange, 
  onSearchChange, 
  searchValue = '', 
  resetTrigger, 
  allData 
}: LogsFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedControllers, setSelectedControllers] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [selectedStatusCodes, setSelectedStatusCodes] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [selectedDateRangeOption, setSelectedDateRangeOption] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Extraire les utilisateurs uniques depuis allData
  const availableUsers = allData 
    ? Array.from(new Set(allData.map((log: any) => log.user))).sort()
    : [];

  // Extraire les contrôleurs uniques
  const availableControllers = allData
    ? Array.from(new Set(allData.map((log: any) => log.controllerLabel))).sort()
    : [];

  // Extraire les actions disponibles (filtrées par contrôleur si sélectionné)
  const availableActions = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    
    let actions = allData;
    
    // Si des contrôleurs sont sélectionnés, filtrer les actions
    if (selectedControllers.length > 0) {
      actions = actions.filter((log: any) => 
        selectedControllers.includes(log.controllerLabel)
      );
    }
    
    return Array.from(new Set(actions.map((log: any) => log.actionLabel))).sort();
  }, [allData, selectedControllers]);

  const calculateDateRange = (option: string) => {
    const now = new Date();
    const end = new Date();
    let start = new Date();

    switch (option) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'last_7_days':
        start.setDate(start.getDate() - 7);
        break;
      case 'last_30_days':
        start.setDate(start.getDate() - 30);
        break;
      case 'last_90_days':
        start.setDate(start.getDate() - 90);
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end.setDate(0); // Last day of previous month
        break;
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const handleDateRangeSelect = (option: string) => {
    setSelectedDateRangeOption(option);
    const range = calculateDateRange(option);
    setDateRange(range);
  };

  const clearDateRange = () => {
    setSelectedDateRangeOption(null);
    setDateRange(null);
  };

  // Gérer les changements de recherche
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  // Mettre à jour les filtres à chaque changement d'état
  useEffect(() => {
    const filters: any = {};
    if (selectedControllers.length > 0) filters.controllers = selectedControllers;
    if (selectedActions.length > 0) filters.actions = selectedActions;
    if (selectedMethods.length > 0) filters.methods = selectedMethods;
    if (selectedStatusCodes.length > 0) filters.statusCodes = selectedStatusCodes;
    if (selectedUsers.length > 0) filters.users = selectedUsers;
    if (dateRange) filters.dateRange = dateRange;
    onFilterChange(filters);
  }, [selectedControllers, selectedActions, selectedMethods, selectedStatusCodes, selectedUsers, dateRange]);

  const hasActiveFilters = 
    selectedControllers.length > 0 ||
    selectedActions.length > 0 ||
    selectedMethods.length > 0 ||
    selectedStatusCodes.length > 0 ||
    selectedUsers.length > 0 ||
    dateRange !== null;

  const totalActiveFilters = 
    selectedControllers.length + 
    selectedActions.length + 
    selectedMethods.length + 
    selectedStatusCodes.length + 
    selectedUsers.length +
    (dateRange ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedControllers([]);
    setSelectedActions([]);
    setSelectedMethods([]);
    setSelectedStatusCodes([]);
    setSelectedUsers([]);
    setDateRange(null);
    setSelectedDateRangeOption(null);
  };

  // Réinitialiser les filtres si resetTrigger change
  useEffect(() => {
    if (resetTrigger !== undefined) {
      resetAllFilters();
      setSearchQuery('');
    }
  }, [resetTrigger]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Recherche globale */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un log..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-[42px] pl-9 pr-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
            />
          </div>

          {/* Bouton Filtres */}
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <button className="h-[42px] px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-2 relative">
                <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Filtres</span>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                    {totalActiveFilters}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtres</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={resetAllFilters}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Module */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                    <Code className="w-3.5 h-3.5" />
                    Module
                  </label>
                  <ModernMultiSelect
                    options={availableControllers}
                    value={selectedControllers}
                    onChange={setSelectedControllers}
                    placeholder="Sélectionner des modules..."
                    searchPlaceholder="Rechercher un module..."
                    icon={<Code className="w-4 h-4" />}
                  />
                </div>

                {/* Action */}
                {availableActions.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5" />
                      Action
                    </label>
                    <ModernMultiSelect
                      options={availableActions}
                      value={selectedActions}
                      onChange={setSelectedActions}
                      placeholder="Sélectionner des actions..."
                      searchPlaceholder="Rechercher une action..."
                      icon={<Activity className="w-4 h-4" />}
                    />
                  </div>
                )}

                {/* Méthode HTTP */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Méthode HTTP
                  </label>
                  <ModernMultiSelect
                    options={HTTP_METHODS.map(m => m.label)}
                    value={selectedMethods}
                    onChange={setSelectedMethods}
                    placeholder="Sélectionner des méthodes..."
                    searchPlaceholder="Rechercher une méthode..."
                    icon={<Globe className="w-4 h-4" />}
                  />
                </div>

                {/* Status Code */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Code de statut
                  </label>
                  <ModernMultiSelect
                    options={STATUS_CODES.map(s => s.label)}
                    value={selectedStatusCodes}
                    onChange={setSelectedStatusCodes}
                    placeholder="Sélectionner des codes..."
                    searchPlaceholder="Rechercher un code..."
                    icon={<Globe className="w-4 h-4" />}
                  />
                </div>

                {/* Utilisateur */}
                {availableUsers.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Utilisateur
                    </label>
                    <ModernMultiSelect
                      options={availableUsers}
                      value={selectedUsers}
                      onChange={setSelectedUsers}
                      placeholder="Sélectionner des utilisateurs..."
                      searchPlaceholder="Rechercher un utilisateur..."
                      icon={<User className="w-4 h-4" />}
                    />
                  </div>
                )}

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Période
                  </label>
                  <div className="space-y-1">
                    {DATE_RANGE_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleDateRangeSelect(option.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedDateRangeOption === option.value 
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                    {selectedDateRangeOption && (
                      <>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        <button
                          onClick={clearDateRange}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          Effacer la période
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Badge de compteur */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2"
              >
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {totalActiveFilters} filtre{totalActiveFilters > 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={resetAllFilters}
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                    title="Clear all filters"
                  >
                    <X className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
