import React, { useState, useRef } from 'react';
import { GripVertical, Plus, Edit2, Trash2, Shield, X, AlertTriangle, Download, Upload, FileJson } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';
import { CountBadge } from '../ui/count-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RightsMultiSelect } from './RightsMultiSelect';

interface RightGroup {
  id: string;
  nom: string;
  type: string;
  description: string;
  droits: string[];
  nombreDroits: number;
  rank: number;
}

const mockRightGroups: RightGroup[] = [
  {
    id: '1',
    nom: 'Compliance & Service Clients',
    type: 'Back-office',
    description: 'Droits pour l\'équipe de compliance et service clients',
    droits: ['Campagnes > Validation', 'Campagnes > Validation risque', 'Investisseurs > Connexion tiers', 'Investisseurs > Liste'],
    nombreDroits: 14,
    rank: 0
  },
  {
    id: '2',
    nom: 'Lecture seule',
    type: 'Back-office',
    description: 'Accès en lecture seule à toutes les données',
    droits: ['Actions', 'Campagnes > Contrats'],
    nombreDroits: 6,
    rank: 1
  },
  {
    id: '3',
    nom: 'Legal',
    type: 'Back-office',
    description: 'Droits pour l\'équipe légale',
    droits: ['Campagnes > Historique documents investisseurs', 'Campagnes > Investisseurs', 'Campagnes > Liste'],
    nombreDroits: 11,
    rank: 2
  },
  {
    id: '4',
    nom: 'OFM',
    type: 'Back-office',
    description: 'Droits pour les gestionnaires de fonds',
    droits: ['Campagnes > Onboarding', 'Campagnes > Paramètres'],
    nombreDroits: 5,
    rank: 3
  },
  {
    id: '5',
    nom: 'Transfer Agent',
    type: 'Back-office',
    description: 'Droits pour les agents de transfert',
    droits: ['Investisseurs > Connexion tiers', 'Investisseurs > Liste', 'Paramètres > Historique mails'],
    nombreDroits: 6,
    rank: 4
  }
];

