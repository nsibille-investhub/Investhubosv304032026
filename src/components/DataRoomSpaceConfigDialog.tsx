import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Building2, Briefcase, Target, Trash2, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { DataRoomSpace, SpaceTargeting } from '../utils/dataRoomSpacesData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';

interface DataRoomSpaceConfigDialogProps {
  open: boolean;
  onClose: () => void;
  space: DataRoomSpace | null;
  onSave: (space: Partial<DataRoomSpace>) => void;
  onDelete?: (spaceId: string) => void;
}

const USER_TYPES = ['Investisseur', 'Participation', 'Partenaire'];
const SEGMENTS = ['HNWI', 'UHNWI', 'Retail', 'Professional', 'Institutional'];
const FUNDS = ['Tous les fonds', 'VENTECH I', 'VENTECH II', 'KORELYA I'];

export function DataRoomSpaceConfigDialog({
  open,
  onClose,
  space,
  onSave,
  onDelete
}: DataRoomSpaceConfigDialogProps) {
  const [name, setName] = useState('');
  const [targeting, setTargeting] = useState<SpaceTargeting>({
    userTypes: [],
    segments: [],
    funds: []
  });

  useEffect(() => {
    if (space) {
      setName(space.name);
      setTargeting(space.targeting);
    } else {
      setName('');
      setTargeting({
        userTypes: [],
        segments: [],
        funds: []
      });
    }
  }, [space, open]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Nom requis', {
        description: 'Veuillez saisir un nom pour l\'espace'
      });
      return;
    }

    onSave({
      id: space?.id,
      name: name.trim(),
      targeting,
      documentCount: space?.documentCount || 0,
      folderCount: space?.folderCount || 0
    });

    toast.success(space ? 'Espace mis à jour' : 'Espace créé', {
      description: name
    });

    onClose();
  };

  const handleDelete = () => {
    if (space && onDelete) {
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'espace "${space.name}" ?`)) {
        onDelete(space.id);
        toast.success('Espace supprimé', {
          description: space.name
        });
        onClose();
      }
    }
  };

  const toggleUserType = (type: string) => {
    setTargeting(prev => ({
      ...prev,
      userTypes: prev.userTypes.includes(type)
        ? prev.userTypes.filter(t => t !== type)
        : [...prev.userTypes, type]
    }));
  };

  const toggleSegment = (segment: string) => {
    setTargeting(prev => ({
      ...prev,
      segments: prev.segments.includes(segment)
        ? prev.segments.filter(s => s !== segment)
        : [...prev.segments, segment]
    }));
  };

  const toggleFund = (fund: string) => {
    setTargeting(prev => ({
      ...prev,
      funds: prev.funds.includes(fund)
        ? prev.funds.filter(f => f !== fund)
        : [...prev.funds, fund]
    }));
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {space ? 'Configurer l\'espace' : 'Nouvel espace'}
                </h2>
                <p className="text-sm text-gray-500">
                  Définissez le nom et le ciblage de l'espace
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="space-name">Nom de l'espace *</Label>
              <Input
                id="space-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Investisseurs LP, Documentation Partenaires..."
                className="w-full"
              />
            </div>

            {/* Targeting Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Ciblage</h3>
                <p className="text-xs text-gray-500">
                  Définissez qui peut accéder à cet espace
                </p>
              </div>

              {/* User Types */}
              <div className="space-y-2">
                <Label>Type d'utilisateur</Label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPES.map((type) => {
                    const isSelected = targeting.userTypes.includes(type);
                    const Icon = type === 'Investisseur' ? Users : type === 'Participation' ? Building2 : Briefcase;
                    
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleUserType(type)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type}</span>
                      </motion.button>
                    );
                  })}
                </div>
                {targeting.userTypes.length === 0 && (
                  <p className="text-xs text-amber-600">Aucun type d'utilisateur sélectionné</p>
                )}
              </div>

              {/* Segments */}
              <div className="space-y-2">
                <Label>Segments</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="text-sm">
                        {targeting.segments.length > 0
                          ? `${targeting.segments.length} segment${targeting.segments.length > 1 ? 's' : ''} sélectionné${targeting.segments.length > 1 ? 's' : ''}`
                          : 'Sélectionner des segments'}
                      </span>
                      <Target className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {SEGMENTS.map((segment) => (
                      <DropdownMenuCheckboxItem
                        key={segment}
                        checked={targeting.segments.includes(segment)}
                        onCheckedChange={() => toggleSegment(segment)}
                      >
                        {segment}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {targeting.segments.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={false}
                          onCheckedChange={() => setTargeting(prev => ({ ...prev, segments: [] }))}
                          className="text-red-600"
                        >
                          <X className="w-3.5 h-3.5 mr-2" />
                          Tout désélectionner
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {targeting.segments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {targeting.segments.map((segment) => (
                      <Badge key={segment} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Funds */}
              <div className="space-y-2">
                <Label>Fonds</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="text-sm">
                        {targeting.funds.length > 0
                          ? `${targeting.funds.length} fond${targeting.funds.length > 1 ? 's' : ''} sélectionné${targeting.funds.length > 1 ? 's' : ''}`
                          : 'Sélectionner des fonds'}
                      </span>
                      <Target className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {FUNDS.map((fund) => (
                      <DropdownMenuCheckboxItem
                        key={fund}
                        checked={targeting.funds.includes(fund)}
                        onCheckedChange={() => toggleFund(fund)}
                      >
                        {fund}
                      </DropdownMenuCheckboxItem>
                    ))}
                    {targeting.funds.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={false}
                          onCheckedChange={() => setTargeting(prev => ({ ...prev, funds: [] }))}
                          className="text-red-600"
                        >
                          <X className="w-3.5 h-3.5 mr-2" />
                          Tout désélectionner
                        </DropdownMenuCheckboxItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {targeting.funds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {targeting.funds.map((fund) => (
                      <Badge key={fund} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {fund}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div>
              {space && onDelete && (
                <Button
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
              >
                {space ? 'Enregistrer' : 'Créer l\'espace'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
