import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, AlertTriangle, FolderOpen, FileText, Search, ArrowRight, HelpCircle, Lightbulb } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { CountBadge } from '../ui/count-badge';
import { DataPagination } from '../ui/data-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface LinkedSection {
  id: string;
  name: string;
  onboardingName: string;
}

interface SectionCategory {
  id: string;
  nom: string;
  code: string;
  rank: number;
  sectionsCount: number;
  linkedSections: LinkedSection[];
}

const mockCategories: SectionCategory[] = [
  { 
    id: '1', 
    nom: 'Beneficial owner', 
    code: 'BO', 
    rank: 0, 
    sectionsCount: 12,
    linkedSections: [
      { id: 's1', name: 'Personal Information', onboardingName: 'Individual KYC' },
      { id: 's2', name: 'Ownership Structure', onboardingName: 'Corporate KYC' },
      { id: 's3', name: 'Control Assessment', onboardingName: 'Enhanced Due Diligence' },
      { id: 's4', name: 'Ultimate Beneficial Owner', onboardingName: 'Corporate KYC' },
      { id: 's5', name: 'Shareholding Details', onboardingName: 'Corporate KYC' },
      { id: 's6', name: 'Voting Rights', onboardingName: 'Corporate KYC' },
      { id: 's7', name: 'Board Representation', onboardingName: 'Corporate KYC' },
      { id: 's8', name: 'Management Control', onboardingName: 'Enhanced Due Diligence' },
      { id: 's9', name: 'Indirect Ownership', onboardingName: 'Corporate KYC' },
      { id: 's10', name: 'Trust Arrangements', onboardingName: 'Enhanced Due Diligence' },
      { id: 's11', name: 'Nominee Shareholders', onboardingName: 'Corporate KYC' },
      { id: 's12', name: 'Change of Control', onboardingName: 'Corporate KYC' },
    ]
  },
  { 
    id: '2', 
    nom: 'Entity', 
    code: 'ENTITY', 
    rank: 1, 
    sectionsCount: 8,
    linkedSections: [
      { id: 's13', name: 'Company Details', onboardingName: 'Corporate KYC' },
      { id: 's14', name: 'Registration Information', onboardingName: 'Corporate KYC' },
      { id: 's15', name: 'Business Activity', onboardingName: 'Corporate KYC' },
      { id: 's16', name: 'Registered Address', onboardingName: 'Corporate KYC' },
      { id: 's17', name: 'Operating Addresses', onboardingName: 'Corporate KYC' },
      { id: 's18', name: 'Contact Information', onboardingName: 'Corporate KYC' },
      { id: 's19', name: 'Corporate Purpose', onboardingName: 'Corporate KYC' },
      { id: 's20', name: 'Group Structure', onboardingName: 'Enhanced Due Diligence' },
    ]
  },
  { 
    id: '3', 
    nom: 'Form', 
    code: 'FORM', 
    rank: 2, 
    sectionsCount: 5,
    linkedSections: [
      { id: 's21', name: 'Form Metadata', onboardingName: 'All Forms' },
      { id: 's22', name: 'Submission Details', onboardingName: 'All Forms' },
      { id: 's23', name: 'Validation Rules', onboardingName: 'All Forms' },
      { id: 's24', name: 'Workflow Status', onboardingName: 'All Forms' },
      { id: 's25', name: 'Review Comments', onboardingName: 'All Forms' },
    ]
  },
  { 
    id: '4', 
    nom: 'Financial Information', 
    code: 'FIN', 
    rank: 3, 
    sectionsCount: 15,
    linkedSections: [
      { id: 's26', name: 'Financial Statements', onboardingName: 'Corporate KYC' },
      { id: 's27', name: 'Revenue Information', onboardingName: 'Corporate KYC' },
      { id: 's28', name: 'Asset Declaration', onboardingName: 'Individual KYC' },
      { id: 's29', name: 'Liability Disclosure', onboardingName: 'Corporate KYC' },
      { id: 's30', name: 'Net Worth', onboardingName: 'Individual KYC' },
      { id: 's31', name: 'Income Sources', onboardingName: 'Individual KYC' },
      { id: 's32', name: 'Investment Portfolio', onboardingName: 'Individual KYC' },
      { id: 's33', name: 'Credit Rating', onboardingName: 'Corporate KYC' },
      { id: 's34', name: 'Banking Relationships', onboardingName: 'Corporate KYC' },
      { id: 's35', name: 'Audit Reports', onboardingName: 'Corporate KYC' },
      { id: 's36', name: 'Tax Returns', onboardingName: 'Individual KYC' },
      { id: 's37', name: 'Financial Projections', onboardingName: 'Corporate KYC' },
      { id: 's38', name: 'Debt Obligations', onboardingName: 'Corporate KYC' },
      { id: 's39', name: 'Equity Structure', onboardingName: 'Corporate KYC' },
      { id: 's40', name: 'Cash Flow', onboardingName: 'Corporate KYC' },
    ]
  },
  { 
    id: '5', 
    nom: 'Risk Assessment', 
    code: 'RISK', 
    rank: 4, 
    sectionsCount: 6,
    linkedSections: [
      { id: 's41', name: 'Risk Profile', onboardingName: 'Enhanced Due Diligence' },
      { id: 's42', name: 'Country Risk', onboardingName: 'Enhanced Due Diligence' },
      { id: 's43', name: 'Industry Risk', onboardingName: 'Enhanced Due Diligence' },
      { id: 's44', name: 'Transaction Risk', onboardingName: 'Enhanced Due Diligence' },
      { id: 's45', name: 'PEP Screening', onboardingName: 'Enhanced Due Diligence' },
      { id: 's46', name: 'Sanctions Check', onboardingName: 'Enhanced Due Diligence' },
    ]
  },
  { 
    id: '6', 
    nom: 'Compliance Documents', 
    code: 'COMP', 
    rank: 5, 
    sectionsCount: 9,
    linkedSections: [
      { id: 's47', name: 'ID Documents', onboardingName: 'Individual KYC' },
      { id: 's48', name: 'Proof of Address', onboardingName: 'Individual KYC' },
      { id: 's49', name: 'Articles of Association', onboardingName: 'Corporate KYC' },
      { id: 's50', name: 'Certificate of Incorporation', onboardingName: 'Corporate KYC' },
      { id: 's51', name: 'Business License', onboardingName: 'Corporate KYC' },
      { id: 's52', name: 'Shareholder Register', onboardingName: 'Corporate KYC' },
      { id: 's53', name: 'Director Registry', onboardingName: 'Corporate KYC' },
      { id: 's54', name: 'Power of Attorney', onboardingName: 'All Forms' },
      { id: 's55', name: 'Compliance Certificates', onboardingName: 'Corporate KYC' },
    ]
  },
  { 
    id: '7', 
    nom: 'Tax Information', 
    code: 'TAX', 
    rank: 6, 
    sectionsCount: 4,
    linkedSections: [
      { id: 's56', name: 'Tax Residency', onboardingName: 'Individual KYC' },
      { id: 's57', name: 'Tax Identification Number', onboardingName: 'Individual KYC' },
      { id: 's58', name: 'FATCA Declaration', onboardingName: 'Individual KYC' },
      { id: 's59', name: 'CRS Self-Certification', onboardingName: 'Individual KYC' },
    ]
  },
  { 
    id: '8', 
    nom: 'Legal Structure', 
    code: 'LEGAL', 
    rank: 7, 
    sectionsCount: 11,
    linkedSections: [
      { id: 's60', name: 'Entity Type', onboardingName: 'Corporate KYC' },
      { id: 's61', name: 'Jurisdiction', onboardingName: 'Corporate KYC' },
      { id: 's62', name: 'Governing Law', onboardingName: 'Corporate KYC' },
      { id: 's63', name: 'Corporate Officers', onboardingName: 'Corporate KYC' },
      { id: 's64', name: 'Authorized Signatories', onboardingName: 'Corporate KYC' },
      { id: 's65', name: 'Legal Representatives', onboardingName: 'Corporate KYC' },
      { id: 's66', name: 'Regulatory Licenses', onboardingName: 'Corporate KYC' },
      { id: 's67', name: 'Professional Advisors', onboardingName: 'Corporate KYC' },
      { id: 's68', name: 'Litigation History', onboardingName: 'Enhanced Due Diligence' },
      { id: 's69', name: 'Insolvency History', onboardingName: 'Enhanced Due Diligence' },
      { id: 's70', name: 'Legal Proceedings', onboardingName: 'Enhanced Due Diligence' },
    ]
  },
  { 
    id: '9', 
    nom: 'Banking Details', 
    code: 'BANK', 
    rank: 8, 
    sectionsCount: 7,
    linkedSections: [
      { id: 's71', name: 'Bank Account Details', onboardingName: 'All Forms' },
      { id: 's72', name: 'IBAN/SWIFT', onboardingName: 'All Forms' },
      { id: 's73', name: 'Bank Name', onboardingName: 'All Forms' },
      { id: 's74', name: 'Bank Address', onboardingName: 'All Forms' },
      { id: 's75', name: 'Account Type', onboardingName: 'All Forms' },
      { id: 's76', name: 'Account Currency', onboardingName: 'All Forms' },
      { id: 's77', name: 'Bank Reference Letter', onboardingName: 'Corporate KYC' },
    ]
  },
  { 
    id: '10', 
    nom: 'Identity Verification', 
    code: 'ID', 
    rank: 9, 
    sectionsCount: 13,
    linkedSections: [
      { id: 's78', name: 'Passport Details', onboardingName: 'Individual KYC' },
      { id: 's79', name: 'National ID', onboardingName: 'Individual KYC' },
      { id: 's80', name: 'Driving License', onboardingName: 'Individual KYC' },
      { id: 's81', name: 'Date of Birth', onboardingName: 'Individual KYC' },
      { id: 's82', name: 'Place of Birth', onboardingName: 'Individual KYC' },
      { id: 's83', name: 'Nationality', onboardingName: 'Individual KYC' },
      { id: 's84', name: 'Dual Citizenship', onboardingName: 'Individual KYC' },
      { id: 's85', name: 'Residential Status', onboardingName: 'Individual KYC' },
      { id: 's86', name: 'Biometric Verification', onboardingName: 'Enhanced Due Diligence' },
      { id: 's87', name: 'Video Verification', onboardingName: 'Enhanced Due Diligence' },
      { id: 's88', name: 'Document Verification', onboardingName: 'Individual KYC' },
      { id: 's89', name: 'Address Verification', onboardingName: 'Individual KYC' },
      { id: 's90', name: 'Identity Expiry', onboardingName: 'Individual KYC' },
    ]
  },
  { 
    id: '11', 
    nom: 'Source of Funds', 
    code: 'SOF', 
    rank: 10, 
    sectionsCount: 10,
    linkedSections: [
      { id: 's91', name: 'Source of Wealth', onboardingName: 'Enhanced Due Diligence' },
      { id: 's92', name: 'Employment Income', onboardingName: 'Individual KYC' },
      { id: 's93', name: 'Business Income', onboardingName: 'Individual KYC' },
      { id: 's94', name: 'Investment Income', onboardingName: 'Individual KYC' },
      { id: 's95', name: 'Inheritance', onboardingName: 'Individual KYC' },
      { id: 's96', name: 'Gift or Donation', onboardingName: 'Individual KYC' },
      { id: 's97', name: 'Sale of Property', onboardingName: 'Individual KYC' },
      { id: 's98', name: 'Loan Proceeds', onboardingName: 'Individual KYC' },
      { id: 's99', name: 'Pension/Retirement', onboardingName: 'Individual KYC' },
      { id: 's100', name: 'Other Sources', onboardingName: 'Individual KYC' },
    ]
  },
  { 
    id: '12', 
    nom: 'Regulatory Filings', 
    code: 'REG', 
    rank: 11, 
    sectionsCount: 8,
    linkedSections: [
      { id: 's101', name: 'Annual Returns', onboardingName: 'Corporate KYC' },
      { id: 's102', name: 'Regulatory Reports', onboardingName: 'Corporate KYC' },
      { id: 's103', name: 'Compliance Filings', onboardingName: 'Corporate KYC' },
      { id: 's104', name: 'License Renewals', onboardingName: 'Corporate KYC' },
      { id: 's105', name: 'Change Notifications', onboardingName: 'Corporate KYC' },
      { id: 's106', name: 'Beneficial Owner Registry', onboardingName: 'Corporate KYC' },
      { id: 's107', name: 'Financial Disclosures', onboardingName: 'Corporate KYC' },
      { id: 's108', name: 'Regulatory Correspondence', onboardingName: 'Corporate KYC' },
    ]
  },
  { 
    id: '13', 
    nom: 'Test Category Empty', 
    code: 'TEST', 
    rank: 12, 
    sectionsCount: 0,
    linkedSections: []
  },
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

interface CategoryRowProps {
  category: SectionCategory;
  onEdit: (category: SectionCategory) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-3">
        <span className="text-sm">{category.nom}</span>
      </td>
      {!isPanelOpen && (
        <>
          <td className="p-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono">
              {category.code}
            </Badge>
          </td>
          <td className="p-3">
            <CountBadge count={category.sectionsCount} icon={FileText} variant="purple" />
          </td>
        </>
      )}
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(category)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface CategoryPanelProps {
  category?: SectionCategory;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Omit<SectionCategory, 'id' | 'rank' | 'sectionsCount' | 'linkedSections'>) => void;
  helpMode: boolean;
}

const CategoryPanel: React.FC<CategoryPanelProps> = ({ category, isOpen, onClose, onSave, helpMode }) => {
  const [nom, setNom] = useState(category?.nom || '');
  const [code, setCode] = useState(category?.code || '');

  React.useEffect(() => {
    if (category) {
      setNom(category.nom);
      setCode(category.code);
    } else {
      setNom('');
      setCode('');
    }
  }, [category, isOpen]);

  const handleSave = () => {
    if (!nom.trim() || !code.trim()) return;
    
    onSave({
      nom,
      code: code.toUpperCase(),
    });
    onClose();
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
              <div>
                <h2 className="text-sm text-gray-900">
                  {category ? 'Éditer la catégorie' : 'Ajouter une catégorie'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration de la catégorie de section
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1">
            <div className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Beneficial owner"
                    className="h-9 text-sm"
                    required
                  />
                  <HelpCard
                    isVisible={helpMode}
                    title="Nom de la catégorie"
                    description="Donnez un nom explicite à votre catégorie de section (ex. : 'Beneficial owner', 'Entity', 'Financial Information'). Ce nom sera utilisé pour regrouper les sections dans les formulaires."
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="BO"
                    className="h-9 text-sm font-mono"
                    required
                  />
                  {!helpMode && (
                    <p className="text-xs text-gray-500 mt-1">Le code sera automatiquement en majuscules</p>
                  )}
                  <HelpCard
                    isVisible={helpMode}
                    title="Code technique"
                    description="Un identifiant court unique en majuscules, sans espaces (ex. : 'BO', 'ENTITY', 'FIN'). Ce code est utilisé en interne pour identifier la catégorie. Il sera automatiquement converti en majuscules."
                  />
                </div>
              </div>

              {/* Sections liées - Only shown when editing */}
              {category && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2.5">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <Label className="text-xs text-gray-700">
                      Sections associées ({category.sectionsCount})
                    </Label>
                  </div>
                  {category.linkedSections.length > 0 ? (
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {category.linkedSections.map((section) => (
                        <div
                          key={section.id}
                          className="px-2.5 py-1.5 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="text-xs text-gray-900">
                            <span className="text-gray-600">{section.onboardingName}</span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span>{section.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded border border-gray-200">
                      Aucune section associée
                    </div>
                  )}
                </div>
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
                  disabled={!nom.trim() || !code.trim()}
                >
                  {category ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function SectionCategoriesSettingsContent() {
  const [categories, setCategories] = useState(mockCategories);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SectionCategory | undefined>();
  const [deletingCategory, setDeletingCategory] = useState<SectionCategory | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [migrationCategoryId, setMigrationCategoryId] = useState<string>('');
  const [helpMode, setHelpMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleAdd = () => {
    setEditingCategory(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (category: SectionCategory) => {
    setEditingCategory(category);
    setIsPanelOpen(true);
  };

  const handleSave = (categoryData: Omit<SectionCategory, 'id' | 'rank' | 'sectionsCount' | 'linkedSections'>) => {
    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? { 
              ...c, 
              ...categoryData,
              sectionsCount: c.sectionsCount,
              linkedSections: c.linkedSections,
            }
          : c
      ));
      toast.success('Catégorie modifiée', {
        description: 'La catégorie a été modifiée avec succès'
      });
    } else {
      const newCategory: SectionCategory = {
        id: Date.now().toString(),
        sectionsCount: 0,
        linkedSections: [],
        ...categoryData,
        rank: categories.length
      };
      setCategories([...categories, newCategory]);
      toast.success('Catégorie créée', {
        description: 'La catégorie a été créée avec succès'
      });
    }
    setIsPanelOpen(false);
    setEditingCategory(undefined);
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    if (category) {
      setDeletingCategory(category);
      setMigrationCategoryId('');
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingCategory) {
      const hasReferences = deletingCategory.sectionsCount > 0;
      
      // If there are references and a substitute is selected, migrate the sections
      if (hasReferences && migrationCategoryId) {
        const migrationCategory = categories.find(c => c.id === migrationCategoryId);
        if (migrationCategory) {
          // Mettre à jour le compteur de sections de la catégorie de destination
          setCategories(categories
            .filter(c => c.id !== deletingCategory.id)
            .map((c, index) => {
              if (c.id === migrationCategoryId) {
                return { 
                  ...c, 
                  sectionsCount: c.sectionsCount + deletingCategory.sectionsCount,
                  linkedSections: [...c.linkedSections, ...deletingCategory.linkedSections]
                };
              }
              return { ...c, rank: index };
            })
          );
          toast.success('Catégorie supprimée et sections migrées', {
            description: `${deletingCategory.sectionsCount} section${deletingCategory.sectionsCount > 1 ? 's' : ''} migrée${deletingCategory.sectionsCount > 1 ? 's' : ''} vers "${migrationCategory.nom}"`
          });
        }
      } else {
        // Suppression sans migration (avec ou sans sections)
        setCategories(categories.filter(c => c.id !== deletingCategory.id).map((c, index) => ({
          ...c,
          rank: index
        })));
        
        if (hasReferences) {
          toast.success('Catégorie et sections supprimées', {
            description: `${deletingCategory.sectionsCount} section${deletingCategory.sectionsCount > 1 ? 's' : ''} supprimée${deletingCategory.sectionsCount > 1 ? 's' : ''} avec la catégorie`
          });
        } else {
          toast.success('Catégorie supprimée', {
            description: 'La catégorie a été supprimée avec succès'
          });
        }
      }
      setIsDeleteDialogOpen(false);
      setDeletingCategory(undefined);
      setMigrationCategoryId('');
    }
  };

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter(category =>
    category.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculer la pagination
  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Réinitialiser à la page 1 quand la recherche change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Check if the category to delete has references
  const hasReferences = deletingCategory 
    ? deletingCategory.sectionsCount > 0
    : false;

  // Get available substitute categories (excluding the one being deleted)
  const availableSubstitutes = deletingCategory
    ? categories.filter(c => c.id !== deletingCategory.id)
    : [];

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingCategory(undefined);
          setMigrationCategoryId('');
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
                  Supprimer la catégorie ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-4">
                {deletingCategory && (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <FolderOpen className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{deletingCategory.nom}</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-mono text-xs">
                          {deletingCategory.code}
                        </Badge>
                      </div>
                    </div>
                    
                    {hasReferences ? (
                      <>
                        {/* Warning for category with sections */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-amber-900 mb-1">
                                <strong>Attention : sections associées</strong>
                              </p>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                Cette catégorie contient <strong>{deletingCategory.sectionsCount} section{deletingCategory.sectionsCount > 1 ? 's' : ''}</strong>. 
                                Vous pouvez choisir de les migrer vers une autre catégorie ou de les supprimer avec la catégorie.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Substitute selector - Optional */}
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">
                            Catégorie de substitution (optionnel)
                          </Label>
                          <p className="text-xs text-gray-600 mb-2">
                            Si vous sélectionnez une catégorie, toutes les sections seront automatiquement migrées. Sinon, elles seront supprimées avec la catégorie.
                          </p>
                          <Select value={migrationCategoryId} onValueChange={setMigrationCategoryId}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Ne pas migrer (supprimer les sections)" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSubstitutes.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  Aucune autre catégorie disponible pour la migration.
                                </div>
                              ) : (
                                availableSubstitutes.map((c) => (
                                  <SelectItem key={c.id} value={c.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{c.nom}</span>
                                      <span className="text-xs text-gray-500">({c.code})</span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {migrationCategoryId ? (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                              <strong>Action :</strong> Les <strong>{deletingCategory.sectionsCount} section{deletingCategory.sectionsCount > 1 ? 's' : ''}</strong> de 
                              "{deletingCategory.nom}" seront automatiquement transférées vers "{availableSubstitutes.find(c => c.id === migrationCategoryId)?.nom}".
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-900">
                              <strong>Attention :</strong> Les <strong>{deletingCategory.sectionsCount} section{deletingCategory.sectionsCount > 1 ? 's' : ''}</strong> seront 
                              définitivement supprimées avec la catégorie.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Simple deletion for unreferenced category */}
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
                                Cette catégorie ne contient aucune section. Vous pouvez la supprimer en toute sécurité.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer cette catégorie ?
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
                setDeletingCategory(undefined);
                setMigrationCategoryId('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {hasReferences && migrationCategoryId ? 'Supprimer et migrer' : 'Supprimer définitivement'}
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
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Catégories de sections</h1>
              <p className="text-sm text-gray-600">
                {categories.length} catégorie{categories.length > 1 ? 's' : ''} configurée{categories.length > 1 ? 's' : ''}
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
                Ajouter une catégorie
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Catégories de sections"
            description="Les catégories de sections permettent d'organiser et de regrouper les différentes sections des formulaires de collecte d'informations (KYC, onboarding, compliance). Chaque catégorie possède un nom descriptif et un code technique unique qui facilite l'organisation des données. Les sections d'une même catégorie sont affichées ensemble dans les formulaires pour améliorer l'expérience utilisateur et la logique métier."
            helpUrl="https://investhub.zohodesk.eu/portal/fr/kb/articles/categories-de-sections"
          />

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom ou code..."
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
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    {!isPanelOpen && (
                      <>
                        <th className="text-left p-3 text-sm text-gray-600">Code</th>
                        <th className="text-left p-3 text-sm text-gray-600">Sections</th>
                      </>
                    )}
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.length === 0 ? (
                    <tr>
                      <td colSpan={isPanelOpen ? 2 : 4} className="p-8 text-center text-gray-500">
                        {searchQuery ? (
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-gray-300" />
                            <p className="text-sm">Aucune catégorie trouvée pour "{searchQuery}"</p>
                          </div>
                        ) : (
                          <p className="text-sm">Aucune catégorie configurée. Cliquez sur "Ajouter une catégorie" pour commencer.</p>
                        )}
                      </td>
                    </tr>
                  ) : (
                    paginatedCategories.map((category) => (
                      <CategoryRow
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isPanelOpen={isPanelOpen}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredCategories.length > 0 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredCategories.length}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
                showPageSizeSelector={true}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Edit Panel */}
      <CategoryPanel
        category={editingCategory}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingCategory(undefined);
        }}
        onSave={handleSave}
        helpMode={helpMode}
      />
    </div>
  );
}

export function SectionCategoriesSettings() {
  return <SectionCategoriesSettingsContent />;
}
