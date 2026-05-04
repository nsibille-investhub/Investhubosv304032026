import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { EntitiesLandingPage } from './EntitiesLandingPage';
import { generateEntities } from '../utils/entityGenerator';
import { DataTable, ColumnConfig } from './DataTable';
import { DecisionPanel } from './DecisionPanel';
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
import { cn } from './ui/utils';

import { copyToClipboard } from '../utils/clipboard';
import { EntityDetails } from '../utils/mockData';
import { EntityLink } from './EntityLinks';

type StatusType = 'all' | 'need_review' | 'reviewed';

interface Entity {
  id: number;
  uid: string;
  name: string;
  type: 'Individual' | 'Corporate';
  links: EntityLink[];
  status: string;
  secondaryStatus: string | null;
  exposure: string | null;
  riskLevel: string;
  matchTypes: ('PEP' | 'Sanctions' | 'Media')[];
  monitoring: boolean;
  hits: number;
  decisions: number;
  pendingMatches: number;
  analyst: string;
  parent: {
    type: 'Investor' | 'Partner' | 'Participation';
    name: string;
    entityType: 'Individual' | 'Corporate';
  };
  lastUpdate: {
    fullDate: string;
    relativeTime: string;
    timestamp: number;
  };
  details: EntityDetails;
}

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

const ENTITY_STATUS_VARIANT: Record<string, StatusBadgeVariant> = {
  Clear: 'success',
  Validated: 'success',
  Pending: 'warning',
  'New Hit': 'warning',
  'To Review': 'warning',
  Risk: 'danger',
  'True Hit': 'danger',
};

const RISK_LEVEL_VARIANT: Record<string, StatusBadgeVariant> = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
  Pending: 'neutral',
};

const ENTITY_FILTER_CONFIGS: FilterConfig[] = [
  {
    id: 'type',
    label: 'Type',
    type: 'select',
    isPrimary: true,
    placeholder: 'Type',
    options: [
      { value: 'Individual', label: 'Individual' },
      { value: 'Corporate', label: 'Corporate' },
    ],
  },
  {
    id: 'riskLevel',
    label: 'Risque',
    type: 'select',
    isPrimary: true,
    placeholder: 'Risque',
    options: [
      { value: 'Low', label: 'Low' },
      { value: 'Medium', label: 'Medium' },
      { value: 'High', label: 'High' },
      { value: 'Pending', label: 'Pending' },
    ],
  },
  {
    id: 'status',
    label: 'Statut',
    type: 'select',
    isPrimary: false,
    placeholder: 'Statut',
    options: [
      { value: 'Clear', label: 'Clear' },
      { value: 'Pending', label: 'Pending' },
      { value: 'True Hit', label: 'True Hit' },
      { value: 'New Hit', label: 'New Hit' },
      { value: 'Validated', label: 'Validated' },
    ],
  },
  {
    id: 'analyst',
    label: 'Analyste',
    type: 'select',
    isPrimary: false,
    placeholder: 'Analyste',
    options: [
      'Jean Dault',
      'Sophie Martin',
      'Marc Dubois',
      'Claire Rousseau',
      'Thomas Bernard',
      'Emma Leroy',
    ].map((a) => ({ value: a, label: a })),
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    type: 'select',
    isPrimary: false,
    placeholder: 'Monitoring',
    options: [
      { value: 'monitored', label: 'Monitoring activé' },
      { value: 'not-monitored', label: 'Monitoring désactivé' },
    ],
  },
];

const STATUS_GROUPS: Record<StatusType, string[]> = {
  all: [],
  need_review: ['Pending', 'New Hit'],
  reviewed: ['Clear', 'True Hit', 'Validated'],
};

