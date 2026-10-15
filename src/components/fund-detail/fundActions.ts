import type { FundDetail } from '../../utils/fundDetailMock';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

export interface ActionState {
  visible: boolean;
  /** Motif quand l'action est visible mais indisponible. */
  disabledReason?: string;
}

export interface FundActionStates {
  publish: ActionState;
  duplicate: ActionState;
  archive: ActionState;
  unarchive: ActionState;
  propagate: ActionState;
  delete: ActionState;
  /** Motif qui bloque toute modification des paramètres, des parts et des valeurs liquidatives. */
  editReason?: string;
}

const K = 'funds.detail.reasons';

/**
 * Disponibilité des actions du fonds.
 * Règle serveur simulée pour la maquette (PRD Détail d'un fonds V3, sections 6.1, 9.2 à 9.5 et 16) :
 * droit manquant, verrou du support, archivage et envoi d'avis bloquent les modifications ;
 * la publication exige une configuration minimale complète. Le serveur reste seul juge.
 */
export function getFundActionStates(detail: FundDetail, t: Translate): FundActionStates {
  const noEditRight = !detail.rights.edit ? t(`${K}.noEditRight`) : undefined;
  const locked = detail.locked ? t(`${K}.locked`) : undefined;
  const sending = detail.sendingNotices ? t(`${K}.sendingNotices`) : undefined;
  const archived = detail.archived ? t(`${K}.archived`) : undefined;
  const noArchiveRight = !detail.rights.archive ? t(`${K}.noArchiveRight`) : undefined;

  const missing = detail.missingConfig.length;
  const publishMissing =
    missing > 0
      ? t(missing === 1 ? `${K}.configMissingOne` : `${K}.configMissingMany`, { count: missing })
      : undefined;

  return {
    publish: {
      visible: detail.status === 'draft',
      disabledReason: !detail.rights.publish
        ? t(`${K}.noPublishRight`)
        : locked ?? sending ?? publishMissing,
    },
    duplicate: {
      visible: true,
      disabledReason: !detail.rights.duplicate ? t(`${K}.noDuplicateRight`) : undefined,
    },
    archive: {
      visible: !detail.archived,
      disabledReason: noArchiveRight ?? locked ?? sending,
    },
    unarchive: {
      visible: Boolean(detail.archived),
      disabledReason: noArchiveRight ?? locked,
    },
    propagate: {
      visible: detail.isMaster,
      disabledReason: noEditRight ?? locked ?? sending ?? archived,
    },
    delete: {
      visible: true,
      disabledReason: !detail.rights.delete ? t(`${K}.noDeleteRight`) : locked ?? sending,
    },
    editReason: noEditRight ?? locked ?? archived,
  };
}
