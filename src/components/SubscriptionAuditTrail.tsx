import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  BadgeCheck,
  BellRing,
  Calculator,
  CalendarCheck,
  Download,
  FileDown,
  FileSignature,
  FolderPlus,
  Radar,
  ScanSearch,
  StickyNote,
  Wallet,
  Forward,
  ShieldCheck,
  Handshake,
  Landmark,
  Link2,
  CheckCircle2,
  Eraser,
  Repeat,
  Share2,
  FilePlus2,
  FileCheck2,
  FileX2,
  History,
  Mail,
  MessageSquare,
  PencilLine,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  ListChecks,
  UserCheck,
  TextCursorInput,
  XCircle,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sheet, SheetContent } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SidePanelFooter, SidePanelHeader, SIDE_PANEL_WIDE_STYLE } from './ui/side-panel';
import { Timeline, type TimelineEvent, type TimelineTypeMap } from './ui/timeline';
import { StatusBadge } from './StatusBadge';
import { useTranslation } from '../utils/languageContext';
import type { MockRequiredDocument, MockSection } from '../utils/subscriptionDetailMockData';
import {
  AUDIT_DOCUMENTS_SECTION,
  AUDIT_DOSSIER_SCOPE,
  SUBSCRIPTION_AUDIT_DOMAINS,
  SUBSCRIPTION_AUDIT_EVENT_TYPES,
  COMPLIANCE_JOURNAL_CATEGORIES,
  auditDomainOf,
  complianceCategoryOf,
  countPendingModifications,
  type SubscriptionAuditEntry,
  type SubscriptionAuditEventType,
} from '../utils/subscriptionAuditMock';

const AUDIT_ICONS: Record<SubscriptionAuditEventType, typeof History> = {
  invitationSent: Mail,
  answerEntered: TextCursorInput,
  answerModified: PencilLine,
  answerValidated: CheckCircle2,
  answerInvalidated: XCircle,
  documentUploaded: FilePlus2,
  documentReplaced: RefreshCw,
  documentValidated: FileCheck2,
  documentRejected: FileX2,
  documentDatesUpdated: CalendarCheck,
  dataPropagated: Share2,
  dataReset: Eraser,
  answerReplayed: Repeat,
  notificationSent: BellRing,
  dataReported: Link2,
  mandateCreated: Landmark,
  investorReminded: BellRing,
  dossierReopened: RefreshCw,
  partnerValidated: Handshake,
  reviewHandedOff: Forward,
  finalValidation: ShieldCheck,
  commentAdded: MessageSquare,
  dossierSubmitted: Send,
  subscriptionCreated: FolderPlus,
  subscriptionEdited: PencilLine,
  emailSent: Mail,
  screeningLaunched: ScanSearch,
  scoreValidated: BadgeCheck,
  scoreInvalidated: Radar,
  complianceValidated: ShieldCheck,
  signaturePackSent: Send,
  signatureCompleted: FileSignature,
  paymentConfirmed: Wallet,
  noteAdded: StickyNote,
  dossierExported: FileDown,
  scoreComputed: Calculator,
  scoreRecomputed: RefreshCw,
  manualScoreSet: PencilLine,
  categorisationSet: UserCheck,
  hitQualified: ListChecks,
  providerReportDownloaded: FileDown,
  complianceSubmitted: Send,
  complianceReopened: RotateCcw,
  complianceOverride: ShieldAlert,
};

const T = 'subscriptions.detail.audit';

interface AuditSource {
  entries: SubscriptionAuditEntry[];
  sections: MockSection[];
  documents: MockRequiredDocument[];
}

