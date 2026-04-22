import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import {
  BarChart3,
  Database,
  Info,
  Plug,
  ShieldCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { StatusBadge } from '../components/StatusBadge';
import { IngestionModeBadge } from '../components/IngestionModeBadge';
import { PivotTypeBadge } from '../components/PivotTypeBadge';
import { SyncIndicator } from '../components/SyncIndicator';
import type {
  CollectionRowStatus,
  IngestionMode,
  PivotTemporalType,
} from '../types';

type LucideIcon = ComponentType<{ className?: string }>;

type Pillar = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const pillars: Pillar[] = [
  {
    icon: Plug,
    title: 'Ingestion universelle',
    description: 'API, fichiers, connecteurs, MCP',
  },
  {
    icon: Database,
    title: 'Entrepôt customisable',
    description: 'tables IH standards + tables custom',
  },
  {
    icon: BarChart3,
    title: 'BI embarquée',
    description: 'KPIs, graphiques, tableaux dans les portails',
  },
  {
    icon: ShieldCheck,
    title: 'Modération éditoriale',
    description: 'workflow draft/published, historique',
  },
];

const STATUSES: CollectionRowStatus[] = [
  'published',
  'draft',
  'unpublished',
  'changes',
];

const MODES: IngestionMode[] = [
  'manual',
  'file',
  'api-pull',
  'api-push',
  'mcp',
];

const PIVOT_TYPES: PivotTemporalType[] = ['timeseries', 'reference', 'event'];

function useCurrentRoute() {
  const read = () => {
    const hash = window.location.hash;
    const path = hash.replace(/^#/, '').split('?')[0];
    return path || '/';
  };
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

function PreviewCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function PreviewRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function DataHubPlaceholderPage() {
  const route = useCurrentRoute();

  // Frozen at mount: SyncIndicator re-renders itself every 60s via its own tick hook.
  const now = useMemo(() => Date.now(), []);
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

  return (
    <div className="flex-1 px-6 pb-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 py-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">DataHub</h1>
          <p className="text-sm text-muted-foreground">
            Data Management System — Gestion, modération et exploitation des
            données métier.
          </p>
        </header>

        <Alert>
          <Info />
          <AlertTitle>Module en construction</AlertTitle>
          <AlertDescription>
            Les écrans seront progressivement livrés.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <Icon className="size-5 text-muted-foreground" />
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>

        {/* Gallery — temporary, remove when real screens land */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-medium text-foreground">
              Composants DataHub
            </h2>
            <p className="text-xs text-muted-foreground">
              Aperçu visuel des composants livrés. À retirer lorsque les écrans
              définitifs seront en place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <PreviewCard
              title="StatusBadge"
              description="Statut d'une ligne de collection (publié / brouillon / dépublié / modif)."
            >
              <PreviewRow label="md">
                {STATUSES.map((s) => (
                  <StatusBadge key={`md-${s}`} status={s} />
                ))}
              </PreviewRow>
              <PreviewRow label="sm">
                {STATUSES.map((s) => (
                  <StatusBadge key={`sm-${s}`} status={s} size="sm" />
                ))}
              </PreviewRow>
              <PreviewRow label="sans icône">
                {STATUSES.map((s) => (
                  <StatusBadge
                    key={`noicon-${s}`}
                    status={s}
                    showIcon={false}
                  />
                ))}
              </PreviewRow>
            </PreviewCard>

            <PreviewCard
              title="IngestionModeBadge"
              description="Mode d'ingestion d'une collection (manuel / fichier / API / MCP)."
            >
              <PreviewRow label="md">
                {MODES.map((m) => (
                  <IngestionModeBadge key={`md-${m}`} mode={m} />
                ))}
              </PreviewRow>
              <PreviewRow label="sm">
                {MODES.map((m) => (
                  <IngestionModeBadge key={`sm-${m}`} mode={m} size="sm" />
                ))}
              </PreviewRow>
              <PreviewRow label="icône seule">
                {MODES.map((m) => (
                  <IngestionModeBadge
                    key={`icon-${m}`}
                    mode={m}
                    showLabel={false}
                  />
                ))}
              </PreviewRow>
            </PreviewCard>

            <PreviewCard
              title="PivotTypeBadge"
              description="Type de dimension temporelle (série temporelle / référentiel / évènementielle)."
            >
              <PreviewRow label="md">
                {PIVOT_TYPES.map((t) => (
                  <PivotTypeBadge key={`md-${t}`} type={t} />
                ))}
              </PreviewRow>
              <PreviewRow label="sm">
                {PIVOT_TYPES.map((t) => (
                  <PivotTypeBadge key={`sm-${t}`} type={t} size="sm" />
                ))}
              </PreviewRow>
            </PreviewCard>

            <PreviewCard
              title="SyncIndicator"
              description="Fraîcheur de synchronisation — texte relatif (date-fns / fr), tooltip sur date absolue."
            >
              <PreviewRow label="inline">
                <SyncIndicator lastSyncAt={iso(30 * 1000)} />
                <SyncIndicator lastSyncAt={iso(2 * 60 * 60 * 1000)} />
                <SyncIndicator
                  lastSyncAt={iso(5 * 24 * 60 * 60 * 1000)}
                />
                <SyncIndicator />
                <SyncIndicator isSyncing />
              </PreviewRow>
              <PreviewRow label="badge">
                <SyncIndicator
                  variant="badge"
                  lastSyncAt={iso(30 * 1000)}
                />
                <SyncIndicator
                  variant="badge"
                  lastSyncAt={iso(2 * 60 * 60 * 1000)}
                />
                <SyncIndicator
                  variant="badge"
                  lastSyncAt={iso(5 * 24 * 60 * 60 * 1000)}
                />
                <SyncIndicator variant="badge" />
                <SyncIndicator variant="badge" isSyncing />
              </PreviewRow>
            </PreviewCard>
          </div>
        </section>

        <footer className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Route actuelle :{' '}
          <code className="font-mono text-foreground">{route}</code>
        </footer>
      </div>
    </div>
  );
}

export default DataHubPlaceholderPage;
