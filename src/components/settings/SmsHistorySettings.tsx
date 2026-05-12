import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr as frLocale, enUS as enLocale } from 'date-fns/locale';
import {
  MessageSquare,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  ShieldAlert,
  Copy,
  X,
  Inbox,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation, type Language } from '../../utils/languageContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FilterCard } from '../ui/filter-card';
import { PageHeader } from '../ui/page-header';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../ui/utils';
import { FilterBar, type FilterConfig } from '../FilterBar';
import { DataTable, type ColumnConfig } from '../DataTable';

type SmsStatus = 'delivered' | 'sent' | 'pending' | 'failed';
type StatusTab = SmsStatus | 'all';
type PeriodPreset = 'all' | 'today' | '7d' | '30d' | '90d';
type SmsTriggerKey =
  | 'loginCode'
  | 'otp'
  | 'documentValidation'
  | 'subscriptionReminder'
  | 'signatureReminder';

interface SmsLog {
  id: number;
  sentAt: string; // ISO
  recipient: string; // 33XXXXXXXXX
  sender: string;
  message: string;
  status: SmsStatus;
  trigger: SmsTriggerKey;
  providerResponse: string;
}

const PHONE_GROUP = /(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/;

const STATUS_BADGE_STYLES: Record<SmsStatus, string> = {
  delivered:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
  sent: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
  pending:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
  failed:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
};

const STATUS_ICON: Record<SmsStatus, React.ComponentType<{ className?: string }>> = {
  delivered: CheckCircle2,
  sent: Send,
  pending: Clock,
  failed: XCircle,
};

const STATUS_TAB_ICON: Record<StatusTab, React.ComponentType<{ className?: string }>> = {
  all: List,
  delivered: CheckCircle2,
  sent: Send,
  pending: Clock,
  failed: XCircle,
};

const STATUS_TAB_ICON_CLASS: Record<StatusTab, string | undefined> = {
  all: undefined,
  delivered: 'text-emerald-600',
  sent: 'text-blue-600',
  pending: 'text-amber-600',
  failed: 'text-rose-600',
};

const PERIOD_OPTIONS: PeriodPreset[] = ['all', 'today', '7d', '30d', '90d'];

function buildMockSms(): SmsLog[] {
  const now = new Date();
  const items: Array<Omit<SmsLog, 'id' | 'sentAt'> & { offsetMinutes: number }> = [
    {
      offsetMinutes: 15,
      recipient: '33612345678',
      sender: 'InvestHub',
      message: 'Votre code de connexion InvestHub : 482914 — valide 5 minutes.',
      status: 'delivered',
      trigger: 'loginCode',
      providerResponse: 'DELIVRD · operator=Orange FR',
    },
    {
      offsetMinutes: 47,
      recipient: '33687654321',
      sender: 'IH-OTP',
      message: 'Code de validation document : 730155. Ne le partagez avec personne.',
      status: 'delivered',
      trigger: 'otp',
      providerResponse: 'DELIVRD · operator=SFR',
    },
    {
      offsetMinutes: 92,
      recipient: '33698765432',
      sender: 'InvestHub',
      message: 'Rappel : votre dossier de souscription requiert une signature.',
      status: 'sent',
      trigger: 'signatureReminder',
      providerResponse: 'ENROUTE · ack=carrier',
    },
    {
      offsetMinutes: 180,
      recipient: '33623456789',
      sender: 'IH-OTP',
      message: 'Code OTP : 619038. Saisissez-le dans votre Espace LP.',
      status: 'failed',
      trigger: 'otp',
      providerResponse: 'FAILED · reason=absent_subscriber',
    },
    {
      offsetMinutes: 240,
      recipient: '33611223344',
      sender: 'InvestHub',
      message: 'Bienvenue sur InvestHub. Votre code d’activation : 204871.',
      status: 'delivered',
      trigger: 'loginCode',
      providerResponse: 'DELIVRD · operator=Bouygues',
    },
    {
      offsetMinutes: 360,
      recipient: '33655667788',
      sender: 'InvestHub',
      message: 'Validation requise : pièce d’identité du dossier 2025-A14.',
      status: 'pending',
      trigger: 'documentValidation',
      providerResponse: 'SENT · awaiting_carrier_ack',
    },
    {
      offsetMinutes: 720,
      recipient: '33644556677',
      sender: 'IH-OTP',
      message: 'Code OTP : 845210. Expire dans 10 minutes.',
      status: 'delivered',
      trigger: 'otp',
      providerResponse: 'DELIVRD · operator=Orange FR',
    },
    {
      offsetMinutes: 60 * 26,
      recipient: '33677889900',
      sender: 'InvestHub',
      message: 'Rappel : appel de fonds du 30/04 — confirmez votre virement.',
      status: 'delivered',
      trigger: 'subscriptionReminder',
      providerResponse: 'DELIVRD · operator=Free',
    },
    {
      offsetMinutes: 60 * 30,
      recipient: '33611998877',
      sender: 'InvestHub',
      message: 'Code de connexion : 339201 — valide 5 minutes.',
      status: 'failed',
      trigger: 'loginCode',
      providerResponse: 'FAILED · reason=invalid_number_format',
    },
    {
      offsetMinutes: 60 * 50,
      recipient: '33633221100',
      sender: 'InvestHub',
      message: 'Bienvenue sur InvestHub — un email de bienvenue vient d’être envoyé.',
      status: 'delivered',
      trigger: 'loginCode',
      providerResponse: 'DELIVRD · operator=Orange FR',
    },
    {
      offsetMinutes: 60 * 70,
      recipient: '33688112233',
      sender: 'IH-OTP',
      message: 'Code OTP : 506744.',
      status: 'delivered',
      trigger: 'otp',
      providerResponse: 'DELIVRD · operator=SFR',
    },
    {
      offsetMinutes: 60 * 96,
      recipient: '33699887766',
      sender: 'InvestHub',
      message: 'Rappel signature : contrat de souscription LP fonds Northwind III.',
      status: 'sent',
      trigger: 'signatureReminder',
      providerResponse: 'ENROUTE · ack=carrier',
    },
    {
      offsetMinutes: 60 * 120,
      recipient: '33677001122',
      sender: 'InvestHub',
      message: 'Code de connexion : 117305 — valide 5 minutes.',
      status: 'delivered',
      trigger: 'loginCode',
      providerResponse: 'DELIVRD · operator=Orange FR',
    },
  ];

  return items.map((it, index) => {
    const sentAt = new Date(now.getTime() - it.offsetMinutes * 60_000);
    return {
      id: index + 1,
      sentAt: sentAt.toISOString(),
      recipient: it.recipient,
      sender: it.sender,
      message: it.message,
      status: it.status,
      trigger: it.trigger,
      providerResponse: it.providerResponse,
    };
  });
}

const MOCK_SMS = buildMockSms();

function formatPhone(raw: string): string {
  const match = raw.match(PHONE_GROUP);
  if (!match) return raw;
  const [, country, a, b, c, d, e] = match;
  return `+${country} ${a} ${b} ${c} ${d} ${e}`;
}

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function periodStartTimestamp(preset: PeriodPreset): number | null {
  if (preset === 'all') return null;
  const now = new Date();
  if (preset === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  return now.getTime() - days * 24 * 60 * 60 * 1000;
}

function highlightMatch(text: string, term: string): React.ReactNode {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-gray-900 dark:bg-amber-900/40 dark:text-amber-100 rounded-sm px-0.5">
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
}

export function SmsHistorySettings() {
  const { t, lang } = useTranslation();
  const dfLocale = (lang as Language) === 'en' ? enLocale : frLocale;

  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'sentAt',
    direction: 'desc',
  });
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedSms, setSelectedSms] = useState<SmsLog | null>(null);

  const senders = useMemo(
    () => Array.from(new Set(MOCK_SMS.map((s) => s.sender))).sort(),
    [],
  );

  // Search across phone + message
  const searchFilteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return MOCK_SMS;
    const digits = term.replace(/[^\d]/g, '');
    return MOCK_SMS.filter((sms) => {
      if (digits && sms.recipient.includes(digits)) return true;
      if (sms.message.toLowerCase().includes(term)) return true;
      return false;
    });
  }, [searchTerm]);

  // Status + secondary filters
  const filteredData = useMemo(() => {
    const periodValue = (activeFilters.period as PeriodPreset) || 'all';
    const periodStart = periodStartTimestamp(periodValue);
    const senderValue = activeFilters.sender as string | undefined;

    return searchFilteredData.filter((sms) => {
      if (activeStatus !== 'all' && sms.status !== activeStatus) return false;
      if (senderValue && sms.sender !== senderValue) return false;
      if (periodStart !== null && new Date(sms.sentAt).getTime() < periodStart) return false;
      return true;
    });
  }, [searchFilteredData, activeFilters, activeStatus]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      const av = (a as Record<string, unknown>)[key];
      const bv = (b as Record<string, unknown>)[key];
      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv) * dir;
      }
      return ((av as number) > (bv as number) ? 1 : -1) * dir;
    });
  }, [filteredData, sortConfig]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(paginationPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = sortedData.slice(startIndex, endIndex);

  // Status counts (computed on data after search but before status tab filter)
  const statusKpis = useMemo(() => {
    const counts: Record<StatusTab, number> = {
      all: searchFilteredData.length,
      delivered: 0,
      sent: 0,
      pending: 0,
      failed: 0,
    };
    for (const sms of searchFilteredData) counts[sms.status] += 1;
    return counts;
  }, [searchFilteredData]);

  const deliveryRate =
    statusKpis.all === 0 ? 0 : Math.round((statusKpis.delivered / statusKpis.all) * 100);
  const failureRate =
    statusKpis.all === 0 ? 0 : Math.round((statusKpis.failed / statusKpis.all) * 100);

  // average per day over 7d window for "averageValue" hint
  const avgPerDay = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = searchFilteredData.filter(
      (s) => new Date(s.sentAt).getTime() >= sevenDaysAgo,
    ).length;
    return Math.round(recent / 7);
  }, [searchFilteredData]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'period',
        label: t('smsLog.filters.period'),
        type: 'select',
        isPrimary: true,
        options: PERIOD_OPTIONS.map((p) => ({
          value: p,
          label: t(`smsLog.filters.periodPresets.${p}`),
        })),
      },
      {
        id: 'sender',
        label: t('smsLog.filters.sender'),
        type: 'select',
        isPrimary: false,
        options: senders.map((s) => ({ value: s, label: s })),
      },
    ],
    [t, senders],
  );

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete next[filterId];
      } else {
        next[filterId] = value;
      }
      return next;
    });
    setPaginationPage(1);
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setActiveStatus('all');
    setPaginationPage(1);
    toast.success(t('smsLog.toast.filtersResetTitle'));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPaginationPage(1);
  };

  const handleStatusChange = (status: StatusTab) => {
    setActiveStatus(status);
    setPaginationPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'desc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPaginationPage(page);
  };

  const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    setPaginationPage(1);
  };

  const handleExport = () => {
    const header = [
      t('smsLog.table.date'),
      t('smsLog.table.recipient'),
      t('smsLog.table.sender'),
      t('smsLog.table.message'),
      t('smsLog.table.delivered'),
      t('smsLog.detail.smsId'),
    ];
    const rows = sortedData.map((s) => [
      format(parseISO(s.sentAt), 'yyyy-MM-dd HH:mm:ss'),
      s.recipient,
      s.sender,
      s.message,
      t(`smsLog.status.${s.status}`),
      String(s.id),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => csvEscape(String(cell))).join(','))
      .join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = t('smsLog.csv.filename', {
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t('smsLog.toast.exportStartedTitle'), {
      description: t('smsLog.toast.exportStartedBody', { count: sortedData.length }),
    });
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(
      () =>
        toast.success(t('smsLog.toast.copySuccessTitle'), {
          description: t('smsLog.toast.copySuccessBody'),
        }),
      () => {},
    );
  };

  const columns: ColumnConfig<SmsLog>[] = useMemo(
    () => [
      {
        key: 'sentAt',
        label: t('smsLog.table.date'),
        sortable: true,
        className: 'w-[180px]',
        render: (row) => {
          const date = parseISO(row.sentAt);
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                {format(date, 'dd/MM/yyyy', { locale: dfLocale })}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                {format(date, 'HH:mm:ss', { locale: dfLocale })}
              </span>
            </div>
          );
        },
      },
      {
        key: 'recipient',
        label: t('smsLog.table.recipient'),
        sortable: true,
        className: 'w-[200px]',
        render: (row, term) => (
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">
            {highlightMatch(formatPhone(row.recipient), term)}
          </span>
        ),
      },
      {
        key: 'sender',
        label: t('smsLog.table.sender'),
        sortable: true,
        className: 'w-[140px]',
        render: (row) => (
          <Badge
            variant="outline"
            className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {row.sender}
          </Badge>
        ),
      },
      {
        key: 'message',
        label: t('smsLog.table.message'),
        sortable: false,
        render: (row, term) => (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-[520px]">
            {highlightMatch(row.message, term)}
          </p>
        ),
      },
      {
        key: 'status',
        label: t('smsLog.table.delivered'),
        sortable: true,
        className: 'w-[140px]',
        render: (row) => (
          <StatusBadge status={row.status} label={t(`smsLog.status.${row.status}`)} />
        ),
      },
    ],
    [t, dfLocale],
  );

  const hasActiveSearch = searchTerm.trim().length > 0;
  const hasActiveExtraFilters = Object.keys(activeFilters).length > 0 || activeStatus !== 'all';
  const isFiltered = hasActiveSearch || hasActiveExtraFilters;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col bg-gray-50/60 dark:bg-gray-950/40 min-h-full">
        <PageHeader
          title={t('smsLog.title')}
          subtitle={t('smsLog.subtitle')}
          hideBackButton
          primaryAction={{
            label: t('smsLog.actions.export'),
            icon: <Download className="w-4 h-4" />,
            onClick: handleExport,
            ariaLabel: t('smsLog.actions.exportTooltip'),
            disabled: sortedData.length === 0,
          }}
        />

        <div className="px-6 py-6 max-w-[1400px] w-full mx-auto space-y-5">
          {/* Sensitive access notice */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            role="note"
            className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30"
          >
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {t('smsLog.accessNoticeTitle')}
              </p>
              <p className="text-amber-800/90 dark:text-amber-200/80">
                {t('smsLog.accessNoticeBody')}
              </p>
              <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/70">
                {t('smsLog.readOnlyHint')}
              </p>
            </div>
          </motion.div>

          {/* Status FilterCard strip — same pattern as SubscriptionStatusTabs */}
          <SmsStatusTabs
            activeStatus={activeStatus}
            onStatusChange={handleStatusChange}
            kpis={statusKpis}
            deliveryRate={deliveryRate}
            failureRate={failureRate}
            avgPerDay={avgPerDay}
          />

          {/* FilterBar + DataTable card — same pattern as SubscriptionsPage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, width: '100%' }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
            className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col"
          >
            <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                searchPlaceholder={t('smsLog.searchPlaceholder')}
                filters={filterConfigs}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAllFilters}
              />
            </div>

            <div className="flex-1 overflow-auto">
              {sortedData.length === 0 ? (
                <EmptyState isFiltered={isFiltered} onReset={handleClearAllFilters} />
              ) : (
                <DataTable<SmsLog>
                  data={tableData}
                  columns={columns}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
                  onRowClick={(row) => setSelectedSms(row)}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  compactMode
                  allFilteredData={sortedData}
                  searchTerm={searchTerm}
                  entityName={t('smsLog.entityName')}
                />
              )}
            </div>

            {sortedData.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t('smsLog.pagination.itemsRange', {
                    start: startIndex + 1,
                    end: endIndex,
                    total: totalItems,
                  })}
                  {isFiltered && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                      {totalItems !== MOCK_SMS.length
                        ? `(${t('smsLog.pagination.filteredOf', { count: MOCK_SMS.length })})`
                        : `(${t('smsLog.pagination.filtered')})`}
                    </span>
                  )}
                </div>
                <Pagination
                  page={safePage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              </motion.div>
            )}
          </motion.div>
        </div>

        <Sheet open={!!selectedSms} onOpenChange={(open) => !open && setSelectedSms(null)}>
          <SheetContent className="w-[460px] sm:max-w-[460px] p-0 flex flex-col">
            {selectedSms && (
              <SmsDetail
                sms={selectedSms}
                onClose={() => setSelectedSms(null)}
                onCopy={handleCopy}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
}

function SmsStatusTabs({
  activeStatus,
  onStatusChange,
  kpis,
  deliveryRate,
  failureRate,
  avgPerDay,
}: {
  activeStatus: StatusTab;
  onStatusChange: (status: StatusTab) => void;
  kpis: Record<StatusTab, number>;
  deliveryRate: number;
  failureRate: number;
  avgPerDay: number;
}) {
  const { t } = useTranslation();
  const order: StatusTab[] = ['all', 'delivered', 'sent', 'pending', 'failed'];
  const avgLabel = t('smsLog.statusTabs.perDay', { count: avgPerDay });

  const metricValueFor = (status: StatusTab): string => {
    if (status === 'all') return kpis.all.toString();
    if (status === 'delivered') return `${deliveryRate}%`;
    if (status === 'failed') return `${failureRate}%`;
    return kpis[status].toString();
  };

  const metricLabelFor = (status: StatusTab): string => {
    if (status === 'delivered' || status === 'failed') {
      return t('smsLog.statusTabs.metricRate');
    }
    return t('smsLog.statusTabs.metricCount');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-primary/5 p-3 rounded-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {t('smsLog.statusTabs.title')}
          </h3>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/25">
            {t('smsLog.statusTabs.subtitle')}
          </Badge>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('smsLog.statusTabs.clickToFilter')}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 items-center">
        {order.map((status) => (
          <FilterCard
            key={status}
            status={status}
            activeStatus={activeStatus}
            onStatusChange={(s) => onStatusChange(s as StatusTab)}
            label={t(`smsLog.statusTabs.${status}`)}
            icon={STATUS_TAB_ICON[status]}
            total={kpis[status]}
            metricLabel={metricLabelFor(status)}
            metricValue={metricValueFor(status)}
            averageValue={avgLabel}
            iconActiveClassName={STATUS_TAB_ICON_CLASS[status] ?? 'text-primary'}
          />
        ))}
      </div>
    </motion.div>
  );
}

function StatusBadge({ status, label }: { status: SmsStatus; label: string }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge variant="outline" className={cn('gap-1.5', STATUS_BADGE_STYLES[status])}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </Badge>
  );
}

function EmptyState({
  isFiltered,
  onReset,
}: {
  isFiltered: boolean;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Inbox className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {isFiltered ? t('smsLog.empty.title') : t('smsLog.empty.noDataTitle')}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {isFiltered ? t('smsLog.empty.body') : t('smsLog.empty.noDataBody')}
      </p>
      {isFiltered && (
        <Button variant="outline" size="sm" onClick={onReset} className="mt-4">
          {t('smsLog.empty.resetCta')}
        </Button>
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: {
  page: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (n: number) => void;
}) {
  const { t } = useTranslation();

  const pageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const max = 7;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    if (page <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: page > 1 ? 1.05 : 1 }}
        whileTap={{ scale: page > 1 ? 0.95 : 1 }}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label={t('smsLog.pagination.previous')}
        className={cn(
          'p-2 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-800',
          page === 1 && 'opacity-40 cursor-not-allowed',
        )}
      >
        <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </motion.button>

      {pageNumbers().map((p, idx) => (
        <motion.button
          key={`${p}-${idx}`}
          whileHover={{ scale: p !== '...' ? 1.1 : 1, y: p !== '...' ? -2 : 0 }}
          whileTap={{ scale: p !== '...' ? 0.95 : 1 }}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          disabled={p === '...'}
          className={cn(
            'min-w-[36px] h-9 px-3 rounded-lg transition-all duration-300',
            p === page
              ? 'bg-primary text-primary-foreground shadow-md'
              : p === '...'
                ? 'text-gray-400 dark:text-gray-600 cursor-default'
                : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700',
          )}
        >
          {p}
        </motion.button>
      ))}

      <motion.button
        whileHover={{ scale: page < totalPages ? 1.05 : 1 }}
        whileTap={{ scale: page < totalPages ? 0.95 : 1 }}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label={t('smsLog.pagination.next')}
        className={cn(
          'p-2 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-gray-800',
          page === totalPages && 'opacity-40 cursor-not-allowed',
        )}
      >
        <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </motion.button>

      <div className="ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 outline-none">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('smsLog.pagination.itemsPerPage', { count: itemsPerPage })}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[10, 20, 50, 100].map((n) => (
              <DropdownMenuItem
                key={n}
                onClick={() => onItemsPerPageChange(n)}
                className="cursor-pointer"
              >
                {t('smsLog.pagination.itemsPerPageOption', { count: n })}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function SmsDetail({
  sms,
  onClose,
  onCopy,
}: {
  sms: SmsLog;
  onClose: () => void;
  onCopy: (value: string) => void;
}) {
  const { t, lang } = useTranslation();
  const dfLocale = (lang as Language) === 'en' ? enLocale : frLocale;
  const date = parseISO(sms.sentAt);

  return (
    <>
      <SheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <MessageSquare className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </span>
            <div>
              <SheetTitle className="text-base font-semibold">
                {t('smsLog.detail.title')}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {t('smsLog.detail.subtitle')}
              </SheetDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t('smsLog.detail.close')}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-3">
          <StatusBadge status={sms.status} label={t(`smsLog.status.${sms.status}`)} />
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <DetailRow
          label={t('smsLog.detail.sentAt')}
          value={format(date, 'EEEE d MMMM yyyy — HH:mm:ss', { locale: dfLocale })}
        />
        <DetailRow
          label={t('smsLog.detail.recipient')}
          value={formatPhone(sms.recipient)}
          mono
        />
        <DetailRow label={t('smsLog.detail.sender')} value={sms.sender} mono />
        <DetailRow
          label={t('smsLog.detail.trigger')}
          value={t(`smsLog.trigger.${sms.trigger}`)}
        />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('smsLog.detail.content')}
          </p>
          <div className="relative rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 p-4">
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {sms.message}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onCopy(sms.message)}
                  aria-label={t('smsLog.detail.copyContent')}
                  className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-800 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('smsLog.detail.copyContent')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('smsLog.detail.providerResponse')}
          </p>
          <code className="block rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono break-all">
            {sms.providerResponse}
          </code>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('smsLog.detail.smsId')}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono">
              sms_{String(sms.id).padStart(4, '0')}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    onCopy(`sms_${String(sms.id).padStart(4, '0')}`)
                  }
                  aria-label={t('smsLog.detail.copyId')}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('smsLog.detail.copyId')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-baseline">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={cn(
          'text-sm text-gray-900 dark:text-gray-100',
          mono && 'font-mono tabular-nums',
        )}
      >
        {value}
      </span>
    </div>
  );
}

