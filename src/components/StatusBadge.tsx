import type React from "react";
import { cn } from "./ui/utils";

type StatusVariant = "success" | "warning" | "danger" | "neutral";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

const statusBadgeClassNames: Record<StatusVariant, string> = {
  success: "",
  warning: "",
  danger: "",
  neutral: "bg-muted text-muted-foreground border-border",
};

const statusBadgeInlineStyles: Record<
  Exclude<StatusVariant, "neutral">,
  React.CSSProperties
> = {
  success: {
    backgroundColor: "var(--success-soft)",
    color: "var(--success)",
    borderColor: "color-mix(in oklab, var(--success) 25%, transparent)",
  },
  warning: {
    backgroundColor: "var(--warning-soft)",
    color: "var(--warning)",
    borderColor: "color-mix(in oklab, var(--warning) 25%, transparent)",
  },
  danger: {
    backgroundColor: "var(--danger-soft)",
    color: "var(--danger)",
    borderColor: "color-mix(in oklab, var(--danger) 25%, transparent)",
  },
};

export function StatusBadge({
  label,
  variant = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      style={variant === "neutral" ? undefined : statusBadgeInlineStyles[variant]}
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs leading-none font-medium",
        statusBadgeClassNames[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}
