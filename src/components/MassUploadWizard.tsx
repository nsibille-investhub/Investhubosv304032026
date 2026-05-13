import { Fragment, useState, useCallback, useRef, useMemo, useEffect } from 'react';
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
  Wallet,
  Receipt,
  Banknote,
  Newspaper,
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
  Mail,
  RotateCcw,
  Layers,
  Layers3,
  Link as LinkIcon,
  Unlink,
  ChevronDown,
  type LucideIcon,
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
import { DocumentCategory } from '../utils/documentMockData';
import { availableInvestors, fundLabelMap } from '../utils/investorsMockData';
import { COMMITMENTS, FUNDS, INVESTORS, getSpaces, type FolderSpec } from '../utils/gedFixtures';
import { useTranslation } from '../utils/languageContext';
import { useValidationStore, nextValidationDocId } from '../utils/validationStoreContext';
import type {
  TargetingTag,
  ValidationBatch,
  ValidationDocument,
} from '../utils/validationDocumentsGenerator';

export interface MassUploadOriginContext {
  /** "folder" when the wizard is opened from a folder context menu, "space" from the space-level Import button. */
  kind: 'folder' | 'space';
  /** Stable identifier of the originating folder or space. */
  id: string;
  /** Display name of the originating folder or space. */
  name: string;
  /** Folder path (e.g. "/PERE 1/Comités"). For a space without folder, use "/". */
  pathLabel: string;
  /** Name of the parent space — only relevant when kind === 'folder'. */
  spaceName?: string;
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
  documentCategory?: DocumentCategory;
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
  // When set, the file belongs to a UploadBatch — its validationTeam, notify
  // and emailTemplate are forced to the batch's consolidated values, and folder
  // / targeting can be either inherited (global mode) or per-document.
  batchId?: string;
}

// A batch (lot) groups multiple uploaded files so they share a single
// validation team. Only the validation team is MANDATORILY consolidated
// (uniform across all members). Folder, targeting and notification can
// each be either:
//   - "global"        → batch enforces a single value for all members
//   - "per-document"  → each member keeps its own value (heterogeneous)
interface UploadBatch {
  id: string;
  name: string;
  // Consolidated field — always uniform across members.
  validationTeam: string[];
  // Per-field consolidation modes.
  folderMode: 'global' | 'per-document';
  globalFolder: string;
  targetingMode: 'global' | 'per-document';
  globalTargeting: {
    targetType: string;
    targetSegments: string[];
    targetInvestors: string[];
    targetSubscriptions: string[];
    targetFunds: string[];
  };
}

