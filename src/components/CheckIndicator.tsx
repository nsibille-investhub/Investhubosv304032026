import { CheckCircle2, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn } from './ui/utils';

interface CheckIndicatorProps {
  checked: boolean;
  checkedLabel?: string;
  uncheckedLabel?: string;
  className?: string;
}

export function CheckIndicator({
  checked,
  checkedLabel = 'Activé',
  uncheckedLabel = 'Désactivé',
  className,
}: CheckIndicatorProps) {
  const Icon = checked ? CheckCircle2 : XCircle;
  const iconClassName = checked
    ? 'w-5 h-5 text-green-600 dark:text-green-400'
    : 'w-5 h-5 text-gray-400 dark:text-gray-600';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex items-center justify-center', className)}>
          <Icon className={iconClassName} />
        </span>
      </TooltipTrigger>
      <TooltipContent>{checked ? checkedLabel : uncheckedLabel}</TooltipContent>
    </Tooltip>
  );
}
