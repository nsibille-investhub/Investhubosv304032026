import { Check } from 'lucide-react';
import { cn } from './utils';

interface WizardStepsProps {
  steps: string[];
  /** Index de l'étape en cours, à partir de 0. */
  current: number;
  ariaLabel: string;
}

/** Étapes d'un assistant en modale : numéro, coche une fois franchie, libellé de l'étape en cours en gras. */
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
