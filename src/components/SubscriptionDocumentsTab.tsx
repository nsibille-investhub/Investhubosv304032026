import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarX,
  CheckCircle2,
  ClipboardCheck,
  List,
  PenLine,
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
  type LucideIcon,
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
import { FilterCard, FilterCardGroup } from './ui/filter-card';

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


const daysFromNow = (days: number) => new Date(Date.now() + days * DAY_MS);

/** Jours restants avant la fin de validité : date d'expiration, ou date d'émission + durée réglementaire. */
const remainingDays = (doc: MockKycDocument): number | undefined =>
  doc.expiresInDays ?? (doc.issuedInDays !== undefined && doc.maxAgeDays !== undefined ? doc.issuedInDays + doc.maxAgeDays : undefined);

const kycDisplayStatus = (doc: MockKycDocument): KycDisplayStatus => {
  if (doc.status !== 'validated') return doc.status;
  const remaining = remainingDays(doc);
  return remaining !== undefined && remaining < 0 ? 'expired' : 'validated';
};

type SubscriptionQueue = 'all' | 'awaitingSignature' | 'awaitingCounterSignature' | 'completed' | 'draft';
const inSubscriptionQueue = (doc: MockSubscriptionDocument, queue: SubscriptionQueue) => queue === 'all' || doc.status === queue;

type KycQueue = 'all' | 'toReview' | 'toRequest' | 'expiring' | 'validated';
const inKycQueue = (doc: MockKycDocument, queue: KycQueue) => {
  const status = kycDisplayStatus(doc);
  if (queue === 'all') return true;
  if (queue === 'toRequest') return status === 'missing' || status === 'rejected' || status === 'expired';
  if (queue === 'expiring') {
    const remaining = remainingDays(doc);
    return doc.file !== undefined && remaining !== undefined && remaining <= EXPIRY_WARNING_DAYS;
  }
  return status === queue;
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

  const [queue, setQueue] = useState<SubscriptionQueue>('all');

  const name = (doc: MockSubscriptionDocument) => t(doc.nameKey);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const categories = selected(filters, 'category');
    const statuses = selected(filters, 'status');
    const filtered = documents.filter((doc) => {
      if (!inSubscriptionQueue(doc, queue)) return false;
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
  }, [documents, queue, search, filters, sortConfig, lang, t]);

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

  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
  const queueCard = (id: SubscriptionQueue, icon: LucideIcon) => {
    const items = documents.filter((doc) => inSubscriptionQueue(doc, id));
    const signable = items.filter((doc) => doc.signers);
    const signed = signable.reduce((sum, doc) => sum + (doc.signers?.signed ?? 0), 0);
    const expected = signable.reduce((sum, doc) => sum + (doc.signers?.total ?? 0), 0);
    return (
      <FilterCard
        status={id}
        activeStatus={queue}
        onStatusChange={(status) => setQueue(status as SubscriptionQueue)}
        label={t(`${K}.subscription.queues.${id}`)}
        icon={icon}
        total={items.length}
        metricLabel={t(`${K}.subscription.queues.signaturesMetric`)}
        metricValue={t(`${K}.subscription.signersProgress`, { signed, total: expected })}
        averageValue={t(`${K}.subscription.queues.perDocument`, { count: number.format(items.length > 0 ? expected / items.length : 0) })}
      />
    );
  };

  return (
    <>
      <FilterCardGroup
        title={t('subscriptions.detail.queues.title')}
        hint={t('subscriptions.detail.queues.hint')}
        columns={5}
      >
        {queueCard('all', List)}
        {queueCard('awaitingSignature', PenLine)}
        {queueCard('awaitingCounterSignature', FileSignature)}
        {queueCard('completed', CheckCircle2)}
        {queueCard('draft', FileText)}
      </FilterCardGroup>

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
            hasFilters={hasActiveFilters(filters) || queue !== 'all'}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
              setQueue('all');
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
  const [queue, setQueue] = useState<KycQueue>('all');

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
  const toRequest = documents.filter((doc) => ['missing', 'rejected', 'expired'].includes(statusOf(doc)));


  const setStatus = (doc: MockKycDocument, status: KycDocumentStatus, rejectionReason?: string) =>
    onChange(documents.map((item) => (item.id === doc.id ? { ...item, status, rejectionReason } : item)));

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const categories = selected(filters, 'category');
    const statuses = selected(filters, 'status');
    const filtered = documents.filter((doc) => {
      if (!inKycQueue(doc, queue)) return false;
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
  }, [documents, queue, search, filters, sortConfig, lang, t]);

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

  const requestDisabledReason = toRequest.length === 0 ? t(`${K}.kyc.nothingToRequest`) : undefined;
  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
  const queueCard = (id: KycQueue, icon: LucideIcon) => {
    const items = documents.filter((doc) => inKycQueue(doc, id));
    const holders = new Set(items.map((doc) => doc.holder)).size;
    return (
      <FilterCard
        status={id}
        activeStatus={queue}
        onStatusChange={(status) => setQueue(status as KycQueue)}
        label={id === 'expiring' ? t(`${K}.kyc.queues.expiring`, { count: EXPIRY_WARNING_DAYS }) : t(`${K}.kyc.queues.${id}`)}
        icon={icon}
        total={items.length}
        metricLabel={t(`${K}.kyc.queues.holdersMetric`)}
        metricValue={String(holders)}
        averageValue={t(`${K}.kyc.queues.perHolder`, { count: number.format(holders > 0 ? items.length / holders : 0) })}
      />
    );
  };

  return (
    <>
      <FilterCardGroup
        title={t('subscriptions.detail.queues.title')}
        hint={t('subscriptions.detail.queues.hint')}
        columns={5}
      >
        {queueCard('all', List)}
        {queueCard('toReview', ClipboardCheck)}
        {queueCard('toRequest', AlertTriangle)}
        {queueCard('expiring', CalendarX)}
        {queueCard('validated', CheckCircle2)}
      </FilterCardGroup>

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
            hasFilters={hasActiveFilters(filters) || queue !== 'all'}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.kyc.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
              setQueue('all');
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
