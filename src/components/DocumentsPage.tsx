import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentExplorer } from './DocumentExplorer';
import { FolderDetailPanel } from './FolderDetailPanel';
import { DocumentFilterBar } from './DocumentFilterBar';
import { DocumentTreeSidebar } from './DocumentTreeSidebar';
import { DocumentListView } from './DocumentListView';
import { DocumentAddModal } from './DocumentAddModal';
import { AddFolderPopup } from './AddFolderPopup';
import { Document, mockDocuments } from '../utils/documentMockData';
import { toast } from 'sonner';
import { MassUploadWizard } from './MassUploadWizard';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';
import { getTreeForSpace, TreeNode } from '../utils/dataRoomTreeData';

type ViewMode = 'list' | 'grid';

interface SearchResultItem {
  item: Document;
  path: string[];
}

interface DocumentsPageProps {
  selectedSpace: DataRoomSpace;
  navigationTarget?: {
    itemId: string;
    itemType: 'folder' | 'file';
    itemName: string;
    pathSegments: string[];
  } | null;
  onNavigationHandled?: () => void;
}

export function DocumentsPage({ selectedSpace, navigationTarget, onNavigationHandled }: DocumentsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Document | null>(null);
  const [detailsTab, setDetailsTab] = useState<string>('details');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  
  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null);
  const [addDocumentModalOpen, setAddDocumentModalOpen] = useState(false);
  const [addDocumentDefaultFolderId, setAddDocumentDefaultFolderId] = useState<string>('root');
  const [addFolderPopupOpen, setAddFolderPopupOpen] = useState(false);
  const [addFolderDefaultParentId, setAddFolderDefaultParentId] = useState<string>('root');
  const [folderBeingEdited, setFolderBeingEdited] = useState<Document | null>(null);

  const formatScopeValue = (values: string[], fallback: string) => (
    values.length > 0 ? values.join(', ') : fallback
  );

  const investorProfiles = [
    {
      id: 'i1',
      name: 'Jean Dupont',
      structure: 'Holding Dupont',
      subscription: 'SUB-001',
    },
    {
      id: 'i2',
      name: 'Marie Martin',
      structure: 'SCI Martin',
      subscription: 'SUB-002',
    },
    {
      id: 'i3',
      name: 'Thomas Petit',
      structure: 'Patrimoine Petit',
      subscription: 'SUB-003-C',
    },
    {
      id: 'i4',
      name: 'Sophie Bernard',
      structure: 'SAS Bernard Invest',
      subscription: 'SUB-004',
    },
  ];

  const shareClasses = ['Parts A', 'Parts I', 'Parts P'];

  const getSeedFromNode = (value: string) => (
    value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  );

  // Convert TreeNode to Document format
  const convertTreeToDocuments = (treeNodes: TreeNode[], parentPath: string[] = []): Document[] => {
    const primaryFund = selectedSpace.targeting.funds[0] || 'Tous fonds';
    const primarySegment = selectedSpace.targeting.segments[0] || 'Tous segments';

    return treeNodes.map((node) => {
      // Parse the french date format (DD/MM/YYYY) to create a proper Date object
      let uploadedAt = new Date();
      if (node.date) {
        const [day, month, year] = node.date.split('/');
        uploadedAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }

      const nextPath = [...parentPath, node.name];
      const seed = getSeedFromNode(node.id);
      const isNominative = node.type !== 'folder' && seed % 2 === 1;
      const profile = investorProfiles[seed % investorProfiles.length];
      const selectedShareClass = shareClasses[seed % shareClasses.length];
      const selectedSegment = selectedSpace.targeting.segments.length > 0
        ? selectedSpace.targeting.segments[seed % selectedSpace.targeting.segments.length]
        : primarySegment;
      const genericTargetType = selectedSegment && selectedSegment !== 'Tous segments' ? 'segment' : 'all';
      
      const doc: Document = {
        id: node.id,
        name: node.name,
        type: node.type,
        size: node.size || '0 KB',
        date: node.date || new Date().toLocaleDateString('fr-FR'),
        owner: node.owner || 'Système',
        views: Math.floor(Math.random() * 100),
        downloads: Math.floor(Math.random() * 50),
        status: 'published' as const,
        children: node.children ? convertTreeToDocuments(node.children, nextPath) : undefined,
        isRoot: false,
        target: {
          type: node.type === 'folder'
            ? 'all'
            : (isNominative ? 'investor' : genericTargetType),
          segments: node.type === 'folder'
            ? []
            : (isNominative ? [selectedSegment] : (genericTargetType === 'segment' ? [selectedSegment] : [])),
          investors: node.type === 'folder'
            ? []
            : (isNominative ? [profile.id] : []),
          subscriptions: node.type === 'folder'
            ? []
            : (isNominative ? [profile.subscription] : []),
          participations: []
        },
        access: {
          level: 'view' as const,
          watermark: false,
          downloadable: true,
          printable: true
        },
        path: `/${nextPath.join('/')}`,
        version: 1,
        uploadedAt: uploadedAt.toISOString(),
        uploadedBy: node.owner || 'Système',
        updatedAt: uploadedAt.toISOString(),
        metadata: {
          fund: primaryFund,
          segments: selectedSegment !== 'Tous segments' ? [selectedSegment] : [],
        },
        navigatorTargeting: node.type === 'folder' ? undefined : (
          !isNominative
            ? {
                mode: 'generic',
                fund: primaryFund,
                shareClass: selectedShareClass,
                segment: selectedSegment,
              }
            : {
                mode: 'nominative',
                investor: profile.name,
                structure: profile.structure,
                subscription: profile.subscription,
              }
        )
      };
      return doc;
    });
  };

  // Get documents for the selected space
  const spaceDocuments: Document[] = useMemo(() => {
    const treeData = getTreeForSpace(selectedSpace.id);
    return convertTreeToDocuments(treeData);
  }, [selectedSpace]);

  const handleDocumentClick = (doc: Document, openTab: string = 'details') => {
    if (doc.type === 'folder') {
      setSelectedFolder(doc);
      setSelectedDocument(null);
      setDetailsTab(openTab);
      toast.info('Dossier sélectionné', {
        description: doc.name
      });
    } else {
      setSelectedDocument(doc);
      setSelectedFolder(null);
      setDetailsTab(openTab);
      toast.info('Document sélectionné', {
        description: doc.name
      });
    }
  };

  // Get all folders for parent selection
  const getAllFolders = (docs: Document[]): Document[] => {
    const folders: Document[] = [];
    docs.forEach(doc => {
      if (doc.type === 'folder') {
        folders.push(doc);
        if (doc.children) {
          folders.push(...getAllFolders(doc.children));
        }
      }
    });
    return folders;
  };

  const handleOpenWizard = () => {
    setWizardOpen(true);
  };

  const openAddDocumentModal = (folderId?: string | null) => {
    setAddDocumentDefaultFolderId(folderId || currentFolder?.id || 'root');
    setAddDocumentModalOpen(true);
  };

  const openAddFolderPopup = (folderId?: string | null) => {
    setFolderBeingEdited(null);
    setAddFolderDefaultParentId(folderId || currentFolder?.id || 'root');
    setAddFolderPopupOpen(true);
  };

  const openEditFolderPopup = (folder: Document) => {
    setFolderBeingEdited(folder);
    setAddFolderDefaultParentId(folder.parentId || 'root');
    setAddFolderPopupOpen(true);
  };

  // Get existing folder names for the wizard
  const getAllFolderNames = (docs: Document[]): string[] => {
    const names: string[] = [];
    docs.forEach(doc => {
      if (doc.type === 'folder' && !doc.isRoot) {
        names.push(doc.name);
        if (doc.children) {
          names.push(...getAllFolderNames(doc.children));
        }
      }
    });
    return names;
  };

  const handleDownloadAll = () => {
    toast.success('Téléchargement en cours', {
      description: 'Préparation de l\'archive complète...'
    });
  };

  const handleExportList = () => {
    toast.success('Export réussi', {
      description: 'La liste a été exportée en CSV'
    });
  };

  const handleFilterChange = (filters: any[]) => {
    setActiveFilters(filters);
  };

  const filteredDocuments = useMemo(() => spaceDocuments, [spaceDocuments]);

  // Find current folder object
  const findFolderById = (docs: Document[], folderId: string | null): Document | null => {
    if (!folderId) return null;
    
    for (const doc of docs) {
      if (doc.id === folderId) return doc;
      if (doc.children) {
        const found = findFolderById(doc.children, folderId);
        if (found) return found;
      }
    }
    return null;
  };

  const currentFolder = currentFolderId ? findFolderById(filteredDocuments, currentFolderId) : null;

  const findById = (docs: Document[], id: string): Document | null => {
    for (const doc of docs) {
      if (doc.id === id) return doc;
      if (doc.children) {
        const found = findById(doc.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findFolderByPath = (docs: Document[], pathSegments: string[]): Document | null => {
    let currentDocs = docs;
    let currentFolderNode: Document | null = null;

    for (const segment of pathSegments) {
      const nextFolder = currentDocs.find((doc) => doc.type === 'folder' && doc.name === segment) || null;
      if (!nextFolder) return null;
      currentFolderNode = nextFolder;
      currentDocs = nextFolder.children || [];
    }

    return currentFolderNode;
  };

  useEffect(() => {
    if (!navigationTarget) return;

    const targetItem = findById(filteredDocuments, navigationTarget.itemId);
    if (!targetItem) {
      onNavigationHandled?.();
      return;
    }

    const parentPath = navigationTarget.pathSegments.slice(0, -1);
    const parentFolder = findFolderByPath(filteredDocuments, parentPath);

    setCurrentFolderId(parentFolder?.id || null);
    setCurrentFolderPath(parentPath);
    setFocusedItemId(targetItem.id);
    setSearchTerm('');

    if (navigationTarget.itemType === 'folder') {
      setSelectedFolder(targetItem);
      setSelectedDocument(null);
    } else {
      setSelectedDocument(targetItem);
      setSelectedFolder(null);
    }

    toast.success('Positionné sur le résultat', {
      description: navigationTarget.itemName,
    });

    onNavigationHandled?.();
  }, [navigationTarget, filteredDocuments, onNavigationHandled]);

  const collectSearchResults = (items: Document[], parentPath: string[] = []): SearchResultItem[] => {
    const results: SearchResultItem[] = [];
    for (const item of items) {
      const nextPath = [...parentPath, item.name];
      results.push({ item, path: nextPath });
      if (item.children?.length) {
        results.push(...collectSearchResults(item.children, nextPath));
      }
    }
    return results;
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const allSearchResults = useMemo(() => collectSearchResults(filteredDocuments), [filteredDocuments]);

  const scopedSearchResults = useMemo(() => {
    if (!normalizedSearchTerm) {
      return [];
    }

    const baseCollection = currentFolder
      ? collectSearchResults(currentFolder.children || [], currentFolderPath)
      : allSearchResults;

    return baseCollection.filter(({ item, path }) => {
      const haystack = `${item.name} ${path.join(' ')}`.toLowerCase();
      return haystack.includes(normalizedSearchTerm);
    });
  }, [normalizedSearchTerm, currentFolder, currentFolderPath, allSearchResults]);

  // Handle folder navigation from tree
  const handleFolderSelect = (folderId: string | null, folderPath: string[]) => {
    setCurrentFolderId(folderId);
    setCurrentFolderPath(folderPath);
  };

  // Handle folder navigation from list
  const handleFolderNavigate = (folderId: string | null, folderPath: string[]) => {
    setCurrentFolderId(folderId);
    setCurrentFolderPath(folderPath);
  };

  const buildFolderOptions = (docs: Document[], path: string[] = []): Array<{ id: string; label: string }> => {
    const options: Array<{ id: string; label: string }> = [];
    docs.forEach((doc) => {
      if (doc.type !== 'folder') return;
      const nextPath = [...path, doc.name];
      options.push({
        id: doc.id,
        label: nextPath.join(' / '),
      });
      if (doc.children?.length) {
        options.push(...buildFolderOptions(doc.children, nextPath));
      }
    });
    return options;
  };

  const folderOptions = useMemo(
    () => [{ id: 'root', label: 'Racine / Documents' }, ...buildFolderOptions(filteredDocuments)],
    [filteredDocuments]
  );

  if (wizardOpen) {
    return (
      <div className="flex-1 min-h-0">
        <MassUploadWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          existingFolders={getAllFolderNames(spaceDocuments)}
          inline
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-4 min-w-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          flex: selectedFolder ? '0 0 60%' : '1 1 100%'
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-w-0"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedSpace.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedSpace.documentCount} documents • {selectedSpace.folderCount} dossiers
              </p>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                <p>
                  <span className="font-medium text-gray-700">Type :</span>{' '}
                  {selectedSpace.targeting.userTypes[0] || 'Investisseur'}
                </p>
                {selectedSpace.targeting.segments.length > 0 && (
                  <p>
                    <span className="font-medium text-gray-700">Segments :</span>{' '}
                    {selectedSpace.targeting.segments.join(', ')}
                  </p>
                )}
                <p>
                  <span className="font-medium text-gray-700">Fonds :</span>{' '}
                  {formatScopeValue(selectedSpace.targeting.funds, 'Tous fonds')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-1" />
            </div>
          </div>
        </div>

        {/* Double Navigation Layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Tree Navigation */}
          <div className="w-64 flex-shrink-0">
            <DocumentTreeSidebar
              documents={filteredDocuments}
              currentFolderId={currentFolderId}
              onFolderSelect={handleFolderSelect}
              searchTerm={searchTerm}
            />
          </div>

          {/* Right: Document List */}
          <div className="flex-1 flex flex-col min-w-0">
            <DocumentListView
              documents={filteredDocuments}
              currentFolder={currentFolder}
              onDocumentClick={handleDocumentClick}
              onFolderNavigate={handleFolderNavigate}
              currentPath={currentFolderPath}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              searchResults={scopedSearchResults}
              focusedItemId={focusedItemId}
              onAddDocumentFromFolder={(folder) => openAddDocumentModal(folder.id)}
              onAddDocument={() => openAddDocumentModal()}
              onOpenWizard={handleOpenWizard}
              onDownloadAll={handleDownloadAll}
              onAddFolder={() => openAddFolderPopup()}
              onAddFolderFromFolder={(folder) => openAddFolderPopup(folder.id)}
              onEditFolder={openEditFolderPopup}
              onDeleteFolder={openEditFolderPopup}
            />
          </div>
        </div>
      </motion.div>

      {/* Folder Detail Panel */}
      <AnimatePresence>
        {selectedFolder && (
          <FolderDetailPanel
            key={selectedFolder.id}
            folder={selectedFolder}
            onClose={() => {
              setSelectedFolder(null);
              setDetailsTab('details');
            }}
            allFolders={getAllFolders(spaceDocuments)}
          />
        )}
      </AnimatePresence>

      <DocumentAddModal
        isOpen={addDocumentModalOpen || !!selectedDocument}
        onClose={() => {
          setAddDocumentModalOpen(false);
          setSelectedDocument(null);
          setDetailsTab('details');
        }}
        folderOptions={folderOptions}
        defaultFolderId={addDocumentDefaultFolderId}
        document={selectedDocument}
      />
      <AddFolderPopup
        isOpen={addFolderPopupOpen}
        onClose={() => {
          setAddFolderPopupOpen(false);
          setFolderBeingEdited(null);
        }}
        folderOptions={folderOptions}
        defaultParentId={addFolderDefaultParentId}
        inheritedTargeting={selectedSpace.targeting}
        mode={folderBeingEdited ? 'edit' : 'create'}
        folderToEdit={folderBeingEdited ? { id: folderBeingEdited.id, name: folderBeingEdited.name } : null}
        onDeleteFolder={(folderId, migrateToFolderId) => {
          const migrationTarget = folderOptions.find((folder) => folder.id === migrateToFolderId)?.label || 'dossier cible';
          toast.success('Suppression simulée', {
            description: `Le dossier ${folderId} est migré vers ${migrationTarget}`,
          });
        }}
      />

    </div>
  );
}
