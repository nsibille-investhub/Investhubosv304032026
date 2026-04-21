import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  MoreVertical, 
  Copy, 
  Check, 
  History, 
  X,
  AlertTriangle,
  Eye,
  Trash2
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
import { AuditLogDialog } from './AuditLogDialog';
import { HighlightText } from './HighlightText';
import { getColumnsForStatus, getGlobalStatusKey, SubscriptionWorkflowStatus } from '../utils/subscriptionColumns';
import { formatCurrency, formatDate, formatNumber } from '../utils/formatters';
import { copyToClipboard } from '../utils/clipboard';
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

// Raw status → variant used for the global status badge
const getGlobalStatusVariantFromRaw = (raw: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (['Active', 'Exécuté'].includes(raw)) return 'success';
  if (['Onboarding', 'À signer', 'Investisseur signé', 'En attente de fonds', 'En attente de paiement'].includes(raw)) return 'warning';
  if (['Rejected', 'Cancelled', 'Expired', 'Archived'].includes(raw)) return 'danger';
  return 'neutral';
};

// Raw onboarding label → variant
const getOnboardingStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
  if (status === 'Complété') return 'success';
  if (status === 'Bloqué') return 'danger';
  if (['En cours avancé', 'En cours', 'Démarré'].includes(status)) return 'warning';
  return 'neutral';
};

