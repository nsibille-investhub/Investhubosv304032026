import { useEffect, useState } from 'react';
import { Download, FilePlus, FileText, Paperclip, Replace, Upload, type LucideIcon } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import {
  documentSource,
  type NoticeDocument,
  type NoticeFamily,
  type NoticeUploadUsage,
} from '../../utils/noticeActions';
import { AttachmentRow } from '../ui/attachment-row';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { EffectsPanel, type EffectItem } from '../ui/effects-panel';
import { FormField } from '../ui/form-field';
import { Input } from '../ui/input';
import { PreviewFrame } from '../ui/preview-frame';
import { SegmentedControl } from '../ui/segmented-control';
import { WarningNote } from '../ui/warning-note';
import { Sheet, SheetContent } from '../ui/sheet';
import { WidgetMetric } from '../ui/widget-card';
import {
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFileDrop,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelSection,
} from '../ui/side-panel';

const K = 'funds.notices';

interface NoticeActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Ce que l'action va produire : lignes ou objets traités, puis ignorés. */
  effects: EffectItem[];
  warning?: string;
  /** Date saisie dans la fenêtre : réception des fonds. */
  date?: { label: string; value: string; onChange: (value: string) => void };
  confirmLabel: string;
  destructive?: boolean;
  confirmDisabledReason?: string;
  onConfirm: () => void;
}

/** Fenêtre de confirmation d'une action sur des notices, pour une ligne comme pour une sélection. */
export function NoticeActionDialog({
  open,
  onClose,
  title,
  description,
  icon,
  effects,
  warning,
  date,
  confirmLabel,
  destructive,
  confirmDisabledReason,
  onConfirm,
}: NoticeActionDialogProps) {
  const { t } = useTranslation();
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={next => !next && onClose()}
      title={title}
      description={description}
      icon={icon}
      confirmLabel={confirmLabel}
      destructive={destructive}
      confirmDisabledReason={confirmDisabledReason}
      onConfirm={onConfirm}
    >
      <div className="flex flex-col gap-4">
        {date && (
          <FormField id="notice-action-date" label={date.label} required>
            <Input
              id="notice-action-date"
              type="date"
              className="h-11"
              value={date.value}
              onChange={event => date.onChange(event.target.value)}
            />
          </FormField>
        )}
        <EffectsPanel effects={effects} marker="none" title={t(`${K}.common.dialog.summary`)} />
        {warning && <WarningNote>{warning}</WarningNote>}
      </div>
    </ConfirmDialog>
  );
}

interface NoticeUploadDialogProps {
  open: boolean;
  onClose: () => void;
  documentKind: 'document' | 'letter';
  /** Ligne concernée, rappelée sous le titre. */
  lineLabel: string;
  onConfirm: (fileName: string, usage: NoticeUploadUsage) => void;
}

/** Fenêtre unique de chargement : import du fichier, choix de son usage et confirmation. */
export function NoticeUploadDialog({ open, onClose, documentKind, lineLabel, onConfirm }: NoticeUploadDialogProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState<string | null>(null);
  const [usage, setUsage] = useState<NoticeUploadUsage | null>(null);

  useEffect(() => {
    if (!open) return;
    setFileName(null);
    setUsage(null);
  }, [open]);

  const U = `${K}.common.upload`;
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={next => !next && onClose()}
      title={t(`${K}.common.actions.upload`)}
      description={lineLabel}
      icon={Upload}
      confirmLabel={t(`${U}.confirm`)}
      confirmDisabledReason={fileName && usage ? undefined : t(`${U}.missing`)}
      onConfirm={() => fileName && usage && onConfirm(fileName, usage)}
    >
      <div className="flex flex-col gap-4">
        <FormField id="notice-upload-file" label={t(`${U}.file`)} required>
          <SidePanelFileDrop
            fileName={fileName ?? undefined}
            onSelectFile={file => setFileName(file.name)}
            onRemove={() => setFileName(null)}
            labels={{
              dropHint: t(`${U}.dropHint`),
              dropHintDesc: t(`${U}.dropHintDesc`),
              fileReady: t(`${U}.fileReady`),
              preview: t(`${U}.preview`),
              remove: t(`${U}.remove`),
            }}
          />
        </FormField>
        <FormField
          id="notice-upload-usage"
          label={t(`${U}.usage`)}
          required
          hint={usage === 'add' ? t(`${U}.addHint`) : undefined}
        >
          <SegmentedControl<NoticeUploadUsage | ''>
            aria-label={t(`${U}.usage`)}
            fullWidth
            value={usage ?? ''}
            onValueChange={value => value && setUsage(value)}
            options={[
              { value: 'add', label: t(`${U}.add`), icon: <FilePlus className="h-4 w-4" /> },
              { value: 'replace', label: t(`${K}.docKind.${documentKind}.replace`), icon: <Replace className="h-4 w-4" /> },
            ]}
          />
        </FormField>
        {usage === 'replace' && <WarningNote>{t(`${K}.docKind.${documentKind}.replaceWarning`)}</WarningNote>}
      </div>
    </ConfirmDialog>
  );
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);

