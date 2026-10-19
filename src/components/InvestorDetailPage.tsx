import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  Shield,
  Users,
  FileText,
  Briefcase,
  MessageSquare,
  Copy,
  Check,
  Key,
  Globe,
  Hash,
  Clock,
  AlertCircle,
  Paperclip,
  Eye,
  Send,
  CheckCircle,
  Reply,
  Plus,
  Filter,
  Landmark,
  Heart,
  FileCheck,
  CreditCard,
  LogIn,
  UserCheck,
  Edit2,
  Save,
  X,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DetailTabsList } from './ui/detail-tabs';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from './ui/page-header';
import { WidgetCard, WidgetMetric } from './ui/widget-card';
import { Tabs, TabsContent } from './ui/tabs';
import { Investor, Signatory, Note, Email } from '../utils/investorGenerator';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { EditableSection } from './EditableSection';
import { useCompliance } from '../utils/complianceContext';
import { EntityDownloadMenu } from './entity-detail/EntityDownloadMenu';
import { navigateToDetail } from '../utils/routing';
import { ENTITY_STATUS_KEY, ENTITY_STATUS_VARIANT } from './entity-detail/entityDetailShared';
import { StatusBadge, type StatusVariant } from './StatusBadge';
import {
  validateEmail,
  validatePhone,
  validateSIREN,
  validateIBAN,
  validateBIC,
  validateTIN,
  validatePostalCode,
  validateBirthDate,
  validateRequired
} from '../utils/validations';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { ContactsTab, countContactRows } from './investor-detail/ContactsTab';
import { StructuresTab } from './investor-detail/StructuresTab';
import { NotesTab } from './investor-detail/NotesTab';
import { COUNTRIES, COUNTRY_LABEL_KEY } from '../utils/locationFixtures';
import { useTranslation } from '../utils/languageContext';

const INVESTOR_STATUS_VARIANT: Record<string, StatusVariant> = {
  Prospect: 'info',
  'En discussion': 'warning',
  'En relation': 'success',
  Archivé: 'neutral',
};

interface InvestorDetailPageProps {
  investor: Investor;
  onBack: () => void;
  initialTab?: string;
}