// Raw counter-signature label → variant
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
  allFilteredData
}: SubscriptionDynamicTableProps) {
  const { t } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedSubscriptionForAudit, setSelectedSubscriptionForAudit] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  const totalFilteredData = allFilteredData || data;
  
  // Obtenir les colonnes pour le statut actif
  const columns = getColumnsForStatus(activeStatus);

  useEffect(() => {
    const allIds = totalFilteredData.map(item => item.id);
    const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectAll(isAllSelected);
  }, [selectedIds, totalFilteredData]);

  const handleViewAudit = (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubscriptionForAudit(row);
    setAuditDialogOpen(true);
  };

  const handleCopyId = async (id: string, subscriptionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(id);
    if (success) {
      setCopiedId(subscriptionId);
      toast.success(t('subscriptions.table.idCopied'), { description: id });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error(t('subscriptions.table.copyError'), { description: t('subscriptions.table.copyErrorDesc') });
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      toast.info(t('subscriptions.table.selectionCancelled'), {
        description: t('subscriptions.table.selectionCancelledDesc'),
      });
    } else {
      const allIds = new Set(totalFilteredData.map(item => item.id));
      setSelectedIds(allIds);
      toast.success(t('subscriptions.table.selectedCount', { count: allIds.size }), {
        description: t('subscriptions.table.selectedCountDesc', { count: allIds.size }),
        duration: 4000,
      });
    }
  };

  const handleSelectRow = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    toast.info(t('subscriptions.table.selectionCancelled'));
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-gray-900 dark:text-gray-100" />
      : <ArrowDown className="w-3.5 h-3.5 text-gray-900 dark:text-gray-100" />;
  };

  const SortableHeader = ({ label, sortKey, align = 'left' }: { label: string; sortKey: string; align?: 'left' | 'center' | 'right' }) => (
    <motion.th 
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      onClick={() => onSort(sortKey)}
      className={cn(
        "px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer group",
        align === 'center' && "text-center",
        align === 'right' && "text-right",
        align === 'left' && "text-left"
      )}
    >
      <div className={cn(
        "flex items-center gap-2",
        align === 'center' && "justify-center",
        align === 'right' && "justify-end"
      )}>
        {label}
        <SortIcon columnKey={sortKey} />
      </div>
    </motion.th>
  );

  const NonSortableHeader = ({ label, align = 'left' }: { label: string; align?: 'left' | 'center' | 'right' }) => (
    <th className={cn(
      "px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider",
      align === 'center' && "text-center",
      align === 'right' && "text-right",
      align === 'left' && "text-left"
    )}>
      {label}
    </th>
  );

  // Fonction pour rendre le contenu d'une cellule selon l'ID de colonne
  const renderCell = (row: any, columnId: string) => {
    switch (columnId) {
      case 'name':
        return (
          <SubscriptionNameCell 
            name={row.name}
            id={row.id}
            searchTerm={searchTerm}
          />
        );

      case 'investor':
        return (
          <div className="flex flex-col gap-1 max-w-[300px]">
            <motion.span
              whileHover={{ x: 2 }}
              title={row.contrepartie.name}
              className="text-sm font-medium cursor-pointer transition-all truncate"
            >
              <ClickableText>
                <HighlightText 
                  text={row.contrepartie.name} 
                  searchTerm={searchTerm}
                />
              </ClickableText>
            </motion.span>
            <OriginStructureCell
              contrepartie={row.contrepartie}
              searchTerm={searchTerm}
              onStructureClick={(structureName) => {
                toast.info(t('subscriptions.table.navigateToStructure'), {
                  description: t('subscriptions.table.navigateToStructureDesc', { name: structureName }),
                });
                // TODO: Implémenter la navigation vers la structure
              }}
            />
          </div>
        );

      case 'amount':
        return (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            <HighlightText 
              text={formatCurrency(row.amount)} 
              searchTerm={searchTerm}
            />
          </span>
        );

      case 'quantity':
        return (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatNumber(row.quantity, 0)}
          </span>
        );

      case 'fund':
        return (
          <Tag
            className="cursor-pointer transition-all hover:bg-primary/10 hover:text-primary hover:border-primary/40"
            label={row.fund.name}
          />
        );

      case 'compartment':
        return (
          <Tag label={row.fund.shareClass || '—'} />
        );

      case 'fundShare':
        return (
          <FundShareCell 
            fundName={row.fund.name}
            shareClass={row.fund.shareClass}
            searchTerm={searchTerm}
          />
        );

      case 'statut':
        return (
          <SubscriptionStatusBadge status={row.status} />
        );

      case 'signatures':
        return (
          <SignatureProgressCell 
            completed={row.signatures.completed}
            required={row.signatures.required}
          />
        );

      case 'partner':
        return (
          <PartnerCard 
            partenaire={row.partenaire}
            searchTerm={searchTerm}
            onPartnerClick={(partnerId, partnerName) => {
              toast.info(t('subscriptions.table.navigateToPartner'), {
                description: t('subscriptions.table.navigateToPartnerDesc', { name: partnerName }),
              });
              // TODO: Implémenter la navigation vers le partenaire
            }}
          />
        );

      case 'createdAt':
        return <DateTimeCell date={row.createdAt} />;

      case 'source':
        return (
          <Tag label={row.source === 'api' ? t('subscriptions.table.api') : row.source.charAt(0).toUpperCase() + row.source.slice(1)} />
        );

      case 'analyst':
        return (
          <InternalResponsibleSelector
            value={row.analyst}
            onChange={(nextAnalyst) => onAnalystChange?.(row.id, nextAnalyst)}
            className="max-w-[280px]"
          />
        );

      case 'onboardingStatus': {
        const raw = row.onboardingStatus || 'Non démarré';
        const key = ONBOARDING_KEY_BY_RAW[raw];
        return <StatusBadge label={key ? t(key) : raw} variant={getOnboardingStatusVariant(raw)} />;
      }

      case 'blockageReason':
        return row.blockageReason ? (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="truncate max-w-[180px]" title={row.blockageReason}>{row.blockageReason}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'completionRate':
        const completion = row.completionOnboarding || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[80px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completion}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  "h-full transition-all",
                  completion === 100 ? "bg-green-500" :
                  completion >= 75 ? "bg-blue-500" :
                  completion >= 50 ? "bg-yellow-500" :
                  completion >= 25 ? "bg-orange-500" : "bg-red-500"
                )}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[35px]">{completion}%</span>
          </div>
        );

      case 'lastAction':
        return <DateTimeCell date={row.lastActionDate || row.updatedAt} />;

      case 'signatureStatus':
        return (
          <Badge className="bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
            {row.signatureStatus || t('subscriptions.table.notSent')}
          </Badge>
        );

      case 'missingSigners':
        const missing = row.missingSigners || 0;
        return (
          <div className={cn(
            "text-sm font-medium text-center px-2 py-1 rounded",
            missing > 0 
              ? "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300"
              : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300"
          )}>
            {missing}
          </div>
        );

      case 'sentAt':
        return row.sentToSignatureAt ? (
          <DateTimeCell date={row.sentToSignatureAt} />
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'lastReminder':
        return row.lastReminderAt ? (
          <DateTimeCell date={row.lastReminderAt} />
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'signatureChannel':
        return (
          <Tag label={row.signatureChannel === 'e-signature' ? t('subscriptions.table.eSignature') : t('subscriptions.table.paper')} />
        );

      case 'counterSignatureStatus': {
        const raw = row.counterSignatureStatus || 'Non requis';
        const key = COUNTER_SIGNATURE_KEY_BY_RAW[raw];
        return <StatusBadge label={key ? t(key) : (raw === 'Non requis' ? t('subscriptions.table.notRequired') : raw)} variant={getCounterSignatureVariant(raw)} />;
      }

      case 'counterSignatureOwner':
        return <span className="text-sm text-gray-700 dark:text-gray-300">{row.counterSignatureOwner || '-'}</span>;

      case 'investorSignedAt':
        return row.investorSignedAt ? (
          <DateTimeCell date={row.investorSignedAt} />
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'daysSinceSignature':
        return row.daysSinceSignature !== null ? (
          <div className={cn(
            "text-sm font-medium text-center px-2 py-1 rounded",
            row.daysSinceSignature > 7 ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300" :
            row.daysSinceSignature > 3 ? "bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300" :
            "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300"
          )}>
            {row.daysSinceSignature}{t('subscriptions.table.daysShort')}
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'calledAmount':
        return (
          <CalledAmountCell 
            calledAmount={row.calledAmount || 0}
            pendingCallAmount={row.pendingCallAmount || 0}
            remainingAmount={row.remainingAmount || row.amount}
            totalAmount={row.amount}
          />
        );

      case 'remainingAmount':
        return <span className="text-sm font-medium text-foreground">{formatCurrency(row.remainingAmount || row.amount)}</span>;

      case 'distributedAmount':
        return <span className="text-sm font-medium text-foreground">{formatCurrency(row.distributedAmount || 0)}</span>;

      case 'depositary':
        return (
          <div className="flex justify-center">
            <CheckIndicator
              checked={Boolean(row.hasDepositary)}
              checkedLabel={t('subscriptions.table.depositaryPresent')}
              uncheckedLabel={t('subscriptions.table.noDepositary')}
            />
          </div>
        );

      case 'activatedAt':
        return row.activatedAt ? (
          <DateTimeCell date={row.activatedAt} />
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'globalStatus':
        return <StatusBadge label={t(getGlobalStatusKey(row.status))} variant={getGlobalStatusVariantFromRaw(row.status)} />;

      case 'updatedAt':
        return <DateTimeCell date={row.updatedAt} />;

      case 'notes':
        return row.notes ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[180px] cursor-help">
                {row.notes}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{row.notes}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'entryFees':
        return row.entryFees ? (
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.entryFees}%</span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'entryFeesAmount':
        const entryFeesAmount = row.entryFees && row.amount ? (row.amount * row.entryFees) / 100 : 0;
        return entryFeesAmount > 0 ? (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(entryFeesAmount)}
          </span>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'language':
        const languageFlags: Record<string, string> = {
          'fr': '🇫🇷',
          'en': '🇬🇧',
          'de': '🇩🇪',
          'it': '🇮🇹',
          'es': '🇪🇸'
        };
        return row.language ? (
          <div className="flex items-center gap-2 text-sm">
            <span>{languageFlags[row.language]}</span>
            <span className="text-gray-700 dark:text-gray-300">{t(`subscriptions.language.${row.language}`)}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
        );

      case 'sepaEnabled':
        return (
          <div className="flex justify-center">
            <CheckIndicator
              checked={Boolean(row.sepaEnabled)}
              checkedLabel={t('subscriptions.table.sepaEnabledLabel')}
              uncheckedLabel={t('subscriptions.table.sepaDisabledLabel')}
            />
          </div>
        );

      case 'pendingCalls':
        return row.pendingCalls ? (
          <div className="flex justify-center">
            <Badge className="bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
              {t('subscriptions.table.yes')}
            </Badge>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="text-sm text-gray-400 dark:text-gray-600">-</span>
          </div>
        );

      case 'onboardingReopened':
        return row.onboardingReopened > 0 ? (
          <div className="flex justify-center">
            <Badge className={cn(
              row.onboardingReopened > 2 
                ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                : "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
            )}>
              {row.onboardingReopened}
            </Badge>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="text-sm text-gray-400 dark:text-gray-600">0</span>
          </div>
        );

      default:
        return <span className="text-sm text-gray-500 dark:text-gray-500">-</span>;
    }
  };

  return (
    <>
      {/* Selection info banner */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-muted/50 border-b border-border overflow-hidden"
          >
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-primary-foreground px-3 py-1 shadow-sm">
                  {selectedIds.size} {selectedIds.size === 1 ? t('subscriptions.table.selectionOne') : t('subscriptions.table.selectionMany')}
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">
                  {selectedIds.size === totalFilteredData.length
                    ? t('subscriptions.table.allPagesSelected')
                    : t('subscriptions.table.partialSelection')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4 mr-1" />
                  {t('subscriptions.table.cancelSelection')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40 backdrop-blur-sm">
              <th className="px-6 py-4 text-left sticky left-0 z-20 bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input 
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer hover:scale-110"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectAll
                      ? t('subscriptions.table.deselectAllTooltip', { count: totalFilteredData.length })
                      : t('subscriptions.table.selectAllTooltip', { count: totalFilteredData.length })}
                  </TooltipContent>
                </Tooltip>
              </th>
              {columns.map((column) => (
                column.sortable ? (
                  <SortableHeader
                    key={column.id}
                    label={t(column.label)}
                    sortKey={column.id}
                    align={column.align}
                  />
                ) : (
                  <NonSortableHeader
                    key={column.id}
                    label={t(column.label)}
                    align={column.align}
                  />
                )
              ))}
              <th className="px-6 py-4 sticky right-0 z-20 bg-muted/40"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  onHoverStart={() => setHoveredRow(row.id)}
                  onHoverEnd={() => setHoveredRow(null)}
                  onClick={() => onRowClick(row)}
                  className={cn(
                    "border-b border-border/70 transition-all duration-200 cursor-pointer",
                    hoveredRow === row.id 
                      ? "bg-muted/70" 
                      : "hover:bg-muted/50"
                  )}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4 sticky left-0 z-10 bg-white">
                    <motion.input
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer"
                    />
                  </td>

                  {/* Dynamic columns */}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "px-6 py-4",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                    >
                      {renderCell(row, column.id)}
                    </td>
                  ))}

                  {/* Actions menu */}
                  <td className="px-6 py-4 sticky right-0 z-10 bg-white">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          onRowClick(row);
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Voir le détail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          toast.success('Souscription dupliquée', {
                            description: `Une copie de ${row.name} a été créée`
                          });
                        }}>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Dupliquer</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.error('Souscription supprimée', {
                              description: `${row.name} a été supprimée`
                            });
                          }}
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Supprimer</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Audit Dialog */}
      <AuditLogDialog
        open={auditDialogOpen}
        onOpenChange={setAuditDialogOpen}
        entity={selectedSubscriptionForAudit}
        entityType="subscription"
      />
    </>
  );
}
