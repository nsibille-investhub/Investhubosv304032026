import * as React from "react";
import { cn } from "./utils";

interface LinkTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "span" | "a";
}

export function LinkText({ as = "span", className, ...props }: LinkTextProps) {
  const Comp = as;
  return <Comp className={cn("text-primary font-medium hover:underline cursor-pointer", className)} {...props} />;
}
