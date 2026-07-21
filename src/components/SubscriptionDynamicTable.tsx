import { useState } from 'react';
import {
  AlertTriangle,
  Copy,
  Eye,
  MoreVertical,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { cn } from './ui/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { DataTable, ColumnConfig } from './DataTable';
import { AuditLogDialog } from './AuditLogDialog';
import { HighlightText } from './HighlightText';
import { getColumnsForStatus, getGlobalStatusKey, SubscriptionWorkflowStatus } from '../utils/subscriptionColumns';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { useTranslation } from '../utils/languageContext';
import { OriginStructureCell } from './OriginStructureCell';
import { PartnerCard } from './PartnerCard';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { FundShareCell } from './FundShareCell';
import { SignatureProgressCell } from './SignatureProgressCell';
import { SubscriptionNameCell } from './SubscriptionNameCell';
import { DateTimeCell } from './DateTimeCell';
import { CalledAmountCell } from './CalledAmountCell';
import { ClickableText } from './ClickableText';
import { Tag } from './Tag';
import { CheckIndicator } from './CheckIndicator';
import { StatusBadge } from './StatusBadge';
import { InternalResponsibleSelector } from './InternalResponsibleSelector';
import { LanguageFlagInline } from './LanguageFlagInline';
import { DocumentStatusCounter } from './DocumentStatusCounter';

const getGlobalStatusVariantFromRaw = (raw: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (['Active', 'Exécuté'].includes(raw)) return 'success';
  if (['Onboarding', 'À signer', 'Investisseur signé', 'En attente de fonds', 'En attente de paiement'].includes(raw)) return 'warning';
  if (['Rejected', 'Cancelled', 'Expired', 'Archived'].includes(raw)) return 'danger';
  return 'neutral';
};

const getOnboardingStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'Complété') return 'success';
  if (status === 'Bloqué') return 'danger';
  if (['En cours avancé', 'En cours', 'Démarré'].includes(status)) return 'warning';
  return 'neutral';
};

const getCounterSignatureVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'Complétée') return 'success';
  if (status === 'Refusée') return 'danger';
  if (['En cours', 'En attente'].includes(status)) return 'warning';
  return 'neutral';
};

const ONBOARDING_KEY_BY_RAW: Record<string, string> = {
  'Complété': 'subscriptions.onboardingStatus.completed',
  'Bloqué': 'subscriptions.onboardingStatus.blocked',
  'En cours avancé': 'subscriptions.onboardingStatus.advanced',
  'En cours': 'subscriptions.onboardingStatus.inProgress',
  'Démarré': 'subscriptions.onboardingStatus.started',
  'Non démarré': 'subscriptions.onboardingStatus.notStarted',
};

const COUNTER_SIGNATURE_KEY_BY_RAW: Record<string, string> = {
  'Complétée': 'subscriptions.counterSignatureStatus.completed',
  'Refusée': 'subscriptions.counterSignatureStatus.rejected',
  'En cours': 'subscriptions.counterSignatureStatus.inProgress',
  'En attente': 'subscriptions.counterSignatureStatus.pending',
};

interface SubscriptionDynamicTableProps {
  data: any[];
  activeStatus: SubscriptionWorkflowStatus;
  onRowClick: (row: any) => void;
  onAnalystChange?: (subscriptionId: number, newAnalyst: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  searchTerm?: string;
  allFilteredData?: any[];
}

export function SubscriptionDynamicTable({
  data,
  activeStatus = 'all',
  onRowClick,
  onAnalystChange,
  sortConfig,
  onSort,
  searchTerm = '',
  allFilteredData,
}: SubscriptionDynamicTableProps) {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedSubscriptionForAudit, setSelectedSubscriptionForAudit] = useState<any>(null);

  const statusColumns = getColumnsForStatus(activeStatus);

