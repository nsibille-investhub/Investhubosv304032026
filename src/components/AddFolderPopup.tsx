import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FolderOpen, Users, Building2, Briefcase, Target, ChevronDown, Check, Folder } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import { SpaceTargeting } from '../utils/dataRoomSpacesData';

interface FolderOption {
  id: string;
  label: string;
}

interface AddFolderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultParentId: string;
  inheritedTargeting: SpaceTargeting;
  mode?: 'create' | 'edit';
  folderToEdit?: { id: string; name: string } | null;
  onDeleteFolder?: (folderId: string, migrateToFolderId: string) => void;
}

const USER_TYPES = ['Investisseur', 'Participation', 'Partenaire'];

export function AddFolderPopup({
  isOpen,
  onClose,
  folderOptions,
  defaultParentId,
  inheritedTargeting,
  mode = 'create',
  folderToEdit = null,
  onDeleteFolder,
}: AddFolderPopupProps) {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(defaultParentId);
  const [parentOpen, setParentOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [migrationTargetId, setMigrationTargetId] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    setParentId(defaultParentId);
    setDeleteMode(false);
    setMigrationTargetId('');
    setName(mode === 'edit' ? folderToEdit?.name || '' : '');
  }, [defaultParentId, folderToEdit?.name, isOpen, mode]);

  const selectedParentLabel = useMemo(
    () => folderOptions.find((folder) => folder.id === parentId)?.label || 'Racine / Documents',
    [folderOptions, parentId]
  );

  const inheritedUserTypes = inheritedTargeting.userTypes.length
    ? inheritedTargeting.userTypes
    : USER_TYPES;
  const inheritedSegmentsLabel = inheritedTargeting.segments.length
    ? inheritedTargeting.segments.join(', ')
    : 'Tous les investisseurs / Participation / Partenaires';
  const inheritedFundsLabel = inheritedTargeting.funds.length
    ? inheritedTargeting.funds.join(', ')
    : 'Tous les fonds';

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Le nom du dossier est obligatoire.');
      return;
    }

    toast.success(mode === 'edit' ? 'Dossier mis à jour' : 'Dossier créé', { description: `${name.trim()} dans ${selectedParentLabel}` });
    onClose();
    if (mode === 'create') {
      setName('');
    }
  };

  const handleDeleteFolder = () => {
    if (!folderToEdit) return;
    if (!migrationTargetId) {
      toast.error('Veuillez sélectionner un dossier de migration.');
      return;
    }

    onDeleteFolder?.(folderToEdit.id, migrationTargetId);
    toast.success('Dossier supprimé', {
      description: 'Tous les documents et sous-dossiers ont été migrés.',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-white to-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{mode === 'edit' ? 'Modifier le dossier' : 'Nouveau dossier'}</h2>
                <p className="text-sm text-gray-500">Définissez le nom et le ciblage de l&apos;espace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {mode === 'edit' && folderToEdit && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-red-700">Suppression du dossier</p>
                  <p className="text-xs text-red-600 mt-1">
                    La migration vers un autre dossier est obligatoire avant suppression.
                  </p>
                </div>
                {deleteMode ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Dossier de migration (obligatoire)</Label>
                      <Select value={migrationTargetId} onValueChange={setMigrationTargetId}>
                        <SelectTrigger className="h-10 bg-white">
                          <SelectValue placeholder="Sélectionner un dossier de destination" />
                        </SelectTrigger>
                        <SelectContent>
                          {folderOptions
                            .filter((option) => option.id !== folderToEdit.id)
                            .map((option) => (
                              <SelectItem key={option.id} value={option.id}>
                                {option.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => setDeleteMode(false)}>
                        Annuler
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleDeleteFolder}
                        disabled={!migrationTargetId}
                      >
                        Confirmer la suppression
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" className="border-red-300 text-red-700" onClick={() => setDeleteMode(true)}>
                    Supprimer ce dossier
                  </Button>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nom du dossier *</Label>
              <Input
                id="folder-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rapports investisseurs Q2"
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Ciblage</h3>
                <p className="text-xs text-gray-500">Hérité directement de l&apos;espace (lecture seule)</p>
              </div>

              <div className="space-y-2">
                <Label>Type d&apos;utilisateur</Label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPES.map((type) => {
                    const isSelected = inheritedUserTypes.includes(type);
                    const Icon = type === 'Investisseur' ? Users : type === 'Participation' ? Building2 : Briefcase;

                    return (
                      <div
                        key={type}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{type}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Segments</Label>
                <Button variant="outline" className="w-full justify-between" disabled>
                  <span className="text-sm text-left truncate">Limiter à des segments : {inheritedSegmentsLabel}</span>
                  <Target className="w-4 h-4 ml-2" />
                </Button>
                {inheritedTargeting.segments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {inheritedTargeting.segments.map((segment) => (
                      <Badge key={segment} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {segment}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fonds</Label>
                <Button variant="outline" className="w-full justify-between" disabled>
                  <span className="text-sm text-left truncate">Limiter à un fonds : {inheritedFundsLabel}</span>
                  <Target className="w-4 h-4 ml-2" />
                </Button>
                {inheritedTargeting.funds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {inheritedTargeting.funds.map((fund) => (
                      <Badge key={fund} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {fund}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Dossier parent</Label>
                <Popover open={parentOpen} onOpenChange={setParentOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal">
                      <span className="truncate">{selectedParentLabel}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Rechercher un dossier..." />
                      <CommandList>
                        <CommandEmpty>Aucun dossier trouvé.</CommandEmpty>
                        <CommandGroup>
                          {folderOptions.map((folder) => (
                            <CommandItem
                              key={folder.id}
                              value={folder.label}
                              onSelect={() => {
                                setParentId(folder.id);
                                setParentOpen(false);
                              }}
                              className="flex items-center justify-between"
                            >
                              <span className="flex items-center gap-2 truncate">
                                <Folder className="w-4 h-4 text-amber-600" />
                                {folder.label}
                              </span>
                              {folder.id === parentId && <Check className="w-4 h-4 text-blue-600" />}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
            >
              {mode === 'edit' ? 'Enregistrer' : 'Créer le dossier'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
