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
  Landmark,
  Settings,
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
  const [step2Page, setStep2Page] = useState(1);
  const [step2PageSize, setStep2PageSize] = useState(100);

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

                  {/* Step 2 — sober configuration table */}
                  {(() => {
                    const totalRows = uploadedFiles.length;
                    const totalPages = Math.max(1, Math.ceil(totalRows / step2PageSize));
                    const safePage = Math.min(step2Page, totalPages);
                    const startIndex = (safePage - 1) * step2PageSize;
                    const pageRows = uploadedFiles.slice(startIndex, startIndex + step2PageSize);
                    const allSelected = selectedFiles.length === totalRows && totalRows > 0;
                    return (
                      <>
                        <div className="flex items-center justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Settings className="h-3.5 w-3.5 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Colonnes affichées</TooltipContent>
                          </Tooltip>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
                                  <th className="px-3 py-2.5 text-left w-[44px]">
                                    <Checkbox
                                      checked={allSelected}
                                      onCheckedChange={handleSelectAll}
                                    />
                                  </th>
                                  <th className="px-3 py-2.5 text-left min-w-[260px]">Document</th>
                                  <th className="px-3 py-2.5 text-left min-w-[200px]">Dossier</th>
                                  <th className="px-3 py-2.5 text-left min-w-[280px]">Ciblage</th>
                                  <th className="px-3 py-2.5 text-left min-w-[220px]">Notification</th>
                                  <th className="px-3 py-2.5 text-left min-w-[200px]">Équipes de validation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {pageRows.map((file) => {
                                  const ext = file.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
                                  const isSelected = selectedFiles.includes(file.id);
                                  return (
                                    <tr key={file.id} className="hover:bg-gray-50/40">
                                      <td className="px-3 py-3 align-top">
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() => handleSelectFile(file.id)}
                                        />
                                      </td>

                                      <td className="px-3 py-3 align-top">
                                        <div className="flex items-start gap-2.5">
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                              <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-gray-600">
                                                {ext}
                                              </Badge>
                                              <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-500">
                                                <FileText className="h-2.5 w-2.5" />
                                                {file.pageCount}p
                                              </span>
                                            </div>
                                            <Input
                                              value={file.name}
                                              onChange={(e) => handleUpdateFile(file.id, 'name', e.target.value)}
                                              className="h-7 mt-1 px-2 text-xs"
                                            />
                                          </div>
                                        </div>
                                      </td>

                                      <td className="px-3 py-3 align-top">
                                        <div className="space-y-1.5">
                                          <Select
                                            value={file.folder}
                                            onValueChange={(value) => handleUpdateFile(file.id, 'folder', value)}
                                          >
                                            <SelectTrigger className="h-8 text-xs">
                                              <SelectValue placeholder="Choisir un dossier…" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {availableFolders.map((folder) => (
                                                <SelectItem key={folder.id} value={folder.path} className="text-xs">
                                                  <div className="flex items-center gap-2">
                                                    {folder.level > 0 && (
                                                      <span className="text-gray-400" style={{ marginLeft: `${folder.level * 8}px` }}>└</span>
                                                    )}
                                                    <Folder className="w-3 h-3 text-gray-400" />
                                                    <span>{folder.name}</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          {file.folder && (
                                            <div className="flex items-center gap-1.5">
                                              <span
                                                className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium"
                                                style={{ color: '#7a7a7a', borderColor: '#ddd7cc', backgroundColor: '#f5f3ee' }}
                                              >
                                                <Lock className="h-2.5 w-2.5" />
                                                Restriction héritée
                                              </span>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <button type="button" className="text-blue-600 hover:text-blue-700">
                                                    <Info className="h-3 w-3" />
                                                  </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                  <span className="text-xs">Le dossier porte des restrictions de ciblage. Le document en hérite par défaut.</span>
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-3 py-3 align-top">
                                        <div className="space-y-1.5">
                                          <Select
                                            value={file.targetType}
                                            onValueChange={(value) => handleUpdateFile(file.id, 'targetType', value)}
                                          >
                                            <SelectTrigger className="h-8 text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="all" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />Tous</div></SelectItem>
                                              <SelectItem value="segment" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />Segments</div></SelectItem>
                                              <SelectItem value="investor" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />Investisseurs</div></SelectItem>
                                              <SelectItem value="subscription" className="text-xs"><div className="flex items-center gap-2"><FileText className="h-3 w-3 text-gray-500" />Souscriptions</div></SelectItem>
                                              <SelectItem value="fund" className="text-xs"><div className="flex items-center gap-2"><Landmark className="h-3 w-3 text-gray-500" />Fonds</div></SelectItem>
                                            </SelectContent>
                                          </Select>

                                          {file.targetType === 'investor' && (
                                            <Select
                                              value={file.targetInvestors[0] ?? ''}
                                              onValueChange={(value) => handleUpdateFile(file.id, 'targetInvestors', [value])}
                                            >
                                              <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Choisir un investisseur…" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {availableInvestors.map((inv) => (
                                                  <SelectItem key={inv.id} value={inv.id} className="text-xs">{inv.name}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          )}

                                          {file.targetType === 'subscription' && (
                                            <Select
                                              value={file.targetSubscriptions[0] ?? ''}
                                              onValueChange={(value) => handleUpdateFile(file.id, 'targetSubscriptions', [value])}
                                            >
                                              <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Choisir une souscription…" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {availableInvestors.map((inv) => {
                                                  const fundLabel = fundLabelMap[inv.fund] ?? inv.fund;
                                                  const subId = `${inv.id}-${inv.fund}`;
                                                  return (
                                                    <SelectItem key={subId} value={subId} className="text-xs">
                                                      {inv.name} · {fundLabel}
                                                    </SelectItem>
                                                  );
                                                })}
                                              </SelectContent>
                                            </Select>
                                          )}

                                          {file.targetType === 'fund' && (
                                            <div className="flex gap-1.5">
                                              <Select
                                                value={file.targetFunds[0] ?? ''}
                                                onValueChange={(value) => handleUpdateFile(file.id, 'targetFunds', [value])}
                                              >
                                                <SelectTrigger className="h-8 flex-1 text-xs">
                                                  <SelectValue placeholder="Fonds…" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {availableFunds.map((fund) => (
                                                    <SelectItem key={fund.id} value={fund.id} className="text-xs">{fund.name}</SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <Select
                                                value={file.targetSegments[0] ?? ''}
                                                onValueChange={(value) => handleUpdateFile(file.id, 'targetSegments', [value])}
                                              >
                                                <SelectTrigger className="h-8 w-20 text-xs">
                                                  <SelectValue placeholder="Part" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="A" className="text-xs">A</SelectItem>
                                                  <SelectItem value="B" className="text-xs">B</SelectItem>
                                                  <SelectItem value="C" className="text-xs">C</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          )}

                                          {file.targetType === 'segment' && (
                                            <Select
                                              value={file.targetSegments[0] ?? ''}
                                              onValueChange={(value) => handleUpdateFile(file.id, 'targetSegments', [value])}
                                            >
                                              <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Choisir un segment…" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {availableSegments.map((seg) => (
                                                  <SelectItem key={seg} value={seg} className="text-xs">{seg}</SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-3 py-3 align-top">
                                        <div className="space-y-1.5">
                                          <div className="flex items-center gap-2">
                                            <Switch
                                              checked={file.notify}
                                              onCheckedChange={(checked) => handleUpdateFile(file.id, 'notify', checked)}
                                            />
                                            <span className="text-xs text-gray-700">Notifier les destinataires</span>
                                          </div>
                                          {file.notify && (
                                            <Select
                                              value={file.emailTemplate}
                                              onValueChange={(value) => handleUpdateFile(file.id, 'emailTemplate', value)}
                                            >
                                              <SelectTrigger className="h-7 text-xs">
                                                <SelectValue placeholder="Template…" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {availableEmailTemplates.map((tpl) => (
                                                  <SelectItem key={tpl.value} value={tpl.value} className="text-xs">
                                                    <span className="mr-1.5">{tpl.icon}</span>{tpl.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          )}
                                        </div>
                                      </td>

                                      <td className="px-3 py-3 align-top">
                                        <Select
                                          value={file.validationTeam[0] ?? ''}
                                          onValueChange={(value) => handleUpdateFile(file.id, 'validationTeam', [value])}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Choisir une équipe…" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                                            <SelectItem value="compliance" className="text-xs">Compliance</SelectItem>
                                            <SelectItem value="legal" className="text-xs">Juridique</SelectItem>
                                            <SelectItem value="ir" className="text-xs">Investor Relations</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination footer */}
                          <div className="flex items-center justify-between border-t border-gray-100 bg-white px-3 py-2">
                            <span className="text-xs text-gray-500">
                              {startIndex + 1}-{Math.min(startIndex + step2PageSize, totalRows)} sur {totalRows} élément{totalRows > 1 ? 's' : ''}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                disabled={safePage <= 1}
                                onClick={() => setStep2Page((p) => Math.max(1, p - 1))}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </Button>
                              <span className="text-xs text-gray-600 tabular-nums">{safePage}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 w-7 p-0"
                                disabled={safePage >= totalPages}
                                onClick={() => setStep2Page((p) => Math.min(totalPages, p + 1))}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                              <Select
                                value={String(step2PageSize)}
                                onValueChange={(value) => {
                                  setStep2PageSize(Number(value));
                                  setStep2Page(1);
                                }}
                              >
                                <SelectTrigger className="h-7 w-[88px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="20" className="text-xs">20 / page</SelectItem>
                                  <SelectItem value="50" className="text-xs">50 / page</SelectItem>
                                  <SelectItem value="100" className="text-xs">100 / page</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
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
