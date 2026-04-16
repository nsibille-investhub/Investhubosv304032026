import { toast } from 'sonner';
import { FolderSpaceDialog } from './ui/folder-space-dialog';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';

interface DataRoomSpaceConfigDialogProps {
  open: boolean;
  onClose: () => void;
  space: DataRoomSpace | null;
  onSave: (space: Partial<DataRoomSpace>) => void;
  onDelete?: (spaceId: string) => void;
}

export function DataRoomSpaceConfigDialog({
  open,
  onClose,
  space,
  onSave,
  onDelete,
}: DataRoomSpaceConfigDialogProps) {
  return (
    <FolderSpaceDialog
      variant="space"
      open={open}
      onClose={onClose}
      mode={space ? 'edit' : 'create'}
      space={space}
      onSaveSpace={(data) => {
        onSave(data);
        toast.success(space ? 'Espace mis à jour' : 'Espace créé', {
          description: data.name,
        });
      }}
      onDeleteSpace={(spaceId) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer cet espace ?`)) {
          onDelete?.(spaceId);
          toast.success('Espace supprimé');
        }
      }}
    />
  );
}
