import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Download,
  List,
  User,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { useAppStore } from '../utils/appStoreContext';
import { useTranslation } from '../utils/languageContext';
import { useCompliance } from '../utils/complianceContext';
import { getDetailIdFromHash, navigateToDetail, navigateToPage, onHashChange } from '../utils/routing';
import { copyToClipboard } from '../utils/clipboard';
import { exportTableToCSV } from '../utils/exportUtils';
import { ANALYSTS, type EntityRow, type EntityStatus } from '../utils/screeningMock';

import { EntitiesLandingPage } from './EntitiesLandingPage';
import { EntityDetailPage } from './entity-detail/EntityDetailPage';
import {
  CATEGORY_KEY,
  ENTITY_STATUS_KEY,
  ENTITY_STATUS_VARIANT,
  ENTITY_TYPE_KEY,
  RISK_KEY,
  RISK_VARIANT,
  formatRelativeTime,
} from './entity-detail/entityDetailShared';
import { DataTable, ColumnConfig } from './DataTable';
import { TableSkeleton } from './TableSkeleton';
import { ParentCell } from './ParentCell';
import { StatusBadge } from './StatusBadge';
import { Tag } from './Tag';

import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { DataPagination } from './ui/data-pagination';
import { FilterCard } from './ui/filter-card';
import { PageHeader } from './ui/page-header';
import { Switch } from './ui/switch';
import { FilterBar, type FilterConfig } from './FilterBar';

type StatusType = 'all' | 'need_review' | 'reviewed';

const STATUS_GROUPS: Record<StatusType, EntityStatus[]> = {
  all: [],
  need_review: ['Pending', 'New Hit'],
  reviewed: ['Clear', 'True Hit', 'Validated', 'Closed'],
};

const STATUS_FILTER_VALUES: EntityStatus[] = ['Pending', 'New Hit', 'True Hit', 'Clear', 'Validated', 'Closed'];
const RISK_FILTER_VALUES = ['Low', 'Medium', 'High', 'Pending'] as const;
const MAX_VISIBLE_TAGS = 3;

