import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
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
  PenTool,
  Briefcase,
  MessageSquare,
  Copy,
  Check,
  Star,
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
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Investor, Signatory, Note, Email } from '../utils/investorGenerator';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { EditableSection } from './EditableSection';
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
import { ContactsTab } from './investor-detail/ContactsTab';
import { useTranslation } from '../utils/languageContext';

interface InvestorDetailPageProps {
  investor: Investor;
  onBack: () => void;
  initialTab?: string;
}

export function InvestorDetailPage({ investor: initialInvestor, onBack, initialTab = 'profil' }: InvestorDetailPageProps) {
  const { t, lang } = useTranslation();
  const [investor, setInvestor] = useState(initialInvestor);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  
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
      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400" />
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Prospect': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'En discussion': return 'bg-purple-50 text-purple-600 border-purple-200';
      case 'En relation': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Archivé': return 'bg-gray-50 text-gray-500 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'En cours': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'En revue': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'À revoir': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Expiré': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'General': return 'bg-gray-100 text-gray-700';
      case 'KYC': return 'bg-blue-100 text-blue-700';
      case 'Risk': return 'bg-red-100 text-red-700';
      case 'Commercial': return 'bg-purple-100 text-purple-700';
      case 'Legal': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
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
          <label className="text-xs text-gray-500 mb-1 block">{label}</label>
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm text-gray-900">
              {value || <span className="text-gray-400 italic">{t('investors.detail.actions.notProvided')}</span>}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="text-xs text-gray-500 mb-1 block">{label}</label>
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
      case 'Sent': return <Send className="w-4 h-4 text-gray-500" />;
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'Opened': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'Replied': return <Reply className="w-4 h-4 text-emerald-500" />;
      default: return <Mail className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200"
      >
        {/* Breadcrumb */}
        <div className="px-8 pt-5 pb-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={onBack}
              className="hover:text-gray-900 transition-colors"
            >
              {t('breadcrumb.investhubOs')}
            </button>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={onBack}
              className="hover:text-gray-900 transition-colors"
            >
              {t('breadcrumb.investors')}
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{t('breadcrumb.investors')}</span>
          </div>
        </div>

        {/* Main Header Content */}
        <div className="px-8 pb-6">
          <div className="flex items-start justify-between">
            {/* Left Section - Avatar + Info */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </motion.button>
              
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-xl font-semibold">
                  {investor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </span>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-semibold text-gray-900">{investor.name}</h1>
                  <Badge
                    variant="outline"
                    className={`text-xs px-2.5 py-0.5 ${investor.status === 'En relation' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                  >
                    {t(`investors.status.${investor.status}`)}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-700 border-gray-200">
                    {t(`investors.type.${investor.type}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" />
                    <span>ID: {investor.id}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('investors.detail.header.registeredOn', { date: formatDate(investor.registrationDate) })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="gap-2 border-gray-300 hover:bg-gray-50"
                onClick={() => toast.success(t('investors.detail.actions.comingSoon'))}
              >
                <Mail className="w-4 h-4" />
                {t('investors.detail.header.sendEmail')}
              </Button>

              <Button
                style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                className="gap-2 text-white hover:opacity-90"
                onClick={() => toast.success(t('investors.detail.actions.comingSoon'))}
              >
                <Plus className="w-4 h-4" />
                {t('investors.detail.header.newSubscription')}
              </Button>
            </div>
          </div>
        </div>

        {/* Investment Statistics */}
        <div className="px-8 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600 font-medium">{t('investors.detail.stats.title')}</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs text-blue-600 mb-2">{t('investors.detail.stats.totalCapital')}</div>
              <div className="text-2xl font-semibold text-gray-900">{formatCurrency(investor.totalInvested)}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs text-purple-600 mb-2">{t('investors.detail.stats.subscriptionsCount')}</div>
              <div className="text-2xl font-semibold text-gray-900">{investor.subscriptionsCount}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs text-green-600 mb-2">{t('investors.detail.stats.averageTicket')}</div>
              <div className="text-2xl font-semibold text-gray-900">
                {formatCurrency(investor.totalInvested / investor.subscriptionsCount)}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs text-amber-600 mb-2">{t('investors.detail.stats.lastActivity')}</div>
              <div className="text-sm font-semibold text-gray-900 mt-1">{formatDate(investor.lastActivity)}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="px-8 -mt-px">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b border-gray-200 rounded-none w-full justify-start h-auto p-0 gap-6">
            <TabsTrigger 
              value="profil" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <User className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.profile')}
            </TabsTrigger>
            <TabsTrigger 
              value="contacts" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.contacts')}
              <Badge className="ml-2 bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {investor.contacts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="signataires" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <PenTool className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.signatories')}
              <Badge className="ml-2 bg-purple-50 text-purple-700 border-purple-200 text-xs">
                {investor.signatories.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="structures" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <Building2 className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.structures')}
              <Badge className="ml-2 bg-cyan-50 text-cyan-700 border-cyan-200 text-xs">
                {investor.structures.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.notes')}
              <Badge className="ml-2 bg-amber-50 text-amber-700 border-amber-200 text-xs">
                {investor.notes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="souscriptions" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.subscriptions')}
              <Badge className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                {investor.subscriptionsCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="fiscal" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <Landmark className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.fiscal')}
            </TabsTrigger>
            <TabsTrigger 
              value="emails" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-4 px-0 text-gray-600 font-medium"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('investors.detail.tabs.emails')}
              <Badge className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                {investor.emails.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Profil Tab */}
          <TabsContent value="profil" className="mt-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Informations générales */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-2 bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
                    <label className="text-xs text-gray-500 mb-1 block">{t('investors.detail.general.investorType')}</label>
                    <Badge variant="outline" className="border-gray-300">
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
                        icon={<Building2 className="w-4 h-4 text-gray-400" />}
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
                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                  />

                  <EditableField
                    label={t('investors.detail.general.phone')}
                    field="phone"
                    value={investor.phone}
                    type="tel"
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                  />

                  <div className="col-span-2">
                    <EditableField
                      label={t('investors.detail.general.address')}
                      field="address"
                      value={investor.address}
                      type="text"
                      icon={<MapPin className="w-4 h-4 text-gray-400" />}
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

                  <EditableField
                    label={t('investors.detail.general.country')}
                    field="country"
                    value={investor.country}
                    type="select"
                    options={[
                      { value: 'France', label: t('investors.detail.countryOptions.France') },
                      { value: 'Belgium', label: t('investors.detail.countryOptions.Belgium') },
                      { value: 'Switzerland', label: t('investors.detail.countryOptions.Switzerland') },
                      { value: 'Luxembourg', label: t('investors.detail.countryOptions.Luxembourg') },
                      { value: 'Germany', label: t('investors.detail.countryOptions.Germany') },
                      { value: 'United Kingdom', label: t('investors.detail.countryOptions.UnitedKingdom') },
                      { value: 'Spain', label: t('investors.detail.countryOptions.Spain') },
                      { value: 'Italy', label: t('investors.detail.countryOptions.Italy') }
                    ]}
                    icon={<Globe className="w-4 h-4 text-gray-400" />}
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
                    icon={<User className="w-4 h-4 text-gray-400" />}
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
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  {t('investors.detail.kyc.title')}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">{t('investors.detail.kyc.kycStatus')}</label>
                    <Badge variant="outline" className={`border ${getKycStatusColor(investor.kycStatus)} w-full justify-center`}>
                      {t(`investors.detail.kycStatus.${investor.kycStatus}`)}
                    </Badge>
                  </div>

                  {investor.kycExpiryDate && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">{t('investors.detail.kyc.kycExpiry')}</label>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{formatDate(investor.kycExpiryDate)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">{t('investors.detail.kyc.riskLevel')}</label>
                    <Badge variant="outline" className={`border ${getRiskColor(investor.riskLevel)} w-full justify-center`}>
                      {t(`investors.detail.riskLevel.${investor.riskLevel}`)}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">{t('investors.detail.kyc.amlScore')}</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${investor.amlScore > 70 ? 'bg-red-500' : investor.amlScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${investor.amlScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{investor.amlScore}/100</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">{t('investors.detail.kyc.monitoringActive')}</label>
                    <Badge variant="outline" className={`border w-full justify-center ${investor.monitoring ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {investor.monitoring ? t('investors.detail.kyc.monitoringEnabled') : t('investors.detail.kyc.monitoringDisabled')}
                    </Badge>
                  </div>
                </div>
              </motion.div>

              {/* Informations relationnelles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-2 bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
                    icon={<Calendar className="w-4 h-4 text-gray-400" />}
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
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
                      icon={<Calendar className="w-4 h-4 text-gray-400" />}
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
                      icon={<Globe className="w-4 h-4 text-gray-400" />}
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
                  className="col-span-3 bg-white rounded-xl border border-gray-200 p-6"
                >
                  <h2 className="font-semibold text-gray-900 mb-4">{t('investors.detail.tags')}</h2>
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
          <TabsContent value="contacts" className="mt-6">
            <ContactsTab investor={investor} />
          </TabsContent>

          {/* Signataires Tab */}
          <TabsContent value="signataires" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-purple-600" />
                    {t('investors.detail.signatories.title', { count: investor.signatories.length })}
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast.success(t('investors.detail.actions.comingSoon'))}
                  >
                    <Plus className="w-4 h-4" />
                    {t('investors.detail.signatories.addSignatory')}
                  </Button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {investor.signatories.map((signatory, idx) => (
                  <motion.div
                    key={signatory.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {signatory.firstName[0]}{signatory.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {signatory.firstName} {signatory.lastName}
                              </span>
                              {signatory.isPrimary && (
                                <Badge className="bg-purple-100 text-purple-700 border-purple-300 text-xs px-2">
                                  <Star className="w-3 h-3 mr-1 fill-purple-700" />
                                  {t('investors.detail.signatories.primarySignatory')}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5" />
                              {signatory.function}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-13 space-y-2">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{signatory.email}</span>
                            <CopyButton text={signatory.email} field={`sig-${signatory.id}-email`} />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{signatory.phone}</span>
                            <CopyButton text={signatory.phone} field={`sig-${signatory.id}-phone`} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <Badge 
                          variant="outline" 
                          className={`border ${
                            signatory.signatureLevel === 'Individual' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : signatory.signatureLevel === 'Joint'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <PenTool className="w-3 h-3 mr-1" />
                          {t(`investors.detail.signatureLevel.${signatory.signatureLevel}`)}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Structures Tab */}
          <TabsContent value="structures" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                  {t('investors.detail.structuresList.title', { count: investor.structures.length })}
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid gap-4">
                  {investor.structures.map((structure, idx) => (
                    <motion.div
                      key={structure.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    >
                      <div className="space-y-3">
                        {/* En-tête avec nom et type */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-gray-400" />
                            <span className="font-semibold text-gray-900">{structure.name}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`border text-xs ${
                              structure.type === 'SCI' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              structure.type === 'SARL' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              structure.type === 'SAS' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                              structure.type === 'SA' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                              structure.type === 'Trust' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              structure.type === 'Foundation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-cyan-50 text-cyan-700 border-cyan-200'
                            }`}
                          >
                            {structure.type}
                          </Badge>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-2 gap-3 pl-7">
                          {/* Représentant légal */}
                          {structure.legalRepresentative && (
                            <div className="flex items-center gap-2 col-span-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {structure.legalRepresentative}
                              </span>
                            </div>
                          )}

                          {/* Contacts */}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {(structure.contactsCount || 0) > 1
                                ? t('investors.detail.structuresList.contactsCountMany', { count: structure.contactsCount || 0 })
                                : t('investors.detail.structuresList.contactsCountOne', { count: structure.contactsCount || 0 })}
                            </span>
                          </div>

                          {/* Souscriptions */}
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {(structure.subscriptionsCount || 0) > 1
                                ? t('investors.detail.structuresList.subscriptionsCountMany', { count: structure.subscriptionsCount || 0 })
                                : t('investors.detail.structuresList.subscriptionsCountOne', { count: structure.subscriptionsCount || 0 })}
                            </span>
                          </div>

                          {/* Montant total investi */}
                          <div className="flex items-center gap-2 col-span-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-semibold text-gray-900">
                              {t('investors.detail.structuresList.investedAmount', {
                                amount: structure.totalInvested ? `${(structure.totalInvested / 1000000).toFixed(2)} M€` : '0 €'
                              })}
                            </span>
                          </div>

                          {/* Statut KYC */}
                          <div className="flex items-center gap-2 col-span-2">
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-1 ${
                                structure.kycStatus === 'Validé' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                structure.kycStatus === 'En cours' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                structure.kycStatus === 'À revoir' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-gray-50 text-gray-700 border-gray-200'
                              }`}
                            >
                              {t('investors.detail.structuresList.kycLabel', {
                                status: structure.kycStatus
                                  ? t(`investors.detail.kycStatus.${structure.kycStatus}`)
                                  : t('investors.detail.kycStatus.Non commencé')
                              })}
                            </Badge>
                          </div>

                          {/* Risk Score */}
                          {structure.riskScore !== undefined && (
                            <div className="flex items-center gap-2 col-span-2">
                              {structure.riskScore < 30 ? (
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              ) : structure.riskScore < 70 ? (
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                              <span className={`text-sm font-medium ${
                                structure.riskScore < 30 ? 'text-emerald-600' :
                                structure.riskScore < 70 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {t('investors.detail.structuresList.riskScore', { score: structure.riskScore })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    {t('investors.detail.notes.title', { count: investor.notes.length })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={() => toast.success(t('investors.detail.actions.comingSoon'))}
                    >
                      <Filter className="w-4 h-4" />
                      {t('investors.detail.notes.filter')}
                    </Button>
                    <Button
                      size="sm"
                      style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                      className="gap-2 text-white"
                      onClick={() => toast.success(t('investors.detail.actions.comingSoon'))}
                    >
                      <Plus className="w-4 h-4" />
                      {t('investors.detail.notes.newNote')}
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {investor.notes.map((note, idx) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`p-6 hover:bg-gray-50 transition-colors ${note.isImportant ? 'bg-amber-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getNoteTypeColor(note.type)}`}>
                            {t(`investors.detail.noteTypes.${note.type}`)}
                          </Badge>
                          {note.isImportant && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {t('investors.detail.notes.important')}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{formatDate(note.date)}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{t('investors.detail.notes.byAuthor', { author: note.author })}</span>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Souscriptions Tab */}
          <TabsContent value="souscriptions" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  {t('investors.detail.subscriptions.title', { count: investor.subscriptionsCount })}
                </h2>
              </div>

              <div className="p-6">
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">{t('investors.detail.subscriptions.comingSoon')}</p>
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
          <TabsContent value="fiscal" className="mt-6 space-y-6">
            {/* Informations fiscales */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
                  icon={<Globe className="w-4 h-4 text-gray-400" />}
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
                  icon={<MapPin className="w-4 h-4 text-gray-400" />}
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
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
                  icon={<CreditCard className="w-4 h-4 text-gray-400" />}
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
          <TabsContent value="emails" className="mt-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
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
              
              <div className="divide-y divide-gray-100">
                {investor.emails.map((email, idx) => (
                  <motion.div
                    key={email.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toast.info(t('investors.detail.emails.openEmail'), { description: email.subject })}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        {getEmailStatusIcon(email.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900 truncate">{email.subject}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            {email.hasAttachment && (
                              <Paperclip className="w-4 h-4 text-gray-400" />
                            )}
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                email.status === 'Sent' ? 'bg-gray-50 text-gray-700 border-gray-300' :
                                email.status === 'Delivered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                email.status === 'Opened' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {t(`investors.detail.emailStatus.${email.status}`)}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2">{email.preview}</p>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
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
        </Tabs>
      </div>
    </div>
  );
}
