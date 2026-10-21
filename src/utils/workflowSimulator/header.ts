import { normalizeText, toLabelled, type SimulatorEngine } from './engine';
import type { HeaderDefaults } from './dossiers';
import type { Tone } from '../../components/ui/tone';
import type {
  ContextScalar,
  ContextValue,
  ResolvedAction,
  ScenarioHistoryEntry,
  SimLabelled,
  SimTransition,
  WorkflowScenario,
} from './types';

type Translate = (key: string, vars?: Record<string, string | number>) => string;

const H = 'subscriptions.workflowSimulator.header';

// Apparence de la pastille par "qui attend" (spécifications, prompt 4), indexée par libellé
// d'état. Un état absent de cette table prend le ton de son waiting_on (voir toneFromWaiting).
const TONE_BY_STATE_LABEL: Record<string, Tone> = {
  brouillon: 'outline',
  invitee: 'info',
  'en cours': 'info',
  'prete a soumettre': 'info',
  'en correction': 'info',
  'a controler': 'warning',
  'validee a envoyer': 'warning',
  'pre-signee a controler': 'warning',
  'en pre-validation partenaire': 'caution',
  'en signature': 'caution',
  'en pre-signature': 'caution',
  'validee en pre-signature': 'caution',
  active: 'success',
  transferee: 'neutral',
  expiree: 'neutral',
  annulee: 'strong',
  refusee: 'danger',
};
const CANCELLED_LABEL = 'annulee';
const TRANSFERRED_LABEL = 'transferee';

export type HeaderIndicatorId =
  | 'self'
  | 'assisted'
  | 'administered'
  | 'deferred'
  | 'transferredIn'
  | 'transferred'
  | 'reducedCommitment'
  | 'sideletter'
  | 'reopened'
  | 'exceptionalValidation'
  | 'fastAdd'
  | 'sepa'
  | 'pendingChanges'
  | 'presignature'
  | 'payment';

export interface HeaderIndicator {
  id: HeaderIndicatorId;
  label: string;
  tooltip?: string;
  tone: Tone;
  /** Lien vers l'objet lié (souscription d'origine d'un transfert). */
  link?: string;
}

export type HeaderBanner =
  | { kind: 'readOnly' }
  | {
      kind: 'terminal';
      title: string;
      description?: string;
      tone: Tone;
      action?: { label: string; transition: SimTransition; disabledReason?: string };
    }
  | { kind: 'external'; who: string }
  | { kind: 'hypothesis'; ids: string[] };

export interface HeaderModel {
  status: { label: string; tone: Tone; cancelled: boolean; tooltip?: string };
  waitingOn: string[];
  /** Action attendue du rôle simulé, sur un état non terminal. */
  expectedAction: ResolvedAction | null;
  indicators: HeaderIndicator[];
  banners: HeaderBanner[];
  activatedAt: string | null;
  /** États de la séquence non vécus sur la plateforme (reprise hors plateforme). */
  skippedStates: string[];
  paymentDirect: boolean;
}

const translateOr = (t: Translate, key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const isGpRole = (role: string) => role === 'gp' || role.startsWith('gp_');

const optionCode = (value: ContextScalar | SimLabelled) => String(typeof value === 'object' ? value.code : value);

function counterTotal(value: ContextValue | undefined): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') return Object.values(value).reduce((a, b) => a + b, 0);
  return 0;
}

interface BuildArgs {
  engine: SimulatorEngine;
  scenario: WorkflowScenario;
  actions: ResolvedAction[];
  transitions: SimTransition[];
  history: ScenarioHistoryEntry[];
  defaults: HeaderDefaults;
  statusRenaming: Record<string, string>;
  /** Motif propre au dossier de démonstration chargé. */
  reason?: string;
  formatDate: (iso: string) => string;
  t: Translate;
}

