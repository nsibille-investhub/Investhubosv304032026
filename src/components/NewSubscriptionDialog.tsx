import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Plus,
  Building2,
  User,
  Check,
  Info,
  Sparkles,
  Landmark,
  Layers3,
  Loader2,
  Globe,
  Hash,
  Handshake,
  Briefcase,
  Euro,
  ChevronDown,
  ShieldCheck,
  ArrowLeft,
  CloudUpload,
  FileText,
  Trash2,
  Pencil,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Percent,
  Tag,
  Wallet,
  Calendar,
  Flag,
  Banknote,
  Users,
  ArrowDownCircle,
  AlertCircle,
  AlertTriangle,
  Eye,
  Bell,
  StickyNote,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';
import { BigModal, BigModalBody, BigModalContent, BigModalPanelFooter, BigModalPanelHeader } from './ui/big-modal';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { PartyTypeBadge } from './ui/party-type-badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';
import { SegmentedControl } from './ui/segmented-control';
import {
  FormSection,
  FormSubsection,
  FORM_FIELD_HINT_CLASS,
  FORM_FIELD_LABEL_CLASS,
  type FormSectionStatus,
} from './ui/form-section';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from './ui/utils';
import {
  HOLDING_MODE_LABEL_KEYS,
  SUBSCRIBER_TITLE_LABEL_KEYS,
  SUBSCRIPTION_TYPE_LABEL_KEYS,
  type HoldingMode,
  type SubscriberTitle,
  type SubscriptionType,
} from '../utils/subscriptionGenerator';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { MAIL_TEMPLATES, PREVIEW_VALUES, type MailTemplate } from '../utils/mailTemplatesMockData';
import { buildPreviewDocument } from './settings/MailTemplateDetailPage';
import { createNote, isNoteComplete, isReminderInPast, NoteFormFields } from './investor-detail/NoteEditSheet';
import type { Note } from '../utils/investorGenerator';

interface NewSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubscriptionCreated?: (subscription: any) => void;
  /** 'edit' reuses the same form to update an existing subscription. */
  mode?: 'create' | 'edit';
  /** Subscription to prefill the form with, in edit mode. */
  subscription?: any;
  onSubscriptionUpdated?: (subscription: any) => void;
}

interface Structure {
  id: string;
  name: string;
  siret: string;
  country: string;
  address: string;
  city?: string;
}

interface Distributor {
  id: string;
  name: string;
  code: string;
  logo?: string;
  fees: {
    fundId: string;
    shareClass: string;
    entryFeePercent: number;
    managementFeePercent: number;
  }[];
}

interface Investor {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
  email?: string;
  structures?: Structure[];
  distributorId?: string | null; // Distributeur attitré de l'investisseur
  preferredLanguage?: SubscriptionLanguage; // Langue de communication préférée
}

type SubscriptionLanguage = 'fr' | 'en';

const SUBSCRIPTION_LANGUAGES: SubscriptionLanguage[] = ['fr', 'en'];
const DEFAULT_SUBSCRIPTION_LANGUAGE: SubscriptionLanguage = 'fr';

const HOLDING_MODE_OPTIONS = Object.entries(HOLDING_MODE_LABEL_KEYS) as [HoldingMode, string][];
const SUBSCRIPTION_TYPE_OPTIONS = Object.entries(SUBSCRIPTION_TYPE_LABEL_KEYS) as [SubscriptionType, string][];
const SUBSCRIBER_TITLE_OPTIONS = Object.entries(SUBSCRIBER_TITLE_LABEL_KEYS) as [SubscriberTitle, string][];

/**
 * Complementary fields, only exposed in edit mode: they mirror the folded
 * sections of the detail summary block.
 */
interface ExtendedFormData {
  holdingMode: HoldingMode | '';
  externalId: string;
  subscriptionType: SubscriptionType | '';
  sepaEnabled: boolean;
  subscriberTitle: SubscriberTitle | '';
  legalName: string;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  postalCode: string;
  city: string;
  country: string;
  birthDate: string;
  nationality: string;
  iban: string;
  bic: string;
  advisor: string;
  commissionRate: string;
  excludeRetrocessions: boolean;
  sideLetter: string;
}

const EMPTY_EXTENDED_FORM: ExtendedFormData = {
  holdingMode: '',
  externalId: '',
  subscriptionType: '',
  sepaEnabled: false,
  subscriberTitle: '',
  legalName: '',
  lastName: '',
  firstName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  postalCode: '',
  city: '',
  country: '',
  birthDate: '',
  nationality: '',
  iban: '',
  bic: '',
  advisor: '',
  commissionRate: '',
  excludeRetrocessions: false,
  sideLetter: '',
};

function toDateInputValue(value: unknown): string {
  const date =
    value instanceof Date ? value : typeof value === 'string' && value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function fromDateInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function EditField({
  label,
  icon: Icon,
  className,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('space-y-1.5 min-w-0', className)}>
      <Label className={FORM_FIELD_LABEL_CLASS}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

function SwitchField({
  id,
  checked,
  onCheckedChange,
  onLabel,
  offLabel,
  disabled,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onLabel: string;
  offLabel: string;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex h-10 w-full items-center justify-between gap-3 rounded-md border border-input bg-white px-3 py-2 text-sm transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/40',
      )}
    >
      <span className="text-foreground truncate">{checked ? onLabel : offLabel}</span>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </label>
  );
}

function ReviewRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd className="text-right min-w-0">{children}</dd>
    </div>
  );
}

function FieldMessage({ message, tone = 'error' }: { message?: string; tone?: 'error' | 'warning' }) {
  if (!message) return null;
  const Icon = tone === 'error' ? AlertCircle : AlertTriangle;
  return (
    <p
      role={tone === 'error' ? 'alert' : undefined}
      className="text-xs flex items-start gap-1"
      style={{ color: tone === 'error' ? 'var(--destructive)' : 'var(--warning)' }}
    >
      <Icon className="w-3 h-3 shrink-0" style={{ marginTop: 1 }} />
      {message}
    </p>
  );
}

interface InternalNoteDraft {
  enabled: boolean;
  note: Note;
}

const EMPTY_INTERNAL_NOTE: InternalNoteDraft = {
  enabled: false,
  note: createNote(),
};

type NameMode = 'auto' | 'manual';

type FieldKey =
  | 'subscriptionName'
  | 'investor'
  | 'structure'
  | 'fund'
  | 'shareClass'
  | 'amount'
  | 'distributor'
  | 'internalNote';

type NotificationRole = 'investor' | 'partner' | 'team';

interface NotificationRecipient {
  role: NotificationRole;
  /** 'cc' : copie du mail de l'investisseur, soumise à la règle de copie du réseau. */
  delivery: 'to' | 'cc';
  name: string;
  detail?: string;
  template?: MailTemplate;
}

// Gabarits envoyés à la création : l'invitation part toujours à l'investisseur.
// Sur une souscription intermédiée, le distributeur reçoit le même mail en
// copie (règle de copie du réseau), il n'en est jamais le destinataire
// principal. L'équipe interne reçoit l'alerte de nouvelle souscription.
const CREATION_TEMPLATE_SLUGS: Record<NotificationRole, string> = {
  investor: 'invitation',
  partner: 'invitation',
  team: 'Onboarding-link',
};

function findTemplate(slug: string): MailTemplate | undefined {
  return MAIL_TEMPLATES.find((tpl) => tpl.slug === slug);
}

/** Montant au format français, avec une espace insécable classique : l'espace fine n'a pas de glyphe dans toutes les graisses. */
function formatAmount(value: number): string {
  return value.toLocaleString('fr-FR').replace(/\u202f/g, '\u00a0');
}

function generateSubscriptionName(
  investorName: string,
  amount: number,
  fundName: string,
  shareClass: string,
): string {
  return `${investorName} - €${amount / 1000}K - ${fundName} Part ${shareClass}`;
}

interface FormData {
  investor: Investor | null;
  structure: Structure | null | 'direct'; // 'direct' pour investissement sans structure
  fund: string;
  shareClass: string;
  numberOfShares: string;
  entryFees: string;
  subscriptionPremium: string; // Prime de souscription (€) - à la main de la SG
  isIntermediated: boolean;
  distributor: string; // ID du distributeur, 'direct', ou '' tant qu'aucun n'est choisi
  hasCustodyOption: boolean;
  notifyOnCreation: boolean;
  language: SubscriptionLanguage;
  nameMode: NameMode;
  subscriptionName: string;
  internalNote: InternalNoteDraft;
}

const EMPTY_FORM: FormData = {
  investor: null,
  structure: null,
  fund: '',
  shareClass: '',
  numberOfShares: '',
  entryFees: '0',
  subscriptionPremium: '0',
  isIntermediated: false,
  distributor: 'direct',
  hasCustodyOption: false,
  notifyOnCreation: true,
  language: DEFAULT_SUBSCRIPTION_LANGUAGE,
  nameMode: 'auto',
  subscriptionName: '',
  internalNote: EMPTY_INTERNAL_NOTE,
};

const mockStructures: Structure[] = [
  { id: 's1', name: 'Alpha Capital Holding SAS', siret: '123 456 789 00012', country: 'France', address: '12 Rue de Rivoli, 75001 Paris', city: 'Paris' },
  { id: 's2', name: 'Global Invest SARL', siret: '987 654 321 00034', country: 'France', address: '45 Avenue des Champs-Élysées, 75008 Paris', city: 'Paris' },
  { id: 's3', name: 'Meridian Group SA', siret: '456 789 123 00056', country: 'Luxembourg', address: '10 Boulevard Royal, L-2449 Luxembourg', city: 'Luxembourg' },
  { id: 's4', name: 'Phoenix Investment Ltd', siret: 'GB123456789', country: 'United Kingdom', address: '1 London Bridge, London SE1 9GF', city: 'London' },
];

const mockDistributors: Distributor[] = [
  {
    id: 'd1',
    name: 'InvestHub Direct',
    code: 'IHD',
    fees: [
      { fundId: 'f1', shareClass: 'A', entryFeePercent: 2.5, managementFeePercent: 1.5 },
      { fundId: 'f1', shareClass: 'B', entryFeePercent: 3.0, managementFeePercent: 1.8 },
      { fundId: 'f2', shareClass: 'A', entryFeePercent: 2.0, managementFeePercent: 1.2 },
      { fundId: 'f3', shareClass: 'I', entryFeePercent: 1.5, managementFeePercent: 1.0 },
      { fundId: 'f4', shareClass: 'A', entryFeePercent: 3.5, managementFeePercent: 2.0 },
    ],
  },
  {
    id: 'd2',
    name: 'Alpha Partners',
    code: 'ALP',
    fees: [
      { fundId: 'f1', shareClass: 'A', entryFeePercent: 3.0, managementFeePercent: 1.8 },
      { fundId: 'f1', shareClass: 'C', entryFeePercent: 2.5, managementFeePercent: 1.5 },
      { fundId: 'f2', shareClass: 'A', entryFeePercent: 2.5, managementFeePercent: 1.5 },
      { fundId: 'f2', shareClass: 'B', entryFeePercent: 3.5, managementFeePercent: 2.0 },
    ],
  },
  {
    id: 'd3',
    name: 'Capital Advisors',
    code: 'CAP',
    fees: [
      { fundId: 'f1', shareClass: 'A', entryFeePercent: 2.0, managementFeePercent: 1.2 },
      { fundId: 'f3', shareClass: 'A', entryFeePercent: 1.8, managementFeePercent: 1.1 },
      { fundId: 'f4', shareClass: 'A', entryFeePercent: 3.0, managementFeePercent: 1.8 },
    ],
  },
  {
    id: 'd4',
    name: 'Wealth Management Pro',
    code: 'WMP',
    fees: [
      { fundId: 'f2', shareClass: 'A', entryFeePercent: 2.8, managementFeePercent: 1.6 },
      { fundId: 'f3', shareClass: 'B', entryFeePercent: 3.2, managementFeePercent: 1.9 },
      { fundId: 'f4', shareClass: 'I', entryFeePercent: 1.2, managementFeePercent: 0.9 },
    ],
  },
];

