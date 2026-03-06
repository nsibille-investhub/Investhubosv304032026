import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';
import { generateAlerts, AlertItem } from '../utils/alertsGenerator';
import { DecisionPanel } from './DecisionPanel';
import { useTableSearch } from '../utils/useTableSearch';
import { ALERT_SEARCH_FIELDS } from '../utils/searchConfig';
import { AlertStatusTabs } from './AlertStatusTabs';
import { AlertDataTable } from './AlertDataTable';
import { AIInsightBanner } from './AIInsightBanner';
import { AskAIDialog } from './AskAIDialog';
import { analyzeQuery } from '../utils/aiAnalyzer';
import { AlertsLandingPage } from './AlertsLandingPage';
import { useAppStore } from '../utils/appStoreContext';
import { AlertFilterBar, AlertFilters } from './AlertFilterBar';

type TabType = 'Membercheck' | 'ORIAS';
type AlertStatus = 'pending' | 'confirmed' | 'rejected' | 'all';

interface AlertsPageProps {
  entitiesManagementEnabled?: boolean;
  onEnableModule?: () => void;
  alerts?: AlertItem[];
}

export function AlertsPage({ entitiesManagementEnabled = false, onEnableModule, alerts }: AlertsPageProps) {
  const { isModuleActive } = useAppStore();
  const isCompliancePlusActive = isModuleActive('Compliance Plus');
  
  // Si le module n'est pas activé, afficher la landing page
  if (!isCompliancePlusActive) {
    return <AlertsLandingPage onEnableModule={onEnableModule || (() => {})} />;
  }
  
  const [allAlerts] = useState(() => alerts || generateAlerts(100));
  const [activeTab, setActiveTab] = useState<TabType>('Membercheck');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [activeStatus, setActiveStatus] = useState<AlertStatus>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // AI features
  const [askAIDialogOpen, setAskAIDialogOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<any>(null);

  // Filtres avancés
  const [advancedFilters, setAdvancedFilters] = useState<AlertFilters>({
    name: '',
    alertTypes: [],
    matchRange: null,
    statuses: [],
    dateRange: null,
    entities: []
  });

  // Filtrer par source (Membercheck / ORIAS)
  const alertsBySource = useMemo(() => {
    return allAlerts.filter(alert => alert.source === activeTab);
  }, [allAlerts, activeTab]);

  // Filtrer par statut
  const alertsByStatus = useMemo(() => {
    if (activeStatus === 'all') return alertsBySource;
    if (activeStatus === 'pending') return alertsBySource.filter(a => a.status === 'Pending');
    if (activeStatus === 'confirmed') return alertsBySource.filter(a => a.status === 'Confirmed');
    if (activeStatus === 'rejected') return alertsBySource.filter(a => a.status === 'Rejected');
    return alertsBySource;
  }, [alertsBySource, activeStatus]);

  // Appliquer les filtres avancés
  const filteredAlerts = useMemo(() => {
    let results = alertsByStatus;

    // Filtre par nom
    if (advancedFilters.name.trim()) {
      const searchLower = advancedFilters.name.toLowerCase();
      results = results.filter(alert => 
        alert.name.toLowerCase().includes(searchLower) ||
        alert.entityName.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par type d'alerte (source)
    if (advancedFilters.alertTypes.length > 0) {
      results = results.filter(alert =>
        advancedFilters.alertTypes.includes(alert.source)
      );
    }

    // Filtre par match range
    if (advancedFilters.matchRange) {
      results = results.filter(alert =>
        alert.match >= advancedFilters.matchRange!.min &&
        alert.match <= advancedFilters.matchRange!.max
      );
    }

    // Filtre par statut
    if (advancedFilters.statuses.length > 0) {
      results = results.filter(alert =>
        advancedFilters.statuses.includes(alert.status)
      );
    }

    // Filtre par entité
    if (advancedFilters.entities.length > 0) {
      results = results.filter(alert =>
        advancedFilters.entities.includes(alert.entityName)
      );
    }

    // Filtre par date
    if (advancedFilters.dateRange) {
      results = results.filter(alert => {
        const alertDate = new Date(alert.date);
        const startDate = new Date(advancedFilters.dateRange!.start);
        const endDate = new Date(advancedFilters.dateRange!.end);
        return alertDate >= startDate && alertDate <= endDate;
      });
    }

    return results;
  }, [alertsByStatus, advancedFilters]);

  // Extraire les entités disponibles pour le filtre multiselect
  const availableEntities = useMemo(() => {
    const entities = new Set<string>();
    alertsByStatus.forEach(alert => {
      entities.add(alert.entityName);
    });
    return Array.from(entities).sort();
  }, [alertsByStatus]);

  // Recherche dans les alertes
  const { 
    searchTerm,
    setSearchTerm,
    filteredData: searchedAlerts,
    hasActiveSearch
  } = useTableSearch(filteredAlerts, ALERT_SEARCH_FIELDS);

  // Appliquer le tri
  const sortedAlerts = useMemo(() => {
    if (!sortConfig) return searchedAlerts || [];
    
    const sorted = [...(searchedAlerts || [])].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof AlertItem];
      const bValue = b[sortConfig.key as keyof AlertItem];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });
    
    return sorted;
  }, [searchedAlerts, sortConfig]);

  // Pagination
  const totalItems = sortedAlerts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedAlerts = sortedAlerts.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDecision = (alertId: string, decision: 'true_hit' | 'false_hit') => {
    const alertItem = sortedAlerts.find(a => a.id === alertId);
    if (alertItem) {
      const action = decision === 'true_hit' ? 'confirmée' : 'rejetée';
      toast.success(`Alerte ${action}`, {
        description: `L'alerte pour ${alertItem.name} a été ${action}`
      });
      setSelectedAlert(null);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedAlert(null);
  };

  const handleExportAlerts = () => {
    const csvHeaders = ['ID', 'Name', 'Entity', 'Source', 'Match', 'Status', 'Changes', 'Date'];
    const csvData = sortedAlerts.map(alert => [
      alert.id,
      alert.name,
      alert.entityName,
      alert.source,
      `${alert.match}%`,
      alert.status,
      alert.changes || 'N/A',
      alert.date
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alertes_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export réussi', {
      description: `${sortedAlerts.length} alerte${sortedAlerts.length > 1 ? 's' : ''} exportée${sortedAlerts.length > 1 ? 's' : ''}`
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
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

  // AI Analysis
  const handleAskAI = async (question: string) => {
    setAskAIDialogOpen(false);
    
    const insight = await analyzeQuery(question, sortedAlerts);
    setAiInsight(insight);
    
    toast.success('AI Analysis Complete', {
      description: 'Recommendations generated based on your question'
    });
  };

  const handleAskAIDirect = async (query: string) => {
    const insight = await analyzeQuery(query, sortedAlerts);
    setAiInsight(insight);
    
    toast.success('AI Analysis Complete', {
      description: 'Recommendations generated'
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 relative">
      {/* AI Insight Banner */}
      <AnimatePresence>
        {aiInsight && (
          <AIInsightBanner
            insight={aiInsight}
            onDismiss={() => setAiInsight(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Alertes</h1>
            <p className="text-sm text-gray-600">Gestion des alertes de monitoring</p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportAlerts}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter ({sortedAlerts.length})
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex items-center gap-6">
          {['Membercheck', 'ORIAS'].map((source) => {
            const count = allAlerts.filter(a => a.source === source).length;
            const pendingCount = allAlerts.filter(a => a.source === source && a.status === 'Pending').length;
            
            return (
              <button
                key={source}
                onClick={() => {
                  setActiveTab(source as TabType);
                  setPaginationPage(1);
                }}
                className={`px-4 py-3 border-b-2 transition-colors ${
                  activeTab === source
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{source}</span>

                  {pendingCount > 0 && (
                    <Badge className="bg-red-500 text-white">
                      {pendingCount}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Tabs */}
      <AlertStatusTabs
        data={alertsBySource}
        activeStatus={activeStatus}
        onStatusChange={(status) => {
          setActiveStatus(status);
          setPaginationPage(1);
        }}
      />

      {/* Filter Bar */}
      <AlertFilterBar
        filters={advancedFilters}
        onFiltersChange={(newFilters) => {
          setAdvancedFilters(newFilters);
          setPaginationPage(1); // Reset to first page when filters change
        }}
        availableEntities={availableEntities}
        totalCount={alertsByStatus.length}
        filteredCount={filteredAlerts.length}
      />

      {/* Table Section with Drawer - Same layout as Entities */}
      <div className="flex-1 px-6 pt-4 pb-6 flex gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            width: selectedAlert ? '40%' : '100%'
          }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-500 flex flex-col"
        >
          {/* Table */}
          <div className="flex-1 overflow-auto">
            <AlertDataTable
              data={paginatedAlerts}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              onRowClick={setSelectedAlert}
              sortConfig={sortConfig}
              onSort={handleSort}
              onDecision={handleDecision}
            />

            {paginatedAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-400 mb-2">
                  <X className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">
                  {hasActiveSearch 
                    ? 'Aucune alerte ne correspond à votre recherche' 
                    : 'Aucune alerte à afficher'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="text-sm text-gray-600">
                {startIndex + 1}-{endIndex} of {totalItems} items
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationPage - 1)}
                  disabled={paginationPage === 1}
                  className="p-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <Button
                      key={index}
                      variant={page === paginationPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[36px] ${
                        page === paginationPage 
                          ? 'bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white' 
                          : ''
                      }`}
                    >
                      {page}
                    </Button>
                  ) : (
                    <span key={index} className="px-2 text-gray-400">...</span>
                  )
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(paginationPage + 1)}
                  disabled={paginationPage === totalPages}
                  className="p-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Decision Panel - Same as Entities */}
        <AnimatePresence>
          {selectedAlert && (
            <DecisionPanel
              entity={{
                id: selectedAlert.id,
                name: selectedAlert.entityName,
                details: {
                  alerts: [selectedAlert.alert],
                  auditTrail: []
                }
              }}
              onClose={handleCloseDrawer}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Ask AI Dialog */}
      <AskAIDialog
        open={askAIDialogOpen}
        onClose={() => setAskAIDialogOpen(false)}
        onSubmit={handleAskAI}
      />
    </div>
  );
}