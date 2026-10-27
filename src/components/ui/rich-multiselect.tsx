import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';

import { Checkbox } from './checkbox';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';

export interface RichMultiSelectOption {
  value: string;
  label: string;
  /** Ligne secondaire sous le libellé : identifiant, dates, montants... */
  details?: ReactNode;
  /** Texte supplémentaire pris en compte par la recherche. */
  searchText?: string;
}

interface RichMultiSelectProps {
  id?: string;
  options: RichMultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  /** Libellé du déclencheur : placeholder, ou résumé de la sélection. */
  triggerLabel: string;
  searchPlaceholder: string;
  emptyLabel: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Multisélection en liste déroulante pour des éléments riches (souscriptions, investisseurs) :
 * recherche, une case par option, une ligne de détail sous le libellé. La sélection s'affiche
 * à part, dans la sous-section qui l'utilise, où chaque élément se retire.
 */
export function RichMultiSelect({
  id,
  options,
  value,
  onChange,
  triggerLabel,
  searchPlaceholder,
  emptyLabel,
  disabled,
  className,
}: RichMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter(option => `${option.label} ${option.value} ${option.searchText ?? ''}`.toLowerCase().includes(term));
  }, [options, query]);

  const toggle = (optionValue: string) =>
    onChange(value.includes(optionValue) ? value.filter(item => item !== optionValue) : [...value, optionValue]);

  return (
    <Popover open={open} onOpenChange={next => !disabled && setOpen(next)}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-input-background px-3 text-left text-sm',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            value.length === 0 && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            filtered.map(option => {
              const checked = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn('flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 text-sm', checked ? 'bg-muted' : 'hover:bg-muted')}
                >
                  <Checkbox className="mt-0.5" checked={checked} onCheckedChange={() => toggle(option.value)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground">{option.label}</span>
                    {option.details && <span className="block text-xs text-muted-foreground">{option.details}</span>}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
