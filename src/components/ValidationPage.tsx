import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  RotateCcw,
  ShieldCheck,
  FileText,
  Tag as TagIcon,
  Landmark,
  Layers3,
  UserRound,
  Globe,
  Package,
  ChevronRight,
  Bell,
  BellOff,
  Mail,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { FilterCard } from './ui/filter-card';
import { FilterBar, FilterConfig } from './FilterBar';
import { DataPagination } from './ui/data-pagination';
import { Tag } from './Tag';
import { StatusBadge } from './StatusBadge';
import { TableSkeleton } from './TableSkeleton';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';
import { DocumentNameCell } from './DocumentNameCell';
import { UserCell } from './UserCell';
import { CommentIndicator } from './CommentIndicator';
import { NotificationPreviewDrawer } from './NotificationPreviewDrawer';
import { useTableSearch } from '../utils/useTableSearch';
import {
  generateValidationDocuments,
  getValidationBatches,
  TargetingKind,
  ValidationBatch,
  ValidationDocument,
  ValidationStatus,
} from '../utils/validationDocumentsGenerator';
import { useTranslation } from '../utils/languageContext';
import { cn } from './ui/utils';

interface ValidationPageProps {
  onBack: () => void;
}

type StatusTab = ValidationStatus | 'all';

const SEARCH_FIELDS: (keyof ValidationDocument | string)[] = [
  'name',
  'comment',
  'createdBy.name',
  'createdBy.role',
  'pathSegments',
  'targeting',
];

const STATUS_VARIANT: Record<
  ValidationStatus,
  { variant: 'warning' | 'success' | 'danger' }
> = {
  pending: { variant: 'warning' },
  validated: { variant: 'success' },
  rejected: { variant: 'danger' },
};

const TARGETING_ICON: Record<TargetingKind, LucideIcon> = {
  segment: TagIcon,
  fund: Landmark,
  shareClass: Layers3,
  investor: UserRound,
  subscription: FileText,
  audience: Globe,
};

// ---------------------------------------------------------------------------
// Row tree
// ---------------------------------------------------------------------------

type RowNode =
  | { kind: 'standalone'; doc: ValidationDocument; sortKey: number }
  | {
      kind: 'batch';
      batch: ValidationBatch;
      docs: ValidationDocument[];
      status: ValidationStatus;
      sortKey: number;
    };

function deriveBatchStatus(docs: ValidationDocument[]): ValidationStatus {
  if (docs.length === 0) return 'pending';
  if (docs.every((d) => d.status === 'validated')) return 'validated';
  if (docs.every((d) => d.status === 'rejected')) return 'rejected';
  return 'pending';
}