/** Libellés de l'élément et de sa section, résolus à l'affichage. */
function useAuditLabels({ sections, documents }: Omit<AuditSource, 'entries'>) {
  const { t } = useTranslation();
  return useMemo(() => {
    const sectionLabel = (sectionId?: string) => {
      if (!sectionId) return t(`${T}.dossier`);
      const section = sections.find(s => s.id === sectionId);
      return section ? t(section.titleKey) : sectionId;
    };
    const elementLabel = (entry: SubscriptionAuditEntry) => {
      if (entry.subject) return entry.subject;
      if (!entry.elementId) return t(`${T}.dossier`);
      if (entry.sectionId === AUDIT_DOCUMENTS_SECTION) {
        const doc = documents[Number(entry.elementId.replace('document-', ''))];
        return doc ? doc.name ?? t(doc.nameKey) : entry.elementId;
      }
      const section = sections.find(s => s.id === entry.sectionId);
      const idx = Number(entry.elementId.slice(entry.elementId.lastIndexOf('-') + 1));
      const question = section?.questions[idx];
      if (!question) return entry.elementId;
      const label = question.question.replace(/\s*\*\s*$/, '');
      return question.iteration !== undefined && section?.iterationLabelKey
        ? `${label} (${t(section.iterationLabelKey, { n: question.iteration })})`
        : label;
    };
    return { sectionLabel, elementLabel };
  }, [sections, documents, t]);
}

