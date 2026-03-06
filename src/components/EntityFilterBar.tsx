import { useState, useEffect } from 'react';
import { Search, Building2, UserCircle, AlertTriangle, Shield, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ModernMultiSelect } from './ui/modern-multiselect';

interface EntityFilterBarProps {
  onFilterChange: (filters: any) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchValue?: string;
  resetTrigger?: number;
  allData?: any[];
}

// Types d'entités avec icônes
const ENTITY_TYPES = [
  { value: 'Individual', label: 'Individual', icon: '👤' },
  { value: 'Corporate', label: 'Corporate', icon: '🏢' }
];

// Statuts
const STATUSES = [
  'Pending',
  'Clear',
  'Risk',
  'True Hit',
  'New Hit',
  'Validated',
  'To Review'
];

// Niveaux de risque
const RISK_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Pending'
];

// Analystes
const ANALYSTS = [
  'Jean Dault',
  'Sophie Martin',
  'Marc Dubois',
  'Claire Rousseau',
  'Thomas Bernard',
  'Emma Leroy'
];

// Options de monitoring
const MONITORING_OPTIONS = [
  { value: 'monitored', label: 'Monitored' },
  { value: 'not-monitored', label: 'Not Monitored' }
];

export function EntityFilterBar({ 
  onFilterChange, 
  onSearchChange, 
  searchValue = '', 
  resetTrigger, 
  allData 
}: EntityFilterBarProps) {
  const [nameSearch, setNameSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([]);
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>([]);
  const [selectedMonitoring, setSelectedMonitoring] = useState<string[]>([]);

  // Gérer les changements de recherche
  const handleNameSearchChange = (value: string) => {
    setNameSearch(value);
    onSearchChange?.(value);
  };

  // Mettre à jour les filtres à chaque changement d'état
  useEffect(() => {
    const filters: any = {};
    if (selectedTypes.length > 0) filters.types = selectedTypes;
    if (selectedStatuses.length > 0) filters.statuses = selectedStatuses;
    if (selectedRiskLevels.length > 0) filters.riskLevels = selectedRiskLevels;
    if (selectedAnalysts.length > 0) filters.analysts = selectedAnalysts;
    if (selectedMonitoring.length > 0) filters.monitoring = selectedMonitoring;
    onFilterChange(filters);
  }, [selectedTypes, selectedStatuses, selectedRiskLevels, selectedAnalysts, selectedMonitoring]);

  const hasActiveFilters = 
    selectedTypes.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedRiskLevels.length > 0 ||
    selectedAnalysts.length > 0 ||
    selectedMonitoring.length > 0;

  const totalActiveFilters = 
    selectedTypes.length + 
    selectedStatuses.length + 
    selectedRiskLevels.length + 
    selectedAnalysts.length + 
    selectedMonitoring.length;

  const resetAllFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSelectedRiskLevels([]);
    setSelectedAnalysts([]);
    setSelectedMonitoring([]);
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
          {/* Recherche par nom avec animation */}
          <motion.div 
            className="relative w-[240px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search entity..."
              value={nameSearch}
              onChange={(e) => handleNameSearchChange(e.target.value)}
              className="w-full h-[42px] pl-9 pr-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
            />
          </motion.div>

          {/* Type - MultiSelect avec animation */}
          <motion.div 
            className="w-[180px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <ModernMultiSelect
              options={ENTITY_TYPES.map(t => `${t.icon} ${t.label}`)}
              value={selectedTypes}
              onChange={setSelectedTypes}
              placeholder="Type"
              searchPlaceholder="Search type..."
            />
          </motion.div>

          {/* Status - MultiSelect avec animation */}
          <motion.div 
            className="w-[200px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ModernMultiSelect
              options={STATUSES}
              value={selectedStatuses}
              onChange={setSelectedStatuses}
              placeholder="Status"
              searchPlaceholder="Search status..."
            />
          </motion.div>

          {/* Risk Level - MultiSelect avec animation */}
          <motion.div 
            className="w-[180px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <ModernMultiSelect
              options={RISK_LEVELS}
              value={selectedRiskLevels}
              onChange={setSelectedRiskLevels}
              placeholder="Risk Level"
              searchPlaceholder="Search risk level..."
            />
          </motion.div>

          {/* Analyst - MultiSelect avec animation */}
          <motion.div 
            className="w-[200px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <ModernMultiSelect
              options={ANALYSTS}
              value={selectedAnalysts}
              onChange={setSelectedAnalysts}
              placeholder="Analyst"
              searchPlaceholder="Search analyst..."
            />
          </motion.div>

          {/* Monitoring - MultiSelect avec animation */}
          <motion.div 
            className="w-[200px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <ModernMultiSelect
              options={MONITORING_OPTIONS.map(m => m.label)}
              value={selectedMonitoring}
              onChange={setSelectedMonitoring}
              placeholder="Monitoring"
              searchPlaceholder="Search..."
            />
          </motion.div>

          {/* Bouton Reset avec animation et compteur */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetAllFilters}
                className="h-[42px] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all flex items-center gap-2 group"
              >
                <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Reset</span>
                <span className="px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold min-w-[20px] text-center">
                  {totalActiveFilters}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}