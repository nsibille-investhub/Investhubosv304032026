import { useEffect, useMemo, useState } from 'react';
import { CheckSquare, Hourglass, ListChecks, Repeat, SquareX } from 'lucide-react';

import { useTranslation } from '../../../utils/languageContext';
import { WizardSubscription, alreadyCalled } from '../../../utils/capitalCallWizard';
import { ColumnConfig, DataTable } from '../../DataTable';
import { EmptyState } from '../../EmptyState';
import { FilterBar, FilterConfig } from '../../FilterBar';
import { StatusBadge } from '../../StatusBadge';
import { BigModal, BigModalBody, BigModalContent, BigModalPanelFooter, BigModalPanelHeader } from '../../ui/big-modal';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { ListingCard, ListingIndicator, ListingNameCell } from '../../ui/listing';

const K = 'funds.capitalCalls.wizard.amounts.restriction.picker';

type Filters = Record<string, string | string[]>;

interface Row extends WizardSubscription {
  /** Identifiant numérique exigé par le tableau ; l'identifiant de la souscription reste `subscriptionId`. */
  id: number;
  subscriptionId: string;
}

interface SubscriptionPickerModalProps {
  open: boolean;
  share: string;
  subscriptions: WizardSubscription[];
  /** Souscriptions retenues ; vide : toute la part est appelée. */
  value: string[];
  money: (value: number) => string;
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}

/**
 * Choix des souscriptions appelées sur une part : les filtres réduisent la liste,
 * les actions rapides portent sur les lignes affichées.
 */
