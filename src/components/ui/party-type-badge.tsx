import { Building2, User, type LucideIcon } from 'lucide-react';

import { cn } from './utils';

export type PartyType = 'individual' | 'corporate' | 'structure';

const PARTY_ICON: Record<PartyType, LucideIcon> = {
  individual: User,
  corporate: Building2,
  structure: Building2,
};

const PARTY_DEFAULT_LABEL: Record<PartyType, string> = {
  individual: 'PP',
  corporate: 'PM',
  structure: 'STR',
};

export interface PartyTypeBadgeProps {
  /** Subject type — drives the icon + default short label. */
  type: PartyType;
  /** Override the default short label (PP / PM / STR). */
  label?: string;
  className?: string;
}

/**
 * Compact badge representing a party type (Personne physique / Personne morale
 * / Structure). Used in autocomplete rows, selected chips and any place where
 * we surface the type next to a name.
 */
export function PartyTypeBadge({ type, label, className }: PartyTypeBadgeProps) {
  const Icon = PARTY_ICON[type];
  return (
    <span
      data-slot="party-type-badge"
      data-party-type={type}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shrink-0',
        className,
      )}
    >
      <Icon className="size-3" />
      {label ?? PARTY_DEFAULT_LABEL[type]}
    </span>
  );
}
