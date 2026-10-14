import type { ComponentType, ReactNode } from 'react';
import { TabsList, TabsTrigger } from './tabs';

export interface DetailTabItem {
  value: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  /** Compteur ou pourcentage affiché après le libellé. */
  badge?: ReactNode;
}

interface DetailTabsListProps {
  items: DetailTabItem[];
  /**
   * Onglets trop nombreux pour la largeur : "truncate" réduit les libellés,
   * "scroll" garde les libellés entiers et fait défiler la barre.
   */
  overflow?: 'truncate' | 'scroll';
}

/** Pastille de compteur d'un onglet, neutre. */
export function TabCount({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
      {children}
    </span>
  );
}

/**
 * Barre d'onglets d'une page de détail, sur le style sobre de Tabs : icône, libellé, compteur.
 * À placer dans <Tabs>, au sein d'un conteneur "px-8 bg-card border-b border-border"
 * qui porte la ligne de séparation.
 */
export function DetailTabsList({ items, overflow = 'truncate' }: DetailTabsListProps) {
  const scroll = overflow === 'scroll';
  return (
    <TabsList className={scroll ? 'overflow-x-auto' : 'overflow-hidden'} style={{ boxShadow: 'none' }}>
      {items.map(tab => {
        const Icon = tab.icon;
        return (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            title={tab.label}
            className="shrink-0"
            style={scroll ? undefined : { flexShrink: 1, minWidth: 0 }}
          >
            <Icon className="w-4 h-4" />
            <span className="truncate">{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && <TabCount>{tab.badge}</TabCount>}
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
