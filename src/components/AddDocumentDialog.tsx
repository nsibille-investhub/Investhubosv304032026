import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Folder, Upload, Tag, Users, TrendingUp, Building2, Calendar, Droplet, Lock, ChevronRight, ChevronLeft, Check, Info, Sparkles, Languages, FolderOpen, Search, AlertCircle, ChevronsUpDown, Lightbulb, Download, UserCheck, Bell, Eye, FileBarChart, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
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
import { toast } from 'sonner';
import { mockDocuments, Document } from '../utils/documentMockData';

interface AddDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'document' | 'folder';
  parentFolder: string;
}

// Fonction pour extraire tous les dossiers de l'arborescence avec leur niveau
interface FolderItem {
  id: string;
  name: string;
  path: string;
  level: number;
  parentId?: string;
}

const extractAllFolders = (documents: Document[], level: number = 0, folders: FolderItem[] = []): FolderItem[] => {
  documents.forEach(doc => {
    if (doc.type === 'folder') {
      folders.push({
        id: doc.id,
        name: doc.name,
        path: doc.path,
        level: level,
        parentId: doc.parentId,
      });
      if (doc.children && doc.children.length > 0) {
        extractAllFolders(doc.children, level + 1, folders);
      }
    }
  });
  return folders;
};

// Mock languages for selector
const availableLanguages = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

// Mock fonds disponibles
const availableFunds = [
  { value: 'all', label: 'Tous les fonds' },
  { value: 'pere1', label: 'PERE 1' },
  { value: 'pere2', label: 'PERE 2' },
  { value: 'fund-a', label: 'Fonds A - Innovation' },
  { value: 'fund-b', label: 'Fonds B - Tech' },
];

// Mock segments d'investisseurs
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

// Mock équipes de validation
interface ValidationTeam {
  id: string;
  name: string;
  validators: Array<{
    name: string;
    role: string;
  }>;
}

