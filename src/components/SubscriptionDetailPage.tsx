import { Fragment, useRef, useState } from 'react';
import { useTranslation } from '../utils/languageContext';
import {
  Building2,
  User,
  Store,
  TrendingUp,
  ChevronDown,
  ChevronUp,
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
  Trash2,
  FolderOpen,
  MessageSquare,
  PenTool,
  Copy,
  Landmark,
  Layers3,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { getStatusColor } from '../utils/subscriptionGenerator';
import { copyToClipboard } from '../utils/clipboard';
import { getShareableUrl } from '../utils/routing';
import { SubscriptionInfoPopover } from './SubscriptionInfoPopover';
import { PartyTypeBadge } from './ui/party-type-badge';
import { QuestionActions, QuestionStatus } from './QuestionActions';
import { QuestionCommentThread } from './QuestionCommentThread';
import { IntegrationsTab } from './IntegrationsTab';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import { PageHeader, PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import { DetailLink, DetailSummary } from './ui/detail-summary';
import {
  mockSections,
  mockRequiredDocuments,
  mockDocuments,
  mockNotes,
  mockEmails,
  mockCapitalCalls,
  mockInitEmails,
} from '../utils/subscriptionDetailMockData';
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
  'identity-0': 'approved',
  'identity-1': 'approved',
  'identity-3': 'approved',
  'identity-9': 'rejected',
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


export function SubscriptionDetailPage({ subscription: subscriptionProp, onBack }: SubscriptionDetailPageProps) {
  const { t } = useTranslation();

  // Les modifications faites depuis la modale restent locales : la donnée
  // amont de la maquette n'est pas réécrite.
  const [editedSubscription, setEditedSubscription] = useState<any>(null);
  const subscription = editedSubscription ?? subscriptionProp;

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [resentEmails, setResentEmails] = useState<Record<string, string>>({});
  const [idCopied, setIdCopied] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['identity']);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Array<{ text: string; date: string; author: string }>>([]);
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
  
  // Question states management
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>(INITIAL_QUESTION_STATUSES);
  const [questionResponses, setQuestionResponses] = useState<Record<string, string>>({});
  const [activeCommentThread, setActiveCommentThread] = useState<string | null>(null);
  const [questionComments, setQuestionComments] = useState<Record<string, any[]>>({});

  // Verification des pieces justificatives (meme cycle de vie que les reponses)
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, QuestionStatus>>(INITIAL_DOCUMENT_STATUSES);
  const [activeOnboardingSection, setActiveOnboardingSection] = useState<string>(mockSections[0].id);
  const onboardingSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

    // Approve all questions in the section
    const newStatuses = { ...questionStatuses };
    section.questions.forEach((_, idx) => {
      const questionId = `${sectionId}-${idx}`;
      newStatuses[questionId] = 'approved';
    });
    
    setQuestionStatuses(newStatuses);

    toast.success(t('subscriptions.detail.onboarding.sectionValidatedToast'), {
      description: t('subscriptions.detail.onboarding.sectionValidatedDesc', { count: section.questions.length, title: sectionTitle }),
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

  const handleAddNote = () => {
    if (!note.trim()) return;

    const newNote = {
      text: note,
      date: new Date().toLocaleDateString('fr-FR'),
      author: 'Vous'
    };

    setNotes([newNote, ...notes]);
    setNote('');
    toast.success(t('subscriptions.detail.toast.noteAdded'));
  };

  // Question actions handlers
  const handleApproveQuestion = (questionId: string) => {
    setQuestionStatuses(prev => ({ ...prev, [questionId]: 'approved' }));
  };

  const handleRejectQuestion = (questionId: string) => {
    setQuestionStatuses(prev => ({ ...prev, [questionId]: 'rejected' }));
  };

  const handleModifyQuestion = (questionId: string, newValue: string) => {
    setQuestionResponses(prev => ({ ...prev, [questionId]: newValue }));
    setQuestionStatuses(prev => ({ ...prev, [questionId]: 'modified' }));
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
      addToBucketStats(stats, getQuestionState(sectionId, idx, question));
    });
    return stats;
  };

  const getDocumentBuckets = (): OnboardingBucketStats => {
    const stats = emptyBucketStats();
    mockRequiredDocuments.forEach((doc, idx) => {
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


  const onboardingNavSections: OnboardingNavSection[] = mockSections.map((section, idx) => ({
    id: section.id,
    titleKey: section.titleKey,
    icon: section.icon,
    position: idx + 1,
    kind: section.id === 'documents' ? 'documents' : 'questions',
    stats: getSectionBuckets(section.id),
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
  };

  const handleRejectDocument = (idx: number) => {
    setDocumentStatuses(prev => ({ ...prev, [`document-${idx}`]: 'rejected' }));
  };

  const handleValidateDocuments = (sectionTitle: string) => {
    const next: Record<string, QuestionStatus> = { ...documentStatuses };
    let validated = 0;
    mockRequiredDocuments.forEach((doc, idx) => {
      if (doc.hasFile) {
        next[`document-${idx}`] = 'approved';
        validated += 1;
      }
    });
    setDocumentStatuses(next);
    toast.success(t('subscriptions.detail.onboarding.sectionValidatedToast'), {
      description: t('subscriptions.detail.onboarding.completion.documentsValidatedDesc', {
        count: validated,
        title: sectionTitle,
      }),
    });
  };

  const formatLongDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const formatAmount = (value: number) =>
    `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

  const formatRatio = (value: number) =>
    subscription.amount > 0 ? `${Math.round((value / subscription.amount) * 100)}%` : '0%';

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
  const investorContactEmail = subscription.contrepartie.mainContact
    ? toEmail(subscription.contrepartie.mainContact, 'example.com')
    : '';
  const partnerEmail = partnerDomain ? `contact@${partnerDomain}` : '';
  const advisorEmail = subscription.advisor && partnerDomain
    ? toEmail(subscription.advisor, partnerDomain)
    : '';

  const invitationRecipient = investorContactEmail || investorEmail;
  const invitationRecipientLabelKey = investorContactEmail
    ? 'subscriptions.detail.initStep.audiences.contact'
    : 'subscriptions.detail.initStep.audiences.investor';

  const invitationCopies: Array<{ id: string; labelKey: string; email: string }> = [
    {
      id: 'investor',
      labelKey: 'subscriptions.detail.initStep.audiences.investor',
      email: investorContactEmail ? investorEmail : '',
    },
    {
      id: 'partner',
      labelKey: 'subscriptions.detail.initStep.audiences.partner',
      email: partnerEmail,
    },
    {
      id: 'advisor',
      labelKey: 'subscriptions.detail.initStep.audiences.advisor',
      email: advisorEmail,
    },
  ].filter(copy => copy.email && copy.email !== invitationRecipient);

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

  const detailSummary = (
    <DetailSummary
      newTabTitle={openInNewTab}
      actions={
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5 hover:text-primary h-9"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit2 className="w-3.5 h-3.5" />
          {t('subscriptions.detail.editButton')}
        </Button>
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
      metrics={[
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
    />
  );

  return (
    <div className="min-h-screen bg-muted">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            {subscription.name}
            <SubscriptionStatusBadge status={subscription.status} />
          </span>
        }
        subtitle={
          <span className="flex items-center flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 group">
              <Hash className="w-3.5 h-3.5" />
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
            </span>

            <span aria-hidden className="h-3.5 w-px bg-border" />

            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t('subscriptions.detail.header.createdOn', { date: formatLongDate(subscription.createdAt) })}
            </span>

            {subscription.activatedAt && (
              <>
                <span aria-hidden className="h-3.5 w-px bg-border" />
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t('subscriptions.detail.header.activatedOn', { date: formatLongDate(subscription.activatedAt) })}
                </span>
              </>
            )}

            <span aria-hidden className="h-3.5 w-px bg-border" />

            <DetailLink href={fundUrl} icon={Landmark} title={openInNewTab} className="text-sm">
              {subscription.fund.name}
            </DetailLink>

            <DetailLink href={fundUrl} icon={Layers3} title={openInNewTab} className="text-sm">
              {t('subscriptions.detail.init.sharePrefix', { name: subscription.fund.shareClass })}
            </DetailLink>
          </span>
        }
        primaryAction={{
          label: t('subscriptions.detail.header.exportData'),
          icon: <Download className="w-4 h-4" />,
          onClick: () => toast.success(t('subscriptions.detail.toast.featureComingSoon')),
        }}
      />


      {/* Tabs - Same structure as InvestorDetailPage */}
      <div className="px-8 bg-card border-b border-border">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="!bg-transparent rounded-none w-full max-w-full justify-start h-auto p-0 gap-0 overflow-hidden">
            {[
              { value: 'onboarding', icon: ClipboardList, labelKey: 'subscriptions.detail.tabs.onboarding', badge: `${Math.round(subscription.completionOnboarding)}%`, badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
              { value: 'emails', icon: Mail, labelKey: 'subscriptions.detail.tabs.emails', badge: String(mockEmails.length), badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
              { value: 'capital-calls', icon: DollarSign, labelKey: 'subscriptions.detail.tabs.capitalCalls', badge: String(mockCapitalCalls.length), badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { value: 'documents', icon: FolderOpen, labelKey: 'subscriptions.detail.tabs.documents', badge: String(mockDocuments.length), badgeClass: 'bg-muted text-foreground/80 border-border' },
              { value: 'integrations', icon: Database, labelKey: 'subscriptions.detail.tabs.integrations', badge: '5', badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
              { value: 'notes', icon: MessageSquare, labelKey: 'subscriptions.detail.tabs.notes', badge: String(mockNotes.length), badgeClass: 'bg-purple-50 text-purple-700 border-purple-200' },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  title={t(tab.labelKey)}
                  className="!bg-transparent !rounded-none !border-0 !shadow-none basis-auto min-w-0 shrink data-[state=active]:shrink-0 px-2 xl:px-4 pb-3 pt-4 font-medium text-muted-foreground data-[state=active]:text-primary"
                  style={isActive ? { boxShadow: 'inset 0 -2px 0 0 var(--color-primary)' } : undefined}
                >
                  <Icon className="w-4 h-4 mr-2 shrink-0" />
                  <span className="truncate">{t(tab.labelKey)}</span>
                  {tab.badge && (
                    <Badge className={`ml-2 text-xs shrink-0 ${tab.badgeClass}`}>
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

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
                      <OnboardingCompletionCard
                        questions={questionBuckets}
                        documents={documentBuckets}
                      />

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
                const Icon = section.icon;
                const isOpen = openSections.includes(section.id);
                const buckets = getSectionBuckets(section.id);
                const isDocuments = section.id === 'documents';
                const allVerified = buckets.total > 0 && buckets.validated === buckets.total;

                return (
                  <div
                    key={section.id}
                    ref={el => {
                      onboardingSectionRefs.current[section.id] = el;
                    }}
                    style={{ scrollMarginTop: '1rem' }}
                  >
                  <Collapsible
                    open={isOpen}
                    onOpenChange={() => {
                      toggleSection(section.id);
                      setActiveOnboardingSection(section.id);
                    }}
                  >
                    <Card
                      className="overflow-hidden hover:shadow-md transition-shadow"
                      style={
                        activeOnboardingSection === section.id
                          ? { boxShadow: '0 0 0 1px var(--color-primary)' }
                          : undefined
                      }
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-5 hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              allVerified ? 'bg-[var(--success-soft)]' : 'bg-primary/10'
                            }`}>
                              <Icon className={`w-6 h-6 ${
                                allVerified ? 'text-emerald-600' : 'text-primary'
                              }`} />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-foreground text-lg mb-1">{t(section.titleKey)}</h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
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
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
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
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground/60" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground/60" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t border-border/50">
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
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddDocument('')}
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
                                </div>
                              </div>

                              {/* Documents Table */}
                              <div className="overflow-hidden">
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
                                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                                        {t('subscriptions.detail.docsTable.verification')}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-card divide-y divide-border/50">
                                    {mockRequiredDocuments.map((doc, idx) => {
                                      const docState = getDocumentState(idx, doc);
                                      return (
                                      <tr key={idx} className="hover:bg-muted transition-colors group">
                                        <td className="px-4 py-3 text-sm text-foreground/80">
                                          {t(doc.nameKey)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                          {doc.dateSent || <span className="text-muted-foreground/60">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                          {doc.issueDate || <span className="text-muted-foreground/60">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">
                                          {doc.expiration || <span className="text-muted-foreground/60">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          {doc.hasFile ? (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleViewDocument(t(doc.nameKey))}
                                              className="h-7 text-primary hover:text-primary/80 hover:bg-primary/5"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                          ) : (
                                            <span className="text-muted-foreground/60">-</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddDocument(t(doc.nameKey))}
                                            className="gap-1.5 text-xs h-7"
                                          >
                                            <Upload className="w-3 h-3" />
                                            {doc.hasFile
                                              ? t('subscriptions.detail.docsTable.replace')
                                              : t('subscriptions.detail.docsTable.add')}
                                          </Button>
                                        </td>
                                        <td className="px-4 py-3">
                                          {docState === 'pending' ? (
                                            <div className="flex justify-center">
                                              <Badge className="bg-muted text-muted-foreground text-xs">
                                                {t('subscriptions.detail.onboarding.completion.state.pending')}
                                              </Badge>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                title={t('subscriptions.detail.docsTable.validateDocument')}
                                                aria-label={t('subscriptions.detail.docsTable.validateDocument')}
                                                onClick={() => handleApproveDocument(idx)}
                                                className={`h-7 w-7 p-0 hover:bg-emerald-50 ${
                                                  docState === 'validated'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'text-muted-foreground'
                                                }`}
                                              >
                                                <Check className="w-3.5 h-3.5" />
                                              </Button>
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
                              {/* Validate All Button */}
                              {!allVerified && (
                                <div className="px-4 py-3 bg-primary/5 border-b border-primary/10 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-primary">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{t('subscriptions.detail.onboarding.verifyAllResponses')}</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleValidateSection(section.id, t(section.titleKey))}
                                    className="bg-primary hover:bg-primary/90 text-white"
                                  >
                                    {t('subscriptions.detail.onboarding.validateSection')}
                                  </Button>
                                </div>
                              )}

                              {/* Questions Table */}
                              <div className="divide-y divide-border/50">
                                {section.questions.map((item, idx) => {
                                  const questionId = `${section.id}-${idx}`;
                                  const status = questionStatuses[questionId] || 'pending';
                                  const response = questionResponses[questionId] || item.response;
                                  const comments = questionComments[questionId] || [];
                                  const hasUnresolved = comments.some((c: any) => !c.resolved);
                                  const isCommentOpen = activeCommentThread === questionId;

                                  return (
                                    <div key={idx}>
                                      <div className="grid grid-cols-12 gap-4 p-4 hover:bg-muted transition-colors">
                                        <div className="col-span-4 text-sm text-foreground/80 flex items-center gap-2">
                                          {item.hasAlert && (
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                          )}
                                          <span className={status === 'rejected' ? 'text-red-700' : ''}>{item.question}</span>
                                        </div>
                                        <div className="col-span-3 text-sm font-medium text-foreground">
                                          {response || <span className="text-muted-foreground/60 italic">{t('subscriptions.detail.onboarding.notProvided')}</span>}
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
                                            onModify={(newValue) => handleModifyQuestion(questionId, newValue)}
                                            onComment={() => handleToggleComment(questionId)}
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
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                  </div>
                );
              })}

                            {/* Action — passer à l'étape suivante */}
                            <div className="flex justify-end pt-4">
                              <Button
                                style={{ background: PRIMARY_BUTTON_GRADIENT }}
                                className="gap-2 text-white hover:opacity-90"
                                onClick={() => {
                                  setCurrentStep(2);
                                  toast.success(t('subscriptions.detail.onboarding.submittedForValidation'));
                                }}
                              >
                                <ChevronRight className="w-4 h-4" />
                                {t('subscriptions.detail.onboarding.proceedToValidation')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                  )}

                  {currentStep === 2 && (
                    // Validation / Conformité — widgets risque, screening et validation
                    <SubscriptionComplianceSection
                      questions={questionBuckets}
                      documents={documentBuckets}
                      scoreValidated={riskValidated}
                      scoreValidatedBy={riskValidatedBy}
                      scoreValidatedAt={riskValidationDate}
                      onValidateScore={handleValidateRisk}
                      onInvalidateScore={handleInvalidateRisk}
                      initialStatus={complianceStatus}
                      onStatusChange={setComplianceStatus}
                      onSubscriptionValidated={() => setCurrentStep(3)}
                    />
                  )}

                  {currentStep === 3 && (
                    // Signatures : pack, signataires, contre-signataires et suivi
                    <SubscriptionSignatureStep
                      subscription={subscription}
                      questions={questionBuckets}
                      documents={documentBuckets}
                      compliance={complianceStatus}
                      onOpenOnboarding={() => setCurrentStep(1)}
                      onOpenCompliance={() => setCurrentStep(2)}
                      onProceedToPayment={() => {
                        setCurrentStep(4);
                        toast.success(t('subscriptions.detail.signatureStep.toast.toPayment'));
                      }}
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

          {/* Capital Calls Tab Content */}
          <TabsContent value="capital-calls" className="mt-0">
            <div className="px-8 py-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Montant Total Card */}
                <Card className="p-5">
                  <div className="text-xs text-primary mb-2">{t('subscriptions.detail.capitalCallsTab.totalCalledAmount')}</div>
                  <div className="text-2xl font-semibold text-foreground">
                    {mockCapitalCalls.reduce((sum, call) => sum + call.amount + call.entryFees + call.subscriptionPremium, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                </Card>

                {/* Pourcentage Total Card */}
                <Card className="p-5">
                  <div className="text-xs text-purple-600 mb-2">{t('subscriptions.detail.capitalCallsTab.totalCalledPercentage')}</div>
                  <div className="text-2xl font-semibold text-foreground">
                    {mockCapitalCalls.reduce((sum, call) => sum + call.percentage, 0)}%
                  </div>
                </Card>
              </div>

              {/* Export Button */}
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  className="gap-2 border-border hover:bg-muted"
                  onClick={() => {
                    // Generate CSV content
                    const headers = [
                      t('subscriptions.detail.capitalCallsTab.date'),
                      t('subscriptions.detail.capitalCallsTab.capitalCall'),
                      t('subscriptions.detail.capitalCallsTab.amount'),
                      t('subscriptions.detail.capitalCallsTab.subscription'),
                      t('subscriptions.detail.capitalCallsTab.entryFees'),
                      t('subscriptions.detail.capitalCallsTab.subscriptionPremium'),
                      t('subscriptions.detail.capitalCallsTab.percentage'),
                      t('subscriptions.detail.capitalCallsTab.status'),
                    ];
                    const rows = mockCapitalCalls.map(call => [
                      call.date,
                      call.call,
                      call.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
                      call.subscription.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
                      call.entryFees.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
                      call.subscriptionPremium.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
                      call.percentage + '%',
                      call.status === 'paid'
                        ? t('subscriptions.detail.capitalCallsTab.paid')
                        : call.status === 'pending'
                          ? t('subscriptions.detail.capitalCallsTab.pendingStatus')
                          : t('subscriptions.detail.capitalCallsTab.rejectedStatus')
                    ]);

                    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `appels_de_fonds_${subscription.id}.csv`;
                    link.click();

                    toast.success(t('subscriptions.detail.capitalCallsTab.exportSuccess'), { description: t('subscriptions.detail.capitalCallsTab.exportSuccessDesc') });
                  }}
                >
                  <Download className="w-4 h-4" />
                  {t('subscriptions.detail.capitalCallsTab.exportCsv')}
                </Button>
              </div>

              {/* Table */}
              <Card className="overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-40">
                          {t('subscriptions.detail.capitalCallsTab.date')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-48">
                          {t('subscriptions.detail.capitalCallsTab.capitalCall')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.capitalCallsTab.amount')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.capitalCallsTab.subscription')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.capitalCallsTab.entryFees')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.capitalCallsTab.subscriptionPremium')}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {t('subscriptions.detail.capitalCallsTab.percentage')}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                          {t('subscriptions.detail.capitalCallsTab.status')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {mockCapitalCalls.map((capitalCall) => (
                        <tr key={capitalCall.id} className="hover:bg-muted transition-colors">
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {capitalCall.date}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {capitalCall.call}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {capitalCall.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {capitalCall.subscription.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {capitalCall.entryFees.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {capitalCall.subscriptionPremium.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground/80">
                            {capitalCall.percentage}%
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {capitalCall.status === 'paid' && (
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center" title={t('subscriptions.detail.capitalCallsTab.paid')}>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                </div>
                              )}
                              {capitalCall.status === 'pending' && (
                                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center" title={t('subscriptions.detail.capitalCallsTab.pendingStatus')}>
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                </div>
                              )}
                              {capitalCall.status === 'rejected' && (
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center" title={t('subscriptions.detail.capitalCallsTab.rejectedStatus')}>
                                  <X className="w-3 h-3 text-red-600" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </Card>
            </div>
          </TabsContent>

          {/* Risk Tab Content */}
          {/* Documents Tab Content */}
          <TabsContent value="documents" className="mt-0">
            <div className="px-8 py-6">
              <Card className="overflow-hidden shadow-sm">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">{t('subscriptions.detail.documentsTab.title')}</h2>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast.info(t('subscriptions.detail.toast.addDocumentToast'))}
                  >
                    <Upload className="w-4 h-4" />
                    {t('subscriptions.detail.documentsTab.addDocument')}
                  </Button>
                </div>

                {/* Table */}
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('subscriptions.detail.documentsTab.date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('subscriptions.detail.documentsTab.name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('subscriptions.detail.documentsTab.language')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('subscriptions.detail.documentsTab.type')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('subscriptions.detail.documentsTab.file')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mockDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {doc.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">
                          {doc.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {doc.language}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {doc.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {doc.status === 'signed' && (
                              <Badge className="bg-green-50 text-green-700 border-green-200 font-medium gap-1.5">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('subscriptions.detail.documentsTab.documentSigned')}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => toast.info(t('subscriptions.detail.documentsTab.deleteDocument', { name: doc.name }))}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer */}
                <div className="px-6 py-4 bg-muted border-t border-border">
                  <Button
                    className="w-full gap-2 text-white hover:opacity-90"
                    style={{ background: PRIMARY_BUTTON_GRADIENT }}
                    onClick={() => toast.success(t('subscriptions.detail.documentsTab.exportPackToast'))}
                  >
                    <Download className="w-4 h-4" />
                    {t('subscriptions.detail.documentsTab.exportPack')}
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-0">
            <IntegrationsTab />
          </TabsContent>

          {/* Notes Tab Content */}
          <TabsContent value="notes" className="mt-0">
            <div className="px-8 py-6">
              <div className="space-y-4">
                {/* Filters */}
                <Card className="p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {t('subscriptions.detail.notesTab.all', { count: mockNotes.length })}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {t('subscriptions.detail.notesTab.open', { count: mockNotes.filter(n => n.status === 'open').length })}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      {t('subscriptions.detail.notesTab.resolved', { count: mockNotes.filter(n => n.status === 'resolved').length })}
                    </Button>
                    <div className="ml-auto">
                      <Button
                        className="gap-2"
                        style={{ background: PRIMARY_BUTTON_GRADIENT }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {t('subscriptions.detail.notesTab.newNote')}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Notes List */}
                <div className="space-y-3">
                  {mockNotes.map((note) => (
                    <Card
                      key={note.id}
                      className="p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon and Priority */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          note.priority === 'high' ? 'bg-red-50' :
                          note.priority === 'medium' ? 'bg-orange-50' :
                          'bg-muted'
                        }`}>
                          <MessageSquare className={`w-5 h-5 ${
                            note.priority === 'high' ? 'text-red-600' :
                            note.priority === 'medium' ? 'text-orange-600' :
                            'text-muted-foreground'
                          }`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {note.type === 'field' ? (
                                <>
                                  <Badge variant="outline" className="text-xs font-medium">
                                    {t('subscriptions.detail.notesTab.fieldType')}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs font-medium text-foreground/80">{t(note.sectionKey)}</span>
                                  <span className="text-xs text-muted-foreground">›</span>
                                  <span className="text-xs text-muted-foreground">{note.fieldKey}</span>
                                </>
                              ) : (
                                <Badge variant="outline" className="text-xs font-medium">
                                  {t('subscriptions.detail.notesTab.generalType')}
                                </Badge>
                              )}
                              {note.priority === 'high' && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                  {t('subscriptions.detail.notesTab.highPriority')}
                                </Badge>
                              )}
                              {note.priority === 'medium' && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                  {t('subscriptions.detail.notesTab.mediumPriority')}
                                </Badge>
                              )}
                            </div>
                            {note.status === 'resolved' ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1.5">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('subscriptions.detail.notesTab.resolvedStatus')}
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => toast.success(t('subscriptions.detail.notesTab.noteResolved'))}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                {t('subscriptions.detail.notesTab.resolve')}
                              </Button>
                            )}
                          </div>

                          {/* Note Content */}
                          <p className="text-sm text-foreground/80 mb-3">
                            {t(note.contentKey)}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5" />
                              <span>{note.author}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{note.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => toast.info(t('subscriptions.detail.notesTab.deleteNote'))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <NewSubscriptionDialog
        open={isEditDialogOpen}
        mode="edit"
        subscription={subscription}
        onClose={() => setIsEditDialogOpen(false)}
        onSubscriptionUpdated={updated => setEditedSubscription(updated)}
      />
    </div>
  );
}