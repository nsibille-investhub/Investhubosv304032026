import type { ReactNode } from 'react';
import {
  ArrowDownCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  KeyRound,
  LineChart,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { FieldTarget, FundDetail } from '../../utils/fundDetailMock';
import { FundStatusBadge } from '../FundStatusBadge';
import { StatusBadge } from '../StatusBadge';
import { useMonthLabels } from '../ui/day-month-picker';
import { SegmentedProgress } from '../ui/segmented-progress';
import { WidgetCard, WidgetMetric } from '../ui/widget-card';
import { toneText } from '../ui/tone';

const K = 'funds.detail.overview';

interface FundOverviewTabProps {
  detail: FundDetail;
  onNavigate: (target: FieldTarget) => void;
  onOpenTab: (tab: string) => void;
  onOpenSubscriptions: () => void;
}

const percentOf = (value: number, total: number | null) =>
  total && total > 0 ? Math.round((value / total) * 100) : 0;

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground tabular-nums">{children}</span>
    </div>
  );
}

function LinkButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {children}
      <ArrowRight className="w-3.5 h-3.5" />
    </button>
  );
}

function ConfigurationWidget({ detail, onNavigate }: Pick<FundOverviewTabProps, 'detail' | 'onNavigate'>) {
  const { t } = useTranslation();
  const missing = detail.missingConfig.length;
  const done = detail.configChecksTotal - missing;

  return (
    <WidgetCard
      icon={ClipboardCheck}
      title={t(`${K}.config.title`)}
      subtitle={t(`${K}.config.progress`, { done, total: detail.configChecksTotal })}
      action={
        missing === 0 ? (
          <StatusBadge label={t(`${K}.config.complete`)} variant="success" icon={CheckCircle2} />
        ) : (
          <StatusBadge
            label={t(missing === 1 ? `${K}.config.missingOne` : `${K}.config.missingMany`, { count: missing })}
            variant="danger"
          />
        )
      }
    >
      <SegmentedProgress
        total={detail.configChecksTotal}
        ariaLabel={t(`${K}.config.progress`, { done, total: detail.configChecksTotal })}
        segments={[
          { id: 'done', value: done, tone: 'success' },
          { id: 'missing', value: missing, tone: 'danger' },
        ]}
      />
      {missing === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{t(`${K}.config.completeDescription`)}</p>
      ) : (
        <>
          <p className="mt-3 text-xs text-muted-foreground">{t(`${K}.config.description`)}</p>
          <ul className="mt-2 divide-y divide-border rounded-lg border border-border">
            {detail.missingConfig.map(item => (
              <li key={`${item.key}-${item.target.fieldId}`}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.target)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <TriangleAlert className="w-4 h-4 shrink-0" style={toneText('danger')} aria-hidden />
                  <span className="flex-1 text-foreground">
                    {t(`${K}.config.items.${item.key}`, { name: item.detail ?? '' })}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    {t(`${K}.config.goTo.${item.target.tab}`)}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </WidgetCard>
  );
}

export function FundOverviewTab({ detail, onNavigate, onOpenTab, onOpenSubscriptions }: FundOverviewTabProps) {
  const { t } = useTranslation();
  const months = useMonthLabels();
  const money = (value: number) => formatCurrency(value, detail.currency);
  const collectedPercent = percentOf(detail.subscribed, detail.targetSize);
  const calledPercent = percentOf(detail.called, detail.subscribed);
  const remaining = Math.max(detail.subscribed - detail.called, 0);
  const pendingTotal = detail.pendingSubscriptions.reduce((acc, item) => acc + item.count, 0);
  const missingNav = new Map(detail.expectedNavMissing.map(item => [item.shareId, item.expectedDate]));

  const dayMonth = (value: { day: number; month: number }) =>
    t(`${K}.calendar.dayMonth`, { day: value.day, month: months[value.month - 1].toLowerCase() });

  return (
    <div className="space-y-4">
      <ConfigurationWidget detail={detail} onNavigate={onNavigate} />
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

      <WidgetCard
        icon={CircleDollarSign}
        title={t(`${K}.collection.title`)}
        footer={<LinkButton onClick={onOpenSubscriptions}>{t(`${K}.collection.openSubscriptions`)}</LinkButton>}
      >
        <WidgetMetric
          size="lg"
          label={t(`${K}.collection.subscribed`)}
          value={money(detail.subscribed)}
          secondary={
            detail.targetSize
              ? t(`${K}.collection.ofTarget`, { target: money(detail.targetSize), percent: collectedPercent })
              : t(`${K}.collection.noTarget`)
          }
        />
        {detail.targetSize && (
          <SegmentedProgress
            className="mt-2"
            total={detail.targetSize}
            ariaLabel={t(`${K}.collection.ofTarget`, { target: money(detail.targetSize), percent: collectedPercent })}
            segments={[{ id: 'subscribed', value: Math.min(detail.subscribed, detail.targetSize), tone: 'success' }]}
          />
        )}
        <div className="mt-3">
          <Row label={t(`${K}.collection.investors`)}>{detail.investors}</Row>
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          {t(`${K}.collection.pending`, { count: pendingTotal })}
        </p>
        <div className="mt-1 flex flex-wrap gap-2">
          {detail.pendingSubscriptions.map(item => (
            <StatusBadge
              key={item.status}
              variant={item.count > 0 ? 'info' : 'neutral'}
              label={t(`${K}.collection.byStatus`, {
                status: t(`${K}.subscriptionStatus.${item.status}`),
                count: item.count,
              })}
            />
          ))}
        </div>
      </WidgetCard>

      {detail.paymentMode === 'calls' && (
        <WidgetCard icon={Wallet} title={t(`${K}.calls.title`)}>
          <div className="grid grid-cols-2 gap-3">
            <WidgetMetric label={t(`${K}.calls.called`)} value={money(detail.called)} />
            <WidgetMetric label={t(`${K}.calls.remaining`)} value={money(remaining)} />
          </div>
          <SegmentedProgress
            className="mt-3"
            total={detail.subscribed || 1}
            ariaLabel={t(`${K}.calls.percent`, { percent: calledPercent })}
            segments={[{ id: 'called', value: detail.called, tone: 'info' }]}
          />
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            {t(`${K}.calls.percent`, { percent: calledPercent })}
          </p>
          <div className="mt-2">
            <Row label={t(`${K}.calls.last`)}>
              {detail.lastCall
                ? t(`${K}.amountOnDate`, { amount: money(detail.lastCall.amount), date: formatDate(detail.lastCall.date) })
                : t(`${K}.none`)}
            </Row>
          </div>
        </WidgetCard>
      )}

      <WidgetCard icon={ArrowDownCircle} title={t(`${K}.distributions.title`)}>
        <WidgetMetric size="lg" label={t(`${K}.distributions.distributed`)} value={money(detail.distributed)} />
        <div className="mt-3">
          <Row label={t(`${K}.distributions.last`)}>
            {detail.lastDistribution
              ? t(`${K}.amountOnDate`, {
                  amount: money(detail.lastDistribution.amount),
                  date: formatDate(detail.lastDistribution.date),
                })
              : t(`${K}.none`)}
          </Row>
        </div>
      </WidgetCard>

      <WidgetCard
        icon={LineChart}
        title={t(`${K}.valuation.title`)}
        footer={<LinkButton onClick={() => onOpenTab('navs')}>{t(`${K}.valuation.openNavs`)}</LinkButton>}
      >
        <ul className="divide-y divide-border">
          {detail.shares.map(share => {
            const expected = missingNav.get(share.id);
            return (
              <li key={share.id} className="py-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{t('funds.detail.sharePrefix', { name: share.name })}</span>
                  <span className="text-right font-medium text-foreground tabular-nums">
                    {share.lastNav
                      ? t(`${K}.amountOnDate`, { amount: money(share.lastNav.value), date: formatDate(share.lastNav.date) })
                      : t(`${K}.valuation.noValue`)}
                  </span>
                </div>
                {expected && (
                  <div className="mt-1">
                    <StatusBadge
                      variant="warning"
                      icon={TriangleAlert}
                      label={t(`${K}.valuation.expectedMissing`, { date: formatDate(expected) })}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-2 border-t border-border pt-2">
          <Row label={t(`${K}.valuation.netAsset`)}>
            {detail.netAsset
              ? t(`${K}.amountOnDate`, { amount: money(detail.netAsset.value), date: formatDate(detail.netAsset.date) })
              : t(`${K}.none`)}
          </Row>
        </div>
      </WidgetCard>

      <WidgetCard icon={CalendarDays} title={t(`${K}.calendar.title`)}>
        <Row label={t(`${K}.calendar.status`)}>
          <FundStatusBadge status={detail.status} />
        </Row>
        <Row label={t(`${K}.calendar.start`)}>
          {detail.collectionStart ? formatDate(detail.collectionStart) : t(`${K}.noDate`)}
        </Row>
        <Row label={t(`${K}.calendar.end`)}>
          {detail.collectionEnd ? formatDate(detail.collectionEnd) : t(`${K}.noDate`)}
        </Row>
        <Row label={t(`${K}.calendar.closing`)}>
          {detail.closingDate ? formatDate(detail.closingDate) : t(`${K}.noDate`)}
        </Row>
        {detail.evergreen && detail.liquidityWindow && (
          <Row label={t(`${K}.calendar.liquidity`)}>
            {t(`${K}.calendar.window`, {
              from: dayMonth(detail.liquidityWindow.from),
              to: dayMonth(detail.liquidityWindow.to),
            })}
          </Row>
        )}
        {detail.nextCentralization && (
          <Row label={t(`${K}.calendar.centralization`)}>{formatDate(detail.nextCentralization)}</Row>
        )}
      </WidgetCard>

      <WidgetCard
        icon={KeyRound}
        title={t(`${K}.access.title`)}
        footer={
          detail.modules.partners ? (
            <LinkButton onClick={() => onOpenTab('distribution')}>{t(`${K}.access.openDistribution`)}</LinkButton>
          ) : undefined
        }
      >
        <p className="text-xs font-medium text-muted-foreground">{t(`${K}.access.channels`)}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {detail.channels.length === 0 ? (
            <StatusBadge variant="neutral" label={t(`${K}.access.noChannel`)} />
          ) : (
            detail.channels.map(channel => (
              <StatusBadge key={channel} variant="success" label={t(`${K}.access.channel.${channel}`)} />
            ))
          )}
        </div>
        <div className="mt-3">
          <Row label={t(`${K}.access.distributors`)}>{detail.distributorsCount}</Row>
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">{t(`${K}.access.segments`)}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {detail.segments.map(segment => (
            <StatusBadge key={segment} variant="outline" label={t(`${K}.access.segment.${segment}`)} />
          ))}
        </div>
      </WidgetCard>
    </div>
    </div>
  );
}
