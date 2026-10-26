import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from './utils';

interface WizardStepsProps {
  steps: string[];
  /** Index de l'étape en cours, à partir de 0. */
  current: number;
  ariaLabel: string;
}

/** Étapes d'un assistant (modale ou écran complet) : numéro, coche une fois franchie, libellé de l'étape en cours en gras. */
export function WizardSteps({ steps, current, ariaLabel }: WizardStepsProps) {
  return (
    <ol className="flex items-center gap-2" aria-label={ariaLabel}>
      {steps.map((label, index) => (
        <li key={label} className="flex flex-1 items-center gap-2">
          <span
            aria-current={index === current ? 'step' : undefined}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              index <= current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              index === current && 'ring-2 ring-offset-2',
            )}
          >
            {index < current ? <Check className="h-3.5 w-3.5" /> : index + 1}
          </span>
          <span className={cn('text-sm', index === current ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
            {label}
          </span>
          {index < steps.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

/** Assistant en écran complet : bandeau des étapes sous l'en-tête de page. */
export function WizardStepsBar(props: WizardStepsProps) {
  return (
    <div className="border-b border-border bg-card px-8 py-4">
      <WizardSteps {...props} />
    </div>
  );
}

/** Assistant en écran complet : pied collé en bas de l'écran, Annuler ou Retour à gauche, actions à droite. */
export function WizardPageFooter({ start, end }: { start?: ReactNode; end?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-border bg-card px-8 py-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">{start}</div>
        <div className="flex items-center gap-2">{end}</div>
      </div>
    </div>
  );
}
