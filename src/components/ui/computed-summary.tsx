import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { cn, WIDGET_TITLE_CLASS } from './utils';
import { toneSurface } from './tone';

interface ComputedSummaryProps {
  /** Phrase calculée par le serveur à partir des règles affichées dessous. */
  children: ReactNode;
  label?: string;
  footnote?: string;
  icon?: LucideIcon;
  className?: string;
}

/** Bloc de texte mis en avant qui résume en une phrase l'effet d'un paramétrage. */
export function ComputedSummary({
  children,
  label,
  footnote,
  icon: Icon = Sparkles,
  className,
}: ComputedSummaryProps) {
  return (
    <div
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', className)}
      style={toneSurface('info')}
      aria-live="polite"
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 text-foreground">
        {label && <p className={cn('mb-1', WIDGET_TITLE_CLASS)}>{label}</p>}
        <p className="text-sm leading-relaxed">{children}</p>
        {footnote && <p className="mt-1 text-xs text-muted-foreground">{footnote}</p>}
      </div>
    </div>
  );
}
