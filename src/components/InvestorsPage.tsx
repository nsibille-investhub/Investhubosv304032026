import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Investor } from '../utils/investorGenerator';
import { toast } from 'sonner';
import { InvestorDataTable } from './InvestorDataTable';
import { TableSkeleton } from './TableSkeleton';
import { FilterBar, FilterConfig } from './FilterBar';
import { useTableSearch } from '../utils/useTableSearch';
import { INVESTOR_SEARCH_FIELDS } from '../utils/searchConfig';
import { AskAIDialog } from './AskAIDialog';
import { AIInsightBanner } from './AIInsightBanner';
import { AIAnalysis } from '../utils/aiAnalyzer';
import { InvestorEmptyState } from './InvestorEmptyState';
import { useTranslation } from '../utils/languageContext';

interface InvestorsPageProps {
  data: Investor[];
  isLoading: boolean;
  allData: Investor[];
  setAllData: (data: Investor[]) => void;
  onInvestorClick?: (investor: Investor, tab?: string) => void;
}

export function InvestorsPage({ data, isLoading, allData, setAllData, onInvestorClick }: InvestorsPageProps) {
  const { t } = useTranslation();
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedInvestor, setSelectedInvestor] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiFilteredData, setAiFilteredData] = useState<Investor[] | null>(null);

  // Hook de recherche multi-champs avec configuration centralisée
  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchFilteredData,
    searchMatches,
    hasActiveSearch,
  } = useTableSearch(data, INVESTOR_SEARCH_FIELDS);

  // Configuration des filtres
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: 'structure',
      label: t('investors.filters.structure'),
      type: 'select',
      isPrimary: true,
      options: Array.from(new Set(allData.flatMap(inv =>
        inv.structures && inv.structures.length > 0
          ? inv.structures.map((s: any) => s.name)
          : ['Sans structure']
      ))).sort().map(s => ({
        value: s,
        label: s === 'Sans structure' ? t('investors.filters.noStructure') : s,
      }))
    },
    {
      id: 'segment',
      label: t('investors.filters.segment'),
      type: 'select',
      isPrimary: true,
      options: [
        { value: 'HNWI', label: 'HNWI' },
        { value: 'UHNWI', label: 'UHNWI' },
        { value: 'Retail', label: 'Retail' },
        { value: 'Professional', label: 'Professional' },
        { value: 'Institutional', label: 'Institutional' }
      ]
    },
    {
      id: 'type',
      label: t('investors.filters.type'),
      type: 'select',
      isPrimary: false,
      options: [
        { value: 'Individual', label: t('investors.type.Individual') },
        { value: 'Company', label: t('investors.type.Company') }
      ]
    },
    {
      id: 'gestionnaire',
      label: t('investors.filters.manager'),
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(allData.map(inv => inv.analyst)))
        .filter(Boolean)
        .sort()
        .map(analyst => ({ value: analyst, label: analyst }))
    },
    {
      id: 'partner',
      label: t('investors.filters.partner'),
      type: 'select',
      isPrimary: false,
      options: [
        { value: 'Direct', label: t('investors.filters.direct') },
        ...Array.from(new Set(allData.map(inv => inv.partner).filter(Boolean)))
          .sort()
          .map(partner => ({ value: partner, label: partner }))
      ]
    },
    {
      id: 'fund',
      label: t('investors.filters.fund'),
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(allData.flatMap(inv =>
        inv.investments?.map((i: any) => i.fundName) || []
      )))
        .filter(Boolean)
        .sort()
        .map(fund => ({ value: fund, label: fund }))
    }
  ], [allData, t]);

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete newFilters[filterId];
      } else {
        newFilters[filterId] = value;
      }
      return newFilters;
    });
    setPaginationPage(1);
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setAiFilteredData(null);
    setPaginationPage(1);
    toast.success(t('toast.filtersReset'));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPaginationPage(1);
  };

  // Appliquer les filtres personnalisés après la recherche
  const filteredData = useMemo(() => {
    let baseData = hasActiveSearch ? searchFilteredData : data;
    
    // Si un filtre AI est actif, l'appliquer en priorité
    if (aiFilteredData) {
      baseData = aiFilteredData;
    }
    
    // Appliquer les filtres actifs
    if (Object.keys(activeFilters).length === 0) return baseData;
    
    return baseData.filter(investor => {
      // Structures (string simple)
      if (activeFilters.structure) {
        const filterValue = activeFilters.structure as string;
        if (filterValue === 'Sans structure') {
          if (investor.structures && investor.structures.length > 0) return false;
        } else {
          const hasStructure = investor.structures?.some((s: any) => s.name === filterValue);
          if (!hasStructure) return false;
        }
      }

      // Segments (string simple)
      if (activeFilters.segment) {
        if (investor.crmSegment !== activeFilters.segment) return false;
      }

      // Gestionnaires (string simple)
      if (activeFilters.gestionnaire) {
        if (investor.analyst !== activeFilters.gestionnaire) return false;
      }

      // Partners (string simple)
      if (activeFilters.partner) {
        const filterValue = activeFilters.partner as string;
        if (filterValue === 'Direct') {
          if (investor.partner && investor.partner !== '') return false;
        } else {
          if (investor.partner !== filterValue) return false;
        }
      }

      // Types (string simple)
      if (activeFilters.type) {
        if (investor.type !== activeFilters.type) return false;
      }

      // Fonds (string simple)
      if (activeFilters.fund) {
        const hasMatchingFund = investor.investments?.some((inv: any) => 
          inv.fundName === activeFilters.fund
        );
        if (!hasMatchingFund) return false;
      }

      return true;
    });
  }, [data, searchFilteredData, hasActiveSearch, aiFilteredData, activeFilters]);

  // Tri des données (appliqué après tous les filtres)
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof Investor];
      let bValue = b[sortConfig.key as keyof Investor];
      
      // Gestion spéciale pour les dates
      if (sortConfig.key === 'registrationDate' || sortConfig.key === 'lastActivity') {
        aValue = (a[sortConfig.key as 'registrationDate' | 'lastActivity'] as Date).getTime();
        bValue = (b[sortConfig.key as 'registrationDate' | 'lastActivity'] as Date).getTime();
      }
      
      // Gestion spéciale pour les montants
      if (sortConfig.key === 'totalInvested') {
        aValue = a.totalInvested;
        bValue = b.totalInvested;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    toast.success(t('toast.sortApplied'), {
      description: t('investors.page.sortDescription', {
        key,
        direction: direction === 'asc' ? t('investors.page.sortAsc') : t('investors.page.sortDesc'),
      }),
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationPage(page);
      setSelectedInvestor(null);
      toast.info(t('toast.pageChanged'), {
        description: t('investors.page.pageOf', { page, total: totalPages }),
      });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
    toast.success(t('toast.displayUpdated'), {
      description: t('investors.page.itemsPerPageApplied', { count: newItemsPerPage }),
    });
  };

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
    console.log('onInvestorClick exists:', !!onInvestorClick);
    if (onInvestorClick) {
      console.log('Calling onInvestorClick...');
      onInvestorClick(row);
    } else {
      console.log('onInvestorClick is not defined!');
      toast.error(t('investors.toast.navigationNotConfigured'), {
        description: t('investors.toast.navigationNotConfiguredDesc')
      });
    }
  };

  const handleMonitoringChange = (investorId: number, newMonitoringState: boolean) => {
    setAllData(
      allData.map(investor => 
        investor.id === investorId 
          ? { ...investor, monitoring: newMonitoringState }
          : investor
      )
    );
    
    if (selectedInvestor && selectedInvestor.id === investorId) {
      setSelectedInvestor({ ...selectedInvestor, monitoring: newMonitoringState });
    }
    
    toast.success(newMonitoringState ? t('toast.monitoringEnabled') : t('toast.monitoringDisabled'), {
      description: t('investors.toast.monitoringFor', {
        name: allData.find(i => i.id === investorId)?.name ?? '',
      }),
    });
  };

  const handleAnalystChange = (investorId: number, newAnalyst: string) => {
    setAllData(
      allData.map(investor => 
        investor.id === investorId 
          ? { ...investor, analyst: newAnalyst }
          : investor
      )
    );
    
    if (selectedInvestor && selectedInvestor.id === investorId) {
      setSelectedInvestor({ ...selectedInvestor, analyst: newAnalyst });
    }
    
    toast.success(t('toast.analystUpdated'), {
      description: t('investors.toast.analystAssigned', {
        analyst: newAnalyst,
        name: allData.find(i => i.id === investorId)?.name ?? '',
      }),
    });
  };

  // AI Handlers
  const handleAskAI = () => {
    setShowAIDialog(true);
  };

  const handleAskAIDirect = (query: string) => {
    // Créer une analyse simplifiée pour les investisseurs
    const analysis: AIAnalysis = {
      question: query,
      insights: [],
      summary: t('investors.toast.aiFilterAppliedDescMany', { count: data.length }) + ` — "${query}"`,
    };
    
    setAiAnalysis(analysis);
  };

  const handleAIInsightApply = (items: Investor[]) => {
    setAiFilteredData(items);
    setAiAnalysis(null);
    setPaginationPage(1);
    toast.success(t('toast.aiFilterApplied'), {
      description: items.length > 1
        ? t('investors.toast.aiFilterAppliedDescMany', { count: items.length })
        : t('investors.toast.aiFilterAppliedDescOne', { count: items.length })
    });
  };

  const handleCloseBanner = () => {
    setAiAnalysis(null);
    setAiFilteredData(null);
    if (aiFilteredData) {
      toast.info(t('toast.aiFilterDisabled'), {
        description: t('investors.toast.aiFilterDisabledDesc')
      });
    }
  };

  const handleInsightClick = (index: number) => {
    if (aiAnalysis && aiAnalysis.insights[index].items) {
      handleAIInsightApply(aiAnalysis.insights[index].items!);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (paginationPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (paginationPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = paginationPage - 1; i <= paginationPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          width: '100%'
        }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
        className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow duration-500 flex flex-col"
      >
        {/* Filter Bar */}
        <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder={t('investors.page.searchPlaceholder')}
            filters={filterConfigs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAllFilters}
          />
        </div>
        
        {/* AI Insight Banner */}
        <AIInsightBanner 
          analysis={aiAnalysis}
          onClose={handleCloseBanner}
          onInsightClick={handleInsightClick}
        />

        {/* Table */}
        <div className="flex-1">
          {isLoading ? (
            <TableSkeleton />
          ) : sortedData.length === 0 ? (
            <InvestorEmptyState 
              hasFilters={Object.keys(activeFilters).length > 0}
              hasSearch={hasActiveSearch}
              onReset={handleClearAllFilters}
            />
          ) : (
            <InvestorDataTable 
              data={tableData}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              onRowClick={handleRowClick}
              sortConfig={sortConfig}
              onSort={handleSort}
              compactMode={false}
              onMonitoringChange={handleMonitoringChange}
              onAnalystChange={handleAnalystChange}
              allFilteredData={sortedData}
              searchTerm={searchTerm}
            />
          )}
        </div>

        {/* Pagination - Ne s'affiche que s'il y a des données */}
        {sortedData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('investors.page.itemsRange', { start: startIndex + 1, end: endIndex, total: totalItems })}
              {(hasActiveSearch || Object.keys(activeFilters).length > 0) && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  ({totalItems !== data.length
                    ? t('investors.page.filteredOf', { count: data.length })
                    : t('investors.page.filtered')})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: paginationPage > 1 ? 1.05 : 1, x: paginationPage > 1 ? -2 : 0 }}
                whileTap={{ scale: paginationPage > 1 ? 0.95 : 1 }}
                onClick={() => handlePageChange(paginationPage - 1)}
                disabled={paginationPage === 1}
                className={`p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm ${
                  paginationPage === 1 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              {getPageNumbers().map((page, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: page !== '...' ? 1.1 : 1, y: page !== '...' ? -2 : 0 }}
                  whileTap={{ scale: page !== '...' ? 0.95 : 1 }}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg transition-all duration-300 ${
                    page === paginationPage
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : page === '...'
                      ? 'text-gray-400 dark:text-gray-600 cursor-default'
                      : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'
                  }`}
                  disabled={page === '...'}
                >
                  {page}
                </motion.button>
              ))}
              
              <motion.button
                whileHover={{ scale: paginationPage < totalPages ? 1.05 : 1, x: paginationPage < totalPages ? 2 : 0 }}
                whileTap={{ scale: paginationPage < totalPages ? 0.95 : 1 }}
                onClick={() => handlePageChange(paginationPage + 1)}
                disabled={paginationPage === totalPages}
                className={`p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm ${
                  paginationPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="ml-2 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 outline-none">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('investors.page.itemsPerPage', { count: itemsPerPage })}</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(10)} className="cursor-pointer">
                      {t('investors.page.itemsPerPageOption', { count: 10 })}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(20)} className="cursor-pointer">
                      {t('investors.page.itemsPerPageOption', { count: 20 })}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(50)} className="cursor-pointer">
                      {t('investors.page.itemsPerPageOption', { count: 50 })}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(100)} className="cursor-pointer">
                      {t('investors.page.itemsPerPageOption', { count: 100 })}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
