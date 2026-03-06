import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Fund } from '../utils/fundGenerator';

interface FundFilterBarProps {
  onFilterChange: (filters: {
    searchName?: string;
    filterType?: string;
    filterStatus?: string;
    searchIsin?: string;
  }) => void;
  resetTrigger?: number;
  allData: Fund[];
}

export function FundFilterBar({ onFilterChange, resetTrigger, allData }: FundFilterBarProps) {
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchIsin, setSearchIsin] = useState('');

  // Reset quand resetTrigger change
  useEffect(() => {
    setSearchName('');
    setFilterType('');
    setFilterStatus('');
    setSearchIsin('');
  }, [resetTrigger]);

  // Mettre à jour les filtres
  useEffect(() => {
    onFilterChange({
      searchName: searchName || undefined,
      filterType: filterType || undefined,
      filterStatus: filterStatus || undefined,
      searchIsin: searchIsin || undefined,
    });
  }, [searchName, filterType, filterStatus, searchIsin, onFilterChange]);

  // Extraire les valeurs uniques pour les filtres
  const uniqueTypes = Array.from(new Set(allData.map(fund => fund.type))).sort();
  const uniqueStatuses = Array.from(new Set(allData.map(fund => fund.status))).sort();

  const activeFilterCount = [searchName, filterType, filterStatus, searchIsin].filter(Boolean).length;

  const handleClearAll = () => {
    setSearchName('');
    setFilterType('');
    setFilterStatus('');
    setSearchIsin('');
  };

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Recherche par nom (nom fond, ID, LEI, nom part) */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom, ID, LEI..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all duration-200"
          />
          {searchName && (
            <button
              onClick={() => setSearchName('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Filtre par type */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-all duration-200 ${
                filterType
                  ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Type</span>
              {filterType && (
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                  {filterType}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {filterType && (
              <>
                <DropdownMenuItem
                  onClick={() => setFilterType('')}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-2" />
                  Effacer le filtre
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {uniqueTypes.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => setFilterType(type)}
                className={`cursor-pointer ${filterType === type ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' : ''}`}
              >
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filtre par statut */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg transition-all duration-200 ${
                filterStatus
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Statut</span>
              {filterStatus && (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium">
                  {filterStatus}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {filterStatus && (
              <>
                <DropdownMenuItem
                  onClick={() => setFilterStatus('')}
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 mr-2" />
                  Effacer le filtre
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            {uniqueStatuses.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`cursor-pointer ${filterStatus === status ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : ''}`}
              >
                {status}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Recherche par ISIN */}
        <div className="relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="ISIN..."
            value={searchIsin}
            onChange={(e) => setSearchIsin(e.target.value)}
            className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 focus:border-transparent transition-all duration-200"
          />
          {searchIsin && (
            <button
              onClick={() => setSearchIsin('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Bouton pour tout effacer */}
        <AnimatePresence>
          {activeFilterCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span>Effacer ({activeFilterCount})</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
