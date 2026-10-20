import { useRef, type ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { AlertTriangle, Paperclip, X } from 'lucide-react';

import { useTranslation } from '../../../utils/languageContext';
import type { Fund } from '../../../utils/fundGenerator';
import type { FundCallSettings, FundDistribution, PendingForecast } from '../../../utils/capitalCallWizard';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { DatePicker } from '../../ui/date-picker';
import { DetailLink } from '../../ui/detail-summary';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { SegmentedControl } from '../../ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';

const K = 'funds.capitalCalls.wizard.info';

export type Publication = 'onNotification' | 'immediate';

export interface InfoValues {
  fundId: number | null;
  name: string;
  dueDate: Date | undefined;
  noticeDate: Date | undefined;
  publication: Publication;
  message: string;
  attachments: [AttachmentValue | null, AttachmentValue | null];
  forecastId: number | null;
  distributionIds: number[];
}

export interface AttachmentValue {
  name: string;
  sizeKb: number;
}

export type InfoErrors = Partial<Record<'fundId' | 'name' | 'dueDate', string>>;

export const NO_FORECAST = 'none';

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-label={t('funds.capitalCalls.wizard.required')}>
            *
          </span>
        )}
      </Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

interface WizardInfoStepProps {
  funds: Fund[];
  values: InfoValues;
  errors: InfoErrors;
  settings: FundCallSettings | null;
  forecasts: PendingForecast[];
  distributions: FundDistribution[];
  currency: string;
  onChange: (patch: Partial<InfoValues>) => void;
}

export function WizardInfoStep({
  funds,
  values,
  errors,
  settings,
  forecasts,
  distributions,
  currency,
  onChange,
}: WizardInfoStepProps) {
  const { t, lang } = useTranslation();
  const fileInputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const money = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

  const setAttachment = (index: 0 | 1, file: AttachmentValue | null) => {
    const next: [AttachmentValue | null, AttachmentValue | null] = [...values.attachments];
    next[index] = file;
    onChange({ attachments: next });
  };

  return (
    <div className="space-y-6">
      <Field id="call-fund" label={t(`${K}.fund`)} required error={errors.fundId}>
        <Select
          value={values.fundId ? String(values.fundId) : ''}
          onValueChange={value => onChange({ fundId: Number(value), forecastId: null, distributionIds: [] })}
        >
          <SelectTrigger id="call-fund" aria-invalid={Boolean(errors.fundId)} className="w-full">
            <SelectValue placeholder={t(`${K}.fundPlaceholder`)} />
          </SelectTrigger>
          <SelectContent>
            {funds.map(fund => (
              <SelectItem key={fund.id} value={String(fund.id)}>
                {fund.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {settings && !settings.hasNoticeTemplate && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t(`${K}.noTemplate.title`)}</AlertTitle>
          <AlertDescription>
            <span>{t(`${K}.noTemplate.description`)}</span>
            <DetailLink className="text-sm" onClick={() => toast.info(t(`${K}.noTemplate.notInMockup`))}>
              {t(`${K}.noTemplate.link`)}
            </DetailLink>
          </AlertDescription>
        </Alert>
      )}

      <Field id="call-name" label={t(`${K}.name`)} required error={errors.name}>
        <Input
          id="call-name"
          value={values.name}
          onChange={event => onChange({ name: event.target.value })}
          placeholder={t(`${K}.namePlaceholder`)}
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Field id="call-due" label={t(`${K}.dueDate`)} required error={errors.dueDate}>
          <div id="call-due" aria-invalid={Boolean(errors.dueDate)}>
            <DatePicker
              date={values.dueDate}
              onDateChange={date => onChange({ dueDate: date })}
              placeholder={t(`${K}.datePlaceholder`)}
              className={errors.dueDate ? 'w-full border-red-300' : 'w-full'}
            />
          </div>
        </Field>
        <Field id="call-notice" label={t(`${K}.noticeDate`)} hint={t(`${K}.noticeDateHint`)}>
          <div id="call-notice">
            <DatePicker
              date={values.noticeDate}
              onDateChange={date => onChange({ noticeDate: date })}
              placeholder={t(`${K}.datePlaceholder`)}
              className="w-full"
            />
          </div>
        </Field>
        <Field id="call-publication" label={t(`${K}.publication`)}>
          <SegmentedControl<Publication>
            options={[
              { value: 'onNotification', label: t(`${K}.publicationOptions.onNotification`) },
              { value: 'immediate', label: t(`${K}.publicationOptions.immediate`) },
            ]}
            value={values.publication}
            onValueChange={publication => onChange({ publication })}
            size="sm"
          />
        </Field>
      </div>

      <Field id="call-message" label={t(`${K}.message`)}>
        <Textarea
          id="call-message"
          rows={4}
          value={values.message}
          onChange={event => onChange({ message: event.target.value })}
          placeholder={t(`${K}.messagePlaceholder`)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {([0, 1] as const).map(index => (
          <Field key={index} id={`call-attachment-${index}`} label={t(`${K}.attachment`, { index: index + 1 })}>
            <input
              ref={fileInputs[index]}
              id={`call-attachment-${index}`}
              type="file"
              className="sr-only"
              onChange={event => {
                const file = event.target.files?.[0];
                setAttachment(index, file ? { name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1000)) } : null);
              }}
            />
            {values.attachments[index] ? (
              <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate">{values.attachments[index]?.name}</span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label={t(`${K}.removeAttachment`)}
                  onClick={() => setAttachment(index, null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputs[index].current?.click()}>
                <Paperclip className="h-4 w-4" />
                {t(`${K}.addAttachment`)}
              </Button>
            )}
          </Field>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field
          id="call-forecast"
          label={t(`${K}.forecast`)}
          hint={values.fundId && forecasts.length === 0 ? t(`${K}.noForecast`) : undefined}
        >
          <Select
            value={values.forecastId ? String(values.forecastId) : NO_FORECAST}
            onValueChange={value => onChange({ forecastId: value === NO_FORECAST ? null : Number(value) })}
            disabled={!values.fundId || forecasts.length === 0}
          >
            <SelectTrigger id="call-forecast" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_FORECAST}>{t(`${K}.forecastNone`)}</SelectItem>
              {forecasts.map(forecast => (
                <SelectItem key={forecast.id} value={String(forecast.id)}>
                  {t(`${K}.forecastOption`, { name: forecast.name, amount: money(forecast.amount) })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field
          id="call-distributions"
          label={t(`${K}.distributions`)}
          hint={values.fundId && distributions.length === 0 ? t(`${K}.noDistribution`) : undefined}
        >
          <div id="call-distributions" className="space-y-2">
            {distributions.map(distribution => (
              <label key={distribution.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={values.distributionIds.includes(distribution.id)}
                  onCheckedChange={checked =>
                    onChange({
                      distributionIds: checked
                        ? [...values.distributionIds, distribution.id]
                        : values.distributionIds.filter(id => id !== distribution.id),
                    })
                  }
                />
                {t(`${K}.distributionOption`, { name: distribution.name, amount: money(distribution.amount) })}
              </label>
            ))}
            {!values.fundId && <p className="text-xs text-muted-foreground">{t(`${K}.chooseFundFirst`)}</p>}
          </div>
        </Field>
      </div>
    </div>
  );
}
