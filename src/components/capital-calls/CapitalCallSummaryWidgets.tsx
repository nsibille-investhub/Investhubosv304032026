import type { ReactNode } from 'react';
import { Calculator, FileText, Send, Wallet } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CallState, CallSummary } from '../../utils/capitalCallSummary';
import type { StatusVariant } from '../StatusBadge';
import { WidgetCard, WidgetMetric } from '../ui/widget-card';
import type { Tone } from '../ui/tone';

const K = 'funds.capitalCalls.detail.summary';

export const CALL_STATE_VARIANT: Record<CallState, StatusVariant> = {
  draft: 'outline',
  sending: 'info',
  noticesGenerating: 'info',
  noticesFailed: 'danger',
  settled: 'success',
  partiallySettled: 'warning',
  notified: 'info',
  partiallyNotified: 'neutral',
  publishedWithoutSending: 'outline',
  readyToNotify: 'neutral',
};

/** Filtre appliqué à l'onglet ouvert par un compteur. */
export type LinesPreset = { filter: 'noticeState' | 'notification' | 'settlement'; values: string[] };

interface CapitalCallSummaryWidgetsProps {
  summary: CallSummary;
  currency: string;
  publication: 'onNotification' | 'immediate';
  onOpenLines: (preset: LinesPreset | null) => void;
  onOpenFailedEmails: () => void;
}

/** Compteur cliquable : ouvre la liste filtrée correspondante. */
function Counter({
  label,
  value,
  tone,
  onClick,
}: {
  label: string;
  value: number;
  tone?: Tone;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <WidgetMetric
      label={label}
      value={value}
      tone={value > 0 ? tone : undefined}
      onClick={onClick}
      ariaLabel={t(`${K}.openFiltered`, { label, count: value })}
    />
  );
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-2">{children}</div>;
}

export function CapitalCallSummaryWidgets({
  summary,
  currency,
  publication,
  onOpenLines,
  onOpenFailedEmails,
}: CapitalCallSummaryWidgetsProps) {
  const { t, lang } = useTranslation();
  const money = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const open = (filter: LinesPreset['filter'], value: string) => () => onOpenLines({ filter, values: [value] });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <WidgetCard icon={Calculator} title={t(`${K}.calculation.title`)}>
        <div className="space-y-2">
          <WidgetMetric label={t(`${K}.calculation.entered`)} value={money(summary.entered)} />
          <WidgetMetric label={t(`${K}.calculation.allocated`)} value={money(summary.allocated)} />
          <Grid>
            <WidgetMetric label={t(`${K}.calculation.roundingGap`)} value={money(summary.roundingGap)} />
            <Counter label={t(`${K}.calculation.lines`)} value={summary.lines} onClick={() => onOpenLines(null)} />
          </Grid>
        </div>
      </WidgetCard>

      <WidgetCard icon={FileText} title={t(`${K}.notices.title`)}>
        <Grid>
          <Counter label={t(`${K}.notices.available`)} value={summary.noticesAvailable} tone="success" onClick={open('noticeState', 'available')} />
          <Counter label={t(`${K}.notices.generating`)} value={summary.noticesGenerating} tone="info" onClick={open('noticeState', 'generating')} />
          <Counter label={t(`${K}.notices.failed`)} value={summary.noticesFailed} tone="danger" onClick={open('noticeState', 'failed')} />
          <Counter label={t(`${K}.notices.replaced`)} value={summary.noticesReplaced} onClick={open('noticeState', 'replaced')} />
        </Grid>
      </WidgetCard>

      <WidgetCard
        icon={Send}
        title={t(`${K}.notification.title`)}
        subtitle={t(`${K}.notification.publication.${publication}`)}
      >
        <Grid>
          <Counter label={t(`${K}.notification.notified`)} value={summary.notified} tone="info" onClick={open('notification', 'notified')} />
          <Counter label={t(`${K}.notification.toNotify`)} value={summary.toNotify} onClick={open('notification', 'toNotify')} />
          <Counter label={t(`${K}.notification.reminded`)} value={summary.reminded} onClick={open('notification', 'reminded')} />
          <Counter label={t(`${K}.notification.emailsFailed`)} value={summary.emailsFailed} tone="danger" onClick={onOpenFailedEmails} />
        </Grid>
      </WidgetCard>

      <WidgetCard icon={Wallet} title={t(`${K}.settlement.title`)}>
        <Grid>
          <Counter label={t(`${K}.settlement.paid`)} value={summary.paid} tone="success" onClick={open('settlement', 'paid')} />
          <Counter label={t(`${K}.settlement.compensated`)} value={summary.compensated} tone="success" onClick={open('settlement', 'compensated')} />
          <Counter
            label={t(`${K}.settlement.paymentDeclared`)}
            value={summary.paymentDeclared}
            tone="warning"
            onClick={open('settlement', 'paymentDeclared')}
          />
          <Counter label={t(`${K}.settlement.unpaid`)} value={summary.unpaid} tone="danger" onClick={open('settlement', 'unpaid')} />
        </Grid>
        <div className="mt-2 border-t border-border pt-2">
          <WidgetMetric
            label={t(`${K}.settlement.remainingDue`, { count: summary.paymentDeclared + summary.unpaid })}
            value={money(summary.remainingDue)}
          />
        </div>
      </WidgetCard>
    </div>
  );
}
