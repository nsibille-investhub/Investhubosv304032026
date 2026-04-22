import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  FileEdit,
  Rows3,
  Search,
  SearchX,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { PageHeader } from '../../../components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { cn } from '../../../components/ui/utils';

import { CollectionCard } from '../components/CollectionCard';
import { RefreshDataModal } from '../components/RefreshDataModal';
import { useCollections } from '../context/CollectionsContext';
import type {
  Collection,
  CollectionRowStatus,
  IngestionMode,
  InvestHubPivotObject,
} from '../types';

type StatusFilter = 'all' | CollectionRowStatus;
type ModeFilter = 'all' | IngestionMode;
type ObjectFilter = 'all' | InvestHubPivotObject;

const nf = new Intl.NumberFormat('fr-FR');

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: 'Tous les statuts',
  published: 'Publiées',
  draft: 'Brouillons',
  unpublished: 'Dépubliées',
  changes: 'Modif. en attente',
};

const MODE_LABELS: Record<ModeFilter, string> = {
  all: 'Tous les modes',
  manual: 'Manuel',
  file: 'Import fichier',
  'api-pull': 'API (pull)',
  'api-push': 'API (push)',
  mcp: 'MCP',
};

const OBJECT_LABELS: Record<ObjectFilter, string> = {
  all: 'Tous les objets IH',
  campaign: 'Fonds',
  subscription: 'Souscription',
  investor: 'Investisseur',
  contact: 'Contact',
  distributor: 'Distributeur',
  'capital-account': 'Compte de capital',
  commitment: 'Engagement',
};

type StatAccent = 'indigo' | 'slate' | 'emerald' | 'amber';

const STAT_ACCENT: Record<
  StatAccent,
  {
    card: string;
    icon: string;
    label: string;
    track: string;
    bar: string;
    dot: string;
  }
> = {
  indigo: {
    card: 'bg-indigo-50/70 border-indigo-100 hover:border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900/60',
    icon: 'text-indigo-600 dark:text-indigo-400',
    label: 'text-indigo-900/80 dark:text-indigo-200',
    track: 'bg-indigo-100 dark:bg-indigo-900/50',
    bar: 'bg-indigo-500',
    dot: 'bg-indigo-500',
  },
  slate: {
    card: 'bg-slate-50 border-slate-200 hover:border-slate-300 dark:bg-slate-900/40 dark:border-slate-800',
    icon: 'text-slate-600 dark:text-slate-300',
    label: 'text-slate-700 dark:text-slate-200',
    track: 'bg-slate-200 dark:bg-slate-800',
    bar: 'bg-slate-500',
    dot: 'bg-slate-400',
  },
  emerald: {
    card: 'bg-emerald-50/80 border-emerald-100 hover:border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900/60',
    icon: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-emerald-900/80 dark:text-emerald-200',
    track: 'bg-emerald-100 dark:bg-emerald-900/50',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  amber: {
    card: 'bg-amber-50/80 border-amber-100 hover:border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60',
    icon: 'text-amber-700 dark:text-amber-400',
    label: 'text-amber-900/80 dark:text-amber-200',
    track: 'bg-amber-100 dark:bg-amber-900/50',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
  },
};

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  accent: StatAccent;
  index: number;
  progress?: { current: number; total: number };
  pulse?: boolean;
  hint?: string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  index,
  progress,
  pulse,
  hint,
}: StatCardProps) {
  const palette = STAT_ACCENT[accent];
  const ratio = progress && progress.total > 0 ? progress.current / progress.total : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-4 transition-colors duration-200',
        palette.card,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn('size-4', palette.icon)} strokeWidth={2.25} />
        <span className={cn('text-xs font-semibold uppercase tracking-[0.08em]', palette.label)}>
          {label}
        </span>
        {pulse ? (
          <span className="relative ml-0.5 inline-flex size-1.5">
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-70',
                palette.dot,
              )}
            />
            <span className={cn('relative inline-flex size-1.5 rounded-full', palette.dot)} />
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 + index * 0.06, duration: 0.3 }}
          className="text-3xl font-bold leading-none tracking-tight tabular-nums text-foreground"
        >
          {nf.format(value)}
        </motion.span>
        {hint ? (
          <span className={cn('text-xs font-medium', palette.label)}>{hint}</span>
        ) : null}
      </div>

      {progress ? (
        <div className="mt-3 flex items-center gap-2">
          <div className={cn('h-1 flex-1 overflow-hidden rounded-full', palette.track)}>
            <motion.div
              className={cn('h-full rounded-full', palette.bar)}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(ratio * 100)}%` }}
              transition={{ delay: 0.32 + index * 0.06, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <span className={cn('text-[10px] font-semibold tabular-nums', palette.label)}>
            {Math.round(ratio * 100)}%
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}

type StatStripProps = {
  collections: number;
  totalRows: number;
  publishedRows: number;
  draftRows: number;
};

function StatStrip({ collections, totalRows, publishedRows, draftRows }: StatStripProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <StatCard
        index={0}
        icon={Database}
        accent="indigo"
        label="Collections"
        value={collections}
      />
      <StatCard
        index={1}
        icon={Rows3}
        accent="slate"
        label="Total lignes"
        value={totalRows}
      />
      <StatCard
        index={2}
        icon={CheckCircle2}
        accent="emerald"
        label="Publiées"
        value={publishedRows}
        progress={totalRows > 0 ? { current: publishedRows, total: totalRows } : undefined}
      />
      <StatCard
        index={3}
        icon={FileEdit}
        accent="amber"
        label="Brouillons"
        value={draftRows}
        pulse={draftRows > 0}
        hint={draftRows > 0 ? 'à publier' : undefined}
      />
    </div>
  );
}

function matchesStatus(
  stats: { publishedRows: number; draftRows: number; unpublishedRows: number; changesRows: number },
  filter: StatusFilter,
) {
  if (filter === 'all') return true;
  if (filter === 'published') return stats.publishedRows > 0;
  if (filter === 'draft') return stats.draftRows > 0;
  if (filter === 'unpublished') return stats.unpublishedRows > 0;
  return stats.changesRows > 0;
}

function navigateHash(path: string) {
  window.location.hash = `#${path}`;
}

