import React, { useState, useRef } from 'react';
import { GripVertical, Plus, Edit2, Trash2, Type, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface CustomField {
  id: string;
  nom: string;
  objet: string;
  nomChamp: string;
  type: string;
  visibleFO: boolean;
  obligatoireFO: boolean;
  obligatoireBO: boolean;
  cacheBO: boolean;
  rank: number;
}

const mockCustomFields: CustomField[] = [
  {
    id: '5',
    nom: 'Forme juridique',
    objet: 'Investisseur',
    nomChamp: 'Forme juridique',
    type: 'text',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 0
  },
  {
    id: '7',
    nom: 'Statut fiscal',
    objet: 'Investisseur',
    nomChamp: 'Statut fiscal dans le pays de résidence',
    type: 'text',
    visibleFO: false,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 1
  },
  {
    id: '8',
    nom: 'Activité principale',
    objet: 'Investisseur',
    nomChamp: 'Activité principale',
    type: 'text',
    visibleFO: true,
    obligatoireFO: true,
    obligatoireBO: false,
    cacheBO: false,
    rank: 2
  },
  {
    id: '9',
    nom: 'Place of incorporation',
    objet: 'Investisseur',
    nomChamp: 'Place of incorporation',
    type: 'text',
    visibleFO: false,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 3
  },
  {
    id: '10',
    nom: 'Taxable year end',
    objet: 'Investisseur',
    nomChamp: 'Taxable year end',
    type: 'text',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 4
  },
  {
    id: '11',
    nom: 'Validé',
    objet: 'Investisseur',
    nomChamp: 'Validé',
    type: 'checkbox',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 5
  }
];

const objetOptions = [
  'Investisseur',
  'Souscription',
  'Document',
  'Partenaire',
  'Deal',
  'Contrepartie'
];

const typeOptions = [
  'text',
  'checkbox',
  'number',
  'date',
  'select',
  'textarea'
];

interface DraggableRowProps {
  field: CustomField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (field: CustomField) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  field,
  index,
  moveField,
  onEdit,
  onDelete,
  isPanelOpen
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'customField',
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

      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'customField',
    item: () => {
      return { id: field.id, index };
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
        <span className="text-sm text-gray-900">{field.nom}</span>
      </td>
      <td className="p-3">
        <span className="text-sm text-gray-900">{field.objet}</span>
      </td>
      <td className="p-3">
        <Badge variant="outline" className="text-xs">
          {field.type}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900">{field.nomChamp}</span>
          {!field.visibleFO && <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(field)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(field.id)}
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
  field: CustomField | null;
  onSave: (field: Partial<CustomField>) => void;
  onAssignDefaultValue: (fieldId: string, defaultValue: string, replaceExisting: boolean) => void;
}

const Panel: React.FC<PanelProps> = ({ isOpen, onClose, field, onSave, onAssignDefaultValue }) => {
  const [nom, setNom] = useState(field?.nom || '');
  const [objet, setObjet] = useState(field?.objet || 'Investisseur');
  const [nomChamp, setNomChamp] = useState(field?.nomChamp || '');
  const [type, setType] = useState(field?.type || 'text');
  const [visibleFO, setVisibleFO] = useState(field?.visibleFO ?? true);
  const [obligatoireFO, setObligatoireFO] = useState(field?.obligatoireFO ?? false);
  const [obligatoireBO, setObligatoireBO] = useState(field?.obligatoireBO ?? false);
  const [cacheBO, setCacheBO] = useState(field?.cacheBO ?? false);
  
  // Pour la section valeur par défaut (uniquement en édition)
  const [defaultValue, setDefaultValue] = useState('');
  const [replaceExisting, setReplaceExisting] = useState(false);

  React.useEffect(() => {
    if (field) {
      setNom(field.nom);
      setObjet(field.objet);
      setNomChamp(field.nomChamp);
      setType(field.type);
      setVisibleFO(field.visibleFO ?? true);
      setObligatoireFO(field.obligatoireFO ?? false);
      setObligatoireBO(field.obligatoireBO ?? false);
      setCacheBO(field.cacheBO ?? false);
      setDefaultValue('');
      setReplaceExisting(false);
    } else {
      setNom('');
      setObjet('Investisseur');
      setNomChamp('');
      setType('text');
      setVisibleFO(true);
      setObligatoireFO(false);
      setObligatoireBO(false);
      setCacheBO(false);
      setDefaultValue('');
      setReplaceExisting(false);
    }
  }, [field, isOpen]);

  const handleSave = () => {
    if (!nom.trim() || !nomChamp.trim()) return;

    onSave({
      id: field?.id,
      nom: nom.trim(),
      objet,
      nomChamp: nomChamp.trim(),
      type,
      visibleFO,
      obligatoireFO,
      obligatoireBO,
      cacheBO,
    });
  };

  const handleAssignDefault = () => {
    if (!field || !defaultValue.trim()) return;
    
    onAssignDefaultValue(field.id, defaultValue.trim(), replaceExisting);
    
    // Reset après assignation
    setDefaultValue('');
    setReplaceExisting(false);
  };

  const isFormValid = nom.trim().length > 0 && nomChamp.trim().length > 0;

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
                {field ? 'Éditer le champ' : 'Ajouter un champ'}
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
              {/* Nom */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Forme juridique"
                  className="h-9 text-sm"
                  required
                  autoFocus
                />
              </div>

              {/* Objet */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Objet <span className="text-red-500">*</span>
                </Label>
                <Select value={objet} onValueChange={setObjet}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {objetOptions.map((obj) => (
                      <SelectItem key={obj} value={obj}>
                        {obj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nom du champ */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Nom du champ <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={nomChamp}
                  onChange={(e) => setNomChamp(e.target.value)}
                  placeholder="Ex: Activité principale"
                  className="h-9 text-sm"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="visibleFO" 
                    checked={visibleFO}
                    onCheckedChange={(checked) => setVisibleFO(checked as boolean)}
                  />
                  <Label htmlFor="visibleFO" className="text-sm cursor-pointer">
                    Visible sur le FO
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="obligatoireFO" 
                    checked={obligatoireFO}
                    onCheckedChange={(checked) => setObligatoireFO(checked as boolean)}
                  />
                  <Label htmlFor="obligatoireFO" className="text-sm cursor-pointer">
                    Obligatoire sur le FO
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="obligatoireBO" 
                    checked={obligatoireBO}
                    onCheckedChange={(checked) => setObligatoireBO(checked as boolean)}
                  />
                  <Label htmlFor="obligatoireBO" className="text-sm cursor-pointer">
                    Obligatoire sur le BO
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cacheBO" 
                    checked={cacheBO}
                    onCheckedChange={(checked) => setCacheBO(checked as boolean)}
                  />
                  <Label htmlFor="cacheBO" className="text-sm cursor-pointer">
                    Caché sur le BO
                  </Label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 h-9 text-sm"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isFormValid}
                  className="flex-1 h-9 text-sm"
                  style={{
                    background: isFormValid
                      ? 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
                      : undefined,
                    color: isFormValid ? 'white' : undefined
                  }}
                >
                  {field ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>

              {/* Section Valeur par défaut - Uniquement en édition */}
              {field && (
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <h3 className="text-sm text-gray-900 mb-4">
                    Valeur par défaut du champ
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs text-gray-700 mb-1.5 block">
                        Valeur du champ
                      </Label>
                      <Input
                        value={defaultValue}
                        onChange={(e) => setDefaultValue(e.target.value)}
                        placeholder={nomChamp || 'Entrez la valeur par défaut'}
                        className="h-9 text-sm"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="replaceExisting" 
                        checked={replaceExisting}
                        onCheckedChange={(checked) => setReplaceExisting(checked as boolean)}
                      />
                      <Label htmlFor="replaceExisting" className="text-sm cursor-pointer">
                        Remplacer les valeurs existantes
                      </Label>
                    </div>

                    <Button
                      onClick={handleAssignDefault}
                      disabled={!defaultValue.trim()}
                      className="w-full h-9 text-sm"
                      style={{
                        background: defaultValue.trim()
                          ? 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
                          : undefined,
                        color: defaultValue.trim() ? 'white' : undefined
                      }}
                    >
                      Assigner la valeur
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function CustomFieldsSettingsContent() {
  const [fields, setFields] = useState(mockCustomFields);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deletingField, setDeletingField] = useState<CustomField | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveField = (dragIndex: number, hoverIndex: number) => {
    const dragField = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    
    setFields(newFields.map((f, index) => ({
      ...f,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingField(null);
    setIsPanelOpen(true);
  };

  const handleEdit = (field: CustomField) => {
    setEditingField(field);
    setIsPanelOpen(true);
  };

  const handleSave = (fieldData: Partial<CustomField>) => {
    if (editingField) {
      setFields(fields.map(f => 
        f.id === editingField.id 
          ? { ...f, ...fieldData }
          : f
      ));
    } else {
      const newField: CustomField = {
        id: Date.now().toString(),
        nom: fieldData.nom || '',
        objet: fieldData.objet || 'Investisseur',
        nomChamp: fieldData.nomChamp || '',
        type: fieldData.type || 'text',
        visibleFO: fieldData.visibleFO ?? true,
        obligatoireFO: fieldData.obligatoireFO ?? false,
        obligatoireBO: fieldData.obligatoireBO ?? false,
        cacheBO: fieldData.cacheBO ?? false,
        rank: fields.length
      };
      setFields([...fields, newField]);
    }
    setIsPanelOpen(false);
    setEditingField(null);
  };

  const handleDelete = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (field) {
      setDeletingField(field);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingField) {
      setFields(fields.filter(f => f.id !== deletingField.id).map((f, index) => ({
        ...f,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingField(null);
    }
  };

  const handleAssignDefaultValue = (fieldId: string, defaultValue: string, replaceExisting: boolean) => {
    // Logique pour assigner une valeur par défaut
    console.log(`Assigning default value "${defaultValue}" to field ${fieldId}`, {
      replaceExisting
    });
    
    // Ici vous pourriez appeler une API pour appliquer cette valeur par défaut
    // à tous les enregistrements existants (ou seulement aux nouveaux)
    
    alert(`Valeur par défaut assignée !\n\nChamp ID: ${fieldId}\nValeur: ${defaultValue}\nRemplacer existantes: ${replaceExisting ? 'Oui' : 'Non'}`);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingField(null);
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
                  Supprimer le champ personnalisé ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingField && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{deletingField.nomChamp}</div>
                        <div className="text-xs text-gray-500">{deletingField.objet} • {deletingField.type}</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    Cette action est <strong>irréversible</strong>. Le champ et toutes ses données seront définitivement supprimés.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingField(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer définitivement
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
              <h1 className="text-2xl mb-2">Champs personnalisés</h1>
              <p className="text-sm text-gray-600">
                {fields.length} champ{fields.length > 1 ? 's' : ''} personnalisé{fields.length > 1 ? 's' : ''} configuré{fields.length > 1 ? 's' : ''}
              </p>
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
              Ajouter un champ
            </Button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    <th className="text-left p-3 text-sm text-gray-600">Objet</th>
                    <th className="text-left p-3 text-sm text-gray-600">Type</th>
                    <th className="text-left p-3 text-sm text-gray-600">Champ</th>
                    <th className="w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.length === 0 ? (
                    <tr>
                      <td colSpan={isPanelOpen ? 5 : 6} className="p-8 text-center text-sm text-gray-500">
                        Aucun champ personnalisé configuré. Cliquez sur "Ajouter un champ" pour commencer.
                      </td>
                    </tr>
                  ) : (
                    fields.map((field, index) => (
                      <DraggableRow
                        key={field.id}
                        field={field}
                        index={index}
                        moveField={moveField}
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
      <Panel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingField(null);
        }}
        field={editingField}
        onSave={handleSave}
        onAssignDefaultValue={handleAssignDefaultValue}
      />
    </div>
  );
}

export function CustomFieldsSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CustomFieldsSettingsContent />
    </DndProvider>
  );
}
