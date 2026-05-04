import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Download, List, X, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { generateAlerts, AlertItem } from '../utils/alertsGenerator';
import { useTableSearch } from '../utils/useTableSearch';
import { ALERT_SEARCH_FIELDS } from '../utils/searchConfig';
import { analyzeQuery } from '../utils/aiAnalyzer';
import { useAppStore } from '../utils/appStoreContext';

import { AlertsLandingPage } from './AlertsLandingPage';
import { AlertDataTable } from './AlertDataTable';
import { AIInsightBanner } from './AIInsightBanner';
import { AskAIDialog } from './AskAIDialog';
import { DecisionPanel } from './DecisionPanel';

import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { DataPagination } from './ui/data-pagination';
import { FilterCard } from './ui/filter-card';
import { PageHeader } from './ui/page-header';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { FilterBar, type FilterConfig } from './FilterBar';
import { cn } from './ui/utils';

type TabType = 'Membercheck' | 'ORIAS';
type AlertStatus = 'pending' | 'confirmed' | 'rejected' | 'all';

interface AlertsPageProps {
  entitiesManagementEnabled?: boolean;
  onEnableModule?: () => void;
  alerts?: AlertItem[];
}

const ALERT_FILTER_CONFIGS: FilterConfig[] = [
  {
    id: 'matchRange',
    label: 'Score',
    type: 'select',
    isPrimary: true,
    placeholder: 'Score de match',
    options: [
      { value: '90-100', label: '≥ 90% (très fort)' },
      { value: '80-89', label: '80% – 89%' },
      { value: '60-79', label: '60% – 79%' },
      { value: '0-59', label: '< 60%' },
    ],
  },
  {
    id: 'changes',
    label: 'Changement',
    type: 'select',
    isPrimary: true,
    placeholder: 'Changement',
    options: [
      { value: 'New', label: 'Nouveau' },
      { value: 'Modified', label: 'Modifié' },
      { value: 'none', label: 'Aucun' },
    ],
  },
  {
    id: 'status',
    label: 'Statut',
    type: 'select',
    isPrimary: false,
    placeholder: 'Statut',
    options: [
      { value: 'Pending', label: 'En attente' },
      { value: 'Confirmed', label: 'Confirmée' },
      { value: 'Rejected', label: 'Rejetée' },
    ],
  },
  {
    id: 'entity',
    label: 'Entité',
    type: 'select',
    isPrimary: false,
    placeholder: 'Entité',
    options: [],
  },
];

const STATUS_GROUPS: Record<AlertStatus, AlertItem['status'] | null> = {
  all: null,
  pending: 'Pending',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
};

