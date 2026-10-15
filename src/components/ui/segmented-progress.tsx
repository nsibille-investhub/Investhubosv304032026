import { cn } from './utils';
import { toneDot, type Tone } from './tone';

export interface ProgressSegment {
  id: string;
  value: number;
  tone: Tone;
  label?: string;
}

interface SegmentedProgressProps {
  segments: ProgressSegment[];
  /** Total de référence. Par défaut : somme des segments. Le reste apparaît en fond neutre. */
  total?: number;
  className?: string;
  ariaLabel?: string;
}

const percent = (value: number, total: number) => (total > 0 ? (value / total) * 100 : 0);

/** Barre de progression segmentée par état, issue de la complétion d'onboarding. */
export function SegmentedProgress({ segments, total, className, ariaLabel }: SegmentedProgressProps) {
  const sum = segments.reduce((acc, segment) => acc + segment.value, 0);
  const reference = total ?? sum;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('flex h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      {segments.map(segment =>
        segment.value > 0 ? (
          <div
            key={segment.id}
            title={segment.label}
            className="h-full"
            style={{ ...toneDot(segment.tone), width: `${percent(segment.value, reference)}%` }}
          />
        ) : null,
      )}
    </div>
  );
}
