import { cn } from "./ui/utils";

type StatusVariant = "success" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

const statusBadgeStyles: Record<StatusVariant, string> = {
  success: "bg-[var(--success-soft)] text-[var(--success)] border-current/20",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)] border-current/20",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-current/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        statusBadgeStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
