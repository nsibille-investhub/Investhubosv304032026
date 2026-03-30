import type React from "react";
import { cn } from "./ui/utils";

interface ClickableTextProps {
  children: React.ReactNode;
  className?: string;
}

export function ClickableText({ children, className }: ClickableTextProps) {
  return (
    <span className={cn("text-primary hover:underline", className)}>{children}</span>
  );
}
