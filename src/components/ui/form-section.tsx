/**
 * FormSection — Design System component
 * Key: ds-form-section
 *
 * Groups related form fields under a clearly identified heading. Use this
 * inside dialogs / settings panels to keep visual hierarchy consistent across
 * the app (FolderSpaceDialog, NewSubscriptionDialog, etc.).
 *
 * Anatomy:
 *   ┌─ optional icon ─ title ── optional required (*) / optional badge ┐
 *   │  optional description                                              │
 *   ├────────────────────────────────────────────────────────────────────┤
 *   │  children (form fields)                                            │
 *   └────────────────────────────────────────────────────────────────────┘
 */

import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from './utils';

export interface FormSectionProps {
  /** Section heading. */
  title: ReactNode;
  /** Helper text shown under the title. */
  description?: ReactNode;
  /** Leading icon rendered next to the title. */
  icon?: LucideIcon;
  /** Marks the whole section as required (renders an inline asterisk). */
  required?: boolean;
  /** Renders an "optional" tag next to the title. */
  optionalLabel?: string;
  /** Slot rendered on the right of the title row (e.g. counter, action). */
  trailing?: ReactNode;
  /** Spacing between the children. Defaults to `md` (12px). */
  contentSpacing?: 'sm' | 'md' | 'lg';
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

const CONTENT_SPACING: Record<NonNullable<FormSectionProps['contentSpacing']>, string> = {
  sm: 'space-y-2',
  md: 'space-y-3',
  lg: 'space-y-4',
};

export function FormSection({
  title,
  description,
  icon: Icon,
  required,
  optionalLabel,
  trailing,
  contentSpacing = 'md',
  className,
  contentClassName,
  children,
}: FormSectionProps) {
  return (
    <section
      data-slot="form-section"
      className={cn('space-y-3', className)}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 leading-tight">
            {Icon ? <Icon className="size-4 text-muted-foreground shrink-0" /> : null}
            <span className="truncate">{title}</span>
            {required ? <span className="text-destructive">*</span> : null}
            {optionalLabel ? (
              <span className="text-xs font-normal text-muted-foreground/80 normal-case">
                {optionalLabel}
              </span>
            ) : null}
          </h3>
          {description ? (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </header>
      <div className={cn(CONTENT_SPACING[contentSpacing], contentClassName)}>{children}</div>
    </section>
  );
}
