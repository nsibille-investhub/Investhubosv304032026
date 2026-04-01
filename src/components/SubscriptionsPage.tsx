import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Subscription } from '../utils/subscriptionGenerator';
import { toast } from 'sonner';
import { SubscriptionDynamicTable } from './SubscriptionDynamicTable';
import { TableSkeleton } from './TableSkeleton';
import { DecisionPanel } from './DecisionPanel';
import { FilterBar, FilterConfig } from './FilterBar';
import { useTableSearch } from '../utils/useTableSearch';
import { SUBSCRIPTION_SEARCH_FIELDS } from '../utils/searchConfig';
import { AskAIDialog } from './AskAIDialog';
import { AIInsightBanner } from './AIInsightBanner';
import { AIAnalysis, analyzeSubscriptions } from '../utils/aiAnalyzer';
import { SubscriptionWorkflowStatus } from '../utils/subscriptionColumns';

interface SubscriptionsPageProps {
  data: Subscription[];
  isLoading: boolean;
  allData: Subscription[];
  setAllData: (data: Subscription[]) => void;
  onSubscriptionClick?: (subscription: Subscription) => void;
  activeStatus?: SubscriptionWorkflowStatus; // 🆕 Prop pour déterminer les colonnes
}

export function SubscriptionsPage({ data, isLoading, allData, setAllData, onSubscriptionClick, activeStatus = 'all' }: SubscriptionsPageProps) {
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiFilteredData, setAiFilteredData] = useState<Subscription[] | null>(null);

  const normalizedData = useMemo(
    () =>
      data.map((subscription) => ({
        ...subscription,
        quantity:
          Number.isFinite(subscription.quantity) && subscription.quantity > 0
            ? Math.trunc(subscription.quantity)
            : 1,
      })),
    [data]
  );

  // Hook de recherche multi-champs avec configuration centralisée
  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchFilteredData,
    searchMatches,
    hasActiveSearch,
  } = useTableSearch(normalizedData, SUBSCRIPTION_SEARCH_FIELDS);

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setActiveFilters((prev) => {
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPaginationPage(1); // Réinitialiser à la page 1 lors d'une recherche
  };

  // Debug: Log search results
  useEffect(() => {
    if (hasActiveSearch) {
      console.log('🔍 Search term:', searchTerm);
      console.log('📊 Filtered data count:', searchFilteredData.length);
      console.log('📊 Total data count:', normalizedData.length);
      console.log('📋 Sample filtered item:', searchFilteredData[0]);
    }
  }, [searchTerm, searchFilteredData, normalizedData.length, hasActiveSearch]);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: 'Statut',
      type: 'select',
      isPrimary: true,
      options: Array.from(new Set(normalizedData.map((sub) => sub.status)))
        .filter(Boolean)
        .sort()
        .map((status) => ({ value: status, label: status })),
    },
    {
      id: 'partner',
      label: 'Partenaire',
      type: 'select',
      isPrimary: true,
      options: [
        { value: 'Sans partenaire', label: 'Sans partenaire' },
        ...Array.from(new Set(normalizedData.map((sub) => sub.partenaire?.name).filter(Boolean) as string[]))
          .sort()
          .map((partner) => ({ value: partner, label: partner })),
      ],
    },
    {
      id: 'fund',
      label: 'Fonds',
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.fund?.name).filter(Boolean) as string[]))
        .sort()
        .map((fund) => ({ value: fund, label: fund })),
    },
    {
      id: 'shareClass',
      label: 'Classe de part',
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.fund?.shareClass).filter(Boolean) as string[]))
        .sort()
        .map((shareClass) => ({ value: shareClass, label: shareClass })),
    },
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.type)))
        .filter(Boolean)
        .sort()
        .map((type) => ({ value: type, label: type })),
    },
    {
      id: 'gestionnaire',
      label: 'Gestionnaire',
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.analyst)))
        .filter(Boolean)
        .sort()
        .map((analyst) => ({ value: analyst, label: analyst })),
    },
  ], [normalizedData]);

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setAiFilteredData(null);
    setPaginationPage(1);
    toast.success('Filtres réinitialisés');
  };

  const filteredData = useMemo(() => {
    let baseData = hasActiveSearch ? searchFilteredData : normalizedData;

    if (aiFilteredData) {
      baseData = aiFilteredData;
    }

    if (Object.keys(activeFilters).length === 0) return baseData;

    return baseData.filter((subscription) => {
      if (activeFilters.status && subscription.status !== activeFilters.status) return false;

      if (activeFilters.partner) {
        const partnerFilter = activeFilters.partner as string;
        if (partnerFilter === 'Sans partenaire') {
          if (subscription.partenaire?.name) return false;
        } else if (subscription.partenaire?.name !== partnerFilter) {
          return false;
        }
      }

      if (activeFilters.fund && subscription.fund?.name !== activeFilters.fund) return false;
      if (activeFilters.shareClass && subscription.fund?.shareClass !== activeFilters.shareClass) return false;
      if (activeFilters.type && subscription.type !== activeFilters.type) return false;
      if (activeFilters.gestionnaire && subscription.analyst !== activeFilters.gestionnaire) return false;

      return true;
    });
  }, [normalizedData, searchFilteredData, hasActiveSearch, aiFilteredData, activeFilters]);

  // Tri des données (appliqué après la recherche, les filtres et le filtre AI)
  const sortedData = useMemo(() => {
    let dataToSort = filteredData;
    
    // Si un filtre AI est actif, l'appliquer en priorité
    if (aiFilteredData) {
      dataToSort = aiFilteredData;
    }
    
    if (!sortConfig) return dataToSort;

    return [...dataToSort].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof Subscription];
      let bValue = b[sortConfig.key as keyof Subscription];
      
      // Gestion spéciale pour les dates
      if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
        aValue = (a[sortConfig.key as 'createdAt' | 'updatedAt'] as Date).getTime();
        bValue = (b[sortConfig.key as 'createdAt' | 'updatedAt'] as Date).getTime();
      }
      
      // Gestion spéciale pour les montants
      if (sortConfig.key === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      }
      if (sortConfig.key === 'called-amounts') {
        aValue = a.calledAmount || 0;
        bValue = b.calledAmount || 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, aiFilteredData, sortConfig]);

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
    toast.success('Tri appliqué', {
      description: `Tri par ${key} (${direction === 'asc' ? 'croissant' : 'décroissant'})`,
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationPage(page);
      setSelectedSubscription(null);
      toast.info('Page changée', {
        description: `Page ${page} sur ${totalPages}`,
      });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
    toast.success('Affichage modifié', {
      description: `${newItemsPerPage} items par page`,
    });
  };

  const handleRowClick = (row: any) => {
    console.log('Row clicked:', row);
    if (onSubscriptionClick) {
      onSubscriptionClick(row);
    }
  };

  const handleMonitoringChange = (subscriptionId: number, newMonitoringState: boolean) => {
    setAllData(
      allData.map(subscription => 
        subscription.id === subscriptionId 
          ? { ...subscription, monitoring: newMonitoringState }
          : subscription
      )
    );
    
    toast.success(newMonitoringState ? 'Monitoring activé' : 'Monitoring désactivé', {
      description: `pour ${allData.find(s => s.id === subscriptionId)?.name}`,
    });
  };

  const handleAnalystChange = (subscriptionId: number, newAnalyst: string) => {
    setAllData(
      allData.map(subscription => 
        subscription.id === subscriptionId 
          ? { ...subscription, analyst: newAnalyst }
          : subscription
      )
    );
    
    toast.success('Analyst updated', {
      description: `${newAnalyst} assigned to ${allData.find(s => s.id === subscriptionId)?.name}`,
    });
  };

  // AI Handlers
  const handleAskAI = () => {
    setShowAIDialog(true);
  };

  const handleAskAIDirect = (query: string) => {
    // Analyser directement la requête
    const analysis = analyzeSubscriptions(query, normalizedData);
    setAiAnalysis(analysis);
    
    // Collecter tous les items des insights pour filtrer le tableau
    const allItems = analysis.insights.reduce((acc: Subscription[], insight) => {
      if (insight.items) {
        // Éviter les doublons
        insight.items.forEach(item => {
          if (!acc.find(i => i.id === item.id)) {
            acc.push(item);
          }
        });
      }
      return acc;
    }, []);
    
    if (allItems.length > 0) {
      setAiFilteredData(allItems);
      setPaginationPage(1);
    }
  };

  const handleAIInsightApply = (items: Subscription[]) => {
    setAiFilteredData(items);
    setAiAnalysis(null);
    setPaginationPage(1);
    toast.success('Filtre AI appliqué', {
      description: `${items.length} souscription${items.length > 1 ? 's' : ''} affichée${items.length > 1 ? 's' : ''}`
    });
  };

  const handleAIAnalysisReceived = (analysis: AIAnalysis) => {
    setAiAnalysis(analysis);
  };

  const handleCloseBanner = () => {
    setAiAnalysis(null);
    setAiFilteredData(null);
    if (aiFilteredData) {
      toast.info('Filtre AI désactivé', {
        description: 'Affichage de toutes les souscriptions'
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
            searchPlaceholder="Rechercher une souscription..."
            filters={filterConfigs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAllFilters}
            onAskAI={handleAskAI}
            onAskAIDirect={handleAskAIDirect}
          />
        </div>
        
        {/* AI Insight Banner */}
        <AIInsightBanner 
          analysis={aiAnalysis}
          onClose={handleCloseBanner}
          onInsightClick={handleInsightClick}
        />

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <SubscriptionDynamicTable 
              data={tableData}
              activeStatus={activeStatus}
              onRowClick={handleRowClick}
              onAnalystChange={handleAnalystChange}
              sortConfig={sortConfig}
              onSort={handleSort}
              searchTerm={searchTerm}
              allFilteredData={sortedData}
            />
          )}
        </div>

        {/* Pagination */}
        {sortedData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {startIndex + 1}-{endIndex} of {totalItems} items
              {(hasActiveSearch || Object.keys(activeFilters).length > 0) && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  (filtré{totalItems !== data.length && ` de ${data.length}`})
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">{itemsPerPage}/page</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(10)} className="cursor-pointer">
                      10 par page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(20)} className="cursor-pointer">
                      20 par page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(50)} className="cursor-pointer">
                      50 par page
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(100)} className="cursor-pointer">
                      100 par page
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* AI Dialog */}
      <AskAIDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        onAnalyze={handleAskAIDirect}
      />
    </div>
  );
}
