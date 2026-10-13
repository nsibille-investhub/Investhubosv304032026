import { Archive } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { StatusBadge, type StatusVariant } from './StatusBadge';

/**
 * Statut d'un fonds, calculé par le serveur (PRD Détail d'un fonds V3, section 9.1).
 * La maquette l'affiche tel quel et ne le déduit jamais des dates.
 */
export type FundStatus =
  | 'draft'
  | 'upcoming'
  | 'collecting'
  | 'collectionEnded'
  | 'closed'
  | 'archived';

export const FUND_STATUSES: FundStatus[] = [
  'draft',
  'upcoming',
  'collecting',
  'collectionEnded',
  'closed',
  'archived',
];

export const FUND_STATUS_CONFIG: Record<
  FundStatus,
  { variant: StatusVariant; icon?: LucideIcon; labelKey: string }
> = {
  draft: { variant: 'outline', labelKey: 'funds.status.draft' },
  upcoming: { variant: 'info', labelKey: 'funds.status.upcoming' },
  collecting: { variant: 'success', labelKey: 'funds.status.collecting' },
  collectionEnded: { variant: 'warning', labelKey: 'funds.status.collectionEnded' },
  closed: { variant: 'neutral', labelKey: 'funds.status.closed' },
  archived: { variant: 'strong', icon: Archive, labelKey: 'funds.status.archived' },
};

interface FundStatusBadgeProps {
  status: FundStatus;
  className?: string;
}

export function FundStatusBadge({ status, className }: FundStatusBadgeProps) {
  const { t } = useTranslation();
  const config = FUND_STATUS_CONFIG[status];
  return (
    <StatusBadge
      label={t(config.labelKey)}
      variant={config.variant}
      icon={config.icon}
      className={className}
    />
  );
}
