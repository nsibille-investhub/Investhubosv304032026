import React, { Fragment, forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  CornerDownRight,
  Database,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  GitBranch,
  History,
  Info,
  Landmark,
  Link2,
  ListTree,
  Lock,
  Pencil,
  Repeat,
  ScrollText,
  Sigma,
  SlidersHorizontal,
  Upload,
  UserCog,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import {
  DEMO_DOSSIERS,
  defaultDossierFor,
  type Answer,
  type DemoDossier,
  type QuestionType,
} from '../utils/onboardingQuestionnaire';
import {
  initialAnswers,
  resolveQuestionnaire,
  type ChainLink,
  type HiddenReason,
  type RelationItem,
  type ResolvedDocument,
  type ResolvedQuestion,
  type ResolvedQuestionnaire,
  type ResolvedSection,
} from '../utils/onboardingResolver';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
import { QuestionActions, type QuestionStatus } from './QuestionActions';
import { QuestionCommentThread } from './QuestionCommentThread';
import {
  OnboardingStateCounter,
  addToBucketStats,
  emptyBucketStats,
  type OnboardingBucketStats,
  type OnboardingItemState,
  type OnboardingNavSection,
} from './OnboardingCompletionOverview';

const K = 'subscriptions.detail.onboarding.q';

const TYPE_LABEL_KEYS: Record<QuestionType, string> = {
  singleChoice: `${K}.type.singleChoice`,
  dropdown: `${K}.type.dropdown`,
  multiDropdown: `${K}.type.multiDropdown`,
  multiChoice: `${K}.type.multiChoice`,
  checkbox: `${K}.type.checkbox`,
  openText: `${K}.type.openText`,
  country: `${K}.type.country`,
  multiCountry: `${K}.type.multiCountry`,
  date: `${K}.type.date`,
  amount: `${K}.type.amount`,
  percentage: `${K}.type.percentage`,
  comments: `${K}.type.comments`,
  adminInput: `${K}.type.adminInput`,
  composite: `${K}.type.composite`,
  innerSection: `${K}.type.innerSection`,
  title: `${K}.type.title`,
  text: `${K}.type.text`,
};

// Etat de départ de la maquette : quelques réponses déjà vérifiées ou retoquées.
const INITIAL_STATUSES: Record<string, QuestionStatus> = {
  'A:id.civility': 'approved',
  'A:id.lastName': 'approved',
  'A:id.firstName': 'approved',
  'A:id.country': 'approved',
  'A:bank.iban': 'rejected',
  'B:corp.siren': 'approved',
  'B:corp.name': 'approved',
  'C:fiscal.tin': 'rejected',
};

const INITIAL_DOCUMENT_STATUSES: Record<string, QuestionStatus> = {
  'A:doc.id': 'approved',
  'C:doc.w9': 'rejected',
};

// ---------------------------------------------------------------------------
// Hook : état du questionnaire pour la page de détail
// ---------------------------------------------------------------------------

export function useOnboardingQuestionnaire(subscription: any) {
  const [dossierId, setDossierId] = useState<DemoDossier['id']>(
    defaultDossierFor(subscription?.contrepartie?.type ?? subscription?.investorType),
  );
  const dossier = DEMO_DOSSIERS.find(d => d.id === dossierId) ?? DEMO_DOSSIERS[0];

  const [answersByDossier, setAnswersByDossier] = useState<Record<string, Record<string, Answer>>>(() =>
    Object.fromEntries(DEMO_DOSSIERS.map(d => [d.id, initialAnswers(d)])),
  );
  const [manualEdits, setManualEdits] = useState<Record<string, Record<string, string>>>({});
  const [statuses, setStatuses] = useState<Record<string, QuestionStatus>>(INITIAL_STATUSES);
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, QuestionStatus>>(INITIAL_DOCUMENT_STATUSES);
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [activeCommentThread, setActiveCommentThread] = useState<string | null>(null);

  const [openSections, setOpenSections] = useState<string[]>(['bank']);
  const [activeSectionId, setActiveSectionId] = useState<string>('bank');
  const [notAskedVisible, setNotAskedVisible] = useState<Record<string, boolean>>({});
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
  }, []);

  const answers = answersByDossier[dossierId];
  const resolved: ResolvedQuestionnaire = useMemo(
    () => resolveQuestionnaire({ dossier, answers, manualAdminEdits: manualEdits[dossierId] ?? {} }),
    [dossier, answers, manualEdits, dossierId],
  );

  const scoped = (key: string) => `${dossierId}:${key}`;
  const statusOf = (key: string): QuestionStatus => statuses[scoped(key)] ?? 'pending';
  const documentStatusOf = (key: string): QuestionStatus => documentStatuses[scoped(key)] ?? 'pending';

  const questionItemState = (q: ResolvedQuestion): OnboardingItemState => {
    const status = statusOf(q.key);
    if (status === 'approved') return 'validated';
    if (status === 'rejected') return 'awaitingCorrection';
    return q.state === 'answered' ? 'awaitingValidation' : 'pending';
  };
  const documentItemState = (d: ResolvedDocument): OnboardingItemState => {
    const status = documentStatusOf(d.key);
    if (status === 'approved') return 'validated';
    if (status === 'rejected') return 'awaitingCorrection';
    return d.provided ? 'awaitingValidation' : 'pending';
  };

  const countedQuestions = (section: ResolvedSection): ResolvedQuestion[] => {
    const list: ResolvedQuestion[] = [];
    const visit = (q: ResolvedQuestion) => {
      if (q.counted && q.def.type !== 'innerSection') list.push(q);
      q.iterations?.forEach(it => it.forEach(visit));
    };
    section.questions.forEach(visit);
    return list;
  };

  const sectionBuckets = (section: ResolvedSection): OnboardingBucketStats => {
    const stats = emptyBucketStats();
    countedQuestions(section).forEach(q => addToBucketStats(stats, questionItemState(q)));
    return stats;
  };
  const documentBuckets: OnboardingBucketStats = useMemo(() => {
    const stats = emptyBucketStats();
    resolved.documents.filter(d => d.asked).forEach(d => addToBucketStats(stats, documentItemState(d)));
    return stats;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved, documentStatuses, dossierId]);
  const questionBuckets: OnboardingBucketStats = useMemo(() => {
    const stats = emptyBucketStats();
    resolved.sections.forEach(section => {
      if (!section.asked) return;
      countedQuestions(section).forEach(q => addToBucketStats(stats, questionItemState(q)));
    });
    return stats;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved, statuses, dossierId]);

  const navSections: OnboardingNavSection[] = [
    ...resolved.sections
      .filter(s => s.asked)
      .map((s, idx) => ({
        id: s.id,
        titleKey: s.def.titleKey,
        icon: s.def.icon,
        position: idx + 1,
        kind: 'questions' as const,
        stats: sectionBuckets(s),
      })),
  ];
  navSections.push({
    id: 'documents',
    titleKey: 'subscriptions.detail.sections.documents',
    icon: FolderOpen,
    position: navSections.length + 1,
    kind: 'documents',
    stats: documentBuckets,
  });

  const toggleSection = (id: string) =>
    setOpenSections(prev => (prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]));

  const scrollTo = (el: HTMLElement | null | undefined, block: ScrollLogicalPosition) => {
    setTimeout(() => el?.scrollIntoView({ behavior: 'smooth', block }), 90);
  };

  const navigateToSection = (id: string) => {
    setActiveSectionId(id);
    setOpenSections(prev => (prev.includes(id) ? prev : [...prev, id]));
    const section = resolved.sections.find(s => s.id === id);
    if (section && !section.asked) setNotAskedVisible(prev => ({ ...prev, [id]: true }));
    scrollTo(sectionRefs.current[id], 'start');
  };

  const navigateToQuestion = (key: string) => {
    const q = resolved.byKey.get(key);
    const sectionId = q?.sectionId ?? (key.startsWith('doc.') ? 'documents' : undefined);
    if (!sectionId) return;
    setActiveSectionId(sectionId);
    setOpenSections(prev => (prev.includes(sectionId) ? prev : [...prev, sectionId]));
    const section = resolved.sections.find(s => s.id === sectionId);
    if ((q && !q.asked) || (section && !section.asked)) {
      setNotAskedVisible(prev => ({ ...prev, [sectionId]: true }));
    }
    setHighlightedKey(key);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => setHighlightedKey(null), 2600);
    scrollTo(rowRefs.current[key], 'center');
  };

  const setAnswer = (key: string, value: Answer) =>
    setAnswersByDossier(prev => ({ ...prev, [dossierId]: { ...prev[dossierId], [key]: value } }));

  const setAdminValue = (q: ResolvedQuestion, value: string) => {
    const initial = q.prefillNote?.kind === 'manual' ? q.prefillNote.initialValue ?? '' : q.displayAnswer;
    setManualEdits(prev => ({ ...prev, [dossierId]: { ...(prev[dossierId] ?? {}), [q.key]: initial } }));
    setAnswer(q.key, value);
  };

  const handleModify = (key: string, value: string) => {
    const current = resolved.byKey.get(key);
    const isMulti = Array.isArray(current?.answer);
    setAnswer(key, isMulti ? value.split(',').map(v => v.trim()).filter(Boolean) : value);
    setStatuses(prev => ({ ...prev, [scoped(key)]: 'modified' }));
  };
  const handleApprove = (key: string) => setStatuses(prev => ({ ...prev, [scoped(key)]: 'approved' }));
  const handleReject = (key: string) => setStatuses(prev => ({ ...prev, [scoped(key)]: 'rejected' }));
  const handleValidateSection = (section: ResolvedSection): number => {
    const next = { ...statuses };
    let approved = 0;
    countedQuestions(section).forEach(q => {
      if (q.state !== 'answered') return;
      next[scoped(q.key)] = 'approved';
      approved += 1;
    });
    setStatuses(next);
    return approved;
  };
  const handleApproveDocument = (key: string) => setDocumentStatuses(prev => ({ ...prev, [scoped(key)]: 'approved' }));
  const handleRejectDocument = (key: string) => setDocumentStatuses(prev => ({ ...prev, [scoped(key)]: 'rejected' }));
  const handleValidateDocuments = (): number => {
    const next = { ...documentStatuses };
    let approved = 0;
    resolved.documents.forEach(d => {
      if (!d.asked || !d.provided) return;
      next[scoped(d.key)] = 'approved';
      approved += 1;
    });
    setDocumentStatuses(next);
    return approved;
  };

  const commentsOf = (key: string) => comments[scoped(key)] ?? [];
  const addComment = (key: string, comment: any) =>
    setComments(prev => ({ ...prev, [scoped(key)]: [...(prev[scoped(key)] ?? []), comment] }));
  const resolveComment = (key: string, id: string) =>
    setComments(prev => ({ ...prev, [scoped(key)]: (prev[scoped(key)] ?? []).map(c => (c.id === id ? { ...c, resolved: true } : c)) }));
  const deleteComment = (key: string, id: string) =>
    setComments(prev => ({ ...prev, [scoped(key)]: (prev[scoped(key)] ?? []).filter(c => c.id !== id) }));

  const totalNotAsked =
    resolved.sections.reduce((acc, s) => acc + (s.asked ? s.counters.notAsked + s.counters.retained : 0), 0) +
    resolved.sections.filter(s => !s.asked).length;
  const allVisible = resolved.sections.every(s => notAskedVisible[s.id]) && !!notAskedVisible.documents;
  const toggleAllNotAsked = () => {
    const next = !allVisible;
    const map: Record<string, boolean> = { documents: next };
    resolved.sections.forEach(s => {
      map[s.id] = next;
    });
    setNotAskedVisible(map);
  };

  return {
    dossier,
    dossierId,
    setDossierId,
    resolved,
    statusOf,
    documentStatusOf,
    questionItemState,
    documentItemState,
    sectionBuckets,
    questionBuckets,
    documentBuckets,
    navSections,
    openSections,
    toggleSection,
    activeSectionId,
    setActiveSectionId,
    notAskedVisible,
    setNotAskedVisible,
    totalNotAsked,
    allVisible,
    toggleAllNotAsked,
    highlightedKey,
    sectionRefs,
    rowRefs,
    navigateToSection,
    navigateToQuestion,
    handleModify,
    handleApprove,
    handleReject,
    handleValidateSection,
    handleApproveDocument,
    handleRejectDocument,
    handleValidateDocuments,
    setAdminValue,
    commentsOf,
    addComment,
    resolveComment,
    deleteComment,
    activeCommentThread,
    setActiveCommentThread,
  };
}

