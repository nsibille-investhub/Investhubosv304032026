import React, { useState } from 'react';
import { Plus, Trash2, Edit2, X, AlertTriangle, FileText, Building2, Search, HelpCircle, Lightbulb } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { CountBadge } from '../ui/count-badge';
import { DataPagination } from '../ui/data-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface LinkedFund {
  id: string;
  name: string;
}

interface LinkedEntity {
  id: string;
  name: string;
  type: 'individual' | 'corporate';
}

interface CompatibilityStatus {
  id: string;
  name: string;
  color: string;
}

interface CustomStatus {
  id: string;
  nom: string;
  rang: number;
  couleur: string; // hex color
  compatibility: CompatibilityStatus[];
  fondsCount: number;
  entitiesCount: number;
  linkedFunds: LinkedFund[];
  linkedEntities: LinkedEntity[];
  rank: number;
}

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

// Couleurs prédéfinies pour les statuts
const predefinedColors = [
  { name: 'Orange', value: '#FFA500' },
  { name: 'Bleu', value: '#0000FF' },
  { name: 'Vert', value: '#008000' },
  { name: 'Rouge', value: '#FF0000' },
  { name: 'Violet', value: '#800080' },
  { name: 'Jaune', value: '#FFD700' },
  { name: 'Rose', value: '#FF69B4' },
  { name: 'Cyan', value: '#00FFFF' },
  { name: 'Gris', value: '#808080' },
];

// Mock data
const mockStatuses: CustomStatus[] = [
  {
    id: '1',
    nom: 'Souscription en cours',
    rang: 10,
    couleur: '#FFA500',
    compatibility: [
      { id: 'c1', name: 'Souscription à signer', color: '#0000FF' },
      { id: 'c2', name: 'Souscription signée', color: '#008000' },
    ],
    fondsCount: 3,
    entitiesCount: 45,
    linkedFunds: [
      { id: 'f1', name: 'Eurazeo Entrepreneurs Club 2 - Administratif' },
      { id: 'f2', name: 'Ternel Regenerative Fund' },
      { id: 'f3', name: 'Green Energy Fund' },
    ],
    linkedEntities: [
      { id: 'e1', name: 'John Doe', type: 'individual' },
      { id: 'e2', name: 'ACME Corporation', type: 'corporate' },
      { id: 'e3', name: 'Jane Smith', type: 'individual' },
      { id: 'e4', name: 'Tech Ventures Ltd', type: 'corporate' },
      { id: 'e5', name: 'Robert Johnson', type: 'individual' },
    ],
    rank: 0,
  },
  {
    id: '2',
    nom: 'Souscription à signer',
    rang: 20,
    couleur: '#0000FF',
    compatibility: [
      { id: 'c3', name: 'Souscription signée', color: '#008000' },
    ],
    fondsCount: 3,
    entitiesCount: 28,
    linkedFunds: [
      { id: 'f1', name: 'Eurazeo Entrepreneurs Club 2 - Administratif' },
      { id: 'f2', name: 'Ternel Regenerative Fund' },
      { id: 'f3', name: 'Green Energy Fund' },
    ],
    linkedEntities: [
      { id: 'e6', name: 'Alice Brown', type: 'individual' },
      { id: 'e7', name: 'Global Investments Inc', type: 'corporate' },
      { id: 'e8', name: 'Michael Wilson', type: 'individual' },
    ],
    rank: 1,
  },
  {
    id: '3',
    nom: 'Souscription signée',
    rang: 30,
    couleur: '#008000',
    compatibility: [],
    fondsCount: 3,
    entitiesCount: 156,
    linkedFunds: [
      { id: 'f1', name: 'Eurazeo Entrepreneurs Club 2 - Administratif' },
      { id: 'f2', name: 'Ternel Regenerative Fund' },
      { id: 'f3', name: 'Green Energy Fund' },
    ],
    linkedEntities: [
      { id: 'e9', name: 'Sarah Davis', type: 'individual' },
      { id: 'e10', name: 'Enterprise Solutions SA', type: 'corporate' },
      { id: 'e11', name: 'David Martinez', type: 'individual' },
      { id: 'e12', name: 'Innovation Partners LLC', type: 'corporate' },
    ],
    rank: 2,
  },
  {
    id: '4',
    nom: 'Souscription en cours en attente de signature',
    rang: 20,
    couleur: '#0000FF',
    compatibility: [
      { id: 'c4', name: 'Souscription signée', color: '#008000' },
    ],
    fondsCount: 1,
    entitiesCount: 12,
    linkedFunds: [
      { id: 'f1', name: 'Eurazeo Entrepreneurs Club 2 - Administratif' },
    ],
    linkedEntities: [
      { id: 'e13', name: 'Emily Taylor', type: 'individual' },
      { id: 'e14', name: 'Capital Growth Fund', type: 'corporate' },
    ],
    rank: 3,
  },
  {
    id: '5',
    nom: 'Souscription signée',
    rang: 30,
    couleur: '#008000',
    compatibility: [],
    fondsCount: 1,
    entitiesCount: 67,
    linkedFunds: [
      { id: 'f1', name: 'Eurazeo Entrepreneurs Club 2 - Administratif' },
    ],
    linkedEntities: [
      { id: 'e15', name: 'James Anderson', type: 'individual' },
      { id: 'e16', name: 'Venture Capital Partners', type: 'corporate' },
    ],
    rank: 4,
  },
];