export function AlertsPage({ onEnableModule, alerts }: AlertsPageProps) {
  const { isModuleActive } = useAppStore();
  const isCompliancePlusActive = isModuleActive('Compliance Plus');

  if (!isCompliancePlusActive) {
    return <AlertsLandingPage onEnableModule={onEnableModule || (() => {})} />;
  }

  const [allAlerts] = useState<AlertItem[]>(() => alerts || generateAlerts(100));
  const [activeTab, setActiveTab] = useState<TabType>('Membercheck');
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [activeStatus, setActiveStatus] = useState<AlertStatus>('all');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const [askAIDialogOpen, setAskAIDialogOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<any>(null);

  const alertsBySource = useMemo(
    () => allAlerts.filter((alert) => alert.source === activeTab),
    [allAlerts, activeTab],
  );

  const statusCounts = useMemo(() => {
    return {
      total: alertsBySource.length,
      pending: alertsBySource.filter((a) => a.status === 'Pending').length,
      confirmed: alertsBySource.filter((a) => a.status === 'Confirmed').length,
      rejected: alertsBySource.filter((a) => a.status === 'Rejected').length,
    };
  }, [alertsBySource]);

  const sourceCounts = useMemo(() => {
    return {
      Membercheck: allAlerts.filter((a) => a.source === 'Membercheck').length,
      Membercheck_pending: allAlerts.filter(
        (a) => a.source === 'Membercheck' && a.status === 'Pending',
      ).length,
      ORIAS: allAlerts.filter((a) => a.source === 'ORIAS').length,
      ORIAS_pending: allAlerts.filter(
        (a) => a.source === 'ORIAS' && a.status === 'Pending',
      ).length,
    };
  }, [allAlerts]);

  const availableEntities = useMemo(() => {
    const set = new Set<string>();
    alertsBySource.forEach((a) => set.add(a.entityName));
    return Array.from(set).sort();
  }, [alertsBySource]);

  const filterConfigs = useMemo<FilterConfig[]>(
    () =>
      ALERT_FILTER_CONFIGS.map((cfg) =>
        cfg.id === 'entity'
          ? {
              ...cfg,
              options: availableEntities.map((e) => ({ value: e, label: e })),
            }
          : cfg,
      ),
    [availableEntities],
  );

  const alertsByStatus = useMemo(() => {
    const groupStatus = STATUS_GROUPS[activeStatus];
    if (!groupStatus) return alertsBySource;
    return alertsBySource.filter((a) => a.status === groupStatus);
  }, [alertsBySource, activeStatus]);

  const filteredAlerts = useMemo(() => {
    return alertsByStatus.filter((alert) => {
      if (activeFilters.status && alert.status !== activeFilters.status) return false;
      if (activeFilters.entity && alert.entityName !== activeFilters.entity) return false;
      if (activeFilters.changes) {
        if (activeFilters.changes === 'none' && alert.changes != null) return false;
        if (activeFilters.changes !== 'none' && alert.changes !== activeFilters.changes)
          return false;
      }
      if (activeFilters.matchRange) {
        const [minStr, maxStr] = activeFilters.matchRange.split('-');
        const min = Number(minStr);
        const max = Number(maxStr);
        if (alert.match < min || alert.match > max) return false;
      }
      return true;
    });
  }, [alertsByStatus, activeFilters]);

  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchedAlerts,
    hasActiveSearch,
  } = useTableSearch(filteredAlerts, ALERT_SEARCH_FIELDS);

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
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    return sorted;
  }, [searchedAlerts, sortConfig]);

  const totalItems = sortedAlerts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedAlerts = sortedAlerts.slice(startIndex, endIndex);

  useEffect(() => {
    setPaginationPage(1);
  }, [activeTab, activeStatus, activeFilters, searchTerm]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const handleStatusCardChange = (next: string) => {
    setActiveStatus((current) =>
      current === (next as AlertStatus) ? 'all' : (next as AlertStatus),
    );
    setSelectedAlert(null);
  };

  const handleFilterChange = (
    filterId: string,
    value: string | string[] | null,
  ) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const v = value === null ? null : Array.isArray(value) ? value[0] ?? null : value;
      if (!v) delete next[filterId];
      else next[filterId] = v;
      return next;
    });
  };

  const handleClearAll = () => {
    setActiveFilters({});
    setSearchTerm('');
    setActiveStatus('all');
  };

  const handleDecision = (alertId: string, decision: 'true_hit' | 'false_hit') => {
    const alertItem = sortedAlerts.find((a) => a.id === alertId);
    if (alertItem) {
      const action = decision === 'true_hit' ? 'confirmée' : 'rejetée';
      toast.success(`Alerte ${action}`, {
        description: `L'alerte pour ${alertItem.name} a été ${action}`,
      });
      setSelectedAlert(null);
    }
  };

  const handleExportAlerts = () => {
    const csvHeaders = ['ID', 'Name', 'Entity', 'Source', 'Match', 'Status', 'Changes', 'Date'];
    const csvData = sortedAlerts.map((alert) => [
      alert.id,
      alert.name,
      alert.entityName,
      alert.source,
      `${alert.match}%`,
      alert.status,
      alert.changes || 'N/A',
      alert.date,
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alertes_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Export réussi', {
      description: `${sortedAlerts.length} alerte${sortedAlerts.length > 1 ? 's' : ''} exportée${sortedAlerts.length > 1 ? 's' : ''}`,
    });
  };

  const handleAskAI = async (question: string) => {
    setAskAIDialogOpen(false);
    const insight = await analyzeQuery(question, sortedAlerts);
    setAiInsight(insight);
    toast.success('AI Analysis Complete', {
      description: 'Recommendations generated based on your question',
    });
  };

  const ratio = (count: number, total: number) =>
    total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Alertes"
        subtitle="Suivi et qualification des alertes de monitoring (Membercheck, ORIAS)"
        primaryAction={{
          label: `Exporter (${sortedAlerts.length})`,
          icon: <Download className="w-4 h-4" />,
          onClick: handleExportAlerts,
        }}
      />

      <AnimatePresence>
        {aiInsight && (
          <AIInsightBanner analysis={aiInsight} onClose={() => setAiInsight(null)} />
        )}
      </AnimatePresence>

      <div className="flex-1 px-6 pt-6 pb-6 flex flex-col gap-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabType)}
          className="w-fit"
        >
          <TabsList>
            <TabsTrigger value="Membercheck" className="gap-2">
              Membercheck
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {sourceCounts.Membercheck}
              </Badge>
              {sourceCounts.Membercheck_pending > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold px-1 text-primary-foreground"
                  style={{ backgroundColor: 'var(--danger)' }}
                >
                  {sourceCounts.Membercheck_pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ORIAS" className="gap-2">
              ORIAS
              <Badge variant="secondary" className="text-[10px] px-1.5">
                {sourceCounts.ORIAS}
              </Badge>
              {sourceCounts.ORIAS_pending > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold px-1 text-primary-foreground"
                  style={{ backgroundColor: 'var(--danger)' }}
                >
                  {sourceCounts.ORIAS_pending}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <section aria-label="Statut des alertes">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Statut des alertes
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
            <FilterCard
              status="pending"
              activeStatus={activeStatus}
              onStatusChange={handleStatusCardChange}
              label="En attente"
              icon={AlertCircle}
              total={statusCounts.pending}
              metricLabel="À traiter"
              metricValue={`${statusCounts.pending}`}
              averageValue={ratio(statusCounts.pending, statusCounts.total)}
              iconActiveClassName="text-amber-600"
            />
            <FilterCard
              status="confirmed"
              activeStatus={activeStatus}
              onStatusChange={handleStatusCardChange}
              label="Confirmées"
              icon={CheckCircle2}
              total={statusCounts.confirmed}
              metricLabel="True hits"
              metricValue={`${statusCounts.confirmed}`}
              averageValue={ratio(statusCounts.confirmed, statusCounts.total)}
              iconActiveClassName="text-emerald-600"
            />
            <FilterCard
              status="rejected"
              activeStatus={activeStatus}
              onStatusChange={handleStatusCardChange}
              label="Rejetées"
              icon={XCircle}
              total={statusCounts.rejected}
              metricLabel="False hits"
              metricValue={`${statusCounts.rejected}`}
              averageValue={ratio(statusCounts.rejected, statusCounts.total)}
              iconActiveClassName="text-red-600"
            />
            <FilterCard
              status="all"
              activeStatus={activeStatus}
              onStatusChange={handleStatusCardChange}
              label="Toutes"
              icon={List}
              total={statusCounts.total}
              metricLabel="Total"
              metricValue={`${statusCounts.total}`}
              averageValue="100%"
            />
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            width: selectedAlert ? '60%' : '100%',
          }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
          className={cn(selectedAlert && 'min-w-0')}
        >
          <Card className="overflow-hidden p-0 gap-0 hover:shadow-lg transition-shadow duration-500">
            <div className="px-6 py-4 border-b border-border bg-card">
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Rechercher une alerte (nom, entité)…"
                filters={filterConfigs}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </div>

            <CardContent className="p-0 flex flex-col">
              <div className="flex-1 overflow-auto">
                {paginatedAlerts.length === 0 ? (
                  <div className="py-16 text-center">
                    <X className="w-10 h-10 mx-auto text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      {hasActiveSearch
                        ? 'Aucune alerte ne correspond à votre recherche'
                        : 'Aucune alerte à afficher'}
                    </p>
                  </div>
                ) : (
                  <AlertDataTable
                    data={paginatedAlerts}
                    hoveredRow={hoveredRow}
                    setHoveredRow={setHoveredRow}
                    onRowClick={setSelectedAlert}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    onDecision={handleDecision}
                  />
                )}
              </div>

              {totalItems > 0 && (
                <DataPagination
                  currentPage={paginationPage}
                  totalPages={totalPages}
                  pageSize={itemsPerPage}
                  totalItems={totalItems}
                  onPageChange={setPaginationPage}
                  onPageSizeChange={(size) => {
                    setItemsPerPage(size);
                    setPaginationPage(1);
                  }}
                  pageSizeOptions={[10, 20, 50, 100]}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedAlert && (
          <DecisionPanel
            entity={{
              id: selectedAlert.id,
              name: selectedAlert.entityName,
              details: {
                alerts: [selectedAlert.alert],
                auditTrail: [],
              },
            }}
            onClose={() => setSelectedAlert(null)}
          />
        )}
      </AnimatePresence>

      <AskAIDialog
        open={askAIDialogOpen}
        onClose={() => setAskAIDialogOpen(false)}
        onSubmit={handleAskAI}
      />
    </div>
  );
}
