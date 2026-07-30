import { useEffect, useMemo, useState, useCallback } from 'react';
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
  Users,
  Building2,
  Download,
  RotateCcw,
  Eye,
  Mail,
  Calendar,
  User,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { PageHeader } from './ui/page-header';
import { RowActions } from './ui/row-actions';
import { BulkActionBar } from './ui/bulk-action-bar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { FilterCard } from './ui/filter-card';
import { FilterBar, FilterConfig } from './FilterBar';
import { DataPagination } from './ui/data-pagination';
import { StatusBadge } from './StatusBadge';
import { TableSkeleton } from './TableSkeleton';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';
import { UserCell } from './UserCell';
import { CommentIndicator } from './CommentIndicator';
import { NotificationPreviewDrawer } from './NotificationPreviewDrawer';
import { useTableSearch } from '../utils/useTableSearch';
import { useBulkSelection } from '../hooks/useBulkSelection';
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
  INVESTORS,
  findInvestor,
  commitmentsForFund,
  getInvestorContacts,
  type InvestorContact,
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

/** Brand navy — matches the Alerts bulk action dialog accent. */
const BRAND_BLUE = '#000E2B';

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

function resolveFundsFromTargeting(
  targeting: ValidationDocument['targeting'],
): string[] {
  const fundNames = new Set<string>();
  targeting.forEach((tag) => {
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

function resolveFundsForDoc(doc: ValidationDocument): string[] {
  return resolveFundsFromTargeting(doc.targeting);
}

// ---------------------------------------------------------------------------
// Cible (target) + Fonds (fund) resolution — the two columns derived from a
// document's (or lot's) targeting tags. A target is either nominative (a named
// investor, optionally tied to a subscription) or generic (a number of
// investors reached, a segment, or all funds).
// ---------------------------------------------------------------------------

/** Distinct investors across the whole book — used for cross-fund generic targets. */
const ALL_INVESTORS_COUNT = new Set(COMMITMENTS.map((c) => c.investorId)).size;

/** Number of distinct investors reached by a generic (non-nominative) target. */
function genericInvestorCount(
  targeting: ValidationDocument['targeting'],
): number {
  const fundTags = targeting.filter((t) => t.kind === 'fund');
  if (fundTags.length === 0) return ALL_INVESTORS_COUNT;
  const investors = new Set<string>();
  fundTags.forEach((tag) => {
    const fund = FUNDS.find((f) => f.name === tag.label);
    if (fund) {
      commitmentsForFund(fund.code).forEach((c) => investors.add(c.investorId));
    }
  });
  return investors.size;
}

interface CibleInfo {
  /** Nominative target — a single named investor. */
  investorName?: string;
  /** Generic target — count of distinct investors reached. */
  investorCount?: number;
  /** Segment-level generic target (e.g. distributors) when no fund applies. */
  segmentLabel?: string;
  /** Subscription code (e.g. "SUB-NWGC2-009") when tied to a subscription. */
  subscriptionCode?: string;
  /** Human-readable subscription label shown on hover. */
  subscriptionFullName?: string;
}

function resolveCible(targeting: ValidationDocument['targeting']): CibleInfo {
  const subTag = targeting.find((t) => t.kind === 'subscription');
  const invTag = targeting.find((t) => t.kind === 'investor');
  let investorName: string | undefined;
  let subscriptionCode: string | undefined;
  let subscriptionFullName: string | undefined;
  if (subTag) {
    subscriptionCode = subTag.label;
    const commitment = SUBSCRIPTION_BY_ID.get(subTag.label);
    if (commitment) {
      const investor = findInvestor(commitment.investorId);
      const fund = FUNDS.find((f) => f.code === commitment.fundCode);
      investorName = investor?.name;
      subscriptionFullName = [investor?.name, fund?.name, commitment.shareClass]
        .filter(Boolean)
        .join(' — ');
    }
  }
  if (!investorName && invTag) investorName = invTag.label;
  if (investorName) {
    return { investorName, subscriptionCode, subscriptionFullName };
  }

  const hasFund = targeting.some((t) => t.kind === 'fund');
  const hasAudience = targeting.some((t) => t.kind === 'audience');
  const segmentTag = targeting.find((t) => t.kind === 'segment');
  if (hasFund || hasAudience) {
    return { investorCount: genericInvestorCount(targeting) };
  }
  if (segmentTag) return { segmentLabel: segmentTag.label };
  return { investorCount: genericInvestorCount(targeting) };
}

/** Cible for a lot — collapses to a single investor when all docs share one,
 * otherwise reports the count of distinct investors reached by the lot. */
function resolveCibleForDocs(docs: ValidationDocument[]): CibleInfo {
  if (docs.length === 0) return {};
  const base = resolveCible(docs[0].targeting);
  const investorNames = new Set<string>();
  docs.forEach((d) => {
    const name = resolveInvestor(d);
    if (name) investorNames.add(name);
  });
  if (investorNames.size > 1) return { investorCount: investorNames.size };
  // Single (or no) investor: keep the base, but drop the subscription chip when
  // the lot spans several subscriptions.
  const subs = new Set(
    docs
      .map((d) => d.targeting.find((t) => t.kind === 'subscription')?.label)
      .filter(Boolean),
  );
  if (subs.size > 1) {
    return { ...base, subscriptionCode: undefined, subscriptionFullName: undefined };
  }
  return base;
}

interface FondsInfo {
  fundName?: string;
  allFunds?: boolean;
}

function resolveFonds(targeting: ValidationDocument['targeting']): FondsInfo {
  const funds = resolveFundsFromTargeting(targeting);
  if (funds.length === 1) return { fundName: funds[0] };
  if (funds.length > 1) return { allFunds: true };
  if (targeting.some((t) => t.kind === 'audience')) return { allFunds: true };
  return {};
}

function resolveFondsForDocs(docs: ValidationDocument[]): FondsInfo {
  const fundNames = new Set<string>();
  docs.forEach((d) =>
    resolveFundsFromTargeting(d.targeting).forEach((f) => fundNames.add(f)),
  );
  if (fundNames.size === 1) return { fundName: Array.from(fundNames)[0] };
  if (fundNames.size > 1) return { allFunds: true };
  if (docs.some((d) => d.targeting.some((t) => t.kind === 'audience'))) {
    return { allFunds: true };
  }
  return {};
}

/** A document is "nominative" when its scope targets a specific investor —
 * either directly via an investor tag, or transitively via a subscription. */
function isNominative(doc: ValidationDocument): boolean {
  return doc.targeting.some(
    (t) => t.kind === 'investor' || t.kind === 'subscription',
  );
}

// ---------------------------------------------------------------------------
// Unified audience info — replaces CibleCell + FondsCell with a single widget
// showing either generic (fund/segment + investor count) or nominative
// (investor/structure/subscription + contacts) targeting.
// ---------------------------------------------------------------------------

interface AudienceInfo {
  nominative: boolean;
  // Generic fields
  fundName?: string;
  allFunds?: boolean;
  segmentLabel?: string;
  investorCount?: number;
  // Nominative fields
  investorName?: string;
  structureName?: string;
  subscriptionCode?: string;
  subscriptionFullName?: string;
  contacts?: InvestorContact[];
  contactCount?: number;
}

function resolveAudience(
  targeting: ValidationDocument['targeting'],
): AudienceInfo {
  const cible = resolveCible(targeting);
  const fonds = resolveFonds(targeting);
  const nominative = !!cible.investorName;

  if (nominative) {
    let contacts: InvestorContact[] = [];
    let structureName: string | undefined;
    const subTag = targeting.find((t) => t.kind === 'subscription');
    const invTag = targeting.find((t) => t.kind === 'investor');
    let investorId: string | undefined;
    if (subTag) {
      const commitment = SUBSCRIPTION_BY_ID.get(subTag.label);
      if (commitment) investorId = commitment.investorId;
    }
    if (!investorId && invTag) {
      const inv = INVESTORS_BY_NAME.get(invTag.label);
      if (inv) investorId = inv.id;
    }
    if (investorId) {
      const inv = findInvestor(investorId);
      if (inv) structureName = inv.structure;
      contacts = getInvestorContacts(investorId).filter((c) => c.canAccess);
    }
    return {
      nominative: true,
      investorName: cible.investorName,
      structureName,
      subscriptionCode: cible.subscriptionCode,
      subscriptionFullName: cible.subscriptionFullName,
      fundName: fonds.fundName,
      allFunds: fonds.allFunds,
      contacts,
      contactCount: contacts.length,
    };
  }

  return {
    nominative: false,
    fundName: fonds.fundName,
    allFunds: fonds.allFunds,
    segmentLabel: cible.segmentLabel,
    investorCount: cible.investorCount,
  };
}

function resolveAudienceForDocs(docs: ValidationDocument[]): AudienceInfo {
  if (docs.length === 0) return { nominative: false };
  const cible = resolveCibleForDocs(docs);
  const fonds = resolveFondsForDocs(docs);
  const nominative = !!cible.investorName;

  if (nominative) {
    let contacts: InvestorContact[] = [];
    let structureName: string | undefined;
    const allTargeting = docs.flatMap((d) => d.targeting);
    const subTag = allTargeting.find((t) => t.kind === 'subscription');
    const invTag = allTargeting.find((t) => t.kind === 'investor');
    let investorId: string | undefined;
    if (subTag) {
      const commitment = SUBSCRIPTION_BY_ID.get(subTag.label);
      if (commitment) investorId = commitment.investorId;
    }
    if (!investorId && invTag) {
      const inv = INVESTORS_BY_NAME.get(invTag.label);
      if (inv) investorId = inv.id;
    }
    if (investorId) {
      const investor = findInvestor(investorId);
      if (investor) structureName = investor.structure;
      contacts = getInvestorContacts(investorId).filter((c) => c.canAccess);
    }
    return {
      nominative: true,
      investorName: cible.investorName,
      structureName,
      subscriptionCode: cible.subscriptionCode,
      subscriptionFullName: cible.subscriptionFullName,
      fundName: fonds.fundName,
      allFunds: fonds.allFunds,
      contacts,
      contactCount: contacts.length,
    };
  }

  return {
    nominative: false,
    fundName: fonds.fundName,
    allFunds: fonds.allFunds,
    segmentLabel: cible.segmentLabel,
    investorCount: cible.investorCount ?? 0,
  };
}

const INVESTORS_BY_NAME = new Map(
  INVESTORS.map((i) => [i.name, i] as const),
);

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
    | { kind: 'unpublish'; docs: ValidationDocument[] }
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

  const getDocId = useCallback((d: ValidationDocument) => String(d.id), []);

  const {
    selectedIds: validationSelectedIds,
    selectAllFiltered: validationSelectAllFiltered,
    toggleRow: validationToggleRow,
    setRowsSelected: validationSetRowsSelected,
    togglePageAll: validationTogglePageAll,
    selectAllFilteredItems: validationSelectAllFiltered_fn,
    clearSelection: validationClearSelection,
    allPageSelected: validationAllPageSelected,
    somePageSelected: validationSomePageSelected,
    selectedCount: validationSelectedCount,
    selectedItems: validationSelectedItems,
  } = useBulkSelection({
    allFilteredItems: flatDocs,
    pageItems: pageDocs,
    getId: getDocId,
  });

  const validationBulkActions = useMemo(
    () => [
      {
        labelKey: 'validation.selection.actionPublish',
        icon: <Check className="w-4 h-4" />,
        onClick: () => openPublishConfirm(validationSelectedItems),
        color: 'var(--success)',
        borderColor: 'color-mix(in oklab, var(--success) 35%, transparent)',
        bgColor: 'var(--success-soft)',
      },
      {
        labelKey: 'validation.selection.actionReject',
        icon: <X className="w-4 h-4" />,
        onClick: () => openRejectConfirm(validationSelectedItems),
        color: 'var(--danger)',
        borderColor: 'color-mix(in oklab, var(--danger) 35%, transparent)',
        bgColor: 'var(--danger-soft)',
      },
      {
        labelKey: 'validation.selection.actionUnpublish',
        icon: <RotateCcw className="w-4 h-4" />,
        onClick: () => openUnpublishConfirm(validationSelectedItems),
        color: 'var(--warning)',
        borderColor: 'color-mix(in oklab, var(--warning) 35%, transparent)',
        bgColor: 'var(--warning-soft)',
      },
    ],
    [validationSelectedItems],
  );

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

  const openUnpublishConfirm = (docs: ValidationDocument[]) => {
    if (docs.length === 0) return;
    setConfirmDialog({ kind: 'unpublish', docs });
  };

  /** Build a comment ref from optional free text. `t()` falls back to the raw
   * string when the key is unknown, so a user-entered comment renders as-is. */
  const commentRefFor = (comment: string): I18nRef | undefined =>
    comment.trim() ? { key: comment.trim() } : undefined;

  const applyBulkValidate = (docs: ValidationDocument[], comment = '') => {
    const stamp = new Date().toISOString();
    const youLabel = t('validation.you');
    const docIds = new Set(docs.map((d) => d.id));
    const commentRef = commentRefFor(comment);
    setDocuments((prev) =>
      prev.map((d) =>
        docIds.has(d.id)
          ? {
              ...d,
              status: 'validated',
              reviewedAt: stamp,
              reviewedBy: youLabel,
              ...(commentRef ? { comment: commentRef } : {}),
            }
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

  const applyBulkReject = (docs: ValidationDocument[], comment = '') => {
    const stamp = new Date().toISOString();
    const youLabel = t('validation.you');
    const docIds = new Set(docs.map((d) => d.id));
    const commentRef = commentRefFor(comment);
    setDocuments((prev) =>
      prev.map((d) =>
        docIds.has(d.id)
          ? {
              ...d,
              status: 'rejected',
              reviewedAt: stamp,
              reviewedBy: youLabel,
              ...(commentRef ? { comment: commentRef } : {}),
            }
          : d,
      ),
    );
    docs.forEach((d) => {
      if (isDynamicDoc(d.id)) setDynamicDocumentStatus(d.id, 'rejected');
    });
    promoteToGed(docs, 'rejected');
    toast.error(t('validation.toast.bulkRejected', { count: docs.length }));
  };

  const applyUnpublish = (docs: ValidationDocument[], comment = '') => {
    const docIds = new Set(docs.map((d) => d.id));
    const commentRef = commentRefFor(comment);
    setDocuments((prev) =>
      prev.map((d) => {
        if (!docIds.has(d.id)) return d;
        const { reviewedAt, reviewedBy, ...rest } = d;
        void reviewedAt;
        void reviewedBy;
        return {
          ...rest,
          status: 'pending',
          ...(commentRef ? { comment: commentRef } : {}),
        };
      }),
    );
    docs.forEach((d) => {
      if (isDynamicDoc(d.id)) setDynamicDocumentStatus(d.id, 'pending');
    });
    promoteToGed(docs, 'pending');
    toast.info(t('validation.toast.bulkUnpublished', { count: docs.length }));
  };

  const handleExport = () => {
    const headers = [
      t('validation.table.document'),
      t('validation.table.audience'),
      t('validation.table.notification'),
      t('validation.table.createdBy'),
      t('validation.table.status'),
      t('validation.table.date'),
    ];
    const rows = flatDocs.map((doc) => {
      const aud = resolveAudience(doc.targeting);
      let audienceLabel = '';
      if (aud.nominative) {
        const parts = [aud.investorName, aud.structureName, aud.subscriptionCode].filter(Boolean);
        audienceLabel = parts.join(' — ');
      } else {
        const fundPart = aud.fundName ?? (aud.allFunds ? t('validation.fonds.all') : '');
        const segPart = aud.segmentLabel ?? '';
        const countPart = t(
          (aud.investorCount ?? 0) > 1
            ? 'validation.cible.investorsMany'
            : 'validation.cible.investorsOne',
          { count: aud.investorCount ?? 0 },
        );
        audienceLabel = [fundPart, segPart, countPart].filter(Boolean).join(' — ');
      }
      const { notification: docNotif } = resolveNotification(doc, batchById);
      const notifLabel = docNotif
        ? t('validation.notificationCol.yes')
        : t('validation.notificationCol.no');
      return [
        doc.name,
        audienceLabel,
        notifLabel,
        doc.createdBy.name,
        t(STATUS_LABEL_KEY[doc.status]),
        formatDate(doc.createdAt),
      ];
    });
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `publication-center_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success(t('validation.toast.exported', { count: flatDocs.length }));
  };

  const stickyHeadActionsClass =
    'sticky right-0 z-20 bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800';
  const stickyBodyActionsClass = () =>
    cn(
      'sticky right-0 z-10 text-right bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 shadow-[-8px_0_12px_-12px_rgba(0,0,0,0.18)]',
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
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        title={t('validation.title')}
        subtitle={t('validation.subtitle')}
        primaryAction={{
          label: t('validation.export', { count: totalItems }),
          icon: <Download className="w-4 h-4" />,
          onClick: handleExport,
        }}
      />

      {/* Body */}
      <div className="flex-1 overflow-auto px-6 pt-6 pb-6 flex flex-col gap-4">
        {/* Status filtering KPI cards */}
        <section aria-label={t('validation.statusSectionTitle')}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t('validation.statusSectionTitle')}
          </h3>
          <div className="grid grid-cols-4 gap-1.5">
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
        </section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
        >
          <Card className="overflow-hidden p-0 gap-0 hover:shadow-lg transition-shadow duration-500">
            {/* Filter bar */}
            <div className="px-6 py-4 border-b border-border bg-card">
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

            <CardContent className="p-0 flex flex-col">
              <BulkActionBar
                selectedCount={validationSelectedCount}
                totalFilteredCount={flatDocs.length}
                selectAllFiltered={validationSelectAllFiltered}
                onSelectAllFiltered={validationSelectAllFiltered_fn}
                onClearSelection={validationClearSelection}
                actions={validationBulkActions}
                unitOneKey="validation.selection.selectedOne"
                unitManyKey="validation.selection.selectedMany"
              />
              {/* Table */}
              <div className="flex-1 overflow-auto">
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
                      <th className="px-4 py-3 w-10">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex">
                              <Checkbox
                                checked={
                                  validationAllPageSelected
                                    ? true
                                    : validationSomePageSelected
                                      ? 'indeterminate'
                                      : false
                                }
                                onCheckedChange={() => validationTogglePageAll()}
                                aria-label={
                                  validationAllPageSelected
                                    ? t('validation.selection.deselectAll')
                                    : t('validation.selection.selectAll')
                                }
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {validationAllPageSelected
                              ? t('validation.selection.deselectAll')
                              : t('validation.selection.selectAll')}
                          </TooltipContent>
                        </Tooltip>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider max-w-[320px]">
                        {t('validation.table.document')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {t('validation.table.audience')}
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
                            onResetToPending={() => openUnpublishConfirm([row.doc])}
                            onPreviewNotification={() =>
                              setPreviewNotificationDocId(row.doc.id)
                            }
                            stickyClass={stickyBodyActionsClass()}
                            selected={validationSelectedIds.has(String(row.doc.id))}
                            onToggleSelect={() => validationToggleRow(String(row.doc.id))}
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
                          onReset={() => openUnpublishConfirm(batch.docs)}
                          onPreviewChild={(d) => setPreviewDocument(d)}
                          stickyClass={stickyBodyActionsClass()}
                          selectedIds={validationSelectedIds}
                          onToggleSelect={validationToggleRow}
                          onSetRowsSelected={validationSetRowsSelected}
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
            </CardContent>
          </Card>
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
              openUnpublishConfirm([previewDoc]);
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
          onPreviewDocument={(d) => setPreviewDocument(d)}
          formatDate={formatDate}
          onConfirm={(comment) => {
            if (confirmDialog.kind === 'publish') {
              applyBulkValidate(confirmDialog.docs, comment);
            } else if (confirmDialog.kind === 'reject') {
              applyBulkReject(confirmDialog.docs, comment);
            } else {
              applyUnpublish(confirmDialog.docs, comment);
            }
            setConfirmDialog(null);
            validationClearSelection();
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
  stickyClass: string;
  selected?: boolean;
  onToggleSelect?: () => void;
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
  stickyClass,
  selected,
  onToggleSelect,
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
      {onToggleSelect && (
        <td
          className="px-4 py-2.5 w-10 align-top"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={selected ?? false}
            onCheckedChange={onToggleSelect}
            aria-label={t('validation.selection.selectRow')}
          />
        </td>
      )}
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
      </td>
      <td className="px-4 py-2.5 align-top">
        <AudienceCell info={resolveAudience(doc.targeting)} />
      </td>
      <td className="px-4 py-2.5 align-top">
        <NotificationCell
          notification={notification}
          templateLabel={templateLabel}
          onPreviewNotification={onPreviewNotification}
        />
      </td>
      <td className="px-4 py-2.5 align-top">
        <div className="flex flex-col gap-0.5">
          <UserCell name={doc.createdBy.name} />
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
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
        <BellOff className="h-3 w-3 shrink-0" />
        {t('validation.notificationLine.noneDoc')}
      </span>
    );
  }
  const label = templateLabel ?? t('validation.notificationLine.templateLabel');
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200">
      <Bell className="h-3 w-3 shrink-0" />
      <span className="max-w-[220px] truncate" title={label}>
        {label}
      </span>
    </span>
  );
}

function NotificationCell({
  notification,
  templateLabel,
  onPreviewNotification,
}: {
  notification?: ValidationDocument['notification'];
  templateLabel?: string;
  onPreviewNotification: () => void;
}) {
  return (
    <span
      className={notification ? 'inline-flex cursor-pointer' : 'inline-flex'}
      onClick={(e) => {
        if (notification) {
          e.stopPropagation();
          onPreviewNotification();
        }
      }}
    >
      <NotificationBadge
        notification={notification}
        templateLabel={templateLabel}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// AudienceCell — unified widget replacing CibleCell + FondsCell.
// Generic  : Fund / Segment + audience (investor count + download)
// Nominative: Investor / Structure / Subscription + audience (contacts hover + download)
// ---------------------------------------------------------------------------

function AudienceCell({ info }: { info: AudienceInfo }) {
  const { t } = useTranslation();

  if (info.nominative) {
    return <AudienceCellNominative info={info} />;
  }
  return <AudienceCellGeneric info={info} />;
}

function AudienceCellGeneric({ info }: { info: AudienceInfo }) {
  const { t } = useTranslation();
  const FundIcon = TARGETING_ICON.fund;
  const SegmentIcon = TARGETING_ICON.segment;

  const fundLabel = info.fundName
    ? info.fundName
    : info.allFunds
      ? t('validation.fonds.all')
      : undefined;

  const count = info.investorCount ?? 0;
  const countLabel = t(
    count > 1
      ? 'validation.cible.investorsMany'
      : 'validation.cible.investorsOne',
    { count },
  );

  return (
    <div className="flex flex-col items-start gap-1.5">
      {fundLabel && (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <FundIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="max-w-[200px] truncate" title={fundLabel}>
            {fundLabel}
          </span>
        </span>
      )}
      {info.segmentLabel && (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300">
          <SegmentIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span className="max-w-[200px] truncate" title={info.segmentLabel}>
            {info.segmentLabel}
          </span>
        </span>
      )}
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          <Users className="h-3 w-3 shrink-0" />
          {countLabel}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center h-5 w-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toast.info(t('validation.audience.downloadStarted'));
              }}
            >
              <Download className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="text-xs">{t('validation.audience.downloadTooltip')}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

function AudienceCellNominative({ info }: { info: AudienceInfo }) {
  const { t } = useTranslation();
  const InvestorIcon = TARGETING_ICON.investor;
  const SubIcon = TARGETING_ICON.subscription;

  const contacts = info.contacts ?? [];
  const contactCount = info.contactCount ?? 0;
  const contactLabel = t(
    contactCount > 1
      ? 'validation.audience.contactsMany'
      : 'validation.audience.contactsOne',
    { count: contactCount },
  );

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-900 dark:text-gray-100">
        <InvestorIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="max-w-[200px] truncate" title={info.investorName}>
          {info.investorName}
        </span>
      </span>
      {info.structureName && (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-gray-400">
          <Building2 className="h-3 w-3 shrink-0 text-gray-400" />
          <span className="max-w-[200px] truncate" title={info.structureName}>
            {info.structureName}
          </span>
        </span>
      )}
      {info.subscriptionCode && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex w-fit items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <SubIcon className="h-3 w-3 shrink-0" />
              {info.subscriptionCode}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="text-xs">
              {info.subscriptionFullName ?? info.subscriptionCode}
            </span>
          </TooltipContent>
        </Tooltip>
      )}
      <div className="flex items-center gap-1.5 mt-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 cursor-default dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <Users className="h-3 w-3 shrink-0" />
              {contactLabel}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1.5 py-1">
              {info.investorName && (
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <InvestorIcon className="h-3 w-3 shrink-0" />
                  {info.investorName}
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-1.5 space-y-1">
                {contacts.map((c) => (
                  <div key={c.id} className="text-xs flex items-center justify-between gap-3">
                    <span className="truncate">{c.name}</span>
                    <span className="text-[10px] text-gray-400 shrink-0">{c.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center justify-center h-5 w-5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toast.info(t('validation.audience.downloadStarted'));
              }}
            >
              <Download className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span className="text-xs">{t('validation.audience.downloadTooltip')}</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Publication confirmation dialog — a centered modal mirroring the compliance
// Alerts bulk action dialog (same Dialog / Textarea / Label primitives):
// branded header, summary card, an optional shared comment and — for the
// publish action — a recap of the communications that will be sent. Shared by
// the publish, reject and unpublish (back-to-pending) flows.
// ---------------------------------------------------------------------------

type PublicationConfirmMode = 'publish' | 'reject' | 'unpublish';

interface PublicationConfirmDialogProps {
  mode: PublicationConfirmMode;
  docs: ValidationDocument[];
  batchById: Map<string, ValidationBatch>;
  onCancel: () => void;
  onConfirm: (comment: string) => void;
  onPreviewDocument?: (doc: ValidationDocument) => void;
  formatDate?: (iso: string) => string;
}

const CONFIRM_ACTION_ICON: Record<PublicationConfirmMode, LucideIcon> = {
  publish: Check,
  reject: X,
  unpublish: RotateCcw,
};

const CONFIRM_TITLE_KEY: Record<PublicationConfirmMode, string> = {
  publish: 'validation.bulkDialog.titlePublish',
  reject: 'validation.bulkDialog.titleReject',
  unpublish: 'validation.bulkDialog.titleUnpublish',
};

const CONFIRM_TITLE_SINGLE_KEY: Record<PublicationConfirmMode, string> = {
  publish: 'validation.bulkDialog.titlePublishSingle',
  reject: 'validation.bulkDialog.titleRejectSingle',
  unpublish: 'validation.bulkDialog.titleUnpublishSingle',
};

const CONFIRM_DESC_KEY: Record<PublicationConfirmMode, string> = {
  publish: 'validation.bulkDialog.descPublish',
  reject: 'validation.bulkDialog.descReject',
  unpublish: 'validation.bulkDialog.descUnpublish',
};

const CONFIRM_SUBMIT_KEY: Record<PublicationConfirmMode, string> = {
  publish: 'validation.bulkDialog.submitPublish',
  reject: 'validation.bulkDialog.submitReject',
  unpublish: 'validation.bulkDialog.submitUnpublish',
};

function PublicationConfirmDialog({
  mode,
  docs,
  batchById,
  onCancel,
  onConfirm,
  onPreviewDocument,
  formatDate: formatDateProp,
}: PublicationConfirmDialogProps) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');

  type Group = {
    sig: string;
    docs: ValidationDocument[];
    notification?: ValidationDocument['notification'];
    templateKey?: string;
  };
  const notificationGroups = useMemo(() => {
    const map = new Map<string, Group>();
    docs.forEach((d) => {
      const { notification, templateKey } = resolveNotification(d, batchById);
      const sig = notificationSignature(notification);
      if (sig === 'silent') return;
      const existing = map.get(sig);
      if (existing) existing.docs.push(d);
      else map.set(sig, { sig, docs: [d], notification, templateKey });
    });
    return Array.from(map.values()).sort((a, b) => b.docs.length - a.docs.length);
  }, [docs, batchById]);

  const audience = useMemo(
    () => (docs.length === 1 ? resolveAudience(docs[0].targeting) : resolveAudienceForDocs(docs)),
    [docs],
  );

  const totalDocs = docs.length;
  const totalNotifs = notificationGroups.length;
  const isSingle = totalDocs === 1;
  const single = docs[0];
  const ActionIcon = CONFIRM_ACTION_ICON[mode];

  const title = isSingle
    ? t(CONFIRM_TITLE_SINGLE_KEY[mode], { name: single.name })
    : t(CONFIRM_TITLE_KEY[mode], { count: totalDocs });

  const handleDownloadAudience = () => {
    const contacts = audience.contacts ?? [];
    const allRecipients: { name: string; email: string; role: string }[] = [];

    if (contacts.length > 0) {
      contacts.forEach((c) =>
        allRecipients.push({ name: c.name, email: c.email, role: c.role }),
      );
    } else {
      notificationGroups.forEach((g) =>
        g.notification?.recipients.forEach((r) =>
          allRecipients.push({
            name: typeof r.name === 'string' ? r.name : t(r.name.key, r.name.vars),
            email: r.email,
            role: r.role ? (typeof r.role === 'string' ? r.role : t(r.role.key, r.role.vars)) : '',
          }),
        ),
      );
    }

    if (allRecipients.length === 0) {
      toast.info(t('validation.audience.downloadStarted'));
      return;
    }

    const header = `${t('validation.bulkDialog.audienceName')},${t('validation.bulkDialog.audienceEmail')},${t('validation.bulkDialog.audienceRole')}`;
    const rows = allRecipients.map(
      (r) => `"${r.name}","${r.email}","${r.role}"`,
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audience_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.info(t('validation.audience.downloadStarted'));
  };

  const FundIcon = TARGETING_ICON.fund;
  const InvestorIcon = TARGETING_ICON.investor;
  const SubIcon = TARGETING_ICON.subscription;

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white" style={{ width: '75vw', maxWidth: '75vw' }}>
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="break-words">{title}</DialogTitle>
              <DialogDescription>{t(CONFIRM_DESC_KEY[mode])}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ── Document info card ── */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {isSingle ? (
                  <>
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 shrink-0 mt-0.5 text-gray-400" />
                      <span
                        className="text-sm font-semibold break-words leading-snug"
                        style={{ color: BRAND_BLUE }}
                      >
                        {single.name}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-gray-600">
                      {single.kindKey && (
                        <div className="flex items-center gap-1.5">
                          <TagIcon className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="text-gray-500">{t('validation.bulkDialog.docKind')}</span>
                          <span className="font-medium text-gray-700">{t(single.kindKey)}</span>
                        </div>
                      )}
                      {audience.fundName && (
                        <div className="flex items-center gap-1.5">
                          <FundIcon className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="text-gray-500">{t('validation.table.fonds')}</span>
                          <span className="font-medium text-gray-700">{audience.fundName}</span>
                        </div>
                      )}
                      {audience.allFunds && !audience.fundName && (
                        <div className="flex items-center gap-1.5">
                          <FundIcon className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="text-gray-500">{t('validation.table.fonds')}</span>
                          <span className="font-medium text-gray-700">{t('validation.fonds.all')}</span>
                        </div>
                      )}
                      {single.format && (
                        <div className="flex items-center gap-1.5">
                          <FileText className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="text-gray-500">{t('validation.bulkDialog.docFormat')}</span>
                          <span className="font-medium text-gray-700 uppercase">{single.format}{single.size ? ` (${single.size})` : ''}</span>
                        </div>
                      )}
                      {single.createdAt && formatDateProp && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="text-gray-500">{t('validation.table.date')}</span>
                          <span className="font-medium text-gray-700">{formatDateProp(single.createdAt)}</span>
                        </div>
                      )}
                      {single.createdBy && (
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 shrink-0 text-gray-400" />
                          <span className="text-gray-500">{t('validation.table.createdBy')}</span>
                          <span className="font-medium text-gray-700">{single.createdBy.name}</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-900 font-semibold block">
                      {t('validation.bulkDialog.docsSelected', { count: totalDocs })}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('validation.bulkDialog.summaryHint')}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {isSingle && onPreviewDocument && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => onPreviewDocument(single)}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span className="text-xs">{t('validation.bulkDialog.previewDoc')}</span>
                    </TooltipContent>
                  </Tooltip>
                )}
                <div
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  <ActionIcon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Audience section ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('validation.bulkDialog.audienceLabel')}</Label>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors"
                onClick={handleDownloadAudience}
              >
                <Download className="h-3 w-3" />
                {t('validation.bulkDialog.audienceDownload')}
              </button>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
              {/* Audience summary bar */}
              <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
                {audience.nominative ? (
                  <>
                    {audience.investorName && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-800">
                        <InvestorIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="font-medium">{audience.investorName}</span>
                      </span>
                    )}
                    {audience.structureName && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {audience.structureName}
                      </span>
                    )}
                    {audience.subscriptionCode && (
                      <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-600">
                        <SubIcon className="h-3 w-3 shrink-0" />
                        {audience.subscriptionFullName ?? audience.subscriptionCode}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {audience.fundName && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-800">
                        <FundIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="font-medium">{audience.fundName}</span>
                      </span>
                    )}
                    {audience.allFunds && !audience.fundName && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-800">
                        <FundIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="font-medium">{t('validation.fonds.all')}</span>
                      </span>
                    )}
                    {audience.segmentLabel && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
                        <TagIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        {audience.segmentLabel}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      <Users className="h-3 w-3 shrink-0" />
                      {t(
                        (audience.investorCount ?? 0) > 1
                          ? 'validation.cible.investorsMany'
                          : 'validation.cible.investorsOne',
                        { count: audience.investorCount ?? 0 },
                      )}
                    </span>
                  </>
                )}
              </div>

              {/* Contacts table */}
              {audience.contacts && audience.contacts.length > 0 && (
                <div className="max-h-[200px] overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-white border-b border-gray-100">
                      <tr className="text-left text-gray-500">
                        <th className="px-4 py-2 font-medium">{t('validation.bulkDialog.audienceName')}</th>
                        <th className="px-4 py-2 font-medium">{t('validation.bulkDialog.audienceRole')}</th>
                        <th className="px-4 py-2 font-medium">{t('validation.bulkDialog.audienceEmail')}</th>
                        <th className="px-4 py-2 font-medium">{t('validation.bulkDialog.audienceAccess')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {audience.contacts.map((c) => (
                        <tr key={c.id} className="text-gray-700 hover:bg-gray-50/50">
                          <td className="px-4 py-1.5 font-medium">{c.name}</td>
                          <td className="px-4 py-1.5 text-gray-500">{c.role}</td>
                          <td className="px-4 py-1.5">
                            <span className="inline-flex items-center gap-1 text-gray-500">
                              <Mail className="h-3 w-3 shrink-0" />
                              {c.email}
                            </span>
                          </td>
                          <td className="px-4 py-1.5">
                            <span className={cn(
                              'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                              c.accessLevel === 'full'
                                ? 'bg-green-50 text-green-700'
                                : c.accessLevel === 'commercial-only'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-red-50 text-red-600',
                            )}>
                              {t(`validation.bulkDialog.access_${c.accessLevel}`)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Contact count footer */}
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Users className="h-3 w-3 shrink-0" />
                  {t(
                    (audience.contactCount ?? audience.investorCount ?? 0) > 1
                      ? 'validation.audience.contactsMany'
                      : 'validation.audience.contactsOne',
                    { count: audience.contactCount ?? audience.investorCount ?? 0 },
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* ── Communications recap — publish only ── */}
          {mode === 'publish' &&
            (totalNotifs > 0 ? (
              <div className="space-y-2">
                <Label>{t('validation.bulkDialog.commsRecapLabel')}</Label>
                <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {notificationGroups.map((g) => {
                    const templateLabel = g.templateKey
                      ? t(g.templateKey)
                      : t('validation.notificationLine.templateLabel');
                    const recipients = g.notification?.recipients.length ?? 0;
                    return (
                      <div
                        key={g.sig}
                        className="flex items-center justify-between gap-3 px-4 py-2.5"
                      >
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-sm text-gray-800">
                          <Bell className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="break-words">
                            {templateLabel}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-gray-500">
                          {t(
                            recipients > 1
                              ? 'validation.notificationLine.recipientsMany'
                              : 'validation.notificationLine.recipientsOne',
                            { count: recipients },
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  {t('validation.bulkDialog.commsRecapHint', { count: totalNotifs })}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                <BellOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{t('validation.bulkDialog.noComms')}</span>
              </div>
            ))}

          {/* ── Document list — reject / unpublish, bulk only ── */}
          {mode !== 'publish' && !isSingle && (
            <div className="space-y-2">
              <Label>{t('validation.bulkDialog.docsListLabel')}</Label>
              <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                <ul className="space-y-0.5">
                  {docs.slice(0, 12).map((d) => (
                    <li key={d.id} className="break-words">
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
            </div>
          )}

          {/* ── Optional comment ── */}
          <div className="space-y-2">
            <Label htmlFor="pub-confirm-comment">
              {t('validation.bulkDialog.commentLabel')}
            </Label>
            <Textarea
              id="pub-confirm-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('validation.bulkDialog.commentPlaceholder')}
              className="min-h-[100px] resize-none"
              autoFocus
            />
            <div className="flex justify-end">
              <span className="text-xs text-gray-500">{comment.length} / 1234</span>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {t('validation.bulkDialog.cancel')}
          </Button>
          <Button
            onClick={() => onConfirm(comment)}
            className="text-white"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            <ActionIcon className="w-4 h-4 mr-2" />
            {t(CONFIRM_SUBMIT_KEY[mode])}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  stickyClass: string;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSetRowsSelected?: (ids: string[], selected: boolean) => void;
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
  stickyClass,
  selectedIds,
  onToggleSelect,
  onSetRowsSelected,
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
  const audienceInfo = useMemo(() => resolveAudienceForDocs(batch.docs), [batch.docs]);
  return (
    <>
      <tr className="border-b border-blue-100 bg-blue-50/40 hover:bg-blue-50/60 dark:border-blue-900/30 dark:bg-blue-950/15">
        {onToggleSelect && selectedIds && (
          <td className="px-4 py-2.5 w-10 align-top">
            {(() => {
              const batchDocIds = batch.docs.map((d) => String(d.id));
              const allSelected = batchDocIds.every((id) => selectedIds.has(id));
              const someSelected = !allSelected && batchDocIds.some((id) => selectedIds.has(id));
              return (
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={() => {
                    if (onSetRowsSelected) {
                      onSetRowsSelected(batchDocIds, !allSelected);
                    } else {
                      batchDocIds.forEach((id) => onToggleSelect(id));
                    }
                  }}
                  aria-label={t('validation.selection.selectRow')}
                />
              );
            })()}
          </td>
        )}
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
            </div>
          </div>
        </td>
        <td className="px-4 py-2.5 align-top">
          <AudienceCell info={audienceInfo} />
        </td>
        <td className="px-4 py-2.5 align-top text-center">
          <NotificationCell
            notification={batch.notification}
            templateLabel={batch.templateLabel}
            onPreviewNotification={onPreviewNotification}
          />
        </td>
        <td className="px-4 py-2.5 align-top">
          <div className="flex flex-col gap-0.5">
            <UserCell name={earliestDoc.createdBy.name} />
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
            {onToggleSelect && selectedIds && (
              <td
                className="px-4 py-2 w-10 align-top"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox
                  checked={selectedIds.has(String(d.id))}
                  onCheckedChange={() => onToggleSelect(String(d.id))}
                  aria-label={t('validation.selection.selectRow')}
                />
              </td>
            )}
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
            <td className="px-4 py-2 align-top text-[11px] text-gray-300">
              —
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