const mockInvestors: Investor[] = [
  { id: '1', name: 'Sophie Martin', type: 'individual', email: 'sophie.martin@email.com', structures: [mockStructures[0], mockStructures[2]], distributorId: 'd1', preferredLanguage: 'fr' },
  { id: '2', name: 'Jean Dubois', type: 'individual', email: 'jean.dubois@email.com', structures: [], distributorId: null, preferredLanguage: 'fr' },
  { id: '3', name: 'Alpha Capital Holding', type: 'corporate', email: 'contact@alphacapital.com', structures: [mockStructures[0]], distributorId: 'd2', preferredLanguage: 'en' },
  { id: '4', name: 'Global Invest SARL', type: 'corporate', email: 'info@globalinvest.com', structures: [mockStructures[1]], distributorId: 'd3', preferredLanguage: 'fr' },
  { id: '5', name: 'Marie Bernard', type: 'individual', email: 'marie.bernard@email.com', structures: [mockStructures[2]], distributorId: null, preferredLanguage: 'fr' },
  { id: '6', name: 'Pierre Durand', type: 'individual', email: 'pierre.durand@email.com', structures: [], distributorId: 'd1' },
  { id: '7', name: 'Claire Petit', type: 'individual', email: 'claire.petit@email.com', structures: [mockStructures[3]], distributorId: 'd4', preferredLanguage: 'en' },
  { id: '8', name: 'Thomas Leroy', type: 'individual', email: 'thomas.leroy@email.com', structures: [], distributorId: null },
];

// Les 4 derniers investisseurs créés
const recentInvestors = mockInvestors.slice(0, 10);

const funds = [
  { id: 'f1', name: 'FutureInvest Fund', aum: '€245M', category: 'Growth' },
  { id: 'f2', name: 'Alpha Growth Fund', aum: '€180M', category: 'Value' },
  { id: 'f3', name: 'Euro Dynamic Fund', aum: '€320M', category: 'Balanced' },
  { id: 'f4', name: 'Tech Innovation Fund', aum: '€150M', category: 'Tech' },
];

// directAllowed: false reprend le paramètre de part « bloquer la souscription en direct ».
const shareClasses: { id: string; minAmount: number; directAllowed?: boolean }[] = [
  { id: 'A', minAmount: 1000 },
  { id: 'B', minAmount: 5000 },
  { id: 'C', minAmount: 10000, directAllowed: false },
  { id: 'I', minAmount: 100000 },
  { id: 'R', minAmount: 500 },
];

// Demo-only pricing — real apps fetch this per fund / share class.
const SHARE_PRICE = 100;

// Identifiers given to the fund and the distributor of an edited subscription
// when they are absent from the demo lists.
const EDITED_FUND_ID = 'edited-fund';
const EDITED_DISTRIBUTOR_ID = 'edited-distributor';
const DIRECT_DISTRIBUTOR_NAMES = ['Souscription Directe', 'Direct Subscription'];

interface StructureWithOwner extends Structure {
  owner: Investor;
}

function findInvestorOfStructure(structureId: string): Investor | null {
  return mockInvestors.find((inv) =>
    inv.structures?.some((s) => s.id === structureId),
  ) ?? null;
}

