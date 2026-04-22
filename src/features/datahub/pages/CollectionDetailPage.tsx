import { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  FileSpreadsheet,
  Layers,
  Link2,
  RefreshCw,
  Rows3,
  Table as TableIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { KpiCard, KpiStrip } from '../../../components/ui/kpi-card';
import { PageHeader } from '../../../components/ui/page-header';
import { SearchInput } from '../../../components/ui/search-input';
import { SegmentedControl } from '../../../components/ui/segmented-control';
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

interface DataTabProps {
  collection: Collection;
  rows: CollectionRow[];
}

function DataTab({ collection, rows }: DataTabProps) {
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
                  <TableHead className="w-[140px]">Statut</TableHead>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => (
                  <TableRow key={row.id} className="group">
                    <TableCell className="py-2.5">
                      <StatusBadge status={row.status} size="sm" />
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
                  </TableRow>
                ))}
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
  const { allCollections } = useCollections();

  const collection = useMemo(
    () => resolveCollection(allCollections, collectionKey),
    [allCollections, collectionKey],
  );

  const rows = useMemo(() => {
    if (!collection) return [];
    return getCollectionRows(collection);
  }, [collection]);

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

  const stats = collection.stats;
  const publishPct =
    stats.totalRows > 0
      ? Math.round((stats.publishedRows / stats.totalRows) * 100)
      : 0;

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
            icon={Layers}
            label="Colonnes"
            value={collection.columns.length}
            hint={
              collection.columns.filter((c) => c.required).length > 0
                ? `${collection.columns.filter((c) => c.required).length} requises`
                : undefined
            }
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
            <DataTab collection={collection} rows={rows} />
          </TabsContent>

          <TabsContent value="widgets" className="mt-2">
            <WidgetsTab collection={collection} rows={rows} />
          </TabsContent>

          <TabsContent value="schema" className="mt-2">
            <SchemaTab collection={collection} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CollectionDetailPage;
