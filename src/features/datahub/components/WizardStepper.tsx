import { Check } from 'lucide-react';
import { motion } from 'motion/react';
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
  const total = steps.length;
  const progress = total > 1 ? (currentStep - 1) / (total - 1) : 0;

  return (
    <div
      className={cn('relative w-full', className)}
      role="group"
      aria-label="Étapes"
    >
      {/* Progress rail (background + animated fill) */}
      <div className="pointer-events-none absolute left-0 right-0 top-4 -translate-y-1/2">
        <div className="mx-4 h-0.5 rounded-full bg-gray-200 dark:bg-gray-800" />
        <motion.div
          aria-hidden
          className="absolute left-4 right-4 top-1/2 h-0.5 origin-left -translate-y-1/2 rounded-full"
          style={{ background: 'linear-gradient(90deg, #000000 0%, #0F323D 100%)' }}
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <ol className="relative flex w-full items-start justify-between">
        {steps.map((step) => {
          const state = stateOf(step, currentStep);
          const isClickable = state === 'past' && !!onStepClick;

          return (
            <li
              key={step.id}
              className="flex min-w-0 flex-col items-center gap-2"
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <motion.button
                type="button"
                onClick={isClickable ? () => onStepClick?.(step.id) : undefined}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.05 } : undefined}
                whileTap={isClickable ? { scale: 0.95 } : undefined}
                aria-label={`Étape ${step.id} : ${step.label}`}
                className={cn(
                  'relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold outline-none transition-colors',
                  state === 'current' &&
                    'border-transparent text-white shadow-lg shadow-black/20 ring-4 ring-black/5 dark:ring-white/10',
                  state === 'past' &&
                    'border-transparent text-white',
                  state === 'future' &&
                    'border-gray-200 bg-white text-gray-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-500',
                  isClickable && 'cursor-pointer hover:shadow-md focus-visible:ring-4 focus-visible:ring-black/20',
                  !isClickable && 'cursor-default',
                )}
                style={
                  state === 'current' || state === 'past'
                    ? {
                        background:
                          'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                      }
                    : undefined
                }
              >
                {state === 'past' ? (
                  <motion.span
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Check className="size-4" strokeWidth={3} />
                  </motion.span>
                ) : (
                  <span>{step.id}</span>
                )}
              </motion.button>

              <button
                type="button"
                onClick={isClickable ? () => onStepClick?.(step.id) : undefined}
                disabled={!isClickable}
                className={cn(
                  'max-w-[140px] truncate text-center text-xs font-medium transition-colors',
                  state === 'current' && 'text-foreground',
                  state === 'past' && 'text-foreground',
                  state === 'future' && 'text-muted-foreground',
                  isClickable && 'cursor-pointer hover:text-foreground',
                  !isClickable && 'cursor-default',
                )}
              >
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default WizardStepper;
