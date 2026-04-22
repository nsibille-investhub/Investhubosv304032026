import { type ComponentType } from 'react';
import { CheckCircle2, FileUp, Pencil, Plug, Sparkles } from 'lucide-react';

import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { cn } from '../../../../components/ui/utils';
import type { IngestionMode } from '../../types';

type LucideIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

type TileKey = 'manual' | 'file' | 'api' | 'mcp';

type Complexity = 'Instantané' | 'Simple' | 'Technique' | 'Avancé';

interface Tile {
  key: TileKey;
  icon: LucideIcon;
  title: string;
  pitch: string;
  complexity: Complexity;
}

const TILES: Tile[] = [
  {
    key: 'manual',
    icon: Pencil,
    title: 'Saisie manuelle',
    pitch: 'Vous saisissez les données directement dans un tableau type Excel.',
    complexity: 'Instantané',
  },
  {
    key: 'file',
    icon: FileUp,
    title: 'Import de fichier',
    pitch:
      'Déposez un fichier CSV, Excel, XML ou JSON — mis à jour manuellement ou sur planning.',
    complexity: 'Simple',
  },
  {
    key: 'api',
    icon: Plug,
    title: 'Connexion API',
    pitch:
      'Votre système pousse ou InvestHub récupère automatiquement la donnée.',
    complexity: 'Technique',
  },
  {
    key: 'mcp',
    icon: Sparkles,
    title: 'Agent intelligent (MCP)',
    pitch:
      'Connectez un agent ou une source compatible MCP pour une ingestion autonome.',
    complexity: 'Avancé',
  },
];

function tileKeyOf(mode: IngestionMode | undefined): TileKey | undefined {
  if (!mode) return undefined;
  if (mode === 'api-pull' || mode === 'api-push') return 'api';
  return mode;
}

export interface WizardStepModeProps {
  mode?: IngestionMode;
  onChange: (mode: IngestionMode) => void;
}

export function WizardStepMode({ mode, onChange }: WizardStepModeProps) {
  const selected = tileKeyOf(mode);

  const handleTileClick = (key: TileKey) => {
    if (key === 'api') {
      if (mode !== 'api-pull' && mode !== 'api-push') onChange('api-pull');
      return;
    }
    onChange(key);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          Comment la donnée arrivera-t-elle dans InvestHub ?
        </h2>
        <p className="text-sm text-muted-foreground">
          Choisissez le mode d'alimentation de votre collection. Ce choix
          pourra être modifié ultérieurement.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TILES.map((tile) => {
          const isSelected = selected === tile.key;
          const Icon = tile.icon;

          return (
            <div key={tile.key} className="flex flex-col gap-3">
              <Card
                role="button"
                tabIndex={0}
                onClick={() => handleTileClick(tile.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTileClick(tile.key);
                  }
                }}
                aria-pressed={isSelected}
                aria-label={tile.title}
                className={cn(
                  'relative gap-3 cursor-pointer transition-colors',
                  'hover:border-foreground/20',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  isSelected && 'border-primary ring-2 ring-primary/30',
                )}
              >
                {isSelected && (
                  <CheckCircle2
                    aria-hidden
                    className="absolute right-3 top-3 size-5 text-primary"
                  />
                )}
                <CardContent className="flex flex-col gap-3 px-6 pb-6 pt-6">
                  <Icon className="size-8 text-foreground" aria-hidden />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {tile.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tile.pitch}
                    </p>
                  </div>
                  <div>
                    <Badge variant="secondary" className="font-normal">
                      {tile.complexity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {tile.key === 'api' && isSelected && (
                <div className="rounded-md border border-border bg-muted/40 p-4">
                  <RadioGroup
                    value={mode === 'api-push' ? 'api-push' : 'api-pull'}
                    onValueChange={(v) => onChange(v as IngestionMode)}
                    className="gap-3"
                  >
                    <div className="flex items-start gap-2">
                      <RadioGroupItem
                        value="api-pull"
                        id="api-pull"
                        className="mt-1"
                      />
                      <Label
                        htmlFor="api-pull"
                        className="flex flex-col gap-0.5"
                      >
                        <span className="font-medium">
                          InvestHub récupère (PULL)
                        </span>
                        <span className="text-xs text-muted-foreground">
                          InvestHub interroge votre API selon une fréquence
                          donnée.
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <RadioGroupItem
                        value="api-push"
                        id="api-push"
                        className="mt-1"
                      />
                      <Label
                        htmlFor="api-push"
                        className="flex flex-col gap-0.5"
                      >
                        <span className="font-medium">
                          Ma source pousse (PUSH)
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Votre système envoie les données vers un webhook
                          InvestHub.
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WizardStepMode;