export type OnboardingQuestionnaireState = ReturnType<typeof useOnboardingQuestionnaire>;

// ---------------------------------------------------------------------------
// Helpers de libellés
// ---------------------------------------------------------------------------

function useLabels() {
  const { t } = useTranslation();
  const joinOr = (values: string[] = []) => values.join(` ${t(`${K}.or`)} `);
  const joinAnd = (values: string[] = []) => values.join(` ${t(`${K}.and`)} `);
  const joinComma = (values: string[] = []) => (values.length ? values.join(', ') : t(`${K}.empty`));
  const countList = (parts: Array<[number, string]>) =>
    joinAnd(
      parts
        .filter(([n]) => n > 0)
        .map(([n, base]) => t(`${K}.count.${base}${n > 1 ? 'Many' : 'One'}`, { count: n })),
    );
  const typeLabel = (type: QuestionType) => t(TYPE_LABEL_KEYS[type]);
  const expectedLabel = (link: { expected?: string[]; mode?: 'in' | 'notIn'; parentType?: QuestionType }) => {
    if (link.parentType === 'checkbox') {
      return t(link.expected?.includes('Non') ? `${K}.badge.unchecked` : `${K}.badge.checked`);
    }
    if (link.parentType === 'innerSection') return t(`${K}.badge.eachIteration`);
    const values = (link.expected?.length ?? 0) > 3 ? t(`${K}.badge.valuesList`, { count: link.expected!.length }) : joinOr(link.expected);
    return `${link.mode === 'notIn' ? t(`${K}.badge.otherThan`) + ' ' : ''}${values}`;
  };

  const reasonText = (reason: HiddenReason, variant: 'question' | 'section' = 'question'): string => {
    const vars: Record<string, string | number> = {
      ...reason.vars,
      expected: reason.kind === 'share' ? joinAnd(reason.expected) : joinOr(reason.expected),
      actual: joinComma(reason.actual),
      section: reason.vars.sectionKey ? t(String(reason.vars.sectionKey)) : '',
      cause: reason.rootReason ? reasonText(reason.rootReason, 'question') : '',
    };
    const variantKey = `${K}.reason.${variant}_${reason.textKey}`;
    const variantText = variant === 'section' ? t(variantKey, vars) : variantKey;
    const text = variantText !== variantKey ? variantText : t(`${K}.reason.${reason.textKey}`, vars);
    return reason.adminNote ? `${text} ${t(`${K}.reason.adminNote`)}` : text;
  };

  return { t, joinOr, joinAnd, joinComma, countList, typeLabel, expectedLabel, reasonText };
}

// ---------------------------------------------------------------------------
// Pastilles et popovers
// ---------------------------------------------------------------------------

const CHIP =
  'inline-flex max-w-full items-start gap-1 rounded-md border px-1.5 py-0.5 text-left text-[11px] font-medium leading-4 transition-colors';

type ChipTone = 'primary' | 'muted' | 'amber' | 'red' | 'emerald' | 'violet' | 'blue';

const TONES: Record<ChipTone, string> = {
  primary: 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/15',
  muted: 'border-border bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground',
  amber: 'border-amber-300 border-dashed bg-amber-50 text-amber-800 hover:bg-amber-100',
  red: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  violet: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
  blue: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
};

interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  icon?: typeof Eye;
  tone?: ChipTone;
  children: ReactNode;
  title?: string;
  asTrigger?: boolean;
}

/** Pastille cliquable ou passive. Les props résiduelles sont transmises au bouton pour rester compatible avec un PopoverTrigger asChild. */
const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { icon: Icon, tone = 'muted', children, title, onClick, asTrigger, className: extraClass, ...rest },
  ref,
) {
  const className = cn(CHIP, 'min-w-0 overflow-hidden', TONES[tone], !onClick && !asTrigger && 'cursor-default', extraClass);
  if (onClick || asTrigger) {
    return (
      <button
        ref={ref}
        type="button"
        title={title}
        {...rest}
        onClick={e => {
          e.stopPropagation();
          onClick?.(e);
        }}
        className={className}
      >
        {Icon && <Icon className="mt-0.5 w-3 h-3 shrink-0" />}
        <span className="min-w-0 break-words">{children}</span>
      </button>
    );
  }
  return (
    <span title={title} className={className}>
      {Icon && <Icon className="mt-0.5 w-3 h-3 shrink-0" />}
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
});

