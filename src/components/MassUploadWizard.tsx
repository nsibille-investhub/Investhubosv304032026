import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  FileUp,
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
import { mockDocuments, Document } from '../utils/documentMockData';
import { availableInvestors, fundLabelMap } from '../utils/investorsMockData';
import { useTranslation } from '../utils/languageContext';

export interface MassUploadOriginContext {
  /** "folder" when the wizard is opened from a folder context menu, "space" from the space-level Import button. */
  kind: 'folder' | 'space';
  /** Stable identifier of the originating folder or space. */
  id: string;
  /** Display name of the originating folder or space. */
  name: string;
  /** Folder path (e.g. "/PERE 1/Comités"). For a space without folder, use "/". */
  pathLabel: string;
}

interface MassUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
  existingFolders: string[];
  inline?: boolean;
  /** Optional origin — when set from a folder/space, documents are pre-targeted to that location. */
  originContext?: MassUploadOriginContext | null;
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
  // Consistent metadata - computed once
  pageCount: number;
  lpCount: number;
  contactCount: number;
  // Validation workflow
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
  parentId?: string;
}

// Function to extract all folders from the tree with their level
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

// Mock languages
const availableLanguages = [
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
];

// Extract the list of funds from investorsMockData
const availableFunds = Object.keys(fundLabelMap).map(key => ({
  id: key,
  name: fundLabelMap[key]
}));

// Mock segments
const availableSegments = [
  'Qualified Investors',
  'Strategic Committee',
  'Family Offices',
  'Institutional',
  'Individuals',
  'Corporate Investors',
  'HNWI (High Net Worth)',
  'Partner Distributors'
];

// Mock subscriptions
const availableSubscriptions = [
  { id: 'sub-1', name: 'SUBSCRIPTION-2024-001', investor: 'Jean Dupont' },
  { id: 'sub-2', name: 'SUBSCRIPTION-2024-002', investor: 'Marie Martin' },
  { id: 'sub-3', name: 'SUBSCRIPTION-2024-003', investor: 'Pierre Durand' },
];

// Mock contact roles
const availableContactRoles = [
  'Investor',
  'Legal Advisor',
  'Tax Advisor',
  'Accountant',
  'Auditor',
  'Administrator',
  'Legal Representative',
  'Wealth Manager',
  'Family Office',
  'Distributor',
  'Banking Partner',
  'Compliance Officer',
  'Trustee',
  'Custodian'
];

// Available email templates
const availableEmailTemplates = [
  { value: 'none', label: 'No template', icon: '📭' },
  { value: 'new_document', label: 'New document', icon: '📄' },
  { value: 'capital_call', label: 'Capital call', icon: '💰' },
  { value: 'notification', label: 'General notification', icon: '🔔' },
  { value: 'quarterly_report', label: 'Quarterly report', icon: '📊' },
  { value: 'tax_document', label: 'Tax document', icon: '📋' },
  { value: 'general_meeting', label: 'AGM notice', icon: '📅' },
  { value: 'dividend', label: 'Dividend distribution', icon: '💵' },
  { value: 'amendment', label: 'Amendment', icon: '📝' },
  { value: 'newsletter', label: 'Newsletter', icon: '📰' },
];

