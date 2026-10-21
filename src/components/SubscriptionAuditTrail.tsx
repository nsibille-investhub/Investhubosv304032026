import { useMemo, useState } from 'react';
import {
  BellRing,
  CalendarCheck,
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
  Send,
  TextCursorInput,
  XCircle,
} from 'lucide-react';
import { Button } from './ui/button';
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
  SUBSCRIPTION_AUDIT_EVENT_TYPES,
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
              {showElement && (
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
              ) : entry.type === 'notificationSent' ? (
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
              {entry.reason && entry.type !== 'notificationSent' && (
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