export function ValidationPage({ onBack }: ValidationPageProps) {
  const { t, lang } = useTranslation();
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [lang],
  );
  const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
  const targetingTooltip = (kind: TargetingKind) =>
    t(`dataRoom.validation.targetingTooltip.${kind}`);

  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<ValidationDocument[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusTab>('pending');
  const [activeFilters, setActiveFilters] = useState<
    Record<string, string | string[]>
  >({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [previewDocument, setPreviewDocument] =
    useState<ValidationDocument | null>(null);
  const [expandedBatchIds, setExpandedBatchIds] = useState<Set<string>>(
    new Set(),
  );
  const [activeNotificationBatchId, setActiveNotificationBatchId] = useState<
    string | null
  >(null);

  const batches = useMemo(() => getValidationBatches(), []);
  const batchById = useMemo(() => {
    const map = new Map<string, ValidationBatch>();
    batches.forEach((b) => map.set(b.id, b));
    return map;
  }, [batches]);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setDocuments(generateValidationDocuments());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const counts = useMemo(() => {
    return {
      pending: documents.filter((d) => d.status === 'pending').length,
      validated: documents.filter((d) => d.status === 'validated').length,
      rejected: documents.filter((d) => d.status === 'rejected').length,
      all: documents.length,
    };
  }, [documents]);

  const dataByStatus = useMemo(() => {
    if (activeStatus === 'all') return documents;
    return documents.filter((d) => d.status === activeStatus);
  }, [documents, activeStatus]);

  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchedData,
    hasActiveSearch,
  } = useTableSearch(dataByStatus, SEARCH_FIELDS);

  /** Documents matching status + search + advanced filters. */
  const matchingDocs = useMemo(() => {
    return searchedData.filter((doc) => {
      if (activeFilters.createdBy && doc.createdBy.name !== activeFilters.createdBy) {
        return false;
      }
      if (activeFilters.format && doc.format !== activeFilters.format) {
        return false;
      }
      const targetingFilter = activeFilters.targeting;
      if (Array.isArray(targetingFilter) && targetingFilter.length > 0) {
        const labels = doc.targeting.map((t) => t.label);
        const hasAny = targetingFilter.some((t) => labels.includes(t));
        if (!hasAny) return false;
      }
      return true;
    });
  }, [searchedData, activeFilters]);

  /** Build row nodes (batches + standalone), preserving the matching docs. */
  const rowNodes: RowNode[] = useMemo(() => {
    const matchingIds = new Set(matchingDocs.map((d) => d.id));
    const docsByBatch = new Map<string, ValidationDocument[]>();
    const standalones: ValidationDocument[] = [];

    // Group by batch using ALL docs (so a batch keeps every child once it appears)
    documents.forEach((doc) => {
      if (doc.batchId) {
        const list = docsByBatch.get(doc.batchId) ?? [];
        list.push(doc);
        docsByBatch.set(doc.batchId, list);
      }
    });

    // Standalones = docs without batchId AND matching the current filters
    matchingDocs.forEach((doc) => {
      if (!doc.batchId) standalones.push(doc);
    });

    const nodes: RowNode[] = [];

    // Batch nodes — visible if at least one of its docs matches
    docsByBatch.forEach((docs, batchId) => {
      const hasMatch = docs.some((d) => matchingIds.has(d.id));
      if (!hasMatch) return;
      const batch = batchById.get(batchId);
      if (!batch) return;
      const sortedDocs = [...docs].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      const sortKey = Math.max(
        ...sortedDocs.map((d) => new Date(d.createdAt).getTime()),
      );
      nodes.push({
        kind: 'batch',
        batch,
        docs: sortedDocs,
        status: deriveBatchStatus(sortedDocs),
        sortKey,
      });
    });

    standalones.forEach((doc) => {
      nodes.push({
        kind: 'standalone',
        doc,
        sortKey: new Date(doc.createdAt).getTime(),
      });
    });

    nodes.sort((a, b) => b.sortKey - a.sortKey);
    return nodes;
  }, [documents, matchingDocs, batchById]);

  const allCreators = useMemo(() => {
    const map = new Map<string, string>();
    documents.forEach((d) => map.set(d.createdBy.name, d.createdBy.name));
    return Array.from(map.values()).sort();
  }, [documents]);

  const allTargetings = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => d.targeting.forEach((t) => set.add(t.label)));
    return Array.from(set).sort();
  }, [documents]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'createdBy',
        label: t('dataRoom.validation.filters.createdBy'),
        type: 'select',
        isPrimary: true,
        options: allCreators.map((c) => ({ value: c, label: c })),
      },
      {
        id: 'targeting',
        label: t('dataRoom.validation.filters.targeting'),
        type: 'multiselect',
        isPrimary: true,
        options: allTargetings.map((tag) => ({ value: tag, label: tag })),
      },
      {
        id: 'format',
        label: t('dataRoom.validation.filters.format'),
        type: 'select',
        isPrimary: false,
        options: ['pdf', 'docx', 'xlsx', 'pptx'].map((f) => ({
          value: f,
          label: f.toUpperCase(),
        })),
      },
    ],
    [allCreators, allTargetings, t],
  );

  const totalItems = rowNodes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageNodes = rowNodes.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters =
    hasActiveSearch || Object.keys(activeFilters).length > 0;

  /** Auto-expand all visible batches when filters/search are active. */
  useEffect(() => {
    if (!hasActiveFilters) return;
    setExpandedBatchIds((prev) => {
      const next = new Set(prev);
      pageNodes.forEach((n) => {
        if (n.kind === 'batch') next.add(n.batch.id);
      });
      return next;
    });
  }, [hasActiveFilters, pageNodes]);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, activeFilters, searchTerm, pageSize]);

  const handleFilterChange = (
    filterId: string,
    value: string | string[] | null,
  ) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === null || (Array.isArray(value) && value.length === 0) || value === '') {
        delete next[filterId];
      } else {
        next[filterId] = value;
      }
      return next;
    });
  };

  const handleClearAll = () => {
    setActiveFilters({});
    setSearchTerm('');
  };

  const updateStatus = (docId: number, status: ValidationStatus) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        if (status === 'pending') {
          const { reviewedAt, reviewedBy, ...rest } = d;
          void reviewedAt;
          void reviewedBy;
          return { ...rest, status };
        }
        return {
          ...d,
          status,
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'You',
        };
      }),
    );
  };

  const handleValidate = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'validated');
    toast.success(t('dataRoom.validation.toast.documentValidated'), {
      description: doc.name,
    });
  };

  const handleReject = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'rejected');
    toast.error(t('dataRoom.validation.toast.documentRejected'), {
      description: doc.name,
    });
  };

  const handleResetToPending = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'pending');
    toast.info(t('dataRoom.validation.toast.documentReset'), {
      description: doc.name,
    });
  };

  /** Atomic batch action: applies a status to ALL children at once. */
  const updateBatchStatus = (batchId: string, status: ValidationStatus) => {
    const stamp = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.batchId !== batchId) return d;
        if (status === 'pending') {
          const { reviewedAt, reviewedBy, ...rest } = d;
          void reviewedAt;
          void reviewedBy;
          return { ...rest, status };
        }
        return { ...d, status, reviewedAt: stamp, reviewedBy: 'You' };
      }),
    );
  };

  const batchDescription = (count: number, name: string) =>
    t(
      count > 1
        ? 'dataRoom.validation.toast.batchDescriptionMany'
        : 'dataRoom.validation.toast.batchDescriptionOne',
      { count, name },
    );

  const handleValidateBatch = (batch: ValidationBatch, count: number) => {
    updateBatchStatus(batch.id, 'validated');
    if (batch.notification) {
      toast.success(t('dataRoom.validation.toast.batchValidatedWithNotification'), {
        description: batchDescription(count, batch.name),
      });
    } else {
      toast.success(t('dataRoom.validation.toast.batchValidated'), {
        description: batch.name,
      });
    }
  };

  const handleRejectBatch = (batch: ValidationBatch, count: number) => {
    updateBatchStatus(batch.id, 'rejected');
    toast.error(t('dataRoom.validation.toast.batchRejected'), {
      description: batchDescription(count, batch.name),
    });
  };

  const handleResetBatch = (batch: ValidationBatch) => {
    updateBatchStatus(batch.id, 'pending');
    toast.info(t('dataRoom.validation.toast.batchReset'), {
      description: batch.name,
    });
  };

  const toggleBatch = (batchId: string) => {
    setExpandedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  // Active notification batch (for the notification drawer)
  const activeNotificationBatch = useMemo(() => {
    if (!activeNotificationBatchId) return null;
    const node = rowNodes.find(
      (n): n is Extract<RowNode, { kind: 'batch' }> =>
        n.kind === 'batch' && n.batch.id === activeNotificationBatchId,
    );
    if (node) return node;
    // fallback: find from raw data even if not in current page (e.g. after status flip)
    const batch = batchById.get(activeNotificationBatchId);
    if (!batch) return null;
    const docs = documents.filter((d) => d.batchId === batch.id);
    return {
      kind: 'batch' as const,
      batch,
      docs,
      status: deriveBatchStatus(docs),
      sortKey: 0,
    };
  }, [activeNotificationBatchId, rowNodes, batchById, documents]);

  const stickyHeadActionsClass =
    'sticky right-0 z-20 bg-muted/40 backdrop-blur-sm';
  const stickyBodyActionsClass = (extra?: string) =>
    cn(
      'sticky right-0 z-10 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.18)] text-right',
      extra ?? 'bg-white dark:bg-gray-950',
    );

  const renderTargetingTags = (
    targeting: ValidationDocument['targeting'],
    maxVisible = 3,
  ) => (
    <div className="flex flex-wrap items-center gap-1">
      {targeting.slice(0, maxVisible).map((tag) => (
        <Tooltip key={`${tag.kind}:${tag.label}`}>
          <TooltipTrigger asChild>
            <span>
              <Tag icon={TARGETING_ICON[tag.kind]} label={tag.label} />
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="text-xs">{targetingTooltip(tag.kind)}</span>
          </TooltipContent>
        </Tooltip>
      ))}
      {targeting.length > maxVisible && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-gray-500 cursor-help">
              +{targeting.length - maxVisible}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-1">
              {targeting.slice(maxVisible).map((tag) => {
                const Icon = TARGETING_ICON[tag.kind];
                return (
                  <span
                    key={`${tag.kind}:${tag.label}`}
                    className="inline-flex items-center gap-1.5 text-xs"
                  >
                    <Icon className="h-3 w-3 opacity-70" />
                    {tag.label}
                  </span>
                );
              })}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t('dataRoom.validation.backToSpaces')}
          </Button>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#000E2B' }}
          >
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('dataRoom.validation.title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('dataRoom.validation.subtitle')}
            </p>
          </div>
        </div>

        {/* Filtering KPI cards */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-primary/5 pb-2 rounded-lg p-2"
        >
          <div className="grid grid-cols-4 gap-1.5 items-center">
            <FilterCard
              status="pending"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label={t('dataRoom.validation.kpi.pendingLabel')}
              icon={Clock}
              total={counts.pending}
              metricLabel={t('dataRoom.validation.kpi.pendingMetric')}
              metricValue={`${counts.pending}`}
              averageValue={counts.all > 0
                ? `${Math.round((counts.pending / counts.all) * 100)}%`
                : '0%'}
              iconActiveClassName="text-amber-600"
            />
            <FilterCard
              status="validated"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label={t('dataRoom.validation.kpi.validatedLabel')}
              icon={CheckCircle2}
              total={counts.validated}
              metricLabel={t('dataRoom.validation.kpi.validatedMetric')}
              metricValue={`${counts.validated}`}
              averageValue={counts.all > 0
                ? `${Math.round((counts.validated / counts.all) * 100)}%`
                : '0%'}
              iconActiveClassName="text-emerald-600"
            />
            <FilterCard
              status="rejected"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label={t('dataRoom.validation.kpi.rejectedLabel')}
              icon={XCircle}
              total={counts.rejected}
              metricLabel={t('dataRoom.validation.kpi.rejectedMetric')}
              metricValue={`${counts.rejected}`}
              averageValue={counts.all > 0
                ? `${Math.round((counts.rejected / counts.all) * 100)}%`
                : '0%'}
              iconActiveClassName="text-red-600"
            />
            <FilterCard
              status="all"
              activeStatus={activeStatus}
              onStatusChange={(s) => setActiveStatus(s as StatusTab)}
              label={t('dataRoom.validation.kpi.allLabel')}
              icon={FileText}
              total={counts.all}
              metricLabel={t('dataRoom.validation.kpi.allMetric')}
              metricValue={`${counts.all}`}
              averageValue="100%"
            />
          </div>
        </motion.div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
        >
          {/* Filter bar */}
          <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">
            <FilterBar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder={t('dataRoom.validation.searchPlaceholder')}
              filters={filterConfigs}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Table */}
          <div className="flex-1">
            {isLoading ? (
              <TableSkeleton />
            ) : rowNodes.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  {t('dataRoom.validation.empty.title')}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleClearAll}
                    className="mt-1"
                  >
                    {t('dataRoom.validation.empty.resetFilters')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto relative">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 backdrop-blur-sm">
                      <th className="w-8 px-2 py-4" />
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('dataRoom.validation.table.document')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('dataRoom.validation.table.createdBy')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('dataRoom.validation.table.date')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('dataRoom.validation.table.targeting')}
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('dataRoom.validation.table.comments')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('dataRoom.validation.table.status')}
                      </th>
                      <th
                        className={cn(
                          'px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider',
                          stickyHeadActionsClass,
                        )}
                      >
                        {t('dataRoom.validation.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageNodes.map((node) =>
                      node.kind === 'standalone' ? (
                        <StandaloneDocumentRow
                          key={`doc-${node.doc.id}`}
                          doc={node.doc}
                          onPreview={() => setPreviewDocument(node.doc)}
                          onValidate={() => handleValidate(node.doc)}
                          onReject={() => handleReject(node.doc)}
                          onResetToPending={() => handleResetToPending(node.doc)}
                          renderTargeting={renderTargetingTags}
                          stickyClass={stickyBodyActionsClass()}
                          formatDate={formatDate}
                        />
                      ) : (
                        <BatchRowGroup
                          key={`batch-${node.batch.id}`}
                          node={node}
                          expanded={expandedBatchIds.has(node.batch.id)}
                          onToggle={() => toggleBatch(node.batch.id)}
                          onOpenNotification={() =>
                            setActiveNotificationBatchId(node.batch.id)
                          }
                          onValidate={() =>
                            handleValidateBatch(node.batch, node.docs.length)
                          }
                          onReject={() =>
                            handleRejectBatch(node.batch, node.docs.length)
                          }
                          onReset={() => handleResetBatch(node.batch)}
                          onPreviewChild={(d) => setPreviewDocument(d)}
                          renderTargeting={renderTargetingTags}
                          stickyClass={stickyBodyActionsClass}
                          formatDate={formatDate}
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && rowNodes.length > 0 && (
            <DataPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </motion.div>
      </div>

      {/* Document preview drawer */}
      <DocumentPreviewDrawer
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        documentId={previewDocument ? String(previewDocument.id) : ''}
        documentName={previewDocument?.name ?? ''}
        format={previewDocument?.format}
        size={previewDocument?.size}
        date={previewDocument ? formatDate(previewDocument.createdAt) : undefined}
      />

      {/* Notification preview drawer */}
      <NotificationPreviewDrawer
        isOpen={!!activeNotificationBatchId}
        onClose={() => setActiveNotificationBatchId(null)}
        batch={activeNotificationBatch?.batch ?? null}
        documents={activeNotificationBatch?.docs ?? []}
        status={activeNotificationBatch?.status ?? 'pending'}
        onValidate={() => {
          if (!activeNotificationBatch) return;
          handleValidateBatch(
            activeNotificationBatch.batch,
            activeNotificationBatch.docs.length,
          );
        }}
        onReject={() => {
          if (!activeNotificationBatch) return;
          handleRejectBatch(
            activeNotificationBatch.batch,
            activeNotificationBatch.docs.length,
          );
        }}
        onResetToPending={() => {
          if (!activeNotificationBatch) return;
          handleResetBatch(activeNotificationBatch.batch);
        }}
        onPreviewDocument={(d) => setPreviewDocument(d)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notification line — small inline indicator under a document/batch name
// ---------------------------------------------------------------------------

interface NotificationLineProps {
  notification?: ValidationBatch['notification'];
  /** Source hint (italic prefix) — e.g. "Issu du lot · " for batch children. */
  sourceHint?: string;
  /** When true, silent state caption uses a dedicated wording for documents. */
  context?: 'document' | 'batch';
}

function NotificationLine({
  notification,
  sourceHint,
  context = 'document',
}: NotificationLineProps) {
  const { t } = useTranslation();
  if (!notification) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] italic text-gray-500 dark:text-gray-500">
        <BellOff className="h-3 w-3 text-gray-400" />
        {sourceHint && <span className="not-italic">{sourceHint}</span>}
        <span>
          {context === 'batch'
            ? t('dataRoom.validation.notificationLine.noneBatch')
            : t('dataRoom.validation.notificationLine.noneDocument')}
        </span>
      </div>
    );
  }

  const recipientCount = notification.recipients.length;

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
      <Bell className="h-3 w-3 text-blue-500" />
      {sourceHint && (
        <span className="italic text-gray-500">{sourceHint}</span>
      )}
      <span>
        {t(
          recipientCount > 1
            ? 'dataRoom.validation.notificationLine.recipientsMany'
            : 'dataRoom.validation.notificationLine.recipientsOne',
          { count: recipientCount },
        )}
      </span>
      {notification.channel === 'email' && (
        <Mail className="h-3 w-3 text-gray-400" />
      )}
      {notification.channel === 'portal' && (
        <Globe className="h-3 w-3 text-gray-400" />
      )}
      {notification.channel === 'both' && (
        <>
          <Mail className="h-3 w-3 text-gray-400" />
          <Globe className="h-3 w-3 text-gray-400" />
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row sub-components
// ---------------------------------------------------------------------------

interface StandaloneDocumentRowProps {
  doc: ValidationDocument;
  onPreview: () => void;
  onValidate: () => void;
  onReject: () => void;
  onResetToPending: () => void;
  renderTargeting: (
    targeting: ValidationDocument['targeting'],
    maxVisible?: number,
  ) => JSX.Element;
  stickyClass: string;
  formatDate: (iso: string) => string;
}

function StandaloneDocumentRow({
  doc,
  onPreview,
  onValidate,
  onReject,
  onResetToPending,
  renderTargeting,
  stickyClass,
  formatDate,
}: StandaloneDocumentRowProps) {
  const { t } = useTranslation();
  const conf = STATUS_VARIANT[doc.status];
  const statusLabel = t(`dataRoom.validation.status.${doc.status}`);
  return (
    <tr
      className="border-b border-border/70 transition-colors hover:bg-muted/50 cursor-pointer"
      onClick={onPreview}
    >
      <td className="w-8 px-2 py-4" />
      <td className="px-6 py-4">
        <DocumentNameCell
          name={doc.name}
          pathSegments={doc.pathSegments}
          extra={<NotificationLine notification={doc.notification} />}
        />
      </td>
      <td className="px-6 py-4">
        <UserCell name={doc.createdBy.name} sublabel={doc.createdBy.role} />
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {formatDate(doc.createdAt)}
        </span>
      </td>
      <td className="px-6 py-4">{renderTargeting(doc.targeting)}</td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center">
          <CommentIndicator
            comment={doc.comment}
            author={doc.createdBy.name}
            date={formatDate(doc.createdAt)}
          />
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusBadge label={statusLabel} variant={conf.variant} />
      </td>
      <td className={cn('px-6 py-4', stickyClass)}>
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onPreview}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('dataRoom.validation.tooltip.documentPreview')}</TooltipContent>
          </Tooltip>
          {doc.status === 'validated' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950"
                  onClick={onResetToPending}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dataRoom.validation.tooltip.resetToPending')}</TooltipContent>
            </Tooltip>
          )}
          {doc.status !== 'validated' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                  onClick={onValidate}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dataRoom.validation.tooltip.validate')}</TooltipContent>
            </Tooltip>
          )}
          {doc.status !== 'rejected' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                  onClick={onReject}
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('dataRoom.validation.tooltip.reject')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </td>
    </tr>
  );
}

interface BatchRowGroupProps {
  node: Extract<RowNode, { kind: 'batch' }>;
  expanded: boolean;
  onToggle: () => void;
  onOpenNotification: () => void;
  onValidate: () => void;
  onReject: () => void;
  onReset: () => void;
  onPreviewChild: (doc: ValidationDocument) => void;
  renderTargeting: (
    targeting: ValidationDocument['targeting'],
    maxVisible?: number,
  ) => JSX.Element;
  stickyClass: (extra?: string) => string;
  formatDate: (iso: string) => string;
}

function BatchRowGroup({
  node,
  expanded,
  onToggle,
  onOpenNotification,
  onValidate,
  onReject,
  onReset,
  onPreviewChild,
  renderTargeting,
  stickyClass,
  formatDate,
}: BatchRowGroupProps) {
  const { t } = useTranslation();
  const { batch, docs, status } = node;
  const conf = STATUS_VARIANT[status];
  const statusLabel = t(`dataRoom.validation.status.${status}`);
  const isSilent = !batch.notification;
  const earliestDate = docs.reduce(
    (min, d) =>
      new Date(d.createdAt).getTime() < new Date(min).getTime()
        ? d.createdAt
        : min,
    docs[0]?.createdAt ?? batch.createdAt,
  );

  // Aggregate targeting tags (unique by kind:label)
  const aggregatedTargeting = useMemo(() => {
    const seen = new Set<string>();
    const out: ValidationDocument['targeting'] = [];
    docs.forEach((d) =>
      d.targeting.forEach((t) => {
        const key = `${t.kind}:${t.label}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push(t);
        }
      }),
    );
    return out;
  }, [docs]);

  // Targeting is "homogeneous" when every document carries the exact same set
  // of (kind, label) tags. In that case the targeting is shown on the batch
  // row and children get a "—". Otherwise the batch row shows "—" and each
  // child renders its own targeting.
  const isHomogeneousTargeting = useMemo(() => {
    if (docs.length <= 1) return true;
    const fingerprint = (doc: ValidationDocument) =>
      doc.targeting
        .map((t) => `${t.kind}:${t.label}`)
        .sort()
        .join('|');
    const ref = fingerprint(docs[0]);
    return docs.every((d) => fingerprint(d) === ref);
  }, [docs]);

  return (
    <>
      {/* Batch header row */}
      <tr
        className={cn(
          'border-b border-border/70 transition-colors cursor-pointer group',
          'bg-blue-50/40 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40',
        )}
        onClick={onOpenNotification}
      >
        <td className="w-8 px-2 py-3">
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-blue-100 dark:hover:bg-blue-900"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-label={expanded ? t('dataRoom.validation.tooltip.collapseBatch') : t('dataRoom.validation.tooltip.expandBatch')}
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                expanded && 'rotate-90',
              )}
            />
          </button>
        </td>

        <td className="px-6 py-3">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: '#000E2B' }}
            >
              <Package className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="mb-0.5 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
                  {batch.kind}
                </span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {t(
                    docs.length > 1
                      ? 'dataRoom.validation.batch.docCountMany'
                      : 'dataRoom.validation.batch.docCountOne',
                    { count: docs.length },
                  )}
                </span>
              </div>
              <span
                className="block truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
                title={batch.name}
              >
                {batch.name}
              </span>
              <div className="mt-1">
                <NotificationLine
                  notification={batch.notification}
                  context="batch"
                />
              </div>
            </div>
          </div>
        </td>

        <td className="px-6 py-3">
          <UserCell
            name={batch.createdBy.name}
            sublabel={batch.createdBy.role}
          />
        </td>
        <td className="px-6 py-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {formatDate(earliestDate)}
          </span>
        </td>
        <td className="px-6 py-3">
          {isHomogeneousTargeting ? (
            renderTargeting(aggregatedTargeting, 4)
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm text-gray-300 select-none">—</span>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">{t('dataRoom.validation.tooltip.heterogeneousTargeting')}</span>
              </TooltipContent>
            </Tooltip>
          )}
        </td>
        <td className="px-6 py-3 text-center text-[11px] text-gray-500">—</td>
        <td className="px-6 py-3">
          <StatusBadge label={statusLabel} variant={conf.variant} />
        </td>

        <td
          className={cn(
            'px-6 py-3',
            stickyClass(
              'bg-blue-50/40 group-hover:bg-blue-50 dark:bg-blue-950/20 dark:group-hover:bg-blue-950/40',
            ),
          )}
        >
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-xs"
                  onClick={onOpenNotification}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('dataRoom.validation.tooltip.preview')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSilent
                  ? t('dataRoom.validation.tooltip.batchPreview')
                  : t('dataRoom.validation.tooltip.notificationPreview')}
              </TooltipContent>
            </Tooltip>
            {status === 'validated' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950"
                    onClick={onReset}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('dataRoom.validation.tooltip.resetBatchToPending')}</TooltipContent>
              </Tooltip>
            )}
            {status !== 'validated' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950"
                    onClick={onValidate}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isSilent
                    ? t('dataRoom.validation.tooltip.validateBatch')
                    : t('dataRoom.validation.tooltip.validateAndNotify')}
                </TooltipContent>
              </Tooltip>
            )}
            {status !== 'rejected' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                    onClick={onReject}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('dataRoom.validation.tooltip.rejectBatch')}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </td>
      </tr>

      {/* Children rows */}
      {expanded &&
        docs.map((doc) => (
          <tr
            key={`batch-${batch.id}-doc-${doc.id}`}
            className="border-b border-border/40 bg-blue-50/10 transition-colors hover:bg-blue-50/30 dark:bg-blue-950/5 dark:hover:bg-blue-950/15 cursor-pointer"
            onClick={() => onPreviewChild(doc)}
          >
            <td className="w-8 px-2 py-2.5">
              <span
                aria-hidden
                className="ml-2 block h-full w-px bg-blue-200 dark:bg-blue-800"
              />
            </td>
            <td className="px-6 py-2.5 pl-12">
              <DocumentNameCell
                name={doc.name}
                pathSegments={doc.pathSegments}
                extra={
                  <NotificationLine
                    notification={batch.notification}
                    sourceHint={t('dataRoom.validation.notificationLine.fromBatch')}
                  />
                }
              />
            </td>
            <td className="px-6 py-2.5">
              <UserCell name={doc.createdBy.name} sublabel={doc.createdBy.role} />
            </td>
            <td className="px-6 py-2.5">
              <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                {formatDate(doc.createdAt)}
              </span>
            </td>
            <td className="px-6 py-2.5">
              {isHomogeneousTargeting ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-gray-300 select-none">—</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span className="text-xs">{t('dataRoom.validation.tooltip.batchLevelTargeting')}</span>
                  </TooltipContent>
                </Tooltip>
              ) : (
                renderTargeting(doc.targeting)
              )}
            </td>
            <td className="px-6 py-2.5 text-center">
              <div className="flex justify-center">
                <CommentIndicator
                  comment={doc.comment}
                  author={doc.createdBy.name}
                  date={formatDate(doc.createdAt)}
                />
              </div>
            </td>
            <td className="px-6 py-2.5 text-[11px] text-gray-400">—</td>
            <td className={cn('px-6 py-2.5', stickyClass('bg-blue-50/10 dark:bg-blue-950/5'))}>
              <div
                className="flex items-center justify-end gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => onPreviewChild(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('dataRoom.validation.tooltip.documentPreview')}</TooltipContent>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
    </>
  );
}