export function buildHeaderModel({
  engine,
  scenario,
  actions,
  transitions,
  history,
  defaults,
  statusRenaming,
  reason,
  formatDate,
  t,
}: BuildArgs): HeaderModel {
  const { data } = engine;
  const { context, state, role } = scenario;
  const stateDef = engine.state(state);
  const label = engine.stateLabel(state);
  const key = normalizeText(label);
  const waiting = engine.waitingOn(state);
  const roleLabel = (code: string) => engine.roles.find(r => r.code === code)?.label ?? code;

  const has = (field: string) => field in data.context;
  const valueLabel = (field: string): string | null => {
    const value = context[field];
    const option = data.context[field]?.values?.find(o => optionCode(o) === String(value));
    if (option === undefined) return value === undefined ? null : String(value);
    return typeof option === 'object' ? option.label : String(option);
  };
  const isOff = (field: string) => {
    const value = context[field];
    if (value === undefined || value === false || value === 0 || value === '') return true;
    return ['none', 'no', 'non', 'aucun'].includes(normalizeText(String(value)));
  };

  // Pastille
  const toneFromWaiting = (): Tone => {
    if (!waiting.length) return 'neutral';
    if (waiting.includes('investor')) return 'info';
    if (waiting.some(isGpRole)) return 'warning';
    return 'caution';
  };
  const tone = TONE_BY_STATE_LABEL[key] ?? toneFromWaiting();
  const renamingOn = has('custom_status_renaming') && !isOff('custom_status_renaming');
  const renamed = renamingOn ? statusRenaming[label] : undefined;
  const status = {
    label: renamed ?? label,
    tone,
    cancelled: key === CANCELLED_LABEL,
    tooltip: renamed ? t(`${H}.renamedTooltip`, { state: label }) : undefined,
  };

  // Attente et action attendue
  const terminal = Boolean(stateDef?.terminal);
  const roleIsWaitedFor = waiting.includes(role) || (isGpRole(role) && waiting.some(isGpRole));
  const expectedAction =
    !terminal && roleIsWaitedFor ? actions.find(a => !a.disabled) ?? null : null;

  // Indicateurs secondaires
  const indicators: HeaderIndicator[] = [];
  const push = (indicator: HeaderIndicator) => indicators.push(indicator);
  if (has('self') && !isOff('self')) push({ id: 'self', label: t(`${H}.indicators.self`), tone: 'outline' });
  if (has('assisted') && !isOff('assisted')) push({ id: 'assisted', label: t(`${H}.indicators.assisted`), tone: 'outline' });
  const holdingKey = Object.keys(data.context).find(k => data.context[k].values?.some(v => optionCode(v) === 'pure'));
  if (holdingKey && context[holdingKey] !== undefined && context[holdingKey] !== 'pure') {
    push({
      id: 'administered',
      label: t(`${H}.indicators.administered`),
      tooltip: t(`${H}.indicators.holdingTooltip`, { mode: valueLabel(holdingKey) ?? '' }),
      tone: 'outline',
    });
  }
  if (has('deferred_processing') && !isOff('deferred_processing')) {
    push({
      id: 'deferred',
      label: defaults.deferred_until
        ? t(`${H}.indicators.deferredUntil`, { date: formatDate(defaults.deferred_until) })
        : t(`${H}.indicators.deferred`),
      tone: 'caution',
    });
  }
  if (has('transferred_in') && !isOff('transferred_in')) {
    push({
      id: 'transferredIn',
      label: t(`${H}.indicators.transferredIn`),
      tooltip: defaults.transfer_origin ? t(`${H}.indicators.transferOrigin`, { id: defaults.transfer_origin }) : undefined,
      link: defaults.transfer_origin,
      tone: 'outline',
    });
  }
  if (key === TRANSFERRED_LABEL && defaults.transferred) {
    push({
      id: 'transferred',
      label: t(`${H}.indicators.transferred`, {
        date: formatDate(defaults.transferred.date),
        author: defaults.transferred.author,
      }),
      tone: 'neutral',
    });
  }
  if (has('reduced_commitment') && !isOff('reduced_commitment')) {
    push({ id: 'reducedCommitment', label: t(`${H}.indicators.reducedCommitment`), tone: 'warning' });
  }
  if (has('sideletter') && !isOff('sideletter')) {
    const value = normalizeText(`${String(context.sideletter)} ${valueLabel('sideletter') ?? ''}`);
    const confirmed = value.includes('confirm');
    push({
      id: 'sideletter',
      label: t(`${H}.indicators.${confirmed ? 'sideletterConfirmed' : 'sideletterRequired'}`),
      tone: confirmed ? 'success' : 'warning',
    });
  }
  const reopened = context.reopened;
  if (has('reopened') && counterTotal(reopened) > 0) {
    const parts =
      reopened && typeof reopened === 'object'
        ? Object.entries(reopened)
            .filter(([, count]) => count > 0)
            .map(([who, count]) =>
              t(`${H}.indicators.reopenedBy`, {
                count,
                who: translateOr(t, `${H}.indicators.reopenedWho.${who}`, who),
              }),
            )
        : [t(`${H}.indicators.reopenedCount`, { count: counterTotal(reopened) })];
    push({
      id: 'reopened',
      label: t(`${H}.indicators.reopened`),
      tooltip: t(`${H}.indicators.reopenedTooltip`, { detail: parts.join(', ') }),
      tone: 'warning',
    });
  }
  if (has('exceptional_validation') && !isOff('exceptional_validation')) {
    push({ id: 'exceptionalValidation', label: t(`${H}.indicators.exceptionalValidation`), tone: 'strong' });
  }
  if (has('fast_add') && !isOff('fast_add')) push({ id: 'fastAdd', label: t(`${H}.indicators.fastAdd`), tone: 'outline' });
  if (has('sepa_mandate') && !isOff('sepa_mandate')) {
    push({ id: 'sepa', label: t(`${H}.indicators.sepa`, { status: valueLabel('sepa_mandate') ?? '' }), tone: 'outline' });
  }
  const pending = counterTotal(context.pending_changes);
  if (has('pending_changes') && pending > 0) {
    push({
      id: 'pendingChanges',
      label: t(`${H}.indicators.${pending === 1 ? 'pendingChangesOne' : 'pendingChangesMany'}`, { count: pending }),
      tone: 'warning',
    });
  }
  if (key.includes('pre-sign')) push({ id: 'presignature', label: t(`${H}.indicators.presignature`), tone: 'caution' });

  // Paiement direct : repéré sur le code ou le libellé du mode de paiement.
  const paymentDirect = /direct/.test(normalizeText(`${String(context.payment_mode ?? '')} ${valueLabel('payment_mode') ?? ''}`));
  if (paymentDirect && scenario.axes.payment && engine.allowedSubstates('payment', state, context).length) {
    const substate = (data.axes.payment?.substates ?? []).map(s => toLabelled(s)).find(s => s.code === scenario.axes.payment);
    push({ id: 'payment', label: t(`${H}.indicators.payment`, { status: substate?.label ?? scenario.axes.payment }), tone: 'info' });
  }

  // Bandeaux
  const banners: HeaderBanner[] = [];
  if (role === 'gp_readonly') banners.push({ kind: 'readOnly' });
  if (terminal && state !== 'active') {
    // L'entrée posée au chargement d'un dossier de démonstration n'a pas de date réelle.
    const entry = [...history].reverse().find(h => h.to === state && h.trigger !== 'demo_dossier');
    const info = defaults.terminal;
    const date = entry ? formatDate(entry.at) : info ? formatDate(info.date) : null;
    const why = (entry?.note ?? reason ?? info?.reason)?.replace(/\.$/, '');
    const back = transitions[0];
    const backAvailable = back ? actions.some(a => a.code === back.trigger && !a.disabled) || !back.trigger : false;
    banners.push({
      kind: 'terminal',
      tone,
      title: [
        t(`${H}.terminal.title`, { state: label.toLowerCase() }),
        date && t(`${H}.terminal.on`, { date }),
        info?.author && key !== 'expiree' && t(`${H}.terminal.by`, { author: info.author }),
      ]
        .filter(Boolean)
        .join(' ')
        .concat(why ? t(`${H}.terminal.reason`, { reason: why }) : '.'),
      description: back ? t(`${H}.terminal.canGoBack`, { state: engine.stateLabel(back.to) }) : undefined,
      action: back
        ? {
            label: back.trigger ? engine.actionLabel(back.trigger) : t(`${H}.terminal.goBack`),
            transition: back,
            disabledReason: backAvailable ? undefined : t(`${H}.terminal.notForRole`, { state: label }),
          }
        : undefined,
    });
  }
  const thirdParties = waiting.filter(code => code !== 'investor' && !isGpRole(code));
  if (!terminal && isGpRole(role) && thirdParties.length && !waiting.some(isGpRole)) {
    banners.push({ kind: 'external', who: thirdParties.map(roleLabel).join(', ') });
  }
  const decisionIds = new Set<string>();
  actions.forEach(a => a.decision && decisionIds.add(a.decision));
  data.decisions.forEach(d => {
    const states = d.states;
    if (Array.isArray(states) && states.includes(state)) decisionIds.add(d.id);
  });
  if (decisionIds.size) banners.push({ kind: 'hypothesis', ids: Array.from(decisionIds) });

  // Dates
  const activeEntry = [...history].reverse().find(h => h.to === 'active' && h.trigger !== 'demo_dossier');
  const activatedAt = state === 'active' ? activeEntry?.at ?? defaults.activated_at ?? null : null;
  const { sequence } = engine.sequenceOf(scenario.workflow);
  const index = sequence.indexOf(state);
  const skippedStates =
    has('fast_add') && !isOff('fast_add') ? sequence.slice(1, index < 0 ? sequence.length : index).map(engine.stateLabel) : [];

  return {
    status,
    waitingOn: waiting.map(roleLabel),
    expectedAction,
    indicators,
    banners,
    activatedAt,
    skippedStates,
    paymentDirect,
  };
}
