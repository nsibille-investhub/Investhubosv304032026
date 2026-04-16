import { toast } from 'sonner';
import { FolderSpaceDialog } from './ui/folder-space-dialog';
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
  const selectedParentLabel = (parentId: string) =>
    folderOptions.find((f) => f.id === parentId)?.label || 'Racine / Documents';

  return (
    <FolderSpaceDialog
      variant="folder"
      open={isOpen}
      onClose={onClose}
      mode={mode}
      folderOptions={folderOptions}
      defaultParentId={defaultParentId}
      inheritedTargeting={inheritedTargeting}
      folderToEdit={folderToEdit}
      onDeleteFolder={onDeleteFolder}
      onSave={({ name, parentId }) => {
        toast.success(mode === 'edit' ? 'Dossier mis à jour' : 'Dossier créé', {
          description: `${name} dans ${selectedParentLabel(parentId)}`,
        });
      }}
    />
  );
}
