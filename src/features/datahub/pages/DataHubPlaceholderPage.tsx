import { useEffect, useState, type ComponentType } from 'react';
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

export function DataHubPlaceholderPage() {
  const route = useCurrentRoute();

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

        <footer className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Route actuelle :{' '}
          <code className="font-mono text-foreground">{route}</code>
        </footer>
      </div>
    </div>
  );
}

export default DataHubPlaceholderPage;
