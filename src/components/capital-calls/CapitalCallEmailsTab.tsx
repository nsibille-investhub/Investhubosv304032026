import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Layers, Mail, MailOpen, Send } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import {
  CapitalCallEmail,
  EMAIL_STATES,
  EMAIL_TYPES,
  EmailState,
} from '../../utils/capitalCallEmails';
import { ColumnConfig, DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, FilterConfig } from '../FilterBar';
import { HighlightText } from '../HighlightText';
import { StatusBadge, StatusVariant } from '../StatusBadge';
import { Button } from '../ui/button';
import { ListingCard } from '../ui/listing';
import { DataPagination } from '../ui/data-pagination';

const K = 'funds.capitalCalls.detail.emails';

const STATE_VARIANT: Record<EmailState, StatusVariant> = {
  sent: 'neutral',
  delivered: 'success',
  opened: 'success',
  softBounce: 'warning',
  failed: 'danger',
  spam: 'danger',
  notFound: 'danger',
};

type ActiveFilters = Record<string, string | string[]>;

export function CapitalCallEmailsTab({
  emails,
  preset,
}: {
  emails: CapitalCallEmail[];
  /** Filtre d'état appliqué depuis un compteur de la synthèse. */
  preset?: { values: string[]; nonce: number } | null;
}) {
  const { t, lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    if (!preset) return;
    setSearch('');
    setActiveFilters({ state: preset.values });
    setPage(1);
  }, [preset]);

  const dateTime = (value: Date) =>
    t('funds.capitalCalls.detail.lines.dateTime', {
      date: new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value),
      time: new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' }).format(value),
    });
  const empty = <span className="text-muted-foreground">-</span>;

  const filterConfigs: FilterConfig[] = [
    {
      id: 'type',
      label: t(`${K}.filters.type`),
      type: 'multiselect',
      isPrimary: true,
      options: EMAIL_TYPES.map(value => ({ value, label: t(`${K}.types.${value}`) })),
    },
    {
      id: 'state',
      label: t(`${K}.filters.state`),
      type: 'multiselect',
      isPrimary: true,
      options: EMAIL_STATES.map(value => ({ value, label: t(`${K}.states.${value}`) })),
    },
  ];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const pick = (id: string) => (Array.isArray(activeFilters[id]) ? (activeFilters[id] as string[]) : []);
    const types = pick('type');
    const states = pick('state');
    return emails.filter(email => {
      if (term && !(email.recipient ?? '').toLowerCase().includes(term)) return false;
      if (types.length > 0 && !types.includes(email.type)) return false;
      if (states.length > 0 && !states.includes(email.state)) return false;
      return true;
    });
  }, [emails, search, activeFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setSearch('');
    setActiveFilters({});
    setPage(1);
  };

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) delete next[filterId];
      else next[filterId] = value;
      return next;
    });
    setPage(1);
  };

  const columns: ColumnConfig<CapitalCallEmail>[] = [
    {
      key: 'recipient',
      label: t(`${K}.columns.recipient`),
      render: (email, term) =>
        email.recipient ? (
          <HighlightText text={email.recipient} searchTerm={term} className="text-sm font-medium text-foreground" />
        ) : (
          <span className="text-sm text-muted-foreground">{t(`${K}.noRecipient`)}</span>
        ),
    },
    {
      key: 'copies',
      label: t(`${K}.columns.copies`),
      render: email => (email.copies.length > 0 ? <span className="text-sm">{email.copies.join(', ')}</span> : empty),
    },
    {
      key: 'type',
      label: t(`${K}.columns.type`),
      render: email => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm">
          {email.type === 'notification' ? (
            <Send className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          ) : (
            <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          )}
          {t(`${K}.types.${email.type}`)}
        </span>
      ),
    },
    {
      key: 'notice',
      label: t(`${K}.columns.notice`),
      render: email => (
        <span className="flex flex-col gap-0.5 text-sm">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            {email.combined && <Layers className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
            {t(email.combined ? `${K}.notice.combined` : `${K}.notice.individual`)}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {t(email.subscriptions.length === 1 ? `${K}.notice.linesOne` : `${K}.notice.linesMany`, {
              count: email.subscriptions.length,
              subscriptions: email.subscriptions.join(', '),
            })}
          </span>
        </span>
      ),
    },
    {
      key: 'sentAt',
      label: t(`${K}.columns.sentAt`),
      render: email =>
        email.sentAt ? <span className="whitespace-nowrap text-sm tabular-nums">{dateTime(email.sentAt)}</span> : empty,
    },
    {
      key: 'state',
      label: t(`${K}.columns.state`),
      render: email => (
        <StatusBadge
          label={t(`${K}.states.${email.state}`)}
          variant={STATE_VARIANT[email.state]}
          icon={email.state === 'opened' ? MailOpen : ['failed', 'spam', 'notFound'].includes(email.state) ? AlertTriangle : undefined}
        />
      ),
    },
  ];

  const hasFiltering = Object.keys(activeFilters).length > 0 || search.trim().length > 0;

  return (
    <ListingCard
      toolbar={
        <FilterBar
          searchValue={search}
          onSearchChange={value => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder={t(`${K}.searchPlaceholder`)}
          filters={filterConfigs}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearAll={resetFilters}
        />
      }
      footer={
        filtered.length > 0 ? (
          <DataPagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filtered.length}
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
      {filtered.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={hasFiltering ? t(`${K}.empty.filteredTitle`) : t(`${K}.empty.title`)}
          description={hasFiltering ? t(`${K}.empty.filteredDescription`) : undefined}
          action={
            hasFiltering ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                {t(`${K}.empty.reset`)}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <DataTable
            data={pageRows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={() => undefined}
            sortConfig={null}
            onSort={() => undefined}
            searchTerm={search}
            compactMode
            hideSelection
            density="compact"
          />
        </>
      )}
    </ListingCard>
  );
}
