import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, FileText, Users, UserX } from 'lucide-react';

import { useTranslation } from '../../../utils/languageContext';
import {
  FundCallSettings,
  ShareSimulation,
  SimulatedExclusion,
  SimulatedLine,
  Simulation,
  remainingToCall,
} from '../../../utils/capitalCallWizard';
import { ColumnConfig, DataTable } from '../../DataTable';
import { EmptyState } from '../../EmptyState';
import { StatusBadge } from '../../StatusBadge';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { BIG_MODAL_COMPACT, BigModal, BigModalBody, BigModalContent, BigModalPanelHeader } from '../../ui/big-modal';
import { TableRowActions } from '../../ui/row-actions';
import { SectionCard } from '../../ui/section-card';
import { WidgetCard, WidgetMetric } from '../../ui/widget-card';

const K = 'funds.capitalCalls.wizard.control';

interface WizardControlStepProps {
  simulation: Simulation;
  settings: FundCallSettings;
  currency: string;
  callName: string;
  fundName: string;
  dueDate: Date;
}

export function WizardControlStep({ simulation, settings, currency, callName, fundName, dueDate }: WizardControlStepProps) {
  const { t, lang } = useTranslation();
  const [preview, setPreview] = useState<SimulatedLine | null>(null);
  const money = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      value,
    );
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });

  const shareColumns: ColumnConfig<ShareSimulation & { id: number }>[] = [
    {
      key: 'share',
      label: t(`${K}.shares.share`),
      render: row => <span className="text-sm font-medium">{t('funds.detail.sharePrefix', { name: row.share })}</span>,
    },
    { key: 'entered', label: t(`${K}.shares.entered`), align: 'right', render: row => <span className="text-sm">{money(row.entered)}</span> },
    { key: 'linesTotal', label: t(`${K}.shares.linesTotal`), align: 'right', render: row => <span className="text-sm">{money(row.linesTotal)}</span> },
    {
      key: 'roundingGap',
      label: t(`${K}.shares.roundingGap`),
      align: 'right',
      render: row => <span className="text-sm">{money(row.roundingGap)}</span>,
    },
  ];

  const lineColumns: ColumnConfig<SimulatedLine & { id: number }>[] = [
    { key: 'investor', label: t(`${K}.lines.investor`), render: row => <span className="text-sm font-medium">{row.subscription.investor}</span> },
    { key: 'subscription', label: t(`${K}.lines.subscription`), render: row => <span className="text-sm tabular-nums">{row.subscription.id}</span> },
    {
      key: 'share',
      label: t(`${K}.lines.share`),
      render: row => <span className="whitespace-nowrap text-sm">{t('funds.detail.sharePrefix', { name: row.subscription.share })}</span>,
    },
    { key: 'amount', label: t(`${K}.lines.amount`), align: 'right', render: row => <span className="text-sm">{money(row.amount)}</span> },
    {
      key: 'remaining',
      label: t(`${K}.lines.remaining`),
      align: 'right',
      render: row => {
        const remaining = remainingToCall(row.subscription);
        return row.amount > remaining ? (
          <StatusBadge label={t(`${K}.lines.overRemaining`, { amount: money(remaining) })} variant="danger" icon={AlertTriangle} />
        ) : (
          <span className="text-sm">{money(remaining)}</span>
        );
      },
    },
    {
      key: 'preview',
      label: '',
      align: 'right',
      className: 'ds-sticky-actions',
      render: row => (
        <TableRowActions actions={[{ label: t(`${K}.lines.preview`), icon: Eye, onClick: () => setPreview(row) }]} />
      ),
    },
  ];

  const exclusionColumns: ColumnConfig<SimulatedExclusion & { id: number }>[] = [
    { key: 'investor', label: t(`${K}.lines.investor`), render: row => <span className="text-sm font-medium">{row.subscription.investor}</span> },
    { key: 'subscription', label: t(`${K}.lines.subscription`), render: row => <span className="text-sm tabular-nums">{row.subscription.id}</span> },
    {
      key: 'share',
      label: t(`${K}.lines.share`),
      render: row => <span className="whitespace-nowrap text-sm">{t('funds.detail.sharePrefix', { name: row.subscription.share })}</span>,
    },
    {
      key: 'reason',
      label: t(`${K}.exclusions.reason`),
      render: row => <StatusBadge label={t(`${K}.exclusions.reasons.${row.reason}`)} variant="warning" />,
    },
  ];

  const tableProps = {
    hoveredRow: null,
    setHoveredRow: () => undefined,
    onRowClick: () => undefined,
    sortConfig: null,
    onSort: () => undefined,
    compactMode: true,
    hideSelection: true,
    density: 'compact' as const,
  };

  return (
    <div className="space-y-5">
      {simulation.blockers.length > 0 ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t(`${K}.blocked.title`)}</AlertTitle>
          <AlertDescription>
            <ul className="space-y-1">
              {simulation.blockers.map(blocker => (
                <li key={blocker}>
                  {blocker === 'overRemaining'
                    ? t(
                        simulation.overRemaining.length === 1
                          ? `${K}.blocked.reasons.overRemainingOne`
                          : `${K}.blocked.reasons.overRemainingMany`,
                        { count: simulation.overRemaining.length },
                      )
                    : t(`${K}.blocked.reasons.${blocker}`)}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{t(`${K}.ready.title`)}</AlertTitle>
          <AlertDescription>{t(`${K}.ready.description`)}</AlertDescription>
        </Alert>
      )}

      <WidgetCard title={t(`${K}.summary.title`)}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <WidgetMetric label={t(`${K}.summary.lines`)} value={simulation.lines.length} size="lg" />
          <WidgetMetric label={t(`${K}.summary.exclusions`)} value={simulation.exclusions.length} size="lg" />
          <WidgetMetric label={t(`${K}.summary.total`)} value={money(simulation.total)} size="lg" />
        </div>
      </WidgetCard>

      <p className="text-sm text-muted-foreground">
        {t(`${K}.allocation`, {
          mode: t(`funds.capitalCalls.wizard.amounts.allocation.${settings.perUnit ? 'perUnit' : settings.allocation}`),
        })}
      </p>

      <SectionCard mode="read" icon={FileText} title={t(`${K}.shares.title`)}>
        <DataTable data={simulation.shares.map((row, index) => ({ ...row, id: index + 1 }))} columns={shareColumns} {...tableProps} />
      </SectionCard>

      <SectionCard
        mode="read"
        icon={Users}
        title={t(`${K}.lines.title`)}
        summary={t(`${K}.lines.summary`, { count: simulation.lines.length })}
      >
        {simulation.lines.length === 0 ? (
          <EmptyState icon={Users} title={t(`${K}.lines.empty`)} />
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <DataTable data={simulation.lines.map((row, index) => ({ ...row, id: index + 1 }))} columns={lineColumns} {...tableProps} />
          </div>
        )}
      </SectionCard>

      <SectionCard
        mode="read"
        icon={UserX}
        title={t(`${K}.exclusions.title`)}
        summary={t(`${K}.exclusions.summary`, { count: simulation.exclusions.length })}
      >
        {simulation.exclusions.length === 0 ? (
          <EmptyState icon={UserX} title={t(`${K}.exclusions.empty`)} />
        ) : (
          <DataTable
            data={simulation.exclusions.map((row, index) => ({ ...row, id: index + 1 }))}
            columns={exclusionColumns}
            {...tableProps}
          />
        )}
      </SectionCard>

      <BigModal open={Boolean(preview)} onOpenChange={open => !open && setPreview(null)}>
        <BigModalContent className={`${BIG_MODAL_COMPACT} p-0 gap-0`}>
          <div className="flex flex-col overflow-hidden rounded-3xl">
            <BigModalPanelHeader
              icon={FileText}
              title={t(`${K}.preview.title`)}
              subtitle={t(`${K}.preview.description`)}
              onClose={() => setPreview(null)}
              closeLabel={t('common.confirmDialog.close')}
            />
            {preview && (
              <BigModalBody className="space-y-3 text-sm">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{fundName}</p>
                <p className="text-base font-semibold">{callName}</p>
                <p>{t(`${K}.preview.recipient`, { investor: preview.subscription.investor, subscription: preview.subscription.id })}</p>
                <p>{t(`${K}.preview.amount`, { amount: money(preview.amount) })}</p>
                <p>{t(`${K}.preview.dueDate`, { date: dateFormat.format(dueDate) })}</p>
                {settings.combinedNotices && <p className="text-xs text-muted-foreground">{t(`${K}.preview.combined`)}</p>}
              </BigModalBody>
            )}
          </div>
        </BigModalContent>
      </BigModal>
    </div>
  );
}
