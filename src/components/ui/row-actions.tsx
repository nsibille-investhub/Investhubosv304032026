import * as React from 'react';
import { Check, Eye, RotateCcw, X, type LucideIcon } from 'lucide-react';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from './utils';

type Intent = 'neutral' | 'success' | 'danger' | 'warning';

const INTENT_CLASS: Record<Intent, string> = {
  neutral: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800',
  success: 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950',
  danger: 'text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950',
  warning: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950',
};

interface RowActionButtonProps {
  icon: LucideIcon;
  tooltip: string;
  onClick: (e: React.MouseEvent) => void;
  intent?: Intent;
  disabled?: boolean;
  ariaLabel?: string;
}

export function RowActionButton({
  icon: Icon,
  tooltip,
  onClick,
  intent = 'neutral',
  disabled,
  ariaLabel,
}: RowActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={ariaLabel || tooltip}
          className={cn('h-8 w-8 p-0', INTENT_CLASS[intent])}
          onClick={(e) => {
            e.stopPropagation();
            onClick(e);
          }}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

interface RowActionsProps {
  onPreview?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onReset?: () => void;
  previewLabel: string;
  acceptLabel?: string;
  rejectLabel?: string;
  resetLabel?: string;
  showPreview?: boolean;
  showAccept?: boolean;
  showReject?: boolean;
  showReset?: boolean;
  className?: string;
}

export function RowActions({
  onPreview,
  onAccept,
  onReject,
  onReset,
  previewLabel,
  acceptLabel,
  rejectLabel,
  resetLabel,
  showPreview = true,
  showAccept = true,
  showReject = true,
  showReset = false,
  className,
}: RowActionsProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-1', className)}
      onClick={(e) => e.stopPropagation()}
    >
      {showPreview && onPreview && (
        <RowActionButton
          icon={Eye}
          tooltip={previewLabel}
          intent="neutral"
          onClick={onPreview}
        />
      )}
      {showReset && onReset && resetLabel && (
        <RowActionButton
          icon={RotateCcw}
          tooltip={resetLabel}
          intent="warning"
          onClick={onReset}
        />
      )}
      {showAccept && onAccept && acceptLabel && (
        <RowActionButton
          icon={Check}
          tooltip={acceptLabel}
          intent="success"
          onClick={onAccept}
        />
      )}
      {showReject && onReject && rejectLabel && (
        <RowActionButton
          icon={X}
          tooltip={rejectLabel}
          intent="danger"
          onClick={onReject}
        />
      )}
    </div>
  );
}
