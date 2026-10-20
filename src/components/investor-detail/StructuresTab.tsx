import { useMemo, useState } from 'react';
import { Building2, FileText, Pencil, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { LegalStructure } from '../../utils/investorGenerator';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency } from '../../utils/formatters';
import { DataTable, type ColumnConfig } from '../DataTable';
import { StatusBadge, type StatusVariant } from '../StatusBadge';
import { EmptyState } from '../EmptyState';
import { FilterBar, type FilterConfig } from '../FilterBar';
import { Button } from '../ui/button';
import { ListingCard, ListingCountTag, ListingNameCell, ListingTypeTag } from '../ui/listing';
import { TableRowActions } from '../ui/row-actions';
import { STRUCTURE_KYC_STATUSES, STRUCTURE_TYPES, StructureEditSheet } from './StructureEditSheet';

const K = 'investors.detail.structuresList';

const KYC_VARIANT: Record<string, StatusVariant> = {
  Validé: 'success',
  'En cours': 'info',
  'À revoir': 'warning',
  'Non commencé': 'neutral',
};

const riskVariant = (score: number): StatusVariant => (score < 30 ? 'success' : score < 70 ? 'warning' : 'danger');

type Row = LegalStructure & { id: number; structureId: string };
type SortKey = 'name' | 'type' | 'legalRepresentative' | 'contactsCount' | 'subscriptionsCount' | 'totalInvested' | 'riskScore';

interface StructuresTabProps {
  structures: LegalStructure[];
  /** Ouvre un autre onglet de la fiche : contacts, souscriptions. */
  onOpenTab: (tab: 'contacts' | 'souscriptions') => void;
}

