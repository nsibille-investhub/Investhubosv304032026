import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataRoomSpacesView, GlobalSearchHit } from './DataRoomSpacesView';
import { DataRoomSpaceConfigDialog } from './DataRoomSpaceConfigDialog';
import { SpaceDeleteDialog } from './SpaceDeleteDialog';
import { DataRoomSpace, mockDataRoomSpaces } from '../utils/dataRoomSpacesData';
import { DocumentsPage } from './DocumentsPage';
import { BirdViewPage } from './BirdViewPage';
import { toast } from 'sonner';
import { Folder, Users, Layers3, Landmark } from 'lucide-react';
import { Button } from './ui/button';
import { MassUploadWizard } from './MassUploadWizard';
import { getTreeForSpace, TreeNode } from '../utils/dataRoomTreeData';
import { useTranslation } from '../utils/languageContext';

interface DataRoomPageProps {
  onSpaceChange?: (space: DataRoomSpace | null) => void;
  /** Notifies the host when the multi-space mass-upload wizard opens/closes. */
  onMassUploadChange?: (open: boolean) => void;
  /** When this number changes, the page goes back to the spaces overview (used by the breadcrumb back). */
  backToSpacesSignal?: number;
}

export function DataRoomPage({ onSpaceChange, onMassUploadChange, backToSpacesSignal }: DataRoomPageProps) {
  const { t } = useTranslation();
  const [dataRoomSpaces, setDataRoomSpaces] = useState<DataRoomSpace[]>(mockDataRoomSpaces);
  const [selectedSpace, setSelectedSpace] = useState<DataRoomSpace | null>(null);
  const [spaceConfigDialogOpen, setSpaceConfigDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<DataRoomSpace | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<DataRoomSpace | null>(null);
  const [showBirdView, setShowBirdView] = useState(false);
  const [showMassUploadWizard, setShowMassUploadWizard] = useState(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<{
    itemId: string;
    itemType: 'folder' | 'file';
    itemName: string;
    pathSegments: string[];
  } | null>(null);

  const handleSpaceSelect = (space: DataRoomSpace) => {
    setSelectedSpace(space);
    setPendingNavigationTarget(null);
    if (onSpaceChange) {
      onSpaceChange(space);
    }
    toast.success(t('ged.toast.spaceOpened'), {
      description: space.name
    });
  };

  const handleGlobalResultSelect = (result: GlobalSearchHit) => {
    const targetSpace = dataRoomSpaces.find((space) => space.id === result.spaceId);
    if (!targetSpace) return;

    setSelectedSpace(targetSpace);
    setPendingNavigationTarget({
      itemId: result.id,
      itemType: result.type,
      itemName: result.name,
      pathSegments: result.pathSegments,
    });

    if (onSpaceChange) {
      onSpaceChange(targetSpace);
    }

    toast.success(t('ged.toast.resultOpened'), {
      description: `${result.name} · ${result.spaceName}`,
    });
  };

  const handleBackToSpaces = () => {
    setSelectedSpace(null);
    if (onSpaceChange) {
      onSpaceChange(null);
    }
  };

  // External back-to-spaces signal (e.g. clicked from the breadcrumb pill).
  useEffect(() => {
    if (backToSpacesSignal === undefined || backToSpacesSignal === 0) return;
    setSelectedSpace(null);
    setShowMassUploadWizard(false);
    onMassUploadChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backToSpacesSignal]);

  // Notify the host whenever the multi-space mass-upload wizard opens/closes.
  useEffect(() => {
    onMassUploadChange?.(showMassUploadWizard);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMassUploadWizard]);

  const handleAddSpace = () => {
    setEditingSpace(null);
    setSpaceConfigDialogOpen(true);
  };

  const handleConfigureSpace = (space: DataRoomSpace) => {
    setEditingSpace(space);
    setSpaceConfigDialogOpen(true);
  };

  const handleOpenMassUpload = () => {
    setShowMassUploadWizard(true);
  };

  const handleSaveSpace = (spaceData: Partial<DataRoomSpace>) => {
    if (spaceData.id) {
      // Edit existing space
      setDataRoomSpaces(prev =>
        prev.map(s => (s.id === spaceData.id ? { ...s, ...spaceData } as DataRoomSpace : s))
      );
    } else {
      // Add new space
      const newSpace: DataRoomSpace = {
        id: `space-${Date.now()}`,
        name: spaceData.name!,
        targeting: spaceData.targeting!,
        documentCount: 0,
        folderCount: 0
      };
      setDataRoomSpaces(prev => [...prev, newSpace]);
      setSelectedSpace(newSpace);
    }
  };

  const handleRequestDeleteSpace = (space: DataRoomSpace) => {
    setSpaceConfigDialogOpen(false);
    setEditingSpace(null);
    setSpaceToDelete(space);
  };

  const handleConfirmDeleteSpace = (spaceId: string, migrateToSpaceId: string | null) => {
    const removed = dataRoomSpaces.find((s) => s.id === spaceId);
    const target = migrateToSpaceId ? dataRoomSpaces.find((s) => s.id === migrateToSpaceId) : null;
    const movedDocs = migrateToSpaceId ? removed?.documentCount ?? 0 : 0;
    const movedFolders = migrateToSpaceId ? removed?.folderCount ?? 0 : 0;

    setDataRoomSpaces((prev) => {
      const next = prev
        .filter((s) => s.id !== spaceId)
        .map((s) =>
          migrateToSpaceId && s.id === migrateToSpaceId
            ? {
                ...s,
                documentCount: s.documentCount + movedDocs,
                folderCount: s.folderCount + movedFolders,
              }
            : s,
        );
      return next;
    });

    if (selectedSpace?.id === spaceId) {
      setSelectedSpace(null);
    }

    if (migrateToSpaceId && target && removed) {
      toast.success(t('ged.toast.spaceDeleted'), {
        description: t(movedDocs > 1 ? 'ged.toast.spaceReassignedMany' : 'ged.toast.spaceReassignedOne', {
          name: removed.name,
          count: movedDocs,
          target: target.name,
        }),
      });
    } else {
      toast.success(t('ged.toast.spaceDeleted'));
    }
  };

  const allFolderNames = useMemo(() => {
    const folders = new Set<string>();

    const collectFolderNames = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (node.type === 'folder') {
          folders.add(node.name);
          if (node.children?.length) {
            collectFolderNames(node.children);
          }
        }
      });
    };

    dataRoomSpaces.forEach((space) => {
      collectFolderNames(getTreeForSpace(space.id));
    });

    return Array.from(folders);
  }, [dataRoomSpaces]);

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">
        {showBirdView ? (
          /* Bird View */
          <motion.div
            key="bird-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <BirdViewPage onBack={() => setShowBirdView(false)} />
          </motion.div>
        ) : showMassUploadWizard ? (
          /* Multi-space Mass Upload View */
          <motion.div
            key="mass-upload-multi-space-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 py-3 border-b border-gray-200 bg-white">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{t('ged.dataRoom.massUpload.title')}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('ged.dataRoom.massUpload.subtitle')}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-hidden px-6 pb-6">
              <MassUploadWizard
                isOpen={showMassUploadWizard}
                onClose={() => setShowMassUploadWizard(false)}
                existingFolders={allFolderNames}
                inline
              />
            </div>
          </motion.div>
        ) : !selectedSpace ? (
          /* Spaces View */
          <motion.div
            key="spaces-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <DataRoomSpacesView
              spaces={dataRoomSpaces}
              onSpaceSelect={handleSpaceSelect}
              onSearchResultSelect={handleGlobalResultSelect}
              onAddSpace={handleAddSpace}
              onMassUpload={handleOpenMassUpload}
              onConfigureSpace={handleConfigureSpace}
            />
          </motion.div>
        ) : (
          /* Documents View */
          <motion.div
            key={`documents-view-${selectedSpace.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Space header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-white">

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: '#000E2B' }}
                >
                  <Folder className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg leading-tight font-semibold text-gray-900">{selectedSpace.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: '#6a7282' }}>
                    <span>{t('ged.dataRoom.spaceHeader.documentsAndFolders', { documents: selectedSpace.documentCount, folders: selectedSpace.folderCount })}</span>
                    {selectedSpace.targeting.userTypes.length > 0 && (
                      <>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {selectedSpace.targeting.userTypes
                            .map((ut) => t(`ged.dataRoom.folderSpaceDialog.userTypes.${ut}`))
                            .join(', ')}
                        </span>
                      </>
                    )}
                    {selectedSpace.targeting.segments.length > 0 && (
                      <>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <span className="flex items-center gap-1">
                          <Layers3 className="w-3 h-3" />
                          {t('ged.dataRoom.spaceHeader.segmentsPrefix')} {selectedSpace.targeting.segments.join(', ')}
                        </span>
                      </>
                    )}
                    {selectedSpace.targeting.funds.length > 0 && (
                      <>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <span className="flex items-center gap-1">
                          <Landmark className="w-3 h-3" />
                          {t('ged.dataRoom.spaceHeader.fundsPrefix')} {selectedSpace.targeting.funds.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Documents Page */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
              <DocumentsPage
                selectedSpace={selectedSpace}
                navigationTarget={pendingNavigationTarget}
                onNavigationHandled={() => setPendingNavigationTarget(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Space Config Dialog */}
      <DataRoomSpaceConfigDialog
        open={spaceConfigDialogOpen}
        onClose={() => {
          setSpaceConfigDialogOpen(false);
          setEditingSpace(null);
        }}
        space={editingSpace}
        onSave={handleSaveSpace}
        onRequestDelete={handleRequestDeleteSpace}
      />

      <SpaceDeleteDialog
        open={!!spaceToDelete}
        onClose={() => setSpaceToDelete(null)}
        space={spaceToDelete}
        spaces={dataRoomSpaces}
        onConfirm={handleConfirmDeleteSpace}
      />
    </div>
  );
}