function ChipPopover({
  chip,
  title,
  icon: Icon,
  hint,
  children,
}: {
  chip: ReactNode;
  title: string;
  icon: typeof Eye;
  hint?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{chip}</PopoverTrigger>
      <PopoverContent align="start" className="p-0" style={{ width: '28rem', maxWidth: 'calc(100vw - 2rem)' }} onClick={e => e.stopPropagation()}>
        <div className="space-y-1 border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </div>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: '26rem' }} onClickCapture={() => setOpen(false)}>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ValueChips({ values, current }: { values: string[]; current: string[] }) {
  const { t } = useTranslation();
  if (values.length === 0) return <span className="text-[11px] italic text-muted-foreground">{t(`${K}.badge.anyOtherAnswer`)}</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {values.map(v => (
        <span
          key={v}
          className={cn(
            'rounded border px-1.5 py-0.5 text-[11px] leading-4',
            current.includes(v) ? 'border-primary bg-primary font-medium text-white' : 'border-border bg-muted text-foreground/80',
          )}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

function RelationRow({
  item,
  sectionTitle,
  onNavigate,
  expectedText,
  triggeredLabel,
  notTriggeredLabel,
}: {
  item: RelationItem;
  sectionTitle?: string;
  onNavigate: (key: string) => void;
  expectedText?: string;
  triggeredLabel: string;
  notTriggeredLabel: string;
}) {
  const { t } = useTranslation();
  return (
    <li className="flex items-start justify-between gap-3 px-4 py-2.5">
      <div className="min-w-0 flex-1 space-y-0.5">
        {sectionTitle && <div className="text-[11px] text-muted-foreground">{sectionTitle}</div>}
        <div className={cn('text-xs font-medium leading-snug', item.triggeredHere ? 'text-foreground' : 'text-muted-foreground')}>{item.label}</div>
        {expectedText && <div className="text-[11px] text-muted-foreground">{expectedText}</div>}
        {item.detail && <div className="text-[11px] text-muted-foreground">{item.detail}</div>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={cn('inline-flex items-center gap-1 text-[11px] font-medium', item.triggeredHere ? 'text-emerald-700' : 'text-muted-foreground')}>
          {item.triggeredHere ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {item.triggeredHere ? triggeredLabel : notTriggeredLabel}
        </span>
        <Button variant="ghost" size="sm" onClick={() => onNavigate(item.key)} className="h-7 gap-1 px-2 text-xs text-primary hover:bg-primary/5 hover:text-primary">
          {t(`${K}.popover.view`)}
          <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </li>
  );
}

function GroupTitle({ children }: { children: ReactNode }) {
  return <div className="bg-muted/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{children}</div>;
}

/** Chemin complet d'une chaîne de conditions, chaque maillon cliquable. */
function ChainPath({ chain, sectionTitle, onNavigate }: { chain: ChainLink[]; sectionTitle: (id: string) => string; onNavigate: (key: string) => void }) {
  const { t, expectedLabel, joinComma } = useLabels();
  return (
    <ol className="space-y-1.5">
      {chain.map((link, idx) => (
        <li key={link.questionKey} className="flex items-start gap-2">
          <span
            className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
              link.satisfied ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
            )}
          >
            {idx + 1}
          </span>
          <button type="button" onClick={() => onNavigate(link.questionKey)} className="min-w-0 flex-1 text-left hover:underline">
            <div className="text-[11px] text-muted-foreground">{sectionTitle(link.sectionId)}</div>
            <div className="text-xs font-medium leading-snug text-foreground">{link.label}</div>
            <div className="text-[11px] text-muted-foreground">
              {t(`${K}.popover.expected`)} {expectedLabel(link)} · {t(`${K}.popover.actual`)} {link.asked ? joinComma(link.actual) : t(`${K}.state.notAsked`)}
            </div>
          </button>
        </li>
      ))}
    </ol>
  );
}

interface BadgeContext {
  q: ResolvedQuestion;
  resolved: ResolvedQuestionnaire;
  dossier: DemoDossier;
  onNavigate: (key: string) => void;
}

function sectionTitleOf(resolved: ResolvedQuestionnaire, id: string | undefined, t: (k: string) => string) {
  if (!id) return '';
  if (id === 'documents') return t('subscriptions.detail.sections.documents');
  const s = resolved.sections.find(x => x.id === id);
  return s ? t(s.def.titleKey) : '';
}

/** Pastilles amont : ce que la question déclenche, pré-remplit, répète ou bloque. */
function DownstreamChips({ q, resolved, onNavigate }: BadgeContext) {
  const { t, countList, joinOr, expectedLabel } = useLabels();
  const d = q.downstream;
  const chips: ReactNode[] = [];
  const title = (id?: string) => sectionTitleOf(resolved, id, t);

  const conditionTotal = d.questions.length + d.documents.length + d.sections.length + d.composites.length;
  if (conditionTotal > 0) {
    const triggered = [d.questions, d.documents, d.sections, d.composites].map(list => list.filter(i => i.triggeredHere).length);
    const triggeredCount = triggered.reduce((a, b) => a + b, 0);
    const potential = countList([
      [d.questions.length + d.composites.length, 'questions'],
      [d.documents.length, 'documents'],
      [d.sections.length, 'sections'],
    ]);
    const real =
      triggeredCount === 0
        ? t(`${K}.badge.noneTriggered`)
        : t(`${K}.badge.triggeredHere`, {
            list: countList([
              [triggered[0] + triggered[3], 'questions'],
              [triggered[1], 'documents'],
              [triggered[2], 'sections'],
            ]),
          });
    const groups: Array<[string, RelationItem[]]> = [
      [t(`${K}.popover.groupQuestions`), d.questions],
      [t(`${K}.popover.groupComposites`), d.composites],
      [t(`${K}.popover.groupDocuments`), d.documents],
      [t(`${K}.popover.groupSections`), d.sections],
    ];
    chips.push(
      <ChipPopover
        key="conditions"
        icon={GitBranch}
        title={t(`${K}.popover.downstreamTitle`)}
        hint={t(`${K}.popover.downstreamHint`)}
        chip={
          <Chip icon={GitBranch} tone="primary" asTrigger>
            {t(`${K}.badge.conditions`, { list: potential })} · {real}
          </Chip>
        }
      >
        {groups
          .filter(([, list]) => list.length > 0)
          .map(([label, list]) => (
            <Fragment key={label}>
              <GroupTitle>{label}</GroupTitle>
              <ul className="divide-y divide-border/50">
                {list.map(item => (
                  <RelationRow
                    key={item.key}
                    item={{ ...item, label: item.sectionId === item.key ? t(item.label) : item.label }}
                    sectionTitle={item.sectionId && item.sectionId !== item.key ? title(item.sectionId) : undefined}
                    expectedText={
                      item.expected && item.expected.length
                        ? `${t(`${K}.popover.expected`)} ${expectedLabel({ expected: item.expected, mode: item.mode, parentType: q.def.type })}`
                        : item.detail
                    }
                    triggeredLabel={t(`${K}.popover.triggered`)}
                    notTriggeredLabel={t(`${K}.popover.notTriggered`)}
                    onNavigate={key => onNavigate(item.sectionId === item.key ? `section:${key}` : key)}
                  />
                ))}
              </ul>
            </Fragment>
          ))}
      </ChipPopover>,
    );
  }

  if (d.prefills.length > 0) {
    const single = d.prefills[0];
    const isCopy = d.prefills.length === 1 && single.detail === undefined && !single.expected;
    chips.push(
      <ChipPopover
        key="prefills"
        icon={Copy}
        title={t(`${K}.popover.prefillsTitle`)}
        hint={t(`${K}.popover.prefillsHint`)}
        chip={
          <Chip icon={Copy} tone="violet" asTrigger>
            {isCopy
              ? t(`${K}.badge.copiedTo`, { target: single.label })
              : t(`${K}.badge.prefills`, { list: countList([[d.prefills.length, 'questions']]) })}
          </Chip>
        }
      >
        <ul className="divide-y divide-border/50">
          {d.prefills.map(item => (
            <RelationRow
              key={item.key}
              item={item}
              sectionTitle={title(item.sectionId)}
              expectedText={
                item.expected
                  ? t(`${K}.popover.prefillRule`, { when: joinOr(item.expected), value: item.detail ?? '' })
                  : t(`${K}.popover.copyRule`)
              }
              triggeredLabel={t(`${K}.popover.valueProduced`)}
              notTriggeredLabel={t(`${K}.popover.noValueProduced`)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </ChipPopover>,
    );
  }

  if (d.registry.length > 0) {
    chips.push(
      <ChipPopover
        key="registry"
        icon={Database}
        title={t(`${K}.popover.registryTitle`)}
        hint={t(`${K}.popover.registryHint`)}
        chip={
          <Chip icon={Database} tone="blue" asTrigger>
            {t(`${K}.badge.registryOf`, { count: d.registry.length })}
          </Chip>
        }
      >
        <ul className="divide-y divide-border/50">
          {d.registry.map(item => (
            <RelationRow
              key={item.key}
              item={item}
              sectionTitle={title(item.sectionId)}
              expectedText={t(`${K}.popover.registryField`, { field: item.detail ?? '' })}
              triggeredLabel={t(`${K}.popover.filled`)}
              notTriggeredLabel={t(`${K}.popover.notFilled`)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      </ChipPopover>,
    );
  }

  if (q.def.type === 'innerSection') {
    chips.push(
      <Chip key="repeats" icon={Repeat} tone="blue">
        {t(`${K}.badge.repeats`, { label: q.def.subSectionLabel ?? '', count: d.repeats ?? 0 })}
      </Chip>,
    );
  }

  if (d.blocks.length > 0) {
    d.blocks.forEach(b => {
      chips.push(
        <Chip key={`blockref-${b.key}`} icon={Link2} tone="muted" onClick={() => onNavigate(b.key)} title={t(`${K}.popover.view`)}>
          {t(b.blockKind === 'lifts' ? `${K}.badge.liftsBlockOf` : `${K}.badge.blockReference`, { question: b.label })}
        </Chip>,
      );
    });
  }

  if (d.contracts.length > 0) {
    chips.push(
      <ChipPopover
        key="contracts"
        icon={ScrollText}
        title={t(`${K}.popover.contractsTitle`)}
        hint={t(`${K}.popover.contractsHint`)}
        chip={
          <Chip icon={ScrollText} tone="muted" asTrigger>
            {t(d.contracts.length > 1 ? `${K}.badge.contractsMany` : `${K}.badge.contractsOne`, { count: d.contracts.length })}
          </Chip>
        }
      >
        <ul className="divide-y divide-border/50">
          {d.contracts.map(c => (
            <li key={c} className="px-4 py-2 text-xs text-foreground">
              {c}
            </li>
          ))}
        </ul>
      </ChipPopover>,
    );
  }

  return <>{chips}</>;
}

/** Pastilles aval : ce dont la question dépend. */
function UpstreamChips({ q, resolved, onNavigate }: BadgeContext) {
  const { t, joinOr, joinComma, expectedLabel } = useLabels();
  const u = q.upstream;
  const chips: ReactNode[] = [];
  const title = (id?: string) => sectionTitleOf(resolved, id, t);

  const trigger = q.def.trigger ?? q.def.composite?.trigger;
  if (trigger && u.conditionChain.length > 0) {
    const parent = u.conditionChain[0];
    const parentQ = resolved.byKey.get(parent.questionKey);
    const hideWhen = (parentQ?.def.options ?? []).filter(o => (parent.mode === 'notIn' ? parent.expected.includes(o) : !parent.expected.includes(o)));
    const tone: ChipTone = q.asked ? 'muted' : 'amber';
    chips.push(
      <ChipPopover
        key="condition"
        icon={CornerDownRight}
        title={t(`${K}.popover.upstreamTitle`)}
        hint={t(`${K}.popover.upstreamHint`)}
        chip={
          <Chip icon={q.asked ? CornerDownRight : EyeOff} tone={tone} asTrigger title={t(`${K}.badge.dependsOn`, { question: parent.label })}>
            {t(q.asked ? `${K}.badge.conditional` : `${K}.state.notAsked`)} · {parent.label} = {expectedLabel(parent)}
          </Chip>
        }
      >
        <div className="space-y-3 px-4 py-3">
          <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] text-muted-foreground">{title(parent.sectionId)}</div>
              {parent.isAdmin && (
                <span className="inline-flex items-center gap-1 text-[11px] text-violet-700">
                  <UserCog className="w-3 h-3" /> {t(`${K}.badge.adminShort`)}
                </span>
              )}
              {parent.isComposite && (
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-700">
                  <Sigma className="w-3 h-3" /> {t(`${K}.badge.compositeShort`)}
                </span>
              )}
            </div>
            <div className="text-xs font-medium leading-snug text-foreground">{parent.label}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">{t(`${K}.popover.currentAnswer`)}</span>
              {parent.asked ? (
                parent.actual.length ? (
                  <Badge variant="outline" className="h-5 text-xs font-medium">{joinComma(parent.actual)}</Badge>
                ) : (
                  <span className="italic text-muted-foreground/70">{t('subscriptions.detail.onboarding.notProvided')}</span>
                )
              ) : (
                <span className="italic text-muted-foreground/70">{t(`${K}.state.notAsked`)}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                <Eye className="w-3 h-3" />
                {t(`${K}.popover.shownIf`)}
              </div>
              {parent.parentType === 'checkbox' ? (
                <span className="text-xs">{expectedLabel(parent)}</span>
              ) : parent.mode === 'notIn' ? (
                <span className="text-xs">{t(`${K}.badge.otherThan`)} {joinOr(parent.expected)}</span>
              ) : (
                <ValueChips values={parent.expected} current={parent.actual} />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <EyeOff className="w-3 h-3" />
                {t(`${K}.popover.hiddenIf`)}
              </div>
              {parent.parentType === 'checkbox' ? (
                <span className="text-xs">{t(parent.expected.includes('Non') ? `${K}.badge.checked` : `${K}.badge.unchecked`)}</span>
              ) : parent.mode === 'notIn' ? (
                <ValueChips values={parent.expected} current={parent.actual} />
              ) : (
                <ValueChips values={hideWhen} current={parent.actual} />
              )}
            </div>
          </div>

          {parent.isAdmin && (
            <p className="flex items-start gap-1.5 text-[11px] text-violet-700">
              <Info className="mt-0.5 w-3 h-3 shrink-0" />
              {t(`${K}.reason.adminNote`)}
            </p>
          )}

          <div className={cn('flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs', q.asked ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800')}>
            {q.asked ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
            <span>{t(q.asked ? `${K}.popover.currentlyShown` : `${K}.popover.currentlyHidden`)}</span>
          </div>

          {u.conditionChain.length > 1 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <ListTree className="w-3 h-3" />
                {t(`${K}.popover.chainTitle`, { count: u.conditionChain.length })}
              </div>
              <ChainPath chain={u.conditionChain} sectionTitle={id => title(id)} onNavigate={onNavigate} />
            </div>
          )}

          <Button variant="outline" size="sm" onClick={() => onNavigate(parent.questionKey)} className="w-full justify-between text-primary hover:text-primary">
            {t(`${K}.popover.viewParent`)}
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </ChipPopover>,
    );
  }

  if (u.prefilledBy.length > 0) {
    const single = u.prefilledBy.length === 1 ? u.prefilledBy[0] : null;
    const label = single
      ? single.copy
        ? t(`${K}.badge.copyOf`, { source: single.label })
        : t(`${K}.badge.prefilledBy`, { source: single.label })
      : t(`${K}.badge.prefilledByMany`, { count: u.prefilledBy.length });
    chips.push(
      <ChipPopover
        key="prefilledBy"
        icon={Copy}
        title={t(`${K}.popover.prefilledByTitle`)}
        hint={t(`${K}.popover.prefilledByHint`)}
        chip={
          <Chip icon={Copy} tone="violet" asTrigger>
            {label}
          </Chip>
        }
      >
        <ul className="divide-y divide-border/50">
          {u.prefilledBy.map(s => (
            <RelationRow
              key={s.questionKey}
              item={{ key: s.questionKey, id: s.questionKey, label: s.label, triggeredHere: s.produced, detail: s.producedValue ? t(`${K}.popover.producedValue`, { value: s.producedValue }) : undefined }}
              sectionTitle={title(resolved.byKey.get(s.questionKey)?.sectionId)}
              expectedText={`${s.copy ? t(`${K}.popover.copyRule`) : t(`${K}.popover.prefillRule`, { when: joinOr(s.when), value: s.value ?? '' })} · ${t(s.overwrite ? `${K}.badge.overwrite` : `${K}.badge.noOverwrite`)}`}
              triggeredLabel={t(`${K}.popover.valueProduced`)}
              notTriggeredLabel={t(`${K}.popover.noValueProduced`)}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
        {q.prefillNote && (
          <div className="border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            <PrefillNoteText q={q} />
            {!u.prefilledBy.every(s => !s.overwrite) ? null : q.prefillNote.kind === 'manual' && (
              <p className="mt-1 flex items-start gap-1.5 text-amber-800">
                <AlertTriangle className="mt-0.5 w-3 h-3 shrink-0" />
                {t(`${K}.prefill.overwriteWarning`)}
              </p>
            )}
          </div>
        )}
      </ChipPopover>,
    );
  }

  if (u.registry) {
    chips.push(
      <Chip key="registry" icon={Database} tone="blue" onClick={() => onNavigate(u.registry!.questionKey)} title={t(`${K}.badge.registryFilledDetail`, { field: u.registry.field })}>
        {t(`${K}.badge.registryFilled`)}
      </Chip>,
    );
  }

  u.insertedIn.forEach(item => {
    chips.push(
      <Chip key={`inserted-${item.key}`} icon={Sigma} tone="blue" onClick={() => onNavigate(item.key)}>
        {t(`${K}.badge.insertedIn`, { composite: item.label })}
      </Chip>,
    );
  });

  if (q.def.composite?.kind === 'insert') {
    chips.push(
      <Chip key="composes" icon={Sigma} tone="blue">
        {t(`${K}.badge.composes`, { count: q.def.composite.insertIds?.length ?? 0 })}
      </Chip>,
    );
  }

  return <>{chips}</>;
}

function PrefillNoteText({ q }: { q: ResolvedQuestion }) {
  const { t } = useTranslation();
  const note = q.prefillNote;
  if (!note) return null;
  if (note.kind === 'produced') return <span>{t(`${K}.prefill.produced`, { value: note.sourceValue ?? '', source: note.sourceLabel ?? '' })}</span>;
  if (note.kind === 'manual') return <span>{t(`${K}.prefill.manual`, { initial: note.initialValue || t(`${K}.empty`) })}</span>;
  return <span>{t(note.sourceCount > 1 ? `${K}.prefill.noneMany` : `${K}.prefill.noneOne`, { count: note.sourceCount })}</span>;
}

/** Pastilles de nature et de règles : type, obligation, alerte, blocage, rattachements. */
function NatureChips({ q, resolved, dossier, onNavigate }: BadgeContext) {
  const { t, joinOr } = useLabels();
  const { def } = q;
  const chips: ReactNode[] = [];

  if (def.nature === 'admin') chips.push(<Chip key="admin" icon={UserCog} tone="violet">{t(`${K}.badge.adminNature`)}</Chip>);
  if (def.nature === 'composite') {
    chips.push(
      <ChipPopover
        key="composite"
        icon={Sigma}
        title={t(`${K}.badge.compositeNature`)}
        hint={t(`${K}.composite.hint`)}
        chip={<Chip icon={Sigma} tone="blue" asTrigger>{t(`${K}.badge.compositeNature`)}</Chip>}
      >
        <div className="space-y-2 px-4 py-3 text-xs">
          <div className="text-[11px] font-medium text-muted-foreground">{t(`${K}.composite.template`)}</div>
          <code className="block whitespace-pre-wrap break-words rounded bg-muted px-2 py-1.5 text-[11px] text-foreground">{def.composite?.template}</code>
          <div className="text-[11px] font-medium text-muted-foreground">{t(`${K}.composite.value`)}</div>
          <div className="text-foreground">{q.compositeValue || <span className="italic text-muted-foreground">{t(`${K}.composite.notDisplayed`)}</span>}</div>
          {q.compositeBranch && (q.compositeBranch === 'when' || q.compositeBranch === 'else') && (
            <div className="text-[11px] text-muted-foreground">{t(`${K}.composite.branch`, { branch: q.compositeBranch === 'when' ? '[iftrigger]' : '[else]' })}</div>
          )}
          {def.composite?.kind === 'trigger' && def.composite.trigger && (
            <div className="text-[11px] text-muted-foreground">
              {t(`${K}.composite.triggerRule`, {
                source: resolved.byKey.get(def.composite.trigger.parentId)?.def.label ?? '',
                count: def.composite.trigger.expected.length,
              })}
            </div>
          )}
        </div>
      </ChipPopover>,
    );
  }
  if (def.hiddenLabel) chips.push(<Chip key="hiddenLabel" icon={EyeOff}>{t(`${K}.badge.hiddenLabel`)}</Chip>);
  if (def.disabled) chips.push(<Chip key="disabled" icon={Ban} tone="red">{t(`${K}.badge.disabled`)}</Chip>);
  if (def.visibility && def.visibility !== 'all') {
    chips.push(<Chip key="visibility" icon={Eye}>{t(def.visibility === 'individual' ? `${K}.badge.visibilityIndividual` : `${K}.badge.visibilityCorporate`)}</Chip>);
  }
  if (def.mandatory === 'firstSubscription') {
    chips.push(
      <Chip key="mandatoryFirst" icon={Info} tone={q.mandatoryWaived ? 'muted' : 'primary'}>
        {q.mandatoryWaived ? t(`${K}.badge.mandatoryWaived`, { name: dossier.subscriberFirstName }) : t(`${K}.badge.mandatoryFirstOnly`)}
      </Chip>,
    );
  }

  if (def.alertWhen) {
    chips.push(
      <Chip key="alert" icon={AlertTriangle} tone={q.alert ? 'red' : 'muted'}>
        {q.alert ? t(`${K}.badge.alertOn`) : t(`${K}.badge.alertIf`, { value: joinOr(def.alertWhen) })}
      </Chip>,
    );
  }

  const block = def.block;
  if (block) {
    let text = '';
    let target: string | undefined;
    if (block.whenEmpty) text = t(`${K}.badge.blockIfEmpty`);
    if (block.whenValues) {
      text = block.whenValues.length > 3 ? t(`${K}.badge.blockOnValues`, { count: block.whenValues.length }) : t(`${K}.badge.blockIfValue`, { value: joinOr(block.whenValues) });
    }
    if (block.equalsTo) {
      text = t(`${K}.badge.blockEquals`, { question: resolved.byKey.get(block.equalsTo)?.def.label ?? block.equalsTo });
      target = block.equalsTo;
    }
    if (block.differsFrom) {
      text = t(`${K}.badge.blockDiffers`, { question: resolved.byKey.get(block.differsFrom)?.def.label ?? block.differsFrom });
      target = block.differsFrom;
    }
    if (block.combined) {
      text = t(`${K}.badge.blockCombined`, {
        value: block.combined.value,
        other: resolved.byKey.get(block.combined.otherId)?.def.label ?? '',
        otherValue: block.combined.otherValue,
      });
      target = block.combined.otherId;
    }
    chips.push(
      <ChipPopover
        key="block"
        icon={Lock}
        title={t(`${K}.popover.blockTitle`)}
        hint={text}
        chip={
          <Chip icon={Lock} tone={q.blockLifted ? 'emerald' : 'amber'} asTrigger>
            {q.blockLifted
              ? t(`${K}.badge.blockLifted`, { question: resolved.byKey.get(block.liftedBy!.questionId)?.def.label ?? '', value: block.liftedBy!.value })
              : text}
          </Chip>
        }
      >
        <div className="space-y-2 px-4 py-3 text-xs">
          <div className="text-[11px] font-medium text-muted-foreground">{t(`${K}.popover.blockMessage`)}</div>
          <div className="rounded border border-border/60 bg-muted/40 px-2.5 py-2 italic text-foreground">"{block.message}"</div>
          {block.whenValues && block.whenValues.length > 3 && (
            <>
              <div className="text-[11px] font-medium text-muted-foreground">{t(`${K}.popover.blockValues`, { count: block.whenValues.length })}</div>
              <ValueChips values={block.whenValues} current={Array.isArray(q.answer) ? q.answer : q.answer ? [q.answer] : []} />
            </>
          )}
          {block.liftedBy && (
            <div className={cn('rounded-md px-2.5 py-1.5', q.blockLifted ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground')}>
              {t(`${K}.popover.blockLiftRule`, { question: resolved.byKey.get(block.liftedBy.questionId)?.def.label ?? '', value: block.liftedBy.value })}
              {q.blockLifted && ` · ${t(`${K}.popover.liftedHere`)}`}
            </div>
          )}
          <div className="text-[11px] text-muted-foreground">{t(`${K}.popover.blockCheckedAtSubmit`)}</div>
          {target && (
            <Button variant="outline" size="sm" onClick={() => onNavigate(target!)} className="w-full justify-between text-primary hover:text-primary">
              {t(`${K}.popover.viewReference`)}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </ChipPopover>,
    );
    if (q.blockingAnswer) chips.push(<Chip key="blocking" icon={AlertCircle} tone="red">{t(`${K}.badge.blockingAnswer`)}</Chip>);
  }

  if (def.subscriptionData) chips.push(<Chip key="subData" icon={Database}>{t(`${K}.badge.subscriptionData`, { field: def.subscriptionData })}</Chip>);
  if (def.investorData) chips.push(<Chip key="invData" icon={Database}>{t(`${K}.badge.investorData`, { field: def.investorData })}</Chip>);
  if (def.partnerData) chips.push(<Chip key="partData" icon={Database}>{t(`${K}.badge.partnerData`, { field: def.partnerData })}</Chip>);
  if (def.pasteForbidden) chips.push(<Chip key="paste" icon={Ban}>{t(`${K}.badge.pasteForbidden`)}</Chip>);
  if (def.exactAnswerTemplate) chips.push(<Chip key="exact" icon={ScrollText} title={def.exactAnswerTemplate}>{t(`${K}.badge.exactAnswer`)}</Chip>);

  return <>{chips}</>;
}

// ---------------------------------------------------------------------------
// Raisons de masquage
// ---------------------------------------------------------------------------

function ReasonLine({
  reason,
  resolved,
  variant = 'question',
  ownSectionId,
  onNavigate,
}: {
  reason: HiddenReason;
  resolved: ResolvedQuestionnaire;
  variant?: 'question' | 'section';
  ownSectionId?: string;
  onNavigate: (key: string) => void;
}) {
  const { t, reasonText } = useLabels();
  const linkKey = reason.linkQuestionKey ?? reason.rootReason?.linkQuestionKey;
  const linkSection = linkKey ? resolved.byKey.get(linkKey)?.sectionId : reason.linkSectionId;
  const crossSection = linkSection && linkSection !== ownSectionId;
  return (
    <span className="inline">
      <span>{reasonText(reason, variant)}</span>
      {linkKey && (
        <button type="button" onClick={e => { e.stopPropagation(); onNavigate(linkKey); }} className="ml-1.5 inline-flex items-center gap-0.5 text-primary hover:underline">
          {crossSection
            ? t(`${K}.reason.seeAnswerIn`, { section: sectionTitleOf(resolved, linkSection, t) })
            : t(`${K}.reason.seeQuestion`)}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
      {!linkKey && reason.kind === 'sectionHidden' && reason.linkSectionId && (
        <button type="button" onClick={e => { e.stopPropagation(); onNavigate(`section:${reason.linkSectionId}`); }} className="ml-1.5 inline-flex items-center gap-0.5 text-primary hover:underline">
          {t(`${K}.reason.seeSection`)}
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

function ReasonsBlock({ reasons, resolved, ownSectionId, onNavigate }: { reasons: HiddenReason[]; resolved: ResolvedQuestionnaire; ownSectionId: string; onNavigate: (key: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (reasons.length === 0) return null;
  const [first, ...others] = reasons;
  return (
    <div className="text-xs text-muted-foreground">
      <ReasonLine reason={first} resolved={resolved} ownSectionId={ownSectionId} onNavigate={onNavigate} />
      {others.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" onClick={e => e.stopPropagation()} className="ml-1.5 inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground/80 hover:bg-muted/70">
              {t(others.length > 1 ? `${K}.reason.moreMany` : `${K}.reason.moreOne`, { count: others.length })}
              <ChevronDown className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0" style={{ width: '26rem', maxWidth: 'calc(100vw - 2rem)' }} onClick={e => e.stopPropagation()}>
            <div className="border-b border-border/60 px-4 py-2.5 text-sm font-semibold">{t(`${K}.reason.allReasons`, { count: reasons.length })}</div>
            <ol className="divide-y divide-border/50">
              {reasons.map((r, idx) => (
                <li key={idx} className="flex items-start gap-2 px-4 py-2 text-xs text-foreground/90">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{idx + 1}</span>
                  <span className="space-y-0.5">
                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground">{t(`${K}.reasonKind.${r.kind}`)}</span>
                    <ReasonLine reason={r} resolved={resolved} ownSectionId={ownSectionId} onNavigate={key => { setOpen(false); onNavigate(key); }} />
                  </span>
                </li>
              ))}
            </ol>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lignes de question
// ---------------------------------------------------------------------------

function StateBadge({ state }: { state: ResolvedQuestion['state'] }) {
  const { t } = useTranslation();
  const map: Record<ResolvedQuestion['state'], { cls: string; icon: typeof Eye }> = {
    answered: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Check },
    toAnswer: { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
    notAsked: { cls: 'bg-muted text-muted-foreground border-border', icon: EyeOff },
    retained: { cls: 'bg-muted text-muted-foreground border-border', icon: History },
    adminToFill: { cls: 'bg-pink-50 text-pink-700 border-pink-200', icon: UserCog },
    adminFilled: { cls: 'bg-violet-50 text-violet-700 border-violet-200', icon: UserCog },
    composite: { cls: 'bg-blue-50 text-blue-700 border-blue-200', icon: Sigma },
    presentation: { cls: 'bg-muted text-muted-foreground border-border', icon: FileText },
  };
  const { cls, icon: Icon } = map[state];
  return (
    <Badge className={cn('h-5 gap-1 text-[11px] font-medium', cls)}>
      <Icon className="w-3 h-3" />
      {t(`${K}.state.${state}`)}
    </Badge>
  );
}

interface RowProps {
  q: ResolvedQuestion;
  state: OnboardingQuestionnaireState;
  sectionId: string;
  showNotAsked: boolean;
  depth?: number;
}

function QuestionRow({ q, state, sectionId, showNotAsked, depth = 0 }: RowProps) {
  const { t, typeLabel } = useLabels();
  const { resolved, dossier, navigateToQuestion } = state;
  const isHighlighted = state.highlightedKey === q.key;
  const status = state.statusOf(q.key);
  const comments = state.commentsOf(q.key);
  const hasUnresolved = comments.some((c: any) => !c.resolved);
  const isCommentOpen = state.activeCommentThread === q.key;
  const ctx: BadgeContext = { q, resolved, dossier, onNavigate: navigateToQuestion };

  if (!q.asked && !showNotAsked) return null;

  const rowRef = (el: HTMLDivElement | null) => {
    state.rowRefs.current[q.key] = el;
  };

  // Élément de présentation : titre en sous-en-tête, texte replié
  if (q.def.nature === 'presentation' && q.asked) {
    return (
      <div ref={rowRef} style={{ scrollMarginTop: '5rem' }} className={cn('px-4 py-2', isHighlighted && 'bg-primary/5 ring-1 ring-inset ring-primary/50')}>
        {q.def.type === 'title' ? (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {q.def.label}
            <Chip icon={FileText}>{typeLabel('title')}</Chip>
          </div>
        ) : (
          <details className="text-xs text-muted-foreground">
            <summary className="flex cursor-pointer items-center gap-2">
              <ChevronRight className="w-3 h-3" />
              <span className="font-medium text-foreground/80">{q.def.label}</span>
              <Chip icon={FileText}>{typeLabel('text')}</Chip>
              <span className="flex flex-wrap gap-1.5"><UpstreamChips {...ctx} /></span>
            </summary>
            <p className="mt-1 pl-5 italic">{t(`${K}.presentation.textPlaceholder`)}</p>
          </details>
        )}
      </div>
    );
  }

  const muted = !q.asked;
  const meta = [typeLabel(q.def.type), q.mandatoryHere ? t(`${K}.badge.mandatory`) : null].filter(Boolean).join(' · ');

  return (
    <div ref={rowRef} style={{ scrollMarginTop: '5rem' }}>
      <div
        className={cn(
          'grid grid-cols-12 gap-4 p-4 transition-colors',
          isHighlighted ? 'bg-primary/5 ring-1 ring-inset ring-primary/50' : 'hover:bg-muted',
          muted && 'bg-muted/30',
          q.state === 'adminToFill' && 'bg-pink-50/60',
          depth > 0 && 'pl-8',
        )}
      >
        <div className="col-span-5 min-w-0 flex flex-col justify-center gap-1.5 text-sm text-foreground/80">
          <div className="flex items-start gap-2">
            {q.alert && <AlertTriangle className="mt-0.5 w-4 h-4 shrink-0 text-red-500" />}
            <div className="min-w-0">
              <span className={cn(status === 'rejected' ? 'text-red-700' : muted ? 'italic text-muted-foreground' : '')}>
                {q.def.label}
                {q.mandatoryHere && !muted && <span className="text-red-500">*</span>}
              </span>
              <div className="text-[11px] text-muted-foreground">{meta}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <NatureChips {...ctx} />
            <DownstreamChips {...ctx} />
            <UpstreamChips {...ctx} />
          </div>
        </div>

        <div className="col-span-3 min-w-0 text-sm font-medium text-foreground">
          <AnswerCell q={q} state={state} />
        </div>

        <div className="col-span-4 flex min-w-0 items-center justify-end">
          {q.state === 'answered' || q.state === 'toAnswer' ? (
            <QuestionActions
              questionId={q.key}
              currentResponse={q.displayAnswer}
              currentStatus={status}
              commentCount={comments.length}
              hasUnresolvedComments={hasUnresolved}
              onApprove={() => state.handleApprove(q.key)}
              onReject={() => state.handleReject(q.key)}
              onModify={value => state.handleModify(q.key, value)}
              onComment={() => state.setActiveCommentThread(isCommentOpen ? null : q.key)}
            />
          ) : q.state === 'notAsked' || q.state === 'retained' ? (
            <div className="w-full space-y-1 text-right">
              <div className="flex justify-end"><StateBadge state={q.state} /></div>
              <div className="text-left">
                <ReasonsBlock reasons={q.hiddenReasons} resolved={resolved} ownSectionId={sectionId} onNavigate={navigateToQuestion} />
              </div>
            </div>
          ) : (
            <StateBadge state={q.state} />
          )}
        </div>
      </div>

      {(q.state === 'answered' || q.state === 'toAnswer') && (
        <QuestionCommentThread
          questionId={q.key}
          questionText={q.def.label}
          isOpen={isCommentOpen}
          onClose={() => state.setActiveCommentThread(null)}
          comments={comments}
          onAddComment={c => state.addComment(q.key, c)}
          onResolveComment={id => state.resolveComment(q.key, id)}
          onDeleteComment={id => state.deleteComment(q.key, id)}
        />
      )}

      {q.iterations && q.iterations.length > 0 && (
        <div className="divide-y divide-border/50 border-t border-border/50 bg-muted/20">
          {q.iterations.map((list, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between gap-3 bg-muted/60 px-8 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Repeat className="w-3.5 h-3.5 text-primary" />
                  {t(`${K}.iteration.title`, { label: q.def.subSectionLabel ?? '', index: idx + 1, total: q.iterations!.length })}
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {t(`${K}.counters.answered`, { answered: list.filter(s => s.state === 'answered').length, total: list.filter(s => s.counted).length })}
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {list.map(sub => (
                  <QuestionRow key={sub.key} q={sub} state={state} sectionId={sectionId} showNotAsked={showNotAsked} depth={1} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnswerCell({ q, state }: { q: ResolvedQuestion; state: OnboardingQuestionnaireState }) {
  const { t } = useTranslation();
  if (q.state === 'notAsked') return <span className="italic text-muted-foreground/60">{t(`${K}.state.notAskedShort`)}</span>;
  if (q.state === 'retained') {
    return (
      <div className="space-y-0.5">
        <span className="text-muted-foreground/70 line-through decoration-muted-foreground/40">{q.displayAnswer}</span>
        <div className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground"><History className="w-3 h-3" />{t(`${K}.state.retained`)}</div>
      </div>
    );
  }
  if (q.def.nature === 'admin') {
    return (
      <div className="space-y-1">
        <select
          value={q.displayAnswer}
          onChange={e => state.setAdminValue(q, e.target.value)}
          aria-label={q.def.label}
          className={cn('h-8 w-full rounded-md border bg-white px-2 text-sm', q.state === 'adminToFill' ? 'border-pink-300 text-pink-700' : 'border-border text-foreground')}
        >
          <option value="">{t(`${K}.state.adminToFill`)}</option>
          {q.def.options?.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        {q.prefillNote && <div className="text-[11px] font-normal text-muted-foreground"><PrefillNoteText q={q} /></div>}
      </div>
    );
  }
  if (q.def.nature === 'composite') {
    return (
      <div className="space-y-0.5">
        <span className="text-foreground">{q.compositeValue}</span>
        {(q.compositeBranch === 'when' || q.compositeBranch === 'else') && (
          <div className="text-[11px] font-normal text-muted-foreground">{t(`${K}.composite.branch`, { branch: q.compositeBranch === 'when' ? '[iftrigger]' : '[else]' })}</div>
        )}
      </div>
    );
  }
  if (q.def.type === 'innerSection') {
    return <span>{t(`${K}.iteration.count`, { count: q.displayAnswer || '0', label: q.def.subSectionLabel ?? '' })}</span>;
  }
  if (!q.displayAnswer) return <span className="italic text-muted-foreground/60">{t(`${K}.state.toAnswer`)}</span>;
  if (q.def.type === 'checkbox') {
    return <span className="inline-flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-600" />{t(`${K}.state.checkedValue`)}</span>;
  }
  return (
    <div className="space-y-0.5">
      <span>{q.displayAnswer}</span>
      {q.prefillNote && <div className="text-[11px] font-normal text-muted-foreground"><PrefillNoteText q={q} /></div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function SectionCard({ section, state }: { section: ResolvedSection; state: OnboardingQuestionnaireState }) {
  const { t } = useTranslation();
  const Icon = section.def.icon;
  const isOpen = state.openSections.includes(section.id);
  const buckets = state.sectionBuckets(section);
  const allVerified = buckets.total > 0 && buckets.validated === buckets.total;
  const showNotAsked = !!state.notAskedVisible[section.id];
  const hiddenCount = section.counters.notAsked + section.counters.retained;

  if (!section.asked) {
    if (!showNotAsked) return null;
    return (
      <div ref={el => { state.sectionRefs.current[section.id] = el; }} style={{ scrollMarginTop: '1rem' }}>
        <Card className="overflow-hidden border-dashed bg-muted/30">
          <div className="flex items-start justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold italic text-muted-foreground">{t(section.def.titleKey)}</h3>
                <div className="text-xs text-muted-foreground">
                  <ReasonLine reason={section.hiddenReasons[0]} resolved={state.resolved} variant="section" ownSectionId={section.id} onNavigate={state.navigateToQuestion} />
                </div>
                <div className="text-[11px] text-muted-foreground">{t(`${K}.section.hiddenQuestionsCount`, { count: section.questions.length })}</div>
              </div>
            </div>
            <Badge className="bg-muted text-muted-foreground border-border"><EyeOff className="w-3.5 h-3.5 mr-1.5" />{t(`${K}.section.notShown`)}</Badge>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div ref={el => { state.sectionRefs.current[section.id] = el; }} style={{ scrollMarginTop: '1rem' }}>
      <Collapsible open={isOpen} onOpenChange={() => { state.toggleSection(section.id); state.setActiveSectionId(section.id); }}>
        <Card className="overflow-hidden transition-shadow hover:shadow-md" style={state.activeSectionId === section.id ? { boxShadow: '0 0 0 1px var(--color-primary)' } : undefined}>
          <CollapsibleTrigger className="w-full">
            <div className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-muted">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', allVerified ? 'bg-[var(--success-soft)]' : 'bg-primary/10')}>
                  <Icon className={cn('w-6 h-6', allVerified ? 'text-emerald-600' : 'text-primary')} />
                </div>
                <div className="text-left">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{t(section.def.titleKey)}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-semibold text-foreground">
                      {t(`${K}.counters.answered`, { answered: section.counters.answered, total: section.counters.asked })}
                    </span>
                    {section.counters.adminTotal > 0 && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="inline-flex items-center gap-1 text-violet-700"><UserCog className="w-3 h-3" />{t(`${K}.counters.admin`, { filled: section.counters.adminFilled, total: section.counters.adminTotal })}</span>
                      </>
                    )}
                    {hiddenCount > 0 && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="inline-flex items-center gap-1 text-muted-foreground"><EyeOff className="w-3 h-3" />{t(hiddenCount > 1 ? `${K}.counters.notAskedMany` : `${K}.counters.notAskedOne`, { count: hiddenCount })}</span>
                      </>
                    )}
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <OnboardingStateCounter stats={buckets} compact />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {section.conditionChain.length > 0 && (
                  <Chip icon={CornerDownRight} tone={section.conditionChain[0].isAdmin ? 'violet' : 'muted'}>
                    {t(section.conditionChain[0].isAdmin ? `${K}.section.shownBecauseAdmin` : `${K}.section.shownBecause`, {
                      parent: section.conditionChain[0].label,
                      expected: section.conditionChain[0].expected.join(', '),
                    })}
                  </Chip>
                )}
                {allVerified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />{t('subscriptions.detail.onboarding.sectionValidated')}</Badge>
                ) : buckets.awaitingCorrection > 0 ? (
                  <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle className="w-3.5 h-3.5 mr-1.5" />{t('subscriptions.detail.onboarding.completion.awaitingCorrectionCount', { count: buckets.awaitingCorrection })}</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200"><AlertCircle className="w-3.5 h-3.5 mr-1.5" />{t('subscriptions.detail.onboarding.inProgress')}</Badge>
                )}
                {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground/60" /> : <ChevronDown className="w-5 h-5 text-muted-foreground/60" />}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border/50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('subscriptions.detail.onboarding.verifyAllResponses')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {hiddenCount > 0 && (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => state.setNotAskedVisible(prev => ({ ...prev, [section.id]: !showNotAsked }))}>
                      {showNotAsked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showNotAsked
                        ? t(`${K}.toggle.hide`)
                        : t(hiddenCount > 1 ? `${K}.toggle.showMany` : `${K}.toggle.showOne`, { count: hiddenCount })}
                    </Button>
                  )}
                  {!allVerified && (
                    <Button
                      size="sm"
                      onClick={() => {
                        const count = state.handleValidateSection(section);
                        toast.success(t('subscriptions.detail.onboarding.sectionValidatedToast'), {
                          description: t('subscriptions.detail.onboarding.sectionValidatedDesc', { count, title: t(section.def.titleKey) }),
                        });
                      }}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      {t('subscriptions.detail.onboarding.validateSection')}
                    </Button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {section.questions.map(q => (
                  <QuestionRow key={q.key} q={q} state={state} sectionId={section.id} showNotAsked={showNotAsked} />
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pièces justificatives
// ---------------------------------------------------------------------------

function DocumentsCard({ state }: { state: OnboardingQuestionnaireState }) {
  const { t, expectedLabel } = useLabels();
  const { resolved } = state;
  const isOpen = state.openSections.includes('documents');
  const buckets = state.documentBuckets;
  const allVerified = buckets.total > 0 && buckets.validated === buckets.total;
  const showNotAsked = !!state.notAskedVisible.documents;
  const asked = resolved.documents.filter(d => d.asked);
  const notAsked = resolved.documents.filter(d => !d.asked);

  const th = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground';

  return (
    <div ref={el => { state.sectionRefs.current.documents = el; }} style={{ scrollMarginTop: '1rem' }}>
      <Collapsible open={isOpen} onOpenChange={() => { state.toggleSection('documents'); state.setActiveSectionId('documents'); }}>
        <Card className="overflow-hidden transition-shadow hover:shadow-md" style={state.activeSectionId === 'documents' ? { boxShadow: '0 0 0 1px var(--color-primary)' } : undefined}>
          <CollapsibleTrigger className="w-full">
            <div className="flex cursor-pointer items-center justify-between p-5 transition-colors hover:bg-muted">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', allVerified ? 'bg-[var(--success-soft)]' : 'bg-primary/10')}>
                  <FolderOpen className={cn('w-6 h-6', allVerified ? 'text-emerald-600' : 'text-primary')} />
                </div>
                <div className="text-left">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{t('subscriptions.detail.sections.documents')}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="font-semibold text-foreground">{t('subscriptions.detail.onboarding.requiredDocuments', { count: asked.length })}</span>
                    {notAsked.length > 0 && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-border" />
                        <span className="inline-flex items-center gap-1 text-muted-foreground"><EyeOff className="w-3 h-3" />{t(notAsked.length > 1 ? `${K}.documents.notRequestedCountMany` : `${K}.documents.notRequestedCountOne`, { count: notAsked.length })}</span>
                      </>
                    )}
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <OnboardingStateCounter stats={buckets} compact />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {allVerified ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />{t('subscriptions.detail.onboarding.sectionValidated')}</Badge>
                ) : buckets.awaitingCorrection > 0 ? (
                  <Badge className="bg-red-100 text-red-700 border-red-200"><AlertCircle className="w-3.5 h-3.5 mr-1.5" />{t('subscriptions.detail.onboarding.completion.awaitingCorrectionCount', { count: buckets.awaitingCorrection })}</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200"><AlertCircle className="w-3.5 h-3.5 mr-1.5" />{t('subscriptions.detail.onboarding.inProgress')}</Badge>
                )}
                {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground/60" /> : <ChevronDown className="w-5 h-5 text-muted-foreground/60" />}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border/50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-foreground/80">
                  <FileText className="w-4 h-4" />
                  <span>{t('subscriptions.detail.onboarding.manageDocuments')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {notAsked.length > 0 && (
                    <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => state.setNotAskedVisible(prev => ({ ...prev, documents: !showNotAsked }))}>
                      {showNotAsked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {showNotAsked ? t(`${K}.documents.hideNotRequested`) : t(`${K}.documents.showNotRequested`, { count: notAsked.length })}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => toast.info(t('subscriptions.detail.toast.addDocumentToast'), { description: t('subscriptions.detail.toast.selectFileGeneric') })}>
                    <Upload className="w-3.5 h-3.5" />
                    {t('subscriptions.detail.onboarding.addDocument')}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2 bg-primary text-xs text-white hover:bg-primary/90"
                    onClick={() => {
                      const count = state.handleValidateDocuments();
                      toast.success(t('subscriptions.detail.onboarding.sectionValidatedToast'), {
                        description: t('subscriptions.detail.onboarding.completion.documentsValidatedDesc', { count, title: t('subscriptions.detail.sections.documents') }),
                      });
                    }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('subscriptions.detail.onboarding.validateSection')}
                  </Button>
                </div>
              </div>

              <table className="w-full">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className={th} style={{ minWidth: '20rem' }}>{t('subscriptions.detail.docsTable.document')}</th>
                    <th className={cn(th, 'w-32')}>{t('subscriptions.detail.docsTable.dateSent')}</th>
                    <th className={cn(th, 'w-32')}>{t('subscriptions.detail.docsTable.issuedOn')}</th>
                    <th className={cn(th, 'w-32')}>{t('subscriptions.detail.docsTable.expiration')}</th>
                    <th className={cn(th, 'w-28 text-center')}>{t('subscriptions.detail.docsTable.action')}</th>
                    <th className={cn(th, 'w-32 text-center')}>{t('subscriptions.detail.docsTable.verification')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 bg-card">
                  {asked.map(doc => {
                    const docState = state.documentItemState(doc);
                    const chain = doc.conditionChain[0];
                    const isHighlighted = state.highlightedKey === doc.key;
                    return (
                      <tr key={doc.key} ref={el => { state.rowRefs.current[doc.key] = el as unknown as HTMLDivElement | null; }} className={cn('transition-colors hover:bg-muted', isHighlighted && 'bg-primary/5 ring-1 ring-inset ring-primary/50')}>
                        <td className="px-4 py-3 text-sm text-foreground/80">
                          <div className="space-y-1">
                            <div>
                              {doc.label}
                              {doc.target && <span className="text-muted-foreground"> · {t(`${K}.documents.target`, { label: resolved.byKey.get(doc.def.innerSectionId ?? '')?.def.subSectionLabel ?? '', index: doc.target.index })}</span>}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {chain && doc.def.trigger && (
                                <Chip icon={CornerDownRight} onClick={() => state.navigateToQuestion(chain.questionKey)} title={t(`${K}.popover.view`)}>
                                  {t(`${K}.documents.requestedIf`, { parent: chain.label, expected: expectedLabel(chain) })}
                                </Chip>
                              )}
                              {doc.def.innerSectionId && chain && (
                                <Chip icon={Repeat} tone="blue" onClick={() => state.navigateToQuestion(chain.questionKey)}>
                                  {t(`${K}.documents.forEachIteration`, { label: resolved.byKey.get(doc.def.innerSectionId)?.def.subSectionLabel ?? '', max: doc.def.maxTargets ?? 0 })}
                                </Chip>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{doc.provided?.dateSent || <span className="text-muted-foreground/60">-</span>}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{doc.provided?.issueDate || <span className="text-muted-foreground/60">-</span>}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{doc.provided?.expiration || <span className="text-muted-foreground/60">-</span>}</td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => toast.info(t('subscriptions.detail.toast.addDocumentToast'), { description: t('subscriptions.detail.toast.selectFile', { name: doc.label }) })}>
                            <Upload className="w-3 h-3" />
                            {doc.provided ? t('subscriptions.detail.docsTable.replace') : t('subscriptions.detail.docsTable.add')}
                          </Button>
                        </td>
                        <td className="px-4 py-3">
                          {docState === 'pending' ? (
                            <div className="flex justify-center"><Badge className="bg-muted text-xs text-muted-foreground">{t('subscriptions.detail.onboarding.completion.state.pending')}</Badge></div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm" title={t('subscriptions.detail.docsTable.validateDocument')} aria-label={t('subscriptions.detail.docsTable.validateDocument')} onClick={() => state.handleApproveDocument(doc.key)} className={cn('h-7 w-7 p-0 hover:bg-emerald-50', docState === 'validated' ? 'bg-emerald-50 text-emerald-600' : 'text-muted-foreground')}>
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" title={t('subscriptions.detail.docsTable.rejectDocument')} aria-label={t('subscriptions.detail.docsTable.rejectDocument')} onClick={() => state.handleRejectDocument(doc.key)} className={cn('h-7 w-7 p-0 hover:bg-red-50', docState === 'awaitingCorrection' ? 'bg-red-50 text-red-600' : 'text-muted-foreground')}>
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {showNotAsked &&
                    notAsked.map(doc => (
                      <tr key={doc.key} ref={el => { state.rowRefs.current[doc.key] = el as unknown as HTMLDivElement | null; }} className={cn('bg-muted/30', state.highlightedKey === doc.key && 'bg-primary/5 ring-1 ring-inset ring-primary/50')}>
                        <td className="px-4 py-3 text-sm italic text-muted-foreground">
                          {doc.label}
                          {doc.target && <span> · {t(`${K}.documents.target`, { label: resolved.byKey.get(doc.def.innerSectionId ?? '')?.def.subSectionLabel ?? '', index: doc.target.index })}</span>}
                        </td>
                        <td colSpan={4} className="px-4 py-3 text-xs text-muted-foreground">
                          <span className="font-medium">{t(`${K}.documents.notRequested`)} : </span>
                          <ReasonsBlock reasons={doc.hiddenReasons} resolved={resolved} ownSectionId="documents" onNavigate={state.navigateToQuestion} />
                        </td>
                        <td className="px-4 py-3 text-center"><Badge className="bg-muted text-xs text-muted-foreground"><EyeOff className="w-3 h-3 mr-1" />{t(`${K}.documents.notRequested`)}</Badge></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sélecteur de dossier de démonstration
// ---------------------------------------------------------------------------

function DossierSwitcher({ state }: { state: OnboardingQuestionnaireState }) {
  const { t } = useTranslation();
  const d = state.dossier;
  const facts = [
    t(d.subscriberType === 'individual' ? `${K}.dossier.subscriberIndividual` : `${K}.dossier.subscriberCorporate`),
    d.assisted ? t(`${K}.dossier.assistedBy`, { name: d.distributorName ?? '', segment: d.distributorSegment ?? '' }) : t(`${K}.dossier.direct`),
    t(`${K}.dossier.share`, { share: d.share }),
    d.investorSegments.length ? t(`${K}.dossier.segments`, { segments: d.investorSegments.join(', ') }) : t(`${K}.dossier.segmentNone`),
    d.transfer ? t(`${K}.dossier.transfer`) : null,
    d.fees ? t(`${K}.dossier.fees`, { pct: d.fees.pct }) : null,
    t(d.firstSubscription ? `${K}.dossier.firstSubscription` : `${K}.dossier.repeatSubscription`),
  ].filter(Boolean);

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t(`${K}.dossier.switcher`)}
          </div>
          <div className="inline-flex rounded-lg border border-border bg-white p-0.5">
            {DEMO_DOSSIERS.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => state.setDossierId(option.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  option.id === d.id ? 'bg-primary text-white' : 'text-foreground/80 hover:bg-muted',
                )}
              >
                {t(`${K}.dossier.option`, { id: option.id, name: option.subscriberName })}
              </button>
            ))}
          </div>
          <p className="max-w-3xl text-xs text-muted-foreground">{t(d.situationKey)}</p>
          <div className="flex flex-wrap gap-1.5">
            {facts.map((f, idx) => (
              <Badge key={idx} variant="outline" className="h-5 bg-white text-[11px] font-normal">{f}</Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={state.toggleAllNotAsked}>
          {state.allVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {state.allVisible ? t(`${K}.toggle.hideAll`) : t(`${K}.toggle.showAll`, { count: state.totalNotAsked })}
        </Button>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Bloc complet
// ---------------------------------------------------------------------------

export function OnboardingQuestionnaireBlock({ state }: { state: OnboardingQuestionnaireState }) {
  return (
    <div className="space-y-4">
      <DossierSwitcher state={state} />
      {state.resolved.sections.map(section => (
        <SectionCard key={section.id} section={section} state={state} />
      ))}
      <DocumentsCard state={state} />
    </div>
  );
}
