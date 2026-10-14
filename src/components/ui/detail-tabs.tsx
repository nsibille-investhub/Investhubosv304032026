import type { ComponentType, ReactNode } from 'react';
import { Badge } from './badge';
import { TabsList, TabsTrigger } from './tabs';

export interface DetailTabItem {
  value: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  /** Compteur ou pourcentage affiché après le libellé. */
  badge?: ReactNode;
  /** Teinte de la pastille. Par défaut : neutre. */
  badgeClassName?: string;
}

const DEFAULT_BADGE_CLASS = 'bg-muted text-foreground/80 border-border';

interface DetailTabsListProps {
  items: DetailTabItem[];
  activeValue: string;
  /**
   * Onglets trop nombreux pour la largeur : "truncate" réduit les libellés (référence souscription),
   * "scroll" garde les libellés entiers et fait défiler la barre.
   */
  overflow?: 'truncate' | 'scroll';
}

/**
 * Barre d'onglets d'une page de détail. Référence : la fiche souscription.
 * À placer dans <Tabs>, au sein d'un conteneur "px-8 bg-card border-b border-border".
 */
export function DetailTabsList({ items, activeValue, overflow = 'truncate' }: DetailTabsListProps) {
  const scroll = overflow === 'scroll';
  return (
    <TabsList
      className={`!bg-transparent rounded-none w-full max-w-full justify-start h-auto p-0 gap-0 ${scroll ? 'overflow-x-auto' : 'overflow-hidden'}`}
    >
      {items.map(tab => {
        const Icon = tab.icon;
        const isActive = activeValue === tab.value;
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            title={tab.label}
            className={`!bg-transparent !rounded-none !border-0 !shadow-none basis-auto ${scroll ? 'shrink-0' : 'min-w-0 shrink data-[state=active]:shrink-0'} px-2 xl:px-4 pb-3 pt-4 font-medium text-muted-foreground data-[state=active]:text-primary`}
            style={isActive ? { boxShadow: 'inset 0 -2px 0 0 var(--color-primary)' } : undefined}
          >
            <Icon className="w-4 h-4 mr-2 shrink-0" />
            <span className="truncate">{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <Badge className={`ml-2 text-xs shrink-0 ${tab.badgeClassName ?? DEFAULT_BADGE_CLASS}`}>{tab.badge}</Badge>
            )}
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
