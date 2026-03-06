import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Search, HelpCircle, Eye, Copy, CheckCircle, Settings, MoreVertical, RotateCcw, ExternalLink } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DataPagination } from '../ui/data-pagination';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { InfoBanner } from '../InfoBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PartenaireCard } from '../PartenaireCard';
import { ConventionProductsCard } from '../ConventionProductsCard';
import { Checkbox } from '../ui/checkbox';
import { ConventionFilterBar } from '../ConventionFilterBar';

interface Convention {
  id: string;
  numero: string;
  date: string;
  partenaire: string;
  email: string;
  initial: string;
  produits: string[];
  statut: 'En cours' | 'À valider' | 'Validé' | 'Réouvert';
  signature?: {
    type: 'en_cours' | 'signee';
    signaturesEffectives?: number;
    signaturesRequises?: number;
    datSignature?: string;
  };
}

const mockConventions: Convention[] = [
  {
    id: '1',
    numero: '1068',
    date: '02/11/2025',
    partenaire: 'ITECA PATRIMOINE CÔTE',
    email: 'example@test.com',
    initial: 'ABC',
    produits: [
      'Private Sars Selection VI - Private Sars Selection VI (FP0017995079)',
      'Private Sars Selection VII - Private Sars Selection VII (FR0014004CY5)',
      'Private Sars Selection VI - Private Sars Selection VI (FR0013900884)',
      'Private Sars Selection IV - Private Sars Selection IV (FR001400E6F6)',
      'Private Sars Selection VI - Private Sars Selection VI (FR001400W4G8)',
      'Private Sars Selection V - Private Sars Selection V (FP0017997115)',
      'Private Sars Selection V - Private Sars Selection V - Fcpi x (FR001407T185)',
      'Private Sars Selection V - Private Sars Selection V - Fcpi x (FR001407S91)'
    ],
    statut: 'À valider',
    signature: {
      type: 'en_cours',
      signaturesEffectives: 0,
      signaturesRequises: 2
    }
  },
  {
    id: '2',
    numero: '1066',
    date: '06/01/2025',
    partenaire: 'A 2 F CONSEIL (2066)',
    email: 'contact@a2f.fr',
    initial: 'A2F',
    produits: [
      'Private Sars Selection VI - Private Sars Selection VI - Fcpi x (FR001407T185)',
      'Private Sars Selection V - Private Sars Selection V - Fcpi x (FR001407S91)',
      'Private Sars Selection V - Private Sars Selection V - Fcpi x (FR0014007F1)'
    ],
    statut: 'En cours',
    signature: {
      type: 'en_cours',
      signaturesEffectives: 1,
      signaturesRequises: 2
    }
  },
  {
    id: '8',
    numero: '1056',
    date: '26/01/2024',
    partenaire: 'CEDRAMME CAPITAL (2376)',
    email: 'cedramme@capital.fr',
    initial: 'CC',
    produits: [
      'Private Sars Selection VI - Private Sars Selection VI (FR0014004CY5)',
      'Private Sars Selection V - Private Sars Selection V - Equity Sars Selection VI (FR0014004KFX)',
      'Private Sars Selection V - Private Sars Selection V - Equity Sars Selection VII (FR0014004KFX)',
      'Private Sars Selection V - Private Sars Selection V - Fcpi x (FR001407S91)'
    ],
    statut: 'Validé',
    signature: {
      type: 'en_cours',
      signaturesEffectives: 2,
      signaturesRequises: 3
    }
  },
  {
    id: '9',
    numero: '1055',
    date: '08/11/2024',
    partenaire: 'LE CARRE DES FINANCIÈRES (SEIC)',
    email: 'carre@financieres.fr',
    initial: 'LCDF',
    produits: [
      'Private Sars Selection VI - Private Sars Selection VI (FR0014004CY5)',
      'Private Sars Selection V - Private Sars Selection V - Equity Sars Selection VI (FR0014004KFX)'
    ],
    statut: 'Validé',
    signature: {
      type: 'signee',
      datSignature: '15/11/2024'
    }
  },
  {
    id: '10',
    numero: '1054',
    date: '15/02/2024',
    partenaire: 'PATRIMOINE CONSEILS (2389)',
    email: 'contact@patrimoine-conseils.fr',
    initial: 'PC',
    produits: [
      'Private Sars Selection VI - Private Sars Selection VI - Fcpi x (FR001407T185)',
      'Private Sars Selection V - Private Sars Selection V - Fcpi x (FR001407S91)',
      'Private Sars Selection IV - Private Sars Selection IV - Fcpi x (FR001407R83)'
    ],
    statut: 'Réouvert',
    signature: {
      type: 'en_cours',
      signaturesEffectives: 0,
      signaturesRequises: 2
    }
  },
  {
    id: '11',
    numero: '1069',
    date: '01/03/2025',
    partenaire: 'FINANCIÈRE HARMONIE (3425)',
    email: 'harmonie@financiere.fr',
    initial: 'FH',
    produits: [
      'Private Sars Selection VI - Private Sars Selection VI - Fcpi x (FR001407T185)',
      'Private Sars Selection V - Private Sars Selection V - Fcpi x (FR001407S91)'
    ],
    statut: 'En cours'
  }
];

