import { cn } from './ui/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

const styles: Record<StatusVariant, string> = {
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-[color:color-mix(in_srgb,var(--success)_30%,transparent)]',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[color:color-mix(in_srgb,var(--warning)_30%,transparent)]',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)]',
  neutral: 'bg-[var(--neutral-soft)] text-[var(--semantic-neutral-700)] border-border',
};

export function StatusBadge({ label, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        styles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
