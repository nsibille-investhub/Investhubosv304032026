import { Check } from 'lucide-react';
import { cn } from '../../../components/ui/utils';

export interface WizardStepperStep {
  id: number;
  label: string;
}

export interface WizardStepperProps {
  steps: WizardStepperStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

type StepState = 'past' | 'current' | 'future';

function stateOf(step: WizardStepperStep, current: number): StepState {
  if (step.id < current) return 'past';
  if (step.id === current) return 'current';
  return 'future';
}

export function WizardStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: WizardStepperProps) {
  return (
    <ol
      className={cn('flex w-full items-center gap-2', className)}
      aria-label="Étapes"
    >
      {steps.map((step, idx) => {
        const state = stateOf(step, currentStep);
        const isClickable = state === 'past' && !!onStepClick;
        const isLast = idx === steps.length - 1;

        const circleClass = cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
          state === 'current' &&
            'border-primary bg-primary text-primary-foreground',
          state === 'past' &&
            'border-primary bg-primary/10 text-primary',
          state === 'future' && 'border-border bg-muted text-muted-foreground',
        );

        const labelClass = cn(
          'text-sm whitespace-nowrap transition-colors',
          state === 'current' && 'text-foreground font-medium',
          state === 'past' && 'text-foreground',
          state === 'future' && 'text-muted-foreground',
        );

        const connectorClass = cn(
          'h-px flex-1',
          step.id < currentStep ? 'bg-primary/40' : 'bg-border',
        );

        return (
          <li
            key={step.id}
            className="flex min-w-0 flex-1 items-center gap-2"
            aria-current={state === 'current' ? 'step' : undefined}
          >
            <button
              type="button"
              onClick={isClickable ? () => onStepClick?.(step.id) : undefined}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-2 rounded-md px-1 py-0.5 outline-none',
                isClickable &&
                  'cursor-pointer hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50',
                !isClickable && 'cursor-default',
              )}
              aria-label={`Étape ${step.id} : ${step.label}`}
            >
              <span className={circleClass} aria-hidden>
                {state === 'past' ? <Check className="size-3.5" /> : step.id}
              </span>
              <span className={labelClass}>{step.label}</span>
            </button>
            {!isLast && <span className={connectorClass} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

export default WizardStepper;
