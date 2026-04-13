import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit2, X, AlertTriangle, Building2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface Provider {
  id: string;
  section: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  complementAdresse: string;
  codePostal: string;
  ville: string;
  compte: string;
  iban: string;
  bic: string;
  rank: number;
}

const mockProviders: Provider[] = [
  { id: '1', section: '4GOOD', nom: '1', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 0 },
  { id: '2', section: '714 PRODUCTION', nom: '4', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 1 },
  { id: '3', section: 'ARE Courtage', nom: '2', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 2 },
  { id: '4', section: 'Actua Formation', nom: '7', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 3 },
  { id: '5', section: 'Advance Capital', nom: '6', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 4 },
  { id: '6', section: 'Adevintian Business Partners', nom: '4', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 5 },
  { id: '7', section: 'Advolis', nom: '4', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 6 },
  { id: '8', section: 'Agiw Avocats', nom: '1', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 7 },
  { id: '9', section: 'Altimed', nom: '3', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 8 },
  { id: '10', section: 'Altix Legal', nom: '1', email: '', telephone: '', adresse: '', complementAdresse: '', codePostal: '', ville: '', compte: '', iban: '', bic: '', rank: 9 },
];

interface DraggableRowProps {
  provider: Provider;
  index: number;
  moveProvider: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (provider: Provider) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  provider,
  index,
  moveProvider,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'provider',
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

      moveProvider(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'provider',
    item: () => {
      return { id: provider.id, index };
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
        <span className="text-sm">{provider.section}</span>
      </td>
      <td className="p-3">
        <span className="text-sm">{provider.nom}</span>
      </td>
      <td className="p-3">
        <span className="text-sm text-gray-600">{provider.email}</span>
      </td>
      <td className="p-3">
        <span className="text-sm text-gray-600">{provider.telephone}</span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(provider)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(provider.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface ProviderPanelProps {
  provider?: Provider;
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: Omit<Provider, 'id' | 'rank'>) => void;
}

const ProviderPanel: React.FC<ProviderPanelProps> = ({ provider, isOpen, onClose, onSave }) => {
  const [nom, setNom] = useState(provider?.nom || '');
  const [section, setSection] = useState(provider?.section || '');
  const [adresse, setAdresse] = useState(provider?.adresse || '');
  const [complementAdresse, setComplementAdresse] = useState(provider?.complementAdresse || '');
  const [codePostal, setCodePostal] = useState(provider?.codePostal || '');
  const [ville, setVille] = useState(provider?.ville || '');
  const [email, setEmail] = useState(provider?.email || '');
  const [telephone, setTelephone] = useState(provider?.telephone || '');
  const [compte, setCompte] = useState(provider?.compte || '');
  const [iban, setIban] = useState(provider?.iban || '');
  const [bic, setBic] = useState(provider?.bic || '');

  React.useEffect(() => {
    if (provider) {
      setNom(provider.nom);
      setSection(provider.section);
      setAdresse(provider.adresse);
      setComplementAdresse(provider.complementAdresse);
      setCodePostal(provider.codePostal);
      setVille(provider.ville);
      setEmail(provider.email);
      setTelephone(provider.telephone);
      setCompte(provider.compte);
      setIban(provider.iban);
      setBic(provider.bic);
    } else {
      setNom('');
      setSection('');
      setAdresse('');
      setComplementAdresse('');
      setCodePostal('');
      setVille('');
      setEmail('');
      setTelephone('');
      setCompte('');
      setIban('');
      setBic('');
    }
  }, [provider, isOpen]);

  const handleSave = () => {
    if (!nom.trim()) return;
    
    onSave({
      nom,
      section,
      adresse,
      complementAdresse,
      codePostal,
      ville,
      email,
      telephone,
      compte,
      iban,
      bic,
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
                  {provider ? 'Éditer le fournisseur' : 'Ajouter un fournisseur'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration du fournisseur
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
                    Nom<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="RMSA Rhône-Alpes"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Section
                  </Label>
                  <Input
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="ARE Courtage"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Adresse
                  </Label>
                  <Input
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Complément d'adresse
                  </Label>
                  <Input
                    value={complementAdresse}
                    onChange={(e) => setComplementAdresse(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Code postal
                  </Label>
                  <Input
                    value={codePostal}
                    onChange={(e) => setCodePostal(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Ville
                  </Label>
                  <Input
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Téléphone
                  </Label>
                  <Input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    Compte
                  </Label>
                  <Input
                    value={compte}
                    onChange={(e) => setCompte(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    IBAN
                  </Label>
                  <Input
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">
                    BIC
                  </Label>
                  <Input
                    value={bic}
                    onChange={(e) => setBic(e.target.value)}
                    placeholder=""
                    className="h-9 text-sm font-mono"
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
                  disabled={!nom.trim()}
                >
                  {provider ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ProvidersSettingsContent() {
  const [providers, setProviders] = useState(mockProviders);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | undefined>();
  const [deletingProvider, setDeletingProvider] = useState<Provider | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveProvider = (dragIndex: number, hoverIndex: number) => {
    const dragProvider = providers[dragIndex];
    const newProviders = [...providers];
    newProviders.splice(dragIndex, 1);
    newProviders.splice(hoverIndex, 0, dragProvider);
    
    setProviders(newProviders.map((provider, index) => ({
      ...provider,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingProvider(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setIsPanelOpen(true);
  };

  const handleSave = (providerData: Omit<Provider, 'id' | 'rank'>) => {
    if (editingProvider) {
      setProviders(providers.map(provider => 
        provider.id === editingProvider.id 
          ? { ...provider, ...providerData }
          : provider
      ));
    } else {
      const newProvider: Provider = {
        id: Date.now().toString(),
        ...providerData,
        rank: providers.length
      };
      setProviders([...providers, newProvider]);
    }
    setIsPanelOpen(false);
    setEditingProvider(undefined);
  };

  const handleDelete = (id: string) => {
    const provider = providers.find(p => p.id === id);
    if (provider) {
      setDeletingProvider(provider);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingProvider) {
      setProviders(providers.filter(p => p.id !== deletingProvider.id).map((provider, index) => ({
        ...provider,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingProvider(undefined);
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingProvider(undefined);
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
                  Supprimer le fournisseur ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingProvider && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{deletingProvider.nom}</div>
                        {deletingProvider.section && (
                          <div className="text-xs text-gray-500">{deletingProvider.section}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce fournisseur ?
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
                setDeletingProvider(undefined);
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
              <h1 className="text-2xl mb-2">Fournisseurs</h1>
              <p className="text-sm text-gray-600">Gérez vos fournisseurs de services</p>
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
              Ajouter un fournisseur
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm text-gray-700">Fournisseurs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">Section</th>
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    <th className="text-left p-3 text-sm text-gray-600">Email</th>
                    <th className="text-left p-3 text-sm text-gray-600">Téléphone</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider, index) => (
                    <DraggableRow
                      key={provider.id}
                      provider={provider}
                      index={index}
                      moveProvider={moveProvider}
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
      <ProviderPanel
        provider={editingProvider}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingProvider(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export function ProvidersSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ProvidersSettingsContent />
    </DndProvider>
  );
}