interface NoticeDocumentPanelProps {
  open: boolean;
  onClose: () => void;
  family: NoticeFamily;
  documentKind: 'document' | 'letter';
  parentName: string;
  fundName: string;
  line: { investor: string; subscription: string; document: NoticeDocument } | null;
  onDownload: () => void;
  onDownloadExtra: (fileName: string) => void;
}

/** Aperçu du document d'une ligne dans le panneau latéral, sans quitter le listing. */
export function NoticeDocumentPanel({
  open,
  onClose,
  family,
  documentKind,
  parentName,
  fundName,
  line,
  onDownload,
  onDownloadExtra,
}: NoticeDocumentPanelProps) {
  const { t, lang } = useTranslation();
  const P = `${K}.common.documentPanel`;
  const title = t(`${K}.families.${family}.documentTitle`);
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const date = (value: Date | null) => (value ? dateFormat.format(value) : '-');

  const html = line
    ? `<!doctype html><html lang="${lang}"><body style="margin:0;padding:48px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;font-size:14px;line-height:1.6">
<h1 style="font-size:20px;margin:0 0 4px">${escapeHtml(title)}</h1>
<p style="margin:0;color:#475569">${escapeHtml(parentName)}</p>
<hr style="margin:24px 0;border:0;border-top:1px solid #e2e8f0" />
<p><strong>${escapeHtml(t(`${P}.fund`))}</strong> ${escapeHtml(fundName)}</p>
<p><strong>${escapeHtml(t(`${P}.investor`))}</strong> ${escapeHtml(line.investor)}</p>
<p><strong>${escapeHtml(t(`${P}.subscription`))}</strong> ${escapeHtml(line.subscription)}</p>
${line.document.manualFile ? `<p style="margin-top:24px;color:#475569">${escapeHtml(t(`${P}.manualFile`, { name: line.document.manualFile }))}</p>` : ''}
</body></html>`
    : '';

  return (
    <Sheet open={open} onOpenChange={next => !next && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={title} description={line?.subscription} />
        {line && (
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
            <SidePanelSection icon={FileText} title={t(`${K}.docKind.${documentKind}.title`)}>
              <SidePanelCard>
                <div className="grid grid-cols-3 gap-3">
                  <WidgetMetric
                    label={t(`${K}.docKind.${documentKind}.columns.documentSource`)}
                    value={t(`${K}.common.sources.${documentSource(line.document)}`)}
                  />
                  <WidgetMetric
                    label={t(`${K}.docKind.${documentKind}.columns.documentGeneratedAt`)}
                    value={date(line.document.generatedAt)}
                  />
                  <WidgetMetric
                    label={t(`${K}.docKind.${documentKind}.columns.documentAddedAt`)}
                    value={date(line.document.addedAt)}
                  />
                </div>
              </SidePanelCard>
              <PreviewFrame title={t(`${P}.frame`)} html={html} className="h-96" />
            </SidePanelSection>
            <SidePanelSection icon={Paperclip} title={t(`${P}.extraFiles`)}>
              <SidePanelCard>
                {line.document.extraFiles.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t(`${P}.noExtraFile`)}</p>
                ) : (
                  <div className="divide-y divide-border">
                    {line.document.extraFiles.map((fileName, index) => (
                      <AttachmentRow
                        key={`${fileName}-${index}`}
                        name={fileName}
                        downloadLabel={t(`${P}.downloadExtra`)}
                        onDownload={() => onDownloadExtra(fileName)}
                      />
                    ))}
                  </div>
                )}
              </SidePanelCard>
            </SidePanelSection>
          </div>
        )}
        <SidePanelFooter>
          <Button variant="ghost" size="sm" className="h-9" onClick={onClose}>
            {t(`${P}.close`)}
          </Button>
          <Button variant="primary" size="sm" className="h-9" onClick={onDownload}>
            <Download className="h-4 w-4" />
            {t(`${K}.docKind.${documentKind}.download`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
