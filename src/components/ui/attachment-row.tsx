import { Download, Paperclip } from 'lucide-react';
import { Button } from './button';

interface AttachmentRowProps {
  name: string;
  /** Taille déjà formatée (« 284 Ko »). */
  size?: string;
  downloadLabel: string;
  onDownload: () => void;
}

/** Ligne de pièce jointe : trombone, nom, taille, bouton de téléchargement. */
export function AttachmentRow({ name, size, downloadLabel, onDownload }: AttachmentRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="inline-flex min-w-0 items-center gap-2 text-sm">
        <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="truncate font-medium">{name}</span>
        {size && <span className="shrink-0 text-xs text-muted-foreground">{size}</span>}
      </span>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onDownload}>
        <Download className="h-4 w-4" />
        {downloadLabel}
      </Button>
    </div>
  );
}
