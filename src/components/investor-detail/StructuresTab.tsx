import { useMemo, useState } from 'react';
import { MoreHorizontal, Pencil, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { LegalStructure } from '../../utils/investorGenerator';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency } from '../../utils/formatters';
import { DataTable, type ColumnConfig } from '../DataTable';
import { StatusBadge, type StatusVariant } from '../StatusBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { WIDGET_TITLE_CLASS } from '../ui/utils';
import { StructureEditSheet } from './StructureEditSheet';

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
}

export function StructuresTab({ structures: initialStructures }: StructuresTabProps) {
  const { t, lang } = useTranslation();
  const [structures, setStructures] = useState<LegalStructure[]>(initialStructures);
  const [selected, setSelected] = useState<LegalStructure | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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

  const rows: Row[] = useMemo(() => {
    const list: Row[] = structures.map((structure, index) => ({ ...structure, id: index + 1, structureId: structure.id }));
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
  }, [structures, sortConfig, lang]);

  const toStructure = (row: Row) => structures.find((structure) => structure.id === row.structureId) ?? structures[0];
  const empty = <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>;

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'name',
      label: t(`${K}.columns.name`),
      sortable: true,
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-medium text-foreground">{row.name}</span>
          {row.participationId && <span className="text-xs text-muted-foreground">{row.participationId}</span>}
        </span>
      ),
    },
    { key: 'type', label: t(`${K}.columns.type`), sortable: true, render: (row) => <StatusBadge variant="outline" label={row.type} /> },
    {
      key: 'legalRepresentative',
      label: t(`${K}.columns.representative`),
      sortable: true,
      render: (row) => row.legalRepresentative ?? empty,
    },
    {
      key: 'contactsCount',
      label: t(`${K}.columns.contacts`),
      sortable: true,
      align: 'right',
      render: (row) => <span className="tabular-nums">{row.contactsCount ?? 0}</span>,
    },
    {
      key: 'subscriptionsCount',
      label: t(`${K}.columns.subscriptions`),
      sortable: true,
      align: 'right',
      render: (row) => <span className="tabular-nums">{row.subscriptionsCount ?? 0}</span>,
    },
    {
      key: 'totalInvested',
      label: t(`${K}.columns.invested`),
      sortable: true,
      align: 'right',
      render: (row) => <span className="tabular-nums">{formatCurrency(row.totalInvested ?? 0)}</span>,
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
      label: t(`${K}.columns.actions`),
      align: 'right',
      render: (row) => (
        <span onClick={(event) => event.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t(`${K}.actionsFor`, { name: row.name })}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelected(toStructure(row))}>
                <Pencil className="w-4 h-4" />
                {t(`${K}.edit`)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      ),
    },
  ];

  return (
    <>
      <Card className="gap-0 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.title`, { count: structures.length })}</h3>
          <Button size="sm" onClick={create}>
            <Plus className="w-4 h-4" />
            {t(`${K}.add`)}
          </Button>
        </div>
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
          density="compact"
        />
      </Card>

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
