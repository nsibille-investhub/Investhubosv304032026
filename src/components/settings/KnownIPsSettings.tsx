import React, { useState, useRef } from 'react';
import { Plus, Trash2, GripVertical, Edit2, X, AlertTriangle, Network } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'motion/react';

interface KnownIP {
  id: string;
  ip: string;
  description: string;
  rank: number;
}

const mockIPs: KnownIP[] = [
  { id: '1', ip: '192.168.1.1', description: 'Bureau principal Paris', rank: 0 },
  { id: '2', ip: '192.168.1.100', description: 'Serveur VPN', rank: 1 },
  { id: '3', ip: '10.0.0.1', description: 'Réseau interne Luxembourg', rank: 2 },
];

interface DraggableRowProps {
  knownIP: KnownIP;
  index: number;
  moveIP: (dragIndex: number, hoverIndex: number) => void;
  onEdit: (knownIP: KnownIP) => void;
  onDelete: (id: string) => void;
  isPanelOpen: boolean;
}

const DraggableRow: React.FC<DraggableRowProps> = ({
  knownIP,
  index,
  moveIP,
  onEdit,
  onDelete,
  isPanelOpen,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: 'ip',
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

      moveIP(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'ip',
    item: () => {
      return { id: knownIP.id, index };
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
        <span className="text-sm font-mono">{knownIP.ip}</span>
      </td>
      {!isPanelOpen && (
        <td className="p-3">
          <span className="text-sm text-gray-600">{knownIP.description}</span>
        </td>
      )}
      <td className="p-3">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit(knownIP)}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(knownIP.id)}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface IPPanelProps {
  knownIP?: KnownIP;
  isOpen: boolean;
  onClose: () => void;
  onSave: (knownIP: Omit<KnownIP, 'id' | 'rank'>) => void;
}

const IPPanel: React.FC<IPPanelProps> = ({ knownIP, isOpen, onClose, onSave }) => {
  const [ip, setIp] = useState(knownIP?.ip || '');
  const [description, setDescription] = useState(knownIP?.description || '');

  React.useEffect(() => {
    if (knownIP) {
      setIp(knownIP.ip);
      setDescription(knownIP.description);
    } else {
      setIp('');
      setDescription('');
    }
  }, [knownIP, isOpen]);

  const handleSave = () => {
    if (!ip.trim()) return;
    
    onSave({
      ip,
      description,
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
                  {knownIP ? 'Éditer l\'IP' : 'Ajouter une IP'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configuration de l'adresse IP autorisée
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
                    IP<span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="192.168.1.1"
                    className="h-9 text-sm font-mono"
                    required
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-700 mb-1.5 block">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Bureau principal Paris"
                    className="text-sm resize-none"
                    rows={4}
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
                  disabled={!ip.trim()}
                >
                  {knownIP ? 'Enregistrer' : 'Créer'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function KnownIPsSettingsContent() {
  const [ips, setIps] = useState(mockIPs);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingIP, setEditingIP] = useState<KnownIP | undefined>();
  const [deletingIP, setDeletingIP] = useState<KnownIP | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const moveIP = (dragIndex: number, hoverIndex: number) => {
    const dragIP = ips[dragIndex];
    const newIPs = [...ips];
    newIPs.splice(dragIndex, 1);
    newIPs.splice(hoverIndex, 0, dragIP);
    
    setIps(newIPs.map((ip, index) => ({
      ...ip,
      rank: index
    })));
  };

  const handleAdd = () => {
    setEditingIP(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (ip: KnownIP) => {
    setEditingIP(ip);
    setIsPanelOpen(true);
  };

  const handleSave = (ipData: Omit<KnownIP, 'id' | 'rank'>) => {
    if (editingIP) {
      setIps(ips.map(ip => 
        ip.id === editingIP.id 
          ? { ...ip, ...ipData }
          : ip
      ));
    } else {
      const newIP: KnownIP = {
        id: Date.now().toString(),
        ...ipData,
        rank: ips.length
      };
      setIps([...ips, newIP]);
    }
    setIsPanelOpen(false);
    setEditingIP(undefined);
  };

  const handleDelete = (id: string) => {
    const ip = ips.find(ip => ip.id === id);
    if (ip) {
      setDeletingIP(ip);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingIP) {
      setIps(ips.filter(ip => ip.id !== deletingIP.id).map((ip, index) => ({
        ...ip,
        rank: index
      })));
      setIsDeleteDialogOpen(false);
      setDeletingIP(undefined);
    }
  };

  return (
    <div className="flex h-full bg-white">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingIP(undefined);
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
                  Supprimer l'IP ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingIP && (
                <>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Network className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium font-mono">{deletingIP.ip}</span>
                    </div>
                    {deletingIP.description && (
                      <div className="text-xs text-gray-500">
                        {deletingIP.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir supprimer cette adresse IP autorisée ?
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
                setDeletingIP(undefined);
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
              <h1 className="text-2xl mb-2">IPs connues</h1>
              <p className="text-sm text-gray-600">Gérez les adresses IP autorisées</p>
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
              Ajouter une IP
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {!isPanelOpen && <th className="w-12"></th>}
                    <th className="text-left p-3 text-sm text-gray-600">IP</th>
                    {!isPanelOpen && (
                      <th className="text-left p-3 text-sm text-gray-600">Description</th>
                    )}
                    <th className="w-24"></th>
                  </tr>
                </thead>
                <tbody>
                  {ips.map((ip, index) => (
                    <DraggableRow
                      key={ip.id}
                      knownIP={ip}
                      index={index}
                      moveIP={moveIP}
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
      <IPPanel
        knownIP={editingIP}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingIP(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export function KnownIPsSettings() {
  return (
    <DndProvider backend={HTML5Backend}>
      <KnownIPsSettingsContent />
    </DndProvider>
  );
}