interface FolderItem {
  id: string;
  name: string;
  path: string;
  level: number;
  parentId?: string;
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

// Extract the list of funds from investorsMockData
const availableFunds = Object.keys(fundLabelMap).map(key => ({
  id: key,
  name: fundLabelMap[key]
}));

// Mock segments — aligned with the canonical InvestorTypology values
// declared in gedFixtures.ts.
const availableSegments = [
  'Pension Fund',
  'Insurance',
  'Sovereign',
  'Institutional',
  'Family Office',
  'HNWI',
  'UHNWI',
];

// Canonical subscriptions — derived from `gedFixtures.COMMITMENTS` so the
// wizard's data is in sync with what the data room renders. Each entry
// carries the fields the dropdown displays (investor / amount / fund /
// share class).
type SubscriptionRow = {
  id: string;
  name: string;
  investor: string;
  investorId: string;
  fund: string;
  shareClass: string;
  amount: number;
};
const investorNameById = (id: string): string =>
  INVESTORS.find(i => i.id === id)?.name ?? id;
const availableSubscriptions: SubscriptionRow[] = COMMITMENTS.map(c => ({
  id: c.subscriptionId,
  name: c.subscriptionId,
  investor: investorNameById(c.investorId),
  investorId: c.investorId,
  fund: c.fundCode,
  shareClass: c.shareClass,
  amount: c.commitmentEur,
}));
// Compact EUR formatter — €25.0M / €750K / €420 — used inside the
// subscription dropdowns so a row reads "Aldebaran · €40.0M · Atlas …".
const formatCommitment = (amount: number): string => {
  if (amount >= 1_000_000) return `€${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `€${Math.round(amount / 1_000)}K`;
  return `€${amount}`;
};
const subscriptionLabel = (sub: SubscriptionRow): string =>
  `${sub.investor} · ${formatCommitment(sub.amount)} · ${fundLabelMap[sub.fund] ?? sub.fund} · ${sub.shareClass}`;

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

// Available document categories ("Document type" in the UI). Mirrors the list used in
// DocumentAddModal so the wizard surfaces the same options as the rest of the app.
const availableDocumentCategories: { value: DocumentCategory; labelKey: string }[] = [
  { value: 'capitalCall', labelKey: 'ged.addModal.documentCategory.capitalCall' },
  { value: 'distribution', labelKey: 'ged.addModal.documentCategory.distribution' },
  { value: 'quarterlyReport', labelKey: 'ged.addModal.documentCategory.quarterlyReport' },
  { value: 'annualReport', labelKey: 'ged.addModal.documentCategory.annualReport' },
  { value: 'subscription', labelKey: 'ged.addModal.documentCategory.subscription' },
  { value: 'kyc', labelKey: 'ged.addModal.documentCategory.kyc' },
  { value: 'legal', labelKey: 'ged.addModal.documentCategory.legal' },
  { value: 'tax', labelKey: 'ged.addModal.documentCategory.tax' },
  { value: 'marketing', labelKey: 'ged.addModal.documentCategory.marketing' },
  { value: 'other', labelKey: 'ged.addModal.documentCategory.other' },
];

// Build a minimal but valid PDF blob with the filename printed on a single
// A4 page. Used by the demo loader / downloader so simulated files behave
// like real PDFs when re-uploaded by hand.
const buildDemoPdfBlob = (filename: string): Blob => {
  const enc = new TextEncoder();
  // PDF strings can't contain raw parens/backslashes — sanitize.
  const safe = filename.replace(/[\\()]/g, '_');
  const stream =
    `BT /F1 16 Tf 72 770 Td (Demo file) Tj ET\n` +
    `BT /F1 11 Tf 72 740 Td (${safe}) Tj ET\n` +
    `BT /F1 9 Tf 72 720 Td (Generated by InvestHub mass-upload demo.) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const parts: string[] = ['%PDF-1.4\n'];
  let pos = enc.encode(parts[0]).length;
  const offsets: number[] = [0];
  objects.forEach((body, i) => {
    offsets.push(pos);
    const objStr = `${i + 1} 0 obj\n${body}\nendobj\n`;
    parts.push(objStr);
    pos += enc.encode(objStr).length;
  });
  const xrefStart = pos;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  parts.push(xref);
  parts.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`,
  );
  return new Blob([parts.join('')], { type: 'application/pdf' });
};

// Demo scenarios — clicked from step 1 to synthesize a realistic file batch
// that exercises the AI deduction (category, investor, subscription) plus
// the auto-batching rules. The filenames are intentionally explicit so the
// AI mock can recognise them; in real life filenames are messier.
type DemoScenario = {
  id: string;
  titleKey: string;
  descKey: string;
  files: string[];
};
const demoScenarios: DemoScenario[] = [
  {
    id: 'capital-call-nwgc2',
    titleKey: 'ged.dataRoom.massUpload.wizard.demo.capitalCallTitle',
    descKey: 'ged.dataRoom.massUpload.wizard.demo.capitalCallDesc',
    files: [
      'Capital-Call_NWGC2_2025-Q3_SUB-NWGC2-001.pdf',
      'Capital-Call_NWGC2_2025-Q3_SUB-NWGC2-002.pdf',
      'Capital-Call_NWGC2_2025-Q3_SUB-NWGC2-003.pdf',
      'Capital-Call_NWGC2_2025-Q3_SUB-NWGC2-004.pdf',
      'Capital-Call_NWGC2_2025-Q3_SUB-NWGC2-005.pdf',
    ],
  },
  {
    id: 'tax-aldebaran',
    titleKey: 'ged.dataRoom.massUpload.wizard.demo.taxPackageTitle',
    descKey: 'ged.dataRoom.massUpload.wizard.demo.taxPackageDesc',
    files: [
      'IFU_Aldebaran-Pension-Fund_NWGC2_2024.pdf',
      'IFU_Aldebaran-Pension-Fund_AIP1_2024.pdf',
      'Annexe-Fiscale_Aldebaran-Pension-Fund_NWGC2_2024.pdf',
      'Annexe-Fiscale_Aldebaran-Pension-Fund_AIP1_2024.pdf',
      '2561-bis_Aldebaran-Pension-Fund_NWGC2_2024.pdf',
      '2561-bis_Aldebaran-Pension-Fund_AIP1_2024.pdf',
    ],
  },
];

// Available email templates
const availableEmailTemplates: { value: string; labelKey: string; icon: LucideIcon }[] = [
  { value: 'none', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.none', icon: Mail },
  { value: 'new_document', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.newDocument', icon: FileText },
  { value: 'capital_call', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.capitalCall', icon: Wallet },
  { value: 'notification', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.notification', icon: Bell },
  { value: 'quarterly_report', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.quarterlyReport', icon: BarChart3 },
  { value: 'tax_document', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.taxDocument', icon: Receipt },
  { value: 'general_meeting', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.generalMeeting', icon: Calendar },
  { value: 'dividend', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.dividend', icon: Banknote },
  { value: 'amendment', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.amendment', icon: Edit3 },
  { value: 'newsletter', labelKey: 'ged.dataRoom.massUpload.wizard.emailTemplates.newsletter', icon: Newspaper },
];

// Map a DocumentCategory to the kindKey used by the validation listing.
const KIND_KEY_BY_CATEGORY: Record<DocumentCategory, string> = {
  capitalCall: 'validation.fixtures.kind.capitalCall',
  distribution: 'validation.fixtures.kind.distribution',
  quarterlyReport: 'validation.fixtures.kind.quarterlyReporting',
  annualReport: 'validation.fixtures.kind.annualReport',
  subscription: 'validation.fixtures.kind.subscription',
  kyc: 'validation.fixtures.kind.kyc',
  legal: 'validation.fixtures.kind.legal',
  tax: 'validation.fixtures.kind.tax',
  marketing: 'validation.fixtures.kind.marketing',
  other: 'validation.fixtures.kind.other',
};

const formatFromName = (name: string): ValidationDocument['format'] => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'docx';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return 'pptx';
  return 'pdf';
};

const splitFolderToSegments = (folder: string): string[] => {
  if (!folder) return [];
  return folder.split('/').filter(Boolean);
};

const buildTargetingTags = (file: UploadedFile): TargetingTag[] => {
  const tags: TargetingTag[] = [];
  file.targetSegments?.forEach((label) => tags.push({ kind: 'segment', label }));
  file.targetFunds?.forEach((code) =>
    tags.push({ kind: 'fund', label: fundLabelMap[code] ?? code }),
  );
  file.targetInvestors?.forEach((id) => {
    const inv = INVESTORS.find((i) => i.id === id);
    tags.push({ kind: 'investor', label: inv?.name ?? id });
  });
  file.targetSubscriptions?.forEach((id) =>
    tags.push({ kind: 'subscription', label: id }),
  );
  return tags;
};

const resolveSpaceIdForPath = (folder: string): string | undefined => {
  const segs = splitFolderToSegments(folder);
  if (segs.length === 0) return undefined;
  const head = segs[0];
  const space = getSpaces().find((s) => s.name === head);
  return space?.id;
};

const buildValidationDocument = (
  file: UploadedFile,
  submittedAt: string,
  batchId?: string,
): ValidationDocument => {
  const segs = splitFolderToSegments(file.folder);
  return {
    id: nextValidationDocId(),
    name: file.name,
    format: formatFromName(file.name),
    size: file.size,
    pathSegments: segs,
    createdBy: { name: 'You', role: 'Operator' },
    createdAt: submittedAt,
    targeting: buildTargetingTags(file),
    kindKey: file.documentCategory
      ? KIND_KEY_BY_CATEGORY[file.documentCategory]
      : undefined,
    status: 'pending',
    batchId,
    gedSpaceId: resolveSpaceIdForPath(file.folder),
  };
};

const buildValidationBatch = (
  batch: UploadBatch,
  files: UploadedFile[],
  submittedAt: string,
): ValidationBatch => {
  // Pick the most common category among the batch's files for the kind label.
  const counts = new Map<DocumentCategory, number>();
  files.forEach((f) => {
    if (f.documentCategory) {
      counts.set(f.documentCategory, (counts.get(f.documentCategory) ?? 0) + 1);
    }
  });
  let topCategory: DocumentCategory | undefined;
  let topCount = 0;
  counts.forEach((c, k) => {
    if (c > topCount) {
      topCategory = k;
      topCount = c;
    }
  });
  return {
    id: batch.id,
    name: batch.name,
    kindKey: topCategory
      ? KIND_KEY_BY_CATEGORY[topCategory]
      : 'validation.fixtures.kind.other',
    createdAt: submittedAt,
    createdBy: { name: 'You', role: 'Operator' },
  };
};


export function MassUploadWizard({ isOpen, onClose, existingFolders, inline = false, originContext = null }: MassUploadWizardProps) {
  const { t } = useTranslation();
  const { addUploadResults } = useValidationStore();
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
  // When true, the bulk-edit form is in "create batch" mode — it collects a
  // batch name and gates the confirm action behind notification + validation
  // team being explicitly configured. Otherwise the form just applies the
  // staged values to the selected files.
  const [batchCreationMode, setBatchCreationMode] = useState(false);
  const [batchNameDraft, setBatchNameDraft] = useState('');

  // Bulk edit — staged fields + values applied in one go via "Modifier"
  type BulkFieldKey = 'documentType' | 'folder' | 'language' | 'targeting' | 'notification' | 'validationTeam';
  type BulkTargetingValue = {
    targetType: string;
    targetSegments: string[];
    targetInvestors: string[];
    targetSubscriptions: string[];
    targetFunds: string[];
  };
  type BulkNotificationValue = { notify: boolean; emailTemplate: string };
  const [bulkFields, setBulkFields] = useState<BulkFieldKey[]>([]);
  const [bulkValues, setBulkValues] = useState<{
    documentType?: DocumentCategory;
    folder?: string;
    language?: string;
    targeting?: BulkTargetingValue;
    notification?: BulkNotificationValue;
    validationTeam?: string[];
  }>({});
  const [bulkFieldsPickerOpen, setBulkFieldsPickerOpen] = useState(false);

  // Document batches (lots) — see UploadBatch.
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [expandedBatchIds, setExpandedBatchIds] = useState<Set<string>>(new Set());
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  // Auto-grouping toggle — when on, the wizard creates batches automatically
  // by grouping files that share the same targeting, notification (notify +
  // template) and validation team. Files targeted to everyone ("Tous") are
  // never grouped — there's no scoped audience to consolidate. Each resulting
  // batch is the unit used both for validation and for notification on the
  // next screen.
  const [autoGroupEnabled, setAutoGroupEnabled] = useState(false);

  // Deep Review mode
  const [deepReview, setDeepReview] = useState(false);
  const [currentReviewingDocIndex, setCurrentReviewingDocIndex] = useState(0);
  const [documentZoom, setDocumentZoom] = useState(100);
  const [step2Page, setStep2Page] = useState(1);
  const [step2PageSize, setStep2PageSize] = useState(100);

  /**
   * Synthetic mapping folder → inherited restriction. In production this
   * would be wired to the folder's actual targeting rules; here we derive
   * a deterministic pair (fund, segment) from the folder path so the UI
   * stays consistent across re-renders.
   */
  // Derive the inherited fund / segment chip shown next to the folder cell.
  // A canonical fund-space path like "/Northwind Growth Capital II/Capital
  // Calls/2025" yields fund="Northwind Growth Capital II"; the Marketing &
  // Distribution space carries no fund inheritance (segments are folder-
  // level there, not surfaced in this badge).
  const getInheritedRestriction = (folderPath: string): { fund?: string; segment?: string } => {
    if (!folderPath) return {};
    for (const f of FUNDS) {
      if (folderPath === `/${f.name}` || folderPath.startsWith(`/${f.name}/`)) {
        return { fund: f.name };
      }
    }
    return {};
  };

  // Extract all available folders — canonical structure derived from
  // gedFixtures' fund spaces (NWGC2, AIP1, Marketing & Distribution).
  const availableFolders = useMemo(() => {
    const out: FolderItem[] = [];
    // Limit depth: capital calls produce ~30 sub-folders/year, which would
    // make the picker unusable. We keep down to the year level.
    const MAX_DEPTH = 3;
    const walkFolders = (folders: FolderSpec[] | undefined, parentPath: string, level: number, parentId?: string) => {
      if (!folders || level > MAX_DEPTH) return;
      for (const f of folders) {
        const path = `${parentPath}/${f.name}`;
        const id = `gf-${path}`;
        out.push({ id, name: f.name, path, level, parentId });
        walkFolders(f.folders, path, level + 1, id);
      }
    };
    for (const space of getSpaces()) {
      const spaceId = `gf-space-${space.id}`;
      const spacePath = `/${space.name}`;
      out.push({ id: spaceId, name: space.name, path: spacePath, level: 0 });
      walkFolders(space.folders, spacePath, 1, spaceId);
    }
    const seen = new Set<string>();
    const deduped = out.filter((folder) => {
      if (seen.has(folder.path)) return false;
      seen.add(folder.path);
      return true;
    });
    // If launched from a folder that isn't part of the mock tree, surface it as a virtual option
    if (
      originContext?.kind === 'folder' &&
      originContext.pathLabel &&
      !seen.has(originContext.pathLabel)
    ) {
      return [
        {
          id: `origin-${originContext.id}`,
          name: originContext.name,
          path: originContext.pathLabel,
          level: 0,
          parentId: undefined,
        },
        ...deduped,
      ];
    }
    return deduped;
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

  // AI file analysis (mock) — deduces document category, investor, targeting
  // (investor vs subscription) and fund from the filename. Falls back to
  // sensible defaults when nothing matches.
  const analyzeFileWithAI = async (file: File): Promise<Partial<UploadedFile>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const rawName = file.name.replace(/\.[^/.]+$/, '');
    const haystack = rawName.toLowerCase();

    // 1) Document category
    let documentCategory: DocumentCategory = 'other';
    if (/(capital[ _-]?call|appel[ _-]?de[ _-]?fonds|appel[ _-]?capital)/i.test(rawName)) {
      documentCategory = 'capitalCall';
    } else if (/(distribution|distrib|payout|dividend|dividende)/i.test(rawName)) {
      documentCategory = 'distribution';
    } else if (/(quarter|trimestriel|\bq[1-4]\b|\bt[1-4]\b)/i.test(rawName)) {
      documentCategory = 'quarterlyReport';
    } else if (/(annual|annuel|year[ _-]?end|rapport[ _-]?annuel)/i.test(rawName)) {
      documentCategory = 'annualReport';
    } else if (/(subscription|souscription|bulletin)/i.test(rawName)) {
      documentCategory = 'subscription';
    } else if (/(kyc|aml|due[ _-]?diligence|lcb-?ft)/i.test(rawName)) {
      documentCategory = 'kyc';
    } else if (/(legal|contract|contrat|nda|agreement|juridique|statuts?)/i.test(rawName)) {
      documentCategory = 'legal';
    } else if (/(\btax\b|fiscal|fiscalit[eé]|ifu|cerfa|2561)/i.test(rawName)) {
      documentCategory = 'tax';
    } else if (/(marketing|brochure|pitch|teaser|newsletter|plaquette)/i.test(rawName)) {
      documentCategory = 'marketing';
    }

    // 2) Subscription reference (e.g. "SUBSCRIPTION-2024-001")
    const subscriptionMatch = availableSubscriptions.find(
      s => rawName.toUpperCase().includes(s.name.toUpperCase()),
    );

    // 3) Investor detection — exact name first, then longest distinctive
    // token (filenames usually replace spaces with `_` or `-`, breaking the
    // exact-name match, so we fall back to a single distinctive word).
    const GENERIC_TOKENS = new Set([
      'pension','fund','trust','plan','scheme','group','insurance','reinsurance',
      'sovereign','wealth','authority','reserve','endowment','capital','allocators',
      'asset','management','foundation','family','office','house','heritage',
      'partners','holdings','investments','private','retirement','mutual',
    ]);
    const distinctiveToken = (name: string): string | undefined => {
      const tokens = name
        .toLowerCase()
        .split(/[\s-]+/)
        .filter(tok => tok.length >= 4 && !GENERIC_TOKENS.has(tok));
      if (tokens.length === 0) return undefined;
      return tokens.reduce((best, t) => (t.length > best.length ? t : best), tokens[0]);
    };
    let detectedInvestor: typeof availableInvestors[number] | undefined;
    for (const inv of availableInvestors) {
      if (haystack.includes(inv.name.toLowerCase())) {
        detectedInvestor = inv;
        break;
      }
    }
    if (!detectedInvestor) {
      for (const inv of availableInvestors) {
        const tok = distinctiveToken(inv.name);
        if (tok && new RegExp(`(^|[^a-z])${tok}([^a-z]|$)`, 'i').test(rawName)) {
          detectedInvestor = inv;
          break;
        }
      }
    }
    // A matched subscription locks the investor to its owner.
    if (subscriptionMatch) {
      const owner = availableInvestors.find(i => i.name === subscriptionMatch.investor);
      if (owner) detectedInvestor = owner;
    }

    // 4) Fund detection — subscription's own fund wins; otherwise look for a
    // fund code mentioned in the filename (NWGC2 / AIP1); fall back to the
    // detected investor's primary fund.
    const upperName = rawName.toUpperCase();
    const fundFromName = FUNDS.find(f => upperName.includes(f.code))?.code;
    let resolvedFund: string | undefined;
    if (subscriptionMatch) resolvedFund = subscriptionMatch.fund;
    else resolvedFund = fundFromName ?? detectedInvestor?.fund;

    // 5) Targeting decision — subscription > investor > all.
    let targetType: string;
    let targetInvestors: string[] = [];
    let targetSubscriptions: string[] = [];
    let targetFunds: string[] = [];
    if (subscriptionMatch) {
      targetType = 'subscription';
      targetSubscriptions = [subscriptionMatch.id];
      targetFunds = [subscriptionMatch.fund];
    } else if (detectedInvestor) {
      targetType = 'investor';
      targetInvestors = [detectedInvestor.id];
      if (resolvedFund) targetFunds = [resolvedFund];
    } else {
      targetType = 'all';
    }

    // 6) Folder inference — pre-file the document into the canonical
    // sub-folder of its fund space when we know enough. Origin folder (if
    // the wizard was opened from a folder) always wins.
    const fundName = resolvedFund
      ? FUNDS.find(f => f.code === resolvedFund)?.name
      : undefined;
    const yearMatch = rawName.match(/\b(20\d{2})\b/);
    const docYear = yearMatch?.[1] ?? String(new Date().getFullYear());
    const inferFolder = (): string => {
      if (!fundName) return '';
      switch (documentCategory) {
        case 'capitalCall':     return `/${fundName}/Capital Calls/${docYear}`;
        case 'distribution':    return `/${fundName}/Distributions/${docYear}`;
        case 'quarterlyReport': return `/${fundName}/Management Reports`;
        case 'annualReport':    return `/${fundName}/Management Reports`;
        case 'tax':             return `/${fundName}/Other Communications/Tax Certificates 2025`;
        case 'legal':           return `/${fundName}/Legal Documents`;
        case 'kyc':             return `/${fundName}/Legal Documents`;
        default:                return `/${fundName}`;
      }
    };
    const inferredFolder = defaultFolder || inferFolder();

    return {
      name: rawName,
      description: detectedInvestor
        ? `${rawName} — auto-tagged for ${detectedInvestor.name}.`
        : `${rawName} — auto-analyzed.`,
      documentCategory,
      folder: inferredFolder,
      language: 'en',
      restrictToLanguage: false,
      targetType,
      targetSegments: [],
      targetInvestors,
      targetSubscriptions,
      targetFunds,
      accessRoles: ['Investor'],
      watermark: false,
      downloadable: true,
      printable: true,
      tags: [
        documentCategory !== 'other' ? documentCategory : '',
        detectedInvestor ? detectedInvestor.name : '',
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
        documentCategory: undefined,
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

  // Synthesize empty PDF Files from a list of filenames and feed them to the
  // existing upload pipeline — used by the demo loader buttons.
  const loadDemoScenario = (scenario: DemoScenario) => {
    const dt = new DataTransfer();
    scenario.files.forEach(name => {
      const blob = buildDemoPdfBlob(name);
      dt.items.add(new File([blob], name, { type: 'application/pdf' }));
    });
    handleFileUpload(dt.files);
  };

  // Download each demo file as a real (minimal) PDF so the user can
  // re-upload them by hand for a more realistic walk-through.
  const downloadDemoScenario = (scenario: DemoScenario) => {
    scenario.files.forEach((name, i) => {
      // Stagger downloads to avoid browser-level multi-file blockers.
      setTimeout(() => {
        const blob = buildDemoPdfBlob(name);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, i * 150);
    });
    toast.success(t('ged.dataRoom.massUpload.wizard.demo.downloadStartedTitle'), {
      description: t('ged.dataRoom.massUpload.wizard.demo.downloadStartedDesc', {
        count: scenario.files.length,
      }),
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
  // ---------------------------------------------------------------------------
  // Batches (lots)
  // ---------------------------------------------------------------------------

  /** Toggle a batch's expanded state in the step-2 table. */
  const toggleBatchExpanded = (batchId: string) => {
    setExpandedBatchIds((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  /** Apply a batch's consolidated/global values to all its child files.
   * Only the validation team is mandatorily uniform; folder & targeting are
   * propagated only when the matching mode is "global". Notification stays
   * per-document. */
  const propagateBatchToFiles = (batch: UploadBatch, files: UploadedFile[]): UploadedFile[] =>
    files.map((f) => {
      if (f.batchId !== batch.id) return f;
      const next: UploadedFile = {
        ...f,
        validationTeam: batch.validationTeam,
      };
      if (batch.folderMode === 'global') {
        next.folder = batch.globalFolder;
      }
      if (batch.targetingMode === 'global') {
        next.targetType = batch.globalTargeting.targetType;
        next.targetSegments = batch.globalTargeting.targetSegments;
        next.targetInvestors = batch.globalTargeting.targetInvestors;
        next.targetSubscriptions = batch.globalTargeting.targetSubscriptions;
        next.targetFunds = batch.globalTargeting.targetFunds;
      }
      return next;
    });

  /** Toggle the bulk-edit form into "create a batch" mode. The batch is not
   * created yet — the form gains a name input and a summary, and the bottom
   * action is replaced by a "Créer le lot" button gated on notification +
   * validation team being configured. */
  const handleCreateBatch = () => {
    if (selectedFiles.length < 2) {
      toast.error(t('ged.dataRoom.massUpload.wizard.bulk.selectAtLeastTwo'));
      return;
    }
    // Refuse if any selected file already belongs to another batch.
    const alreadyBatched = uploadedFiles.filter(
      (f) => selectedFiles.includes(f.id) && f.batchId,
    );
    if (alreadyBatched.length > 0) {
      toast.error(t('ged.dataRoom.massUpload.wizard.bulk.alreadyBatchedTitle'), {
        description: t('ged.dataRoom.massUpload.wizard.bulk.alreadyBatchedDesc'),
      });
      return;
    }
    setBatchCreationMode(true);
    setBatchNameDraft(t('ged.dataRoom.massUpload.wizard.bulk.batchNamePrefix', { n: batches.length + 1 }));
    // Notification & validation team are CONSOLIDATED at the batch level —
    // ensure both are part of the staged fields so the user is forced to
    // configure them before being able to confirm.
    setBulkFields((prev) => {
      const next = new Set<BulkFieldKey>(prev);
      next.add('validationTeam');
      return Array.from(next);
    });
  };

  const handleCancelBatchCreation = () => {
    setBatchCreationMode(false);
    setBatchNameDraft('');
    setEditingBatchId(null);
    setBulkFields([]);
    setBulkValues({});
    setSelectedFiles([]);
  };

  /** Validate the batch creation form. Returns the reason string when the form
   * cannot be confirmed yet, or null when ready. Only the validation team is
   * required to be uniform — notification stays per-document. */
  const batchCreationBlockReason = (): string | null => {
    if (!batchCreationMode) return null;
    if (selectedFiles.length < 2) return t('ged.dataRoom.massUpload.wizard.bulk.selectAtLeastTwoShort');
    if (!batchNameDraft.trim()) return t('ged.dataRoom.massUpload.wizard.bulk.namelessBatch');
    if (!bulkFields.includes('validationTeam')) return t('ged.dataRoom.massUpload.wizard.bulk.validationTeamRequired');
    const team = bulkValues.validationTeam ?? [];
    if (team.length === 0) return t('ged.dataRoom.massUpload.wizard.bulk.chooseValidationTeam');
    return null;
  };

  /** Confirm batch creation — applies staged bulk values to the selected files,
   * creates the batch with consolidated/global config derived from the staged
   * fields, and rattaches the files. */
  const handleConfirmCreateBatch = () => {
    const block = batchCreationBlockReason();
    if (block) {
      toast.error(block);
      return;
    }
    const firstFile = uploadedFiles.find((f) => f.id === selectedFiles[0]);
    const targeting = bulkValues.targeting ?? {
      targetType: firstFile?.targetType ?? 'all',
      targetSegments: firstFile?.targetSegments ?? [],
      targetInvestors: firstFile?.targetInvestors ?? [],
      targetSubscriptions: firstFile?.targetSubscriptions ?? [],
      targetFunds: firstFile?.targetFunds ?? [],
    };
    const batch: UploadBatch = {
      id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: batchNameDraft.trim(),
      validationTeam: bulkValues.validationTeam ?? [],
      // If the user staged a folder/targeting value in the bulk form we treat
      // it as a global batch-level value; otherwise members keep their own.
      folderMode: bulkFields.includes('folder') ? 'global' : 'per-document',
      globalFolder: bulkValues.folder ?? '',
      targetingMode: bulkFields.includes('targeting') ? 'global' : 'per-document',
      globalTargeting: targeting,
    };
    setBatches((prev) => [...prev, batch]);
    setUploadedFiles((prev) =>
      propagateBatchToFiles(
        batch,
        prev.map((f) => {
          if (!selectedFiles.includes(f.id)) return f;
          // Per-document fields not consolidated by the batch still get the
          // staged bulk values (e.g. language, notification) so the bulk
          // values aren't lost.
          const next: UploadedFile = { ...f, batchId: batch.id };
          if (bulkFields.includes('language') && bulkValues.language !== undefined) {
            next.language = bulkValues.language;
          }
          if (bulkFields.includes('notification') && bulkValues.notification) {
            next.notify = bulkValues.notification.notify;
            next.emailTemplate = bulkValues.notification.emailTemplate;
          }
          // When folder/targeting are NOT global, still apply the staged value
          // to each member as a starting point (heterogeneous lot).
          if (bulkFields.includes('folder') && batch.folderMode !== 'global' && bulkValues.folder !== undefined) {
            next.folder = bulkValues.folder;
          }
          return next;
        }),
      ),
    );
    setExpandedBatchIds((prev) => new Set(prev).add(batch.id));
    setEditingBatchId(null);
    setBatchCreationMode(false);
    setBatchNameDraft('');
    setBulkFields([]);
    setBulkValues({});
    setSelectedFiles([]);
    toast.success(t('ged.dataRoom.massUpload.wizard.bulk.batchCreated'), {
      description: t('ged.dataRoom.massUpload.wizard.bulk.batchCreatedDesc', { count: selectedFiles.length, name: batch.name }),
    });
  };

  /** Open the top form pre-filled with the batch's current configuration so
   * the user can re-edit the lot. The form re-uses the batchCreationMode flow
   * (name input, summary, gate) but persists onto the existing batch. */
  const handleConfigureBatch = (batchId: string) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;
    const fields: BulkFieldKey[] = ['validationTeam'];
    const values: typeof bulkValues = {
      validationTeam: batch.validationTeam,
    };
    if (batch.folderMode === 'global') {
      fields.push('folder');
      values.folder = batch.globalFolder;
    }
    if (batch.targetingMode === 'global') {
      fields.push('targeting');
      values.targeting = batch.globalTargeting;
    }
    setBulkFields(fields);
    setBulkValues(values);
    setBatchNameDraft(batch.name);
    setBatchCreationMode(true);
    setEditingBatchId(batchId);
    // Surface the batch's children as the working selection so the form is
    // visible (it is anchored on selectedFiles).
    setSelectedFiles(uploadedFiles.filter((f) => f.batchId === batchId).map((f) => f.id));
  };

  /** Persist edits made through the top form for an existing batch. */
  const handleSaveBatchEdit = () => {
    if (!editingBatchId) return;
    const block = batchCreationBlockReason();
    if (block) {
      toast.error(block);
      return;
    }
    const targeting = bulkValues.targeting ?? {
      targetType: 'all',
      targetSegments: [],
      targetInvestors: [],
      targetSubscriptions: [],
      targetFunds: [],
    };
    handleUpdateBatch(editingBatchId, {
      name: batchNameDraft.trim(),
      validationTeam: bulkValues.validationTeam ?? [],
      folderMode: bulkFields.includes('folder') ? 'global' : 'per-document',
      globalFolder: bulkValues.folder ?? '',
      targetingMode: bulkFields.includes('targeting') ? 'global' : 'per-document',
      globalTargeting: targeting,
    });
    // Per-document fields the user staged are propagated as starting values
    // (mirrors the create flow).
    if (bulkFields.includes('language') && bulkValues.language !== undefined) {
      setUploadedFiles((prev) =>
        prev.map((f) => (f.batchId === editingBatchId ? { ...f, language: bulkValues.language! } : f)),
      );
    }
    if (bulkFields.includes('notification') && bulkValues.notification) {
      const n = bulkValues.notification;
      setUploadedFiles((prev) =>
        prev.map((f) => (f.batchId === editingBatchId ? { ...f, notify: n.notify, emailTemplate: n.emailTemplate } : f)),
      );
    }
    setEditingBatchId(null);
    setBatchCreationMode(false);
    setBatchNameDraft('');
    setBulkFields([]);
    setBulkValues({});
    setSelectedFiles([]);
    toast.success(t('ged.dataRoom.massUpload.wizard.bulk.batchUpdated'));
  };

  /** Detach a single file from its batch (file becomes standalone again). */
  const handleDetachFromBatch = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (!file?.batchId) return prev;
      const updated = prev.map((f) => (f.id === fileId ? { ...f, batchId: undefined } : f));
      // If the batch is now empty, dissolve it.
      const batchId = file.batchId;
      const stillHasMembers = updated.some((f) => f.batchId === batchId);
      if (!stillHasMembers) {
        setBatches((prevB) => prevB.filter((b) => b.id !== batchId));
        setExpandedBatchIds((prevE) => {
          const next = new Set(prevE);
          next.delete(batchId);
          return next;
        });
      }
      return updated;
    });
    toast.info(t('ged.dataRoom.massUpload.wizard.bulk.fileDetached'));
  };

  /** Update a batch (and propagate consolidated/global fields to its files). */
  const handleUpdateBatch = (batchId: string, patch: Partial<UploadBatch>) => {
    setBatches((prev) => {
      const next = prev.map((b) => (b.id === batchId ? { ...b, ...patch } : b));
      const updated = next.find((b) => b.id === batchId);
      if (updated) {
        setUploadedFiles((files) => propagateBatchToFiles(updated, files));
      }
      return next;
    });
  };

  /** Dissolve a batch entirely — children become standalone again. */
  const handleDissolveBatch = (batchId: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.batchId === batchId ? { ...f, batchId: undefined } : f)),
    );
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    setExpandedBatchIds((prev) => {
      const next = new Set(prev);
      next.delete(batchId);
      return next;
    });
    if (editingBatchId === batchId) setEditingBatchId(null);
    toast.info(t('ged.dataRoom.massUpload.wizard.bulk.batchDissolved'));
  };

  /** Signature used by auto-grouping to decide which files share a batch:
   * identical targeting (type + lists), notification (on/off + template) and
   * validation team. Lists are sorted to ignore selection order. */
  const computeGroupSignature = (f: UploadedFile): string => {
    const join = (xs: string[]) => [...xs].sort().join(',');
    return [
      f.targetType,
      join(f.targetSegments),
      join(f.targetInvestors),
      join(f.targetSubscriptions),
      join(f.targetFunds),
      f.notify ? '1' : '0',
      f.emailTemplate ?? '',
      join(f.validationTeam),
    ].join('|');
  };

  /** Detach every file from any batch and clear the batches list. Used by the
   * auto-group toggle (when turned off) and as a first step before
   * re-grouping. */
  const dissolveAllBatches = () => {
    setUploadedFiles((prev) => prev.map((f) => ({ ...f, batchId: undefined })));
    setBatches([]);
    setExpandedBatchIds(new Set());
    setEditingBatchId(null);
  };

  /** Deterministic batch id derived from the group signature so re-running
   * grouping on stable inputs produces the same id (no churn, no infinite
   * loops in the dynamic re-grouping effect). */
  const sigToBatchId = (sig: string): string => {
    let h = 0;
    for (let i = 0; i < sig.length; i++) {
      h = (Math.imul(h, 31) + sig.charCodeAt(i)) | 0;
    }
    return `auto-batch-${(h >>> 0).toString(36)}`;
  };

  /** Recompute batches by signature. Two or more files sharing the same
   * targeting + notification + validation team are grouped together. Files
   * with a unique signature, or targeted to "Tous", remain standalone. The
   * function is idempotent — if the desired partition already matches state,
   * no React updates are emitted (important for the dynamic effect below). */
  const runAutoGrouping = () => {
    const groups = new Map<string, UploadedFile[]>();
    uploadedFiles.forEach((f) => {
      if (f.targetType === 'all') return;
      const k = computeGroupSignature(f);
      const list = groups.get(k) ?? [];
      list.push(f);
      groups.set(k, list);
    });

    const existingNameById = new Map(batches.map((b) => [b.id, b.name]));
    const newBatches: UploadBatch[] = [];
    const fileToBatchId = new Map<string, string>();
    let idx = 1;
    groups.forEach((files, sig) => {
      if (files.length < 2) return;
      const first = files[0];
      const id = sigToBatchId(sig);
      newBatches.push({
        id,
        // Preserve a user-renamed batch when the same group reappears.
        name:
          existingNameById.get(id) ??
          t('ged.dataRoom.massUpload.wizard.bulk.batchNamePrefix', { n: idx }),
        validationTeam: first.validationTeam,
        folderMode: 'per-document',
        globalFolder: '',
        targetingMode: 'global',
        globalTargeting: {
          targetType: first.targetType,
          targetSegments: first.targetSegments,
          targetInvestors: first.targetInvestors,
          targetSubscriptions: first.targetSubscriptions,
          targetFunds: first.targetFunds,
        },
      });
      files.forEach((f) => fileToBatchId.set(f.id, id));
      idx++;
    });

    // Short-circuit when nothing actually changes — both the file→batch
    // assignment AND the set of batch ids must be identical to skip.
    const sameAssignments = uploadedFiles.every(
      (f) => (f.batchId ?? undefined) === fileToBatchId.get(f.id),
    );
    const currentIds = new Set(batches.map((b) => b.id));
    const desiredIds = new Set(newBatches.map((b) => b.id));
    const sameBatchSet =
      currentIds.size === desiredIds.size &&
      [...desiredIds].every((id) => currentIds.has(id));
    if (sameAssignments && sameBatchSet) return;

    setBatches(newBatches);
    setUploadedFiles((prev) =>
      prev.map((f) => ({ ...f, batchId: fileToBatchId.get(f.id) })),
    );
    setExpandedBatchIds((prev) => {
      // Keep the collapse state the user chose for batches that still exist;
      // expand freshly-created batches by default.
      const next = new Set<string>();
      for (const b of newBatches) {
        const wasExisting = currentIds.has(b.id);
        if (!wasExisting || prev.has(b.id)) next.add(b.id);
      }
      return next;
    });
  };

  const handleToggleAutoGroup = (checked: boolean) => {
    setAutoGroupEnabled(checked);
    if (!checked) dissolveAllBatches();
    // When checked === true, the dynamic effect below picks up the new value
    // on the next render and groups the current files.
  };

  // Are we on the final configuration step? Used as a gate for the dynamic
  // re-grouping effect (no point running on the upload step).
  const isConfigStep =
    (currentStep === 2 && !deepReview) ||
    (deepReview && currentStep === 2 + uploadedFiles.length);

  // Dynamic re-grouping: whenever the toggle is on AND a file's
  // grouping-relevant fields (targeting, notification, validation team)
  // change, recompute the batches automatically. The dependency string is a
  // concatenation of each file's signature so the effect only fires on real
  // signature changes (not on batchId updates).
  const filesSignatureKey = uploadedFiles
    .map((f) => `${f.id}:${computeGroupSignature(f)}:${f.targetType === 'all' ? 'all' : 'scoped'}`)
    .join('|');
  useEffect(() => {
    if (!isConfigStep || !autoGroupEnabled) return;
    runAutoGrouping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesSignatureKey, isConfigStep, autoGroupEnabled]);

  // Field catalogue used to render the bulk edit picker chips and the per-field editors.
  const BULK_FIELDS: { key: BulkFieldKey; label: string; icon: LucideIcon }[] = [
    { key: 'documentType', label: t('ged.dataRoom.massUpload.wizard.bulk.fieldDocumentType'), icon: FileText },
    { key: 'folder', label: t('ged.dataRoom.massUpload.wizard.bulk.fieldFolder'), icon: Folder },
    { key: 'language', label: t('ged.dataRoom.massUpload.wizard.bulk.fieldLanguage'), icon: Languages },
    { key: 'targeting', label: t('ged.dataRoom.massUpload.wizard.bulk.fieldTargeting'), icon: Users },
    { key: 'notification', label: t('ged.dataRoom.massUpload.wizard.bulk.fieldNotification'), icon: Bell },
    { key: 'validationTeam', label: t('ged.dataRoom.massUpload.wizard.bulk.fieldValidationTeams'), icon: Shield },
  ];

  const toggleBulkField = (key: BulkFieldKey) => {
    setBulkFields(prev => prev.includes(key) ? prev.filter(f => f !== key) : [...prev, key]);
  };

  const removeBulkField = (key: BulkFieldKey) => {
    setBulkFields(prev => prev.filter(f => f !== key));
    setBulkValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleBulkReset = () => {
    setBulkFields([]);
    setBulkValues({});
  };

  const handleBulkApply = () => {
    if (bulkFields.length === 0) {
      toast.error(t('ged.dataRoom.massUpload.wizard.bulk.noFieldSelected'), {
        description: t('ged.dataRoom.massUpload.wizard.bulk.noFieldSelectedDesc'),
      });
      return;
    }
    setUploadedFiles(prev =>
      prev.map(f => {
        if (!selectedFiles.includes(f.id)) return f;
        const updated: UploadedFile = { ...f };
        for (const key of bulkFields) {
          if (key === 'documentType') {
            updated.documentCategory = bulkValues.documentType;
          } else if (key === 'folder') {
            updated.folder = bulkValues.folder ?? '';
          } else if (key === 'language') {
            updated.language = bulkValues.language ?? '';
          } else if (key === 'targeting') {
            const t = bulkValues.targeting ?? {
              targetType: 'all',
              targetSegments: [],
              targetInvestors: [],
              targetSubscriptions: [],
              targetFunds: [],
            };
            updated.targetType = t.targetType;
            updated.targetSegments = t.targetSegments;
            updated.targetInvestors = t.targetInvestors;
            updated.targetSubscriptions = t.targetSubscriptions;
            updated.targetFunds = t.targetFunds;
          } else if (key === 'notification') {
            const n = bulkValues.notification ?? { notify: false, emailTemplate: '' };
            updated.notify = n.notify;
            updated.emailTemplate = n.emailTemplate;
          } else if (key === 'validationTeam') {
            updated.validationTeam = bulkValues.validationTeam ?? [];
          }
        }
        return updated;
      })
    );
    toast.success(t('ged.dataRoom.massUpload.wizard.bulk.bulkApplied'), {
      description: t('ged.dataRoom.massUpload.wizard.bulk.bulkAppliedDesc', { files: selectedFiles.length, fields: bulkFields.length }),
    });
  };

  // Open the document in a new tab
  const handlePreviewDocument = (file: UploadedFile) => {
    const url = URL.createObjectURL(file.file);
    window.open(url, '_blank');
    toast.info(t('ged.dataRoom.massUpload.wizard.bulk.documentOpened'), {
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

    // Push the freshly imported documents into the validation listing as
    // pending. Files attached to a wizard batch become a single validation
    // batch; the rest become standalone validation documents.
    const submittedAt = new Date().toISOString();
    const filesByBatch = new Map<string, UploadedFile[]>();
    const standaloneFiles: UploadedFile[] = [];
    uploadedFiles.forEach((f) => {
      if (f.batchId) {
        const list = filesByBatch.get(f.batchId) ?? [];
        list.push(f);
        filesByBatch.set(f.batchId, list);
      } else {
        standaloneFiles.push(f);
      }
    });

    filesByBatch.forEach((files, batchId) => {
      const batch = batches.find((b) => b.id === batchId);
      if (!batch) return;
      const validationBatch = buildValidationBatch(batch, files, submittedAt);
      const validationDocs = files.map((f) =>
        buildValidationDocument(f, submittedAt, batchId),
      );
      addUploadResults(validationBatch, validationDocs);
    });

    if (standaloneFiles.length > 0) {
      const validationDocs = standaloneFiles.map((f) =>
        buildValidationDocument(f, submittedAt),
      );
      addUploadResults(null, validationDocs);
    }

    toast.success(t('ged.dataRoom.massUpload.wizard.toast.importSuccessTitle'), {
      description: t('ged.dataRoom.massUpload.wizard.toast.importSuccessDesc', {
        count: uploadedFiles.length,
      }),
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

  // Toast when all files are analyzed. Batching is no longer performed here —
  // it is driven by the "Grouper les documents" toggle on the configuration
  // step (see `runAutoGrouping` and its dynamic effect).
  useEffect(() => {
    if (fileStats.total === 0) {
      setAllAnalyzedToastShown(false);
      return;
    }
    if (fileStats.uploaded !== fileStats.total) return;
    if (allAnalyzedToastShown) return;

    toast.success(t('ged.dataRoom.massUpload.wizard.aiAnalysisCompleteTitle'), {
      description: t('ged.dataRoom.massUpload.wizard.aiAnalysisCompleteDesc', { count: fileStats.total }),
      duration: 5000,
    });
    setAllAnalyzedToastShown(true);
  }, [fileStats, allAnalyzedToastShown, t]);

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
                  {t('ged.dataRoom.massUpload.wizard.headerTitle')}
                </h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {isReviewStep
                    ? t('ged.dataRoom.massUpload.wizard.documentOf', { current: currentReviewingDocIndex + 1, total: uploadedFiles.length })
                    : (deepReview && currentStep > 1 + uploadedFiles.length
                        ? t('ged.dataRoom.massUpload.wizard.stepFinal', { total: totalSteps })
                        : t('ged.dataRoom.massUpload.wizard.stepOf', { current: currentStep, total: totalSteps }))
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
                  { num: 1, label: t('ged.dataRoom.massUpload.wizard.stepImport'), icon: Sparkles },
                  { num: 2, label: t('ged.dataRoom.massUpload.wizard.stepConfiguration'), icon: Check }
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
                  { num: 1, label: t('ged.dataRoom.massUpload.wizard.stepImport'), icon: Sparkles },
                  { num: 2, label: t('ged.dataRoom.massUpload.wizard.stepDeepReview'), icon: Eye, isRange: true },
                  { num: 3, label: t('ged.dataRoom.massUpload.wizard.stepFinalValidation'), icon: Check }
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
                      className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3"
                    >
                      <Folder className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {effectiveOrigin.kind === 'folder'
                            ? t('ged.dataRoom.massUpload.originFolderTitle')
                            : t('ged.dataRoom.massUpload.originSpaceTitle')}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-600">
                          {effectiveOrigin.kind === 'folder'
                            ? t('ged.dataRoom.massUpload.originFolderBody', {
                                name: effectiveOrigin.name,
                                spaceName: effectiveOrigin.spaceName ?? '',
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
                              : effectiveOrigin.name}
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
                      {t('ged.dataRoom.massUpload.wizard.chooseFile')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {t('ged.dataRoom.massUpload.wizard.maxSize')}
                    </p>
                    <p className="mt-2 text-[11px] text-gray-400">
                      {t('ged.dataRoom.massUpload.wizard.formats')}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-gray-500">
                      <Sparkles className="h-3 w-3" />
                      {t('ged.dataRoom.massUpload.wizard.aiAutofill')}
                    </p>
                  </div>

                  {/* Demo loader — visible only when no files have been added yet */}
                  {uploadedFiles.length === 0 && (
                    <div className="mt-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/40 px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-gray-800">
                          {t('ged.dataRoom.massUpload.wizard.demo.title')}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {t('ged.dataRoom.massUpload.wizard.demo.subtitle')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {demoScenarios.map(scenario => (
                          <div
                            key={scenario.id}
                            className="rounded-md border border-gray-200 bg-white px-3 py-2"
                          >
                            <div className="flex items-start gap-2">
                              <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900">
                                  {t(scenario.titleKey)}
                                </div>
                                <div className="mt-0.5 text-[11px] text-gray-500">
                                  {t(scenario.descKey, { count: scenario.files.length })}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 flex gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadDemoScenario(scenario);
                                }}
                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                              >
                                <DownloadIcon className="h-3 w-3" />
                                {t('ged.dataRoom.massUpload.wizard.demo.downloadCta')}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadDemoScenario(scenario);
                                }}
                                className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-amber-600 transition-colors"
                              >
                                <Sparkles className="h-3 w-3" />
                                {t('ged.dataRoom.massUpload.wizard.demo.loadCta')}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                              {t('ged.dataRoom.massUpload.wizard.deepReviewTitle')}
                            </h4>
                            <Switch
                              checked={deepReview}
                              onCheckedChange={setDeepReview}
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {t('ged.dataRoom.massUpload.wizard.deepReviewDesc')}
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
                            ? t('ged.dataRoom.massUpload.wizard.analyzing')
                            : t('ged.dataRoom.massUpload.wizard.uploading')}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {fileStats.analyzing > 0
                            ? t('ged.dataRoom.massUpload.wizard.analyzingDesc', { count: fileStats.analyzing })
                            : t('ged.dataRoom.massUpload.wizard.uploadingDesc', { count: fileStats.uploading })}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {t('ged.dataRoom.massUpload.wizard.uploadedFiles', { uploaded: fileStats.uploaded, total: uploadedFiles.length })}
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
                          {t('ged.dataRoom.massUpload.wizard.deleteAll')}
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
                                  aria-label={t('ged.dataRoom.massUpload.wizard.removeFileAria')}
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
                          {t('ged.dataRoom.massUpload.wizard.documentReview', { current: currentReviewingDocIndex + 1, total: uploadedFiles.length })}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t('ged.dataRoom.massUpload.wizard.documentReviewDesc')}
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
                        {t('ged.dataRoom.massUpload.wizard.configTitle')}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {t('ged.dataRoom.massUpload.wizard.configSubtitle')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
                            <Layers3 className="h-3.5 w-3.5 text-gray-500" />
                            <Label
                              htmlFor="auto-group-toggle"
                              className="cursor-pointer text-xs text-gray-700"
                            >
                              {t('ged.dataRoom.massUpload.wizard.bulk.autoGroupLabel')}
                            </Label>
                            <Switch
                              id="auto-group-toggle"
                              checked={autoGroupEnabled}
                              onCheckedChange={handleToggleAutoGroup}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">
                            {t('ged.dataRoom.massUpload.wizard.bulk.autoGroupTooltip')}
                          </span>
                        </TooltipContent>
                      </Tooltip>
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

                              toast.success(t('ged.dataRoom.massUpload.wizard.exportToastTitle'), {
                                description: t('ged.dataRoom.massUpload.wizard.exportToastDesc', { count: uploadedFiles.length })
                              });
                            }}
                          >
                            <Download className="h-3.5 w-3.5" />
                            {t('ged.dataRoom.massUpload.wizard.export')}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('ged.dataRoom.massUpload.wizard.exportTooltip')}</TooltipContent>
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

                                    toast.success(t('ged.dataRoom.massUpload.wizard.importToastTitle'), {
                                      description: t('ged.dataRoom.massUpload.wizard.importToastDesc')
                                    });

                                    setTimeout(() => {
                                      toast.success(t('ged.dataRoom.massUpload.wizard.importDoneTitle'), {
                                        description: t('ged.dataRoom.massUpload.wizard.importDoneDesc', { count: lines.length - 1 })
                                      });
                                    }, 500);
                                  } catch (error) {
                                    toast.error(t('ged.dataRoom.massUpload.wizard.importErrorTitle'), {
                                      description: t('ged.dataRoom.massUpload.wizard.importErrorDesc')
                                    });
                                  }
                                };
                                reader.readAsText(file);
                              };
                              input.click();
                            }}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {t('ged.dataRoom.massUpload.wizard.import')}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('ged.dataRoom.massUpload.wizard.importTooltip')}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Bulk Edit Bar — sober design-system styling */}
                  <AnimatePresence>
                    {selectedFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-gray-300 bg-white px-2 py-0.5 text-xs font-medium text-gray-700">
                              {t(
                                selectedFiles.length > 1
                                  ? 'ged.dataRoom.massUpload.wizard.bulk.selectedMany'
                                  : 'ged.dataRoom.massUpload.wizard.bulk.selectedOne',
                                { count: selectedFiles.length }
                              )}
                            </Badge>
                            <span className="text-xs text-gray-600">{t('ged.dataRoom.massUpload.wizard.bulk.editGroup')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {!batchCreationMode && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1.5 text-xs"
                                onClick={handleCreateBatch}
                                disabled={selectedFiles.length < 2}
                                title={
                                  selectedFiles.length < 2
                                    ? t('ged.dataRoom.massUpload.wizard.bulk.createBatchDisabledTooltip')
                                    : t('ged.dataRoom.massUpload.wizard.bulk.createBatchTooltip')
                                }
                              >
                                <Layers3 className="h-3 w-3" />
                                {t('ged.dataRoom.massUpload.wizard.bulk.createBatch')}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1.5 text-xs text-gray-600 hover:text-gray-900"
                              onClick={() => {
                                setSelectedFiles([]);
                                handleCancelBatchCreation();
                              }}
                            >
                              <X className="h-3 w-3" />
                              {t('ged.dataRoom.massUpload.wizard.bulk.deselect')}
                            </Button>
                          </div>
                        </div>

                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className="mt-2 space-y-3 border-t border-gray-200 pt-3"
                        >
                            {/* Step A — pick which fields to modify in bulk */}
                            <div className="space-y-1">
                              <Label className="text-[11px] font-medium text-gray-700">{t('ged.dataRoom.massUpload.wizard.bulk.fieldsToModify')}</Label>
                              <Popover open={bulkFieldsPickerOpen} onOpenChange={setBulkFieldsPickerOpen}>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex min-h-[36px] w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 py-1 text-left text-xs hover:border-gray-400"
                                  >
                                    {bulkFields.length === 0 ? (
                                      <span className="text-gray-400">{t('ged.dataRoom.massUpload.wizard.bulk.chooseFieldsPlaceholder')}</span>
                                    ) : (
                                      bulkFields.map((key) => {
                                        const cfg = BULK_FIELDS.find((f) => f.key === key);
                                        if (!cfg) return null;
                                        const Icon = cfg.icon;
                                        return (
                                          <span
                                            key={key}
                                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700"
                                          >
                                            <Icon className="h-3 w-3 text-gray-500" />
                                            {cfg.label}
                                            <span
                                              role="button"
                                              tabIndex={0}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                removeBulkField(key);
                                              }}
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                  e.stopPropagation();
                                                  e.preventDefault();
                                                  removeBulkField(key);
                                                }
                                              }}
                                              className="ml-0.5 inline-flex cursor-pointer rounded-full p-0.5 hover:bg-gray-200"
                                              aria-label={t('ged.dataRoom.massUpload.wizard.bulk.removeField', { field: cfg.label })}
                                            >
                                              <X className="h-2.5 w-2.5" />
                                            </span>
                                          </span>
                                        );
                                      })
                                    )}
                                    <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-gray-400" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[280px] p-0" align="start">
                                  <Command>
                                    <CommandList>
                                      <CommandEmpty>{t('ged.dataRoom.massUpload.wizard.bulk.noField')}</CommandEmpty>
                                      <CommandGroup>
                                        {BULK_FIELDS.map((f) => {
                                          const Icon = f.icon;
                                          const checked = bulkFields.includes(f.key);
                                          return (
                                            <CommandItem
                                              key={f.key}
                                              onSelect={() => toggleBulkField(f.key)}
                                              className="text-xs"
                                            >
                                              <Checkbox checked={checked} className="mr-2" />
                                              <Icon className="mr-2 h-3 w-3 text-gray-500" />
                                              {f.label}
                                            </CommandItem>
                                          );
                                        })}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>

                            {/* Step B — per-field value editors */}
                            {bulkFields.length > 0 && (
                              <div className="space-y-2.5">
                                {bulkFields.includes('documentType') && (
                                  <div className="space-y-1">
                                    <Label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                      <FileText className="h-3 w-3 text-gray-400" />
                                      {t('ged.dataRoom.massUpload.wizard.bulk.fieldDocumentType')}
                                    </Label>
                                    <Select
                                      value={bulkValues.documentType ?? ''}
                                      onValueChange={(value) =>
                                        setBulkValues((prev) => ({ ...prev, documentType: value as DocumentCategory }))
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectDocumentType')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableDocumentCategories.map((cat) => (
                                          <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                            <div className="flex items-center gap-2">
                                              <FileText className="h-3 w-3 text-gray-400" />
                                              {t(cat.labelKey)}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {bulkFields.includes('folder') && (
                                  <div className="space-y-1">
                                    <Label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                      <Folder className="h-3 w-3 text-gray-400" />
                                      {t('ged.dataRoom.massUpload.wizard.bulk.fieldFolder')}
                                    </Label>
                                    <Select
                                      value={bulkValues.folder ?? ''}
                                      onValueChange={(value) => setBulkValues((prev) => ({ ...prev, folder: value }))}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectFolder')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableFolders.map((folder) => (
                                          <SelectItem key={folder.id} value={folder.path} className="text-xs">
                                            <div className="flex items-center gap-2">
                                              <Folder className="h-3 w-3 text-gray-400" />
                                              {folder.path}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {bulkFields.includes('language') && (
                                  <div className="space-y-1">
                                    <Label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                      <Languages className="h-3 w-3 text-gray-400" />
                                      {t('ged.dataRoom.massUpload.wizard.bulk.fieldLanguage')}
                                    </Label>
                                    <Select
                                      value={bulkValues.language ?? ''}
                                      onValueChange={(value) => setBulkValues((prev) => ({ ...prev, language: value }))}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectLanguage')} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableLanguages.map((lang) => (
                                          <SelectItem key={lang.value} value={lang.value} className="text-xs">
                                            <div className="flex items-center gap-2">
                                              <span>{lang.flag}</span>
                                              {lang.label}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}

                                {bulkFields.includes('targeting') && (() => {
                                  const targeting: BulkTargetingValue = bulkValues.targeting ?? {
                                    targetType: 'all',
                                    targetSegments: [],
                                    targetInvestors: [],
                                    targetSubscriptions: [],
                                    targetFunds: [],
                                  };
                                  const updateTargeting = (patch: Partial<BulkTargetingValue>) =>
                                    setBulkValues((prev) => ({
                                      ...prev,
                                      targeting: { ...targeting, ...patch },
                                    }));
                                  return (
                                    <div className="space-y-1">
                                      <Label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                        <Users className="h-3 w-3 text-gray-400" />
                                        {t('ged.dataRoom.massUpload.wizard.bulk.fieldTargeting')}
                                      </Label>
                                      <Select
                                        value={targeting.targetType}
                                        onValueChange={(value) =>
                                          updateTargeting({
                                            targetType: value,
                                            targetSegments: [],
                                            targetInvestors: [],
                                            targetSubscriptions: [],
                                            targetFunds: [],
                                          })
                                        }
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectTargetingType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="all" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeAll')}</div></SelectItem>
                                          <SelectItem value="segment" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeSegment')}</div></SelectItem>
                                          <SelectItem value="investor" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeInvestor')}</div></SelectItem>
                                          <SelectItem value="subscription" className="text-xs"><div className="flex items-center gap-2"><FileText className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeSubscription')}</div></SelectItem>
                                          <SelectItem value="fund" className="text-xs"><div className="flex items-center gap-2"><Landmark className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeFund')}</div></SelectItem>
                                        </SelectContent>
                                      </Select>

                                      {targeting.targetType === 'segment' && (
                                        <Select
                                          value={targeting.targetSegments[0] ?? ''}
                                          onValueChange={(value) => updateTargeting({ targetSegments: [value] })}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectSegment')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableSegments.map((seg) => (
                                              <SelectItem key={seg} value={seg} className="text-xs">{seg}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}

                                      {targeting.targetType === 'investor' && (
                                        <Select
                                          value={targeting.targetInvestors[0] ?? ''}
                                          onValueChange={(value) => updateTargeting({ targetInvestors: [value] })}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectInvestor')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableInvestors.map((inv) => (
                                              <SelectItem key={inv.id} value={inv.id} className="text-xs">{inv.name}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}

                                      {targeting.targetType === 'subscription' && (
                                        <Select
                                          value={targeting.targetSubscriptions[0] ?? ''}
                                          onValueChange={(value) => updateTargeting({ targetSubscriptions: [value] })}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectSubscription')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableSubscriptions.map((sub) => (
                                              <SelectItem key={sub.id} value={sub.id} className="text-xs">
                                                {subscriptionLabel(sub)}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      )}

                                      {targeting.targetType === 'fund' && (
                                        <div className="flex gap-1.5">
                                          <Select
                                            value={targeting.targetFunds[0] ?? ''}
                                            onValueChange={(value) => updateTargeting({ targetFunds: [value] })}
                                          >
                                            <SelectTrigger className="h-8 flex-1 text-xs">
                                              <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectFund')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {availableFunds.map((fund) => (
                                                <SelectItem key={fund.id} value={fund.id} className="text-xs">{fund.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Select
                                            value={targeting.targetSegments[0] ?? ''}
                                            onValueChange={(value) => updateTargeting({ targetSegments: [value] })}
                                          >
                                            <SelectTrigger className="h-8 w-20 text-xs">
                                              <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectPart')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="A" className="text-xs">A</SelectItem>
                                              <SelectItem value="B" className="text-xs">B</SelectItem>
                                              <SelectItem value="C" className="text-xs">C</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}

                                {bulkFields.includes('notification') && (() => {
                                  const notification: BulkNotificationValue = bulkValues.notification ?? {
                                    notify: false,
                                    emailTemplate: '',
                                  };
                                  const updateNotification = (patch: Partial<BulkNotificationValue>) =>
                                    setBulkValues((prev) => ({
                                      ...prev,
                                      notification: { ...notification, ...patch },
                                    }));
                                  return (
                                    <div className="space-y-1">
                                      <Label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                        <Bell className="h-3 w-3 text-gray-400" />
                                        {t('ged.dataRoom.massUpload.wizard.bulk.fieldNotification')}
                                      </Label>
                                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5">
                                        <Switch
                                          checked={notification.notify}
                                          onCheckedChange={(checked) =>
                                            updateNotification({ notify: checked, emailTemplate: checked ? notification.emailTemplate : '' })
                                          }
                                        />
                                        <span className="text-xs text-gray-700">{t('ged.dataRoom.massUpload.wizard.notifyRecipients')}</span>
                                      </div>
                                      {notification.notify && (
                                        <Select
                                          value={notification.emailTemplate}
                                          onValueChange={(value) => updateNotification({ emailTemplate: value })}
                                        >
                                          <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectTemplate')} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableEmailTemplates.map((tpl) => {
                                              const Icon = tpl.icon;
                                              return (
                                                <SelectItem key={tpl.value} value={tpl.value} className="text-xs">
                                                  <div className="flex items-center gap-2">
                                                    <Icon className="h-3 w-3 text-gray-500" />
                                                    {t(tpl.labelKey)}
                                                  </div>
                                                </SelectItem>
                                              );
                                            })}
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </div>
                                  );
                                })()}

                                {bulkFields.includes('validationTeam') && (() => {
                                  const teamMissing = batchCreationMode && (bulkValues.validationTeam?.length ?? 0) === 0;
                                  return (
                                    <div className="space-y-1">
                                      <Label className="flex items-center gap-1.5 text-[11px] font-medium text-gray-600">
                                        <Shield className="h-3 w-3 text-gray-400" />
                                        {t('ged.dataRoom.massUpload.wizard.bulk.fieldValidationTeams')}
                                        {batchCreationMode && <span className="text-red-600">*</span>}
                                      </Label>
                                      <Select
                                        value={bulkValues.validationTeam?.[0] ?? ''}
                                        onValueChange={(value) =>
                                          setBulkValues((prev) => ({ ...prev, validationTeam: value ? [value] : [] }))
                                        }
                                      >
                                        <SelectTrigger className={`h-8 text-xs ${teamMissing ? 'border-red-300 ring-1 ring-red-200' : ''}`}>
                                          <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectTeam')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="admin" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamAdmin')}</SelectItem>
                                          <SelectItem value="compliance" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamCompliance')}</SelectItem>
                                          <SelectItem value="legal" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamLegal')}</SelectItem>
                                          <SelectItem value="ir" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamIR')}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      {teamMissing && (
                                        <p className="flex items-center gap-1 text-[11px] text-red-600">
                                          <AlertCircle className="h-3 w-3" />
                                          {t('ged.dataRoom.massUpload.wizard.noValidationTeam')}
                                        </p>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Batch creation — name input + summary derived from staged values */}
                            {batchCreationMode && (() => {
                              const summary: { label: string; value: string }[] = [];
                              if (bulkFields.includes('folder')) {
                                summary.push({
                                  label: t('ged.dataRoom.massUpload.wizard.bulk.summaryFolder'),
                                  value: bulkValues.folder
                                    ? t('ged.dataRoom.massUpload.wizard.bulk.summaryFolderGlobal', { folder: bulkValues.folder })
                                    : t('ged.dataRoom.massUpload.wizard.bulk.summaryFolderPerDoc'),
                                });
                              }
                              if (bulkFields.includes('language')) {
                                summary.push({
                                  label: t('ged.dataRoom.massUpload.wizard.bulk.summaryLanguage'),
                                  value:
                                    availableLanguages.find((l) => l.value === bulkValues.language)?.label ??
                                    t('ged.dataRoom.massUpload.wizard.bulk.summaryLanguageNone'),
                                });
                              }
                              if (bulkFields.includes('targeting')) {
                                const tg = bulkValues.targeting;
                                const typeMap: Record<string, string> = {
                                  all: t('ged.dataRoom.massUpload.wizard.bulk.targetingTypeAll'),
                                  segment: t('ged.dataRoom.massUpload.wizard.bulk.targetingTypeSegment'),
                                  investor: t('ged.dataRoom.massUpload.wizard.bulk.targetingTypeInvestor'),
                                  subscription: t('ged.dataRoom.massUpload.wizard.bulk.targetingTypeSubscription'),
                                  fund: t('ged.dataRoom.massUpload.wizard.bulk.targetingTypeFund'),
                                };
                                summary.push({
                                  label: t('ged.dataRoom.massUpload.wizard.bulk.summaryTargeting'),
                                  value: tg
                                    ? t('ged.dataRoom.massUpload.wizard.bulk.summaryTargetingGlobal', { type: typeMap[tg.targetType] ?? tg.targetType })
                                    : t('ged.dataRoom.massUpload.wizard.bulk.summaryTargetingPerDoc'),
                                });
                              }
                              if (bulkFields.includes('notification')) {
                                const n = bulkValues.notification;
                                summary.push({
                                  label: t('ged.dataRoom.massUpload.wizard.bulk.summaryNotification'),
                                  value: n
                                    ? n.notify
                                      ? t('ged.dataRoom.massUpload.wizard.bulk.summaryNotificationApplied', {
                                          template: (() => {
                                            const tpl = availableEmailTemplates.find((tpl) => tpl.value === n.emailTemplate);
                                            return tpl ? t(tpl.labelKey) : t('ged.dataRoom.massUpload.wizard.bulk.summaryNotificationTemplateMissing');
                                          })(),
                                        })
                                      : t('ged.dataRoom.massUpload.wizard.bulk.summaryNotificationDisabled')
                                    : t('ged.dataRoom.massUpload.wizard.bulk.summaryNotificationPerDoc'),
                                });
                              }
                              if (bulkFields.includes('validationTeam')) {
                                summary.push({
                                  label: t('ged.dataRoom.massUpload.wizard.bulk.summaryValidationTeam'),
                                  value: bulkValues.validationTeam?.[0] ?? t('ged.dataRoom.massUpload.wizard.bulk.summaryValidationTeamMissing'),
                                });
                              }
                              return (
                                <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50/40 p-3">
                                  <div className="flex items-center gap-2">
                                    <Layers3 className="h-3.5 w-3.5 text-blue-700" />
                                    <Label className="text-[11px] font-medium text-blue-900">
                                      {editingBatchId
                                        ? t('ged.dataRoom.massUpload.wizard.bulk.batchModification')
                                        : t('ged.dataRoom.massUpload.wizard.bulk.newBatch')}{' '}
                                      {t('ged.dataRoom.massUpload.wizard.bulk.consolidatedTeamSuffix')}
                                    </Label>
                                  </div>
                                  <Input
                                    value={batchNameDraft}
                                    onChange={(e) => setBatchNameDraft(e.target.value)}
                                    placeholder={t('ged.dataRoom.massUpload.wizard.bulk.batchNamePlaceholder')}
                                    className="h-8 text-sm border-blue-200 bg-white"
                                  />
                                  {summary.length > 0 && (
                                    <ul className="space-y-1 text-[11px] text-gray-700">
                                      {summary.map((row) => (
                                        <li key={row.label} className="flex items-baseline gap-2">
                                          <span className="font-medium text-gray-600">{row.label} :</span>
                                          <span className="text-gray-800">{row.value}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {(() => {
                                    const reason = batchCreationBlockReason();
                                    if (reason) {
                                      return (
                                        <div className="flex items-start gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-[11px] text-red-700">
                                          <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
                                          <span>{reason}</span>
                                        </div>
                                      );
                                    }
                                    return (
                                      <p className="text-[11px] text-blue-700/80">
                                        {t('ged.dataRoom.massUpload.wizard.bulk.consolidatedTeamHelper')}
                                      </p>
                                    );
                                  })()}
                                </div>
                              );
                            })()}

                            {/* Action bar — Modifier (apply only) OR Créer le lot (batch mode) */}
                            {(bulkFields.length > 0 || batchCreationMode) && (
                              <div className="flex items-center gap-2 pt-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-9 w-9 shrink-0 p-0"
                                      onClick={handleBulkReset}
                                    >
                                      <RotateCcw className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('ged.dataRoom.massUpload.wizard.bulk.resetSelection')}</TooltipContent>
                                </Tooltip>
                                {batchCreationMode ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      onClick={handleCancelBatchCreation}
                                      className="h-9"
                                    >
                                      {t('ged.dataRoom.massUpload.wizard.bulk.cancel')}
                                    </Button>
                                    {(() => {
                                      const reason = batchCreationBlockReason();
                                      const isEditing = !!editingBatchId;
                                      const btn = (
                                        <Button
                                          onClick={isEditing ? handleSaveBatchEdit : handleConfirmCreateBatch}
                                          disabled={!!reason}
                                          className="h-9 flex-1 text-white hover:opacity-90 disabled:opacity-60"
                                          style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                                        >
                                          <Layers3 className="h-3.5 w-3.5 mr-1.5" />
                                          {isEditing
                                            ? t('ged.dataRoom.massUpload.wizard.bulk.saveBatch')
                                            : t('ged.dataRoom.massUpload.wizard.bulk.createBatchBtn')}
                                        </Button>
                                      );
                                      if (!reason) return btn;
                                      return (
                                        <Tooltip>
                                          <TooltipTrigger asChild><span className="flex-1">{btn}</span></TooltipTrigger>
                                          <TooltipContent><span className="text-xs">{reason}</span></TooltipContent>
                                        </Tooltip>
                                      );
                                    })()}
                                  </>
                                ) : (
                                  <Button
                                    onClick={handleBulkApply}
                                    className="h-9 flex-1 text-white hover:opacity-90"
                                    style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                                  >
                                    {t('ged.dataRoom.massUpload.wizard.bulk.modify')}
                                  </Button>
                                )}
                              </div>
                            )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Step 2 — sober configuration table */}
                  {(() => {
                    const totalRows = uploadedFiles.length;
                    const totalPages = Math.max(1, Math.ceil(totalRows / step2PageSize));
                    const safePage = Math.min(step2Page, totalPages);
                    const startIndex = (safePage - 1) * step2PageSize;
                    // Sort files for display so members of the same batch are contiguous,
                    // anchored at the position of the first member. Standalone files keep
                    // their insertion order.
                    const displayFiles: UploadedFile[] = (() => {
                      const result: UploadedFile[] = [];
                      const seen = new Set<string>();
                      for (const f of uploadedFiles) {
                        if (f.batchId) {
                          if (seen.has(f.batchId)) continue;
                          seen.add(f.batchId);
                          for (const ff of uploadedFiles) if (ff.batchId === f.batchId) result.push(ff);
                        } else {
                          result.push(f);
                        }
                      }
                      return result;
                    })();
                    const pageRows = displayFiles.slice(startIndex, startIndex + step2PageSize);
                    const allSelected = selectedFiles.length === totalRows && totalRows > 0;
                    // Build a flat rendering plan grouping batched files under their batch header.
                    type RenderItem =
                      | { kind: 'standalone'; file: UploadedFile }
                      | { kind: 'batch'; batch: UploadBatch; children: UploadedFile[] };
                    const renderPlan: RenderItem[] = (() => {
                      const plan: RenderItem[] = [];
                      let i = 0;
                      while (i < pageRows.length) {
                        const f = pageRows[i];
                        const batch = f.batchId ? batches.find((b) => b.id === f.batchId) : undefined;
                        if (!batch) {
                          plan.push({ kind: 'standalone', file: f });
                          i++;
                          continue;
                        }
                        const children: UploadedFile[] = [];
                        while (i < pageRows.length && pageRows[i].batchId === batch.id) {
                          children.push(pageRows[i]);
                          i++;
                        }
                        plan.push({ kind: 'batch', batch, children });
                      }
                      return plan;
                    })();
                    // For a batch, the notification is auto-detected as "consolidated"
                    // ONLY when every member is notifying with the exact same template.
                    // If notifications are absent or differ, the batch row shows "—"
                    // and each member keeps its own editor.
                    // Notification is always consolidated at the batch level —
                    // the batch's value is mirrored on every member. We read it
                    // from the first member and propagate any edit to all.
                    const getBatchNotification = (batchId: string): { notify: boolean; emailTemplate: string } => {
                      const members = uploadedFiles.filter((f) => f.batchId === batchId);
                      const first = members[0];
                      return { notify: first?.notify ?? false, emailTemplate: first?.emailTemplate ?? '' };
                    };
                    // Render a single file row. When `inBatch` is set, fields piloted at
                    // the batch level (folder/targeting in global mode, validation team
                    // always) are replaced by a simple "—" placeholder since the value
                    // lives on the batch row.
                    const renderFileRow = (file: UploadedFile, inBatch?: UploadBatch) => {
                      const ext = file.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
                      const isSelected = selectedFiles.includes(file.id);
                      // Inside a batch, ciblage / notification / équipe de
                      // validation are consolidated at the group level and not
                      // editable on individual rows. To take a document out of a
                      // batch, the user disables the auto-group toggle, edits
                      // the value, and re-enables the toggle. Folder remains
                      // per-document (auto-batches use folderMode='per-document').
                      const folderLocked = !!inBatch && inBatch.folderMode === 'global';
                      const targetingLocked = !!inBatch;
                      const notificationLocked = !!inBatch;
                      const validationTeamLocked = !!inBatch;
                      const dashPlaceholder = (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-gray-300 select-none">—</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span className="text-xs">{t('ged.dataRoom.massUpload.wizard.bulk.fieldControlledByBatch')}</span>
                          </TooltipContent>
                        </Tooltip>
                      );
                      return (
                        <tr key={file.id} className={`hover:bg-gray-50/40 ${inBatch ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-3 py-3 align-top">
                            {inBatch ? (
                              <span className="ml-2 inline-block text-gray-300">└</span>
                            ) : (
                              <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectFile(file.id, checked === true)} />
                            )}
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="flex items-start gap-2.5">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gray-100">
                                <FileText className="h-4 w-4 text-gray-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-gray-600">{ext}</Badge>
                                  <span className="inline-flex items-center gap-0.5 text-[11px] text-gray-500">
                                    <FileText className="h-2.5 w-2.5" />{file.pageCount}p
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
                            <Select
                              value={file.documentCategory ?? ''}
                              onValueChange={(value) => handleUpdateFile(file.id, 'documentCategory', value as DocumentCategory)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectDocumentType')} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableDocumentCategories.map((cat) => (
                                  <SelectItem key={cat.value} value={cat.value} className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <FileText className="h-3 w-3 text-gray-400" />
                                      {t(cat.labelKey)}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>

                          <td className="px-3 py-3 align-top">
                            <div className="space-y-1.5">
                              {folderLocked ? (
                                dashPlaceholder
                              ) : (
                                <Select
                                  value={file.folder}
                                  onValueChange={(value) => handleUpdateFile(file.id, 'folder', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectFolder')} />
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
                              )}
                              {file.folder && (() => {
                                const restriction = getInheritedRestriction(file.folder);
                                if (!restriction.fund && !restriction.segment) return null;
                                return (
                                  <div className="flex flex-wrap items-center gap-1">
                                    {restriction.fund && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                                            style={{ color: '#7a7a7a', borderColor: '#ddd7cc', backgroundColor: '#f5f3ee' }}
                                          >
                                            <Landmark className="h-2.5 w-2.5" />
                                            {restriction.fund}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent><span className="text-xs">Restriction de fonds héritée du dossier</span></TooltipContent>
                                      </Tooltip>
                                    )}
                                    {restriction.segment && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
                                            style={{ color: '#7a7a7a', borderColor: '#ddd7cc', backgroundColor: '#f5f3ee' }}
                                          >
                                            <Users className="h-2.5 w-2.5" />
                                            {restriction.segment}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent><span className="text-xs">{t('ged.dataRoom.massUpload.wizard.segmentRestrictionInherited')}</span></TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>

                          <td className="px-3 py-3 align-top">
                            {targetingLocked ? (
                              dashPlaceholder
                            ) : (
                              <div className="space-y-1.5">
                                <Select
                                  value={file.targetType}
                                  onValueChange={(value) => handleUpdateFile(file.id, 'targetType', value)}
                                >
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeAll')}</div></SelectItem>
                                    <SelectItem value="segment" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeSegment')}</div></SelectItem>
                                    <SelectItem value="investor" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeInvestor')}</div></SelectItem>
                                    <SelectItem value="subscription" className="text-xs"><div className="flex items-center gap-2"><FileText className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeSubscription')}</div></SelectItem>
                                    <SelectItem value="fund" className="text-xs"><div className="flex items-center gap-2"><Landmark className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeFund')}</div></SelectItem>
                                  </SelectContent>
                                </Select>
                                {file.targetType === 'investor' && (
                                  <Select
                                    value={file.targetInvestors[0] ?? ''}
                                    onValueChange={(value) => handleUpdateFile(file.id, 'targetInvestors', [value])}
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectInvestor')} /></SelectTrigger>
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
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectSubscription')} /></SelectTrigger>
                                    <SelectContent>
                                      {availableSubscriptions.map((sub) => (
                                        <SelectItem key={sub.id} value={sub.id} className="text-xs">{subscriptionLabel(sub)}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                {file.targetType === 'fund' && (
                                  <div className="flex gap-1.5">
                                    <Select
                                      value={file.targetFunds[0] ?? ''}
                                      onValueChange={(value) => handleUpdateFile(file.id, 'targetFunds', [value])}
                                    >
                                      <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectFund')} /></SelectTrigger>
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
                                      <SelectTrigger className="h-8 w-20 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectPart')} /></SelectTrigger>
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
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectSegment')} /></SelectTrigger>
                                    <SelectContent>
                                      {availableSegments.map((seg) => (
                                        <SelectItem key={seg} value={seg} className="text-xs">{seg}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 align-top">
                            {notificationLocked ? (
                              dashPlaceholder
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={file.notify}
                                    onCheckedChange={(checked) => handleUpdateFile(file.id, 'notify', checked)}
                                  />
                                  <span className="text-xs text-gray-700">{t('ged.dataRoom.massUpload.wizard.notifyRecipients')}</span>
                                </div>
                                {file.notify && (
                                  <Select
                                    value={file.emailTemplate}
                                    onValueChange={(value) => handleUpdateFile(file.id, 'emailTemplate', value)}
                                  >
                                    <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectTemplate')} /></SelectTrigger>
                                    <SelectContent>
                                      {availableEmailTemplates.map((tpl) => {
                                        const Icon = tpl.icon;
                                        return (
                                          <SelectItem key={tpl.value} value={tpl.value} className="text-xs">
                                            <div className="flex items-center gap-2"><Icon className="h-3 w-3 text-gray-500" />{t(tpl.labelKey)}</div>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-3 py-3 align-top">
                            {validationTeamLocked ? (
                              dashPlaceholder
                            ) : (
                              <Select
                                value={file.validationTeam[0] ?? ''}
                                onValueChange={(value) => handleUpdateFile(file.id, 'validationTeam', [value])}
                              >
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectTeam')} /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamAdmin')}</SelectItem>
                                  <SelectItem value="compliance" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamCompliance')}</SelectItem>
                                  <SelectItem value="legal" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamLegal')}</SelectItem>
                                  <SelectItem value="ir" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamIR')}</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                        </tr>
                      );
                    };
                    // Placeholder shown in the batch header for fields that are piloted
                    // per-document (the value lives on each child row, not on the batch).
                    const heterogeneousDash = (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-gray-300 select-none">—</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">Piloté par document — voir la valeur de chaque ligne. Utilisez « Configurer » pour passer en mode global.</span>
                        </TooltipContent>
                      </Tooltip>
                    );

                    const renderBatchHeader = (batch: UploadBatch, children: UploadedFile[]) => {
                      const expanded = expandedBatchIds.has(batch.id);
                      return (
                        <Fragment key={`batch-${batch.id}`}>
                          <tr className="bg-blue-50/60 border-y border-blue-200/70">
                            {/* Col 1 — expand toggle */}
                            <td className="px-3 py-2 align-top">
                              <button
                                type="button"
                                onClick={() => toggleBatchExpanded(batch.id)}
                                className="flex h-6 w-6 items-center justify-center rounded hover:bg-blue-100"
                                aria-label={expanded ? 'Réduire le lot' : 'Développer le lot'}
                              >
                                <ChevronDown className={`h-3.5 w-3.5 text-blue-700 transition-transform ${expanded ? '' : '-rotate-90'}`} />
                              </button>
                            </td>

                            {/* Col 2 — Document : icon + name + summary + actions */}
                            <td className="px-3 py-2 align-top">
                              <div className="flex items-start gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-100">
                                  <Layers3 className="h-4 w-4 text-blue-700" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                  <Input
                                    value={batch.name}
                                    onChange={(e) => handleUpdateBatch(batch.id, { name: e.target.value })}
                                    className="h-7 text-sm font-medium border-blue-200 bg-white"
                                  />
                                  <div className="text-[11px] text-gray-600">
                                    {t(
                                      children.length > 1
                                        ? 'ged.dataRoom.massUpload.wizard.bulk.batchRowSummaryMany'
                                        : 'ged.dataRoom.massUpload.wizard.bulk.batchRowSummaryOne',
                                      { count: children.length }
                                    )}
                                  </div>
                                  {/* Configure / Dissolve actions are intentionally
                                      hidden in this phase — grouping is fully driven
                                      by the auto-group toggle in the Step 2 header. */}
                                </div>
                              </div>
                            </td>

                            {/* Col 3 — Document type : per-document, never consolidated at the batch level. */}
                            <td className="px-3 py-2 align-top">
                              {heterogeneousDash}
                            </td>

                            {/* Col 4 — Dossier (inline editor when piloted at batch level) */}
                            <td className="px-3 py-2 align-top">
                              {batch.folderMode === 'global' ? (
                                <Select
                                  value={batch.globalFolder}
                                  onValueChange={(value) => handleUpdateBatch(batch.id, { globalFolder: value })}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectFolder')} />
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
                              ) : (
                                heterogeneousDash
                              )}
                            </td>

                            {/* Col 4 — Ciblage (inline editor when piloted at batch level) */}
                            <td className="px-3 py-2 align-top">
                              {batch.targetingMode === 'global' ? (
                                <div className="space-y-1.5">
                                  <Select
                                    value={batch.globalTargeting.targetType}
                                    onValueChange={(value) =>
                                      handleUpdateBatch(batch.id, {
                                        globalTargeting: {
                                          ...batch.globalTargeting,
                                          targetType: value,
                                          targetSegments: [],
                                          targetInvestors: [],
                                          targetSubscriptions: [],
                                          targetFunds: [],
                                        },
                                      })
                                    }
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeAll')}</div></SelectItem>
                                      <SelectItem value="segment" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeSegment')}</div></SelectItem>
                                      <SelectItem value="investor" className="text-xs"><div className="flex items-center gap-2"><Users className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeInvestor')}</div></SelectItem>
                                      <SelectItem value="subscription" className="text-xs"><div className="flex items-center gap-2"><FileText className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeSubscription')}</div></SelectItem>
                                      <SelectItem value="fund" className="text-xs"><div className="flex items-center gap-2"><Landmark className="h-3 w-3 text-gray-500" />{t('ged.dataRoom.massUpload.wizard.targetTypeFund')}</div></SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {batch.globalTargeting.targetType === 'segment' && (
                                    <Select
                                      value={batch.globalTargeting.targetSegments[0] ?? ''}
                                      onValueChange={(value) =>
                                        handleUpdateBatch(batch.id, {
                                          globalTargeting: { ...batch.globalTargeting, targetSegments: [value] },
                                        })
                                      }
                                    >
                                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectSegment')} /></SelectTrigger>
                                      <SelectContent>
                                        {availableSegments.map((seg) => (
                                          <SelectItem key={seg} value={seg} className="text-xs">{seg}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                  {batch.globalTargeting.targetType === 'fund' && (
                                    <Select
                                      value={batch.globalTargeting.targetFunds[0] ?? ''}
                                      onValueChange={(value) =>
                                        handleUpdateBatch(batch.id, {
                                          globalTargeting: { ...batch.globalTargeting, targetFunds: [value] },
                                        })
                                      }
                                    >
                                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectFund')} /></SelectTrigger>
                                      <SelectContent>
                                        {availableFunds.map((fund) => (
                                          <SelectItem key={fund.id} value={fund.id} className="text-xs">{fund.name}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                </div>
                              ) : (
                                heterogeneousDash
                              )}
                            </td>

                            {/* Col 5 — Notification : toujours consolidée au niveau du lot.
                                Toute édition est propagée à chaque document du lot. */}
                            <td className="px-3 py-2 align-top">
                              {(() => {
                                const consolidated = getBatchNotification(batch.id);
                                return (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={consolidated.notify}
                                        onCheckedChange={(checked) => {
                                          setUploadedFiles((prev) =>
                                            prev.map((f) =>
                                              f.batchId === batch.id
                                                ? { ...f, notify: checked, emailTemplate: checked ? f.emailTemplate : '' }
                                                : f,
                                            ),
                                          );
                                        }}
                                      />
                                      <span className="text-[11px] text-gray-700">{t('ged.dataRoom.massUpload.wizard.notifyRecipients')}</span>
                                    </div>
                                    {consolidated.notify && (
                                      <Select
                                        value={consolidated.emailTemplate}
                                        onValueChange={(value) => {
                                          setUploadedFiles((prev) =>
                                            prev.map((f) =>
                                              f.batchId === batch.id ? { ...f, emailTemplate: value } : f,
                                            ),
                                          );
                                        }}
                                      >
                                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectTemplate')} /></SelectTrigger>
                                        <SelectContent>
                                          {availableEmailTemplates.map((tpl) => {
                                            const Icon = tpl.icon;
                                            return (
                                              <SelectItem key={tpl.value} value={tpl.value} className="text-xs">
                                                <div className="flex items-center gap-2"><Icon className="h-3 w-3 text-gray-500" />{t(tpl.labelKey)}</div>
                                              </SelectItem>
                                            );
                                          })}
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Col 6 — Équipe de validation (consolidated, inline editor) */}
                            <td className="px-3 py-2 align-top">
                              <Select
                                value={batch.validationTeam[0] ?? ''}
                                onValueChange={(value) =>
                                  handleUpdateBatch(batch.id, { validationTeam: value ? [value] : [] })
                                }
                              >
                                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={t('ged.dataRoom.massUpload.wizard.selectTeam')} /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamAdmin')}</SelectItem>
                                  <SelectItem value="compliance" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamCompliance')}</SelectItem>
                                  <SelectItem value="legal" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamLegal')}</SelectItem>
                                  <SelectItem value="ir" className="text-xs">{t('ged.dataRoom.massUpload.wizard.teamIR')}</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          </tr>

                        </Fragment>
                      );
                    };
                    return (
                      <>
                        <div className="flex items-center justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Settings className="h-3.5 w-3.5 text-gray-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t('ged.dataRoom.massUpload.wizard.columnsTooltip')}</TooltipContent>
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
                                  <th className="px-3 py-2.5 text-left min-w-[260px]">{t('ged.dataRoom.massUpload.wizard.tableDocument')}</th>
                                  <th className="px-3 py-2.5 text-left min-w-[180px]">{t('ged.dataRoom.massUpload.wizard.tableDocumentType')}</th>
                                  <th className="px-3 py-2.5 text-left min-w-[200px]">{t('ged.dataRoom.massUpload.wizard.tableFolder')}</th>
                                  <th className="px-3 py-2.5 text-left min-w-[280px]">{t('ged.dataRoom.massUpload.wizard.tableTargeting')}</th>
                                  <th className="px-3 py-2.5 text-left min-w-[220px]">{t('ged.dataRoom.massUpload.wizard.tableNotification')}</th>
                                  <th className="px-3 py-2.5 text-left min-w-[200px]">{t('ged.dataRoom.massUpload.wizard.tableValidationTeams')}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {renderPlan.map((item) => {
                                  if (item.kind === 'standalone') {
                                    return renderFileRow(item.file);
                                  }
                                  const expanded = expandedBatchIds.has(item.batch.id);
                                  return (
                                    <Fragment key={`batch-frag-${item.batch.id}`}>
                                      {renderBatchHeader(item.batch, item.children)}
                                      {expanded && item.children.map((child) => renderFileRow(child, item.batch))}
                                    </Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination footer */}
                          <div className="flex items-center justify-between border-t border-gray-100 bg-white px-3 py-2">
                            <span className="text-xs text-gray-500">
                              {t(totalRows > 1 ? 'ged.dataRoom.massUpload.wizard.paginationRangeMany' : 'ged.dataRoom.massUpload.wizard.paginationRangeOne', { start: startIndex + 1, end: Math.min(startIndex + step2PageSize, totalRows), total: totalRows })}
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
                                  <SelectItem value="20" className="text-xs">{t('ged.dataRoom.massUpload.wizard.pageSize', { size: 20 })}</SelectItem>
                                  <SelectItem value="50" className="text-xs">{t('ged.dataRoom.massUpload.wizard.pageSize', { size: 50 })}</SelectItem>
                                  <SelectItem value="100" className="text-xs">{t('ged.dataRoom.massUpload.wizard.pageSize', { size: 100 })}</SelectItem>
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
                  {t('ged.dataRoom.massUpload.wizard.cancel')}
                </Button>
                {isReviewStep && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    <Eye className="w-3 h-3 mr-1" />
                    {t('ged.dataRoom.massUpload.wizard.deepReviewBadge', { current: currentReviewingDocIndex + 1, total: uploadedFiles.length })}
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
                    toast.info(isReviewStep ? t('ged.dataRoom.massUpload.wizard.toastPreviousDocument') : t('ged.dataRoom.massUpload.wizard.toastPreviousStep'));
                  }}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {isReviewStep ? t('ged.dataRoom.massUpload.wizard.previous') : t('ged.dataRoom.massUpload.wizard.back')}
                </Button>
              )}

              {currentStep < totalSteps && (
                <Button
                  onClick={() => {
                    if (canGoNext()) {
                      handleNextStep();
                      if (isReviewStep && currentReviewingDocIndex < uploadedFiles.length - 1) {
                        toast.success(t('ged.dataRoom.massUpload.wizard.toastNextDocument'));
                      } else if (currentStep === 1) {
                        toast.success(deepReview ? t('ged.dataRoom.massUpload.wizard.toastStartingDeepReview') : t('ged.dataRoom.massUpload.wizard.toastDocumentConfig'));
                      } else {
                        toast.success(t('ged.dataRoom.massUpload.wizard.toastFinalValidation'));
                      }
                    } else {
                      toast.error(t('ged.dataRoom.massUpload.wizard.toastActionRequired'), {
                        description: t('ged.dataRoom.massUpload.wizard.toastActionRequiredDesc')
                      });
                    }
                  }}
                  disabled={!canGoNext()}
                  style={{ background: !canGoNext() ? undefined : 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className={`gap-2 ${!canGoNext() ? '' : 'text-white hover:opacity-90'}`}
                >
                  {isReviewStep && currentReviewingDocIndex < uploadedFiles.length - 1 ? t('ged.dataRoom.massUpload.wizard.nextDocument') : t('ged.dataRoom.massUpload.wizard.next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              {currentStep === totalSteps && (
                <Button
                  onClick={() => {
                    toast.success(t('ged.dataRoom.massUpload.wizard.toastImportLaunched'), {
                      description: t('ged.dataRoom.massUpload.wizard.toastImportLaunchedDesc', { count: uploadedFiles.length }),
                      duration: 5000
                    });
                    onClose();
                  }}
                  style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                  className="gap-2 text-white hover:opacity-90"
                >
                  <Upload className="w-4 h-4" />
                  {t('ged.dataRoom.massUpload.wizard.importCount', { count: uploadedFiles.length })}
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
