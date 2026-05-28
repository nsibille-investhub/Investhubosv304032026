import type React from "react";
import { cn } from "./ui/utils";

export type ClickableTextVariant = "default" | "notClickable";

interface ClickableTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: ClickableTextVariant;
}

export function ClickableText({ children, className, variant = "default" }: ClickableTextProps) {
  if (variant === "notClickable") {
    return (
      <span className={cn("text-foreground", className)}>{children}</span>
    );
  }
  return (
    <span className={cn("text-primary hover:underline", className)}>{children}</span>
  );
}
