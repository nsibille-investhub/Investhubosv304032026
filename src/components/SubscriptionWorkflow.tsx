import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  UserCheck,
  Send,
  Building2,
  Calendar,
  XCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
  Check,
  CheckCircle,
  PenTool,
  BadgeCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { toast } from 'sonner';

interface WorkflowStep {
  id: string;
  label: string;
  icon: any;
  status: 'completed' | 'current' | 'pending';
  date?: string;
  description?: string;
  action?: string;
}

interface GlobalStats {
  total: number;
  answered: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface DocumentStats {
  totalRequired: number;
  submitted: number;
  validated: number;
  rejected: number;
}

interface SubscriptionWorkflowProps {
  subscription: any;
  globalStats?: GlobalStats;
  documentStats?: DocumentStats;
  onStepClick?: (stepId: string) => void;
}

const getWorkflowSteps = (subscriptionStatus: string, createdAt: Date): WorkflowStep[] => {
  const statusOrder = [
    'Draft',
    'Onboarding',
    'À valider',
    'À signer',
    'Investisseur signé',
    'Exécuté',
    'En attente de fonds',
    'Active'
  ];

  // Map subscription status to workflow position
  const currentIndex = (() => {
    switch (subscriptionStatus) {
      case 'Draft': return 0;
      case 'Onboarding': return 1;
      case 'À signer': return 3;
      case 'Investisseur signé': return 4;
      case 'Exécuté': return 5;
      case 'En attente de fonds': return 6;
      case 'Active': return 7;
      default: return 2; // À valider
    }
  })();

  const steps: WorkflowStep[] = [
    {
      id: 'created',
      label: 'Début de la souscription',
      icon: FileText,
      status: currentIndex >= 0 ? 'completed' : 'pending',
      date: createdAt.toLocaleDateString('fr-FR'),
      description: 'Souscription créée et initialisée',
    },
    {
      id: 'onboarding',
      label: 'Collecte des informations',
      icon: Users,
      status: currentIndex > 1 ? 'completed' : currentIndex === 1 ? 'current' : 'pending',
      description: 'Remplissage du formulaire KYC',
      action: 'Voir les questions'
    },
    {
      id: 'validation',
      label: 'Validation compliance',
      icon: CheckCircle,
      status: currentIndex > 2 ? 'completed' : currentIndex === 2 ? 'current' : 'pending',
      description: 'Vérification et validation des informations',
      action: 'Valider la souscription'
    },
    {
      id: 'request_signature',
      label: 'Demander une signature',
      icon: PenTool,
      status: currentIndex > 3 ? 'completed' : currentIndex === 3 ? 'current' : 'pending',
      description: 'Envoi du bulletin pour signature',
      action: 'Préparer la signature'
    },
    {
      id: 'waiting_signature',
      label: 'Signature client en attente',
      icon: Clock,
      status: currentIndex > 4 ? 'completed' : currentIndex === 4 ? 'current' : 'pending',
      description: 'En attente de la signature du client',
      action: 'Voir le statut'
    },
    {
      id: 'execution',
      label: 'Exécution de la souscription',
      icon: BadgeCheck,
      status: currentIndex > 5 ? 'completed' : currentIndex === 5 ? 'current' : 'pending',
      description: 'Souscription signée et exécutée',
      action: 'Voir les détails'
    },
    {
      id: 'request_payment',
      label: 'Demander un versement',
      icon: DollarSign,
      status: currentIndex > 6 ? 'completed' : currentIndex === 6 ? 'current' : 'pending',
      description: 'Demande de versement des fonds',
      action: 'Envoyer la demande'
    },
    {
      id: 'active',
      label: 'Souscription active',
      icon: Check,
      status: currentIndex >= 7 ? 'completed' : 'pending',
      description: 'Souscription complète et active',
    }
  ];

  return steps;
};

export function SubscriptionWorkflow({ subscription, globalStats, documentStats, onStepClick }: SubscriptionWorkflowProps) {
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const steps = getWorkflowSteps(subscription.status, subscription.createdAt);
  
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  // Calculate risk score based on rejections
  const calculateRiskScore = () => {
    if (!globalStats || !documentStats) return 'low';
    const totalItems = globalStats.total + documentStats.totalRequired;
    const totalRejected = globalStats.rejected + documentStats.rejected;
    const rejectionRate = (totalRejected / totalItems) * 100;
    
    if (rejectionRate > 20) return 'high';
    if (rejectionRate > 10) return 'medium';
    return 'low';
  };

  const riskScore = calculateRiskScore();
  const riskColors = {
    high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', gradient: 'from-red-500 to-red-600' },
    medium: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', gradient: 'from-orange-500 to-orange-600' },
    low: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', gradient: 'from-emerald-500 to-emerald-600' }
  };

  const handleStepClick = (step: WorkflowStep) => {
    setSelectedStep(step);
    setDialogOpen(true);
    onStepClick?.(step.id);
  };

  const handleStepAction = (step: WorkflowStep) => {
    switch (step.id) {
      case 'onboarding':
        toast.info('Navigation vers les questions', {
          description: 'Affichage du formulaire de collecte'
        });
        break;
      case 'validation':
        toast.success('Validation en cours', {
          description: 'Vérification des informations compliance'
        });
        break;
      case 'request_signature':
        toast.info('Préparation de la signature', {
          description: 'Sélection des signataires et documents'
        });
        break;
      case 'waiting_signature':
        toast.info('Statut de signature', {
          description: 'Vérification de l\'état de la signature'
        });
        break;
      case 'request_payment':
        toast.info('Demande de versement', {
          description: 'Envoi de la demande de fonds'
        });
        break;
      default:
        toast.info('Détails de l\'étape', {
          description: step.description
        });
    }
    setDialogOpen(false);
  };

  const getStepGradient = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-emerald-500 to-teal-500';
      case 'current':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-gray-300 to-gray-400';
    }
  };

  const getStepIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600';
      case 'current':
        return 'text-blue-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50/30 to-white shadow-lg"
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/40 opacity-50" />
        
        <div className="relative p-4">
          {/* Header with progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-bold text-gray-900">Workflow</h3>
                  <p className="text-xs text-gray-500">Progression de la souscription</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {Math.round(progress)}%
                </div>
                <div className="text-xs text-gray-500">{completedSteps}/{steps.length} étapes</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 rounded-full"
              />
              {/* Shimmer effect */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              />
            </div>
          </div>

          {/* Steps timeline */}
          <div className="relative space-y-0">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              const isHovered = hoveredStep === step.id;

              return (
                <div key={step.id} className="relative">
                  {/* Animated connector line */}
                  {!isLast && (
                    <div className="absolute left-[19px] top-10 bottom-0 w-[2px] z-0">
                      <div className={`absolute inset-0 bg-gradient-to-b ${
                        step.status === 'completed' ? 'from-emerald-500 to-teal-500' : 'from-gray-300 to-gray-300'
                      }`} />
                      {step.status === 'completed' && (
                        <motion.div
                          animate={{ y: ['0%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-transparent"
                        />
                      )}
                    </div>
                  )}

                  {/* Step card */}
                  <motion.div
                    onHoverStart={() => setHoveredStep(step.id)}
                    onHoverEnd={() => setHoveredStep(null)}
                    onClick={() => handleStepClick(step)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative z-10 mb-2 cursor-pointer transition-all duration-300 ${
                      step.status === 'current' ? 'mb-3' : ''
                    }`}
                  >
                    <div className={`relative rounded-xl border transition-all duration-300 ${
                      step.status === 'current'
                        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg shadow-blue-500/20'
                        : step.status === 'completed'
                        ? 'bg-white/80 backdrop-blur-sm border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                        : 'bg-white/50 backdrop-blur-sm border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Icon with gradient background */}
                          <div className="relative flex-shrink-0">
                            {step.status === 'completed' ? (
                              <div className="relative">
                                <motion.div
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getStepGradient(step.status)} flex items-center justify-center shadow-lg`}
                                  style={{
                                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
                                  }}
                                >
                                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                </motion.div>
                                {/* Success glow */}
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 rounded-xl bg-emerald-500/30 blur-md"
                                />
                              </div>
                            ) : step.status === 'current' ? (
                              <div className="relative">
                                <motion.div
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getStepGradient(step.status)} flex items-center justify-center shadow-xl`}
                                  style={{
                                    boxShadow: '0 8px 30px rgba(59, 130, 246, 0.5)'
                                  }}
                                >
                                  <step.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                </motion.div>
                                {/* Pulsing ring */}
                                <motion.div
                                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="absolute inset-0 rounded-xl border-2 border-blue-500"
                                />
                                {/* Active glow */}
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 rounded-xl bg-blue-500/30 blur-lg"
                                />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getStepGradient(step.status)} flex items-center justify-center transition-all duration-300 ${
                                isHovered ? 'shadow-md scale-105' : 'shadow-sm'
                              }`}>
                                <step.icon className="w-5 h-5 text-white/80" strokeWidth={2} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className={`font-semibold text-sm ${
                                    step.status === 'completed'
                                      ? 'text-emerald-700'
                                      : step.status === 'current'
                                      ? 'text-blue-900'
                                      : 'text-gray-600'
                                  }`}>
                                    {step.label}
                                  </span>
                                  {step.status === 'current' && (
                                    <motion.div
                                      animate={{ opacity: [0.5, 1, 0.5] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 text-xs shadow-md">
                                        <Zap className="w-3 h-3 mr-1" />
                                        En cours
                                      </Badge>
                                    </motion.div>
                                  )}
                                </div>
                                
                                {/* Always show description */}
                                <p className="text-xs text-gray-600 mt-1">
                                  {step.description}
                                </p>

                                {/* Enhanced stats for onboarding step */}
                                {step.id === 'onboarding' && globalStats && documentStats && (
                                  <div className="mt-3 space-y-2">
                                    {/* Questions Stats Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2.5 border border-blue-200/50">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                                          <span className="text-xs font-semibold text-blue-900">Questions</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-lg font-bold text-blue-900">{Math.round((globalStats.answered / globalStats.total) * 100)}</span>
                                          <span className="text-xs text-blue-600">%</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-blue-700 mb-1.5">
                                        <span className="font-medium">{globalStats.answered}</span>
                                        <span className="text-blue-500">/</span>
                                        <span className="text-blue-600">{globalStats.total} répondues</span>
                                      </div>
                                      {/* Progress bar */}
                                      <div className="h-1.5 bg-blue-200/50 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(globalStats.answered / globalStats.total) * 100}%` }}
                                          transition={{ duration: 0.8, ease: "easeOut" }}
                                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                        />
                                      </div>
                                    </div>

                                    {/* Documents Stats Card */}
                                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-200/50">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <Users className="w-3.5 h-3.5 text-purple-600" />
                                          <span className="text-xs font-semibold text-purple-900">Documents</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <span className="text-lg font-bold text-purple-900">{Math.round((documentStats.submitted / documentStats.totalRequired) * 100)}</span>
                                          <span className="text-xs text-purple-600">%</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-purple-700 mb-1.5">
                                        <span className="font-medium">{documentStats.submitted}</span>
                                        <span className="text-purple-500">/</span>
                                        <span className="text-purple-600">{documentStats.totalRequired} envoyés</span>
                                      </div>
                                      {/* Progress bar */}
                                      <div className="h-1.5 bg-purple-200/50 rounded-full overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(documentStats.submitted / documentStats.totalRequired) * 100}%` }}
                                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                          className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Enhanced stats for validation step */}
                                {step.id === 'validation' && globalStats && documentStats && (
                                  <div className="mt-3 space-y-2">
                                    {/* Risk Score Card */}
                                    <div className={`bg-gradient-to-br ${riskScore === 'high' ? 'from-red-50 to-orange-50 border-red-200/50' : riskScore === 'medium' ? 'from-orange-50 to-yellow-50 border-orange-200/50' : 'from-emerald-50 to-teal-50 border-emerald-200/50'} rounded-lg p-2.5 border`}>
                                      <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                          <AlertCircle className={`w-3.5 h-3.5 ${riskScore === 'high' ? 'text-red-600' : riskScore === 'medium' ? 'text-orange-600' : 'text-emerald-600'}`} />
                                          <span className={`text-xs font-semibold ${riskScore === 'high' ? 'text-red-900' : riskScore === 'medium' ? 'text-orange-900' : 'text-emerald-900'}`}>Risque Global</span>
                                        </div>
                                        <Badge className={`${riskColors[riskScore].bg} ${riskColors[riskScore].text} ${riskColors[riskScore].border} text-xs font-bold uppercase`}>
                                          {riskScore === 'high' ? 'Élevé' : riskScore === 'medium' ? 'Moyen' : 'Faible'}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Questions Validation Card */}
                                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-2.5 border border-slate-200/50">
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <CheckCircle className="w-3.5 h-3.5 text-slate-600" />
                                        <span className="text-xs font-semibold text-slate-900">Questions</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-emerald-50 rounded p-1.5 border border-emerald-200/50">
                                          <div className="text-xs text-emerald-600 mb-0.5">Validées</div>
                                          <div className="text-lg font-bold text-emerald-700">{globalStats.approved}</div>
                                        </div>
                                        <div className="bg-red-50 rounded p-1.5 border border-red-200/50">
                                          <div className="text-xs text-red-600 mb-0.5">Refusées</div>
                                          <div className="text-lg font-bold text-red-700">{globalStats.rejected}</div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Documents Validation Card */}
                                    <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-lg p-2.5 border border-slate-200/50">
                                      <div className="flex items-center gap-1.5 mb-2">
                                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                                        <span className="text-xs font-semibold text-slate-900">Documents</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-emerald-50 rounded p-1.5 border border-emerald-200/50">
                                          <div className="text-xs text-emerald-600 mb-0.5">Validés</div>
                                          <div className="text-lg font-bold text-emerald-700">{documentStats.validated}</div>
                                        </div>
                                        <div className="bg-red-50 rounded p-1.5 border border-red-200/50">
                                          <div className="text-xs text-red-600 mb-0.5">Refusés</div>
                                          <div className="text-lg font-bold text-red-700">{documentStats.rejected}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {step.date && step.status === 'completed' && (
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <Calendar className="w-3 h-3 text-emerald-600" />
                                    <span className="text-xs text-emerald-600 font-medium">
                                      {step.date}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {step.status === 'completed' && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.2, type: "spring" }}
                                >
                                  <Sparkles className="w-4 h-4 text-emerald-500" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover shine effect */}
                      <motion.div
                        animate={isHovered ? { x: ['0%', '200%'] } : {}}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                      />
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Current step action button */}
          {steps.find(s => s.status === 'current')?.action && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <Button
                onClick={() => {
                  const currentStep = steps.find(s => s.status === 'current');
                  if (currentStep) handleStepAction(currentStep);
                }}
                className="w-full gap-2 h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                {/* Animated background */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                <span className="relative z-10">{steps.find(s => s.status === 'current')?.action}</span>
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Step Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedStep && (
                <>
                  <div
                    className={`p-2 rounded-lg ${
                      selectedStep.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedStep.status === 'current'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <selectedStep.icon className="w-5 h-5" />
                  </div>
                  <span>{selectedStep.label}</span>
                  {selectedStep.status === 'completed' && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      Complété
                    </Badge>
                  )}
                  {selectedStep.status === 'current' && (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                      En cours
                    </Badge>
                  )}
                  {selectedStep.status === 'pending' && (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                      À venir
                    </Badge>
                  )}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedStep?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedStep && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <div className="text-sm text-gray-600 mb-4">
                  {selectedStep.description}
                </div>
                {selectedStep.date && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Complété le {selectedStep.date}
                  </div>
                )}
              </div>

              <Separator />

              {/* Contextual content based on step */}
              <div className="space-y-4">
                {selectedStep.id === 'onboarding' && globalStats && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 mb-2">Collecte des informations</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Cette étape collecte toutes les informations KYC nécessaires auprès du client.
                        </p>
                        
                        {/* Statistics */}
                        <div className="bg-white/60 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-blue-600 mb-1">Questions répondues</div>
                              <div className="text-lg font-bold text-blue-900">
                                {globalStats.answered} / {globalStats.total}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-blue-600 mb-1">Progression</div>
                              <div className="text-lg font-bold text-blue-900">
                                {Math.round((globalStats.answered / globalStats.total) * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-blue-600">
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5" />
                            <span>Identité et coordonnées</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5" />
                            <span>Situation professionnelle</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5" />
                            <span>Situation financière</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5" />
                            <span>Documents justificatifs</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStep.id === 'validation' && globalStats && (
                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-amber-900 mb-2">Validation compliance</h4>
                        <p className="text-sm text-amber-700 mb-3">
                          Vérification de toutes les informations et documents avant signature.
                        </p>
                        
                        {/* Validation Statistics */}
                        <div className="bg-white/60 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="text-xs text-emerald-600 mb-1">Approuvées</div>
                              <div className="text-lg font-bold text-emerald-700">
                                {globalStats.approved}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-red-600 mb-1">Refusées</div>
                              <div className="text-lg font-bold text-red-700">
                                {globalStats.rejected}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-amber-600 mb-1">En attente</div>
                              <div className="text-lg font-bold text-amber-700">
                                {globalStats.pending}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs text-amber-600">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Vérifier l'identité et l'adresse</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Valider les documents justificatifs</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Vérifier la cohérence des informations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStep.id === 'request_signature' && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start gap-3">
                      <PenTool className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-900 mb-2">Demande de signature</h4>
                        <p className="text-sm text-purple-700 mb-3">
                          Préparation et envoi du bulletin de souscription pour signature électronique.
                        </p>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-purple-700">Signataires requis:</span>
                            <Badge className="bg-purple-200 text-purple-800 border-purple-300">
                              2 signatures
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-purple-600">
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" />
                              <span>Investisseur principal</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3.5 h-3.5" />
                              <span>Représentant légal (si applicable)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStep.id === 'waiting_signature' && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-900 mb-2">En attente de signature</h4>
                        <p className="text-sm text-orange-700 mb-3">
                          Le bulletin a été envoyé au client pour signature électronique.
                        </p>
                        <div className="space-y-2 text-xs text-orange-600">
                          <div className="flex items-center gap-2">
                            <Send className="w-3.5 h-3.5" />
                            <span>Email envoyé au client</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Suivre le statut sur Yousign</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedStep.id === 'request_payment' && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-2">Demande de versement</h4>
                        <p className="text-sm text-green-700 mb-3">
                          Demande de versement des fonds au client.
                        </p>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700">Montant à verser:</span>
                            <span className="font-semibold text-green-900">
                              {subscription.amount?.toLocaleString('fr-FR')} €
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedStep.action && selectedStep.status === 'current' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleStepAction(selectedStep)}
                    className="flex-1 gap-2"
                    style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  >
                    <Send className="w-4 h-4" />
                    {selectedStep.action}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              )}

              {selectedStep.status !== 'current' && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Fermer
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}