import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { AlertTriangle, ArrowLeftRight, Eye, Landmark, Megaphone } from 'lucide-react';

import { useTranslation } from '../../../utils/languageContext';
import type { Fund } from '../../../utils/fundGenerator';
import { CapitalCallDiffusion, fundDocumentFolders } from '../../../utils/capitalCallGenerator';
import type { FundCallSettings, FundDistribution, PendingForecast } from '../../../utils/capitalCallWizard';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Button } from '../../ui/button';
import { DisabledReason } from '../../ui/disabled-reason';
import { FormSubsection } from '../../ui/form-section';
import { MailPreviewDialog } from '../../ui/mail-preview-dialog';
import { ModernMultiSelect } from '../../ui/modern-multiselect';
import { callMailPreview, callTemplate } from '../../../utils/capitalCallRecipients';
import { Checkbox } from '../../ui/checkbox';
import { DatePicker } from '../../ui/date-picker';
import { DetailLink } from '../../ui/detail-summary';
import { Input } from '../../ui/input';
import { FormField } from '../../ui/form-field';
import { SegmentedControl } from '../../ui/segmented-control';
import { SidePanelCard, SidePanelFileDrop, SidePanelSwitchRow } from '../../ui/side-panel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Textarea } from '../../ui/textarea';

const K = 'funds.capitalCalls.wizard.info';

export interface InfoValues {
  fundId: number | null;
  /** Parts appelées, toutes par défaut au choix du fonds. */
  shares: string[];
  name: string;
  dueDate: Date | undefined;
  noticeDate: Date | undefined;
  diffusion: CapitalCallDiffusion;
  message: string;
  internalComment: string;
  attachments: [AttachmentValue | null, AttachmentValue | null];
  forecastId: number | null;
  distributionIds: number[];
}

export interface AttachmentValue {
  name: string;
  sizeKb: number;
}

export type InfoErrors = Partial<Record<'fundId' | 'shares' | 'name' | 'dueDate' | 'documentFolder', string>>;

export const NO_FORECAST = 'none';

