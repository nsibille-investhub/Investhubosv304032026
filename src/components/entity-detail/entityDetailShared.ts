import { toast } from 'sonner@2.0.3';
import type { AlertListCategory, InvestorRole } from '../../utils/alertsGenerator';
import { navigateToDetail, navigateToPage } from '../../utils/routing';
import type {
  EntityAuditEventType,
  EntityParent,
  EntityRiskLevel,
  EntityStatus,
  MatchChange,
  MatchDecisionValue,
  MatchOpenStatus,
} from '../../utils/screeningMock';
import type { EntityLink } from '../EntityLinks';
import type { Language } from '../../utils/languageContext';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

export const ENTITY_STATUS_KEY: Record<EntityStatus, string> = {
  Pending: 'complianceEntities.status.pending',
  'New Hit': 'complianceEntities.status.newHit',
  'True Hit': 'complianceEntities.status.trueHit',
  Clear: 'complianceEntities.status.clear',
  Validated: 'complianceEntities.status.validated',
  Closed: 'complianceEntities.status.closed',
};

export const ENTITY_STATUS_VARIANT: Record<EntityStatus, BadgeVariant> = {
  Pending: 'warning',
  'New Hit': 'warning',
  'True Hit': 'danger',
  Clear: 'success',
  Validated: 'success',
  Closed: 'neutral',
};

export const RISK_KEY: Record<EntityRiskLevel, string> = {
  Low: 'complianceEntities.risk.low',
  Medium: 'complianceEntities.risk.medium',
  High: 'complianceEntities.risk.high',
  Pending: 'complianceEntities.risk.pending',
};

export const RISK_VARIANT: Record<EntityRiskLevel, BadgeVariant> = {
  Low: 'success',
  Medium: 'warning',
  High: 'danger',
  Pending: 'neutral',
};

export const ENTITY_TYPE_KEY = {
  Individual: 'complianceEntities.type.individual',
  Corporate: 'complianceEntities.type.corporate',
} as const;

export const PARENT_TYPE_KEY: Record<EntityParent['type'], string> = {
  Investor: 'complianceEntities.parentType.investor',
  Partner: 'complianceEntities.parentType.partner',
  Participation: 'complianceEntities.parentType.participation',
};

export const CATEGORY_KEY: Record<AlertListCategory, string> = {
  PEP: 'complianceAlerts.list.pep',
  'Watch List': 'complianceAlerts.list.watchList',
  Sanctions: 'complianceAlerts.list.sanctions',
  'Adverse Media': 'complianceAlerts.list.adverseMedia',
  Crime: 'complianceAlerts.list.crime',
  'Financial Warning': 'complianceAlerts.list.financialWarning',
};

export const ROLE_KEY: Record<InvestorRole, string> = {
  source: 'complianceAlerts.investorRole.source',
  beneficiary: 'complianceAlerts.investorRole.beneficiary',
  coInvestor: 'complianceAlerts.investorRole.coInvestor',
  legalRep: 'complianceAlerts.investorRole.legalRep',
  proxy: 'complianceAlerts.investorRole.proxy',
};

export const DECISION_KEY: Record<MatchDecisionValue, string> = {
  true_hit: 'complianceAlerts.drawer.decisionTrueHit',
  false_hit: 'complianceAlerts.drawer.decisionFalseHit',
  unsure: 'complianceAlerts.drawer.decisionUnsure',
};

export const DECISION_VARIANT: Record<MatchDecisionValue, BadgeVariant> = {
  true_hit: 'danger',
  false_hit: 'neutral',
  unsure: 'warning',
};

export const OPEN_STATUS_KEY: Record<MatchOpenStatus, string> = {
  todo: 'complianceEntities.matches.status.todo',
  unsure: 'complianceEntities.matches.status.unsure',
  confirmed: 'complianceEntities.matches.status.confirmed',
  rejected: 'complianceEntities.matches.status.rejected',
};

export const OPEN_STATUS_VARIANT: Record<MatchOpenStatus, BadgeVariant> = {
  todo: 'warning',
  unsure: 'warning',
  confirmed: 'danger',
  rejected: 'neutral',
};

export const CHANGE_KEY: Record<MatchChange, string> = {
  New: 'complianceAlerts.changes.new',
  Modified: 'complianceAlerts.changes.modified',
  Reopened: 'complianceAlerts.changes.reopened',
};

