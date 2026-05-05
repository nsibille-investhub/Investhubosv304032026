import { useState, useEffect, useMemo, useRef } from 'react';
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
} from 'lucide-react';
import { BigModal, BigModalContent, BigModalTitle, BigModalDescription } from './ui/big-modal';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { PartyTypeBadge } from './ui/party-type-badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';

interface NewSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubscriptionCreated?: (subscription: any) => void;
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
}

interface FormData {
  investor: Investor | null;
  structure: Structure | null | 'direct'; // 'direct' pour investissement sans structure
  fund: string;
  shareClass: string;
  numberOfShares: string;
  entryFees: string;
  distributor: string | 'direct'; // ID du distributeur ou 'direct'
}

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
  { id: '1', name: 'Sophie Martin', type: 'individual', email: 'sophie.martin@email.com', structures: [mockStructures[0], mockStructures[2]], distributorId: 'd1' },
  { id: '2', name: 'Jean Dubois', type: 'individual', email: 'jean.dubois@email.com', structures: [], distributorId: null },
  { id: '3', name: 'Alpha Capital Holding', type: 'corporate', email: 'contact@alphacapital.com', structures: [mockStructures[0]], distributorId: 'd2' },
  { id: '4', name: 'Global Invest SARL', type: 'corporate', email: 'info@globalinvest.com', structures: [mockStructures[1]], distributorId: 'd3' },
  { id: '5', name: 'Marie Bernard', type: 'individual', email: 'marie.bernard@email.com', structures: [mockStructures[2]], distributorId: null },
  { id: '6', name: 'Pierre Durand', type: 'individual', email: 'pierre.durand@email.com', structures: [], distributorId: 'd1' },
  { id: '7', name: 'Claire Petit', type: 'individual', email: 'claire.petit@email.com', structures: [mockStructures[3]], distributorId: 'd4' },
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

const shareClasses = ['A', 'B', 'C', 'I', 'R'];

// Demo-only pricing — real apps fetch this per fund / share class.
const SHARE_PRICE = 100;

interface StructureWithOwner extends Structure {
  owner: Investor;
}

function findInvestorOfStructure(structureId: string): Investor | null {
  return mockInvestors.find((inv) =>
    inv.structures?.some((s) => s.id === structureId),
  ) ?? null;
}

