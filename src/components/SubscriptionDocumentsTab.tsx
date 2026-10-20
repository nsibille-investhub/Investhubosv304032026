import { useMemo, useState, type ReactNode } from 'react';
import {
  CalendarClock,
  Check,
  Download,
  Eye,
  FileSignature,
  FileText,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { formatDate } from '../utils/formatters';
import {
  mockCorporateKycDocuments,
  mockIndividualKycDocuments,
  mockSubscriptionDocuments,
  type KycDocumentCategory,
  type KycDocumentStatus,
  type MockKycDocument,
  type MockSubscriptionDocument,
  type SubscriptionDocumentCategory,
  type SubscriptionDocumentStatus,
} from '../utils/subscriptionDetailMockData';
import { DataTable, type ColumnConfig } from './DataTable';
import { EmptyState } from './EmptyState';
import { FilterBar, type FilterConfig } from './FilterBar';
import { StatusBadge, type StatusVariant } from './StatusBadge';
import { Button } from './ui/button';
import { ConfirmDialog } from './ui/confirm-dialog';
import { DisabledReason } from './ui/disabled-reason';
import { ListingCard, ListingNameCell } from './ui/listing';
import { TableRowActions, type TableRowAction } from './ui/row-actions';
import { SegmentedControl } from './ui/segmented-control';
import { Textarea } from './ui/textarea';
import { WidgetCard, WidgetMetric } from './ui/widget-card';

const K = 'subscriptions.detail.documentsTab';
const DAY_MS = 86_400_000;
/** Seuil d'alerte avant expiration d'une pièce d'identité. */
const EXPIRY_WARNING_DAYS = 90;

type View = 'subscription' | 'kyc';
type Filters = Record<string, string | string[]>;
type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const SUBSCRIPTION_STATUSES: SubscriptionDocumentStatus[] = [
  'draft',
  'awaitingSignature',
  'awaitingCounterSignature',
  'completed',
  'acknowledged',
  'issued',
];
const SUBSCRIPTION_CATEGORIES: SubscriptionDocumentCategory[] = ['subscriptionForm', 'contractual', 'regulatory', 'evidence'];
const SUBSCRIPTION_STATUS_VARIANT: Record<SubscriptionDocumentStatus, StatusVariant> = {
  draft: 'neutral',
  awaitingSignature: 'warning',
  awaitingCounterSignature: 'info',
  completed: 'success',
  acknowledged: 'success',
  issued: 'neutral',
};

/** Statut affiché : une pièce validée dont la validité est dépassée repasse en « Expiré ». */
type KycDisplayStatus = KycDocumentStatus | 'expired';
const KYC_STATUSES: KycDisplayStatus[] = ['missing', 'toReview', 'rejected', 'expired', 'validated'];
const KYC_STATUS_VARIANT: Record<KycDisplayStatus, StatusVariant> = {
  validated: 'success',
  toReview: 'info',
  rejected: 'danger',
  missing: 'warning',
  expired: 'danger',
};
const KYC_CATEGORIES: KycDocumentCategory[] = ['identity', 'address', 'tax', 'funds', 'bank', 'company', 'ubo', 'compliance'];

const VIGILANCE_BY_RISK: Record<string, { key: 'simplified' | 'standard' | 'enhanced'; reviewYears: number }> = {
  Low: { key: 'simplified', reviewYears: 3 },
  Medium: { key: 'standard', reviewYears: 2 },
  High: { key: 'enhanced', reviewYears: 1 },
};
const KYC_OVERALL_VARIANT = { complete: 'success', inReview: 'info', incomplete: 'warning' } as const satisfies Record<string, StatusVariant>;

const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);

/** Jours restants avant la fin de validité : date d'expiration, ou date d'émission + durée réglementaire. */
const remainingDays = (doc: MockKycDocument): number | undefined =>
  doc.expiresInDays ?? (doc.issuedInDays !== undefined && doc.maxAgeDays !== undefined ? doc.issuedInDays + doc.maxAgeDays : undefined);

const kycDisplayStatus = (doc: MockKycDocument): KycDisplayStatus => {
  if (doc.status !== 'validated') return doc.status;
  const remaining = remainingDays(doc);
  return remaining !== undefined && remaining < 0 ? 'expired' : 'validated';
};

