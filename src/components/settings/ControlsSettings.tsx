import React, { useState, useRef } from 'react';
import { GripVertical, Plus, Edit2, Trash2, Shield, X, AlertTriangle, Check, ChevronsUpDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../ui/utils';

interface Control {
  id: string;
  nom: string;
  valeurDefaut: number;
  typeValeurDefaut: string;
  typesCouts: string[];
  rank: number;
}

const mockControls: Control[] = [
  {
    id: '1',
    nom: 'Contrôle frais de constitution',
    valeurDefaut: 0.50,
    typeValeurDefaut: '% du fonds',
    typesCouts: ['Frais de constitution'],
    rank: 0
  }
];

const typeValeurOptions = [
  '% du fonds',
  '% de l\'investissement',
  'Montant fixe',
  '% du capital'
];

const typesCoutsOptions = [
  'Autres charges qui sont facturées',
  'Commission',
  'Commission Dépositaire',
  'Frais de gestion',
  'Frais de constitution',
  'Frais de souscription',
  'Frais de rachat',
  'Frais de performance',
  'Frais de conseil',
  'Frais juridiques'
];

interface DraggableRowProps {
  control: Control;
  index: number;
  moveControl: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (control: Control) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  control,
  index,
  moveControl,
  onEdit,
  onDelete,
  isPanelOpen
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'control',
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

      moveControl(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'control',
    item: () => {
      return { id: control.id, index };
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
        <span className="text-sm text-gray-900">{control.nom}</span>
      </td>
      <td className="p-3">
        <span className="text-sm text-gray-600">
          {control.valeurDefaut.toFixed(2)}{control.typeValeurDefaut === '% du fonds' || control.typeValeurDefaut === '% de l\'investissement' || control.typeValeurDefaut === '% du capital' ? '%' : '€'}
        </span>
      </td>
      <td className="p-3">
        <div className="flex gap-1.5 flex-wrap">
          {control.typesCouts.map((type, idx) => (
            <Badge 
              key={idx} 
              variant="outline" 
              className="text-xs"
            >
              {type}
            </Badge>
          ))}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(control)}
            className="text-white bg-green-600 hover:bg-green-700 transition-colors px-2.5 py-1.5 rounded text-xs"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(control.id)}
            className="text-white bg-red-600 hover:bg-red-700 transition-colors px-2.5 py-1.5 rounded text-xs"
          >
            Supprimer
          </button>
        </div>
      </td>
    </tr>
  );
};

interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  control: Control | null;
  onSave: (control: Partial<Control>) => void;
}