export function DataHubDashboardPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [mode, setMode] = useState<ModeFilter>('all');
  const [object, setObject] = useState<ObjectFilter>('all');
  const [refreshTarget, setRefreshTarget] = useState<Collection | null>(null);

  const { allCollections } = useCollections();

  // Deep-link: /datahub?refresh={id|technicalName} auto-opens the Refresh modal
  // on first mount. Used by the DemoScenarioHelper (step 4).
  useEffect(() => {
    const query = window.location.hash.split('?')[1] ?? '';
    const params = new URLSearchParams(query);
    const refreshKey = params.get('refresh');
    if (!refreshKey) return;
    const target =
      allCollections.find((c) => c.id === refreshKey) ??
      allCollections.find((c) => c.technicalName === refreshKey);
    if (target) setRefreshTarget(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totals = useMemo(() => {
    return allCollections.reduce(
      (acc, c) => {
        acc.totalRows += c.stats.totalRows;
        acc.publishedRows += c.stats.publishedRows;
        acc.draftRows += c.stats.draftRows;
        return acc;
      },
      { totalRows: 0, publishedRows: 0, draftRows: 0 },
    );
  }, [allCollections]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allCollections
      .filter((c) => {
        if (q) {
          const haystack = `${c.displayName} ${c.technicalName} ${c.description ?? ''}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (!matchesStatus(c.stats, status)) return false;
        if (mode !== 'all' && c.ingestionMode !== mode) return false;
        if (object !== 'all' && !c.linkedPivotObjects.includes(object)) return false;
        return true;
      })
      .sort((a, b) => {
        if (b.stats.draftRows !== a.stats.draftRows) {
          return b.stats.draftRows - a.stats.draftRows;
        }
        return b.updatedAt.localeCompare(a.updatedAt);
      });
  }, [search, status, mode, object, allCollections]);

  const hasActiveFilters =
    search.trim() !== '' || status !== 'all' || mode !== 'all' || object !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setMode('all');
    setObject('all');
  };

  return (
    <div className="flex-1">
      <PageHeader
        breadcrumb={[
          { label: 'InvestHub OS' },
          { label: 'Portails et Contenu' },
          { label: 'DataHub' },
        ]}
        title="DataHub"
        subtitle="Gestion des collections de données personnalisées"
        primaryAction={{
          label: 'Nouvelle collection',
          onClick: () => navigateHash('/datahub/new'),
          ariaLabel: 'Créer une nouvelle collection',
        }}
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        <StatStrip
          collections={allCollections.length}
          totalRows={totals.totalRows}
          publishedRows={totals.publishedRows}
          draftRows={totals.draftRows}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une collection…"
              className="pl-9"
              aria-label="Rechercher une collection"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]" aria-label="Filtrer par statut">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {STATUS_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mode} onValueChange={(v) => setMode(v as ModeFilter)}>
            <SelectTrigger className="w-[180px]" aria-label="Filtrer par mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MODE_LABELS) as ModeFilter[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {MODE_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={object} onValueChange={(v) => setObject(v as ObjectFilter)}>
            <SelectTrigger className="w-[200px]" aria-label="Filtrer par objet IH">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(OBJECT_LABELS) as ObjectFilter[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {OBJECT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {visible.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <SearchX className="size-10 text-muted-foreground" aria-hidden />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  Aucune collection ne correspond à votre recherche
                </p>
                <p className="text-xs text-muted-foreground">
                  Essayez de changer un filtre ou effacez-les pour revenir à la
                  liste complète.
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                Effacer les filtres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onClick={() => navigateHash(`/datahub/${collection.id}`)}
                onRefresh={() => setRefreshTarget(collection)}
              />
            ))}
          </div>
        )}
      </div>

      {refreshTarget && (
        <RefreshDataModal
          open={!!refreshTarget}
          onOpenChange={(next) => {
            if (!next) setRefreshTarget(null);
          }}
          collection={refreshTarget}
        />
      )}
    </div>
  );
}

export default DataHubDashboardPage;
