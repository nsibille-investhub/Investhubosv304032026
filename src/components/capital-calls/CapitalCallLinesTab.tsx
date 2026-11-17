import { useMemo, useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { Users } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalCall } from '../../utils/capitalCallGenerator';
import type { CapitalCallLine, LineState } from '../../utils/capitalCallLines';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { ListingCard, ListingNameCell } from '../ui/listing';
import { StatusBadge, StatusVariant } from '../StatusBadge';
import { DataPagination } from '../ui/data-pagination';

const K = 'funds.capitalCalls.detail.lines';

const LINE_STATE_VARIANT: Record<LineState, StatusVariant> = {
  toNotify: 'neutral',
  notified: 'info',
  paymentDeclared: 'warning',
  paid: 'success',
};

interface CapitalCallLinesTabProps {
  call: CapitalCall;
  lines: CapitalCallLine[];
}

export function CapitalCallLinesTab({ call, lines }: CapitalCallLinesTabProps) {
  const { t, lang } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...lines].sort((a, b) => a.investor.localeCompare(b.investor, lang) || a.id - b.id),
    [lines, lang],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const moneyFormat = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: call.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const empty = <span className="text-muted-foreground">-</span>;
  const date = (value: Date | null) =>
    value ? <span className="text-sm tabular-nums">{dateFormat.format(value)}</span> : empty;
  const amount = (value: number) => (value > 0 ? <span className="text-sm">{moneyFormat.format(value)}</span> : empty);

  const columns: ColumnConfig<CapitalCallLine>[] = [
    {
      key: 'investor',
      label: t(`${K}.columns.investor`),
      render: line => <ListingNameCell name={line.investor} />,
    },
    {
      key: 'subscription',
      label: t(`${K}.columns.subscription`),
      render: line => <span className="text-sm tabular-nums">{line.subscription}</span>,
    },
    {
      key: 'share',
      label: t(`${K}.columns.share`),
      render: line => (
        <span className="whitespace-nowrap text-sm">{t('funds.detail.sharePrefix', { name: line.share })}</span>
      ),
    },
    {
      key: 'calledAmount',
      label: t(`${K}.columns.calledAmount`),
      align: 'right',
      render: line => <span className="text-sm">{moneyFormat.format(line.calledAmount)}</span>,
    },
    { key: 'fees', label: t(`${K}.columns.fees`), align: 'right', render: line => amount(line.fees) },
    { key: 'premium', label: t(`${K}.columns.premium`), align: 'right', render: line => amount(line.premium) },
    {
      key: 'total',
      label: t(`${K}.columns.total`),
      align: 'right',
      render: line => <span className="text-sm font-medium">{moneyFormat.format(line.total)}</span>,
    },
    {
      key: 'state',
      label: t(`${K}.columns.state`),
      render: line => <StatusBadge label={t(`${K}.states.${line.state}`)} variant={LINE_STATE_VARIANT[line.state]} />,
    },
    { key: 'notifiedAt', label: t(`${K}.columns.notifiedAt`), render: line => date(line.notifiedAt) },
    { key: 'paidAt', label: t(`${K}.columns.paidAt`), render: line => date(line.paidAt) },
  ];

  return (
    <ListingCard
      footer={
        sorted.length > 0 ? (
          <DataPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={sorted.length}
            onPageChange={next => setPage(Math.min(Math.max(1, next), totalPages))}
            onPageSizeChange={size => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
          />
        ) : undefined
      }
    >
      {sorted.length === 0 ? (
        <EmptyState icon={Users} title={t(`${K}.empty.title`)} />
      ) : (
        <DataTable
          data={pageRows}
          columns={columns}
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
          onRowClick={line => toast.info(t('funds.capitalCalls.detail.toast.notInMockup', { name: line.investor }))}
          sortConfig={null}
          onSort={() => undefined}
          compactMode
          hideSelection
          density="compact"
        />
      )}
    </ListingCard>
  );
}