const availableRights = [
  'Actualités',
  'Campagnes > Appels',
  'Campagnes > Appels notifications',
  'Campagnes > Assemblées',
  'Campagnes > Bourse',
  'Campagnes > Capital accounts',
  'Campagnes > Comptes',
  'Campagnes > Contrats',
  'Campagnes > Distributions',
  'Campagnes > FAQ',
  'Campagnes > Historique documents investisseurs',
  'Campagnes > Investisseurs',
  'Campagnes > Investisseurs lecture seule',
  'Campagnes > Liste',
  'Campagnes > Onboarding',
  'Campagnes > Paramètres',
  'Campagnes > Participations',
  'Campagnes > Prévisions de flux',
  'Campagnes > Transferts',
  'Campagnes > Valeurs liquidatives',
  'Campagnes > Validation',
  'Campagnes > Validation risque',
  'Contactforms',
  'Contacts',
  'Contenu',
  'Dealflow',
  'Dealflow > Partenaires',
  'Dealflow > Statistiques',
  'Disclaimers',
  'Distribution > Comissions',
  'Distribution > Contrats',
  'Distribution > Fees',
  'Distribution > Partenaires',
  'Documents',
  'Documents > Lecture seule',
  'Documents > Validation',
  'Fonds > Rachats',
  'Gestion > Actions',
  'Gestion > Exports',
  'Gestion > Factures en attente',
  'Gestion > Toutes les pièces',
  'Investisseurs > Alertes',
  'Investisseurs > Campagnes KYC',
  'Investisseurs > Catégories',
  'Investisseurs > Connexion tiers',
  'Investisseurs > Espace investisseur',
  'Investisseurs > Intermédiaires',
  'Investisseurs > Liste',
  'Investisseurs > Liste lecture seule',
  'Investisseurs > Statistiques',
  'Onboardings',
  'Outils > Communication',
  'Outils > Sondages',
  'Paramètres > Ajout rapide partenaire',
  'Paramètres > Catégories de sections',
  'Paramètres > Certificats',
  'Paramètres > Champs personnalisés',
  'Paramètres > Comptes bancaires',
  'Paramètres > Contrôles',
  'Paramètres > Droits',
  'Paramètres > Équipes',
  'Paramètres > Fichiers hébergés',
  'Paramètres > Formatage des variables',
  'Paramètres > Fournisseurs',
  'Paramètres > Gabarits mails',
  'Paramètres > Groupes contacts',
  'Paramètres > Groupes de mails',
  'Paramètres > Historique mails',
  'Paramètres > Historique SMS',
  'Paramètres > Imports',
  'Paramètres > IPs connues',
  'Paramètres > Lemonway Logs',
  'Paramètres > Logs',
  'Paramètres > Logs Harvest',
  'Paramètres > Outils',
  'Paramètres > Plan comptable',
  'Paramètres > Rapports',
  'Paramètres > Reportings',
  'Paramètres > Requêtes',
  'Paramètres > Signatures DocuSign',
  'Paramètres > Sociétés de gestion',
  'Paramètres > Statistiques des emails',
  'Paramètres > Statuts deals',
  'Paramètres > Statuts investisseurs',
  'Paramètres > Statuts personnalisés',
  'Paramètres > Traductions',
  'Paramètres > Types de flux',
  'Paramètres > Types deals',
  'Paramètres > Utilisateurs',
  'Partenaires > Commissions > Générer les décomptes & Importer un décompte',
  'Partenaires > Commissions > Valider ou refuser une facture',
  'Partenaires > Connexion tiers',
  'Partenaires > Demandes de conventions',
  'Partenaires > Droits d\'entrée > Générer les décomptes & Importer un décompte',
  'Partenaires > Droits d\'entrée > Valider ou refuser une facture',
  'Partenaires > Refresh KYC',
  'Participations > Documents',
  'Participations > Espace participation',
  'Participations > Impersonate',
  'Screening > Alertes Orias',
  'Screening > Orias checks',
  'Screening > Worldcheck',
  'Tableau de bord > Acquisition',
  'Tableau de bord > Gestion',
  'Tableau de bord > Rachats',
  'Tableau de bord > Souscriptions'
];

