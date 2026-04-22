import * as React from 'react';
import { Search, X } from 'lucide-react';

import { Input } from './input';
import { cn } from './utils';

export type SearchInputProps = Omit<
  React.ComponentProps<'input'>,
  'value' | 'onChange' | 'type'
> & {
  value: string;
  onValueChange: (value: string) => void;
  /** Override the default leading icon (Search). */
  icon?: React.ReactNode;
  /** Show a clear button when the input has a value. Defaults to true. */
  clearable?: boolean;
  /** Fired after the user clears the input (clear button or Escape). */
  onClear?: () => void;
  className?: string;
  inputClassName?: string;
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onValueChange,
      onClear,
      icon,
      clearable = true,
      className,
      inputClassName,
      placeholder = 'Rechercher…',
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const handleClear = React.useCallback(() => {
      onValueChange('');
      onClear?.();
    }, [onValueChange, onClear]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape' && value) {
        event.stopPropagation();
        handleClear();
      }
      onKeyDown?.(event);
    };

    const showClear = clearable && value.length > 0;

    return (
      <div
        data-slot="search-input"
        className={cn('relative w-full min-w-0', className)}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center text-muted-foreground"
        >
          {icon ?? <Search className="size-4" />}
        </span>
        <Input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn('pl-9', showClear && 'pr-9', inputClassName)}
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Effacer la recherche"
            className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