const sortRows = <T,>(rows: T[], sortConfig: SortConfig, value: (row: T, key: string) => string | number | undefined, lang: string) => {
  if (!sortConfig) return rows;
  return [...rows].sort((a, b) => {
    const left = value(a, sortConfig.key);
    const right = value(b, sortConfig.key);
    if (left === undefined) return 1;
    if (right === undefined) return -1;
    const result = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), lang);
    return sortConfig.direction === 'asc' ? result : -result;
  });
};

const nextSort = (prev: SortConfig, key: string): SortConfig =>
  prev?.key === key ? (prev.direction === 'asc' ? { key, direction: 'desc' } : null) : { key, direction: 'asc' };

const updateFilters = (setFilters: (fn: (prev: Filters) => Filters) => void) => (id: string, value: string | string[] | null) =>
  setFilters((prev) => {
    const next = { ...prev };
    if (value === null || (Array.isArray(value) && value.length === 0)) delete next[id];
    else next[id] = value;
    return next;
  });

const selected = (filters: Filters, id: string) => (filters[id] as string[] | undefined) ?? [];
const hasActiveFilters = (filters: Filters) =>
  Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));

const isCorporateSubscription = (subscription: any) =>
  subscription?.contrepartie?.type === 'corporate' || subscription?.contrepartie?.investorType === 'corporate';

/** Nombre total de documents de l'onglet : documents de souscription et pièces KYC. */
export const getSubscriptionDocumentsCount = (subscription: any) =>
  mockSubscriptionDocuments.length +
  (isCorporateSubscription(subscription) ? mockCorporateKycDocuments : mockIndividualKycDocuments).length;

interface SubscriptionDocumentsTabProps {
  subscription: any;
}

export function SubscriptionDocumentsTab({ subscription }: SubscriptionDocumentsTabProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('subscription');
  const isCorporate = isCorporateSubscription(subscription);
  const [kycDocuments, setKycDocuments] = useState<MockKycDocument[]>(() =>
    isCorporate ? mockCorporateKycDocuments : mockIndividualKycDocuments,
  );

  return (
    <div className="space-y-4">
      <SegmentedControl<View>
        aria-label={t(`${K}.viewSwitch`)}
        value={view}
        onValueChange={setView}
        options={[
          {
            value: 'subscription',
            icon: <FileSignature className="w-4 h-4" />,
            label: t(`${K}.views.subscription`, { count: mockSubscriptionDocuments.length }),
          },
          {
            value: 'kyc',
            icon: <ShieldCheck className="w-4 h-4" />,
            label: t(`${K}.views.kyc`, { count: kycDocuments.length }),
          },
        ]}
      />
      {view === 'subscription' ? (
        <SubscriptionDocumentsView />
      ) : (
        <KycDocumentsView
          subscription={subscription}
          isCorporate={isCorporate}
          documents={kycDocuments}
          onChange={setKycDocuments}
        />
      )}
    </div>
  );
}

function Toolbar({ children, actions }: { children: ReactNode; actions: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      {children}
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </div>
  );
}