function AuditTimeline({
  entries,
  sections,
  documents,
  exportFileName,
  showElement,
}: AuditSource & { exportFileName: string; showElement: boolean }) {
  const { t, lang } = useTranslation();
  const { sectionLabel, elementLabel } = useAuditLabels({ sections, documents });

  const types = useMemo<TimelineTypeMap<SubscriptionAuditEventType>>(() => {
    const map = {} as TimelineTypeMap<SubscriptionAuditEventType>;
    SUBSCRIPTION_AUDIT_EVENT_TYPES.forEach(type => {
      map[type] = { label: t(`${T}.types.${type}`), Icon: AUDIT_ICONS[type] };
    });
    return map;
  }, [t]);

  const events = useMemo<TimelineEvent<SubscriptionAuditEventType>[]>(
    () =>
      entries.map(entry => {
        const originLabel = t(`${T}.origin.${entry.origin}`);
        return {
          id: entry.id,
          type: entry.type,
          timestamp: entry.timestamp,
          actorName: entry.actorName ?? originLabel,
          actorSublabel: entry.actorName ? originLabel : undefined,
          actorRole: originLabel,
          meta: { entry },
          description: (
            <div className="space-y-0.5">
              {showElement && (entry.elementId || entry.subject || auditDomainOf(entry.type) === 'onboarding') && (
                <div>
                  <span className="font-medium text-foreground">{elementLabel(entry)}</span>
                  {entry.elementId && <span> · {sectionLabel(entry.sectionId)}</span>}
                </div>
              )}
              {entry.previousValue !== undefined && entry.newValue !== undefined ? (
                <div>
                  <span className="line-through">{entry.previousValue || t(`${T}.empty`)}</span>
                  <span> → </span>
                  <span className="text-foreground">{entry.newValue || t(`${T}.empty`)}</span>
                </div>
              ) : entry.type === 'notificationSent' || entry.type === 'emailSent' ? (
                <>
                  <div className="text-foreground">{entry.reason}</div>
                  <div>{t(`${T}.recipients`, { recipients: entry.newValue ?? '' })}</div>
                </>
              ) : entry.newValue !== undefined ? (
                <div className="text-foreground">{entry.newValue}</div>
              ) : null}
              {entry.target && (
                <div>
                  {t(`${T}.target`, {
                    object: t(`subscriptions.detail.answerEffects.objects.${entry.target.object}`),
                    field: t(`subscriptions.detail.answerEffects.fields.${entry.target.field}`),
                  })}
                </div>
              )}
              {entry.causeElementId && (
                <div>
                  {t(`${T}.causedBy`, {
                    label: elementLabel({ ...entry, elementId: entry.causeElementId }),
                  })}
                </div>
              )}
              {entry.reason && entry.type !== 'notificationSent' && entry.type !== 'emailSent' && (
                <div>{t(`${T}.reason`, { reason: entry.reason })}</div>
              )}
              {entry.viaSection && <div>{t(`${T}.viaSection`)}</div>}
            </div>
          ),
        };
      }),
    [entries, showElement, elementLabel, sectionLabel, t],
  );

  const entryOf = (e: TimelineEvent<SubscriptionAuditEventType>) =>
    (e.meta as { entry: SubscriptionAuditEntry }).entry;
  const locale = lang === 'en' ? 'en-US' : 'fr-FR';

  return (
    <Timeline<SubscriptionAuditEventType>
      events={events}
      types={types}
      enableFilters
      enableExport
      exportFileName={exportFileName}
      pageSize={15}
      emptyLabel={t(`${T}.emptyTimeline`)}
      exportColumns={[
        { header: t(`${T}.columns.date`), value: e => new Date(e.timestamp).toLocaleDateString(locale) },
        {
          header: t(`${T}.columns.time`),
          value: e => new Date(e.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
        },
        { header: t(`${T}.columns.event`), value: e => types[e.type].label },
        { header: t(`${T}.columns.section`), value: e => sectionLabel(entryOf(e).sectionId) },
        { header: t(`${T}.columns.element`), value: e => elementLabel(entryOf(e)) },
        { header: t(`${T}.columns.previousValue`), value: e => entryOf(e).previousValue ?? '' },
        { header: t(`${T}.columns.newValue`), value: e => entryOf(e).newValue ?? '' },
        { header: t(`${T}.columns.reason`), value: e => entryOf(e).reason ?? '' },
        { header: t(`${T}.columns.author`), value: e => e.actorName ?? '' },
        { header: t(`${T}.columns.origin`), value: e => e.actorRole ?? '' },
      ]}
    />
  );
}

interface SubscriptionAuditTabProps extends AuditSource {
  subscriptionName: string;
}

/** Onglet Piste d'audit : tous les éléments de la souscription, filtrables par section. */
export function SubscriptionAuditTab({ entries, sections, documents, subscriptionName }: SubscriptionAuditTabProps) {
  const { t } = useTranslation();
  const [scope, setScope] = useState<string>('all');

  const scoped = useMemo(() => {
    if (scope === 'all') return entries;
    if (scope === AUDIT_DOSSIER_SCOPE) return entries.filter(e => !e.sectionId);
    return entries.filter(e => e.sectionId === scope);
  }, [entries, scope]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{t(`${T}.title`)}</CardTitle>
          <CardDescription>{t(`${T}.hint`)}</CardDescription>
        </div>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="w-64" aria-label={t(`${T}.sectionFilter`)}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t(`${T}.allSections`)}</SelectItem>
            <SelectItem value={AUDIT_DOSSIER_SCOPE}>{t(`${T}.dossier`)}</SelectItem>
            {sections.map(section => (
              <SelectItem key={section.id} value={section.id}>
                {t(section.titleKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </CardHeader>
      <CardContent>
        <AuditTimeline
          entries={scoped}
          sections={sections}
          documents={documents}
          exportFileName={`audit_${subscriptionName}`}
          showElement
        />
      </CardContent>
    </Card>
  );
}

interface SubscriptionAuditPanelProps extends AuditSource {
  /** Élément ouvert : réponse (`identity-3`) ou pièce (`document-2`). */
  elementId: string | null;
  sectionId?: string;
  onClose: () => void;
  onShowAll: () => void;
}

/** Panneau latéral : piste d'audit d'une réponse ou d'une pièce. */
export function SubscriptionAuditPanel({
  entries,
  sections,
  documents,
  elementId,
  sectionId,
  onClose,
  onShowAll,
}: SubscriptionAuditPanelProps) {
  const { t } = useTranslation();
  const { sectionLabel, elementLabel } = useAuditLabels({ sections, documents });
  const scoped = useMemo(() => entries.filter(e => e.elementId === elementId), [entries, elementId]);
  const probe: SubscriptionAuditEntry | null = elementId
    ? { id: 'probe', type: 'answerEntered', timestamp: '', origin: 'operator', elementId, sectionId }
    : null;

  return (
    <Sheet open={elementId !== null} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader
          title={t(`${T}.panelTitle`)}
          description={probe ? `${elementLabel(probe)} · ${sectionLabel(sectionId)}` : undefined}
        >
          {elementId && countPendingModifications(entries, elementId) > 0 && (
            <div className="mt-2">
              <StatusBadge
                variant="info"
                icon={PencilLine}
                label={t(
                  countPendingModifications(entries, elementId) === 1
                    ? `${T}.pendingModificationsOne`
                    : `${T}.pendingModificationsMany`,
                  { count: countPendingModifications(entries, elementId) },
                )}
              />
            </div>
          )}
        </SidePanelHeader>
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {elementId && (
            <AuditTimeline
              entries={scoped}
              sections={sections}
              documents={documents}
              exportFileName={`audit_${elementId}`}
              showElement={false}
            />
          )}
        </div>
        <SidePanelFooter className="justify-between">
          <Button variant="ghost" onClick={onShowAll} className="gap-2">
            <History className="w-4 h-4" />
            {t(`${T}.showAll`)}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t(`${T}.close`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}

const csvField = (value: string) => (/[;"\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

interface DownloadAuditCsvInput {
  entries: SubscriptionAuditEntry[];
  fileName: string;
  groupColumn: { header: string; value: (entry: SubscriptionAuditEntry) => string };
  sectionLabel: (sectionId?: string) => string;
  elementLabel: (entry: SubscriptionAuditEntry) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
  lang: string;
}

function downloadAuditCsv({ entries, fileName, groupColumn, sectionLabel, elementLabel, t, lang }: DownloadAuditCsvInput) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR';
  const header = [
    t(`${T}.columns.date`),
    t(`${T}.columns.time`),
    groupColumn.header,
    ...['event', 'section', 'element', 'previousValue', 'newValue', 'reason', 'author', 'origin'].map(column =>
      t(`${T}.columns.${column}`),
    ),
  ];
  const rows = [...entries]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map(entry => {
      const date = new Date(entry.timestamp);
      const origin = t(`${T}.origin.${entry.origin}`);
      return [
        date.toLocaleDateString(locale),
        date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
        groupColumn.value(entry),
        t(`${T}.types.${entry.type}`),
        sectionLabel(entry.sectionId),
        elementLabel(entry),
        entry.previousValue ?? '',
        entry.newValue ?? '',
        entry.reason ?? '',
        entry.actorName ?? origin,
        origin,
      ];
    });
  const csv = '\ufeff' + [header, ...rows].map(row => row.map(csvField).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface SubscriptionActivitySheetProps extends AuditSource {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionName: string;
}

/** Panneau latéral : piste d'audit de toutes les actions de la souscription, avec export complet. */
export function SubscriptionActivitySheet({
  open,
  onOpenChange,
  entries,
  sections,
  documents,
  subscriptionName,
}: SubscriptionActivitySheetProps) {
  const { t, lang } = useTranslation();
  const [domain, setDomain] = useState<string>('all');
  const { sectionLabel, elementLabel } = useAuditLabels({ sections, documents });

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [entries],
  );
  const scoped = useMemo(
    () => (domain === 'all' ? sorted : sorted.filter(entry => auditDomainOf(entry.type) === domain)),
    [sorted, domain],
  );

  // Toute la piste, quels que soient les filtres affichés.
  const handleExportAll = () => {
    downloadAuditCsv({
      entries,
      fileName: `piste_audit_${subscriptionName}.csv`,
      groupColumn: { header: t(`${T}.columns.domain`), value: entry => t(`${T}.domains.${auditDomainOf(entry.type)}`) },
      sectionLabel,
      elementLabel,
      t,
      lang,
    });
    toast.success(t(`${T}.activity.exportedToast`), {
      description: t(`${T}.activity.exportedToastDesc`, { count: entries.length }),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader
          title={t(`${T}.activity.title`)}
          description={t(`${T}.activity.description`, { count: entries.length })}
        >
          <div className="mt-3">
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger className="h-11" aria-label={t(`${T}.activity.domainFilter`)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t(`${T}.activity.allDomains`)}</SelectItem>
                {SUBSCRIPTION_AUDIT_DOMAINS.map(value => (
                  <SelectItem key={value} value={value}>
                    {t(`${T}.domains.${value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SidePanelHeader>
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <AuditTimeline
            entries={scoped}
            sections={sections}
            documents={documents}
            exportFileName={`audit_${subscriptionName}`}
            showElement
          />
        </div>
        <SidePanelFooter className="justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t(`${T}.close`)}
          </Button>
          <Button variant="primary" onClick={handleExportAll} className="gap-2">
            <Download className="w-4 h-4" />
            {t(`${T}.activity.exportAll`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}

const J = 'subscriptions.detail.compliance.journal';

interface SubscriptionComplianceJournalSheetProps extends AuditSource {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionName: string;
  onAddNote: (text: string) => void;
}

/**
 * Panneau latéral : journal de conformité de la souscription. Ne reprend de la piste d'audit
 * que les actions de conformité (réponses, pièces, score, catégorisation, parties tierces,
 * dérogations, notes et validations successives).
 */
export function SubscriptionComplianceJournalSheet({
  open,
  onOpenChange,
  entries,
  sections,
  documents,
  subscriptionName,
  onAddNote,
}: SubscriptionComplianceJournalSheetProps) {
  const { t, lang } = useTranslation();
  const [category, setCategory] = useState<string>('all');
  const [note, setNote] = useState('');
  const { sectionLabel, elementLabel } = useAuditLabels({ sections, documents });

  const journal = useMemo(
    () =>
      entries
        .filter(entry => complianceCategoryOf(entry.type) !== null)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [entries],
  );
  const countOf = (value: string) => journal.filter(entry => complianceCategoryOf(entry.type) === value).length;
  const scoped = useMemo(
    () => (category === 'all' ? journal : journal.filter(entry => complianceCategoryOf(entry.type) === category)),
    [journal, category],
  );

  const handleAddNote = () => {
    if (!note.trim()) return;
    onAddNote(note.trim());
    setNote('');
  };

  const handleExportAll = () => {
    downloadAuditCsv({
      entries: journal,
      fileName: `journal_conformite_${subscriptionName}.csv`,
      groupColumn: {
        header: t(`${J}.columns.category`),
        value: entry => t(`${J}.categories.${complianceCategoryOf(entry.type)}`),
      },
      sectionLabel,
      elementLabel,
      t,
      lang,
    });
    toast.success(t(`${J}.exportedToast`), {
      description: t(`${J}.exportedToastDesc`, { count: journal.length }),
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={t(`${J}.title`)} description={t(`${J}.description`, { count: journal.length })}>
          <div className="mt-3">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-11" aria-label={t(`${J}.categoryFilter`)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t(`${J}.allCategories`)} ({journal.length})
                </SelectItem>
                {COMPLIANCE_JOURNAL_CATEGORIES.map(value => (
                  <SelectItem key={value} value={value}>
                    {t(`${J}.categories.${value}`)} ({countOf(value)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SidePanelHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={note}
              onChange={event => setNote(event.target.value)}
              onKeyDown={event => event.key === 'Enter' && handleAddNote()}
              placeholder={t(`${J}.notePlaceholder`)}
              aria-label={t(`${J}.notePlaceholder`)}
              className="h-11"
            />
            <Button variant="outline" className="h-11 gap-2 shrink-0" onClick={handleAddNote} disabled={!note.trim()}>
              <MessageSquare className="w-4 h-4" />
              {t(`${J}.addNote`)}
            </Button>
          </div>
          <AuditTimeline
            entries={scoped}
            sections={sections}
            documents={documents}
            exportFileName={`journal_conformite_${subscriptionName}`}
            showElement
          />
        </div>
        <SidePanelFooter className="justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t(`${T}.close`)}
          </Button>
          <Button variant="primary" onClick={handleExportAll} className="gap-2">
            <Download className="w-4 h-4" />
            {t(`${J}.exportAll`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
