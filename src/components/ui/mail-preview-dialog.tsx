import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import { DetailLink } from './detail-summary';
import { PreviewFrame } from './preview-frame';
import { Sheet, SheetContent } from './sheet';
import { SIDE_PANEL_WIDE_STYLE, SidePanelHeader } from './side-panel';

interface MailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Objet du mail, variables résolues. */
  subject: string;
  /** Document HTML complet, rendu dans un cadre isolé. */
  html: string;
  subjectLabel: string;
  frameLabel: string;
  /** Sous l'objet : pièces jointes, message d'accompagnement... */
  details?: ReactNode;
  /** Slug du gabarit à l'origine du mail : ajoute le lien rapide "Modifier le gabarit" dans l'en-tête. */
  templateSlug?: string;
}

/** Fiche d'un gabarit de mail dans les paramètres. */
export const mailTemplateHref = (slug: string) => `#/settings/mail-templates?template=${encodeURIComponent(slug)}`;

/**
 * Aperçu d'un mail avant envoi, en panneau latéral : objet, éléments joints, corps rendu dans un cadre
 * sans script. Rien n'est envoyé. Avec `templateSlug`, l'en-tête porte un lien vers la fiche du gabarit,
 * ouverte dans un nouvel onglet.
 */
export function MailPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  subject,
  html,
  subjectLabel,
  frameLabel,
  details,
  templateSlug,
}: MailPreviewDialogProps) {
  const { t } = useTranslation();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={title} description={description}>
          {templateSlug && (
            <DetailLink
              href={mailTemplateHref(templateSlug)}
              icon={Pencil}
              title={t('common.mailPreview.editTemplateHint')}
              className="self-start text-sm"
            >
              {t('common.mailPreview.editTemplate')}
            </DetailLink>
          )}
        </SidePanelHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 py-5">
          <div className="rounded-md border border-border bg-white px-3 py-2 text-sm">
            <span className="text-muted-foreground">{subjectLabel} </span>
            <span className="font-medium text-foreground">{subject}</span>
          </div>
          {details}
          <PreviewFrame title={frameLabel} html={html} className="flex-1" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