export function EntitiesPage() {
  const { isModuleActive } = useAppStore();
  const { t } = useTranslation();
  const { entityRows, isLoading, toggleMonitoring } = useCompliance();
  const isCompliancePlusActive = isModuleActive('Compliance Plus');

  const [detailUid, setDetailUid] = useState<string | null>(() => getDetailIdFromHash());
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusType>('all');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    const cleanup = onHashChange(() => setDetailUid(getDetailIdFromHash()));
    return cleanup;
  }, []);

  const filterConfigs = useMemo<FilterConfig[]>(
    () => [
      {
        id: 'type',
        label: t('complianceEntities.list.filters.type'),
        type: 'select',
        isPrimary: true,
        placeholder: t('complianceEntities.list.filters.type'),
        options: [
          { value: 'Individual', label: t(ENTITY_TYPE_KEY.Individual) },
          { value: 'Corporate', label: t(ENTITY_TYPE_KEY.Corporate) },
        ],
      },
      {
        id: 'riskLevel',
        label: t('complianceEntities.list.filters.risk'),
        type: 'select',
        isPrimary: true,
        placeholder: t('complianceEntities.list.filters.risk'),
        options: RISK_FILTER_VALUES.map((value) => ({ value, label: t(RISK_KEY[value]) })),
      },
      {
        id: 'status',
        label: t('complianceEntities.list.filters.status'),
        type: 'select',
        isPrimary: false,
        placeholder: t('complianceEntities.list.filters.status'),
        options: STATUS_FILTER_VALUES.map((value) => ({ value, label: t(ENTITY_STATUS_KEY[value]) })),
      },
      {
        id: 'analyst',
        label: t('complianceEntities.list.filters.analyst'),
        type: 'select',
        isPrimary: false,
        placeholder: t('complianceEntities.list.filters.analyst'),
        options: ANALYSTS.map((a) => ({ value: a, label: a })),
      },
      {
        id: 'monitoring',
        label: t('complianceEntities.list.filters.monitoring'),
        type: 'select',
        isPrimary: false,
        placeholder: t('complianceEntities.list.filters.monitoring'),
        options: [
          { value: 'monitored', label: t('complianceEntities.list.filters.monitored') },
          { value: 'not-monitored', label: t('complianceEntities.list.filters.notMonitored') },
        ],
      },
    ],
    [t],
  );

  const statusCounts = useMemo(() => {
    const total = entityRows.length;
    const needReview = entityRows.filter((e) => STATUS_GROUPS.need_review.includes(e.status)).length;
    const reviewed = entityRows.filter((e) => STATUS_GROUPS.reviewed.includes(e.status)).length;
    return { total, needReview, reviewed };
  }, [entityRows]);

  const filteredData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return entityRows.filter((entity) => {
      if (activeStatus !== 'all' && !STATUS_GROUPS[activeStatus].includes(entity.status)) return false;
      if (search && !entity.name.toLowerCase().includes(search) && !entity.uid.includes(search)) return false;
      if (activeFilters.type && entity.type !== activeFilters.type) return false;
      if (activeFilters.status && entity.status !== activeFilters.status) return false;
      if (activeFilters.riskLevel && entity.riskLevel !== activeFilters.riskLevel) return false;
      if (activeFilters.analyst && entity.analyst !== activeFilters.analyst) return false;
      if (activeFilters.monitoring) {
        if (activeFilters.monitoring === 'monitored' && !entity.monitoring) return false;
        if (activeFilters.monitoring === 'not-monitored' && entity.monitoring) return false;
      }
      return true;
    });
  }, [entityRows, searchTerm, activeFilters, activeStatus]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      let aVal: unknown = a[sortConfig.key as keyof EntityRow];
      let bVal: unknown = b[sortConfig.key as keyof EntityRow];
      if (sortConfig.key === 'lastUpdate') {
        aVal = a.lastUpdate.timestamp;
        bVal = b.lastUpdate.timestamp;
      }
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = sortedData.slice(startIndex, endIndex);

  useEffect(() => {
    setPaginationPage(1);
  }, [searchTerm, activeFilters, activeStatus]);

  if (!isCompliancePlusActive) {
    return <EntitiesLandingPage />;
  }

  if (detailUid) {
    return <EntityDetailPage uid={detailUid} onBack={() => navigateToPage('entities')} />;
  }

  const handleStatusChange = (next: string) => {
    setActiveStatus((current) => (current === (next as StatusType) ? 'all' : (next as StatusType)));
  };

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
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

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const handleRowClick = (row: EntityRow) => {
    navigateToDetail('entity', row.uid);
  };

  const handleMonitoringChange = (entityId: number, newValue: boolean) => {
    toggleMonitoring(entityId, newValue);
    toast.success(newValue ? t('complianceEntities.toast.monitoringOn') : t('complianceEntities.toast.monitoringOff'));
  };

  const handleCopyId = async (uid: string, entityId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(uid);
    if (success) {
      setCopiedId(entityId);
      toast.success(t('complianceEntities.list.toast.idCopied'), { description: uid });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error(t('complianceEntities.list.toast.copyError'), {
        description: t('complianceEntities.list.toast.copyErrorBody'),
      });
    }
  };

  const handleExport = () => {
    exportTableToCSV(sortedData);
    toast.success(t('complianceEntities.list.toast.exported'), {
      description: t('complianceEntities.list.toast.exportedBody', { count: sortedData.length }),
    });
  };

  const columns: ColumnConfig<EntityRow>[] = [
    {
      key: 'name',
      label: t('complianceEntities.list.columns.entity'),
      sortable: true,
      render: (entity) => (
        <div className="flex flex-col gap-1 max-w-[300px]">
          <motion.span
            whileHover={{ x: 2 }}
            className="text-sm text-primary hover:text-primary/80 font-medium cursor-pointer hover:underline transition-all truncate"
          >
            {entity.name}
          </motion.span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {t('complianceEntities.list.idLabel')} {entity.uid}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleCopyId(entity.uid, entity.id, e)}
              title={t('complianceEntities.list.copyId')}
              aria-label={t('complianceEntities.list.copyId')}
              className="p-0.5 hover:bg-muted rounded transition-colors"
            >
              {copiedId === entity.id ? (
                <Check className="w-3 h-3" style={{ color: 'var(--success)' }} />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </motion.button>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: t('complianceEntities.list.columns.type'),
      sortable: true,
      render: (entity) => {
        const isIndividual = entity.type === 'Individual';
        return (
          <div className="flex items-center gap-2">
            {isIndividual ? (
              <User className="w-4 h-4 text-primary" />
            ) : (
              <Building2 className="w-4 h-4 text-muted-foreground" />
            )}
            <Badge variant="secondary" className="text-xs font-medium">
              {t(ENTITY_TYPE_KEY[entity.type])}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: t('complianceEntities.list.columns.status'),
      sortable: true,
      render: (entity) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge label={t(ENTITY_STATUS_KEY[entity.status])} variant={ENTITY_STATUS_VARIANT[entity.status]} />
          {entity.pendingMatches > 0 && (
            <Badge variant="outline" className="text-xs">
              {entity.pendingMatches}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'riskLevel',
      label: t('complianceEntities.list.columns.risk'),
      sortable: true,
      render: (entity) => (
        <StatusBadge label={t(RISK_KEY[entity.riskLevel])} variant={RISK_VARIANT[entity.riskLevel]} />
      ),
    },
    {
      key: 'matchTypes',
      label: t('complianceEntities.list.columns.matches'),
      sortable: false,
      render: (entity) => {
        if (entity.matchTypes.length === 0) {
          return <span className="text-xs text-muted-foreground italic">{t('complianceEntities.list.noMatches')}</span>;
        }
        const visible = entity.matchTypes.slice(0, MAX_VISIBLE_TAGS);
        const remaining = entity.matchTypes.length - visible.length;
        return (
          <div className="flex flex-wrap gap-1">
            {visible.map((m) => (
              <Tag key={m} label={t(CATEGORY_KEY[m])} />
            ))}
            {remaining > 0 && <span className="text-xs text-muted-foreground self-center">+{remaining}</span>}
          </div>
        );
      },
    },
    {
      key: 'hits',
      label: t('complianceEntities.list.columns.hits'),
      sortable: true,
      render: (entity) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">{entity.hits}</span>
      ),
    },
    {
      key: 'decisions',
      label: t('complianceEntities.list.columns.decisions'),
      sortable: true,
      render: (entity) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">{entity.decisions}</span>
      ),
    },
    {
      key: 'parent',
      label: t('complianceEntities.list.columns.parent'),
      sortable: false,
      render: (entity) => <ParentCell parent={entity.parent} />,
    },
    {
      key: 'monitoring',
      label: t('complianceEntities.list.columns.monitoring'),
      render: (entity) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={entity.monitoring}
            disabled={entity.closed}
            onCheckedChange={(checked) => handleMonitoringChange(entity.id, checked)}
          />
        </div>
      ),
    },
    {
      key: 'lastUpdate',
      label: t('complianceEntities.list.columns.updated'),
      sortable: true,
      render: (entity) => (
        <span className="text-sm text-muted-foreground">{formatRelativeTime(entity.lastUpdate.timestamp, t)}</span>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title={t('complianceEntities.list.title')}
        subtitle={t('complianceEntities.list.subtitle')}
        primaryAction={{
          label: t('complianceEntities.list.export'),
          icon: <Download className="w-4 h-4" />,
          onClick: handleExport,
        }}
      />

      <div className="flex-1 px-6 pt-6 pb-6 flex flex-col gap-4">
        <section aria-label={t('complianceEntities.list.statusSection')}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t('complianceEntities.list.statusSection')}
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            <FilterCard
              status="need_review"
              activeStatus={activeStatus}
              onStatusChange={handleStatusChange}
              label={t('complianceEntities.list.cards.needReview')}
              icon={AlertCircle}
              total={statusCounts.needReview}
              metricLabel={t('complianceEntities.list.cards.needReviewMetric')}
              metricValue={`${statusCounts.needReview}`}
              averageValue={
                statusCounts.total > 0 ? `${Math.round((statusCounts.needReview / statusCounts.total) * 100)}%` : '0%'
              }
              iconActiveClassName="text-amber-600"
            />
            <FilterCard
              status="reviewed"
              activeStatus={activeStatus}
              onStatusChange={handleStatusChange}
              label={t('complianceEntities.list.cards.reviewed')}
              icon={CheckCircle2}
              total={statusCounts.reviewed}
              metricLabel={t('complianceEntities.list.cards.reviewedMetric')}
              metricValue={`${statusCounts.reviewed}`}
              averageValue={
                statusCounts.total > 0 ? `${Math.round((statusCounts.reviewed / statusCounts.total) * 100)}%` : '0%'
              }
              iconActiveClassName="text-emerald-600"
            />
            <FilterCard
              status="all"
              activeStatus={activeStatus}
              onStatusChange={handleStatusChange}
              label={t('complianceEntities.list.cards.all')}
              icon={List}
              total={statusCounts.total}
              metricLabel={t('complianceEntities.list.cards.allMetric')}
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
                searchPlaceholder={t('complianceEntities.list.searchPlaceholder')}
                filters={filterConfigs}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
              />
            </div>

            <CardContent className="p-0 flex flex-col">
              <div className="flex-1 overflow-auto">
                {isLoading ? (
                  <TableSkeleton />
                ) : tableData.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-sm text-muted-foreground">{t('complianceEntities.list.empty')}</p>
                  </div>
                ) : (
                  <DataTable
                    data={tableData}
                    hoveredRow={hoveredRow}
                    setHoveredRow={setHoveredRow}
                    onRowClick={handleRowClick}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    allFilteredData={filteredData}
                    columns={columns}
                    entityName={t('complianceEntities.list.entityUnit')}
                  />
                )}
              </div>

              {!isLoading && (
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
    </div>
  );
}
