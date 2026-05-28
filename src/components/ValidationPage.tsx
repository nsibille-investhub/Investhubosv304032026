import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  X,
  ShieldCheck,
  FileText,
  Tag as TagIcon,
  Landmark,
  Layers3,
  UserRound,
  Globe,
  Bell,
  BellOff,
  AlertCircle,
  ChevronRight,
  Package,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { RowActions } from './ui/row-actions';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
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
  I18nRef,
} from '../utils/validationDocumentsGenerator';
import {
  COMMITMENTS,
  FUNDS,
  findInvestor,
} from '../utils/gedFixtures';
import { useTranslation } from '../utils/languageContext';
import { useValidationStore } from '../utils/validationStoreContext';
import {
  useAppStore,
  type AggregationCriterion,
  type AggregationScope,
} from '../utils/appStoreContext';
import { cn } from './ui/utils';

interface ValidationPageProps {
  onBack: () => void;
}

type StatusTab = ValidationStatus | 'all';

const SEARCH_FIELDS: (keyof ValidationDocument | string)[] = [
  'name',
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

const STATUS_LABEL_KEY: Record<ValidationStatus, string> = {
  pending: 'validation.status.pending',
  validated: 'validation.status.validated',
  rejected: 'validation.status.rejected',
};

const TARGETING_ICON: Record<TargetingKind, LucideIcon> = {
  segment: TagIcon,
  fund: Landmark,
  shareClass: Layers3,
  investor: UserRound,
  subscription: FileText,
  audience: Globe,
};

const TARGETING_TOOLTIP_KEY: Record<TargetingKind, string> = {
  segment: 'validation.targetingTooltip.segment',
  fund: 'validation.targetingTooltip.fund',
  shareClass: 'validation.targetingTooltip.shareClass',
  investor: 'validation.targetingTooltip.investor',
  subscription: 'validation.targetingTooltip.subscription',
  audience: 'validation.targetingTooltip.audience',
};

// ---------------------------------------------------------------------------
// Notification resolution — each document either carries its own notification,
// or inherits it from its parent batch when the document was uploaded as part
// of a grouped publication.
// ---------------------------------------------------------------------------

function resolveNotification(
  doc: ValidationDocument,
  batchById: Map<string, ValidationBatch>,
): { notification?: ValidationDocument['notification']; templateKey?: string } {
  if (doc.notification) {
    return { notification: doc.notification, templateKey: doc.kindKey };
  }
  if (doc.batchId) {
    const batch = batchById.get(doc.batchId);
    if (batch?.notification) {
      return {
        notification: batch.notification,
        templateKey: batch.kindKey ?? doc.kindKey,
      };
    }
  }
  return {};
}

/** Stable signature used to auto-group selected documents at confirm time:
 * documents sharing the exact same template + channel + recipient set form
 * a single notification group. */
function notificationSignature(
  notification: ValidationDocument['notification'],
): string {
  if (!notification) return 'silent';
  const subjectKey = notification.subject?.key ?? '';
  const subjectVars = notification.subject?.vars
    ? JSON.stringify(notification.subject.vars)
    : '';
  const recipientFingerprint = [...notification.recipients]
    .map((r) => r.email)
    .sort()
    .join(',');
  return [notification.channel, subjectKey, subjectVars, recipientFingerprint].join('|');
}

// ---------------------------------------------------------------------------
// Investor / fund resolution from a document's targeting tags. Used by the
// fund filter and the dynamic batch grouping (nominative scope detection).
// ---------------------------------------------------------------------------

const SUBSCRIPTION_BY_ID = new Map(COMMITMENTS.map((c) => [c.subscriptionId, c]));

function resolveInvestor(doc: ValidationDocument): string | undefined {
  const sub = doc.targeting.find((t) => t.kind === 'subscription');
  if (sub) {
    const commitment = SUBSCRIPTION_BY_ID.get(sub.label);
    if (commitment) {
      const inv = findInvestor(commitment.investorId);
      if (inv) return inv.name;
    }
  }
  const inv = doc.targeting.find((t) => t.kind === 'investor');
  return inv?.label;
}

function resolveFundsForDoc(doc: ValidationDocument): string[] {
  const fundNames = new Set<string>();
  doc.targeting.forEach((tag) => {
    if (tag.kind === 'fund') fundNames.add(tag.label);
    if (tag.kind === 'subscription') {
      const commitment = SUBSCRIPTION_BY_ID.get(tag.label);
      if (commitment) {
        const fund = FUNDS.find((f) => f.code === commitment.fundCode);
        if (fund) fundNames.add(fund.name);
      }
    }
  });
  return Array.from(fundNames);
}

/** A document is "nominative" when its scope targets a specific investor —
 * either directly via an investor tag, or transitively via a subscription. */
function isNominative(doc: ValidationDocument): boolean {
  return doc.targeting.some(
    (t) => t.kind === 'investor' || t.kind === 'subscription',
  );
}

// ---------------------------------------------------------------------------
// Dynamic batches — when 2+ nominative documents share the same investor
// AND the same notification template, they are visually grouped inside a
// dynamic batch. The batch becomes the unit for selection + validation.
// ---------------------------------------------------------------------------

interface DynamicBatch {
  id: string;
  /** "Investor — Fund — Template" — Fund is omitted for direct-investor docs. */
  name: string;
  investor: string;
  fundName?: string;
  templateLabel: string;
  notification: ValidationDocument['notification'];
  docs: ValidationDocument[];
}

type DisplayRow =
  | { kind: 'doc'; doc: ValidationDocument }
  | { kind: 'batch'; batch: DynamicBatch };

function buildDisplayRows(
  docs: ValidationDocument[],
  batchById: Map<string, ValidationBatch>,
  resolveTemplateLabel: (key?: string) => string,
  options: {
    criteria: AggregationCriterion[];
    scope: AggregationScope;
  },
): DisplayRow[] {
  type Bucket = {
    investor?: string;
    fundName?: string;
    subscriptionLabel?: string;
    templateKey: string;
    notification: ValidationDocument['notification'];
    docs: ValidationDocument[];
  };
  const buckets = new Map<string, Bucket>();
  const standalones: ValidationDocument[] = [];

  const { criteria, scope } = options;
  const wantsInvestor = criteria.includes('investor');
  const wantsSubscription = criteria.includes('subscription');
  const wantsFund = criteria.includes('fund');

  docs.forEach((d) => {
    const { notification, templateKey } = resolveNotification(d, batchById);
    if (!notification) {
      standalones.push(d);
      return;
    }
    const docIsNominative = isNominative(d);
    const scopeOk =
      scope === 'both' ||
      (scope === 'nominative' && docIsNominative) ||
      (scope === 'generic' && !docIsNominative);
    if (scope === 'none' || !scopeOk) {
      standalones.push(d);
      return;
    }

    const investor = resolveInvestor(d);
    const funds = resolveFundsForDoc(d);
    const subscriptionTag = d.targeting.find((t) => t.kind === 'subscription');
    const fundTag = d.targeting.find((t) => t.kind === 'fund');
    const fundName = funds.length === 1 ? funds[0] : fundTag?.label;
    const subscriptionLabel = subscriptionTag?.label;

    // If a requested criterion can't be resolved for this doc, fall back to
    // standalone — we can't bucket it deterministically.
    if (wantsInvestor && !investor) {
      standalones.push(d);
      return;
    }
    if (wantsSubscription && !subscriptionLabel) {
      standalones.push(d);
      return;
    }
    if (wantsFund && !fundName) {
      standalones.push(d);
      return;
    }

    const tplKey = templateKey ?? 'unknown-template';
    const sigParts: string[] = [`tpl:${tplKey}`];
    if (wantsInvestor) sigParts.push(`inv:${investor}`);
    if (wantsSubscription) sigParts.push(`sub:${subscriptionLabel}`);
    if (wantsFund) sigParts.push(`fund:${fundName}`);
    const sig = sigParts.join('|');

    const existing = buckets.get(sig);
    if (existing) {
      existing.docs.push(d);
      if (!existing.fundName && fundName) existing.fundName = fundName;
      if (!existing.subscriptionLabel && subscriptionLabel)
        existing.subscriptionLabel = subscriptionLabel;
      if (!existing.investor && investor) existing.investor = investor;
    } else {
      buckets.set(sig, {
        investor,
        fundName,
        subscriptionLabel,
        templateKey: tplKey,
        notification,
        docs: [d],
      });
    }
  });

  const rows: DisplayRow[] = [];
  // Standalones first (single docs) preserving insertion order, then batches.
  const groupedDocIds = new Set<number>();
  buckets.forEach((b) => {
    if (b.docs.length >= 2) {
      b.docs.forEach((d) => groupedDocIds.add(d.id));
    }
  });

  docs.forEach((d) => {
    if (groupedDocIds.has(d.id)) return;
    if (!standalones.includes(d)) standalones.push(d);
  });

  // Emit rows in the original sort order: for each doc in `docs`, emit the
  // batch the first time we encounter one of its members, otherwise the doc.
  const emittedBatches = new Set<string>();
  docs.forEach((d) => {
    if (groupedDocIds.has(d.id)) {
      // Find the bucket containing this doc.
      for (const [sig, b] of buckets.entries()) {
        if (b.docs.includes(d) && b.docs.length >= 2) {
          if (!emittedBatches.has(sig)) {
            emittedBatches.add(sig);
            const tplLabel = resolveTemplateLabel(b.templateKey);
            const namePieces: string[] = [];
            if (b.investor) namePieces.push(b.investor);
            if (b.subscriptionLabel) namePieces.push(b.subscriptionLabel);
            if (b.fundName) namePieces.push(b.fundName);
            if (tplLabel) namePieces.push(tplLabel);
            rows.push({
              kind: 'batch',
              batch: {
                id: `dyn-${sig}`,
                name: namePieces.join(' — '),
                investor: b.investor ?? '',
                fundName: b.fundName,
                templateLabel: tplLabel,
                notification: b.notification,
                docs: b.docs,
              },
            });
          }
          return;
        }
      }
    }
    rows.push({ kind: 'doc', doc: d });
  });

  return rows;
}

export function ValidationPage(_props: ValidationPageProps) {
  const { t, lang } = useTranslation();
  const { isModuleActive, publicationCenterSettings } = useAppStore();
  const isPublicationCenterActive = isModuleActive('Centre de Publication');
  const {
    dynamicDocuments,
    dynamicBatches,
    promoteToGed,
    setDynamicDocumentStatus,
  } = useValidationStore();
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
  // Active confirmation dialog (null when no dialog open).
  const [confirmDialog, setConfirmDialog] = useState<
    | { kind: 'publish'; docs: ValidationDocument[] }
    | { kind: 'reject'; docs: ValidationDocument[] }
    | null
  >(null);
  // Notification preview drawer (single document context).
  const [previewNotificationDocId, setPreviewNotificationDocId] = useState<
    number | null
  >(null);
  // Expanded state of dynamic batches (collapsed by default).
  const [expandedBatchIds, setExpandedBatchIds] = useState<Set<string>>(
    new Set(),
  );

  const batchById = useMemo(() => {
    const map = new Map<string, ValidationBatch>();
    [...dynamicBatches, ...getValidationBatches()].forEach((b) => map.set(b.id, b));
    return map;
  }, [dynamicBatches]);

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setDocuments(generateValidationDocuments());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  /** Merge newly imported documents from the store into the local listing.
   * We only add documents that aren't already present (by id) so local
   * status updates aren't overwritten when the store re-renders. */
  useEffect(() => {
    if (dynamicDocuments.length === 0) return;
    setDocuments((prev) => {
      const existingIds = new Set(prev.map((d) => d.id));
      const additions = dynamicDocuments.filter((d) => !existingIds.has(d.id));
      if (additions.length === 0) return prev;
      return [...additions, ...prev];
    });
  }, [dynamicDocuments]);

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
        const labels = doc.targeting.map((tag) => tag.label);
        const hasAny = targetingFilter.some((t) => labels.includes(t));
        if (!hasAny) return false;
      }
      const investorFilter = activeFilters.investor;
      if (Array.isArray(investorFilter) && investorFilter.length > 0) {
        const investor = resolveInvestor(doc);
        if (!investor || !investorFilter.includes(investor)) return false;
      }
      const fundFilter = activeFilters.fund;
      if (Array.isArray(fundFilter) && fundFilter.length > 0) {
        const docFunds = resolveFundsForDoc(doc);
        const hasAny = fundFilter.some((f) => docFunds.includes(f));
        if (!hasAny) return false;
      }
      return true;
    });
  }, [searchedData, activeFilters]);

  /** Flat list of documents sorted by recency. */
  const flatDocs = useMemo(() => {
    return [...matchingDocs].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [matchingDocs]);

  const allCreators = useMemo(() => {
    const map = new Map<string, string>();
    documents.forEach((d) => map.set(d.createdBy.name, d.createdBy.name));
    return Array.from(map.values()).sort();
  }, [documents]);

  const allTargetings = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) =>
      d.targeting
        .filter((tag) => tag.kind !== 'investor')
        .forEach((tag) => set.add(tag.label)),
    );
    return Array.from(set).sort();
  }, [documents]);

  const allInvestors = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => {
      const inv = resolveInvestor(d);
      if (inv) set.add(inv);
    });
    return Array.from(set).sort();
  }, [documents]);

  const allFunds = useMemo(() => {
    const set = new Set<string>();
    documents.forEach((d) => resolveFundsForDoc(d).forEach((f) => set.add(f)));
    return Array.from(set).sort();
  }, [documents]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'createdBy',
        label: t('validation.filters.author'),
        type: 'select',
        isPrimary: true,
        options: allCreators.map((c) => ({ value: c, label: c })),
      },
      {
        id: 'fund',
        label: t('validation.filters.fund'),
        type: 'multiselect',
        isPrimary: true,
        options: allFunds.map((f) => ({ value: f, label: f })),
      },
      {
        id: 'investor',
        label: t('validation.filters.investor'),
        type: 'multiselect',
        isPrimary: true,
        options: allInvestors.map((i) => ({ value: i, label: i })),
      },
      {
        id: 'targeting',
        label: t('validation.filters.targeting'),
        type: 'multiselect',
        isPrimary: false,
        options: allTargetings.map((tgt) => ({ value: tgt, label: tgt })),
      },
      {
        id: 'format',
        label: t('validation.filters.format'),
        type: 'select',
        isPrimary: false,
        options: ['pdf', 'docx', 'xlsx', 'pptx'].map((f) => ({
          value: f,
          label: f.toUpperCase(),
        })),
      },
    ],
    [allCreators, allFunds, allInvestors, allTargetings, t],
  );

  const displayRows = useMemo(
    () =>
      buildDisplayRows(flatDocs, batchById, (key?: string) => (key ? t(key) : ''), {
        criteria: publicationCenterSettings.aggregationCriteria,
        scope: publicationCenterSettings.aggregationScope,
      }),
    [
      flatDocs,
      batchById,
      t,
      publicationCenterSettings.aggregationCriteria,
      publicationCenterSettings.aggregationScope,
    ],
  );
  // Pagination operates on display rows (a batch row counts as one).
  const totalItems = displayRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pageRows = displayRows.slice(startIndex, startIndex + pageSize);
  // Flatten the rows currently visible on the page into individual docs — used
  // by the page-level select-all checkbox.
  const pageDocs = useMemo(() => {
    const out: ValidationDocument[] = [];
    pageRows.forEach((r) => {
      if (r.kind === 'doc') out.push(r.doc);
      else r.batch.docs.forEach((d) => out.push(d));
    });
    return out;
  }, [pageRows]);

  const hasActiveFilters =
    hasActiveSearch || Object.keys(activeFilters).length > 0;

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
    const youLabel = t('validation.you');
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
          reviewedBy: youLabel,
        };
      }),
    );
  };

  const isDynamicDoc = (docId: number) =>
    dynamicDocuments.some((d) => d.id === docId);

  const handleValidate = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'validated');
    if (isDynamicDoc(doc.id)) setDynamicDocumentStatus(doc.id, 'validated');
    promoteToGed([doc], 'validated');
    toast.success(t('validation.toast.docValidated'), { description: doc.name });
  };

  const handleReject = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'rejected');
    if (isDynamicDoc(doc.id)) setDynamicDocumentStatus(doc.id, 'rejected');
    promoteToGed([doc], 'rejected');
    toast.error(t('validation.toast.docRejected'), { description: doc.name });
  };

  const handleResetToPending = (doc: ValidationDocument) => {
    updateStatus(doc.id, 'pending');
    if (isDynamicDoc(doc.id)) setDynamicDocumentStatus(doc.id, 'pending');
    promoteToGed([doc], 'pending');
    toast.info(t('validation.toast.docPending'), { description: doc.name });
  };

  const toggleBatchExpand = (batchId: string) => {
    setExpandedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  const openPublishConfirm = (docs: ValidationDocument[]) => {
    if (docs.length === 0) return;
    setConfirmDialog({ kind: 'publish', docs });
  };

  const openRejectConfirm = (docs: ValidationDocument[]) => {
    if (docs.length === 0) return;
    setConfirmDialog({ kind: 'reject', docs });
  };

  const applyBulkValidate = (docs: ValidationDocument[]) => {
    const stamp = new Date().toISOString();
    const youLabel = t('validation.you');
    const docIds = new Set(docs.map((d) => d.id));
    setDocuments((prev) =>
      prev.map((d) =>
        docIds.has(d.id)
          ? { ...d, status: 'validated', reviewedAt: stamp, reviewedBy: youLabel }
          : d,
      ),
    );
    docs.forEach((d) => {
      if (isDynamicDoc(d.id)) setDynamicDocumentStatus(d.id, 'validated');
    });
    promoteToGed(docs, 'validated');
    // Count notification groups for the toast.
    const sigs = new Set<string>();
    docs.forEach((d) => {
      const { notification } = resolveNotification(d, batchById);
      const sig = notificationSignature(notification);
      if (sig !== 'silent') sigs.add(sig);
    });
    toast.success(t('validation.toast.bulkValidated', { count: docs.length }), {
      description:
        sigs.size > 0
          ? t('validation.toast.bulkNotifications', { count: sigs.size })
          : undefined,
    });
  };

  const applyBulkReject = (docs: ValidationDocument[]) => {
    const stamp = new Date().toISOString();
    const youLabel = t('validation.you');
    const docIds = new Set(docs.map((d) => d.id));
    setDocuments((prev) =>
      prev.map((d) =>
        docIds.has(d.id)
          ? { ...d, status: 'rejected', reviewedAt: stamp, reviewedBy: youLabel }
          : d,
      ),
    );
    docs.forEach((d) => {
      if (isDynamicDoc(d.id)) setDynamicDocumentStatus(d.id, 'rejected');
    });
    promoteToGed(docs, 'rejected');
    toast.error(t('validation.toast.bulkRejected', { count: docs.length }));
  };

  const stickyHeadActionsClass =
    'sticky right-0 z-20 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800';
  const stickyBodyActionsClass = () =>
    cn(
      'sticky right-0 z-10 text-right bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.18)]',
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
            <span className="text-xs">{t(TARGETING_TOOLTIP_KEY[tag.kind])}</span>
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

  if (!isPublicationCenterActive) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-black p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-900">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('validation.moduleDisabled.title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('validation.moduleDisabled.description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
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
              label={t('validation.kpi.pending')}
              icon={Clock}
              total={counts.pending}
              metricLabel={t('validation.kpi.pendingMetric')}
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
              label={t('validation.kpi.validated')}
              icon={CheckCircle2}
              total={counts.validated}
              metricLabel={t('validation.kpi.validatedMetric')}
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
              label={t('validation.kpi.rejected')}
              icon={XCircle}
              total={counts.rejected}
              metricLabel={t('validation.kpi.rejectedMetric')}
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
              label={t('validation.kpi.all')}
              icon={FileText}
              total={counts.all}
              metricLabel={t('validation.kpi.allMetric')}
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
              searchPlaceholder={t('validation.searchPlaceholder')}
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
            ) : flatDocs.length === 0 ? (
              <div className="py-16 text-center">
                <ShieldCheck className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">
                  {t('validation.empty')}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleClearAll}
                    className="mt-1"
                  >
                    {t('validation.resetFilters')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto relative">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 backdrop-blur-sm">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider max-w-[320px]">
                        {t('validation.table.document')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('validation.table.notification')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('validation.table.createdBy')}
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('validation.table.comm')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('validation.table.status')}
                      </th>
                      <th
                        className={cn(
                          'px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider',
                          stickyHeadActionsClass,
                        )}
                      >
                        {t('validation.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row) => {
                      if (row.kind === 'doc') {
                        const { notification, templateKey } = resolveNotification(
                          row.doc,
                          batchById,
                        );
                        const templateLabel = templateKey ? t(templateKey) : undefined;
                        return (
                          <DocumentRow
                            key={`doc-${row.doc.id}`}
                            doc={row.doc}
                            notification={notification}
                            templateLabel={templateLabel}
                            onPreview={() => setPreviewDocument(row.doc)}
                            onValidate={() => openPublishConfirm([row.doc])}
                            onReject={() => openRejectConfirm([row.doc])}
                            onResetToPending={() => handleResetToPending(row.doc)}
                            onPreviewNotification={() =>
                              setPreviewNotificationDocId(row.doc.id)
                            }
                            renderTargeting={renderTargetingTags}
                            stickyClass={stickyBodyActionsClass()}
                          />
                        );
                      }
                      const batch = row.batch;
                      const batchExpanded = expandedBatchIds.has(batch.id);
                      const batchStatus = deriveBatchStatus(batch.docs);
                      return (
                        <DynamicBatchRow
                          key={batch.id}
                          batch={batch}
                          expanded={batchExpanded}
                          status={batchStatus}
                          onToggleExpand={() => toggleBatchExpand(batch.id)}
                          onPreviewNotification={() =>
                            setPreviewNotificationDocId(batch.docs[0].id)
                          }
                          onValidate={() => openPublishConfirm(batch.docs)}
                          onReject={() => openRejectConfirm(batch.docs)}
                          onReset={() =>
                            batch.docs.forEach((d) => handleResetToPending(d))
                          }
                          onPreviewChild={(d) => setPreviewDocument(d)}
                          renderTargeting={renderTargetingTags}
                          stickyClass={stickyBodyActionsClass()}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && flatDocs.length > 0 && (
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

      {/* Notification preview drawer — opened from a row's notification badge. */}
      {(() => {
        const previewDoc = previewNotificationDocId
          ? documents.find((d) => d.id === previewNotificationDocId)
          : null;
        const previewBatch = previewDoc?.batchId
          ? batchById.get(previewDoc.batchId)
          : null;
        const previewDocs = previewBatch
          ? documents.filter((d) => d.batchId === previewBatch.id)
          : previewDoc
            ? [previewDoc]
            : [];
        const previewNotification = previewDoc
          ? resolveNotification(previewDoc, batchById).notification
          : undefined;
        return (
          <NotificationPreviewDrawer
            isOpen={!!previewNotificationDocId && !!previewNotification}
            onClose={() => setPreviewNotificationDocId(null)}
            batch={
              previewBatch ??
              (previewDoc && previewNotification
                ? {
                    id: `doc-${previewDoc.id}`,
                    name: previewDoc.name,
                    kindKey:
                      previewDoc.kindKey ?? 'validation.fixtures.kind.other',
                    notification: previewNotification,
                    createdAt: previewDoc.createdAt,
                    createdBy: previewDoc.createdBy,
                  }
                : null)
            }
            documents={previewDocs}
            status={previewDoc?.status ?? 'pending'}
            onValidate={() => {
              if (!previewDoc) return;
              openPublishConfirm([previewDoc]);
              setPreviewNotificationDocId(null);
            }}
            onReject={() => {
              if (!previewDoc) return;
              openRejectConfirm([previewDoc]);
              setPreviewNotificationDocId(null);
            }}
            onResetToPending={() => {
              if (!previewDoc) return;
              handleResetToPending(previewDoc);
              setPreviewNotificationDocId(null);
            }}
            onPreviewDocument={(d) => setPreviewDocument(d)}
          />
        );
      })()}

      {/* Confirmation dialog */}
      {confirmDialog && (
        <PublicationConfirmDialog
          mode={confirmDialog.kind}
          docs={confirmDialog.docs}
          batchById={batchById}
          onCancel={() => setConfirmDialog(null)}
          onConfirm={() => {
            if (confirmDialog.kind === 'publish') {
              applyBulkValidate(confirmDialog.docs);
            } else {
              applyBulkReject(confirmDialog.docs);
            }
            setConfirmDialog(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row sub-component — flat document row with notification badge
// ---------------------------------------------------------------------------

interface DocumentRowProps {
  doc: ValidationDocument;
  notification?: ValidationDocument['notification'];
  templateLabel?: string;
  onPreview: () => void;
  onValidate: () => void;
  onReject: () => void;
  onResetToPending: () => void;
  onPreviewNotification: () => void;
  renderTargeting: (
    targeting: ValidationDocument['targeting'],
    maxVisible?: number,
  ) => JSX.Element;
  stickyClass: string;
}

function DocumentRow({
  doc,
  notification,
  templateLabel,
  onPreview,
  onValidate,
  onReject,
  onResetToPending,
  onPreviewNotification,
  renderTargeting,
  stickyClass,
}: DocumentRowProps) {
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
  const conf = STATUS_VARIANT[doc.status];
  const statusLabel = t(STATUS_LABEL_KEY[doc.status]);
  const commentText = doc.comment ? t(doc.comment.key, doc.comment.vars) : '';
  return (
    <tr
      className="border-b border-border/70 transition-colors cursor-pointer hover:bg-muted/50"
      onClick={onPreview}
    >
      <td className="px-4 py-2.5 align-top max-w-[320px]">
        {doc.kindKey && (
          <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t(doc.kindKey)}
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-100" title={doc.name}>
              {doc.name}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="text-xs">{doc.name}</span>
          </TooltipContent>
        </Tooltip>
        {doc.pathSegments.length > 0 && (
          <div className="mt-0.5 truncate text-[11px] text-gray-500" title={doc.pathSegments.join(' / ')}>
            {doc.pathSegments.join(' / ')}
          </div>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {renderTargeting(doc.targeting, 4)}
        </div>
      </td>
      <td
        className="px-4 py-2.5 align-top"
        onClick={(e) => {
          if (notification) {
            e.stopPropagation();
            onPreviewNotification();
          }
        }}
      >
        <span className={notification ? 'cursor-pointer' : undefined}>
          <NotificationBadge
            notification={notification}
            templateLabel={templateLabel}
          />
        </span>
      </td>
      <td className="px-4 py-2.5 align-top">
        <div className="flex flex-col gap-0.5">
          <UserCell name={doc.createdBy.name} sublabel={doc.createdBy.role} />
          <span className="text-[11px] text-gray-500 whitespace-nowrap">
            {formatDate(doc.createdAt)}
          </span>
        </div>
      </td>
      <td className="px-4 py-2.5 align-top text-center">
        <div className="flex justify-center">
          <CommentIndicator
            comment={commentText}
            author={doc.createdBy.name}
            date={formatDate(doc.createdAt)}
          />
        </div>
      </td>
      <td className="px-4 py-2.5 align-top">
        <StatusBadge label={statusLabel} variant={conf.variant} />
      </td>
      <td className={cn('px-4 py-2.5 align-top', stickyClass)}>
        <RowActions
          previewLabel={t('validation.tooltip.previewDoc')}
          acceptLabel={
            notification
              ? t('validation.tooltip.validateAndSend')
              : t('validation.tooltip.validate')
          }
          rejectLabel={t('validation.tooltip.reject')}
          resetLabel={t('validation.tooltip.resetPending')}
          onPreview={onPreview}
          onAccept={onValidate}
          onReject={onReject}
          onReset={onResetToPending}
          showAccept={doc.status !== 'validated'}
          showReject={doc.status !== 'rejected'}
          showReset={doc.status === 'validated'}
        />
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Notification badge — compact inline pill rendered under the document name.
// Shows the template label (kindKey) + recipient count. Clicking opens the
// preview drawer.
// ---------------------------------------------------------------------------

function NotificationBadge({
  notification,
  templateLabel,
}: {
  notification?: ValidationDocument['notification'];
  templateLabel?: string;
}) {
  const { t } = useTranslation();
  if (!notification) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500 dark:border-gray-700 dark:bg-gray-900">
        <BellOff className="h-3 w-3" />
        {t('validation.notificationLine.noneDoc')}
      </span>
    );
  }
  const recipientCount = notification.recipients.length;
  const firstRecipient = notification.recipients[0];
  const firstRecipientName = firstRecipient
    ? typeof firstRecipient.name === 'string'
      ? firstRecipient.name
      : t(firstRecipient.name.key, firstRecipient.name.vars)
    : '';
  const recipientLabel =
    recipientCount === 1
      ? firstRecipientName
      : t('validation.notificationLine.investorsMany', { count: recipientCount });
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
      <Bell className="h-3 w-3" />
      {templateLabel && (
        <span className="max-w-[200px] truncate" title={templateLabel}>
          {templateLabel}
        </span>
      )}
      <span aria-hidden className="text-blue-300">·</span>
      <span
        className="max-w-[200px] truncate text-blue-700/80 dark:text-blue-300/80"
        title={recipientLabel}
      >
        {recipientLabel}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Publication confirmation dialog — groups selected docs by notification
// signature so the operator sees exactly what will be sent.
// ---------------------------------------------------------------------------

interface PublicationConfirmDialogProps {
  mode: 'publish' | 'reject';
  docs: ValidationDocument[];
  batchById: Map<string, ValidationBatch>;
  onCancel: () => void;
  onConfirm: () => void;
}

function PublicationConfirmDialog({
  mode,
  docs,
  batchById,
  onCancel,
  onConfirm,
}: PublicationConfirmDialogProps) {
  const { t } = useTranslation();

  // Group documents by notification signature.
  type Group = {
    sig: string;
    docs: ValidationDocument[];
    notification?: ValidationDocument['notification'];
    templateKey?: string;
  };
  const groups = useMemo(() => {
    const map = new Map<string, Group>();
    docs.forEach((d) => {
      const { notification, templateKey } = resolveNotification(d, batchById);
      const sig = notificationSignature(notification);
      const existing = map.get(sig);
      if (existing) existing.docs.push(d);
      else map.set(sig, { sig, docs: [d], notification, templateKey });
    });
    // Sort: notification groups first (by descending size), silent last.
    return Array.from(map.values()).sort((a, b) => {
      if (a.sig === 'silent' && b.sig !== 'silent') return 1;
      if (b.sig === 'silent' && a.sig !== 'silent') return -1;
      return b.docs.length - a.docs.length;
    });
  }, [docs, batchById]);

  const notificationGroups = groups.filter((g) => g.sig !== 'silent');
  const totalDocs = docs.length;
  const totalNotifs = notificationGroups.length;

  if (mode === 'reject') {
    return (
      <ConfirmShell
        title={t('validation.rejectConfirm.title')}
        subtitle={t(
          totalDocs > 1
            ? 'validation.rejectConfirm.subtitleMany'
            : 'validation.rejectConfirm.subtitleOne',
          { count: totalDocs },
        )}
        reassurance={t('validation.rejectConfirm.reassurance')}
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel={t('validation.rejectConfirm.confirm')}
        confirmIntent="danger"
      >
        <div className="max-h-[300px] overflow-y-auto rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <ul className="space-y-0.5">
            {docs.slice(0, 12).map((d) => (
              <li key={d.id} className="truncate" title={d.name}>
                • {d.name}
              </li>
            ))}
          </ul>
          {docs.length > 12 && (
            <div className="mt-1 italic text-gray-500">
              {t(
                docs.length - 12 > 1
                  ? 'validation.confirm.moreDocsMany'
                  : 'validation.confirm.moreDocsOne',
                { count: docs.length - 12 },
              )}
            </div>
          )}
        </div>
      </ConfirmShell>
    );
  }

  return (
    <PublicationConfirmDrawer
      groups={groups}
      notificationGroups={notificationGroups}
      totalDocs={totalDocs}
      totalNotifs={totalNotifs}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

// ---------------------------------------------------------------------------
// Publication confirm drawer — side panel with three tabs: recap, comms
// preview and documents preview. Side-by-side reading without obscuring the
// page's table actions/filters (replaces the old centered modal).
// ---------------------------------------------------------------------------

interface PublicationGroup {
  sig: string;
  docs: ValidationDocument[];
  notification?: ValidationDocument['notification'];
  templateKey?: string;
}

interface PublicationConfirmDrawerProps {
  groups: PublicationGroup[];
  notificationGroups: PublicationGroup[];
  totalDocs: number;
  totalNotifs: number;
  onCancel: () => void;
  onConfirm: () => void;
}

function PublicationConfirmDrawer({
  groups,
  notificationGroups,
  totalDocs,
  totalNotifs,
  onCancel,
  onConfirm,
}: PublicationConfirmDrawerProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'recap' | 'comms' | 'docs'>('recap');
  const [focusedSig, setFocusedSig] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ValidationDocument | null>(null);

  const subtitleDocs = t(
    totalDocs > 1
      ? 'validation.confirm.subtitleDocsMany'
      : 'validation.confirm.subtitleDocsOne',
    { count: totalDocs },
  );
  const subtitleNotifs =
    totalNotifs === 0
      ? t('validation.confirm.subtitleNotifsNone')
      : t(
          totalNotifs > 1
            ? 'validation.confirm.subtitleNotifsMany'
            : 'validation.confirm.subtitleNotifsOne',
          { count: totalNotifs },
        );
  const reassurance =
    totalNotifs === 0
      ? t('validation.confirm.reassurancePure')
      : t('validation.confirm.reassuranceWithNotifs');

  const allDocs = useMemo(
    () => groups.flatMap((g) => g.docs),
    [groups],
  );

  const handlePreviewGroup = (sig: string, target: 'comms' | 'docs') => {
    setFocusedSig(sig);
    setTab(target);
  };

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && onCancel()}>
        <SheetContent
          side="right"
          className="!w-[95vw] sm:!w-[680px] lg:!w-[820px] !max-w-none p-0 flex flex-col gap-0"
        >
          <SheetHeader className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
            <SheetTitle className="text-base">
              {t('validation.confirm.title')}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {`${subtitleDocs} · ${subtitleNotifs}`}
            </SheetDescription>
            <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{reassurance}</span>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as typeof tab)}
              className="flex h-full flex-col"
            >
              <TabsList className="mx-6 mt-4 grid w-fit grid-cols-3 gap-1">
                <TabsTrigger value="recap" className="gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t('validation.confirm.tabs.recap')}
                </TabsTrigger>
                <TabsTrigger
                  value="comms"
                  disabled={totalNotifs === 0}
                  className="gap-1.5"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {t('validation.confirm.tabs.comms')}
                  {totalNotifs > 0 && (
                    <span className="ml-1 rounded-full bg-gray-200 px-1.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {totalNotifs}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="docs" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {t('validation.confirm.tabs.docs')}
                  <span className="ml-1 rounded-full bg-gray-200 px-1.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {totalDocs}
                  </span>
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 py-4">
                <TabsContent value="recap" className="m-0 mt-0">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('validation.confirm.groupsTitle')}
                    </p>
                    <ul className="space-y-2.5">
                      {groups.map((g, idx) => (
                        <GroupRow
                          key={g.sig}
                          group={g}
                          index={notificationGroups.findIndex(
                            (ng) => ng.sig === g.sig,
                          )}
                          fallbackIdx={idx}
                          onPreview={() =>
                            handlePreviewGroup(
                              g.sig,
                              g.notification ? 'comms' : 'docs',
                            )
                          }
                        />
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="comms" className="m-0 mt-0">
                  <CommunicationsTab
                    notificationGroups={notificationGroups}
                    focusedSig={focusedSig}
                    onClearFocus={() => setFocusedSig(null)}
                  />
                </TabsContent>

                <TabsContent value="docs" className="m-0 mt-0">
                  <DocumentsTab
                    groups={groups}
                    allDocs={allDocs}
                    focusedSig={focusedSig}
                    onClearFocus={() => setFocusedSig(null)}
                    onPreviewDoc={(d) => setPreviewDoc(d)}
                  />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          <SheetFooter className="border-t border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-950 mt-0">
            <div className="flex w-full items-center justify-end gap-2">
              <Button variant="outline" onClick={onCancel} className="h-9">
                {t('validation.confirm.cancel')}
              </Button>
              <Button
                onClick={onConfirm}
                className="h-9 gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                {t('validation.confirm.confirm')}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DocumentPreviewDrawer
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentId={previewDoc ? String(previewDoc.id) : ''}
        documentName={previewDoc?.name ?? ''}
        format={previewDoc?.format}
        size={previewDoc?.size}
      />
    </>
  );
}

function CommunicationsTab({
  notificationGroups,
  focusedSig,
  onClearFocus,
}: {
  notificationGroups: PublicationGroup[];
  focusedSig: string | null;
  onClearFocus: () => void;
}) {
  const { t } = useTranslation();
  const resolveRef = (ref: I18nRef) => t(ref.key, ref.vars);

  if (notificationGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center dark:border-gray-800 dark:bg-gray-900/40">
        <BellOff className="h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('validation.confirm.comms.noneTitle')}
        </p>
        <p className="max-w-xs text-xs text-gray-500">
          {t('validation.confirm.comms.noneBody')}
        </p>
      </div>
    );
  }

  const visible = focusedSig
    ? notificationGroups.filter((g) => g.sig === focusedSig)
    : notificationGroups;

  return (
    <div className="space-y-4">
      {focusedSig && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-1.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
          <span>{t('validation.confirm.focused')}</span>
          <button
            type="button"
            onClick={onClearFocus}
            className="font-medium underline-offset-2 hover:underline"
          >
            {t('validation.confirm.clearFocus')}
          </button>
        </div>
      )}
      {visible.map((g) => {
        const idx = notificationGroups.findIndex((ng) => ng.sig === g.sig);
        const n = g.notification!;
        const recipientPreview = n.recipients
          .slice(0, 2)
          .map((r) => (typeof r.name === 'string' ? r.name : resolveRef(r.name)))
          .join(', ');
        const extra = n.recipients.length - 2;
        return (
          <div
            key={g.sig}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center justify-between gap-2 border-b border-gray-100 bg-blue-50/40 px-4 py-2 dark:border-gray-900 dark:bg-blue-950/20">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900 dark:text-blue-200">
                <Bell className="h-3.5 w-3.5" />
                {t('validation.confirm.groupLabel', { n: idx + 1 })}
              </div>
              <span className="text-[11px] text-gray-500">
                {t(
                  g.docs.length > 1
                    ? 'validation.confirm.groupDocsMany'
                    : 'validation.confirm.groupDocsOne',
                  { count: g.docs.length },
                )}
              </span>
            </div>
            <div className="space-y-1 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs dark:border-gray-900 dark:bg-gray-900/40">
              <div className="flex items-baseline gap-2">
                <span className="w-16 shrink-0 font-medium text-gray-500">
                  {t('validation.confirm.comms.from')}
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  InvestHub &lt;no-reply@investhub.io&gt;
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="w-16 shrink-0 font-medium text-gray-500">
                  {t('validation.confirm.comms.to')}
                </span>
                <span className="text-gray-900 dark:text-gray-100">
                  {recipientPreview}
                  {extra > 0 &&
                    ` · ${t(
                      extra > 1
                        ? 'validation.confirm.moreRecipientsMany'
                        : 'validation.confirm.moreRecipientsOne',
                      { count: extra },
                    )}`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="w-16 shrink-0 font-medium text-gray-500">
                  {t('validation.confirm.comms.subject')}
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {resolveRef(n.subject)}
                </span>
              </div>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
              <p>{resolveRef(n.greeting)}</p>
              {n.paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed">
                  {resolveRef(p)}
                </p>
              ))}
              {g.docs.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/40">
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {t('validation.confirm.comms.attachments')}
                  </div>
                  <ul className="space-y-1">
                    {g.docs.map((d) => (
                      <li
                        key={d.id}
                        className="truncate text-xs text-gray-700 dark:text-gray-300"
                        title={d.name}
                      >
                        • {d.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="pt-1 text-gray-600 dark:text-gray-400">
                {resolveRef(n.signature)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DocumentsTab({
  groups,
  allDocs,
  focusedSig,
  onClearFocus,
  onPreviewDoc,
}: {
  groups: PublicationGroup[];
  allDocs: ValidationDocument[];
  focusedSig: string | null;
  onClearFocus: () => void;
  onPreviewDoc: (d: ValidationDocument) => void;
}) {
  const { t } = useTranslation();
  const focusedGroup = focusedSig
    ? groups.find((g) => g.sig === focusedSig)
    : null;
  const visibleDocs = focusedGroup ? focusedGroup.docs : allDocs;
  return (
    <div className="space-y-3">
      {focusedSig && focusedGroup && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50/60 px-3 py-1.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
          <span>{t('validation.confirm.focused')}</span>
          <button
            type="button"
            onClick={onClearFocus}
            className="font-medium underline-offset-2 hover:underline"
          >
            {t('validation.confirm.clearFocus')}
          </button>
        </div>
      )}
      <ul className="space-y-2">
        {visibleDocs.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => onPreviewDoc(d)}
              className="group flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900"
            >
              <div className="min-w-0 flex-1">
                <DocumentNameCell
                  name={d.name}
                  pathSegments={d.pathSegments}
                />
              </div>
              <span className="hidden text-xs text-gray-400 sm:inline">
                {d.size ?? '—'}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-950">
                <Eye className="h-4 w-4" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GroupRow({
  group,
  index,
  onPreview,
}: {
  group: PublicationGroup;
  index: number;
  fallbackIdx: number;
  onPreview?: () => void;
}) {
  const { t } = useTranslation();
  const isSilent = group.sig === 'silent' || !group.notification;
  if (isSilent) {
    return (
      <li className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
            <BellOff className="h-3.5 w-3.5 text-gray-500" />
            {t('validation.confirm.silentGroupLabel')}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {t(
                group.docs.length > 1
                  ? 'validation.confirm.groupDocsMany'
                  : 'validation.confirm.groupDocsOne',
                { count: group.docs.length },
              )}
            </span>
            {onPreview && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onPreview}
                    aria-label={t('validation.confirm.previewGroupAria')}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-white hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('validation.confirm.previewGroupTooltip')}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <p className="mt-1 text-[11px] text-gray-500">
          {t('validation.confirm.silentGroupHelp')}
        </p>
      </li>
    );
  }
  const notification = group.notification!;
  const templateName = group.templateKey ? t(group.templateKey) : '';
  const recipientNames = notification.recipients
    .map((r) =>
      typeof r.name === 'string' ? r.name : t(r.name.key, r.name.vars),
    )
    .slice(0, 3);
  const remainingRecipients = notification.recipients.length - recipientNames.length;
  return (
    <li className="rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/20">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
          <Bell className="h-3.5 w-3.5" />
          {t('validation.confirm.groupLabel', { n: index + 1 })}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {t(
              notification.recipients.length > 1
                ? 'validation.confirm.groupRecipientsMany'
                : 'validation.confirm.groupRecipientsOne',
              { count: notification.recipients.length },
            )}
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {t(
              group.docs.length > 1
                ? 'validation.confirm.groupDocsMany'
                : 'validation.confirm.groupDocsOne',
              { count: group.docs.length },
            )}
          </span>
          {onPreview && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onPreview}
                  aria-label={t('validation.confirm.previewGroupAria')}
                  className="flex h-6 w-6 items-center justify-center rounded-md text-blue-700 hover:bg-white hover:text-blue-900 dark:text-blue-300 dark:hover:bg-blue-900 dark:hover:text-blue-100"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {t('validation.confirm.previewGroupTooltip')}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <dl className="mt-1.5 grid grid-cols-1 gap-x-3 gap-y-0.5 text-[11px] text-gray-700 dark:text-gray-300 sm:grid-cols-2">
        <div className="flex gap-1.5">
          <dt className="font-medium text-gray-500">
            {t('validation.confirm.templateLabel')}
          </dt>
          <dd className="truncate" title={templateName}>
            {templateName}
          </dd>
        </div>
        <div className="col-span-full flex gap-1.5">
          <dt className="font-medium text-gray-500">
            {t('validation.confirm.recipientsLabel')}
          </dt>
          <dd className="truncate">
            {recipientNames.join(', ')}
            {remainingRecipients > 0 &&
              ` · ${t(
                remainingRecipients > 1
                  ? 'validation.confirm.moreRecipientsMany'
                  : 'validation.confirm.moreRecipientsOne',
                { count: remainingRecipients },
              )}`}
          </dd>
        </div>
      </dl>
    </li>
  );
}

function ConfirmShell({
  title,
  subtitle,
  reassurance,
  onCancel,
  onConfirm,
  confirmLabel,
  confirmIntent,
  children,
}: {
  title: string;
  subtitle: string;
  reassurance: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmIntent: 'primary' | 'danger';
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="close"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{reassurance}</span>
          </div>
          {children}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 bg-gray-50/60 px-5 py-3 dark:border-gray-800 dark:bg-gray-900/40">
          <Button variant="outline" onClick={onCancel} className="h-9">
            {t('validation.confirm.cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            className={cn(
              'h-9 gap-2 text-white hover:opacity-90',
              confirmIntent === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-emerald-600 hover:bg-emerald-700',
            )}
          >
            {confirmIntent === 'danger' ? (
              <X className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}


// ---------------------------------------------------------------------------
// Dynamic batch row — collapsible group rendered when 2+ nominative docs
// share the same investor + notification template. Validation acts on the
// whole group; children rows hide consolidated fields (replaced with "—").
// ---------------------------------------------------------------------------

function deriveBatchStatus(docs: ValidationDocument[]): ValidationStatus {
  if (docs.length === 0) return 'pending';
  if (docs.every((d) => d.status === 'validated')) return 'validated';
  if (docs.every((d) => d.status === 'rejected')) return 'rejected';
  return 'pending';
}

interface DynamicBatchRowProps {
  batch: DynamicBatch;
  expanded: boolean;
  status: ValidationStatus;
  onToggleExpand: () => void;
  onPreviewNotification: () => void;
  onValidate: () => void;
  onReject: () => void;
  onReset: () => void;
  onPreviewChild: (doc: ValidationDocument) => void;
  renderTargeting: (
    targeting: ValidationDocument['targeting'],
    maxVisible?: number,
  ) => JSX.Element;
  stickyClass: string;
}

function DynamicBatchRow({
  batch,
  expanded,
  status,
  onToggleExpand,
  onPreviewNotification,
  onValidate,
  onReject,
  onReset,
  onPreviewChild,
  renderTargeting,
  stickyClass,
}: DynamicBatchRowProps) {
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
  const statusLabel = t(STATUS_LABEL_KEY[status]);
  const conf = STATUS_VARIANT[status];
  // Use the earliest createdAt as the batch's reference date.
  const earliestDoc = batch.docs.reduce((m, d) =>
    new Date(d.createdAt).getTime() < new Date(m.createdAt).getTime() ? d : m,
    batch.docs[0],
  );
  // Targeting tags shared by every document in the lot.
  const commonTargeting = useMemo(() => {
    if (batch.docs.length === 0) return [];
    const [first, ...rest] = batch.docs;
    return first.targeting.filter((tag) =>
      rest.every((d) =>
        d.targeting.some((t) => t.kind === tag.kind && t.label === tag.label),
      ),
    );
  }, [batch.docs]);
  return (
    <>
      <tr className="border-b border-blue-100 bg-blue-50/40 hover:bg-blue-50/60 dark:border-blue-900/30 dark:bg-blue-950/15">
        <td className="px-4 py-2.5 align-top max-w-[320px]">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={onToggleExpand}
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900"
              aria-label={expanded ? 'collapse' : 'expand'}
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  expanded && 'rotate-90',
                )}
              />
            </button>
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              aria-hidden
            >
              <Package className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-blue-700/80 dark:text-blue-300/80">
                {t(
                  batch.docs.length > 1
                    ? 'validation.dynamicBatch.docsMany'
                    : 'validation.dynamicBatch.docsOne',
                  { count: batch.docs.length },
                )}
              </div>
              <div
                className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100"
                title={batch.name}
              >
                {batch.name}
              </div>
              {commonTargeting.length > 0 && (
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  {renderTargeting(commonTargeting, 4)}
                </div>
              )}
            </div>
          </div>
        </td>
        <td
          className="px-4 py-2.5 align-top cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onPreviewNotification();
          }}
        >
          <NotificationBadge
            notification={batch.notification}
            templateLabel={batch.templateLabel}
          />
        </td>
        <td className="px-4 py-2.5 align-top">
          <div className="flex flex-col gap-0.5">
            <UserCell
              name={earliestDoc.createdBy.name}
              sublabel={earliestDoc.createdBy.role}
            />
            <span className="text-[11px] text-gray-500 whitespace-nowrap">
              {formatDate(earliestDoc.createdAt)}
            </span>
          </div>
        </td>
        <td className="px-4 py-2.5 align-top text-center text-[11px] text-gray-300">
          —
        </td>
        <td className="px-4 py-2.5 align-top">
          <StatusBadge label={statusLabel} variant={conf.variant} />
        </td>
        <td className={cn('px-4 py-2.5 align-top', stickyClass)}>
          <RowActions
            previewLabel={t('validation.tooltip.previewDoc')}
            acceptLabel={t('validation.tooltip.validateAndSend')}
            rejectLabel={t('validation.tooltip.reject')}
            resetLabel={t('validation.tooltip.resetPending')}
            onAccept={onValidate}
            onReject={onReject}
            onReset={onReset}
            showPreview={false}
            showAccept={status !== 'validated'}
            showReject={status !== 'rejected'}
            showReset={status === 'validated'}
          />
        </td>
      </tr>
      {expanded &&
        batch.docs.map((d) => (
          <tr
            key={`batch-${batch.id}-child-${d.id}`}
            className="border-b border-border/40 cursor-pointer transition-colors bg-blue-50/10 hover:bg-blue-50/30 dark:bg-blue-950/5"
            onClick={() => onPreviewChild(d)}
          >
            <td className="px-4 py-2 align-top max-w-[320px] pl-8">
              {d.kindKey && (
                <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t(d.kindKey)}
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                    title={d.name}
                  >
                    {d.name}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <span className="text-xs">{d.name}</span>
                </TooltipContent>
              </Tooltip>
              {d.pathSegments.length > 0 && (
                <div
                  className="mt-0.5 truncate text-[11px] text-gray-500"
                  title={d.pathSegments.join(' / ')}
                >
                  {d.pathSegments.join(' / ')}
                </div>
              )}
            </td>
            <td className="px-4 py-2 align-top text-center text-[11px] text-gray-300">
              —
            </td>
            <td className="px-4 py-2 align-top">
              <span className="text-[11px] text-gray-500 whitespace-nowrap">
                {formatDate(d.createdAt)}
              </span>
            </td>
            <td className="px-4 py-2 align-top text-center text-[11px] text-gray-300">
              —
            </td>
            <td className="px-4 py-2 align-top text-[11px] text-gray-300">
              —
            </td>
            <td className={cn('px-4 py-2 align-top', stickyClass)}>
              <RowActions
                previewLabel={t('validation.tooltip.previewDoc')}
                onPreview={() => onPreviewChild(d)}
                showAccept={false}
                showReject={false}
              />
            </td>
          </tr>
        ))}
    </>
  );
}
