import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronUp,
  Download,
  List,
  X,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { generateAlerts, AlertItem } from '../utils/alertsGenerator';
import { useTableSearch } from '../utils/useTableSearch';
import { ALERT_SEARCH_FIELDS } from '../utils/searchConfig';
import { analyzeQuery } from '../utils/aiAnalyzer';
import { useAppStore } from '../utils/appStoreContext';
import { useTranslation } from '../utils/languageContext';
import { useBulkSelection } from '../hooks/useBulkSelection';

import { AlertsLandingPage } from './AlertsLandingPage';
import { AlertDataTable, type AlertBulkAction } from './AlertDataTable';
import { AIInsightBanner } from './AIInsightBanner';
import { AskAIDialog } from './AskAIDialog';
import { AlertDetailDrawer } from './AlertDetailDrawer';
import { AlertBulkActionDialog } from './AlertBulkActionDialog';
import { BulkActionBar } from './ui/bulk-action-bar';

import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { DataPagination } from './ui/data-pagination';
import { FilterCard } from './ui/filter-card';
import { PageHeader } from './ui/page-header';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { FilterBar, type FilterConfig } from './FilterBar';

const BRAND_BLUE = '#000E2B';

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
    id: 'alertList',
    label: 'Liste',
    type: 'select',
    isPrimary: true,
    placeholder: 'Liste d\'alerte',
    options: [
      { value: 'PEP', label: 'PPE' },
      { value: 'Watch List', label: 'Liste de surveillance' },
      { value: 'Sanctions', label: 'Sanctions' },
      { value: 'Adverse Media', label: 'Presse négative' },
      { value: 'Crime', label: 'Criminalité' },
      { value: 'Financial Warning', label: 'Alerte financière' },
    ],
  },
  {
    id: 'dossier',
    label: 'Dossier',
    type: 'select',
    isPrimary: false,
    placeholder: 'Dossier',
    options: [],
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

const getAlertId = (a: AlertItem) => a.id;
const canSelectAlert = (a: AlertItem) => a.status === 'Pending';

export function AlertsPage({ onEnableModule, alerts }: AlertsPageProps) {
  const { isModuleActive } = useAppStore();
  const { t } = useTranslation();
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

  const [bulkAction, setBulkAction] = useState<AlertBulkAction | null>(null);
  const [singleQualify, setSingleQualify] = useState<{
    alertId: string;
    action: AlertBulkAction;
  } | null>(null);

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

  const availableDossiers = useMemo(() => {
    const set = new Set<string>();
    alertsBySource.forEach((a) => set.add(a.dossier));
    return Array.from(set).sort();
  }, [alertsBySource]);

  const filterConfigs = useMemo<FilterConfig[]>(
    () =>
      ALERT_FILTER_CONFIGS.map((cfg) => {
        if (cfg.id === 'entity') {
          return {
            ...cfg,
            options: availableEntities.map((e) => ({ value: e, label: e })),
          };
        }
        if (cfg.id === 'dossier') {
          return {
            ...cfg,
            options: availableDossiers.map((d) => ({ value: d, label: d })),
          };
        }
        return cfg;
      }),
    [availableEntities, availableDossiers],
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
      if (activeFilters.dossier && alert.dossier !== activeFilters.dossier) return false;
      if (activeFilters.alertList && alert.alertList !== activeFilters.alertList) return false;
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

  const pendingFilteredCount = useMemo(
    () => sortedAlerts.filter((a) => a.status === 'Pending').length,
    [sortedAlerts],
  );

  const {
    selectedIds,
    selectAllFiltered,
    toggleRow,
    togglePageAll,
    selectAllFilteredItems,
    clearSelection,
    allPageSelected,
    somePageSelected,
    selectedCount,
    selectedItems,
  } = useBulkSelection({
    allFilteredItems: sortedAlerts,
    pageItems: paginatedAlerts,
    getId: getAlertId,
    canSelect: canSelectAlert,
  });

  useEffect(() => {
    setPaginationPage(1);
  }, [activeTab, activeStatus, activeFilters, searchTerm]);

  useEffect(() => {
    clearSelection();
  }, [activeTab, activeStatus]);

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

  const handleDecision = (alertId: string, decision: AlertBulkAction) => {
    const alertItem = sortedAlerts.find((a) => a.id === alertId);
    if (alertItem) {
      const actionLabel =
        decision === 'true_hit'
          ? t('complianceAlerts.toast.actionConfirmed')
          : decision === 'false_hit'
            ? t('complianceAlerts.toast.actionRejected')
            : decision === 'escalate'
              ? t('complianceAlerts.tooltip.escalate')
              : t('complianceAlerts.drawer.decisionUnsure');
      toast.success(
        decision === 'true_hit'
          ? t('complianceAlerts.toast.confirmedTitle')
          : decision === 'false_hit'
            ? t('complianceAlerts.toast.rejectedTitle')
            : decision === 'escalate'
              ? t('complianceAlerts.tooltip.escalate')
              : t('complianceAlerts.drawer.decisionUnsure'),
        {
          description: t('complianceAlerts.toast.decisionBody', {
            name: alertItem.name,
            action: actionLabel,
          }),
        },
      );
      setSelectedAlert(null);
    }
  };

  const handleRowQualify = (alertId: string, action: AlertBulkAction) => {
    setSingleQualify({ alertId, action });
  };

  const singleQualifyAlerts = useMemo(() => {
    if (!singleQualify) return [];
    const a = sortedAlerts.find((x) => x.id === singleQualify.alertId);
    return a ? [a] : [];
  }, [singleQualify, sortedAlerts]);

  const handleBulkConfirm = (
    alertIds: string[],
    _action: AlertBulkAction,
    _comments: Record<string, string>,
  ) => {
    clearSelection();
    setBulkAction(null);
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

  const bulkActions = useMemo(
    () => [
      {
        labelKey: 'complianceAlerts.selection.actionConfirm',
        icon: <Check className="w-4 h-4" />,
        onClick: () => setBulkAction('true_hit'),
        color: 'var(--success)',
        borderColor: 'color-mix(in oklab, var(--success) 35%, transparent)',
        bgColor: 'var(--success-soft)',
      },
      {
        labelKey: 'complianceAlerts.selection.actionEscalate',
        icon: <ChevronUp className="w-4 h-4" />,
        onClick: () => setBulkAction('escalate'),
        color: 'var(--warning)',
        borderColor: 'color-mix(in oklab, var(--warning) 35%, transparent)',
        bgColor: 'var(--warning-soft)',
      },
      {
        labelKey: 'complianceAlerts.selection.actionReject',
        icon: <X className="w-4 h-4" />,
        onClick: () => setBulkAction('false_hit'),
        color: 'var(--danger)',
        borderColor: 'color-mix(in oklab, var(--danger) 35%, transparent)',
        bgColor: 'var(--danger-soft)',
      },
    ],
    [],
  );

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
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
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
              <BulkActionBar
                selectedCount={selectedCount}
                totalFilteredCount={pendingFilteredCount}
                selectAllFiltered={selectAllFiltered}
                onSelectAllFiltered={selectAllFilteredItems}
                onClearSelection={clearSelection}
                actions={bulkActions}
                unitOneKey="complianceAlerts.selection.selectedOne"
                unitManyKey="complianceAlerts.selection.selectedMany"
              />

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
                    onDecision={handleRowQualify}
                    selectedIds={selectedIds}
                    onToggleSelectRow={toggleRow}
                    onToggleSelectAll={togglePageAll}
                    allPendingSelected={allPageSelected}
                    somePendingSelected={somePageSelected}
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

      <AlertDetailDrawer
        alert={selectedAlert}
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onDecision={handleDecision}
      />

      <AlertBulkActionDialog
        open={bulkAction !== null}
        alerts={selectedItems}
        action={bulkAction}
        onClose={() => setBulkAction(null)}
        onConfirm={handleBulkConfirm}
      />

      <AlertBulkActionDialog
        open={singleQualify !== null && singleQualifyAlerts.length === 1}
        alerts={singleQualifyAlerts}
        action={singleQualify?.action ?? null}
        onClose={() => setSingleQualify(null)}
        onConfirm={() => setSingleQualify(null)}
      />

      <AskAIDialog
        open={askAIDialogOpen}
        onClose={() => setAskAIDialogOpen(false)}
        onSubmit={handleAskAI}
      />
    </div>
  );
}