const Panel: React.FC<PanelProps> = ({ isOpen, onClose, control, onSave }) => {
  const [nom, setNom] = useState(control?.nom || '');
  const [valeurDefaut, setValeurDefaut] = useState(control?.valeurDefaut?.toString() || '');
  const [typeValeurDefaut, setTypeValeurDefaut] = useState(control?.typeValeurDefaut || '% du fonds');
  const [typesCouts, setTypesCouts] = useState<string[]>(control?.typesCouts || []);
  const [openCombobox, setOpenCombobox] = useState(false);

  React.useEffect(() => {
    if (control) {
      setNom(control.nom);
      setValeurDefaut(control.valeurDefaut.toString());
      setTypeValeurDefaut(control.typeValeurDefaut);
      setTypesCouts(control.typesCouts);
    } else {
      setNom('');
      setValeurDefaut('');
      setTypeValeurDefaut('% du fonds');
      setTypesCouts([]);
    }
  }, [control, isOpen]);

  const handleSave = () => {
    if (!nom.trim() || !valeurDefaut || typesCouts.length === 0) return;

    onSave({
      id: control?.id,
      nom: nom.trim(),
      valeurDefaut: parseFloat(valeurDefaut) || 0,
      typeValeurDefaut,
      typesCouts,
    });
  };

  const toggleTypeCout = (type: string) => {
    setTypesCouts(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const isFormValid = nom.trim().length > 0 && valeurDefaut.length > 0 && typesCouts.length > 0;

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
                {control ? 'Éditer le contrôle' : 'Ajouter un contrôle'}
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
                  placeholder="Ex: Contrôle frais de constitution"
                  className="h-9 text-sm"
                  required
                  autoFocus
                />
              </div>

              {/* Valeur par défaut */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Valeur par défaut <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={valeurDefaut}
                  onChange={(e) => setValeurDefaut(e.target.value)}
                  placeholder="0.50"
                  className="h-9 text-sm"
                  required
                />
              </div>

              {/* Type de valeur par défaut */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Type de valeur par défaut <span className="text-red-500">*</span>
                </Label>
                <Select value={typeValeurDefaut} onValueChange={setTypeValeurDefaut}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeValeurOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Types de coûts avec Combobox */}
              <div>
                <Label className="text-xs text-gray-700 mb-1.5 block">
                  Types de coûts <span className="text-red-500">*</span>
                </Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between h-auto min-h-[36px] text-sm"
                    >
                      <div className="flex gap-1.5 flex-wrap">
                        {typesCouts.length > 0 ? (
                          typesCouts.map((type) => (
                            <Badge 
                              key={type} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-500">Sélectionner les types de coûts...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[380px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un type de coût..." className="h-9" />
                      <CommandEmpty>Aucun type de coût trouvé.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {typesCoutsOptions.map((type) => (
                          <CommandItem
                            key={type}
                            value={type}
                            onSelect={() => toggleTypeCout(type)}
                          >
                            <div className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              typesCouts.includes(type)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}>
                              <Check className="h-4 w-4" />
                            </div>
                            <span>{type}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {typesCouts.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    {typesCouts.length} type{typesCouts.length > 1 ? 's' : ''} sélectionné{typesCouts.length > 1 ? 's' : ''}
                  </p>
                )}
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
                  className="flex-1 h-9 text-sm bg-green-600 hover:bg-green-700 text-white"
                  style={{
                    background: isFormValid ? '#16a34a' : undefined,
                  }}
                >
                  Valider
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ControlsSettingsContent() {
  const [controls, setControls] = useState(mockControls);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<Control | null>(null);
  const [deletingControl, setDeletingControl] = useState<Control | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveControl = (dragIndex: number, hoverIndex: number) => {
    const dragControl = controls[dragIndex];
    const newControls = [...controls];
    newControls.splice(dragIndex, 1);
    newControls.splice(hoverIndex, 0, dragControl);
    
    setControls(newControls.map((c, index) => ({
      ...c,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingControl(null);
    setIsPanelOpen(true);
  };

  const handleEdit = (control: Control) => {
    setEditingControl(control);
    setIsPanelOpen(true);
  };

  const handleSave = (controlData: Partial<Control>) => {
    if (editingControl) {
      setControls(controls.map(c => 
        c.id === editingControl.id 
          ? { ...c, ...controlData }
          : c
      ));
    } else {
      const newControl: Control = {
        id: Date.now().toString(),
        nom: controlData.nom || '',
        valeurDefaut: controlData.valeurDefaut || 0,
        typeValeurDefaut: controlData.typeValeurDefaut || '% du fonds',
        typesCouts: controlData.typesCouts || [],
        rank: controls.length
      };
      setControls([...controls, newControl]);
    }
    setIsPanelOpen(false);
    setEditingControl(null);
  };

  const handleDelete = (id: string) => {
    const control = controls.find(c => c.id === id);
    if (control) {
      setDeletingControl(control);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingControl) {
      setControls(controls.filter(c => c.id !== deletingControl.id).map((c, index) => ({
        ...c,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingControl(null);
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingControl(null);
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
                  Supprimer le contrôle ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingControl && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{deletingControl.nom}</div>
                        <div className="text-xs text-gray-500">
                          {deletingControl.valeurDefaut.toFixed(2)}
                          {deletingControl.typeValeurDefaut === '% du fonds' || deletingControl.typeValeurDefaut === '% de l\'investissement' || deletingControl.typeValeurDefaut === '% du capital' ? '%' : '€'} • 
                          {' '}{deletingControl.typesCouts.length} type{deletingControl.typesCouts.length > 1 ? 's' : ''} de coût{deletingControl.typesCouts.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    Cette action est <strong>irréversible</strong>. Le contrôle sera définitivement supprimé.
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
                setDeletingControl(null);
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
              <h1 className="text-2xl mb-2">Contrôles</h1>
              <p className="text-sm text-gray-600">
                {controls.length} contrôle{controls.length > 1 ? 's' : ''} configuré{controls.length > 1 ? 's' : ''}
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
              Ajouter un contrôle
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
                    <th className="text-left p-3 text-sm text-gray-600">Valeur par défaut</th>
                    <th className="text-left p-3 text-sm text-gray-600">Types de coûts</th>
                    <th className="w-48"></th>
                  </tr>
                </thead>
                <tbody>
                  {controls.length === 0 ? (
                    <tr>
                      <td colSpan={isPanelOpen ? 4 : 5} className="p-8 text-center text-sm text-gray-500">
                        Aucun contrôle configuré. Cliquez sur "Ajouter un contrôle" pour commencer.
                      </td>
                    </tr>
                  ) : (
                    controls.map((control, index) => (
                      <DraggableRow
                        key={control.id}
                        control={control}
                        index={index}
                        moveControl={moveControl}
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
          setEditingControl(null);
        }}
        control={editingControl}
        onSave={handleSave}
      />
    </div>
  );
}

export function ControlsSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ControlsSettingsContent />
    </DndProvider>
  );
}
