import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Progress } from '../../../components/ui/progress';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../components/ui/radio-group';
import { SegmentedControl } from '../../../components/ui/segmented-control';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { useCollections } from '../context/CollectionsContext';
import {
  lastQuarters,
  PIVOT_OBJECT_LABEL_PLURAL,
  PIVOT_OBJECT_LABEL_SINGULAR,
  SCOPE_ENTITIES,
  simulateImport,
  type ImportBehavior,
  type ImportOptions,
  type ImportPeriod,
  type ImportScope,
  type ImportSimulation,
} from '../lib/simulateImport';
import type { Collection, InvestHubPivotObject } from '../types';
import { SyncIndicator } from './SyncIndicator';

const MODE_LABELS: Record<Collection['ingestionMode'], string> = {
  manual: 'Saisie manuelle',
  file: 'Import fichier',
  'api-pull': 'API (pull)',
  'api-push': 'API (push)',
  mcp: 'Agent MCP',
};

const LOADER_PHASES: Array<{ msg: string; duration: number }> = [
  { msg: 'Connexion à la source…', duration: 500 },
  { msg: 'Récupération des données…', duration: 800 },
  { msg: 'Validation du schéma…', duration: 400 },
  { msg: 'Injection en base…', duration: 600 },
];

type Phase = 'form' | 'loading' | 'done';

type Nf = Intl.NumberFormat;

const nf: Nf = new Intl.NumberFormat('fr-FR');

const ANCHOR = new Date('2026-04-22T08:00:00Z');

export interface RefreshDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection;
}

