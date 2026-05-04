import { motion } from 'motion/react';
import { Building2, ChevronDown, ChevronRight, User, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { StatusBadge } from './StatusBadge';
import { cn } from './ui/utils';
import type { KYCRisk, KYCThirdParty } from '../utils/kycFileGenerator';

const RISK_TO_VARIANT: Record<KYCRisk, 'success' | 'warning' | 'danger' | 'neutral'> = {
  Faible: 'success',
  Moyen: 'warning',
  Élevé: 'danger',
  Bloqué: 'danger',
};

const ROLE_BADGE_CLASS: Record<KYCThirdParty['role'], string> = {
  Représentant: 'bg-accent text-accent-foreground border-transparent',
  Entreprise: 'bg-secondary text-secondary-foreground border-transparent',
  UBO: 'bg-primary/10 text-primary border-transparent',
};

interface KYCThirdPartiesCellProps {
  parties: KYCThirdParty[];
  emptyLabel?: string;
  popoverLabel?: string;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function KYCThirdPartiesCell({
  parties,
  emptyLabel = 'Aucune partie tiers',
  popoverLabel = 'Parties tiers liées',
}: KYCThirdPartiesCellProps) {
  if (parties.length === 0) {
    return <span className="text-xs text-muted-foreground italic">{emptyLabel}</span>;
  }

  const first = parties[0];
  const remaining = parties.length - 1;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex flex-col items-start gap-1 text-xs group w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors w-full">
            <span className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
              {first.type === 'Personne morale' ? (
                <Building2 className="w-3 h-3" />
              ) : (
                <User className="w-3 h-3" />
              )}
            </span>
            <span
              className="truncate max-w-[140px] group-hover:underline"
              title={first.fullName}
            >
              {first.fullName}
            </span>
            <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-all flex-shrink-0" />
          </div>
          {remaining > 0 && (
            <span className="flex items-center gap-1 text-primary transition-colors ml-[18px]">
              <span className="font-medium">+{remaining} more</span>
              <ChevronDown className="w-3 h-3" />
            </span>
          )}
        </motion.button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[380px] p-0"
        align="start"
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-xl bg-accent text-accent-foreground">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{popoverLabel}</h3>
              <p className="text-xs text-muted-foreground">
                {parties.length} partie{parties.length > 1 ? 's' : ''} tiers liée
                {parties.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {parties.map((party) => (
              <div
                key={party.id}
                className="rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="size-8 mt-0.5">
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-semibold">
                      {party.type === 'Personne morale' ? (
                        <Building2 className="w-4 h-4" />
                      ) : (
                        getInitials(party.fullName)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">
                        {party.fullName}
                      </p>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] py-0', ROLE_BADGE_CLASS[party.role])}
                      >
                        {party.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{party.keyInfo}</p>
                    <div className="mt-2">
                      <StatusBadge
                        label={`Risque ${party.risk}`}
                        variant={RISK_TO_VARIANT[party.risk]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
