import type { CapitalCall } from './capitalCallGenerator';

export type CapitalCallAction =
  | 'notify'
  | 'relaunch'
  | 'exportTarget'
  | 'exportNotices'
  | 'exportLines'
  | 'edit'
  | 'delete';

export const CAPITAL_CALL_ACTIONS: CapitalCallAction[] = [
  'notify',
  'relaunch',
  'exportTarget',
  'exportNotices',
  'exportLines',
  'edit',
  'delete',
];

export type CapitalCallBlocker = 'sending' | 'alreadyNotified' | 'nothingToRelaunch' | 'missingRight';

export interface CapitalCallRights {
  manage: boolean;
  notify: boolean;
  export: boolean;
}

export const FULL_RIGHTS: CapitalCallRights = { manage: true, notify: true, export: true };

const REQUIRED_RIGHT: Record<CapitalCallAction, keyof CapitalCallRights> = {
  notify: 'notify',
  relaunch: 'notify',
  exportTarget: 'export',
  exportNotices: 'export',
  exportLines: 'export',
  edit: 'manage',
  delete: 'manage',
};

const LOCKED_WHILE_SENDING = new Set<CapitalCallAction>(['notify', 'relaunch', 'edit', 'delete']);

/**
 * Disponibilité d'une action, telle que le serveur la calcule.
 * Le même contrôle s'applique au menu et à toute action lancée par un autre moyen.
 */
export function capitalCallBlocker(
  call: CapitalCall,
  action: CapitalCallAction,
  rights: CapitalCallRights,
): CapitalCallBlocker | null {
  if (call.sending && LOCKED_WHILE_SENDING.has(action)) return 'sending';
  if (!rights[REQUIRED_RIGHT[action]]) return 'missingRight';
  if (action === 'notify' && call.notifiedLines >= call.lines) return 'alreadyNotified';
  if (action === 'delete' && call.notifiedLines > 0) return 'alreadyNotified';
  if (action === 'relaunch' && call.linesToRelaunch === 0) return 'nothingToRelaunch';
  return null;
}
