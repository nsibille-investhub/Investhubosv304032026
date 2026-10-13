import { useState } from 'react';
import type { ReactNode } from 'react';
import { KeyRound } from 'lucide-react';
import { useTranslation } from '../../../utils/languageContext';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/formatters';
import { Button } from '../../ui/button';
import { ColorPicker } from '../../ui/color-picker';
import { DayMonthPicker, useMonthLabels, type DayMonthValue } from '../../ui/day-month-picker';
import { DisabledReason } from '../../ui/disabled-reason';
import { FrequencyDayField, type FrequencyDayValue } from '../../ui/frequency-day-field';
import { ImageUpload } from '../../ui/image-upload';
import { Input } from '../../ui/input';
import { ModernMultiSelect } from '../../ui/modern-multiselect';
import { RichTextEditor } from '../../ui/rich-text-editor';
import { SectionFieldRow } from '../../ui/section-card';
import { SegmentedControl } from '../../ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Textarea } from '../../ui/textarea';
import type { FieldDef, FieldOption, SettingsContext } from './settingsSchema';
import { isRequired } from './settingsSchema';

const S = 'funds.detail.settings';
const EMPTY = '__empty';

/** Préfixe de traduction des options partagées avec d'autres écrans. */
const OPTION_PREFIX: Record<string, string> = {
  fundType: 'funds.detail.type',
  paymentMode: 'funds.detail.paymentMode',
  investorSegments: 'funds.detail.overview.access.segment',
  performanceIndicator: `${S}.values.performance`,
  navFrequency: 'common.frequencyDayField.frequencies',
  commissionPeriodicity: 'common.frequencyDayField.frequencies',
};

interface SettingsFieldProps {
  field: FieldDef;
  ctx: SettingsContext;
  mode: 'read' | 'edit';
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  highlighted?: boolean;
  /** Le changement de ce champ passe par une confirmation (mode de paiement). */
  onConfirmChange?: (value: unknown) => void;
  onRegenerateKey?: () => void;
  regenerateDisabledReason?: string;
  lockedReason?: string;
}

