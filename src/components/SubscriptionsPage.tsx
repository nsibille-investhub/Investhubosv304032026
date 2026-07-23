import { useState, useMemo } from 'react';
import { Subscription } from '../utils/subscriptionGenerator';
import { toast } from 'sonner';
import { SubscriptionDynamicTable } from './SubscriptionDynamicTable';
import { TableSkeleton } from './TableSkeleton';
import { FilterBar, FilterConfig } from './FilterBar';
import { DataPagination } from './ui/data-pagination';
import { useTableSearch } from '../utils/useTableSearch';
import { SUBSCRIPTION_SEARCH_FIELDS } from '../utils/searchConfig';
import { AskAIDialog } from './AskAIDialog';
import { AIInsightBanner } from './AIInsightBanner';
import { AIAnalysis, analyzeSubscriptions } from '../utils/aiAnalyzer';
import { SubscriptionWorkflowStatus } from '../utils/subscriptionColumns';
import { useTranslation } from '../utils/languageContext';

interface SubscriptionsPageProps {
  data: Subscription[];
  isLoading: boolean;
  allData: Subscription[];
  setAllData: (data: Subscription[]) => void;
  onSubscriptionClick?: (subscription: Subscription) => void;
  activeStatus?: SubscriptionWorkflowStatus; // 🆕 Prop pour déterminer les colonnes
}

export function SubscriptionsPage({ data, isLoading, allData, setAllData, onSubscriptionClick, activeStatus = 'all' }: SubscriptionsPageProps) {
  const { t } = useTranslation();
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
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

  const subscriberOptions = useMemo(() => {
    const names = new Set<string>();
    normalizedData.forEach((sub) => {
      if (sub.contrepartie?.name) names.add(sub.contrepartie.name);
      if (sub.contrepartie?.structure) names.add(sub.contrepartie.structure);
      if (sub.contrepartie?.investor) names.add(sub.contrepartie.investor);
    });
    return Array.from(names).sort().map((n) => ({ value: n, label: n }));
  }, [normalizedData]);

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: 'status',
      label: t('subscriptions.filters.status'),
      type: 'select',
      isPrimary: true,
      options: Array.from(new Set(normalizedData.map((sub) => sub.status)))
        .filter(Boolean)
        .sort()
        .map((status) => ({ value: status, label: status })),
    },
    {
      id: 'subscriber',
      label: t('subscriptions.filters.subscriber'),
      type: 'select',
      isPrimary: true,
      options: subscriberOptions,
    },
    {
      id: 'partner',
      label: t('subscriptions.filters.partner'),
      type: 'select',
      isPrimary: false,
      options: [
        { value: 'Sans partenaire', label: t('subscriptions.filters.noPartner') },
        ...Array.from(new Set(normalizedData.map((sub) => sub.partenaire?.name).filter(Boolean) as string[]))
          .sort()
          .map((partner) => ({ value: partner, label: partner })),
      ],
    },
    {
      id: 'fund',
      label: t('subscriptions.filters.fund'),
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.fund?.name).filter(Boolean) as string[]))
        .sort()
        .map((fund) => ({ value: fund, label: fund })),
    },
    {
      id: 'shareClass',
      label: t('subscriptions.filters.shareClass'),
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.fund?.shareClass).filter(Boolean) as string[]))
        .sort()
        .map((shareClass) => ({ value: shareClass, label: shareClass })),
    },
    {
      id: 'type',
      label: t('subscriptions.filters.type'),
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.type)))
        .filter(Boolean)
        .sort()
        .map((type) => ({ value: type, label: type })),
    },
    {
      id: 'gestionnaire',
      label: t('subscriptions.filters.manager'),
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(normalizedData.map((sub) => sub.analyst)))
        .filter(Boolean)
        .sort()
        .map((analyst) => ({ value: analyst, label: analyst })),
    },
  ], [normalizedData, subscriberOptions, t]);

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setAiFilteredData(null);
    setPaginationPage(1);
    toast.success(t('toast.filtersReset'));
  };

  const filteredData = useMemo(() => {
    let baseData = hasActiveSearch ? searchFilteredData : normalizedData;

    if (aiFilteredData) {
      baseData = aiFilteredData;
    }

    if (Object.keys(activeFilters).length === 0) return baseData;

    return baseData.filter((subscription) => {
      if (activeFilters.status && subscription.status !== activeFilters.status) return false;

      if (activeFilters.subscriber) {
        const q = (activeFilters.subscriber as string).toLowerCase();
        const nameMatch = subscription.contrepartie?.name?.toLowerCase().includes(q);
        const structureMatch = subscription.contrepartie?.structure?.toLowerCase().includes(q);
        const investorMatch = subscription.contrepartie?.investor?.toLowerCase().includes(q);
        if (!nameMatch && !structureMatch && !investorMatch) return false;
      }

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
    toast.success(t('toast.sortApplied'), {
      description: t(direction === 'asc' ? 'subscriptions.page.sortByAsc' : 'subscriptions.page.sortByDesc', { key }),
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationPage(page);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
  };

  const handleRowClick = (row: Subscription) => {
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
    
    toast.success(newMonitoringState ? t('toast.monitoringEnabled') : t('toast.monitoringDisabled'), {
      description: t('subscriptions.detail.monitoringFor', { name: allData.find(s => s.id === subscriptionId)?.name ?? '' }),
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

    toast.success(t('toast.analystUpdated'), {
      description: t('subscriptions.detail.analystAssigned', { analyst: newAnalyst, name: allData.find(s => s.id === subscriptionId)?.name ?? '' }),
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
    toast.success(t('toast.aiFilterApplied'), {
      description: t('toast.subscriptionsDisplayed', { count: items.length })
    });
  };

  const handleAIAnalysisReceived = (analysis: AIAnalysis) => {
    setAiAnalysis(analysis);
  };

  const handleCloseBanner = () => {
    setAiAnalysis(null);
    setAiFilteredData(null);
    if (aiFilteredData) {
      toast.info(t('toast.aiFilterDisabled'), {
        description: t('toast.showAllSubscriptions')
      });
    }
  };

  const handleInsightClick = (index: number) => {
    if (aiAnalysis && aiAnalysis.insights[index].items) {
      handleAIInsightApply(aiAnalysis.insights[index].items!);
    }
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
      <div className="w-full bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Filter Bar */}
        <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder={t('subscriptions.page.searchPlaceholder')}
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
          <DataPagination
            currentPage={paginationPage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handleItemsPerPageChange}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </div>

      {/* AI Dialog */}
      <AskAIDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
        onAnalyze={handleAskAIDirect}
      />
    </div>
  );
}
