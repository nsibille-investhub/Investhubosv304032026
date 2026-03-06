import * as React from "react";
import { format } from "date-fns@4.1.0";
import { fr } from "date-fns@4.1.0/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner une date",
  className,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left h-9 px-3 bg-white",
            "hover:bg-gray-50 hover:border-gray-300",
            "focus:ring-2 focus:ring-gray-900 focus:ring-offset-2",
            "transition-all duration-200",
            !date && "text-gray-500",
            open && "ring-2 ring-gray-900 ring-offset-2 border-gray-900",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
          <span className="flex-1">
            {date ? format(date, "dd/MM/yyyy", { locale: fr }) : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 text-gray-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 shadow-xl border-gray-200" 
        align="start"
        sideOffset={8}
      >
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Sélectionner une date</h4>
                <p className="text-xs text-gray-500">
                  {date ? format(date, "EEEE d MMMM yyyy", { locale: fr }) : "Aucune date sélectionnée"}
                </p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={(day) => {
                if (minDate && day < minDate) return true;
                if (maxDate && day > maxDate) return true;
                return false;
              }}
              locale={fr}
              className="rounded-md"
              classNames={{
                day_selected: cn(
                  "bg-gradient-to-br from-gray-900 to-gray-800",
                  "text-white hover:bg-gradient-to-br hover:from-gray-900 hover:to-gray-800",
                  "focus:bg-gradient-to-br focus:from-gray-900 focus:to-gray-800"
                ),
                day_today: "bg-blue-50 text-blue-900 font-semibold",
              }}
            />
          </div>

          {/* Quick Actions */}
          <div className="px-3 pb-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => handleSelect(new Date())}
            >
              Aujourd'hui
            </Button>
            {date && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-xs text-gray-600 hover:text-gray-900"
                onClick={() => handleSelect(undefined)}
              >
                Effacer
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
