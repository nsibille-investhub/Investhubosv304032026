import { MessageSquare, MessageSquareDashed } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from './ui/utils';

export interface CommentIndicatorProps {
  /** Comment body — when empty/undefined, the indicator renders the "no comment" state. */
  comment?: string | null;
  /** Optional author shown above the comment in the tooltip. */
  author?: string;
  /** Optional ISO date displayed alongside the author. */
  date?: string;
  /** Tooltip side — defaults to "top". */
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

/**
 * Compact indicator for a textual comment.
 * - Filled bubble icon when a comment exists; hover reveals the comment.
 * - Dashed bubble when no comment is attached.
 */
export function CommentIndicator({
  comment,
  author,
  date,
  side = 'top',
  className,
}: CommentIndicatorProps) {
  const hasComment = !!comment && comment.trim().length > 0;

  if (!hasComment) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-slot="comment-indicator"
            data-state="empty"
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-300 dark:text-gray-600 cursor-default',
              className,
            )}
            aria-label="Aucun commentaire"
          >
            <MessageSquareDashed className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side}>
          <span className="text-xs">Aucun commentaire</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          data-slot="comment-indicator"
          data-state="filled"
          className={cn(
            'inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900 cursor-help',
            className,
          )}
          aria-label="Voir le commentaire"
        >
          <MessageSquare className="h-4 w-4" />
        </span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm">
        {(author || date) && (
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide opacity-80">
            {author && <span>{author}</span>}
            {date && <span className="opacity-70">· {date}</span>}
          </div>
        )}
        <p className="text-xs leading-snug whitespace-pre-line">{comment}</p>
      </TooltipContent>
    </Tooltip>
  );
}