export const AUDIT_TYPE_KEY: Record<EntityAuditEventType, string> = {
  screening_run: 'complianceEntities.audit.types.screening_run',
  match_created: 'complianceEntities.audit.types.match_created',
  match_changed: 'complianceEntities.audit.types.match_changed',
  match_reopened: 'complianceEntities.audit.types.match_reopened',
  decision: 'complianceEntities.audit.types.decision',
  decision_revised: 'complianceEntities.audit.types.decision_revised',
  comment: 'complianceEntities.audit.types.comment',
  assignment: 'complianceEntities.audit.types.assignment',
  monitoring: 'complianceEntities.audit.types.monitoring',
  status: 'complianceEntities.audit.types.status',
  report: 'complianceEntities.audit.types.report',
  export: 'complianceEntities.audit.types.export',
  closed: 'complianceEntities.audit.types.closed',
};

export const localeFor = (lang: Language) => (lang === 'en' ? 'en-US' : 'fr-FR');

export function formatDate(iso: string | null | undefined, lang: Language): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(localeFor(lang), { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined, lang: Language): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(localeFor(lang), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(timestamp: number, t: Translate): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 60) return t('complianceEntities.relative.minutes', { count: minutes });
  if (hours < 24) return t('complianceEntities.relative.hours', { count: hours });
  if (days === 1) return t('complianceEntities.relative.yesterday');
  if (days < 7) return t('complianceEntities.relative.days', { count: days });
  if (days < 30) return t('complianceEntities.relative.weeks', { count: Math.floor(days / 7) });
  if (days < 365) return t('complianceEntities.relative.months', { count: Math.floor(days / 30) });
  return t('complianceEntities.relative.years', { count: Math.floor(days / 365) });
}

/**
 * Resolves an audit event into a human readable sentence. Descriptions are
 * stored as technical codes in the mock so they can be translated at render.
 */
export function describeAuditEvent(
  event: {
    type: EntityAuditEventType;
    description: string;
    matchName?: string;
    before?: string;
    after?: string;
  },
  t: Translate,
): string {
  const decisionLabel = (value?: string) =>
    value && value in DECISION_KEY ? t(DECISION_KEY[value as MatchDecisionValue]) : value ?? '';
  const match = event.matchName ?? '';
  switch (event.type) {
    case 'status':
      if (event.description === 'entity_created') {
        return t('complianceEntities.audit.desc.entity_created', { parent: event.after ?? '' });
      }
      if (event.description === 'reopened') return t('complianceEntities.audit.desc.reopened_entity');
      return event.description;
    case 'screening_run':
      return t(`complianceEntities.audit.desc.${event.description}`, { count: event.after ?? '0' });
    case 'assignment':
      return event.before
        ? t('complianceEntities.audit.desc.reassigned', { before: event.before, after: event.after ?? '' })
        : t('complianceEntities.audit.desc.assigned', { after: event.after ?? '' });
    case 'monitoring':
      return t(`complianceEntities.audit.desc.${event.description}`);
    case 'match_created':
      return t('complianceEntities.audit.desc.new', { match, score: event.after ?? '' });
    case 'match_changed':
      return t('complianceEntities.audit.desc.change', { match, score: event.after ?? '' });
    case 'match_reopened':
      return t('complianceEntities.audit.desc.reopened', { match, score: event.after ?? '' });
    case 'decision':
      return t('complianceEntities.audit.desc.decision', { match, decision: decisionLabel(event.after ?? event.description) });
    case 'decision_revised':
      return t('complianceEntities.audit.desc.decision_revised', {
        match,
        before: decisionLabel(event.before),
        after: decisionLabel(event.after ?? event.description),
      });
    case 'comment':
      return match
        ? `${t('complianceEntities.audit.desc.comment', { match })} : ${event.description}`
        : event.description;
    case 'report':
      return t('complianceEntities.audit.desc.report', { after: event.after ?? '' });
    case 'export':
      return t('complianceEntities.audit.desc.export', { after: event.after ?? '' });
    case 'closed':
      return t('complianceEntities.audit.desc.closed');
    default:
      return event.description;
  }
}

export function openEntityDetail(uid: string) {
  navigateToDetail('entity', uid);
}

export function openParentPage(parent: EntityParent, t: Translate) {
  if (parent.type === 'Investor') {
    navigateToPage('investors');
    return;
  }
  if (parent.type === 'Partner') {
    navigateToPage('partners');
    return;
  }
  toast.info(t('toast.comingSoon'), { description: parent.name });
}

export function openLinkPage(link: EntityLink, t: Translate) {
  if (link.type === 'investor') {
    navigateToPage('investors');
    return;
  }
  if (link.type === 'distributor') {
    navigateToPage('partners');
    return;
  }
  toast.info(t('toast.comingSoon'), { description: link.name });
}

export function openDossierPage() {
  navigateToPage('dossiers');
}