interface StatusRowProps {
  status: CustomStatus;
  onEdit: (status: CustomStatus) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const StatusRow: React.FC<StatusRowProps> = ({
  status,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="p-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm">{status.nom}</span>
        </div>
      </td>
      {!isPanelOpen && (
        <>
          <td className="p-3">
            <span className="text-sm text-gray-700">{status.rang}</span>
          </td>
          <td className="p-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-6 h-6 rounded border border-gray-300" 
                style={{ backgroundColor: status.couleur }}
              />
              <span className="text-xs text-gray-500 font-mono">{status.couleur}</span>
            </div>
          </td>
        </>
      )}
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(status)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(status.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface StatusPanelProps {
  status?: CustomStatus;
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: Omit<CustomStatus, 'id' | 'rank'>) => void;
  helpMode: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ status, isOpen, onClose, onSave, helpMode }) => {
  const [nom, setNom] = useState(status?.nom || '');
  const [rang, setRang] = useState(status?.rang || 0);
  const [couleur, setCouleur] = useState(status?.couleur || '#FFA500');
  const [selectedCompatibility, setSelectedCompatibility] = useState<string[]>(
    status?.compatibility.map(c => c.id) || []
  );

  React.useEffect(() => {
    if (status) {
      setNom(status.nom);
      setRang(status.rang);
      setCouleur(status.couleur);
      setSelectedCompatibility(status.compatibility.map(c => c.id));
    } else {
      setNom('');
      setRang(0);
      setCouleur('#FFA500');
      setSelectedCompatibility([]);
    }
  }, [status, isOpen]);

  const handleSave = () => {
    if (!nom.trim()) return;
    
    // Build compatibility array (in real app would fetch from actual statuses)
    const compatibility: CompatibilityStatus[] = selectedCompatibility.map(id => ({
      id,
      name: 'Statut compatible',
      color: '#0000FF'
    }));

    onSave({
      nom,
      rang,
      couleur,
      compatibility,
      fondsCount: status?.fondsCount || 0,
      entitiesCount: status?.entitiesCount || 0,
      linkedFunds: status?.linkedFunds || [],
      linkedEntities: status?.linkedEntities || [],
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
              <h2 className="text-sm text-gray-900">
                {status ? 'Éditer le statut' : 'Nouveau statut'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="space-y-2.5">
                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Nom du statut <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Souscription en cours"
                    className="h-9 text-sm"
                    required
                  />
                  <HelpCard
                    isVisible={helpMode}
                    title="Nom du statut"
                    description="Donnez un nom explicite à votre statut personnalisé. Ce nom sera affiché dans toute l'application pour identifier l'état des entités et dossiers."
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Rang <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={rang}
                    onChange={(e) => setRang(parseInt(e.target.value) || 0)}
                    placeholder="10"
                    className="h-9 text-sm"
                    required
                  />
                  <HelpCard
                    isVisible={helpMode}
                    title="Rang du statut"
                    description="Le rang définit l'ordre d'affichage et la progression dans le workflow. Un rang plus faible apparaît en premier. Utilisez des multiples de 10 pour pouvoir insérer des statuts intermédiaires ultérieurement."
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Couleur <span className="text-red-500">*</span>
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={couleur}
                        onChange={(e) => setCouleur(e.target.value)}
                        className="h-9 w-20 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={couleur}
                        onChange={(e) => setCouleur(e.target.value)}
                        placeholder="#FFA500"
                        className="h-9 text-sm font-mono flex-1"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setCouleur(color.value)}
                          className={`w-8 h-8 rounded border-2 transition-all ${
                            couleur === color.value ? 'border-gray-900 scale-110' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <HelpCard
                    isVisible={helpMode}
                    title="Couleur du statut"
                    description="La couleur permet d'identifier visuellement le statut dans l'interface. Choisissez une couleur cohérente avec sa signification (vert pour validé, orange pour en attente, rouge pour rejeté, etc.)."
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Compatibilité
                  </Label>
                  <Select value={selectedCompatibility[0] || ''} onValueChange={(value) => setSelectedCompatibility([value])}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Sélectionner les statuts compatibles..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune compatibilité</SelectItem>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                    </SelectContent>
                  </Select>
                  <HelpCard
                    isVisible={helpMode}
                    title="Compatibilité des statuts"
                    description="Définissez quels autres statuts peuvent succéder à celui-ci dans le workflow. Cela permet de contrôler les transitions autorisées et d'éviter les changements de statut incorrects."
                  />
                </div>
              </div>

              {/* Linked Resources Section - Only for existing status */}
              {status && (
                <>
                  <div className="pt-3 border-t border-gray-200 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <Label className="text-xs text-gray-700">
                          Fonds liés ({status.fondsCount})
                        </Label>
                      </div>
                      {status.linkedFunds.length > 0 ? (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {status.linkedFunds.map((fund) => (
                            <div
                              key={fund.id}
                              className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="text-xs text-gray-900">{fund.name}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded border border-gray-200">
                          Aucun fonds lié
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-gray-600" />
                        <Label className="text-xs text-gray-700">
                          Entités liées ({status.entitiesCount})
                        </Label>
                      </div>
                      {status.linkedEntities.length > 0 ? (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {status.linkedEntities.map((entity) => (
                            <div
                              key={entity.id}
                              className="p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-900">{entity.name}</div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    entity.type === 'individual' 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : 'bg-purple-50 text-purple-700 border-purple-200'
                                  }`}
                                >
                                  {entity.type === 'individual' ? 'Individual' : 'Corporate'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic p-2 bg-gray-50 rounded border border-gray-200">
                          Aucune entité liée
                        </div>
                      )}
                    </div>
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
                  disabled={!nom.trim()}
                >
                  {status ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function CustomStatusSettingsContent() {
  const [statuses, setStatuses] = useState(mockStatuses);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CustomStatus | undefined>();
  const [deletingStatus, setDeletingStatus] = useState<CustomStatus | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [substituteStatusId, setSubstituteStatusId] = useState<string>('');
  const [helpMode, setHelpMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleAdd = () => {
    setEditingStatus(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (status: CustomStatus) => {
    setEditingStatus(status);
    setIsPanelOpen(true);
  };

  const handleSave = (statusData: Omit<CustomStatus, 'id' | 'rank'>) => {
    if (editingStatus) {
      setStatuses(statuses.map(s => 
        s.id === editingStatus.id 
          ? { 
              ...s, 
              ...statusData,
              fondsCount: s.fondsCount,
              entitiesCount: s.entitiesCount,
              linkedFunds: s.linkedFunds,
              linkedEntities: s.linkedEntities,
            }
          : s
      ));
      toast.success('Statut modifié', {
        description: 'Le statut a été modifié avec succès'
      });
    } else {
      const newStatus: CustomStatus = {
        id: Date.now().toString(),
        ...statusData,
        rank: statuses.length
      };
      setStatuses([...statuses, newStatus]);
      toast.success('Statut créé', {
        description: 'Le statut a été créé avec succès'
      });
    }
    setIsPanelOpen(false);
    setEditingStatus(undefined);
  };

  const handleDelete = (id: string) => {
    const status = statuses.find(s => s.id === id);
    if (status) {
      setDeletingStatus(status);
      setSubstituteStatusId('');
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingStatus) {
      const hasReferences = deletingStatus.fondsCount > 0 || deletingStatus.entitiesCount > 0;
      
      if (hasReferences && !substituteStatusId) {
        return;
      }
      
      if (hasReferences && substituteStatusId) {
        const substituteStatus = statuses.find(s => s.id === substituteStatusId);
        if (substituteStatus) {
          setStatuses(statuses
            .filter(s => s.id !== deletingStatus.id)
            .map((s, index) => {
              if (s.id === substituteStatusId) {
                return { 
                  ...s, 
                  fondsCount: s.fondsCount + deletingStatus.fondsCount,
                  entitiesCount: s.entitiesCount + deletingStatus.entitiesCount,
                  linkedFunds: [...s.linkedFunds, ...deletingStatus.linkedFunds],
                  linkedEntities: [...s.linkedEntities, ...deletingStatus.linkedEntities],
                };
              }
              return { ...s, rank: index };
            })
          );
          toast.success('Statut supprimé et éléments migrés', {
            description: `Fonds et entités migrés vers "${substituteStatus.nom}"`
          });
        }
      } else {
        setStatuses(statuses.filter(s => s.id !== deletingStatus.id).map((s, index) => ({
          ...s,
          rank: index
        })));
        toast.success('Statut supprimé', {
          description: 'Le statut a été supprimé avec succès'
        });
      }
      setIsDeleteDialogOpen(false);
      setDeletingStatus(undefined);
      setSubstituteStatusId('');
    }
  };

  // Filtrer les statuts selon la recherche
  const filteredStatuses = statuses.filter(status =>
    status.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculer la pagination
  const totalPages = Math.ceil(filteredStatuses.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStatuses = filteredStatuses.slice(startIndex, endIndex);

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

  // Check if the status to delete has references
  const hasReferences = deletingStatus 
    ? (deletingStatus.fondsCount > 0 || deletingStatus.entitiesCount > 0)
    : false;

  // Get available substitute statuses (excluding the one being deleted)
  const availableSubstitutes = deletingStatus
    ? statuses.filter(s => s.id !== deletingStatus.id)
    : [];

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingStatus(undefined);
          setSubstituteStatusId('');
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
                  {hasReferences ? 'Supprimer et substituer le statut ?' : 'Supprimer le statut ?'}
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-4">
                {deletingStatus && (
                  <>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-5 h-5 rounded border border-gray-300" 
                          style={{ backgroundColor: deletingStatus.couleur }}
                        />
                        <span className="text-sm">{deletingStatus.nom}</span>
                      </div>
                      <p className="text-xs text-gray-600">Rang: {deletingStatus.rang}</p>
                    </div>
                    
                    {hasReferences ? (
                      <>
                        {/* Warning for referenced status */}
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-amber-900 mb-1">
                                <strong>Suppression interdite : statut référencé</strong>
                              </p>
                              <p className="text-sm text-amber-800 leading-relaxed">
                                Ce statut est utilisé par <strong>{deletingStatus.fondsCount} fonds</strong> et <strong>{deletingStatus.entitiesCount} entité{deletingStatus.entitiesCount > 1 ? 's' : ''}</strong>. 
                                La suppression directe pourrait causer des problèmes dans l'application.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Substitute selector */}
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-700">
                            Statut de substitution <span className="text-red-500">*</span>
                          </Label>
                          <p className="text-xs text-gray-600 mb-2">
                            Sélectionnez un statut existant pour migrer automatiquement tous les fonds et entités utilisant le statut supprimé.
                          </p>
                          <Select value={substituteStatusId} onValueChange={setSubstituteStatusId}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Choisir un statut de remplacement..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSubstitutes.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                  Aucun autre statut disponible.
                                  <br />
                                  Créez un nouveau statut avant de supprimer celui-ci.
                                </div>
                              ) : (
                                availableSubstitutes.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-4 h-4 rounded border border-gray-300" 
                                        style={{ backgroundColor: s.couleur }}
                                      />
                                      <span>{s.nom}</span>
                                      <span className="text-xs text-gray-500">(Rang {s.rang})</span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <strong>Action :</strong> Les <strong>{deletingStatus.fondsCount} fonds</strong> et <strong>{deletingStatus.entitiesCount} entité{deletingStatus.entitiesCount > 1 ? 's' : ''}</strong> utilisant 
                            "{deletingStatus.nom}" seront automatiquement basculés vers le statut de substitution sélectionné.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Simple deletion for unreferenced status */}
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
                                Ce statut n'est utilisé par aucun fonds ni entité. Vous pouvez le supprimer en toute sécurité.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">
                            Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce statut ?
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
                setDeletingStatus(undefined);
                setSubstituteStatusId('');
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={hasReferences && (!substituteStatusId || availableSubstitutes.length === 0)}
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
          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Qu'est-ce qu'un statut personnalisé ?"
            description="Les statuts personnalisés vous permettent de définir des états spécifiques pour vos processus métier. Ils peuvent être appliqués aux fonds, entités, et autres objets de l'application pour suivre leur progression dans vos workflows."
            helpUrl="https://help.investhub.com/statuts-personnalises"
          />

          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Statuts personnalisés</h1>
              <p className="text-sm text-gray-600">
                {statuses.length} statut{statuses.length > 1 ? 's' : ''} configuré{statuses.length > 1 ? 's' : ''}
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
                Ajouter un statut
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un statut..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left p-3 text-xs text-gray-500">Nom</th>
                    {!isPanelOpen && (
                      <>
                        <th className="text-left p-3 text-xs text-gray-500">Rang</th>
                        <th className="text-left p-3 text-xs text-gray-500">Couleur</th>
                      </>
                    )}
                    <th className="text-right p-3 text-xs text-gray-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStatuses.length > 0 ? (
                    paginatedStatuses.map((status) => (
                      <StatusRow
                        key={status.id}
                        status={status}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isPanelOpen={isPanelOpen}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-sm text-gray-500">
                        {searchQuery ? 'Aucun statut trouvé pour cette recherche' : 'Aucun statut configuré'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredStatuses.length > 0 && (
              <div className="border-t border-gray-200 p-4">
                <DataPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  totalItems={filteredStatuses.length}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Side Panel */}
      <StatusPanel
        status={editingStatus}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSave={handleSave}
        helpMode={helpMode}
      />
    </div>
  );
}

export function CustomStatusSettings() {
  return <CustomStatusSettingsContent />;
}
