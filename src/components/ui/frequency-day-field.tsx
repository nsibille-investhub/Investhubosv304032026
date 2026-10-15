import { useMemo } from 'react';
import { useTranslation } from '../../utils/languageContext';
import { DayMonthPicker } from './day-month-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from './utils';

export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export const FREQUENCIES: Frequency[] = [
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'semiannual',
  'annual',
];

export interface FrequencyDayValue {
  frequency: Frequency;
  /** Jour de la semaine (1 = lundi) en hebdomadaire, jour du mois ou "last" sinon. */
  day?: number | 'last';
  /** Mois de 1 à 12, en annuel seulement. */
  month?: number;
}

/** Jours proposés en mensuel et au-delà : 1 à 28, puis "Dernier jour", valable pour tous les mois. */
const MONTH_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);

function useWeekdayLabels() {
  const { lang } = useTranslation();
  return useMemo(() => {
    const format = new Intl.DateTimeFormat(lang, { weekday: 'long' });
    // 1er janvier 2024 : un lundi.
    return Array.from({ length: 7 }, (_, index) => {
      const label = format.format(new Date(2024, 0, 1 + index));
      return label.charAt(0).toUpperCase() + label.slice(1);
    });
  }, [lang]);
}

interface FrequencyDayFieldProps {
  value: FrequencyDayValue | null;
  onChange: (value: FrequencyDayValue) => void;
  idPrefix: string;
  /** Fréquences proposées. Par défaut : toutes. */
  frequencies?: Frequency[];
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

/**
 * Champ composé : la fréquence d'abord, puis le jour adapté à cette fréquence.
 * L'interprétation du jour (jour ouvré, décalage) reste une règle du serveur.
 */
export function FrequencyDayField({
  value,
  onChange,
  idPrefix,
  frequencies = FREQUENCIES,
  disabled = false,
  invalid = false,
  className,
}: FrequencyDayFieldProps) {
  const { t } = useTranslation();
  const weekdays = useWeekdayLabels();
  const frequency = value?.frequency;

  const handleFrequency = (next: string) => onChange({ frequency: next as Frequency });

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Select value={frequency} onValueChange={handleFrequency} disabled={disabled}>
        <SelectTrigger
          id={`${idPrefix}-frequency`}
          aria-label={t('common.frequencyDayField.frequency')}
          aria-invalid={invalid || undefined}
          className="w-48 border-border"
        >
          <SelectValue placeholder={t('common.frequencyDayField.frequency')} />
        </SelectTrigger>
        <SelectContent>
          {frequencies.map(item => (
            <SelectItem key={item} value={item}>
              {t(`common.frequencyDayField.frequencies.${item}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {frequency === 'weekly' && (
        <Select
          value={value?.day ? String(value.day) : undefined}
          onValueChange={next => onChange({ frequency, day: Number(next) })}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${idPrefix}-day`}
            aria-label={t('common.frequencyDayField.weekday')}
            aria-invalid={invalid || undefined}
            className="w-36 border-border"
          >
            <SelectValue placeholder={t('common.frequencyDayField.weekday')} />
          </SelectTrigger>
          <SelectContent>
            {weekdays.map((label, index) => (
              <SelectItem key={label} value={String(index + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {(frequency === 'monthly' || frequency === 'quarterly' || frequency === 'semiannual') && (
        <Select
          value={value?.day !== undefined ? String(value.day) : undefined}
          onValueChange={next => onChange({ frequency, day: next === 'last' ? 'last' : Number(next) })}
          disabled={disabled}
        >
          <SelectTrigger
            id={`${idPrefix}-day`}
            aria-label={t('common.frequencyDayField.monthDay')}
            aria-invalid={invalid || undefined}
            className="w-48 border-border"
          >
            <SelectValue placeholder={t('common.frequencyDayField.monthDay')} />
          </SelectTrigger>
          <SelectContent>
            {MONTH_DAYS.map(day => (
              <SelectItem key={day} value={String(day)}>
                {t('common.frequencyDayField.dayOfMonth', { day })}
              </SelectItem>
            ))}
            <SelectItem value="last">{t('common.frequencyDayField.lastDay')}</SelectItem>
          </SelectContent>
        </Select>
      )}

      {frequency === 'annual' && (
        <DayMonthPicker
          idPrefix={idPrefix}
          value={
            typeof value?.day === 'number' && value.month
              ? { day: value.day, month: value.month }
              : null
          }
          onChange={next => onChange({ frequency, day: next.day, month: next.month })}
          disabled={disabled}
          invalid={invalid}
        />
      )}
    </div>
  );
}
