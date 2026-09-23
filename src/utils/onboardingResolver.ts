import {
  ONBOARDING_DOCUMENTS,
  ONBOARDING_SECTIONS,
  type Answer,
  type AudienceFilters,
  type DemoDossier,
  type DocumentDef,
  type QuestionDef,
  type QuestionType,
  type SectionDef,
  type TriggerCondition,
} from './onboardingQuestionnaire';

/**
 * Résolution du questionnaire pour un dossier : quelles questions sont posées,
 * pourquoi les autres ne le sont pas, et comment les questions se lient entre
 * elles. Tout est recalculé à chaque rendu, les modifications de l'opérateur
 * (réponses, saisies administrateur) sont donc prises en compte en direct.
 */

export type ReasonKind =
  | 'visibility'
  | 'distributorsOnly'
  | 'directOnly'
  | 'investorSegment'
  | 'partnerSegment'
  | 'participationSegment'
  | 'share'
  | 'condition'
  | 'kyc'
  | 'transfer'
  | 'secondary'
  | 'disabled'
  | 'sectionHidden'
  | 'outsideQuestionnaire'
  | 'orphanCondition'
  | 'externalCondition';

export interface HiddenReason {
  kind: ReasonKind;
  /** Clé i18n sous subscriptions.detail.onboarding.q.reason */
  textKey: string;
  vars: Record<string, string | number>;
  /** Valeurs attendues (jointes par "ou" au rendu). */
  expected?: string[];
  /** Réponse réellement donnée (jointe par ", " au rendu). */
  actual?: string[];
  /** Question vers laquelle la raison renvoie (réponse parente). */
  linkQuestionKey?: string;
  linkSectionId?: string;
  /** La condition dépend d'une saisie back-office. */
  adminNote?: boolean;
  /** Premier maillon non satisfait quand la question parente n'est pas posée. */
  rootReason?: HiddenReason;
}

export interface ChainLink {
  questionKey: string;
  questionId: string;
  label: string;
  sectionId: string;
  expected: string[];
  mode: 'in' | 'notIn';
  parentType: QuestionType;
  actual: string[];
  asked: boolean;
  satisfied: boolean;
  isAdmin: boolean;
  isComposite: boolean;
}

export interface RelationItem {
  key: string;
  id: string;
  label: string;
  sectionId?: string;
  expected?: string[];
  mode?: 'in' | 'notIn';
  triggeredHere: boolean;
  /** Complément affiché sous l'item (valeur posée, champ greffe...). */
  detail?: string;
}

export interface PrefillSource {
  questionKey: string;
  label: string;
  when?: string[];
  value?: string;
  copy: boolean;
  overwrite: boolean;
  produced: boolean;
  producedValue?: string;
}

export interface Upstream {
  /** Chaîne de conditions, du parent direct vers la racine. */
  conditionChain: ChainLink[];
  prefilledBy: PrefillSource[];
  registry?: { questionKey: string; label: string; field: string };
  insertedIn: RelationItem[];
  blockReferenceOf: Array<RelationItem & { blockKind: 'equals' | 'differs' | 'combined' | 'lifts' }>;
  externalOnboarding?: string;
  orphanParent?: string;
}

export interface Downstream {
  questions: RelationItem[];
  documents: RelationItem[];
  sections: RelationItem[];
  prefills: RelationItem[];
  registry: RelationItem[];
  composites: RelationItem[];
  blocks: Array<RelationItem & { blockKind: 'equals' | 'differs' | 'combined' | 'lifts' }>;
  contracts: string[];
  repeats?: number;
}

export type QuestionState =
  | 'answered'
  | 'toAnswer'
  | 'notAsked'
  | 'retained'
  | 'adminToFill'
  | 'adminFilled'
  | 'composite'
  | 'presentation';

export interface PrefillNote {
  kind: 'produced' | 'none' | 'manual';
  sourceLabel?: string;
  sourceValue?: string;
  initialValue?: string;
  sourceCount: number;
}

export interface ResolvedQuestion {
  key: string;
  id: string;
  def: QuestionDef;
  sectionId: string;
  iteration?: { index: number; total: number; parentKey: string; label: string };
  state: QuestionState;
  asked: boolean;
  answer: Answer | null;
  displayAnswer: string;
  hiddenReasons: HiddenReason[];
  mandatoryHere: boolean;
  mandatoryWaived: boolean;
  alert: boolean;
  blockingAnswer: boolean;
  blockLifted: boolean;
  counted: boolean;
  upstream: Upstream;
  downstream: Downstream;
  prefillNote?: PrefillNote;
  compositeValue?: string;
  compositeBranch?: 'when' | 'else' | 'fees' | 'insert';
  /** Sous-questions d'une sous-section répétée, une liste par itération. */
  iterations?: ResolvedQuestion[][];
}

