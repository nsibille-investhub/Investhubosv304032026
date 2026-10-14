import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from '../../../utils/languageContext';
import { formatCurrency } from '../../../utils/formatters';
import { MAIL_TEMPLATE_OPTIONS, SHARE_OPERATORS, SHARE_SEGMENTS } from '../../../utils/fundDetailMock';
import { FREQUENCIES } from '../../ui/frequency-day-field';
import { Input } from '../../ui/input';
import { ModernMultiSelect } from '../../ui/modern-multiselect';
import { SectionFieldRow } from '../../ui/section-card';
import { SegmentedControl } from '../../ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { StatusBadge } from '../../StatusBadge';
import { SettingsField } from '../settings/SettingsField';
import type { FieldDef } from '../settings/settingsSchema';
import type { ShareContext, ShareFieldDef, ShareValues } from './shareSchema';

const P = 'funds.detail.shares.page';
const DEFAULT = '__default';

interface ShareFieldProps {
  field: ShareFieldDef;
  ctx: ShareContext;
  mode: 'read' | 'edit';
  values: ShareValues;
  onChange: (id: string, value: unknown) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  highlighted: string | null;
  /** Périodicité des commissions du fonds, rappelée sous la valeur de la part. */
  fundPeriodicity: string;
}

const rowId = (id: string) => `share-field-${id}`;

