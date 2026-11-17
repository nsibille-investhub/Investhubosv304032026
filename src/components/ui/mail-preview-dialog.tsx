import type { ReactNode } from 'react';

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
}

/**
 * Aperçu d'un mail avant envoi, en panneau latéral : objet, éléments joints, corps rendu dans un cadre
 * sans script. Rien n'est envoyé.
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
}: MailPreviewDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={title} description={description} />
        <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 py-5">
          <div className="rounded-md border border-border bg-white px-3 py-2 text-sm">
            <span className="text-muted-foreground">{subjectLabel} </span>
            <span className="font-medium text-foreground">{subject}</span>
          </div>
          {details}
          <div className="flex min-h-0 flex-1 flex-col rounded-md border border-border bg-gray-100 p-3">
            <iframe title={frameLabel} srcDoc={html} sandbox="" className="block w-full flex-1 border-0 bg-white" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
