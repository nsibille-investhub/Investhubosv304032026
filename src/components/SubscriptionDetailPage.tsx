import { useState } from 'react';
import { motion } from 'motion/react';
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
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { getStatusColor } from '../utils/subscriptionGenerator';
import { SubscriptionInfoPopover } from './SubscriptionInfoPopover';
import { QuestionActions, QuestionStatus } from './QuestionActions';
import { QuestionCommentThread } from './QuestionCommentThread';
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

interface SubscriptionDetailPageProps {
  subscription: any;
  onBack: () => void;
}

// Mock data pour les sections de questions/réponses
const mockSections = [
  {
    id: 'identity',
    title: 'Identité',
    icon: User,
    questions: [
      { question: "Civilité*", response: "Madame", verified: true },
      { question: "Nom*", response: "Wadouachi", verified: true },
      { question: "Nom de naissance (si différent)", response: "", verified: true },
      { question: "Prénom*", response: "Inès", verified: true },
      { question: "L'investisseur est-il mineur ?*", response: "Non", verified: true, hasAlert: true },
      { question: "Date de naissance*", response: "14/05/2025", verified: true },
      { question: "Pays de naissance*", response: "France", verified: true },
      { question: "Code postal de naissance*", response: "75008", verified: true },
      { question: "Commune de naissance*", response: "Paris", verified: true },
      { question: "Nationalité*", response: "France", verified: true, hasAlert: true },
      { question: "E-mail*", response: "iwadouachi+testPM@eurazeo.com", verified: true },
      { question: "Numéro de téléphone mobile*", response: "+33622653352", verified: true },
      { question: "Numéro et nom de rue*", response: "66 Rue Pierre Charron", verified: true },
      { question: "Ville*", response: "Paris", verified: true },
      { question: "Code postal*", response: "75008", verified: true },
      { question: "Pays*", response: "France", verified: true },
      { question: "Mon adresse de résidence est différente de mon adresse fiscale*", response: "Non", verified: true },
      { question: "Numéro d'identification Fiscale (NIF)*", response: "9739373633839", verified: true },
      { question: "Je possède un deuxième Numéro d'Identification Fiscale (NIF/TIN) *", response: "Non", verified: true },
      { question: "Citoyen(ne) et/ou résident fiscal(e) des États-Unis d'Amérique*", response: "Non", verified: true },
      { question: "Je certifie que les informations relatives à ma résidence fiscale déclarées ci-dessus sont correctes.*", response: "Oui", verified: true },
    ]
  },
  {
    id: 'fiscal',
    title: 'Résidence fiscale',
    icon: Shield,
    questions: [
      { 
        question: "Pays de résidence fiscale*", 
        response: "France", 
        verified: true 
      },
      { 
        question: "Mon adresse de résidence est différente de mon adresse fiscale*", 
        response: "Non", 
        verified: true 
      },
      { 
        question: "Numéro d'identification Fiscale (NIF)*", 
        response: "9739373633839", 
        verified: true 
      },
      { 
        question: "Je possède un deuxième Numéro d'identification Fiscale (NIF/TIN)", 
        response: "Non", 
        verified: false 
      },
      { 
        question: "Citoyen(ne) et/ou résident fiscal(e) des États-Unis d'Amérique*", 
        response: "Non", 
        verified: true 
      },
      { 
        question: "Je certifie que les informations relatives à ma résidence fiscale déclarées ci-dessus sont correctes.*", 
        response: "Oui", 
        verified: true 
      }
    ]
  },
  {
    id: 'banking',
    title: 'Coordonnées bancaires',
    icon: DollarSign,
    questions: [
      { 
        question: "Type*", 
        response: "Compte courant", 
        verified: true 
      },
      { 
        question: "Le compte bancaire utilisé pour cette souscription est-il un compte individuel ou un compte joint ?*", 
        response: "Compte joint", 
        verified: true 
      },
      { 
        question: "Quel est le régime matrimonial des titulaires du compte joint ?*", 
        response: "Communauté universelle", 
        verified: false 
      },
      { 
        question: "Je confirme avoir pris connaissance du fait que le versement de l'engagement n'est possible que par prélèvement automatique.*", 
        response: "Oui", 
        verified: true 
      },
      { 
        question: "Nom de votre établissement bancaire", 
        response: "BNP Paribas", 
        verified: true 
      },
      { 
        question: "Adresse de la banque", 
        response: "16 Boulevard des Italiens, 75009 Paris", 
        verified: true 
      },
      { 
        question: "IBAN*", 
        response: "FR76 4061 8803 1200 0407 6100 201", 
        verified: true 
      },
      { 
        question: "BIC*", 
        response: "BNPAFRPPXXX", 
        verified: true 
      },
      { 
        question: "Numéro de compte", 
        response: "00407610020", 
        verified: true 
      }
    ]
  },
  {
    id: 'professional',
    title: 'Situation professionnelle',
    icon: FileText,
    questions: [
      { 
        question: "Vous êtes*", 
        response: "Demandeur d'emploi", 
        verified: true 
      },
      { 
        question: "Catégorie socio-professionnelle", 
        response: "Artisans", 
        verified: true 
      },
      { 
        question: "Secteur d'activité*", 
        response: "banque", 
        verified: true 
      },
      { 
        question: "Profession*", 
        response: "banquier", 
        verified: false 
      },
      { 
        question: "Avez vous exercé une profession financière durant plus d'un an ? *", 
        response: "Oui", 
        verified: true 
      },
      { 
        question: "Avez vous des liens avec des société cotées ? *", 
        response: "Oui", 
        verified: true 
      },
      { 
        question: "Pouvez-vous préciser ? *", 
        response: "Actionnaire minoritaire", 
        verified: true 
      },
      { 
        question: "Détenez-vous des parts ou actions dans des sociétés (< de 25 %) ? *", 
        response: "Non", 
        verified: true 
      },
      { 
        question: "Exercez-vous ou avez-vous exercé une fonction politiquement exposée ?*", 
        response: "Non", 
        verified: true 
      },
      { 
        question: "Une personne de votre entourage exerce-t-elle ou a-t-elle exercé depuis moins d'un an une fonction politiquement exposée ?*", 
        response: "Non", 
        verified: true 
      }
    ]
  },
  {
    id: 'financial',
    title: 'Situation financière',
    icon: TrendingUp,
    questions: [
      { 
        question: "Quels sont les revenus annuels nets de votre foyer ?*", 
        response: "800 000,00 EUR", 
        verified: true 
      },
      { 
        question: "Statut de votre résidence principale*", 
        response: "Hébergé à titre gratuit", 
        verified: true 
      },
      { 
        question: "Avez-vous un ou plusieurs engagement(s) financier(s) régulier(s) ?*", 
        response: "Oui", 
        verified: false 
      },
      { 
        question: "Montant*", 
        response: "1 000,00 EUR", 
        verified: true 
      },
      { 
        question: "Fréquence*", 
        response: "Mensuel", 
        verified: true 
      },
      { 
        question: "Quel est le montant estimé de votre patrimoine financier ?*", 
        response: "1 999 999,00 EUR", 
        verified: true 
      },
      { 
        question: "Part du patrimoine financier dans votre patrimoine global :*", 
        response: ">50%", 
        verified: true 
      },
      { 
        question: "Part des titres non cotés (comme les FCPi/FIP/FCPR) dans ce portefeuille financier :*", 
        response: "<10%", 
        verified: true 
      },
      { 
        question: "Montant global du patrimoine :*", 
        response: "200 000,00 EUR", 
        verified: true 
      }
    ]
  },
  {
    id: 'documents',
    title: 'Documents justificatifs',
    icon: FileText,
    questions: [] // Documents section uses different structure
  }
];

