import { useMemo } from 'react';
import { useTranslation } from '../../utils/languageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from './utils';

export interface DayMonthValue {
  day: number;
  /** Mois de 1 à 12. */
  month: number;
}

/** Nombre de jours d'un mois sans année : février compte 29 jours (années bissextiles). */
const daysInMonth = (month: number) => new Date(2024, month, 0).getDate();

export function useMonthLabels() {
  const { lang } = useTranslation();
  return useMemo(() => {
    const format = new Intl.DateTimeFormat(lang, { month: 'long' });
    return Array.from({ length: 12 }, (_, index) => {
      const label = format.format(new Date(2024, index, 1));
      return label.charAt(0).toUpperCase() + label.slice(1);
    });
  }, [lang]);
}

interface DayMonthPickerProps {
  value: DayMonthValue | null;
  onChange: (value: DayMonthValue) => void;
  idPrefix: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

/** Date récurrente sans année : jour puis mois, par exemple une fenêtre de liquidité. */
export function DayMonthPicker({
  value,
  onChange,
  idPrefix,
  disabled = false,
  invalid = false,
  className,
}: DayMonthPickerProps) {
  const { t } = useTranslation();
  const months = useMonthLabels();
  const month = value?.month ?? 1;
  const maxDay = daysInMonth(month);

  const handleMonth = (next: string) => {
    const nextMonth = Number(next);
    const day = Math.min(value?.day ?? 1, daysInMonth(nextMonth));
    onChange({ day, month: nextMonth });
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        value={value ? String(value.day) : undefined}
        onValueChange={next => onChange({ day: Number(next), month })}
        disabled={disabled}
      >
        <SelectTrigger
          id={`${idPrefix}-day`}
          aria-label={t('common.dayMonthPicker.day')}
          aria-invalid={invalid || undefined}
          className="w-24 border-border"
        >
          <SelectValue placeholder={t('common.dayMonthPicker.day')} />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: maxDay }, (_, index) => (
            <SelectItem key={index + 1} value={String(index + 1)}>
              {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value ? String(value.month) : undefined} onValueChange={handleMonth} disabled={disabled}>
        <SelectTrigger
          id={`${idPrefix}-month`}
          aria-label={t('common.dayMonthPicker.month')}
          aria-invalid={invalid || undefined}
          className="w-40 border-border"
        >
          <SelectValue placeholder={t('common.dayMonthPicker.month')} />
        </SelectTrigger>
        <SelectContent>
          {months.map((label, index) => (
            <SelectItem key={label} value={String(index + 1)}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