const DIFFUSION_CHANNELS = ['portal', 'notify', 'documents'] as const;

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
  const money = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

  const setDiffusion = (patch: Partial<CapitalCallDiffusion>) => onChange({ diffusion: { ...values.diffusion, ...patch } });
  const { portal, notify, documents } = values.diffusion;
  const diffusionHint = !portal && !notify && !documents ? t(`${K}.diffusion.noneHint`) : undefined;

  const setAttachment = (index: 0 | 1, file: AttachmentValue | null) => {
    const next: [AttachmentValue | null, AttachmentValue | null] = [...values.attachments];
    next[index] = file;
    onChange({ attachments: next });
  };

  const fundShares = funds.find(fund => fund.id === values.fundId)?.shareClasses.map(item => item.name) ?? [];

  const [previewOpen, setPreviewOpen] = useState(false);
  const template = callTemplate(settings?.combinedNotices ?? false);
  const previewDisabledReason = !notify ? t(`${K}.communication.previewNoEmail`) : !template ? t(`${K}.communication.previewNoTemplate`) : null;
  const fundName = funds.find(fund => fund.id === values.fundId)?.name;
  const preview =
    template && previewOpen
      ? callMailPreview(template, lang, {
          fund: fundName,
          dueDate: values.dueDate ? new Intl.DateTimeFormat(lang).format(values.dueDate) : undefined,
          message: values.message,
        })
      : null;
  const attachedFiles = [t(`${K}.communication.noticeFile`), ...values.attachments.filter(Boolean).map(file => file!.name)];

  return (
    <div className="space-y-4">
      <FormSubsection icon={Landmark} title={t(`${K}.sections.call`)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="call-fund" label={t(`${K}.fund`)} required error={errors.fundId}>
            <Select
              value={values.fundId ? String(values.fundId) : ''}
              onValueChange={value => {
                const fund = funds.find(item => item.id === Number(value));
                onChange({
                  fundId: Number(value),
                  shares: fund?.shareClasses.map(item => item.name) ?? [],
                  diffusion: { ...values.diffusion, documentFolder: null },
                  forecastId: null,
                  distributionIds: [],
                });
              }}
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
          </FormField>
          <FormField
            id="call-shares"
            label={t(`${K}.shares`)}
            required
            error={errors.shares}
            hint={
              values.fundId
                ? t(`${K}.sharesHint`, { count: values.shares.length, total: fundShares.length })
                : t(`${K}.chooseFundFirst`)
            }
          >
            <ModernMultiSelect
              options={fundShares}
              value={values.shares}
              onChange={shares => onChange({ shares })}
              placeholder={t(`${K}.sharesPlaceholder`)}
              searchPlaceholder={t(`${K}.sharesSearch`)}
              disabled={!values.fundId}
              maxDisplay={4}
            />
          </FormField>
        </div>

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

        <FormField id="call-name" label={t(`${K}.name`)} required error={errors.name}>
          <Input
            id="call-name"
            value={values.name}
            onChange={event => onChange({ name: event.target.value })}
            placeholder={t(`${K}.namePlaceholder`)}
            aria-invalid={Boolean(errors.name)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField id="call-due" label={t(`${K}.dueDate`)} required error={errors.dueDate}>
            <div id="call-due" aria-invalid={Boolean(errors.dueDate)}>
              <DatePicker
                date={values.dueDate}
                onDateChange={date => onChange({ dueDate: date })}
                placeholder={t(`${K}.datePlaceholder`)}
                className={errors.dueDate ? 'w-full border-red-300' : 'w-full'}
              />
            </div>
          </FormField>
          <FormField id="call-notice" label={t(`${K}.noticeDate`)} hint={t(`${K}.noticeDateHint`)}>
            <div id="call-notice">
              <DatePicker
                date={values.noticeDate}
                onDateChange={date => onChange({ noticeDate: date })}
                placeholder={t(`${K}.datePlaceholder`)}
                className="w-full"
              />
            </div>
          </FormField>
        </div>

        <FormField id="call-internal-comment" label={t(`${K}.internalComment`)} hint={t(`${K}.internalCommentHint`)}>
          <Textarea
            id="call-internal-comment"
            rows={2}
            value={values.internalComment}
            onChange={event => onChange({ internalComment: event.target.value })}
            placeholder={t(`${K}.internalCommentPlaceholder`)}
          />
        </FormField>
      </FormSubsection>

      <FormSubsection icon={ArrowLeftRight} title={t(`${K}.sections.flows`)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            id="call-forecast"
            label={t(`${K}.forecast`)}
            hint={values.fundId && forecasts.length === 0 ? t(`${K}.noForecast`) : t(`${K}.forecastHint`)}
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
          </FormField>
          <FormField
            id="call-distributions"
            label={t(`${K}.distributions`)}
            hint={values.fundId && distributions.length === 0 ? t(`${K}.noDistribution`) : t(`${K}.distributionsHint`)}
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
          </FormField>
        </div>
      </FormSubsection>

      <FormSubsection
        icon={Megaphone}
        title={t(`${K}.sections.communication`)}
        action={
          <DisabledReason reason={previewDisabledReason}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setPreviewOpen(true)}
              disabled={Boolean(previewDisabledReason)}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {t(`${K}.communication.preview`)}
            </Button>
          </DisabledReason>
        }
      >
        <FormField id="call-diffusion" label={t(`${K}.diffusion.label`)} hint={diffusionHint}>
          <SidePanelCard flush className="divide-y divide-border">
            {DIFFUSION_CHANNELS.map(channel => (
              <div key={channel} className="px-4 py-3">
                <SidePanelSwitchRow
                  id={`call-diffusion-${channel}`}
                  label={t(`${K}.diffusion.${channel}.label`)}
                  description={t(`${K}.diffusion.${channel}.description`)}
                  checked={values.diffusion[channel]}
                  onCheckedChange={checked => setDiffusion({ [channel]: checked })}
                />
                {channel === 'documents' && values.diffusion.documents && (
                  <FormField
                    id="call-document-folder"
                    label={t(`${K}.diffusion.folder.label`)}
                    required
                    error={errors.documentFolder}
                    hint={fundName ? t(`${K}.diffusion.folder.hint`) : t(`${K}.chooseFundFirst`)}
                    className="mt-3"
                  >
                    <Select
                      value={values.diffusion.documentFolder ?? ''}
                      onValueChange={documentFolder => setDiffusion({ documentFolder })}
                      disabled={!fundName}
                    >
                      <SelectTrigger id="call-document-folder" aria-invalid={Boolean(errors.documentFolder)} className="w-full">
                        <SelectValue placeholder={t(`${K}.diffusion.folder.placeholder`)} />
                      </SelectTrigger>
                      <SelectContent>
                        {(fundName ? fundDocumentFolders(fundName) : []).map(folder => (
                          <SelectItem key={folder} value={folder}>
                            {folder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                )}
                {channel === 'notify' && values.diffusion.portal && values.diffusion.notify && (
                  <div className="mt-3 space-y-1.5">
                    <p className="text-sm font-medium">{t(`${K}.diffusion.timing.label`)}</p>
                    <SegmentedControl<CapitalCallDiffusion['portalTiming']>
                      options={[
                        { value: 'onNotification', label: t(`${K}.diffusion.timing.onNotification`) },
                        { value: 'immediate', label: t(`${K}.diffusion.timing.immediate`) },
                      ]}
                      value={values.diffusion.portalTiming}
                      onValueChange={portalTiming => setDiffusion({ portalTiming })}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </SidePanelCard>
        </FormField>

        <FormField id="call-message" label={t(`${K}.message`)}>
          <Textarea
            id="call-message"
            rows={4}
            value={values.message}
            onChange={event => onChange({ message: event.target.value })}
            placeholder={t(`${K}.messagePlaceholder`)}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {([0, 1] as const).map(index => (
            <FormField key={index} id={`call-attachment-${index}`} label={t(`${K}.attachment`, { index: index + 1 })}>
              <SidePanelFileDrop
                fileName={values.attachments[index]?.name}
                onSelectFile={file => setAttachment(index, { name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1000)) })}
                onRemove={() => setAttachment(index, null)}
                labels={{
                  dropHint: t(`${K}.attachmentDrop.hint`),
                  dropHintDesc: t(`${K}.attachmentDrop.hintDesc`),
                  fileReady: t(`${K}.attachmentDrop.ready`),
                  preview: t(`${K}.attachmentDrop.preview`),
                  remove: t(`${K}.removeAttachment`),
                }}
              />
            </FormField>
          ))}
        </div>
      </FormSubsection>

      <MailPreviewDialog
        open={previewOpen && Boolean(preview)}
        onOpenChange={setPreviewOpen}
        title={t(`${K}.communication.previewTitle`, { name: template?.name ?? '' })}
        description={t(`${K}.communication.previewDescription`)}
        subject={preview?.subject ?? ''}
        html={preview?.html ?? ''}
        subjectLabel={t(`${K}.communication.subject`)}
        frameLabel={t(`${K}.communication.frameLabel`)}
        details={
          <div className="space-y-2 rounded-md border border-border px-3 py-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t(`${K}.communication.attachments`)} </span>
              {attachedFiles.join(', ')}
            </p>
            <p className="whitespace-pre-line">
              <span className="text-muted-foreground">{t(`${K}.communication.message`)} </span>
              {values.message.trim() || t(`${K}.communication.noMessage`)}
            </p>
          </div>
        }
      />
    </div>
  );
}
