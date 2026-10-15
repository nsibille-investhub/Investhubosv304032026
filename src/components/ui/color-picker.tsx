import { useEffect, useState } from 'react';
import { Check, ChevronDown, Pipette, X } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';
import { toneText } from './tone';

/** Couleurs proposées : tokens de thème, convertis en hexadécimal au moment du choix. */
const PRESET_TOKENS = [
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--brand-primary-light',
  '--success',
  '--warning',
];

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

const readToken = (token: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

interface ColorPickerProps {
  /** Couleur choisie par l'utilisateur, au format #RRGGBB. C'est une donnée, pas un style. */
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}

export function ColorPicker({ value, onChange, id, disabled = false, invalid = false }: ColorPickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value ?? '');
  const [presets, setPresets] = useState<string[]>([]);

  useEffect(() => setHex(value ?? ''), [value]);

  useEffect(() => {
    if (open) setPresets(PRESET_TOKENS.map(readToken).filter(color => HEX_PATTERN.test(color)));
  }, [open]);

  const hexError = hex !== '' && !HEX_PATTERN.test(hex);

  const commitHex = (next: string) => {
    setHex(next);
    if (HEX_PATTERN.test(next)) onChange(next.toLowerCase());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            'border-border flex h-9 w-full items-center gap-2 rounded-md border bg-card px-3 text-sm outline-none transition-[color,box-shadow]',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span
            className={cn('h-5 w-5 shrink-0 rounded-md border border-border', !value && 'bg-muted')}
            style={value ? { backgroundColor: value } : undefined}
          />
          <span className={cn('flex-1 text-left', value ? 'font-mono text-foreground' : 'text-muted-foreground')}>
            {value ?? t('common.colorPicker.placeholder')}
          </span>
          <ChevronDown className="size-4 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 space-y-3">
        <div className="flex flex-wrap gap-1.5" role="listbox" aria-label={t('common.colorPicker.presets')}>
          {presets.map((color, index) => {
            const selected = value?.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={`${color}-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={t('common.colorPicker.presetLabel', { index: index + 1, color })}
                onClick={() => {
                  onChange(color.toLowerCase());
                  setOpen(false);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-border outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                style={{ backgroundColor: color }}
              >
                {selected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          <label htmlFor={`${id ?? 'color'}-hex`} className="text-xs font-medium text-muted-foreground">
            {t('common.colorPicker.custom')}
          </label>
          <div className="flex items-center gap-2">
            <Input
              id={`${id ?? 'color'}-hex`}
              value={hex}
              onChange={event => commitHex(event.target.value.trim())}
              placeholder={t('common.colorPicker.hexPlaceholder')}
              aria-invalid={hexError || undefined}
              className="border-border font-mono"
            />
            <label
              className="relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border"
              aria-label={t('common.colorPicker.eyedropper')}
            >
              <Pipette className="w-4 h-4 text-muted-foreground" />
              <input
                type="color"
                value={HEX_PATTERN.test(hex) ? hex : '#000000'}
                onChange={event => commitHex(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
          {hexError && (
            <p className="text-xs" style={toneText('danger')} role="alert">
              {t('common.colorPicker.invalidHex')}
            </p>
          )}
        </div>

        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            <X className="w-3.5 h-3.5" />
            {t('common.colorPicker.clear')}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
