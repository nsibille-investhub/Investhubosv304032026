import { motion } from 'motion/react';
import { PenLine } from 'lucide-react';
import { cn } from './ui/utils';

interface SignatureProgressCellProps {
  completed: number;
  required: number;
}

export function SignatureProgressCell({ completed, required }: SignatureProgressCellProps) {
  const percentage = required > 0 ? (completed / required) * 100 : 0;
  const isComplete = completed === required && required > 0;
  const isPartial = completed > 0 && completed < required;
  const isNone = completed === 0;

  // Déterminer la couleur
  let badgeColor = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  let progressColor = 'bg-gray-300 dark:bg-gray-600';
  let iconColor = 'text-gray-500 dark:text-gray-500';

  if (isComplete) {
    badgeColor = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400';
    progressColor = 'bg-emerald-500 dark:bg-emerald-600';
    iconColor = 'text-emerald-600 dark:text-emerald-400';
  } else if (isPartial) {
    badgeColor = 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400';
    progressColor = 'bg-orange-500 dark:bg-orange-600';
    iconColor = 'text-orange-600 dark:text-orange-400';
  } else if (isNone) {
    badgeColor = 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400';
    progressColor = 'bg-orange-500 dark:bg-orange-600';
    iconColor = 'text-orange-600 dark:text-orange-400';
  }

  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      {/* Icon with badge count */}
      <div className="relative">
        <PenLine className={cn("w-4 h-4", iconColor)} />
        {completed > 0 && (
          <div className={cn(
            "absolute -top-1 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold",
            isComplete ? "bg-emerald-600 text-white" : "bg-orange-600 text-white"
          )}>
            {completed}
          </div>
        )}
      </div>

      {/* Count badge */}
      <div className={cn(
        "px-2 py-0.5 rounded text-xs font-semibold min-w-[32px] text-center",
        badgeColor
      )}>
        {completed}/{required}
      </div>

      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn("h-full transition-all", progressColor)}
        />
      </div>
    </div>
  );
}