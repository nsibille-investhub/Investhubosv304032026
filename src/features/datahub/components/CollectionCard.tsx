import type { KeyboardEvent, MouseEvent } from 'react';
import { ArrowRight, MoreHorizontal } from 'lucide-react';

import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { cn } from '../../../components/ui/utils';

import type { Collection, InvestHubPivotObject } from '../types';
import { IngestionModeBadge } from './IngestionModeBadge';
import { PivotTypeBadge } from './PivotTypeBadge';
import { SyncIndicator } from './SyncIndicator';

const PIVOT_OBJECT_LABELS: Record<InvestHubPivotObject, string> = {
  campaign: 'Fonds',
  subscription: 'Souscription',
  investor: 'Investisseur',
  contact: 'Contact',
  distributor: 'Distributeur',
  'capital-account': 'Compte de capital',
  commitment: 'Engagement',
};

const nf = new Intl.NumberFormat('fr-FR');

function Counter({
  label,
  value,
  accentColor,
}: {
  label: string;
  value: number;
  accentColor?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-lg font-semibold leading-none"
        style={accentColor ? { color: accentColor } : undefined}
      >
        {nf.format(value)}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

export interface CollectionCardProps {
  collection: Collection;
  onClick?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function CollectionCard({
  collection,
  onClick,
  onRefresh,
  className,
}: CollectionCardProps) {
  const {
    displayName,
    technicalName,
    description,
    ingestionMode,
    pivotType,
    linkedPivotObjects,
    columns,
    stats,
    lastSyncAt,
  } = collection;

  const showSync = ingestionMode === 'api-pull' || ingestionMode === 'api-push' || ingestionMode === 'mcp';
  const hasDrafts = stats.draftRows > 0;
  const canRefresh = ingestionMode !== 'manual';

  const stopAndRun = (fn?: () => void) => (e: MouseEvent) => {
    e.stopPropagation();
    fn?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={onClick ? `Ouvrir la collection ${displayName}` : undefined}
      className={cn(
        'gap-4 transition-colors',
        onClick &&
          'cursor-pointer hover:border-ring/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span>{displayName}</span>
          <IngestionModeBadge mode={ingestionMode} size="sm" />
        </CardTitle>
        <CardDescription>
          <code className="font-mono text-xs">{technicalName}</code>
        </CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => e.stopPropagation()}
                aria-label="Actions de la collection"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem
                onSelect={() => canRefresh && onRefresh?.()}
                disabled={!canRefresh}
              >
                Rafraîchir
              </DropdownMenuItem>
              <DropdownMenuItem>Dupliquer</DropdownMenuItem>
              <DropdownMenuItem>Voir la doc API</DropdownMenuItem>
              <DropdownMenuItem>Exporter schéma</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Archiver</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {description ?? '—'}
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <PivotTypeBadge type={pivotType} size="sm" />
          {linkedPivotObjects.map((obj) => (
            <Badge key={obj} variant="secondary" className="font-normal">
              {PIVOT_OBJECT_LABELS[obj]}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
          <Counter label="Colonnes" value={columns.length} />
          <Counter label="Lignes" value={stats.totalRows} />
          <Counter label="Publiées" value={stats.publishedRows} />
          <Counter
            label="Brouillons"
            value={stats.draftRows}
            accentColor={hasDrafts ? 'var(--datahub-status-draft-fg)' : undefined}
          />
        </div>
      </CardContent>

      <CardFooter className="justify-between gap-2">
        <div className="min-h-[1.25rem]">
          {showSync && <SyncIndicator lastSyncAt={lastSyncAt} />}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={stopAndRun(onClick)}
          aria-label={`Gérer les données de ${displayName}`}
        >
          Gérer les données
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CollectionCard;
