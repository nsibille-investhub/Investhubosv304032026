import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit2, X, AlertTriangle, BarChart3 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface ReportingType {
  id: string;
  nom: string;
  rank: number;
}

const mockReportingTypes: ReportingType[] = [
  { id: '1', nom: 'Rapport mensuel investisseurs', rank: 0 },
  { id: '2', nom: 'Rapport trimestriel régulateur', rank: 1 },
  { id: '3', nom: 'Rapport annuel performance', rank: 2 },
];

interface DraggableRowProps {
  reportingType: ReportingType;
  index: number;
  moveReportingType: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (reportingType: ReportingType) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  reportingType,
  index,
  moveReportingType,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'reportingType',
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

      moveReportingType(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'reportingType',
    item: () => {
      return { id: reportingType.id, index };
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
        <span className="text-sm">{reportingType.nom}</span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(reportingType)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(reportingType.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface ReportingPanelProps {
  reportingType?: ReportingType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (reportingType: Omit<ReportingType, 'id' | 'rank'>) => void;
}

const ReportingPanel: React.FC<ReportingPanelProps> = ({ reportingType, isOpen, onClose, onSave }) => {
  const [nom, setNom] = useState(reportingType?.nom || '');

  React.useEffect(() => {
    if (reportingType) {
      setNom(reportingType.nom);
    } else {
      setNom('');
    }
  }, [reportingType, isOpen]);

  const handleSave = () => {
    if (!nom.trim()) return;
    
    onSave({
      nom,
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
                  {reportingType ? 'Éditer le type' : 'Ajouter un type'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration du type de reporting
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
                    placeholder="Rapport mensuel investisseurs"
                    className="h-9 text-sm"
                    required
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
                  {reportingType ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function ReportingSettingsContent() {
  const [reportingTypes, setReportingTypes] = useState(mockReportingTypes);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingReportingType, setEditingReportingType] = useState<ReportingType | undefined>();
  const [deletingReportingType, setDeletingReportingType] = useState<ReportingType | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveReportingType = (dragIndex: number, hoverIndex: number) => {
    const dragReportingType = reportingTypes[dragIndex];
    const newReportingTypes = [...reportingTypes];
    newReportingTypes.splice(dragIndex, 1);
    newReportingTypes.splice(hoverIndex, 0, dragReportingType);
    
    setReportingTypes(newReportingTypes.map((reportingType, index) => ({
      ...reportingType,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingReportingType(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (reportingType: ReportingType) => {
    setEditingReportingType(reportingType);
    setIsPanelOpen(true);
  };

  const handleSave = (reportingTypeData: Omit<ReportingType, 'id' | 'rank'>) => {
    if (editingReportingType) {
      setReportingTypes(reportingTypes.map(reportingType => 
        reportingType.id === editingReportingType.id 
          ? { ...reportingType, ...reportingTypeData }
          : reportingType
      ));
    } else {
      const newReportingType: ReportingType = {
        id: Date.now().toString(),
        ...reportingTypeData,
        rank: reportingTypes.length
      };
      setReportingTypes([...reportingTypes, newReportingType]);
    }
    setIsPanelOpen(false);
    setEditingReportingType(undefined);
  };

  const handleDelete = (id: string) => {
    const reportingType = reportingTypes.find(t => t.id === id);
    if (reportingType) {
      setDeletingReportingType(reportingType);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingReportingType) {
      setReportingTypes(reportingTypes.filter(t => t.id !== deletingReportingType.id).map((reportingType, index) => ({
        ...reportingType,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingReportingType(undefined);
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingReportingType(undefined);
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
                  Supprimer le type de reporting ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingReportingType && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{deletingReportingType.nom}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce type de reporting ?
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
                setDeletingReportingType(undefined);
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
              <h1 className="text-2xl mb-2">Reportings</h1>
              <p className="text-sm text-gray-600">Gérez les types de reportings</p>
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
              Ajouter un type
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm text-gray-700">Types de reportings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">Nom</th>
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {reportingTypes.map((reportingType, index) => (
                    <DraggableRow
                      key={reportingType.id}
                      reportingType={reportingType}
                      index={index}
                      moveReportingType={moveReportingType}
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
      <ReportingPanel
        reportingType={editingReportingType}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingReportingType(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export function ReportingSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ReportingSettingsContent />
    </DndProvider>
  );
}
