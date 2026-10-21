import type { LucideIcon } from 'lucide-react';
import { CornerDownRight, Link2, TriangleAlert, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useTranslation } from '../utils/languageContext';
import { toneText } from './ui/tone';

const T = 'subscriptions.detail.onboarding.relations';

export type SyncDirection = 'toTarget' | 'fromTarget' | 'both';

const SYNC_ARROWS: Record<SyncDirection, string> = { toTarget: '→', fromTarget: '←', both: '↔' };
const SYNC_DIRECTIONS: SyncDirection[] = ['toTarget', 'fromTarget', 'both'];

export interface SyncedTarget {
  /** "Fiche investisseur · IBAN". */
  label: string;
  direction: SyncDirection;
}

interface QuestionRelationIconsProps {
  /** Données synchronisées, avec le sens de la synchronisation. */
  syncedWith?: SyncedTarget[];
  /** Données synchronisées dont la valeur diffère de la réponse. */
  gaps?: string[];
  /** Questions que celle-ci déclenche. */
  impacts?: string[];
  /** Questions qui déclenchent celle-ci. */
  impactedBy?: string[];
}

function RelationIcon({
  icon: Icon,
  title,
  items,
  legend = [],
  danger,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  legend?: string[];
  danger?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} aria-label={`${title} ${items.join(', ')}`} className="inline-flex">
          <Icon
            className={danger ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5 text-muted-foreground'}
            style={danger ? toneText('warning') : undefined}
          />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{title}</p>
        <ul>
          {items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {legend.length > 0 && (
          <ul className="mt-1 border-t border-white/20 pt-1 opacity-70">
            {legend.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

/** Icônes d'une question : synchronisée, écart avec la donnée reportée, déclenche, déclenchée par. */
export function QuestionRelationIcons({ syncedWith = [], gaps = [], impacts = [], impactedBy = [] }: QuestionRelationIconsProps) {
  const { t } = useTranslation();
  if (syncedWith.length + gaps.length + impacts.length + impactedBy.length === 0) return null;
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      {gaps.length > 0 ? (
        <RelationIcon icon={TriangleAlert} title={t(`${T}.gap`)} items={gaps} danger />
      ) : (
        syncedWith.length > 0 && (
          <RelationIcon
            icon={Link2}
            title={t(`${T}.synced`)}
            items={syncedWith.map(target => `${SYNC_ARROWS[target.direction]} ${target.label}`)}
            legend={SYNC_DIRECTIONS.filter(direction => syncedWith.some(target => target.direction === direction)).map(
              direction => `${SYNC_ARROWS[direction]} ${t(`${T}.direction.${direction}`)}`,
            )}
          />
        )
      )}
      {impacts.length > 0 && <RelationIcon icon={Zap} title={t(`${T}.impacts`)} items={impacts} />}
      {impactedBy.length > 0 && <RelationIcon icon={CornerDownRight} title={t(`${T}.impactedBy`)} items={impactedBy} />}
    </span>
  );
}
