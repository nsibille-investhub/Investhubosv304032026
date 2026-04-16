import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';

interface TagProps {
  icon?: LucideIcon;
  label: string;
  /**
   * @deprecated Tags are intentionally neutral-only in the design system.
   * This prop is ignored and kept only for backward compatibility.
   */
  variant?: 'blue' | 'purple' | 'emerald' | 'gray' | 'orange' | 'amber' | 'red' | 'cyan' | 'indigo';
  className?: string;
}

const TAG_MAX_LENGTH = 30;

function truncateTagLabel(label: string): string {
  if (label.length <= TAG_MAX_LENGTH) return label;
  return `${label.slice(0, TAG_MAX_LENGTH - 3)}...`;
}

export function Tag({ icon: Icon, label, className }: TagProps) {
  const truncatedLabel = truncateTagLabel(label);

  return (
    <span
      title={label}
      className={cn(
        'inline-flex max-w-full min-w-0 shrink items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
        className
      )}
      style={{ color: '#C6C0B7', borderColor: '#C6C0B7', backgroundColor: '#D9D8CB' }}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span className="block max-w-[30ch] min-w-0 truncate">{truncatedLabel}</span>
    </span>
  );
}
