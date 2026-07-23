import * as React from "react";
import { format } from "date-fns@4.1.0";
import { fr } from "date-fns@4.1.0/locale";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import type { DateRange } from "react-day-picker@8.10.1";
import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DateRangePreset {
  label: string;
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onRangeChange: (from: Date | undefined, to: Date | undefined) => void;
  placeholder?: string;
  clearLabel?: string;
  className?: string;
  disabled?: boolean;
  presets?: DateRangePreset[];
}

export function DateRangePicker({
  from,
  to,
  onRangeChange,
  placeholder,
  clearLabel = "Effacer",
  className,
  disabled = false,
  presets = [],
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected: DateRange | undefined =
    from || to ? { from, to } : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    onRangeChange(range?.from, range?.to);
  };

  const handlePreset = (preset: DateRangePreset) => {
    onRangeChange(preset.from, preset.to);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onRangeChange(undefined, undefined);
  };

  const hasValue = !!from || !!to;

  const displayLabel = React.useMemo(() => {
    if (!from && !to) return null;
    if (from && to) {
      return `${format(from, "dd/MM/yyyy", { locale: fr })} – ${format(to, "dd/MM/yyyy", { locale: fr })}`;
    }
    if (from) return `${format(from, "dd/MM/yyyy", { locale: fr })} – …`;
    return `… – ${format(to!, "dd/MM/yyyy", { locale: fr })}`;
  }, [from, to]);

  const activePresetIndex = React.useMemo(() => {
    if (!from || !to) return -1;
    return presets.findIndex(
      (p) =>
        p.from.getTime() === from.getTime() &&
        p.to.getTime() === to.getTime(),
    );
  }, [from, to, presets]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left h-9 px-3 bg-white dark:bg-gray-950",
            "hover:bg-gray-50 hover:border-gray-300 dark:hover:bg-gray-900",
            "focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
            "transition-all duration-200",
            !hasValue && "text-gray-500",
            open && "ring-2 ring-gray-900 ring-offset-2 border-gray-900",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 shrink-0" />
          <span className="flex-1 truncate text-sm">
            {displayLabel || placeholder}
          </span>
          {hasValue ? (
            <X
              className="ml-2 h-4 w-4 text-gray-400 hover:text-gray-600 shrink-0"
              onClick={handleClear}
            />
          ) : (
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0",
                open && "rotate-180",
              )}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 shadow-xl border-gray-200"
        align="start"
        sideOffset={8}
      >
        <div className="bg-white dark:bg-gray-950 rounded-lg overflow-hidden flex">
          {presets.length > 0 && (
            <div className="border-r border-gray-100 dark:border-gray-800 py-2 px-1.5 min-w-[150px] flex flex-col gap-0.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  className={cn(
                    "text-left px-3 py-1.5 text-sm rounded-md transition-colors",
                    activePresetIndex === idx
                      ? "bg-gray-900 text-white font-medium dark:bg-gray-100 dark:text-gray-900"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                  )}
                  onClick={() => handlePreset(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          <div>
            <div className="p-3">
              <Calendar
                mode="range"
                selected={selected}
                onSelect={handleSelect}
                numberOfMonths={2}
                locale={fr}
                className="rounded-md"
                classNames={{
                  day_selected: cn(
                    "bg-gradient-to-br from-gray-900 to-gray-800",
                    "text-white hover:bg-gradient-to-br hover:from-gray-900 hover:to-gray-800",
                    "focus:bg-gradient-to-br focus:from-gray-900 focus:to-gray-800",
                  ),
                  day_today: "bg-blue-50 text-blue-900 font-semibold",
                  day_range_middle: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
                }}
              />
            </div>

            {hasValue && (
              <div className="px-3 pb-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-gray-600 hover:text-gray-900"
                  onClick={() => handleClear()}
                >
                  {clearLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
