import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../utils/languageContext';
import {
  Building2,
  User,
  Store,
  TrendingUp,
  Check,
  X,
  Edit2,
  Eye,
  FileText,
  Calendar,
  DollarSign,
  Settings,
  Shield,
  CheckCircle2,
  AlertCircle,
  Upload,
  Download,
  Database,
  MousePointer,
  Zap,
  Mail,
  Flag,
  MousePointerClick,
  Hash,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  Users,
  Clock,
  ArrowDownCircle,
  Wallet,
  FolderOpen,
  MessageSquare,
  PenTool,
  Copy,
  Landmark,
  Layers3,
  Globe,
  Tag,
  ShieldCheck,
  Banknote,
  Phone,
  MapPin,
  CreditCard,
  Percent,
  Handshake,
  RefreshCw,
  History,
  Lock,
  UserCheck,
  ArrowLeft,
  TriangleAlert,
  Link2,
  Share2,
  PencilLine,
  FlaskConical,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { toast } from 'sonner';
import {
  getStatusColor,
  HOLDING_MODE_LABEL_KEYS,
  SUBSCRIBER_TITLE_LABEL_KEYS,
  SUBSCRIPTION_LANGUAGE_LABEL_KEYS,
  SUBSCRIPTION_TYPE_LABEL_KEYS,
  type HoldingMode,
  type SubscriberTitle,
  type SubscriptionLanguageCode,
  type SubscriptionType,
} from '../utils/subscriptionGenerator';
import { copyToClipboard } from '../utils/clipboard';
import { getShareableUrl } from '../utils/routing';
import { SubscriptionInfoPopover } from './SubscriptionInfoPopover';
import { PartyTypeBadge } from './ui/party-type-badge';
import { QuestionActions, QuestionStatus } from './QuestionActions';
import { QuestionCommentThread } from './QuestionCommentThread';
import { IntegrationsTab } from './IntegrationsTab';
import { SectionCard } from './ui/section-card';
import { DetailTabsList } from './ui/detail-tabs';
import {
  Tabs,
  TabsContent,
} from './ui/tabs';
import {
  PageHeader,
  PageHeaderSubtitle,
  PageHeaderSubtitleItem,
  PageHeaderSubtitleSeparator,
  PRIMARY_BUTTON_GRADIENT,
} from './ui/page-header';
import { DetailLink, DetailSummary } from './ui/detail-summary';
import {
  mockSections,
  mockRequiredDocuments,
  mockNotes,
  mockEmails,
  mockCapitalCalls,
  mockInitEmails,
  mockBeneficialOwners,
  MOCK_SUBMISSION_REPORT,
  type MockLinkedTarget,
  type MockRequiredDocument,
} from '../utils/subscriptionDetailMockData';
import {
  AUDIT_DOCUMENTS_SECTION,
  CURRENT_OPERATOR,
  buildInitialSubscriptionAudit,
  countPendingModifications,
  createLiveAuditEntry,
  isModifiedByOperator,
  lastModificationOrigin,
  type SubscriptionAuditOrigin,
  type SubscriptionAuditEntry,
} from '../utils/subscriptionAuditMock';
import { SubscriptionAuditPanel, SubscriptionAuditTab } from './SubscriptionAuditTrail';
import { Tag as NeutralTag } from './Tag';
import { EmptyState } from './EmptyState';
import { RowActionButton } from './ui/row-actions';
import { BlockersPanel } from './ui/blockers-panel';
import { ConfirmDialog } from './ui/confirm-dialog';
import { DisabledReason } from './ui/disabled-reason';
import { Textarea } from './ui/textarea';
import { ManualDocumentPanel, isoToDisplayDate } from './ManualDocumentPanel';
import { QuestionRelationIcons } from './QuestionRelationIcons';
import { AnswerEditPanel, type AnswerEditEffects, type AnswerEditTarget, type AnswerEditTriggerChange } from './AnswerEditPanel';
import { DemoScenarioBar } from './ui/demo-scenario-bar';
import { NotificationsPanel } from './NotificationsPanel';
import { useNotifications, type AnswersModifiedNotification } from '../utils/notificationsContext';
import { Switch } from './ui/switch';
import { PageStateBanner } from './ui/page-state-banner';
import { WorkflowScenarioProvider, useWorkflowScenario } from '../utils/workflowScenarioContext';
import { WorkflowSimulatorPanel } from './WorkflowSimulatorPanel';
import { useSubscriptionWorkflowHeader } from './SubscriptionWorkflowHeader';
import { WorkflowActionLabel, WorkflowActionsProvider, WorkflowRoleActions, useWorkflowActions } from './WorkflowActions';
import { FloatingActionButton } from './ui/floating-action-button';
import { SIDE_PANEL_WIDTH } from './ui/side-panel';
import { StatusBadge } from './StatusBadge';
import { Label } from './ui/label';
import type { MockQuestion } from '../utils/subscriptionDetailMockData';
import {
  OnboardingCompletionCard,
  OnboardingSectionNav,
  OnboardingStateCounter,
  addToBucketStats,
  emptyBucketStats,
  mergeBucketStats,
  type OnboardingBucketStats,
  type OnboardingItemState,
  type OnboardingNavSection,
} from './OnboardingCompletionOverview';
import {
  SubscriptionComplianceSection,
  type ComplianceStatusSnapshot,
} from './SubscriptionComplianceSection';
import { SubscriptionSignatureStep } from './SubscriptionSignatureStep';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { NewSubscriptionDialog } from './NewSubscriptionDialog';
import { NotesTab } from './investor-detail/NotesTab';
import { SubscriptionDocumentsTab, getSubscriptionDocumentsCount } from './SubscriptionDocumentsTab';
import { SubscriptionCapitalCallsTab } from './SubscriptionCapitalCallsTab';
import { createNote } from './investor-detail/NoteEditSheet';
import type { Note } from '../utils/investorGenerator';

const SUBSCRIPTION_STEPS = [
  { id: 0, labelKey: 'subscriptions.detail.stepper.initialization', icon: Settings },
  { id: 1, labelKey: 'subscriptions.detail.stepper.onboarding', icon: FileText },
  { id: 2, labelKey: 'subscriptions.detail.stepper.validation', icon: CheckCircle2 },
  { id: 3, labelKey: 'subscriptions.detail.stepper.signatures', icon: PenTool },
  { id: 4, labelKey: 'subscriptions.detail.stepper.payment', icon: Wallet },
];

// Etat de depart de la maquette : une partie du dossier est deja verifiee, une
// reponse et une piece ont ete retoquees.
const INITIAL_QUESTION_STATUSES: Record<string, QuestionStatus> = {
  'identity-1': 'approved',
  'identity-2': 'approved',
  'identity-4': 'approved',
  'identity-11': 'rejected',
  'fiscal-0': 'approved',
};

const INITIAL_DOCUMENT_STATUSES: Record<string, QuestionStatus> = {
  'document-0': 'approved',
  'document-4': 'rejected',
};

interface SubscriptionDetailPageProps {
  subscription: any;
  onBack: () => void;
}


// Scénarios de démonstration de IC-5616 : profil de l'opérateur et statut de la souscription.
const EDIT_SCENARIOS = ['manager', 'readOnly', 'signedNoRight', 'signedWithRight'] as const;
type EditScenario = (typeof EDIT_SCENARIOS)[number];

/** Élément contrôlable : ni texte d'information, ni question non posée restée vide. */
const isControllable = (question: MockQuestion, response: string) =>
  !question.info && !(question.notAsked && !response);

// Circuit de contrôle du dossier, qui décide des destinataires des alertes (IC-5620).
const REVIEW_CIRCUITS = ['partnerPrevalidation', 'standard', 'fourEyes'] as const;
type ReviewCircuit = (typeof REVIEW_CIRCUITS)[number];
const SECOND_ANALYSTS = ['Paul Girard'];
/** Utilisateur du partenaire délégué qui contrôle le dossier sur le portail (IC-5633). */
const PARTNER_REVIEWER = 'Léa Fontaine';

const MODIFIED_BY_KEY: Record<SubscriptionAuditOrigin, string> = {
  operator: 'subscriptions.detail.onboarding.modified.byOperator',
  partner: 'subscriptions.detail.onboarding.modified.byPartner',
  investor: 'subscriptions.detail.onboarding.modified.byInvestor',
  automatic: 'subscriptions.detail.onboarding.modified.automatic',
  api: 'subscriptions.detail.onboarding.modified.automatic',
};

const DIRECT_PARTNER_NAMES = ['Souscription Directe', 'Direct Subscription'];

export function SubscriptionDetailPage(props: SubscriptionDetailPageProps) {
  return (
    <WorkflowScenarioProvider>
      <WorkflowActionsProvider>
        <SubscriptionDetailPageContent {...props} />
      </WorkflowActionsProvider>
    </WorkflowScenarioProvider>
  );
}

function SubscriptionDetailPageContent({ subscription: subscriptionProp, onBack }: SubscriptionDetailPageProps) {
  const { t, lang } = useTranslation();
  const workflowScenario = useWorkflowScenario();
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const workflowHeader = useSubscriptionWorkflowHeader();
  const workflowActions = useWorkflowActions();
  const workflowMenu = workflowActions.menu?.placement === 'page' ? workflowActions.menu : null;

  // Les modifications faites depuis la modale restent locales : la donnée
  // amont de la maquette n'est pas réécrite.
  const [editedSubscription, setEditedSubscription] = useState<any>(null);
  const subscription = editedSubscription ?? subscriptionProp;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [resentEmails, setResentEmails] = useState<Record<string, string>>({});
  const [idCopied, setIdCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['identity']);
  const [activeTab, setActiveTab] = useState('onboarding');

  // Stepper state — newly created subscriptions carry initialStep=0 so they
  // land on the Initialisation step (the wizard's data is pre-filled below).
  const [currentStep, setCurrentStep] = useState(
    typeof (subscription as any).initialStep === 'number'
      ? (subscription as any).initialStep
      : 1,
  ); // 0: Initialisation, 1: Onboarding, 2: Conformité, 3: Signatures, 4: Paiement

  // Décision de conformité, conservée ici pour rester visible depuis l'étape Signatures.
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatusSnapshot>({
    status: 'awaitingValidation',
    by: null,
    at: null,
  });

  const initData = (subscription as any).initData ?? {};

  // La note interne saisie à la création arrive en tête de l'onglet Notes.
  const initialNotes = useMemo<Note[]>(() => {
    const demo: Note[] = mockNotes.map((mock) => ({
      id: mock.id,
      title: t(mock.titleKey),
      content: `<p>${t(mock.contentKey)}</p>`,
      author: mock.author,
      date: new Date(mock.date),
      type: 'General',
      isImportant: false,
      reminderDate: mock.reminderDate ? new Date(mock.reminderDate) : undefined,
      attachment: mock.attachment ? { name: mock.attachment } : undefined,
    }));
    const created = initData.internalNote;
    if (!created?.title) return demo;
    return [
      {
        ...createNote(),
        id: 'note-creation',
        title: created.title,
        content: created.content,
        date: subscription.createdAt ? new Date(subscription.createdAt) : new Date(),
        reminderDate: created.reminderDate ? new Date(created.reminderDate) : undefined,
        attachment: created.attachment ? { name: created.attachment } : undefined,
      },
      ...demo,
    ];
    // Construites une seule fois : NotesTab garde ensuite son propre état.
  }, []);
  const [notesCount, setNotesCount] = useState(initialNotes.length);

  
  // Question states management
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>(INITIAL_QUESTION_STATUSES);
  const [questionResponses, setQuestionResponses] = useState<Record<string, string>>({});
  const [activeCommentThread, setActiveCommentThread] = useState<string | null>(null);
  const [questionComments, setQuestionComments] = useState<Record<string, any[]>>({});

  // Verification des pieces justificatives (meme cycle de vie que les reponses)
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, QuestionStatus>>(INITIAL_DOCUMENT_STATUSES);
  const [requiredDocuments, setRequiredDocuments] = useState<MockRequiredDocument[]>(mockRequiredDocuments);
  const [documentToReject, setDocumentToReject] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isManualDocumentOpen, setIsManualDocumentOpen] = useState(false);
  const updateDocument = (idx: number, patch: Partial<MockRequiredDocument>) =>
    setRequiredDocuments(prev => prev.map((doc, i) => (i === idx ? { ...doc, ...patch } : doc)));
  const docLabel = (doc: MockRequiredDocument) => doc.name ?? t(doc.nameKey);
  const isMissingIssueDate = (doc: MockRequiredDocument) =>
    doc.hasFile && Boolean(doc.requiresIssueDate) && !doc.issueDate;
  const [activeOnboardingSection, setActiveOnboardingSection] = useState<string>(mockSections[0].id);
  const onboardingSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Piste d'audit : saisie, modifications, validations et commentaires de chaque élément.
  const [auditEntries, setAuditEntries] = useState<SubscriptionAuditEntry[]>(() =>
    buildInitialSubscriptionAudit({
      investorName: subscriptionProp.contrepartie?.investor || subscriptionProp.contrepartie?.name || '',
      sections: mockSections,
      documents: mockRequiredDocuments,
      questionStatuses: INITIAL_QUESTION_STATUSES,
      documentStatuses: INITIAL_DOCUMENT_STATUSES,
    }),
  );
  const [editScenario, setEditScenario] = useState<EditScenario>('manager');
  const canManage = editScenario !== 'readOnly';
  const afterSignature = editScenario === 'signedNoRight' || editScenario === 'signedWithRight';
  const canModifyAnswers = canManage && (!afterSignature || editScenario === 'signedWithRight');
  const [answerEdit, setAnswerEdit] = useState<{ sectionId: string; idx: number } | null>(null);
  const [notAskedVisible, setNotAskedVisible] = useState<string[]>([]);
  const [modifiedOnly, setModifiedOnly] = useState(false);
  const [reviewCircuit, setReviewCircuit] = useState<ReviewCircuit>('standard');
  const { push: pushNotification } = useNotifications();
  const [distributorPreview, setDistributorPreview] = useState<AnswersModifiedNotification | null>(null);
  const [partnerValidation, setPartnerValidation] = useState<{ by: string; at: string } | null>(null);

  // Lien d'une notification : onglet Onboarding filtré sur les réponses modifiées.
  const openModifiedAnswersAt = (subscriptionProp as { openModifiedAnswersAt?: number }).openModifiedAnswersAt;
  useEffect(() => {
    if (!openModifiedAnswersAt) return;
    setActiveTab('onboarding');
    setCurrentStep(1);
    setModifiedOnly(true);
  }, [openModifiedAnswersAt]);
  const responseOf = (sectionId: string, idx: number, question: MockQuestion) =>
    questionResponses[`${sectionId}-${idx}`] ?? question.response;
  // Valeurs des données liées (souscription, fiche investisseur...), modifiées par la propagation.
  const [linkedData, setLinkedData] = useState<Record<string, string>>({});
  const linkedKey = (questionId: string, object: string, field: string) => `${questionId}:${object}.${field}`;
  /** Valeur de la donnée liée : celle reportée à la soumission, sauf propagation ultérieure. */
  const linkedValueOf = (questionId: string, question: MockQuestion, target: MockLinkedTarget) =>
    linkedData[linkedKey(questionId, target.object, target.field)] ?? question.response;
  const targetLabelOf = (target: { object: string; field: string }) =>
    `${t(`subscriptions.detail.answerEffects.objects.${target.object}`)} · ${t(`subscriptions.detail.answerEffects.fields.${target.field}`)}`;
  // Questions qui en déclenchent une autre, indexées par la question déclenchée.
  const impactedByMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    mockSections.forEach(section =>
      section.questions.forEach(question =>
        question.triggers?.forEach(trigger => {
          const idx = section.questions.findIndex(q => q.question === trigger.question);
          if (idx < 0) return;
          const key = `${section.id}-${idx}`;
          map[key] = [...(map[key] ?? []), question.question.replace(/\s*\*\s*$/, '')];
        }),
      ),
    );
    return map;
  }, []);
  const [auditElement, setAuditElement] = useState<{ elementId: string; sectionId: string } | null>(null);
  const logAudit = (...entries: Parameters<typeof createLiveAuditEntry>[0][]) =>
    setAuditEntries(prev => [...prev, ...entries.map(createLiveAuditEntry)]);
  const sectionOf = (elementId: string) => elementId.slice(0, elementId.lastIndexOf('-'));

  // Risk validation state
  const [riskValidated, setRiskValidated] = useState(false);
  const [riskValidationDate, setRiskValidationDate] = useState<string | null>(null);
  const [riskValidatedBy, setRiskValidatedBy] = useState<string | null>(null);

  const handleInvalidateRisk = () => {
    setRiskValidated(false);
    setRiskValidationDate(null);
    setRiskValidatedBy(null);
    toast.info(t('subscriptions.detail.compliance.toast.scoreInvalidated'));
  };

  const handleValidateRisk = () => {
    setRiskValidated(true);
    const now = new Date();
    setRiskValidationDate(now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    setRiskValidatedBy('Jean Dupont'); // In production, use actual user name
    toast.success(t('subscriptions.detail.toast.riskValidated'), {
      description: t('subscriptions.detail.toast.riskValidatedDesc')
    });
  };

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleValidateSection = (sectionId: string, sectionTitle: string) => {
    const section = mockSections.find(s => s.id === sectionId);
    if (!section) return;

    // Seules les questions répondues sont validées : une question vide reste à compléter.
    const newStatuses = { ...questionStatuses };
    const logged: Parameters<typeof createLiveAuditEntry>[0][] = [];
    let validated = 0;
    let skipped = 0;
    section.questions.forEach((question, idx) => {
      const questionId = `${sectionId}-${idx}`;
      const response = responseOf(sectionId, idx, question);
      if (!isControllable(question, response)) return;
      if (!response?.trim()) {
        skipped += 1;
        return;
      }
      if (newStatuses[questionId] !== 'approved') {
        logged.push({ type: 'answerValidated', elementId: questionId, sectionId, viaSection: true });
      }
      newStatuses[questionId] = 'approved';
      validated += 1;
    });

    setQuestionStatuses(newStatuses);
    logAudit(...logged);

    const description = t('subscriptions.detail.onboarding.sectionValidatedDesc', { count: validated, title: sectionTitle });
    toast.success(t('subscriptions.detail.onboarding.sectionValidatedToast'), {
      description: skipped > 0
        ? `${description} ${t('subscriptions.detail.onboarding.sectionValidatedSkippedDesc', { count: skipped })}`
        : description,
    });
  };

  const handleExportDocuments = () => {
    toast.success(t('subscriptions.detail.toast.exportInProgress'), {
      description: t('subscriptions.detail.toast.exportInProgressDesc'),
    });
  };

  const handleAddDocument = (docName: string) => {
    toast.info(t('subscriptions.detail.toast.addDocumentToast'), {
      description: docName ? t('subscriptions.detail.toast.selectFile', { name: docName }) : t('subscriptions.detail.toast.selectFileGeneric'),
    });
  };

  const handleViewDocument = (docName: string) => {
    toast.info(t('subscriptions.detail.toast.documentPreview'), {
      description: t('subscriptions.detail.toast.documentPreviewDesc', { name: docName }),
    });
  };

  // Question actions handlers
  const handleApproveQuestion = (questionId: string) => {
    setQuestionStatuses(prev => ({ ...prev, [questionId]: 'approved' }));
    logAudit({ type: 'answerValidated', elementId: questionId, sectionId: sectionOf(questionId) });
  };

  const handleRejectQuestion = (questionId: string) => {
    setQuestionStatuses(prev => ({ ...prev, [questionId]: 'rejected' }));
    logAudit({ type: 'answerInvalidated', elementId: questionId, sectionId: sectionOf(questionId) });
  };

  const handleModifyQuestion = (questionId: string, newValue: string, previousValue: string, reason?: string) => {
    setQuestionResponses(prev => ({ ...prev, [questionId]: newValue }));
    // La réponse modifiée repasse à contrôler.
    setQuestionStatuses(prev => {
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
    logAudit({
      type: 'answerModified',
      elementId: questionId,
      sectionId: sectionOf(questionId),
      previousValue,
      newValue,
      reason,
    });
    toast.success(t('subscriptions.detail.questionActions.modifiedToast'), {
      description: t('subscriptions.detail.questionActions.modifiedToastDesc'),
    });
  };

  const editTargets = (sectionId: string, idx: number): AnswerEditTarget[] => {
    const question = mockSections.find(sec => sec.id === sectionId)?.questions[idx];
    const questionId = `${sectionId}-${idx}`;
    return (question?.targets ?? []).filter(target => target.direction !== 'fromTarget').map(target => {
      const key = linkedKey(questionId, target.object, target.field);
      return {
        key,
        object: target.object,
        field: target.field,
        currentValue: linkedData[key] ?? question?.response ?? '',
      };
    });
  };

  const resolveTriggerChanges = (sectionId: string, idx: number, nextValue: string): AnswerEditTriggerChange[] => {
    const section = mockSections.find(sec => sec.id === sectionId);
    const question = section?.questions[idx];
    if (!section || !question?.triggers) return [];
    return question.triggers.flatMap(trigger => {
      const targetIdx = section.questions.findIndex(q => q.question === trigger.question);
      if (targetIdx < 0) return [];
      const target = section.questions[targetIdx];
      const elementId = `${sectionId}-${targetIdx}`;
      const currentValue = responseOf(sectionId, targetIdx, target);
      const next = trigger.values[nextValue] ?? trigger.otherwise ?? currentValue;
      if (next === currentValue) return [];
      return [{
        elementId,
        label: target.question.replace(/\s*\*\s*$/, ''),
        currentValue,
        nextValue: next,
        kept: isModifiedByOperator(auditEntries, elementId),
      }];
    });
  };

  const applyAnswerEffects = (sectionId: string, idx: number, value: string, effects: AnswerEditEffects): string[] => {
    const questionId = `${sectionId}-${idx}`;
    const targets = editTargets(sectionId, idx).filter(target => effects.propagate.includes(target.key));
    const replayed = effects.replay
      ? resolveTriggerChanges(sectionId, idx, value).filter(change => !change.kept)
      : [];
    if (targets.length > 0) {
      setLinkedData(prev => {
        const next = { ...prev };
        targets.forEach(target => {
          next[target.key] = value;
        });
        return next;
      });
    }
    if (replayed.length > 0) {
      setQuestionResponses(prev => {
        const next = { ...prev };
        replayed.forEach(change => {
          next[change.elementId] = change.nextValue;
        });
        return next;
      });
      setQuestionStatuses(prev => {
        const next = { ...prev };
        replayed.forEach(change => delete next[change.elementId]);
        return next;
      });
    }
    logAudit(
      ...targets.map(target => ({
        type: value === '' ? ('dataReset' as const) : ('dataPropagated' as const),
        elementId: questionId,
        sectionId,
        previousValue: target.currentValue,
        newValue: value,
        target: { object: target.object, field: target.field },
      })),
      ...replayed.map(change => ({
        type: 'answerReplayed' as const,
        origin: 'automatic' as const,
        actorName: undefined,
        elementId: change.elementId,
        sectionId,
        previousValue: change.currentValue,
        newValue: change.nextValue,
        causeElementId: questionId,
      })),
    );
    return replayed.map(change => change.elementId);
  };

  const handlePropagateReported = (sectionId: string, idx: number, target: MockLinkedTarget) => {
    const question = mockSections.find(sec => sec.id === sectionId)?.questions[idx];
    if (!question) return;
    const questionId = `${sectionId}-${idx}`;
    const value = responseOf(sectionId, idx, question);
    const previous = linkedValueOf(questionId, question, target);
    setLinkedData(prev => ({ ...prev, [linkedKey(questionId, target.object, target.field)]: value }));
    logAudit({
      type: value === '' ? 'dataReset' : 'dataPropagated',
      elementId: questionId,
      sectionId,
      previousValue: previous,
      newValue: value,
      target: { object: target.object, field: target.field },
    });
    toast.success(t('subscriptions.detail.report.propagatedToast'), { description: targetLabelOf(target) });
  };

  const questionLabelOf = (questionId: string) => {
    const sectionId = sectionOf(questionId);
    const section = mockSections.find(sec => sec.id === sectionId);
    const question = section?.questions[Number(questionId.slice(sectionId.length + 1))];
    if (!section || !question) return questionId;
    const label = question.question.replace(/\s*\*\s*$/, '');
    return question.iteration !== undefined && section.iterationLabelKey
      ? `${label} (${t(section.iterationLabelKey, { n: question.iteration })})`
      : label;
  };

  /** Une alerte par enregistrement, jamais à l'auteur, selon le circuit de contrôle (IC-5620). */
  const notifyModifiedAnswers = (questionIds: string[], origin: SubscriptionAuditOrigin, authorName: string) => {
    if (questionIds.length === 0 || reviewCircuit === 'standard') return;
    const partner = subscription.partenaire?.name ?? t('subscriptions.detail.answerAlerts.partnerFallback');
    const recipients = (
      reviewCircuit === 'fourEyes'
        ? [
            { name: CURRENT_OPERATOR, role: t('subscriptions.detail.answerAlerts.roles.analyst1') },
            ...SECOND_ANALYSTS.map(name => ({ name, role: t('subscriptions.detail.answerAlerts.roles.analyst2') })),
          ]
        : [
            { name: partner, role: t('subscriptions.detail.answerAlerts.roles.partner') },
            ...(subscription.advisor
              ? [{ name: subscription.advisor as string, role: t('subscriptions.detail.answerAlerts.roles.advisor') }]
              : []),
          ]
    ).filter(recipient => recipient.name !== authorName);
    if (recipients.length === 0) return;

    const notification = {
      subscriptionName: subscription.name,
      subscription: subscriptionProp,
      labels: questionIds.map(questionLabelOf),
      origin,
      authorName,
      channel: reviewCircuit === 'fourEyes' ? ('backOffice' as const) : ('distributor' as const),
    };
    if (recipients.some(recipient => recipient.name === CURRENT_OPERATOR)) pushNotification(notification);
    const recipientLabel = recipients.map(recipient => `${recipient.name} (${recipient.role})`).join(', ');
    logAudit({
      type: 'notificationSent',
      origin: 'automatic',
      actorName: undefined,
      newValue: recipientLabel,
      reason: t(
        questionIds.length === 1
          ? 'subscriptions.detail.answerAlerts.auditSummaryOne'
          : 'subscriptions.detail.answerAlerts.auditSummaryMany',
        { count: questionIds.length },
      ),
    });
    toast.info(t('subscriptions.detail.answerAlerts.sentToast'), {
      description: t('subscriptions.detail.answerAlerts.sentToastDesc', { recipients: recipientLabel }),
      action:
        reviewCircuit === 'partnerPrevalidation'
          ? {
              label: t('subscriptions.detail.answerAlerts.preview'),
              onClick: () =>
                setDistributorPreview({
                  ...notification,
                  id: 'preview',
                  createdAt: new Date().toISOString(),
                  read: false,
                }),
            }
          : undefined,
    });
  };

  const handleSimulatePartnerReview = () => {
    if (partnerValidation) return;
    const profile = mockSections.find(sec => sec.id === 'investorProfile');
    const identity = mockSections.find(sec => sec.id === 'identity');
    const partnerEntry = { origin: 'partner' as const, actorName: PARTNER_REVIEWER };
    const validated = (profile?.questions ?? []).map((_, idx) => `investorProfile-${idx}`);
    const phoneIdx = identity?.questions.findIndex(q => q.question.startsWith('Numéro de téléphone')) ?? -1;
    const rejected = phoneIdx >= 0 ? `identity-${phoneIdx}` : null;
    const docIdx = requiredDocuments.findIndex(doc => doc.nameKey === 'subscriptions.detail.docs.rib');

    setQuestionStatuses(prev => {
      const next = { ...prev };
      validated.forEach(id => {
        next[id] = 'approved';
      });
      if (rejected) next[rejected] = 'rejected';
      return next;
    });
    if (docIdx >= 0) setDocumentStatuses(prev => ({ ...prev, [`document-${docIdx}`]: 'approved' }));
    const at = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    setPartnerValidation({
      by: PARTNER_REVIEWER,
      at: `${pad(at.getDate())}/${pad(at.getMonth() + 1)}/${at.getFullYear()} ${pad(at.getHours())}:${pad(at.getMinutes())}`,
    });
    logAudit(
      ...validated.map(id => ({ ...partnerEntry, type: 'answerValidated' as const, elementId: id, sectionId: 'investorProfile', viaSection: true })),
      ...(rejected
        ? [{ ...partnerEntry, type: 'answerInvalidated' as const, elementId: rejected, sectionId: 'identity', reason: t('subscriptions.detail.partnerReview.mockRejectReason') }]
        : []),
      ...(docIdx >= 0
        ? [{ ...partnerEntry, type: 'documentValidated' as const, elementId: `document-${docIdx}`, sectionId: AUDIT_DOCUMENTS_SECTION }]
        : []),
      { ...partnerEntry, type: 'investorReminded' as const, reason: t('subscriptions.detail.partnerReview.mockReminder') },
      { ...partnerEntry, type: 'partnerValidated' as const, newValue: t('subscriptions.detail.partnerReview.transmitted') },
    );
    toast.success(t('subscriptions.detail.partnerReview.validatedToast', { partner: delegatedPartnerName }), {
      description: t('subscriptions.detail.partnerReview.validatedToastDesc'),
    });
  };

  const handleSimulateInvestorChange = () => {
    const investorName = subscription.contrepartie?.investor || subscription.contrepartie?.name || '';
    const changes = [
      { question: 'Ville*', value: 'Neuilly-sur-Seine' },
      { question: 'Code postal*', value: '92200' },
    ].flatMap(change => {
      const section = mockSections.find(sec => sec.id === 'identity');
      const idx = section?.questions.findIndex(q => q.question === change.question) ?? -1;
      if (!section || idx < 0) return [];
      return [{ questionId: `identity-${idx}`, previous: responseOf('identity', idx, section.questions[idx]), value: change.value }];
    });
    setQuestionResponses(prev => {
      const next = { ...prev };
      changes.forEach(change => {
        next[change.questionId] = change.value;
      });
      return next;
    });
    setQuestionStatuses(prev => {
      const next = { ...prev };
      changes.forEach(change => delete next[change.questionId]);
      return next;
    });
    logAudit(
      ...changes.map(change => ({
        type: 'answerModified' as const,
        origin: 'investor' as const,
        actorName: investorName,
        elementId: change.questionId,
        sectionId: 'identity',
        previousValue: change.previous,
        newValue: change.value,
      })),
    );
    notifyModifiedAnswers(changes.map(change => change.questionId), 'investor', investorName);
    if (reviewCircuit === 'standard') {
      toast.info(t('subscriptions.detail.answerAlerts.noCircuitToast'));
    }
  };

  const handleToggleComment = (questionId: string) => {
    setActiveCommentThread(activeCommentThread === questionId ? null : questionId);
  };

  // Comment management handlers
  const handleAddComment = (questionId: string, comment: any) => {
    setQuestionComments(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] || []), comment]
    }));
    logAudit({
      type: 'commentAdded',
      elementId: questionId,
      sectionId: sectionOf(questionId),
      newValue: typeof comment?.text === 'string' ? comment.text : undefined,
    });
  };

  const handleResolveComment = (questionId: string, commentId: string) => {
    setQuestionComments(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || []).map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      )
    }));
  };

  const handleDeleteComment = (questionId: string, commentId: string) => {
    setQuestionComments(prev => ({
      ...prev,
      [questionId]: (prev[questionId] || []).filter(c => c.id !== commentId)
    }));
  };

  // Etat d'une reponse : non remplie, en attente de validation, a corriger ou validee
  const getQuestionState = (
    sectionId: string,
    idx: number,
    question: { response: string },
  ): OnboardingItemState => {
    const questionId = `${sectionId}-${idx}`;
    const status = questionStatuses[questionId];
    if (status === 'approved') return 'validated';
    if (status === 'rejected') return 'awaitingCorrection';
    const response = questionResponses[questionId] ?? question.response;
    return response ? 'awaitingValidation' : 'pending';
  };

  const getDocumentState = (idx: number, doc: { hasFile: boolean }): OnboardingItemState => {
    const status = documentStatuses[`document-${idx}`];
    if (status === 'approved') return 'validated';
    if (status === 'rejected') return 'awaitingCorrection';
    return doc.hasFile ? 'awaitingValidation' : 'pending';
  };

  const getQuestionSectionBuckets = (sectionId: string): OnboardingBucketStats => {
    const stats = emptyBucketStats();
    const section = mockSections.find(s => s.id === sectionId);
    if (!section) return stats;
    section.questions.forEach((question, idx) => {
      if (!isControllable(question, responseOf(sectionId, idx, question))) return;
      addToBucketStats(stats, getQuestionState(sectionId, idx, question));
    });
    return stats;
  };

  const getDocumentBuckets = (): OnboardingBucketStats => {
    const stats = emptyBucketStats();
    requiredDocuments.forEach((doc, idx) => {
      addToBucketStats(stats, getDocumentState(idx, doc));
    });
    return stats;
  };

  const getSectionBuckets = (sectionId: string): OnboardingBucketStats =>
    sectionId === 'documents' ? getDocumentBuckets() : getQuestionSectionBuckets(sectionId);

  const questionBuckets = mockSections.reduce((acc, section) => {
    if (section.id !== 'documents') {
      mergeBucketStats(acc, getQuestionSectionBuckets(section.id));
    }
    return acc;
  }, emptyBucketStats());

  const documentBuckets = getDocumentBuckets();


  const isCorporateInvestor = subscription.contrepartie?.type === 'corporate';

  const modifiedOriginOf = (questionId: string) => lastModificationOrigin(auditEntries, questionId);
  const modifiedCountOf = (sectionId: string) =>
    mockSections
      .find(sec => sec.id === sectionId)
      ?.questions.filter((_, idx) => modifiedOriginOf(`${sectionId}-${idx}`) !== null).length ?? 0;
  const modifiedTotal = mockSections.reduce((sum, sec) => sum + modifiedCountOf(sec.id), 0);

  const handleExportDossier = () => {
    const csvField = (v: string) => (/[";\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const header = ['section', 'question', 'answer', 'control', 'indicator'].map(col =>
      t(`subscriptions.detail.dossierExport.columns.${col}`),
    );
    const rows = mockSections.flatMap(section =>
      section.questions.flatMap((question, idx) => {
        if (question.info) return [];
        const questionId = `${section.id}-${idx}`;
        const response = responseOf(section.id, idx, question);
        const origin = modifiedOriginOf(questionId);
        const iteration =
          question.iteration !== undefined && section.iterationLabelKey
            ? ` (${t(section.iterationLabelKey, { n: question.iteration })})`
            : '';
        return [[
          t(section.titleKey),
          question.question.replace(/\s*\*\s*$/, '') + iteration,
          response,
          t(`subscriptions.detail.onboarding.completion.state.${getQuestionState(section.id, idx, question)}`),
          origin ? t(MODIFIED_BY_KEY[origin]) : '',
        ]];
      }),
    );
    const csv = '\ufeff' + [header, ...rows].map(row => row.map(csvField).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `dossier_${String(subscription.id)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(t('subscriptions.detail.dossierExport.toast'));
  };

  const documentBlockers = requiredDocuments
    .map((doc, idx) => ({ doc, idx }))
    .filter(({ doc }) => isMissingIssueDate(doc));
  const delegatedPartnerName = subscription.partenaire?.name ?? t('subscriptions.detail.answerAlerts.partnerFallback');
  const awaitingPartner = reviewCircuit === 'partnerPrevalidation' && !partnerValidation;
  const validationBlockedReason =
    documentBlockers.length > 0
      ? t('subscriptions.detail.documentControl.validationBlocked', { count: documentBlockers.length })
      : awaitingPartner
        ? t('subscriptions.detail.partnerReview.awaitingPartner', { partner: delegatedPartnerName })
        : undefined;

  const onboardingNavSections: OnboardingNavSection[] = mockSections.map((section, idx) => ({
    id: section.id,
    titleKey: section.titleKey,
    icon: section.icon,
    position: idx + 1,
    kind: section.id === 'documents' ? 'documents' : 'questions',
    stats: getSectionBuckets(section.id),
    groupKey: section.preonboarding
      ? 'subscriptions.detail.onboarding.preonboarding.group'
      : 'subscriptions.detail.onboarding.preonboarding.dossierGroup',
  }));

  const handleSelectOnboardingSection = (sectionId: string) => {
    setActiveOnboardingSection(sectionId);
    setOpenSections(prev => (prev.includes(sectionId) ? prev : [...prev, sectionId]));
    onboardingSectionRefs.current[sectionId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleApproveDocument = (idx: number) => {
    setDocumentStatuses(prev => ({ ...prev, [`document-${idx}`]: 'approved' }));
    logAudit({ type: 'documentValidated', elementId: `document-${idx}`, sectionId: AUDIT_DOCUMENTS_SECTION });
  };

  const handleRejectDocument = (idx: number) => {
    setRejectionReason('');
    setDocumentToReject(idx);
  };

  const handleConfirmRejectDocument = () => {
    if (documentToReject === null) return;
    const idx = documentToReject;
    const reason = rejectionReason.trim();
    setDocumentStatuses(prev => ({ ...prev, [`document-${idx}`]: 'rejected' }));
    updateDocument(idx, { rejectionReason: reason });
    logAudit({ type: 'documentRejected', elementId: `document-${idx}`, sectionId: AUDIT_DOCUMENTS_SECTION, reason });
    toast.error(t('subscriptions.detail.documentControl.rejectedToast'), {
      description: t('subscriptions.detail.documentControl.rejectedToastDesc', { name: docLabel(requiredDocuments[idx]) }),
    });
    setDocumentToReject(null);
  };

  const handleIssueDateChange = (idx: number, iso: string) => {
    const issueDate = isoToDisplayDate(iso);
    if (!issueDate) return;
    updateDocument(idx, { issueDate });
    logAudit({
      type: 'documentDatesUpdated',
      elementId: `document-${idx}`,
      sectionId: AUDIT_DOCUMENTS_SECTION,
      previousValue: '',
      newValue: issueDate,
    });
  };

  const handleSaveManualDocument = (input: { name: string; fileName: string; issueDate: string; expiration: string }) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const idx = requiredDocuments.length;
    setRequiredDocuments(prev => [
      ...prev,
      {
        nameKey: '',
        name: input.name,
        manual: true,
        hasFile: true,
        dateSent: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
        issueDate: input.issueDate,
        expiration: input.expiration,
      },
    ]);
    logAudit({
      type: 'documentUploaded',
      elementId: `document-${idx}`,
      sectionId: AUDIT_DOCUMENTS_SECTION,
      newValue: input.fileName,
    });
    setIsManualDocumentOpen(false);
    toast.success(t('subscriptions.detail.manualDocument.savedToast'), {
      description: t('subscriptions.detail.manualDocument.savedToastDesc', { name: input.name }),
    });
  };

  const handleValidateDocuments = (sectionTitle: string) => {
    const next: Record<string, QuestionStatus> = { ...documentStatuses };
    let validated = 0;
    const logged: Parameters<typeof createLiveAuditEntry>[0][] = [];
    requiredDocuments.forEach((doc, idx) => {
      if (doc.hasFile && !isMissingIssueDate(doc)) {
        if (next[`document-${idx}`] !== 'approved') {
          logged.push({
            type: 'documentValidated',
            elementId: `document-${idx}`,
            sectionId: AUDIT_DOCUMENTS_SECTION,
            viaSection: true,
          });
        }
        next[`document-${idx}`] = 'approved';
        validated += 1;
      }
    });
    setDocumentStatuses(next);
    logAudit(...logged);
    toast.success(t('subscriptions.detail.onboarding.sectionValidatedToast'), {
      description: t('subscriptions.detail.onboarding.completion.documentsValidatedDesc', {
        count: validated,
        title: sectionTitle,
      }),
    });
  };

  const formatLongDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const formatStepDate = (date: Date) =>
    date.toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Jalons du bandeau d'etapes : chaine chronologique tiree des dates reelles de
  // la souscription, un jalon ne pouvant jamais preceder le precedent.
  const stepMilestones: Array<Date | null> = (() => {
    const toDate = (value: Date | string | null | undefined) => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };
    let previous: Date | null = null;
    return [
      subscription.createdAt,
      subscription.lastActionDate,
      subscription.sentToSignatureAt,
      subscription.investorSignedAt,
      subscription.activatedAt,
    ].map(raw => {
      const date = toDate(raw);
      if (!date) return null;
      const milestone = previous && date < previous ? previous : date;
      previous = milestone;
      return milestone;
    });
  })();

  const formatAmount = (value: number) =>
    `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\u00a0€`;

  const formatRatio = (value: number) =>
    subscription.amount > 0 ? `${Math.round((value / subscription.amount) * 100)}%` : '0%';

  const exportAction = {
    label: t('subscriptions.detail.header.exportData'),
    icon: <Download className="w-4 h-4" />,
    onClick: handleExportDossier,
  };

  // Fonds à paiement direct : pas d'appels ni de distributions, le montant dû est réglé en une fois.
  const entryFeesAmount = (subscription.amount * (subscription.entryFees ?? 0)) / 100;
  const premiumAmount = subscription.subscriptionPremium ?? 0;
  const directPaymentMetrics = [
    {
      id: 'subscribed',
      label: t('subscriptions.detail.header.subscribedAmount'),
      value: formatAmount(subscription.amount),
      secondaryValue: t('subscriptions.detail.header.shares', { count: subscription.quantity.toLocaleString('fr-FR') }),
      icon: DollarSign,
    },
    { id: 'entryFees', label: t('subscriptions.workflowSimulator.header.metrics.entryFees'), value: formatAmount(entryFeesAmount), icon: Percent },
    { id: 'premium', label: t('subscriptions.workflowSimulator.header.metrics.premium'), value: formatAmount(premiumAmount), icon: Banknote },
    {
      id: 'totalDue',
      label: t('subscriptions.workflowSimulator.header.metrics.totalDue'),
      value: formatAmount(subscription.amount + entryFeesAmount + premiumAmount),
      icon: Wallet,
    },
  ];

  const openInNewTab = t('subscriptions.detail.header.openInNewTab');
  const investorUrl = getShareableUrl('investors');
  const structureUrl = getShareableUrl('entities');
  const partnerUrl = getShareableUrl('partners');
  const fundUrl = getShareableUrl('allfunds');

  const toEmail = (name: string | undefined, domain: string) =>
    name
      ? `${name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z\s-]/g, '')
          .trim()
          .replace(/\s+/g, '.')}@${domain}`
      : '';

  const partnerName = subscription.partenaire?.name as string | undefined;
  const partnerDomain = partnerName
    ? `${partnerName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}.fr`
    : '';

  const investorEmail =
    subscription.email ||
    toEmail(subscription.contrepartie.investor || subscription.contrepartie.name, 'example.com');
  const partnerEmail = partnerDomain ? `contact@${partnerDomain}` : '';
  const advisorEmail = subscription.advisor && partnerDomain
    ? toEmail(subscription.advisor, partnerDomain)
    : '';

  // L'invitation part toujours à l'investisseur. Sur une souscription
  // intermédiée, le réseau qui porte la souscription (son conseiller s'il y en
  // a un, sinon le distributeur) reçoit le même mail en copie, selon la règle
  // de copie du réseau.
  const isIntermediated =
    initData.isIntermediated ?? (!!partnerName && !DIRECT_PARTNER_NAMES.includes(partnerName));
  const invitationRecipient = investorEmail;
  const invitationRecipientLabelKey = 'subscriptions.detail.initStep.audiences.investor';
  const networkCopy = advisorEmail
    ? { id: 'advisor', labelKey: 'subscriptions.detail.initStep.audiences.advisor', email: advisorEmail }
    : { id: 'partner', labelKey: 'subscriptions.detail.initStep.audiences.partner', email: partnerEmail };
  const invitationCopies: Array<{ id: string; labelKey: string; email: string }> =
    isIntermediated && networkCopy.email ? [networkCopy] : [];

  const invitationEmail = mockInitEmails.find(mail => mail.id === 'invitation');
  const invitationSentAt = resentEmails.invitation ?? invitationEmail?.sentAt ?? null;

  const handleResendEmail = (id: string, templateKey: string, recipient: string) => {
    const now = new Date();
    const stamp = `${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    setResentEmails(prev => ({ ...prev, [id]: stamp }));
    toast.success(t('subscriptions.detail.initStep.toast.emailResent', { template: t(templateKey) }), {
      description: t('subscriptions.detail.initStep.toast.emailResentDesc', { recipient }),
    });
  };

  // Libellés des valeurs techniques du détail complet (repli "Plus" du bloc).
  const yesNo = (value: boolean | undefined) =>
    t(value ? 'subscriptions.detail.form.yes' : 'subscriptions.detail.form.no');
  const formatPercent = (value: number | null | undefined) =>
    value === undefined || value === null ? undefined : `${value.toLocaleString('fr-FR')} %`;
  const formatShortDate = (value: Date | string | null | undefined) => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toLocaleDateString('fr-FR');
  };
  const sharePrice = subscription.quantity > 0 ? subscription.amount / subscription.quantity : undefined;
  const holdingModeLabel = subscription.holdingMode
    ? t(HOLDING_MODE_LABEL_KEYS[subscription.holdingMode as HoldingMode] ?? subscription.holdingMode)
    : undefined;
  const subscriptionTypeLabel = subscription.subscriptionType
    ? t(SUBSCRIPTION_TYPE_LABEL_KEYS[subscription.subscriptionType as SubscriptionType] ?? subscription.subscriptionType)
    : undefined;
  const subscriberTitleLabel = subscription.subscriberTitle
    ? t(SUBSCRIBER_TITLE_LABEL_KEYS[subscription.subscriberTitle as SubscriberTitle] ?? subscription.subscriberTitle)
    : undefined;
  const languageLabel = subscription.language
    ? t(SUBSCRIPTION_LANGUAGE_LABEL_KEYS[subscription.language as SubscriptionLanguageCode] ?? subscription.language)
    : undefined;

  // Rafraichissement de la souscription : la maquette n'a pas de backend, le
  // bouton simule l'aller-retour et horodate la derniere synchronisation.
  const handleRefreshSubscription = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    window.setTimeout(() => {
      const stamp = new Date().toLocaleTimeString(lang === 'en' ? 'en-GB' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setIsRefreshing(false);
      setLastRefreshAt(stamp);
      toast.success(t('subscriptions.detail.toast.refreshed'), {
        description: t('subscriptions.detail.toast.refreshedDesc', { time: stamp }),
      });
    }, 900);
  };

  const detailSummary = (
    <DetailSummary
      newTabTitle={openInNewTab}
      actions={
        <>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={handleRefreshSubscription}
            disabled={isRefreshing}
            title={t('subscriptions.detail.refreshHint')}
            aria-label={t(
              isRefreshing
                ? 'subscriptions.detail.refreshingButton'
                : 'subscriptions.detail.refreshButton',
            )}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5 hover:text-primary h-9"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit2 className="w-3.5 h-3.5" />
            {t('subscriptions.detail.editButton')}
          </Button>
        </>
      }
      aside={
        lastRefreshAt ? (
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {t('subscriptions.detail.lastRefresh', { time: lastRefreshAt })}
          </span>
        ) : undefined
      }
      attributes={[
        {
          id: 'investor',
          label: t('subscriptions.detail.header.investor'),
          value: subscription.contrepartie.investor || subscription.contrepartie.name,
          icon: User,
          href: investorUrl,
        },
        {
          id: 'structure',
          label: t('subscriptions.detail.header.structure'),
          value: subscription.contrepartie.structure,
          icon: Building2,
          href: structureUrl,
        },
        {
          id: 'partner',
          label: t('subscriptions.detail.header.partner'),
          value: subscription.partenaire?.name ?? t('subscriptions.detail.header.directInvestment'),
          secondaryValue: subscription.advisor
            ? t('subscriptions.detail.header.advisor', { name: subscription.advisor })
            : undefined,
          icon: Users,
          href: subscription.partenaire ? partnerUrl : undefined,
        },
        {
          id: 'fees',
          label: t('subscriptions.detail.header.fees'),
          value: t('subscriptions.detail.header.entryFees', {
            amount: formatAmount(((subscription.amount * (subscription.entryFees ?? 0)) / 100)),
          }),
          secondaryValue: t('subscriptions.detail.header.subscriptionPremium', {
            amount: formatAmount(subscription.subscriptionPremium ?? 0),
          }),
          icon: DollarSign,
        },
      ]}
      metrics={workflowHeader?.model.paymentDirect ? directPaymentMetrics : [
        {
          id: 'subscribed',
          label: t('subscriptions.detail.header.subscribedAmount'),
          value: `${subscription.amount.toLocaleString('fr-FR')} €`,
          secondaryValue: t('subscriptions.detail.header.shares', {
            count: subscription.quantity.toLocaleString('fr-FR'),
          }),
          icon: DollarSign,
        },
        {
          id: 'called',
          label: t('subscriptions.detail.header.calledAmount'),
          value: `${(subscription.calledAmount ?? 0).toLocaleString('fr-FR')} €`,
          secondaryValue: formatRatio(subscription.calledAmount ?? 0),
          icon: TrendingUp,
        },
        {
          id: 'distributed',
          label: t('subscriptions.detail.header.distributedAmount'),
          value: `${(subscription.distributedAmount ?? 0).toLocaleString('fr-FR')} €`,
          secondaryValue: formatRatio(subscription.distributedAmount ?? 0),
          icon: ArrowDownCircle,
        },
        {
          id: 'remaining',
          label: t('subscriptions.detail.header.remainingBalance'),
          value: `${(subscription.remainingAmount ?? subscription.amount).toLocaleString('fr-FR')} €`,
          secondaryValue: formatRatio(subscription.remainingAmount ?? subscription.amount),
          icon: Wallet,
        },
      ]}
      sections={[
        {
          id: 'subscription',
          title: t('subscriptions.detail.form.sectionSubscription'),
          icon: FileText,
          items: [
            {
              id: 'language',
              label: t('subscriptions.detail.form.language'),
              value: languageLabel,
              icon: Globe,
            },
            {
              id: 'holdingMode',
              label: t('subscriptions.detail.form.holdingMode'),
              value: holdingModeLabel,
              icon: Wallet,
            },
            {
              id: 'externalId',
              label: t('subscriptions.detail.form.externalId'),
              value: subscription.externalId,
              icon: Hash,
            },
            {
              id: 'subscriptionType',
              label: t('subscriptions.detail.form.subscriptionType'),
              value: subscriptionTypeLabel,
              icon: Tag,
            },
            {
              id: 'share',
              label: t('subscriptions.detail.form.shareClass'),
              value: t('subscriptions.detail.init.sharePrefix', { name: subscription.fund.shareClass }),
              icon: Layers3,
              href: fundUrl,
            },
            {
              id: 'sharePrice',
              label: t('subscriptions.detail.form.sharePrice'),
              value: sharePrice !== undefined ? formatAmount(sharePrice) : undefined,
              icon: DollarSign,
            },
            {
              id: 'entryFeesRate',
              label: t('subscriptions.detail.form.entryFees'),
              value: formatPercent(subscription.entryFees ?? 0),
              icon: Percent,
            },
            {
              id: 'depositary',
              label: t('subscriptions.detail.form.depositary'),
              value: yesNo(subscription.hasDepositary),
              icon: ShieldCheck,
            },
            {
              id: 'sepa',
              label: t('subscriptions.detail.form.sepa'),
              value: yesNo(subscription.sepaEnabled),
              icon: Banknote,
            },
          ],
        },
        {
          id: 'subscriber',
          title: t('subscriptions.detail.form.sectionSubscriber'),
          icon: User,
          items: [
            {
              id: 'subscriberTitle',
              label: t('subscriptions.detail.form.subscriberTitle'),
              value: subscriberTitleLabel,
              icon: User,
            },
            {
              id: 'legalName',
              label: t('subscriptions.detail.form.legalName'),
              value: subscription.legalName,
              icon: Building2,
            },
            {
              id: 'lastName',
              label: t('subscriptions.detail.form.lastNameField'),
              value: subscription.lastName,
              icon: User,
            },
            {
              id: 'firstName',
              label: t('subscriptions.detail.form.firstNameField'),
              value: subscription.firstName,
              icon: User,
            },
            {
              id: 'email',
              label: t('subscriptions.detail.form.emailField'),
              value: subscription.email,
              icon: Mail,
            },
            {
              id: 'phone',
              label: t('subscriptions.detail.form.phoneField'),
              value: subscription.phone,
              icon: Phone,
            },
            {
              id: 'address1',
              label: t('subscriptions.detail.form.address1'),
              value: subscription.address1,
              icon: MapPin,
            },
            {
              id: 'address2',
              label: t('subscriptions.detail.form.address2'),
              value: subscription.address2,
              icon: MapPin,
            },
            {
              id: 'postalCode',
              label: t('subscriptions.detail.form.postalCodeField'),
              value: subscription.postalCode,
              icon: Hash,
            },
            {
              id: 'city',
              label: t('subscriptions.detail.form.cityField'),
              value: subscription.city,
              icon: MapPin,
            },
            {
              id: 'country',
              label: t('subscriptions.detail.form.country'),
              value: subscription.contrepartie.country,
              icon: Globe,
            },
            {
              id: 'birthDate',
              label: t('subscriptions.detail.form.birthDate'),
              value: formatShortDate(subscription.birthDate),
              icon: Calendar,
            },
            {
              id: 'nationality',
              label: t('subscriptions.detail.form.nationalityField'),
              value: subscription.nationality,
              icon: Flag,
            },
          ],
        },
        {
          id: 'banking',
          title: t('subscriptions.detail.form.sectionBanking'),
          icon: Landmark,
          items: [
            {
              id: 'iban',
              label: t('subscriptions.detail.form.ibanField'),
              value: subscription.iban,
              icon: CreditCard,
            },
            {
              id: 'bic',
              label: t('subscriptions.detail.form.bicField'),
              value: subscription.bic,
              icon: Landmark,
            },
          ],
        },
        {
          id: 'partner',
          title: t('subscriptions.detail.form.sectionPartner'),
          icon: Handshake,
          items: [
            {
              id: 'partnerName',
              label: t('subscriptions.detail.form.partner'),
              value: subscription.partenaire?.name ?? t('subscriptions.detail.form.noPartner'),
              icon: Handshake,
              href: subscription.partenaire ? partnerUrl : undefined,
            },
            {
              id: 'advisor',
              label: t('subscriptions.detail.form.advisor'),
              value: subscription.advisor,
              icon: Users,
            },
            {
              id: 'commissionRate',
              label: t('subscriptions.detail.form.commissionRate'),
              value: formatPercent(subscription.commissionRate),
              icon: Percent,
            },
            {
              id: 'excludeRetrocessions',
              label: t('subscriptions.detail.form.excludeRetrocessions'),
              value: yesNo(subscription.excludeRetrocessions),
              icon: ArrowDownCircle,
            },
          ],
        },
        {
          id: 'customFields',
          title: t('subscriptions.detail.form.sectionCustomFields'),
          icon: ClipboardList,
          items: [
            {
              id: 'sideLetter',
              label: t('subscriptions.detail.form.sideLetter'),
              value: subscription.sideLetter,
              icon: FileText,
            },
          ],
        },
      ]}
    />
  );

  if (subscription.restrictedToOtherOperators) {
    return (
      <div className="min-h-screen bg-muted px-8 py-6">
        <Card>
          <EmptyState
            icon={Lock}
            title={t('subscriptions.detail.accessDenied.title')}
            description={t('subscriptions.detail.accessDenied.description')}
            action={
              <Button variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('subscriptions.detail.accessDenied.back')}
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-muted"
      // Le panneau du simulateur n'est pas modal : la page se décale pour ne rien masquer.
      style={simulatorOpen ? { paddingRight: SIDE_PANEL_WIDTH } : undefined}
    >
      <DemoScenarioBar
        label={t('subscriptions.detail.answerEdit.scenario.label')}
        value={editScenario}
        options={EDIT_SCENARIOS.map(value => ({
          value,
          label: t(`subscriptions.detail.answerEdit.scenario.options.${value}`),
        }))}
        onChange={setEditScenario}
      />
      <DemoScenarioBar
        label={t('subscriptions.detail.answerAlerts.scenario.label')}
        value={reviewCircuit}
        options={REVIEW_CIRCUITS.map(value => ({
          value,
          label: t(`subscriptions.detail.answerAlerts.scenario.options.${value}`),
        }))}
        onChange={setReviewCircuit}
        action={
          <>
            {reviewCircuit === 'partnerPrevalidation' && (
              <Button
                variant="outline"
                size="sm"
                className="bg-card"
                onClick={handleSimulatePartnerReview}
                disabled={Boolean(partnerValidation)}
              >
                {t('subscriptions.detail.partnerReview.simulate')}
              </Button>
            )}
            <Button variant="outline" size="sm" className="bg-card" onClick={handleSimulateInvestorChange}>
              {t('subscriptions.detail.answerAlerts.simulate')}
            </Button>
          </>
        }
      />
      <PageHeader
        title={subscription.name}
        status={workflowHeader?.status ?? <SubscriptionStatusBadge status={subscription.status} />}
        details={workflowHeader?.details}
        subtitle={
          <PageHeaderSubtitle>
            <PageHeaderSubtitleItem icon={Hash} className="group">
              <span>{t('subscriptions.detail.header.id', { id: subscription.id })}</span>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={async () => {
                  const idText = `SUB-${subscription.id}`;
                  const success = await copyToClipboard(idText);
                  if (success) {
                    setIdCopied(true);
                    toast.success(t('subscriptions.detail.toast.idCopied'), { description: idText });
                    setTimeout(() => setIdCopied(false), 2000);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                title={t('subscriptions.detail.header.copyId')}
              >
                {idCopied ? (
                  <Check className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </motion.button>
            </PageHeaderSubtitleItem>

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={Calendar}>
              {t('subscriptions.detail.header.createdOn', { date: formatLongDate(subscription.createdAt) })}
            </PageHeaderSubtitleItem>

            {workflowHeader ? (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={CheckCircle2}>
                  {workflowHeader.model.activatedAt
                    ? t('subscriptions.detail.header.activatedOn', {
                        date: formatLongDate(subscription.activatedAt ?? new Date(workflowHeader.model.activatedAt)),
                      })
                    : t('subscriptions.workflowSimulator.header.notActivated')}
                </PageHeaderSubtitleItem>
                {workflowHeader.model.skippedStates.length > 0 && (
                  <>
                    <PageHeaderSubtitleSeparator />
                    <PageHeaderSubtitleItem icon={Calendar}>
                      {t('subscriptions.workflowSimulator.header.skippedDates', {
                        states: workflowHeader.model.skippedStates.join(', '),
                      })}
                    </PageHeaderSubtitleItem>
                  </>
                )}
              </>
            ) : (
              subscription.activatedAt && (
                <>
                  <PageHeaderSubtitleSeparator />
                  <PageHeaderSubtitleItem icon={CheckCircle2}>
                    {t('subscriptions.detail.header.activatedOn', { date: formatLongDate(subscription.activatedAt) })}
                  </PageHeaderSubtitleItem>
                </>
              )
            )}

            <PageHeaderSubtitleSeparator />

            <DetailLink href={fundUrl} icon={Landmark} title={openInNewTab} className="text-sm">
              {subscription.fund.name}
            </DetailLink>

            <DetailLink href={fundUrl} icon={Layers3} title={openInNewTab} className="text-sm">
              {t('subscriptions.detail.init.sharePrefix', { name: subscription.fund.shareClass })}
            </DetailLink>
          </PageHeaderSubtitle>
        }
        primaryAction={
          workflowMenu?.primary
            ? {
                label: <WorkflowActionLabel action={workflowMenu.primary} />,
                icon: <CheckCircle2 className="w-4 h-4" />,
                onClick: () => workflowMenu.primary && workflowActions.request(workflowMenu.primary),
                loading: workflowActions.pending === workflowMenu.primary.code,
                disabledReason: workflowMenu.primary.disabledReason,
              }
            : workflowHeader
              ? undefined
              : exportAction
        }
        extraActions={workflowHeader ? [exportAction] : undefined}
        tertiaryLabel={workflowMenu?.more.length ? t('subscriptions.workflowSimulator.actions.more') : undefined}
        tertiaryActions={workflowMenu?.more.map(action => ({
          label: <WorkflowActionLabel action={action} />,
          onClick: () => workflowActions.request(action),
          destructive: action.destructive,
          separatorBefore: action.separatorBefore,
          disabledReason: action.disabledReason,
        }))}
      />

      {workflowScenario.status === 'unavailable' && (
        <div className="px-8 pb-4 bg-card">
          <PageStateBanner variant="simulatorUnavailable" />
        </div>
      )}
      {workflowHeader?.banners}

      {/* Tabs - Same structure as InvestorDetailPage */}
      <div className="px-8 bg-card border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <DetailTabsList
            items={[
              { value: 'onboarding', icon: ClipboardList, labelKey: 'subscriptions.detail.tabs.onboarding', badge: `${Math.round(subscription.completionOnboarding)}%` },
              { value: 'emails', icon: Mail, labelKey: 'subscriptions.detail.tabs.emails', badge: String(mockEmails.length) },
              { value: 'capital-calls', icon: DollarSign, labelKey: 'subscriptions.detail.tabs.capitalCalls', badge: String(mockCapitalCalls.length) },
              { value: 'documents', icon: FolderOpen, labelKey: 'subscriptions.detail.tabs.documents', badge: String(getSubscriptionDocumentsCount(subscription)) },
              { value: 'integrations', icon: Database, labelKey: 'subscriptions.detail.tabs.integrations', badge: '5' },
              { value: 'notes', icon: MessageSquare, labelKey: 'subscriptions.detail.tabs.notes', badge: String(notesCount) },
              { value: 'audit', icon: History, labelKey: 'subscriptions.detail.tabs.audit', badge: String(auditEntries.length) },
            ].map(tab => ({
              value: tab.value,
              icon: tab.icon,
              label: t(tab.labelKey),
              badge: tab.badge,
            }))}
          />

          {/* Tab Content - Onboarding */}
          <TabsContent value="onboarding" className="mt-0">
            {/* Étapes de la souscription — bandeau fin dans le prolongement des onglets */}
            <div
              className="px-8 py-3 bg-card border-b border-border"
              style={{ marginLeft: '-2rem', marginRight: '-2rem' }}
            >
              <ol className="flex items-center gap-1 overflow-x-auto">
                {SUBSCRIPTION_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const isAccessible = step.id <= currentStep + 1;
                  const stepDate = step.id <= currentStep ? stepMilestones[step.id] : null;

                  return (
                    <li key={step.id} className="flex items-center gap-1 shrink-0">
                      {index > 0 && (
                        <span
                          aria-hidden
                          className={`h-px w-5 ${
                            isCompleted || isActive ? 'bg-green-300' : 'bg-border'
                          }`}
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => isAccessible && setCurrentStep(step.id)}
                        disabled={!isAccessible}
                        aria-current={isActive ? 'step' : undefined}
                        title={t(step.labelKey)}
                        className={`flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors ${
                          isAccessible ? 'hover:bg-accent' : 'opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <span
                          style={isActive ? { background: PRIMARY_BUTTON_GRADIENT } : undefined}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            isActive ? 'text-white' : isCompleted ? 'bg-emerald-100' : 'bg-muted'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <StepIcon
                              className={`w-3 h-3 ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                            />
                          )}
                        </span>
                        <span className="flex flex-col items-start leading-tight">
                          <span
                            className={`text-xs whitespace-nowrap ${
                              isActive
                                ? 'font-semibold text-foreground'
                                : isCompleted
                                  ? 'text-foreground'
                                  : 'text-muted-foreground'
                            }`}
                          >
                            {t(step.labelKey)}
                          </span>
                          {stepDate && (
                            <span className="text-[10px] tabular-nums whitespace-nowrap text-muted-foreground/70">
                              {formatStepDate(stepDate)}
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li className="ml-auto pl-3 shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">
                  {t('subscriptions.detail.stepper.stepOf', {
                    current: currentStep + 1,
                    total: SUBSCRIPTION_STEPS.length,
                  })}
                </li>
              </ol>
            </div>

            <div className="px-8 py-6">
              <div className="mb-6">
                {detailSummary}
              </div>

                <div>
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      {/* Invitation à l'onboarding */}
                      <Card className="p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                          <div>
                            <h2 className="text-lg font-bold text-foreground">
                              {t('subscriptions.detail.initStep.invitation.title')}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              {t('subscriptions.detail.initStep.invitation.subtitle')}
                            </p>
                          </div>
                          <Badge
                            className={
                              invitationSentAt
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }
                          >
                            {invitationSentAt
                              ? t('subscriptions.detail.initStep.invitation.sent')
                              : t('subscriptions.detail.initStep.invitation.notSent')}
                          </Badge>
                        </div>

                        <div className="rounded-lg border border-border bg-muted/40 p-4 mb-5">
                          <div
                            className="grid items-center gap-x-3 gap-y-2"
                            style={{ gridTemplateColumns: 'max-content minmax(0, 1fr)' }}
                          >
                            <div className="col-span-2 text-xs text-muted-foreground">
                              {t('subscriptions.detail.initStep.invitation.effectiveRecipient')}
                            </div>
                            {invitationRecipient ? (
                              <>
                                <Badge className="bg-green-50 text-green-700 border-green-200">
                                  {t(invitationRecipientLabelKey)}
                                </Badge>
                                <span className="text-sm font-semibold text-foreground break-all">
                                  {invitationRecipient}
                                </span>
                              </>
                            ) : (
                              <div className="col-span-2 flex items-center gap-2 text-sm font-semibold text-amber-700">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {t('subscriptions.detail.initStep.invitation.unresolved')}
                              </div>
                            )}

                            <div className="col-span-2 h-px bg-border my-2" />

                            <div className="col-span-2 text-xs text-muted-foreground">
                              {t('subscriptions.detail.initStep.invitation.copies')}
                            </div>
                            {invitationCopies.length > 0 ? (
                              invitationCopies.map(copy => (
                                <Fragment key={copy.id}>
                                  <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                    {t(copy.labelKey)}
                                  </Badge>
                                  <span className="text-sm text-foreground/90 break-all">{copy.email}</span>
                                </Fragment>
                              ))
                            ) : (
                              <p className="col-span-2 text-sm text-muted-foreground">
                                {t('subscriptions.detail.initStep.invitation.noCopies')}
                              </p>
                            )}
                            {invitationCopies.length > 0 && (
                              <p className="col-span-2 text-xs text-muted-foreground">
                                {t('subscriptions.detail.initStep.invitation.copyRuleHint')}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                          {[
                            { key: 'sent', value: invitationSentAt, icon: Mail },
                            { key: 'received', value: invitationEmail?.receivedAt ?? null, icon: CheckCircle2 },
                            { key: 'opened', value: invitationEmail?.openedAt ?? null, icon: Eye },
                            { key: 'clicked', value: invitationEmail?.clickedAt ?? null, icon: MousePointerClick },
                          ].map(milestone => {
                            const MilestoneIcon = milestone.icon;
                            return (
                              <div key={milestone.key} className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    milestone.value ? 'bg-green-100' : 'bg-muted'
                                  }`}
                                >
                                  <MilestoneIcon
                                    className={`w-4 h-4 ${milestone.value ? 'text-green-600' : 'text-muted-foreground'}`}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs text-muted-foreground">
                                    {t(`subscriptions.detail.initStep.tracking.${milestone.key}`)}
                                  </div>
                                  <div className="text-sm font-medium text-foreground/90 truncate">
                                    {milestone.value ?? '-'}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-muted-foreground">
                            {t('subscriptions.detail.initStep.invitation.resendHint')}
                          </p>
                          <Button
                            className="gap-2 text-white hover:opacity-90"
                            style={{ background: PRIMARY_BUTTON_GRADIENT }}
                            disabled={!invitationRecipient}
                            onClick={() =>
                              handleResendEmail(
                                'invitation',
                                'subscriptions.detail.initStep.templates.invitation',
                                invitationRecipient,
                              )
                            }
                          >
                            <Mail className="w-4 h-4" />
                            {invitationSentAt
                              ? t('subscriptions.detail.initStep.invitation.resend')
                              : t('subscriptions.detail.initStep.invitation.send')}
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}

                  {currentStep === 1 && (
                    // Onboarding en cours — KPI de completion, navigation par section, sections
                    <div className="space-y-6">
                      {reviewCircuit === 'partnerPrevalidation' && (
                        <PageStateBanner
                          variant="delegatedReview"
                          partner={delegatedPartnerName}
                          validatedBy={partnerValidation?.by}
                          date={partnerValidation?.at}
                        />
                      )}
                      {documentBlockers.length > 0 && (
                        <BlockersPanel
                          title={t(
                            documentBlockers.length === 1
                              ? 'subscriptions.detail.documentControl.blockersTitleOne'
                              : 'subscriptions.detail.documentControl.blockersTitleMany',
                            { count: documentBlockers.length },
                          )}
                          description={t('subscriptions.detail.documentControl.blockersDescription')}
                          blockers={documentBlockers.map(({ doc, idx }) => ({
                            id: `document-${idx}`,
                            icon: FileText,
                            label: docLabel(doc),
                            detail: t('subscriptions.detail.documentControl.missingIssueDate'),
                            onOpen: () => handleSelectOnboardingSection(AUDIT_DOCUMENTS_SECTION),
                          }))}
                        />
                      )}
                      <OnboardingCompletionCard
                        questions={questionBuckets}
                        documents={documentBuckets}
                      />

                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          id="modified-only"
                          checked={modifiedOnly}
                          onCheckedChange={setModifiedOnly}
                          disabled={modifiedTotal === 0}
                        />
                        <Label htmlFor="modified-only" className="text-sm">
                          {t('subscriptions.detail.onboarding.modified.filter', { count: modifiedTotal })}
                        </Label>
                      </div>

                      <div
                        className="grid items-start gap-6"
                        style={{ gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)' }}
                      >
                          <OnboardingSectionNav
                            sections={onboardingNavSections}
                            activeSectionId={activeOnboardingSection}
                            onSelect={handleSelectOnboardingSection}
                          />

                          <div className="space-y-4">
              {mockSections.map((section) => {
                if (modifiedOnly && modifiedCountOf(section.id) === 0) return null;
                const Icon = section.icon;
                const isOpen = modifiedOnly || openSections.includes(section.id);
                const buckets = getSectionBuckets(section.id);
                const isDocuments = section.id === 'documents';
                const allVerified = buckets.total > 0 && buckets.validated === buckets.total;

                return (
                  <Fragment key={section.id}>
                  {!modifiedOnly && isDocuments && isCorporateInvestor && mockBeneficialOwners.length > 0 && (
                    <SectionCard
                      mode="read"
                      icon={UserCheck}
                      title={t('subscriptions.detail.beneficialOwners.title')}
                      iconTone="info"
                      summary={
                        <span className="font-semibold text-foreground">
                          {t(
                            mockBeneficialOwners.length === 1
                              ? 'subscriptions.detail.beneficialOwners.countOne'
                              : 'subscriptions.detail.beneficialOwners.countMany',
                            { count: mockBeneficialOwners.length },
                          )}
                        </span>
                      }
                    >
                      <div className="divide-y divide-border">
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          <span className="col-span-3">{t('subscriptions.detail.beneficialOwners.columns.name')}</span>
                          <span className="col-span-2">{t('subscriptions.detail.beneficialOwners.columns.ownership')}</span>
                          <span className="col-span-3">{t('subscriptions.detail.beneficialOwners.columns.control')}</span>
                          <span className="col-span-2">{t('subscriptions.detail.beneficialOwners.columns.nationality')}</span>
                          <span className="col-span-2">{t('subscriptions.detail.beneficialOwners.columns.birthDate')}</span>
                        </div>
                        {mockBeneficialOwners.map(owner => (
                          <div key={owner.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                            <span className="col-span-3 font-medium text-foreground">{owner.name}</span>
                            <span className="col-span-2 text-foreground/80 tabular-nums">
                              {owner.ownership > 0 ? `${owner.ownership} %` : '-'}
                            </span>
                            <span className="col-span-3">
                              <NeutralTag label={t(owner.controlTypeKey)} />
                            </span>
                            <span className="col-span-2 text-foreground/80">{owner.nationality}</span>
                            <span className="col-span-2 text-muted-foreground tabular-nums">{owner.birthDate}</span>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}
                  <div
                    ref={el => {
                      onboardingSectionRefs.current[section.id] = el;
                    }}
                    style={{ scrollMarginTop: '1rem' }}
                  >
                  <SectionCard
                    mode="validation"
                    icon={Icon}
                    title={t(section.titleKey)}
                    iconTone={allVerified ? 'success' : 'info'}
                    active={activeOnboardingSection === section.id}
                    open={isOpen}
                    onOpenChange={() => {
                      toggleSection(section.id);
                      setActiveOnboardingSection(section.id);
                    }}
                    summary={
                      <>
                        <span className="font-semibold text-foreground">
                          {isDocuments
                            ? t('subscriptions.detail.onboarding.requiredDocuments', { count: buckets.total })
                            : t('subscriptions.detail.onboarding.answeredOf', {
                                answered: buckets.total - buckets.pending,
                                total: buckets.total,
                              })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <OnboardingStateCounter stats={buckets} compact />
                      </>
                    }
                    badges={
                      <>
                      {section.preonboarding && (
                        <NeutralTag label={t('subscriptions.detail.onboarding.preonboarding.badge')} />
                      )}
                      {allVerified ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                          {t('subscriptions.detail.onboarding.sectionValidated')}
                        </Badge>
                      ) : buckets.awaitingCorrection > 0 ? (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                          {t('subscriptions.detail.onboarding.completion.awaitingCorrectionCount', { count: buckets.awaitingCorrection })}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                          {t('subscriptions.detail.onboarding.inProgress')}
                        </Badge>
                      )}
                      </>
                    }
                    validationBar={
                      canManage && !modifiedOnly && !isDocuments && !allVerified
                        ? {
                            label: t('subscriptions.detail.onboarding.verifyAllResponses'),
                            actionLabel: t('subscriptions.detail.onboarding.validateSection'),
                            onAction: () => handleValidateSection(section.id, t(section.titleKey)),
                          }
                        : undefined
                    }
                  >
                          {section.id === 'documents' ? (
                            /* Documents Section - Special Layout */
                            <div>
                              {/* Documents Header with Actions */}
                              <div className="px-4 py-3 bg-muted border-b border-border flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-foreground/80">
                                  <FileText className="w-4 h-4" />
                                  <span>{t('subscriptions.detail.onboarding.manageDocuments')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportDocuments}
                                    className="gap-2 text-xs"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    {t('subscriptions.detail.onboarding.exportDocuments')}
                                  </Button>
                                  {canManage && (
                                  <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsManualDocumentOpen(true)}
                                    className="gap-2 text-xs"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    {t('subscriptions.detail.onboarding.addDocument')}
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleValidateDocuments(t(section.titleKey))}
                                    className="gap-2 text-xs bg-primary hover:bg-primary/90 text-white"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {t('subscriptions.detail.onboarding.validateSection')}
                                  </Button>
                                  </>
                                  )}
                                </div>
                              </div>

                              {/* Documents Table */}
                              <div className="overflow-hidden overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-muted border-b border-border">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {t('subscriptions.detail.docsTable.document')}
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                                        {t('subscriptions.detail.docsTable.dateSent')}
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                                        {t('subscriptions.detail.docsTable.issuedOn')}
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">
                                        {t('subscriptions.detail.docsTable.expiration')}
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                                        {t('subscriptions.detail.docsTable.view')}
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                                        {t('subscriptions.detail.docsTable.action')}
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-28 ds-sticky-actions">
                                        {t('subscriptions.detail.docsTable.verification')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-card divide-y divide-border/50">
                                    {requiredDocuments.map((doc, idx) => {
                                      const docState = getDocumentState(idx, doc);
                                      return (
                                      <tr key={idx} className="hover:bg-muted transition-colors group">
                                        <td className="px-4 py-3 text-sm text-foreground/80">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span>{docLabel(doc)}</span>
                                            {doc.manual && (
                                              <NeutralTag label={t('subscriptions.detail.documentControl.manualTag')} />
                                            )}
                                          </div>
                                          {docState === 'awaitingCorrection' && doc.rejectionReason && (
                                            <p className="mt-1 text-xs text-red-600">
                                              {t('subscriptions.detail.documentControl.reasonLine', { reason: doc.rejectionReason })}
                                              <span className="text-muted-foreground">
                                                {' · '}
                                                {t('subscriptions.detail.documentControl.visibleToInvestor')}
                                              </span>
                                            </p>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                          {doc.dateSent || <span className="text-muted-foreground/60">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                          {isMissingIssueDate(doc) ? (
                                            <Input
                                              type="date"
                                              aria-label={t('subscriptions.detail.documentControl.issueDateInput')}
                                              title={t('subscriptions.detail.documentControl.missingIssueDate')}
                                              className="h-8 text-xs border-red-300"
                                              onChange={e => handleIssueDateChange(idx, e.target.value)}
                                            />
                                          ) : (
                                            doc.issueDate || <span className="text-muted-foreground/60">-</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                          {doc.expiration || <span className="text-muted-foreground/60">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <div className="flex items-center justify-center gap-1">
                                            {doc.hasFile && (
                                              <RowActionButton
                                                icon={Eye}
                                                tooltip={t('subscriptions.detail.docsTable.view')}
                                                onClick={() => handleViewDocument(docLabel(doc))}
                                              />
                                            )}
                                            <RowActionButton
                                              icon={History}
                                              tooltip={t('subscriptions.detail.questionActions.timeline')}
                                              onClick={() =>
                                                setAuditElement({ elementId: `document-${idx}`, sectionId: AUDIT_DOCUMENTS_SECTION })
                                              }
                                            />
                                          </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddDocument(docLabel(doc))}
                                            className="gap-1.5 text-xs h-7"
                                          >
                                            <Upload className="w-3 h-3" />
                                            {doc.hasFile
                                              ? t('subscriptions.detail.docsTable.replace')
                                              : t('subscriptions.detail.docsTable.add')}
                                          </Button>
                                        </td>
                                        <td className="px-4 py-3 ds-sticky-actions">
                                          {docState === 'pending' || !canManage ? (
                                            <div className="flex justify-center">
                                              <Badge className="bg-muted text-muted-foreground text-xs">
                                                {t(`subscriptions.detail.onboarding.completion.state.${docState}`)}
                                              </Badge>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center gap-1">
                                              <DisabledReason
                                                reason={
                                                  isMissingIssueDate(doc)
                                                    ? t('subscriptions.detail.documentControl.missingIssueDate')
                                                    : undefined
                                                }
                                              >
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                title={t('subscriptions.detail.docsTable.validateDocument')}
                                                aria-label={t('subscriptions.detail.docsTable.validateDocument')}
                                                disabled={isMissingIssueDate(doc)}
                                                onClick={() => handleApproveDocument(idx)}
                                                className={`h-7 w-7 p-0 hover:bg-emerald-50 ${
                                                  docState === 'validated'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'text-muted-foreground'
                                                }`}
                                              >
                                                <Check className="w-3.5 h-3.5" />
                                              </Button>
                                              </DisabledReason>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                title={t('subscriptions.detail.docsTable.rejectDocument')}
                                                aria-label={t('subscriptions.detail.docsTable.rejectDocument')}
                                                onClick={() => handleRejectDocument(idx)}
                                                className={`h-7 w-7 p-0 hover:bg-red-50 ${
                                                  docState === 'awaitingCorrection'
                                                    ? 'bg-red-50 text-red-600'
                                                    : 'text-muted-foreground'
                                                }`}
                                              >
                                                <X className="w-3.5 h-3.5" />
                                              </Button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            /* Regular Questions Section */
                            <div>

                              {/* Questions Table */}
                              <div className="divide-y divide-border/50">
                                {section.questions.map((item, idx) => {
                                  const questionId = `${section.id}-${idx}`;
                                  const status = questionStatuses[questionId] || 'pending';
                                  const response = responseOf(section.id, idx, item);
                                  const iterationHeader =
                                    item.iteration !== undefined &&
                                    item.iteration !== section.questions[idx - 1]?.iteration &&
                                    section.iterationLabelKey ? (
                                      <div className="px-4 py-2 bg-muted text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {t(section.iterationLabelKey, { n: item.iteration })}
                                      </div>
                                    ) : null;

                                  const modifiedOrigin = modifiedOriginOf(questionId);
                                  if (modifiedOnly && !modifiedOrigin) return null;
                                  if (item.notAsked && !notAskedVisible.includes(section.id) && !modifiedOrigin) return null;

                                  if (item.info) return null;
                                  const comments = questionComments[questionId] || [];
                                  const hasUnresolved = comments.some((c: any) => !c.resolved);
                                  const isCommentOpen = activeCommentThread === questionId;

                                  return (
                                    <div key={idx}>
                                      {iterationHeader}
                                      <div className="grid grid-cols-12 gap-4 p-4 hover:bg-muted transition-colors">
                                        <div className="col-span-4 text-sm text-foreground/80 flex items-center gap-2">
                                          {item.hasAlert && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <span
                                                  tabIndex={0}
                                                  aria-label={t('subscriptions.detail.onboarding.alert.tooltip')}
                                                  className="inline-flex flex-shrink-0"
                                                >
                                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                                </span>
                                              </TooltipTrigger>
                                              <TooltipContent className="max-w-xs">
                                                {t('subscriptions.detail.onboarding.alert.tooltip')}
                                              </TooltipContent>
                                            </Tooltip>
                                          )}
                                          <span className="flex flex-col items-start gap-1">
                                            <span className="inline-flex items-center gap-2">
                                              <span className={status === 'rejected' ? 'text-red-700' : ''}>{item.question}</span>
                                              <QuestionRelationIcons
                                                syncedWith={(item.targets ?? []).map(target => ({ label: targetLabelOf(target), direction: target.direction ?? 'toTarget' }))}
                                                gaps={(item.targets ?? [])
                                                  .filter(target => linkedValueOf(questionId, item, target) !== response)
                                                  .map(target =>
                                                    t('subscriptions.detail.onboarding.relations.gapItem', {
                                                      target: targetLabelOf(target),
                                                      value: linkedValueOf(questionId, item, target) || t('subscriptions.detail.answerEffects.empty'),
                                                    }),
                                                  )}
                                                impacts={(item.triggers ?? []).map(trigger => trigger.question.replace(/\s*\*\s*$/, ''))}
                                                impactedBy={impactedByMap[questionId]}
                                              />
                                            </span>
                                            {item.notAsked && (
                                              <NeutralTag label={t('subscriptions.detail.onboarding.notAsked.tag')} />
                                            )}
                                          </span>
                                        </div>
                                        <div className="col-span-3 text-sm font-medium text-foreground">
                                          {response || <span className="text-muted-foreground/60 italic">{t('subscriptions.detail.onboarding.notProvided')}</span>}
                                          {modifiedOrigin && (
                                            <div className="mt-1">
                                              <StatusBadge
                                                variant="info"
                                                icon={PencilLine}
                                                label={t(MODIFIED_BY_KEY[modifiedOrigin])}
                                              />
                                            </div>
                                          )}
                                        </div>
                                        <div className="col-span-5 flex items-center justify-end">
                                          <QuestionActions
                                            questionId={questionId}
                                            currentResponse={response || ''}
                                            currentStatus={status}
                                            commentCount={comments.length}
                                            hasUnresolvedComments={hasUnresolved}
                                            onApprove={() => handleApproveQuestion(questionId)}
                                            onReject={() => handleRejectQuestion(questionId)}
                                            onModify={canModifyAnswers ? () => setAnswerEdit({ sectionId: section.id, idx }) : undefined}
                                            computed={item.computed}
                                            canControl={canManage}
                                            modificationCount={countPendingModifications(auditEntries, questionId)}
                                            onComment={() => handleToggleComment(questionId)}
                                            onTimeline={() => setAuditElement({ elementId: questionId, sectionId: section.id })}
                                          />
                                        </div>
                                      </div>
                                      
                                      {/* Comment thread */}
                                      <QuestionCommentThread
                                        questionId={questionId}
                                        questionText={item.question}
                                        isOpen={isCommentOpen}
                                        onClose={() => setActiveCommentThread(null)}
                                        comments={comments}
                                        onAddComment={(comment) => handleAddComment(questionId, comment)}
                                        onResolveComment={(commentId) => handleResolveComment(questionId, commentId)}
                                        onDeleteComment={(commentId) => handleDeleteComment(questionId, commentId)}
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                              {section.questions.some(q => q.notAsked) && (
                                <div className="px-4 py-3 border-t border-border">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() =>
                                      setNotAskedVisible(prev =>
                                        prev.includes(section.id)
                                          ? prev.filter(id => id !== section.id)
                                          : [...prev, section.id],
                                      )
                                    }
                                  >
                                    {notAskedVisible.includes(section.id)
                                      ? t('subscriptions.detail.onboarding.notAsked.hide')
                                      : t('subscriptions.detail.onboarding.notAsked.show', {
                                          count: section.questions.filter(q => q.notAsked).length,
                                        })}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                  </SectionCard>
                  </div>
                  </Fragment>
                );
              })}

                            {!modifiedOnly && (
                              <SectionCard
                                mode="read"
                                icon={Share2}
                                title={t('subscriptions.detail.report.title')}
                                iconTone="info"
                                summary={
                                  <span className="text-muted-foreground">
                                    {t('subscriptions.detail.report.summary', { date: MOCK_SUBMISSION_REPORT.submittedAt })}
                                  </span>
                                }
                              >
                                <div className="divide-y divide-border">
                                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-muted text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <span className="col-span-3">{t('subscriptions.detail.report.columns.data')}</span>
                                    <span className="col-span-3">{t('subscriptions.detail.report.columns.value')}</span>
                                    <span className="col-span-3">{t('subscriptions.detail.report.columns.origin')}</span>
                                    <span className="col-span-3">{t('subscriptions.detail.report.columns.state')}</span>
                                  </div>
                                  {mockSections.flatMap(section =>
                                    section.questions.flatMap((question, idx) =>
                                      (question.targets ?? []).map(target => {
                                        const questionId = `${section.id}-${idx}`;
                                        const value = linkedValueOf(questionId, question, target);
                                        const gap = value !== responseOf(section.id, idx, question);
                                        return (
                                          <div key={`${questionId}-${target.object}-${target.field}`} className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm">
                                            <span className="col-span-3 inline-flex items-center gap-2 text-foreground">
                                              <Link2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                              {targetLabelOf(target)}
                                            </span>
                                            <span className="col-span-3 font-medium text-foreground break-words">
                                              {value || t('subscriptions.detail.answerEffects.empty')}
                                            </span>
                                            <span className="col-span-3 text-foreground/80">
                                              {question.question.replace(/\s*\*\s*$/, '')}
                                              <span className="block text-xs text-muted-foreground">{t(section.titleKey)}</span>
                                            </span>
                                            <span className="col-span-3 flex flex-wrap items-center gap-2">
                                              {gap ? (
                                                <>
                                                  <StatusBadge variant="warning" icon={TriangleAlert} label={t('subscriptions.detail.report.gap')} />
                                                  {canManage && (
                                                    <Button variant="outline" size="sm" onClick={() => handlePropagateReported(section.id, idx, target)}>
                                                      {t('subscriptions.detail.report.propagate')}
                                                    </Button>
                                                  )}
                                                </>
                                              ) : (
                                                <StatusBadge variant="success" icon={CheckCircle2} label={t('subscriptions.detail.report.inSync')} />
                                              )}
                                              {target.previousValue && (
                                                <NeutralTag label={t('subscriptions.detail.report.replaced', { value: target.previousValue })} />
                                              )}
                                            </span>
                                          </div>
                                        );
                                      }),
                                    ),
                                  )}
                                  {mockSections.flatMap(section =>
                                    section.questions.flatMap((question, idx) =>
                                      question.createsMandate && question.response === 'Oui'
                                        ? [
                                            <div key={`mandate-${section.id}-${idx}`} className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm">
                                              <span className="col-span-3 inline-flex items-center gap-2 text-foreground">
                                                <Landmark className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                                {t('subscriptions.detail.report.mandate')}
                                              </span>
                                              <span className="col-span-3 font-medium text-foreground">{MOCK_SUBMISSION_REPORT.mandateReference}</span>
                                              <span className="col-span-3 text-foreground/80">
                                                {t('subscriptions.detail.report.mandateOrigin')}
                                                <span className="block text-xs text-muted-foreground">{t(section.titleKey)}</span>
                                              </span>
                                              <span className="col-span-3">
                                                <NeutralTag label={t('subscriptions.detail.report.mandateCreated')} />
                                              </span>
                                            </div>,
                                          ]
                                        : [],
                                    ),
                                  )}
                                  {MOCK_SUBMISSION_REPORT.documents.map(doc => (
                                    <div key={doc.field} className="grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm">
                                      <span className="col-span-3 inline-flex items-center gap-2 text-foreground">
                                        <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                        {targetLabelOf({ object: 'investor', field: doc.field })}
                                      </span>
                                      <span className="col-span-3 font-medium text-foreground">{t(doc.nameKey)}</span>
                                      <span className="col-span-3 text-foreground/80">{t('subscriptions.detail.sections.documents')}</span>
                                      <span className="col-span-3">
                                        <NeutralTag label={t('subscriptions.detail.report.documentCopied')} />
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </SectionCard>
                            )}

                            {/* Action — passer à l'étape suivante */}

                            <div className="flex justify-end pt-4">
                              <DisabledReason reason={validationBlockedReason}>
                              <Button
                                style={{ background: PRIMARY_BUTTON_GRADIENT }}
                                className="gap-2 text-white hover:opacity-90"
                                disabled={Boolean(validationBlockedReason)}
                                onClick={() => {
                                  setCurrentStep(2);
                                  toast.success(t('subscriptions.detail.onboarding.submittedForValidation'));
                                }}
                              >
                                <ChevronRight className="w-4 h-4" />
                                {t('subscriptions.detail.onboarding.proceedToValidation')}
                              </Button>
                              </DisabledReason>
                            </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {currentStep === 2 && (
                    // Validation / Conformité — widgets risque, screening et validation
                    <SubscriptionComplianceSection
                      reviewMode={reviewCircuit}
                      reviewChain={{
                        partner: { name: delegatedPartnerName, by: partnerValidation?.by },
                        firstAnalyst: CURRENT_OPERATOR,
                        secondAnalyst: SECOND_ANALYSTS[0],
                      }}
                      onReviewEvent={event =>
                        logAudit({
                          type: event.type === 'handedOff' ? 'reviewHandedOff' : 'finalValidation',
                          origin: 'operator',
                          actorName: event.by,
                          newValue: event.to,
                        })
                      }
                      scoreValidated={riskValidated}
                      scoreValidatedBy={riskValidatedBy}
                      scoreValidatedAt={riskValidationDate}
                      onValidateScore={handleValidateRisk}
                      onInvalidateScore={handleInvalidateRisk}
                      initialStatus={complianceStatus}
                      screeningSeed={String(subscription.id ?? subscription.contrepartie?.name ?? 'subscription')}
                      onStatusChange={setComplianceStatus}
                      onSubscriptionValidated={() => setCurrentStep(3)}
                      roleActions={<WorkflowRoleActions widget="compliance" />}
                    />
                  )}

                  {currentStep === 3 && (
                    // Signatures : pack, signataires, contre-signataires et suivi
                    <SubscriptionSignatureStep
                      subscription={subscription}
                      compliance={complianceStatus}
                      onOpenCompliance={() => setCurrentStep(2)}
                      onProceedToPayment={() => {
                        setCurrentStep(4);
                        toast.success(t('subscriptions.detail.signatureStep.toast.toPayment'));
                      }}
                      roleActions={<WorkflowRoleActions widget="signature" />}
                    />
                  )}

                  {currentStep === 4 && (
                    // Paiement
                    <div className="space-y-6">
                      <Card className="p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-6">{t('subscriptions.detail.paymentStep.title')}</h2>
                        
                        <div className="space-y-6">
                          {/* Type de paiement */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.paymentStep.paymentTypeLabel')}</label>
                            <div className="grid grid-cols-3 gap-3">
                              {[t('subscriptions.detail.paymentStep.wireTransfer'), t('subscriptions.detail.paymentStep.check'), t('subscriptions.detail.paymentStep.directDebit')].map((type, idx) => (
                                <div key={idx} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${idx === 0 ? 'border-primary bg-primary/5' : 'border-border hover:border-border'}`}>
                                  <div className="font-medium text-sm text-foreground text-center">{type}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Mandat */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.paymentStep.sepaMandate')}</label>
                            <div className="flex items-center gap-3">
                              <input type="checkbox" className="w-4 h-4" />
                              <span className="text-sm text-foreground/80">{t('subscriptions.detail.paymentStep.sepaActive')}</span>
                            </div>
                          </div>

                          {/* Date de valeur liquidative */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.paymentStep.navDateLabel')}</label>
                            <Input type="date" />
                          </div>

                          {/* Montant */}
                          <div className="bg-muted rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">{t('subscriptions.detail.paymentStep.subscriptionAmount')}</span>
                              <span className="font-semibold text-foreground">500 000,00 €</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-muted-foreground">{t('subscriptions.detail.paymentStep.entryFees', { pct: '0.75' })}</span>
                              <span className="font-semibold text-foreground">3 750,00 €</span>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-foreground">{t('subscriptions.detail.paymentStep.totalToPay')}</span>
                              <span className="text-xl font-bold text-primary">503 750,00 €</span>
                            </div>
                          </div>

                          {/* Statut du paiement */}
                          <div>
                            <h3 className="font-semibold text-foreground mb-3">{t('subscriptions.detail.paymentStep.paymentStatus')}</h3>
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <Clock className="w-5 h-5 text-amber-600" />
                              <div className="flex-1">
                                <div className="font-medium text-foreground">{t('subscriptions.detail.paymentStep.awaitingReceipt')}</div>
                                <div className="text-sm text-muted-foreground">{t('subscriptions.detail.paymentStep.awaitingReceiptDesc')}</div>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">{t('subscriptions.detail.paymentStep.pendingLabel')}</Badge>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-end gap-3">
                            <Button variant="outline">{t('subscriptions.detail.paymentStep.save')}</Button>
                            <Button 
                              className="hover:opacity-90"
                              style={{ background: PRIMARY_BUTTON_GRADIENT }}
                              onClick={() => toast.success(t('subscriptions.detail.paymentStep.paymentConfirmed'))}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.paymentStep.confirmPayment')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
            </div>
          </TabsContent>

          {/* Emails Tab Content */}
          <TabsContent value="emails" className="mt-0">
            <div className="px-8 py-6">
              <Card className="overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                          {t('subscriptions.detail.emailsTab.date')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">
                          {t('subscriptions.detail.emailsTab.emailType')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.emailsTab.recipient')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.emailsTab.recipientCc')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.emailsTab.subject')}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                          {t('subscriptions.detail.emailsTab.received')}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                          {t('subscriptions.detail.emailsTab.opened')}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                          {t('subscriptions.detail.emailsTab.clicked')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border/50">
                      {mockEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-muted transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {email.date}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Flag className="w-4 h-4 text-primary" />
                              <span className="text-sm text-foreground/80">{email.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {email.recipients}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {email.cc || <span className="text-muted-foreground/60">-</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {email.subject}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                            {email.receivedAt || <span className="text-muted-foreground/60">-</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                            {email.openedAt || <span className="text-muted-foreground/60">-</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                            {email.clickedAt || <span className="text-muted-foreground/60">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="capital-calls" className="mt-0">
            <div className="px-8 py-6">
              <SubscriptionCapitalCallsTab subscription={subscription} />
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <div className="px-8 py-6">
              <SubscriptionDocumentsTab subscription={subscription} />
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-0">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="audit" className="mt-0">
            <div className="px-8 py-6">
              <SubscriptionAuditTab
                entries={auditEntries}
                sections={mockSections}
                documents={requiredDocuments}
                subscriptionName={subscription.name}
              />
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="px-8 py-6">
              <NotesTab notes={initialNotes} scope="subscription" onCountChange={setNotesCount} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={documentToReject !== null}
        onOpenChange={open => !open && setDocumentToReject(null)}
        destructive
        title={t('subscriptions.detail.documentControl.rejectTitle')}
        description={
          documentToReject !== null && requiredDocuments[documentToReject]
            ? docLabel(requiredDocuments[documentToReject])
            : undefined
        }
        confirmLabel={t('subscriptions.detail.documentControl.rejectConfirm')}
        confirmDisabledReason={
          rejectionReason.trim() ? undefined : t('subscriptions.detail.documentControl.reasonRequired')
        }
        onConfirm={handleConfirmRejectDocument}
      >
        <div className="space-y-2">
          <Textarea
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder={t('subscriptions.detail.documentControl.reasonPlaceholder')}
            aria-label={t('subscriptions.detail.documentControl.reasonLabel')}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            {t('subscriptions.detail.documentControl.reasonVisible')}
          </p>
        </div>
      </ConfirmDialog>

      <NotificationsPanel
        open={distributorPreview !== null}
        onClose={() => setDistributorPreview(null)}
        notifications={distributorPreview ? [distributorPreview] : []}
        title={t('subscriptions.detail.answerAlerts.previewTitle')}
        description={t('subscriptions.detail.answerAlerts.previewDescription')}
      />

      <ManualDocumentPanel
        open={isManualDocumentOpen}
        onClose={() => setIsManualDocumentOpen(false)}
        onSave={handleSaveManualDocument}
      />

      <AnswerEditPanel
        question={answerEdit ? mockSections.find(sec => sec.id === answerEdit.sectionId)?.questions[answerEdit.idx] ?? null : null}
        currentValue={(() => {
          if (!answerEdit) return '';
          const question = mockSections.find(sec => sec.id === answerEdit.sectionId)?.questions[answerEdit.idx];
          return question ? responseOf(answerEdit.sectionId, answerEdit.idx, question) : '';
        })()}
        context={(() => {
          if (!answerEdit) return '';
          const section = mockSections.find(sec => sec.id === answerEdit.sectionId);
          if (!section) return '';
          const iteration = section.questions[answerEdit.idx]?.iteration;
          return iteration !== undefined && section.iterationLabelKey
            ? `${t(section.titleKey)} · ${t(section.iterationLabelKey, { n: iteration })}`
            : t(section.titleKey);
        })()}
        requiresReason={afterSignature}
        targets={answerEdit ? editTargets(answerEdit.sectionId, answerEdit.idx) : []}
        resolveTriggers={
          answerEdit &&
          mockSections.find(sec => sec.id === answerEdit.sectionId)?.questions[answerEdit.idx]?.triggers?.length
            ? next => resolveTriggerChanges(answerEdit.sectionId, answerEdit.idx, next)
            : undefined
        }
        onClose={() => setAnswerEdit(null)}
        onSave={(value, reason, effects) => {
          if (!answerEdit) return;
          const section = mockSections.find(sec => sec.id === answerEdit.sectionId);
          const question = section?.questions[answerEdit.idx];
          if (!question) return;
          handleModifyQuestion(
            `${answerEdit.sectionId}-${answerEdit.idx}`,
            value,
            responseOf(answerEdit.sectionId, answerEdit.idx, question),
            reason,
          );
          const replayedIds = applyAnswerEffects(answerEdit.sectionId, answerEdit.idx, value, effects);
          notifyModifiedAnswers(
            [`${answerEdit.sectionId}-${answerEdit.idx}`, ...replayedIds],
            'operator',
            CURRENT_OPERATOR,
          );
          setAnswerEdit(null);
        }}
      />

      <SubscriptionAuditPanel
        entries={auditEntries}
        sections={mockSections}
        documents={requiredDocuments}
        elementId={auditElement?.elementId ?? null}
        sectionId={auditElement?.sectionId}
        onClose={() => setAuditElement(null)}
        onShowAll={() => {
          setAuditElement(null);
          setActiveTab('audit');
        }}
      />

      <NewSubscriptionDialog
        open={isEditDialogOpen}
        mode="edit"
        subscription={subscription}
        onClose={() => setIsEditDialogOpen(false)}
        onSubscriptionUpdated={updated => setEditedSubscription(updated)}
      />

      {workflowScenario.status === 'ready' && !simulatorOpen && (
        <FloatingActionButton
          icon={FlaskConical}
          label={t('subscriptions.workflowSimulator.panel.open')}
          onClick={() => setSimulatorOpen(true)}
        />
      )}
      <WorkflowSimulatorPanel open={simulatorOpen} onOpenChange={setSimulatorOpen} />
    </div>
  );
}