function SubscriptionDocumentsView() {
  const { t, lang } = useTranslation();
  const [documents, setDocuments] = useState<MockSubscriptionDocument[]>(mockSubscriptionDocuments);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<MockSubscriptionDocument | null>(null);

  const toSign = documents.filter((doc) => doc.signers);
  const completed = toSign.filter((doc) => doc.status === 'completed').length;
  const awaitingSignature = documents.filter((doc) => doc.status === 'awaitingSignature').length;
  const awaitingCounter = documents.filter((doc) => doc.status === 'awaitingCounterSignature').length;
  const informational = documents.filter((doc) => doc.category === 'regulatory');
  const acknowledged = informational.filter((doc) => doc.status === 'acknowledged').length;

  const name = (doc: MockSubscriptionDocument) => t(doc.nameKey);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const categories = selected(filters, 'category');
    const statuses = selected(filters, 'status');
    const filtered = documents.filter((doc) => {
      if (term && ![t(doc.nameKey), doc.file].some((value) => value.toLowerCase().includes(term))) return false;
      if (categories.length > 0 && !categories.includes(doc.category)) return false;
      if (statuses.length > 0 && !statuses.includes(doc.status)) return false;
      return true;
    });
    return sortRows(
      filtered,
      sortConfig,
      (doc, key) =>
        key === 'name'
          ? t(doc.nameKey)
          : key === 'category'
            ? t(`${K}.subscription.categories.${doc.category}`)
            : key === 'updatedAt'
              ? -doc.updatedDaysAgo
              : undefined,
      lang,
    );
  }, [documents, search, filters, sortConfig, lang, t]);

  const actionsFor = (doc: MockSubscriptionDocument): TableRowAction[] => {
    const actions: TableRowAction[] = [
      { label: t(`${K}.actions.preview`), icon: Eye, onClick: () => toast.info(t(`${K}.toast.preview`, { name: name(doc) })) },
      { label: t(`${K}.actions.download`), icon: Download, onClick: () => toast.success(t(`${K}.toast.downloaded`, { name: name(doc) })) },
    ];
    if (doc.status === 'awaitingSignature' || doc.status === 'awaitingCounterSignature') {
      actions.push({
        label: t(`${K}.actions.remindSigners`),
        icon: Send,
        onClick: () => toast.success(t(`${K}.toast.reminded`, { name: name(doc) })),
      });
    }
    const signedOnce = (doc.signers?.signed ?? 0) > 0 || doc.status === 'acknowledged' || doc.status === 'issued';
    actions.push({
      label: t(`${K}.actions.delete`),
      icon: Trash2,
      intent: 'danger',
      separatorBefore: true,
      disabledReason: signedOnce ? t(`${K}.subscription.deleteLocked`) : undefined,
      onClick: () => setToDelete(doc),
    });
    return actions;
  };

  const columns: ColumnConfig<MockSubscriptionDocument>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.document`),
      sortable: true,
      render: (doc, term) => (
        <ListingNameCell
          name={name(doc)}
          searchTerm={term}
          secondary={t(`${K}.subscription.fileVersion`, {
            category: t(`${K}.subscription.categories.${doc.category}`),
            version: doc.version,
            language: doc.language,
          })}
        />
      ),
    },
    {
      key: 'status',
      label: t(`${K}.columns.status`),
      render: (doc) => (
        <StatusBadge
          variant={SUBSCRIPTION_STATUS_VARIANT[doc.status]}
          label={t(`${K}.subscription.statuses.${doc.status}`)}
          tooltip={t(`${K}.subscription.statusHints.${doc.status}`)}
        />
      ),
    },
    {
      key: 'signers',
      label: t(`${K}.columns.signers`),
      render: (doc) =>
        doc.signers ? (
          <span className="text-sm tabular-nums text-foreground">
            {t(`${K}.subscription.signersProgress`, { signed: doc.signers.signed, total: doc.signers.total })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground whitespace-nowrap">{t(`${K}.subscription.notSignable`)}</span>
        ),
    },
    {
      key: 'updatedAt',
      label: t(`${K}.columns.updatedAt`),
      sortable: true,
      render: (doc) => <span className="text-sm text-foreground whitespace-nowrap">{formatDate(daysFromNow(-doc.updatedDaysAgo))}</span>,
    },
    { key: 'actions', label: '', align: 'right', render: (doc) => <TableRowActions actions={actionsFor(doc)} /> },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      id: 'category',
      label: t(`${K}.columns.category`),
      type: 'multiselect',
      isPrimary: true,
      options: SUBSCRIPTION_CATEGORIES.map((value) => ({ value, label: t(`${K}.subscription.categories.${value}`) })),
    },
    {
      id: 'status',
      label: t(`${K}.columns.status`),
      type: 'multiselect',
      isPrimary: true,
      options: SUBSCRIPTION_STATUSES.map((value) => ({ value, label: t(`${K}.subscription.statuses.${value}`) })),
    },
  ];

  const showStatus = (status: SubscriptionDocumentStatus) => setFilters({ status: [status] });

  return (
    <>
      <WidgetCard
        icon={FileSignature}
        title={t(`${K}.subscription.summary.title`)}
        subtitle={t(`${K}.subscription.summary.subtitle`)}
      >
        <div className="grid grid-cols-4 gap-4">
          <WidgetMetric
            label={t(`${K}.subscription.summary.signed`)}
            value={t(`${K}.subscription.signersProgress`, { signed: completed, total: toSign.length })}
            tone={completed === toSign.length ? 'success' : undefined}
            onClick={() => showStatus('completed')}
            ariaLabel={t(`${K}.filterOn`, { label: t(`${K}.subscription.statuses.completed`) })}
          />
          <WidgetMetric
            label={t(`${K}.subscription.statuses.awaitingSignature`)}
            value={awaitingSignature}
            tone={awaitingSignature > 0 ? 'warning' : undefined}
            onClick={() => showStatus('awaitingSignature')}
            ariaLabel={t(`${K}.filterOn`, { label: t(`${K}.subscription.statuses.awaitingSignature`) })}
          />
          <WidgetMetric
            label={t(`${K}.subscription.statuses.awaitingCounterSignature`)}
            value={awaitingCounter}
            tone={awaitingCounter > 0 ? 'info' : undefined}
            onClick={() => showStatus('awaitingCounterSignature')}
            ariaLabel={t(`${K}.filterOn`, { label: t(`${K}.subscription.statuses.awaitingCounterSignature`) })}
          />
          <WidgetMetric
            label={t(`${K}.subscription.summary.acknowledged`)}
            value={t(`${K}.subscription.signersProgress`, { signed: acknowledged, total: informational.length })}
            secondary={t(`${K}.subscription.summary.acknowledgedHint`)}
          />
        </div>
      </WidgetCard>

      <ListingCard
        toolbar={
          <Toolbar
            actions={
              <>
                <Button variant="outline" onClick={() => toast.success(t(`${K}.toast.packExported`))}>
                  <Download className="w-4 h-4" />
                  {t(`${K}.subscription.exportPack`)}
                </Button>
                <Button onClick={() => toast.info(t(`${K}.toast.addDocument`))}>
                  <Plus className="w-4 h-4" />
                  {t(`${K}.addDocument`)}
                </Button>
              </>
            }
          >
            <FilterBar
              className="flex-1"
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t(`${K}.searchPlaceholder`)}
              filters={filterConfigs}
              activeFilters={filters}
              onFilterChange={updateFilters(setFilters)}
              onClearAll={() => setFilters({})}
            />
          </Toolbar>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            hasFilters={hasActiveFilters(filters)}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
            }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={(doc) => toast.info(t(`${K}.toast.preview`, { name: name(doc) }))}
            sortConfig={sortConfig}
            onSort={(key) => setSortConfig((prev) => nextSort(prev, key))}
            compactMode
            hideSelection
            searchTerm={search}
          />
        )}
      </ListingCard>

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        icon={Trash2}
        destructive
        title={t(`${K}.subscription.deleteTitle`)}
        description={toDelete ? t(`${K}.subscription.deleteDescription`, { name: name(toDelete) }) : undefined}
        confirmLabel={t(`${K}.actions.delete`)}
        onConfirm={() => {
          if (!toDelete) return;
          setDocuments((prev) => prev.filter((doc) => doc.id !== toDelete.id));
          toast.success(t(`${K}.toast.deleted`, { name: name(toDelete) }));
          setToDelete(null);
        }}
      />
    </>
  );
}

interface KycDocumentsViewProps {
  subscription: any;
  isCorporate: boolean;
  documents: MockKycDocument[];
  onChange: (documents: MockKycDocument[]) => void;
}

function KycDocumentsView({ subscription, isCorporate, documents, onChange }: KycDocumentsViewProps) {
  const { t, lang } = useTranslation();
  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [toReject, setToReject] = useState<MockKycDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const contrepartie = subscription?.contrepartie ?? {};
  const holderName = (doc: MockKycDocument) => {
    if (doc.holder === 'investor') return contrepartie.name;
    if (doc.holder === 'entity') return contrepartie.structure ?? contrepartie.name;
    if (doc.holder === 'legalRepresentative') return contrepartie.mainContact ?? t(`${K}.kyc.holders.legalRepresentative`);
    return t(`${K}.kyc.holders.beneficialOwners`);
  };
  const holderLabel = (doc: MockKycDocument) =>
    doc.holder === 'investor' || doc.holder === 'beneficialOwners'
      ? holderName(doc)
      : t(`${K}.kyc.holderWithRole`, { role: t(`${K}.kyc.holders.${doc.holder}`), name: holderName(doc) });

  const name = (doc: MockKycDocument) => t(doc.nameKey);
  const statusOf = kycDisplayStatus;
  const count = (status: KycDisplayStatus) => documents.filter((doc) => statusOf(doc) === status).length;
  const validated = count('validated');
  const toReview = count('toReview');
  const missingOrRejected = count('missing') + count('rejected');
  const expiringSoon = documents.filter((doc) => {
    const remaining = remainingDays(doc);
    return doc.file !== undefined && remaining !== undefined && remaining <= EXPIRY_WARNING_DAYS;
  }).length;
  const toRequest = documents.filter((doc) => ['missing', 'rejected', 'expired'].includes(statusOf(doc)));

  const vigilance = VIGILANCE_BY_RISK[contrepartie.riskLevel ?? subscription?.riskLevel] ?? VIGILANCE_BY_RISK.Medium;
  const lastReview = daysFromNow(-120);
  const nextReview = new Date(lastReview);
  nextReview.setFullYear(nextReview.getFullYear() + vigilance.reviewYears);
  const overall: keyof typeof KYC_OVERALL_VARIANT = toRequest.length > 0 ? 'incomplete' : toReview > 0 ? 'inReview' : 'complete';

  const setStatus = (doc: MockKycDocument, status: KycDocumentStatus, rejectionReason?: string) =>
    onChange(documents.map((item) => (item.id === doc.id ? { ...item, status, rejectionReason } : item)));

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const categories = selected(filters, 'category');
    const statuses = selected(filters, 'status');
    const filtered = documents.filter((doc) => {
      if (term && ![t(doc.nameKey), holderName(doc) ?? '', doc.file ?? ''].some((value) => value.toLowerCase().includes(term))) return false;
      if (categories.length > 0 && !categories.includes(doc.category)) return false;
      if (statuses.length > 0 && !statuses.includes(statusOf(doc))) return false;
      return true;
    });
    return sortRows(
      filtered,
      sortConfig,
      (doc, key) =>
        key === 'name'
          ? t(doc.nameKey)
          : key === 'category'
            ? t(`${K}.kyc.categories.${doc.category}`)
            : key === 'issuedAt'
              ? doc.issuedInDays
              : key === 'expiresAt'
                ? doc.expiresInDays
                : undefined,
      lang,
    );
    // holderName dépend de la souscription, stable pendant la vie de l'onglet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents, search, filters, sortConfig, lang, t]);

  const request = (doc: MockKycDocument) => toast.success(t(`${K}.toast.requested`, { name: name(doc) }));

  const actionsFor = (doc: MockKycDocument): TableRowAction[] => {
    const status = statusOf(doc);
    const preview: TableRowAction = {
      label: t(`${K}.actions.preview`),
      icon: Eye,
      disabledReason: doc.file ? undefined : t(`${K}.kyc.noFile`),
      onClick: () => toast.info(t(`${K}.toast.preview`, { name: name(doc) })),
    };
    const download: TableRowAction = {
      label: t(`${K}.actions.download`),
      icon: Download,
      disabledReason: doc.file ? undefined : t(`${K}.kyc.noFile`),
      onClick: () => toast.success(t(`${K}.toast.downloaded`, { name: name(doc) })),
    };
    const upload: TableRowAction = {
      label: doc.file ? t(`${K}.actions.replace`) : t(`${K}.actions.upload`),
      icon: Upload,
      onClick: () => toast.info(t(`${K}.toast.upload`, { name: name(doc) })),
    };
    const requestAction: TableRowAction = { label: t(`${K}.actions.requestInvestor`), icon: Send, onClick: () => request(doc) };

    if (status === 'toReview') {
      return [
        {
          label: t(`${K}.actions.validate`),
          icon: Check,
          intent: 'success',
          onClick: () => {
            setStatus(doc, 'validated');
            toast.success(t(`${K}.toast.validated`, { name: name(doc) }));
          },
        },
        {
          label: t(`${K}.actions.reject`),
          icon: X,
          intent: 'danger',
          onClick: () => {
            setRejectionReason('');
            setToReject(doc);
          },
        },
        preview,
        download,
        upload,
      ];
    }
    if (status === 'missing') return [upload, requestAction];
    if (status === 'rejected' || status === 'expired') return [preview, upload, requestAction, download];
    return [preview, download, upload];
  };

  const expiryCell = (doc: MockKycDocument) => {
    if (!doc.file) return <span className="text-sm text-muted-foreground">—</span>;
    const remaining = remainingDays(doc);
    if (remaining === undefined) {
      return <span className="text-sm text-muted-foreground whitespace-nowrap">{t(`${K}.kyc.noExpiry`)}</span>;
    }
    const date = formatDate(daysFromNow(remaining));
    if (remaining < 0) return <StatusBadge variant="danger" label={t(`${K}.kyc.expiredOn`, { date })} />;
    if (remaining <= EXPIRY_WARNING_DAYS) {
      return <StatusBadge variant="warning" label={date} tooltip={tc(`${K}.kyc.expiresInDays`, remaining)} />;
    }
    return (
      <span className="text-sm text-foreground whitespace-nowrap" title={doc.maxAgeDays ? tc(`${K}.kyc.maxAgeHint`, doc.maxAgeDays) : undefined}>
        {date}
      </span>
    );
  };

  const columns: ColumnConfig<MockKycDocument>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.document`),
      sortable: true,
      render: (doc, term) => <ListingNameCell name={name(doc)} searchTerm={term} secondary={holderLabel(doc)} />,
    },
    {
      key: 'status',
      label: t(`${K}.columns.status`),
      render: (doc) => {
        const status = statusOf(doc);
        const reason = doc.rejectionReason ?? (doc.rejectionReasonKey ? t(doc.rejectionReasonKey) : undefined);
        return (
          <StatusBadge
            variant={KYC_STATUS_VARIANT[status]}
            label={t(`${K}.kyc.statuses.${status}`)}
            tooltip={status === 'rejected' && reason ? t(`${K}.kyc.rejectedBecause`, { reason }) : undefined}
          />
        );
      },
    },
    {
      key: 'issuedAt',
      label: t(`${K}.columns.issuedAt`),
      sortable: true,
      render: (doc) =>
        doc.issuedInDays !== undefined ? (
          <span className="text-sm text-foreground whitespace-nowrap">{formatDate(daysFromNow(doc.issuedInDays))}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    { key: 'expiresAt', label: t(`${K}.columns.expiresAt`), sortable: true, render: expiryCell },
    {
      key: 'origin',
      label: t(`${K}.columns.origin`),
      render: (doc) => <span className="text-sm text-muted-foreground whitespace-nowrap">{t(`${K}.kyc.origins.${doc.origin}`)}</span>,
    },
    { key: 'actions', label: '', align: 'right', render: (doc) => <TableRowActions actions={actionsFor(doc)} /> },
  ];

  const filterConfigs: FilterConfig[] = [
    {
      id: 'category',
      label: t(`${K}.columns.category`),
      type: 'multiselect',
      isPrimary: true,
      options: KYC_CATEGORIES.filter((category) => documents.some((doc) => doc.category === category)).map((value) => ({
        value,
        label: t(`${K}.kyc.categories.${value}`),
      })),
    },
    {
      id: 'status',
      label: t(`${K}.columns.status`),
      type: 'multiselect',
      isPrimary: true,
      options: KYC_STATUSES.map((value) => ({ value, label: t(`${K}.kyc.statuses.${value}`) })),
    },
  ];

  const showStatuses = (statuses: KycDisplayStatus[]) => setFilters({ status: statuses });
  const requestDisabledReason = toRequest.length === 0 ? t(`${K}.kyc.nothingToRequest`) : undefined;

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <WidgetCard
          className="col-span-2"
          icon={ShieldCheck}
          title={t(`${K}.kyc.summary.title`)}
          subtitle={t(isCorporate ? `${K}.kyc.summary.subtitleCorporate` : `${K}.kyc.summary.subtitleIndividual`)}
          action={<StatusBadge variant={KYC_OVERALL_VARIANT[overall]} label={t(`${K}.kyc.overall.${overall}`)} />}
        >
          <div className="grid grid-cols-4 gap-4">
            <WidgetMetric
              label={t(`${K}.kyc.statuses.validated`)}
              value={t(`${K}.subscription.signersProgress`, { signed: validated, total: documents.length })}
              tone={validated === documents.length ? 'success' : undefined}
              onClick={() => showStatuses(['validated'])}
              ariaLabel={t(`${K}.filterOn`, { label: t(`${K}.kyc.statuses.validated`) })}
            />
            <WidgetMetric
              label={t(`${K}.kyc.statuses.toReview`)}
              value={toReview}
              tone={toReview > 0 ? 'info' : undefined}
              onClick={() => showStatuses(['toReview'])}
              ariaLabel={t(`${K}.filterOn`, { label: t(`${K}.kyc.statuses.toReview`) })}
            />
            <WidgetMetric
              label={t(`${K}.kyc.summary.missingOrRejected`)}
              value={missingOrRejected}
              tone={missingOrRejected > 0 ? 'warning' : undefined}
              onClick={() => showStatuses(['missing', 'rejected'])}
              ariaLabel={t(`${K}.filterOn`, { label: t(`${K}.kyc.summary.missingOrRejected`) })}
            />
            <WidgetMetric
              label={t(`${K}.kyc.summary.expiring`)}
              value={expiringSoon}
              tone={expiringSoon > 0 ? 'danger' : undefined}
              secondary={t(`${K}.kyc.summary.expiringHint`, { count: EXPIRY_WARNING_DAYS })}
            />
          </div>
        </WidgetCard>
        <WidgetCard icon={CalendarClock} title={t(`${K}.kyc.review.title`)} subtitle={t(`${K}.kyc.review.subtitle`)}>
          <div className="grid grid-cols-2 gap-4">
            <WidgetMetric
              label={t(`${K}.kyc.review.vigilance`)}
              value={t(`${K}.kyc.review.levels.${vigilance.key}`)}
              secondary={t(`${K}.kyc.review.lastReview`, { date: formatDate(lastReview) })}
            />
            <WidgetMetric
              label={t(`${K}.kyc.review.nextReview`)}
              value={formatDate(nextReview)}
              secondary={tc(`${K}.kyc.review.period`, vigilance.reviewYears)}
            />
          </div>
        </WidgetCard>
      </div>

      <ListingCard
        toolbar={
          <Toolbar
            actions={
              <>
                <DisabledReason reason={requestDisabledReason}>
                  <Button
                    variant="outline"
                    disabled={Boolean(requestDisabledReason)}
                    onClick={() => toast.success(tc(`${K}.toast.requestedMany`, toRequest.length))}
                  >
                    <Send className="w-4 h-4" />
                    {tc(`${K}.kyc.requestMissing`, toRequest.length)}
                  </Button>
                </DisabledReason>
                <Button onClick={() => toast.info(t(`${K}.toast.addDocument`))}>
                  <Plus className="w-4 h-4" />
                  {t(`${K}.addDocument`)}
                </Button>
              </>
            }
          >
            <FilterBar
              className="flex-1"
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t(`${K}.kyc.searchPlaceholder`)}
              filters={filterConfigs}
              activeFilters={filters}
              onFilterChange={updateFilters(setFilters)}
              onClearAll={() => setFilters({})}
            />
          </Toolbar>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            hasFilters={hasActiveFilters(filters)}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.kyc.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
            }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={(doc) => (doc.file ? toast.info(t(`${K}.toast.preview`, { name: name(doc) })) : request(doc))}
            sortConfig={sortConfig}
            onSort={(key) => setSortConfig((prev) => nextSort(prev, key))}
            compactMode
            hideSelection
            searchTerm={search}
          />
        )}
      </ListingCard>

      <ConfirmDialog
        open={toReject !== null}
        onOpenChange={(open) => !open && setToReject(null)}
        icon={X}
        destructive
        title={t(`${K}.kyc.rejectTitle`)}
        description={toReject ? t(`${K}.kyc.rejectDescription`, { name: name(toReject) }) : undefined}
        confirmLabel={t(`${K}.actions.reject`)}
        confirmDisabledReason={rejectionReason.trim() ? undefined : t(`${K}.kyc.rejectReasonRequired`)}
        onConfirm={() => {
          if (!toReject) return;
          setStatus(toReject, 'rejected', rejectionReason.trim());
          toast.success(t(`${K}.toast.rejected`, { name: name(toReject) }));
          setToReject(null);
        }}
      >
        <Textarea
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          placeholder={t(`${K}.kyc.rejectReasonPlaceholder`)}
          aria-label={t(`${K}.kyc.rejectReasonLabel`)}
          rows={3}
        />
      </ConfirmDialog>
    </>
  );
}
