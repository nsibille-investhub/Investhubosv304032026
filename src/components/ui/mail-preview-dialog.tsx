import type { ReactNode } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';

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

/** Aperçu d'un mail avant envoi : objet, éléments joints, corps rendu dans un cadre sans script. Rien n'est envoyé. */
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex flex-col overflow-hidden"
        style={{ width: 760, maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh' }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">{subjectLabel} </span>
            <span className="font-medium text-foreground">{subject}</span>
          </div>
          {details}
          <div className="rounded-md border border-border bg-gray-100 p-3 overflow-auto">
            <iframe
              title={frameLabel}
              srcDoc={html}
              sandbox=""
              className="w-full border-0 block bg-white"
              style={{ height: 'min(60vh, 560px)' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
