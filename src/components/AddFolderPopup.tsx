import { toast } from 'sonner';
import { FolderSpaceDialog } from './ui/folder-space-dialog';
import { SpaceTargeting } from '../utils/dataRoomSpacesData';
import { useTranslation } from '../utils/languageContext';

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
  const { t } = useTranslation();
  const selectedParentLabel = (parentId: string) =>
    folderOptions.find((f) => f.id === parentId)?.label || t('ged.dataRoom.folderDefaults.root');

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
      onSave={({ name, parentId, targeting }) => {
        const segmentsInfo = targeting.segments.length > 0 ? ` · ${targeting.segments.length} segment(s)` : '';
        const fundInfo = targeting.funds.length > 0 ? ` · ${targeting.funds[0]}` : '';
        toast.success(mode === 'edit' ? t('ged.toast.folderUpdated') : t('ged.toast.folderCreated'), {
          description: `${name} · ${selectedParentLabel(parentId)}${segmentsInfo}${fundInfo}`,
        });
      }}
    />
  );
}
