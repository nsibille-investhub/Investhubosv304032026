import { useMemo } from 'react';
import {
  AlertTriangle,
  Ban,
  BellRing,
  CircleCheck,
  CircleSlash,
  FilePlus,
  FileUp,
  History,
  MessageSquareText,
  Pencil,
  RotateCw,
  Scale,
  Send,
  Undo2,
} from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalCall } from '../../utils/capitalCallGenerator';
import type { CapitalCallLine } from '../../utils/capitalCallLines';
import {
  JOURNAL_EVENT_TYPES,
  JournalEntry,
  JournalEventType,
  V3_GO_LIVE,
  buildCapitalCallJournal,
} from '../../utils/capitalCallJournal';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card } from '../ui/card';
import { Timeline, TimelineEvent, TimelineTypeMap } from '../ui/timeline';

const K = 'funds.capitalCalls.detail.journal';

const ICONS: Record<JournalEventType, typeof FilePlus> = {
  created: FilePlus,
  edited: Pencil,
  noticeFailed: AlertTriangle,
  noticeRelaunched: RotateCw,
  notified: Send,
  reminded: BellRing,
  paymentValidated: CircleCheck,
  paymentCancelled: CircleSlash,
  overpaymentTreated: Scale,
  lineCancelled: Ban,
  commented: MessageSquareText,
  noticeReplaced: FileUp,
  notificationCancelled: Undo2,
};

export function CapitalCallJournalTab({ call, lines }: { call: CapitalCall; lines: CapitalCallLine[] }) {
  const { t, lang } = useTranslation();
  const journal = useMemo(() => buildCapitalCallJournal(call, lines), [call, lines]);
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });

  const types = useMemo(() => {
    const map = {} as TimelineTypeMap<JournalEventType>;
    JOURNAL_EVENT_TYPES.forEach(type => {
      map[type] = { label: t(`${K}.types.${type}`), Icon: ICONS[type] };
    });
    return map;
  }, [t]);

  const describe = (entry: JournalEntry) => {
    const parts =
      entry.lineCount === 0 ? [t(`${K}.wholeCall`)] : [t(entry.lineCount === 1 ? `${K}.linesOne` : `${K}.linesMany`, { count: entry.lineCount })];
    if (entry.detail?.kind === 'reason') {
      parts.push(t(`funds.capitalCalls.detail.lines.failureReasons.${entry.detail.reason}`));
    }
    if (entry.detail?.kind === 'change') {
      parts.push(
        t(`${K}.change.${entry.detail.field}`, {
          from: dateFormat.format(entry.detail.from),
          to: dateFormat.format(entry.detail.to),
        }),
      );
    }
    if (entry.detail?.kind === 'paymentOrigin') {
      parts.push(
        t(`${K}.paymentOrigin`, {
          origin: t(`funds.capitalCalls.detail.lines.paymentOrigins.${entry.detail.origin}`),
        }),
        new Intl.NumberFormat(lang, { style: 'currency', currency: call.currency }).format(entry.detail.amount),
      );
    }
    if (entry.detail?.kind === 'treatment') {
      parts.push(t(`funds.capitalCalls.detail.lines.treatments.${entry.detail.treatment}`));
    }
    if (entry.detail?.kind === 'text') {
      parts.push(t(`${K}.quote`, { text: entry.detail.text }));
    }
    return parts.join(' · ');
  };

  const events: TimelineEvent<JournalEventType>[] = journal.entries.map(entry => ({
    id: entry.id,
    type: entry.type,
    timestamp: entry.at.toISOString(),
    actorName: entry.author ?? t(`${K}.system`),
    actorRole: entry.author ? t(`${K}.roles.user`) : t(`${K}.roles.system`),
    description: describe(entry),
  }));

  return (
    <div className="space-y-4">
      {journal.startsAtGoLive && (
        <Alert>
          <History className="h-4 w-4" />
          <AlertTitle>{t(`${K}.goLive.title`)}</AlertTitle>
          <AlertDescription>{t(`${K}.goLive.description`, { date: dateFormat.format(V3_GO_LIVE) })}</AlertDescription>
        </Alert>
      )}
      <Card className="p-6 shadow-sm">
        <Timeline<JournalEventType>
          events={events}
          types={types}
          enableFilters
          pageSize={20}
          emptyLabel={t(`${K}.empty`)}
          emptyFilteredLabel={t(`${K}.emptyFiltered`)}
        />
      </Card>
      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Ban className="h-3.5 w-3.5" aria-hidden />
        {t(`${K}.readOnly`)}
      </p>
    </div>
  );
}
