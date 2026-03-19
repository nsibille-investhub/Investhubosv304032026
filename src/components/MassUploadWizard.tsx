import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  Folder,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  FileIcon,
  Edit3,
  Sparkles,
  Languages,
  Users,
  TrendingUp,
  Building2,
  Droplet,
  Lock,
  Unlock,
  Download as DownloadIcon,
  Download,
  Printer,
  Search,
  ChevronsUpDown,
  Info,
  ExternalLink,
  Eye,
  Bell,
  EyeOff,
  BarChart3,
  Calendar,
  Shield,
  Mail
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { availableInvestors, fundLabelMap } from '../utils/investorsMockData';

interface MassUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
  existingFolders: string[];
  inline?: boolean;
}

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  description: string;
  size: string;
  folder: string;
  language: string;
  restrictToLanguage: boolean;
  targetType: string;
  targetSegments: string[];
  targetInvestors: string[];
  targetSubscriptions: string[];
  targetFunds: string[];
  accessRoles: string[];
  watermark: boolean;
  downloadable: boolean;
  printable: boolean;
  tags: string[];
  status: 'uploading' | 'analyzing' | 'uploaded' | 'error';
  progress: number;
  thumbnail?: string;
  // Metadata consistantes - calculées une seule fois
  pageCount: number;
  lpCount: number;
  contactCount: number;
  // Workflow de validation
  notify: boolean;
  emailTemplate: string;
  hideNewLabel: boolean;
  reporting: boolean;
  addDate: string;
  validationTeam: string[];
}

interface FolderItem {
  id: string;
  name: string;
  path: string;
  level: number;
}

// Mock languages
const availableLanguages = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

// Extraire la liste des fonds depuis investorsMockData
const availableFunds = Object.keys(fundLabelMap).map(key => ({
  id: key,
  name: fundLabelMap[key]
}));

// Mock segments
const availableSegments = [
  'Investisseurs Qualifiés',
  'Comité Stratégique',
  'Family Offices',
  'Institutionnels',
  'Particuliers',
  'Corporate Investors',
  'HNWI (High Net Worth)',
  'Distributeurs Partenaires'
];

// Mock souscriptions
const availableSubscriptions = [
  { id: 'sub-1', name: 'SOUSCRIPTION-2024-001', investor: 'Jean Dupont' },
  { id: 'sub-2', name: 'SOUSCRIPTION-2024-002', investor: 'Marie Martin' },
  { id: 'sub-3', name: 'SOUSCRIPTION-2024-003', investor: 'Pierre Durand' },
];

// Mock rôles de contacts
const availableContactRoles = [
  'Investisseur',
  'Conseil Juridique',
  'Conseil Fiscal',
  'Expert Comptable',
  'Auditeur',
  'Administrateur',
  'Représentant Légal',
  'Gestionnaire de Patrimoine',
  'Family Office',
  'Distributeur',
  'Partenaire Bancaire',
  'Compliance Officer',
  'Trustee',
  'Dépositaire'
];

// Templates d'email disponibles
const availableEmailTemplates = [
  { value: 'none', label: 'Aucun template', icon: '📭' },
  { value: 'new_document', label: 'Nouveau document', icon: '📄' },
  { value: 'capital_call', label: 'Appel de fond', icon: '💰' },
  { value: 'notification', label: 'Notification générale', icon: '🔔' },
  { value: 'quarterly_report', label: 'Rapport trimestriel', icon: '📊' },
  { value: 'tax_document', label: 'Document fiscal', icon: '📋' },
  { value: 'general_meeting', label: 'Convocation AG', icon: '📅' },
  { value: 'dividend', label: 'Distribution dividendes', icon: '💵' },
  { value: 'amendment', label: 'Avenant', icon: '📝' },
  { value: 'newsletter', label: 'Newsletter', icon: '📰' },
];