export function ShareField({ field, ctx, mode, values, onChange, errors, disabled, highlighted, fundPeriodicity }: ShareFieldProps) {
  const { t } = useTranslation();
  const label = field.label ?? t(`${P}.fields.${field.id}`);
  const value = values[field.id];
  const inputId = `share-input-${field.id}`;
  const currency = String(ctx.values.currency ?? 'EUR');
  const optionLabel = (option: string) => (field.dataOptions ? option : t(`${P}.options.${field.id}.${option}`));
  const dataOptions = field.id === 'operators' ? SHARE_OPERATORS : SHARE_SEGMENTS;
  const rowProps = {
    id: rowId(field.id),
    highlighted: highlighted === field.id,
    label,
    mode,
    htmlFor: inputId,
    required: field.required,
    error: errors[field.id],
  };

  switch (field.kind) {
    case 'text':
    case 'richtext':
    case 'amount':
    case 'percent':
    case 'number':
    case 'switch':
    case 'emails':
    case 'multiselect': {
      // Mêmes champs que l'onglet Paramètres : la ligne et sa saisie viennent du design system.
      const settingsField: FieldDef = {
        id: field.id,
        kind: field.kind,
        label,
        required: field.required,
        options: (field.options ?? (field.dataOptions ? dataOptions : [])).map(option => ({
          value: option,
          label: optionLabel(option),
        })),
      };
      return (
        <div id={rowId(field.id)} style={{ scrollMarginTop: '6rem' }}>
          <SettingsField
            field={settingsField}
            ctx={{ detail: ctx.detail, values: ctx.values }}
            mode={mode}
            value={value}
            onChange={next => onChange(field.id, next)}
            error={errors[field.id]}
            disabled={disabled}
            highlighted={highlighted === field.id}
          />
        </div>
      );
    }

    case 'choice': {
      const options = field.options ?? [];
      return (
        <SectionFieldRow {...rowProps} value={value ? optionLabel(String(value)) : null}>
          <SegmentedControl
            size="sm"
            value={String(value ?? options[0])}
            onValueChange={next => onChange(field.id, next)}
            aria-label={label}
            options={options.map(option => ({ value: option, label: optionLabel(option) }))}
          />
        </SectionFieldRow>
      );
    }

    case 'template': {
      const current = typeof value === 'string' && value ? value : null;
      return (
        <SectionFieldRow
          {...rowProps}
          value={current ?? <span className="text-muted-foreground">{t(`${P}.values.defaultTemplate`)}</span>}
        >
          <Select
            value={current ?? DEFAULT}
            onValueChange={next => onChange(field.id, next === DEFAULT ? null : next)}
            disabled={disabled}
          >
            <SelectTrigger id={inputId} className="w-80 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={DEFAULT}>{t(`${P}.values.defaultTemplate`)}</SelectItem>
              {MAIL_TEMPLATE_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SectionFieldRow>
      );
    }

    case 'allOrSome': {
      const list = Array.isArray(value) ? (value as string[]) : [];
      const allLabel = t(`${P}.values.${field.id === 'operators' ? 'allOperators' : 'allSegments'}`);
      return (
        <SectionFieldRow {...rowProps} value={list.length === 0 ? allLabel : list.join(', ')} hint={t(`${P}.hints.${field.id}`)}>
          <ModernMultiSelect
            options={dataOptions.map(option => ({ value: option, label: option }))}
            value={list}
            onChange={next => onChange(field.id, next)}
            placeholder={allLabel}
            searchPlaceholder={t('funds.detail.settings.placeholders.search')}
            disabled={disabled}
          />
        </SectionFieldRow>
      );
    }

    case 'periodicity': {
      const own = typeof value === 'string' && value ? value : null;
      const frequency = (key: string) => t(`common.frequencyDayField.frequencies.${key}`);
      const fundLine = t(`${P}.values.fundValue`, { value: frequency(fundPeriodicity) });
      const read: ReactNode = (
        <span className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2">
            {own ? frequency(own) : t(`${P}.values.fundDefault`)}
            {own && own !== fundPeriodicity && <StatusBadge label={t(`${P}.values.override`)} variant="warning" />}
          </span>
          <span className="text-xs font-normal text-muted-foreground">{fundLine}</span>
        </span>
      );
      return (
        <SectionFieldRow {...rowProps} value={read} hint={fundLine}>
          <div className="flex items-center gap-2">
            <Select value={own ?? DEFAULT} onValueChange={next => onChange(field.id, next === DEFAULT ? null : next)} disabled={disabled}>
              <SelectTrigger id={inputId} className="w-72 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DEFAULT}>{t(`${P}.values.fundDefault`)}</SelectItem>
                {FREQUENCIES.filter(item => item !== 'daily' && item !== 'weekly').map(item => (
                  <SelectItem key={item} value={item}>
                    {frequency(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {own && own !== fundPeriodicity && <StatusBadge label={t(`${P}.values.override`)} variant="warning" />}
          </div>
        </SectionFieldRow>
      );
    }

    case 'limits':
      return (
        <LimitsRows
          ctx={ctx}
          mode={mode}
          values={values}
          onChange={onChange}
          errors={errors}
          disabled={disabled}
          highlighted={highlighted}
          currency={currency}
        />
      );

    default:
      return null;
  }
}

interface LimitsRowsProps {
  ctx: ShareContext;
  mode: 'read' | 'edit';
  values: ShareValues;
  onChange: (id: string, value: unknown) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  highlighted: string | null;
  currency: string;
}

/** Bornes de souscription : seules celles de la modalité active sont affichées. */
function LimitsRows({ mode, values, onChange, errors, disabled, highlighted, currency }: LimitsRowsProps) {
  const { t, lang } = useTranslation();
  const shareMode = values.mode === 'perAmount' ? 'perAmount' : 'perShare';
  const ids = shareMode === 'perShare' ? ['minShares', 'maxShares'] : ['minAmount', 'maxAmount'];
  const numberFormat = new Intl.NumberFormat(lang);
  const display = (id: string) => {
    const value = values[id];
    if (value === null || value === undefined || value === '') return null;
    return shareMode === 'perShare'
      ? t(`${P}.values.sharesCount`, { count: numberFormat.format(Number(value)) })
      : formatCurrency(Number(value), currency);
  };

  return (
    <>
      <SectionFieldRow
        id={rowId('mode-limits')}
        label={t(`${P}.fields.mode`)}
        mode={mode}
        value={t(`${P}.options.mode.${shareMode}`)}
        hint={t(`${P}.hints.limitsMode`)}
      >
        <SegmentedControl
          size="sm"
          value={shareMode}
          onValueChange={next => onChange('mode', next)}
          aria-label={t(`${P}.fields.mode`)}
          options={(['perShare', 'perAmount'] as const).map(option => ({
            value: option,
            label: t(`${P}.options.mode.${option}`),
          }))}
        />
      </SectionFieldRow>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={shareMode}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className="divide-y divide-border"
        >
          {ids.map(id => (
            <SectionFieldRow
              key={id}
              id={rowId(id)}
              highlighted={highlighted === id}
              label={t(`${P}.fields.${id}`)}
              mode={mode}
              value={display(id)}
              htmlFor={`share-input-${id}`}
              error={errors[id]}
            >
              <div className="flex items-center gap-2">
                <Input
                  id={`share-input-${id}`}
                  type="number"
                  inputMode="decimal"
                  disabled={disabled}
                  aria-invalid={Boolean(errors[id]) || undefined}
                  value={values[id] === null || values[id] === undefined ? '' : String(values[id])}
                  onChange={event => onChange(id, event.target.value === '' ? null : Number(event.target.value))}
                  className="w-48 border-border"
                />
                <span className="text-sm text-muted-foreground">
                  {shareMode === 'perShare' ? t(`${P}.values.sharesUnit`) : currency}
                </span>
              </div>
            </SectionFieldRow>
          ))}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
