import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Edit3,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Layers,
  Link2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  RotateCcw,
  Rows3,
  Send,
  Table as TableIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Input } from '../../../components/ui/input';
import { KpiCard, KpiStrip } from '../../../components/ui/kpi-card';
import { Label } from '../../../components/ui/label';
import { PageHeader } from '../../../components/ui/page-header';
import { SearchInput } from '../../../components/ui/search-input';
import { SegmentedControl } from '../../../components/ui/segmented-control';
import { Switch } from '../../../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import { cn } from '../../../components/ui/utils';

import { IngestionModeBadge } from '../components/IngestionModeBadge';
import { PivotTypeBadge } from '../components/PivotTypeBadge';
import { StatusBadge } from '../components/StatusBadge';
import { SyncIndicator } from '../components/SyncIndicator';
import { EvolutionChartWidget } from '../components/widgets/EvolutionChartWidget';
import { HistoryTableWidget } from '../components/widgets/HistoryTableWidget';
import { KpiWidget } from '../components/widgets/KpiWidget';
import { useCollections } from '../context/CollectionsContext';
import { getCollectionRows } from '../lib/syntheticRows';
import {
  ASTORG_PERF_COLLECTION_ID,
  ASTORG_PERF_TECHNICAL_NAME,
  astorgPerfRows,
} from '../seed/demoScenario';
import type {
  Collection,
  CollectionColumn,
  CollectionRow,
  CollectionRowStatus,
  InvestHubPivotObject,
  PublicationWorkflow,
} from '../types';

const PIVOT_OBJECT_LABEL: Record<InvestHubPivotObject, string> = {
  campaign: 'Fonds',
  subscription: 'Souscription',
  investor: 'Investisseur',
  contact: 'Contact',
  distributor: 'Distributeur',
  'capital-account': 'Compte de capital',
  commitment: 'Engagement',
};

const WORKFLOW_LABEL: Record<PublicationWorkflow, string> = {
  direct: 'Publication directe',
  'manual-validation': 'Validation manuelle',
  'ai-validation': 'Validation IA',
};

type StatusFilter = 'all' | CollectionRowStatus;

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'published', label: 'Publiées' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'changes', label: 'Modif.' },
  { value: 'unpublished', label: 'Dépubliées' },
];

const eurFmt = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});
const nfMax2 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const pctFmt = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function formatValue(column: CollectionColumn, value: unknown): string {
  if (value == null || value === '') return '—';

  switch (column.type) {
    case 'currency':
      return typeof value === 'number' ? eurFmt.format(value) : String(value);
    case 'number':
      return typeof value === 'number' ? nfMax2.format(value) : String(value);
    case 'percentage':
      if (typeof value !== 'number') return String(value);
      return value > 1 ? `${nfMax2.format(value)} %` : pctFmt.format(value);
    case 'date':
      try {
        return new Date(String(value)).toLocaleDateString('fr-FR');
      } catch {
        return String(value);
      }
    case 'datetime':
      try {
        return new Date(String(value)).toLocaleString('fr-FR');
      } catch {
        return String(value);
      }
    case 'boolean':
      return value ? 'Oui' : 'Non';
    case 'url':
      return String(value);
    default:
      return String(value);
  }
}