export function InvestorDetailPage({ investor: initialInvestor, onBack, initialTab = 'profil' }: InvestorDetailPageProps) {
  const { t, lang } = useTranslation();
  const { entityRows: complianceEntities } = useCompliance();
  const [investor, setInvestor] = useState(initialInvestor);
  const screenedEntities = (() => {
    const own = complianceEntities.filter((e) => e.parent.name === initialInvestor.name);
    if (own.length > 0) return own.slice(0, 4);
    return complianceEntities.filter((e) => e.parent.type === 'Investor').slice(0, 3);
  })();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab === 'signataires' ? 'contacts' : initialTab);
  
  // États d'édition pour chaque section
  const [editingGeneral, setEditingGeneral] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingPortal, setEditingPortal] = useState(false);
  const [editingFiscal, setEditingFiscal] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  
  // États des champs en cours d'édition
  const [editedFields, setEditedFields] = useState<Partial<Investor>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      toast.success(t('investors.detail.toast.copied'), { description: text });
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      toast.error(t('investors.detail.toast.copyError'), { description: t('investors.detail.toast.copyErrorDesc') });
    }
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => handleCopy(text, field)}
      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-muted-foreground/60" />
      )}
    </motion.button>
  );

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const countryLabel = (country: string) =>
    COUNTRY_LABEL_KEY[country] ? t(`investors.detail.countryOptions.${COUNTRY_LABEL_KEY[country]}`) : country;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'En cours': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'En revue': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'À revoir': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Expiré': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };


  // Fonctions de gestion de l'édition
  const startEdit = (section: string) => {
    setEditedFields({ ...investor });
    setFieldErrors({});
  };

  const cancelEdit = (section: string) => {
    setEditedFields({});
    setFieldErrors({});
  };

  const validateField = (fieldName: string, value: any): boolean => {
    let validation;
    
    switch (fieldName) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'phone':
        validation = validatePhone(value);
        break;
      case 'siren':
        validation = validateSIREN(value);
        break;
      case 'iban':
        validation = validateIBAN(value);
        break;
      case 'bic':
        validation = validateBIC(value);
        break;
      case 'tin':
        validation = validateTIN(value);
        break;
      case 'postalCode':
      case 'taxPostalCode':
        validation = validatePostalCode(value);
        break;
      case 'birthDate':
        validation = validateBirthDate(value);
        break;
      case 'name':
      case 'firstName':
      case 'lastName':
        validation = validateRequired(value, fieldName);
        break;
      default:
        validation = { valid: true };
    }
    
    if (!validation.valid) {
      setFieldErrors(prev => ({ ...prev, [fieldName]: validation.error || t('investors.detail.toast.validationGeneric') }));
      return false;
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      return true;
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setEditedFields(prev => ({ ...prev, [fieldName]: value }));
    // Validation en temps réel
    validateField(fieldName, value);
  };

  const saveEdit = (section: string) => {
    // Valider tous les champs modifiés
    let hasErrors = false;
    Object.keys(editedFields).forEach(key => {
      if (!validateField(key, editedFields[key as keyof Investor])) {
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      toast.error(t('investors.detail.toast.validationErrors'), {
        description: t('investors.detail.toast.validationErrorsDesc')
      });
      return;
    }

    setInvestor(prev => ({ ...prev, ...editedFields }));
    setEditedFields({});
    setFieldErrors({});

    toast.success(t('investors.detail.toast.changesSaved'), {
      description: t('investors.detail.toast.changesSavedDesc')
    });
  };

  // Composant pour les champs éditables
  const EditableField = ({ 
    label, 
    field, 
    value, 
    type = 'text',
    icon,
    options,
    disabled = false
  }: { 
    label: string; 
    field: keyof Investor; 
    value: any; 
    type?: string;
    icon?: React.ReactNode;
    options?: { value: string; label: string }[];
    disabled?: boolean;
  }) => {
    const isEditing = Object.keys(editedFields).length > 0;
    const editValue = editedFields[field] !== undefined ? editedFields[field] : value;
    const error = fieldErrors[field];

    if (!isEditing || disabled) {
      return (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-foreground">
              {value || <span className="text-muted-foreground/60 italic">{t('investors.detail.actions.notProvided')}</span>}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
        {type === 'select' && options ? (
          <Select
            value={editValue as string}
            onValueChange={(val) => handleFieldChange(field, val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === 'textarea' ? (
          <Textarea
            value={editValue as string || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full text-sm"
            rows={2}
          />
        ) : (
          <Input
            type={type}
            value={editValue as string || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="w-full text-sm"
          />
        )}
        {error && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const getEmailStatusIcon = (status: string) => {
    switch (status) {
      case 'Sent': return <Send className="w-4 h-4 text-muted-foreground" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'Opened': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'Replied': return <Reply className="w-4 h-4 text-emerald-500" />;
      default: return <Mail className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-muted">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-3">
            {investor.name}
            <StatusBadge label={t(`investors.status.${investor.status}`)} variant={INVESTOR_STATUS_VARIANT[investor.status] ?? 'neutral'} />
          </span>
        }
        subtitle={
          <PageHeaderSubtitle>
            <PageHeaderSubtitleItem icon={Hash} className="group">
              <span>{t('investors.detail.header.id', { id: investor.id })}</span>
              <button
                type="button"
                onClick={() => handleCopy(String(investor.id), 'header-id')}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                title={t('investors.detail.header.copyId')}
                aria-label={t('investors.detail.header.copyId')}
              >
                {copiedField === 'header-id' ? (
                  <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                )}
              </button>
            </PageHeaderSubtitleItem>

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={investor.type === 'Company' ? Building2 : User}>
              {t(`investors.type.${investor.type}`)}
            </PageHeaderSubtitleItem>

            {(investor.city || investor.state || investor.country) && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={MapPin}>
                  {[investor.city, investor.state, investor.country && countryLabel(investor.country)].filter(Boolean).join(', ')}
                </PageHeaderSubtitleItem>
              </>
            )}

            {investor.analyst && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={UserCheck}>
                  {t('investors.detail.header.manager', { name: investor.analyst })}
                </PageHeaderSubtitleItem>
              </>
            )}

            <PageHeaderSubtitleSeparator />

            <PageHeaderSubtitleItem icon={Calendar}>
              {t('investors.detail.header.registeredOn', { date: formatDate(investor.registrationDate) })}
            </PageHeaderSubtitleItem>
          </PageHeaderSubtitle>
        }
        primaryAction={{
          label: t('investors.detail.header.newSubscription'),
          icon: <Plus className="w-4 h-4" />,
          onClick: () => toast.success(t('investors.detail.actions.comingSoon')),
        }}
        extraActions={[
          {
            label: t('investors.detail.header.sendEmail'),
            icon: <Mail className="w-4 h-4" />,
            onClick: () => toast.success(t('investors.detail.actions.comingSoon')),
          },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-0">
        <div className="px-8 bg-card border-b border-border">
          <DetailTabsList
            overflow="scroll"
            items={[
              { value: 'profil', icon: User, label: t('investors.detail.tabs.profile') },
              { value: 'contacts', icon: Users, label: t('investors.detail.tabs.contacts'), badge: countContactRows(investor) },
              { value: 'structures', icon: Building2, label: t('investors.detail.tabs.structures'), badge: investor.structures.length },
              { value: 'notes', icon: FileText, label: t('investors.detail.tabs.notes'), badge: investor.notes.length },
              { value: 'souscriptions', icon: Briefcase, label: t('investors.detail.tabs.subscriptions'), badge: investor.subscriptionsCount },
              { value: 'fiscal', icon: Landmark, label: t('investors.detail.tabs.fiscal') },
              { value: 'emails', icon: MessageSquare, label: t('investors.detail.tabs.emails'), badge: investor.emails.length },
            ]}
          />
        </div>
        <div className="px-8 py-6">
          {/* Profil Tab */}
          <TabsContent value="profil" className="space-y-6">
            <WidgetCard icon={TrendingUp} title={t('investors.detail.stats.title')}>
              <div className="grid grid-cols-4 gap-4">
                <WidgetMetric size="lg" label={t('investors.detail.stats.totalCapital')} value={formatCurrency(investor.totalInvested)} />
                <WidgetMetric size="lg" label={t('investors.detail.stats.subscriptionsCount')} value={investor.subscriptionsCount} />
                <WidgetMetric
                  size="lg"
                  label={t('investors.detail.stats.averageTicket')}
                  value={investor.subscriptionsCount > 0 ? formatCurrency(investor.totalInvested / investor.subscriptionsCount) : '—'}
                />
                <WidgetMetric size="lg" label={t('investors.detail.stats.lastActivity')} value={formatDate(investor.lastActivity)} />
              </div>
            </WidgetCard>

            <div className="grid grid-cols-3 gap-6">
              {/* Informations générales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-2 bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    {t('investors.detail.general.title')}
                  </h2>
                  
                  {!editingGeneral ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        startEdit('general');
                        setEditingGeneral(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t("investors.detail.actions.edit")}
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          saveEdit('general');
                          setEditingGeneral(false);
                        }}
                        style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                        className="gap-1.5 text-white"
                      >
                        <Save className="w-4 h-4" />
                        {t("investors.detail.actions.save")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          cancelEdit('general');
                          setEditingGeneral(false);
                        }}
                        className="gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        {t("investors.detail.actions.cancel")}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <EditableField
                    label={t('investors.detail.general.fullName')}
                    field="name"
                    value={investor.name}
                    type="text"
                  />

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t('investors.detail.general.investorType')}</label>
                    <Badge variant="outline" className="border-border">
                      {t(`investors.type.${investor.type}`)}
                    </Badge>
                  </div>

                  {investor.type === 'Individual' && (
                    <>
                      <EditableField
                        label={t('investors.detail.general.firstName')}
                        field="firstName"
                        value={investor.firstName}
                        type="text"
                      />
                      <EditableField
                        label={t('investors.detail.general.lastName')}
                        field="lastName"
                        value={investor.lastName}
                        type="text"
                      />
                    </>
                  )}

                  {investor.type === 'Corporate' && (
                    <>
                      <EditableField
                        label={t('investors.detail.general.siren')}
                        field="siren"
                        value={investor.siren}
                        type="text"
                        icon={<Building2 className="w-4 h-4 text-muted-foreground/60" />}
                      />
                      <EditableField
                        label={t('investors.detail.general.company')}
                        field="companyName"
                        value={investor.companyName}
                        type="text"
                      />
                    </>
                  )}

                  <EditableField
                    label={t('investors.detail.general.email')}
                    field="email"
                    value={investor.email}
                    type="email"
                    icon={<Mail className="w-4 h-4 text-muted-foreground/60" />}
                  />

                  <EditableField
                    label={t('investors.detail.general.phone')}
                    field="phone"
                    value={investor.phone}
                    type="tel"
                    icon={<Phone className="w-4 h-4 text-muted-foreground/60" />}
                  />

                  <div className="col-span-2">
                    <EditableField
                      label={t('investors.detail.general.address')}
                      field="address"
                      value={investor.address}
                      type="text"
                      icon={<MapPin className="w-4 h-4 text-muted-foreground/60" />}
                    />
                  </div>

                  <EditableField
                    label={t('investors.detail.general.postalCode')}
                    field="postalCode"
                    value={investor.postalCode}
                    type="text"
                  />

                  <EditableField
                    label={t('investors.detail.general.city')}
                    field="city"
                    value={investor.city}
                    type="text"
                  />

                  {investor.state && (
                    <EditableField
                      label={t('investors.detail.general.state')}
                      field="state"
                      value={investor.state}
                      type="text"
                    />
                  )}

                  <EditableField
                    label={t('investors.detail.general.country')}
                    field="country"
                    value={investor.country}
                    type="select"
                    options={COUNTRIES.map((country) => ({ value: country, label: countryLabel(country) }))}
                    icon={<Globe className="w-4 h-4 text-muted-foreground/60" />}
                  />

                  <EditableField
                    label={t('investors.detail.general.crmSegment')}
                    field="crmSegment"
                    value={investor.crmSegment}
                    type="select"
                    options={[
                      { value: 'Platinum', label: 'Platinum' },
                      { value: 'Gold', label: 'Gold' },
                      { value: 'Silver', label: 'Silver' },
                      { value: 'Bronze', label: 'Bronze' },
                      { value: 'Standard', label: 'Standard' }
                    ]}
                  />

                  <EditableField
                    label={t('investors.detail.general.manager')}
                    field="analyst"
                    value={investor.analyst}
                    type="select"
                    options={[
                      { value: 'Sophie Martin', label: 'Sophie Martin' },
                      { value: 'Thomas Bernard', label: 'Thomas Bernard' },
                      { value: 'Marie Dubois', label: 'Marie Dubois' },
                      { value: 'Pierre Laurent', label: 'Pierre Laurent' },
                      { value: 'Julie Moreau', label: 'Julie Moreau' }
                    ]}
                    icon={<User className="w-4 h-4 text-muted-foreground/60" />}
                  />

                  <EditableField
                    label={t('investors.detail.general.parentInvestor')}
                    field="parentInvestor"
                    value={investor.parentInvestor}
                    type="text"
                  />

                  <EditableField
                    label={t('investors.detail.general.partner')}
                    field="partner"
                    value={investor.partner}
                    type="select"
                    options={[
                      { value: '', label: t('investors.detail.general.noPartner') },
                      { value: 'CGP Tututata', label: 'CGP Tututata' },
                      { value: 'Banque Privée XYZ', label: 'Banque Privée XYZ' },
                      { value: 'Family Office ABC', label: 'Family Office ABC' },
                      { value: 'Wealth Management DEF', label: 'Wealth Management DEF' }
                    ]}
                  />
                </div>
              </motion.div>

              {/* KYC & Compliance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {t('investors.detail.kyc.title')}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">{t('investors.detail.kyc.kycStatus')}</label>
                    <Badge variant="outline" className={`border ${getKycStatusColor(investor.kycStatus)} w-full justify-center`}>
                      {t(`investors.detail.kycStatus.${investor.kycStatus}`)}
                    </Badge>
                  </div>

                  {investor.kycExpiryDate && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{t('investors.detail.kyc.kycExpiry')}</label>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground/60" />
                        <span className="text-foreground">{formatDate(investor.kycExpiryDate)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">{t('investors.detail.kyc.riskLevel')}</label>
                    <Badge variant="outline" className={`border ${getRiskColor(investor.riskLevel)} w-full justify-center`}>
                      {t(`investors.detail.riskLevel.${investor.riskLevel}`)}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">{t('investors.detail.kyc.amlScore')}</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full ${investor.amlScore > 70 ? 'bg-red-500' : investor.amlScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${investor.amlScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{investor.amlScore}/100</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">{t('investors.detail.kyc.monitoringActive')}</label>
                    <Badge variant="outline" className={`border w-full justify-center ${investor.monitoring ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-muted text-foreground border-border'}`}>
                      {investor.monitoring ? t('investors.detail.kyc.monitoringEnabled') : t('investors.detail.kyc.monitoringDisabled')}
                    </Badge>
                  </div>

                  {screenedEntities.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-2 block">{t('investors.detail.kyc.screenedEntities')}</label>
                      <ul className="space-y-1.5">
                        {screenedEntities.map((entity) => (
                          <li key={entity.uid} className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => navigateToDetail('entity', entity.uid)}
                              title={t('investors.detail.kyc.openEntity')}
                              className="flex-1 min-w-0 flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-left hover:bg-muted/50 transition-colors group"
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-foreground truncate group-hover:underline">{entity.name}</span>
                              </span>
                              <span className="flex items-center gap-1.5 shrink-0">
                                {entity.pendingMatches > 0 && (
                                  <Badge variant="outline" className="text-[10px]">{entity.pendingMatches}</Badge>
                                )}
                                <StatusBadge label={t(ENTITY_STATUS_KEY[entity.status])} variant={ENTITY_STATUS_VARIANT[entity.status]} />
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              </span>
                            </button>
                            <EntityDownloadMenu entity={entity} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Informations relationnelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-2 bg-card rounded-xl border border-border p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    {t('investors.detail.relationship.title')}
                  </h2>
                  
                  {!editingRelationship ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        startEdit('relationship');
                        setEditingRelationship(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t("investors.detail.actions.edit")}
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          saveEdit('relationship');
                          setEditingRelationship(false);
                        }}
                        style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                        className="gap-1.5 text-white"
                      >
                        <Save className="w-4 h-4" />
                        {t("investors.detail.actions.save")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          cancelEdit('relationship');
                          setEditingRelationship(false);
                        }}
                        className="gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        {t("investors.detail.actions.cancel")}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <EditableField
                    label={t('investors.detail.relationship.status')}
                    field="status"
                    value={investor.status}
                    type="select"
                    options={[
                      { value: 'Prospect', label: t('investors.status.Prospect') },
                      { value: 'En discussion', label: t('investors.status.En discussion') },
                      { value: 'En relation', label: t('investors.status.En relation') },
                      { value: 'Archivé', label: t('investors.status.Archivé') }
                    ]}
                  />

                  <EditableField
                    label={t('investors.detail.relationship.relationshipStartDate')}
                    field="relationshipStartDate"
                    value={investor.relationshipStartDate ? new Date(investor.relationshipStartDate).toISOString().split('T')[0] : ''}
                    type="date"
                    icon={<Calendar className="w-4 h-4 text-muted-foreground/60" />}
                  />

                  <div className="col-span-2">
                    <EditableField
                      label={t('investors.detail.relationship.referralSource')}
                      field="referralSource"
                      value={investor.referralSource}
                      type="select"
                      options={[
                        { value: 'Investisseur professionnel', label: t('investors.detail.referralOptions.professionalInvestor') },
                        { value: 'Recommandation', label: t('investors.detail.referralOptions.recommendation') },
                        { value: 'Site web', label: t('investors.detail.referralOptions.website') },
                        { value: 'Événement', label: t('investors.detail.referralOptions.event') },
                        { value: 'Partenaire', label: t('investors.detail.referralOptions.partner') },
                        { value: 'Publicité', label: t('investors.detail.referralOptions.advertising') },
                        { value: 'Réseau social', label: t('investors.detail.referralOptions.socialNetwork') }
                      ]}
                    />
                  </div>

                  <EditableField
                    label={t('investors.detail.relationship.marketingOptIn')}
                    field="marketingOptIn"
                    value={investor.marketingOptIn ? t('investors.detail.relationship.accepted') : t('investors.detail.relationship.refused')}
                    type="select"
                    options={[
                      { value: 'Accepté', label: t('investors.detail.relationship.accepted') },
                      { value: 'Refusé', label: t('investors.detail.relationship.refused') }
                    ]}
                  />
                </div>
              </motion.div>

              {/* Informations personnelles */}
              {investor.type === 'Individual' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-card rounded-xl border border-border p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-600" />
                      {t('investors.detail.personal.title')}
                    </h2>
                    
                    {!editingPersonal ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          startEdit('personal');
                          setEditingPersonal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t("investors.detail.actions.edit")}
                      </motion.button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            saveEdit('personal');
                            setEditingPersonal(false);
                          }}
                          style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                          className="gap-1.5 text-white"
                        >
                          <Save className="w-4 h-4" />
                          {t("investors.detail.actions.save")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            cancelEdit('personal');
                            setEditingPersonal(false);
                          }}
                          className="gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          {t("investors.detail.actions.cancel")}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <EditableField
                      label={t('investors.detail.personal.birthDate')}
                      field="birthDate"
                      value={investor.birthDate ? new Date(investor.birthDate).toISOString().split('T')[0] : ''}
                      type="date"
                      icon={<Calendar className="w-4 h-4 text-muted-foreground/60" />}
                    />

                    <EditableField
                      label={t('investors.detail.personal.birthPlace')}
                      field="birthPlace"
                      value={investor.birthPlace}
                      type="text"
                    />

                    <EditableField
                      label={t('investors.detail.personal.birthCountry')}
                      field="birthCountry"
                      value={investor.birthCountry}
                      type="select"
                      options={[
                        { value: 'France', label: t('investors.detail.countryOptions.France') },
                        { value: 'Belgium', label: t('investors.detail.countryOptions.Belgium') },
                        { value: 'Switzerland', label: t('investors.detail.countryOptions.Switzerland') },
                        { value: 'Luxembourg', label: t('investors.detail.countryOptions.Luxembourg') },
                        { value: 'Germany', label: t('investors.detail.countryOptions.Germany') }
                      ]}
                      icon={<Globe className="w-4 h-4 text-muted-foreground/60" />}
                    />

                    <EditableField
                      label={t('investors.detail.personal.nationality')}
                      field="nationality"
                      value={investor.nationality}
                      type="select"
                      options={[
                        { value: 'France', label: t('investors.detail.nationalityOptions.France') },
                        { value: 'Belgium', label: t('investors.detail.nationalityOptions.Belgium') },
                        { value: 'Switzerland', label: t('investors.detail.nationalityOptions.Switzerland') },
                        { value: 'Luxembourg', label: t('investors.detail.nationalityOptions.Luxembourg') },
                        { value: 'Germany', label: t('investors.detail.nationalityOptions.Germany') }
                      ]}
                    />

                    <EditableField
                      label={t('investors.detail.personal.language')}
                      field="language"
                      value={investor.language}
                      type="select"
                      options={[
                        { value: 'Français', label: 'Français' },
                        { value: 'English', label: 'English' },
                        { value: 'Español', label: 'Español' },
                        { value: 'Deutsch', label: 'Deutsch' },
                        { value: 'Italiano', label: 'Italiano' }
                      ]}
                    />

                    <EditableField
                      label={t('investors.detail.personal.maritalStatus')}
                      field="maritalStatus"
                      value={investor.maritalStatus}
                      type="select"
                      options={[
                        { value: 'Célibataire', label: t('investors.detail.marital.single') },
                        { value: 'Marié(e)', label: t('investors.detail.marital.married') },
                        { value: 'Pacsé(e)', label: t('investors.detail.marital.civilUnion') },
                        { value: 'Divorcé(e)', label: t('investors.detail.marital.divorced') },
                        { value: 'Veuf(ve)', label: t('investors.detail.marital.widowed') }
                      ]}
                    />

                    {investor.maritalStatus === 'Marié(e)' && (
                      <EditableField
                        label={t('investors.detail.personal.matrimonialRegime')}
                        field="matrimonialRegime"
                        value={investor.matrimonialRegime}
                        type="select"
                        options={[
                          { value: 'Communauté réduite aux acquêts', label: t('investors.detail.regime.communityReduced') },
                          { value: 'Séparation de biens', label: t('investors.detail.regime.separation') },
                          { value: 'Communauté universelle', label: t('investors.detail.regime.communityUniversal') },
                          { value: 'Participation aux acquêts', label: t('investors.detail.regime.participation') }
                        ]}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tags */}
              {investor.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="col-span-3 bg-card rounded-xl border border-border p-6"
                >
                  <h2 className="font-semibold text-foreground mb-4">{t('investors.detail.tags')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {investor.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </TabsContent>

          {/* Contacts & accès Tab */}
          <TabsContent value="contacts">
            <ContactsTab investor={investor} />
          </TabsContent>

          {/* Structures Tab */}
          <TabsContent value="structures">
            <StructuresTab structures={investor.structures} onOpenTab={setActiveTab} />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <NotesTab notes={investor.notes} />
          </TabsContent>

          {/* Souscriptions Tab */}
          <TabsContent value="souscriptions">
            <div className="bg-card rounded-xl border border-border">
              <div className="p-6 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  {t('investors.detail.subscriptions.title', { count: investor.subscriptionsCount })}
                </h2>
              </div>

              <div className="p-6">
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-border mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">{t('investors.detail.subscriptions.comingSoon')}</p>
                  <Button
                    variant="outline"
                    onClick={() => toast.info(t('investors.detail.actions.comingSoon'))}
                  >
                    {t('investors.detail.subscriptions.viewAll')}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Fiscal & Bancaire Tab */}
          <TabsContent value="fiscal" className="space-y-6">
            {/* Informations fiscales */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-amber-600" />
                  {t('investors.detail.fiscal.title')}
                </h2>
                
                {!editingFiscal ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      startEdit('fiscal');
                      setEditingFiscal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {t("investors.detail.actions.edit")}
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        saveEdit('fiscal');
                        setEditingFiscal(false);
                      }}
                      style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                      className="gap-1.5 text-white"
                    >
                      <Save className="w-4 h-4" />
                      {t("investors.detail.actions.save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        cancelEdit('fiscal');
                        setEditingFiscal(false);
                      }}
                      className="gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      {t("investors.detail.actions.cancel")}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <EditableField
                  label={t('investors.detail.fiscal.taxResidence')}
                  field="taxResidence"
                  value={investor.taxResidence}
                  type="select"
                  options={[
                    { value: 'France', label: t('investors.detail.countryOptions.France') },
                    { value: 'Belgium', label: t('investors.detail.countryOptions.Belgium') },
                    { value: 'Switzerland', label: t('investors.detail.countryOptions.Switzerland') },
                    { value: 'Luxembourg', label: t('investors.detail.countryOptions.Luxembourg') }
                  ]}
                  icon={<Globe className="w-4 h-4 text-muted-foreground/60" />}
                />

                <div className="col-span-2">
                  <EditableField
                    label={t('investors.detail.fiscal.taxAddress')}
                    field="taxAddress"
                    value={investor.taxAddress}
                    type="text"
                  />
                </div>

                <EditableField
                  label={t('investors.detail.fiscal.taxPostalCode')}
                  field="taxPostalCode"
                  value={investor.taxPostalCode}
                  type="text"
                />

                <EditableField
                  label={t('investors.detail.fiscal.taxCity')}
                  field="taxCity"
                  value={investor.taxCity}
                  type="text"
                />

                <EditableField
                  label={t('investors.detail.fiscal.taxCountry')}
                  field="taxCountry"
                  value={investor.taxCountry}
                  type="select"
                  options={[
                    { value: 'France', label: t('investors.detail.countryOptions.France') },
                    { value: 'Belgium', label: t('investors.detail.countryOptions.Belgium') },
                    { value: 'Switzerland', label: t('investors.detail.countryOptions.Switzerland') },
                    { value: 'Luxembourg', label: t('investors.detail.countryOptions.Luxembourg') }
                  ]}
                  icon={<MapPin className="w-4 h-4 text-muted-foreground/60" />}
                />

                <EditableField
                  label={t('investors.detail.fiscal.tin')}
                  field="tin"
                  value={investor.tin}
                  type="text"
                />
              </div>
            </div>
            
            {/* Informations bancaires */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  {t('investors.detail.bank.title')}
                </h2>
                
                {!editingBank ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      startEdit('bank');
                      setEditingBank(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    {t("investors.detail.actions.edit")}
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        saveEdit('bank');
                        setEditingBank(false);
                      }}
                      style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                      className="gap-1.5 text-white"
                    >
                      <Save className="w-4 h-4" />
                      {t("investors.detail.actions.save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        cancelEdit('bank');
                        setEditingBank(false);
                      }}
                      className="gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      {t("investors.detail.actions.cancel")}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <EditableField
                  label={t('investors.detail.bank.iban')}
                  field="iban"
                  value={investor.iban}
                  type="text"
                  icon={<CreditCard className="w-4 h-4 text-muted-foreground/60" />}
                />

                <EditableField
                  label={t('investors.detail.bank.bic')}
                  field="bic"
                  value={investor.bic}
                  type="text"
                />
              </div>

              {!editingBank && investor.iban && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                    <Check className="w-3 h-3 mr-1" />
                    {t('investors.detail.bank.filled')}
                  </Badge>
                </div>
              )}

              {!editingBank && !investor.iban && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {t('investors.detail.bank.notFilled')}
                  </Badge>
                </div>
              )}
            </div>
          </TabsContent>

          {/* E-mails Tab */}
          <TabsContent value="emails">
            <div className="bg-card rounded-xl border border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                    {t('investors.detail.emails.title', { count: investor.emails.length })}
                  </h2>
                  <Button
                    size="sm"
                    style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                    className="gap-2 text-white"
                    onClick={() => toast.success(t('investors.detail.actions.comingSoon'))}
                  >
                    <Mail className="w-4 h-4" />
                    {t('investors.detail.emails.newEmail')}
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-border">
                {investor.emails.map((email, idx) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-6 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => toast.info(t('investors.detail.emails.openEmail'), { description: email.subject })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        {getEmailStatusIcon(email.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground truncate">{email.subject}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {email.hasAttachment && (
                              <Paperclip className="w-4 h-4 text-muted-foreground/60" />
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                email.status === 'Sent' ? 'bg-muted text-foreground border-border' :
                                email.status === 'Delivered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                email.status === 'Opened' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {t(`investors.detail.emailStatus.${email.status}`)}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate mb-2">{email.preview}</p>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{t('investors.detail.emails.from', { value: email.from })}</span>
                          <span>•</span>
                          <span>{t('investors.detail.emails.to', { value: email.to })}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(email.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
