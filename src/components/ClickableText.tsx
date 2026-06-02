import type React from "react";
import { cn } from "./ui/utils";

interface ClickableTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'notClickable';
}

export function ClickableText({ children, className, variant = 'default' }: ClickableTextProps) {
  return (
    <span className={cn(
      variant === 'default'
        ? "text-primary hover:underline"
        : "text-foreground",
      className
    )}>{children}</span>
  );
}
