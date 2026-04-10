import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, X, Hash, Calendar, ToggleLeft, AlertTriangle, HelpCircle, Lightbulb, Search, FileText, Mail } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { CountBadge } from '../ui/count-badge';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { motion, AnimatePresence } from 'motion/react';

interface LinkedDocument {
  id: string;
  name: string;
  fondName: string;
}

interface LinkedTemplate {
  id: string;
  name: string;
  groupName: string;
}

interface VariableFormatting {
  id: string;
  name: string;
  slug: string;
  type: 'number' | 'datetime' | 'bool';
  config: NumberConfig | DatetimeConfig | BoolConfig;
  documentsCount: number;
  gabaritsCount: number;
  linkedDocuments: LinkedDocument[];
  linkedTemplates: LinkedTemplate[];
  rank: number;
}

interface NumberConfig {
  prefix: string;
  thousandsSeparator: string;
  decimalSeparator: string;
  decimalCount: number;
  suffix: string;
}

interface DatetimeConfig {
  format: string;
  prefix: string;
  suffix: string;
}

interface BoolConfig {
  trueValue: string;
  falseValue: string;
  prefix: string;
  suffix: string;
}

const typeOptions = [
  { value: 'number', label: 'Nombre', icon: Hash, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'datetime', label: 'Date/Heure', icon: Calendar, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'bool', label: 'Booléen', icon: ToggleLeft, color: 'bg-green-100 text-green-700 border-green-200' },
];

// Composant HelpCard pour les aides contextuelles sur chaque champ
interface HelpCardProps {
  title: string;
  description: string;
  isVisible: boolean;
}

