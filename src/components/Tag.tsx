import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';

interface TagProps {
  icon?: LucideIcon;
  label: string;
  variant?: 'blue' | 'purple' | 'emerald' | 'gray' | 'orange' | 'amber' | 'red' | 'cyan' | 'indigo';
  className?: string;
}

const variantStyles = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gray: 'bg-gray-50 text-gray-600 border-gray-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

export function Tag({ icon: Icon, label, variant = 'gray', className }: TagProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}