const availableValidationTeams: ValidationTeam[] = [
  {
    id: 'front',
    name: 'Front',
    validators: [
      { name: 'Nicolas SIBILLE', role: 'validateur - allfunds - front' },
    ]
  },
  {
    id: 'middle',
    name: 'Middle Office',
    validators: [
      { name: 'Marie-Claire Denaclara', role: 'validateur - middle' },
      { name: 'Sophie Martin', role: 'validateur - middle' },
    ]
  },
  {
    id: 'back',
    name: 'Back Office',
    validators: [
      { name: 'Jean Dault', role: 'validateur - back' },
      { name: 'Thomas Bernard', role: 'validateur - back' },
      { name: 'Guillaume Didierjean', role: 'validateur - back' },
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance',
    validators: [
      { name: 'Patricia Leblanc', role: 'compliance officer' },
      { name: 'François Mercier', role: 'compliance analyst' },
    ]
  },
];

// Mock investisseurs avec leurs contacts
interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Investor {
  id: string;
  name: string;
  email: string;
  segment: string;
  fund: string;
  contacts: Contact[];
}

const availableInvestors: Investor[] = [
  { 
    id: 'inv-1', 
    name: 'Jean Dupont', 
    email: 'jean.dupont@example.com',
    segment: 'Investisseurs Qualifiés',
    fund: 'pere1',
    contacts: [
      { id: 'c1-1', name: 'Maître Leblanc', email: 'leblanc@legal.com', role: 'Conseil Juridique' },
      { id: 'c1-2', name: 'Antoine Mercier', email: 'mercier@audit.fr', role: 'Expert Comptable' },
    ]
  },
  { 
    id: 'inv-2', 
    name: 'Marie Martin', 
    email: 'marie.martin@example.com',
    segment: 'Family Offices',
    fund: 'pere1',
    contacts: [
      { id: 'c2-1', name: 'Claire Dubois', email: 'claire@family-office.com', role: 'Family Office' },
      { id: 'c2-2', name: 'Jean Rousseau', email: 'rousseau@fiscalite.fr', role: 'Conseil Fiscal' },
      { id: 'c2-3', name: 'Marc Vincent', email: 'vincent@patrimoine.fr', role: 'Gestionnaire de Patrimoine' },
    ]
  },
  { 
    id: 'inv-3', 
    name: 'Pierre Durand', 
    email: 'pierre.durand@example.com',
    segment: 'Comité Stratégique',
    fund: 'pere2',
    contacts: [
      { id: 'c3-1', name: 'Sophie Lambert', email: 'lambert@legal.com', role: 'Représentant Légal' },
    ]
  },
  { 
    id: 'inv-4', 
    name: 'Sophie Bernard', 
    email: 'sophie.bernard@example.com',
    segment: 'Institutionnels',
    fund: 'fund-a',
    contacts: [
      { id: 'c4-1', name: 'Paul Girard', email: 'girard@bank.fr', role: 'Partenaire Bancaire' },
      { id: 'c4-2', name: 'Lucie Fontaine', email: 'fontaine@compliance.com', role: 'Compliance Officer' },
      { id: 'c4-3', name: 'Michel Roux', email: 'roux@trust.com', role: 'Trustee' },
    ]
  },
  { 
    id: 'inv-5', 
    name: 'Thomas Petit', 
    email: 'thomas.petit@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'fund-b',
    contacts: [
      { id: 'c5-1', name: 'Émilie Moreau', email: 'moreau@wealth.com', role: 'Gestionnaire de Patrimoine' },
      { id: 'c5-2', name: 'David Laurent', email: 'laurent@legal.fr', role: 'Conseil Juridique' },
    ]
  },
  { 
    id: 'inv-6', 
    name: 'Julie Dubois', 
    email: 'julie.dubois@example.com',
    segment: 'Corporate Investors',
    fund: 'pere1',
    contacts: [
      { id: 'c6-1', name: 'François Petit', email: 'petit@corporate.com', role: 'Administrateur' },
      { id: 'c6-2', name: 'Isabelle Blanc', email: 'blanc@audit.com', role: 'Auditeur' },
    ]
  },
  { 
    id: 'inv-7', 
    name: 'Charles de Montfort', 
    email: 'charles.montfort@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'pere1',
    contacts: [
      { id: 'c7-1', name: 'Valérie Deschamps', email: 'deschamps@wealth.fr', role: 'Gestionnaire de Patrimoine' },
      { id: 'c7-2', name: 'Philippe Arnaud', email: 'arnaud@fiscal.com', role: 'Conseil Fiscal' },
      { id: 'c7-3', name: 'Sandrine Roussel', email: 'roussel@legal.fr', role: 'Conseil Juridique' },
    ]
  },
  { 
    id: 'inv-8', 
    name: 'Nathalie Beaumont', 
    email: 'nathalie.beaumont@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'pere2',
    contacts: [
      { id: 'c8-1', name: 'Olivier Blanchard', email: 'blanchard@family-office.com', role: 'Family Office' },
      { id: 'c8-2', name: 'Caroline Mercier', email: 'mercier@patrimoine.com', role: 'Gestionnaire de Patrimoine' },
    ]
  },
  { 
    id: 'inv-9', 
    name: 'Alexandre Fontaine', 
    email: 'alexandre.fontaine@example.com',
    segment: 'HNWI (High Net Worth)',
    fund: 'fund-a',
    contacts: [
      { id: 'c9-1', name: 'Martine Leroy', email: 'leroy@trust.com', role: 'Trustee' },
      { id: 'c9-2', name: 'Laurent Gauthier', email: 'gauthier@legal.fr', role: 'Conseil Juridique' },
      { id: 'c9-3', name: 'Sylvie Renard', email: 'renard@compliance.com', role: 'Compliance Officer' },
    ]
  },
];

// Mock souscriptions
const availableSubscriptions = [
  { id: 'sub-1', name: 'SOUSCRIPTION-2024-001', investor: 'Jean Dupont', investorId: 'inv-1', amount: '50,000 €' },
  { id: 'sub-2', name: 'SOUSCRIPTION-2024-002', investor: 'Marie Martin', investorId: 'inv-2', amount: '100,000 €' },
  { id: 'sub-3', name: 'SOUSCRIPTION-2024-003', investor: 'Pierre Durand', investorId: 'inv-3', amount: '75,000 €' },
  { id: 'sub-4', name: 'SOUSCRIPTION-2024-004', investor: 'Sophie Bernard', investorId: 'inv-4', amount: '200,000 €' },
  { id: 'sub-5', name: 'SOUSCRIPTION-2024-005', investor: 'Thomas Petit', investorId: 'inv-5', amount: '150,000 €' },
];

// Mock rôles de contacts pour portail institutionnel
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

export function AddDocumentDialog({ isOpen, onClose, type, parentFolder }: AddDocumentDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    targetType: 'all',
    targetSegments: [] as string[],
    targetInvestors: [] as string[],
    watermark: false,
    accessRoles: [] as string[], // Rôles de contacts ayant accès
    tags: [] as string[],
    segment: '',
    fund: '',
    disclaimer: 'none',
    // Nouvelles options avancées
    notifyOnUpload: false,
    emailTemplate: 'none',
    hideNewLabel: false,
    reporting: false,
    customUploadDate: new Date().toISOString().split('T')[0],
    // Validation
    validationTeam: '',
  });

  const [currentTag, setCurrentTag] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [restrictToLanguage, setRestrictToLanguage] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(parentFolder);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraire tous les dossiers de l'arborescence
  const availableFolders = extractAllFolders(mockDocuments);

  // Trouver le dossier parent sélectionné pour afficher son ciblage
  const getParentFolderInfo = (): Document | null => {
    const findFolder = (folders: Document[]): Document | null => {
      for (const folder of folders) {
        if (folder.path === selectedFolder) return folder;
        if (folder.children) {
          const found = findFolder(folder.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findFolder(mockDocuments);
  };

  const parentFolderInfo = getParentFolderInfo();

  // Calculer le scope des personnes ciblées
  const calculateTargetScope = (): { investors: Investor[], isEmpty: boolean, emptyReason?: string } => {
    let targetedInvestors: Investor[] = [];
    
    // 1. Déterminer les investisseurs ciblés selon le type
    if (formData.targetType === 'all') {
      // Tous les investisseurs
      targetedInvestors = [...availableInvestors];
      
      // Filtrer par segments si spécifiés
      if (formData.targetSegments.length > 0) {
        targetedInvestors = targetedInvestors.filter(inv => 
          formData.targetSegments.includes(inv.segment)
        );
      }
    } else if (formData.targetType === 'investors') {
      // Investisseurs spécifiques sélectionnés
      if (formData.targetInvestors.length === 0) {
        return { investors: [], isEmpty: true, emptyReason: 'Aucun investisseur sélectionné' };
      }
      targetedInvestors = availableInvestors.filter(inv => 
        formData.targetInvestors.includes(inv.id)
      );
    } else if (formData.targetType === 'subscriptions') {
      // Investisseurs des souscriptions sélectionnées
      if (formData.targetInvestors.length === 0) {
        return { investors: [], isEmpty: true, emptyReason: 'Aucune souscription sélectionnée' };
      }
      const investorIds = availableSubscriptions
        .filter(sub => formData.targetInvestors.includes(sub.id))
        .map(sub => sub.investorId);
      targetedInvestors = availableInvestors.filter(inv => 
        investorIds.includes(inv.id)
      );
    } else if (formData.targetType === 'funds') {
      // Investisseurs des fonds sélectionnés
      if (formData.targetInvestors.length === 0) {
        return { investors: [], isEmpty: true, emptyReason: 'Aucun fonds sélectionné' };
      }
      targetedInvestors = availableInvestors.filter(inv => 
        formData.targetInvestors.includes(inv.fund)
      );
    }
    
    // 2. Appliquer le filtre du fonds (pour les dossiers)
    if (type === 'folder' && formData.fund && formData.fund !== 'all') {
      targetedInvestors = targetedInvestors.filter(inv => inv.fund === formData.fund);
    }
    
    // 3. Appliquer le filtre du fonds hérité du parent
    if (parentFolderInfo?.metadata?.fund && parentFolderInfo.metadata.fund !== 'all') {
      const parentFundValue = parentFolderInfo.metadata.fund === 'PERE 1' ? 'pere1' : 
                               parentFolderInfo.metadata.fund === 'PERE 2' ? 'pere2' : 
                               parentFolderInfo.metadata.fund.toLowerCase().replace(' ', '-');
      targetedInvestors = targetedInvestors.filter(inv => inv.fund === parentFundValue);
    }
    
    // 4. Appliquer le filtre des segments hérités du parent (target ou metadata)
    const parentSegments = parentFolderInfo?.metadata?.segments || parentFolderInfo?.target?.segments || [];
    if (parentSegments.length > 0) {
      targetedInvestors = targetedInvestors.filter(inv => 
        parentSegments.includes(inv.segment)
      );
    }
    
    // 5. Filtrer les contacts selon les rôles autorisés
    if (formData.accessRoles.length > 0) {
      targetedInvestors = targetedInvestors.map(inv => ({
        ...inv,
        contacts: inv.contacts.filter(contact => 
          formData.accessRoles.includes(contact.role)
        )
      }));
    }
    
    // Vérifier si le scope est vide après tous les filtres
    if (targetedInvestors.length === 0) {
      return { 
        investors: [], 
        isEmpty: true, 
        emptyReason: 'Aucun investisseur ne correspond aux critères de ciblage. Les règles de ciblage sont mutuellement exclusives ou incompatibles avec le dossier parent.' 
      };
    }
    
    return { investors: targetedInvestors, isEmpty: false };
  };

  const targetScope = calculateTargetScope();

  // Reset step when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setCurrentStep(1);
        setUploadedFile(null);
        setIsProcessingAI(false);
        setSelectedLanguage('fr');
        setRestrictToLanguage(false);
        setSelectedFolder(parentFolder);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSelectedFolder(parentFolder);
    }
  }, [isOpen, parentFolder]);

  // Simulate AI document processing
  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsProcessingAI(true);

    toast.info('Analyse IA en cours...', {
      description: 'Extraction des informations du document',
    });

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI-extracted data based on file name
    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
    
    // Simulate intelligent extraction
    const mockExtractedData = {
      name: fileName,
      description: `Document automatiquement analysé : ${fileName}. Ce document contient des informations importantes relatives aux activités de l'entreprise.`,
      targetType: fileName.toLowerCase().includes('investor') ? 'investors' : 
                   fileName.toLowerCase().includes('legal') ? 'all' : 'investors',
      targetInvestors: fileName.toLowerCase().includes('investor') || !fileName.toLowerCase().includes('legal') 
        ? ['inv-3'] // Pierre Durand sélectionné par défaut
        : [],
      segment: fileName.toLowerCase().includes('premium') ? 'Premium' : '',
      fund: fileName.toLowerCase().includes('pere') ? 'pere1' : '',
      tags: [
        fileName.toLowerCase().includes('rapport') ? 'Rapport' : '',
        fileName.toLowerCase().includes('financial') || fileName.toLowerCase().includes('financier') ? 'Financier' : '',
        fileName.toLowerCase().includes('legal') ? 'Légal' : '',
      ].filter(Boolean),
    };

    setFormData(prev => ({
      ...prev,
      name: mockExtractedData.name,
      description: mockExtractedData.description,
      targetType: mockExtractedData.targetType,
      targetInvestors: mockExtractedData.targetInvestors,
      segment: mockExtractedData.segment,
      fund: mockExtractedData.fund,
      tags: mockExtractedData.tags,
    }));

    setIsProcessingAI(false);

    toast.success('Analyse terminée !', {
      description: 'Les champs ont été pré-remplis automatiquement',
      duration: 5000,
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const steps = [
    { 
      number: 1, 
      title: 'Informations', 
      description: 'Détails de base',
      icon: Info
    },
    { 
      number: 2, 
      title: 'Ciblage & Accès', 
      description: 'Permissions et visibilité',
      icon: Lock
    },
    { 
      number: 3, 
      title: 'Finalisation', 
      description: 'Tags et fichier',
      icon: Upload
    },
  ];

  // Export du scope en CSV
  const handleExportTargetScope = () => {
    if (targetScope.isEmpty || targetScope.investors.length === 0) {
      toast.error('Impossible d\'exporter', {
        description: 'Le scope de ciblage est vide'
      });
      return;
    }

    // Préparer les données CSV
    const csvRows: string[] = [];
    
    // Header
    csvRows.push('Investisseur,Email,Segment,Fonds,Contact,Email Contact,Rôle Contact');
    
    // Données
    targetScope.investors.forEach(investor => {
      if (investor.contacts.length > 0) {
        investor.contacts.forEach(contact => {
          csvRows.push(
            `"${investor.name}","${investor.email}","${investor.segment}","${investor.fund}","${contact.name}","${contact.email}","${contact.role}"`
          );
        });
      } else {
        // Investisseur sans contacts
        csvRows.push(
          `"${investor.name}","${investor.email}","${investor.segment}","${investor.fund}","","",""`
        );
      }
    });
    
    // Créer le blob et télécharger
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scope-ciblage-${formData.name || 'document'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Scope exporté', {
      description: `${targetScope.investors.length} investisseurs et ${targetScope.investors.reduce((sum, inv) => sum + inv.contacts.length, 0)} contacts exportés`
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Erreur', {
        description: 'Le nom est obligatoire'
      });
      return;
    }

    if (!formData.validationTeam) {
      toast.error('Erreur', {
        description: 'Une équipe de validation doit être sélectionnée'
      });
      return;
    }

    const folderPath = availableFolders.find(f => f.path === selectedFolder)?.path || selectedFolder;
    const languageInfo = type === 'document' 
      ? ` • Langue: ${availableLanguages.find(l => l.value === selectedLanguage)?.label}${restrictToLanguage ? ' (restreint)' : ''}`
      : '';
    
    toast.success(`${type === 'document' ? 'Document' : 'Dossier'} créé avec succès !`, {
      description: `"${formData.name}" dans "${folderPath}"${languageInfo}`,
      duration: 5000,
    });

    onClose();
    // Reset form
    setFormData({
      name: '',
      description: '',
      status: 'draft',
      targetType: 'all',
      targetSegments: [],
      targetInvestors: [],
      watermark: false,
      accessRoles: [],
      tags: [],
      segment: '',
      fund: '',
      disclaimer: 'none',
      notifyOnUpload: false,
      hideNewLabel: false,
      reporting: false,
      customUploadDate: '',
      validationTeam: '',
    });
    setUploadedFile(null);
    setSelectedLanguage('fr');
    setRestrictToLanguage(false);
    setSelectedFolder(parentFolder);
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return true; // All fields are optional
      case 3:
        return true; // All fields are optional
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header with Stepper */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white via-blue-50/20 to-indigo-50/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                  type === 'document' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                    : 'bg-gradient-to-br from-amber-500 to-amber-600'
                }`}>
                  {type === 'document' ? (
                    <FileText className="w-5 h-5 text-white" />
                  ) : (
                    <Folder className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {type === 'document' ? 'Nouveau Document' : 'Nouveau Dossier'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Dans {selectedFolder}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            {/* Stepper */}
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex items-center gap-2 flex-1">
                      {/* Step Circle */}
                      <motion.div
                        initial={false}
                        animate={{
                          scale: isActive ? 1.05 : 1,
                          backgroundColor: isCompleted 
                            ? '#10B981' 
                            : isActive 
                            ? '#0066FF' 
                            : '#F1F5F9'
                        }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center justify-center w-8 h-8 rounded-lg border-2 transition-all ${
                          isCompleted
                            ? 'border-emerald-500 shadow-sm shadow-emerald-500/30'
                            : isActive
                            ? 'border-blue-500 shadow-sm shadow-blue-500/30'
                            : 'border-gray-300'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <StepIcon className={`w-4 h-4 ${
                            isActive ? 'text-white' : 'text-gray-400'
                          }`} />
                        )}
                      </motion.div>
                      
                      {/* Step Info */}
                      <div className="hidden sm:block flex-1 min-w-0">
                        <div className={`text-xs font-semibold truncate ${
                          isActive ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Connector Line */}
                    {idx < steps.length - 1 && (
                      <div className="w-8 sm:w-12 h-0.5 mx-1 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: currentStep > step.number ? '100%' : '0%' }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Informations de base */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Informations de base
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {type === 'document' ? 'Uploadez votre document ou saisissez les informations manuellement' : 'Commencez par les informations essentielles'}
                    </p>
                  </div>

              {/* AI-Powered Document Upload - Only for documents */}
              {type === 'document' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Upload intelligent
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  {!uploadedFile ? (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 transition-all cursor-pointer group overflow-hidden"
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
                          Cliquez pour uploader votre document
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5 justify-center">
                          <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                          L'IA va pré-remplir automatiquement les champs
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PowerPoint (max. 50MB)</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {isProcessingAI && (
                            <div className="mt-2 flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles className="w-4 h-4 text-purple-600" />
                              </motion.div>
                              <span className="text-xs text-purple-700 font-medium">
                                Analyse IA en cours...
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUploadedFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {uploadedFile && !isProcessingAI && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm text-emerald-800 font-medium">
                          Analyse terminée ! Les champs ont été pré-remplis
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Folder Selection with Autocomplete */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-amber-600" />
                  Dossier parent
                </Label>
                <Popover open={folderPickerOpen} onOpenChange={setFolderPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={folderPickerOpen}
                      className="w-full justify-between mt-1.5 h-auto min-h-[42px]"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {(() => {
                          const folder = availableFolders.find(f => f.path === selectedFolder);
                          const isRoot = folder?.id === 'root';
                          return (
                            <>
                              <Folder className={`w-4 h-4 flex-shrink-0 ${isRoot ? 'text-blue-600' : 'text-amber-600'}`} />
                              <span className={`truncate ${isRoot ? 'text-blue-600 font-medium' : ''}`}>
                                {folder?.path || selectedFolder}
                              </span>
                            </>
                          );
                        })()}
                      </span>
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un dossier..." />
                      <CommandList className="max-h-[300px]">
                        <CommandEmpty>Aucun dossier trouvé.</CommandEmpty>
                        <CommandGroup heading="Arborescence des dossiers">
                          {availableFolders.map((folder) => {
                            const isRoot = folder.id === 'root';
                            const isSelected = selectedFolder === folder.path;
                            
                            return (
                              <CommandItem
                                key={folder.id}
                                value={`${folder.path} ${folder.name}`} // Pour la recherche
                                onSelect={() => {
                                  setSelectedFolder(folder.path);
                                  setFolderPickerOpen(false);
                                  toast.success('Dossier sélectionné', {
                                    description: folder.path,
                                  });
                                }}
                                className="cursor-pointer py-2.5"
                              >
                                <div 
                                  className="flex items-center gap-2 w-full"
                                  style={{ paddingLeft: `${folder.level * 20}px` }}
                                >
                                  {/* Folder Icon */}
                                  <Folder className={`w-4 h-4 flex-shrink-0 ${
                                    isRoot 
                                      ? 'text-blue-600' 
                                      : 'text-amber-600'
                                  }`} />
                                  
                                  {/* Folder Name */}
                                  <span className={`flex-1 truncate text-sm ${
                                    isRoot 
                                      ? 'text-blue-600 font-medium' 
                                      : 'text-gray-900'
                                  }`}>
                                    {folder.name}
                                  </span>
                                  
                                  {/* Path hint for nested folders */}
                                  {!isRoot && folder.level > 0 && (
                                    <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                      {folder.path}
                                    </span>
                                  )}
                                  
                                  {/* Check icon if selected */}
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  )}
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1.5">
                  Le {type === 'document' ? 'document' : 'dossier'} sera créé dans ce dossier
                </p>
              </div>

              {/* Language Selection - Only for documents */}
              {type === 'document' && (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Languages className="w-4 h-4 text-blue-600" />
                    Langue du document
                  </div>
                  
                  <div>
                    <Label htmlFor="language">Langue</Label>
                    <Select 
                      value={selectedLanguage} 
                      onValueChange={(value) => setSelectedLanguage(value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center gap-2">
                              <span className="text-base">{lang.flag}</span>
                              <span>{lang.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center h-5">
                      <Switch
                        id="restrictLanguage"
                        checked={restrictToLanguage}
                        onCheckedChange={setRestrictToLanguage}
                      />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="restrictLanguage" className="cursor-pointer text-sm font-medium text-gray-900">
                        Restreindre l'accès aux utilisateurs de cette langue
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        Seuls les utilisateurs ayant {availableLanguages.find(l => l.value === selectedLanguage)?.label} comme langue préférée pourront voir ce document
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="pt-4 border-t border-gray-100" />

              <div>
                <Label htmlFor="name">Nom {uploadedFile && !isProcessingAI && (
                  <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                    Pré-rempli par IA
                  </Badge>
                )} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={type === 'document' ? 'Nom du document...' : 'Nom du dossier...'}
                  className="mt-1.5"
                  disabled={isProcessingAI}
                />
              </div>

              <div>
                <Label htmlFor="description">Description {uploadedFile && !isProcessingAI && (
                  <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                    Pré-rempli par IA
                  </Badge>
                )}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ajoutez une description..."
                  className="mt-1.5 min-h-[80px]"
                  disabled={isProcessingAI}
                />
              </div>

              <div>
                <Label htmlFor="status">Statut</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  disabled={isProcessingAI}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        Brouillon
                      </div>
                    </SelectItem>
                    <SelectItem value="published">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Publié
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}

          {/* Step 2: Ciblage & Permissions */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Ciblage & Permissions
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Définissez qui peut accéder à ce contenu
                </p>
              </div>

              {/* Encart informatif du ciblage du dossier parent - TOUJOURS affiché */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6"
              >
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Contexte du dossier parent
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <FolderOpen className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <p className="text-xs text-blue-700">
                          {parentFolderInfo?.path 
                            ? parentFolderInfo.path === '/' 
                              ? 'Racine' 
                              : parentFolderInfo.path.substring(1).replace(/\//g, ' / ')
                            : 'Dossier parent'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      {/* Fonds du parent */}
                      {parentFolderInfo?.metadata?.fund ? (
                        <div className="flex items-center gap-2 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-blue-700">
                            Fonds: <span className="font-medium">{parentFolderInfo.metadata.fund}</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-blue-700">
                            Fonds: <span className="font-medium">Tous les fonds</span>
                          </span>
                        </div>
                      )}
                      
                      {/* Segments du parent */}
                      {(() => {
                        const parentSegments = parentFolderInfo?.target?.segments || parentFolderInfo?.metadata?.segments || [];
                        return parentSegments.length > 0 ? (
                          <div className="flex items-start gap-2 text-xs">
                            <Users className="w-3.5 h-3.5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-blue-700">Segments ciblés: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {parentSegments.map((segment, idx) => (
                                  <Badge key={idx} className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                    {segment}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-blue-700">
                              Segments ciblés: <span className="font-medium">Tous les segments</span>
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="pt-2 border-t border-blue-200">
                      <div className="flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <p className="text-xs text-blue-800 font-medium">
                          Le document hérite de ces restrictions
                        </p>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        Assurez-vous que vos règles de ciblage et permissions sont compatibles avec celles du dossier parent pour éviter les conflits d'accès.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Targeting */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 text-blue-600" />
                  Ciblage du {type === 'document' ? 'document' : 'dossier'}
                </div>

                {/* Type de ciblage */}
                <div>
                  <Label htmlFor="targetType">Type de ciblage {uploadedFile && !isProcessingAI && formData.targetType !== 'all' && (
                    <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                      Pré-rempli par IA
                    </Badge>
                  )}</Label>
                  <Select 
                    value={formData.targetType} 
                    onValueChange={(value) => {
                      setFormData(prev => ({ 
                        ...prev, 
                        targetType: value,
                        targetSegments: [],
                        targetInvestors: []
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Tous
                        </div>
                      </SelectItem>
                      <SelectItem value="investors">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5" />
                          Investisseurs
                        </div>
                      </SelectItem>
                      <SelectItem value="subscriptions">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" />
                          Souscriptions
                        </div>
                      </SelectItem>
                      <SelectItem value="funds">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" />
                          Fonds
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dropdown conditionnelle selon le type */}
                <AnimatePresence mode="wait">
                  {/* Si "Tous" -> Sélection de segments */}
                  {formData.targetType === 'all' && (
                    <motion.div
                      key="segments-selector"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label>Segments d'investisseurs (optionnel)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between mt-1.5 h-auto min-h-[42px]"
                          >
                            <span className="flex items-center gap-2 flex-1 text-left">
                              {formData.targetSegments.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {formData.targetSegments.map((segment, idx) => (
                                    <Badge key={idx} className="bg-blue-50 text-blue-700 border-blue-300">
                                      {segment}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-500">Sélectionner des segments...</span>
                              )}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher un segment..." />
                            <CommandList>
                              <CommandEmpty>Aucun segment trouvé.</CommandEmpty>
                              <CommandGroup>
                                {availableSegments.map((segment) => {
                                  const isSelected = formData.targetSegments.includes(segment);
                                  return (
                                    <CommandItem
                                      key={segment}
                                      value={segment}
                                      onSelect={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          targetSegments: isSelected
                                            ? prev.targetSegments.filter(s => s !== segment)
                                            : [...prev.targetSegments, segment]
                                        }));
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                          isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                                        }`}>
                                          {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="flex-1">{segment}</span>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Laissez vide pour cibler tous les segments
                      </p>
                    </motion.div>
                  )}

                  {/* Si "Investisseurs" -> Sélection d'investisseurs */}
                  {formData.targetType === 'investors' && (
                    <motion.div
                      key="investors-selector"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label>Investisseurs {uploadedFile && !isProcessingAI && formData.targetInvestors.length > 0 && (
                        <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                          Pré-rempli par IA
                        </Badge>
                      )}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between mt-1.5 h-auto min-h-[42px]"
                          >
                            <span className="flex items-center gap-2 flex-1 text-left">
                              {formData.targetInvestors.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {formData.targetInvestors.slice(0, 3).map((invId, idx) => {
                                    const investor = availableInvestors.find(i => i.id === invId);
                                    return (
                                      <Badge key={idx} className="bg-emerald-50 text-emerald-700 border-emerald-300">
                                        {investor?.name}
                                      </Badge>
                                    );
                                  })}
                                  {formData.targetInvestors.length > 3 && (
                                    <Badge className="bg-gray-100 text-gray-700">
                                      +{formData.targetInvestors.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">Sélectionner des investisseurs...</span>
                              )}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[450px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher un investisseur..." />
                            <CommandList>
                              <CommandEmpty>Aucun investisseur trouvé.</CommandEmpty>
                              <CommandGroup>
                                {availableInvestors.map((investor) => {
                                  const isSelected = formData.targetInvestors.includes(investor.id);
                                  return (
                                    <CommandItem
                                      key={investor.id}
                                      value={`${investor.name} ${investor.email}`}
                                      onSelect={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          targetInvestors: isSelected
                                            ? prev.targetInvestors.filter(id => id !== investor.id)
                                            : [...prev.targetInvestors, investor.id]
                                        }));
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                          isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'
                                        }`}>
                                          {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{investor.name}</p>
                                          <p className="text-xs text-gray-500">{investor.email}</p>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Sélectionnez un ou plusieurs investisseurs spécifiques
                      </p>
                    </motion.div>
                  )}

                  {/* Si "Souscriptions" -> Sélection de souscriptions */}
                  {formData.targetType === 'subscriptions' && (
                    <motion.div
                      key="subscriptions-selector"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label>Souscriptions</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between mt-1.5 h-auto min-h-[42px]"
                          >
                            <span className="flex items-center gap-2 flex-1 text-left">
                              {formData.targetInvestors.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {formData.targetInvestors.slice(0, 2).map((subId, idx) => {
                                    const subscription = availableSubscriptions.find(s => s.id === subId);
                                    return (
                                      <Badge key={idx} className="bg-purple-50 text-purple-700 border-purple-300">
                                        {subscription?.name}
                                      </Badge>
                                    );
                                  })}
                                  {formData.targetInvestors.length > 2 && (
                                    <Badge className="bg-gray-100 text-gray-700">
                                      +{formData.targetInvestors.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">Sélectionner des souscriptions...</span>
                              )}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[500px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher une souscription..." />
                            <CommandList>
                              <CommandEmpty>Aucune souscription trouvée.</CommandEmpty>
                              <CommandGroup>
                                {availableSubscriptions.map((subscription) => {
                                  const isSelected = formData.targetInvestors.includes(subscription.id);
                                  return (
                                    <CommandItem
                                      key={subscription.id}
                                      value={`${subscription.name} ${subscription.investor}`}
                                      onSelect={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          targetInvestors: isSelected
                                            ? prev.targetInvestors.filter(id => id !== subscription.id)
                                            : [...prev.targetInvestors, subscription.id]
                                        }));
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                          isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                                        }`}>
                                          {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{subscription.name}</p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-gray-500">{subscription.investor}</p>
                                            <span className="text-xs text-gray-300">•</span>
                                            <p className="text-xs text-gray-500">{subscription.amount}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Sélectionnez une ou plusieurs souscriptions spécifiques
                      </p>
                    </motion.div>
                  )}

                  {/* Si "Fonds" -> Sélection de fonds */}
                  {formData.targetType === 'funds' && (
                    <motion.div
                      key="funds-selector"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Label>Fonds</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between mt-1.5 h-auto min-h-[42px]"
                          >
                            <span className="flex items-center gap-2 flex-1 text-left">
                              {formData.targetInvestors.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {formData.targetInvestors.slice(0, 3).map((fundValue, idx) => {
                                    const fund = availableFunds.find(f => f.value === fundValue);
                                    return (
                                      <Badge key={idx} className="bg-amber-50 text-amber-700 border-amber-300">
                                        {fund?.label || fundValue}
                                      </Badge>
                                    );
                                  })}
                                  {formData.targetInvestors.length > 3 && (
                                    <Badge className="bg-gray-100 text-gray-700">
                                      +{formData.targetInvestors.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">Sélectionner des fonds...</span>
                              )}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Rechercher un fonds..." />
                            <CommandList>
                              <CommandEmpty>Aucun fonds trouvé.</CommandEmpty>
                              <CommandGroup>
                                {availableFunds.filter(f => f.value !== 'all').map((fund) => {
                                  const isSelected = formData.targetInvestors.includes(fund.value);
                                  return (
                                    <CommandItem
                                      key={fund.value}
                                      value={fund.label}
                                      onSelect={() => {
                                        setFormData(prev => ({
                                          ...prev,
                                          targetInvestors: isSelected
                                            ? prev.targetInvestors.filter(v => v !== fund.value)
                                            : [...prev.targetInvestors, fund.value]
                                        }));
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                          isSelected ? 'bg-amber-600 border-amber-600' : 'border-gray-300'
                                        }`}>
                                          {isSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <div className="flex items-center gap-2 flex-1">
                                          <Building2 className="w-4 h-4 text-amber-600" />
                                          <span>{fund.label}</span>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Sélectionnez un ou plusieurs fonds spécifiques
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sélection du fonds (pour les dossiers uniquement) */}
                {type === 'folder' && (
                  <div>
                    <Label htmlFor="fund">Fonds {uploadedFile && !isProcessingAI && formData.fund && (
                      <Badge className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                        Pré-rempli par IA
                      </Badge>
                    )}</Label>
                    <Select 
                      value={formData.fund} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, fund: value }))}
                    >
                      <SelectTrigger id="fund" className="mt-1.5">
                        <SelectValue placeholder="Sélectionner un fonds" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFunds.map(fund => (
                          <SelectItem key={fund.value} value={fund.value}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5" />
                              {fund.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Disclaimer (pour les dossiers uniquement) */}
                {type === 'folder' && (
                  <div>
                    <Label htmlFor="disclaimer">Disclaimer</Label>
                    <Select 
                      value={formData.disclaimer} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, disclaimer: value }))}
                    >
                      <SelectTrigger id="disclaimer" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="confidential">Confidentiel</SelectItem>
                        <SelectItem value="restricted">Restreint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

            {/* Access & Permissions */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4 text-purple-600" />
                Permissions
              </div>

              {/* Rôles de contacts autorisés */}
              <div>
                <Label>Rôles de contacts autorisés</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between mt-1.5 h-auto min-h-[42px]"
                    >
                      <span className="flex items-center gap-2 flex-1 text-left">
                        {formData.accessRoles.length === 0 ? (
                          <span className="text-gray-900">Tous les rôles</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {formData.accessRoles.slice(0, 3).map((role, idx) => (
                              <Badge key={idx} className="bg-purple-50 text-purple-700 border-purple-300">
                                {role}
                              </Badge>
                            ))}
                            {formData.accessRoles.length > 3 && (
                              <Badge className="bg-gray-100 text-gray-700">
                                +{formData.accessRoles.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[450px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un rôle..." />
                      <CommandList>
                        <CommandEmpty>Aucun rôle trouvé.</CommandEmpty>
                        <CommandGroup>
                          {/* Option "Tous les rôles" */}
                          <CommandItem
                            value="all-roles"
                            onSelect={() => {
                              setFormData(prev => ({
                                ...prev,
                                accessRoles: []
                              }));
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                formData.accessRoles.length === 0 ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                              }`}>
                                {formData.accessRoles.length === 0 && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">Tous les rôles</p>
                                <p className="text-xs text-gray-500">Accessible par tous les types de contacts</p>
                              </div>
                            </div>
                          </CommandItem>

                          {/* Séparateur */}
                          <div className="my-2 border-t border-gray-200" />

                          {/* Liste des rôles spécifiques */}
                          {availableContactRoles.map((role) => {
                            const isSelected = formData.accessRoles.includes(role);
                            return (
                              <CommandItem
                                key={role}
                                value={role}
                                onSelect={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    accessRoles: isSelected
                                      ? prev.accessRoles.filter(r => r !== role)
                                      : [...prev.accessRoles, role]
                                  }));
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <div className={`w-4 h-4 border rounded flex items-center justify-center ${
                                    isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="flex-1">{role}</span>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-1.5">
                  Laissez vide pour autoriser tous les rôles
                </p>
              </div>
            </div>

            {/* Preview du scope des personnes ciblées */}
            <div className="space-y-3 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">Scope des personnes ciblées</h4>
                {!targetScope.isEmpty && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    {targetScope.investors.length} investisseur{targetScope.investors.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-gray-600">
                Aperçu des personnes qui auront accès à ce {type === 'document' ? 'document' : 'dossier'} selon vos critères de ciblage
              </p>

              {targetScope.isEmpty ? (
                /* Scope vide - règles incompatibles */
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-900 mb-1">Scope vide</p>
                      <p className="text-sm text-amber-700">
                        {targetScope.emptyReason}
                      </p>
                      <p className="text-xs text-amber-600 mt-2">
                        Vérifiez que vos règles de ciblage sont compatibles entre elles et avec le dossier parent.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Liste des investisseurs et leurs contacts */
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {targetScope.investors.map((investor) => (
                    <div 
                      key={investor.id}
                      className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg"
                    >
                      {/* Investisseur */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">
                                {investor.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-emerald-900">{investor.name}</p>
                              <p className="text-xs text-emerald-700">{investor.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                              <Building2 className="w-3 h-3 mr-1" />
                              {availableFunds.find(f => f.value === investor.fund)?.label || investor.fund}
                            </Badge>
                            <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs">
                              <Users className="w-3 h-3 mr-1" />
                              {investor.segment}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Contacts rattachés */}
                      {investor.contacts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-emerald-200">
                          <p className="text-xs font-medium text-emerald-800 mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            Contacts rattachés ({investor.contacts.length})
                          </p>
                          <div className="space-y-1.5">
                            {investor.contacts.map((contact) => (
                              <div 
                                key={contact.id}
                                className="flex items-center justify-between p-2 bg-white/60 rounded border border-emerald-100"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                                  <p className="text-xs text-gray-600">{contact.email}</p>
                                </div>
                                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                  {contact.role}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {formData.accessRoles.length > 0 && investor.contacts.length === 0 && (
                        <div className="mt-3 pt-3 border-t border-emerald-200">
                          <p className="text-xs text-amber-700 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Aucun contact avec les rôles autorisés
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {!targetScope.isEmpty && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Récapitulatif du scope :</p>
                      <ul className="space-y-0.5 list-disc list-inside">
                        <li>{targetScope.investors.length} investisseur{targetScope.investors.length > 1 ? 's' : ''} ciblé{targetScope.investors.length > 1 ? 's' : ''}</li>
                        <li>{targetScope.investors.reduce((sum, inv) => sum + inv.contacts.length, 0)} contact{targetScope.investors.reduce((sum, inv) => sum + inv.contacts.length, 0) > 1 ? 's' : ''} rattaché{targetScope.investors.reduce((sum, inv) => sum + inv.contacts.length, 0) > 1 ? 's' : ''}</li>
                        {formData.accessRoles.length > 0 && (
                          <li>Filtré par {formData.accessRoles.length} rôle{formData.accessRoles.length > 1 ? 's' : ''} autorisé{formData.accessRoles.length > 1 ? 's' : ''}</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            </motion.div>
          )}

          {/* Step 3: Finalisation */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Finalisation
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tags et fichier
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Tag className="w-4 h-4 text-blue-600" />
                  Tags
                  {uploadedFile && !isProcessingAI && formData.tags.length > 0 && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-300">
                      Pré-remplis par IA
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Ajouter un tag..."
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline">
                    Ajouter
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-1 gap-2 cursor-pointer hover:bg-blue-100"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Options avancées */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Droplet className="w-4 h-4 text-purple-600" />
                  Options avancées
                </div>

                {/* Watermark */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-purple-600" />
                    <div>
                      <span className="text-sm text-gray-900 font-medium">Watermark</span>
                      <p className="text-xs text-gray-500">Ajouter un filigrane de protection sur le document</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.watermark}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, watermark: checked }))}
                  />
                </div>

                {/* Notifier */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="text-sm text-gray-900 font-medium">Notifier</span>
                        <p className="text-xs text-gray-500">Les notifications seront envoyées lorsque le document sera validé</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.notifyOnUpload}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifyOnUpload: checked }))}
                    />
                  </div>

                  {/* Template Email et Destinataires (seulement si notifier activé) */}
                  {formData.notifyOnUpload && (
                    <div className="px-3 pb-3 space-y-3">
                      {/* Template Email */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          Template d'email
                        </Label>
                        <Select
                          value={formData.emailTemplate}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, emailTemplate: value }))}
                        >
                          <SelectTrigger className="text-sm h-10 bg-white border-blue-200 hover:border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
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
                        <p className="text-xs text-gray-500">
                          Sélectionnez le template d'email qui sera envoyé aux destinataires
                        </p>
                      </div>

                      {/* Destinataires (seulement si scope non vide) */}
                      {!targetScope.isEmpty && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-blue-900">Destinataires</div>
                            <Button
                              type="button"
                              onClick={handleExportTargetScope}
                              size="sm"
                              variant="outline"
                              className="gap-2 h-7 text-xs bg-white hover:bg-blue-50 border-blue-300"
                            >
                              <Download className="w-3 h-3" />
                              Exporter
                            </Button>
                          </div>
                          <div className="text-xs text-blue-700 space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{targetScope.investors.reduce((sum, inv) => sum + inv.contacts.length, 0)} emails</span>
                              <span className="text-blue-600">•</span>
                              <span>{targetScope.investors.length} investisseur{targetScope.investors.length > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ne pas afficher le label "New" */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <div>
                      <span className="text-sm text-gray-900 font-medium">Ne pas afficher le label "New"</span>
                    </div>
                  </div>
                  <Switch
                    checked={formData.hideNewLabel}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hideNewLabel: checked }))}
                  />
                </div>

                {/* Reporting */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileBarChart className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="text-sm text-gray-900 font-medium">Reporting</span>
                    </div>
                  </div>
                  <Switch
                    checked={formData.reporting}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reporting: checked }))}
                  />
                </div>

                {/* Date d'ajout */}
                <div>
                  <Label htmlFor="upload-date" className="text-sm text-gray-700">Date d'ajout</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input
                      id="upload-date"
                      type="date"
                      value={formData.customUploadDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, customUploadDate: e.target.value }))}
                      placeholder="21/10/2025"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, customUploadDate: '' }))}
                      className="text-xs"
                    >
                      modifier
                    </Button>
                  </div>
                </div>
              </div>

              {/* Section Validation */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Validation
                </div>

                {/* Équipe de validation */}
                <div>
                  <Label htmlFor="validation-team" className="text-sm text-gray-700 flex items-center gap-2">
                    Équipe de validation
                    <Badge className="bg-red-100 text-red-700 border-red-300 text-[10px] px-1.5 py-0">
                      Obligatoire
                    </Badge>
                  </Label>
                  <Select 
                    value={formData.validationTeam} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, validationTeam: value }))}
                  >
                    <SelectTrigger id="validation-team" className={`mt-1.5 ${!formData.validationTeam ? 'border-red-300' : ''}`}>
                      <SelectValue placeholder="Sélectionner une équipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableValidationTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Validateurs (affichés seulement si une équipe est sélectionnée) */}
                {formData.validationTeam && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-emerald-900">Validateurs</div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 rounded-full">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-xs text-emerald-700 font-medium">
                          {availableValidationTeams.find(t => t.id === formData.validationTeam)?.validators.length || 0}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {availableValidationTeams
                        .find(t => t.id === formData.validationTeam)
                        ?.validators.map((validator, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-white rounded border border-emerald-100"
                          >
                            <span className="text-sm text-gray-900 font-medium">{validator.name}</span>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                              {validator.role}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Récapitulatif */}
              <div className="p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-blue-600" />
                  Récapitulatif
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium text-gray-900 truncate max-w-[200px]" title={formData.name || '-'}>
                      {formData.name || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dossier parent:</span>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 max-w-[200px] truncate">
                      {availableFolders.find(f => f.path === selectedFolder)?.path || selectedFolder}
                    </Badge>
                  </div>
                  {type === 'document' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Langue:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                        <span className="mr-1">
                          {availableLanguages.find(l => l.value === selectedLanguage)?.flag}
                        </span>
                        {availableLanguages.find(l => l.value === selectedLanguage)?.label}
                      </Badge>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Statut:</span>
                    <Badge 
                      variant="outline" 
                      className={formData.status === 'published' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-amber-50 text-amber-700 border-amber-300'}
                    >
                      {formData.status === 'published' ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type de ciblage:</span>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
                      {formData.targetType === 'all' ? 'Investisseurs' : 
                       formData.targetType === 'investors' ? 'Investisseurs' : 
                       formData.targetType === 'subscriptions' ? 'Souscriptions' : 
                       'Fonds'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Investisseurs:</span>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                      {!targetScope.isEmpty ? targetScope.investors.length : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rôles autorisés:</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                      {formData.accessRoles.length === 0 ? 'Tous les rôles' : `${formData.accessRoles.length} rôle${formData.accessRoles.length > 1 ? 's' : ''}`}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Watermark:</span>
                    <Badge 
                      variant="outline" 
                      className={formData.watermark 
                        ? 'bg-purple-50 text-purple-700 border-purple-300' 
                        : 'bg-gray-50 text-gray-600 border-gray-300'}
                    >
                      {formData.watermark ? 'Activé' : 'Désactivé'}
                    </Badge>
                  </div>
                  {uploadedFile && (
                    <div className="flex justify-between items-start pt-2 border-t border-blue-300">
                      <span className="text-gray-600">Fichier uploadé:</span>
                      <div className="flex items-center gap-1 text-xs text-purple-700">
                        <Sparkles className="w-3 h-3" />
                        <span className="font-medium">{uploadedFile.name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}
      </AnimatePresence>
    </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Précédent
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Annuler
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid(currentStep)}
                  className="gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)'
                  }}
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isStepValid(1)}
                  style={{ 
                    background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
                  }}
                  className="gap-2 hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {type === 'document' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Folder className="w-4 h-4" />
                  )}
                  Créer {type === 'document' ? 'le document' : 'le dossier'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