export function NewSubscriptionDialog({ open, onClose, onSubscriptionCreated }: NewSubscriptionDialogProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [structureFilter, setStructureFilter] = useState('');
  const [structurePickerOpen, setStructurePickerOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNewStructureForm, setShowNewStructureForm] = useState(false);
  const [showNewInvestorForm, setShowNewInvestorForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const [formData, setFormData] = useState<FormData>({
    investor: null,
    structure: null,
    fund: '',
    shareClass: '',
    numberOfShares: '',
    entryFees: '2.5',
    distributor: 'direct',
  });

  const [newStructure, setNewStructure] = useState({
    name: '',
    siret: '',
    country: 'France',
    address: '',
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setFormData({
          investor: null,
          structure: null,
          fund: '',
          shareClass: '',
          numberOfShares: '',
          entryFees: '2.5',
          distributor: 'direct',
        });
        setShowNewStructureForm(false);
        setShowNewInvestorForm(false);
        setNewInvestor(emptyNewInvestor);
        setSearchQuery('');
        setStructureFilter('');
        setShowAutocomplete(false);
      }, 300);
    }
  }, [open]);

  // Auto-select investor's attitled distributor as the default whenever the
  // investor is (re)selected.
  useEffect(() => {
    if (formData.investor) {
      const defaultDistributor = formData.investor.distributorId || 'direct';
      setFormData((prev) => ({ ...prev, distributor: defaultDistributor }));
    }
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
    return mockDistributors.filter(dist =>
      dist.fees.some(f => f.fundId === formData.fund && f.shareClass === formData.shareClass)
    );
  }, [formData.fund, formData.shareClass]);

  // Calculate entry fees based on distributor, fund, and share class
  const calculatedEntryFeePercent = useMemo(() => {
    if (formData.distributor === 'direct') {
      return 0; // Direct investment has no entry fees
    }
    
    const distributor = mockDistributors.find(d => d.id === formData.distributor);
    if (!distributor || !formData.fund || !formData.shareClass) {
      return parseFloat(formData.entryFees) || 2.5;
    }

    const feeConfig = distributor.fees.find(
      f => f.fundId === formData.fund && f.shareClass === formData.shareClass
    );
    
    return feeConfig?.entryFeePercent || parseFloat(formData.entryFees) || 2.5;
  }, [formData.distributor, formData.fund, formData.shareClass, formData.entryFees]);

  // Calculate total amount (price per share is fixed for the demo).
  const calculatedAmount = useMemo(() => {
    const shares = parseFloat(formData.numberOfShares) || 0;
    return shares * SHARE_PRICE;
  }, [formData.numberOfShares]);

  // Bidirectional binding: typing into Montant infers the number of shares.
  const handleAmountChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.,]/g, '').replace(',', '.');
    const amount = parseFloat(cleaned);
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormData({ ...formData, numberOfShares: '' });
      return;
    }
    const shares = Math.max(1, Math.round(amount / SHARE_PRICE));
    setFormData({ ...formData, numberOfShares: String(shares) });
  };

  // Calculate fees based on distributor
  const calculatedFees = useMemo(() => {
    const amount = calculatedAmount;
    return amount * (calculatedEntryFeePercent / 100);
  }, [calculatedAmount, calculatedEntryFeePercent]);

  // Validation
  const isFormValid =
    formData.investor !== null &&
    formData.structure !== null &&
    !!formData.fund &&
    !!formData.shareClass &&
    !!formData.numberOfShares &&
    parseFloat(formData.numberOfShares) > 0;

  const handleInvestorSelect = (investor: Investor) => {
    const noStructures = !investor.structures || investor.structures.length === 0;
    setFormData({
      ...formData,
      investor,
      // No structures available → default the subscription to direct so the
      // user doesn't have to make a non-choice. They can still 'Ajouter une
      // structure' if they need to.
      structure: noStructures ? 'direct' : null,
    });
    setSearchQuery('');
    setStructureFilter('');
    setShowAutocomplete(false);
  };

  const handleStructureFromSearchSelect = (structureWithOwner: StructureWithOwner) => {
    const { owner, ...structure } = structureWithOwner;
    setFormData({ ...formData, investor: owner, structure });
    setSearchQuery('');
    setStructureFilter('');
    setShowAutocomplete(false);
  };

  const handleStructureSelect = (structure: Structure) => {
    setFormData({ ...formData, structure });
    setShowNewStructureForm(false);
    setStructureFilter('');
  };

  const handleDirectInvestment = () => {
    setFormData({ ...formData, structure: 'direct' });
  };

  const handleClearInvestor = () => {
    setFormData({ ...formData, investor: null, structure: null });
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
    setFormData({ ...formData, investor, structure: 'direct' });
    setShowNewInvestorForm(false);
    setNewInvestor(emptyNewInvestor);
    setSearchQuery('');
    toast.success(t('subscriptions.newDialog.toast.investorCreated', { name: investor.name }));
  };

  const handleClearStructure = () => {
    setFormData({ ...formData, structure: null });
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

    setFormData({ ...formData, structure });
    setShowNewStructureForm(false);
    setNewStructure({ name: '', siret: '', country: 'France', address: '' });
    toast.success(t('subscriptions.newDialog.toast.structureCreated', { name: structure.name }));
  };

  const handleSubmit = async () => {
    if (!formData.investor || !formData.fund || !formData.shareClass || !formData.numberOfShares) {
      toast.error(t('subscriptions.newDialog.errors.incompleteData'));
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const fundName = funds.find((f) => f.id === formData.fund)?.name ?? '';
    const distributorName =
      formData.distributor === 'direct'
        ? 'Souscription Directe'
        : mockDistributors.find((d) => d.id === formData.distributor)?.name ?? 'N/A';
    const structureName =
      typeof formData.structure === 'object' && formData.structure
        ? formData.structure.name
        : '';

    // Créer la nouvelle souscription
    const newSubscription: any = {
      id: Date.now(), // ID temporaire basé sur le timestamp
      name: `${formData.investor.name} - €${calculatedAmount / 1000}K - ${fundName} Part ${formData.shareClass}`,
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
        distributorId: formData.distributor,
        distributorName,
        entryFeePercent: calculatedEntryFeePercent,
        totalFees: calculatedFees,
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
            : mockDistributors.find((d) => d.id === formData.distributor),
        entryFees: calculatedEntryFeePercent,
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
        amount: calculatedAmount.toLocaleString('fr-FR'),
      }),
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <BigModal open={open} onOpenChange={onClose}>
      <BigModalContent className="p-0 gap-0">
        <BigModalTitle className="sr-only">{t('subscriptions.newDialog.srTitle')}</BigModalTitle>
        <BigModalDescription className="sr-only">
          {t('subscriptions.newDialog.srDescription')}
        </BigModalDescription>
        
        <div className="flex flex-col h-full overflow-hidden rounded-3xl">
          {/* Header Compact */}
          <div className="px-8 py-4 bg-card border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{t('subscriptions.newDialog.title')}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t('subscriptions.newDialog.singleStepSubtitle')}
                  </p>
                </div>
              </div>

              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="hover:bg-muted rounded-full h-8 w-8"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Single-step content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="flex flex-col gap-6">
                  {/* INVESTOR SECTION */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {t('subscriptions.newDialog.investorLabel')}{' '}
                      <span className="text-destructive">*</span>
                    </Label>

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
                                          label={
                                            investor.type === 'individual'
                                              ? t('subscriptions.newDialog.shortIndividual')
                                              : t('subscriptions.newDialog.shortCorporate')
                                          }
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
                                            label={
                                              investor.type === 'individual'
                                                ? t('subscriptions.newDialog.shortIndividual')
                                                : t('subscriptions.newDialog.shortCorporate')
                                            }
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

                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleQuickCreateInvestor}
                                    className="w-full px-3 py-2 hover:bg-muted transition-colors text-left flex items-center gap-2 border-t border-border text-sm text-primary"
                                  >
                                    <Plus className="w-4 h-4" />
                                    {t('subscriptions.newDialog.createNewInvestor')}
                                  </button>
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
                  </div>

                  {/* STRUCTURE SECTION */}
                  {formData.investor && (() => {
                    const investorHasStructures =
                      (formData.investor.structures?.length ?? 0) > 0;
                    const isOptional = !investorHasStructures && !showNewStructureForm;

                    return (
                    <div className="space-y-2">
                      <Label
                        className={`text-xs uppercase tracking-wide font-semibold flex items-center gap-1.5 ${
                          isOptional ? 'text-muted-foreground/70' : 'text-muted-foreground'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        {t('subscriptions.newDialog.structureLabel')}
                        {isOptional ? (
                          <span className="text-muted-foreground/70 font-normal normal-case tracking-normal">
                            {t('subscriptions.newDialog.optional')}
                          </span>
                        ) : (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>

                      {showNewStructureForm ? (
                        /* New Structure Form */
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
                      ) : !investorHasStructures ? (
                        /* Investor has no structures — direct is the implicit choice.
                           Same SelectTrigger-styled row as a selected structure, plus
                           a discreet '+ Ajouter une structure' button on the right. */
                        <div className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-white px-3 py-2 text-sm">
                          <User
                            className="w-4 h-4 shrink-0"
                            style={{ color: 'var(--success)' }}
                          />
                          <span className="font-medium text-foreground truncate">
                            {t('subscriptions.newDialog.directInvestmentTitle')}
                          </span>
                          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                            {t('subscriptions.newDialog.directInvestorDesc', {
                              name: formData.investor.name,
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowNewStructureForm(true)}
                            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 h-7 text-xs text-primary hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {t('subscriptions.newDialog.addStructure')}
                          </button>
                        </div>
                      ) : formData.structure ? (
                        /* Structure selected — SelectTrigger-styled row with × to clear */
                        <div className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-white px-3 py-2 text-sm">
                          {formData.structure === 'direct' ? (
                            <>
                              <User
                                className="w-4 h-4 shrink-0"
                                style={{ color: 'var(--success)' }}
                              />
                              <span className="font-medium text-foreground truncate">
                                {t('subscriptions.newDialog.directInvestmentTitle')}
                              </span>
                              <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                                {t('subscriptions.newDialog.directInvestorDesc', {
                                  name: formData.investor.name,
                                })}
                              </span>
                            </>
                          ) : typeof formData.structure === 'object' ? (
                            <>
                              <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="font-medium text-foreground truncate">
                                {formData.structure.name}
                              </span>
                              <span className="text-xs text-muted-foreground inline-flex items-center gap-1 truncate hidden sm:inline-flex">
                                <Hash className="w-3 h-3" />
                                {formData.structure.siret}
                              </span>
                              <span className="text-xs text-muted-foreground inline-flex items-center gap-1 shrink-0 hidden md:inline-flex">
                                <Globe className="w-3 h-3" />
                                {formData.structure.country}
                              </span>
                            </>
                          ) : null}
                          <button
                            type="button"
                            onClick={handleClearStructure}
                            aria-label={t('subscriptions.newDialog.change')}
                            className="ml-auto inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        /* Closed-by-default dropdown picker */
                        (() => {
                          const investorStructures = formData.investor.structures ?? [];
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

                                <button
                                  type="button"
                                  onClick={() => {
                                    setStructurePickerOpen(false);
                                    setShowNewStructureForm(true);
                                  }}
                                  className="w-full px-3 py-2 hover:bg-muted transition-colors text-left flex items-center gap-2 border-t border-border text-sm text-primary"
                                >
                                  <Plus className="w-4 h-4" />
                                  {t('subscriptions.newDialog.createNewStructure')}
                                </button>
                              </PopoverContent>
                            </Popover>
                          );
                        })()
                      )}
                    </div>
                    );
                  })()}
                  {/* Fonds + Classe + Nombre de parts + Montant on one row */}
                  <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: '1.6fr 0.9fr 0.9fr 1.2fr' }}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <Label className="text-xs flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5" />
                        {t('subscriptions.newDialog.fundLabel')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.fund}
                        onValueChange={(value) => setFormData({ ...formData, fund: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('subscriptions.newDialog.selectFund')} />
                        </SelectTrigger>
                        <SelectContent>
                          {funds.map((fund) => (
                            <SelectItem key={fund.id} value={fund.id}>
                              <div className="flex items-center justify-between gap-3 min-w-0 w-full">
                                <span className="font-medium truncate">{fund.name}</span>
                                <span className="text-xs text-muted-foreground inline-flex items-center gap-2 shrink-0">
                                  <Badge variant="outline" className="text-[10px] h-4">
                                    {fund.category}
                                  </Badge>
                                  {fund.aum}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <Label className="text-xs flex items-center gap-1.5">
                        <Layers3 className="w-3.5 h-3.5" />
                        {t('subscriptions.newDialog.shareClassLabel')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.shareClass}
                        onValueChange={(value) => setFormData({ ...formData, shareClass: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('subscriptions.newDialog.selectShareClass')} />
                        </SelectTrigger>
                        <SelectContent>
                          {shareClasses.map((sc) => (
                            <SelectItem key={sc} value={sc}>
                              {t('subscriptions.newDialog.shareLabel', { class: sc })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <Label className="text-xs flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" />
                        {t('subscriptions.newDialog.numberOfShares')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        value={formData.numberOfShares}
                        onChange={(e) => setFormData({ ...formData, numberOfShares: e.target.value })}
                        placeholder="100"
                        className="h-10 font-semibold text-right"
                        min="1"
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <Label className="text-xs flex items-center gap-1.5">
                        <Euro className="w-3.5 h-3.5" />
                        {t('subscriptions.newDialog.amount')}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={
                          calculatedAmount > 0
                            ? calculatedAmount.toLocaleString('fr-FR')
                            : ''
                        }
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="10 000"
                        className="h-10 font-semibold text-right"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {t('subscriptions.newDialog.pricePerShareHint', {
                          price: SHARE_PRICE.toLocaleString('fr-FR'),
                        })}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  {/* Distributor Selection - Dropdown */}
                  <div className="mb-3">
                    <Label className="text-xs mb-1 flex items-center gap-1">
                      <Handshake className="w-3.5 h-3.5" />
                      {t('subscriptions.newDialog.distributorLabel')}
                    </Label>

                    {formData.fund && formData.shareClass ? (
                      <Select
                        value={formData.distributor}
                        onValueChange={(value) => setFormData({ ...formData, distributor: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder={t('subscriptions.newDialog.selectDistributor')} />
                        </SelectTrigger>
                        <SelectContent>
                          {/* Direct Option */}
                          <SelectItem value="direct">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4" style={{ color: 'var(--success)' }} />
                              <div>
                                <div className="font-medium">{t('subscriptions.newDialog.directSubscription')}</div>
                                <div className="text-xs text-muted-foreground">{t('subscriptions.newDialog.noEntryFees')}</div>
                              </div>
                            </div>
                          </SelectItem>

                          {/* Authorized Distributors */}
                          {authorizedDistributors.length > 0 && authorizedDistributors.map((dist) => {
                            const feeConfig = dist.fees.find(
                              f => f.fundId === formData.fund && f.shareClass === formData.shareClass
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
                                      {t('subscriptions.newDialog.entryFeesPct', { percent: feeConfig?.entryFeePercent ?? 0 })}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-3 bg-muted border border-border rounded-lg text-center">
                        <Info className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {t('subscriptions.newDialog.selectFundFirst')}
                        </p>
                      </div>
                    )}

                    {/* Warning if no distributors */}
                    {formData.fund && formData.shareClass && authorizedDistributors.length === 0 && (
                      <div
                        className="mt-2 p-2 rounded-lg flex items-center gap-2 border"
                        style={{
                          backgroundColor: 'color-mix(in oklab, var(--warning) 12%, transparent)',
                          borderColor: 'color-mix(in oklab, var(--warning) 30%, transparent)',
                        }}
                      >
                        <Info
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: 'var(--warning)' }}
                        />
                        <p className="text-xs text-foreground">
                          {t('subscriptions.newDialog.noDistributorsWarning')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Amount Summary */}
                  {calculatedAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-auto p-2 bg-primary/5 rounded-lg border border-primary/30"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{t('subscriptions.newDialog.amount')}</span>
                          <span className="font-medium text-foreground">{calculatedAmount.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {t('subscriptions.newDialog.feesWithPercent', { percent: calculatedEntryFeePercent })}
                            {formData.distributor === 'direct' && (
                              <Badge variant="outline" className="ml-1 text-xs h-4" style={{ borderColor: 'var(--success)', color: 'var(--success)' }}>
                                {t('subscriptions.newDialog.direct')}
                              </Badge>
                            )}
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: calculatedFees === 0 ? 'var(--success)' : 'var(--warning)' }}
                          >
                            {calculatedFees.toLocaleString('fr-FR')} €
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-xs font-semibold text-foreground">{t('subscriptions.newDialog.total')}</span>
                          <span className="font-bold text-primary">{(calculatedAmount + calculatedFees).toLocaleString('fr-FR')} €</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-8 py-4 bg-muted">
            <div className="flex items-center justify-between">
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

              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                size="sm"
                className="bg-primary text-primary-foreground min-w-[180px] h-9"
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
            </div>
          </div>
        </div>
      </BigModalContent>
    </BigModal>
  );
}
