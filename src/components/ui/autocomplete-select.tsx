/**
 * AutocompleteSingleSelect — Design System component
 * Key: ds-autocomplete-single-select
 *
 * Mono-select with type-ahead auto-complete. The user can search through
 * a list of options by typing. Supports an optional icon rendered inside
 * a small inline badge when a value is selected.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check, X, Search, LucideIcon } from 'lucide-react';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

export interface AutocompleteOption {
  value: string;
  label: string;
  description?: string;
}

interface AutocompleteSingleSelectProps {
  value: string | null;
  onChange: (next: string | null) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  allowClear?: boolean;
  emptyLabel?: string;
}

export function AutocompleteSingleSelect({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner…',
  icon: Icon,
  disabled = false,
  allowClear = true,
  emptyLabel = 'Aucun résultat',
}: AutocompleteSingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) || null,
    [options, value],
  );

  useEffect(() => {
    if (open) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q),
    );
  }, [options, query]);

  return (
    <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full min-h-[44px] px-3 py-2 text-left bg-white border border-gray-200 rounded-lg transition-colors flex items-center justify-between gap-2 ${
            disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-300 cursor-pointer'
          }`}
        >
          <div className="flex-1 flex items-center min-h-[26px]">
            {!selectedOption ? (
              <span className="text-sm text-gray-500">{placeholder}</span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{ color: '#7a7a7a', borderColor: '#ddd7cc', backgroundColor: '#f5f3ee' }}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {selectedOption.label}
                {allowClear && !disabled && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(null);
                    }}
                    className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 cursor-pointer inline-flex"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="border-b border-gray-100 p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              className="h-8 pl-8 text-sm border-gray-200"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">{emptyLabel}</p>
          ) : (
            filtered.map((opt) => {
              const selected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-2 px-2 py-2 text-sm rounded-md text-left ${
                    selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{opt.label}</div>
                    {opt.description && (
                      <div className="text-xs text-gray-500 truncate">{opt.description}</div>
                    )}
                  </div>
                  {selected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
