import { useState } from 'react';
import { useTranslation } from '../utils/languageContext';
import {
  ArrowLeft,
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
  EyeOff,
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
  AlertTriangle,
  ShieldAlert,
  Newspaper,
  Globe,
  Scale,
  Users,
  Clock,
  TrendingDown,
  ArrowDownCircle,
  FileCheck,
  Wallet,
  Trash2,
  FolderOpen,
  MessageSquare,
  PenTool
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { getStatusColor } from '../utils/subscriptionGenerator';
import { SubscriptionInfoPopover } from './SubscriptionInfoPopover';
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
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import {
  mockSections,
  mockRequiredDocuments,
  mockDocuments,
  mockNotes,
  mockEmails,
  mockCapitalCalls,
} from '../utils/subscriptionDetailMockData';
import { StatusBadge } from './StatusBadge';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';

interface SubscriptionDetailPageProps {
  subscription: any;
  onBack: () => void;
}


export function SubscriptionDetailPage({ subscription, onBack }: SubscriptionDetailPageProps) {
  const { t } = useTranslation();

  const [openSections, setOpenSections] = useState<string[]>(['identity']);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Array<{ text: string; date: string; author: string }>>([]);
  
  // Stepper state — newly created subscriptions carry initialStep=0 so they
  // land on the Initialisation step (the wizard's data is pre-filled below).
  const [currentStep, setCurrentStep] = useState(
    typeof (subscription as any).initialStep === 'number'
      ? (subscription as any).initialStep
      : 1,
  ); // 0: Initialisation, 1: Onboarding, 2: Validation, etc.

  const initData = (subscription as any).initData ?? {};
  
  // Question states management
  const [questionStatuses, setQuestionStatuses] = useState<Record<string, QuestionStatus>>({});
  const [questionResponses, setQuestionResponses] = useState<Record<string, string>>({});
  const [activeCommentThread, setActiveCommentThread] = useState<string | null>(null);
  const [questionComments, setQuestionComments] = useState<Record<string, any[]>>({});

  // Risk validation state
  const [riskValidated, setRiskValidated] = useState(false);
  const [riskValidationDate, setRiskValidationDate] = useState<string | null>(null);
  const [riskValidatedBy, setRiskValidatedBy] = useState<string | null>(null);

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

  // Calculate section statistics
  const getSectionStats = (sectionId: string) => {
    const section = mockSections.find(s => s.id === sectionId);
    if (!section || section.id === 'documents') return null;

    const total = section.questions.length;
    const answered = section.questions.filter(q => q.response).length;
    const approved = section.questions.filter((q, idx) => 
      questionStatuses[`${sectionId}-${idx}`] === 'approved'
    ).length;
    const rejected = section.questions.filter((q, idx) => 
      questionStatuses[`${sectionId}-${idx}`] === 'rejected'
    ).length;
    const pending = total - approved - rejected;

    return { total, answered, approved, rejected, pending };
  };

  // Calculate global stats for all sections
  const getGlobalStats = () => {
    let totalQuestions = 0;
    let totalAnswered = 0;
    let totalApproved = 0;
    let totalRejected = 0;

    mockSections.forEach(section => {
      if (section.id !== 'documents') {
        const stats = getSectionStats(section.id);
        if (stats) {
          totalQuestions += stats.total;
          totalAnswered += stats.answered;
          totalApproved += stats.approved;
          totalRejected += stats.rejected;
        }
      }
    });

    return {
      total: totalQuestions,
      answered: totalAnswered,
      approved: totalApproved,
      rejected: totalRejected,
      pending: totalQuestions - totalApproved - totalRejected
    };
  };

  // Calculate document stats (mock data for now)
  const getDocumentStats = () => {
    const totalRequired = mockRequiredDocuments.length;
    const submitted = mockRequiredDocuments.filter(d => d.hasFile).length;
    // Mock validation data - in real app this would come from state
    const validated = Math.floor(submitted * 0.7); // 70% validated
    const rejected = Math.floor(submitted * 0.1); // 10% rejected

    return {
      totalRequired,
      submitted,
      validated,
      rejected
    };
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header - Same structure as InvestorDetailPage */}
      <div
        className="bg-card border-b border-border sticky top-0 z-10"
      >
        {/* Main Header Content */}
        <div className="px-8 pb-3 pt-5">
          <div className="flex justify-between gap-6">
            {/* Left column */}
            <div className="flex-1">
              {/* Top Row - Title */}
              <div className="flex items-start gap-3 mb-10">
                <button
                onClick={onBack}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-2xl font-semibold text-foreground">
                    {subscription.name}
                  </h1>
                  <SubscriptionStatusBadge status={subscription.status} />
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    <span>{t('subscriptions.detail.header.id', { id: subscription.id })}</span>
                  </div>
                  <Separator orientation="vertical" className="h-3.5" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('subscriptions.detail.header.createdOn', { date: subscription.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row - Actors */}
            <div className="flex items-center gap-8 mb-6">
            {/* Investisseur */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground leading-none mb-0.5">{t('subscriptions.detail.header.investor')}</div>
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary hover:text-primary/70 text-sm leading-tight -mt-0.5"
                  onClick={() => toast.info(t('subscriptions.detail.header.navigateToInvestor'))}
                >
                  {subscription.contrepartie.investor || subscription.contrepartie.name}
                </Button>
              </div>
            </div>

            {/* Structure */}
            {subscription.contrepartie.structure && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground leading-none mb-0.5">{t('subscriptions.detail.header.structure')}</div>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-primary hover:text-primary/70 text-sm leading-tight -mt-0.5"
                    onClick={() => toast.info(t('subscriptions.detail.header.navigateToStructure'))}
                  >
                    {subscription.contrepartie.structure}
                  </Button>
                </div>
              </div>
            )}

            {/* Partenaire */}
            {subscription.partenaire && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Users className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground leading-none mb-0.5">{t('subscriptions.detail.header.partner')}</div>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-primary hover:text-primary/70 text-sm leading-tight -mt-0.5"
                    onClick={() => toast.info(t('subscriptions.detail.header.navigateToPartner'))}
                  >
                    {subscription.partenaire.name}
                  </Button>
                  {subscription.advisor && (
                    <div className="text-xs text-muted-foreground leading-tight">{t('subscriptions.detail.header.advisor', { name: subscription.advisor })}</div>
                  )}
                </div>
              </div>
            )}

            {/* Frais */}
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-3 h-3 text-muted-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground leading-none mb-0.5">{t('subscriptions.detail.header.fees')}</div>
                <div className="text-xs text-foreground/80 leading-tight">
                  {t('subscriptions.detail.header.entryFees', {
                    amount: subscription.entryFees != null
                      ? `${((subscription.amount * subscription.entryFees) / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                      : '0,00 €'
                  })}
                </div>
                <div className="text-xs text-foreground/80 leading-tight">
                  {t('subscriptions.detail.header.subscriptionPremium', {
                    amount: subscription.subscriptionPremium != null
                      ? `${subscription.subscriptionPremium.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                      : '0,00 €'
                  })}
                </div>
              </div>
            </div>
            </div>

            {/* Financial KPIs Row */}
            <div className="flex items-center gap-8 mb-4">
              {/* Montant Souscrit */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground leading-tight">{t('subscriptions.detail.header.subscribedAmount')}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-foreground">{subscription.amount.toLocaleString('fr-FR')} €</span>
                    <span className="text-xs text-muted-foreground font-medium">{t('subscriptions.detail.header.shares', { count: subscription.quantity.toLocaleString('fr-FR') })}</span>
                  </div>
                </div>
              </div>

              {/* Montant Appelé */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground leading-tight">{t('subscriptions.detail.header.calledAmount')}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-foreground">{(subscription.calledAmount ?? 0).toLocaleString('fr-FR')} €</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {subscription.amount > 0 ? `${Math.round(((subscription.calledAmount ?? 0) / subscription.amount) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Montant Distribué */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <ArrowDownCircle className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground leading-tight">{t('subscriptions.detail.header.distributedAmount')}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-foreground">{(subscription.distributedAmount ?? 0).toLocaleString('fr-FR')} €</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {subscription.amount > 0 ? `${Math.round(((subscription.distributedAmount ?? 0) / subscription.amount) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Solde Restant */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-muted flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-3 h-3 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground leading-tight">{t('subscriptions.detail.header.remainingBalance')}</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-foreground">{(subscription.remainingAmount ?? subscription.amount).toLocaleString('fr-FR')} €</span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {subscription.amount > 0 ? `${Math.round(((subscription.remainingAmount ?? subscription.amount) / subscription.amount) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Right column - Risk analysis + Export button */}
            <div className="flex flex-col items-end justify-end gap-3">
              <Button
                style={{ background: PRIMARY_BUTTON_GRADIENT }}
                className="gap-2 text-white hover:opacity-90"
                onClick={() => toast.success(t('subscriptions.detail.toast.featureComingSoon'))}
              >
                <Download className="w-4 h-4" />
                {t('subscriptions.detail.header.exportData')}
              </Button>

              {/* Analyse de risque compacte */}
              <Card className="p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Jauge circulaire compacte */}
                  <div className="flex flex-col items-center">
                    {(() => {
                      const riskConfig = subscription.riskLevel === 'High'
                        ? { score: 82, color: '#EF4444', variant: 'danger' as const, labelKey: 'subscriptions.detail.header.riskHigh' }
                        : subscription.riskLevel === 'Low'
                        ? { score: 28, color: '#10B981', variant: 'success' as const, labelKey: 'subscriptions.detail.header.riskLow' }
                        : { score: 65, color: '#F59E0B', variant: 'warning' as const, labelKey: 'subscriptions.detail.header.riskMedium' };
                      return (
                        <>
                          <div className="relative w-20 h-20">
                            <svg className="w-20 h-20 -rotate-90">
                              <circle cx="40" cy="40" r="34" stroke="#E5E7EB" strokeWidth="6" fill="none" />
                              <circle
                                cx="40" cy="40" r="34"
                                stroke={riskConfig.color}
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 34}`}
                                strokeDashoffset={`${2 * Math.PI * 34 * (1 - riskConfig.score / 100)}`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-xl font-bold text-foreground">{riskConfig.score}</span>
                              <span className="text-[10px] text-muted-foreground">/ 100</span>
                            </div>
                          </div>
                          <StatusBadge variant={riskConfig.variant} label={t(riskConfig.labelKey)} className="text-[10px] mt-1.5" />
                        </>
                      );
                    })()}
                  </div>

                  {/* Indicateurs */}
                  <div className="space-y-1.5">
                    {riskValidated && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-border">
                        <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] font-semibold text-green-900">{t('subscriptions.detail.header.riskValidated')}</div>
                          <div className="text-[9px] text-green-700">{t('subscriptions.detail.header.riskValidatedOn', { date: riskValidationDate })}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{t('subscriptions.detail.header.pepDetected')}</span>
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-[10px] h-5">
                        <AlertCircle className="w-2.5 h-2.5 mr-1" />
                        2
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{t('subscriptions.detail.header.sanctions')}</span>
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px] h-5">
                        <Check className="w-2.5 h-2.5 mr-1" />
                        0
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{t('subscriptions.detail.header.adverseMedia')}</span>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-[10px] h-5">
                        <AlertCircle className="w-2.5 h-2.5 mr-1" />
                        1
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Same structure as InvestorDetailPage */}
      <div className="px-8 -mt-px bg-card border-b border-border">
        <Tabs defaultValue="detail" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-6">
            <TabsTrigger 
              value="detail" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-3 pt-4 px-0 text-muted-foreground font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('subscriptions.detail.tabs.detail')}
            </TabsTrigger>
            <TabsTrigger 
              value="emails" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-3 pt-4 px-0 text-muted-foreground font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              {t('subscriptions.detail.tabs.emails')}
              <Badge className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                {mockEmails.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="capital-calls" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-3 pt-4 px-0 text-muted-foreground font-medium"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              {t('subscriptions.detail.tabs.capitalCalls')}
              <Badge className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {mockCapitalCalls.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="risk" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-3 pt-4 px-0 text-muted-foreground font-medium"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              {t('subscriptions.detail.tabs.risk')}
              <Badge className="ml-2 bg-red-50 text-red-700 border-red-200 text-xs">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-3 pt-4 px-0 text-muted-foreground font-medium"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              {t('subscriptions.detail.tabs.documents')}
              <Badge className="ml-2 bg-muted text-foreground/80 border-border text-xs">
                {mockDocuments.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="integrations" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-3 pt-4 px-0 text-muted-foreground font-medium"
            >
              <Database className="w-4 h-4 mr-2" />
              {t('subscriptions.detail.tabs.integrations')}
              <Badge className="ml-2 bg-cyan-50 text-cyan-700 border-cyan-200 text-xs">
                5
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none pb-3 pt-4 px-0 text-muted-foreground font-medium"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('subscriptions.detail.tabs.notes')}
              <Badge className="ml-2 bg-purple-50 text-purple-700 border-purple-200 text-xs">
                {mockNotes.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content - Detail */}
          <TabsContent value="detail" className="mt-0">
            <div className="px-8 py-6">
              <div className="flex gap-6">
                {/* Main Content Area */}
                <div className="flex-1">
                  {currentStep === 0 && (
                    // Initialisation de la souscription
                    <div className="space-y-6">
                      <Card className="p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-6">{t('subscriptions.detail.init.title')}</h2>

                        <div className="space-y-6">
                          {/* Investisseur */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.init.investorLabel')}</label>
                            <Input
                              placeholder={t('subscriptions.detail.init.investorPlaceholder')}
                              defaultValue={initData.investorName ?? ''}
                            />
                          </div>

                          {/* Structure */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.init.structureLabel')}</label>
                            <Input
                              placeholder={t('subscriptions.detail.init.structurePlaceholder')}
                              defaultValue={
                                initData.isDirect
                                  ? t('subscriptions.detail.init.directInvestment')
                                  : initData.structureName ?? ''
                              }
                            />
                          </div>

                          {/* Fonds */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.init.fundLabel')}</label>
                            <Input
                              placeholder={t('subscriptions.detail.init.fundPlaceholder')}
                              defaultValue={initData.fundName ?? ''}
                            />
                          </div>

                          {/* Part */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.init.shareLabel')}</label>
                            <Input
                              placeholder={t('subscriptions.detail.init.sharePlaceholder')}
                              defaultValue={
                                initData.shareClass ? t('subscriptions.detail.init.sharePrefix', { name: initData.shareClass }) : ''
                              }
                            />
                          </div>

                          {/* Nombre de parts */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.init.numberOfSharesLabel')}</label>
                              <Input
                                type="number"
                                placeholder="0"
                                defaultValue={initData.numberOfShares ?? ''}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.init.totalAmountLabel')}</label>
                              <Input
                                placeholder="0 €"
                                defaultValue={
                                  typeof initData.totalAmount === 'number'
                                    ? `${initData.totalAmount.toLocaleString('fr-FR')} €`
                                    : ''
                                }
                              />
                            </div>
                          </div>

                          {/* Partenaire */}
                          <div>
                            <label className="block text-sm font-semibold text-foreground/80 mb-2">{t('subscriptions.detail.init.partnerLabel')}</label>
                            <Input
                              placeholder={t('subscriptions.detail.init.partnerPlaceholder')}
                              defaultValue={initData.distributorName ?? ''}
                            />
                          </div>

                          <Separator />

                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={onBack}>{t('subscriptions.detail.init.cancel')}</Button>
                            <Button
                              className="hover:opacity-90"
                              style={{ background: PRIMARY_BUTTON_GRADIENT }}
                              onClick={() => {
                                setCurrentStep(1);
                                toast.success(t('subscriptions.detail.init.subscriptionInitialized'));
                              }}
                            >
                              {t('subscriptions.detail.init.createSubscription')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {currentStep === 1 && (
                    // Onboarding en cours - contenu actuel
                    <div className="space-y-4">
              {mockSections.map((section) => {
                const Icon = section.icon;
                const isOpen = openSections.includes(section.id);
                const stats = section.id !== 'documents' ? getSectionStats(section.id) : null;
                const allVerified = stats ? stats.approved === stats.total && stats.total > 0 : false;

                return (
                  <Collapsible
                    key={section.id}
                    open={isOpen}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <Card
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-5 hover:bg-muted transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              stats && stats.approved === stats.total
                                ? 'bg-[var(--success-soft)]'
                                : 'bg-primary/10'
                            }`}>
                              <Icon className={`w-6 h-6 ${
                                stats && stats.approved === stats.total
                                  ? 'text-emerald-600'
                                  : 'text-primary'
                              }`} />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-foreground text-lg mb-1">{t(section.titleKey)}</h3>
                              {stats && (
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-muted-foreground font-semibold text-foreground">
                                    {t('subscriptions.detail.onboarding.answeredOf', { answered: stats.answered, total: stats.total })}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-border" />
                                  <span className="text-emerald-600 font-semibold">
                                    {t('subscriptions.detail.onboarding.validated', { count: stats.approved })}
                                  </span>
                                  {stats.rejected > 0 && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-border" />
                                      <span className="text-red-600 font-semibold">
                                        {t('subscriptions.detail.onboarding.rejected', { count: stats.rejected })}
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                              {section.id === 'documents' && (
                                <p className="text-xs text-muted-foreground">
                                  {t('subscriptions.detail.onboarding.requiredDocuments', { count: mockRequiredDocuments.length })}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {stats && stats.approved === stats.total && stats.total > 0 ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                {t('subscriptions.detail.onboarding.sectionValidated')}
                              </Badge>
                            ) : stats && stats.rejected > 0 ? (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                {t('subscriptions.detail.onboarding.rejectedCount', { count: stats.rejected })}
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
                                    onClick={() => handleValidateSection(section.id, t(section.titleKey))}
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
                                    </tr>
                                  </thead>
                                  <tbody className="bg-card divide-y divide-border/50">
                                    {mockRequiredDocuments.map((doc, idx) => (
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
                                            {t('subscriptions.detail.docsTable.add')}
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
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
                  )}

                  {currentStep === 2 && (
                    // Validation - même contenu que onboarding avec action de validation
                    <div className="space-y-4">
                      {/* Statistiques de complétion */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Onboarding */}
                        <Card className="p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">{t('subscriptions.detail.validation.onboarding')}</h3>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t('subscriptions.detail.validation.complete')}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{t('subscriptions.detail.validation.questionsAnswered')}</span>
                                <span className="font-semibold text-foreground">142/142</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-[var(--success)] h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{t('subscriptions.detail.validation.questionsValidated')}</span>
                                <span className="font-semibold text-foreground">138/142</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: '97%' }}></div>
                              </div>
                            </div>
                          </div>
                        </Card>

                        {/* Documents */}
                        <Card className="p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">{t('subscriptions.detail.validation.documentsTab')}</h3>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {t('subscriptions.detail.validation.documentsValidated')}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{t('subscriptions.detail.validation.documentsProvided')}</span>
                                <span className="font-semibold text-foreground">8/8</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-[var(--success)] h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{t('subscriptions.detail.validation.documentsValidatedLabel')}</span>
                                <span className="font-semibold text-foreground">8/8</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-[var(--success)] h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Niveau de risque */}
                      <Card className="p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">{t('subscriptions.detail.validation.riskLevel')}</h3>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            {t('subscriptions.detail.validation.medium')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Détail du calcul */}
                          <div className="bg-muted rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-foreground mb-3">{t('subscriptions.detail.validation.riskDetailTitle')}</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-foreground/80">{t('subscriptions.detail.validation.residenceCountry')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">France</span>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">{t('subscriptions.detail.validation.low')}</Badge>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-foreground/80">{t('subscriptions.detail.validation.investorProfile')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">HNWI</span>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">{t('subscriptions.detail.validation.medium')}</Badge>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-foreground/80">{t('subscriptions.detail.validation.subscriptionAmount')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">500 000 €</span>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">{t('subscriptions.detail.validation.medium')}</Badge>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Scale className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-sm text-foreground/80">{t('subscriptions.detail.validation.fundsOrigin')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground">Salaires</span>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">{t('subscriptions.detail.validation.low')}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Validation du risque */}
                          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                              <div>
                                <div className="font-medium text-foreground">{t('subscriptions.detail.validation.riskValidationRequired')}</div>
                                <div className="text-sm text-muted-foreground">{t('subscriptions.detail.validation.riskValidationDesc')}</div>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success(t('subscriptions.detail.toast.riskValidated'))}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.validation.validate')}
                            </Button>
                          </div>
                        </div>
                      </Card>

                      {/* Niveau KYC */}
                      <Card className="p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">{t('subscriptions.detail.validation.kycLevel')}</h3>
                          <Badge className="bg-primary/10 text-primary border-primary/30">
                            {t('subscriptions.detail.validation.advanced')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-primary/5 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <ShieldAlert className="w-5 h-5 text-primary" />
                              <div>
                                <div className="font-medium text-foreground">{t('subscriptions.detail.validation.advancedControlsRequired')}</div>
                                <div className="text-sm text-muted-foreground">{t('subscriptions.detail.validation.advancedControlsDesc')}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-card rounded-lg p-3">
                                <div className="text-xs text-muted-foreground mb-1">{t('subscriptions.detail.validation.controlsCompleted')}</div>
                                <div className="font-semibold text-foreground">12/12</div>
                              </div>
                              <div className="bg-card rounded-lg p-3">
                                <div className="text-xs text-muted-foreground mb-1">{t('subscriptions.detail.validation.statusLabel')}</div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold text-foreground">{t('subscriptions.detail.validation.compliant')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Analyses Screening */}
                      <Card className="p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">{t('subscriptions.detail.validation.screeningAnalysis')}</h3>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            {t('subscriptions.detail.validation.pendingDecisions', { count: 2 })}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Investisseur principal */}
                          <div className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">Inès Wadouachi</div>
                                  <div className="text-sm text-muted-foreground">{t('subscriptions.detail.validation.mainInvestor')}</div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t('subscriptions.detail.validation.validatedStatus')}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-foreground/80">{t('subscriptions.detail.validation.pepNegative')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-foreground/80">{t('subscriptions.detail.validation.sanctionsNegative')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-foreground/80">{t('subscriptions.detail.validation.mediaNegative')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Bénéficiaire effectif 1 */}
                          <div className="border-2 border-amber-200 bg-amber-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                  <Users className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">Jean Dupont</div>
                                  <div className="text-sm text-muted-foreground">{t('subscriptions.detail.validation.beneficialOwner', { pct: 35 })}</div>
                                </div>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {t('subscriptions.detail.validation.pendingStatus')}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="bg-card rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                  <span className="text-sm font-medium text-foreground">{t('subscriptions.detail.validation.mediaAlertDetected', { count: 1 })}</span>
                                </div>
                                <div className="text-sm text-foreground/80 mb-3">
                                  {t('subscriptions.detail.validation.mediaAlertDesc')}
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success(t('subscriptions.detail.validation.decisionAcceptedReserve'))}
                                    className="flex-1"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    {t('subscriptions.detail.validation.acceptWithReserve')}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success(t('subscriptions.detail.validation.decisionRejectedToast'))}
                                    className="flex-1"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    {t('subscriptions.detail.validation.reject')}
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-foreground/80">{t('subscriptions.detail.validation.pepNegative')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-foreground/80">{t('subscriptions.detail.validation.sanctionsNegative')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  <span className="text-foreground/80">{t('subscriptions.detail.validation.mediaAlert', { count: 1 })}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Bénéficiaire effectif 2 */}
                          <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                  <Users className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">Marie Martin</div>
                                  <div className="text-sm text-muted-foreground">{t('subscriptions.detail.validation.beneficialOwner', { pct: 25 })}</div>
                                </div>
                              </div>
                              <Badge className="bg-red-100 text-red-700 border-red-300">
                                <X className="w-3 h-3 mr-1" />
                                {t('subscriptions.detail.validation.decisionRequired')}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="bg-card rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <ShieldAlert className="w-4 h-4 text-red-600" />
                                  <span className="text-sm font-medium text-foreground">{t('subscriptions.detail.validation.pepPerson')}</span>
                                </div>
                                <div className="text-sm text-foreground/80 mb-3">
                                  {t('subscriptions.detail.validation.pepDesc')}
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success(t('subscriptions.detail.validation.decisionAcceptedAfterDD'))}
                                    className="flex-1"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    {t('subscriptions.detail.validation.acceptAfterDD')}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success(t('subscriptions.detail.validation.decisionEscalated'))}
                                    className="flex-1"
                                  >
                                    <Flag className="w-3 h-3 mr-1" />
                                    {t('subscriptions.detail.validation.escalate')}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.error(t('subscriptions.detail.validation.rejectSubscription'))}
                                    className="flex-1"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    {t('subscriptions.detail.validation.reject')}
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span className="text-foreground/80">{t('subscriptions.detail.validation.pepPositive')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-foreground/80">{t('subscriptions.detail.validation.sanctionsNegative')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-foreground/80">{t('subscriptions.detail.validation.mediaNegative')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Entité liée */}
                          <div className="border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-muted rounded-lg">
                                  <Building2 className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">Holding Familiale SAS</div>
                                  <div className="text-sm text-muted-foreground">{t('subscriptions.detail.validation.linkedEntity')}</div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t('subscriptions.detail.validation.validatedStatus')}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-foreground/80">{t('subscriptions.detail.validation.sanctionsNegative')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-foreground/80">{t('subscriptions.detail.validation.mediaNegative')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-foreground/80">{t('subscriptions.detail.validation.legalOk')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Validation finale */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-500 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground mb-2">{t('subscriptions.detail.validation.readyForValidation')}</h3>
                            <p className="text-sm text-foreground/80 mb-4">
                              {t('subscriptions.detail.validation.readyForValidationDesc')}
                            </p>
                            <Button 
                              className="hover:opacity-90"
                              style={{ background: PRIMARY_BUTTON_GRADIENT }}
                              onClick={() => {
                                setCurrentStep(3);
                                toast.success(t('subscriptions.detail.validation.subscriptionValidated'));
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.validation.validateSubscription')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    // Envoyer en signature
                    <div className="space-y-6">
                      <Card className="p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-6">{t('subscriptions.detail.signature.title')}</h2>

                        <div className="space-y-6">
                          {/* Signataires */}
                          <div>
                            <h3 className="font-semibold text-foreground mb-3">{t('subscriptions.detail.signature.signatories')}</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <input type="checkbox" defaultChecked className="w-4 h-4" />
                                <div className="flex-1">
                                  <div className="font-medium text-foreground">Inès Wadouachi</div>
                                  <div className="text-sm text-muted-foreground">iwadouachi+testPM@eurazeo.com</div>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-primary/30">{t('subscriptions.detail.signature.investorRole')}</Badge>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                {t('subscriptions.detail.signature.addSignatory')}
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          {/* Documents à signer */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-foreground">{t('subscriptions.detail.signature.documentsToSign')}</h3>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toast.info(t('subscriptions.detail.signature.uploadToast'))}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                {t('subscriptions.detail.signature.uploadDocument')}
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {['Bulletin de souscription', 'DICI', 'Statuts', 'Side letter'].map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span className="flex-1 text-sm text-foreground">{doc}</span>
                                  
                                  {/* Type de document */}
                                  <select className="text-xs border border-border rounded px-2 py-1 bg-card">
                                    <option value="signature">{t('subscriptions.detail.signature.toSign')}</option>
                                    <option value="annexe">{t('subscriptions.detail.signature.annex')}</option>
                                  </select>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => toast.info(t('subscriptions.detail.signature.previewToast'))}
                                      className="p-1.5 hover:bg-muted rounded transition-colors"
                                      title={t('subscriptions.detail.signature.preview')}
                                    >
                                      <Eye className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <button
                                      onClick={() => toast.success(t('subscriptions.detail.signature.documentDeletedToast'))}
                                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                      title={t('subscriptions.detail.signature.delete')}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          {/* Catégorisation investisseur */}
                          <div>
                            <h3 className="font-semibold text-foreground mb-3">{t('subscriptions.detail.signature.investorCategorization')}</h3>
                            <div className="grid grid-cols-3 gap-3">
                              {[t('subscriptions.detail.signature.professional'), t('subscriptions.detail.signature.nonProfessional'), t('subscriptions.detail.signature.proOnOption')].map((cat, idx) => (
                                <div key={idx} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${idx === 1 ? 'border-primary bg-primary/5' : 'border-border hover:border-border'}`}>
                                  <div className="font-medium text-sm text-foreground text-center">{cat}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-end gap-3">
                            <Button variant="outline">{t('subscriptions.detail.signature.saveDraft')}</Button>
                            <Button 
                              className="hover:opacity-90"
                              style={{ background: PRIMARY_BUTTON_GRADIENT }}
                              onClick={() => {
                                setCurrentStep(4);
                                toast.success(t('subscriptions.detail.signature.documentsSentForSignature'));
                              }}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.signature.sendForSignature')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {currentStep === 4 && (
                    // Signatures
                    <div className="space-y-6">
                      <Card className="p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-6">{t('subscriptions.detail.signatures.title')}</h2>
                        
                        <div className="space-y-4">
                          {/* Signataire 1 */}
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">Inès Wadouachi</div>
                                  <div className="text-sm text-muted-foreground">iwadouachi+testPM@eurazeo.com</div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t('subscriptions.detail.signatures.signed')}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{t('subscriptions.detail.signatures.signedOn', { date: '29/12/2025 à 14:32' })}</div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              <Mail className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.signatures.resendToSignatories')}
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <FileText className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.signatures.regenerateLinks')}
                            </Button>
                          </div>

                          <Separator />

                          <div className="flex justify-end">
                            <Button 
                              className="hover:opacity-90"
                              style={{ background: PRIMARY_BUTTON_GRADIENT }}
                              onClick={() => {
                                setCurrentStep(6);
                                toast.success(t('subscriptions.detail.signatures.toCounterSignature'));
                              }}
                            >
                              {t('subscriptions.detail.signatures.continueToCounterSignature')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {currentStep === 5 && (
                    // Contre-signature
                    <div className="space-y-6">
                      <Card className="p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-foreground mb-6">{t('subscriptions.detail.counterSignature.title')}</h2>
                        
                        <div className="space-y-4">
                          {/* Gérant du fonds */}
                          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground">Laurent Dupuis</div>
                                  <div className="text-sm text-muted-foreground">laurent.dupuis@investhub.com</div>
                                  <div className="text-xs text-muted-foreground mt-1">{t('subscriptions.detail.counterSignature.fundManager')}</div>
                                </div>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                <Clock className="w-3 h-3 mr-1" />
                                {t('subscriptions.detail.counterSignature.pending')}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{t('subscriptions.detail.counterSignature.linkSentOn', { date: '29/12/2025 à 15:45' })}</div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              <Mail className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.counterSignature.resendEmail')}
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <FileText className="w-4 h-4 mr-2" />
                              {t('subscriptions.detail.counterSignature.regenerateLink')}
                            </Button>
                          </div>

                          <Separator />

                          <div className="flex justify-end">
                            <Button 
                              className="hover:opacity-90"
                              style={{ background: PRIMARY_BUTTON_GRADIENT }}
                              onClick={() => {
                                setCurrentStep(7);
                                toast.success(t('subscriptions.detail.counterSignature.toPayment'));
                              }}
                            >
                              {t('subscriptions.detail.counterSignature.continueToPayment')}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {currentStep === 6 && (
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

                {/* Stepper Sidebar */}
                <div className="w-80 flex-shrink-0">
                  {/* Stepper */}
                  <Card className="sticky top-32 p-6 shadow-sm">
                    <h3 className="font-bold text-foreground mb-6">{t('subscriptions.detail.stepper.title')}</h3>

                    <div className="space-y-1">
                      {[
                        { id: 0, labelKey: 'subscriptions.detail.stepper.initialization', icon: Settings },
                        { id: 1, labelKey: 'subscriptions.detail.stepper.onboarding', icon: FileText },
                        { id: 2, labelKey: 'subscriptions.detail.stepper.validation', icon: CheckCircle2 },
                        { id: 3, labelKey: 'subscriptions.detail.stepper.sendToSignature', icon: Mail },
                        { id: 4, labelKey: 'subscriptions.detail.stepper.signatures', icon: FileCheck },
                        { id: 5, labelKey: 'subscriptions.detail.stepper.counterSignature', icon: PenTool },
                        { id: 6, labelKey: 'subscriptions.detail.stepper.payment', icon: Wallet },
                      ].map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;
                        const isAccessible = step.id <= currentStep + 1; // Can go to current or next step

                        return (
                          <div key={step.id}>
                            <button
                              onClick={() => isAccessible && setCurrentStep(step.id)}
                              disabled={!isAccessible}
                              style={isActive ? { background: PRIMARY_BUTTON_GRADIENT } : undefined}
                              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                                isActive
                                  ? 'text-white shadow-md'
                                  : isCompleted
                                    ? 'bg-green-50 hover:bg-green-100 text-green-900'
                                    : isAccessible
                                      ? 'hover:bg-muted text-foreground'
                                      : 'opacity-40 cursor-not-allowed text-muted-foreground/60'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                isActive 
                                  ? 'bg-white/20'
                                  : isCompleted 
                                    ? 'bg-green-200'
                                    : 'bg-muted'
                              }`}>
                                {isCompleted ? (
                                  <Check className={`w-4 h-4 ${isActive ? 'text-white' : 'text-green-600'}`} />
                                ) : (
                                  <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>
                                  {t(step.labelKey)}
                                </div>
                                <div className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                                  {t('subscriptions.detail.stepper.stepOf', { current: step.id + 1, total: 7 })}
                                </div>
                              </div>
                            </button>
                            {index < 6 && (
                              <div className={`w-px h-4 ml-7 ${isCompleted ? 'bg-green-300' : 'bg-border'}`}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
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
          <TabsContent value="risk" className="mt-0">
            <div className="px-8 py-6">
              <div className="space-y-6">
                {/* Risk Overview Header */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Overall Risk Score Card */}
                  <div className="col-span-1 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 border border-red-200 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative mb-4">
                        <div
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg"
                        >
                          <span className="text-3xl font-bold text-white">72</span>
                        </div>
                        <div
                          className="absolute inset-0 rounded-full bg-red-400/20 blur-md"
                        />
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{t('subscriptions.detail.riskTab.overallRiskScore')}</h3>
                      <Badge className="bg-red-100 text-red-700 border-red-300 font-semibold">
                        {t('subscriptions.detail.header.riskHigh')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t('subscriptions.detail.riskTab.activeAlerts', { count: 3 })}
                      </p>
                      <Separator className="my-3" />
                      {riskValidated ? (
                        <div className="space-y-2">
                          <Badge className="bg-green-100 text-green-700 border-green-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {t('subscriptions.detail.validation.validatedStatus')}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            <div>{t('subscriptions.detail.header.validatedByLabel', { name: riskValidatedBy })}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{riskValidationDate}</div>
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {t('subscriptions.detail.header.riskNotValidated')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Risk Categories */}
                  <div className="col-span-3 grid grid-cols-3 gap-4">
                    {/* PEP Risk */}
                    <div className="bg-card border border-orange-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                          {t('subscriptions.detail.riskTab.active')}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{t('subscriptions.detail.riskTab.pep')}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{t('subscriptions.detail.riskTab.pepDesc')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-orange-600">1</span>
                        <span className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.match')}</span>
                      </div>
                    </div>

                    {/* Sanctions Risk */}
                    <div className="bg-card border border-red-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Scale className="w-5 h-5 text-red-600" />
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                          {t('subscriptions.detail.riskTab.active')}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{t('subscriptions.detail.riskTab.sanctionsTitle')}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{t('subscriptions.detail.riskTab.sanctionsDesc')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-red-600">1</span>
                        <span className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.match')}</span>
                      </div>
                    </div>

                    {/* Adverse Media Risk */}
                    <div className="bg-card border border-amber-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Newspaper className="w-5 h-5 text-amber-600" />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                          {t('subscriptions.detail.riskTab.active')}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{t('subscriptions.detail.riskTab.adverseMediaTitle')}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{t('subscriptions.detail.riskTab.adverseMediaDesc')}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-amber-600">1</span>
                        <span className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.article')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Matrix Detail */}
                <Card className="overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Scale className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{t('subscriptions.detail.riskTab.riskMatrix')}</h3>
                          <p className="text-sm text-muted-foreground">{t('subscriptions.detail.riskTab.riskMatrixDesc')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            72.00
                          </div>
                          <div className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.points')}</div>
                        </div>
                        {!riskValidated && (
                          <Button
                            onClick={handleValidateRisk}
                            className="gap-2 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            {t('subscriptions.detail.riskTab.validateScoring')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Personne Physique */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                          <User className="w-5 h-5 text-indigo-600" />
                          <h4 className="font-bold text-foreground">{t('subscriptions.detail.riskTab.naturalPerson')}</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.subscriberType')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.complianceDecision')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.activitySector')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.relationOrigin')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.nationality')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-orange-50">
                            <span className="text-sm text-foreground/80 font-medium">{t('subscriptions.detail.riskTab.pepSubscriber')}</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-bold text-orange-700">15.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.taxResidenceCountry')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-amber-50">
                            <span className="text-sm text-foreground/80 font-medium">{t('subscriptions.detail.riskTab.residenceCountryDiff')}</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">5.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.coSubscriberNationality')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.coSubscriberRelationOrigin')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.pepCoSubscriber')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.coSubscriberTaxResidence')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.coSubscriberActivitySector')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.coSubscriberResidenceDiff')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Personne Morale */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                          <Building2 className="w-5 h-5 text-purple-600" />
                          <h4 className="font-bold text-foreground">{t('subscriptions.detail.riskTab.legalEntity')}</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-red-50">
                            <span className="text-sm text-foreground/80 font-medium">{t('subscriptions.detail.riskTab.relationOrigin')}</span>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-bold text-red-700">20.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.complianceDecision')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.activitySector')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">4.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.pepRL')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-red-50">
                            <span className="text-sm text-foreground/80 font-medium">{t('subscriptions.detail.riskTab.pepStructure')}</span>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-bold text-red-700">18.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.registrationCountry')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.fatca')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-amber-50">
                            <span className="text-sm text-foreground/80 font-medium">{t('subscriptions.detail.riskTab.regulatedEntity')}</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">6.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.ribDomiciliation')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.pepRL2')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.pepRL3')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.pepRL4')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-amber-50">
                            <span className="text-sm text-foreground/80 font-medium">{t('subscriptions.detail.riskTab.pepBE1')}</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">5.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-foreground/80">{t('subscriptions.detail.riskTab.pepBE2')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border/50 bg-amber-50">
                            <span className="text-sm text-foreground/80 font-medium">{t('subscriptions.detail.riskTab.pepBE3')}</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">4.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 pt-6 border-t-2 border-border">
                      <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">{t('subscriptions.detail.riskTab.globalRiskScore')}</div>
                            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                              72.00 / 100
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-red-100 text-red-700 border-red-300 font-bold text-lg px-4 py-2">
                            {t('subscriptions.detail.header.riskHigh')}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-2">
                            {t('subscriptions.detail.riskTab.basedOnCriteria', { count: 15 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Risk Details Table */}
                <Card className="overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gradient-to-r from-muted to-card border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{t('subscriptions.detail.riskTab.alertDetails')}</h3>
                          <p className="text-sm text-muted-foreground">{t('subscriptions.detail.riskTab.alertDetailsDesc')}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => toast.info(t('subscriptions.detail.riskTab.exportAlerts'), { description: t('subscriptions.detail.riskTab.exportAlertsDesc') })}
                      >
                        <Download className="w-4 h-4" />
                        {t('subscriptions.detail.riskTab.export')}
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.riskTab.alertType')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.riskTab.details')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.riskTab.riskLevel')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.riskTab.statusCol')}
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.riskTab.detectionDate')}
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {t('subscriptions.detail.riskTab.actions')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {/* PEP Alert */}
                        <tr className="hover:bg-orange-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Users className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{t('subscriptions.detail.riskTab.pepLevel1')}</div>
                                <div className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.pepLevel1Desc')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground/80">
                              <div className="font-medium mb-1">{t('subscriptions.detail.riskTab.ministerialFunction')}</div>
                              <div className="text-xs text-muted-foreground">
                                {t('subscriptions.detail.riskTab.ministerialFunctionDesc')}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {t('subscriptions.detail.riskTab.sourceACPR')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              <Badge className="bg-orange-100 text-orange-700 border-orange-300 font-semibold">
                                {t('subscriptions.detail.riskTab.highLevel')}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Score: 85/100</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                              {t('subscriptions.detail.riskTab.inReview')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>28/12/2025</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">14:32</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.info(t('subscriptions.detail.riskTab.pepDetails'), { description: t('subscriptions.detail.riskTab.pepDetailsDesc') })}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Sanctions Alert */}
                        <tr className="hover:bg-red-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <Scale className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{t('subscriptions.detail.riskTab.sanctionsList')}</div>
                                <div className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.ofacEu')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground/80">
                              <div className="font-medium mb-1">{t('subscriptions.detail.riskTab.partialMatchDetected')}</div>
                              <div className="text-xs text-muted-foreground">
                                {t('subscriptions.detail.riskTab.partialMatchDesc', { pct: 87 })}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {t('subscriptions.detail.riskTab.sourceOFAC')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <Badge className="bg-red-100 text-red-700 border-red-300 font-semibold">
                                {t('subscriptions.detail.riskTab.critical')}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Score: 92/100</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-red-100 text-red-700 border-red-300">
                              {t('subscriptions.detail.riskTab.actionRequired')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>29/12/2025</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">09:15</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.info(t('subscriptions.detail.riskTab.sanctionsDetails'), { description: t('subscriptions.detail.riskTab.sanctionsDetailsDesc') })}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* Adverse Media Alert */}
                        <tr className="hover:bg-amber-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-amber-100 rounded-lg">
                                <Newspaper className="w-4 h-4 text-amber-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{t('subscriptions.detail.riskTab.adverseMediaAlert')}</div>
                                <div className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.adverseMediaAlertDesc')}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground/80">
                              <div className="font-medium mb-1">{t('subscriptions.detail.riskTab.pressArticle')}</div>
                              <div className="text-xs text-muted-foreground">
                                {t('subscriptions.detail.riskTab.pressArticleDesc')}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {t('subscriptions.detail.riskTab.sourceAutomated')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold">
                                {t('subscriptions.detail.riskTab.mediumLevel')}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Score: 68/100</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-primary/10 text-primary border-primary/30">
                              {t('subscriptions.detail.riskTab.inAnalysis')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>27/12/2025</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">16:48</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.info(t('subscriptions.detail.riskTab.mediaDetails'), { description: t('subscriptions.detail.riskTab.mediaDetailsDesc') })}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Additional Risk Information */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Risk Timeline */}
                  <Card className="p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">{t('subscriptions.detail.riskTab.riskTimeline')}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                          <div className="w-px h-full bg-border mt-1"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-xs text-muted-foreground mb-1">29/12/2025 - 09:15</div>
                          <div className="font-medium text-foreground">{t('subscriptions.detail.riskTab.sanctionsAlertDetected')}</div>
                          <div className="text-sm text-muted-foreground mt-1">{t('subscriptions.detail.riskTab.sanctionsAlertDesc')}</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                          <div className="w-px h-full bg-border mt-1"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-xs text-muted-foreground mb-1">28/12/2025 - 14:32</div>
                          <div className="font-medium text-foreground">{t('subscriptions.detail.riskTab.pepIdentification')}</div>
                          <div className="text-sm text-muted-foreground mt-1">{t('subscriptions.detail.riskTab.pepIdentificationDesc')}</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                          <div className="w-px h-full bg-border mt-1"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-xs text-muted-foreground mb-1">27/12/2025 - 16:48</div>
                          <div className="font-medium text-foreground">{t('subscriptions.detail.riskTab.adverseMediaFound')}</div>
                          <div className="text-sm text-muted-foreground mt-1">{t('subscriptions.detail.riskTab.adverseMediaFoundDesc')}</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-muted-foreground mb-1">25/12/2025 - 10:00</div>
                          <div className="font-medium text-foreground">{t('subscriptions.detail.riskTab.initialScreening')}</div>
                          <div className="text-sm text-muted-foreground mt-1">{t('subscriptions.detail.riskTab.initialScreeningDesc')}</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Risk Mitigation Actions */}
                  <Card className="p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-foreground">{t('subscriptions.detail.riskTab.mitigationActions')}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-foreground mb-1">{t('subscriptions.detail.riskTab.eddActivated')}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('subscriptions.detail.riskTab.eddDesc')}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">{t('subscriptions.detail.riskTab.completedAt', { pct: 65 })}</div>
                            <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                              <div className="bg-[var(--success)] h-1.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-foreground mb-1">{t('subscriptions.detail.riskTab.additionalDocs')}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('subscriptions.detail.riskTab.additionalDocsDesc')}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 w-full"
                              onClick={() => toast.info(t('subscriptions.detail.riskTab.requestSent'), { description: t('subscriptions.detail.riskTab.requestSentDesc') })}
                            >
                              {t('subscriptions.detail.riskTab.requestDocuments')}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-foreground mb-1">{t('subscriptions.detail.riskTab.hierarchicalValidation')}</div>
                            <div className="text-sm text-muted-foreground">
                              {t('subscriptions.detail.riskTab.hierarchicalValidationDesc')}
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 mt-2">
                              {t('subscriptions.detail.riskTab.pendingStatus')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Country Risk Assessment */}
                <Card className="p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{t('subscriptions.detail.riskTab.geoRiskAnalysis')}</h3>
                      <p className="text-sm text-muted-foreground">{t('subscriptions.detail.riskTab.geoRiskAnalysisDesc')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🇫🇷</div>
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                          {t('subscriptions.detail.validation.low')}
                        </Badge>
                      </div>
                      <div className="font-semibold text-foreground mb-1">{t('subscriptions.detail.riskTab.france')}</div>
                      <div className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.residenceCountryLabel')}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-sm font-bold text-green-700">2.1</div>
                        <div className="text-xs text-muted-foreground">/10</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🇨🇭</div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                          {t('subscriptions.detail.validation.medium')}
                        </Badge>
                      </div>
                      <div className="font-semibold text-foreground mb-1">{t('subscriptions.detail.riskTab.switzerland')}</div>
                      <div className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.bankAccount')}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-sm font-bold text-amber-700">4.8</div>
                        <div className="text-xs text-muted-foreground">/10</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🇵🇦</div>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                          {t('subscriptions.detail.riskTab.highLevel')}
                        </Badge>
                      </div>
                      <div className="font-semibold text-foreground mb-1">{t('subscriptions.detail.riskTab.panama')}</div>
                      <div className="text-xs text-muted-foreground">{t('subscriptions.detail.riskTab.offshoreStructure')}</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-sm font-bold text-orange-700">7.5</div>
                        <div className="text-xs text-muted-foreground">/10</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

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
    </div>
  );
}