export function EntitiesPage() {
  const { isModuleActive } = useAppStore();
  const isCompliancePlusActive = isModuleActive('Compliance Plus');

  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusType>('all');
  const [allTableData, setAllTableData] = useState<Entity[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  if (!isCompliancePlusActive) {
    return <EntitiesLandingPage />;
  }

  useEffect(() => {
    if (allTableData.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        const generatedData = generateEntities(100);
        setAllTableData(generatedData as Entity[]);
        setIsLoading(false);
        toast.success('Données chargées avec succès', {
          description: `${generatedData.length} entités chargées`,
        });
      }, 800);
    }
  }, []);

  const statusCounts = useMemo(() => {
    const total = allTableData.length;
    const needReview = allTableData.filter((e) =>
      STATUS_GROUPS.need_review.includes(e.status),
    ).length;
    const reviewed = allTableData.filter((e) =>
      STATUS_GROUPS.reviewed.includes(e.status),
    ).length;
    return { total, needReview, reviewed };
  }, [allTableData]);

  const filteredData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return allTableData.filter((entity) => {
      if (
        activeStatus !== 'all' &&
        !STATUS_GROUPS[activeStatus].includes(entity.status)
      )
        return false;
      if (search && !entity.name.toLowerCase().includes(search)) return false;
      if (activeFilters.type && entity.type !== activeFilters.type) return false;
      if (activeFilters.status && entity.status !== activeFilters.status) return false;
      if (activeFilters.riskLevel && entity.riskLevel !== activeFilters.riskLevel)
        return false;
      if (activeFilters.analyst && entity.analyst !== activeFilters.analyst)
        return false;
      if (activeFilters.monitoring) {
        if (activeFilters.monitoring === 'monitored' && !entity.monitoring) return false;
        if (activeFilters.monitoring === 'not-monitored' && entity.monitoring) return false;
      }
      return true;
    });
  }, [allTableData, searchTerm, activeFilters, activeStatus]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      let aVal: unknown = a[sortConfig.key as keyof Entity];
      let bVal: unknown = b[sortConfig.key as keyof Entity];
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

  const handleStatusChange = (next: string) => {
    setActiveStatus((current) =>
      current === (next as StatusType) ? 'all' : (next as StatusType),
    );
    setSelectedEntity(null);
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

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const handleRowClick = (row: Entity) => {
    setSelectedEntity(row);
  };

  const handleMonitoringChange = (entityId: number, newValue: boolean) => {
    setAllTableData((prev) =>
      prev.map((item) =>
        item.id === entityId ? { ...item, monitoring: newValue } : item,
      ),
    );
    if (selectedEntity?.id === entityId) {
      setSelectedEntity((prev) => (prev ? { ...prev, monitoring: newValue } : prev));
    }
    toast.success(newValue ? 'Monitoring activé' : 'Monitoring désactivé');
  };

  const handleAnalystChange = (entityId: number, newAnalyst: string) => {
    setAllTableData((prev) =>
      prev.map((item) =>
        item.id === entityId ? { ...item, analyst: newAnalyst } : item,
      ),
    );
    if (selectedEntity?.id === entityId) {
      setSelectedEntity((prev) => (prev ? { ...prev, analyst: newAnalyst } : prev));
    }
    toast.success('Analyste modifié', { description: `Assigné à ${newAnalyst}` });
  };

  const handleCopyId = async (uid: string, entityId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(uid);
    if (success) {
      setCopiedId(entityId);
      toast.success('ID copié !', { description: uid });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Erreur de copie', {
        description: 'Impossible de copier dans le presse-papier',
      });
    }
  };

  const columns: ColumnConfig<Entity>[] = [
    {
      key: 'name',
      label: 'Entité',
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
            <span className="text-xs text-muted-foreground">ID: {entity.uid}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleCopyId(entity.uid, entity.id, e)}
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
      label: 'Type',
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
              {entity.type}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (entity) => (
        <div className="flex items-center gap-1.5">
          <StatusBadge
            label={entity.status}
            variant={ENTITY_STATUS_VARIANT[entity.status] ?? 'neutral'}
          />
          {entity.status === 'Pending' && entity.pendingMatches > 0 && (
            <Badge variant="outline" className="text-xs">
              {entity.pendingMatches}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'riskLevel',
      label: 'Risque',
      sortable: true,
      render: (entity) => (
        <StatusBadge
          label={entity.riskLevel}
          variant={RISK_LEVEL_VARIANT[entity.riskLevel] ?? 'neutral'}
        />
      ),
    },
    {
      key: 'matchTypes',
      label: 'Matches',
      sortable: false,
      render: (entity) => {
        if (entity.matchTypes.length === 0) {
          return (
            <span className="text-xs text-muted-foreground italic">No matches</span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {entity.matchTypes.map((m) => (
              <Tag key={m} label={m} />
            ))}
          </div>
        );
      },
    },
    {
      key: 'hits',
      label: 'Hits',
      sortable: true,
      render: (entity) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {entity.hits}
        </span>
      ),
    },
    {
      key: 'decisions',
      label: 'Décisions',
      sortable: true,
      render: (entity) => (
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {entity.decisions}
        </span>
      ),
    },
    {
      key: 'parent',
      label: 'Parent',
      sortable: false,
      render: (entity) => <ParentCell parent={entity.parent} />,
    },
    {
      key: 'monitoring',
      label: 'Monitoring',
      render: (entity) => (
        <Switch
          checked={entity.monitoring}
          onCheckedChange={(checked) => handleMonitoringChange(entity.id, checked)}
        />
      ),
    },
    {
      key: 'lastUpdate',
      label: 'Maj.',
      sortable: true,
      render: (entity) => (
        <span className="text-sm text-muted-foreground">
          {entity.lastUpdate.relativeTime}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader
        title="Entités"
        subtitle="Gérez le screening, le monitoring et les décisions sur l'ensemble des entités"
        primaryAction={{
          label: 'Exporter',
          icon: <Download className="w-4 h-4" />,
          onClick: () => undefined,
        }}
      />

      <div className="flex-1 px-6 pt-6 pb-6 flex flex-col gap-4">
        <section aria-label="Statut des entités">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Statut des entités
          </h3>
          <div className="grid grid-cols-3 gap-1.5">
            <FilterCard
              status="need_review"
              activeStatus={activeStatus}
              onStatusChange={handleStatusChange}
              label="À examiner"
              icon={AlertCircle}
              total={statusCounts.needReview}
              metricLabel="Need review"
              metricValue={`${statusCounts.needReview}`}
              averageValue={
                statusCounts.total > 0
                  ? `${Math.round((statusCounts.needReview / statusCounts.total) * 100)}%`
                  : '0%'
              }
              iconActiveClassName="text-amber-600"
            />
            <FilterCard
              status="reviewed"
              activeStatus={activeStatus}
              onStatusChange={handleStatusChange}
              label="Examinées"
              icon={CheckCircle2}
              total={statusCounts.reviewed}
              metricLabel="Reviewed"
              metricValue={`${statusCounts.reviewed}`}
              averageValue={
                statusCounts.total > 0
                  ? `${Math.round((statusCounts.reviewed / statusCounts.total) * 100)}%`
                  : '0%'
              }
              iconActiveClassName="text-emerald-600"
            />
            <FilterCard
              status="all"
              activeStatus={activeStatus}
              onStatusChange={handleStatusChange}
              label="Toutes les entités"
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
            width: selectedEntity ? '60%' : '100%',
          }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
          className={cn(selectedEntity && 'min-w-0')}
        >
          <Card className="overflow-hidden p-0 gap-0 hover:shadow-lg transition-shadow duration-500">
            <div className="px-6 py-4 border-b border-border bg-card">
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder="Rechercher une entité…"
                filters={ENTITY_FILTER_CONFIGS}
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
                    <p className="text-sm text-muted-foreground">
                      Aucune entité ne correspond aux filtres actuels.
                    </p>
                  </div>
                ) : (
                  <DataTable
                    data={tableData}
                    hoveredRow={hoveredRow}
                    setHoveredRow={setHoveredRow}
                    onRowClick={handleRowClick}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                    compactMode={!!selectedEntity}
                    allFilteredData={filteredData}
                    columns={columns}
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

      <AnimatePresence>
        {selectedEntity && (
          <DecisionPanel
            entity={selectedEntity}
            onClose={() => setSelectedEntity(null)}
            onMonitoringChange={handleMonitoringChange}
            onAnalystChange={handleAnalystChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
