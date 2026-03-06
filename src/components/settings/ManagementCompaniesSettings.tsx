import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit2, X, AlertTriangle, Building2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface ManagementCompany {
  id: string;
  nom: string;
  codeInterne: string;
  prefixeFacturesFrais: string;
  prefixeFacturesCommissions: string;
  rank: number;
}

const mockCompanies: ManagementCompany[] = [
  { id: '1', nom: 'Eurazeo Funds Management Luxembourg (EFML)', codeInterne: '27c37cc-6d68-7a8-754-761205cb5ae', prefixeFacturesFrais: '', prefixeFacturesCommissions: '', rank: 0 },
  { id: '2', nom: 'Eurazeo Global Investor (EGI)', codeInterne: 'cfbcbc-e1e-e72-7b3a-30eb83e4df4', prefixeFacturesFrais: '', prefixeFacturesCommissions: '', rank: 1 },
  { id: '3', nom: 'Eurazeo Infrastructure Partners (EIP)', codeInterne: 'f16c32-042c-4b0f-b42d-daaf5e6ca751', prefixeFacturesFrais: '', prefixeFacturesCommissions: '', rank: 2 },
  { id: '4', nom: 'Eurazeo Mid Cap (EMC)', codeInterne: 'db7ad1e-050c-a4fb-6a8-1c213e34f1', prefixeFacturesFrais: '', prefixeFacturesCommissions: '', rank: 3 },
  { id: '5', nom: 'Eurazeo SE', codeInterne: '5c2e61e-18e2-47ed-edbd-1eaea636770', prefixeFacturesFrais: '', prefixeFacturesCommissions: '', rank: 4 },
  { id: '6', nom: 'Kurma Partners', codeInterne: '3a558e-6dc4-4d30-ab5-4261eea6f3', prefixeFacturesFrais: '', prefixeFacturesCommissions: '', rank: 5 },
];

interface DraggableRowProps {
  company: ManagementCompany;
  index: number;
  moveCompany: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (company: ManagementCompany) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  company,
  index,
  moveCompany,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'company',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveCompany(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'company',
    item: () => {
      return { id: company.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr
      ref={ref}
      data-handler-id={handlerId}
      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {!isPanelOpen && (
        <td className="p-3">
          <div className="flex items-center gap-2 cursor-move">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </td>
      )}
      <td className="p-3">
        <span className="text-sm">{company.nom}</span>
      </td>
      {!isPanelOpen && (
        <td className="p-3">
          <span className="text-sm text-gray-600 font-mono">{company.codeInterne}</span>
        </td>
      )}
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(company)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(company.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface CompanyPanelProps {
  company?: ManagementCompany;
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Omit<ManagementCompany, 'id' | 'rank'>) => void;
}

const CompanyPanel: React.FC<CompanyPanelProps> = ({ company, isOpen, onClose, onSave }) => {
  const [nom, setNom] = useState(company?.nom || '');
  const [codeInterne, setCodeInterne] = useState(company?.codeInterne || '');
  const [prefixeFacturesFrais, setPrefixeFacturesFrais] = useState(company?.prefixeFacturesFrais || '');
  const [prefixeFacturesCommissions, setPrefixeFacturesCommissions] = useState(company?.prefixeFacturesCommissions || '');

  React.useEffect(() => {
    if (company) {
      setNom(company.nom);
      setCodeInterne(company.codeInterne);
      setPrefixeFacturesFrais(company.prefixeFacturesFrais);
      setPrefixeFacturesCommissions(company.prefixeFacturesCommissions);
    } else {
      setNom('');
      setCodeInterne('');
      setPrefixeFacturesFrais('');
      setPrefixeFacturesCommissions('');
    }
  }, [company, isOpen]);

  const handleSave = () => {
    if (!nom.trim() || !codeInterne.trim()) return;
    
    onSave({
      nom,
      codeInterne,
      prefixeFacturesFrais,
      prefixeFacturesCommissions,
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
                  {company ? 'Éditer la société' : 'Ajouter une société'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration de la société de gestion
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
                  <Label className="text-xs text-gray-700 mb-1.5 block">Nom<span className="text-red-500 ml-1">*</span></Label>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Eurazeo Infrastructure Partners (EIP)"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">Identifiant interne<span className="text-red-500 ml-1">*</span></Label>
                  <Input
                    value={codeInterne}
                    onChange={(e) => setCodeInterne(e.target.value)}
                    placeholder="f16c32-042c-4b0f-b42d-daaf5e6ca751"
                    className="h-9 text-sm font-mono"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">Préfixe factures frais</Label>
                  <Input
                    value={prefixeFacturesFrais}
                    onChange={(e) => setPrefixeFacturesFrais(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">Préfixe factures commissions</Label>
                  <Input
                    value={prefixeFacturesCommissions}
                    onChange={(e) => setPrefixeFacturesCommissions(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>
              </div>

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
                  disabled={!nom.trim() || !codeInterne.trim()}
                >
                  {company ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ManagementCompaniesSettingsContent() {
  const [companies, setCompanies] = useState(mockCompanies);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ManagementCompany | undefined>();
  const [deletingCompany, setDeletingCompany] = useState<ManagementCompany | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveCompany = (dragIndex: number, hoverIndex: number) => {
    const dragCompany = companies[dragIndex];
    const newCompanies = [...companies];
    newCompanies.splice(dragIndex, 1);
    newCompanies.splice(hoverIndex, 0, dragCompany);
    
    setCompanies(newCompanies.map((c, index) => ({
      ...c,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingCompany(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (company: ManagementCompany) => {
    setEditingCompany(company);
    setIsPanelOpen(true);
  };

  const handleSave = (companyData: Omit<ManagementCompany, 'id' | 'rank'>) => {
    if (editingCompany) {
      setCompanies(companies.map(c => 
        c.id === editingCompany.id 
          ? { ...c, ...companyData }
          : c
      ));
    } else {
      const newCompany: ManagementCompany = {
        id: Date.now().toString(),
        ...companyData,
        rank: companies.length
      };
      setCompanies([...companies, newCompany]);
    }
    setIsPanelOpen(false);
    setEditingCompany(undefined);
  };

  const handleDelete = (id: string) => {
    const company = companies.find(c => c.id === id);
    if (company) {
      setDeletingCompany(company);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingCompany) {
      setCompanies(companies.filter(c => c.id !== deletingCompany.id).map((c, index) => ({
        ...c,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingCompany(undefined);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingCompany(undefined);
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left mb-1">
                  Supprimer la société ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingCompany && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{deletingCompany.nom}</span>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {deletingCompany.codeInterne}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer cette société de gestion ?
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingCompany(undefined);
              }}
              className="h-9"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white h-9"
            >
              Supprimer
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
              <h1 className="text-2xl mb-2">Sociétés de gestion</h1>
              <p className="text-sm text-gray-600">Gérez les sociétés de gestion de fonds</p>
            </div>
            <Button
              onClick={handleAdd}
              style={{
                background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                color: 'white'
              }}
              className="h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une société
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    {!isPanelOpen && (
                      <th className="text-left p-3 text-sm text-gray-600">Code interne</th>
                    )}
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company, index) => (
                    <DraggableRow
                      key={company.id}
                      company={company}
                      index={index}
                      moveCompany={moveCompany}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      isPanelOpen={isPanelOpen}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Panel */}
      <CompanyPanel
        company={editingCompany}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingCompany(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export function ManagementCompaniesSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ManagementCompaniesSettingsContent />
    </DndProvider>
  );
}
