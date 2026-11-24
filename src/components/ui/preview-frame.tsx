import { cn } from './utils';

interface PreviewFrameProps {
  /** Libellé du cadre pour les lecteurs d'écran. */
  title: string;
  /** Document HTML complet, rendu dans un cadre isolé, sans script. */
  html: string;
  /** Hauteur du cadre : `flex-1` dans une colonne, ou une hauteur fixe comme `h-96`. */
  className?: string;
}

/** Cadre d'aperçu d'un contenu HTML (mail, avis, courrier) dans un panneau latéral : page blanche sur fond gris. */
export function PreviewFrame({ title, html, className }: PreviewFrameProps) {
  return (
    <div className={cn('flex min-h-0 flex-col rounded-md border border-border bg-gray-100 p-3', className)}>
      <iframe title={title} srcDoc={html} sandbox="" className="block w-full flex-1 border-0 bg-white" />
    </div>
  );
}