  const CELL_RENDERERS: Record<string, (row: any, search: string) => React.ReactNode> = {
    name: (row, search) => (
      <div className="flex items-start gap-2">
        {row.language && (
          <span className="mt-0.5 shrink-0">
            <LanguageFlagInline language={row.language} />
          </span>
        )}
        <SubscriptionNameCell name={row.name} id={row.id} searchTerm={search} />
      </div>
    ),

    investor: (row, search) => (
      <div className="flex flex-col gap-1 max-w-[300px]">
        <span title={row.contrepartie.name} className="text-sm font-medium truncate">
          <ClickableText>
            <HighlightText text={row.contrepartie.name} searchTerm={search} />
          </ClickableText>
        </span>
        <OriginStructureCell
          contrepartie={row.contrepartie}
          searchTerm={search}
          onStructureClick={(structureName) => {
            toast.info(t('subscriptions.table.navigateToStructure'), {
              description: t('subscriptions.table.navigateToStructureDesc', { name: structureName }),
            });
          }}
        />
        {row.coInvestors?.map((coInv: { name: string; id: string }) => (
          <div key={coInv.id} className="flex items-center gap-1.5 max-w-[180px]">
            <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-500 truncate" title={coInv.name}>{coInv.name}</span>
          </div>
        ))}
      </div>
    ),

    amount: (row, search) => (
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        <HighlightText text={formatCurrency(row.amount)} searchTerm={search} />
      </span>
    ),

    quantity: (row) => (
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {formatNumber(row.quantity, 0)}
      </span>
    ),

    fund: (row) => (
      <Tag className="cursor-pointer transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/40" label={row.fund.name} />
    ),

    compartment: (row) => <Tag label={row.fund.shareClass || '—'} />,

    fundShare: (row, search) => (
      <FundShareCell fundName={row.fund.name} shareClass={row.fund.shareClass} searchTerm={search} />
    ),

    statut: (row) => <SubscriptionStatusBadge status={row.status} />,

    signatures: (row) => (
      <SignatureProgressCell completed={row.signatures.completed} required={row.signatures.required} />
    ),

    partner: (row, search) => (
      <PartnerCard
        partenaire={row.partenaire}
        searchTerm={search}
        onPartnerClick={(_id, name) => {
          toast.info(t('subscriptions.table.navigateToPartner'), {
            description: t('subscriptions.table.navigateToPartnerDesc', { name }),
          });
        }}
      />
    ),

    createdAt: (row) => <DateTimeCell date={row.createdAt} />,

    source: (row) => (
      <Tag label={row.source === 'api' ? t('subscriptions.table.api') : row.source.charAt(0).toUpperCase() + row.source.slice(1)} />
    ),

    analyst: (row) => (
      <InternalResponsibleSelector
        value={row.analyst}
        onChange={(next) => onAnalystChange?.(row.id, next)}
        className="max-w-[280px]"
      />
    ),

    onboardingStatus: (row) => {
      const raw = row.onboardingStatus || 'Non démarré';
      const key = ONBOARDING_KEY_BY_RAW[raw];
      return <StatusBadge label={key ? t(key) : raw} variant={getOnboardingStatusVariant(raw)} />;
    },

    blockageReason: (row) =>
      row.blockageReason ? (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertTriangle className="w-4 h-4" />
          <span className="truncate max-w-[180px]" title={row.blockageReason}>{row.blockageReason}</span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      ),

    completionRate: (row) => {
      const completion = row.completionOnboarding || 0;
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[80px]">
            <div
              className={cn(
                'h-full transition-all',
                completion === 100 ? 'bg-green-500' :
                completion >= 75 ? 'bg-blue-500' :
                completion >= 50 ? 'bg-yellow-500' :
                completion >= 25 ? 'bg-orange-500' : 'bg-red-500',
              )}
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[35px]">{completion}%</span>
        </div>
      );
    },

    lastAction: (row) => <DateTimeCell date={row.lastActionDate || row.updatedAt} />,

    sentAt: (row) =>
      row.sentToSignatureAt ? <DateTimeCell date={row.sentToSignatureAt} /> : <span className="text-sm text-gray-400">-</span>,

    lastReminder: (row) =>
      row.lastReminderAt ? <DateTimeCell date={row.lastReminderAt} /> : <span className="text-sm text-gray-400">-</span>,

    signatureChannel: (row) => (
      <Tag label={row.signatureChannel === 'e-signature' ? t('subscriptions.table.eSignature') : t('subscriptions.table.paper')} />
    ),

    counterSignatureStatus: (row) => {
      const raw = row.counterSignatureStatus || 'Non requis';
      const key = COUNTER_SIGNATURE_KEY_BY_RAW[raw];
      return <StatusBadge label={key ? t(key) : (raw === 'Non requis' ? t('subscriptions.table.notRequired') : raw)} variant={getCounterSignatureVariant(raw)} />;
    },