export interface SectionCounters {
  asked: number;
  answered: number;
  adminTotal: number;
  adminFilled: number;
  notAsked: number;
  retained: number;
}

export interface ResolvedSection {
  def: SectionDef;
  id: string;
  asked: boolean;
  hiddenReasons: HiddenReason[];
  /** Condition qui affiche la section, quand elle en porte une. */
  conditionChain: ChainLink[];
  questions: ResolvedQuestion[];
  counters: SectionCounters;
}

export interface ResolvedDocument {
  key: string;
  def: DocumentDef;
  label: string;
  asked: boolean;
  hiddenReasons: HiddenReason[];
  conditionChain: ChainLink[];
  target?: { index: number; max: number };
  provided?: { dateSent: string; issueDate: string; expiration: string };
}

export interface ResolvedQuestionnaire {
  sections: ResolvedSection[];
  documents: ResolvedDocument[];
  byKey: Map<string, ResolvedQuestion>;
}

export interface ResolveInput {
  dossier: DemoDossier;
  /** Réponses courantes par clé (dossier + modifications de l'opérateur). */
  answers: Record<string, Answer>;
  /** Saisies administrateur modifiées à la main : valeur pré-remplie initiale par clé. */
  manualAdminEdits: Record<string, string>;
}

interface Entry {
  key: string;
  def: QuestionDef;
  sectionId: string;
  iteration?: { index: number; total: number; parentKey: string; label: string; innerId: string };
}

const isEmpty = (a: Answer | null | undefined) =>
  a === null || a === undefined || a === '' || (Array.isArray(a) && a.length === 0);

const toArray = (a: Answer | null | undefined): string[] =>
  isEmpty(a) ? [] : Array.isArray(a) ? (a as string[]) : [a as string];

const MULTI_TYPES: QuestionType[] = ['multiChoice', 'multiCountry', 'multiDropdown'];

export function conditionMet(
  parentType: QuestionType,
  actual: Answer | null | undefined,
  expected: string[],
  mode: 'in' | 'notIn' = 'in',
): boolean {
  if (parentType === 'checkbox') {
    const checked = actual === 'Oui';
    return expected.includes('Non') ? !checked : checked;
  }
  if (parentType === 'innerSection') {
    return Number(actual) > 0;
  }
  const values = toArray(actual);
  if (values.length === 0) return false;
  if (MULTI_TYPES.includes(parentType)) {
    return mode === 'notIn'
      ? values.some(v => !expected.includes(v))
      : values.some(v => expected.includes(v));
  }
  const value = values[0];
  return mode === 'notIn' ? !expected.includes(value) : expected.includes(value);
}