export function SubscriptionPickerModal({ open, share, subscriptions, value, money, onClose, onConfirm }: SubscriptionPickerModalProps) {
  const { t, lang } = useTranslation();
  const [selection, setSelection] = useState<Set<string>>(new Set(value));
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelection(new Set(value));
    setSearch('');
    setFilters({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const integer = new Intl.NumberFormat(lang);

  const rows = useMemo<Row[]>(
    () => subscriptions.map((item, index) => ({ ...item, id: index + 1, subscriptionId: item.id })),
    [subscriptions],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const pick = (id: string) => (Array.isArray(filters[id]) ? (filters[id] as string[]) : []);
    const retention = pick('retention');
    const history = pick('history');
    const selected = pick('selection');
    return rows.filter(row => {
      if (term && ![row.investor, row.subscriptionId].some(text => text.toLowerCase().includes(term))) return false;
      if (retention.length > 0 && !retention.includes(row.retentionOption ? 'with' : 'without')) return false;
      if (history.length > 0 && !history.includes(alreadyCalled(row) > 0 ? 'alreadyCalled' : 'firstCall')) return false;
      if (selected.length > 0 && !selected.includes(selection.has(row.subscriptionId) ? 'selected' : 'notSelected')) return false;
      return true;
    });
  }, [rows, search, filters, selection]);

  const toggle = (id: string) =>
    setSelection(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const update = (apply: (next: Set<string>, id: string) => void) =>
    setSelection(prev => {
      const next = new Set(prev);
      visible.forEach(row => apply(next, row.subscriptionId));
      return next;
    });

  const filterConfigs: FilterConfig[] = [
    {
      id: 'retention',
      label: t(`${K}.filters.retention`),
      type: 'multiselect',
      isPrimary: true,
      options: ['with', 'without'].map(item => ({ value: item, label: t(`${K}.filters.retentionOptions.${item}`) })),
    },
    {
      id: 'history',
      label: t(`${K}.filters.history`),
      type: 'multiselect',
      isPrimary: true,
      options: ['firstCall', 'alreadyCalled'].map(item => ({ value: item, label: t(`${K}.filters.historyOptions.${item}`) })),
    },
    {
      id: 'selection',
      label: t(`${K}.filters.selection`),
      type: 'multiselect',
      isPrimary: true,
      options: ['selected', 'notSelected'].map(item => ({ value: item, label: t(`${K}.filters.selectionOptions.${item}`) })),
    },
  ];

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'select',
      label: '',
      render: row => (
        <Checkbox
          checked={selection.has(row.subscriptionId)}
          onCheckedChange={() => toggle(row.subscriptionId)}
          onClick={event => event.stopPropagation()}
          aria-label={t(`${K}.selectRow`, { id: row.subscriptionId })}
        />
      ),
    },
    {
      key: 'subscription',
      label: t(`${K}.columns.subscription`),
      render: (row, term) => (
        <ListingNameCell
          name={row.subscriptionId}
          searchTerm={term}
          adornment={row.retentionOption && <ListingIndicator icon={Hourglass} label={t(`${K}.retention`)} />}
        />
      ),
    },
    { key: 'investor', label: t(`${K}.columns.investor`), render: row => <span className="text-sm">{row.investor}</span> },
    {
      key: 'committed',
      label: t(`${K}.columns.committed`),
      align: 'right',
      render: row => <span className="text-sm">{money(row.committed)}</span>,
    },
    { key: 'units', label: t(`${K}.columns.units`), align: 'right', render: row => <span className="text-sm">{integer.format(row.units)}</span> },
    {
      key: 'called',
      label: t(`${K}.columns.called`),
      align: 'right',
      render: row =>
        alreadyCalled(row) > 0 ? (
          <span className="text-sm">{money(alreadyCalled(row))}</span>
        ) : (
          <StatusBadge label={t(`${K}.firstCall`)} variant="info" />
        ),
    },
    {
      key: 'validatedAt',
      label: t(`${K}.columns.validatedAt`),
      render: row =>
        row.availableAt.getTime() > Date.now() ? (
          <StatusBadge label={t(`${K}.availableAt`, { date: dateFormat.format(row.availableAt) })} variant="warning" />
        ) : (
          <span className="text-sm tabular-nums">{dateFormat.format(row.validatedAt)}</span>
        ),
    },
  ];

  const selectedRows = rows.filter(row => selection.has(row.subscriptionId));
  const hasFiltering = Object.keys(filters).length > 0 || search.trim().length > 0;

  return (
    <BigModal open={open} onOpenChange={next => !next && onClose()}>
      <BigModalContent className="p-0 gap-0">
        <div className="flex flex-col h-full overflow-hidden rounded-3xl">
        <BigModalPanelHeader
          icon={ListChecks}
          title={t(`${K}.title`, { share })}
          subtitle={t(`${K}.subtitle`)}
          onClose={onClose}
          closeLabel={t(`${K}.cancel`)}
        />
        <BigModalBody className="bg-muted">
          <ListingCard
            toolbar={
              <div className="space-y-3">
                <FilterBar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder={t(`${K}.search`)}
                  filters={filterConfigs}
                  activeFilters={filters}
                  onFilterChange={(id, next) =>
                    setFilters(prev => {
                      const copy = { ...prev };
                      if (next === null || next === '' || (Array.isArray(next) && next.length === 0)) delete copy[id];
                      else copy[id] = next;
                      return copy;
                    })
                  }
                  onClearAll={() => {
                    setSearch('');
                    setFilters({});
                  }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {t(hasFiltering ? `${K}.onVisible` : `${K}.onAll`, { count: visible.length })}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => update((next, id) => next.add(id))} disabled={visible.length === 0}>
                    <CheckSquare className="h-3.5 w-3.5" />
                    {t(`${K}.actions.selectVisible`)}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => update((next, id) => (next.has(id) ? next.delete(id) : next.add(id)))}
                    disabled={visible.length === 0}
                  >
                    <Repeat className="h-3.5 w-3.5" />
                    {t(`${K}.actions.invert`)}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => update((next, id) => next.delete(id))} disabled={visible.length === 0}>
                    <SquareX className="h-3.5 w-3.5" />
                    {t(`${K}.actions.clearVisible`)}
                  </Button>
                </div>
              </div>
            }
          >
            {visible.length === 0 ? (
              <EmptyState icon={ListChecks} title={t(`${K}.empty`)} />
            ) : (
              <DataTable
                data={visible}
                columns={columns}
                hoveredRow={hoveredRow}
                setHoveredRow={setHoveredRow}
                onRowClick={row => toggle(row.subscriptionId)}
                sortConfig={null}
                onSort={() => undefined}
                searchTerm={search}
                compactMode
                hideSelection
                density="compact"
              />
            )}
          </ListingCard>
        </BigModalBody>
        <BigModalPanelFooter
          start={
            <Button variant="outline" onClick={onClose}>
              {t(`${K}.cancel`)}
            </Button>
          }
          end={
            <>
              <span className="text-sm text-muted-foreground">
                {selectedRows.length === 0
                  ? t(`${K}.noneSelected`, { total: rows.length })
                  : t(`${K}.summary`, {
                      count: selectedRows.length,
                      total: rows.length,
                      committed: money(selectedRows.reduce((sum, row) => sum + row.committed, 0)),
                    })}
              </span>
              <Button onClick={() => onConfirm(selectedRows.map(row => row.subscriptionId))}>
                {selectedRows.length === 0 ? t(`${K}.confirmAll`) : t(`${K}.confirm`, { count: selectedRows.length })}
              </Button>
            </>
          }
        />
        </div>
      </BigModalContent>
    </BigModal>
  );
}
