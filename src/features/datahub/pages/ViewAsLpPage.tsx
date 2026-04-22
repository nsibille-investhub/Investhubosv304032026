import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useCollections } from '../context/CollectionsContext';
import { LpPortalPreview } from '../components/LpPortalPreview';
import { ViewAsToggle } from '../components/ViewAsToggle';
import { applyLpViewFilters } from '../lib/applyLpViewFilters';
import {
  astorgPerfRows,
  ASTORG_PERF_COLLECTION_ID,
  ASTORG_PERF_TECHNICAL_NAME,
  DEMO_FUNDS,
  DEMO_INVESTORS,
  DEMO_PERIODS,
} from '../seed/demoScenario';

export interface ViewAsLpPageProps {
  collectionKey: string; // id or technicalName from the URL
  onExit: () => void;
}

function resolveCollection(
  allCollections: ReturnType<typeof useCollections>['allCollections'],
  key: string,
) {
  return (
    allCollections.find((c) => c.id === key) ??
    allCollections.find((c) => c.technicalName === key)
  );
}

export function ViewAsLpPage({ collectionKey, onExit }: ViewAsLpPageProps) {
  const { allCollections, updateCollection } = useCollections();

  const collection = useMemo(
    () => resolveCollection(allCollections, collectionKey),
    [allCollections, collectionKey],
  );

  const [investor, setInvestor] = useState('all');
  const [fund, setFund] = useState('all');
  const [period, setPeriod] = useState('all');
  const [showDrafts, setShowDrafts] = useState(false);

  const filters = { investor, fund, period };

  // Rows are demo-seeded for the Astorg perf collection; other collections
  // display an empty preview for now (no row storage in the MVP).
  const rows = useMemo(() => {
    if (!collection) return [];
    if (
      collection.id === ASTORG_PERF_COLLECTION_ID ||
      collection.technicalName === ASTORG_PERF_TECHNICAL_NAME
    ) {
      return astorgPerfRows;
    }
    return [];
  }, [collection]);

  const draftRowsInScope = useMemo(
    () => applyLpViewFilters(rows, filters, true).filter((r) => r.status !== 'published'),
    [rows, filters],
  );

  const fundCountInScope = new Set(draftRowsInScope.map((r) => r.fund)).size;
  const investorCountInScope = Math.max(1, new Set(draftRowsInScope.map((r) => r.investorId ?? 'all')).size);

  const publishDrafts = () => {
    if (!collection) return;
    if (draftRowsInScope.length === 0) {
      toast.info('Aucun brouillon dans le scope sélectionné.');
      return;
    }
    const now = new Date().toISOString();
    const nextStats = { ...collection.stats };
    nextStats.publishedRows += draftRowsInScope.length;
    nextStats.draftRows = Math.max(0, nextStats.draftRows - draftRowsInScope.length);
    updateCollection(collection.id, {
      stats: nextStats,
      updatedAt: now,
    });
    toast.success(`${draftRowsInScope.length} brouillon(s) publié(s).`);
  };

  if (!collection) {
    return (
      <div className="flex-1 px-6 pb-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 py-6">
          <Button variant="outline" size="sm" onClick={onExit} className="gap-2 w-fit">
            <ArrowLeft className="size-4" />
            Retour au tableau
          </Button>
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Collection introuvable.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 pb-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 py-6">
        <nav aria-label="Fil d'Ariane" className="text-xs text-muted-foreground">
          <span>InvestHub OS</span>
          <span className="mx-1.5">›</span>
          <span>DataHub</span>
          <span className="mx-1.5">›</span>
          <span>{collection.displayName}</span>
          <span className="mx-1.5">›</span>
          <span className="text-foreground">View as LP</span>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onExit} className="gap-2">
              <ArrowLeft className="size-4" />
              Retour au tableau
            </Button>
            <div className="h-4 w-px bg-border" aria-hidden />
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground">
                Prévisualisation portail LP
              </h1>
              <p className="text-xs text-muted-foreground">
                {collection.displayName} · Vu comme un LP investisseur
              </p>
            </div>
          </div>
        </div>

        {/* Context filters */}
        <Card className="bg-muted/30">
          <CardContent className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="vap-investor">
                Vu comme quel investisseur ?
              </label>
              <Select value={investor} onValueChange={setInvestor}>
                <SelectTrigger id="vap-investor">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les investisseurs</SelectItem>
                  {DEMO_INVESTORS.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="vap-fund">
                Quel fonds ?
              </label>
              <Select value={fund} onValueChange={setFund}>
                <SelectTrigger id="vap-fund">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fonds</SelectItem>
                  {DEMO_FUNDS.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground" htmlFor="vap-period">
                Quelle période ?
              </label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="vap-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Historique complet</SelectItem>
                  {DEMO_PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <ViewAsToggle value={showDrafts} onChange={setShowDrafts} />

        <LpPortalPreview
          collection={collection}
          rows={rows}
          filters={filters}
          showDrafts={showDrafts}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card px-6 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {draftRowsInScope.length > 0 ? (
              <>
                En publiant,{' '}
                <strong className="text-foreground">
                  {draftRowsInScope.length}
                </strong>{' '}
                brouillon(s) deviendront visibles pour{' '}
                <strong className="text-foreground">{investorCountInScope}</strong>{' '}
                investisseur(s) sur{' '}
                <strong className="text-foreground">{fundCountInScope}</strong>{' '}
                fonds.
              </>
            ) : (
              'Aucun brouillon dans le scope sélectionné.'
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onExit}>
              Retour au tableau
            </Button>
            <Button onClick={publishDrafts} disabled={draftRowsInScope.length === 0}>
              Publier tous les brouillons du scope
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewAsLpPage;
