import type { LucideIcon } from "lucide-react";
import { cn } from "./ui/utils";
import { toneSurface, type Tone } from "./ui/tone";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info"
  | "outline"
  | "strong"
  | "caution";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  icon?: LucideIcon;
  /** Précision au survol : motif d'un échec, origine d'un paiement... */
  tooltip?: string | null;
  className?: string;
}

const NEUTRAL_CLASS_NAME = "bg-muted text-muted-foreground border-border";

export function StatusBadge({
  label,
  variant = "neutral",
  icon: Icon,
  tooltip,
  className,
}: StatusBadgeProps) {
  const badge = (
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
  if (!tooltip) return badge;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="inline-flex">
          {badge}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-xs">{tooltip}</span>
      </TooltipContent>
    </Tooltip>
  );
}
