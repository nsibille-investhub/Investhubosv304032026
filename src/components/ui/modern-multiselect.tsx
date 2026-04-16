import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, X, Search, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './badge';
import { Input } from './input';
import { cn } from './utils';

export interface MultiSelectOption {
  label: string;
  icon?: LucideIcon;
  value?: string;
}

interface ModernMultiSelectProps {
  options: string[] | MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  maxDisplay?: number;
  disabled?: boolean;
  badgeClassName?: string;
  badgeStyle?: React.CSSProperties;
  showIconInBadge?: boolean;
}

export function ModernMultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Sélectionner...',
  searchPlaceholder = 'Rechercher...',
  className,
  maxDisplay = 3,
  disabled = false,
  badgeClassName,
  badgeStyle: customBadgeStyle,
  showIconInBadge = false,
}: ModernMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Normalize options to always work with objects
  const normalizedOptions: MultiSelectOption[] = options.map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : { ...opt, value: opt.value || opt.label }
  );

  // Update dropdown position
  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update position on scroll and resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = normalizedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const selectAll = () => {
    onChange(filteredOptions.map(opt => opt.value!));
  };

  const clearAll = () => {
    onChange([]);
  };

  const getOption = (val: string) => normalizedOptions.find(opt => opt.value === val);
  const getDisplayLabel = (val: string) => getOption(val)?.label || val;

  const displayedValues = value.slice(0, maxDisplay);
  const remainingCount = value.length - maxDisplay;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full min-h-[42px] px-3 py-2 text-left bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg',
          'hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2',
          'transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-gray-900 dark:ring-gray-100 ring-offset-2 border-gray-900 dark:border-gray-100'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          {/* Selected Values Display */}
          <div className="flex-1 flex flex-wrap gap-1.5 min-h-[26px] items-center">
            {value.length === 0 ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">{placeholder}</span>
            ) : (
              <>
                {displayedValues.map((item) => {
                  const opt = getOption(item);
                  const BadgeIcon = showIconInBadge ? opt?.icon : undefined;
                  return (
                    <Badge
                      key={item}
                      className={cn("pl-2 pr-1 py-0.5 text-xs transition-all hover:scale-105", badgeClassName)}
                      style={customBadgeStyle || {
                        backgroundColor: '#DCFDBC',
                        border: '1px solid #DCFDBC',
                        color: '#000',
                      }}
                    >
                      {BadgeIcon && <BadgeIcon className="w-3 h-3 mr-0.5 flex-shrink-0" />}
                      <span className="max-w-[120px] truncate">{getDisplayLabel(item)}</span>
                      <span
                        onClick={(e) => removeOption(item, e)}
                        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors cursor-pointer inline-flex"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    </Badge>
                  );
                })}
                {remainingCount > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  >
                    +{remainingCount}
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Dropdown Icon */}
          <ChevronsUpDown
            className={cn(
              'w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="fixed z-[10000] mt-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
            style={{ 
              minWidth: '320px',
              maxWidth: '400px',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="pl-9 h-9 text-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {value.length} sur {options.length} sélectionné{value.length > 1 ? 's' : ''}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors"
                >
                  Tout sélectionner
                </button>
                {value.length > 0 && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">·</span>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors"
                    >
                      Tout effacer
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-[240px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl">🔍</div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Aucun résultat
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Essayez un autre terme de recherche
                      </p>
                    </div>
                    {searchQuery && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        Recherche: "{searchQuery}"
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-1">
                  {filteredOptions.map((option) => {
                    const isSelected = value.includes(option.value!);
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value!}
                        type="button"
                        onClick={() => toggleOption(option.value!)}
                        className={cn(
                          'w-full px-3 py-2.5 text-sm text-left transition-colors',
                          'hover:bg-gray-50 dark:hover:bg-gray-900 flex items-center justify-between gap-3',
                          isSelected && 'bg-gray-50/50 dark:bg-gray-900/50'
                        )}
                      >
                        <span className={cn(
                          'flex items-center gap-2 flex-1 truncate transition-all text-gray-900 dark:text-gray-100',
                          isSelected && 'font-medium'
                        )}>
                          {Icon && <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
                          {option.label}
                        </span>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="flex-shrink-0"
                            >
                              <div
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{
                                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                                }}
                              >
                                <Check className="w-3.5 h-3.5 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}