    counterSignatureOwner: (row) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{row.counterSignatureOwner || '-'}</span>
    ),

    investorSignedAt: (row) =>
      row.investorSignedAt ? <DateTimeCell date={row.investorSignedAt} /> : <span className="text-sm text-gray-400">-</span>,

    daysSinceSignature: (row) =>
      row.daysSinceSignature !== null ? (
        <div className={cn(
          'text-sm font-medium text-center px-2 py-1 rounded',
          row.daysSinceSignature > 7 ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300' :
          row.daysSinceSignature > 3 ? 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300' :
          'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300',
        )}>
          {row.daysSinceSignature}{t('subscriptions.table.daysShort')}
        </div>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      ),

    calledAmount: (row) => (
      <CalledAmountCell
        calledAmount={row.calledAmount || 0}
        pendingCallAmount={row.pendingCallAmount || 0}
        remainingAmount={row.remainingAmount || row.amount}
        totalAmount={row.amount}
      />
    ),

    remainingAmount: (row) => <span className="text-sm font-medium text-foreground">{formatCurrency(row.remainingAmount || row.amount)}</span>,

    distributedAmount: (row) => <span className="text-sm font-medium text-foreground">{formatCurrency(row.distributedAmount || 0)}</span>,

    depositary: (row) => (
      <div className="flex justify-center">
        <CheckIndicator checked={Boolean(row.hasDepositary)} checkedLabel={t('subscriptions.table.depositaryPresent')} uncheckedLabel={t('subscriptions.table.noDepositary')} />
      </div>
    ),

    activatedAt: (row) =>
      row.activatedAt ? <DateTimeCell date={row.activatedAt} /> : <span className="text-sm text-gray-400">-</span>,

    globalStatus: (row) => <StatusBadge label={t(getGlobalStatusKey(row.status))} variant={getGlobalStatusVariantFromRaw(row.status)} />,

    updatedAt: (row) => <DateTimeCell date={row.updatedAt} />,

    notes: (row) =>
      row.notes ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px] cursor-help">{row.notes}</div>
          </TooltipTrigger>
          <TooltipContent><p className="max-w-xs">{row.notes}</p></TooltipContent>
        </Tooltip>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      ),

    entryFeesComposite: (row) => {
      const feesAmount = row.entryFees && row.amount ? (row.amount * row.entryFees) / 100 : 0;
      return (
        <div className="flex flex-col">
          <ClickableText variant="notClickable" className="text-sm font-semibold">{formatCurrency(feesAmount)}</ClickableText>
          <ClickableText variant="notClickable" className="text-xs text-muted-foreground">{(row.entryFees ?? 0)}%</ClickableText>
        </div>
      );
    },

    documents: (row) => {
      const docs = row.documents;
      if (!docs) return <span className="text-sm text-gray-400">-</span>;
      return <DocumentStatusCounter total={docs.total} validated={docs.validated} pending={docs.pending} rejected={docs.rejected} />;
    },

    subscriptionPremium: (row) =>
      row.subscriptionPremium ? (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(row.subscriptionPremium)}</span>
      ) : (
        <span className="text-sm text-gray-400"></span>
      ),

    language: (row) => {
      const flags: Record<string, string> = { fr: '🇫🇷', en: '🇬🇧', de: '🇩🇪', it: '🇮🇹', es: '🇪🇸' };
      return row.language ? (
        <div className="flex items-center gap-2 text-sm">
          <span>{flags[row.language]}</span>
          <span className="text-gray-700 dark:text-gray-300">{t(`subscriptions.language.${row.language}`)}</span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">-</span>
      );
    },

    sepaEnabled: (row) => (
      <div className="flex justify-center">
        <CheckIndicator checked={Boolean(row.sepaEnabled)} checkedLabel={t('subscriptions.table.sepaEnabledLabel')} uncheckedLabel={t('subscriptions.table.sepaDisabledLabel')} />
      </div>
    ),

    pendingCalls: (row) => {
      const count = row.pendingCalls ?? 0;
      return count > 0 ? (
        <div className="flex justify-center">
          <Badge className={cn(count > 2 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-orange-100 text-orange-700 border-orange-200')}>
            {count}
          </Badge>
        </div>
      ) : (
        <div className="flex justify-center"><span className="text-sm text-gray-500">0</span></div>
      );
    },

    onboardingReopened: (row) =>
      row.onboardingReopened > 0 ? (
        <div className="flex justify-center">
          <Badge className={cn(row.onboardingReopened > 2 ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}>
            {row.onboardingReopened}
          </Badge>
        </div>
      ) : (
        <div className="flex justify-center"><span className="text-sm text-gray-400">0</span></div>
      ),
  };

  const ALIGN_CLASS: Record<string, string> = {
    center: 'text-center',
    right: 'text-right',
  };

  const columns: ColumnConfig<any>[] = [
    ...statusColumns.map((col) => ({
      key: col.id,
      label: t(col.label),
      sortable: col.sortable,
      className: ALIGN_CLASS[col.align || ''] || undefined,
      render: (row: any, search: string) => {
        const renderer = CELL_RENDERERS[col.id];
        return renderer ? renderer(row, search) : <span className="text-sm text-gray-500">-</span>;
      },
    })),
    {
      key: '_actions',
      label: '',
      sortable: false,
      render: (row: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRowClick(row); }}>
              <Eye className="mr-2 h-4 w-4" />
              <span>{t('subscriptions.table.viewDetail')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              toast.success(t('subscriptions.table.duplicated'), { description: row.name });
            }}>
              <Copy className="mr-2 h-4 w-4" />
              <span>{t('subscriptions.table.duplicate')}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                toast.error(t('subscriptions.table.deleted'), { description: row.name });
              }}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>{t('subscriptions.table.delete')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        hoveredRow={hoveredRow}
        setHoveredRow={setHoveredRow}
        onRowClick={onRowClick}
        sortConfig={sortConfig}
        onSort={onSort}
        searchTerm={searchTerm}
        allFilteredData={allFilteredData}
        entityName={t('subscriptions.table.selectionOne')}
      />

      <AuditLogDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        entity={selectedSubscriptionForAudit}
        entityType="subscription"
      />
    </>
  );
}
