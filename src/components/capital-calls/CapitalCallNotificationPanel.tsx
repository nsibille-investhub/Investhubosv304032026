import { useMemo, useState } from 'react';
import { Download, Eye, Landmark, Layers3, Mail, Send, UsersRound } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalCallAttachment, CapitalCallDiffusion } from '../../utils/capitalCallGenerator';
import { CallRecipientLine, callMailPreview, callRecipients, callTemplate } from '../../utils/capitalCallRecipients';
import { AudienceCounterCards } from '../AudienceCounter';
import { Tag } from '../Tag';
import { Button } from '../ui/button';
import { DisabledReason } from '../ui/disabled-reason';
import { downloadScopeAudience } from '../ui/document-scope';
import { MailPreviewDialog } from '../ui/mail-preview-dialog';
import { SectionCard } from '../ui/section-card';

const K = 'funds.capitalCalls.notificationPanel';

interface CapitalCallNotificationPanelProps {
  fundName: string;
  shares: string[];
  /** Nombre de souscriptions retenues par une restriction, toutes parts confondues. */
  restrictedTo?: number | null;
  lines: CallRecipientLine[];
  diffusion: CapitalCallDiffusion;
  combinedNotices: boolean;
  dueDate: Date | null;
  message: string;
  attachments: CapitalCallAttachment[];
  callName: string;
}

/**
 * Cible, destinataires et gabarit d'un appel, avec l'aperçu du mail et l'export des destinataires.
 * Mêmes briques que l'accès d'un document : étiquettes de ciblage, compteurs d'audience, export CSV.
 */
export function CapitalCallNotificationPanel({
  fundName,
  shares,
  restrictedTo,
  lines,
  diffusion,
  combinedNotices,
  dueDate,
  message,
  attachments,
  callName,
}: CapitalCallNotificationPanelProps) {
  const { t, lang } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const audience = useMemo(
    () => callRecipients(lines, { principal: t(`${K}.principal`), copy: t(`${K}.copy`) }),
    [lines, t],
  );
  const template = callTemplate(combinedNotices);
  const dueDateLabel = dueDate ? new Intl.DateTimeFormat(lang).format(dueDate) : undefined;
  const preview = template && previewOpen ? callMailPreview(template, lang, { fund: fundName, dueDate: dueDateLabel, message }) : null;
  const previewReason = !diffusion.notify ? t(`${K}.noEmail`) : !template ? t(`${K}.noTemplate`) : null;
  const channels = [
    diffusion.portal && t(`${K}.channels.portal`),
    diffusion.notify && t(`${K}.channels.email`),
    diffusion.documents && t(`${K}.channels.documents`),
  ].filter(Boolean);

  const exportRecipients = () =>
    downloadScopeAudience(
      audience,
      [t(`${K}.csv.investor`), t(`${K}.csv.subscriptions`), t(`${K}.csv.contact`), t(`${K}.csv.role`)],
      t(`${K}.csv.fileName`, { name: callName || fundName }),
    );

  return (
    <SectionCard
      mode="read"
      icon={Send}
      title={t(`${K}.title`)}
      summary={channels.length > 0 ? channels.join(' · ') : t(`${K}.channels.none`)}
    >
      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{t(`${K}.target`)}</span>
          <Tag icon={Landmark} label={fundName} />
          {shares.map(share => (
            <Tag key={share} icon={Layers3} label={t('funds.detail.sharePrefix', { name: share })} />
          ))}
          {restrictedTo ? <Tag icon={UsersRound} label={t(`${K}.restricted`, { count: restrictedTo })} /> : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <AudienceCounterCards investors={audience.investorCount} contacts={audience.contactCount} />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportRecipients} disabled={lines.length === 0}>
            <Download className="h-4 w-4" />
            {t(`${K}.export`)}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{template?.name ?? t(`${K}.noTemplate`)}</p>
              <p className="text-xs text-muted-foreground">
                {template ? t(`${K}.templateLine`, { slug: template.slug }) : t(`${K}.noTemplate`)}
              </p>
            </div>
          </div>
          <DisabledReason reason={previewReason}>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setPreviewOpen(true)}
              disabled={Boolean(previewReason)}
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              {t(`${K}.preview`)}
            </Button>
          </DisabledReason>
        </div>
      </div>

      <MailPreviewDialog
        open={Boolean(preview)}
        onOpenChange={setPreviewOpen}
        title={t(`${K}.previewTitle`, { name: template?.name ?? '' })}
        description={t(`${K}.previewDescription`)}
        subject={preview?.subject ?? ''}
        html={preview?.html ?? ''}
        subjectLabel={t(`${K}.subject`)}
        frameLabel={t(`${K}.frameLabel`)}
        details={
          <div className="space-y-2 rounded-md border border-border px-3 py-2 text-sm">
            <p>
              <span className="text-muted-foreground">{t(`${K}.attachments`)} </span>
              {[t(`${K}.noticeFile`), ...attachments.map(file => file.name)].join(', ')}
            </p>
            <p className="whitespace-pre-line">
              <span className="text-muted-foreground">{t(`${K}.message`)} </span>
              {message.trim() || t(`${K}.noMessage`)}
            </p>
          </div>
        }
      />
    </SectionCard>
  );
}
