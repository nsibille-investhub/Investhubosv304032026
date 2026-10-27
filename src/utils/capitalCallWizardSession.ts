import type { CapitalCallDiffusion } from './capitalCallGenerator';
import type { ShareInput } from './capitalCallWizard';

/**
 * Préparation d'un appel en cours, propre à l'utilisateur, comme une session d'envoi en masse.
 * Ce n'est pas une opération : rien n'existe en base avant "Créer l'appel", rien n'apparaît
 * dans le listing ni en V1, et la session n'a aucun effet sur les autres appels ni sur les souscriptions.
 */
export interface CapitalCallWizardSession {
  step: number;
  fundId: number | null;
  name: string;
  dueDate: string | null;
  noticeDate: string | null;
  diffusion: CapitalCallDiffusion;
  message: string;
  attachments: [{ name: string; sizeKb: number } | null, { name: string; sizeKb: number } | null];
  forecastId: number | null;
  distributionIds: number[];
  mode: 'perShare' | 'toRaise';
  amountToRaise: string;
  inputs: Record<string, ShareInput>;
  savedAt: string;
}

const storageKey = (user: string) => `investhub-capital-call-wizard-${user}`;

export function readWizardSession(user: string): CapitalCallWizardSession | null {
  try {
    const raw = window.localStorage.getItem(storageKey(user));
    return raw ? (JSON.parse(raw) as CapitalCallWizardSession) : null;
  } catch {
    return null;
  }
}

export function writeWizardSession(user: string, session: CapitalCallWizardSession) {
  try {
    window.localStorage.setItem(storageKey(user), JSON.stringify(session));
  } catch {
    // Sans stockage, la session vit le temps de la page.
  }
}

export function clearWizardSession(user: string) {
  try {
    window.localStorage.removeItem(storageKey(user));
  } catch {
    // Rien à effacer.
  }
}

export function sessionDate(iso: string | null): Date | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
