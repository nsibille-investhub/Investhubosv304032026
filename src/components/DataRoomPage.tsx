import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DataRoomSpacesView } from './DataRoomSpacesView';
import { DataRoomSpaceConfigDialog } from './DataRoomSpaceConfigDialog';
import { DataRoomSpace, mockDataRoomSpaces } from '../utils/dataRoomSpacesData';
import { DocumentsPage } from './DocumentsPage';
import { BirdViewPage } from './BirdViewPage';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface DataRoomPageProps {
  onSpaceChange?: (space: DataRoomSpace | null) => void;
}

export function DataRoomPage({ onSpaceChange }: DataRoomPageProps) {
  const [dataRoomSpaces, setDataRoomSpaces] = useState<DataRoomSpace[]>(mockDataRoomSpaces);
  const [selectedSpace, setSelectedSpace] = useState<DataRoomSpace | null>(null);
  const [spaceConfigDialogOpen, setSpaceConfigDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<DataRoomSpace | null>(null);
  const [showBirdView, setShowBirdView] = useState(false);

  const handleSpaceSelect = (space: DataRoomSpace) => {
    setSelectedSpace(space);
    if (onSpaceChange) {
      onSpaceChange(space);
    }
    toast.success('Espace ouvert', {
      description: space.name
    });
  };

  const handleBackToSpaces = () => {
    setSelectedSpace(null);
    if (onSpaceChange) {
      onSpaceChange(null);
    }
  };

  const handleAddSpace = () => {
    setEditingSpace(null);
    setSpaceConfigDialogOpen(true);
  };

  const handleConfigureSpace = (space: DataRoomSpace) => {
    setEditingSpace(space);
    setSpaceConfigDialogOpen(true);
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

  const handleDeleteSpace = (spaceId: string) => {
    setDataRoomSpaces(prev => prev.filter(s => s.id !== spaceId));
    if (selectedSpace?.id === spaceId) {
      setSelectedSpace(dataRoomSpaces[0] || null);
    }
  };

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
              onAddSpace={handleAddSpace}
              onConfigureSpace={handleConfigureSpace}
              onOpenBirdView={() => setShowBirdView(true)}
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
            {/* Back button header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToSpaces}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour aux espaces
                </Button>
                <div className="h-4 w-px bg-gray-300" />
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedSpace.name}</h2>
                  <p className="text-xs text-gray-500">
                    {selectedSpace.documentCount} documents • {selectedSpace.folderCount} dossiers
                  </p>
                </div>
              </div>
            </div>

            {/* Documents Page */}
            <div className="flex-1 overflow-hidden px-6 pb-6">
              <DocumentsPage selectedSpace={selectedSpace} />
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
        onDelete={handleDeleteSpace}
      />
    </div>
  );
}