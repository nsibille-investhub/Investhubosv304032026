import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from './card';
import { cn, WIDGET_LABEL_CLASS, WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './utils';
import { toneText, type Tone } from './tone';

interface WidgetCardProps {
  title: string;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  /** Action à droite de l'en-tête : lien, pastille... */
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Carte de synthèse d'un tableau de bord : titre en petites capitales, contenu libre. */
export function WidgetCard({ title, subtitle, icon: Icon, action, footer, children, className }: WidgetCardProps) {
  return (
    <Card className={cn('gap-0 p-4 shadow-sm', className)}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />}
          <div className="min-w-0">
            <h3 className={WIDGET_TITLE_CLASS}>{title}</h3>
            {subtitle && <p className={WIDGET_SUBTITLE_CLASS}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="flex-1">{children}</div>
      {footer && <div className="mt-3 border-t border-border pt-3">{footer}</div>}
    </Card>
  );
}

interface WidgetMetricProps {
  label: string;
  value: ReactNode;
  secondary?: ReactNode;
  tone?: Tone;
  size?: 'md' | 'lg';
  className?: string;
}

/** Valeur chiffrée d'un widget : libellé, valeur, précision. */
export function WidgetMetric({ label, value, secondary, tone, size = 'md', className }: WidgetMetricProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className={WIDGET_LABEL_CLASS}>{label}</p>
      <p
        className={cn(
          'font-semibold tabular-nums text-foreground',
          size === 'lg' ? 'text-2xl' : 'text-base',
        )}
        style={tone ? toneText(tone) : undefined}
      >
        {value}
      </p>
      {secondary && <p className="text-xs text-muted-foreground tabular-nums">{secondary}</p>}
    </div>
  );
}
