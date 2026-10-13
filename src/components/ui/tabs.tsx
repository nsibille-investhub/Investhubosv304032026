"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs@1.1.3";

import { cn } from "./utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-xl p-[3px] flex",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-card dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

interface PageTabsTriggerProps {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Compteur affiché après le libellé. */
  count?: number;
  isActive?: boolean;
}

/** Barre d'onglets principale d'une page de détail : soulignement primaire, compteurs. */
function PageTabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="page-tabs-list"
      className={cn("flex w-full flex-wrap items-end gap-0", className)}
      {...props}
    />
  );
}

function PageTabsTrigger({
  value,
  label,
  icon: Icon,
  count,
  isActive,
}: PageTabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      data-slot="page-tabs-trigger"
      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-3 pb-3 pt-4 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      style={isActive ? { boxShadow: "inset 0 -2px 0 0 var(--color-primary)", color: "var(--color-primary)" } : undefined}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{label}</span>
      {count !== undefined && (
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-muted-foreground">
          {count}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
}

export { PageTabsList, PageTabsTrigger };