export function MassUploadWizard({ isOpen, onClose, existingFolders, inline = false, originContext = null }: MassUploadWizardProps) {
  const { t } = useTranslation();
  // The user can clear the origin-context prefill from step 1 — this hides the
  // banner and stops new uploads from being pre-targeted.
  const [originCleared, setOriginCleared] = useState(false);
  const effectiveOrigin = originCleared ? null : originContext;
  // Resolve the default folder from origin context (folder path or space root).
  // No origin (= launched from the spaces root, or cleared by the user) keeps the folder field empty.
  const defaultFolder = effectiveOrigin ? effectiveOrigin.pathLabel : '';
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

  // Extract all available folders
  const availableFolders = useMemo(() => {
    const base = extractAllFolders(mockDocuments);
    // If launched from a folder that isn't part of the mock tree, surface it as a virtual option
    if (
      originContext?.kind === 'folder' &&
      originContext.pathLabel &&
      !base.some((f) => f.path === originContext.pathLabel)
    ) {
      return [
        {
          id: `origin-${originContext.id}`,
          name: originContext.name,
          path: originContext.pathLabel,
          level: 0,
          parentId: undefined,
        },
        ...base,
      ];
    }
    return base;
  }, [originContext]);

  // Function to get the formatted file size
  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Generate a thumbnail for images
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

  // Simulate upload with stages: upload -> analyze -> done
  const simulateUpload = async (fileId: string, file: File) => {
    // Phase 1: Upload (0-100%)
    let progress = 0;
    const uploadInterval = setInterval(() => {
      progress += Math.random() * 25 + 10; // Faster
      if (progress >= 100) {
        progress = 100;
        clearInterval(uploadInterval);

        // Transition to analysis
        setTimeout(() => {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? { ...f, status: 'analyzing', progress: 100 }
                : f
            )
          );

          // Phase 2: AI analysis (1.5 seconds)
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

  // AI file analysis (mock)
  const analyzeFileWithAI = async (file: File): Promise<Partial<UploadedFile>> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension

    // Simulate intelligent extraction based on file name
    return {
      name: fileName,
      description: `Document automatically analyzed: ${fileName}. This document contains important information related to the company's activities.`,
      folder: defaultFolder, // Origin folder if launched from a folder; empty otherwise
      language: 'en',
      restrictToLanguage: false,
      targetType: fileName.toLowerCase().includes('investor') ? 'investor' :
                   fileName.toLowerCase().includes('legal') ? 'all' : 'investor',
      targetSegments: fileName.toLowerCase().includes('premium') ? ['Qualified Investors'] : [],
      targetInvestors: fileName.toLowerCase().includes('investor') || !fileName.toLowerCase().includes('legal')
        ? ['inv-3']
        : [],
      targetSubscriptions: [],
      accessRoles: ['Investor'],
      watermark: false,
      downloadable: true,
      printable: true,
      tags: [
        fileName.toLowerCase().includes('rapport') || fileName.toLowerCase().includes('report') ? 'Report' : '',
        fileName.toLowerCase().includes('financial') || fileName.toLowerCase().includes('financier') ? 'Financial' : '',
        fileName.toLowerCase().includes('legal') ? 'Legal' : '',
      ].filter(Boolean),
    };
  };

  // Handle file upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    toast.info('Upload in progress...', {
      description: `${files.length} file(s) selected`,
    });

    // Create placeholders immediately
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
        // Temporary default values (will be filled by AI)
        name: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        folder: defaultFolder,
        language: 'en',
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
        // Consistent metadata - generated once
        pageCount: Math.floor(Math.random() * 20) + 5,
        lpCount: 0, // Will be updated dynamically based on targetInvestors
        contactCount: 0, // Will be updated dynamically based on targetInvestors
        // Validation workflow - default values
        notify: false,
        emailTemplate: 'none',
        hideNewLabel: false,
        reporting: false,
        addDate: new Date().toISOString().split('T')[0],
        validationTeam: [],
      };
      newFiles.push(newFile);
    }

    // Display placeholders immediately
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Launch uploads and analyses in parallel
    newFiles.forEach(newFile => {
      simulateUpload(newFile.id, newFile.file);
    });
  };

  // Drag & drop handling
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
      toast.error('Unable to delete', {
        description: 'Please wait for processing to complete'
      });
      return;
    }

    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setSelectedFiles(prev => prev.filter(fid => fid !== id));
    toast.info('File deleted');
  };

  // Handle file selection
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

  // Bulk update
  const handleBulkUpdate = (field: string, value: any) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        selectedFiles.includes(f.id)
          ? { ...f, [field]: value }
          : f
      )
    );

    toast.success('Bulk update', {
      description: `${selectedFiles.length} document(s) updated`
    });
  };

  // Open the document in a new tab
  const handlePreviewDocument = (file: UploadedFile) => {
    const url = URL.createObjectURL(file.file);
    window.open(url, '_blank');
    toast.info('Document opened', {
      description: file.name
    });
  };

  // Update a file
  const handleUpdateFile = (id: string, field: keyof UploadedFile, value: any) => {
    setUploadedFiles(prev =>
      prev.map(f =>
        f.id === id
          ? { ...f, [field]: value }
          : f
      )
    );
  };

  // Add/remove a segment
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

  // Add/remove an investor
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

  // Add/remove a subscription
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

  // Add/remove a fund
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

  // Add/remove a role
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

  // Add a tag
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

  // Remove a tag
  const removeTag = (fileId: string, tag: string) => {
    setUploadedFiles(prev =>
      prev.map(f => {
        if (f.id !== fileId) return f;
        return { ...f, tags: f.tags.filter(t => t !== tag) };
      })
    );
  };

  // Download the list of recipients as CSV
  const handleDownloadRecipients = (file: UploadedFile) => {
    const recipients: string[] = [];

    file.targetInvestors.forEach(invId => {
      const investor = availableInvestors.find(i => i.id === invId);
      if (investor) {
        // Main investor (To)
        recipients.push(`"To","${investor.name}","${investor.email}","Main Investor","${investor.company || ''}"`);

        // Contacts (Cc)
        investor.contacts.forEach(contact => {
          recipients.push(`"Cc","${contact.name}","${contact.email}","${contact.role}","${investor.company || ''}"`);
        });
      }
    });

    const csvContent = [
      'Type,Name,Email,Role,Company',
      ...recipients
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `recipients-${file.name}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('CSV export successful', {
      description: `${recipients.length} recipients exported`
    });
  };

  // Download the targeting scope as CSV
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
      'Investor,Email,LP Count,Contact Count,Segment,Fund',
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

    toast.success('Scope export successful', {
      description: `Targeting scope exported`
    });
  };

  const handleFinish = () => {
    const hasErrors = uploadedFiles.some(f => f.status === 'uploading' || f.status === 'error');

    if (hasErrors) {
      toast.error('Error', { description: 'Some files are still uploading or in error' });
      return;
    }

    toast.success('Import successful', {
      description: `${uploadedFiles.length} document(s) were successfully imported`
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

  // File statistics
  const fileStats = useMemo(() => {
    return {
      total: uploadedFiles.length,
      uploading: uploadedFiles.filter(f => f.status === 'uploading').length,
      analyzing: uploadedFiles.filter(f => f.status === 'analyzing').length,
      uploaded: uploadedFiles.filter(f => f.status === 'uploaded').length,
      error: uploadedFiles.filter(f => f.status === 'error').length,
    };
  }, [uploadedFiles]);

  // Toast when all files are analyzed
  useEffect(() => {
    if (fileStats.total > 0 && fileStats.uploaded === fileStats.total && !allAnalyzedToastShown) {
      toast.success('Analysis completed!', {
        description: `${fileStats.total} file(s) pre-filled by AI`,
        duration: 5000,
      });
      setAllAnalyzedToastShown(true);
    }

    // Reset the flag when files are deleted
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
          <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: '#000E2B' }}
              >
                <FileUp className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900 leading-tight">
                  Import de documents
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
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
                  { num: 1, label: 'Import', icon: Sparkles },
                  { num: 2, label: 'Configuration', icon: Check }
                ].map((step, idx) => (
                  <div key={step.num} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        animate={{
                          backgroundColor: currentStep >= step.num ? '#000E2B' : '#E5E7EB'
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          currentStep >= step.num ? 'text-white' : 'text-gray-400'
                        } mb-2`}
                      >
                        <step.icon className="w-4 h-4" />
                      </motion.div>
                      <span className={`text-xs font-medium ${
                        currentStep >= step.num ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < 1 && (
                      <div className={`h-px flex-1 mx-2 ${
                        currentStep > step.num ? 'bg-[#000E2B]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))
              ) : (
                // Deep review flow with 3 steps
                [
                  { num: 1, label: 'Import', icon: Sparkles },
                  { num: 2, label: 'Revue détaillée', icon: Eye, isRange: true },
                  { num: 3, label: 'Validation finale', icon: Check }
                ].map((step, idx) => {
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
                            backgroundColor: isActive || isCompleted ? '#000E2B' : '#E5E7EB'
                          }}
                          className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            isActive || isCompleted ? 'text-white' : 'text-gray-400'
                          } mb-2`}
                        >
                          <step.icon className="w-4 h-4" />
                        </motion.div>
                        <span className={`text-xs font-medium text-center ${
                          isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {step.label}
                          {step.isRange && isActive && (
                            <div className="text-[10px] text-gray-600 font-semibold mt-0.5">
                              {currentReviewingDocIndex + 1}/{uploadedFiles.length}
                            </div>
                          )}
                        </span>
                      </div>
                      {idx < 2 && (
                        <div className={`h-px flex-1 mx-2 transition-colors ${
                          (step.num === 1 && currentStep > 1) ||
                          (step.num === 2 && currentStep > 1 + uploadedFiles.length)
                            ? 'bg-[#000E2B]'
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
                  className="space-y-4 py-1"
                >
                  {/* Origin hint — shown when launched from a folder or a space (not from spaces root) */}
                  {effectiveOrigin && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3"
                    >
                      <Folder className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                      <div className="min-w-0 flex-1 pr-6">
                        <p className="text-sm font-medium text-gray-900">
                          {effectiveOrigin.kind === 'folder'
                            ? t('ged.dataRoom.massUpload.originFolderTitle')
                            : t('ged.dataRoom.massUpload.originSpaceTitle')}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-600">
                          {effectiveOrigin.kind === 'folder'
                            ? t('ged.dataRoom.massUpload.originFolderBody', {
                                name: effectiveOrigin.name,
                              })
                            : t('ged.dataRoom.massUpload.originSpaceBody', {
                                name: effectiveOrigin.name,
                              })}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <code
                            className="inline-block rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-gray-700 border border-gray-200"
                            title={effectiveOrigin.pathLabel}
                          >
                            {effectiveOrigin.kind === 'folder'
                              ? effectiveOrigin.pathLabel
                              : `${effectiveOrigin.name} / —`}
                          </code>
                          <button
                            type="button"
                            onClick={() => {
                              setOriginCleared(true);
                              setUploadedFiles((prev) =>
                                prev.map((f) => ({ ...f, folder: '' })),
                              );
                              toast.info(
                                t('ged.dataRoom.massUpload.originResetToast'),
                              );
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
                          >
                            <X className="h-3 w-3" />
                            {t('ged.dataRoom.massUpload.originResetCta')}
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={t('ged.dataRoom.massUpload.originResetCta')}
                        onClick={() => {
                          setOriginCleared(true);
                          setUploadedFiles((prev) =>
                            prev.map((f) => ({ ...f, folder: '' })),
                          );
                          toast.info(
                            t('ged.dataRoom.massUpload.originResetToast'),
                          );
                        }}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-white hover:text-gray-900"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  )}

                  {/* Dropzone */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 text-center transition-colors cursor-pointer ${
                      dragActive
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/60'
                    }`}
                  >
                    <Upload className="h-6 w-6 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">
                      Choisir un fichier
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      50 Mo max
                    </p>
                    <p className="mt-2 text-[11px] text-gray-400">
                      Formats acceptés : PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <Sparkles className="h-3 w-3" />
                      L'IA pré-remplit automatiquement les champs
                    </p>
                  </div>

                  {/* Deep Review Option */}
                  {uploadedFiles.length > 0 && fileStats.uploaded === fileStats.total && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <Eye className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-medium text-gray-900">
                              Revue détaillée
                            </h4>
                            <Switch
                              checked={deepReview}
                              onCheckedChange={setDeepReview}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Examiner chaque document avec son aperçu et ajuster les métadonnées extraites par l'IA avant la validation finale.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Info banner during analysis */}
                  {(fileStats.uploading > 0 || fileStats.analyzing > 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                    >
                      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-500 animate-spin" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {fileStats.analyzing > 0
                            ? 'Analyse IA en cours…'
                            : 'Upload en cours…'}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {fileStats.analyzing > 0
                            ? `${fileStats.analyzing} document(s) — l'IA pré-remplit nom, description, ciblage, droits et tags.`
                            : `${fileStats.uploading} document(s) en cours de transfert.`}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          Fichiers uploadés ({fileStats.uploaded}/{uploadedFiles.length})
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedFiles((prev) =>
                              prev.filter(
                                (f) =>
                                  f.status === 'uploading' ||
                                  f.status === 'analyzing',
                              ),
                            )
                          }
                          disabled={uploadedFiles.every(
                            (f) =>
                              f.status === 'uploading' ||
                              f.status === 'analyzing',
                          )}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                          Tout supprimer
                        </button>
                      </div>

                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                        <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                          {uploadedFiles.map((file) => {
                            const ext = file.file.name
                              .split('.')
                              .pop()
                              ?.toUpperCase() ?? 'FILE';
                            return (
                              <motion.li
                                key={file.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center gap-3 px-3 py-2.5"
                              >
                                {/* Icon */}
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                </div>

                                {/* Filename + meta */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <p className="truncate text-sm text-gray-900">
                                      {file.name}
                                    </p>
                                    <Badge
                                      variant="outline"
                                      className="shrink-0 px-1.5 py-0 text-[10px] font-medium text-gray-600"
                                    >
                                      {ext}
                                    </Badge>
                                  </div>
                                  {file.status === 'uploading' && (
                                    <Progress
                                      value={file.progress}
                                      className="h-1 mt-1.5"
                                    />
                                  )}
                                </div>

                                {/* Right meta */}
                                <div className="flex shrink-0 items-center gap-2 text-xs text-gray-500">
                                  <span>{file.size}</span>
                                  {file.status === 'uploading' && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                                  )}
                                  {file.status === 'analyzing' && (
                                    <Sparkles className="h-3.5 w-3.5 text-gray-500" />
                                  )}
                                  {file.status === 'uploaded' && (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                  )}
                                  {file.status === 'error' && (
                                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(file.id)}
                                  disabled={
                                    file.status === 'uploading' ||
                                    file.status === 'analyzing'
                                  }
                                  className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-300"
                                  aria-label="Supprimer le fichier"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </motion.li>
                            );
                          })}
                        </ul>
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
                          Document review {currentReviewingDocIndex + 1}/{uploadedFiles.length}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Check the document and adjust the metadata extracted by AI
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
                          <span className="text-sm font-medium text-gray-700">Document preview</span>
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
                                PDF document preview
                              </p>
                              <div className="space-y-2 text-left w-full max-w-md">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-600">Type</span>
                                  <Badge variant="outline">{currentReviewDoc.file.type || 'PDF'}</Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-600">Size</span>
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
                          <span className="text-sm font-semibold text-gray-900">Metadata extracted by AI</span>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Document name */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Document name
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

                        {/* Folder */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Destination folder
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

                        {/* Language */}
                        <div>
                          <Label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                            Document language
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
                            Tags (comma separated)
                          </Label>
                          <Input
                            value={currentReviewDoc.tags.join(', ')}
                            onChange={(e) => {
                              const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                              handleUpdateFile(currentReviewDoc.id, 'tags', tags);
                            }}
                            placeholder="Financial, Q1 2024, Report..."
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
                              <span className="text-sm text-gray-700">Downloadable</span>
                              <Switch
                                checked={currentReviewDoc.downloadable}
                                onCheckedChange={(checked) => handleUpdateFile(currentReviewDoc.id, 'downloadable', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">Printable</span>
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
                            Document statistics
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-xs text-blue-600 font-medium mb-0.5">Pages</div>
                              <div className="text-lg font-semibold text-blue-900">{currentReviewDoc.pageCount}</div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="text-xs text-purple-600 font-medium mb-0.5">Size</div>
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
                  <div className="flex flex-col gap-3 border-b border-gray-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Configuration des documents
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        Vérifiez et ajustez les métadonnées pré-remplies par l'IA. Cliquez sur une cellule pour l'éditer.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => {
                              // Export configuration as CSV
                              const headers = [
                                'Document name',
                                'Description',
                                'Folder',
                                'Language',
                                'Restrict to language',
                                'Targeting type',
                                'Segments',
                                'Investors',
                                'Subscriptions',
                                'Funds',
                                'Watermark',
                                'Downloadable',
                                'Printable',
                                'Tags',
                                'Notify',
                                'Email template',
                                'Hide new label',
                                'Reporting',
                                'Add date',
                                'Validation team'
                              ];

                              const rows = uploadedFiles.map(file => [
                                file.name,
                                file.description,
                                file.folder,
                                file.language,
                                file.restrictToLanguage ? 'Yes' : 'No',
                                file.targetType,
                                file.targetSegments.join(';'),
                                file.targetInvestors.join(';'),
                                file.targetSubscriptions.join(';'),
                                file.targetFunds.join(';'),
                                file.watermark ? 'Yes' : 'No',
                                file.downloadable ? 'Yes' : 'No',
                                file.printable ? 'Yes' : 'No',
                                file.tags.join(';'),
                                file.notify ? 'Yes' : 'No',
                                file.emailTemplate,
                                file.hideNewLabel ? 'Yes' : 'No',
                                file.reporting ? 'Yes' : 'No',
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
                          >
                            <Download className="h-3.5 w-3.5" />
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
                            className="h-8 gap-1.5"
                            onClick={() => {
                              // Create an invisible file input
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

                                    toast.success('Import en cours…', {
                                      description: 'Analyse du fichier CSV'
                                    });

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
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Importer
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Importer une configuration CSV</TooltipContent>
                      </Tooltip>
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
                                  {selectedFiles.length} document{selectedFiles.length > 1 ? 's' : ''} selected
                                </Badge>
                              </motion.div>
                              <span className="font-semibold text-gray-800 flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-blue-600" />
                                Bulk edit
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
                                  {showBulkEdit ? 'Hide' : 'Show'} options
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
                                  Deselect
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
                                    Destination folder
                                  </Label>
                                  <Select onValueChange={(value) => handleBulkUpdate('folder', value)}>
                                    <SelectTrigger className="text-sm h-10 bg-white/80 backdrop-blur-sm border-amber-200 hover:border-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all shadow-sm">
                                      <SelectValue placeholder="Change folder..." />
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
                                    Document language
                                  </Label>
                                  <Select onValueChange={(value) => handleBulkUpdate('language', value)}>
                                    <SelectTrigger className="text-sm h-10 bg-white/80 backdrop-blur-sm border-green-200 hover:border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all shadow-sm">
                                      <SelectValue placeholder="Change language..." />
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
                                    Targeting type
                                  </Label>
                                  <Select onValueChange={(value) => handleBulkUpdate('targetType', value)}>
                                    <SelectTrigger className="text-sm h-10 bg-white/80 backdrop-blur-sm border-purple-200 hover:border-purple-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm">
                                      <SelectValue placeholder="Change targeting..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Users className="w-3 h-3 text-gray-500" />
                                          All
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
                                          Investors
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="subscription" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-3 h-3 text-indigo-500" />
                                          Subscriptions
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

                  {/* Document count header */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Documents ({uploadedFiles.length})</h4>
                  </div>

                  {/* Editable table - horizontal scroll */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-20">
                          <tr className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                            <th className="px-3 py-2.5 text-left w-[44px] sticky left-0 bg-gray-50 z-20 border-b border-gray-200">
                              <Checkbox
                                checked={selectedFiles.length === uploadedFiles.length && uploadedFiles.length > 0}
                                onCheckedChange={handleSelectAll}
                              />
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[140px] sticky left-[44px] bg-gray-50 z-20 border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-gray-400" />Aperçu</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-gray-400" />Document</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[260px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5 text-gray-400" />Description</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[180px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Folder className="w-3.5 h-3.5 text-gray-400" />Dossier</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[140px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 text-gray-400" />Langue</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[240px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" />Ciblage</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-gray-400" />Segments</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-gray-400" />Portée</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[120px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5 text-gray-400" />Notification</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[220px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />Template email</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[140px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><EyeOff className="w-3.5 h-3.5 text-gray-400" />Masquer « Nouveau »</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[120px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><BarChart3 className="w-3.5 h-3.5 text-gray-400" />Reporting</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[160px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />Date d'ajout</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-gray-400" />Équipe de validation</div>
                            </th>
                            <th className="px-3 py-2.5 text-left min-w-[200px] border-b border-gray-200">
                              <div className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-gray-400" />Tags</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {uploadedFiles.map((file, idx) => {
                            const isSelected = selectedFiles.includes(file.id);
                            // Calculate scope dynamically based on targeting type
                            let lpCount = 0;
                            let contactCount = 0;

                            if (file.targetType === 'all') {
                              // All investors
                              lpCount = availableInvestors.length;
                              contactCount = availableInvestors.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'fund') {
                              // Investors in selected funds (+ segments if selected)
                              let investorsInFunds = availableInvestors.filter(inv =>
                                file.targetFunds.includes(inv.fund)
                              );

                              // If segments are also selected, filter further
                              if (file.targetSegments.length > 0) {
                                investorsInFunds = investorsInFunds.filter(inv =>
                                  file.targetSegments.includes(inv.segment)
                                );
                              }

                              lpCount = investorsInFunds.length;
                              contactCount = investorsInFunds.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'segment') {
                              // Investors in selected segments
                              const investorsInSegments = availableInvestors.filter(inv =>
                                file.targetSegments.includes(inv.segment)
                              );
                              lpCount = investorsInSegments.length;
                              contactCount = investorsInSegments.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'investor') {
                              // Directly selected investors
                              const selectedInvestors = availableInvestors.filter(inv =>
                                file.targetInvestors.includes(inv.id)
                              );
                              lpCount = selectedInvestors.length;
                              contactCount = selectedInvestors.reduce((sum, inv) => sum + inv.contacts.length, 0);
                            } else if (file.targetType === 'subscription') {
                              // Investors linked to selected subscriptions
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

                              {/* Preview */}
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
                                      <span>Open</span>
                                    </motion.div>
                                  </div>
                                </motion.button>
                              </td>

                              {/* Name */}
                              <td className="px-4 py-4">
                                <Input
                                  value={file.name}
                                  onChange={(e) => handleUpdateFile(file.id, 'name', e.target.value)}
                                  className="text-sm font-medium border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white hover:bg-gray-50"
                                  placeholder="Document name..."
                                />
                              </td>

                              {/* Description */}
                              <td className="px-4 py-4">
                                <Textarea
                                  value={file.description}
                                  onChange={(e) => handleUpdateFile(file.id, 'description', e.target.value)}
                                  className="text-sm min-h-[70px] border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white hover:bg-gray-50 resize-none"
                                  rows={3}
                                  placeholder="Document description..."
                                />
                              </td>

                              {/* Folder */}
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

                              {/* Language */}
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
                                    <span className="text-xs text-gray-600 font-medium">Restrict to this language</span>
                                  </div>
                                </div>
                              </td>

                              {/* Targeting - Type + Object merged */}
                              <td className="px-4 py-4">
                                <div className="space-y-2.5">
                                  {/* Targeting type */}
                                  <Select
                                    value={file.targetType}
                                    onValueChange={(value) => {
                                      handleUpdateFile(file.id, 'targetType', value);
                                      // Clear segments if switching to investor or subscription
                                      if (value === 'investor' || value === 'subscription') {
                                        handleUpdateFile(file.id, 'targetSegments', []);
                                      }
                                      // Clear funds if not selecting fund
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
                                          <span className="font-medium">All</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="fund" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <Droplet className="w-4 h-4 text-teal-500" />
                                          <span className="font-medium">Funds</span>
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
                                          <span className="font-medium">Investors</span>
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="subscription" className="hover:bg-purple-50 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                          <FileText className="w-4 h-4 text-indigo-500" />
                                          <span className="font-medium">Subscriptions</span>
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {/* Underlying object - Investors */}
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
                                              {file.targetInvestors.length} LP selected
                                            </span>
                                          ) : (
                                            <span className="text-gray-500">Select LPs...</span>
                                          )}
                                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[240px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Search for an LP..." className="text-xs border-b" />
                                          <CommandList>
                                            <CommandEmpty className="py-6 text-center text-sm text-gray-500">No investor found.</CommandEmpty>
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

                                  {/* Underlying object - Funds */}
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
                                              {file.targetFunds.length} fund{file.targetFunds.length > 1 ? 's' : ''} selected
                                            </span>
                                          ) : (
                                            <span className="text-gray-500">Select funds...</span>
                                          )}
                                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[260px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Search for a fund..." className="text-xs border-b" />
                                          <CommandList>
                                            <CommandEmpty className="py-6 text-center text-sm text-gray-500">No fund found.</CommandEmpty>
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

                                  {/* Underlying object - Subscriptions */}
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
                                              {file.targetSubscriptions.length} subscription{file.targetSubscriptions.length > 1 ? 's' : ''}
                                            </span>
                                          ) : (
                                            <span className="text-gray-500">Select...</span>
                                          )}
                                          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[280px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Search for a subscription..." className="text-xs border-b" />
                                          <CommandList>
                                            <CommandEmpty className="py-6 text-center text-sm text-gray-500">No subscription found.</CommandEmpty>
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
                                  
                                  {/* Explicitly display selected items */}
                                  {file.targetType === 'investor' && file.targetInvestors.length > 0 && (
                                    <div className="p-2 bg-purple-50/50 border border-purple-200 rounded-lg">
                                      <p className="text-[10px] text-gray-500 font-medium mb-1.5">Targeting defined:</p>
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
                                            +{file.targetInvestors.length - 3} more
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {file.targetType === 'fund' && file.targetFunds.length > 0 && (
                                    <div className="p-2 bg-teal-50/50 border border-teal-200 rounded-lg">
                                      <p className="text-[10px] text-gray-500 font-medium mb-1.5">Targeting defined:</p>
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
                                      <p className="text-[10px] text-gray-500 font-medium mb-1.5">Targeting defined:</p>
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
                                            +{file.targetSubscriptions.length - 3} more
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Segments - Grayed out if investor or subscription, active for fund and segment */}
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
                                          <span className="text-gray-500">Select...</span>
                                        )}
                                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[260px] p-0" align="start">
                                      <Command>
                                        <CommandInput placeholder="Search for a segment..." className="text-xs border-b" />
                                        <CommandList>
                                          <CommandEmpty className="py-6 text-center text-sm text-gray-500">No segment found.</CommandEmpty>
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
                                  
                                  {/* Info for Fund type */}
                                  {file.targetType === 'fund' && file.targetFunds.length > 0 && file.targetSegments.length === 0 && (
                                    <div className="text-[10px] text-gray-500 italic p-2 bg-blue-50/30 rounded border border-blue-200">
                                      💡 Filter by segments (optional)
                                    </div>
                                  )}

                                  {/* Display selected values with animation */}
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
                                      Download scope
                                    </Button>
                                  </motion.div>
                                </div>
                              </td>

                              {/* Notify */}
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center">
                                  <Switch
                                    checked={file.notify}
                                    onCheckedChange={(checked) => handleUpdateFile(file.id, 'notify', checked)}
                                    className="data-[state=checked]:bg-orange-600"
                                  />
                                </div>
                              </td>

                              {/* Email Template */}
                              <td className="px-4 py-4">
                                {file.notify ? (
                                  <Select
                                    value={file.emailTemplate}
                                    onValueChange={(value) => handleUpdateFile(file.id, 'emailTemplate', value)}
                                  >
                                    <SelectTrigger className="text-xs h-9 bg-white border-blue-200 hover:border-blue-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all">
                                      <SelectValue placeholder="Choose a template..." />
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

                              {/* Hide "New" */}
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

                              {/* Add date */}
                              <td className="px-4 py-4">
                                <Input
                                  type="date"
                                  value={file.addDate}
                                  onChange={(e) => handleUpdateFile(file.id, 'addDate', e.target.value)}
                                  className="text-xs border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200 bg-white"
                                />
                              </td>

                              {/* Validation team */}
                              <td className="px-4 py-4">
                                <Select
                                  value={file.validationTeam[0] || ''}
                                  onValueChange={(value) => handleUpdateFile(file.id, 'validationTeam', value ? [value] : [])}
                                >
                                  <SelectTrigger className="text-xs h-9 bg-white border-gray-200 hover:border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all">
                                    <SelectValue placeholder="Select team..." />
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
                                    placeholder="Add a tag (Enter)..."
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
                  Cancel
                </Button>
                {isReviewStep && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    <Eye className="w-3 h-3 mr-1" />
                    Deep review: {currentReviewingDocIndex + 1}/{uploadedFiles.length}
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
                    toast.info(isReviewStep ? 'Previous document' : 'Previous step');
                  }}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isReviewStep ? 'Previous' : 'Back'}
                </Button>
              )}

              {currentStep < totalSteps && (
                <Button
                  onClick={() => {
                    if (canGoNext()) {
                      handleNextStep();
                      if (isReviewStep && currentReviewingDocIndex < uploadedFiles.length - 1) {
                        toast.success('Next document');
                      } else if (currentStep === 1) {
                        toast.success(deepReview ? 'Starting deep review' : 'Document configuration');
                      } else {
                        toast.success('Final validation');
                      }
                    } else {
                      toast.error('Action required', {
                        description: 'Please complete the current step'
                      });
                    }
                  }}
                  disabled={!canGoNext()}
                  style={{ background: !canGoNext() ? undefined : 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className={`gap-2 ${!canGoNext() ? '' : 'text-white hover:opacity-90'}`}
                >
                  {isReviewStep && currentReviewingDocIndex < uploadedFiles.length - 1 ? 'Next document' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep === totalSteps && (
                <Button
                  onClick={() => {
                    toast.success('Import launched!', {
                      description: `${uploadedFiles.length} document(s) being imported`,
                      duration: 5000
                    });
                    onClose();
                  }}
                  style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className="gap-2 text-white hover:opacity-90"
                >
                  <Upload className="w-4 h-4" />
                  Import {uploadedFiles.length} document(s)
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
