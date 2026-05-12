import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr as frLocale, enUS as enLocale } from 'date-fns/locale';
import {
  MessageSquare,
  Download,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowDown,
  ArrowUp,
  ShieldAlert,
  Phone,
  Send,
  Copy,
  X,
  Inbox,
  Filter as FilterIcon,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation, type Language } from '../../utils/languageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { KpiCard, KpiStrip } from '../ui/kpi-card';
import { PageHeader } from '../ui/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
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
import { cn } from '../ui/utils';

type SmsStatus = 'delivered' | 'sent' | 'pending' | 'failed';
type SmsTriggerKey =
  | 'loginCode'
  | 'otp'
  | 'documentValidation'
  | 'subscriptionReminder'
  | 'signatureReminder';

interface SmsLog {
  id: string;
  sentAt: string; // ISO
  recipient: string; // 33XXXXXXXXX
  sender: string;
  message: string;
  status: SmsStatus;
  trigger: SmsTriggerKey;
  providerResponse: string;
}

const PAGE_SIZE = 10;
const PHONE_GROUP = /(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/;

const STATUS_STYLES: Record<SmsStatus, string> = {
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
      id: `sms_${(index + 1).toString().padStart(4, '0')}`,
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

export function SmsHistorySettings() {
  const { t, lang } = useTranslation();
  const dfLocale = (lang as Language) === 'en' ? enLocale : frLocale;

  const [phoneFilter, setPhoneFilter] = useState('');
  const [messageFilter, setMessageFilter] = useState('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedSms, setSelectedSms] = useState<SmsLog | null>(null);

  const resetFilters = () => {
    setPhoneFilter('');
    setMessageFilter('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
    toast.success(t('smsLog.toast.filtersResetTitle'));
  };

  const filteredSms = useMemo(() => {
    const phoneNeedle = phoneFilter.replace(/[^\d]/g, '');
    const messageNeedle = messageFilter.trim().toLowerCase();
    const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
    const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;

    return MOCK_SMS.filter((sms) => {
      if (phoneNeedle && !sms.recipient.includes(phoneNeedle)) return false;
      if (messageNeedle && !sms.message.toLowerCase().includes(messageNeedle)) return false;
      const ts = new Date(sms.sentAt).getTime();
      if (from !== null && ts < from) return false;
      if (to !== null && ts > to) return false;
      return true;
    }).sort((a, b) => {
      const diff = new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
      return sortAsc ? diff : -diff;
    });
  }, [phoneFilter, messageFilter, dateFrom, dateTo, sortAsc]);

  const stats = useMemo(() => {
    const total = filteredSms.length;
    const delivered = filteredSms.filter((s) => s.status === 'delivered').length;
    const failed = filteredSms.filter((s) => s.status === 'failed').length;
    const rate = total === 0 ? 0 : Math.round((delivered / total) * 100);
    return { total, delivered, failed, rate };
  }, [filteredSms]);

  const totalPages = Math.max(1, Math.ceil(filteredSms.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filteredSms.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeFilters: Array<{ key: string; label: string; clear: () => void }> = [];
  if (phoneFilter)
    activeFilters.push({
      key: 'phone',
      label: `${t('smsLog.filters.phone')} : ${phoneFilter}`,
      clear: () => setPhoneFilter(''),
    });
  if (messageFilter)
    activeFilters.push({
      key: 'message',
      label: `${t('smsLog.filters.message')} : ${messageFilter}`,
      clear: () => setMessageFilter(''),
    });
  if (dateFrom)
    activeFilters.push({
      key: 'from',
      label: `${t('smsLog.filters.dateFrom')} : ${format(dateFrom, 'dd/MM/yyyy', { locale: dfLocale })}`,
      clear: () => setDateFrom(undefined),
    });
  if (dateTo)
    activeFilters.push({
      key: 'to',
      label: `${t('smsLog.filters.dateTo')} : ${format(dateTo, 'dd/MM/yyyy', { locale: dfLocale })}`,
      clear: () => setDateTo(undefined),
    });

  const handleExport = () => {
    const header = [
      t('smsLog.table.date'),
      t('smsLog.table.recipient'),
      t('smsLog.table.sender'),
      t('smsLog.table.message'),
      t('smsLog.table.delivered'),
      t('smsLog.detail.smsId'),
    ];
    const rows = filteredSms.map((s) => [
      format(parseISO(s.sentAt), 'yyyy-MM-dd HH:mm:ss'),
      s.recipient,
      s.sender,
      s.message,
      t(`smsLog.status.${s.status}`),
      s.id,
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
      description: t('smsLog.toast.exportStartedBody', { count: filteredSms.length }),
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

  const isEmptyDueToFilters =
    filteredSms.length === 0 && (activeFilters.length > 0 || MOCK_SMS.length > 0);

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
            disabled: filteredSms.length === 0,
          }}
        />

        <div className="px-6 py-6 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Access notice */}
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

          {/* KPIs */}
          <KpiStrip columns={4}>
            <KpiCard
              index={0}
              icon={MessageSquare}
              label={t('smsLog.kpi.total')}
              value={stats.total}
              hint={t('smsLog.kpi.totalHint')}
            />
            <KpiCard
              index={1}
              icon={CheckCircle2}
              label={t('smsLog.kpi.delivered')}
              value={stats.delivered}
              hint={t('smsLog.kpi.deliveredHint')}
              progress={{ current: stats.delivered, total: Math.max(stats.total, 1) }}
            />
            <KpiCard
              index={2}
              icon={XCircle}
              label={t('smsLog.kpi.failed')}
              value={stats.failed}
              hint={t('smsLog.kpi.failedHint')}
              pulse={stats.failed > 0}
            />
            <KpiCard
              index={3}
              icon={TrendingUp}
              label={t('smsLog.kpi.deliveryRate')}
              value={`${stats.rate}%`}
              hint={t('smsLog.kpi.deliveryRateHint')}
            />
          </KpiStrip>

          {/* Filters */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            aria-labelledby="sms-filters-title"
            className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-gray-900/5 dark:bg-white/10">
                  <FilterIcon className="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" />
                </span>
                <div>
                  <h2
                    id="sms-filters-title"
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {t('smsLog.filters.title')}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('smsLog.filters.subtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  disabled={activeFilters.length === 0}
                  className="gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('smsLog.filters.reset')}
                </Button>
              </div>
            </header>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sms-filter-phone" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t('smsLog.filters.phone')}
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="sms-filter-phone"
                    value={phoneFilter}
                    onChange={(e) => {
                      setPhoneFilter(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t('smsLog.filters.phonePlaceholder')}
                    inputMode="numeric"
                    className="pl-9 tabular-nums"
                  />
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {t('smsLog.filters.phoneHint')}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sms-filter-message" className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t('smsLog.filters.message')}
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="sms-filter-message"
                    value={messageFilter}
                    onChange={(e) => {
                      setMessageFilter(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t('smsLog.filters.messagePlaceholder')}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t('smsLog.filters.dateFrom')}
                </Label>
                <DatePicker
                  date={dateFrom}
                  onDateChange={(d) => {
                    setDateFrom(d);
                    setPage(1);
                  }}
                  placeholder={t('smsLog.filters.dateFrom')}
                  maxDate={dateTo ?? new Date()}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {t('smsLog.filters.dateTo')}
                </Label>
                <DatePicker
                  date={dateTo}
                  onDateChange={(d) => {
                    setDateTo(d);
                    setPage(1);
                  }}
                  placeholder={t('smsLog.filters.dateTo')}
                  minDate={dateFrom}
                  maxDate={new Date()}
                />
              </div>
            </div>

            <AnimatePresence>
              {activeFilters.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-gray-100 dark:border-gray-800"
                >
                  <div className="px-5 py-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('smsLog.filters.activeFilters')} :
                    </span>
                    {activeFilters.map((f) => (
                      <Badge
                        key={f.key}
                        variant="outline"
                        className="gap-1.5 pl-2 pr-1 py-1 border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-200"
                      >
                        <span className="truncate max-w-[220px]">{f.label}</span>
                        <button
                          type="button"
                          onClick={f.clear}
                          aria-label={t('smsLog.filters.clearOne')}
                          className="inline-flex items-center justify-center w-4 h-4 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>

          {/* Results meta */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                {filteredSms.length === 1
                  ? t('smsLog.results.one', { count: filteredSms.length })
                  : t('smsLog.results.many', { count: filteredSms.length })}
              </span>
              {activeFilters.length > 0 ? (
                <span className="ml-1">
                  {t('smsLog.results.filtered', { total: MOCK_SMS.length })}
                </span>
              ) : null}
            </p>
          </div>

          {/* Table */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900"
          >
            {filteredSms.length === 0 ? (
              <EmptyState
                isFiltered={isEmptyDueToFilters && activeFilters.length > 0}
                onReset={resetFilters}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 dark:bg-gray-900/60 hover:bg-gray-50/80">
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[200px]">
                      <button
                        type="button"
                        onClick={() => setSortAsc((v) => !v)}
                        aria-label={
                          sortAsc
                            ? t('smsLog.table.sortByDateDesc')
                            : t('smsLog.table.sortByDateAsc')
                        }
                        className="inline-flex items-center gap-1 hover:text-gray-900 dark:hover:text-gray-100 transition"
                      >
                        {t('smsLog.table.date')}
                        {sortAsc ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[180px]">
                      {t('smsLog.table.recipient')}
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[120px]">
                      {t('smsLog.table.sender')}
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('smsLog.table.message')}
                    </TableHead>
                    <TableHead className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-[130px]">
                      {t('smsLog.table.delivered')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.map((sms) => {
                    const date = parseISO(sms.sentAt);
                    return (
                      <TableRow
                        key={sms.id}
                        onClick={() => setSelectedSms(sms)}
                        tabIndex={0}
                        role="button"
                        aria-label={t('smsLog.table.rowAriaLabel', {
                          date: format(date, 'dd/MM/yyyy HH:mm', { locale: dfLocale }),
                          recipient: formatPhone(sms.recipient),
                        })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedSms(sms);
                          }
                        }}
                        className="cursor-pointer focus:bg-gray-50 focus:outline-none dark:focus:bg-gray-800/50"
                      >
                        <TableCell className="px-4 py-3 align-top">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                              {format(date, 'dd/MM/yyyy', { locale: dfLocale })}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                              {format(date, 'HH:mm:ss', { locale: dfLocale })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                            {formatPhone(sms.recipient)}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <Badge
                            variant="outline"
                            className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          >
                            {sms.sender}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 max-w-[520px]">
                            {sms.message}
                          </p>
                        </TableCell>
                        <TableCell className="px-4 py-3 align-top">
                          <StatusBadge status={sms.status} label={t(`smsLog.status.${sms.status}`)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {filteredSms.length > PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('smsLog.results.page', { current: safePage, total: totalPages })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                  >
                    {t('smsLog.results.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                  >
                    {t('smsLog.results.next')}
                  </Button>
                </div>
              </div>
            )}
          </motion.section>
        </div>

        {/* Detail drawer */}
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

function StatusBadge({ status, label }: { status: SmsStatus; label: string }) {
  const Icon = STATUS_ICON[status];
  return (
    <Badge variant="outline" className={cn('gap-1.5', STATUS_STYLES[status])}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </Badge>
  );
}

function EmptyState({ isFiltered, onReset }: { isFiltered: boolean; onReset: () => void }) {
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
        <Button variant="outline" size="sm" onClick={onReset} className="mt-4 gap-2">
          <RotateCcw className="w-3.5 h-3.5" />
          {t('smsLog.empty.resetCta')}
        </Button>
      )}
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
              {sms.id}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onCopy(sms.id)}
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