export function resolveQuestionnaire(input: ResolveInput): ResolvedQuestionnaire {
  const { dossier, answers, manualAdminEdits } = input;

  // ---- Index des questions, itérations développées
  const entries = new Map<string, Entry>();
  const sectionOf = new Map<string, SectionDef>();
  ONBOARDING_SECTIONS.forEach(section => {
    sectionOf.set(section.id, section);
    section.questions.forEach(def => {
      entries.set(def.id, { key: def.id, def, sectionId: section.id });
      if (def.type === 'innerSection' && def.subQuestions) {
        const total = Number(answers[def.id] ?? 0);
        for (let i = 1; i <= total; i += 1) {
          def.subQuestions.forEach(sub => {
            entries.set(`${sub.id}#${i}`, {
              key: `${sub.id}#${i}`,
              def: sub,
              sectionId: section.id,
              iteration: { index: i, total, parentKey: def.id, label: def.subSectionLabel ?? def.label, innerId: def.id },
            });
          });
        }
      }
    });
  });

  const getAnswer = (key: string): Answer | null => {
    if (answers[key] !== undefined) return answers[key];
    const entry = entries.get(key);
    if (entry?.iteration) {
      const record = dossier.iterations[entry.iteration.innerId]?.[entry.iteration.index - 1];
      const v = record?.[entry.def.id];
      return v === undefined ? null : v;
    }
    return null;
  };

  // Valeur produite par un champ composé (les autres questions renvoient leur réponse)
  const compositeValueOf = (entry: Entry): string | null => {
    const comp = entry.def.composite;
    if (!comp) return null;
    if (comp.kind === 'fees') {
      if (!dossier.fees) return null;
      return comp.template
        .replace('[ifhasfees]', '')
        .replace('[fees_amount]', dossier.fees.amount)
        .replace('[fees_pct]', dossier.fees.pct);
    }
    if (comp.kind === 'insert') {
      const parts = (comp.insertIds ?? [])
        .map(id => (questionReasons(id).length === 0 ? toArray(getAnswer(id)).join(', ') : ''))
        .filter(Boolean);
      return parts.length ? parts.join(' ') : null;
    }
    if (comp.kind === 'trigger' && comp.trigger) {
      const source = entries.get(comp.trigger.parentId);
      const met = source
        ? questionReasons(source.key).length === 0 && conditionMet(source.def.type, effectiveAnswer(source), comp.trigger.expected, comp.trigger.mode)
        : false;
      return (met ? comp.whenValue : comp.elseValue) ?? null;
    }
    return null;
  };

  const effectiveAnswer = (entry: Entry): Answer | null =>
    entry.def.composite ? compositeValueOf(entry) : getAnswer(entry.key);

  const resolveParentKey = (entry: Entry, parentId: string): string => {
    if (entry.iteration && entries.has(`${parentId}#${entry.iteration.index}`)) {
      return `${parentId}#${entry.iteration.index}`;
    }
    return parentId;
  };

  // ---- Filtres de public (ordre du tableau des raisons)
  const audienceReasons = (filters: AudienceFilters): HiddenReason[] => {
    const reasons: HiddenReason[] = [];
    const name = dossier.subscriberFirstName;
    if (filters.visibility === 'corporate' && dossier.subscriberType !== 'corporate') {
      reasons.push({ kind: 'visibility', textKey: 'visibilityCorporateOnly', vars: {} });
    }
    if (filters.visibility === 'individual' && dossier.subscriberType !== 'individual') {
      reasons.push({ kind: 'visibility', textKey: 'visibilityIndividualOnly', vars: {} });
    }
    if (filters.distributorOnly && !dossier.assisted) {
      reasons.push({ kind: 'distributorsOnly', textKey: 'distributorsOnly', vars: {} });
    }
    if (filters.directOnly && dossier.assisted) {
      reasons.push({ kind: 'directOnly', textKey: 'directOnly', vars: { distributor: dossier.distributorName ?? '' } });
    }
    if (filters.investorSegments?.length && !filters.investorSegments.some(s => dossier.investorSegments.includes(s))) {
      reasons.push(
        dossier.investorSegments.length === 0
          ? { kind: 'investorSegment', textKey: 'investorSegmentNone', vars: { name }, expected: filters.investorSegments }
          : { kind: 'investorSegment', textKey: 'investorSegmentOther', vars: { name }, expected: filters.investorSegments, actual: dossier.investorSegments },
      );
    }
    if (filters.investorSegmentsExcluded?.some(s => dossier.investorSegments.includes(s))) {
      reasons.push({
        kind: 'investorSegment',
        textKey: 'investorSegmentExcluded',
        vars: {},
        expected: filters.investorSegmentsExcluded.filter(s => dossier.investorSegments.includes(s)),
      });
    }
    if (filters.partnerSegments?.length && !(dossier.distributorSegment && filters.partnerSegments.includes(dossier.distributorSegment))) {
      reasons.push(
        dossier.assisted
          ? { kind: 'partnerSegment', textKey: 'partnerSegmentOther', vars: { distributor: dossier.distributorName ?? '' }, expected: filters.partnerSegments, actual: [dossier.distributorSegment ?? ''] }
          : { kind: 'partnerSegment', textKey: 'partnerSegmentDirect', vars: {}, expected: filters.partnerSegments },
      );
    }
    if (filters.partnerSegmentsExcluded?.length && dossier.distributorSegment && filters.partnerSegmentsExcluded.includes(dossier.distributorSegment)) {
      reasons.push({ kind: 'partnerSegment', textKey: 'partnerSegmentExcluded', vars: { distributor: dossier.distributorName ?? '' }, expected: [dossier.distributorSegment] });
    }
    if (filters.participationSegments?.length && !filters.participationSegments.some(s => dossier.participationSegments.includes(s))) {
      reasons.push({ kind: 'participationSegment', textKey: 'participationSegmentOnly', vars: {}, expected: filters.participationSegments });
    }
    if (filters.participationSegmentsExcluded?.some(s => dossier.participationSegments.includes(s))) {
      reasons.push({
        kind: 'participationSegment',
        textKey: 'participationSegmentExcluded',
        vars: {},
        expected: filters.participationSegmentsExcluded.filter(s => dossier.participationSegments.includes(s)),
      });
    }
    if (filters.shares?.length && !filters.shares.includes(dossier.share)) {
      reasons.push({ kind: 'share', textKey: 'share', vars: { actual: dossier.share }, expected: filters.shares });
    }
    return reasons;
  };

  const contextReasons = (filters: AudienceFilters): HiddenReason[] => {
    const reasons: HiddenReason[] = [];
    if (filters.kyc === 'refresh' && dossier.kycContext !== 'refresh') reasons.push({ kind: 'kyc', textKey: 'kycRefreshOnly', vars: {} });
    if (filters.kyc === 'first' && dossier.kycContext !== 'first') reasons.push({ kind: 'kyc', textKey: 'kycFirstOnly', vars: {} });
    if (filters.transfer === 'transfer' && !dossier.transfer) reasons.push({ kind: 'transfer', textKey: 'transferOnly', vars: {} });
    if (filters.transfer === 'original' && dossier.transfer) reasons.push({ kind: 'transfer', textKey: 'transferOriginalOnly', vars: {} });
    if (filters.secondary === 'secondary' && !dossier.secondary) reasons.push({ kind: 'secondary', textKey: 'secondaryOnly', vars: {} });
    if (filters.secondary === 'original' && dossier.secondary) reasons.push({ kind: 'secondary', textKey: 'secondaryOriginalOnly', vars: {} });
    return reasons;
  };

  // ---- Évaluation "posée ?" avec mémo, conditions résolues récursivement
  const askedMemo = new Map<string, HiddenReason[]>();
  const sectionMemo = new Map<string, HiddenReason[]>();

  const buildLink = (parentKey: string, parent: Entry, trigger: TriggerCondition): ChainLink => {
    const parentReasons = questionReasons(parentKey);
    const actual = toArray(effectiveAnswer(parent));
    return {
      questionKey: parentKey,
      questionId: parent.def.id,
      label: parent.def.label,
      sectionId: parent.sectionId,
      expected: trigger.expected,
      mode: trigger.mode ?? 'in',
      parentType: parent.def.type,
      actual,
      asked: parentReasons.length === 0,
      satisfied: parentReasons.length === 0 && conditionMet(parent.def.type, effectiveAnswer(parent), trigger.expected, trigger.mode),
      isAdmin: parent.def.type === 'adminInput',
      isComposite: parent.def.type === 'composite',
    };
  };

  const compositeExplanation = (parent: Entry): { source: string; value: string; sourceAsked: boolean } | null => {
    const comp = parent.def.composite;
    if (!comp || comp.kind !== 'trigger' || !comp.trigger) return null;
    const source = entries.get(comp.trigger.parentId);
    if (!source) return null;
    const sourceAsked = questionReasons(source.key).length === 0;
    return { source: source.def.label, value: toArray(getAnswer(source.key)).join(', '), sourceAsked };
  };

  const triggerReason = (entry: Entry | null, trigger: TriggerCondition, ownerSectionId: string): HiddenReason | null => {
    const parentKey = entry ? resolveParentKey(entry, trigger.parentId) : trigger.parentId;
    const parent = entries.get(parentKey);
    if (!parent) {
      return { kind: 'orphanCondition', textKey: 'orphanCondition', vars: { parent: trigger.parentId } };
    }
    const link = buildLink(parentKey, parent, trigger);
    const base = {
      kind: 'condition' as const,
      vars: { parent: parent.def.label },
      expected: trigger.expected,
      actual: link.actual,
      linkQuestionKey: parentKey,
      linkSectionId: parent.sectionId !== ownerSectionId ? parent.sectionId : undefined,
      adminNote: link.isAdmin,
    };
    if (!link.asked) {
      const parentReasons = questionReasons(parentKey);
      return { ...base, textKey: 'conditionParentNotAsked', rootReason: parentReasons[0] };
    }
    if (link.satisfied) return null;
    if (link.isComposite) {
      const because = compositeExplanation(parent);
      const hasSourceValue = !!because && because.sourceAsked && because.value !== '';
      return {
        ...base,
        textKey: hasSourceValue ? 'conditionComposite' : 'conditionCompositeNoSource',
        vars: { ...base.vars, source: because?.source ?? '', sourceValue: because?.value ?? '' },
        linkQuestionKey: because?.sourceAsked ? base.linkQuestionKey : parentKey,
      };
    }
    if (link.actual.length === 0 && parent.def.type !== 'checkbox') {
      return { ...base, textKey: 'conditionParentUnanswered' };
    }
    if (parent.def.type === 'checkbox') {
      return { ...base, textKey: trigger.expected.includes('Non') ? 'conditionUnchecked' : 'conditionChecked' };
    }
    if (parent.def.type === 'innerSection') {
      return { ...base, textKey: 'conditionIterationMissing' };
    }
    if (trigger.mode === 'notIn') return { ...base, textKey: 'conditionNotIn' };
    if (MULTI_TYPES.includes(parent.def.type)) return { ...base, textKey: 'conditionAnyOf' };
    if (entry?.iteration) return { ...base, textKey: 'conditionIteration' };
    return { ...base, textKey: 'conditionEquals' };
  };

  function sectionReasons(sectionId: string): HiddenReason[] {
    const memo = sectionMemo.get(sectionId);
    if (memo) return memo;
    const section = sectionOf.get(sectionId);
    if (!section) return [];
    sectionMemo.set(sectionId, []);
    const reasons = [...audienceReasons(section)];
    if (section.trigger) {
      const r = triggerReason(null, section.trigger, sectionId);
      if (r) reasons.push(r);
    }
    reasons.push(...contextReasons(section));
    sectionMemo.set(sectionId, reasons);
    return reasons;
  }

  function questionReasons(key: string): HiddenReason[] {
    const memo = askedMemo.get(key);
    if (memo) return memo;
    const entry = entries.get(key);
    if (!entry) return [];
    askedMemo.set(key, []);
    const { def } = entry;
    const reasons: HiddenReason[] = [];

    const secReasons = sectionReasons(entry.sectionId);
    if (secReasons.length > 0) {
      const section = sectionOf.get(entry.sectionId);
      reasons.push({
        kind: 'sectionHidden',
        textKey: 'sectionHidden',
        vars: { sectionKey: section?.titleKey ?? '' },
        linkSectionId: entry.sectionId,
        rootReason: secReasons[0],
      });
    }

    reasons.push(...audienceReasons(def));

    if (def.trigger) {
      const r = triggerReason(entry, def.trigger, entry.sectionId);
      if (r) reasons.push(r);
    }
    if (def.orphanTrigger) {
      reasons.push({ kind: 'orphanCondition', textKey: 'orphanCondition', vars: { parent: def.orphanTrigger } });
    }
    if (def.externalOnboardingTrigger) {
      reasons.push({ kind: 'externalCondition', textKey: 'externalCondition', vars: { onboarding: def.externalOnboardingTrigger } });
    }

    reasons.push(...contextReasons(def));

    if (def.disabled) reasons.push({ kind: 'disabled', textKey: 'disabled', vars: {} });

    if (def.composite?.kind === 'fees' && !dossier.fees) {
      reasons.push({ kind: 'outsideQuestionnaire', textKey: 'noFees', vars: {} });
    }
    if (def.composite?.kind === 'insert') {
      const ids = def.composite.insertIds ?? [];
      const filled = ids.filter(id => questionReasons(id).length === 0 && !isEmpty(getAnswer(id)));
      if (filled.length === 0) {
        reasons.push({ kind: 'outsideQuestionnaire', textKey: 'noInsertedAnswer', vars: { count: ids.length } });
      }
    }

    askedMemo.set(key, reasons);
    return reasons;
  }

  // ---- Chaîne de conditions vers la racine
  const conditionChain = (entry: Entry | null, trigger: TriggerCondition | undefined): ChainLink[] => {
    const chain: ChainLink[] = [];
    let currentEntry = entry;
    let currentTrigger = trigger;
    let guard = 0;
    while (currentTrigger && guard < 8) {
      const parentKey = currentEntry ? resolveParentKey(currentEntry, currentTrigger.parentId) : currentTrigger.parentId;
      const parent = entries.get(parentKey);
      if (!parent) break;
      chain.push(buildLink(parentKey, parent, currentTrigger));
      currentEntry = parent;
      currentTrigger = parent.def.trigger ?? parent.def.composite?.trigger;
      guard += 1;
    }
    return chain;
  };

  // ---- Pré-remplissage
  const prefillSources = (targetId: string): PrefillSource[] => {
    const sources: PrefillSource[] = [];
    entries.forEach(source => {
      if (source.iteration) return;
      source.def.answerTriggers?.forEach(at => {
        if (at.targetId !== targetId) return;
        const sourceAnswer = getAnswer(source.key);
        const sourceAsked = questionReasons(source.key).length === 0;
        const matches = !isEmpty(sourceAnswer) && (!at.when || toArray(sourceAnswer).some(v => at.when!.includes(v)));
        const produced = sourceAsked && matches;
        sources.push({
          questionKey: source.key,
          label: source.def.label,
          when: at.when,
          value: at.value,
          copy: at.value === undefined,
          overwrite: at.overwrite,
          produced,
          producedValue: produced ? (at.value ?? toArray(sourceAnswer).join(', ')) : undefined,
        });
      });
    });
    return sources;
  };

  const registrySource = (): Entry | undefined => {
    let found: Entry | undefined;
    entries.forEach(e => {
      if (e.def.registryTrigger) found = e;
    });
    return found;
  };

  // ---- Blocages
  const blockState = (entry: Entry): { blockingAnswer: boolean; blockLifted: boolean } => {
    const block = entry.def.block;
    if (!block) return { blockingAnswer: false, blockLifted: false };
    const answer = getAnswer(entry.key);
    const values = toArray(answer);
    let lifted = false;
    if (block.liftedBy) {
      const other = getAnswer(block.liftedBy.questionId);
      lifted = toArray(other).includes(block.liftedBy.value);
    }
    let blocking = false;
    if (block.whenValues && values.some(v => block.whenValues!.includes(v))) blocking = !lifted;
    if (block.equalsTo) {
      const ref = toArray(getAnswer(resolveParentKey(entry, block.equalsTo)));
      if (values.length && ref.length && values.join('|') !== ref.join('|')) blocking = true;
    }
    if (block.differsFrom) {
      const ref = toArray(getAnswer(resolveParentKey(entry, block.differsFrom)));
      if (values.length && ref.length && values.join('|') === ref.join('|')) blocking = true;
    }
    if (block.combined) {
      const other = toArray(getAnswer(block.combined.otherId));
      if (values.includes(block.combined.value) && other.includes(block.combined.otherValue)) blocking = true;
    }
    return { blockingAnswer: blocking, blockLifted: lifted };
  };

  // ---- Résolution d'une question
  const resolveEntry = (entry: Entry): ResolvedQuestion => {
    const { def, key } = entry;
    const reasons = questionReasons(key);
    const asked = reasons.length === 0;
    const nature = def.nature ?? 'question';
    const rawAnswer = getAnswer(key);
    const retained = !asked && dossier.retainedAnswers[def.id] !== undefined && !entry.iteration
      ? dossier.retainedAnswers[def.id]
      : null;
    const answer = asked ? rawAnswer : retained;

    // Champ composé : valeur calculée
    let compositeValue: string | undefined;
    let compositeBranch: ResolvedQuestion['compositeBranch'];
    if (def.composite) {
      const value = compositeValueOf(entry);
      compositeValue = value ?? undefined;
      const comp = def.composite;
      if (comp.kind === 'fees') compositeBranch = 'fees';
      if (comp.kind === 'insert') compositeBranch = 'insert';
      if (comp.kind === 'trigger') compositeBranch = value === comp.whenValue ? 'when' : 'else';
    }

    // État
    let state: QuestionState;
    if (!asked) state = retained !== null ? 'retained' : 'notAsked';
    else if (nature === 'presentation') state = 'presentation';
    else if (nature === 'composite') state = 'composite';
    else if (nature === 'admin') state = isEmpty(rawAnswer) ? 'adminToFill' : 'adminFilled';
    else state = isEmpty(rawAnswer) ? 'toAnswer' : 'answered';

    const effectiveAnswer = def.composite ? compositeValue ?? null : answer;
    const displayAnswer = toArray(effectiveAnswer).join(', ');

    // Obligatoire
    const mandatoryWaived = def.mandatory === 'firstSubscription' && !dossier.firstSubscription;
    const mandatoryHere = def.mandatory === true || (def.mandatory === 'firstSubscription' && dossier.firstSubscription);

    // Alerte et blocage
    const alert = asked && !!def.alertWhen && toArray(rawAnswer).some(v => def.alertWhen!.includes(v));
    const { blockingAnswer, blockLifted } = asked ? blockState(entry) : { blockingAnswer: false, blockLifted: false };

    // Amont
    const prefilledBy = entry.iteration ? [] : prefillSources(def.id);
    const registry = registrySource();
    const upstream: Upstream = {
      conditionChain: conditionChain(entry, def.trigger ?? def.composite?.trigger),
      prefilledBy,
      registry: def.registryField && registry ? { questionKey: registry.key, label: registry.def.label, field: def.registryField } : undefined,
      insertedIn: [],
      blockReferenceOf: [],
      externalOnboarding: def.externalOnboardingTrigger,
      orphanParent: def.orphanTrigger,
    };
    entries.forEach(other => {
      if (other.iteration) return;
      if (other.def.composite?.insertIds?.includes(def.id)) {
        upstream.insertedIn.push({ key: other.key, id: other.def.id, label: other.def.label, sectionId: other.sectionId, triggeredHere: questionReasons(other.key).length === 0 });
      }
      const b = other.def.block;
      if (!b) return;
      const item = { key: other.key, id: other.def.id, label: other.def.label, sectionId: other.sectionId, triggeredHere: questionReasons(other.key).length === 0 };
      if (b.equalsTo === def.id) upstream.blockReferenceOf.push({ ...item, blockKind: 'equals' });
      if (b.differsFrom === def.id) upstream.blockReferenceOf.push({ ...item, blockKind: 'differs' });
      if (b.combined?.otherId === def.id) upstream.blockReferenceOf.push({ ...item, blockKind: 'combined' });
      if (b.liftedBy?.questionId === def.id) upstream.blockReferenceOf.push({ ...item, blockKind: 'lifts' });
    });

    // Note de pré-remplissage (saisies administrateur et cibles de déclenchement)
    let prefillNote: PrefillNote | undefined;
    if (prefilledBy.length > 0) {
      const manualInitial = manualAdminEdits[key];
      const produced = prefilledBy.find(s => s.produced);
      if (manualInitial !== undefined) {
        prefillNote = { kind: 'manual', initialValue: manualInitial, sourceCount: prefilledBy.length };
      } else if (produced) {
        prefillNote = { kind: 'produced', sourceLabel: produced.label, sourceValue: toArray(getAnswer(produced.questionKey)).join(', '), sourceCount: prefilledBy.length };
      } else {
        prefillNote = { kind: 'none', sourceCount: prefilledBy.length };
      }
    }

    // Aval
    const downstream: Downstream = {
      questions: [],
      documents: [],
      sections: [],
      prefills: [],
      registry: [],
      composites: [],
      blocks: [],
      contracts: def.contracts ?? [],
    };
    entries.forEach(other => {
      const otherTrigger = other.def.trigger ?? other.def.composite?.trigger;
      if (!otherTrigger || otherTrigger.parentId !== def.id) return;
      // Sous-question conditionnée par une sous-question : même itération seulement
      if (entry.iteration && other.iteration && other.iteration.index !== entry.iteration.index) return;
      if (entry.iteration && !other.iteration) return;
      const item: RelationItem = {
        key: other.key,
        id: other.def.id,
        label: other.def.label,
        sectionId: other.sectionId,
        expected: otherTrigger.expected,
        mode: otherTrigger.mode ?? 'in',
        triggeredHere: questionReasons(other.key).length === 0,
      };
      if (other.def.composite) downstream.composites.push(item);
      else downstream.questions.push(item);
    });
    ONBOARDING_SECTIONS.forEach(section => {
      if (section.trigger?.parentId !== def.id) return;
      downstream.sections.push({
        key: section.id,
        id: section.id,
        label: section.titleKey,
        sectionId: section.id,
        expected: section.trigger.expected,
        mode: section.trigger.mode ?? 'in',
        triggeredHere: sectionReasons(section.id).length === 0,
      });
    });
    ONBOARDING_DOCUMENTS.forEach(doc => {
      if (doc.trigger?.parentId === def.id) {
        const docReasons = documentReasons(doc);
        downstream.documents.push({
          key: doc.id,
          id: doc.id,
          label: doc.label,
          expected: doc.trigger.expected,
          mode: doc.trigger.mode ?? 'in',
          triggeredHere: docReasons.length === 0,
        });
      }
      if (doc.innerSectionId === def.id) {
        const count = Number(rawAnswer ?? 0);
        downstream.documents.push({
          key: doc.id,
          id: doc.id,
          label: doc.label,
          triggeredHere: count > 0,
          detail: `${Math.min(count, doc.maxTargets ?? count)}/${doc.maxTargets ?? count}`,
        });
      }
    });
    def.answerTriggers?.forEach(at => {
      const target = entries.get(at.targetId);
      if (!target) return;
      const sourceAnswer = getAnswer(key);
      const produced = asked && !isEmpty(sourceAnswer) && (!at.when || toArray(sourceAnswer).some(v => at.when!.includes(v)));
      downstream.prefills.push({
        key: target.key,
        id: target.def.id,
        label: target.def.label,
        sectionId: target.sectionId,
        expected: at.when,
        triggeredHere: produced,
        detail: at.value ?? undefined,
      });
    });
    if (def.registryTrigger) {
      entries.forEach(other => {
        if (other.def.registryField && !other.iteration) {
          downstream.registry.push({ key: other.key, id: other.def.id, label: other.def.label, sectionId: other.sectionId, triggeredHere: !isEmpty(getAnswer(other.key)), detail: other.def.registryField });
        }
      });
    }
    entries.forEach(other => {
      if (other.iteration) return;
      const b = other.def.block;
      if (!b) return;
      const item = { key: other.key, id: other.def.id, label: other.def.label, sectionId: other.sectionId, triggeredHere: questionReasons(other.key).length === 0 };
      if (b.equalsTo === def.id) downstream.blocks.push({ ...item, blockKind: 'equals' });
      if (b.differsFrom === def.id) downstream.blocks.push({ ...item, blockKind: 'differs' });
      if (b.combined?.otherId === def.id) downstream.blocks.push({ ...item, blockKind: 'combined' });
      if (b.liftedBy?.questionId === def.id) downstream.blocks.push({ ...item, blockKind: 'lifts' });
    });
    if (def.type === 'innerSection') downstream.repeats = Number(rawAnswer ?? 0);

    const counted = asked && nature === 'question';

    const resolved: ResolvedQuestion = {
      key,
      id: def.id,
      def,
      sectionId: entry.sectionId,
      iteration: entry.iteration
        ? { index: entry.iteration.index, total: entry.iteration.total, parentKey: entry.iteration.parentKey, label: entry.iteration.label }
        : undefined,
      state,
      asked,
      answer: effectiveAnswer,
      displayAnswer,
      hiddenReasons: reasons,
      mandatoryHere,
      mandatoryWaived,
      alert,
      blockingAnswer,
      blockLifted,
      counted,
      upstream,
      downstream,
      prefillNote,
      compositeValue,
      compositeBranch,
    };

    if (def.type === 'innerSection' && def.subQuestions && asked) {
      const total = Number(rawAnswer ?? 0);
      resolved.iterations = [];
      for (let i = 1; i <= total; i += 1) {
        resolved.iterations.push(
          def.subQuestions.map(sub => resolveEntry(entries.get(`${sub.id}#${i}`)!)),
        );
      }
    }
    return resolved;
  };

  // ---- Documents
  function documentReasons(doc: DocumentDef): HiddenReason[] {
    const reasons = [...audienceReasons(doc)];
    if (doc.trigger) {
      const r = triggerReason(null, doc.trigger, 'documents');
      if (r) reasons.push(r);
    }
    reasons.push(...contextReasons(doc));
    return reasons;
  }

  const documents: ResolvedDocument[] = [];
  ONBOARDING_DOCUMENTS.forEach(doc => {
    const baseReasons = documentReasons(doc);
    if (doc.innerSectionId) {
      const inner = entries.get(doc.innerSectionId);
      const innerAsked = inner ? questionReasons(inner.key).length === 0 : false;
      const count = innerAsked ? Number(getAnswer(doc.innerSectionId) ?? 0) : 0;
      const max = doc.maxTargets ?? Math.max(count, 1);
      for (let i = 1; i <= max; i += 1) {
        const reasons = [...baseReasons];
        if (i > count) {
          reasons.push({
            kind: 'condition',
            textKey: 'documentTargetNotDeclared',
            vars: { count, index: i },
            linkQuestionKey: inner?.key,
            linkSectionId: inner?.sectionId,
          });
        }
        documents.push({
          key: `${doc.id}#${i}`,
          def: doc,
          label: doc.label,
          asked: reasons.length === 0,
          hiddenReasons: reasons,
          conditionChain: inner ? [buildLink(inner.key, inner, { parentId: inner.def.id, expected: [] })] : [],
          target: { index: i, max },
          provided: dossier.providedDocuments[`${doc.id}#${i}`],
        });
      }
      return;
    }
    documents.push({
      key: doc.id,
      def: doc,
      label: doc.label,
      asked: baseReasons.length === 0,
      hiddenReasons: baseReasons,
      conditionChain: conditionChain(null, doc.trigger),
      provided: dossier.providedDocuments[doc.id],
    });
  });

  // ---- Sections
  const byKey = new Map<string, ResolvedQuestion>();
  const sections: ResolvedSection[] = ONBOARDING_SECTIONS.map(section => {
    const reasons = sectionReasons(section.id);
    const questions = section.questions.map(def => resolveEntry(entries.get(def.id)!));
    const counters: SectionCounters = { asked: 0, answered: 0, adminTotal: 0, adminFilled: 0, notAsked: 0, retained: 0 };
    const visit = (q: ResolvedQuestion) => {
      byKey.set(q.key, q);
      if (q.state === 'notAsked') counters.notAsked += 1;
      if (q.state === 'retained') counters.retained += 1;
      if (q.state === 'adminToFill' || q.state === 'adminFilled') {
        counters.adminTotal += 1;
        if (q.state === 'adminFilled') counters.adminFilled += 1;
      }
      if (q.counted && q.def.type !== 'innerSection') {
        counters.asked += 1;
        if (q.state === 'answered') counters.answered += 1;
      }
      q.iterations?.forEach(list => list.forEach(visit));
    };
    questions.forEach(visit);
    return {
      def: section,
      id: section.id,
      asked: reasons.length === 0,
      hiddenReasons: reasons,
      conditionChain: conditionChain(null, section.trigger),
      questions,
      counters,
    };
  });

  return { sections, documents, byKey };
}

/** Réponses initiales d'un dossier, clés de sous-questions incluses, pour alimenter l'état local. */
export function initialAnswers(dossier: DemoDossier): Record<string, Answer> {
  const result: Record<string, Answer> = { ...dossier.answers };
  Object.entries(dossier.iterations).forEach(([innerId, records]) => {
    records.forEach((record, idx) => {
      Object.entries(record).forEach(([subId, value]) => {
        result[`${subId}#${idx + 1}`] = value;
      });
    });
    if (result[innerId] === undefined) result[innerId] = String(records.length);
  });
  return result;
}
