import { toast } from 'sonner';
import { FolderSpaceDialog } from './ui/folder-space-dialog';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';
import { useTranslation } from '../utils/languageContext';

interface DataRoomSpaceConfigDialogProps {
  open: boolean;
  onClose: () => void;
  space: DataRoomSpace | null;
  onSave: (space: Partial<DataRoomSpace>) => void;
  onRequestDelete?: (space: DataRoomSpace) => void;
}

export function DataRoomSpaceConfigDialog({
  open,
  onClose,
  space,
  onSave,
  onRequestDelete,
}: DataRoomSpaceConfigDialogProps) {
  const { t } = useTranslation();
  return (
    <FolderSpaceDialog
      variant="space"
      open={open}
      onClose={onClose}
      mode={space ? 'edit' : 'create'}
      space={space}
      onSaveSpace={(data) => {
        onSave(data);
        toast.success(space ? t('ged.toast.spaceUpdated') : t('ged.toast.spaceCreated'), {
          description: data.name,
        });
      }}
      onDeleteSpace={() => {
        if (space) onRequestDelete?.(space);
      }}
    />
  );
}