export function StructuresTab({ structures: initialStructures, onOpenTab }: StructuresTabProps) {
  const { t, lang } = useTranslation();
  const [structures, setStructures] = useState<LegalStructure[]>(initialStructures);
  const [selected, setSelected] = useState<LegalStructure | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});

  const isNew = !!selected && !structures.some((structure) => structure.id === selected.id);

  const create = () =>
    setSelected({
      id: `structure-${Date.now()}`,
      name: '',
      type: 'SAS',
      contactsCount: 0,
      subscriptionsCount: 0,
      totalInvested: 0,
      kycStatus: 'Non commencé',
    });

  const save = () => {
    if (!selected) return;
    if (isNew) {
      setStructures([...structures, selected]);
      toast.success(t(`${K}.toast.added`, { name: selected.name }));
    } else {
      setStructures(structures.map((structure) => (structure.id === selected.id ? selected : structure)));
      toast.success(t(`${K}.toast.updated`, { name: selected.name }));
    }
    setSelected(null);
  };

  const filterConfigs: FilterConfig[] = [
    {
      id: 'type',
      label: t(`${K}.columns.type`),
      type: 'multiselect',
      isPrimary: true,
      options: STRUCTURE_TYPES.map((type) => ({ value: type, label: type })),
    },
    {
      id: 'kyc',
      label: t(`${K}.columns.kyc`),
      type: 'multiselect',
      isPrimary: true,
      options: STRUCTURE_KYC_STATUSES.map((status) => ({ value: status, label: t(`investors.detail.kycStatus.${status}`) })),
    },
  ];

  const rows: Row[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    const types = (filters.type as string[] | undefined) ?? [];
    const kyc = (filters.kyc as string[] | undefined) ?? [];
    const filtered = structures.filter((structure) => {
      if (term && ![structure.name, structure.legalRepresentative, structure.participationId].some((v) => v?.toLowerCase().includes(term))) return false;
      if (types.length > 0 && !types.includes(structure.type)) return false;
      if (kyc.length > 0 && !kyc.includes(structure.kycStatus ?? 'Non commencé')) return false;
      return true;
    });
    const list: Row[] = filtered.map((structure, index) => ({ ...structure, id: index + 1, structureId: structure.id }));
    if (!sortConfig) return list;
    const key = sortConfig.key as SortKey;
    return [...list].sort((a, b) => {
      const left = a[key];
      const right = b[key];
      if (left === undefined || left === '') return 1;
      if (right === undefined || right === '') return -1;
      const result =
        typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), lang);
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [structures, sortConfig, lang, search, filters]);

  const toStructure = (row: Row) => structures.find((structure) => structure.id === row.structureId) ?? structures[0];
  const empty = <span className="text-gray-400 text-sm">—</span>;

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: (row, term) => <ListingNameCell name={row.name} searchTerm={term} secondary={row.participationId} />,
    },
    {
      key: 'type',
      label: t(`${K}.columns.type`),
      sortable: true,
      render: (row) => <ListingTypeTag icon={Building2} label={row.type} />,
    },
    {
      key: 'legalRepresentative',
      label: t(`${K}.columns.representative`),
      sortable: true,
      render: (row) => (row.legalRepresentative ? <span className="text-sm text-gray-700">{row.legalRepresentative}</span> : empty),
    },
    {
      key: 'contactsCount',
      label: t(`${K}.columns.contacts`),
      sortable: true,
      render: (row) => (
        <ListingCountTag
          icon={Users}
          count={row.contactsCount ?? 0}
          ariaLabel={t(`${K}.openContacts`)}
          onClick={() => onOpenTab('contacts')}
        />
      ),
    },
    {
      key: 'subscriptionsCount',
      label: t(`${K}.columns.subscriptions`),
      sortable: true,
      render: (row) => (
        <ListingCountTag
          icon={FileText}
          count={row.subscriptionsCount ?? 0}
          ariaLabel={t(`${K}.openSubscriptions`)}
          onClick={() => onOpenTab('souscriptions')}
        />
      ),
    },
    {
      key: 'totalInvested',
      label: t(`${K}.columns.invested`),
      sortable: true,
      render: (row) => <span className="text-sm font-semibold text-gray-900">{formatCurrency(row.totalInvested ?? 0)}</span>,
    },
    {
      key: 'kycStatus',
      label: t(`${K}.columns.kyc`),
      render: (row) => {
        const status = row.kycStatus ?? 'Non commencé';
        return <StatusBadge variant={KYC_VARIANT[status] ?? 'neutral'} label={t(`investors.detail.kycStatus.${status}`)} />;
      },
    },
    {
      key: 'riskScore',
      label: t(`${K}.columns.risk`),
      sortable: true,
      render: (row) =>
        row.riskScore !== undefined ? <StatusBadge variant={riskVariant(row.riskScore)} label={`${row.riskScore}/100`} /> : empty,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <TableRowActions
          actions={[{ label: t(`${K}.edit`), icon: Pencil, onClick: () => setSelected(toStructure(row)) }]}
        />
      ),
    },
  ];

  const hasFilters = Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));

  return (
    <>
      <ListingCard
        toolbar={
          <div className="flex items-start justify-between gap-3">
            <FilterBar
              className="flex-1"
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t(`${K}.searchPlaceholder`)}
              filters={filterConfigs}
              activeFilters={filters}
              onFilterChange={(id, value) =>
                setFilters((prev) => {
                  const next = { ...prev };
                  if (value === null || (Array.isArray(value) && value.length === 0)) delete next[id];
                  else next[id] = value;
                  return next;
                })
              }
              onClearAll={() => setFilters({})}
            />
            <Button onClick={create} className="shrink-0">
              <Plus className="w-4 h-4" />
              {t(`${K}.add`)}
            </Button>
          </div>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={Building2}
            hasFilters={hasFilters}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
            }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={(row) => setSelected(toStructure(row))}
            sortConfig={sortConfig}
            onSort={(key) =>
              setSortConfig((prev) =>
                prev?.key === key ? (prev.direction === 'asc' ? { key, direction: 'desc' } : null) : { key, direction: 'asc' },
              )
            }
            compactMode
            hideSelection
            searchTerm={search}
          />
        )}
      </ListingCard>

      <StructureEditSheet
        open={selected !== null}
        isNew={isNew}
        structure={selected}
        onChange={setSelected}
        onClose={() => setSelected(null)}
        onSave={save}
      />
    </>
  );
}
