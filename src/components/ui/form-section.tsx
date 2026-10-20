import type { ReactNode } from 'react';
import { Check, type LucideIcon } from 'lucide-react';

import { cn } from './utils';

export type FormSectionStatus = 'default' | 'complete' | 'error';

export interface FormSectionProps {
  /** Step number shown in the round marker; omit for an unnumbered section. */
  step?: number;
  /** A complete section swaps its number for a check, an error tints it. */
  status?: FormSectionStatus;
  icon?: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned header slot (button, badge). */
  action?: ReactNode;
  id?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Tinted block grouping one step of a form or a detail sheet. Fields never sit
 * directly on it: they go in white FormSubsection cards so they keep contrast.
 */
export function FormSection({
  step,
  status = 'default',
  icon: Icon,
  title,
  description,
  action,
  id,
  className,
  children,
}: FormSectionProps) {
  return (
    <section id={id} data-slot="form-section" data-status={status} className={cn('ds-form-section', className)}>
      <header className="ds-form-section__header">
        {step !== undefined && (
          <span className="ds-form-section__step" aria-hidden>
            {status === 'complete' ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : step}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="ds-form-section__title">
            {Icon && <Icon />}
            {title}
          </h3>
          {description && <p className="ds-form-section__description">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className="ds-form-section__body">{children}</div>
    </section>
  );
}

export interface FormSubsectionProps {
  icon?: LucideIcon;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** 'muted' nests a tinted card inside a section, for a secondary group. */
  tone?: 'default' | 'muted';
  className?: string;
  children?: ReactNode;
}

/** White card holding a coherent group of fields inside a FormSection. */
export function FormSubsection({
  icon: Icon,
  title,
  description,
  action,
  tone = 'default',
  className,
  children,
}: FormSubsectionProps) {
  const hasHeader = Boolean(title || description || action);
  return (
    <div data-slot="form-subsection" data-tone={tone} className={cn('ds-form-subsection', className)}>
      {hasHeader && (
        <div className="ds-form-subsection__header">
          <div className="min-w-0 flex-1">
            {title && (
              <p className="ds-form-subsection__title">
                {Icon && <Icon />}
                {title}
              </p>
            )}
            {description && <p className="ds-form-subsection__description">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children !== undefined && <div className="ds-form-subsection__body">{children}</div>}
    </div>
  );
}

/** Field label and helper text classes shared by forms built on FormSection. */
export const FORM_FIELD_LABEL_CLASS = 'ds-field-label flex items-center gap-1.5';
export const FORM_FIELD_HINT_CLASS = 'ds-field-hint';
