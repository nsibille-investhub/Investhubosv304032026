import type { CapitalCall } from './capitalCallGenerator';

/**
 * Actions du listing propres aux appels de fonds. Notification, export de la cible, documents et suppression
 * suivent le socle commun des notices (noticeActions).
 */
export type CapitalCallAction = 'edit' | 'exportLines';

export type CapitalCallBlocker = 'sending' | 'missingRight';

export interface CapitalCallRights {
  manage: boolean;
  notify: boolean;
  export: boolean;
}

export const FULL_RIGHTS: CapitalCallRights = { manage: true, notify: true, export: true };

const REQUIRED_RIGHT: Record<CapitalCallAction, keyof CapitalCallRights> = {
  exportLines: 'export',
  edit: 'manage',
};

/**
 * Disponibilité d'une action, telle que le serveur la calcule.
 * Le même contrôle s'applique au menu et à toute action lancée par un autre moyen.
 */
export function capitalCallBlocker(
  call: CapitalCall,
  action: CapitalCallAction,
  rights: CapitalCallRights,
  sending = call.sending,
): CapitalCallBlocker | null {
  if (sending && action === 'edit') return 'sending';
  if (!rights[REQUIRED_RIGHT[action]]) return 'missingRight';
  return null;
}
