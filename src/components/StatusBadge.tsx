import type { LucideIcon } from "lucide-react";
import { cn } from "./ui/utils";
import { toneSurface, type Tone } from "./ui/tone";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info"
  | "outline"
  | "strong";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  icon?: LucideIcon;
  className?: string;
}

const NEUTRAL_CLASS_NAME = "bg-muted text-muted-foreground border-border";

export function StatusBadge({
  label,
  variant = "neutral",
  icon: Icon,
  className,
}: StatusBadgeProps) {
  return (
    <span
      style={variant === "neutral" ? undefined : toneSurface(variant as Tone)}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs leading-none font-medium",
        variant === "neutral" && NEUTRAL_CLASS_NAME,
        className,
      )}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden />}
      {label}
    </span>
  );
}