export function MassUploadWizard({ isOpen, onClose, existingFolders, inline = false }: MassUploadWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allAnalyzedToastShown, setAllAnalyzedToastShown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  
  // Deep Review mode
  const [deepReview, setDeepReview] = useState(false);
  const [currentReviewingDocIndex, setCurrentReviewingDocIndex] = useState(0);
  const [documentZoom, setDocumentZoom] = useState(100);

  const availableFolders = useMemo<FolderItem[]>(() => {
    if (existingFolders.length === 0) {
      return [];
    }

    const uniquePaths = Array.from(new Set(existingFolders))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'fr'));

    return uniquePaths.map((path, index) => {
      const segments = path.split('/').filter(Boolean);
      const name = segments[segments.length - 1] || path;
      return {
        id: `folder-${index}-${path}`,
        name,
        path,
        level: Math.max(0, segments.length - 1),
      };
    });
  }, [existingFolders]);

  const defaultFolderPath = availableFolders[0]?.path || '/';

  // Fonction pour obtenir la taille du fichier formatée
  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Générer une miniature pour les images
  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  // Simuler l'upload avec étapes: upload -> analyze -> done
  const simulateUpload = async (fileId: string, file: File) => {
    // Phase 1: Upload (0-100%)
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 25 + 10; // Plus rapide
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);
        
        // Transition vers l'analyse
        setTimeout(() => {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'analyzing', progress: 100 }
                : f
            )
          );
          
          // Phase 2: Analyse IA (1.5 secondes)
          setTimeout(async () => {
            const aiData = await analyzeFileWithAI(file);
            
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === fileId
                  ? { ...f, status: 'uploaded', progress: 100, ...aiData }
                  : f
              )
            );
          }, 1500);
        }, 500);
      } else {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === fileId
              ? { ...f, progress }
              : f
          )
        );
      }
    }, 200);
  };

  // Analyse IA du fichier (mock)
  const analyzeFileWithAI = async (file: File): Promise<Partial<UploadedFile>> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // Simulate intelligent extraction based on file name
    return {
      name: fileName,
      description: `Document automatiquement analysé : ${fileName}. Ce document contient des informations importantes relatives aux activités de l'entreprise.`,
      folder: defaultFolderPath,
      language: 'fr',
      restrictToLanguage: false,
      targetType: fileName.toLowerCase().includes('investor') ? 'investor' : 
                   fileName.toLowerCase().includes('legal') ? 'all' : 'investor',
      targetSegments: fileName.toLowerCase().includes('premium') ? ['Investisseurs Qualifiés'] : [],
      targetInvestors: fileName.toLowerCase().includes('investor') || !fileName.toLowerCase().includes('legal') 
        ? ['inv-3'] 
        : [],
      targetSubscriptions: [],
      accessRoles: ['Investisseur'],
      watermark: false,
      downloadable: true,
      printable: true,
      tags: [
        fileName.toLowerCase().includes('rapport') ? 'Rapport' : '',
        fileName.toLowerCase().includes('financial') || fileName.toLowerCase().includes('financier') ? 'Financier' : '',
        fileName.toLowerCase().includes('legal') ? 'Légal' : '',
      ].filter(Boolean),
    };
  };

  // Gérer l'upload de fichiers
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    toast.info('Upload en cours...', {
      description: `${files.length} fichier(s) sélectionné(s)`,
    });

    // Créer immédiatement les placeholders
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const thumbnail = await generateThumbnail(file);

      const newFile: UploadedFile = {
        id: `file-${Date.now()}-${i}`,
        file,
        size: getFileSize(file.size),
        status: 'uploading',
        progress: 0,
        thumbnail,
        // Valeurs par défaut temporaires (seront remplies par l'IA)
        name: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        folder: defaultFolderPath,
        language: 'fr',
        restrictToLanguage: false,
        targetType: 'all',
        targetSegments: [],
        targetInvestors: [],
        targetSubscriptions: [],
        targetFunds: [],
        accessRoles: [],
        watermark: false,
        downloadable: true,
        printable: true,
        tags: [],
        // Metadata consistantes - générées une seule fois
        pageCount: Math.floor(Math.random() * 20) + 5,
        lpCount: 0, // Sera mis à jour dynamiquement selon targetInvestors
        contactCount: 0, // Sera mis à jour dynamiquement selon targetInvestors
        // Workflow de validation - valeurs par défaut
        notify: false,
        emailTemplate: 'none',
        hideNewLabel: false,
        reporting: false,
        addDate: new Date().toISOString().split('T')[0],
        validationTeam: [],
      };
      newFiles.push(newFile);
    }

    // Afficher immédiatement les placeholders
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Lancer les uploads et analyses en parallèle
    newFiles.forEach(newFile => {
      simulateUpload(newFile.id, newFile.file);
    });
  };

  // Gestion du drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const handleRemoveFile = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    
    if (file && (file.status === 'uploading' || file.status === 'analyzing')) {
      toast.error('Impossible de supprimer', {
        description: 'Veuillez attendre la fin du traitement'
      });
      return;
    }
    
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFiles(prev => prev.filter(fid => fid !== id));
    toast.info('Fichier supprimé');
  };

  // Gérer la sélection des fichiers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(uploadedFiles.map(f => f.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleSelectFile = (fileId: string, checked: boolean) => {
    if (checked) {
      setSelectedFiles(prev => [...prev, fileId]);
    } else {
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    }
  };

  // Modification en masse
  const handleBulkUpdate = (field: string, value: any) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        selectedFiles.includes(f.id)
          ? { ...f, [field]: value }
          : f
      )
    );
    
    toast.success('Modification en masse', {
      description: `${selectedFiles.length} document(s) modifié(s)`
    });
  };

  // Ouvrir le document dans un nouvel onglet
  const handlePreviewDocument = (file: UploadedFile) => {
    const url = URL.createObjectURL(file.file);
    window.open(url, '_blank');
    toast.info('Document ouvert', {
      description: file.name
    });
  };

  // Mettre à jour un fichier
  const handleUpdateFile = (id: string, field: keyof UploadedFile, value: any) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, [field]: value }
          : f
      )
    );
  };

  // Ajouter/retirer un segment
  const toggleSegment = (fileId: string, segment: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        const segments = f.targetSegments.includes(segment)
          ? f.targetSegments.filter(s => s !== segment)
          : [...f.targetSegments, segment];
        return { ...f, targetSegments: segments };
      })
    );
  };

  // Ajouter/retirer un investisseur
  const toggleInvestor = (fileId: string, investorId: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        const investors = f.targetInvestors.includes(investorId)
          ? f.targetInvestors.filter(i => i !== investorId)
          : [...f.targetInvestors, investorId];
        return { ...f, targetInvestors: investors };
      })
    );
  };

  // Ajouter/retirer une souscription
  const toggleSubscription = (fileId: string, subscriptionId: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        const subscriptions = f.targetSubscriptions.includes(subscriptionId)
          ? f.targetSubscriptions.filter(s => s !== subscriptionId)
          : [...f.targetSubscriptions, subscriptionId];
        return { ...f, targetSubscriptions: subscriptions };
      })
    );
  };

  // Ajouter/retirer un fonds
  const toggleFund = (fileId: string, fundId: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        const funds = f.targetFunds.includes(fundId)
          ? f.targetFunds.filter(fund => fund !== fundId)
          : [...f.targetFunds, fundId];
        return { ...f, targetFunds: funds };
      })
    );
  };

  // Ajouter/retirer un rôle
  const toggleRole = (fileId: string, role: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        const roles = f.accessRoles.includes(role)
          ? f.accessRoles.filter(r => r !== role)
          : [...f.accessRoles, role];
        return { ...f, accessRoles: roles };
      })
    );
  };

  // Ajouter un tag
  const addTag = (fileId: string, tag: string) => {
    if (!tag.trim()) return;
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        if (f.tags.includes(tag.trim())) return f;
        return { ...f, tags: [...f.tags, tag.trim()] };
      })
    );
  };

  // Retirer un tag
  const removeTag = (fileId: string, tag: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        return { ...f, tags: f.tags.filter(t => t !== tag) };
      })
    );
  };

  // Télécharger la liste des destinataires en CSV
  const handleDownloadRecipients = (file: UploadedFile) => {
    const recipients: string[] = [];
    
    file.targetInvestors.forEach(invId => {
      const investor = availableInvestors.find(i => i.id === invId);
      if (investor) {
        // Investisseur principal (To)
        recipients.push(`"To","${investor.name}","${investor.email}","Investisseur Principal","${investor.company || ''}"`);
        
        // Contacts (Cc)
        investor.contacts.forEach(contact => {
          recipients.push(`"Cc","${contact.name}","${contact.email}","${contact.role}","${investor.company || ''}"`);
        });
      }
    });
    
    const csvContent = [
      'Type,Nom,Email,Rôle,Société',
      ...recipients
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `destinataires-${file.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export CSV réussi', {
      description: `${recipients.length} destinataires exportés`
    });
  };

  // Télécharger le scope de ciblage en CSV
  const handleDownloadScope = (file: UploadedFile) => {
    const scopeData: string[] = [];
    
    file.targetInvestors.forEach(invId => {
      const investor = availableInvestors.find(i => i.id === invId);
      if (investor) {
        const lpCount = 12; // Mock LP count per investor
        const contactCount = investor.contacts.length;
        
        scopeData.push(`"${investor.name}","${investor.email}","${lpCount}","${contactCount}","${investor.segment}","${investor.fund}"`);
      }
    });
    
    const csvContent = [
      'Investisseur,Email,Nb LP,Nb Contacts,Segment,Fonds',
      ...scopeData
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `scope-${file.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Export du scope réussi', {
      description: `Scope de ciblage exporté`
    });
  };

  const handleFinish = () => {
    const hasErrors = uploadedFiles.some(f => f.status === 'uploading' || f.status === 'error');
    
    if (hasErrors) {
      toast.error('Erreur', { description: 'Certains fichiers sont encore en cours d\'upload ou en erreur' });
      return;
    }

    toast.success('Import réussi', {
      description: `${uploadedFiles.length} document(s) ont été importés avec succès`
    });
    onClose();
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      return uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'uploaded');
    }
    return true;
  };
  
  // Calculate total steps based on deep review mode
  const totalSteps = deepReview ? 2 + uploadedFiles.length : 2;
  
  // Determine if we're in a document review step
  const isReviewStep = deepReview && currentStep > 1 && currentStep <= 1 + uploadedFiles.length;
  
  // Get the current document being reviewed
  const currentReviewDoc = isReviewStep ? uploadedFiles[currentStep - 2] : null;
  
  // Handle next in deep review mode
  const handleNextStep = () => {
    if (deepReview && currentStep === 1) {
      // Go to first document review
      setCurrentStep(2);
      setCurrentReviewingDocIndex(0);
    } else if (isReviewStep && currentStep < 1 + uploadedFiles.length) {
      // Go to next document review
      setCurrentStep(currentStep + 1);
      setCurrentReviewingDocIndex(currentReviewingDocIndex + 1);
    } else {
      // Go to final validation table
      setCurrentStep(deepReview ? 2 + uploadedFiles.length : 2);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (isReviewStep && currentReviewingDocIndex > 0) {
        setCurrentReviewingDocIndex(currentReviewingDocIndex - 1);
      }
    }
  };

  // Statistiques des fichiers
  const fileStats = useMemo(() => {
    return {
      total: uploadedFiles.length,
      uploading: uploadedFiles.filter(f => f.status === 'uploading').length,
      analyzing: uploadedFiles.filter(f => f.status === 'analyzing').length,
      uploaded: uploadedFiles.filter(f => f.status === 'uploaded').length,
      error: uploadedFiles.filter(f => f.status === 'error').length,
    };
  }, [uploadedFiles]);

  // Toast quand tous les fichiers sont analysés
  useEffect(() => {
    if (fileStats.total > 0 && fileStats.uploaded === fileStats.total && !allAnalyzedToastShown) {
      toast.success('Analyse terminée !', { 
        description: `${fileStats.total} fichier(s) pré-remplis par l'IA`,
        duration: 5000,
      });
      setAllAnalyzedToastShown(true);
    }
    
    // Reset le flag quand on supprime des fichiers
    if (fileStats.total === 0) {
      setAllAnalyzedToastShown(false);
    }
  }, [fileStats, allAnalyzedToastShown]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={inline ? 'h-full flex flex-col' : 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'}
        onClick={inline ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={inline
            ? 'bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col h-full'
            : 'bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col'}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0066FF] to-[#00C2FF] rounded-xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Import Massif de Documents</h2>
                <p className="text-sm text-gray-500">
                  {isReviewStep 
                    ? `Document ${currentReviewingDocIndex + 1} sur ${uploadedFiles.length}`
                    : `Étape ${deepReview && currentStep > 1 + uploadedFiles.length ? 'finale' : currentStep} sur ${totalSteps}`
                  }
                </p>
              </div>
            </div>
            {!inline && (
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            )}
          </div>

          {/* Progress Stepper */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {!deepReview ? (
                // Standard 2-step flow
                [
                  { num: 1, label: 'Upload & Analyse IA', icon: Sparkles },
                  { num: 2, label: 'Configuration', icon: Check }
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        animate={{
                          scale: currentStep === step.num ? 1.1 : 1,
                          backgroundColor: currentStep >= step.num ? '#0066FF' : '#E5E7EB'
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          currentStep >= step.num ? 'text-white' : 'text-gray-400'
                        } shadow-sm mb-2`}
                      >
                        <step.icon className="w-5 h-5" />
                      </motion.div>
                      <span className={`text-xs font-medium ${
                        currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 1 && (
                      <div className={`h-0.5 flex-1 mx-2 ${
                        currentStep > step.num ? 'bg-[#0066FF]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))
              ) : (
                // Deep review flow with 3 steps
                [
                  { num: 1, label: 'Upload & Analyse', icon: Sparkles },
                  { num: 2, label: 'Revue approfondie', icon: Eye, isRange: true },
                  { num: 3, label: 'Validation finale', icon: Check }
                ].map((step, idx) => {
                  const stepNum = step.num === 2 ? (currentStep > 1 && currentStep <= 1 + uploadedFiles.length ? currentStep : 2) : 
                                  step.num === 3 ? totalSteps : step.num;
                  const isActive = step.num === 1 ? currentStep === 1 :
                                   step.num === 2 ? isReviewStep :
                                   currentStep === totalSteps;
                  const isCompleted = step.num === 1 ? currentStep > 1 :
                                      step.num === 2 ? currentStep > 1 + uploadedFiles.length :
                                      false;
                  
                  return (
                    <div key={step.num} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <motion.div
                          animate={{
                            scale: isActive ? 1.1 : 1,
                            backgroundColor: isActive || isCompleted ? '#0066FF' : '#E5E7EB'
                          }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isActive || isCompleted ? 'text-white' : 'text-gray-400'
                          } shadow-sm mb-2`}
                        >
                          <step.icon className="w-5 h-5" />
                        </motion.div>
                        <span className={`text-xs font-medium text-center ${
                          isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                          {step.isRange && isActive && (
                            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                              {currentReviewingDocIndex + 1}/{uploadedFiles.length}
                            </div>
                          )}
                        </span>
                      </div>
                      {idx < 2 && (
                        <div className={`h-0.5 flex-1 mx-2 transition-colors ${
                          (step.num === 1 && currentStep > 1) || 
                          (step.num === 2 && currentStep > 1 + uploadedFiles.length)
                            ? 'bg-[#0066FF]' 
                            : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Upload with AI Analysis */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Upload massif de documents
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Uploadez vos documents ou saisissez les informations manuellement
                    </p>
                  </div>

                  {/* AI-Powered Document Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Upload intelligent
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group overflow-hidden ${
                        dragActive 
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50'
                          : 'border-gray-300 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50'
                      }`}
                    >
                      {/* Animated background gradient */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                      
                      <div className="relative z-10">
                        <motion.div
                          animate={{ 
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Upload className="w-10 h-10 text-gray-400 group-hover:text-purple-600 mx-auto mb-3 transition-colors" />
                        </motion.div>
                        <p className="font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                          Cliquez pour uploader vos documents
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          L'IA va pré-remplir automatiquement les champs
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint (max. 50MB)</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Deep Review Option */}
                  {uploadedFiles.length > 0 && fileStats.uploaded === fileStats.total && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">Revue approfondie</h4>
                            <Switch
                              checked={deepReview}
                              onCheckedChange={setDeepReview}
                            />
                          </div>
                          <p className="text-sm text-gray-600">
                            Examinez chaque document individuellement avec une visionneuse interactive et ajustez les métadonnées extraites par l'IA avant la validation finale.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Info banner pendant l'analyse */}
                  {(fileStats.uploading > 0 || fileStats.analyzing > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        </motion.div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {fileStats.analyzing > 0 ? 'Analyse IA en cours...' : 'Upload en cours...'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {fileStats.analyzing > 0 
                              ? `L'IA analyse ${fileStats.analyzing} document(s) pour pré-remplir automatiquement tous les champs : nom, description, ciblage, permissions, tags...`
                              : `Upload de ${fileStats.uploading} document(s) en cours...`
                            }
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Fichiers ({uploadedFiles.length})</h4>
                        <div className="flex items-center gap-2">
                          {fileStats.uploading > 0 && (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              {fileStats.uploading} Upload...
                            </Badge>
                          )}
                          {fileStats.analyzing > 0 && (
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                              </motion.div>
                              {fileStats.analyzing} Analyse IA...
                            </Badge>
                          )}
                          {fileStats.uploaded === fileStats.total && fileStats.total > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            >
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Tous analysés
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {uploadedFiles.map((file) => (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              file.status === 'uploading' 
                                ? 'bg-blue-50 border-blue-200' 
                                : file.status === 'analyzing'
                                ? 'bg-purple-50 border-purple-200'
                                : file.status === 'uploaded'
                                ? 'bg-emerald-50 border-emerald-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                          >
                            {/* Thumbnail or Icon */}
                            <div className="w-12 h-12 bg-white rounded border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {file.thumbnail ? (
                                <img src={file.thumbnail} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <FileText className="w-6 h-6 text-blue-600" />
                              )}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{file.size}</span>
                                <span className="text-xs text-gray-300">•</span>
                                
                                {/* Status label */}
                                {file.status === 'uploading' && (
                                  <span className="text-xs text-blue-700 font-medium flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Upload en cours...
                                  </span>
                                )}
                                {file.status === 'analyzing' && (
                                  <span className="text-xs text-purple-700 font-medium flex items-center gap-1">
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Sparkles className="w-3 h-3" />
                                    </motion.div>
                                    Analyse IA en cours...
                                  </span>
                                )}
                                {file.status === 'uploaded' && (
                                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Analysé et prêt
                                  </span>
                                )}
                                {file.status === 'error' && (
                                  <span className="text-xs text-red-700 font-medium flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Erreur
                                  </span>
                                )}
                              </div>
                              {file.status === 'uploading' && (
                                <Progress value={file.progress} className="h-1.5 mt-2" />
                              )}
                            </div>

                            {/* Status Icon */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                              {file.status === 'uploading' && (
                                <div className="relative">
                                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                </div>
                              )}
                              {file.status === 'analyzing' && (
                                <motion.div
                                  animate={{ 
                                    rotate: 360,
                                    scale: [1, 1.2, 1]
                                  }}
                                  transition={{ 
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                  }}
                                >
                                  <Sparkles className="w-5 h-5 text-purple-600" />
                                </motion.div>
                              )}
                              {file.status === 'uploaded' && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                </motion.div>
                              )}
                              {file.status === 'error' && (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                              )}

                              <button
                                onClick={() => handleRemoveFile(file.id)}
                                className="p-1.5 hover:bg-white/50 rounded transition-colors"
                                disabled={file.status === 'uploading' || file.status === 'analyzing'}
                              >
                                <Trash2 className={`w-4 h-4 ${
                                  file.status === 'uploading' || file.status === 'analyzing'
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-600'
                                }`} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Document Review Steps (Deep Review Mode) */}
              {isReviewStep && currentReviewDoc && (
                <motion.div
                  key={`review-${currentReviewingDocIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  {/* Header Info */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                          <Eye className="w-5 h-5 text-blue-600" />
                          Revue du document {currentReviewingDocIndex + 1}/{uploadedFiles.length}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Vérifiez le document et ajustez les métadonnées extraites par l'IA
                        </p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        {currentReviewDoc.name}
                      </Badge>
                    </div>
                  </div>

                  {/* Main Content: Document Viewer + Metadata */}
                  <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                    {/* Left: Document Viewer */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                      {/* Viewer Toolbar */}
                      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">Aperçu du document</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDocumentZoom(Math.max(50, documentZoom - 10))}
                            className="h-8 px-2"
                          >
                            <span className="text-lg">-</span>
                          </Button>
                          <span className="text-sm text-gray-600 min-w-[60px] text-center font-medium">
                            {documentZoom}%
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDocumentZoom(Math.min(200, documentZoom + 10))}
                            className="h-8 px-2"
                          >
                            <span className="text-lg">+</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDocumentZoom(100)}
                            className="h-8 px-3 text-xs"
                          >
                            Reset
                          </Button>
                        </div>
                      </div>

                      {/* Document Preview Area */}
                      <div className="flex-1 overflow-auto p-4 bg-gradient-to-br from-gray-100 to-gray-50">
                        <div 
                          className="bg-white rounded-lg shadow-md mx-auto transition-all duration-200"
                          style={{ 
                            width: `${documentZoom}%`,
                            minHeight: '600px'
                          }}
                        >
                          {currentReviewDoc.thumbnail ? (
                            <img 
                              src={currentReviewDoc.thumbnail} 
                              alt={currentReviewDoc.name}
                              className="w-full h-auto rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                              <FileText className="w-20 h-20 text-gray-300 mb-4" />
                              <h4 className="text-lg font-medium text-gray-700 mb-2">
                                {currentReviewDoc.file.name}
                              </h4>
                              <p className="text-sm text-gray-500 mb-4">
                                Aperçu du document PDF
                              </p>
                              <div className="space-y-2 text-left w-full max-w-md">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-600">Type</span>
                                  <Badge variant="outline">{currentReviewDoc.file.type || 'PDF'}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-600">Taille</span>
                                  <Badge variant="outline">{currentReviewDoc.size}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-600">Pages</span>
                                  <Badge variant="outline">{currentReviewDoc.pageCount} pages</Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Editable Metadata */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-semibold text-gray-900">Métadonnées extraites par l'IA</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Nom du document */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Nom du document
                          </Label>
                          <Input
                            value={currentReviewDoc.name}
                            onChange={(e) => handleUpdateFile(currentReviewDoc.id, 'name', e.target.value)}
                            className="text-sm"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Description
                          </Label>
                          <Textarea
                            value={currentReviewDoc.description}
                            onChange={(e) => handleUpdateFile(currentReviewDoc.id, 'description', e.target.value)}
                            rows={3}
                            className="text-sm resize-none"
                          />
                        </div>

                        {/* Dossier */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Dossier de destination
                          </Label>
                          <Select
                            value={currentReviewDoc.folder}
                            onValueChange={(value) => handleUpdateFile(currentReviewDoc.id, 'folder', value)}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFolders.map((folder) => (
                                <SelectItem key={folder.id} value={folder.path}>
                                  <span style={{ paddingLeft: `${folder.level * 12}px` }}>
                                    {folder.level > 0 && '└ '}{folder.name}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Langue */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Langue du document
                          </Label>
                          <Select
                            value={currentReviewDoc.language}
                            onValueChange={(value) => handleUpdateFile(currentReviewDoc.id, 'language', value)}
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLanguages.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                  <div className="flex items-center gap-2">
                                    <span>{lang.flag}</span>
                                    <span>{lang.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tags */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Tags (séparés par virgule)
                          </Label>
                          <Input
                            value={currentReviewDoc.tags.join(', ')}
                            onChange={(e) => {
                              const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                              handleUpdateFile(currentReviewDoc.id, 'tags', tags);
                            }}
                            placeholder="Financier, Q1 2024, Rapport..."
                            className="text-sm"
                          />
                          {currentReviewDoc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {currentReviewDoc.tags.map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Permissions */}
                        <div className="pt-3 border-t border-gray-200">
                          <Label className="text-xs font-semibold text-gray-700 mb-3 block">
                            Permissions
                          </Label>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">Téléchargeable</span>
                              <Switch
                                checked={currentReviewDoc.downloadable}
                                onCheckedChange={(checked) => handleUpdateFile(currentReviewDoc.id, 'downloadable', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">Imprimable</span>
                              <Switch
                                checked={currentReviewDoc.printable}
                                onCheckedChange={(checked) => handleUpdateFile(currentReviewDoc.id, 'printable', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">Watermark</span>
                              <Switch
                                checked={currentReviewDoc.watermark}
                                onCheckedChange={(checked) => handleUpdateFile(currentReviewDoc.id, 'watermark', checked)}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Statistics */}
                        <div className="pt-3 border-t border-gray-200">
                          <Label className="text-xs font-semibold text-gray-700 mb-2 block">
                            Statistiques du document
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-xs text-blue-600 font-medium mb-0.5">Pages</div>
                              <div className="text-lg font-semibold text-blue-900">{currentReviewDoc.pageCount}</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="text-xs text-purple-600 font-medium mb-0.5">Taille</div>
                              <div className="text-lg font-semibold text-purple-900">{currentReviewDoc.size}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Configuration Table (or final step in deep review mode) */}
              {((currentStep === 2 && !deepReview) || (deepReview && currentStep === 2 + uploadedFiles.length)) && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Edit3 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">Configuration des documents</h3>
                        <p className="text-sm text-gray-600">
                          Vérifiez et modifiez les informations pré-remplies par l'IA. Cliquez sur une cellule pour l'éditer.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Exporter la configuration en CSV
                                const headers = [
                                  'Nom du document',
                                  'Description',
                                  'Dossier',
                                  'Langue',
                                  'Restreindre à langue',
                                  'Type de ciblage',
                                  'Segments',
                                  'Investisseurs',
                                  'Souscriptions',
                                  'Fonds',
                                  'Watermark',
                                  'Téléchargeable',
                                  'Imprimable',
                                  'Tags',
                                  'Notifier',
                                  'Template email',
                                  'Masquer label nouveau',
                                  'Reporting',
                                  'Date ajout',
                                  'Équipe validation'
                                ];
                                
                                const rows = uploadedFiles.map(file => [
                                  file.name,
                                  file.description,
                                  file.folder,
                                  file.language,
                                  file.restrictToLanguage ? 'Oui' : 'Non',
                                  file.targetType,
                                  file.targetSegments.join(';'),
                                  file.targetInvestors.join(';'),
                                  file.targetSubscriptions.join(';'),
                                  file.targetFunds.join(';'),
                                  file.watermark ? 'Oui' : 'Non',
                                  file.downloadable ? 'Oui' : 'Non',
                                  file.printable ? 'Oui' : 'Non',
                                  file.tags.join(';'),
                                  file.notify ? 'Oui' : 'Non',
                                  file.emailTemplate,
                                  file.hideNewLabel ? 'Oui' : 'Non',
                                  file.reporting ? 'Oui' : 'Non',
                                  file.addDate,
                                  file.validationTeam.join(';')
                                ]);
                                
                                const csvContent = [
                                  headers.join(','),
                                  ...rows.map(row => row.map(cell => 
                                    typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
                                      ? `"${cell.replace(/"/g, '""')}"`
                                      : cell
                                  ).join(','))
                                ].join('\n');
                                
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement('a');
                                link.href = URL.createObjectURL(blob);
                                link.download = `configuration_documents_${new Date().toISOString().split('T')[0]}.csv`;
                                link.click();
                                
                                toast.success('Configuration exportée', {
                                  description: `${uploadedFiles.length} documents exportés en CSV`
                                });
                              }}
                              className="gap-2 bg-white hover:bg-amber-50 border-amber-300 hover:border-amber-400"
                            >
                              <Download className="w-4 h-4 text-amber-600" />
                              Exporter
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Exporter la configuration en CSV</TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Créer un input file invisible
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.csv';
                                input.onchange = (e: any) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    try {
                                      const text = event.target?.result as string;
                                      const lines = text.split('\n');
                                      const headers = lines[0].split(',');
                                      
                                      toast.success('Import en cours...', {
                                        description: 'Analyse du fichier CSV'
                                      });
                                      
                                      // Simuler un délai de traitement
                                      setTimeout(() => {
                                        toast.success('Configuration importée', {
                                          description: `${lines.length - 1} lignes détectées. Fonctionnalité complète à venir.`
                                        });
                                      }, 500);
                                      
                                    } catch (error) {
                                      toast.error('Erreur d\'import', {
                                        description: 'Le fichier CSV est invalide'
                                      });
                                    }
                                  };
                                  reader.readAsText(file);
                                };
                                input.click();
                              }}
                              className="gap-2 bg-white hover:bg-amber-50 border-amber-300 hover:border-amber-400"
                            >
                              <Upload className="w-4 h-4 text-amber-600" />
                              Importer
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Importer une configuration CSV</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Edit Bar */}
                  <AnimatePresence>
                    {selectedFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="relative overflow-hidden p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-2xl mb-4 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {/* Animated background gradient */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-indigo-400/10 to-purple-400/10"
                          animate={{
                            x: ['-100%', '100%'],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-md">
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  {selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} sélectionné{selectedFiles.length > 1 ? 's' : ''}
                                </Badge>
                              </motion.div>
                              <span className="font-semibold text-gray-800 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-blue-600" />
                                Modification en masse
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowBulkEdit(!showBulkEdit)}
                                  className="gap-2 bg-white/80 backdrop-blur-sm hover:bg-white border-blue-300 hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  {showBulkEdit ? 'Masquer' : 'Afficher'} les options
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedFiles([])}
                                  className="gap-2 bg-white/80 backdrop-blur-sm hover:bg-red-50 border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600 shadow-sm hover:shadow-md transition-all duration-200"
                                >
                                  <X className="w-4 h-4" />
                                  Désélectionner
                                </Button>
                              </motion.div>
                            </div>
                          </div>

                          {showBulkEdit && (
                            <motion.div
                              initial={{ opacity: 0, height: 0, y: -10 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -10 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="mt-5 pt-4 border-t border-blue-200"
                            >
                              <div className="grid grid-cols-3 gap-4">
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.1 }}
                                  className="space-y-2"
                                >
                                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Folder className="w-3.5 h-3.5 text-amber-600" />
                                    Dossier de destination
                                  </Label>
                                  <Select onValueChange={(value) => handleBulkUpdate('folder', value)}>
                                    <SelectTrigger className="text-sm h-10 bg-white/80 backdrop-blur-sm border-amber-200 hover:border-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm">
                                      <SelectValue placeholder="Changer le dossier..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableFolders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.path} className="hover:bg-amber-50 cursor-pointer">
                                          <div className="flex items-center gap-2">
                                            <Folder className="w-3 h-3 text-amber-500" />
                                            {folder.path}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </motion.div>
                                
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.15 }}
                                  className="space-y-2"
                                >
                                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Languages className="w-3.5 h-3.5 text-green-600" />
                                    Langue du document
                                  </Label>
                                  <Select onValueChange={(value) => handleBulkUpdate('language', value)}>
                                    <SelectTrigger className="text-sm h-10 bg-white/80 backdrop-blur-sm border-green-200 hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all shadow-sm">
                                      <SelectValue placeholder="Changer la langue..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableLanguages.map((lang) => (
                                        <SelectItem key={lang.value} value={lang.value} className="hover:bg-green-50 cursor-pointer">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">{lang.flag}</span>
                                            <span className="font-medium">{lang.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </motion.div>
                                
                                <motion.div
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.2 }}
                                  className="space-y-2"
                                >
                                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-purple-600" />
                                    Type de ciblage
                                  </Label>
                                  <Select onValueChange={(value) => handleBulkUpdate('targetType', value)}>
                                    <SelectTrigger className="text-sm h-10 bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm">
                                      <SelectValue placeholder="Changer le ciblage..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Users className="w-3 h-3 text-gray-500" />
                                          Tous
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="segment" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <TrendingUp className="w-3 h-3 text-blue-500" />
                                          Segments
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="investor" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Users className="w-3 h-3 text-purple-500" />
                                          Investisseurs
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="subscription" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-3 h-3 text-indigo-500" />
                                          Souscriptions
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Tableau éditable - scroll horizontal */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-gray-50 via-gray-50 to-blue-50/30 sticky top-0 z-20">
                          <tr>
                            <th className="px-4 py-4 text-left w-[60px] sticky left-0 bg-gradient-to-r from-gray-50 to-gray-50 z-20 border-b border-gray-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                              <Checkbox
                                checked={selectedFiles.length === uploadedFiles.length && uploadedFiles.length > 0}
                                onCheckedChange={handleSelectAll}
                                className="transition-all duration-200 hover:scale-110"
                              />
                            </th>
                            <th className="px-4 py-4 text-left min-w-[160px] sticky left-[45px] bg-gradient-to-r from-gray-50 to-gray-50 z-20 border-b border-gray-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                              <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">Aperçu</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[220px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900">Nom du document</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[280px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900">Description</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[180px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-amber-600" />
                                <span className="font-semibold text-gray-900">Dossier</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[140px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Languages className="w-4 h-4 text-green-600" />
                                <span className="font-semibold text-gray-900">Langue</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[240px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600" />
                                <span className="font-semibold text-gray-900">Ciblage</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">Segments</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-indigo-600" />
                                <span className="font-semibold text-gray-900">Scope</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[120px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Bell className="w-4 h-4 text-orange-600" />
                                <span className="font-semibold text-gray-900">Notifier</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[220px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-blue-600" />
                                <span className="font-semibold text-gray-900">Template Email</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[140px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <EyeOff className="w-4 h-4 text-gray-600" />
                                <span className="font-semibold text-gray-900">Cacher "New"</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[120px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-emerald-600" />
                                <span className="font-semibold text-gray-900">Reporting</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[160px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-violet-600" />
                                <span className="font-semibold text-gray-900">Date d'ajout</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-600" />
                                <span className="font-semibold text-gray-900">Équipe validation</span>
                              </div>
                            </th>
                            <th className="px-4 py-4 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-pink-600" />
                                <span className="font-semibold text-gray-900">Tags</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {uploadedFiles.map((file, idx) => {
                            const isSelected = selectedFiles.includes(file.id);
                            // Calculer le scope dynamiquement selon le type de ciblage
                            let lpCount = 0;
                            let contactCount = 0;
                            
                            if (file.targetType === 'all') {
                              // Tous les investisseurs
                              lpCount = availableInvestors.length;
                              contactCount = availableInvestors.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'fund') {
                              // Investisseurs dans les fonds sélectionnés (+ segments si sélectionnés)
                              let investorsInFunds = availableInvestors.filter(inv => 
                                file.targetFunds.includes(inv.fund)
                              );
                              
                              // Si des segments sont aussi sélectionnés, filtrer davantage
                              if (file.targetSegments.length > 0) {
                                investorsInFunds = investorsInFunds.filter(inv => 
                                  file.targetSegments.includes(inv.segment)
                                );
                              }
                              
                              lpCount = investorsInFunds.length;
                              contactCount = investorsInFunds.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'segment') {
                              // Investisseurs dans les segments sélectionnés
                              const investorsInSegments = availableInvestors.filter(inv => 
                                file.targetSegments.includes(inv.segment)
                              );
                              lpCount = investorsInSegments.length;
                              contactCount = investorsInSegments.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'investor') {
                              // Investisseurs sélectionnés directement
                              const selectedInvestors = availableInvestors.filter(inv => 
                                file.targetInvestors.includes(inv.id)
                              );
                              lpCount = selectedInvestors.length;
                              contactCount = selectedInvestors.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'subscription') {
                              // Investisseurs liés aux souscriptions sélectionnées
                              const investorsFromSubscriptions = availableSubscriptions
                                .filter(sub => file.targetSubscriptions.includes(sub.id))
                                .map(sub => sub.investor);
                              const uniqueInvestorNames = [...new Set(investorsFromSubscriptions)];
                              const selectedInvestors = availableInvestors.filter(inv => 
                                uniqueInvestorNames.includes(inv.name)
                              );
                              lpCount = selectedInvestors.length;
                              contactCount = selectedInvestors.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            }
                            
                            return (
                            <motion.tr 
                              key={file.id} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.03 }}
                              className={`group transition-all duration-200 ${
                                isSelected 
                                  ? 'bg-gradient-to-r from-blue-50 via-blue-50/50 to-transparent' 
                                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:via-gray-50/30 hover:to-transparent'
                              }`}
                            >
                              {/* Checkbox */}
                              <td className={`px-4 py-4 sticky left-0 z-10 transition-all duration-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] ${
                                isSelected ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'
                              }`}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => handleSelectFile(file.id, checked as boolean)}
                                  className="transition-all duration-200 hover:scale-110"
                                />
                              </td>

                              {/* Aperçu */}
                              <td className={`px-4 py-4 sticky left-[45px] z-10 transition-all duration-200 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] ${
                                isSelected ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'
                              }`}>
                                <motion.button
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handlePreviewDocument(file)}
                                  className="flex items-center gap-3 hover:bg-white/80 p-2 rounded-xl transition-all duration-200 hover:shadow-md border border-transparent hover:border-blue-200"
                                >
                                  {file.thumbnail ? (
                                    <div className="relative w-16 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                                      <img 
                                        src={file.thumbnail} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          whileHover={{ scale: 1 }}
                                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                        >
                                          <ExternalLink className="w-5 h-5 text-white drop-shadow-lg" />
                                        </motion.div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="w-16 h-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg border-2 border-blue-200 flex items-center justify-center hover:from-blue-100 hover:via-indigo-100 hover:to-purple-100 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden group">
                                      {/* Animated background shimmer */}
                                      <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                        animate={{
                                          x: ['-100%', '100%']
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: 'linear'
                                        }}
                                      />
                                      <FileText className="w-8 h-8 text-blue-600 relative z-10" />
                                    </div>
                                  )}
                                  <div className="flex flex-col items-start gap-1">
                                    <Badge className="bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 border-gray-300 text-xs font-medium shadow-sm">
                                      <FileText className="w-3 h-3 mr-1" />
                                      {file.pageCount} pages
                                    </Badge>
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      whileHover={{ opacity: 1 }}
                                      className="flex items-center gap-1 text-xs text-blue-600 font-medium"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Ouvrir</span>
                                    </motion.div>
                                  </div>
                                </motion.button>
                              </td>

                              {/* Nom */}
                              <td className="px-4 py-4">
                                <Input
                                  value={file.name}
                                  onChange={(e) => handleUpdateFile(file.id, 'name', e.target.value)}
                                  className="text-sm font-medium border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white hover:bg-gray-50"
                                  placeholder="Nom du document..."
                                />
                              </td>

                              {/* Description */}
                              <td className="px-4 py-4">
                                <Textarea
                                  value={file.description}
                                  onChange={(e) => handleUpdateFile(file.id, 'description', e.target.value)}
                                  className="text-sm min-h-[70px] border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white hover:bg-gray-50 resize-none"
                                  rows={3}
                                  placeholder="Description du document..."
                                />
                              </td>

                              {/* Dossier */}
                              <td className="px-4 py-4">
                                <Select
                                  value={file.folder}
                                  onValueChange={(value) => handleUpdateFile(file.id, 'folder', value)}
                                >
                                  <SelectTrigger className="text-sm border-gray-200 hover:border-amber-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all duration-200 bg-white hover:bg-amber-50/30">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableFolders.map((folder) => (
                                      <SelectItem key={folder.id} value={folder.path} className="hover:bg-amber-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          {folder.level > 0 && (
                                            <span className="text-gray-400" style={{ marginLeft: `${folder.level * 12}px` }}>
                                              └─
                                            </span>
                                          )}
                                          <Folder className="w-4 h-4 text-amber-500" />
                                          <span className="font-medium">{folder.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </td>

                              {/* Langue */}
                              <td className="px-4 py-4">
                                <div className="space-y-2.5">
                                  <Select
                                    value={file.language}
                                    onValueChange={(value) => handleUpdateFile(file.id, 'language', value)}
                                  >
                                    <SelectTrigger className="text-sm border-gray-200 hover:border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all duration-200 bg-white hover:bg-green-50/30">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableLanguages.map((lang) => (
                                        <SelectItem key={lang.value} value={lang.value} className="hover:bg-green-50 cursor-pointer">
                                          <div className="flex items-center gap-2">
                                            <span className="text-lg">{lang.flag}</span>
                                            <span className="font-medium">{lang.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-green-50/50 transition-colors duration-200">
                                    <Switch
                                      checked={file.restrictToLanguage}
                                      onCheckedChange={(checked) => handleUpdateFile(file.id, 'restrictToLanguage', checked)}
                                      className="data-[state=checked]:bg-green-600"
                                    />
                                    <span className="text-xs text-gray-600 font-medium">Restreindre à cette langue</span>
                                  </div>
                                </div>
                              </td>

                              {/* Ciblage - Type + Objet fusionnés */}
                              <td className="px-4 py-4">
                                <div className="space-y-2.5">
                                  {/* Type de ciblage */}
                                  <Select
                                    value={file.targetType}
                                    onValueChange={(value) => {
                                      handleUpdateFile(file.id, 'targetType', value);
                                      // Vider les segments si on passe en investisseur ou souscription
                                      if (value === 'investor' || value === 'subscription') {
                                        handleUpdateFile(file.id, 'targetSegments', []);
                                      }
                                      // Vider les fonds si on ne sélectionne pas fund
                                      if (value !== 'fund') {
                                        handleUpdateFile(file.id, 'targetFunds', []);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="text-sm border-gray-200 hover:border-purple-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200 bg-white hover:bg-purple-50/30">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Users className="w-4 h-4 text-gray-500" />
                                          <span className="font-medium">Tous</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="fund" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Droplet className="w-4 h-4 text-teal-500" />
                                          <span className="font-medium">Fonds</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="segment" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <TrendingUp className="w-4 h-4 text-blue-500" />
                                          <span className="font-medium">Segments</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="investor" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Users className="w-4 h-4 text-purple-500" />
                                          <span className="font-medium">Investisseurs</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="subscription" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-indigo-500" />
                                          <span className="font-medium">Souscriptions</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {/* Objet sous-jacent - Investisseurs */}
                                  {file.targetType === 'investor' && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className={`w-full justify-between text-xs transition-all duration-200 ${
                                            file.targetInvestors.length > 0 
                                              ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300 hover:border-purple-400 text-purple-700 shadow-sm' 
                                              : 'hover:border-purple-300 hover:bg-purple-50/30'
                                          }`}
                                        >
                                          {file.targetInvestors.length > 0 ? (
                                            <span className="flex items-center gap-1.5 font-medium">
                                              <Users className="w-3.5 h-3.5" />
                                              {file.targetInvestors.length} LP sélectionné{file.targetInvestors.length > 1 ? 's' : ''}
                                            </span>
                                          ) : (
                                            <span className="text-gray-500">Sélectionner des LP...</span>
                                          )}
                                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[240px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Rechercher un LP..." className="text-xs border-b" />
                                          <CommandList>
                                            <CommandEmpty className="py-6 text-center text-sm text-gray-500">Aucun investisseur trouvé.</CommandEmpty>
                                            <CommandGroup>
                                              {availableInvestors.map((investor) => (
                                                <CommandItem
                                                  key={investor.id}
                                                  onSelect={() => toggleInvestor(file.id, investor.id)}
                                                  className="text-xs cursor-pointer hover:bg-purple-50"
                                                >
                                                  <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded border transition-all ${
                                                    file.targetInvestors.includes(investor.id)
                                                      ? 'bg-purple-600 border-purple-600 shadow-sm'
                                                      : 'border-gray-300'
                                                  }`}>
                                                    {file.targetInvestors.includes(investor.id) && <Check className="h-3 w-3 text-white" />}
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <span className="font-medium">{investor.name}</span>
                                                    <span className="text-[10px] text-gray-500">{investor.email}</span>
                                                  </div>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  )}

                                  {/* Objet sous-jacent - Fonds */}
                                  {file.targetType === 'fund' && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className={`w-full justify-between text-xs transition-all duration-200 ${
                                            file.targetFunds.length > 0 
                                              ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 hover:border-teal-400 text-teal-700 shadow-sm' 
                                              : 'hover:border-teal-300 hover:bg-teal-50/30'
                                          }`}
                                        >
                                          {file.targetFunds.length > 0 ? (
                                            <span className="flex items-center gap-1.5 font-medium">
                                              <Droplet className="w-3.5 h-3.5" />
                                              {file.targetFunds.length} fonds sélectionné{file.targetFunds.length > 1 ? 's' : ''}
                                            </span>
                                          ) : (
                                            <span className="text-gray-500">Sélectionner des fonds...</span>
                                          )}
                                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[260px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Rechercher un fonds..." className="text-xs border-b" />
                                          <CommandList>
                                            <CommandEmpty className="py-6 text-center text-sm text-gray-500">Aucun fonds trouvé.</CommandEmpty>
                                            <CommandGroup>
                                              {availableFunds.map((fund) => (
                                                <CommandItem
                                                  key={fund.id}
                                                  onSelect={() => toggleFund(file.id, fund.id)}
                                                  className="text-xs cursor-pointer hover:bg-teal-50"
                                                >
                                                  <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded border transition-all ${
                                                    file.targetFunds.includes(fund.id)
                                                      ? 'bg-teal-600 border-teal-600 shadow-sm'
                                                      : 'border-gray-300'
                                                  }`}>
                                                    {file.targetFunds.includes(fund.id) && <Check className="h-3 w-3 text-white" />}
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <span className="font-medium">{fund.name}</span>
                                                  </div>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  )}

                                  {/* Objet sous-jacent - Souscriptions */}
                                  {file.targetType === 'subscription' && (
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          className={`w-full justify-between text-xs transition-all duration-200 ${
                                            file.targetSubscriptions.length > 0 
                                              ? 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 hover:border-indigo-400 text-indigo-700 shadow-sm' 
                                              : 'hover:border-indigo-300 hover:bg-indigo-50/30'
                                          }`}
                                        >
                                          {file.targetSubscriptions.length > 0 ? (
                                            <span className="flex items-center gap-1.5 font-medium">
                                              <FileText className="w-3.5 h-3.5" />
                                              {file.targetSubscriptions.length} souscription{file.targetSubscriptions.length > 1 ? 's' : ''}
                                            </span>
                                          ) : (
                                            <span className="text-gray-500">Sélectionner...</span>
                                          )}
                                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[280px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Rechercher une souscription..." className="text-xs border-b" />
                                          <CommandList>
                                            <CommandEmpty className="py-6 text-center text-sm text-gray-500">Aucune souscription trouvée.</CommandEmpty>
                                            <CommandGroup>
                                              {availableSubscriptions.map((subscription) => (
                                                <CommandItem
                                                  key={subscription.id}
                                                  onSelect={() => toggleSubscription(file.id, subscription.id)}
                                                  className="text-xs cursor-pointer hover:bg-indigo-50"
                                                >
                                                  <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded border transition-all ${
                                                    file.targetSubscriptions.includes(subscription.id)
                                                      ? 'bg-indigo-600 border-indigo-600 shadow-sm'
                                                      : 'border-gray-300'
                                                  }`}>
                                                    {file.targetSubscriptions.includes(subscription.id) && <Check className="h-3 w-3 text-white" />}
                                                  </div>
                                                  <div className="flex flex-col">
                                                    <span className="font-medium">{subscription.name}</span>
                                                    <span className="text-[10px] text-gray-500">{subscription.investor}</span>
                                                  </div>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  )}
                                  
                                  {/* Afficher les éléments sélectionnés de manière explicite */}
                                  {file.targetType === 'investor' && file.targetInvestors.length > 0 && (
                                    <div className="p-2 bg-purple-50/50 border border-purple-200 rounded-lg">
                                      <p className="text-[10px] text-gray-500 font-medium mb-1.5">Ciblage défini :</p>
                                      <div className="space-y-1">
                                        {file.targetInvestors.slice(0, 3).map(invId => {
                                          const investor = availableInvestors.find(i => i.id === invId);
                                          return investor ? (
                                            <div key={invId} className="text-xs text-purple-700 font-medium flex items-center gap-1">
                                              <span className="w-1 h-1 bg-purple-600 rounded-full"></span>
                                              {investor.name}
                                            </div>
                                          ) : null;
                                        })}
                                        {file.targetInvestors.length > 3 && (
                                          <div className="text-xs text-purple-600 font-semibold">
                                            +{file.targetInvestors.length - 3} autre{file.targetInvestors.length - 3 > 1 ? 's' : ''}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {file.targetType === 'fund' && file.targetFunds.length > 0 && (
                                    <div className="p-2 bg-teal-50/50 border border-teal-200 rounded-lg">
                                      <p className="text-[10px] text-gray-500 font-medium mb-1.5">Ciblage défini :</p>
                                      <div className="space-y-1">
                                        {file.targetFunds.map(fundId => {
                                          const fund = availableFunds.find(f => f.id === fundId);
                                          return fund ? (
                                            <div key={fundId} className="text-xs text-teal-700 font-medium flex items-center gap-1">
                                              <span className="w-1 h-1 bg-teal-600 rounded-full"></span>
                                              {fund.name}
                                            </div>
                                          ) : null;
                                        })}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {file.targetType === 'subscription' && file.targetSubscriptions.length > 0 && (
                                    <div className="p-2 bg-indigo-50/50 border border-indigo-200 rounded-lg">
                                      <p className="text-[10px] text-gray-500 font-medium mb-1.5">Ciblage défini :</p>
                                      <div className="space-y-1">
                                        {file.targetSubscriptions.slice(0, 3).map(subId => {
                                          const subscription = availableSubscriptions.find(s => s.id === subId);
                                          return subscription ? (
                                            <div key={subId} className="text-xs text-indigo-700 font-medium flex items-center gap-1">
                                              <span className="w-1 h-1 bg-indigo-600 rounded-full"></span>
                                              {subscription.name}
                                            </div>
                                          ) : null;
                                        })}
                                        {file.targetSubscriptions.length > 3 && (
                                          <div className="text-xs text-indigo-600 font-semibold">
                                            +{file.targetSubscriptions.length - 3} autre{file.targetSubscriptions.length - 3 > 1 ? 's' : ''}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Segments - Grisé si investor ou subscription, actif pour fund et segment */}
                              <td className={`px-4 py-4 transition-all duration-200 ${
                                (file.targetType === 'investor' || file.targetType === 'subscription') 
                                  ? 'opacity-40 pointer-events-none bg-gray-50/50' 
                                  : ''
                              }`}>
                                <div className="space-y-2">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className={`w-full justify-between text-xs transition-all duration-200 ${
                                          file.targetSegments.length > 0 
                                            ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 hover:border-blue-400 text-blue-700 shadow-sm' 
                                            : 'hover:border-blue-300 hover:bg-blue-50/30'
                                        }`}
                                        disabled={file.targetType === 'investor' || file.targetType === 'subscription'}
                                      >
                                        {file.targetSegments.length > 0 ? (
                                          <span className="flex items-center gap-1.5 font-medium">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            {file.targetSegments.length} segment{file.targetSegments.length > 1 ? 's' : ''}
                                          </span>
                                        ) : (
                                          <span className="text-gray-500">Sélectionner...</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-0" align="start">
                                      <Command>
                                        <CommandInput placeholder="Rechercher un segment..." className="text-xs border-b" />
                                        <CommandList>
                                          <CommandEmpty className="py-6 text-center text-sm text-gray-500">Aucun segment trouvé.</CommandEmpty>
                                          <CommandGroup>
                                            {availableSegments.map((segment) => (
                                              <CommandItem
                                                key={segment}
                                                onSelect={() => toggleSegment(file.id, segment)}
                                                className="text-xs cursor-pointer hover:bg-blue-50"
                                              >
                                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded border transition-all ${
                                                  file.targetSegments.includes(segment)
                                                    ? 'bg-blue-600 border-blue-600 shadow-sm'
                                                    : 'border-gray-300'
                                                }`}>
                                                  {file.targetSegments.includes(segment) && <Check className="h-3 w-3 text-white" />}
                                                </div>
                                                <span className="font-medium">{segment}</span>
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  
                                  {/* Info pour le type Fund */}
                                  {file.targetType === 'fund' && file.targetFunds.length > 0 && file.targetSegments.length === 0 && (
                                    <div className="text-[10px] text-gray-500 italic p-2 bg-blue-50/30 rounded border border-blue-200">
                                      💡 Filtrer par segments (optionnel)
                                    </div>
                                  )}
                                  
                                  {/* Afficher les valeurs sélectionnées avec animation */}
                                  <AnimatePresence>
                                    {file.targetSegments.length > 0 && (
                                      <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex flex-wrap gap-1.5"
                                      >
                                        {file.targetSegments.slice(0, 2).map((segment) => (
                                          <motion.div
                                            key={segment}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                          >
                                            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-300 text-[10px] font-medium shadow-sm">
                                              {segment.length > 15 ? segment.substring(0, 15) + '...' : segment}
                                            </Badge>
                                          </motion.div>
                                        ))}
                                        {file.targetSegments.length > 2 && (
                                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300 text-[10px] font-semibold">
                                            +{file.targetSegments.length - 2}
                                          </Badge>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </td>

                              {/* Scope */}
                              <td className="px-4 py-4">
                                <div className="space-y-2.5">
                                  <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                      <Users className="w-4 h-4 text-emerald-700" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs text-gray-500 font-medium">Limited Partners</span>
                                      <span className="font-semibold text-emerald-700">{lpCount} LP</span>
                                    </div>
                                  </motion.div>
                                  <motion.div 
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center gap-2 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                                  >
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                      <Building2 className="w-4 h-4 text-indigo-700" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-xs text-gray-500 font-medium">Contacts</span>
                                      <span className="font-semibold text-indigo-700">{contactCount} contacts</span>
                                    </div>
                                  </motion.div>
                                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownloadScope(file)}
                                      className="w-full text-xs gap-2 h-9 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-gray-300 hover:border-blue-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                                    >
                                      <DownloadIcon className="w-3.5 h-3.5" />
                                      Télécharger le scope
                                    </Button>
                                  </motion.div>
                                </div>
                              </td>

                              {/* Notifier */}
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center">
                                  <Switch
                                    checked={file.notify}
                                    onCheckedChange={(checked) => handleUpdateFile(file.id, 'notify', checked)}
                                    className="data-[state=checked]:bg-orange-600"
                                  />
                                </div>
                              </td>

                              {/* Template Email */}
                              <td className="px-4 py-4">
                                {file.notify ? (
                                  <Select
                                    value={file.emailTemplate}
                                    onValueChange={(value) => handleUpdateFile(file.id, 'emailTemplate', value)}
                                  >
                                    <SelectTrigger className="text-xs h-9 bg-white border-blue-200 hover:border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                                      <SelectValue placeholder="Choisir un template..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {availableEmailTemplates.map((template) => (
                                        <SelectItem key={template.value} value={template.value} className="hover:bg-blue-50 cursor-pointer">
                                          <div className="flex items-center gap-2">
                                            <span className="text-base">{template.icon}</span>
                                            <span className="font-medium">{template.label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <div className="flex items-center justify-center h-9">
                                    <span className="text-xs text-gray-400 italic">-</span>
                                  </div>
                                )}
                              </td>

                              {/* Cacher "New" */}
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center">
                                  <Switch
                                    checked={file.hideNewLabel}
                                    onCheckedChange={(checked) => handleUpdateFile(file.id, 'hideNewLabel', checked)}
                                  />
                                </div>
                              </td>

                              {/* Reporting */}
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center">
                                  <Switch
                                    checked={file.reporting}
                                    onCheckedChange={(checked) => handleUpdateFile(file.id, 'reporting', checked)}
                                    className="data-[state=checked]:bg-emerald-600"
                                  />
                                </div>
                              </td>

                              {/* Date d'ajout */}
                              <td className="px-4 py-4">
                                <Input
                                  type="date"
                                  value={file.addDate}
                                  onChange={(e) => handleUpdateFile(file.id, 'addDate', e.target.value)}
                                  className="text-xs border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200 bg-white"
                                />
                              </td>

                              {/* Équipe de validation */}
                              <td className="px-4 py-4">
                                <Select
                                  value={file.validationTeam[0] || ''}
                                  onValueChange={(value) => handleUpdateFile(file.id, 'validationTeam', value ? [value] : [])}
                                >
                                  <SelectTrigger className="text-xs h-9 bg-white border-gray-200 hover:border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all">
                                    <SelectValue placeholder="Sélectionner équipe..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Front">Front</SelectItem>
                                    <SelectItem value="Middle">Middle</SelectItem>
                                    <SelectItem value="Back">Back</SelectItem>
                                    <SelectItem value="Compliance">Compliance</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>

                              {/* Tags */}
                              <td className="px-4 py-4">
                                <div className="space-y-2.5">
                                  <AnimatePresence>
                                    {file.tags.length > 0 && (
                                      <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-wrap gap-1.5"
                                      >
                                        {file.tags.map((tag) => (
                                          <motion.div
                                            key={tag}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            whileHover={{ scale: 1.05 }}
                                          >
                                            <Badge
                                              variant="outline"
                                              className="bg-gradient-to-r from-pink-50 to-rose-50 text-pink-700 border-pink-300 text-[10px] font-medium shadow-sm hover:shadow-md transition-all duration-200 pr-1"
                                            >
                                              <Sparkles className="w-2.5 h-2.5 mr-1" />
                                              {tag}
                                              <motion.button
                                                whileHover={{ scale: 1.2, rotate: 90 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeTag(file.id, tag)}
                                                className="ml-1.5 p-0.5 hover:bg-pink-200 rounded-full transition-colors"
                                              >
                                                <X className="w-2.5 h-2.5" />
                                              </motion.button>
                                            </Badge>
                                          </motion.div>
                                        ))}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                  <Input
                                    placeholder="Ajouter un tag (Entrée)..."
                                    className="text-xs border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all duration-200 bg-white hover:bg-pink-50/30 placeholder:text-gray-400"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        addTag(file.id, (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                      }
                                    }}
                                  />
                                </div>
                              </td>
                            </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer with Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <div className="text-sm">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Annuler
                </Button>
                {isReviewStep && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    <Eye className="w-3 h-3 mr-1" />
                    Revue approfondie: {currentReviewingDocIndex + 1}/{uploadedFiles.length}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handlePrevStep();
                    toast.info(isReviewStep ? 'Document précédent' : 'Étape précédente');
                  }}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isReviewStep ? 'Précédent' : 'Retour'}
                </Button>
              )}

              {currentStep < totalSteps && (
                <Button
                  onClick={() => {
                    if (canGoNext()) {
                      handleNextStep();
                      if (isReviewStep && currentReviewingDocIndex < uploadedFiles.length - 1) {
                        toast.success('Document suivant');
                      } else if (currentStep === 1) {
                        toast.success(deepReview ? 'Début de la revue approfondie' : 'Configuration des documents');
                      } else {
                        toast.success('Validation finale');
                      }
                    } else {
                      toast.error('Action requise', {
                        description: 'Veuillez compléter l\'étape actuelle'
                      });
                    }
                  }}
                  disabled={!canGoNext()}
                  style={{ background: !canGoNext() ? undefined : 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className={`gap-2 ${!canGoNext() ? '' : 'text-white hover:opacity-90'}`}
                >
                  {isReviewStep && currentReviewingDocIndex < uploadedFiles.length - 1 ? 'Document suivant' : 'Suivant'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep === totalSteps && (
                <Button
                  onClick={() => {
                    toast.success('Import lancé !', {
                      description: `${uploadedFiles.length} document(s) en cours d'importation`,
                      duration: 5000
                    });
                    onClose();
                  }}
                  style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className="gap-2 text-white hover:opacity-90"
                >
                  <Upload className="w-4 h-4" />
                  Importer {uploadedFiles.length} document(s)
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MassUploadWizard;
