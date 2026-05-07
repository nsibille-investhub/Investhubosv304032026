/**
 * Targeting selects — Design System components
 * Key: ds-targeting-selects
 *
 * Shared inline-badge dropdowns used wherever a user configures an audience
 * (folder / space creation, generic document creation, etc.).
 *
 * All three follow the same visual pattern: an outlined field that shows the
 * selection INSIDE as a removable badge, and a popover with a list of options.
 *
 *  - <SegmentsMultiSelect> multi-select with inline badges (with Users icon)
 *  - <FundSingleSelect>    single-select with inline badge (with Landmark icon)
 *  - <ShareClassSingleSelect> single-select with inline badge (with Layers3 icon)
 */

import { useState, useMemo } from 'react';
import { ChevronDown, Check, Tag, Landmark, Layers3, X, LucideIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { AutocompleteSingleSelect, AutocompleteOption } from './autocomplete-select';
import { useTranslation } from '../../utils/languageContext';

const BRAND_BLUE = '#000E2B';

// ---------------------------------------------------------------------------
// Shared badge style
// ---------------------------------------------------------------------------
const badgeStyle = {
  color: '#7a7a7a',
  borderColor: '#ddd7cc',
  backgroundColor: '#f5f3ee',
} as const;

// ---------------------------------------------------------------------------
// SegmentsMultiSelect
// ---------------------------------------------------------------------------

interface SegmentsMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  options: readonly string[];
  placeholder?: string;
  icon?: LucideIcon;
}

export function SegmentsMultiSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon = Tag,
}: SegmentsMultiSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const resolvedPlaceholder = placeholder ?? t('ged.dataRoom.targetingSelects.allSegments');

  const toggle = (seg: string) => {
    if (value.includes(seg)) onChange(value.filter((v) => v !== seg));
    else onChange([...value, seg]);
  };

  const remove = (seg: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(value.filter((v) => v !== seg));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full min-h-[44px] px-3 py-2 text-left bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex items-center justify-between gap-2"
        >
          <div className="flex-1 flex flex-wrap gap-1.5 items-center min-h-[26px]">
            {value.length === 0 ? (
              <span className="text-sm text-gray-500">{resolvedPlaceholder}</span>
            ) : (
              value.map((seg) => (
                <span
                  key={seg}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border"
                  style={badgeStyle}
                >
                  <Icon className="w-3 h-3" />
                  {seg}
                  <span
                    onClick={(e) => remove(seg, e)}
                    className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 cursor-pointer inline-flex"
                  >
                    <X className="w-3 h-3" />
                  </span>
                </span>
              ))
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="max-h-64 overflow-y-auto">
          {options.map((seg) => {
            const selected = value.includes(seg);
            return (
              <button
                key={seg}
                type="button"
                onClick={() => toggle(seg)}
                className={`w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md text-left ${
                  selected ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selected ? 'border-transparent' : 'border-gray-300'
                  }`}
                  style={selected ? { backgroundColor: BRAND_BLUE } : undefined}
                >
                  {selected && <Check className="w-3 h-3 text-white" />}
                </div>
                <Icon className="w-3.5 h-3.5 text-gray-500" />
                <span>{seg}</span>
              </button>
            );
          })}
          {value.length > 0 && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md text-left text-red-600 hover:bg-red-50"
              >
                <X className="w-3.5 h-3.5" />
                {t('ged.dataRoom.targetingSelects.deselectAll')}
              </button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Helper: convert string[] to AutocompleteOption[]
// ---------------------------------------------------------------------------
function toAutocompleteOptions(options: readonly string[]): AutocompleteOption[] {
  return options.map((o) => ({ value: o, label: o }));
}

// ---------------------------------------------------------------------------
// FundSingleSelect
// ---------------------------------------------------------------------------

interface FundSingleSelectProps {
  value: string | null;
  onChange: (next: string | null) => void;
  options: readonly string[];
  placeholder?: string;
}

export function FundSingleSelect({
  value,
  onChange,
  options,
  placeholder,
}: FundSingleSelectProps) {
  const { t } = useTranslation();
  const autocompleteOptions = useMemo(() => toAutocompleteOptions(options), [options]);
  return (
    <AutocompleteSingleSelect
      value={value}
      onChange={onChange}
      options={autocompleteOptions}
      placeholder={placeholder ?? t('ged.dataRoom.targetingSelects.allFunds')}
      icon={Landmark}
      allowClear
    />
  );
}

// ---------------------------------------------------------------------------
// ShareClassSingleSelect
// ---------------------------------------------------------------------------

interface ShareClassSingleSelectProps {
  value: string | null;
  onChange: (next: string | null) => void;
  options: readonly string[];
  placeholder?: string;
  disabled?: boolean;
}

export function ShareClassSingleSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: ShareClassSingleSelectProps) {
  const { t } = useTranslation();
  const autocompleteOptions = useMemo(() => toAutocompleteOptions(options), [options]);
  return (
    <AutocompleteSingleSelect
      value={value}
      onChange={onChange}
      options={autocompleteOptions}
      placeholder={placeholder ?? t('ged.dataRoom.targetingSelects.allShareClasses')}
      icon={Layers3}
      disabled={disabled}
      allowClear
    />
  );
}
