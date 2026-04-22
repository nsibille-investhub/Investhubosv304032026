import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { ASTORG_PERF_TECHNICAL_NAME } from '../seed/demoScenario';

interface DemoStep {
  num: number;
  title: string;
  description: string;
  hash: string;
}

const STEPS: DemoStep[] = [
  {
    num: 1,
    title: 'Ouvrir le wizard',
    description: 'API PULL Lemonedge — création d\'une nouvelle collection',
    hash: '#/datahub/new?demo=1',
  },
  {
    num: 2,
    title: 'Ouvrir le dashboard',
    description: 'Liste des collections Astorg',
    hash: '#/datahub?demo=1',
  },
  {
    num: 3,
    title: 'Ouvrir Performance Fonds',
    description: 'Détail de la collection (placeholder)',
    hash: `#/datahub/${ASTORG_PERF_TECHNICAL_NAME}?demo=1`,
  },
  {
    num: 4,
    title: 'Rafraîchir les données',
    description: 'Modale pré-configurée : tous les fonds · T1 2026 · draft',
    hash: `#/datahub?refresh=col_perf_astorg&demo=1`,
  },
  {
    num: 5,
    title: 'View as LP (avant/après)',
    description: 'Prévisualisation portail LP avec toggle brouillons',
    hash: `#/datahub/${ASTORG_PERF_TECHNICAL_NAME}/view-as-lp?demo=1`,
  },
];

export interface DemoScenarioHelperProps {
  /** When true, the panel is rendered. Controlled by `?demo=1` in the URL. */
  visible: boolean;
}

export function DemoScenarioHelper({ visible }: DemoScenarioHelperProps) {
  const [closed, setClosed] = useState(false);
  if (!visible || closed) return null;

  return (
    <Card
      role="dialog"
      aria-label="Scénario démo Astorg"
      className="fixed bottom-4 right-4 z-50 w-[320px] shadow-lg"
    >
      <div className="flex items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden className="size-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Scénario démo Astorg
            </span>
            <span className="text-[11px] text-muted-foreground">
              Raccourcis vers les 5 étapes
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setClosed(true)}
          aria-label="Fermer le panneau de démo"
          className="size-7"
        >
          <X />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 px-2 py-2">
        {STEPS.map((step) => (
          <button
            key={step.num}
            type="button"
            onClick={() => {
              window.location.hash = step.hash.replace(/^#/, '');
            }}
            className="flex items-start gap-3 rounded-md px-3 py-2 text-left hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
              {step.num}
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {step.title}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {step.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

export default DemoScenarioHelper;