export function NewSubscriptionDialog({
  open,
  onClose,
  onSubscriptionCreated,
  mode = 'create',
  subscription,
  onSubscriptionUpdated,
}: NewSubscriptionDialogProps) {
  const { t } = useTranslation();
  const isEditMode = mode === 'edit' && !!subscription;
  const [searchQuery, setSearchQuery] = useState('');
  const [structureFilter, setStructureFilter] = useState('');
  const [structurePickerOpen, setStructurePickerOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNewStructureForm, setShowNewStructureForm] = useState(false);
  const [showNewInvestorForm, setShowNewInvestorForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'init' | 'documents'>('init');
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);

  const [extended, setExtended] = useState<ExtendedFormData>(EMPTY_EXTENDED_FORM);
  const updateExtended = <K extends keyof ExtendedFormData>(key: K, value: ExtendedFormData[K]) =>
    setExtended((prev) => ({ ...prev, [key]: value }));

  const [newInvestor, setNewInvestor] = useState({
    type: 'individual' as 'individual' | 'corporate',
    firstName: '',
    lastName: '',
    legalName: '',
    email: '',
  });

  const emptyNewInvestor = {
    type: 'individual' as 'individual' | 'corporate',
    firstName: '',
    lastName: '',
    legalName: '',
    email: '',
  };

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [distributionPrefilled, setDistributionPrefilled] = useState(false);
  const [previewRecipient, setPreviewRecipient] = useState<NotificationRecipient | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const updateInternalNote = (patch: Partial<InternalNoteDraft>) =>
    setFormData((prev) => ({ ...prev, internalNote: { ...prev.internalNote, ...patch } }));

  const [newStructure, setNewStructure] = useState({
    name: '',
    siret: '',
    country: 'France',
    address: '',
  });

  // The fund, the share and the distributor carried by an edited subscription
  // do not necessarily belong to the demo lists: they are merged in so the form
  // shows what the subscription actually holds.
  const editedFundName = isEditMode ? subscription.fund?.name ?? '' : '';
  const editedShareClass = isEditMode ? subscription.fund?.shareClass ?? '' : '';
  const editedDistributorName =
    isEditMode && subscription.partenaire?.name && !DIRECT_DISTRIBUTOR_NAMES.includes(subscription.partenaire.name)
      ? subscription.partenaire.name
      : '';
  const editedEntryFeePercent = isEditMode ? Number(subscription.entryFees ?? 0) : 0;

  const fundOptions = useMemo(() => {
    if (!editedFundName || funds.some((f) => f.name === editedFundName)) return funds;
    return [{ id: EDITED_FUND_ID, name: editedFundName, aum: '', category: '' }, ...funds];
  }, [editedFundName]);

  const shareClassOptions = useMemo(() => {
    if (!editedShareClass || shareClasses.some((sc) => sc.id === editedShareClass)) return shareClasses;
    return [{ id: editedShareClass, minAmount: 0 }, ...shareClasses];
  }, [editedShareClass]);

  const distributorOptions = useMemo(() => {
    if (!editedDistributorName || mockDistributors.some((d) => d.name === editedDistributorName)) {
      return mockDistributors;
    }
    const fundId = fundOptions.find((f) => f.name === editedFundName)?.id ?? '';
    return [
      {
        id: EDITED_DISTRIBUTOR_ID,
        name: editedDistributorName,
        code: '',
        fees: [
          {
            fundId,
            shareClass: editedShareClass,
            entryFeePercent: editedEntryFeePercent,
            managementFeePercent: 0,
          },
        ],
      },
      ...mockDistributors,
    ];
  }, [editedDistributorName, editedFundName, editedShareClass, editedEntryFeePercent, fundOptions]);

  // An edited subscription carries its own share price, frozen at creation.
  const sharePrice = useMemo(() => {
    if (isEditMode && subscription.quantity > 0 && subscription.amount > 0) {
      return subscription.amount / subscription.quantity;
    }
    return SHARE_PRICE;
  }, [isEditMode, subscription]);

  // Hydrate the form with the subscription being edited, each time it opens.
  useEffect(() => {
    if (!open || !isEditMode) return;
    const investorName = subscription.contrepartie?.investor || subscription.contrepartie?.name || '';
    const structureName = subscription.contrepartie?.structure;
    const editedStructure: Structure | null = structureName
      ? {
          id: 'edited-structure',
          name: structureName,
          siret: '',
          country: subscription.contrepartie?.country ?? '',
          address: '',
        }
      : null;
    const distributorId = editedDistributorName
      ? distributorOptions.find((d) => d.name === editedDistributorName)?.id ?? 'direct'
      : 'direct';

    setFormData({
      investor: {
        id: String(subscription.contrepartie?.id ?? subscription.id),
        name: investorName,
        type: subscription.contrepartie?.investorType === 'corporate' || subscription.contrepartie?.type === 'corporate'
          ? 'corporate'
          : 'individual',
        email: subscription.email || subscription.contrepartie?.mainContact || '',
        structures: editedStructure ? [editedStructure] : [],
        distributorId: distributorId === 'direct' ? null : distributorId,
        preferredLanguage: subscription.language === 'en' ? 'en' : 'fr',
      },
      structure: editedStructure ?? 'direct',
      fund: fundOptions.find((f) => f.name === editedFundName)?.id ?? '',
      shareClass: editedShareClass,
      numberOfShares: subscription.quantity ? String(subscription.quantity) : '',
      entryFees: String(subscription.entryFees ?? 0),
      subscriptionPremium: String(subscription.subscriptionPremium ?? 0),
      isIntermediated: distributorId !== 'direct',
      distributor: distributorId,
      hasCustodyOption: !!subscription.hasDepositary,
      notifyOnCreation: false,
      language: subscription.language === 'en' ? 'en' : 'fr',
      nameMode: 'manual',
      subscriptionName: subscription.name ?? '',
      internalNote: EMPTY_INTERNAL_NOTE,
    });
    setExtended({
      holdingMode: subscription.holdingMode ?? '',
      externalId: subscription.externalId ?? '',
      subscriptionType: subscription.subscriptionType ?? '',
      sepaEnabled: !!subscription.sepaEnabled,
      subscriberTitle: subscription.subscriberTitle ?? '',
      legalName: subscription.legalName ?? '',
      lastName: subscription.lastName ?? '',
      firstName: subscription.firstName ?? '',
      email: subscription.email ?? '',
      phone: subscription.phone ?? '',
      address1: subscription.address1 ?? '',
      address2: subscription.address2 ?? '',
      postalCode: subscription.postalCode ?? '',
      city: subscription.city ?? '',
      country: subscription.contrepartie?.country ?? '',
      birthDate: toDateInputValue(subscription.birthDate),
      nationality: subscription.nationality ?? '',
      iban: subscription.iban ?? '',
      bic: subscription.bic ?? '',
      advisor: subscription.advisor ?? '',
      commissionRate:
        subscription.commissionRate === undefined || subscription.commissionRate === null
          ? ''
          : String(subscription.commissionRate),
      excludeRetrocessions: !!subscription.excludeRetrocessions,
      sideLetter: subscription.sideLetter ?? '',
    });
    setStep('init');
    setSearchQuery('');
    setShowNewInvestorForm(false);
    setShowNewStructureForm(false);
  }, [open, isEditMode, subscription]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setFormData(EMPTY_FORM);
        setSubmitAttempted(false);
        setDistributionPrefilled(false);
        setPreviewRecipient(null);
        setShowNewStructureForm(false);
        setShowNewInvestorForm(false);
        setNewInvestor(emptyNewInvestor);
        setSearchQuery('');
        setStructureFilter('');
        setShowAutocomplete(false);
        setStep('init');
        setUploadedDocuments([]);
        setExtended(EMPTY_EXTENDED_FORM);
      }, 300);
    }
  }, [open]);

  // Le partenaire rattaché à l'investisseur, s'il est autorisé sur le fonds et
  // la part, préremplit toute la distribution et passe la souscription en
  // intermédiée. Sinon, un préremplissage précédent est annulé et un
  // distributeur devenu non autorisé est retiré.
  useEffect(() => {
    if (isEditMode || !formData.investor) return;
    const attitledId = formData.investor.distributorId;
    const isAuthorized = (distributorId: string) =>
      distributorOptions.some(
        (d) =>
          d.id === distributorId &&
          d.fees.some((f) => f.fundId === formData.fund && f.shareClass === formData.shareClass),
      );
    const attitledAuthorized =
      !!attitledId && !!formData.fund && !!formData.shareClass && isAuthorized(attitledId);
    const forbidsDirect =
      shareClassOptions.find((sc) => sc.id === formData.shareClass)?.directAllowed === false;

    if (attitledAuthorized) {
      setFormData((prev) => ({ ...prev, isIntermediated: true, distributor: attitledId! }));
      setDistributionPrefilled(true);
      return;
    }
    setFormData((prev) => {
      let next = prev;
      if (distributionPrefilled) next = { ...next, isIntermediated: false, distributor: 'direct' };
      else if (prev.isIntermediated && prev.distributor && !isAuthorized(prev.distributor)) {
        next = { ...next, distributor: '' };
      }
      // Une part qui interdit le direct impose un distributeur : la réponse
      // repasse à Oui et le distributeur reste à choisir.
      if (forbidsDirect && !next.isIntermediated) next = { ...next, isIntermediated: true, distributor: '' };
      return next;
    });
    setDistributionPrefilled(false);
  }, [formData.investor, formData.fund, formData.shareClass]);

  const handleIntermediatedChange = (intermediated: boolean) => {
    if (!intermediated && directForbidden) return;
    setDistributionPrefilled(false);
    if (!intermediated) {
      setFormData((prev) => ({ ...prev, isIntermediated: false, distributor: 'direct' }));
      return;
    }
    const attitledId = formData.investor?.distributorId;
    const next =
      attitledId && authorizedDistributors.some((d) => d.id === attitledId)
        ? attitledId
        : authorizedDistributors.length === 1
          ? authorizedDistributors[0].id
          : '';
    setFormData((prev) => ({ ...prev, isIntermediated: true, distributor: next }));
  };

  // Default the onboarding/communication language to the selected investor's
  // preferred language. The user can still override the value manually.
  const lastSyncedInvestorRef = useRef<string | null>(null);
  useEffect(() => {
    const investorId = formData.investor?.id ?? null;
    if (lastSyncedInvestorRef.current === investorId) return;
    lastSyncedInvestorRef.current = investorId;
    const preferred = formData.investor?.preferredLanguage ?? DEFAULT_SUBSCRIPTION_LANGUAGE;
    setFormData((prev) => (prev.language === preferred ? prev : { ...prev, language: preferred }));
  }, [formData.investor]);

  // Filter investors based on search (name or email)
  const filteredInvestors = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return mockInvestors
      .filter(
        (inv) =>
          inv.name.toLowerCase().includes(query) ||
          inv.email?.toLowerCase().includes(query),
      )
      .slice(0, 5);
  }, [searchQuery]);

  // Structures matching the search, with their parent investor attached
  const filteredStructuresWithOwner = useMemo<StructureWithOwner[]>(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return mockStructures
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.siret.toLowerCase().includes(query) ||
          s.city?.toLowerCase().includes(query),
      )
      .map((s) => {
        const owner = findInvestorOfStructure(s.id);
        return owner ? { ...s, owner } : null;
      })
      .filter((s): s is StructureWithOwner => s !== null)
      .slice(0, 5);
  }, [searchQuery]);

  // Show autocomplete when the input is focused (or the user is typing) and no investor is selected yet
  useEffect(() => {
    setShowAutocomplete(!formData.investor && (searchFocused || !!searchQuery.trim()));
  }, [searchQuery, searchFocused, formData.investor]);

  // Get authorized distributors for selected fund and share class
  const authorizedDistributors = useMemo(() => {
    if (!formData.fund || !formData.shareClass) return [];
    return distributorOptions.filter(dist =>
      dist.fees.some(f => f.fundId === formData.fund && f.shareClass === formData.shareClass)
    );
  }, [formData.fund, formData.shareClass]);

  // Default entry fees (%) derived from the distributor agreement for the
  // selected fund/share class. Direct investments have no entry fees.
  const defaultEntryFeePercent = useMemo(() => {
    if (formData.distributor === 'direct') return 0;
    const distributor = distributorOptions.find((d) => d.id === formData.distributor);
    if (!distributor || !formData.fund || !formData.shareClass) return 0;
    const feeConfig = distributor.fees.find(
      (f) => f.fundId === formData.fund && f.shareClass === formData.shareClass,
    );
    return feeConfig?.entryFeePercent ?? 0;
  }, [formData.distributor, formData.fund, formData.shareClass]);

  // Pre-fill the editable entry fee input with the calculated default whenever
  // the pricing dimensions change. The SG can then override it.
  useEffect(() => {
    setFormData((prev) =>
      prev.entryFees === String(defaultEntryFeePercent)
        ? prev
        : { ...prev, entryFees: String(defaultEntryFeePercent) },
    );
  }, [defaultEntryFeePercent]);

  const entryFeePercent = useMemo(() => {
    const v = parseFloat((formData.entryFees || '').replace(',', '.'));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [formData.entryFees]);

  const subscriptionPremiumAmount = useMemo(() => {
    const v = parseFloat((formData.subscriptionPremium || '').replace(',', '.'));
    return Number.isFinite(v) && v >= 0 ? v : 0;
  }, [formData.subscriptionPremium]);

  // Calculate total amount (price per share is fixed for the demo).
  const calculatedAmount = useMemo(() => {
    const shares = parseFloat(formData.numberOfShares) || 0;
    return shares * sharePrice;
  }, [formData.numberOfShares]);

  // Minimum subscription amount/shares from the selected share class.
  const selectedShareClass = useMemo(
    () => shareClassOptions.find((sc) => sc.id === formData.shareClass),
    [formData.shareClass],
  );
  const minAmount = selectedShareClass?.minAmount;
  const directForbidden = selectedShareClass?.directAllowed === false;
  const minShares = minAmount !== undefined ? minAmount / sharePrice : undefined;

  // Bidirectional binding: typing into Montant infers the number of shares.
  // Decimal and sub-1 values are accepted (any positive amount works).
  const handleAmountChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.,]/g, '').replace(',', '.');
    const amount = parseFloat(cleaned);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormData((prev) => ({ ...prev, numberOfShares: '' }));
      return;
    }
    const shares = amount / sharePrice;
    // Strip trailing zeros from a max-4-decimal representation
    const formatted = parseFloat(shares.toFixed(4)).toString();
    setFormData((prev) => ({ ...prev, numberOfShares: formatted }));
  };

  const calculatedEntryFees = useMemo(
    () => calculatedAmount * (entryFeePercent / 100),
    [calculatedAmount, entryFeePercent],
  );

  const calculatedFees = useMemo(
    () => calculatedEntryFees + subscriptionPremiumAmount,
    [calculatedEntryFees, subscriptionPremiumAmount],
  );

  const noAuthorizedDistributor =
    formData.isIntermediated &&
    !!formData.fund &&
    !!formData.shareClass &&
    authorizedDistributors.length === 0;

  const errors = useMemo(() => {
    const e: Partial<Record<FieldKey, string>> = {};
    if (!formData.investor) e.investor = t('subscriptions.newDialog.errors.investorRequired');
    else if (formData.structure === null) e.structure = t('subscriptions.newDialog.errors.structureRequired');
    if (!formData.fund) e.fund = t('subscriptions.newDialog.errors.fundRequired');
    if (!formData.shareClass) e.shareClass = t('subscriptions.newDialog.errors.shareClassRequired');
    if (!(parseFloat(formData.numberOfShares) > 0)) e.amount = t('subscriptions.newDialog.errors.amountRequired');
    if (noAuthorizedDistributor) {
      e.distributor = directForbidden
        ? t('subscriptions.newDialog.errors.noAuthorizedDistributorDirectForbidden')
        : t('subscriptions.newDialog.errors.noAuthorizedDistributor');
    } else if (formData.isIntermediated && (!formData.distributor || formData.distributor === 'direct')) {
      e.distributor = t('subscriptions.newDialog.errors.distributorRequired');
    }
    if (formData.nameMode === 'manual' && !formData.subscriptionName.trim()) {
      e.subscriptionName = t('subscriptions.newDialog.errors.subscriptionNameRequired');
    }
    if (!isEditMode && formData.internalNote.enabled && !isNoteComplete(formData.internalNote.note)) {
      e.internalNote = isReminderInPast(formData.internalNote.note)
        ? t('subscriptions.newDialog.errors.noteReminderPast')
        : t('subscriptions.newDialog.errors.noteRequired');
    }
    return e;
  }, [formData, noAuthorizedDistributor, directForbidden, isEditMode, t]);

  const isFormValid = Object.keys(errors).length === 0;

  // Les erreurs de saisie s'affichent sous leur champ après une première
  // tentative de création ; un fonds sans distributeur autorisé est signalé
  // tout de suite car il dépend du contexte, pas d'un oubli.
  const fieldError = (key: FieldKey): string | undefined =>
    submitAttempted || (key === 'distributor' && noAuthorizedDistributor) ? errors[key] : undefined;

  const belowMinimumWarning =
    minAmount !== undefined && calculatedAmount > 0 && calculatedAmount < minAmount
      ? t('subscriptions.newDialog.errors.belowMinimum', { min: formatAmount(minAmount) })
      : undefined;

  const sectionStatus = useMemo(() => {
    const status = (keys: FieldKey[], complete: boolean): FormSectionStatus =>
      keys.some((key) => fieldError(key)) ? 'error' : complete ? 'complete' : 'default';
    const hasFundAndShare = !!formData.fund && !!formData.shareClass;
    return {
      investor: status(['investor', 'structure'], !!formData.investor && formData.structure !== null),
      fund: status(['fund', 'shareClass', 'amount'], hasFundAndShare && calculatedAmount > 0),
      distribution: status(['distributor'], hasFundAndShare && !errors.distributor),
      review: status(['subscriptionName', 'internalNote'], false),
    };
  }, [formData, calculatedAmount, errors, submitAttempted, noAuthorizedDistributor]);

  const revealErrors = () => {
    setSubmitAttempted(true);
    requestAnimationFrame(() => {
      const first = scrollContainerRef.current?.querySelector('[data-field-error="true"]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

  const selectedFundName = fundOptions.find((f) => f.id === formData.fund)?.name ?? '';
  const selectedDistributorName =
    formData.isIntermediated && formData.distributor && formData.distributor !== 'direct'
      ? distributorOptions.find((d) => d.id === formData.distributor)?.name ?? ''
      : '';
  const generatedSubscriptionName =
    formData.investor && selectedFundName && formData.shareClass && calculatedAmount > 0
      ? generateSubscriptionName(formData.investor.name, calculatedAmount, selectedFundName, formData.shareClass)
      : '';
  const effectiveSubscriptionName =
    formData.nameMode === 'manual' ? formData.subscriptionName.trim() : generatedSubscriptionName;

  const notificationRecipients = useMemo<NotificationRecipient[]>(() => {
    if (!formData.investor) return [];
    const team: NotificationRecipient = {
      role: 'team',
      delivery: 'to',
      name: t('subscriptions.newDialog.review.internalTeam'),
      template: findTemplate(CREATION_TEMPLATE_SLUGS.team),
    };
    const investor: NotificationRecipient = {
      role: 'investor',
      delivery: 'to',
      name: formData.investor.name,
      detail: formData.investor.email,
      template: findTemplate(CREATION_TEMPLATE_SLUGS.investor),
    };
    if (!formData.isIntermediated) return [investor, team];
    return [
      investor,
      {
        role: 'partner',
        delivery: 'cc',
        name: selectedDistributorName || t('subscriptions.newDialog.review.partnerToSelect'),
        detail: t('subscriptions.newDialog.review.copyRule'),
        template: findTemplate(CREATION_TEMPLATE_SLUGS.partner),
      },
      team,
    ];
  }, [formData.investor, formData.isIntermediated, selectedDistributorName, t]);

  const previewDocument = useMemo(() => {
    const template = previewRecipient?.template;
    if (!template) return null;
    const content = template[formData.language];
    const investorName = formData.investor?.name ?? PREVIEW_VALUES.$investor;
    const [firstName, ...rest] = investorName.split(/\s+/);
    const amountLabel =
      calculatedAmount > 0
        ? `${calculatedAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
        : PREVIEW_VALUES.$amount;
    const values: Record<string, string> = {
      ...PREVIEW_VALUES,
      $investor: investorName,
      '$investor.name': investorName,
      '$investor.firstname': firstName,
      '$investor.lastname': rest.join(' '),
      $prenom: firstName,
      $nom: rest.join(' '),
      $campaign: selectedFundName || PREVIEW_VALUES.$campaign,
      $fund: selectedFundName || PREVIEW_VALUES.$fund,
      $amount: amountLabel,
      '$subscription.amount': amountLabel,
      $subscriptionname: effectiveSubscriptionName || PREVIEW_VALUES.$subscriptionname,
      ...(selectedDistributorName
        ? { $partner: selectedDistributorName, '$partner.name': selectedDistributorName }
        : {}),
    };
    const resolveSubject = content.subject.replace(
      /\$[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)*/g,
      (token) => values[token] ?? token,
    );
    return { subject: resolveSubject, html: buildPreviewDocument(content.html, values) };
  }, [
    previewRecipient,
    formData.language,
    formData.investor,
    calculatedAmount,
    selectedFundName,
    selectedDistributorName,
    effectiveSubscriptionName,
  ]);

  const handleInvestorSelect = (investor: Investor) => {
    const noStructures = !investor.structures || investor.structures.length === 0;
    setFormData((prev) => ({
      ...prev,
      investor,
      // No structures available → default the subscription to direct so the
      // user doesn't have to make a non-choice. They can still 'Ajouter une
      // structure' if they need to.
      structure: noStructures ? 'direct' : null,
    }));
    setSearchQuery('');
    setStructureFilter('');
    setShowAutocomplete(false);
  };

  const handleStructureFromSearchSelect = (structureWithOwner: StructureWithOwner) => {
    const { owner, ...structure } = structureWithOwner;
    setFormData((prev) => ({ ...prev, investor: owner, structure }));
    setSearchQuery('');
    setStructureFilter('');
    setShowAutocomplete(false);
  };

  const handleStructureSelect = (structure: Structure) => {
    setFormData((prev) => ({ ...prev, structure }));
    setShowNewStructureForm(false);
    setStructureFilter('');
  };

  const handleDirectInvestment = () => {
    setFormData((prev) => ({ ...prev, structure: 'direct' }));
  };

  const handleClearInvestor = () => {
    setFormData((prev) => ({ ...prev, investor: null, structure: null }));
    setStructureFilter('');
  };

  const handleQuickCreateInvestor = () => {
    const initial: typeof newInvestor = { ...emptyNewInvestor };
    if (searchQuery.trim()) {
      // Pre-fill the most likely field with the search query
      const parts = searchQuery.trim().split(/\s+/);
      if (parts.length >= 2) {
        initial.firstName = parts[0];
        initial.lastName = parts.slice(1).join(' ');
      } else {
        initial.lastName = searchQuery.trim();
        initial.legalName = searchQuery.trim();
      }
    }
    setNewInvestor(initial);
    setShowNewInvestorForm(true);
    setShowAutocomplete(false);
  };

  const handleCreateInvestor = () => {
    const isIndividual = newInvestor.type === 'individual';
    const composedName = isIndividual
      ? `${newInvestor.firstName.trim()} ${newInvestor.lastName.trim()}`.trim()
      : newInvestor.legalName.trim();

    if (!composedName || !newInvestor.email.trim()) {
      toast.error(t('subscriptions.newDialog.errors.missingNameEmail'));
      return;
    }

    const investor: Investor = {
      id: `new-${Date.now()}`,
      name: composedName,
      type: newInvestor.type,
      email: newInvestor.email,
      structures: [],
    };
    // A freshly created investor has no structures yet → default to direct.
    setFormData((prev) => ({ ...prev, investor, structure: 'direct' }));
    setShowNewInvestorForm(false);
    setNewInvestor(emptyNewInvestor);
    setSearchQuery('');
    toast.success(t('subscriptions.newDialog.toast.investorCreated', { name: investor.name }));
  };

  const handleClearStructure = () => {
    setFormData((prev) => ({ ...prev, structure: null }));
  };

  const handleCreateStructure = () => {
    if (!newStructure.name || !newStructure.siret) {
      toast.error(t('subscriptions.newDialog.errors.missingLegalNameSiret'));
      return;
    }

    const structure: Structure = {
      id: `new-s-${Date.now()}`,
      name: newStructure.name,
      siret: newStructure.siret,
      country: newStructure.country,
      address: newStructure.address,
    };

    setFormData((prev) => ({ ...prev, structure }));
    setShowNewStructureForm(false);
    setNewStructure({ name: '', siret: '', country: 'France', address: '' });
    toast.success(t('subscriptions.newDialog.toast.structureCreated', { name: structure.name }));
  };

  const handleSubmit = async () => {
    if (!formData.investor || !isFormValid) {
      revealErrors();
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fundName = fundOptions.find((f) => f.id === formData.fund)?.name ?? '';
    const distributorName =
      formData.distributor === 'direct'
        ? 'Souscription Directe'
        : distributorOptions.find((d) => d.id === formData.distributor)?.name ?? 'N/A';
    const structureName =
      typeof formData.structure === 'object' && formData.structure
        ? formData.structure.name
        : '';

    if (isEditMode) {
      const isDirect = formData.distributor === 'direct';
      const subscriberEmail = extended.email.trim() || formData.investor.email || '';
      const commissionRateValue = parseFloat(extended.commissionRate.replace(',', '.'));
      const updatedSubscription = {
        ...subscription,
        contrepartie: {
          ...subscription.contrepartie,
          investor: formData.investor.name,
          name: formData.investor.name,
          structure: structureName || undefined,
          mainContact: formData.investor.email,
          country: extended.country.trim() || subscription.contrepartie?.country,
        },
        email: subscriberEmail,
        fund: {
          ...subscription.fund,
          name: fundName,
          shareClass: formData.shareClass,
        },
        amount: calculatedAmount,
        quantity: parseFloat(formData.numberOfShares) || 0,
        entryFees: entryFeePercent,
        subscriptionPremium: subscriptionPremiumAmount,
        partenaire:
          formData.distributor === 'direct'
            ? null
            : {
                ...(subscription.partenaire ?? { id: `PART-${Math.floor(100 + Math.random() * 900)}`, type: 'corporate' as const }),
                name: distributorName,
              },
        hasDepositary: formData.hasCustodyOption,
        language: formData.language,
        holdingMode: extended.holdingMode || undefined,
        externalId: extended.externalId.trim() || undefined,
        subscriptionType: extended.subscriptionType || undefined,
        sepaEnabled: extended.sepaEnabled,
        subscriberTitle: extended.subscriberTitle || undefined,
        legalName: extended.legalName.trim() || undefined,
        lastName: extended.lastName.trim() || undefined,
        firstName: extended.firstName.trim() || undefined,
        phone: extended.phone.trim() || undefined,
        address1: extended.address1.trim() || undefined,
        address2: extended.address2.trim() || undefined,
        postalCode: extended.postalCode.trim() || undefined,
        city: extended.city.trim() || undefined,
        birthDate: fromDateInputValue(extended.birthDate),
        nationality: extended.nationality.trim() || undefined,
        iban: extended.iban.replace(/\s+/g, '').toUpperCase() || undefined,
        bic: extended.bic.trim().toUpperCase() || undefined,
        advisor: isDirect ? undefined : extended.advisor.trim() || undefined,
        commissionRate: isDirect || !Number.isFinite(commissionRateValue) ? 0 : commissionRateValue,
        excludeRetrocessions: extended.excludeRetrocessions,
        sideLetter: extended.sideLetter.trim() || undefined,
        updatedAt: new Date(),
      };

      if (onSubscriptionUpdated) {
        onSubscriptionUpdated(updatedSubscription);
      }

      toast.success(t('subscriptions.editDialog.toast.subscriptionUpdated'), {
        description: t('subscriptions.editDialog.toast.subscriptionUpdatedDesc', {
          investor: formData.investor.name,
          amount: formatAmount(calculatedAmount),
        }),
      });
      setIsSubmitting(false);
      onClose();
      return;
    }

    // Créer la nouvelle souscription
    const newSubscription: any = {
      id: Date.now(), // ID temporaire basé sur le timestamp
      name: effectiveSubscriptionName,
      status: 'Draft',
      type: formData.investor.type === 'individual' ? 'Individual' : 'Corporate',
      // The detail page reads this to land on the Initialisation step (0)
      // instead of the default Onboarding step (1) for newly-created drafts.
      initialStep: 0,
      // Snapshot of every field the wizard captured so the Initialisation
      // form on the detail page can pre-fill them.
      initData: {
        investorId: formData.investor.id,
        investorName: formData.investor.name,
        investorType: formData.investor.type,
        investorEmail: formData.investor.email,
        structureId:
          typeof formData.structure === 'object' && formData.structure
            ? formData.structure.id
            : null,
        structureName,
        isDirect: formData.structure === 'direct',
        fundId: formData.fund,
        fundName,
        shareClass: formData.shareClass,
        numberOfShares: formData.numberOfShares,
        totalAmount: calculatedAmount,
        isIntermediated: formData.isIntermediated,
        distributorId: formData.distributor,
        distributorName,
        advisor: formData.isIntermediated ? extended.advisor.trim() || undefined : undefined,
        commissionRate: formData.isIntermediated ? parseFloat(extended.commissionRate) || 0 : 0,
        excludeRetrocessions: formData.isIntermediated && extended.excludeRetrocessions,
        entryFeePercent,
        entryFeesAmount: calculatedEntryFees,
        subscriptionPremiumAmount,
        totalFees: calculatedFees,
        hasCustodyOption: formData.hasCustodyOption,
        notifyOnCreation: formData.notifyOnCreation,
        notificationRecipients: formData.notifyOnCreation
          ? notificationRecipients.map((r) => ({ role: r.role, name: r.name, templateSlug: r.template?.slug }))
          : [],
        language: formData.language,
        subscriptionName: effectiveSubscriptionName,
        isSubscriptionNameGenerated: formData.nameMode === 'auto',
        internalNote: formData.internalNote.enabled
          ? {
              title: formData.internalNote.note.title.trim(),
              content: formData.internalNote.note.content,
              reminderDate: formData.internalNote.note.reminderDate?.toISOString() ?? null,
              attachment: formData.internalNote.note.attachment?.name ?? null,
            }
          : null,
        documents: uploadedDocuments.map((file) => ({ name: file.name, size: file.size })),
      },
      contrepartie: {
        name: formData.investor.name,
        id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        type: formData.investor.type,
        structure: structureName || undefined,
        investor: formData.investor.name,
        investorType: formData.investor.type,
        mainContact: formData.investor.email,
        country:
          typeof formData.structure === 'object' && formData.structure
            ? formData.structure.country
            : 'France',
        riskLevel: 'Medium',
        kycStatus: 'to review' as const,
        crmSegments: ['Retail'],
      },
      exposure: 'None',
      riskLevel: 'Medium',
      monitoring: false,
      hits: 0,
      decisions: 0,
      analyst: '',
      fund: {
        name: fundName,
        shareClass: formData.shareClass,
      },
      amount: calculatedAmount,
      quantity: parseFloat(formData.numberOfShares) || 0,
      entryFees: entryFeePercent,
      subscriptionPremium: subscriptionPremiumAmount,
      language: formData.language,
      completionOnboarding: 15, // Draft = faible complétion
      createdAt: new Date(),
      updatedAt: new Date(),
      partenaire: {
        name: distributorName,
        id: `PART-${Math.floor(100 + Math.random() * 900)}`,
        type: 'corporate' as const,
      },
      lastUpdate: {
        relativeTime: 'Just now',
        timestamp: Date.now(),
      },
      details: {
        alerts: [],
        structure: typeof formData.structure === 'object' ? formData.structure : null,
        distributor:
          formData.distributor === 'direct'
            ? 'direct'
            : distributorOptions.find((d) => d.id === formData.distributor),
        entryFees: entryFeePercent,
        subscriptionPremium: subscriptionPremiumAmount,
        totalFees: calculatedFees,
        numberOfShares: formData.numberOfShares,
      },
    };

    // Appeler la fonction de callback pour ajouter la souscription
    if (onSubscriptionCreated) {
      onSubscriptionCreated(newSubscription);
    }

    toast.success(t('subscriptions.newDialog.toast.subscriptionCreated'), {
      description: t('subscriptions.newDialog.toast.subscriptionCreatedDesc', {
        investor: formData.investor?.name ?? '',
        amount: formatAmount(calculatedAmount),
      }),
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleProceedToDocuments = () => {
    if (!isFormValid) {
      revealErrors();
      return;
    }
    setStep('documents');
  };

  const handleAddDocuments = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadedDocuments((prev) => [...prev, ...Array.from(files)]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveDocument = (index: number) => {
    setUploadedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <BigModal open={open} onOpenChange={onClose}>
      <BigModalContent className="p-0 gap-0">
        <div className="flex flex-col h-full overflow-hidden rounded-3xl">
          <BigModalPanelHeader
            icon={isEditMode ? Pencil : Plus}
            title={isEditMode ? t('subscriptions.editDialog.title') : t('subscriptions.newDialog.title')}
            subtitle={isEditMode ? t('subscriptions.editDialog.subtitle') : t('subscriptions.newDialog.singleStepSubtitle')}
            onClose={onClose}
            closeLabel={t('common.confirmDialog.close')}
          />

          {/* Step content */}
          <BigModalBody ref={scrollContainerRef}>
            {step === 'init' && (
              <div className="flex flex-col" style={{ gap: 20 }}>
                  <FormSection
                    step={1}
                    status={sectionStatus.investor}
                    icon={User}
                    title={t('subscriptions.newDialog.sections.investor')}
                    description={t('subscriptions.newDialog.sections.investorDesc')}
                  >
                    <FormSubsection
                      icon={User}
                      title={
                        <>
                          {t('subscriptions.newDialog.investorLabel')}
                          <span className="text-destructive">*</span>
                        </>
                      }
                    >
                    <div className="space-y-2" data-field-error={!!fieldError('investor')}>

                      {showNewInvestorForm ? (
                        <div className="border border-border bg-card rounded-xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-sm">{t('subscriptions.newDialog.newInvestor')}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setShowNewInvestorForm(false);
                                setNewInvestor(emptyNewInvestor);
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={newInvestor.type === 'individual' ? 'primary' : 'outline'}
                              onClick={() => setNewInvestor({ ...newInvestor, type: 'individual' })}
                            >
                              <User className="w-3 h-3 mr-1" />
                              {t('subscriptions.newDialog.individual')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={newInvestor.type === 'corporate' ? 'primary' : 'outline'}
                              onClick={() => setNewInvestor({ ...newInvestor, type: 'corporate' })}
                            >
                              <Building2 className="w-3 h-3 mr-1" />
                              {t('subscriptions.newDialog.corporate')}
                            </Button>
                          </div>

                          {newInvestor.type === 'individual' ? (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs mb-1">
                                  {t('subscriptions.newDialog.firstName')}{' '}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  value={newInvestor.firstName}
                                  onChange={(e) => setNewInvestor({ ...newInvestor, firstName: e.target.value })}
                                  placeholder="Sophie"
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs mb-1">
                                  {t('subscriptions.newDialog.lastName')}{' '}
                                  <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  value={newInvestor.lastName}
                                  onChange={(e) => setNewInvestor({ ...newInvestor, lastName: e.target.value })}
                                  placeholder="Martin"
                                  className="h-9"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Label className="text-xs mb-1">
                                {t('subscriptions.newDialog.legalName')}{' '}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                value={newInvestor.legalName}
                                onChange={(e) => setNewInvestor({ ...newInvestor, legalName: e.target.value })}
                                placeholder="Alpha Capital Holding SAS"
                                className="h-9"
                              />
                            </div>
                          )}

                          <div>
                            <Label className="text-xs mb-1">
                              {t('subscriptions.newDialog.email')}{' '}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              type="email"
                              value={newInvestor.email}
                              onChange={(e) => setNewInvestor({ ...newInvestor, email: e.target.value })}
                              placeholder={t('subscriptions.newDialog.emailPlaceholder')}
                              className="h-9"
                            />
                          </div>

                          <div className="flex gap-2 pt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowNewInvestorForm(false);
                                setNewInvestor(emptyNewInvestor);
                              }}
                              className="h-9"
                            >
                              {t('subscriptions.newDialog.cancel')}
                            </Button>
                            <Button
                              onClick={handleCreateInvestor}
                              size="sm"
                              className="flex-1 bg-primary text-primary-foreground h-9"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              {t('subscriptions.newDialog.createAndSelect')}
                            </Button>
                          </div>
                        </div>
                      ) : !formData.investor ? (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                            <Input
                              ref={inputRef}
                              placeholder={t('subscriptions.newDialog.searchInvestorOrStructurePlaceholder')}
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onFocus={() => setSearchFocused(true)}
                              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                              className="pl-10 h-10"
                            />

                            <AnimatePresence>
                              {showAutocomplete && (
                                <motion.div
                                  initial={{ opacity: 0, y: -8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-[320px] overflow-y-auto"
                                >
                                  {!searchQuery.trim() ? (
                                    <div>
                                      <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                        {t('subscriptions.newDialog.recentlyAdded')}
                                      </div>
                                      {recentInvestors.map((investor) => (
                                        <button
                                          key={`recent-${investor.id}`}
                                          type="button"
                                          onMouseDown={(e) => e.preventDefault()}
                                          onClick={() => handleInvestorSelect(investor)}
                                          className="w-full px-3 py-2 hover:bg-muted transition-colors text-left flex items-center gap-3 border-b border-border last:border-0"
                                        >
                                          <PartyTypeBadge
                                            type={investor.type === 'individual' ? 'individual' : 'corporate'}
                                            label={null}
                                          />
                                          <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-foreground truncate">
                                              {investor.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                              {investor.email}
                                            </div>
                                          </div>
                                          {investor.structures && investor.structures.length > 0 && (
                                            <span className="text-[11px] text-muted-foreground shrink-0 inline-flex items-center gap-1">
                                              <Building2 className="w-3 h-3" />
                                              {investor.structures.length}
                                            </span>
                                          )}
                                        </button>
                                      ))}
                                    </div>
                                  ) : filteredInvestors.length === 0 && filteredStructuresWithOwner.length === 0 ? (
                                  <div className="p-4 text-center">
                                    <p className="text-xs text-muted-foreground mb-3">
                                      {t('subscriptions.newDialog.noResultFound', { query: searchQuery })}
                                    </p>
                                    <Button
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={handleQuickCreateInvestor}
                                      size="sm"
                                      className="bg-primary text-primary-foreground h-9"
                                    >
                                      <Plus className="w-4 h-4 mr-2" />
                                      {t('subscriptions.newDialog.createInvestorWithName', { query: searchQuery })}
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    {filteredInvestors.length > 0 && (
                                      <div>
                                        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                          {t('subscriptions.newDialog.groupInvestors')}
                                        </div>
                                        {filteredInvestors.map((investor) => (
                                          <button
                                            key={`inv-${investor.id}`}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleInvestorSelect(investor)}
                                            className="w-full px-3 py-2 hover:bg-muted transition-colors text-left flex items-center gap-3 border-b border-border last:border-0"
                                          >
                                            <PartyTypeBadge
                                              type={investor.type === 'individual' ? 'individual' : 'corporate'}
                                              label={null}
                                            />
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-foreground truncate">
                                                {investor.name}
                                              </div>
                                              <div className="text-xs text-muted-foreground truncate">
                                                {investor.email}
                                              </div>
                                            </div>
                                            {investor.structures && investor.structures.length > 0 && (
                                              <span className="text-[11px] text-muted-foreground shrink-0 inline-flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                {investor.structures.length}
                                              </span>
                                            )}
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                    {filteredStructuresWithOwner.length > 0 && (
                                      <div className="border-t border-border">
                                        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                          {t('subscriptions.newDialog.groupStructures')}
                                        </div>
                                        {filteredStructuresWithOwner.map((s) => (
                                          <button
                                            key={`str-${s.id}`}
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleStructureFromSearchSelect(s)}
                                            className="w-full px-3 py-2 hover:bg-muted transition-colors text-left flex items-center gap-3 border-b border-border last:border-0"
                                          >
                                            <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                                              <Building2 className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="text-sm font-medium text-foreground truncate">
                                                {s.name}
                                              </div>
                                              <div className="text-xs text-muted-foreground truncate">
                                                {t('subscriptions.newDialog.ownedBy', { name: s.owner.name })} · {s.siret}
                                              </div>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                                              {s.country}
                                            </Badge>
                                          </button>
                                        ))}
                                      </div>
                                    )}

                                  </>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                          </div>

                          <Button
                            type="button"
                            onClick={handleQuickCreateInvestor}
                            variant="outline"
                            className="w-full border-dashed h-9"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('subscriptions.newDialog.createNewInvestor')}
                          </Button>
                        </>
                      ) : (
                        <div className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-white px-3 py-2 text-sm">
                          <PartyTypeBadge
                            type={formData.investor.type === 'individual' ? 'individual' : 'corporate'}
                            label={
                              formData.investor.type === 'individual'
                                ? t('subscriptions.newDialog.shortIndividual')
                                : t('subscriptions.newDialog.shortCorporate')
                            }
                          />
                          <span className="font-medium text-foreground truncate">
                            {formData.investor.name}
                          </span>
                          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                            {formData.investor.email}
                          </span>
                          <button
                            type="button"
                            onClick={handleClearInvestor}
                            aria-label={t('subscriptions.newDialog.change')}
                            className="ml-auto inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <FieldMessage message={fieldError('investor')} />
                    </div>
                    </FormSubsection>


                    {/* STRUCTURE */}
                    {formData.investor && (() => {
                      const investorStructures = formData.investor.structures ?? [];
                      const investorHasStructures = investorStructures.length > 0;
                      const isOptional = !investorHasStructures && !showNewStructureForm;
                      const filterQuery = structureFilter.trim().toLowerCase();
                      const filteredStructures = filterQuery
                        ? investorStructures.filter(
                            (s) =>
                              s.name.toLowerCase().includes(filterQuery) ||
                              s.siret.toLowerCase().includes(filterQuery) ||
                              s.city?.toLowerCase().includes(filterQuery),
                          )
                        : investorStructures;

                      return (
                        <FormSubsection
                          icon={Building2}
                          title={
                            <>
                              {t('subscriptions.newDialog.structureLabel')}
                              {isOptional ? (
                                <span className="font-normal" style={{ textTransform: 'none', letterSpacing: 0 }}>
                                  {t('subscriptions.newDialog.optional')}
                                </span>
                              ) : (
                                <span className="text-destructive">*</span>
                              )}
                            </>
                          }
                        >
                        <div className="space-y-2" data-field-error={!!fieldError('structure')}>

                          {showNewStructureForm ? (
                            <div className="border border-border bg-card rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-primary" />
                                  <span className="font-semibold text-sm">{t('subscriptions.newDialog.newStructure')}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setShowNewStructureForm(false);
                                    setNewStructure({ name: '', siret: '', country: 'France', address: '' });
                                  }}
                                  aria-label={t('subscriptions.newDialog.cancel')}
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs mb-1">
                                    {t('subscriptions.newDialog.legalName')}{' '}
                                    <span className="text-destructive">*</span>
                                  </Label>
                                  <Input
                                    value={newStructure.name}
                                    onChange={(e) => setNewStructure({ ...newStructure, name: e.target.value })}
                                    placeholder="Alpha Capital Holding SAS"
                                    className="h-9"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label className="text-xs mb-1">
                                      {t('subscriptions.newDialog.siret')}{' '}
                                      <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                      value={newStructure.siret}
                                      onChange={(e) => setNewStructure({ ...newStructure, siret: e.target.value })}
                                      placeholder="123 456 789 00012"
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs mb-1">{t('subscriptions.newDialog.countryLabel')}</Label>
                                    <Input
                                      value={newStructure.country}
                                      onChange={(e) => setNewStructure({ ...newStructure, country: e.target.value })}
                                      placeholder="France"
                                      className="h-9"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs mb-1">{t('subscriptions.newDialog.addressLabel')}</Label>
                                  <Input
                                    value={newStructure.address}
                                    onChange={(e) => setNewStructure({ ...newStructure, address: e.target.value })}
                                    placeholder="12 Rue de Rivoli, 75001 Paris"
                                    className="h-9"
                                  />
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setShowNewStructureForm(false);
                                      setNewStructure({ name: '', siret: '', country: 'France', address: '' });
                                    }}
                                    className="h-9"
                                  >
                                    {t('subscriptions.newDialog.cancel')}
                                  </Button>
                                  <Button
                                    onClick={handleCreateStructure}
                                    size="sm"
                                    className="flex-1 bg-primary text-primary-foreground h-9"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    {t('subscriptions.newDialog.createAndSelect')}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : formData.structure ? (
                            <div className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-white px-3 py-2 text-sm">
                              {formData.structure === 'direct' ? (
                                <>
                                  <User className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
                                  <span className="font-medium text-foreground truncate">
                                    {t('subscriptions.newDialog.directInvestmentTitle')}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                                    {t('subscriptions.newDialog.directInvestorDesc', {
                                      name: formData.investor.name,
                                    })}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <span className="font-medium text-foreground truncate">
                                    {formData.structure.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground items-center gap-1 truncate hidden sm:inline-flex">
                                    <Hash className="w-3 h-3" />
                                    {formData.structure.siret}
                                  </span>
                                  <span className="text-xs text-muted-foreground items-center gap-1 shrink-0 hidden md:inline-flex">
                                    <Globe className="w-3 h-3" />
                                    {formData.structure.country}
                                  </span>
                                </>
                              )}
                              {investorHasStructures && (
                                <button
                                  type="button"
                                  onClick={handleClearStructure}
                                  aria-label={t('subscriptions.newDialog.change')}
                                  className="ml-auto inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <Popover
                              open={structurePickerOpen}
                              onOpenChange={(open) => {
                                setStructurePickerOpen(open);
                                if (!open) setStructureFilter('');
                              }}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className="flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-white px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
                                >
                                  <span className="text-muted-foreground">
                                    {t('subscriptions.newDialog.selectStructurePlaceholder')}
                                  </span>
                                  <ChevronDown className="size-4 opacity-50 shrink-0" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent
                                align="start"
                                className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[320px]"
                              >
                                {investorStructures.length > 3 && (
                                  <div className="p-2 border-b border-border">
                                    <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground z-10" />
                                      <Input
                                        autoFocus
                                        placeholder={t('subscriptions.newDialog.searchStructureInListPlaceholder')}
                                        value={structureFilter}
                                        onChange={(e) => setStructureFilter(e.target.value)}
                                        className="pl-8 h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="max-h-[260px] overflow-y-auto py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDirectInvestment();
                                      setStructurePickerOpen(false);
                                      setStructureFilter('');
                                    }}
                                    className="w-full px-3 py-2 hover:bg-muted transition-colors text-left flex items-center gap-3 border-b border-border"
                                  >
                                    <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-foreground truncate">
                                        {t('subscriptions.newDialog.directInvestmentTitle')}
                                      </div>
                                      <div className="text-xs text-muted-foreground truncate">
                                        {t('subscriptions.newDialog.directInvestment')}
                                      </div>
                                    </div>
                                  </button>

                                  {filteredStructures.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic px-3 py-3 text-center">
                                      {t('subscriptions.newDialog.noStructureMatch', {
                                        query: structureFilter,
                                      })}
                                    </p>
                                  ) : (
                                    filteredStructures.map((structure) => (
                                      <button
                                        key={structure.id}
                                        type="button"
                                        onClick={() => {
                                          handleStructureSelect(structure);
                                          setStructurePickerOpen(false);
                                        }}
                                        className="w-full px-3 py-2 hover:bg-muted transition-colors text-left flex items-center gap-3"
                                      >
                                        <div className="size-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm text-foreground truncate">
                                            {structure.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground truncate">
                                            {structure.siret}
                                            {structure.city ? ` · ${structure.city}` : ''}
                                          </div>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] h-4 shrink-0">
                                          {structure.country}
                                        </Badge>
                                      </button>
                                    ))
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}

                          <FieldMessage message={fieldError('structure')} />

                          {!showNewStructureForm && (
                            <Button
                              type="button"
                              onClick={() => {
                                setStructurePickerOpen(false);
                                setShowNewStructureForm(true);
                              }}
                              variant="outline"
                              className="w-full border-dashed h-9"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t('subscriptions.newDialog.addStructure')}
                            </Button>
                          )}
                        </div>
                        </FormSubsection>
                      );
                    })()}

                  </FormSection>

                  <FormSection
                    step={2}
                    status={sectionStatus.fund}
                    icon={Landmark}
                    title={t('subscriptions.newDialog.sections.fund')}
                    description={t('subscriptions.newDialog.sections.fundDesc')}
                  >
                    <FormSubsection icon={Layers3} title={t('subscriptions.newDialog.subsections.fundAndShare')}>
                    {/* Row 1: Fonds + Part */}
                    <div
                      className="grid gap-3"
                      style={{ gridTemplateColumns: '1.6fr 1fr' }}
                    >
                      <div className="space-y-1.5 min-w-0" data-field-error={!!fieldError('fund')}>
                        <Label className={FORM_FIELD_LABEL_CLASS}>
                          <Landmark className="w-3.5 h-3.5" />
                          {t('subscriptions.newDialog.fundLabel')}{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.fund}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, fund: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('subscriptions.newDialog.selectFund')} />
                          </SelectTrigger>
                          <SelectContent>
                            {fundOptions.map((fund) => (
                              <SelectItem key={fund.id} value={fund.id}>
                                <span className="font-medium truncate">{fund.name}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldMessage message={fieldError('fund')} />
                      </div>

                      <div className="space-y-1.5 min-w-0" data-field-error={!!fieldError('shareClass')}>
                        <Label className={FORM_FIELD_LABEL_CLASS}>
                          <Layers3 className="w-3.5 h-3.5" />
                          {t('subscriptions.newDialog.partLabel')}{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.shareClass}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, shareClass: value }))}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder={t('subscriptions.newDialog.selectShareClass')} />
                          </SelectTrigger>
                          <SelectContent>
                            {shareClassOptions.map((sc) => (
                              <SelectItem key={sc.id} value={sc.id}>
                                {t('subscriptions.newDialog.shareLabel', { class: sc.id })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldMessage message={fieldError('shareClass')} />
                      </div>
                    </div>
                    </FormSubsection>

                    <FormSubsection icon={Euro} title={t('subscriptions.newDialog.subsections.quantityAndAmount')}>
                    {/* Row 2: Nombre de parts + Montant + Prime */}
                    <div
                      className="grid gap-3"
                      style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
                    >
                      <div className="space-y-1.5 min-w-0">
                        <Label className={FORM_FIELD_LABEL_CLASS}>
                          <Hash className="w-3.5 h-3.5" />
                          {t('subscriptions.newDialog.numberOfShares')}{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={formData.numberOfShares}
                          onChange={(e) => {
                            const cleaned = e.target.value
                              .replace(/[^0-9.,]/g, '')
                              .replace(',', '.');
                            setFormData((prev) => ({ ...prev, numberOfShares: cleaned }));
                          }}
                          placeholder="100"
                          className="h-10 font-semibold text-right"
                        />
                        {minShares !== undefined && (
                          <p className={FORM_FIELD_HINT_CLASS}>
                            {t('subscriptions.newDialog.minSharesHint', {
                              count: formatAmount(minShares),
                            })}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 min-w-0" data-field-error={!!fieldError('amount')}>
                        <Label className={FORM_FIELD_LABEL_CLASS}>
                          <Euro className="w-3.5 h-3.5" />
                          {t('subscriptions.newDialog.amount')}{' '}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={
                            calculatedAmount > 0
                              ? formatAmount(calculatedAmount)
                              : ''
                          }
                          onChange={(e) => handleAmountChange(e.target.value)}
                          placeholder="10 000"
                          className="h-10 font-semibold text-right"
                        />
                        <p className={FORM_FIELD_HINT_CLASS}>
                          {minAmount !== undefined
                            ? t('subscriptions.newDialog.pricePerShareAndMinHint', {
                                price: formatAmount(sharePrice),
                                min: formatAmount(minAmount),
                              })
                            : t('subscriptions.newDialog.pricePerShareHint', {
                                price: formatAmount(sharePrice),
                              })}
                        </p>
                        <FieldMessage message={fieldError('amount')} />
                        <FieldMessage message={belowMinimumWarning} tone="warning" />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <Label className={FORM_FIELD_LABEL_CLASS}>
                          <Sparkles className="w-3.5 h-3.5" />
                          {t('subscriptions.newDialog.subscriptionPremiumLabel')}
                        </Label>
                        <div className="flex h-10 w-full items-center rounded-md border border-input bg-white pr-3 focus-within:ring-2 focus-within:ring-ring/40">
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={formData.subscriptionPremium}
                            onChange={(e) => {
                              const cleaned = e.target.value
                                .replace(/[^0-9.,]/g, '')
                                .replace(',', '.');
                              setFormData((prev) => ({ ...prev, subscriptionPremium: cleaned }));
                            }}
                            placeholder="0"
                            className="h-full border-0 bg-transparent font-semibold text-right shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                          <span className="ml-1 text-sm text-muted-foreground select-none">€</span>
                        </div>
                        <p className={FORM_FIELD_HINT_CLASS}>
                          {t('subscriptions.newDialog.subscriptionPremiumHint')}
                        </p>
                      </div>
                    </div>
                    </FormSubsection>

                    <FormSubsection icon={ShieldCheck} title={t('subscriptions.newDialog.subsections.options')}>
                    <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div className="space-y-1.5 min-w-0">
                        <Label className={FORM_FIELD_LABEL_CLASS}>
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {t('subscriptions.newDialog.custodyOptionLabel')}
                        </Label>
                        <label
                          htmlFor="custody-option-switch"
                          className="flex h-10 w-full items-center justify-between gap-3 rounded-md border border-input bg-white px-3 py-2 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                        >
                          <span className="text-foreground truncate">
                            {formData.hasCustodyOption
                              ? t('subscriptions.newDialog.custodyOptionOn')
                              : t('subscriptions.newDialog.custodyOptionOff')}
                          </span>
                          <Switch
                            id="custody-option-switch"
                            checked={formData.hasCustodyOption}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({ ...prev, hasCustodyOption: checked }))
                            }
                          />
                        </label>
                      </div>
                    </div>

                    {isEditMode && (
                      <div
                        className="grid gap-3"
                        style={{ gridTemplateColumns: '1fr 1fr 1fr 1.2fr' }}
                      >
                        <EditField label={t('subscriptions.detail.form.holdingMode')} icon={Wallet}>
                          <Select
                            value={extended.holdingMode}
                            onValueChange={(value) => updateExtended('holdingMode', value as HoldingMode)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={t('subscriptions.detail.form.selectPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {HOLDING_MODE_OPTIONS.map(([value, labelKey]) => (
                                <SelectItem key={value} value={value}>
                                  {t(labelKey)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </EditField>

                        <EditField label={t('subscriptions.detail.form.externalId')} icon={Hash}>
                          <Input
                            value={extended.externalId}
                            onChange={(e) => updateExtended('externalId', e.target.value)}
                            placeholder={t('subscriptions.detail.form.externalIdPlaceholder')}
                            className="h-10"
                          />
                        </EditField>

                        <EditField label={t('subscriptions.detail.form.subscriptionType')} icon={Tag}>
                          <Select
                            value={extended.subscriptionType}
                            onValueChange={(value) =>
                              updateExtended('subscriptionType', value as SubscriptionType)
                            }
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder={t('subscriptions.detail.form.selectPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {SUBSCRIPTION_TYPE_OPTIONS.map(([value, labelKey]) => (
                                <SelectItem key={value} value={value}>
                                  {t(labelKey)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </EditField>

                        <EditField label={t('subscriptions.detail.form.sepa')} icon={Banknote}>
                          <SwitchField
                            id="sepa-enabled-switch"
                            checked={extended.sepaEnabled}
                            onCheckedChange={(checked) => updateExtended('sepaEnabled', checked)}
                            onLabel={t('subscriptions.detail.form.yes')}
                            offLabel={t('subscriptions.detail.form.no')}
                          />
                        </EditField>
                      </div>
                    )}
                    </FormSubsection>
                  </FormSection>

                  <FormSection
                    step={3}
                    status={sectionStatus.distribution}
                    icon={Handshake}
                    title={t('subscriptions.newDialog.sections.distribution')}
                    description={t('subscriptions.newDialog.sections.distributionDesc')}
                  >
                    <FormSubsection>
                    <div className="space-y-1.5">
                      <Label className={FORM_FIELD_LABEL_CLASS}>
                        <Handshake className="w-3.5 h-3.5" />
                        {t('subscriptions.newDialog.distribution.intermediatedLabel')}
                      </Label>
                      <SegmentedControl
                        aria-label={t('subscriptions.newDialog.distribution.intermediatedLabel')}
                        value={formData.isIntermediated ? 'yes' : 'no'}
                        onValueChange={(value) => handleIntermediatedChange(value === 'yes')}
                        size="sm"
                        options={[
                          { value: 'no', label: t('subscriptions.newDialog.distribution.no'), disabled: directForbidden },
                          { value: 'yes', label: t('subscriptions.newDialog.distribution.yes') },
                        ]}
                      />
                      <p className={FORM_FIELD_HINT_CLASS}>
                        {formData.isIntermediated
                          ? t('subscriptions.newDialog.distribution.intermediatedOnHint')
                          : t('subscriptions.newDialog.distribution.intermediatedOffHint')}
                      </p>
                    </div>

                    {directForbidden && (
                      <div className="flex items-start gap-2 rounded-lg border border-border bg-primary/5 px-3 py-2">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">
                          {t('subscriptions.newDialog.distribution.directForbidden', { share: formData.shareClass })}
                        </p>
                      </div>
                    )}

                    {distributionPrefilled && formData.isIntermediated && selectedDistributorName && (
                      <div className="flex items-start gap-2 rounded-lg border border-border bg-primary/5 px-3 py-2">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">
                          {t('subscriptions.newDialog.distribution.prefilledFromPartner', {
                            name: selectedDistributorName,
                          })}
                        </p>
                      </div>
                    )}
                    </FormSubsection>

                    {formData.isIntermediated && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                      >
                        <FormSubsection icon={Briefcase} title={t('subscriptions.newDialog.subsections.distributor')}>
                        <div className="grid gap-3" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
                        <div className="space-y-1.5" data-field-error={!!fieldError('distributor')}>
                          <Label className={FORM_FIELD_LABEL_CLASS}>
                            <Briefcase className="w-3.5 h-3.5" />
                            {t('subscriptions.newDialog.distributorLabel')}{' '}
                            <span className="text-destructive">*</span>
                          </Label>
                          {formData.fund && formData.shareClass ? (
                            <Select
                              value={formData.distributor === 'direct' ? '' : formData.distributor}
                              onValueChange={(value) => {
                                setDistributionPrefilled(false);
                                setFormData((prev) => ({ ...prev, distributor: value }));
                              }}
                              disabled={authorizedDistributors.length === 0}
                            >
                              <SelectTrigger
                                className={'h-10'}
                              >
                                <SelectValue placeholder={t('subscriptions.newDialog.selectDistributor')} />
                              </SelectTrigger>
                              <SelectContent>
                                {authorizedDistributors.map((dist) => {
                                  const feeConfig = dist.fees.find(
                                    (f) => f.fundId === formData.fund && f.shareClass === formData.shareClass,
                                  );
                                  const isInvestorDistributor = formData.investor?.distributorId === dist.id;
                                  return (
                                    <SelectItem key={dist.id} value={dist.id}>
                                      <div className="flex items-center gap-2">
                                        <Handshake className="w-4 h-4 text-primary" />
                                        <div>
                                          <div className="font-medium">
                                            {dist.name}
                                            {isInvestorDistributor && (
                                              <Badge variant="outline" className="ml-2 text-xs h-4 border-primary text-primary">
                                                {t('subscriptions.newDialog.attitled')}
                                              </Badge>
                                            )}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {t('subscriptions.newDialog.entryFeesPct', {
                                              percent: feeConfig?.entryFeePercent ?? 0,
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex h-10 items-center gap-2 rounded-md border border-dashed border-border bg-muted/40 px-3">
                              <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                              <p className="text-xs text-muted-foreground">
                                {t('subscriptions.newDialog.selectFundFirst')}
                              </p>
                            </div>
                          )}
                          <FieldMessage message={fieldError('distributor')} />
                        </div>
                          <EditField label={t('subscriptions.detail.form.advisor')} icon={Users}>
                            <Input
                              value={extended.advisor}
                              onChange={(e) => updateExtended('advisor', e.target.value)}
                              placeholder={t('subscriptions.newDialog.distribution.advisorPlaceholder')}
                              className="h-10"
                            />
                          </EditField>
                        </div>
                        </FormSubsection>

                        <FormSubsection icon={Percent} title={t('subscriptions.newDialog.subsections.distributionTerms')}>
                        <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                          <div className="space-y-1.5 min-w-0">
                            <Label className={FORM_FIELD_LABEL_CLASS}>
                              <Euro className="w-3.5 h-3.5" />
                              {t('subscriptions.newDialog.entryFeesEditableLabel')}
                            </Label>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-white pr-3 focus-within:ring-2 focus-within:ring-ring/40">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={formData.entryFees}
                                onChange={(e) => {
                                  const cleaned = e.target.value
                                    .replace(/[^0-9.,]/g, '')
                                    .replace(',', '.');
                                  setFormData((prev) => ({ ...prev, entryFees: cleaned }));
                                }}
                                placeholder="0"
                                className="h-full border-0 bg-transparent font-semibold text-right shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                              <span className="ml-1 text-sm text-muted-foreground select-none">%</span>
                            </div>
                            <p className={FORM_FIELD_HINT_CLASS}>
                              {t('subscriptions.newDialog.entryFeesEditableHint', {
                                percent: defaultEntryFeePercent,
                              })}
                            </p>
                          </div>

                          <EditField label={t('subscriptions.detail.form.commissionRate')} icon={Percent}>
                            <div className="flex h-10 w-full items-center rounded-md border border-input bg-white pr-3 focus-within:ring-2 focus-within:ring-ring/40">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={extended.commissionRate}
                                onChange={(e) =>
                                  updateExtended(
                                    'commissionRate',
                                    e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'),
                                  )
                                }
                                placeholder="0"
                                className="h-full border-0 bg-transparent font-semibold text-right shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                              />
                              <span className="ml-1 text-sm text-muted-foreground select-none">%</span>
                            </div>
                          </EditField>

                          <EditField
                            label={t('subscriptions.detail.form.excludeRetrocessions')}
                            icon={ArrowDownCircle}
                          >
                            <SwitchField
                              id="exclude-retrocessions-switch"
                              checked={extended.excludeRetrocessions}
                              onCheckedChange={(checked) => updateExtended('excludeRetrocessions', checked)}
                              onLabel={t('subscriptions.detail.form.yes')}
                              offLabel={t('subscriptions.detail.form.no')}
                            />
                          </EditField>
                        </div>
                        </FormSubsection>
                      </motion.div>
                    )}

                  </FormSection>

                  {isEditMode && (
                    <>
                      <FormSection icon={User} title={t('subscriptions.detail.form.sectionSubscriber')}>
                      <FormSubsection>

                        <div className="grid grid-cols-3 gap-3">
                          <EditField label={t('subscriptions.detail.form.subscriberTitle')} icon={User}>
                            <Select
                              value={extended.subscriberTitle}
                              onValueChange={(value) =>
                                updateExtended('subscriberTitle', value as SubscriberTitle)
                              }
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder={t('subscriptions.detail.form.selectPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {SUBSCRIBER_TITLE_OPTIONS.map(([value, labelKey]) => (
                                  <SelectItem key={value} value={value}>
                                    {t(labelKey)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </EditField>

                          <EditField
                            label={t('subscriptions.detail.form.legalName')}
                            icon={Building2}
                            className="col-span-2"
                          >
                            <Input
                              value={extended.legalName}
                              onChange={(e) => updateExtended('legalName', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.lastNameField')} icon={User}>
                            <Input
                              value={extended.lastName}
                              onChange={(e) => updateExtended('lastName', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.firstNameField')} icon={User}>
                            <Input
                              value={extended.firstName}
                              onChange={(e) => updateExtended('firstName', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.emailField')} icon={Mail}>
                            <Input
                              type="email"
                              value={extended.email}
                              onChange={(e) => updateExtended('email', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.phoneField')} icon={Phone}>
                            <Input
                              type="tel"
                              value={extended.phone}
                              onChange={(e) => updateExtended('phone', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField
                            label={t('subscriptions.detail.form.address1')}
                            icon={MapPin}
                            className="col-span-2"
                          >
                            <Input
                              value={extended.address1}
                              onChange={(e) => updateExtended('address1', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField
                            label={t('subscriptions.detail.form.address2')}
                            icon={MapPin}
                            className="col-span-2"
                          >
                            <Input
                              value={extended.address2}
                              onChange={(e) => updateExtended('address2', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.postalCodeField')} icon={Hash}>
                            <Input
                              value={extended.postalCode}
                              onChange={(e) => updateExtended('postalCode', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.cityField')} icon={MapPin}>
                            <Input
                              value={extended.city}
                              onChange={(e) => updateExtended('city', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.country')} icon={Globe}>
                            <Input
                              value={extended.country}
                              onChange={(e) => updateExtended('country', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.birthDate')} icon={Calendar}>
                            <Input
                              type="date"
                              value={extended.birthDate}
                              onChange={(e) => updateExtended('birthDate', e.target.value)}
                              className="h-10"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.nationalityField')} icon={Flag}>
                            <Input
                              value={extended.nationality}
                              onChange={(e) => updateExtended('nationality', e.target.value)}
                              className="h-10"
                            />
                          </EditField>
                        </div>
                      </FormSubsection>
                      </FormSection>

                      <FormSection icon={Landmark} title={t('subscriptions.detail.form.sectionBanking')}>
                      <FormSubsection>

                        <div className="grid grid-cols-3 gap-3">
                          <EditField
                            label={t('subscriptions.detail.form.ibanField')}
                            icon={CreditCard}
                            className="col-span-2"
                          >
                            <Input
                              value={extended.iban}
                              onChange={(e) => updateExtended('iban', e.target.value)}
                              placeholder="FR76 0000 0000 0000 0000 0000 000"
                              className="h-10 font-mono uppercase"
                            />
                          </EditField>

                          <EditField label={t('subscriptions.detail.form.bicField')} icon={Landmark}>
                            <Input
                              value={extended.bic}
                              onChange={(e) => updateExtended('bic', e.target.value)}
                              placeholder="XXXXFRPP"
                              className="h-10 font-mono uppercase"
                            />
                          </EditField>
                        </div>
                      </FormSubsection>
                      </FormSection>

                      <FormSection icon={FileText} title={t('subscriptions.detail.form.sectionCustomFields')}>
                      <FormSubsection>

                        <EditField label={t('subscriptions.detail.form.sideLetter')} icon={FileText}>
                          <Textarea
                            value={extended.sideLetter}
                            onChange={(e) => updateExtended('sideLetter', e.target.value)}
                            placeholder={t('subscriptions.detail.form.sideLetterPlaceholder')}
                            className="min-h-20"
                          />
                        </EditField>
                      </FormSubsection>
                      </FormSection>

                    </>
                  )}

                  <FormSection
                    step={4}
                    status={sectionStatus.review}
                    icon={ClipboardCheck}
                    title={t('subscriptions.newDialog.sections.review')}
                    description={t('subscriptions.newDialog.sections.reviewDesc')}
                  >
                    {Object.keys(errors).length > 0 && submitAttempted && (
                      <div
                        className="rounded-xl border px-4 py-3 space-y-1.5"
                        style={{
                          backgroundColor: 'color-mix(in oklab, var(--destructive) 6%, var(--card))',
                          borderColor: 'color-mix(in oklab, var(--destructive) 30%, transparent)',
                        }}
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {t('subscriptions.newDialog.review.blockingTitle')}
                        </p>
                        <ul className="space-y-1">
                          {Object.values(errors).map((message) => (
                            <li key={message}>
                              <FieldMessage message={message} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <FormSubsection
                      icon={Tag}
                      title={t('subscriptions.newDialog.subscriptionName.label')}
                      action={
                        <SegmentedControl
                          size="sm"
                          aria-label={t('subscriptions.newDialog.subscriptionName.label')}
                          value={formData.nameMode}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, nameMode: value as NameMode }))}
                          options={[
                            { value: 'auto', label: t('subscriptions.newDialog.subscriptionName.modeAuto') },
                            { value: 'manual', label: t('subscriptions.newDialog.subscriptionName.modeManual') },
                          ]}
                        />
                      }
                    >
                      {formData.nameMode === 'auto' ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center rounded-md border border-input bg-white px-3 py-2 text-sm" style={{ minHeight: 40 }}>
                            {generatedSubscriptionName ? (
                              <span className="font-medium text-foreground break-words">{generatedSubscriptionName}</span>
                            ) : (
                              <span className="text-muted-foreground">
                                {t('subscriptions.newDialog.subscriptionName.ruleWaiting')}
                              </span>
                            )}
                          </div>
                          <p className={cn(FORM_FIELD_HINT_CLASS, 'flex items-start gap-1.5')}>
                            <Info className="w-3.5 h-3.5 shrink-0" style={{ marginTop: 1 }} />
                            {t('subscriptions.newDialog.subscriptionName.autoRule', {
                              pattern: t('subscriptions.newDialog.subscriptionName.patternDefault'),
                            })}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5" data-field-error={!!fieldError('subscriptionName')}>
                          <Label className={FORM_FIELD_LABEL_CLASS}>
                            {t('subscriptions.newDialog.subscriptionName.manualLabel')}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            value={formData.subscriptionName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, subscriptionName: e.target.value }))}
                            placeholder={generatedSubscriptionName || t('subscriptions.newDialog.subscriptionName.placeholder')}
                            aria-invalid={!!fieldError('subscriptionName')}
                            className="h-10"
                          />
                          <FieldMessage message={fieldError('subscriptionName')} />
                        </div>
                      )}
                    </FormSubsection>

                    <FormSubsection icon={Euro} title={t('subscriptions.newDialog.subsections.reviewAmounts')}>
                      <dl className="divide-y divide-border text-sm">
                        <ReviewRow label={t('subscriptions.newDialog.review.subscriptionAmount')}>
                          <span className="font-medium text-foreground">
                            {calculatedAmount > 0
                              ? `${formatAmount(calculatedAmount)} €`
                              : t('subscriptions.newDialog.review.toComplete')}
                          </span>
                        </ReviewRow>
                        <ReviewRow label={t('subscriptions.newDialog.review.totalAmount')}>
                          <div className="text-base font-bold text-primary">
                            {formatAmount(calculatedAmount + calculatedFees)} €
                          </div>
                          <div className={FORM_FIELD_HINT_CLASS}>
                            {t('subscriptions.newDialog.review.totalBreakdown', {
                              percent: entryFeePercent,
                              fees: formatAmount(calculatedEntryFees),
                              premium: formatAmount(subscriptionPremiumAmount),
                            })}
                          </div>
                        </ReviewRow>
                      </dl>
                      <p className={FORM_FIELD_HINT_CLASS}>{t('subscriptions.newDialog.review.amountsReadOnly')}</p>
                    </FormSubsection>

                    <FormSubsection icon={Globe} title={t('subscriptions.newDialog.review.language')}>
                      <div className="space-y-1.5">
                        <Select
                          value={formData.language}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, language: value as SubscriptionLanguage }))
                          }
                        >
                          <SelectTrigger className="h-10" aria-label={t('subscriptions.newDialog.notificationSection.languageLabel')}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBSCRIPTION_LANGUAGES.map((code) => (
                              <SelectItem key={code} value={code}>
                                {t(`subscriptions.newDialog.notificationSection.languageOptions.${code}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className={FORM_FIELD_HINT_CLASS}>
                          {formData.investor?.preferredLanguage
                            ? t('subscriptions.newDialog.notificationSection.languageHelper')
                            : t('subscriptions.newDialog.notificationSection.languageHelperFallback')}
                        </p>
                      </div>
                    </FormSubsection>

                    {!isEditMode && (
                      <FormSubsection
                        icon={Bell}
                        title={t('subscriptions.newDialog.notificationSection.notifyLabel')}
                        description={
                          formData.isIntermediated
                            ? t('subscriptions.newDialog.notificationSection.notifyDistributorDescription')
                            : t('subscriptions.newDialog.notificationSection.notifyInvestorDescription')
                        }
                        action={
                          <Switch
                            aria-label={t('subscriptions.newDialog.notificationSection.notifyLabel')}
                            checked={formData.notifyOnCreation}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({ ...prev, notifyOnCreation: checked }))
                            }
                          />
                        }
                      >
                        {formData.notifyOnCreation ? (
                          notificationRecipients.length > 0 ? (
                            <ul className="space-y-1.5">
                              {notificationRecipients.map((recipient) => (
                                <li
                                  key={recipient.role}
                                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                                >
                                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-foreground truncate">
                                      {recipient.name}
                                      <span className="ml-1.5 font-normal text-muted-foreground">
                                        {t(`subscriptions.newDialog.review.roles.${recipient.role}`)}
                                      </span>
                                      <Badge variant="outline" className="ml-2 text-xs h-5">
                                        {t(`subscriptions.newDialog.review.delivery.${recipient.delivery}`)}
                                      </Badge>
                                    </div>
                                    <div className={cn(FORM_FIELD_HINT_CLASS, 'truncate')}>
                                      {recipient.template
                                        ? t('subscriptions.newDialog.review.templateLine', { name: recipient.template.name })
                                        : t('subscriptions.newDialog.review.templateMissing')}
                                      {recipient.detail ? ` · ${recipient.detail}` : ''}
                                    </div>
                                  </div>
                                  {recipient.template && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setPreviewRecipient(recipient)}
                                      className="h-8 shrink-0"
                                      aria-label={t('subscriptions.newDialog.review.previewTemplate', {
                                        name: recipient.template.name,
                                      })}
                                    >
                                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                                      {t('subscriptions.newDialog.review.preview')}
                                    </Button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className={FORM_FIELD_HINT_CLASS}>{t('subscriptions.newDialog.review.recipientsWaiting')}</p>
                          )
                        ) : (
                          <p className={FORM_FIELD_HINT_CLASS}>{t('subscriptions.newDialog.review.notificationOff')}</p>
                        )}
                      </FormSubsection>
                    )}

                    {!isEditMode && (
                      <FormSubsection
                        icon={StickyNote}
                        title={t('subscriptions.newDialog.internalNote.toggleLabel')}
                        description={t('subscriptions.newDialog.internalNote.toggleHint')}
                        action={
                          <Switch
                            aria-label={t('subscriptions.newDialog.internalNote.toggleLabel')}
                            checked={formData.internalNote.enabled}
                            onCheckedChange={(checked) => updateInternalNote({ enabled: checked })}
                          />
                        }
                      >
                        {formData.internalNote.enabled ? (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                            data-field-error={!!fieldError('internalNote')}
                          >
                            <p className={FORM_FIELD_HINT_CLASS}>{t('subscriptions.newDialog.internalNote.whereVisible')}</p>
                            <NoteFormFields
                              bare
                              scope="subscription"
                              note={formData.internalNote.note}
                              onChange={(note) => updateInternalNote({ note })}
                            />
                            <FieldMessage message={fieldError('internalNote')} />
                          </motion.div>
                        ) : undefined}
                      </FormSubsection>
                    )}
                  </FormSection>
              </div>
            )}

            {step === 'documents' && (
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">
                  {t('subscriptions.newDialog.documentsStep.title')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('subscriptions.newDialog.documentsStep.subtitle')}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={(e) => handleAddDocuments(e.target.files)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl px-6 py-8 text-center hover:border-primary/60 hover:bg-primary/5 transition-colors flex flex-col items-center gap-2"
              >
                <CloudUpload className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm font-medium text-foreground">
                  {t('subscriptions.newDialog.documentsStep.dropzoneTitle')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('subscriptions.newDialog.documentsStep.dropzoneSubtitle')}
                </div>
                <div className="text-[11px] text-muted-foreground/80 mt-1">
                  {t('subscriptions.newDialog.documentsStep.dropzoneFormats')}
                </div>
              </button>

              {uploadedDocuments.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">
                    {t(
                      uploadedDocuments.length === 1
                        ? 'subscriptions.newDialog.documentsStep.uploadedFilesOne'
                        : 'subscriptions.newDialog.documentsStep.uploadedFilesMany',
                      { count: uploadedDocuments.length },
                    )}
                  </div>
                  <ul className="space-y-1.5">
                    {uploadedDocuments.map((file, idx) => (
                      <li
                        key={`${file.name}-${idx}`}
                        className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-foreground truncate">{file.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(idx)}
                          aria-label={t('subscriptions.newDialog.documentsStep.removeFile')}
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {t('subscriptions.newDialog.documentsStep.addMoreFiles')}
                  </Button>
                </div>
              )}
            </div>
            )}
          </BigModalBody>

          {/* Footer */}
          <BigModalPanelFooter
            start={
              step === 'init' ? (
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSubmitting}
                    size="sm"
                    className="h-9"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {t('subscriptions.newDialog.cancel')}
                  </Button>
              ) : (
                <Button
                    variant="ghost"
                    onClick={() => setStep('init')}
                    disabled={isSubmitting}
                    size="sm"
                    className="h-9"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    {t('subscriptions.newDialog.back')}
                  </Button>
              )
            }
            end={
              step === 'init' ? (
                <>
                    {isEditMode ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        size="sm"
                        className="bg-primary text-primary-foreground min-w-[200px] h-9"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('subscriptions.editDialog.saving')}
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            {t('subscriptions.editDialog.save')}
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          variant="outline"
                          size="sm"
                          className="min-w-[160px] h-9"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t('subscriptions.newDialog.creating')}
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              {t('subscriptions.newDialog.create')}
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={handleProceedToDocuments}
                          disabled={isSubmitting}
                          size="sm"
                          className="bg-primary text-primary-foreground min-w-[180px] h-9"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {t('subscriptions.newDialog.createAndValidate')}
                        </Button>
                      </>
                    )}
</>
              ) : (
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="sm"
                    className="bg-primary text-primary-foreground min-w-[200px] h-9"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('subscriptions.newDialog.validating')}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t('subscriptions.newDialog.validateSubscription')}
                      </>
                    )}
                  </Button>
              )
            }
          />
        </div>
        <Dialog open={!!previewRecipient} onOpenChange={(open) => !open && setPreviewRecipient(null)}>
          <DialogContent
            className="flex flex-col overflow-hidden"
            style={{ width: 760, maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh' }}
          >
            <DialogHeader>
              <DialogTitle>
                {t('subscriptions.newDialog.preview.title', { name: previewRecipient?.template?.name ?? '' })}
              </DialogTitle>
              <DialogDescription>
                {t('subscriptions.newDialog.preview.description', {
                  recipient: previewRecipient?.name ?? '',
                  language: t(`subscriptions.newDialog.notificationSection.languageOptions.${formData.language}`),
                })}
              </DialogDescription>
            </DialogHeader>
            {previewDocument && (
              <div className="space-y-3">
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t('subscriptions.newDialog.preview.subject')} </span>
                  <span className="font-medium text-foreground">{previewDocument.subject}</span>
                </div>
                <div className="rounded-md border border-border bg-gray-100 p-3 overflow-auto">
                  <iframe
                    title={t('subscriptions.newDialog.preview.frameLabel')}
                    srcDoc={previewDocument.html}
                    sandbox=""
                    className="w-full border-0 block bg-white"
                    style={{ height: 'min(60vh, 560px)' }}
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </BigModalContent>
    </BigModal>
  );
}
