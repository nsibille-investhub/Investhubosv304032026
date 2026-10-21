import type { LucideIcon } from 'lucide-react';
import { Card } from './card';
import { DisabledReason } from './disabled-reason';
import { StatusBadge } from '../StatusBadge';
import { cn, WIDGET_LABEL_CLASS, WIDGET_TITLE_CLASS } from './utils';
import { toneDot, toneSurface, toneText, type Tone } from './tone';

export type SectionNavIndicator =
  | { kind: 'count'; value: number; total: number; tone: Tone; dot?: boolean }
  | { kind: 'dot'; tone: Tone; label: string }
  | { kind: 'badge'; label: string; tone?: Tone }
  | { kind: 'none' };

export interface SectionNavItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  /** Teinte de la tuile d'icône. Par défaut : neutre. */
  iconTone?: Tone;
  indicator?: SectionNavIndicator;
  /** Libellé de groupe : les éléments consécutifs d'un même groupe sont réunis sous ce sous-titre. */
  group?: string;
  disabled?: boolean;
  disabledReason?: string;
  hidden?: boolean;
}

interface SectionNavProps {
  title: string;
  items: SectionNavItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  sticky?: boolean;
  className?: string;
}

function Indicator({ indicator }: { indicator?: SectionNavIndicator }) {
  if (!indicator || indicator.kind === 'none') return null;

  if (indicator.kind === 'badge') {
    return <StatusBadge label={indicator.label} variant={indicator.tone ?? 'warning'} />;
  }

  if (indicator.kind === 'dot') {
    return (
      <span
        role="img"
        aria-label={indicator.label}
        className="h-2 w-2 rounded-full"
        style={toneDot(indicator.tone)}
      />
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      <span className="text-xs font-semibold tabular-nums" style={toneText(indicator.tone)}>
        {indicator.value}/{indicator.total}
      </span>
      {indicator.dot !== false && (
        <span className="h-2 w-2 rounded-full" style={toneDot(indicator.tone)} />
      )}
    </span>
  );
}

function NavButton({
  item,
  isActive,
  onSelect,
}: {
  item: SectionNavItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const Icon = item.icon;
  const iconTone = item.iconTone ?? 'neutral';

  const button = (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      disabled={item.disabled}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent',
        isActive && 'bg-accent',
        item.disabled && 'pointer-events-none opacity-50',
      )}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: toneSurface(iconTone).backgroundColor }}
      >
        <Icon
          className={cn('w-4 h-4', iconTone === 'neutral' && 'text-muted-foreground')}
          style={iconTone === 'neutral' ? undefined : toneText(iconTone)}
        />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block truncate text-sm',
            isActive ? 'font-semibold text-primary' : 'font-medium text-foreground',
          )}
        >
          {item.title}
        </span>
        {item.subtitle && (
          <span className="block truncate text-xs text-muted-foreground">{item.subtitle}</span>
        )}
      </span>

      <Indicator indicator={item.indicator} />
    </button>
  );

  return item.disabled ? (
    <DisabledReason reason={item.disabledReason} className="w-full">
      {button}
    </DisabledReason>
  ) : (
    button
  );
}

/** Colonne de navigation entre les sections d'une page (onboarding, paramètres d'un fonds...). */
export function SectionNav({
  title,
  items,
  activeId,
  onSelect,
  sticky = true,
  className,
}: SectionNavProps) {
  const visible = items.filter(item => !item.hidden);

  const groups: { label?: string; items: SectionNavItem[] }[] = [];
  visible.forEach(item => {
    const last = groups[groups.length - 1];
    if (last && last.label === item.group) last.items.push(item);
    else groups.push({ label: item.group, items: [item] });
  });

  return (
    <Card className={cn('p-3 shadow-sm', sticky && 'sticky top-4', className)}>
      <h3 className={cn('px-2 pb-2 pt-1', WIDGET_TITLE_CLASS)}>{title}</h3>

      <nav className="flex flex-col gap-1">
        {groups.map((group, groupIndex) => (
          <div key={`${group.label ?? 'default'}-${groupIndex}`} className="flex flex-col gap-1">
            {group.label && (
              <span className={cn('px-2 pt-2', WIDGET_LABEL_CLASS)}>{group.label}</span>
            )}
            {group.items.map(item => (
              <NavButton
                key={item.id}
                item={item}
                isActive={activeId === item.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        ))}
      </nav>
    </Card>
  );
}