export function SettingsField({
  field,
  ctx,
  mode,
  value,
  onChange,
  error,
  disabled,
  highlighted,
  onConfirmChange,
  onRegenerateKey,
  regenerateDisabledReason,
  lockedReason,
}: SettingsFieldProps) {
  const { t, lang } = useTranslation();
  const months = useMonthLabels();
  const [language, setLanguage] = useState(ctx.detail.languages[0] ?? 'fr');
  const inputId = `fund-setting-${field.id}`;
  const labelKey = field.labelKey?.(ctx) ?? field.id;
  const label = field.label ?? t(`${S}.fields.${labelKey}`);

  const options: FieldOption[] =
    typeof field.options === 'function' ? field.options(ctx) : field.options ?? [];
  const regionNames = new Intl.DisplayNames([lang], { type: 'region' });
  const optionLabel = (option: FieldOption) => {
    if (option.label) return option.label;
    if (field.id === 'countries') return regionNames.of(option.value) ?? option.value;
    const prefix = OPTION_PREFIX[field.id] ?? `${S}.options.${field.id}`;
    return t(`${prefix}.${option.value}`);
  };
  const languageLabel = (code: string) => new Intl.DisplayNames([lang], { type: 'language' }).of(code) ?? code;
  const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
  const dayMonth = (item: DayMonthValue) =>
    t('funds.detail.overview.calendar.dayMonth', { day: item.day, month: months[item.month - 1].toLowerCase() });

  const display = (): ReactNode => {
    if (value === null || value === undefined || value === '') return null;
    switch (field.kind) {
      case 'amount':
        return formatCurrency(Number(value), String(ctx.values.currency ?? 'EUR'));
      case 'percent':
        return new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 2 }).format(Number(value) / 100);
      case 'select':
        return optionLabel(options.find(option => option.value === value) ?? { value: String(value), label: String(value) });
      case 'multiselect':
        return Array.isArray(value) && value.length > 0
          ? value.map(item => optionLabel(options.find(option => option.value === item) ?? { value: item, label: item })).join(', ')
          : null;
      case 'switch':
        return value ? t(`${S}.values.yes`) : t(`${S}.values.no`);
      case 'date':
        return formatDate(new Date(`${value}T12:00:00`));
      case 'readonly':
        return formatDateTime(String(value));
      case 'color':
        return (
          <span className="inline-flex items-center gap-2 font-mono">
            <span className="h-4 w-4 rounded border border-border" style={{ backgroundColor: String(value) }} />
            {String(value)}
          </span>
        );
      case 'image':
        return <img src={String(value)} alt={label} className="h-12 w-auto rounded border border-border" />;
      case 'video':
        return (
          <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-primary underline">
            {String(value)}
          </a>
        );
      case 'richtext': {
        const entries = Object.entries(value as Record<string, string>).filter(([, html]) => html && html.trim() !== '');
        if (entries.length === 0) return null;
        return (
          <div className="flex flex-col gap-2 font-normal">
            {entries.map(([code, html]) => (
              <div key={code}>
                {ctx.detail.languages.length > 1 && (
                  <span className="text-xs font-medium text-muted-foreground">{capitalize(languageLabel(code))}</span>
                )}
                {/* Contenu saisi dans l'éditeur riche du back-office. */}
                <div className="rich-text text-sm" dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            ))}
          </div>
        );
      }
      case 'dayMonthRange': {
        const range = value as { from: DayMonthValue; to: DayMonthValue };
        return t('funds.detail.overview.calendar.window', { from: dayMonth(range.from), to: dayMonth(range.to) });
      }
      case 'frequencyDay': {
        const item = value as FrequencyDayValue;
        const frequency = t(`common.frequencyDayField.frequencies.${item.frequency}`);
        if (item.day === 'last') return `${frequency}, ${t('common.frequencyDayField.lastDay').toLowerCase()}`;
        if (item.frequency === 'annual' && typeof item.day === 'number' && item.month)
          return `${frequency}, ${dayMonth({ day: item.day, month: item.month })}`;
        return item.day ? `${frequency}, ${t('common.frequencyDayField.dayOfMonth', { day: item.day })}` : frequency;
      }
      case 'secret':
        return <span className="font-mono">{String(value)}</span>;
      default:
        return String(value);
    }
  };

  const input = () => {
    const common = { id: inputId, disabled, 'aria-invalid': Boolean(error) || undefined };
    switch (field.kind) {
      case 'text':
      case 'video':
      case 'emails':
        return (
          <Input
            {...common}
            value={String(value ?? '')}
            onChange={event => onChange(event.target.value)}
            placeholder={field.kind === 'emails' ? t(`${S}.placeholders.emails`) : undefined}
            className="border-border"
          />
        );
      case 'textarea':
        return (
          <Textarea
            {...common}
            value={String(value ?? '')}
            onChange={event => onChange(event.target.value)}
            className="border-border"
          />
        );
      case 'number':
      case 'amount':
      case 'percent':
        return (
          <div className="flex items-center gap-2">
            <Input
              {...common}
              type="number"
              inputMode="decimal"
              value={value === null || value === undefined ? '' : String(value)}
              onChange={event => onChange(event.target.value === '' ? null : Number(event.target.value))}
              className="w-48 border-border"
            />
            {field.kind === 'amount' && <span className="text-sm text-muted-foreground">{String(ctx.values.currency ?? '')}</span>}
            {field.kind === 'percent' && <span className="text-sm text-muted-foreground">%</span>}
          </div>
        );
      case 'select':
        return (
          <Select
            value={value ? String(value) : EMPTY}
            onValueChange={next => {
              const resolved = next === EMPTY ? '' : next;
              if (field.confirmChange && onConfirmChange) onConfirmChange(resolved);
              else onChange(resolved);
            }}
            disabled={disabled}
          >
            <SelectTrigger id={inputId} aria-invalid={Boolean(error) || undefined} className="w-72 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={EMPTY}>{t(`${S}.values.empty`)}</SelectItem>
              {options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {optionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'multiselect':
        return (
          <ModernMultiSelect
            options={options.map(option => ({ value: option.value, label: optionLabel(option) }))}
            value={Array.isArray(value) ? (value as string[]) : []}
            onChange={next => onChange(next)}
            placeholder={t(`${S}.values.empty`)}
            searchPlaceholder={t(`${S}.placeholders.search`)}
            disabled={disabled}
          />
        );
      case 'switch':
        return (
          <label className="inline-flex items-center gap-3 text-sm">
            <Switch id={inputId} checked={value === true} onCheckedChange={checked => onChange(checked)} disabled={disabled} />
            {value ? t(`${S}.values.yes`) : t(`${S}.values.no`)}
          </label>
        );
      case 'date':
        return (
          <Input
            {...common}
            type="date"
            value={String(value ?? '')}
            onChange={event => onChange(event.target.value)}
            className="w-48 border-border"
          />
        );
      case 'color':
        return <ColorPicker id={inputId} value={value ? String(value) : null} onChange={next => onChange(next ?? '')} disabled={disabled} />;
      case 'image':
        return <ImageUpload value={value ? String(value) : undefined} onChange={next => onChange(next ?? '')} />;
      case 'richtext': {
        const record = (value as Record<string, string>) ?? {};
        return (
          <div className="flex flex-col gap-2">
            {ctx.detail.languages.length > 1 && (
              <SegmentedControl
                size="sm"
                value={language}
                onValueChange={setLanguage}
                aria-label={t(`${S}.languageTabs`)}
                options={ctx.detail.languages.map(code => ({ value: code, label: capitalize(languageLabel(code)) }))}
              />
            )}
            <RichTextEditor
              key={language}
              id={inputId}
              ariaLabel={`${label} (${languageLabel(language)})`}
              value={record[language] ?? ''}
              onChange={html => onChange({ ...record, [language]: html })}
              disabled={disabled}
              invalid={Boolean(error)}
            />
          </div>
        );
      }
      case 'dayMonthRange': {
        const range = (value as { from: DayMonthValue; to: DayMonthValue } | null) ?? null;
        return (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-6">{t(`${S}.range.from`)}</span>
              <DayMonthPicker
                idPrefix={`${inputId}-from`}
                value={range?.from ?? null}
                onChange={from => onChange({ from, to: range?.to ?? from })}
                disabled={disabled}
                invalid={Boolean(error)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-6">{t(`${S}.range.to`)}</span>
              <DayMonthPicker
                idPrefix={`${inputId}-to`}
                value={range?.to ?? null}
                onChange={to => onChange({ from: range?.from ?? to, to })}
                disabled={disabled}
                invalid={Boolean(error)}
              />
            </div>
          </div>
        );
      }
      case 'frequencyDay':
        return (
          <FrequencyDayField
            idPrefix={inputId}
            value={(value as FrequencyDayValue | null) ?? null}
            onChange={next => onChange(next)}
            disabled={disabled}
            invalid={Boolean(error)}
          />
        );
      default:
        return <span className="text-sm font-medium text-foreground">{display() ?? t('common.sectionCard.notProvided')}</span>;
    }
  };

  const secretAction =
    field.kind === 'secret' && onRegenerateKey ? (
      <DisabledReason reason={regenerateDisabledReason}>
        <Button variant="outline" size="sm" onClick={onRegenerateKey} disabled={Boolean(regenerateDisabledReason)}>
          <KeyRound className="w-3.5 h-3.5" />
          {t(`${S}.regenerate`)}
        </Button>
      </DisabledReason>
    ) : null;

  const readValue = display();

  return (
    <SectionFieldRow
      id={`fund-field-${field.id}`}
      highlighted={highlighted}
      mode={mode === 'edit' && field.kind !== 'secret' && field.kind !== 'readonly' ? 'edit' : 'read'}
      label={label}
      htmlFor={inputId}
      required={isRequired(field, ctx)}
      value={
        secretAction ? (
          <span className="inline-flex flex-wrap items-center gap-3">
            {readValue}
            {secretAction}
          </span>
        ) : (
          readValue
        )
      }
      lockedReason={lockedReason}
      legacySettingEffect={field.legacy ? t(`${S}.legacy.${field.id.startsWith('fileName') ? 'fileName' : field.id}`) : undefined}
      error={error}
      hint={field.hint ? t(`${S}.hints.${field.id.startsWith('fileName') ? 'fileName' : field.id}`) : undefined}
    >
      {input()}
    </SectionFieldRow>
  );
}
