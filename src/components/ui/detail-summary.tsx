import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Card } from './card';
import { cn } from './utils';

export type DetailLinkProps = {
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  title?: string;
  className?: string;
  children: React.ReactNode;
};

const LINK_CLASS =
  'inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary/70 hover:underline underline-offset-2 transition-colors';

export function DetailLink({ href, onClick, icon: Icon, title, className, children }: DetailLinkProps) {
  const content = (
    <>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={cn(LINK_CLASS, className)}
      >
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(LINK_CLASS, className)}>
        {content}
      </button>
    );
  }

  return <span className={cn('inline-flex items-center gap-1.5', className)}>{content}</span>;
}

export type DetailSummaryAttribute = {
  id: string;
  label: string;
  value?: React.ReactNode;
  secondaryValue?: React.ReactNode;
  icon?: LucideIcon;
  href?: string;
};

export type DetailSummaryMetric = {
  id: string;
  label: string;
  value?: React.ReactNode;
  secondaryValue?: React.ReactNode;
  icon?: LucideIcon;
};

export type DetailSummaryProps = {
  attributes?: DetailSummaryAttribute[];
  metrics?: DetailSummaryMetric[];
  /** Actions shown at the top right of the block, above the contextual slot. */
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  emptyValue?: string;
  newTabTitle?: string;
  className?: string;
};

function isBlank(value: React.ReactNode): boolean {
  return value === null || value === undefined || value === '';
}

function SummaryIcon({ icon: Icon }: { icon?: LucideIcon }) {
  if (!Icon) return null;
  return (
    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
      <Icon className="w-3 h-3 text-muted-foreground" />
    </div>
  );
}

function AttributeItem({
  attribute,
  emptyValue,
  newTabTitle,
}: {
  attribute: DetailSummaryAttribute;
  emptyValue: string;
  newTabTitle?: string;
}) {
  const hasValue = !isBlank(attribute.value);
  const value = hasValue ? attribute.value : emptyValue;

  return (
    <div className="flex items-center gap-2 min-w-0">
      <SummaryIcon icon={attribute.icon} />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground leading-none mb-0.5">{attribute.label}</div>
        {attribute.href && hasValue ? (
          <DetailLink href={attribute.href} title={newTabTitle} className="text-sm leading-tight break-words">
            {value}
          </DetailLink>
        ) : (
          <div className="text-sm text-foreground/80 leading-tight break-words">{value}</div>
        )}
        {!isBlank(attribute.secondaryValue) && (
          <div className="text-xs text-muted-foreground leading-tight break-words">
            {attribute.secondaryValue}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricItem({ metric, emptyValue }: { metric: DetailSummaryMetric; emptyValue: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <SummaryIcon icon={metric.icon} />
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground leading-tight">{metric.label}</div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-bold text-foreground">
            {isBlank(metric.value) ? emptyValue : metric.value}
          </span>
          {!isBlank(metric.secondaryValue) && (
            <span className="text-xs text-muted-foreground font-medium">{metric.secondaryValue}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export function DetailSummary({
  attributes,
  metrics,
  actions,
  aside,
  emptyValue = '-',
  newTabTitle,
  className,
}: DetailSummaryProps) {
  const hasAttributes = !!attributes && attributes.length > 0;
  const hasMetrics = !!metrics && metrics.length > 0;

  if (!hasAttributes && !hasMetrics && !aside && !actions) return null;

  // Les colonnes se répartissent la largeur disponible et repassent à la ligne
  // dès qu'elles descendent sous leur largeur minimale.
  const gridStyle = { gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' };

  return (
    <Card
      data-slot="detail-summary"
      className={cn('p-5 shadow-sm', className)}
    >
      <div className="flex items-start justify-between gap-8">
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {hasAttributes && (
            <div className="grid gap-x-6 gap-y-4" style={gridStyle}>
              {attributes.map(attribute => (
                <AttributeItem
                  key={attribute.id}
                  attribute={attribute}
                  emptyValue={emptyValue}
                  newTabTitle={newTabTitle}
                />
              ))}
            </div>
          )}

          {hasMetrics && (
            <div className="grid gap-x-6 gap-y-4" style={gridStyle}>
              {metrics.map(metric => (
                <MetricItem key={metric.id} metric={metric} emptyValue={emptyValue} />
              ))}
            </div>
          )}
        </div>

        {(actions || aside) && (
          <div className="flex-shrink-0 flex flex-col items-end gap-3">
            {actions && <div className="flex items-center gap-2">{actions}</div>}
            {aside}
          </div>
        )}
      </div>
    </Card>
  );
}
