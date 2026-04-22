import { Switch } from '../../../components/ui/switch';
import { cn } from '../../../components/ui/utils';

export interface ViewAsToggleProps {
  /** When true, the right-side label (drafts) is active. */
  value: boolean;
  onChange: (next: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
}

export function ViewAsToggle({
  value,
  onChange,
  leftLabel = 'État actuel publié',
  rightLabel = 'Avec brouillons validés',
  className,
}: ViewAsToggleProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-4 rounded-lg border border-border bg-card px-5 py-3',
        className,
      )}
      role="group"
      aria-label="Basculer entre état actuel et brouillons"
    >
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          'text-sm transition-colors duration-150',
          !value
            ? 'font-semibold text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {leftLabel}
      </button>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        aria-label={`${leftLabel} / ${rightLabel}`}
        className="scale-125"
      />
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          'text-sm transition-colors duration-150',
          value
            ? 'font-semibold text-foreground'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {rightLabel}
      </button>
    </div>
  );
}

export default ViewAsToggle;