function rowUpdatedLabel(row: CollectionRow): string {
  try {
    return new Date(row.updatedAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function resolveCollection(
  allCollections: Collection[],
  key: string,
): Collection | undefined {
  return (
    allCollections.find((c) => c.id === key) ??
    allCollections.find((c) => c.technicalName === key)
  );
}

function isRowDirty(current: CollectionRow, original: CollectionRow): boolean {
  if (current.status !== original.status) return true;
  return JSON.stringify(current.data) !== JSON.stringify(original.data);
}

/**
 * Edit-a-row dialog. Builds an ad-hoc form from the collection schema so
 * users can moderate data without leaving the detail page. Numbers, dates,
 * booleans etc. get the matching HTML input type.
 */
interface RowEditDialogProps {
  open: boolean;
  collection: Collection;
  row: CollectionRow | null;
  onClose: () => void;
  onSave: (nextData: Record<string, unknown>) => void;
}

function RowEditDialog({
  open,
  collection,
  row,
  onClose,
  onSave,
}: RowEditDialogProps) {
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (row) setDraft({ ...row.data });
  }, [row]);

  if (!row) return null;

  const patch = (key: string, value: unknown) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const inputFor = (column: CollectionColumn) => {
    const raw = draft[column.technicalName];
    const common = { id: `edit-${column.id}` as const };
    switch (column.type) {
      case 'boolean':
        return (
          <Switch
            checked={!!raw}
            onCheckedChange={(c) => patch(column.technicalName, c)}
          />
        );
      case 'number':
      case 'currency':
      case 'percentage':
        return (
          <Input
            {...common}
            type="number"
            step={column.type === 'percentage' ? '0.001' : 'any'}
            value={raw == null || raw === '' ? '' : String(raw)}
            onChange={(e) =>
              patch(
                column.technicalName,
                e.target.value === '' ? '' : Number(e.target.value),
              )
            }
            className="tabular-nums"
          />
        );
      case 'date':
        return (
          <Input
            {...common}
            type="date"
            value={typeof raw === 'string' ? raw.slice(0, 10) : ''}
            onChange={(e) => patch(column.technicalName, e.target.value)}
          />
        );
      case 'datetime':
        return (
          <Input
            {...common}
            type="datetime-local"
            value={
              typeof raw === 'string' && raw.length > 0
                ? new Date(raw).toISOString().slice(0, 16)
                : ''
            }
            onChange={(e) =>
              patch(
                column.technicalName,
                e.target.value
                  ? new Date(e.target.value).toISOString()
                  : '',
              )
            }
          />
        );
      case 'url':
        return (
          <Input
            {...common}
            type="url"
            placeholder="https://…"
            value={typeof raw === 'string' ? raw : ''}
            onChange={(e) => patch(column.technicalName, e.target.value)}
          />
        );
      default:
        return (
          <Input
            {...common}
            value={raw == null ? '' : String(raw)}
            onChange={(e) => patch(column.technicalName, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la ligne</DialogTitle>
          <DialogDescription>
            {collection.displayName} · version {row.version}. Les modifications
            marqueront la ligne comme &laquo;&nbsp;Modif. en attente&nbsp;&raquo;
            jusqu&apos;au commit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 md:grid-cols-2">
          {collection.columns.map((column) => (
            <div key={column.id} className="flex flex-col gap-1.5">
              <Label htmlFor={`edit-${column.id}`}>
                {column.label}
                {column.required ? (
                  <span className="ml-1 text-destructive">*</span>
                ) : null}
              </Label>
              {inputFor(column)}
              {column.unit ? (
                <p className="text-[11px] text-muted-foreground">
                  Unité&nbsp;: {column.unit}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DataTabProps {
  collection: Collection;
  rows: CollectionRow[];
  originals: Map<string, CollectionRow>;
  dirtyCount: number;
  onChangeRowStatus: (rowId: string, nextStatus: CollectionRowStatus) => void;
  onEditRow: (row: CollectionRow) => void;
  onRevertRow: (rowId: string) => void;
}

function DataTab({
  collection,
  rows,
  originals,
  dirtyCount,
  onChangeRowStatus,
  onEditRow,
  onRevertRow,
}: DataTabProps) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (!q) return true;
      return Object.values(row.data).some((v) =>
        String(v ?? '').toLowerCase().includes(q),
      );
    });
  }, [rows, status, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Rechercher dans les lignes…"
          className="min-w-[240px] flex-1"
        />
        <SegmentedControl<StatusFilter>
          aria-label="Filtrer par statut"
          value={status}
          onValueChange={setStatus}
          options={STATUS_OPTIONS}
          size="sm"
        />
      </div>

      {dirtyCount === 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <MoreHorizontal className="size-3.5" aria-hidden />
          Modérer une ligne&nbsp;: cliquez le menu
          <code className="rounded border border-border bg-background px-1 font-semibold">⋯</code>
          à droite (publier, mettre en attente, dépublier, modifier). La barre
          de commit en bas de page valide toutes les modifications d’un coup.
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <TableIcon className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              Aucune ligne ne correspond aux filtres en cours.
            </p>
            <p className="text-xs text-muted-foreground">
              Effacez la recherche ou changez le statut sélectionné.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[150px]">Statut</TableHead>
                  {collection.columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        'whitespace-nowrap',
                        (column.type === 'number' ||
                          column.type === 'currency' ||
                          column.type === 'percentage') &&
                          'text-right',
                      )}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-[130px] whitespace-nowrap">
                    Mis à jour
                  </TableHead>
                  <TableHead className="w-[80px] whitespace-nowrap">
                    Version
                  </TableHead>
                  <TableHead className="w-[56px]">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const original = originals.get(row.id);
                  const dirty = original ? isRowDirty(row, original) : false;
                  return (
                    <TableRow
                      key={row.id}
                      className={cn('group', dirty && 'bg-amber-50/40 dark:bg-amber-900/10')}
                    >
                      <TableCell className="py-2.5">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={row.status} size="sm" />
                          {dirty ? (
                            <span
                              title="Modification non validée"
                              aria-label="Modification non validée"
                              className="relative inline-flex size-1.5"
                            >
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-70" />
                              <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      {collection.columns.map((column) => {
                        const value = row.data[column.technicalName];
                        const formatted = formatValue(column, value);
                        const isNumeric =
                          column.type === 'number' ||
                          column.type === 'currency' ||
                          column.type === 'percentage';
                        return (
                          <TableCell
                            key={column.id}
                            className={cn(
                              'max-w-[280px] truncate py-2.5',
                              isNumeric && 'text-right tabular-nums',
                            )}
                            title={formatted}
                          >
                            {column.type === 'url' && typeof value === 'string' ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline-offset-2 hover:underline"
                              >
                                {formatted}
                              </a>
                            ) : (
                              formatted
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="whitespace-nowrap py-2.5 text-xs text-muted-foreground">
                        {rowUpdatedLabel(row)}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs tabular-nums text-muted-foreground">
                        v{row.version}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Actions sur cette ligne"
                              className="size-8 text-muted-foreground hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                              Modération
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => onEditRow(row)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 size-4 text-muted-foreground" />
                              Modifier la donnée
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {row.status !== 'published' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onChangeRowStatus(row.id, 'published')
                                }
                                className="cursor-pointer"
                              >
                                <CheckCircle2 className="mr-2 size-4 text-emerald-600" />
                                Publier
                              </DropdownMenuItem>
                            )}
                            {row.status !== 'draft' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onChangeRowStatus(row.id, 'draft')
                                }
                                className="cursor-pointer"
                              >
                                <Clock className="mr-2 size-4 text-amber-600" />
                                Mettre en attente
                              </DropdownMenuItem>
                            )}
                            {row.status === 'published' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onChangeRowStatus(row.id, 'changes')
                                }
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 size-4 text-blue-600" />
                                Marquer comme modifiée
                              </DropdownMenuItem>
                            )}
                            {row.status !== 'unpublished' && (
                              <DropdownMenuItem
                                onClick={() =>
                                  onChangeRowStatus(row.id, 'unpublished')
                                }
                                className="cursor-pointer"
                              >
                                <EyeOff className="mr-2 size-4 text-muted-foreground" />
                                Dépublier
                              </DropdownMenuItem>
                            )}
                            {dirty ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onRevertRow(row.id)}
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                >
                                  <RotateCcw className="mr-2 size-4" />
                                  Annuler les modifications
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
            <span>
              {filtered.length} ligne{filtered.length > 1 ? 's' : ''} affichée
              {filtered.length > 1 ? 's' : ''} sur {rows.length}
            </span>
            <span className="tabular-nums">{collection.columns.length} colonnes</span>
          </div>
        </Card>
      )}
    </div>
  );
}

interface WidgetsTabProps {
  collection: Collection;
  rows: CollectionRow[];
}

function hasTemporalPivot(collection: Collection): CollectionColumn | undefined {
  return collection.columns.find((c) => c.isTemporalPivot);
}

function numericColumns(collection: Collection): CollectionColumn[] {
  return collection.columns.filter(
    (c) =>
      c.type === 'number' ||
      c.type === 'currency' ||
      c.type === 'percentage',
  );
}

function WidgetsTab({ collection, rows }: WidgetsTabProps) {
  const isPerf =
    collection.id === ASTORG_PERF_COLLECTION_ID ||
    collection.technicalName === ASTORG_PERF_TECHNICAL_NAME;

  // Perf collection ships purpose-built widgets wired to PerfRow. Others
  // get a schema-aware auto-summary (top value per numeric column).
  if (isPerf) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">KPIs</h3>
          <p className="text-xs text-muted-foreground">
            Dernière période publiée vs. projection du brouillon.
          </p>
          <div className="mt-3">
            <KpiWidget rows={astorgPerfRows} includeDrafts />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <EvolutionChartWidget rows={astorgPerfRows} includeDrafts />
          <HistoryTableWidget rows={astorgPerfRows} includeDrafts />
        </div>
      </div>
    );
  }

  const pivot = hasTemporalPivot(collection);
  const numeric = numericColumns(collection);

  if (numeric.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
          <BarChart3 className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium text-foreground">
            Pas de colonne numérique sur cette collection.
          </p>
          <p className="max-w-md text-xs text-muted-foreground">
            Les widgets de synthèse (KPIs, graphiques) s’appuient sur des
            colonnes numériques ou monétaires. Ajoutez-en au schéma pour les
            activer.
          </p>
        </CardContent>
      </Card>
    );
  }

  const published = rows.filter((r) => r.status === 'published');
  const summary = numeric.slice(0, 4).map((column) => {
    const values = published
      .map((r) => r.data[column.technicalName])
      .filter((v): v is number => typeof v === 'number');
    const sum = values.reduce((acc, v) => acc + v, 0);
    const avg = values.length > 0 ? sum / values.length : 0;
    return { column, sum, avg, count: values.length };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Synthèse automatique
        </h3>
        <p className="text-xs text-muted-foreground">
          Calculée sur les {published.length} ligne(s) publiée(s){' '}
          {pivot ? `· pivot temporel : ${pivot.label}` : ''}
        </p>
      </div>

      <KpiStrip columns={Math.min(summary.length, 4) as 2 | 3 | 4}>
        {summary.map(({ column, sum, avg, count }, index) => {
          const isCurrency = column.type === 'currency';
          const isPct = column.type === 'percentage';
          const display = isPct
            ? pctFmt.format(avg > 1 ? avg / 100 : avg)
            : isCurrency
              ? eurFmt.format(sum)
              : nfMax2.format(avg);
          return (
            <KpiCard
              key={column.id}
              index={index}
              icon={isCurrency ? BarChart3 : Rows3}
              label={column.label}
              value={display}
              hint={
                isPct
                  ? 'moyenne'
                  : isCurrency
                    ? `cumul · ${count} lignes`
                    : `moyenne · ${count} lignes`
              }
            />
          );
        })}
      </KpiStrip>

      <Card>
        <CardContent className="flex items-start gap-3 py-4">
          <BarChart3
            className="mt-0.5 size-5 text-muted-foreground"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-foreground">
              Graphiques avancés bientôt disponibles
            </span>
            <p className="text-xs text-muted-foreground">
              Pour cette collection, InvestHub pourra générer automatiquement
              un graphique d’évolution dès qu’un pivot temporel sera détecté et
              au moins 2 points publiés.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SchemaTab({ collection }: { collection: Collection }) {
  const typeLabel: Record<CollectionColumn['type'], string> = {
    text: 'Texte',
    number: 'Nombre',
    currency: 'Monétaire',
    percentage: 'Pourcentage',
    date: 'Date',
    datetime: 'Date & heure',
    boolean: 'Booléen',
    url: 'URL',
    select: 'Liste de choix',
  };

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[40%]">Colonne</TableHead>
              <TableHead className="w-[200px]">Nom technique</TableHead>
              <TableHead className="w-[180px]">Type</TableHead>
              <TableHead className="w-[220px]">Rôle</TableHead>
              <TableHead className="w-[100px]">Requis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collection.columns.map((column) => (
              <TableRow key={column.id}>
                <TableCell className="py-2.5 font-medium text-foreground">
                  {column.label}
                </TableCell>
                <TableCell className="py-2.5">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {column.technicalName}
                  </code>
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">
                  {typeLabel[column.type]}
                  {column.unit ? ` · ${column.unit}` : ''}
                </TableCell>
                <TableCell className="py-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {column.isTemporalPivot ? (
                      <Badge variant="outline" className="gap-1 bg-violet-50 text-violet-700 border-violet-200">
                        <Layers className="size-3" /> Pivot temporel
                      </Badge>
                    ) : null}
                    {column.isKeyToInvestHubObject ? (
                      <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                        <Link2 className="size-3" />
                        {PIVOT_OBJECT_LABEL[column.isKeyToInvestHubObject]}
                      </Badge>
                    ) : null}
                    {!column.isTemporalPivot && !column.isKeyToInvestHubObject ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  {column.required ? (
                    <Badge className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle2 className="size-3" />
                      Requis
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Optionnel</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export interface CollectionDetailPageProps {
  collectionKey: string;
  onExit: () => void;
  onRefresh: (collection: Collection) => void;
  onViewAsLp: (collection: Collection) => void;
}

export function CollectionDetailPage({
  collectionKey,
  onExit,
  onRefresh,
  onViewAsLp,
}: CollectionDetailPageProps) {
  const { allCollections, updateCollection } = useCollections();

  const collection = useMemo(
    () => resolveCollection(allCollections, collectionKey),
    [allCollections, collectionKey],
  );

  const initialRows = useMemo(() => {
    if (!collection) return [];
    return getCollectionRows(collection);
  }, [collection]);

  // Working copy (mutated by moderation actions) + pristine snapshot we
  // diff against to know what's dirty and what "Annuler" should restore.
  const [rows, setRows] = useState<CollectionRow[]>(initialRows);
  const originalsRef = useRef<Map<string, CollectionRow>>(new Map());

  useEffect(() => {
    setRows(initialRows);
    originalsRef.current = new Map(initialRows.map((r) => [r.id, r]));
  }, [initialRows]);

  const originals = originalsRef.current;

  const dirtyCount = useMemo(
    () =>
      rows.reduce((acc, row) => {
        const original = originals.get(row.id);
        return original && isRowDirty(row, original) ? acc + 1 : acc;
      }, 0),
    [rows, originals],
  );

  const [editingRow, setEditingRow] = useState<CollectionRow | null>(null);

  const changeRowStatus = (rowId: string, nextStatus: CollectionRowStatus) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
            }
          : row,
      ),
    );
  };

  const revertRow = (rowId: string) => {
    const original = originals.get(rowId);
    if (!original) return;
    setRows((prev) => prev.map((row) => (row.id === rowId ? original : row)));
  };

  const saveEditedRow = (nextData: Record<string, unknown>) => {
    if (!editingRow) return;
    setRows((prev) =>
      prev.map((row) =>
        row.id === editingRow.id
          ? {
              ...row,
              data: { ...nextData },
              // Editing a published row bumps it to "changes" pending review.
              status: row.status === 'published' ? 'changes' : row.status,
              updatedAt: new Date().toISOString(),
              version: row.version + 1,
            }
          : row,
      ),
    );
  };

  const commitAll = () => {
    if (!collection || dirtyCount === 0) return;

    const nextStats = rows.reduce(
      (acc, row) => {
        acc.totalRows += 1;
        if (row.status === 'published') acc.publishedRows += 1;
        else if (row.status === 'draft') acc.draftRows += 1;
        else if (row.status === 'unpublished') acc.unpublishedRows += 1;
        else if (row.status === 'changes') acc.changesRows += 1;
        return acc;
      },
      {
        totalRows: 0,
        publishedRows: 0,
        draftRows: 0,
        unpublishedRows: 0,
        changesRows: 0,
      },
    );

    updateCollection(collection.id, {
      stats: nextStats,
      updatedAt: new Date().toISOString(),
    });

    // Freeze the new baseline so the commit bar disappears.
    originalsRef.current = new Map(rows.map((r) => [r.id, r]));
    toast.success(`${dirtyCount} modification(s) validée(s)`, {
      description: `Les compteurs de ${collection.displayName} sont à jour.`,
    });
  };

  const discardAll = () => {
    if (dirtyCount === 0) return;
    const restored = rows.map((row) => originals.get(row.id) ?? row);
    setRows(restored);
    toast.info(`${dirtyCount} modification(s) annulée(s)`);
  };

  if (!collection) {
    return (
      <div className="flex-1">
        <PageHeader
          breadcrumb={[
            { label: 'InvestHub OS' },
            { label: 'Portails et Contenu' },
            { label: 'DataHub', onClick: onExit },
            { label: 'Collection introuvable' },
          ]}
          onBack={onExit}
          title="Collection introuvable"
          subtitle="Cette collection n’existe plus ou le lien est obsolète."
        />
        <div className="mx-auto max-w-5xl px-6 py-8">
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Retournez au DataHub pour choisir une collection existante.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Live stats reflect the in-progress working copy, so the KPI strip
  // moves as the user moderates rows — even before commit.
  const stats = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.totalRows += 1;
        if (row.status === 'published') acc.publishedRows += 1;
        else if (row.status === 'draft') acc.draftRows += 1;
        else if (row.status === 'unpublished') acc.unpublishedRows += 1;
        else if (row.status === 'changes') acc.changesRows += 1;
        return acc;
      },
      {
        totalRows: 0,
        publishedRows: 0,
        draftRows: 0,
        unpublishedRows: 0,
        changesRows: 0,
      },
    );
  }, [rows]);

  const publishPct =
    stats.totalRows > 0
      ? Math.round((stats.publishedRows / stats.totalRows) * 100)
      : 0;
  const pendingChanges = stats.changesRows;

  return (
    <div className="flex-1">
      <PageHeader
        breadcrumb={[
          { label: 'InvestHub OS' },
          { label: 'Portails et Contenu' },
          { label: 'DataHub', onClick: onExit },
          { label: collection.displayName },
        ]}
        onBack={onExit}
        title={collection.displayName}
        subtitle={collection.description}
        primaryAction={{
          label: 'Synchroniser',
          icon: <RefreshCw className="w-4 h-4" />,
          onClick: () => onRefresh(collection),
        }}
        secondaryAction={{
          label: 'View as LP',
          icon: <Eye className="size-4" />,
          onClick: () => onViewAsLp(collection),
        }}
        tertiaryActions={[
          {
            label: 'Exporter .csv',
            icon: <FileSpreadsheet className="size-4 text-green-600" />,
            onClick: () =>
              toast.info('Export simulé', {
                description: `${rows.length} ligne(s) auraient été exportées.`,
              }),
          },
          {
            label: 'Télécharger .xlsx',
            icon: <Download className="size-4 text-blue-600" />,
            onClick: () => toast.info('Export XLSX à venir'),
          },
          {
            label: 'Modifier le schéma',
            icon: <Edit3 className="size-4" />,
            separatorBefore: true,
            onClick: () => toast.info('Édition du schéma à venir'),
          },
        ]}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        {/* Meta band */}
        <div className="flex flex-wrap items-center gap-2">
          <IngestionModeBadge mode={collection.ingestionMode} />
          <PivotTypeBadge type={collection.pivotType} />
          <Badge variant="outline" className="gap-1 bg-slate-50 text-slate-700 border-slate-200">
            <CheckCircle2 className="size-3" />
            {WORKFLOW_LABEL[collection.publicationWorkflow]}
          </Badge>
          {collection.linkedPivotObjects.map((obj) => (
            <Badge
              key={obj}
              variant="outline"
              className="gap-1 bg-blue-50 text-blue-700 border-blue-200"
            >
              <Link2 className="size-3" />
              {PIVOT_OBJECT_LABEL[obj]}
            </Badge>
          ))}
          <div className="ml-auto">
            <SyncIndicator lastSyncAt={collection.lastSyncAt} variant="inline" />
          </div>
        </div>

        {/* KPI strip */}
        <KpiStrip columns={4}>
          <KpiCard
            index={0}
            icon={Rows3}
            label="Total lignes"
            value={stats.totalRows}
          />
          <KpiCard
            index={1}
            icon={CheckCircle2}
            label="Publiées"
            value={stats.publishedRows}
            progress={
              stats.totalRows > 0
                ? { current: stats.publishedRows, total: stats.totalRows }
                : undefined
            }
            hint={publishPct > 0 ? `${publishPct}%` : undefined}
          />
          <KpiCard
            index={2}
            icon={Edit3}
            label="Brouillons"
            value={stats.draftRows}
            pulse={stats.draftRows > 0}
            hint={stats.draftRows > 0 ? 'à publier' : undefined}
          />
          <KpiCard
            index={3}
            icon={Pencil}
            label="Modif. en attente"
            value={pendingChanges}
            pulse={pendingChanges > 0}
            hint={pendingChanges > 0 ? 'à valider' : undefined}
          />
        </KpiStrip>

        {/* Tabs */}
        <Tabs defaultValue="data" className="gap-4">
          <TabsList className="h-10 rounded-lg p-1">
            <TabsTrigger value="data" className="gap-2 px-4">
              <TableIcon className="size-4" />
              Données
              <span className="ml-1 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {rows.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="widgets" className="gap-2 px-4">
              <BarChart3 className="size-4" />
              Aperçu & widgets
            </TabsTrigger>
            <TabsTrigger value="schema" className="gap-2 px-4">
              <Layers className="size-4" />
              Schéma
              <span className="ml-1 rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                {collection.columns.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="mt-2">
            <DataTab
              collection={collection}
              rows={rows}
              originals={originals}
              dirtyCount={dirtyCount}
              onChangeRowStatus={changeRowStatus}
              onEditRow={setEditingRow}
              onRevertRow={revertRow}
            />
          </TabsContent>

          <TabsContent value="widgets" className="mt-2">
            <WidgetsTab collection={collection} rows={rows} />
          </TabsContent>

          <TabsContent value="schema" className="mt-2">
            <SchemaTab collection={collection} />
          </TabsContent>
        </Tabs>

        {/* Spacer so the sticky commit bar doesn't overlap last rows. */}
        {dirtyCount > 0 ? <div aria-hidden className="h-16" /> : null}
      </div>

      <RowEditDialog
        open={!!editingRow}
        collection={collection}
        row={editingRow}
        onClose={() => setEditingRow(null)}
        onSave={saveEditedRow}
      />

      {/* Global commit bar — sticks at the bottom while the user is editing. */}
      <AnimatePresence>
        {dirtyCount > 0 ? (
          <motion.div
            key="commit-bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4"
          >
            <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-white/95 px-4 py-2.5 shadow-xl shadow-black/10 backdrop-blur-sm dark:bg-gray-950/95">
              <span className="relative inline-flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {dirtyCount} modification{dirtyCount > 1 ? 's' : ''} en attente
              </span>
              <span className="text-xs text-muted-foreground">
                · non validée{dirtyCount > 1 ? 's' : ''}
              </span>
              <div className="mx-1 h-5 w-px bg-border" aria-hidden />
              <Button
                variant="ghost"
                size="sm"
                onClick={discardAll}
                className="gap-1.5"
              >
                <RotateCcw className="size-4" />
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={commitAll}
                style={{
                  background:
                    'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                }}
                className="gap-1.5 text-white shadow-md shadow-black/20 hover:opacity-90"
              >
                <Send className="size-4" />
                Commit {dirtyCount} modification{dirtyCount > 1 ? 's' : ''}
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default CollectionDetailPage;