// Mock data pour les documents requis (KYC)
const mockRequiredDocuments = [
  {
    name: "Passeport (en couleur, lignes MRZ lisibles et complètes, sur une seule page)",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  },
  {
    name: "OU Carte d'identité (recto verso sur une seule page, en couleur)",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  },
  {
    name: "OU Permis de conduire (biométrique)",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  },
  {
    name: "OU Titre de séjour",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  },
  {
    name: "Dernier avis d'imposition daté de moins d'un an",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  },
  {
    name: "Justificatif de domicile",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  },
  {
    name: "Justificatif d'origine des fonds",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  },
  {
    name: "RIB",
    dateSent: "",
    issueDate: "",
    expiration: "",
    hasFile: false
  }
];

// Mock data pour les documents de la souscription
const mockDocuments = [
  {
    id: 1,
    date: '26/11/2025',
    name: 'Certificat DocuSign',
    language: '',
    type: '',
    status: 'signed',
    file: 'certificat-docusign.pdf'
  },
  {
    id: 2,
    date: '26/11/2025',
    name: 'ESMI II - Declaration of Investment Type',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'declaration-investment-type.pdf'
  },
  {
    id: 3,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 10 BEPS questionnaire',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-10-beps.pdf'
  },
  {
    id: 4,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 9 Tax compliancy declaration',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-9-tax.pdf'
  },
  {
    id: 5,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 8 Ultimate beneficial owner',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-8-ubo.pdf'
  },
  {
    id: 6,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 7 Entity self-certification for FATCA and CRS',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-7-fatca.pdf'
  },
  {
    id: 7,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 6 Bank account details of the Investor',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-6-bank.pdf'
  },
  {
    id: 8,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 4 Professional client status',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-4-professional.pdf'
  },
  {
    id: 9,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 2 - Commitment',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-2-commitment.pdf'
  },
  {
    id: 10,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 3 Well-informed Investor',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-3-well-informed.pdf'
  },
  {
    id: 11,
    date: '26/11/2025',
    name: 'ESMI II - Schedule 1 Identity details of the Investor',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'schedule-1-identity.pdf'
  },
  {
    id: 12,
    date: '26/11/2025',
    name: 'ESMI II - Subscription Agreement - Non US',
    language: '',
    type: 'Document contractuel',
    status: 'signed',
    file: 'subscription-agreement.pdf'
  }
];

// Mock data pour les notes de la souscription
const mockNotes = [
  {
    id: 1,
    type: 'field',
    section: 'Identité',
    field: 'Nationalité',
    author: 'Marie Dubois',
    date: '28/12/2025 14:32',
    content: 'Vérifier la double nationalité mentionnée lors de l\'entretien initial',
    status: 'open',
    priority: 'high'
  },
  {
    id: 2,
    type: 'field',
    section: 'Identité',
    field: 'L\'investisseur est-il mineur ?',
    author: 'Jean Dupont',
    date: '27/12/2025 16:45',
    content: 'Date de naissance proche de la majorité, vérifier la capacité juridique',
    status: 'open',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'general',
    section: '',
    field: '',
    author: 'Pierre Martin',
    date: '26/12/2025 10:15',
    content: 'Appel téléphonique effectué avec l\'investisseur. Confirmation de l\'intérêt pour le fonds ESMI II. RDV prévu le 05/01/2026.',
    status: 'resolved',
    priority: 'low'
  },
  {
    id: 4,
    type: 'field',
    section: 'Coordonnées bancaires',
    field: 'Quel est le régime matrimonial des titulaires du compte joint ?',
    author: 'Sophie Laurent',
    date: '25/12/2025 09:20',
    content: 'Document justificatif du régime matrimonial manquant. Relance effectuée par email.',
    status: 'open',
    priority: 'high'
  },
  {
    id: 5,
    type: 'general',
    section: '',
    field: '',
    author: 'Marie Dubois',
    date: '24/12/2025 17:30',
    content: 'Dossier complet reçu. Début de l\'analyse KYC le 02/01/2026.',
    status: 'resolved',
    priority: 'medium'
  },
  {
    id: 6,
    type: 'field',
    section: 'Documents',
    field: 'Justificatif d\'origine des fonds',
    author: 'Jean Dupont',
    date: '23/12/2025 11:00',
    content: 'Document fourni incomplet. Demander un relevé bancaire complémentaire sur 6 mois.',
    status: 'open',
    priority: 'high'
  },
  {
    id: 7,
    type: 'general',
    section: '',
    field: '',
    author: 'Pierre Martin',
    date: '22/12/2025 14:45',
    content: 'Client VIP - traitement prioritaire demandé par la direction.',
    status: 'open',
    priority: 'medium'
  }
];

// Mock data pour les emails
const mockEmails = [
  {
    id: 1,
    date: '12/12/2025 11:59:45',
    type: 'Signature documents_par',
    recipients: 'serge.lagavennefr@gail.com',
    cc: 'cc_grandmaisonleFR@fnac.net, benoit.beauliufr@fnac.net',
    subject: 'Vos documents Privés Assets Convexités 2026 à signer',
    receivedAt: '12/12/2025 11:59:46',
    openedAt: '12/12/2025 12:05:23',
    clickedAt: '12/12/2025 12:06:15'
  },
  {
    id: 2,
    date: '12/12/2025 11:59:45',
    type: 'Onboarding à valider',
    recipients: 'pasboutsupers@gailcom',
    cc: '',
    subject: 'Onboarding à valider pour Serge LAGAVENNE',
    receivedAt: '12/12/2025 11:59:47',
    openedAt: '12/12/2025 14:22:10',
    clickedAt: ''
  },
  {
    id: 3,
    date: '12/12/2025 11:59:41',
    type: 'Onboarding à valider',
    recipients: 'genson_premiululFR@fnac.net',
    cc: '',
    subject: 'Onboarding à valider pour Serge LAGAVENNE',
    receivedAt: '12/12/2025 11:59:42',
    openedAt: '',
    clickedAt: ''
  }
];

