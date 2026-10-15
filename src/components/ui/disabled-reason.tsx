import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from './utils';

interface DisabledReasonProps {
  /** Motif affiché au survol. Sans motif, l'enfant est rendu tel quel. */
  reason?: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * Enveloppe une action désactivée pour afficher son motif au survol.
 * Un bouton désactivé ne déclenche pas d'événement : le déclencheur est un span focusable.
 */
export function DisabledReason({ reason, children, className }: DisabledReasonProps) {
  if (!reason) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className={cn('inline-flex cursor-not-allowed', className)}>
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-xs">{reason}</span>
      </TooltipContent>
    </Tooltip>
  );
}