export function RefreshDataModal({
  open,
  onOpenChange,
  collection,
}: RefreshDataModalProps) {
  const { updateCollection } = useCollections();

  const principal: InvestHubPivotObject | undefined =
    collection.linkedPivotObjects[0];
  const plural = principal ? PIVOT_OBJECT_LABEL_PLURAL[principal] : 'entités';
  const singular = principal
    ? PIVOT_OBJECT_LABEL_SINGULAR[principal]
    : 'entité';
  const scopePool = principal ? SCOPE_ENTITIES[principal] ?? [] : [];

  const needsPeriod =
    collection.pivotType === 'timeseries' || collection.pivotType === 'event';
  const quarterOptions = useMemo(() => lastQuarters(8, ANCHOR), []);

  const [phase, setPhase] = useState<Phase>('form');
  const [loaderStep, setLoaderStep] = useState(0);

  const [scope, setScope] = useState<ImportScope>('all');
  const [scopeIds, setScopeIds] = useState<string[]>([]);
  const [period, setPeriod] = useState<ImportPeriod>('last');
  const [periodQuarter, setPeriodQuarter] = useState<string>(quarterOptions[0] ?? '');
  const [periodStart, setPeriodStart] = useState<string>('');
  const [periodEnd, setPeriodEnd] = useState<string>('');
  const [behavior, setBehavior] = useState<ImportBehavior>('draft');
  const [simulation, setSimulation] = useState<ImportSimulation | null>(null);

  const timersRef = useRef<number[]>([]);
  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  // Reset whenever the modal re-opens.
  useEffect(() => {
    if (open) {
      setPhase('form');
      setLoaderStep(0);
      setScope('all');
      setScopeIds([]);
      setPeriod('last');
      setPeriodQuarter(quarterOptions[0] ?? '');
      setPeriodStart('');
      setPeriodEnd('');
      setBehavior('draft');
      setSimulation(null);
    } else {
      clearTimers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => () => clearTimers(), []);

  const buildOptions = (): ImportOptions => ({
    scope,
    scopeIds,
    period,
    periodQuarter: period === 'quarter' ? periodQuarter : undefined,
    periodStart: period === 'custom' ? periodStart : undefined,
    periodEnd: period === 'custom' ? periodEnd : undefined,
    behavior,
  });

  const handleTest = () => {
    setSimulation(simulateImport(collection, buildOptions()));
  };

  const handleLaunch = () => {
    const sim = simulation ?? simulateImport(collection, buildOptions());
    if (!simulation) setSimulation(sim);

    setPhase('loading');
    setLoaderStep(0);

    let acc = 0;
    LOADER_PHASES.forEach((p, idx) => {
      acc += p.duration;
      timersRef.current.push(
        window.setTimeout(() => setLoaderStep(idx + 1), acc),
      );
    });

    timersRef.current.push(
      window.setTimeout(() => {
        // Apply mutations unless we're simulating.
        if (behavior !== 'simulate') {
          const now = new Date().toISOString();
          const nextStats = { ...collection.stats };
          nextStats.totalRows += sim.totalRows;
          if (behavior === 'draft') nextStats.draftRows += sim.totalRows;
          if (behavior === 'publish')
            nextStats.publishedRows += sim.totalRows;
          updateCollection(collection.id, {
            stats: nextStats,
            lastSyncAt: now,
            updatedAt: now,
          });
        }
        setPhase('done');

        if (behavior === 'draft') {
          toast.success(`${nf.format(sim.totalRows)} ligne(s) importée(s) en brouillon.`, {
            action: {
              label: 'Voir',
              onClick: () =>
                (window.location.hash = `#/datahub/${collection.id}?status=draft`),
            },
          });
        } else if (behavior === 'publish') {
          toast.success(`${nf.format(sim.totalRows)} ligne(s) publiée(s).`);
        } else {
          toast.info('Simulation terminée — aucune donnée n\'a été stockée.');
        }
      }, acc),
    );
  };

  const handleOpenChange = (next: boolean) => {
    if (phase === 'loading') return; // non-fermable pendant le chargement
    onOpenChange(next);
  };

  const canTest = useMemo(() => {
    if (scope === 'one' && scopeIds.length !== 1) return false;
    if (scope === 'many' && scopeIds.length < 2) return false;
    if (needsPeriod && period === 'custom' && (!periodStart || !periodEnd))
      return false;
    return true;
  }, [scope, scopeIds, needsPeriod, period, periodStart, periodEnd]);

  const progress =
    phase === 'loading'
      ? Math.round((loaderStep / LOADER_PHASES.length) * 100)
      : phase === 'done'
        ? 100
        : 0;

  const loaderMessage =
    phase === 'done'
      ? `Import terminé — ${simulation ? nf.format(simulation.totalRows) : 0} ligne(s) créée(s)`
      : LOADER_PHASES[Math.min(loaderStep, LOADER_PHASES.length - 1)].msg;

  const contentStyle: CSSProperties = { maxWidth: '42rem' };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        style={contentStyle}
        onEscapeKeyDown={(e) => {
          if (phase === 'loading') e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (phase === 'loading') e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            Rafraîchir les données — {collection.displayName}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 text-xs">
              <span>Source : {MODE_LABELS[collection.ingestionMode]}</span>
              <span aria-hidden>·</span>
              <SyncIndicator lastSyncAt={collection.lastSyncAt} />
            </div>
          </DialogDescription>
        </DialogHeader>

        {phase === 'form' && (
          <div className="flex flex-col gap-5">
            {/* Scope */}
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-foreground">
                Portée de l'import
              </h3>
              <SegmentedControl<ImportScope>
                aria-label="Portée de l'import"
                value={scope}
                onValueChange={(v) => {
                  setScope(v);
                  if (v !== 'one' && v !== 'many') setScopeIds([]);
                }}
                options={[
                  { value: 'all', label: `Tous les ${plural}` },
                  { value: 'one', label: `Un ${singular}` },
                  { value: 'many', label: `Plusieurs ${plural}` },
                ]}
              />

              {scope === 'one' && (
                <Select
                  value={scopeIds[0] ?? ''}
                  onValueChange={(v) => setScopeIds([v])}
                >
                  <SelectTrigger aria-label={`Choisir un ${singular}`}>
                    <SelectValue placeholder={`Sélectionnez un ${singular}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {scopePool.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {scope === 'many' && (
                <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
                  {scopePool.map((e) => {
                    const checked = scopeIds.includes(e.id);
                    return (
                      <div key={e.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`scope-${e.id}`}
                          checked={checked}
                          onCheckedChange={(c) => {
                            setScopeIds((prev) =>
                              c === true
                                ? prev.includes(e.id)
                                  ? prev
                                  : [...prev, e.id]
                                : prev.filter((id) => id !== e.id),
                            );
                          }}
                        />
                        <Label htmlFor={`scope-${e.id}`} className="text-sm">
                          {e.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Period */}
            {needsPeriod && (
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-foreground">
                  Période à importer
                </h3>
                <SegmentedControl<ImportPeriod>
                  aria-label="Période à importer"
                  value={period}
                  onValueChange={(v) => setPeriod(v)}
                  options={[
                    { value: 'last', label: 'Dernière période' },
                    { value: 'quarter', label: 'Période spécifique' },
                    { value: 'custom', label: 'Plage personnalisée' },
                  ]}
                />

                {period === 'quarter' && (
                  <Select value={periodQuarter} onValueChange={setPeriodQuarter}>
                    <SelectTrigger aria-label="Choisir un trimestre">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {quarterOptions.map((q) => (
                        <SelectItem key={q} value={q}>
                          {q}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {period === 'custom' && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="period-start" className="text-xs text-muted-foreground">
                        Début
                      </Label>
                      <Input
                        id="period-start"
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="period-end" className="text-xs text-muted-foreground">
                        Fin
                      </Label>
                      <Input
                        id="period-end"
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Behavior */}
            <section className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-foreground">
                Comportement d'import
              </h3>
              <RadioGroup
                value={behavior}
                onValueChange={(v) => setBehavior(v as ImportBehavior)}
                className="gap-2"
              >
                <Label
                  htmlFor="beh-draft"
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3"
                >
                  <RadioGroupItem value="draft" id="beh-draft" className="mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      Ajouter en brouillon (recommandé)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Les OPS valideront ensuite ligne par ligne.
                    </span>
                  </div>
                </Label>
                <Label
                  htmlFor="beh-publish"
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3"
                >
                  <RadioGroupItem value="publish" id="beh-publish" className="mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Publier directement</span>
                    <span className="text-xs text-muted-foreground">
                      Les données deviennent immédiatement visibles sur les
                      portails.
                    </span>
                  </div>
                </Label>
                <Label
                  htmlFor="beh-simulate"
                  className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3"
                >
                  <RadioGroupItem value="simulate" id="beh-simulate" className="mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">Simulation</span>
                    <span className="text-xs text-muted-foreground">
                      Récupère les données sans les stocker. Aucun impact sur
                      le portail.
                    </span>
                  </div>
                </Label>
              </RadioGroup>

              {behavior === 'publish' && (
                <Alert variant="destructive">
                  <TriangleAlert />
                  <AlertTitle>Publication directe</AlertTitle>
                  <AlertDescription>
                    Cette action écrasera les données actuellement publiées
                    sans validation.
                  </AlertDescription>
                </Alert>
              )}
            </section>

            {/* Preview */}
            {simulation && (
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-foreground">Preview</h3>
                <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
                  <p className="text-foreground">
                    <strong>{nf.format(simulation.totalRows)}</strong> ligne(s)
                    seraient importées.
                  </p>
                  {simulation.breakdown.length > 0 && (
                    <p className="text-muted-foreground">
                      Répartition :{' '}
                      {simulation.breakdown
                        .map((b) => `${nf.format(b.count)} pour ${b.label}`)
                        .join(' · ')}
                      .
                    </p>
                  )}
                  {simulation.duplicates > 0 && (
                    <p className="text-muted-foreground">
                      Détection de doublons :{' '}
                      <strong>{nf.format(simulation.duplicates)}</strong>{' '}
                      ligne(s) existent déjà en publié → seront remplacées par
                      les nouvelles versions en brouillon.
                    </p>
                  )}
                </div>

                {simulation.preview.length > 0 && (
                  <div className="overflow-x-auto rounded-md border border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {collection.columns.map((c) => (
                            <TableHead key={c.id} className="text-xs">
                              {c.label}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {simulation.preview.map((row, idx) => (
                          <TableRow key={idx}>
                            {collection.columns.map((c) => (
                              <TableCell key={c.id} className="text-xs">
                                {String(row[c.technicalName] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 aria-hidden className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">{loaderMessage}</p>
            <Progress value={progress} className="w-full max-w-sm" />
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle2
              aria-hidden
              className="size-10"
              style={{ color: 'var(--success)' }}
            />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                Import terminé
              </p>
              <p className="text-xs text-muted-foreground">
                {simulation
                  ? `${nf.format(simulation.totalRows)} ligne(s) créée(s).`
                  : ''}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2">
          {phase === 'form' && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={handleTest}
                  disabled={!canTest}
                >
                  Tester l'import
                </Button>
                <Button onClick={handleLaunch} disabled={!canTest}>
                  Lancer l'import
                </Button>
              </div>
            </>
          )}
          {phase === 'loading' && <span className="sr-only">Import en cours</span>}
          {phase === 'done' && (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
              {behavior === 'draft' && (
                <Button
                  onClick={() => {
                    window.location.hash = `#/datahub/${collection.id}?status=draft`;
                    onOpenChange(false);
                  }}
                >
                  Voir les nouveaux brouillons
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RefreshDataModal;
