import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown, Search, Sparkles, Filter, X } from 'lucide-react';
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
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiFilteredData, setAiFilteredData] = useState<Subscription[] | null>(null);
  
  // Filtres Partenaire et Statuts
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showPartnersDropdown, setShowPartnersDropdown] = useState(false);
  const [showStatusesDropdown, setShowStatusesDropdown] = useState(false);

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

  const handleFilterChange = (filters: any[]) => {
    setActiveFilters(filters);
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

  // Fermer les dropdowns quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown-container')) {
        setShowPartnersDropdown(false);
        setShowStatusesDropdown(false);
      }
    };

    if (showPartnersDropdown || showStatusesDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPartnersDropdown, showStatusesDropdown]);

  // Extraire les valeurs uniques de partenaires et statuts
  const uniquePartners = useMemo(() => {
    const partners = new Set<string>();
    normalizedData.forEach(sub => {
      if (sub.partenaire?.name) {
        partners.add(sub.partenaire.name);
      }
    });
    return Array.from(partners).sort();
  }, [normalizedData]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    normalizedData.forEach(sub => {
      if (sub.status) {
        statuses.add(sub.status);
      }
    });
    return Array.from(statuses).sort();
  }, [normalizedData]);

  // Appliquer les filtres Partenaire et Statuts
  const filteredByPartnersAndStatuses = useMemo(() => {
    let filtered = hasActiveSearch ? searchFilteredData : normalizedData;
    
    // Filtrer par partenaires
    if (selectedPartners.length > 0) {
      filtered = filtered.filter(sub => {
        if (!sub.partenaire?.name) return selectedPartners.includes('Sans partenaire');
        return selectedPartners.includes(sub.partenaire.name);
      });
    }
    
    // Filtrer par statuts
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(sub => selectedStatuses.includes(sub.status));
    }
    
    return filtered;
  }, [normalizedData, searchFilteredData, hasActiveSearch, selectedPartners, selectedStatuses]);

  // Tri des données (appliqué après la recherche, les filtres et le filtre AI)
  const sortedData = useMemo(() => {
    let dataToSort = filteredByPartnersAndStatuses;
    
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
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredByPartnersAndStatuses, aiFilteredData, sortConfig]);

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
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher une souscription..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Filter Partenaire */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={() => setShowPartnersDropdown(!showPartnersDropdown)}
                className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${
                  selectedPartners.length > 0
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Partenaire</span>
                {selectedPartners.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                    {selectedPartners.length}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showPartnersDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Filtrer par partenaire</span>
                    {selectedPartners.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedPartners([]);
                          setPaginationPage(1);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="mb-2">
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPartners.includes('Sans partenaire')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPartners([...selectedPartners, 'Sans partenaire']);
                            } else {
                              setSelectedPartners(selectedPartners.filter(p => p !== 'Sans partenaire'));
                            }
                            setPaginationPage(1);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Sans partenaire</span>
                      </label>
                    </div>
                    {uniquePartners.map(partner => (
                      <label key={partner} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPartners.includes(partner)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPartners([...selectedPartners, partner]);
                            } else {
                              setSelectedPartners(selectedPartners.filter(p => p !== partner));
                            }
                            setPaginationPage(1);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{partner}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filter Statuts */}
            <div className="relative filter-dropdown-container">
              <button
                onClick={() => setShowStatusesDropdown(!showStatusesDropdown)}
                className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${
                  selectedStatuses.length > 0
                    ? 'border-purple-300 bg-purple-50 text-purple-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Statuts</span>
                {selectedStatuses.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                    {selectedStatuses.length}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showStatusesDropdown && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Filtrer par statut</span>
                    {selectedStatuses.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedStatuses([]);
                          setPaginationPage(1);
                        }}
                        className="text-xs text-purple-600 hover:text-purple-700"
                      >
                        Réinitialiser
                      </button>
                    )}
                  </div>
                  <div className="p-2">
                    {uniqueStatuses.map(status => (
                      <label key={status} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatuses([...selectedStatuses, status]);
                            } else {
                              setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                            }
                            setPaginationPage(1);
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Ask AI Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAskAI}
              className="px-4 py-2.5 rounded-lg border border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 hover:from-purple-100 hover:to-blue-100 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI</span>
            </motion.button>
          </div>
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
              {hasActiveSearch && (
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
