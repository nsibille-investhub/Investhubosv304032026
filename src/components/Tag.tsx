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

export function Tag({ icon: Icon, label, className }: TagProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors bg-muted text-muted-foreground border-border',
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}
