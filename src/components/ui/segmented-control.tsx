'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group@1.1.2';

import { cn } from './utils';

export type SegmentedControlOption<V extends string = string> = {
  value: V;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type SegmentedControlProps<V extends string = string> = {
  options: SegmentedControlOption<V>[];
  value: V;
  onValueChange: (value: V) => void;
  size?: 'sm' | 'md' | 'lg';
  /** Fill the parent width and distribute segments evenly. */
  fullWidth?: boolean;
  className?: string;
  'aria-label'?: string;
};

const SIZE_CLASS: Record<NonNullable<SegmentedControlProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
};

function SegmentedControl<V extends string = string>({
  options,
  value,
  onValueChange,
  size = 'md',
  fullWidth = false,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<V>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="segmented-control"
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as V);
      }}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex flex-wrap items-center gap-2',
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => (
        <ToggleGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border-2 border-gray-200 bg-white font-medium text-gray-500 transition-all',
            'hover:border-gray-300 hover:text-gray-700',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#000E2B]/30',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200',
            'data-[state=on]:border-[#000E2B] data-[state=on]:text-[#000E2B] data-[state=on]:shadow-sm',
            'dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400',
            'dark:hover:border-gray-700 dark:hover:text-gray-200',
            'dark:data-[state=on]:border-white dark:data-[state=on]:text-white',
            SIZE_CLASS[size],
            fullWidth && 'flex-1 justify-center',
          )}
        >
          {option.icon ? (
            <span
              className="inline-flex shrink-0 items-center text-gray-400 data-[state=on]:text-current dark:text-gray-500"
              aria-hidden
            >
              {option.icon}
            </span>
          ) : null}
          <span className="truncate">{option.label}</span>
        </ToggleGroupPrimitive.Item>
      ))}
    </ToggleGroupPrimitive.Root>
  );
}

export { SegmentedControl };
