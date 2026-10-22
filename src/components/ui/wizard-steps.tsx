import { Check } from 'lucide-react';
import { cn } from './utils';

/** Jalon secondaire affiché sous un jalon principal (variante d'une séquence). */
export interface WizardStepBranch {
  label: string;
  note?: string;
  active?: boolean;
}

interface WizardStepsProps {
  steps: string[];
  /** Index de l'étape en cours, à partir de 0 ; -1 si aucune étape de la séquence n'est en cours. */
  current: number;
  ariaLabel: string;
  /** Rend chaque jalon cliquable. */
  onSelect?: (index: number) => void;
  /** Jalons secondaires, par index du jalon principal. */
  branches?: Record<number, WizardStepBranch & { onSelect?: () => void }>;
  /** "below" place le libellé sous la pastille : frise étroite (panneau latéral). */
  labelPosition?: 'side' | 'below';
}

/**
 * Étapes d'un assistant en modale, ou frise de jalons : numéro, coche une fois franchie,
 * étape en cours mise en avant, étapes à venir grisées.
 */
export function WizardSteps({ steps, current, ariaLabel, onSelect, branches, labelPosition = 'side' }: WizardStepsProps) {
  const below = labelPosition === 'below';
  const notes = Object.values(branches ?? {}).filter(branch => branch.note);
  const list = (
    <ol className={cn('flex gap-2', below ? 'items-start' : 'items-center')} aria-label={ariaLabel}>
      {steps.map((label, index) => {
        const done = index < current;
        const isCurrent = index === current;
        const branch = branches?.[index];
        const dot = (
          <span
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
              index <= current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              isCurrent && 'ring-2 ring-offset-2',
            )}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
          </span>
        );
        const text = (
          <span
            className={cn(
              below ? 'text-xs text-center leading-tight break-words' : 'text-sm',
              isCurrent ? 'font-semibold text-foreground' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
        );
        const body = (
          <span className={cn('flex gap-2', below ? 'flex-col items-center' : 'items-center')}>
            {dot}
            {text}
          </span>
        );
        return (
          <li key={`${label}-${index}`} className={cn('flex flex-1 gap-2', below ? 'min-w-0 flex-col items-center' : 'items-center')}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(index)}
                className="rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {body}
              </button>
            ) : (
              body
            )}
            {branch && (
              <button
                type="button"
                disabled={!branch.onSelect}
                onClick={branch.onSelect}
                className={cn(
                  'rounded-md border border-dashed px-2 py-1 text-xs text-center',
                  branch.active ? 'border-primary font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                <span>{branch.label}</span>
              </button>
            )}
            {!below && index < steps.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
  if (!notes.length) return list;
  return (
    <div className="space-y-2">
      {list}
      {notes.map(branch => (
        <p key={branch.label} className="text-xs text-muted-foreground">
          <span className="font-medium">{branch.label}</span> {branch.note}
        </p>
      ))}
    </div>
  );
}
