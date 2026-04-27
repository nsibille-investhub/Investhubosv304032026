import { useMemo, useState } from 'react';
import {
  X,
  Send,
  Users,
  Mail,
  Eye,
  Download,
  ChevronDown,
  ChevronRight,
  FileText,
  Check,
  CheckCircle2,
  Minus,
  Zap,
} from 'lucide-react';
import { StatusIndicator } from './CheckIndicator';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from './ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';
import { useTranslation } from '../utils/languageContext';

interface Recipient {
  id: string;
  investorId: string;
  name: string;
  role: string | null;
  type: 'Investisseur' | 'Contact';
  inTarget: boolean;
  lastNotificationDate: string | null;
  receptionStatus: 'done' | 'pending' | 'not-targeted';
  receptionDate?: string;
  openingStatus: 'done' | 'pending' | 'not-targeted';
  openingDate?: string;
  consultationStatus: 'done' | 'pending' | 'not-accessible' | 'not-targeted';
  consultationDate?: string;
}

interface DocumentRelaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
  /**
   * Si `true` (défaut) : écran nominatif avec listing détaillé des
   * investisseurs et contacts. Si `false` : écran générique avec uniquement
   * un récapitulatif du nombre d'investisseurs concernés.
   */
  isNominatif?: boolean;
}

// Statistiques simulées pour un document générique
const mockGenericStats = {
  totalInvestors: 47,
  notConsulted: 19,
};

const genericConsulted =
  mockGenericStats.totalInvestors - mockGenericStats.notConsulted;
const genericConsultationRate = Math.round(
  (genericConsulted / Math.max(1, mockGenericStats.totalInvestors)) * 100,
);

const mockRecipients: Recipient[] = [
  {
    id: '1',
    investorId: 'inv-1',
    name: 'Jean Dupont',
    role: null,
    type: 'Investisseur',
    inTarget: true,
    lastNotificationDate: '09/04/2026 09:12',
    receptionStatus: 'done',
    receptionDate: '09/04/2026 09:13',
    openingStatus: 'done',
    openingDate: '09/04/2026 09:35',
    consultationStatus: 'done',
    consultationDate: '09/04/2026 10:02',
  },
  {
    id: '2',
    investorId: 'inv-1',
    name: 'Marie Dupont',
    role: 'Avocat',
    type: 'Contact',
    inTarget: true,
    lastNotificationDate: '09/04/2026 09:12',
    receptionStatus: 'done',
    receptionDate: '09/04/2026 09:14',
    openingStatus: 'done',
    openingDate: '09/04/2026 11:08',
    consultationStatus: 'pending',
  },
  {
    id: '3',
    investorId: 'inv-1',
    name: 'Pierre Dupont',
    role: 'Comptable',
    type: 'Contact',
    inTarget: false,
    lastNotificationDate: null,
    receptionStatus: 'not-targeted',
    openingStatus: 'not-targeted',
    consultationStatus: 'not-targeted',
  },
  {
    id: '4',
    investorId: 'inv-1',
    name: 'Luc Martin',
    role: 'Dirigeant',
    type: 'Contact',
    inTarget: true,
    lastNotificationDate: '09/04/2026 09:12',
    receptionStatus: 'pending',
    openingStatus: 'pending',
    consultationStatus: 'pending',
  },
];

type FilterCriteria = 'all' | 'not-consulted' | 'custom';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const buildEmailTemplates = (t: TFn) => [
  { id: 'relance-standard', name: t('ged.relaunchModal.templates.standard'), description: t('ged.relaunchModal.templates.standardDesc') },
  { id: 'relance-urgente', name: t('ged.relaunchModal.templates.urgent'), description: t('ged.relaunchModal.templates.urgentDesc') },
  { id: 'relance-amicale', name: t('ged.relaunchModal.templates.friendly'), description: t('ged.relaunchModal.templates.friendlyDesc') },
  { id: 'relance-formelle', name: t('ged.relaunchModal.templates.formal'), description: t('ged.relaunchModal.templates.formalDesc') },
  { id: 'rappel-douceur', name: t('ged.relaunchModal.templates.softReminder'), description: t('ged.relaunchModal.templates.softReminderDesc') },
];

const getDocumentFormat = (name: string): string | undefined => {
  const match = name.match(/\.([A-Za-z0-9]+)$/);
  return match ? match[1].toLowerCase() : undefined;
};