// Mock data pour les appels de fonds
const mockCapitalCalls = [
  {
    id: 1,
    date: '31/10/2025',
    call: 'PAC 2026 - Closing 1',
    amount: 10000.00,
    subscription: 0.00,
    entryFees: 3000.00,
    percentage: 10,
    status: 'paid'
  }
];

export function SubscriptionDetailPage({ subscription, onBack }: SubscriptionDetailPageProps) {
  console.log('SubscriptionDetailPage - Rendering with subscription:', subscription);
  
  const [openSections, setOpenSections] = useState<string[]>(['identity']);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<Array<{ text: string; date: string; author: string }>>([]);
  
  // Stepper state
  const [currentStep, setCurrentStep] = useState(1); // 0: Initialisation, 1: Onboarding, 2: Validation, etc.
  
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
    toast.success('Risque validé', {
      description: 'Le profil de risque a été validé avec succès'
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
    
    toast.success('Section validée', {
      description: `${section.questions.length} questions de "${sectionTitle}" ont été validées`,
    });
  };

  const handleExportDocuments = () => {
    toast.success('Export en cours', {
      description: 'Les documents sont en cours de téléchargement',
    });
  };

  const handleAddDocument = (docName: string) => {
    toast.info('Ajouter un document', {
      description: docName ? `Sélectionnez le fichier pour "${docName}"` : 'Sélectionnez un fichier',
    });
  };

  const handleViewDocument = (docName: string) => {
    toast.info('Aperçu du document', {
      description: `Ouverture de "${docName}"`,
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
    toast.success('Note ajoutée');
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

  console.log('SubscriptionDetailPage - Rendering return statement');
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same structure as InvestorDetailPage */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        {/* Main Header Content */}
        <div className="px-8 pb-3 pt-5">
          <div className="flex justify-between gap-6">
            {/* Left column */}
            <div className="flex-1">
              {/* Top Row - Title */}
              <div className="flex items-start gap-3 mb-10">
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {subscription.name} - €1500K - FutureInvest Fund Part A
                  </h1>
                  <Badge className="bg-green-50 text-green-700 border-green-200 font-semibold">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    <span>ID: {subscription.id}</span>
                  </div>
                  <Separator orientation="vertical" className="h-3.5" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Créée le {subscription.createdAt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Row - Actors */}
            <div className="flex items-center gap-8 mb-6">
            {/* Investisseur */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 leading-none mb-0.5">Investisseur</div>
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 text-sm leading-tight -mt-0.5"
                  onClick={() => toast.info('Navigation vers la fiche investisseur')}
                >
                  {subscription.contrepartie.investor || subscription.contrepartie.name}
                </Button>
              </div>
            </div>

            {/* Structure */}
            {subscription.type !== 'Personne Physique' && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 leading-none mb-0.5">Structure</div>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 text-sm leading-tight -mt-0.5"
                    onClick={() => toast.info('Navigation vers la fiche structure')}
                  >
                    Alpha Group Holdings
                  </Button>
                </div>
              </div>
            )}

            {/* Partenaire */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 leading-none mb-0.5">Partenaire</div>
                <div className="text-sm font-medium text-gray-900 leading-tight">UFF</div>
                <div className="text-xs text-gray-500 leading-tight">Conseiller: Eric MAZEAU</div>
              </div>
            </div>

            {/* Frais */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 leading-none mb-0.5">Frais</div>
                <div className="text-xs text-gray-700 leading-tight">Frais d'entrée: 3 750,00 €</div>
                <div className="text-xs text-gray-700 leading-tight">Prime de souscription: 84,48 €</div>
              </div>
            </div>
            </div>

            {/* Financial KPIs Row */}
            <div className="flex items-center gap-8 mb-4">
              {/* Montant Souscrit */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 leading-tight">Montant Souscrit</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-gray-900">500 000 €</span>
                    <span className="text-xs text-blue-600 font-medium">5 000 parts</span>
                  </div>
                </div>
              </div>

              {/* Montant Appelé */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3 h-3 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 leading-tight">Montant Appelé</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-gray-900">275 000 €</span>
                    <span className="text-xs text-emerald-600 font-medium">55%</span>
                  </div>
                </div>
              </div>

              {/* Montant Distribué */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <ArrowDownCircle className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 leading-tight">Montant Distribué</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-gray-900">42 500 €</span>
                    <span className="text-xs text-purple-600 font-medium">8.5%</span>
                  </div>
                </div>
              </div>

              {/* Solde Restant */}
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-3 h-3 text-orange-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 leading-tight">Solde Restant</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-gray-900">225 000 €</span>
                    <span className="text-xs text-orange-600 font-medium">45%</span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Right column - Risk analysis + Export button */}
            <div className="flex flex-col items-end justify-end gap-3">
              <Button
                style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                className="gap-2 text-white hover:opacity-90"
                onClick={() => toast.success('Fonctionnalité à venir')}
              >
                <Download className="w-4 h-4" />
                Exporter les données
              </Button>

              {/* Analyse de risque compacte */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Jauge circulaire compacte */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="#E5E7EB"
                          strokeWidth="6"
                          fill="none"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="34"
                          stroke="#F59E0B"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 34}`}
                          strokeDashoffset={`${2 * Math.PI * 34 * (1 - 0.65)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-bold text-gray-900">65</span>
                        <span className="text-[10px] text-gray-500">/ 100</span>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold text-[10px] mt-1.5">
                      Risque Moyen
                    </Badge>
                  </div>

                  {/* Indicateurs */}
                  <div className="space-y-1.5">
                    {riskValidated && (
                      <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-200">
                        <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <div>
                          <div className="text-[10px] font-semibold text-green-900">Risque validé</div>
                          <div className="text-[9px] text-green-700">Le {riskValidationDate}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-600 whitespace-nowrap">PEP détectés</span>
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-[10px] h-5">
                        <AlertCircle className="w-2.5 h-2.5 mr-1" />
                        2
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-600 whitespace-nowrap">Sanctions</span>
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-[10px] h-5">
                        <Check className="w-2.5 h-2.5 mr-1" />
                        0
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-600 whitespace-nowrap">Médias adverses</span>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-[10px] h-5">
                        <AlertCircle className="w-2.5 h-2.5 mr-1" />
                        1
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs - Same structure as InvestorDetailPage */}
      <div className="px-8 -mt-px bg-white border-b border-gray-200">
        <Tabs defaultValue="detail" className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start h-auto p-0 gap-6">
            <TabsTrigger 
              value="detail" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              Détail
            </TabsTrigger>
            <TabsTrigger 
              value="emails" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <Mail className="w-4 h-4 mr-2" />
              Mails
              <Badge className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                {mockEmails.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="capital-calls" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Appels de fonds
              <Badge className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {mockCapitalCalls.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="risk" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <ShieldAlert className="w-4 h-4 mr-2" />
              Risque
              <Badge className="ml-2 bg-red-50 text-red-700 border-red-200 text-xs">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Documents
              <Badge className="ml-2 bg-gray-50 text-gray-700 border-gray-200 text-xs">
                {mockDocuments.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Notes
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
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Initialisation de la souscription</h2>
                        
                        <div className="space-y-6">
                          {/* Investisseur */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Investisseur *</label>
                            <Input placeholder="Sélectionner un investisseur" />
                          </div>

                          {/* Structure */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Structure</label>
                            <Input placeholder="Sélectionner une structure" />
                          </div>

                          {/* Fonds */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fonds *</label>
                            <Input placeholder="Sélectionner un fonds" />
                          </div>

                          {/* Part */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Part *</label>
                            <Input placeholder="Sélectionner une part" />
                          </div>

                          {/* Nombre de parts */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de parts *</label>
                              <Input type="number" placeholder="0" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Montant total *</label>
                              <Input placeholder="0 €" />
                            </div>
                          </div>

                          {/* Partenaire */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Partenaire en charge</label>
                            <Input placeholder="Sélectionner un partenaire" />
                          </div>

                          <Separator />

                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={onBack}>Annuler</Button>
                            <Button 
                              className="bg-gradient-to-r from-black to-[#0F323D] hover:opacity-90"
                              onClick={() => {
                                setCurrentStep(1);
                                toast.success('Souscription initialisée');
                              }}
                            >
                              Créer la souscription
                            </Button>
                          </div>
                        </div>
                      </div>
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
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              stats && stats.approved === stats.total 
                                ? 'bg-gradient-to-br from-emerald-100 to-teal-100' 
                                : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                            }`}>
                              <Icon className={`w-6 h-6 ${
                                stats && stats.approved === stats.total 
                                  ? 'text-emerald-600' 
                                  : 'text-blue-600'
                              }`} />
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-gray-900 text-lg mb-1">{section.title}</h3>
                              {stats && (
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-gray-600">
                                    <span className="font-semibold text-gray-900">{stats.answered}</span>
                                    /{stats.total} répondues
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                                  <span className="text-emerald-600">
                                    <span className="font-semibold">{stats.approved}</span> validées
                                  </span>
                                  {stats.rejected > 0 && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                                      <span className="text-red-600">
                                        <span className="font-semibold">{stats.rejected}</span> refusées
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                              {section.id === 'documents' && (
                                <p className="text-xs text-gray-500">
                                  {mockRequiredDocuments.length} documents requis
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {stats && stats.approved === stats.total && stats.total > 0 ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                Section validée
                              </Badge>
                            ) : stats && stats.rejected > 0 ? (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                {stats.rejected} rejetée{stats.rejected > 1 ? 's' : ''}
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                En cours
                              </Badge>
                            )}
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t border-gray-100">
                          {section.id === 'documents' ? (
                            /* Documents Section - Special Layout */
                            <div>
                              {/* Documents Header with Actions */}
                              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <FileText className="w-4 h-4" />
                                  <span>Gérer les documents justificatifs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportDocuments}
                                    className="gap-2 text-xs"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Exporter les documents
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddDocument('')}
                                    className="gap-2 text-xs"
                                  >
                                    <Upload className="w-3.5 h-3.5" />
                                    Ajouter un document
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleValidateSection(section.id)}
                                    className="gap-2 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Valider toute la section
                                  </Button>
                                </div>
                              </div>

                              {/* Documents Table */}
                              <div className="overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Document
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        Date d'envoi
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        Émis le
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                        Expiration
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                        Voir
                                      </th>
                                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-100">
                                    {mockRequiredDocuments.map((doc, idx) => (
                                      <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                          {doc.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                          {doc.dateSent || <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                          {doc.issueDate || <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                          {doc.expiration || <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          {doc.hasFile ? (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleViewDocument(doc.name)}
                                              className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </Button>
                                          ) : (
                                            <span className="text-gray-300">-</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddDocument(doc.name)}
                                            className="gap-1.5 text-xs h-7"
                                          >
                                            <Upload className="w-3 h-3" />
                                            Ajouter
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
                                <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-xs text-blue-700">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Vérifier toutes les réponses de cette section</span>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleValidateSection(section.id, section.title)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    Valider toute la section
                                  </Button>
                                </div>
                              )}

                              {/* Questions Table */}
                              <div className="divide-y divide-gray-100">
                                {section.questions.map((item, idx) => {
                                  const questionId = `${section.id}-${idx}`;
                                  const status = questionStatuses[questionId] || 'pending';
                                  const response = questionResponses[questionId] || item.response;
                                  const comments = questionComments[questionId] || [];
                                  const hasUnresolved = comments.some((c: any) => !c.resolved);
                                  const isCommentOpen = activeCommentThread === questionId;

                                  return (
                                    <div key={idx}>
                                      <div className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
                                        <div className="col-span-4 text-sm text-gray-700 flex items-center gap-2">
                                          {item.hasAlert && (
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                          )}
                                          <span className={status === 'rejected' ? 'text-red-700' : ''}>{item.question}</span>
                                        </div>
                                        <div className="col-span-3 text-sm font-medium text-gray-900">
                                          {response || <span className="text-gray-400 italic">Non renseigné</span>}
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
                    </motion.div>
                  </Collapsible>
                );
              })}
                    </div>
                  )}

                  {currentStep === 2 && (
                    // Validation - même contenu que onboarding avec action de validation
                    <div className="space-y-4">
                      {/* Statistiques de complétion */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Onboarding */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Onboarding</h3>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Complet
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Questions répondues</span>
                                <span className="font-semibold text-gray-900">142/142</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Questions validées</span>
                                <span className="font-semibold text-gray-900">138/142</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '97%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Documents</h3>
                            <Badge className="bg-green-100 text-green-700 border-green-300">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Validés
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Documents fournis</span>
                                <span className="font-semibold text-gray-900">8/8</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Documents validés</span>
                                <span className="font-semibold text-gray-900">8/8</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Niveau de risque */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Niveau de risque</h3>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            Moyen
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Détail du calcul */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Détail du calcul de risque</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-700">Pays de résidence</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">France</span>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Faible</Badge>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-700">Profil investisseur</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">HNWI</span>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">Moyen</Badge>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-700">Montant souscription</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">500 000 €</span>
                                  <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">Moyen</Badge>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Scale className="w-4 h-4 text-gray-600" />
                                  <span className="text-sm text-gray-700">Origine des fonds</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">Salaires</span>
                                  <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">Faible</Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Validation du risque */}
                          <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="w-5 h-5 text-amber-600" />
                              <div>
                                <div className="font-medium text-gray-900">Validation du risque requise</div>
                                <div className="text-sm text-gray-600">Un niveau de risque moyen nécessite une validation manuelle</div>
                              </div>
                            </div>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success('Risque validé')}
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Valider
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Niveau KYC */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Niveau KYC</h3>
                          <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                            Avancé
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <ShieldAlert className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-gray-900">Contrôles avancés requis</div>
                                <div className="text-sm text-gray-600">Ce dossier nécessite des vérifications approfondies</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-600 mb-1">Contrôles effectués</div>
                                <div className="font-semibold text-gray-900">12/12</div>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-xs text-gray-600 mb-1">Statut</div>
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                  <span className="font-semibold text-gray-900">Conforme</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Analyses Screening */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">Analyses Screening</h3>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                            2 décisions en attente
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Investisseur principal */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Inès Wadouachi</div>
                                  <div className="text-sm text-gray-600">Investisseur principal</div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Validé
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">PEP: Négatif</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">Sanctions: Négatif</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">Médias: Négatif</span>
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
                                  <div className="font-semibold text-gray-900">Jean Dupont</div>
                                  <div className="text-sm text-gray-600">Bénéficiaire effectif (35%)</div>
                                </div>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                En attente
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                                  <span className="text-sm font-medium text-gray-900">1 alerte média détectée</span>
                                </div>
                                <div className="text-sm text-gray-700 mb-3">
                                  Article mentionnant un litige commercial en 2023 (résolu à l'amiable)
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success('Décision: Accepté avec réserve')}
                                    className="flex-1"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Accepter avec réserve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success('Décision: Rejeter')}
                                    className="flex-1"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Rejeter
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-gray-700">PEP: Négatif</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-gray-700">Sanctions: Négatif</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                  <span className="text-gray-700">Médias: 1 alerte</span>
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
                                  <div className="font-semibold text-gray-900">Marie Martin</div>
                                  <div className="text-sm text-gray-600">Bénéficiaire effectif (25%)</div>
                                </div>
                              </div>
                              <Badge className="bg-red-100 text-red-700 border-red-300">
                                <X className="w-3 h-3 mr-1" />
                                Décision requise
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <ShieldAlert className="w-4 h-4 text-red-600" />
                                  <span className="text-sm font-medium text-gray-900">Personne Politiquement Exposée (PEP)</span>
                                </div>
                                <div className="text-sm text-gray-700 mb-3">
                                  Ancienne conseillère municipale (2015-2020) - Statut PEP expiré depuis 2023
                                </div>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success('Décision: Accepter après due diligence')}
                                    className="flex-1"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Accepter après DD
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.success('Décision: Escalader')}
                                    className="flex-1"
                                  >
                                    <Flag className="w-3 h-3 mr-1" />
                                    Escalader
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => toast.error('Décision: Rejeter la souscription')}
                                    className="flex-1"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Rejeter
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-red-600" />
                                  <span className="text-gray-700">PEP: Positif</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-gray-700">Sanctions: Négatif</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600" />
                                  <span className="text-gray-700">Médias: Négatif</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Entité liée */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Building2 className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Holding Familiale SAS</div>
                                  <div className="text-sm text-gray-600">Entité liée</div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Validé
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">Sanctions: Négatif</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">Médias: Négatif</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600" />
                                <span className="text-gray-700">Juridique: OK</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Validation finale */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-500 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2">Prêt pour validation</h3>
                            <p className="text-sm text-gray-700 mb-4">
                              L'onboarding est complet. Vérifiez les informations et validez la souscription.
                            </p>
                            <Button 
                              className="bg-gradient-to-r from-black to-[#0F323D] hover:opacity-90"
                              onClick={() => {
                                setCurrentStep(3);
                                toast.success('Souscription validée');
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Valider la souscription
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    // Envoyer en signature
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyer en signature</h2>
                        
                        <div className="space-y-6">
                          {/* Signataires */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Signataires</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input type="checkbox" defaultChecked className="w-4 h-4" />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">Inès Wadouachi</div>
                                  <div className="text-sm text-gray-600">iwadouachi+testPM@eurazeo.com</div>
                                </div>
                                <Badge className="bg-blue-100 text-blue-700 border-blue-300">Investisseur</Badge>
                              </div>
                              <Button variant="outline" size="sm" className="w-full">
                                + Ajouter un signataire
                              </Button>
                            </div>
                          </div>

                          <Separator />

                          {/* Documents à signer */}
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold text-gray-900">Documents à signer</h3>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toast.info('Upload de document')}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Uploader un document
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {['Bulletin de souscription', 'DICI', 'Statuts', 'Side letter'].map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                                  <FileText className="w-4 h-4 text-gray-600" />
                                  <span className="flex-1 text-sm text-gray-900">{doc}</span>
                                  
                                  {/* Type de document */}
                                  <select className="text-xs border border-gray-300 rounded px-2 py-1 bg-white">
                                    <option value="signature">À signer</option>
                                    <option value="annexe">Annexe</option>
                                  </select>
                                  
                                  {/* Actions */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => toast.info('Aperçu du document')}
                                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                                      title="Aperçu"
                                    >
                                      <Eye className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                      onClick={() => toast.success('Document supprimé')}
                                      className="p-1.5 hover:bg-red-100 rounded transition-colors"
                                      title="Supprimer"
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
                            <h3 className="font-semibold text-gray-900 mb-3">Catégorisation de l'investisseur</h3>
                            <div className="grid grid-cols-3 gap-3">
                              {['Professionnel', 'Non-Professionnel', 'Pro sur option'].map((cat, idx) => (
                                <div key={idx} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${idx === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                  <div className="font-medium text-sm text-gray-900 text-center">{cat}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-end gap-3">
                            <Button variant="outline">Enregistrer le brouillon</Button>
                            <Button 
                              className="bg-gradient-to-r from-black to-[#0F323D] hover:opacity-90"
                              onClick={() => {
                                setCurrentStep(4);
                                toast.success('Documents envoyés en signature');
                              }}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Envoyer en signature
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    // Signatures
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Suivi des signatures</h2>
                        
                        <div className="space-y-4">
                          {/* Signataire 1 */}
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Inès Wadouachi</div>
                                  <div className="text-sm text-gray-600">iwadouachi+testPM@eurazeo.com</div>
                                </div>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Signé
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">Signé le 29/12/2025 à 14:32</div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              <Mail className="w-4 h-4 mr-2" />
                              Relancer les signataires
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <FileText className="w-4 h-4 mr-2" />
                              Régénérer les liens
                            </Button>
                          </div>

                          <Separator />

                          <div className="flex justify-end">
                            <Button 
                              className="bg-gradient-to-r from-black to-[#0F323D] hover:opacity-90"
                              onClick={() => {
                                setCurrentStep(6);
                                toast.success('Passage à la contre-signature');
                              }}
                            >
                              Continuer vers la contre-signature
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 5 && (
                    // Contre-signature
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Suivi de la contre-signature</h2>
                        
                        <div className="space-y-4">
                          {/* Gérant du fonds */}
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">Laurent Dupuis</div>
                                  <div className="text-sm text-gray-600">laurent.dupuis@investhub.com</div>
                                  <div className="text-xs text-gray-500 mt-1">Gérant du fonds</div>
                                </div>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                                <Clock className="w-3 h-3 mr-1" />
                                En attente
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">Lien envoyé le 29/12/2025 à 15:45</div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              <Mail className="w-4 h-4 mr-2" />
                              Renvoyer le mail
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <FileText className="w-4 h-4 mr-2" />
                              Régénérer le lien
                            </Button>
                          </div>

                          <Separator />

                          <div className="flex justify-end">
                            <Button 
                              className="bg-gradient-to-r from-black to-[#0F323D] hover:opacity-90"
                              onClick={() => {
                                setCurrentStep(7);
                                toast.success('Passage à l\'étape de paiement');
                              }}
                            >
                              Continuer vers le paiement
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 6 && (
                    // Paiement
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Paiement</h2>
                        
                        <div className="space-y-6">
                          {/* Type de paiement */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Type de paiement *</label>
                            <div className="grid grid-cols-3 gap-3">
                              {['Virement', 'Chèque', 'Prélèvement'].map((type, idx) => (
                                <div key={idx} className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${idx === 0 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                  <div className="font-medium text-sm text-gray-900 text-center">{type}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Mandat */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mandat de prélèvement</label>
                            <div className="flex items-center gap-3">
                              <input type="checkbox" className="w-4 h-4" />
                              <span className="text-sm text-gray-700">Mandat SEPA actif</span>
                            </div>
                          </div>

                          {/* Date de valeur liquidative */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date de valeur liquidative *</label>
                            <Input type="date" />
                          </div>

                          {/* Montant */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Montant de la souscription</span>
                              <span className="font-semibold text-gray-900">500 000,00 €</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Frais d'entrée (0.75%)</span>
                              <span className="font-semibold text-gray-900">3 750,00 €</span>
                            </div>
                            <Separator className="my-3" />
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">Total à payer</span>
                              <span className="text-xl font-bold text-blue-600">503 750,00 €</span>
                            </div>
                          </div>

                          {/* Statut du paiement */}
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Statut du paiement</h3>
                            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <Clock className="w-5 h-5 text-amber-600" />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">En attente de réception</div>
                                <div className="text-sm text-gray-600">Le paiement n'a pas encore été reçu</div>
                              </div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300">En attente</Badge>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-end gap-3">
                            <Button variant="outline">Enregistrer</Button>
                            <Button 
                              className="bg-gradient-to-r from-black to-[#0F323D] hover:opacity-90"
                              onClick={() => toast.success('Paiement confirmé')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Confirmer le paiement
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stepper Sidebar */}
                <div className="w-80 flex-shrink-0">
                  {/* Stepper */}
                  <div className="sticky top-32 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-6">Étapes de la souscription</h3>
                    
                    <div className="space-y-1">
                      {[
                        { id: 0, label: 'Initialisation', icon: Settings },
                        { id: 1, label: 'Onboarding en cours', icon: FileText },
                        { id: 2, label: 'Validation', icon: CheckCircle2 },
                        { id: 3, label: 'Envoyer en signature', icon: Mail },
                        { id: 4, label: 'Signatures', icon: FileCheck },
                        { id: 5, label: 'Contre-signature', icon: PenTool },
                        { id: 6, label: 'Paiement', icon: Wallet },
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
                              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all text-left ${
                                isActive 
                                  ? 'bg-gradient-to-r from-black to-[#0F323D] text-white shadow-md' 
                                  : isCompleted 
                                    ? 'bg-green-50 hover:bg-green-100 text-green-900'
                                    : isAccessible
                                      ? 'hover:bg-gray-50 text-gray-900'
                                      : 'opacity-40 cursor-not-allowed text-gray-400'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                isActive 
                                  ? 'bg-white/20' 
                                  : isCompleted 
                                    ? 'bg-green-200'
                                    : 'bg-gray-100'
                              }`}>
                                {isCompleted ? (
                                  <Check className={`w-4 h-4 ${isActive ? 'text-white' : 'text-green-600'}`} />
                                ) : (
                                  <StepIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>
                                  {step.label}
                                </div>
                                <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                  Étape {step.id + 1}/7
                                </div>
                              </div>
                            </button>
                            {index < 6 && (
                              <div className={`w-px h-4 ml-7 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Emails Tab Content */}
          <TabsContent value="emails" className="mt-0">
            <div className="px-8 py-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                          Type de mail
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destinataire
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destinataire en copie
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sujet
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Reçu
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Ouvert
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Cliqué
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {mockEmails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {email.date}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Flag className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-gray-700">{email.type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {email.recipients}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {email.cc || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {email.subject}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {email.receivedAt || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {email.openedAt || <span className="text-gray-400">-</span>}
                          </td>
                          <td className="px-4 py-3 text-center text-xs text-gray-500">
                            {email.clickedAt || <span className="text-gray-400">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
            </div>
          </TabsContent>

          {/* Capital Calls Tab Content */}
          <TabsContent value="capital-calls" className="mt-0">
            <div className="px-8 py-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Montant Total Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="text-xs text-blue-600 mb-2">Montant total appelé</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {mockCapitalCalls.reduce((sum, call) => sum + call.amount + call.entryFees, 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </div>
                </div>

                {/* Pourcentage Total Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="text-xs text-purple-600 mb-2">Pourcentage total appelé</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {mockCapitalCalls.reduce((sum, call) => sum + call.percentage, 0)}%
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="mb-4 flex justify-end">
                <Button
                  variant="outline"
                  className="gap-2 border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    // Generate CSV content
                    const headers = ['Date', 'Appel de fonds', 'Montant', 'Souscription', 'Frais d\'entrée', 'Pourcentage', 'Statut'];
                    const rows = mockCapitalCalls.map(call => [
                      call.date,
                      call.call,
                      call.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
                      call.subscription.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
                      call.entryFees.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €',
                      call.percentage + '%',
                      call.status === 'paid' ? 'Payé' : call.status === 'pending' ? 'En attente' : 'Rejeté'
                    ]);
                    
                    const csvContent = [headers, ...rows].map(row => row.join(';')).join('\n');
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `appels_de_fonds_${subscription.id}.csv`;
                    link.click();
                    
                    toast.success('Export réussi', { description: 'Le fichier CSV a été téléchargé' });
                  }}
                >
                  <Download className="w-4 h-4" />
                  Exporter en CSV
                </Button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                          Appel de fonds
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Souscription
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Frais d'entrée
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Pourcentage
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Statut
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {mockCapitalCalls.map((capitalCall) => (
                        <tr key={capitalCall.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {capitalCall.date}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {capitalCall.call}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {capitalCall.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {capitalCall.subscription.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {capitalCall.entryFees.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {capitalCall.percentage}%
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {capitalCall.status === 'paid' && (
                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center" title="Payé">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                </div>
                              )}
                              {capitalCall.status === 'pending' && (
                                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center" title="En attente">
                                  <AlertCircle className="w-3 h-3 text-amber-600" />
                                </div>
                              )}
                              {capitalCall.status === 'rejected' && (
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center" title="Rejeté">
                                  <X className="w-3 h-3 text-red-600" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>
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
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg"
                        >
                          <span className="text-3xl font-bold text-white">72</span>
                        </motion.div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-red-400/20 blur-md"
                        />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Score de Risque</h3>
                      <Badge className="bg-red-100 text-red-700 border-red-300 font-semibold">
                        Risque Élevé
                      </Badge>
                      <p className="text-xs text-gray-600 mt-2">
                        3 alertes actives
                      </p>
                      <Separator className="my-3" />
                      {riskValidated ? (
                        <div className="space-y-2">
                          <Badge className="bg-green-100 text-green-700 border-green-300 font-semibold">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Validé
                          </Badge>
                          <div className="text-xs text-gray-600">
                            <div>Par {riskValidatedBy}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{riskValidationDate}</div>
                          </div>
                        </div>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Non validé
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Risk Categories */}
                  <div className="col-span-3 grid grid-cols-3 gap-4">
                    {/* PEP Risk */}
                    <div className="bg-white border border-orange-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                          Actif
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">PEP</h4>
                      <p className="text-xs text-gray-600 mb-2">Personne Politiquement Exposée</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-orange-600">1</span>
                        <span className="text-xs text-gray-500">match</span>
                      </div>
                    </div>

                    {/* Sanctions Risk */}
                    <div className="bg-white border border-red-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Scale className="w-5 h-5 text-red-600" />
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-red-300 text-xs">
                          Actif
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Sanctions</h4>
                      <p className="text-xs text-gray-600 mb-2">Listes de sanctions internationales</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-red-600">1</span>
                        <span className="text-xs text-gray-500">match</span>
                      </div>
                    </div>

                    {/* Adverse Media Risk */}
                    <div className="bg-white border border-amber-200 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Newspaper className="w-5 h-5 text-amber-600" />
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                          Actif
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Adverse Media</h4>
                      <p className="text-xs text-gray-600 mb-2">Médias défavorables</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-amber-600">1</span>
                        <span className="text-xs text-gray-500">article</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Matrix Detail */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Scale className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Matrice de Risque Détaillée</h3>
                          <p className="text-sm text-gray-600">Profil de risque - Calcul du score global</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            72.00
                          </div>
                          <div className="text-xs text-gray-500">/ 100 points</div>
                        </div>
                        {!riskValidated && (
                          <Button
                            onClick={handleValidateRisk}
                            className="gap-2 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Valider le scoring
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
                          <h4 className="font-bold text-gray-900">Personne Physique</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Typologie du souscripteur</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Décision Conformité</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Secteur d'activité</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Origine de la relation</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Nationalité</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-orange-50">
                            <span className="text-sm text-gray-700 font-medium">PEP souscripteur</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-orange-600" />
                              <span className="text-sm font-bold text-orange-700">15.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Pays de résidence fiscale</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-amber-50">
                            <span className="text-sm text-gray-700 font-medium">Pays de résidence si différent</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">5.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Nationalité du co-souscripteur</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Origine de la relation co-souscripteur</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">PEP co-souscripteur</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Pays de résidence fiscale co-souscripteur</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Secteur d'activité co-sous/ripteur</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Pays de résidence co-souscripteur si différent</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Personne Morale */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-4">
                          <Building2 className="w-5 h-5 text-purple-600" />
                          <h4 className="font-bold text-gray-900">Personne Morale</h4>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-red-50">
                            <span className="text-sm text-gray-700 font-medium">Origine de la relation</span>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-bold text-red-700">20.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Décision Conformité</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Secteur d'activité</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">4.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">PEP RL</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-red-50">
                            <span className="text-sm text-gray-700 font-medium">PEP Structure</span>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                              <span className="text-sm font-bold text-red-700">18.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Pays d'immatriculation</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">FATCA</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-amber-50">
                            <span className="text-sm text-gray-700 font-medium">Entité régulée</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">6.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Domiciliation du RIB</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Contrôle PEP RL 2</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Contrôle PEP RL 3</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Contrôle PEP RL 4</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-amber-50">
                            <span className="text-sm text-gray-700 font-medium">Contrôle PEP BE 1</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">5.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Contrôle PEP BE 2</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">0.00</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100 bg-amber-50">
                            <span className="text-sm text-gray-700 font-medium">Contrôle PEP BE 3</span>
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-bold text-amber-700">4.00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 pt-6 border-t-2 border-gray-300">
                      <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-5 border-2 border-red-200">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Score Global de Risque</div>
                            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                              72.00 / 100
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-red-100 text-red-700 border-red-300 font-bold text-lg px-4 py-2">
                            Risque Élevé
                          </Badge>
                          <div className="text-xs text-gray-600 mt-2">
                            Basé sur {15} critères actifs
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Details Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Alertes de Risque Détaillées</h3>
                          <p className="text-sm text-gray-600">Analyse complète des facteurs de risque</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => toast.info('Export des alertes', { description: 'Rapport de risque en cours de génération' })}
                      >
                        <Download className="w-4 h-4" />
                        Exporter
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Type d'Alerte
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Détails
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Niveau de Risque
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Date de Détection
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {/* PEP Alert */}
                        <tr className="hover:bg-orange-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-lg">
                                <Users className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">PEP - Niveau 1</div>
                                <div className="text-xs text-gray-500">Personne Politiquement Exposée</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <div className="font-medium mb-1">Fonction ministérielle identifiée</div>
                              <div className="text-xs text-gray-600">
                                Ancien ministre des finances (2018-2022)
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Source: Base de données ACPR
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                              <Badge className="bg-orange-100 text-orange-700 border-orange-300 font-semibold">
                                Élevé
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Score: 85/100</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                              En Révision
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span>28/12/2025</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">14:32</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.info('Détails PEP', { description: 'Affichage des détails de l\'alerte PEP' })}
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
                                <div className="font-semibold text-gray-900">Liste de Sanctions</div>
                                <div className="text-xs text-gray-500">OFAC - EU Sanctions</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <div className="font-medium mb-1">Match partiel détecté</div>
                              <div className="text-xs text-gray-600">
                                Similitude de nom: 87% - Vérification requise
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Source: OFAC SDN List, EU Consolidated List
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <Badge className="bg-red-100 text-red-700 border-red-300 font-semibold">
                                Critique
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Score: 92/100</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-red-100 text-red-700 border-red-300">
                              Action Requise
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span>29/12/2025</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">09:15</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.info('Détails Sanctions', { description: 'Affichage des détails de l\'alerte sanctions' })}
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
                                <div className="font-semibold text-gray-900">Adverse Media</div>
                                <div className="text-xs text-gray-500">Presse défavorable</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <div className="font-medium mb-1">Article de presse identifié</div>
                              <div className="text-xs text-gray-600">
                                "Enquête sur des soupçons de fraude fiscale" - Le Monde
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Source: Analyse automatisée de la presse
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                              <Badge className="bg-amber-100 text-amber-700 border-amber-300 font-semibold">
                                Moyen
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">Score: 68/100</div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                              En Analyse
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span>27/12/2025</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">16:48</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toast.info('Détails Médias', { description: 'Affichage de l\'article identifié' })}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Risk Information */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Risk Timeline */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">Historique des Risques</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                          <div className="w-px h-full bg-gray-200 mt-1"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-xs text-gray-500 mb-1">29/12/2025 - 09:15</div>
                          <div className="font-medium text-gray-900">Alerte Sanctions détectée</div>
                          <div className="text-sm text-gray-600 mt-1">Match partiel OFAC - Score 92/100</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                          <div className="w-px h-full bg-gray-200 mt-1"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-xs text-gray-500 mb-1">28/12/2025 - 14:32</div>
                          <div className="font-medium text-gray-900">Identification PEP</div>
                          <div className="text-sm text-gray-600 mt-1">Fonction ministérielle confirmée</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                          <div className="w-px h-full bg-gray-200 mt-1"></div>
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="text-xs text-gray-500 mb-1">27/12/2025 - 16:48</div>
                          <div className="font-medium text-gray-900">Adverse Media trouvé</div>
                          <div className="text-sm text-gray-600 mt-1">Article Le Monde - Enquête fiscale</div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-1">25/12/2025 - 10:00</div>
                          <div className="font-medium text-gray-900">Screening initial complété</div>
                          <div className="text-sm text-gray-600 mt-1">Aucune alerte détectée initialement</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Mitigation Actions */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">Actions de Mitigation</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">Diligence renforcée activée</div>
                            <div className="text-sm text-gray-600">
                              Procédure EDD (Enhanced Due Diligence) en cours
                            </div>
                            <div className="text-xs text-gray-500 mt-2">Complétée à 65%</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                              <div className="bg-green-600 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">Documentation supplémentaire requise</div>
                            <div className="text-sm text-gray-600">
                              Justificatifs de revenus détaillés et source de fonds
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3 w-full"
                              onClick={() => toast.info('Demande envoyée', { description: 'Email de demande de documents envoyé' })}
                            >
                              Demander les documents
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 mb-1">Validation hiérarchique</div>
                            <div className="text-sm text-gray-600">
                              Approbation du Responsable Compliance requise
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 mt-2">
                              En Attente
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Country Risk Assessment */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Analyse Géographique du Risque</h3>
                      <p className="text-sm text-gray-600">Évaluation par pays et juridiction</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🇫🇷</div>
                        <Badge className="bg-green-100 text-green-700 border-green-300 text-xs">
                          Faible
                        </Badge>
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">France</div>
                      <div className="text-xs text-gray-600">Pays de résidence</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-sm font-bold text-green-700">2.1</div>
                        <div className="text-xs text-gray-500">/10</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🇨🇭</div>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                          Moyen
                        </Badge>
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">Suisse</div>
                      <div className="text-xs text-gray-600">Compte bancaire</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-sm font-bold text-amber-700">4.8</div>
                        <div className="text-xs text-gray-500">/10</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl">🇵🇦</div>
                        <Badge className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                          Élevé
                        </Badge>
                      </div>
                      <div className="font-semibold text-gray-900 mb-1">Panama</div>
                      <div className="text-xs text-gray-600">Structure offshore</div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="text-sm font-bold text-orange-700">7.5</div>
                        <div className="text-xs text-gray-500">/10</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Documents Tab Content */}
          <TabsContent value="documents" className="mt-0">
            <div className="px-8 py-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Documents de la souscription</h2>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast.info('Ajout de document')}
                  >
                    <Upload className="w-4 h-4" />
                    Ajouter un document
                  </Button>
                </div>

                {/* Table */}
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Langue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Fichier
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doc.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {doc.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.language}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {doc.status === 'signed' && (
                              <Badge className="bg-green-50 text-green-700 border-green-200 font-medium gap-1.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Document signé
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => toast.info(`Suppression de ${doc.name}`)}
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
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <Button
                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => toast.success('Export du pack documentaire')}
                  >
                    <Download className="w-4 h-4" />
                    Export pack documentaire
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab Content */}
          <TabsContent value="notes" className="mt-0">
            <div className="px-8 py-6">
              <div className="space-y-4">
                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      Toutes ({mockNotes.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      Ouvertes ({mockNotes.filter(n => n.status === 'open').length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      Résolues ({mockNotes.filter(n => n.status === 'resolved').length})
                    </Button>
                    <div className="ml-auto">
                      <Button
                        className="gap-2"
                        style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Nouvelle note
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Notes List */}
                <div className="space-y-3">
                  {mockNotes.map((note) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon and Priority */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          note.priority === 'high' ? 'bg-red-50' :
                          note.priority === 'medium' ? 'bg-orange-50' :
                          'bg-gray-50'
                        }`}>
                          <MessageSquare className={`w-5 h-5 ${
                            note.priority === 'high' ? 'text-red-600' :
                            note.priority === 'medium' ? 'text-orange-600' :
                            'text-gray-600'
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
                                    Champ
                                  </Badge>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs font-medium text-gray-700">{note.section}</span>
                                  <span className="text-xs text-gray-500">›</span>
                                  <span className="text-xs text-gray-600">{note.field}</span>
                                </>
                              ) : (
                                <Badge variant="outline" className="text-xs font-medium">
                                  Note générale
                                </Badge>
                              )}
                              {note.priority === 'high' && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                                  Priorité haute
                                </Badge>
                              )}
                              {note.priority === 'medium' && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                                  Priorité moyenne
                                </Badge>
                              )}
                            </div>
                            {note.status === 'resolved' ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 gap-1.5">
                                <CheckCircle2 className="w-3 h-3" />
                                Résolue
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => toast.success('Note résolue')}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Résoudre
                              </Button>
                            )}
                          </div>

                          {/* Note Content */}
                          <p className="text-sm text-gray-700 mb-3">
                            {note.content}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
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
                          onClick={() => toast.info('Suppression de la note')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
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