interface DraggableRowProps {
  group: RightGroup;
  index: number;
  moveGroup: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (group: RightGroup) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({ group, index, moveGroup, onEdit, onDelete, isPanelOpen }) => {
  const ref = React.useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'rightGroup',
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

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveGroup(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: 'rightGroup',
    item: () => {
      return { id: group.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: !isPanelOpen,
  });

  const opacity = isDragging ? 0.4 : 1;
  preview(drop(ref));

  return (
    <tr
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className="border-b border-gray-200 hover:bg-gray-50"
    >
      {!isPanelOpen && (
        <td className="p-3 w-8">
          <div ref={drag} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        </td>
      )}
      <td className="p-3">
        <span className="text-sm text-gray-900">{group.nom}</span>
      </td>
      {!isPanelOpen && (
        <td className="p-3">
          <span className="text-sm text-gray-600">{group.type}</span>
        </td>
      )}
      <td className="p-3">
        <CountBadge count={group.nombreDroits} icon={Shield} variant="purple" />
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(group)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(group.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  group: RightGroup | null;
  onSave: (group: Partial<RightGroup>) => void;
}

const Panel: React.FC<PanelProps> = ({ isOpen, onClose, group, onSave }) => {
  const [type, setType] = useState(group?.type || 'Back-office');
  const [nom, setNom] = useState(group?.nom || '');
  const [description, setDescription] = useState(group?.description || '');
  const [selectedRights, setSelectedRights] = useState<string[]>(group?.droits || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (group) {
      setType(group.type);
      setNom(group.nom);
      setDescription(group.description);
      setSelectedRights(group.droits);
    } else {
      setType('Back-office');
      setNom('');
      setDescription('');
      setSelectedRights([]);
    }
  }, [group]);

  const handleSave = () => {
    onSave({
      id: group?.id,
      type,
      nom,
      description,
      droits: selectedRights,
      nombreDroits: selectedRights.length,
    });
  };

  // Export du groupe actuel
  const handleExportGroup = () => {
    const exportData = {
      version: '1.0',
      type: 'single-group',
      exportDate: new Date().toISOString(),
      group: {
        nom,
        type,
        description,
        droits: selectedRights,
        nombreDroits: selectedRights.length
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groupe-droits-${nom.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import d'un groupe
  const handleImportGroup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        if (importData.type === 'single-group' && importData.group) {
          setNom(importData.group.nom || '');
          setType(importData.group.type || 'Back-office');
          setDescription(importData.group.description || '');
          setSelectedRights(importData.group.droits || []);
        } else {
          alert('Format de fichier invalide. Veuillez importer un fichier de groupe de droits valide.');
        }
      } catch (error) {
        alert('Erreur lors de la lecture du fichier. Assurez-vous qu\'il s\'agit d\'un fichier JSON valide.');
      }
    };
    reader.readAsText(file);

    // Reset input pour permettre de réimporter le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 420, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm text-gray-900">
                  {group ? 'Modifier un groupe' : 'Créer un groupe'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {group ? 'Modifiez les informations du groupe de droits' : 'Ajoutez un nouveau groupe de droits'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Import/Export buttons */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportGroup}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 h-8 text-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Importer un groupe
              </Button>
              {(nom || group) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportGroup}
                  className="flex-1 h-8 text-xs"
                  disabled={!nom.trim()}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Exporter
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto">
            <div className="p-4">
              {/* Type */}
              <div className="mb-4">
                <Label htmlFor="type" className="text-xs text-gray-700 mb-1.5 block">
                  Type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Back-office">Back-office</SelectItem>
                    <SelectItem value="Front-office">Front-office</SelectItem>
                    <SelectItem value="API">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nom */}
              <div className="mb-4">
                <Label htmlFor="nom" className="text-xs text-gray-700 mb-1.5 block">
                  Nom
                </Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Compliance & Service Clients"
                  className="h-9 text-sm"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <Label htmlFor="description" className="text-xs text-gray-700 mb-1.5 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description du groupe de droits..."
                  className="min-h-[80px] text-sm resize-none"
                />
              </div>

              {/* Droits */}
              <div className="mb-4">
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Droits
                </Label>
                <RightsMultiSelect
                  selectedRights={selectedRights}
                  onSelectionChange={setSelectedRights}
                  availableRights={availableRights}
                />
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
                  {group ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function RightsSettingsContent() {
  const [groups, setGroups] = useState(mockRightGroups);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<RightGroup | undefined>();
  const [deletingGroup, setDeletingGroup] = useState<RightGroup | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const configImportRef = useRef<HTMLInputElement>(null);

  const moveGroup = (dragIndex: number, hoverIndex: number) => {
    const dragGroup = groups[dragIndex];
    const newGroups = [...groups];
    newGroups.splice(dragIndex, 1);
    newGroups.splice(hoverIndex, 0, dragGroup);
    
    setGroups(newGroups.map((g, index) => ({
      ...g,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingGroup(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (group: RightGroup) => {
    setEditingGroup(group);
    setIsPanelOpen(true);
  };

  const handleSave = (groupData: Partial<RightGroup>) => {
    if (editingGroup) {
      setGroups(groups.map(g => 
        g.id === editingGroup.id 
          ? { ...g, ...groupData }
          : g
      ));
    } else {
      const newGroup: RightGroup = {
        id: Date.now().toString(),
        nom: groupData.nom || '',
        type: groupData.type || 'Back-office',
        description: groupData.description || '',
        droits: groupData.droits || [],
        nombreDroits: groupData.nombreDroits || 0,
        rank: groups.length
      };
      setGroups([...groups, newGroup]);
    }
    setIsPanelOpen(false);
    setEditingGroup(undefined);
  };

  const handleDelete = (id: string) => {
    const group = groups.find(g => g.id === id);
    if (group) {
      setDeletingGroup(group);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingGroup) {
      setGroups(groups.filter(g => g.id !== deletingGroup.id).map((g, index) => ({
        ...g,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingGroup(undefined);
    }
  };

  // Export de la configuration complète
  const handleExportConfig = () => {
    const exportData = {
      version: '1.0',
      type: 'full-configuration',
      exportDate: new Date().toISOString(),
      metadata: {
        totalGroups: groups.length,
        availableRightsCount: availableRights.length
      },
      availableRights,
      groups: groups.map(({ id, ...rest }) => rest) // On exclut les IDs temporaires
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `configuration-droits-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import de la configuration complète
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);

        if (importData.type === 'full-configuration' && importData.groups) {
          const confirmImport = window.confirm(
            `Vous allez importer ${importData.groups.length} groupe(s) de droits.\n\n` +
            `Cette action va remplacer la configuration actuelle (${groups.length} groupe(s)).\n\n` +
            `Voulez-vous continuer ?`
          );

          if (confirmImport) {
            const newGroups: RightGroup[] = importData.groups.map((g: Partial<RightGroup>, index: number) => ({
              id: Date.now().toString() + index,
              nom: g.nom || '',
              type: g.type || 'Back-office',
              description: g.description || '',
              droits: g.droits || [],
              nombreDroits: g.nombreDroits || 0,
              rank: index
            }));
            setGroups(newGroups);
            alert(`Configuration importée avec succès : ${newGroups.length} groupe(s) de droits.`);
          }
        } else {
          alert('Format de fichier invalide. Veuillez importer un fichier de configuration valide.');
        }
      } catch (error) {
        alert('Erreur lors de la lecture du fichier. Assurez-vous qu\'il s\'agit d\'un fichier JSON valide.');
      }
    };
    reader.readAsText(file);

    // Reset input
    if (configImportRef.current) {
      configImportRef.current.value = '';
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingGroup(undefined);
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
                  Supprimer le groupe ?
                </AlertDialogTitle>
              </div>
            </div>
            <div className="text-left space-y-4 text-sm text-muted-foreground">
              {deletingGroup && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{deletingGroup.nom}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {deletingGroup.type} • {deletingGroup.nombreDroits} droits
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce groupe de droits ?
                    </div>
                  </div>
                </>
              )}
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingGroup(undefined);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl mb-2">Groupes de droits</h1>
                <p className="text-sm text-gray-600">Gérez les groupes de droits</p>
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
                Ajouter un groupe
              </Button>
            </div>

            {/* Configuration Import/Export */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-gray-900 mb-1">
                    Configuration complète
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    Exportez ou importez l'ensemble de votre configuration de droits ({groups.length} groupe{groups.length > 1 ? 's' : ''})
                  </p>
                  <div className="flex gap-2">
                    <input
                      ref={configImportRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportConfig}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => configImportRef.current?.click()}
                      className="h-8 text-xs bg-white"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1.5" />
                      Importer la configuration
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExportConfig}
                      className="h-8 text-xs bg-white"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Exporter la configuration
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    {!isPanelOpen && (
                      <th className="text-left p-3 text-sm text-gray-600">Type</th>
                    )}
                    <th className="text-left p-3 text-sm text-gray-600">Nombre de droits liés</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group, index) => (
                    <DraggableRow
                      key={group.id}
                      group={group}
                      index={index}
                      moveGroup={moveGroup}
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
      <Panel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingGroup(undefined);
        }}
        group={editingGroup || null}
        onSave={handleSave}
      />
    </div>
  );
}

export function RightsSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <RightsSettingsContent />
    </DndProvider>
  );
}