export function DocumentRelaunchModal({
  isOpen,
  onClose,
  documentName,
  documentId,
  isNominatif = true,
}: DocumentRelaunchModalProps) {
  const { t } = useTranslation();
  const emailTemplates = useMemo(() => buildEmailTemplates(t), [t]);
  const [model, setModel] = useState(emailTemplates[0].name);
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const investorRecipients = useMemo(
    () => mockRecipients.filter((recipient) => recipient.investorId === 'inv-1'),
    [],
  );

  const allTargetableIds = useMemo(
    () => investorRecipients.filter((r) => r.inTarget).map((r) => r.id),
    [investorRecipients],
  );
  const notConsultedIds = useMemo(
    () =>
      investorRecipients
        .filter((r) => r.inTarget && r.consultationStatus !== 'done')
        .map((r) => r.id),
    [investorRecipients],
  );

  const [selectedCriteria, setSelectedCriteria] = useState<FilterCriteria>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(allTargetableIds),
  );

  const setsEqual = (a: Set<string>, b: string[]) =>
    a.size === b.length && b.every((id) => a.has(id));

  const applyCriteria = (criteria: FilterCriteria) => {
    if (criteria === 'all') {
      setSelectedCriteria('all');
      setSelectedIds(new Set(allTargetableIds));
    } else if (criteria === 'not-consulted') {
      setSelectedCriteria('not-consulted');
      setSelectedIds(new Set(notConsultedIds));
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      if (setsEqual(next, allTargetableIds)) {
        setSelectedCriteria('all');
      } else if (setsEqual(next, notConsultedIds)) {
        setSelectedCriteria('not-consulted');
      } else {
        setSelectedCriteria('custom');
      }

      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === allTargetableIds.length) {
      setSelectedIds(new Set());
      setSelectedCriteria('custom');
    } else {
      setSelectedIds(new Set(allTargetableIds));
      setSelectedCriteria('all');
    }
  };

  const headerCheckboxState: 'checked' | 'unchecked' | 'indeterminate' =
    selectedIds.size === 0
      ? 'unchecked'
      : allTargetableIds.length > 0 && selectedIds.size === allTargetableIds.length
      ? 'checked'
      : 'indeterminate';

  const notifiableCount = isNominatif
    ? selectedIds.size
    : selectedCriteria === 'not-consulted'
    ? mockGenericStats.notConsulted
    : mockGenericStats.totalInvestors;

  const handleSend = () => {
    if (isNominatif) {
      console.log(
        'Sending notifications to:',
        Array.from(selectedIds),
        'for document',
        documentId,
      );
    } else {
      console.log(
        'Sending notifications to',
        notifiableCount,
        'investors for generic document',
        documentId,
      );
    }
    onClose();
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV for document:', documentId);
  };

  const renderDateOrIcon = (
    status: 'done' | 'pending' | 'not-targeted' | 'not-accessible',
    date?: string,
  ) => {
    if (status === 'done' && date) {
      return (
        <span className="text-xs text-foreground tabular-nums">{date}</span>
      );
    }

    if (status === 'pending') {
      return <StatusIndicator state="failed" className="mx-auto" />;
    }

    return <StatusIndicator state="na" className="mx-auto" />;
  };

  const renderConsultationCell = (recipient: Recipient) => {
    if (!recipient.inTarget || recipient.consultationStatus === 'not-targeted') {
      if (recipient.name === 'Pierre Dupont') {
        return (
          <div className="flex items-center justify-center gap-2">
            <StatusIndicator state="na" label={t('ged.relaunchModal.notEntitled')} />
            <span className="text-xs text-muted-foreground">{t('ged.relaunchModal.notEntitled')}</span>
          </div>
        );
      }

      return <StatusIndicator state="na" className="mx-auto" />;
    }

    return renderDateOrIcon(recipient.consultationStatus, recipient.consultationDate);
  };

  const renderLastNotification = (recipient: Recipient) => {
    if (!recipient.inTarget || !recipient.lastNotificationDate) {
      return <StatusIndicator state="na" className="mx-auto" />;
    }

    return (
      <span className="text-xs text-foreground tabular-nums">
        {recipient.lastNotificationDate}
      </span>
    );
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent
          className={cn(
            'p-0 gap-0 overflow-hidden flex flex-col',
            'w-full max-w-full sm:max-w-full',
            'max-h-[88vh]',
            'bg-white',
          )}
          style={{
            width: 'min(960px, 60vw)',
            maxWidth: 'min(960px, 60vw)',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Header */}
          <AlertDialogHeader className="px-6 py-5 border-b border-border bg-white" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-brand"
                style={{
                  background:
                    'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                }}
              >
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <AlertDialogTitle className="text-lg font-semibold text-foreground">
                  {t('ged.relaunchModal.title')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  {t('ged.relaunchModal.subtitle')}
                </AlertDialogDescription>
              </div>
              <button
                onClick={onClose}
                aria-label={t('ged.relaunchModal.closeAria')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </AlertDialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-white" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="px-6 py-5 space-y-5">
              {/* Document preview card (clickable) */}
              <button
                type="button"
                onClick={() => {
                  // Close the modal first so the preview drawer layers above
                  // the activity panel cleanly instead of competing with the
                  // AlertDialog's portal stacking context.
                  onClose();
                  setIsPreviewOpen(true);
                }}
                className={cn(
                  'group w-full flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-white text-left',
                  'hover:bg-muted/40 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  'transition-colors',
                )}
                aria-label={t('ged.relaunchModal.previewAria', { name: documentName })}
              >
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {documentName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('ged.relaunchModal.previewHint')}
                  </div>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex gap-1">
                  <Eye className="w-3 h-3" />
                  {t('ged.relaunchModal.previewBadge')}
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Recap header + template selector */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {t('ged.relaunchModal.recapTitle')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t('ged.relaunchModal.templateLabel')}</span>
                  <Popover open={templatePopoverOpen} onOpenChange={setTemplatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 font-normal"
                      >
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        {model}
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-1" align="end">
                      <div className="space-y-0.5">
                        {emailTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setModel(template.name);
                              setTemplatePopoverOpen(false);
                            }}
                            className={cn(
                              'w-full text-left px-2.5 py-2 rounded-md transition-colors',
                              model === template.name
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted',
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Mail
                                className={cn(
                                  'w-3.5 h-3.5',
                                  model === template.name
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                                )}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {template.name}
                              </span>
                              {model === template.name && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground ml-6 mt-0.5">
                              {template.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Critère */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {t('ged.relaunchModal.criteriaLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyCriteria('all')}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left transition-colors',
                      selectedCriteria === 'all'
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'border-border bg-white hover:bg-muted/40',
                    )}
                    aria-pressed={selectedCriteria === 'all'}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                        selectedCriteria === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">
                      {t('ged.relaunchModal.allRecipients')}
                    </span>
                  </button>

                  <button
                    onClick={() => applyCriteria('not-consulted')}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left transition-colors',
                      selectedCriteria === 'not-consulted'
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'border-border bg-white hover:bg-muted/40',
                    )}
                    aria-pressed={selectedCriteria === 'not-consulted'}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                        selectedCriteria === 'not-consulted'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">
                      {t('ged.relaunchModal.notConsulted')}
                    </span>
                  </button>
                </div>
              </div>

              <Separator />

              {/* Body: recipients table (nominatif) or summary (generic) */}
              {isNominatif ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {t('ged.relaunchModal.recipientsHeader', { count: investorRecipients.length })}
                      <span className="ml-2 normal-case tracking-normal text-foreground">
                        {t('ged.relaunchModal.selectionSummary', {
                          selected: selectedIds.size,
                          total: allTargetableIds.length,
                        })}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportCSV}
                      className="h-7 text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t('ged.relaunchModal.exportCsv')}
                    </Button>
                  </div>

                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white hover:bg-white border-b-border">
                          <TableHead className="w-10 px-3">
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={
                                headerCheckboxState === 'checked'
                                  ? 'true'
                                  : headerCheckboxState === 'indeterminate'
                                  ? 'mixed'
                                  : 'false'
                              }
                              aria-label={t('ged.relaunchModal.selectAllAria')}
                              onClick={toggleAll}
                              disabled={allTargetableIds.length === 0}
                              className={cn(
                                'size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50',
                                headerCheckboxState === 'unchecked'
                                  ? 'bg-input-background border-input'
                                  : 'bg-primary text-primary-foreground border-primary',
                              )}
                            >
                              {headerCheckboxState === 'checked' && (
                                <Check className="size-3" strokeWidth={3} />
                              )}
                              {headerCheckboxState === 'indeterminate' && (
                                <Minus className="size-3" strokeWidth={3} />
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium">
                            {t('ged.relaunchModal.columnName')}
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium">
                            {t('ged.relaunchModal.columnType')}
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            {t('ged.relaunchModal.columnNotification')}
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            {t('ged.relaunchModal.columnReception')}
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            {t('ged.relaunchModal.columnOpening')}
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            {t('ged.relaunchModal.columnConsultation')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {investorRecipients.map((recipient) => {
                          const isSelectable = recipient.inTarget;
                          const isSelected = selectedIds.has(recipient.id);
                          return (
                            <TableRow
                              key={recipient.id}
                              data-state={isSelected ? 'selected' : undefined}
                              className={cn(!isSelectable && 'opacity-60')}
                            >
                              <TableCell className="px-3 py-3 align-top">
                                <Checkbox
                                  checked={isSelected}
                                  disabled={!isSelectable}
                                  onCheckedChange={() => toggleRecipient(recipient.id)}
                                  aria-label={t('ged.relaunchModal.selectRowAria', {
                                    name: recipient.name,
                                  })}
                                />
                              </TableCell>
                              <TableCell className="px-3 py-3 align-top">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-medium text-foreground">
                                    {recipient.name}
                                  </span>
                                  {recipient.role && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {recipient.role}
                                    </span>
                                  )}
                                  {recipient.name === 'Pierre Dupont' && (
                                    <span className="text-[11px] text-muted-foreground">
                                      {t('ged.relaunchModal.accessDenied')}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="px-3">
                                <Badge
                                  variant="outline"
                                  className="border-border bg-muted/60 text-muted-foreground font-normal"
                                >
                                  {recipient.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-3 text-center">
                                {renderLastNotification(recipient)}
                              </TableCell>
                              <TableCell className="px-3 text-center">
                                {renderDateOrIcon(recipient.receptionStatus, recipient.receptionDate)}
                              </TableCell>
                              <TableCell className="px-3 text-center">
                                {renderDateOrIcon(recipient.openingStatus, recipient.openingDate)}
                              </TableCell>
                              <TableCell className="px-3 text-center">
                                {renderConsultationCell(recipient)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl border border-border bg-white overflow-hidden"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {/* Headline */}
                  <div className="flex items-center gap-4 px-5 py-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-brand"
                      style={{
                        background:
                          'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                      }}
                    >
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-foreground tabular-nums tracking-tight leading-none">
                          {notifiableCount}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t(notifiableCount > 1 ? 'ged.relaunchModal.investorsToNotifyMany' : 'ged.relaunchModal.investorsToNotifyOne')}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedCriteria === 'not-consulted'
                          ? t('ged.relaunchModal.notConsultedHint')
                          : t('ged.relaunchModal.concernedHint')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportCSV}
                      className="h-8 text-xs gap-1.5 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t('ged.relaunchModal.exportCsv')}
                    </Button>
                  </div>

                  {/* Consultation progress */}
                  <div className="px-5 py-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-medium text-foreground">
                        {t('ged.relaunchModal.consultationRate')}
                      </span>
                      <span className="tabular-nums font-semibold text-foreground">
                        {genericConsultationRate}%
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: '#F1F5F9' }}
                      role="progressbar"
                      aria-valuenow={genericConsultationRate}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${genericConsultationRate}%`,
                          background:
                            'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {t(mockGenericStats.totalInvestors > 1 ? 'ged.relaunchModal.consultedSummaryMany' : 'ged.relaunchModal.consultedSummaryOne', { consulted: genericConsulted, total: mockGenericStats.totalInvestors })}
                    </p>
                  </div>

                  {/* KPI grid */}
                  <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
                    <div className="px-5 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: '#94A3B8' }}
                        />
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                          {t('ged.relaunchModal.totalAccess')}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-foreground tabular-nums leading-tight">
                        {mockGenericStats.totalInvestors}
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--brand-success)' }}
                        />
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                          {t('ged.relaunchModal.consultedLabel')}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-foreground tabular-nums leading-tight">
                        {genericConsulted}
                      </div>
                    </div>
                    <div className="px-5 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: 'var(--brand-warning)' }}
                        />
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                          {t('ged.relaunchModal.notConsultedLabel')}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-foreground tabular-nums leading-tight">
                        {mockGenericStats.notConsulted}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-white flex items-center justify-between gap-2" style={{ backgroundColor: '#FFFFFF' }}>
            <Button variant="outline" onClick={onClose}>
              {t('ged.relaunchModal.back')}
            </Button>
            <Button
              onClick={handleSend}
              disabled={notifiableCount === 0}
              className={cn(
                'gap-2 text-white border-0',
                notifiableCount === 0 && 'opacity-60',
              )}
              style={
                notifiableCount > 0
                  ? {
                      background:
                        'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                    }
                  : undefined
              }
            >
              <Send className="w-4 h-4" />
              {notifiableCount > 0
                ? t(notifiableCount > 1 ? 'ged.relaunchModal.sendMany' : 'ged.relaunchModal.sendOne', { count: notifiableCount })
                : t('ged.relaunchModal.sendNotifications')}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview drawer */}
      <DocumentPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentName={documentName}
        documentId={documentId}
        format={getDocumentFormat(documentName)}
      />
    </>
  );
}
