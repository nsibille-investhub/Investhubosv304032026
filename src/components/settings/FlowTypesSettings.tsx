import React, { useState, useRef } from 'react';
import { GripVertical, Plus, Edit2, Trash2, DollarSign, X, AlertTriangle } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface FlowType {
  id: string;
  nom: string;
  rank: number;
}

const mockFlowTypes: FlowType[] = [
  {
    id: '1',
    nom: 'Souscription',
    rank: 0
  },
  {
    id: '2',
    nom: 'Rachat',
    rank: 1
  },
  {
    id: '3',
    nom: 'Distribution',
    rank: 2
  },
  {
    id: '4',
    nom: 'Frais de gestion',
    rank: 3
  },
  {
    id: '5',
    nom: 'Appel de fonds',
    rank: 4
  }
];

interface DraggableRowProps {
  flowType: FlowType;
  index: number;
  moveFlowType: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (flowType: FlowType) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  flowType,
  index,
  moveFlowType,
  onEdit,
  onDelete,
  isPanelOpen
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'flowType',
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

      moveFlowType(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'flowType',
    item: () => {
      return { id: flowType.id, index };
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
        <div className="text-sm text-gray-900">{flowType.nom}</div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(flowType)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(flowType.id)}
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
  flowType: FlowType | null;
  onSave: (flowType: Partial<FlowType>) => void;
}

const Panel: React.FC<PanelProps> = ({ isOpen, onClose, flowType, onSave }) => {
  const [nom, setNom] = useState(flowType?.nom || '');

  React.useEffect(() => {
    if (flowType) {
      setNom(flowType.nom);
    } else {
      setNom('');
    }
  }, [flowType, isOpen]);

  const handleSave = () => {
    if (!nom.trim()) return;

    onSave({
      id: flowType?.id,
      nom: nom.trim(),
    });
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
                {flowType ? 'Éditer le type de flux' : 'Ajouter un type'}
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
                  placeholder="Nom du type de flux"
                  className="h-9 text-sm"
                  required
                  autoFocus
                />
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
                  disabled={!nom.trim()}
                  className="flex-1 h-9 text-sm"
                  style={{
                    background: nom.trim()
                      ? 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)'
                      : undefined,
                    color: nom.trim() ? 'white' : undefined
                  }}
                >
                  {flowType ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function FlowTypesSettingsContent() {
  const [flowTypes, setFlowTypes] = useState(mockFlowTypes);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingFlowType, setEditingFlowType] = useState<FlowType | null>(null);
  const [deletingFlowType, setDeletingFlowType] = useState<FlowType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveFlowType = (dragIndex: number, hoverIndex: number) => {
    const dragFlowType = flowTypes[dragIndex];
    const newFlowTypes = [...flowTypes];
    newFlowTypes.splice(dragIndex, 1);
    newFlowTypes.splice(hoverIndex, 0, dragFlowType);
    
    setFlowTypes(newFlowTypes.map((f, index) => ({
      ...f,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingFlowType(null);
    setIsPanelOpen(true);
  };

  const handleEdit = (flowType: FlowType) => {
    setEditingFlowType(flowType);
    setIsPanelOpen(true);
  };

  const handleSave = (flowTypeData: Partial<FlowType>) => {
    if (editingFlowType) {
      setFlowTypes(flowTypes.map(f => 
        f.id === editingFlowType.id 
          ? { ...f, ...flowTypeData }
          : f
      ));
    } else {
      const newFlowType: FlowType = {
        id: Date.now().toString(),
        nom: flowTypeData.nom || '',
        rank: flowTypes.length
      };
      setFlowTypes([...flowTypes, newFlowType]);
    }
    setIsPanelOpen(false);
    setEditingFlowType(null);
  };

  const handleDelete = (id: string) => {
    const flowType = flowTypes.find(f => f.id === id);
    if (flowType) {
      setDeletingFlowType(flowType);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingFlowType) {
      setFlowTypes(flowTypes.filter(f => f.id !== deletingFlowType.id).map((f, index) => ({
        ...f,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingFlowType(null);
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingFlowType(null);
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
                  Supprimer le type de flux ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingFlowType && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{deletingFlowType.nom}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700">
                    Cette action est <strong>irréversible</strong>. Le type de flux sera définitivement supprimé.
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
                setDeletingFlowType(null);
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
              <h1 className="text-2xl mb-2">Types de flux</h1>
              <p className="text-sm text-gray-600">
                {flowTypes.length} type{flowTypes.length > 1 ? 's' : ''} de flux configuré{flowTypes.length > 1 ? 's' : ''}
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
              Nouveau type de flux
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
                    <th className="w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {flowTypes.length === 0 ? (
                    <tr>
                      <td colSpan={isPanelOpen ? 2 : 3} className="p-8 text-center text-sm text-gray-500">
                        Aucun type de flux configuré. Cliquez sur "Nouveau type de flux" pour commencer.
                      </td>
                    </tr>
                  ) : (
                    flowTypes.map((flowType, index) => (
                      <DraggableRow
                        key={flowType.id}
                        flowType={flowType}
                        index={index}
                        moveFlowType={moveFlowType}
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
          setEditingFlowType(null);
        }}
        flowType={editingFlowType}
        onSave={handleSave}
      />
    </div>
  );
}

export function FlowTypesSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <FlowTypesSettingsContent />
    </DndProvider>
  );
}