export function ConventionsSettings() {
  const [conventions, setConventions] = useState<Convention[]>(mockConventions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [helpMode, setHelpMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingConvention, setEditingConvention] = useState<Convention | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conventionToDelete, setConventionToDelete] = useState<Convention | null>(null);
  const [modifyScopeDialogOpen, setModifyScopeDialogOpen] = useState(false);
  const [conventionToModify, setConventionToModify] = useState<Convention | null>(null);
  const [selectedProduits, setSelectedProduits] = useState<string[]>([]);

  // Filtrage
  const filteredConventions = conventions.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.partenaire.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.numero.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPartenaire = !filters.partenaires || filters.partenaires.length === 0 || filters.partenaires.includes(conv.partenaire);
    const matchesStatut = !filters.statuts || filters.statuts.length === 0 || filters.statuts.includes(conv.statut);
    const matchesEmail = !filters.email || conv.email.toLowerCase().includes(filters.email.toLowerCase());
    const matchesInitial = !filters.initial || conv.initial.toLowerCase().includes(filters.initial.toLowerCase());
    
    return matchesSearch && matchesPartenaire && matchesStatut && matchesEmail && matchesInitial;
  });

  // Pagination
  const totalPages = Math.ceil(filteredConventions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConventions = filteredConventions.slice(startIndex, startIndex + itemsPerPage);

  // Obtenir liste unique des partenaires
  const availablePartenaires = Array.from(new Set(conventions.map(c => c.partenaire))).sort();

  const handleAdd = () => {
    setEditingConvention({
      id: Date.now().toString(),
      numero: '',
      date: new Date().toLocaleDateString('fr-FR'),
      partenaire: '',
      email: '',
      initial: '',
      produits: [],
      statut: 'À valider',
      signature: {
        type: 'en_cours',
        signaturesEffectives: 0,
        signaturesRequises: 2
      }
    });
    setIsPanelOpen(true);
  };

  const handleEdit = (convention: Convention) => {
    setEditingConvention({ ...convention });
    setIsPanelOpen(true);
  };

  const handleDelete = (convention: Convention) => {
    setConventionToDelete(convention);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (conventionToDelete) {
      setConventions(conventions.filter(c => c.id !== conventionToDelete.id));
      setDeleteDialogOpen(false);
      setConventionToDelete(null);
    }
  };

  const handleModifyScope = (convention: Convention) => {
    setConventionToModify(convention);
    setSelectedProduits([...convention.produits]);
    setModifyScopeDialogOpen(true);
  };

  const confirmModifyScope = () => {
    if (conventionToModify) {
      setConventions(conventions.map(c => 
        c.id === conventionToModify.id 
          ? { ...c, produits: selectedProduits }
          : c
      ));
      setModifyScopeDialogOpen(false);
      setConventionToModify(null);
      setSelectedProduits([]);
    }
  };

  const handleValidate = (convention: Convention) => {
    // TODO: Naviguer vers la page de validation
    alert(`Navigation vers la page de validation pour la convention ${convention.numero}`);
  };

  const handleViewOnboarding = (convention: Convention) => {
    // TODO: Naviguer vers la page d'onboarding
    alert(`Navigation vers l'onboarding pour la convention ${convention.numero}`);
  };

  const handleResetValidation = (convention: Convention) => {
    // TODO: Implémenter le reset de la validation
    alert(`Reset de la validation pour la convention ${convention.numero}`);
  };

  const handleViewValidationDetails = (convention: Convention) => {
    // TODO: Naviguer vers le détail de la validation
    alert(`Navigation vers le détail de la validation pour la convention ${convention.numero}`);
  };

  const toggleProduit = (produit: string) => {
    if (selectedProduits.includes(produit)) {
      setSelectedProduits(selectedProduits.filter(p => p !== produit));
    } else {
      setSelectedProduits([...selectedProduits, produit]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({});
  };

  const handleSave = () => {
    if (editingConvention) {
      const exists = conventions.find(c => c.id === editingConvention.id);
      if (exists) {
        setConventions(conventions.map(c => c.id === editingConvention.id ? editingConvention : c));
      } else {
        setConventions([...conventions, editingConvention]);
      }
      setIsPanelOpen(false);
      setEditingConvention(null);
    }
  };

  const getStatutBadge = (statut: Convention['statut']) => {
    switch (statut) {
      case 'En cours':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">En cours</Badge>;
      case 'À valider':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">À valider</Badge>;
      case 'Validé':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Validé</Badge>;
      case 'Réouvert':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Réouvert</Badge>;
      default:
        return null;
    }
  };

  const getSignatureText = (signature?: Convention['signature'], statut?: Convention['statut']) => {
    if (statut === 'Réouvert' || statut === 'À valider' || statut === 'En cours') return '-';
    if (!signature) return '-';
    
    if (signature.type === 'signee') {
      return `Signée le ${signature.datSignature}`;
    } else {
      return `En signature (${signature.signaturesEffectives}/${signature.signaturesRequises})`;
    }
  };

  return (
    <div className="relative flex h-full">
      {/* Main Content */}
      <motion.div
        className="flex-shrink-0 overflow-auto"
        animate={{
          width: isPanelOpen ? 'calc(100% - 420px)' : '100%'
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Demandes de conventions</h1>
              <p className="text-sm text-gray-600">
                {conventions.length} convention{conventions.length > 1 ? 's' : ''}
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
                Ajouter une convention
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Les conventions"
            description="Gérez les demandes de conventions avec vos partenaires. Suivez le statut de chaque convention, les produits associés et les commissions. Vous pouvez filtrer par partenaire, email ou initiales."
            helpUrl="https://investhub.zohodesk.eu/portal/fr/kb/articles/conventions"
          />

          {/* Filters Section */}
          <ConventionFilterBar
            onFilterChange={setFilters}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            allData={conventions}
          />

          {/* Résultats */}
          <div className="text-xs text-gray-500 mt-3 px-6">
            {filteredConventions.length} résultat{filteredConventions.length > 1 ? 's' : ''} sur {conventions.length} convention{conventions.length > 1 ? 's' : ''}
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-20">#</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-28">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-64">Partenaire</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500">Produits</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-32">Statut</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-48">Signature</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedConventions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-gray-300" />
                          <p className="text-sm">Aucune convention trouvée</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedConventions.map((convention) => (
                      <tr key={convention.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600">{convention.numero}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{convention.date}</td>
                        <td className="px-4 py-3">
                          <PartenaireCard 
                            partenaire={{
                              name: convention.partenaire,
                              id: convention.id,
                              type: 'corporate'
                            }}
                            searchTerm={searchQuery}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <ConventionProductsCard 
                            produits={convention.produits}
                            searchTerm={searchQuery}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {getStatutBadge(convention.statut)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {getSignatureText(convention.signature, convention.statut)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </motion.button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {convention.statut === 'Validé' ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleViewValidationDetails(convention)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      Détails de la validation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleResetValidation(convention)}>
                                      <RotateCcw className="w-4 h-4 mr-2" />
                                      Réinitialiser la validation
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(convention)}>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </>
                                ) : convention.statut === 'Réouvert' ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleViewOnboarding(convention)}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Accéder à l'onboarding
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(convention)}>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </>
                                ) : convention.statut === 'À valider' ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleViewOnboarding(convention)}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Accéder à l'onboarding
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleValidate(convention)}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Valider la convention
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleModifyScope(convention)}>
                                      <Settings className="w-4 h-4 mr-2" />
                                      Modifier la portée
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(convention)}>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </>
                                ) : convention.statut === 'En cours' ? (
                                  <>
                                    <DropdownMenuItem onClick={() => handleViewOnboarding(convention)}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Accéder à l'onboarding
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleModifyScope(convention)}>
                                      <Settings className="w-4 h-4 mr-2" />
                                      Modifier la portée
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDelete(convention)}>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <DropdownMenuItem onClick={() => handleDelete(convention)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredConventions.length > 0 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredConventions.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Side Panel */}
      <AnimatePresence>
        {isPanelOpen && editingConvention && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-[420px] bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl">
                    {editingConvention.id && conventions.find(c => c.id === editingConvention.id)
                      ? 'Modifier la convention'
                      : 'Nouvelle convention'}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPanelOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Numéro</Label>
                    <Input
                      value={editingConvention.numero}
                      onChange={(e) => setEditingConvention({ ...editingConvention, numero: e.target.value })}
                      placeholder="Ex: 1068"
                    />
                  </div>

                  <div>
                    <Label>Date</Label>
                    <Input
                      value={editingConvention.date}
                      onChange={(e) => setEditingConvention({ ...editingConvention, date: e.target.value })}
                      placeholder="JJ/MM/AAAA"
                    />
                  </div>

                  <div>
                    <Label>Partenaire</Label>
                    <Input
                      value={editingConvention.partenaire}
                      onChange={(e) => setEditingConvention({ ...editingConvention, partenaire: e.target.value })}
                      placeholder="Nom du partenaire"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingConvention.email}
                      onChange={(e) => setEditingConvention({ ...editingConvention, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <Label>Initial</Label>
                    <Input
                      value={editingConvention.initial}
                      onChange={(e) => setEditingConvention({ ...editingConvention, initial: e.target.value })}
                      placeholder="ABC"
                    />
                  </div>

                  <div>
                    <Label>Statut</Label>
                    <Select
                      value={editingConvention.statut}
                      onValueChange={(value) => setEditingConvention({ ...editingConvention, statut: value as Convention['statut'] })}
                    >
                      <SelectTrigger className="min-h-[42px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En cours">En cours</SelectItem>
                        <SelectItem value="À valider">À valider</SelectItem>
                        <SelectItem value="Validé">Validé</SelectItem>
                        <SelectItem value="Réouvert">Réouvert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Commission</Label>
                    <Input
                      value={editingConvention.commission}
                      onChange={(e) => setEditingConvention({ ...editingConvention, commission: e.target.value })}
                      placeholder="Ex: Initiale 02/5"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsPanelOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    style={{
                      background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                      color: 'white'
                    }}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la convention {conventionToDelete?.numero} pour {conventionToDelete?.partenaire} ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: 'white'
              }}
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modify Scope Dialog */}
      <AlertDialog open={modifyScopeDialogOpen} onOpenChange={setModifyScopeDialogOpen}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Modifier la portée de la convention</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez les parts que vous souhaitez inclure dans la convention {conventionToModify?.numero} pour {conventionToModify?.partenaire}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2">
            {(() => {
              // Regrouper les produits par fonds
              const grouped = new Map<string, Array<{ partName: string; isinCode: string; fullName: string }>>();
              
              conventionToModify?.produits.forEach(produit => {
                const match = produit.match(/^(.+?)\s-\s(.+?)\s\(([A-Z0-9]+)\)$/);
                if (match) {
                  const fundName = match[1];
                  const partName = match[2];
                  const isinCode = match[3];
                  
                  if (!grouped.has(fundName)) {
                    grouped.set(fundName, []);
                  }
                  
                  grouped.get(fundName)!.push({
                    partName,
                    isinCode,
                    fullName: produit
                  });
                } else {
                  if (!grouped.has(produit)) {
                    grouped.set(produit, []);
                  }
                  grouped.get(produit)!.push({
                    partName: produit,
                    isinCode: '',
                    fullName: produit
                  });
                }
              });

              return Array.from(grouped.entries()).map(([fundName, parts], idx) => (
                <div key={idx} className="p-3 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {fundName}
                    </h4>
                    <Badge className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-[11px]">
                      {parts.length} {parts.length === 1 ? 'part' : 'parts'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {parts.map((part, partIdx) => (
                      <div 
                        key={partIdx} 
                        className="flex items-center gap-3 p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <Checkbox
                          id={`produit-${idx}-${partIdx}`}
                          checked={selectedProduits.includes(part.fullName)}
                          onCheckedChange={() => toggleProduit(part.fullName)}
                        />
                        <label 
                          htmlFor={`produit-${idx}-${partIdx}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {part.partName}
                            </span>
                            {part.isinCode && (
                              <code className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded">
                                {part.isinCode}
                              </code>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-gray-500">
              {selectedProduits.length} {selectedProduits.length === 1 ? 'part sélectionnée' : 'parts sélectionnées'}
            </p>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setModifyScopeDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={confirmModifyScope}
                disabled={selectedProduits.length === 0}
                style={
                  selectedProduits.length === 0
                    ? { opacity: 0.5, cursor: 'not-allowed' }
                    : {
                        background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                        color: 'white'
                      }
                }
              >
                Enregistrer
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}