function HelpCard({ title, description, isVisible }: HelpCardProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div className="flex gap-2">
        <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 mb-1">{title}</p>
          <p className="text-xs text-blue-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Composant InfoBanner pour la définition fonctionnelle de l'objet
interface InfoBannerProps {
  title: string;
  description: string;
  helpUrl: string;
  isVisible: boolean;
}

function InfoBanner({ title, description, helpUrl, isVisible }: InfoBannerProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-white border border-blue-300 flex items-center justify-center flex-shrink-0">
          <HelpCircle className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-900 mb-1">
            <strong>{title}</strong>
          </p>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">{description}</p>
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 hover:underline transition-colors"
          >
            En savoir plus sur le centre d'aide
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// Mock data
const mockFormattings: VariableFormatting[] = [
  {
    id: '1',
    name: 'Montant en euros',
    slug: 'amount-euro',
    type: 'number',
    config: {
      prefix: '',
      thousandsSeparator: ' ',
      decimalSeparator: ',',
      decimalCount: 2,
      suffix: ' €',
    },
    documentsCount: 12,
    gabaritsCount: 5,
    linkedDocuments: [
      { id: 'd1', name: 'Contrat de souscription', fondName: 'Ternel Regenerative' },
      { id: 'd2', name: 'Bulletin de souscription', fondName: 'Ternel Regenerative' },
      { id: 'd3', name: 'Appel de fonds Q1 2024', fondName: 'Ternel Impact' },
      { id: 'd4', name: 'Rapport trimestriel', fondName: 'Green Energy Fund' },
      { id: 'd5', name: 'Document KYC', fondName: 'Ternel Regenerative' },
      { id: 'd11', name: 'Avenant au contrat', fondName: 'Ternel Regenerative' },
      { id: 'd12', name: 'Notice d\'information', fondName: 'Ternel Impact' },
      { id: 'd13', name: 'Attestation de souscription', fondName: 'Green Energy Fund' },
      { id: 'd14', name: 'Récépissé de versement', fondName: 'Ternel Regenerative' },
      { id: 'd15', name: 'Bordereau de souscription', fondName: 'Green Energy Fund' },
      { id: 'd16', name: 'Appel de fonds Q2 2024', fondName: 'Ternel Impact' },
      { id: 'd17', name: 'Appel de fonds Q3 2024', fondName: 'Ternel Impact' },
    ],
    linkedTemplates: [
      { id: 't1', name: 'Confirmation de souscription', groupName: 'Onboarding' },
      { id: 't2', name: 'Notification appel de fonds', groupName: 'Appels de fonds' },
      { id: 't3', name: 'Reporting annuel', groupName: 'Reporting' },
      { id: 't9', name: 'Relance de paiement', groupName: 'Appels de fonds' },
      { id: 't10', name: 'Certificat de parts', groupName: 'Onboarding' },
    ],
    rank: 0,
  },
  {
    id: '2',
    name: 'Montant en dollars',
    slug: 'amount-dollar',
    type: 'number',
    config: {
      prefix: '$',
      thousandsSeparator: ',',
      decimalSeparator: '.',
      decimalCount: 2,
      suffix: '',
    },
    documentsCount: 3,
    gabaritsCount: 2,
    linkedDocuments: [
      { id: 'd6', name: 'Investment Agreement', fondName: 'US Venture Fund' },
      { id: 'd7', name: 'Capital Call Notice', fondName: 'US Venture Fund' },
      { id: 'd18', name: 'Distribution Notice', fondName: 'US Venture Fund' },
    ],
    linkedTemplates: [
      { id: 't4', name: 'Subscription Confirmation', groupName: 'Onboarding' },
      { id: 't5', name: 'Capital Call', groupName: 'Capital Calls' },
    ],
    rank: 1,
  },
  {
    id: '3',
    name: 'Date française',
    slug: 'date-fr',
    type: 'datetime',
    config: {
      format: 'd/m/Y',
      prefix: '',
      suffix: '',
    },
    documentsCount: 25,
    gabaritsCount: 8,
    linkedDocuments: [
      { id: 'd8', name: 'Contrat de souscription', fondName: 'Ternel Regenerative' },
      { id: 'd9', name: 'Acte notarié', fondName: 'Ternel Impact' },
      { id: 'd10', name: 'Convention de gestion', fondName: 'Green Energy Fund' },
      { id: 'd19', name: 'Bulletin de souscription', fondName: 'Ternel Regenerative' },
      { id: 'd20', name: 'Appel de fonds Q1 2024', fondName: 'Ternel Impact' },
      { id: 'd21', name: 'Appel de fonds Q2 2024', fondName: 'Ternel Impact' },
      { id: 'd22', name: 'Appel de fonds Q3 2024', fondName: 'Ternel Impact' },
      { id: 'd23', name: 'Appel de fonds Q4 2024', fondName: 'Ternel Impact' },
      { id: 'd24', name: 'Rapport annuel 2023', fondName: 'Green Energy Fund' },
      { id: 'd25', name: 'Rapport annuel 2024', fondName: 'Green Energy Fund' },
      { id: 'd26', name: 'Document KYC', fondName: 'Ternel Regenerative' },
      { id: 'd27', name: 'Avenant au contrat', fondName: 'Ternel Regenerative' },
      { id: 'd28', name: 'Notice d\'information', fondName: 'Ternel Impact' },
      { id: 'd29', name: 'Attestation de souscription', fondName: 'Green Energy Fund' },
      { id: 'd30', name: 'Récépissé de versement', fondName: 'Ternel Regenerative' },
      { id: 'd31', name: 'Bordereau de souscription', fondName: 'Green Energy Fund' },
      { id: 'd32', name: 'Procès-verbal AG 2023', fondName: 'Ternel Impact' },
      { id: 'd33', name: 'Procès-verbal AG 2024', fondName: 'Ternel Impact' },
      { id: 'd34', name: 'Certificat de parts', fondName: 'Ternel Regenerative' },
      { id: 'd35', name: 'Avis d\'échéance', fondName: 'Green Energy Fund' },
      { id: 'd36', name: 'Relevé de situation', fondName: 'Ternel Regenerative' },
      { id: 'd37', name: 'Convention de compte', fondName: 'Ternel Impact' },
      { id: 'd38', name: 'Mandat de prélèvement', fondName: 'Green Energy Fund' },
      { id: 'd39', name: 'Document fiscal', fondName: 'Ternel Regenerative' },
      { id: 'd40', name: 'Attestation fiscale 2024', fondName: 'Ternel Impact' },
    ],
    linkedTemplates: [
      { id: 't6', name: 'Confirmation de souscription', groupName: 'Onboarding' },
      { id: 't7', name: 'Notification échéance', groupName: 'Suivi' },
      { id: 't8', name: 'Convocation AG', groupName: 'Gouvernance' },
      { id: 't11', name: 'Relance de paiement', groupName: 'Appels de fonds' },
      { id: 't12', name: 'Certificat de parts', groupName: 'Onboarding' },
      { id: 't13', name: 'Reporting trimestriel', groupName: 'Reporting' },
      { id: 't14', name: 'Avis de distribution', groupName: 'Distributions' },
      { id: 't15', name: 'Attestation fiscale', groupName: 'Fiscal' },
    ],
    rank: 2,
  },
  {
    id: '4',
    name: 'Oui/Non',
    slug: 'yes-no',
    type: 'bool',
    config: {
      trueValue: 'Oui',
      falseValue: 'Non',
      prefix: '',
      suffix: '',
    },
    documentsCount: 0,
    gabaritsCount: 0,
    linkedDocuments: [],
    linkedTemplates: [],
    rank: 3,
  },
];

interface FormattingRowProps {
  formatting: VariableFormatting;
  onEdit: (formatting: VariableFormatting) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const FormattingRow: React.FC<FormattingRowProps> = ({
  formatting,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {

  const typeOption = typeOptions.find(t => t.value === formatting.type);
  const TypeIcon = typeOption?.icon || Hash;

  const getPreview = () => {
    if (formatting.type === 'number') {
      const config = formatting.config as NumberConfig;
      const num = 123456.789;
      const parts = num.toFixed(config.decimalCount).split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
      const decimalPart = parts[1] || '';
      const formatted = decimalPart 
        ? `${integerPart}${config.decimalSeparator}${decimalPart}`
        : integerPart;
      return `${config.prefix}${formatted}${config.suffix}`;
    } else if (formatting.type === 'datetime') {
      const config = formatting.config as DatetimeConfig;
      // Simple preview based on format pattern
      let example = config.format;
      example = example.replace(/d/g, '28');
      example = example.replace(/m/g, '10');
      example = example.replace(/Y/g, '2025');
      example = example.replace(/y/g, '25');
      example = example.replace(/H/g, '14');
      example = example.replace(/h/g, '02');
      example = example.replace(/i/g, '30');
      example = example.replace(/s/g, '45');
      example = example.replace(/M/g, 'Oct');
      example = example.replace(/F/g, 'Octobre');
      return `${config.prefix}${example}${config.suffix}`;
    } else {
      const config = formatting.config as BoolConfig;
      return `VRAI: ${config.prefix}${config.trueValue}${config.suffix} / FAUX: ${config.prefix}${config.falseValue}${config.suffix}`;
    }
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{formatting.name}</span>
            {isPanelOpen && (
              <Badge variant="outline" className={`${typeOption?.color} border flex items-center gap-1.5`}>
                <TypeIcon className="w-3 h-3" />
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-500">{formatting.slug}</span>
        </div>
      </td>
      {!isPanelOpen && (
        <>
          <td className="p-3">
            <Badge variant="outline" className={`${typeOption?.color} border flex items-center gap-1.5 w-fit`}>
              <TypeIcon className="w-3.5 h-3.5" />
              {typeOption?.label}
            </Badge>
          </td>
          <td className="p-3">
            <span className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
              {getPreview()}
            </span>
          </td>
          <td className="p-3">
            <CountBadge count={formatting.documentsCount} icon={FileText} variant="purple" />
          </td>
          <td className="p-3">
            <CountBadge count={formatting.gabaritsCount} icon={Mail} variant="purple" />
          </td>
        </>
      )}
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(formatting)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(formatting.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface FormattingPanelProps {
  formatting?: VariableFormatting;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formatting: Omit<VariableFormatting, 'id' | 'rank'>) => void;
  helpMode: boolean;
}

const FormattingPanel: React.FC<FormattingPanelProps> = ({ formatting, isOpen, onClose, onSave, helpMode }) => {
  const [name, setName] = useState(formatting?.name || '');
  const [slug, setSlug] = useState(formatting?.slug || '');
  const [type, setType] = useState<'number' | 'datetime' | 'bool'>(formatting?.type || 'number');
  
  // Number config
  const [prefix, setPrefix] = useState((formatting?.config as NumberConfig)?.prefix || '');
  const [thousandsSeparator, setThousandsSeparator] = useState((formatting?.config as NumberConfig)?.thousandsSeparator || ',');
  const [decimalSeparator, setDecimalSeparator] = useState((formatting?.config as NumberConfig)?.decimalSeparator || '.');
  const [decimalCount, setDecimalCount] = useState((formatting?.config as NumberConfig)?.decimalCount || 2);
  const [suffix, setSuffix] = useState((formatting?.config as NumberConfig)?.suffix || '');
  
  // Datetime config
  const [dateFormat, setDateFormat] = useState((formatting?.config as DatetimeConfig)?.format || 'd/m/Y');
  const [datePrefix, setDatePrefix] = useState((formatting?.config as DatetimeConfig)?.prefix || '');
  const [dateSuffix, setDateSuffix] = useState((formatting?.config as DatetimeConfig)?.suffix || '');
  
  // Bool config
  const [trueValue, setTrueValue] = useState((formatting?.config as BoolConfig)?.trueValue || 'Oui');
  const [falseValue, setFalseValue] = useState((formatting?.config as BoolConfig)?.falseValue || 'Non');
  const [boolPrefix, setBoolPrefix] = useState((formatting?.config as BoolConfig)?.prefix || '');
  const [boolSuffix, setBoolSuffix] = useState((formatting?.config as BoolConfig)?.suffix || '');

  React.useEffect(() => {
    if (formatting) {
      setName(formatting.name);
      setSlug(formatting.slug);
      setType(formatting.type);
      
      if (formatting.type === 'number') {
        const config = formatting.config as NumberConfig;
        setPrefix(config.prefix);
        setThousandsSeparator(config.thousandsSeparator);
        setDecimalSeparator(config.decimalSeparator);
        setDecimalCount(config.decimalCount);
        setSuffix(config.suffix);
      } else if (formatting.type === 'datetime') {
        const config = formatting.config as DatetimeConfig;
        setDateFormat(config.format);
        setDatePrefix(config.prefix || '');
        setDateSuffix(config.suffix || '');
      } else if (formatting.type === 'bool') {
        const config = formatting.config as BoolConfig;
        setTrueValue(config.trueValue);
        setFalseValue(config.falseValue);
        setBoolPrefix(config.prefix || '');
        setBoolSuffix(config.suffix || '');
      }
    } else {
      setName('');
      setSlug('');
      setType('number');
      setPrefix('');
      setThousandsSeparator(',');
      setDecimalSeparator('.');
      setDecimalCount(2);
      setSuffix('');
      setDateFormat('d/m/Y');
      setDatePrefix('');
      setDateSuffix('');
      setTrueValue('Oui');
      setFalseValue('Non');
      setBoolPrefix('');
      setBoolSuffix('');
    }
  }, [formatting, isOpen]);

  const handleSave = () => {
    if (!name.trim() || !slug.trim()) return;
    
    let config: NumberConfig | DatetimeConfig | BoolConfig;
    
    if (type === 'number') {
      config = {
        prefix,
        thousandsSeparator,
        decimalSeparator,
        decimalCount,
        suffix,
      };
    } else if (type === 'datetime') {
      config = {
        format: dateFormat,
        prefix: datePrefix,
        suffix: dateSuffix,
      };
    } else {
      config = {
        trueValue,
        falseValue,
        prefix: boolPrefix,
        suffix: boolSuffix,
      };
    }
    
    onSave({
      name,
      slug,
      type,
      config,
    });
    onClose();
  };

  const getPreview = () => {
    if (type === 'number') {
      const num = 123456.789;
      const parts = num.toFixed(decimalCount).split('.');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
      const decimalPart = parts[1] || '';
      const formatted = decimalPart 
        ? `${integerPart}${decimalSeparator}${decimalPart}`
        : integerPart;
      return `${prefix}${formatted}${suffix}`;
    } else if (type === 'datetime') {
      // Simple preview based on format pattern
      let example = dateFormat;
      example = example.replace(/d/g, '28');
      example = example.replace(/m/g, '10');
      example = example.replace(/Y/g, '2025');
      example = example.replace(/y/g, '25');
      example = example.replace(/H/g, '14');
      example = example.replace(/h/g, '02');
      example = example.replace(/i/g, '30');
      example = example.replace(/s/g, '45');
      example = example.replace(/M/g, 'Oct');
      example = example.replace(/F/g, 'Octobre');
      return `${datePrefix}${example}${dateSuffix}`;
    } else {
      return `VRAI: ${boolPrefix}${trueValue}${boolSuffix} / FAUX: ${boolPrefix}${falseValue}${boolSuffix}`;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden shadow-xl"
        >
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-sm text-gray-900">
                  {formatting ? 'Éditer le formatage' : 'Nouveau formatage'}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Section - Sticky at top */}
            <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
              <Label className="text-xs text-gray-600 mb-1.5 block">Aperçu</Label>
              <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="font-mono text-sm text-gray-900">
                  {getPreview()}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Basic Information */}
                <div className="space-y-2.5">
                  <div>
                    <Label className="text-xs text-gray-700 mb-1.5 block">
                      Nom <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mon format"
                      className="h-9 text-sm"
                      required
                    />
                    <HelpCard
                      isVisible={helpMode}
                      title="Nom du format"
                      description="Donnez un nom explicite à votre format (ex. : 'EUR fr-FR (2 déc, symbole après)', 'Nombre FR 2 décimales'). Ce nom sera affiché dans l'éditeur de documents personnalisés."
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-gray-700 mb-1.5 block">
                      Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="mon-format"
                      className="h-9 text-sm"
                      required
                    />
                    <HelpCard
                      isVisible={helpMode}
                      title="Identifiant technique (slug)"
                      description="Un identifiant unique en minuscules, sans espaces ni caractères spéciaux (utilisez des tirets). Ex. : 'eur-fr-2dec' ou 'montant-euro'."
                    />
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Type de retour <span className="text-red-500">*</span>
                  </Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-3.5 h-3.5" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <HelpCard
                    isVisible={helpMode}
                    title="Type de données"
                    description="Sélectionnez le type de la variable à formater : Nombre (montants, quantités), Date/Heure (dates et heures) ou Booléen (valeurs vrai/faux). Seules les variables compatibles avec le nouveau format peuvent utiliser ces formatages."
                  />
                </div>

                {/* Configuration Section */}
                <div className="pt-2 border-t border-gray-200">
                  <Label className="text-xs text-gray-600 mb-2.5 block">Configuration</Label>

                  <div className="space-y-2.5">
                    {/* Conditional fields based on type */}
                    {type === 'number' && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Préfixe</Label>
                            <Input
                              value={prefix}
                              onChange={(e) => setPrefix(e.target.value)}
                              placeholder="$"
                              className="h-9 text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Suffixe</Label>
                            <Input
                              value={suffix}
                              onChange={(e) => setSuffix(e.target.value)}
                              placeholder="€"
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <HelpCard
                          isVisible={helpMode}
                          title="Préfixe et Suffixe"
                          description="Caractères affichés avant (préfixe) ou après (suffixe) le nombre. Ex. : '$' en préfixe pour les dollars, ' €' en suffixe (avec espace insécable) pour les euros. Laissez vide si non nécessaire."
                        />

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Séparateur milliers</Label>
                            <Input
                              value={thousandsSeparator}
                              onChange={(e) => setThousandsSeparator(e.target.value)}
                              placeholder=","
                              maxLength={1}
                              className="h-9 text-sm text-center"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Séparateur décimal</Label>
                            <Input
                              value={decimalSeparator}
                              onChange={(e) => setDecimalSeparator(e.target.value)}
                              placeholder="."
                              maxLength={1}
                              className="h-9 text-sm text-center"
                            />
                          </div>
                        </div>
                        <HelpCard
                          isVisible={helpMode}
                          title="Séparateurs"
                          description="Séparateur des milliers : caractère pour séparer les milliers (espace insécable pour FR, virgule pour EN/US). Séparateur de décimales : caractère entre la partie entière et décimale (virgule pour FR, point pour EN)."
                        />

                        <div>
                          <Label className="text-xs text-gray-700 mb-1.5 block">Nombre de décimales</Label>
                          <Input
                            type="number"
                            value={decimalCount}
                            onChange={(e) => setDecimalCount(parseInt(e.target.value) || 0)}
                            min={0}
                            max={10}
                            className="h-9 text-sm"
                          />
                          <HelpCard
                            isVisible={helpMode}
                            title="Nombre de décimales"
                            description="Nombre de chiffres après la virgule/point décimal (ex. : 0 pour les entiers, 2 pour les montants standards, 4 pour les pourcentages précis). Entre 0 et 10."
                          />
                        </div>
                      </>
                    )}

                    {type === 'datetime' && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Préfixe</Label>
                            <Input
                              value={datePrefix}
                              onChange={(e) => setDatePrefix(e.target.value)}
                              placeholder=""
                              className="h-9 text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Suffixe</Label>
                            <Input
                              value={dateSuffix}
                              onChange={(e) => setDateSuffix(e.target.value)}
                              placeholder=""
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <HelpCard
                          isVisible={helpMode}
                          title="Préfixe et Suffixe"
                          description="Caractères affichés avant (préfixe) ou après (suffixe) la date. Ex. : 'Le ' en préfixe, ' (date de signature)' en suffixe. Laissez vide si non nécessaire."
                        />

                        <div>
                          <Label className="text-xs text-gray-700 mb-1.5 block">
                            Format de date <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            value={dateFormat}
                            onChange={(e) => setDateFormat(e.target.value)}
                            placeholder="d/m/Y"
                            className="h-9 text-sm"
                            required
                          />
                          <HelpCard
                            isVisible={helpMode}
                            title="Format de date personnalisé"
                            description="Définissez le format d'affichage avec les codes suivants : d (jour 01-31), m (mois 01-12), Y (année 4 chiffres), y (année 2 chiffres), H (heures 00-23), h (heures 01-12), i (minutes 00-59), s (secondes 00-59), M (nom mois court), F (nom mois complet). Ex. : 'd/m/Y' → 28/10/2025, 'd/m/Y H:i' → 28/10/2025 14:30, 'Y-m-d' → 2025-10-28."
                          />
                        </div>
                      </>
                    )}

                    {type === 'bool' && (
                      <>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">
                              Valeur VRAI <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={trueValue}
                              onChange={(e) => setTrueValue(e.target.value)}
                              placeholder="Oui"
                              className="h-9 text-sm"
                              required
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">
                              Valeur FAUX <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              value={falseValue}
                              onChange={(e) => setFalseValue(e.target.value)}
                              placeholder="Non"
                              className="h-9 text-sm"
                              required
                            />
                          </div>
                        </div>
                        <HelpCard
                          isVisible={helpMode}
                          title="Valeurs booléennes"
                          description="Texte à afficher lorsque la variable est vraie ou fausse. Ex. : 'Oui'/'Non', 'Actif'/'Inactif', 'Validé'/'En attente'. Les deux valeurs sont obligatoires."
                        />

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Préfixe</Label>
                            <Input
                              value={boolPrefix}
                              onChange={(e) => setBoolPrefix(e.target.value)}
                              placeholder=""
                              className="h-9 text-sm"
                            />
                          </div>

                          <div>
                            <Label className="text-xs text-gray-700 mb-1.5 block">Suffixe</Label>
                            <Input
                              value={boolSuffix}
                              onChange={(e) => setBoolSuffix(e.target.value)}
                              placeholder=""
                              className="h-9 text-sm"
                            />
                          </div>
                        </div>
                        <HelpCard
                          isVisible={helpMode}
                          title="Préfixe et Suffixe"
                          description="Texte optionnel ajouté avant (préfixe) ou après (suffixe) la valeur booléenne. Laissez vide si non nécessaire."
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Linked Documents & Templates - Only show when editing */}
                {formatting && (
                  <>
                    {/* Documents personnalisés liés */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2.5">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <Label className="text-xs text-gray-700">
                          Documents personnalisés liés ({formatting.documentsCount})
                        </Label>
                      </div>
                      {formatting.linkedDocuments.length > 0 ? (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {formatting.linkedDocuments.map((doc) => (
                            <div
                              key={doc.id}
                              className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="text-xs text-gray-900">{doc.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{doc.fondName}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded border border-gray-200">
                          Aucun document lié
                        </div>
                      )}
                    </div>

                    {/* Gabarits liés */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <Label className="text-xs text-gray-700">
                          Gabarits liés ({formatting.gabaritsCount})
                        </Label>
                      </div>
                      {formatting.linkedTemplates.length > 0 ? (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {formatting.linkedTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="text-xs text-gray-900">{template.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{template.groupName}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded border border-gray-200">
                          Aucun gabarit lié
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-9 text-sm"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    style={{
                      background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                      color: 'white'
                    }}
                    className="flex-1 h-9 text-sm"
                    disabled={!name.trim() || !slug.trim()}
                  >
                    {formatting ? 'Enregistrer' : 'Créer'}
                  </Button>
                </div>
              </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function VariableFormattingSettingsContent() {
  const [formattings, setFormattings] = useState(mockFormattings);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingFormatting, setEditingFormatting] = useState<VariableFormatting | undefined>();
  const [deletingFormatting, setDeletingFormatting] = useState<VariableFormatting | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [substituteFormattingId, setSubstituteFormattingId] = useState<string>('');
  const [helpMode, setHelpMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = () => {
    setEditingFormatting(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (formatting: VariableFormatting) => {
    setEditingFormatting(formatting);
    setIsPanelOpen(true);
  };

  const handleSave = (formattingData: Omit<VariableFormatting, 'id' | 'rank' | 'documentsCount' | 'gabaritsCount' | 'linkedDocuments' | 'linkedTemplates'>) => {
    if (editingFormatting) {
      setFormattings(formattings.map(f => 
        f.id === editingFormatting.id 
          ? { 
              ...f, 
              ...formattingData,
              documentsCount: f.documentsCount,
              gabaritsCount: f.gabaritsCount,
              linkedDocuments: f.linkedDocuments,
              linkedTemplates: f.linkedTemplates,
            }
          : f
      ));
    } else {
      const newFormatting: VariableFormatting = {
        id: Date.now().toString(),
        ...formattingData,
        documentsCount: 0,
        gabaritsCount: 0,
        linkedDocuments: [],
        linkedTemplates: [],
        rank: formattings.length
      };
      setFormattings([...formattings, newFormatting]);
    }
    setIsPanelOpen(false);
    setEditingFormatting(undefined);
  };

  const handleDelete = (id: string) => {
    const formatting = formattings.find(f => f.id === id);
    if (formatting) {
      setDeletingFormatting(formatting);
      setSubstituteFormattingId('');
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingFormatting) {
      // Check if formatting is referenced
      const hasReferences = deletingFormatting.documentsCount > 0 || deletingFormatting.gabaritsCount > 0;
      
      if (hasReferences && !substituteFormattingId) {
        // Should not happen as button is disabled, but safety check
        return;
      }
      
      // If there are references and a substitute is selected, we would update all references
      // For now, just delete (in real app, would update references to substituteFormattingId)
      
      setFormattings(formattings.filter(f => f.id !== deletingFormatting.id).map((f, index) => ({
        ...f,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingFormatting(undefined);
      setSubstituteFormattingId('');
    }
  };

  const typeOption = deletingFormatting 
    ? typeOptions.find(t => t.value === deletingFormatting.type)
    : undefined;
  const DeletingIconComponent = typeOption?.icon || Hash;

  // Check if the formatting to delete has references
  const hasReferences = deletingFormatting 
    ? (deletingFormatting.documentsCount > 0 || deletingFormatting.gabaritsCount > 0)
    : false;

  // Get available substitute formattings (same type, excluding the one being deleted)
  const availableSubstitutes = deletingFormatting
    ? formattings.filter(f => f.type === deletingFormatting.type && f.id !== deletingFormatting.id)
    : [];

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingFormatting(undefined);
          setSubstituteFormattingId('');
        }
      }}>
        <AlertDialogContent className={hasReferences ? "max-w-2xl max-h-[90vh] overflow-y-auto" : "max-w-md"}>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left mb-1">
                  {hasReferences ? 'Supprimer et substituer le formatage ?' : 'Supprimer le formatage ?'}
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-4">
                {deletingFormatting && (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`${typeOption?.color} border flex items-center gap-1.5 w-fit`}>
                          <DeletingIconComponent className="w-3.5 h-3.5" />
                          {deletingFormatting.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {deletingFormatting.slug}
                      </p>
                    </div>
                    
                    {hasReferences ? (
                      <>
                        {/* Warning for referenced formatting */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-amber-900 mb-1">
                                <strong>Suppression interdite : formatage référencé</strong>
                              </p>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                Ce formatage est utilisé par <strong>{deletingFormatting.documentsCount} document{deletingFormatting.documentsCount > 1 ? 's' : ''} personnalisé{deletingFormatting.documentsCount > 1 ? 's' : ''}</strong> et <strong>{deletingFormatting.gabaritsCount} gabarit{deletingFormatting.gabaritsCount > 1 ? 's' : ''}</strong>. 
                                La suppression directe pourrait causer de graves problèmes de génération de documents.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Substitute selector */}
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">
                            Formatage de substitution <span className="text-red-500">*</span>
                          </Label>
                          <p className="text-xs text-gray-600 mb-2">
                            Sélectionnez un formatage existant du même type pour remplacer automatiquement toutes les références au formatage supprimé.
                          </p>
                          <Select value={substituteFormattingId} onValueChange={setSubstituteFormattingId}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Choisir un formatage de remplacement..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSubstitutes.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  Aucun autre formatage du même type disponible.
                                  <br />
                                  Créez un nouveau formatage avant de supprimer celui-ci.
                                </div>
                              ) : (
                                availableSubstitutes.map((f) => {
                                  const subTypeOption = typeOptions.find(t => t.value === f.type);
                                  const SubIcon = subTypeOption?.icon || Hash;
                                  return (
                                    <SelectItem key={f.id} value={f.id}>
                                      <div className="flex items-center gap-2">
                                        <SubIcon className="w-3.5 h-3.5" />
                                        <span>{f.name}</span>
                                        <span className="text-xs text-gray-500">({f.slug})</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Action :</strong> Toutes les variables utilisant "{deletingFormatting.name}" 
                            dans les <strong>{deletingFormatting.documentsCount} document{deletingFormatting.documentsCount > 1 ? 's' : ''} personnalisé{deletingFormatting.documentsCount > 1 ? 's' : ''}</strong> et 
                            les <strong>{deletingFormatting.gabaritsCount} gabarit{deletingFormatting.gabaritsCount > 1 ? 's' : ''}</strong> seront 
                            automatiquement basculées vers le formatage de substitution sélectionné.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Simple deletion for unreferenced formatting */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm text-green-900 mb-1">
                                <strong>Suppression autorisée</strong>
                              </p>
                              <p className="text-sm text-green-800">
                                Ce formatage n'est référencé dans aucun document ni gabarit. Vous pouvez le supprimer en toute sécurité.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce formatage ?
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingFormatting(undefined);
                setSubstituteFormattingId('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={hasReferences && (!substituteFormattingId || availableSubstitutes.length === 0)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {hasReferences ? 'Supprimer et substituer' : 'Supprimer définitivement'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <motion.div 
        animate={{ 
          width: isPanelOpen ? 'calc(100% - 420px)' : '100%' 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 overflow-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Formatage des variables</h1>
              <p className="text-sm text-gray-600">
                {formattings.length} formatage{formattings.length > 1 ? 's' : ''} configuré{formattings.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setHelpMode(!helpMode)}
                variant={helpMode ? "default" : "outline"}
                className="h-9"
                style={helpMode ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white'
                } : {}}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {helpMode ? 'Guidage activé' : 'Aide'}
              </Button>
              <Button
                onClick={handleAdd}
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                  color: 'white'
                }}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau formatage
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Formatage des variables"
            description="Cette fonctionnalité permet aux sociétés de gestion d'afficher leurs variables métier selon un format précis (locale, séparateurs, nombre de décimales, devise, etc.). Elle garantit une présentation homogène dans tous les documents personnalisés. Les formats sont transverses : une modification de format impacte tous les documents qui l'utilisent. Seules les variables compatibles avec le nouveau format (en bas de la liste dans l'éditeur) peuvent recevoir un formatage."
            helpUrl="https://investhub.zohodesk.eu/portal/fr/kb/articles/formatage-des-variables"
          />

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom ou slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 text-sm text-gray-600">Nom / Slug</th>
                    {!isPanelOpen && (
                      <>
                        <th className="text-left p-3 text-sm text-gray-600">Type de retour</th>
                        <th className="text-left p-3 text-sm text-gray-600">Pré-visualisation</th>
                        <th className="text-left p-3 text-sm text-gray-600">Documents</th>
                        <th className="text-left p-3 text-sm text-gray-600">Gabarits</th>
                      </>
                    )}
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {formattings.filter(f => 
                    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    f.slug.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={isPanelOpen ? 2 : 6} className="p-8 text-center text-sm text-gray-500">
                        {searchQuery ? 'Aucun formatage ne correspond à votre recherche.' : 'Aucun formatage configuré. Cliquez sur "Nouveau formatage" pour commencer.'}
                      </td>
                    </tr>
                  ) : (
                    formattings
                      .filter(f => 
                        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        f.slug.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((formatting) => (
                        <FormattingRow
                          key={formatting.id}
                          formatting={formatting}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          isPanelOpen={isPanelOpen}
                        />
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Side Panel */}
      <FormattingPanel
        formatting={editingFormatting}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingFormatting(undefined);
        }}
        onSave={handleSave}
        helpMode={helpMode}
      />
    </div>
  );
}

export function VariableFormattingSettings() {
  return <VariableFormattingSettingsContent />;
}
