import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit2, X, AlertTriangle, FileText } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface AICTemplate {
  id: string;
  nom: string;
  rank: number;
}

const mockTemplates: AICTemplate[] = [
  { id: '1', nom: 'Attestation standard France', rank: 0 },
  { id: '2', nom: 'Attestation Luxembourg', rank: 1 },
  { id: '3', nom: 'Attestation société de gestion', rank: 2 },
];

interface DraggableRowProps {
  template: AICTemplate;
  index: number;
  moveTemplate: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (template: AICTemplate) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  template,
  index,
  moveTemplate,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'template',
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

      moveTemplate(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'template',
    item: () => {
      return { id: template.id, index };
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
        <span className="text-sm">{template.nom}</span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(template)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(template.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface TemplatePanelProps {
  template?: AICTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<AICTemplate, 'id' | 'rank'>) => void;
}

const TemplatePanel: React.FC<TemplatePanelProps> = ({ template, isOpen, onClose, onSave }) => {
  const [nom, setNom] = useState(template?.nom || '');

  React.useEffect(() => {
    if (template) {
      setNom(template.nom);
    } else {
      setNom('');
    }
  }, [template, isOpen]);

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
                  {template ? 'Éditer le gabarit' : 'Ajouter un gabarit'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration du gabarit d'attestation
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
                    placeholder="Attestation standard France"
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
                  {template ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function AICsSettingsContent() {
  const [templates, setTemplates] = useState(mockTemplates);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AICTemplate | undefined>();
  const [deletingTemplate, setDeletingTemplate] = useState<AICTemplate | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveTemplate = (dragIndex: number, hoverIndex: number) => {
    const dragTemplate = templates[dragIndex];
    const newTemplates = [...templates];
    newTemplates.splice(dragIndex, 1);
    newTemplates.splice(hoverIndex, 0, dragTemplate);
    
    setTemplates(newTemplates.map((template, index) => ({
      ...template,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingTemplate(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (template: AICTemplate) => {
    setEditingTemplate(template);
    setIsPanelOpen(true);
  };

  const handleSave = (templateData: Omit<AICTemplate, 'id' | 'rank'>) => {
    if (editingTemplate) {
      setTemplates(templates.map(template => 
        template.id === editingTemplate.id 
          ? { ...template, ...templateData }
          : template
      ));
    } else {
      const newTemplate: AICTemplate = {
        id: Date.now().toString(),
        ...templateData,
        rank: templates.length
      };
      setTemplates([...templates, newTemplate]);
    }
    setIsPanelOpen(false);
    setEditingTemplate(undefined);
  };

  const handleDelete = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setDeletingTemplate(template);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingTemplate) {
      setTemplates(templates.filter(t => t.id !== deletingTemplate.id).map((template, index) => ({
        ...template,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingTemplate(undefined);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingTemplate(undefined);
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
                  Supprimer le gabarit ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingTemplate && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">{deletingTemplate.nom}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer ce gabarit d'attestation d'inscription en compte ?
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
                setDeletingTemplate(undefined);
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
              <h1 className="text-2xl mb-2">Gabarits d'AICs</h1>
              <p className="text-sm text-gray-600">Gérez les gabarits d'attestations d'inscription en compte</p>
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
              Ajouter un gabarit
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  {templates.map((template, index) => (
                    <DraggableRow
                      key={template.id}
                      template={template}
                      index={index}
                      moveTemplate={moveTemplate}
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
      <TemplatePanel
        template={editingTemplate}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingTemplate(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export function AICsSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AICsSettingsContent />
    </DndProvider>
  );
}
