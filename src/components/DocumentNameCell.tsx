import * as React from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';
import { cn } from './ui/utils';

export interface DocumentNameCellProps {
  /** Primary document name (top line). */
  name: string;
  /** Path segments — Espace / Dossier / Sous-dossier… */
  pathSegments: string[];
  /** Maximum displayed path length — defaults to 48 chars. Overflow uses centered ellipsis. */
  maxPathLength?: number;
  /** Optional 3rd line rendered below the path (e.g. notification info). Inherits the same horizontal alignment as title and path. */
  extra?: React.ReactNode;
  className?: string;
}

const FORMAT_ICON_BG = '#f1f5f9';

function buildFullPath(segments: string[]) {
  return segments.join(' / ');
}

/**
 * Build a path string with a centered ellipsis when too long.
 * - 0..2 segments → no truncation
 * - 3+ segments  → first / … / last (or first / second / … / last when room)
 * - fallback     → mid-string ellipsis
 */
function truncatePath(segments: string[], maxLength: number): string {
  const fullPath = buildFullPath(segments);
  if (fullPath.length <= maxLength) return fullPath;

  if (segments.length >= 3) {
    const head = segments[0];
    const tail = segments[segments.length - 1];

    if (segments.length > 3) {
      const candidate = `${head} / ${segments[1]} / … / ${tail}`;
      if (candidate.length <= maxLength) return candidate;
    }

    const compact = `${head} / … / ${tail}`;
    if (compact.length <= maxLength) return compact;
  }

  const half = Math.max(4, Math.floor((maxLength - 1) / 2));
  return `${fullPath.slice(0, half)}…${fullPath.slice(-half)}`;
}

/**
 * Compact document column — name on top, path below.
 * Path uses centered ellipsis when too long; full breadcrumb shown on hover.
 */
export function DocumentNameCell({
  name,
  pathSegments,
  maxPathLength = 48,
  extra,
  className,
}: DocumentNameCellProps) {
  const displayPath = truncatePath(pathSegments, maxPathLength);

  return (
    <div
      data-slot="document-name-cell"
      className={cn('flex items-start gap-2.5 min-w-0', className)}
    >
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 dark:bg-gray-800 dark:text-gray-300"
        style={{ backgroundColor: FORMAT_ICON_BG }}
        aria-hidden
      >
        <FileText className="h-4 w-4" />
      </div>

      <div className="flex min-w-0 flex-col">
        <span
          className="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
          title={name}
        >
          {name}
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="mt-0.5 inline-flex max-w-full cursor-default items-center gap-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
              {displayPath}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-md">
            <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs">
              {pathSegments.map((segment, idx) => (
                <span key={idx} className="inline-flex items-center gap-1">
                  <span>{segment}</span>
                  {idx < pathSegments.length - 1 && (
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  )}
                </span>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>

        {extra && <div className="mt-1">{extra}</div>}
      </div>
    </div>
  );
}
