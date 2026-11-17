import { useState, type ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { Layers, Paperclip, SlidersHorizontal } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalCall, CapitalCallAttachment, CapitalCallShare } from '../../utils/capitalCallGenerator';
import type { FundCallSettings } from '../../utils/capitalCallWizard';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { DetailLink } from '../ui/detail-summary';
import { SectionCard, SectionFieldRow } from '../ui/section-card';

const K = 'funds.capitalCalls.detail.parameters';

type ShareRow = CapitalCallShare & { id: number };

interface CapitalCallParametersTabProps {
  call: CapitalCall;
  settings: FundCallSettings;
}

export function CapitalCallParametersTab({ call, settings }: CapitalCallParametersTabProps) {
  const { t, lang } = useTranslation();
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const moneyFormat = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: call.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const percentFormat = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 2 });
  const sizeFormat = new Intl.NumberFormat(lang, { maximumFractionDigits: 1 });
  const empty = <span className="text-muted-foreground">-</span>;
  const money = (value: number | null): ReactNode =>
    value === null ? empty : <span className="text-sm">{moneyFormat.format(value)}</span>;
  const yesNo = (value: boolean) => <span className="text-sm">{t(value ? `${K}.yes` : `${K}.no`)}</span>;
  const notInMockup = (name: string) => toast.info(t('funds.capitalCalls.detail.toast.notInMockup', { name }));

  const attachment = (file: CapitalCallAttachment | undefined) =>
    file && (
      <>
        <DetailLink
          icon={Paperclip}
          onClick={() => toast.info(t('funds.capitalCalls.detail.toast.download', { name: file.name }))}
        >
          {file.name}
        </DetailLink>
        <span className="text-xs font-normal text-muted-foreground">
          {t(`${K}.general.size`, {
            size: sizeFormat.format(file.sizeKb >= 1000 ? file.sizeKb / 1000 : file.sizeKb),
            unit: t(file.sizeKb >= 1000 ? `${K}.general.mb` : `${K}.general.kb`),
          })}
        </span>
      </>
    );

  // Une part sans montant ni frais ni prime appelés n'entre pas dans la ventilation.
  const rows: ShareRow[] = call.shares
    .filter(share => share.amount > 0 || share.entryFeesCalled || share.premiumCalled)
    .map((share, index) => ({ ...share, id: index + 1 }));

  const columns: ColumnConfig<ShareRow>[] = [
    {
      key: 'share',
      label: t(`${K}.breakdown.columns.share`),
      render: row => (
        <span className="whitespace-nowrap text-sm font-medium">{t('funds.detail.sharePrefix', { name: row.share })}</span>
      ),
    },
    {
      key: 'percent',
      label: t(`${K}.breakdown.columns.percent`),
      align: 'right',
      render: row =>
        row.percent === null ? empty : <span className="text-sm">{percentFormat.format(row.percent / 100)}</span>,
    },
    { key: 'amount', label: t(`${K}.breakdown.columns.amount`), align: 'right', render: row => money(row.amount) },
    {
      key: 'released',
      label: t(`${K}.breakdown.columns.released`),
      align: 'right',
      render: row => money(row.releasedAmount),
    },
    ...(settings.netFlow
      ? [
          {
            key: 'netCashFlow',
            label: t(`${K}.breakdown.columns.netCashFlow`),
            align: 'right' as const,
            render: (row: ShareRow) => money(row.netCashFlow),
          },
        ]
      : []),
    ...(settings.perUnit
      ? [
          {
            key: 'amountPerUnit',
            label: t(`${K}.breakdown.columns.amountPerUnit`),
            align: 'right' as const,
            render: (row: ShareRow) => money(row.amountPerUnit),
          },
          {
            key: 'releasedPerUnit',
            label: t(`${K}.breakdown.columns.releasedPerUnit`),
            align: 'right' as const,
            render: (row: ShareRow) => money(row.releasedPerUnit),
          },
          {
            key: 'netCashFlowPerUnit',
            label: t(`${K}.breakdown.columns.netCashFlowPerUnit`),
            align: 'right' as const,
            render: (row: ShareRow) => money(row.netCashFlowPerUnit),
          },
        ]
      : []),
    { key: 'feesCalled', label: t(`${K}.breakdown.columns.feesCalled`), render: row => yesNo(row.entryFeesCalled) },
    {
      key: 'premiumCalled',
      label: t(`${K}.breakdown.columns.premiumCalled`),
      render: row => yesNo(row.premiumCalled),
    },
    {
      key: 'restriction',
      label: t(`${K}.breakdown.columns.restriction`),
      render: row =>
        row.restrictedTo === null ? (
          empty
        ) : (
          <span className="whitespace-nowrap text-sm">
            {t(row.restrictedTo === 1 ? `${K}.breakdown.restrictedOne` : `${K}.breakdown.restrictedMany`, {
              count: row.restrictedTo,
            })}
          </span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <SectionCard mode="read" icon={SlidersHorizontal} title={t(`${K}.general.title`)}>
        <SectionFieldRow mode="read" label={t(`${K}.general.name`)} value={call.name} />
        <SectionFieldRow mode="read" label={t(`${K}.general.dueDate`)} value={dateFormat.format(call.dueDate)} />
        <SectionFieldRow
          mode="read"
          label={t(`${K}.general.noticeDate`)}
          value={call.noticeDate && dateFormat.format(call.noticeDate)}
        />
        <SectionFieldRow
          mode="read"
          label={t(`${K}.general.notification`)}
          value={
            <span className="flex flex-col gap-1">
              <span>{t(call.diffusion.notify ? `${K}.yes` : `${K}.no`)}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {t(call.diffusion.notify ? `${K}.general.notificationYesHint` : `${K}.general.notificationNoHint`)}
              </span>
            </span>
          }
        />
        <SectionFieldRow
          mode="read"
          label={t(`${K}.general.forecast`)}
          value={
            call.forecast && (
              <DetailLink onClick={() => notInMockup(call.forecast!.name)}>{call.forecast.name}</DetailLink>
            )
          }
        />
        <SectionFieldRow
          mode="read"
          label={t(`${K}.general.distributions`)}
          value={
            call.compensations.length > 0 &&
            call.compensations.map(item => (
              <DetailLink key={item.id} onClick={() => notInMockup(item.name)}>
                {item.name}
              </DetailLink>
            ))
          }
        />
        <SectionFieldRow
          mode="read"
          label={t(`${K}.general.description`)}
          value={call.message && <span className="whitespace-pre-line font-normal">{call.message}</span>}
        />
        <SectionFieldRow mode="read" label={t(`${K}.general.attachment1`)} value={attachment(call.attachments[0])} />
        <SectionFieldRow mode="read" label={t(`${K}.general.attachment2`)} value={attachment(call.attachments[1])} />
      </SectionCard>

      <SectionCard mode="read" icon={Layers} title={t(`${K}.breakdown.title`)}>
        {rows.length === 0 ? (
          <EmptyState icon={Layers} title={t(`${K}.breakdown.empty`)} />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={() => undefined}
            sortConfig={null}
            onSort={() => undefined}
            compactMode
            hideSelection
            density="compact"
            footer={{
              share: t(`${K}.breakdown.total`),
              amount: money(call.calledAmount),
              released: money(call.releasedAmount),
              netCashFlow: money(call.netCashFlow),
            }}
          />
        )}
      </SectionCard>
    </div>
  );
}
