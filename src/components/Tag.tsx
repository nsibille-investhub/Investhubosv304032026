import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';

interface TagProps {
  icon?: LucideIcon;
  label: string;
  className?: string;
}

export function Tag({ icon: Icon, label, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}
