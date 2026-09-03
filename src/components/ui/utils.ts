import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Titre de widget : petites capitales grises, comme le bandeau de complétion.
 * A utiliser pour l'en-tete de toutes les cartes de contenu.
 */
export const WIDGET_TITLE_CLASS =
  'text-xs font-semibold uppercase tracking-wide text-muted-foreground';

/** Sous-titre de widget, sous le titre en petites capitales. */
export const WIDGET_SUBTITLE_CLASS = 'text-xs text-muted-foreground';

/** Libelle de sous-bloc a l'interieur d'un widget, un cran sous le titre. */
export const WIDGET_LABEL_CLASS =
  'text-[11px] font-medium uppercase tracking-wide text-muted-foreground';
