import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DocumentExplorer } from './DocumentExplorer';
import { FolderDetailPanel } from './FolderDetailPanel';
import { DocumentFilterBar } from './DocumentFilterBar';
import { DocumentTreeSidebar } from './DocumentTreeSidebar';
import { DocumentListView } from './DocumentListView';
import { DocumentAddModal } from './DocumentAddModal';
import { AddFolderPopup } from './AddFolderPopup';
import { Document, DocumentCategory, mockDocuments } from '../utils/documentMockData';
import { toast } from 'sonner';
import { MassUploadWizard } from './MassUploadWizard';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';
import { getTreeForSpace, TreeNode } from '../utils/dataRoomTreeData';
import {
  collectDescendantDocuments,
  collectFolderIds,
  countDescendantDocuments,
  deleteFolderFromTree,
} from '../utils/folderDeletion';
import { useTranslation } from '../utils/languageContext';

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
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Document | null>(null);
  const [detailsTab, setDetailsTab] = useState<string>('details');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardOriginContext, setWizardOriginContext] = useState<{
    kind: 'folder' | 'space';
    id: string;
    name: string;
    pathLabel: string;
    spaceName?: string;
  } | null>(null);
  
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
  const convertTreeToDocuments = (
    treeNodes: TreeNode[],
    parentPath: string[] = [],
    inheritedGenericTargeting: boolean = false
  ): Document[] => {
    const primaryFund = selectedSpace.targeting.funds[0] || t('ged.dataRoom.spacesView.allFunds');
    const primarySegment = selectedSpace.targeting.segments[0] || 'Tous segments';
    const fileCategoryPool: DocumentCategory[] = [
      'capitalCall',
      'distribution',
      'quarterlyReport',
      'annualReport',
      'subscription',
      'kyc',
      'legal',
      'tax',
      'marketing',
      'other',
    ];

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
      const folderGetsGenericTargeting = node.type === 'folder';
      
      const doc: Document = {
        id: node.id,
        name: node.name,
        type: node.type,
        size: node.size || '0 KB',
        date: node.date || new Date().toLocaleDateString('fr-FR'),
        owner: node.owner || t('ged.documents.ownerSystem'),
        views: Math.floor(Math.random() * 100),
        downloads: Math.floor(Math.random() * 50),
        status: (node.type !== 'folder' && seed % 3 !== 0) ? 'draft' as const : 'published' as const,
        children: node.children
          ? convertTreeToDocuments(node.children, nextPath, inheritedGenericTargeting || folderGetsGenericTargeting)
          : undefined,
        isRoot: false,
        target: {
          type: node.type === 'folder'
            ? (folderGetsGenericTargeting ? 'segment' : 'all')
            : (isNominative ? 'investor' : genericTargetType),
          segments: node.type === 'folder'
            ? (folderGetsGenericTargeting && selectedSegment !== 'Tous segments' ? [selectedSegment] : [])
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
        uploadedBy: node.owner || t('ged.documents.ownerSystem'),
        updatedAt: uploadedAt.toISOString(),
        metadata: {
          fund: primaryFund,
          segments: selectedSegment !== 'Tous segments' ? [selectedSegment] : [],
        },
        documentCategory: node.type === 'folder'
          ? undefined
          : fileCategoryPool[seed % fileCategoryPool.length],
        navigatorTargeting: node.type === 'folder'
          ? (
              folderGetsGenericTargeting
                ? {
                    mode: 'generic',
                    fund: primaryFund,
                    shareClass: selectedShareClass,
                    segment: selectedSegment,
                  }
                : undefined
            )
          : (
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

  // Get documents for the selected space (stateful so deletes & reassignments persist
  // for the demo session; resets when the user switches spaces).
  const initialSpaceDocuments: Document[] = useMemo(() => {
    const treeData = getTreeForSpace(selectedSpace.id);
    return convertTreeToDocuments(treeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpace.id]);

  const [spaceDocuments, setSpaceDocuments] = useState<Document[]>(initialSpaceDocuments);

  useEffect(() => {
    setSpaceDocuments(initialSpaceDocuments);
  }, [initialSpaceDocuments]);

  const handleDeleteFolder = (folder: Document, migrateToFolderId: string | null) => {
    const docCount = countDescendantDocuments(folder);
    const docsToMigrate = migrateToFolderId ? collectDescendantDocuments(folder) : [];
    const removedFolderIds = collectFolderIds(folder);

    setSpaceDocuments((prev) => deleteFolderFromTree(prev, folder.id, migrateToFolderId, docsToMigrate));

    if (currentFolderId && removedFolderIds.has(currentFolderId)) {
      setCurrentFolderId(null);
      setCurrentFolderPath([]);
    }
    if (selectedFolder && removedFolderIds.has(selectedFolder.id)) {
      setSelectedFolder(null);
    }

    if (docCount === 0) {
      toast.success(t('ged.toast.folderDeleted'), {
        description: t('ged.toast.folderDeletedDesc', { name: folder.name }),
      });
    } else {
      const targetLabel =
        folderOptions.find((f) => f.id === migrateToFolderId)?.label ||
        t('ged.dataRoom.folderDefaults.root');
      toast.success(t('ged.toast.folderDeleted'), {
        description: t(docCount > 1 ? 'ged.toast.folderReassignedMany' : 'ged.toast.folderReassignedOne', {
          name: folder.name,
          count: docCount,
          target: targetLabel,
        }),
      });
    }
  };

  const handleDocumentClick = (doc: Document, openTab: string = 'details') => {
    if (doc.type === 'folder') {
      setSelectedFolder(doc);
      setSelectedDocument(null);
      setDetailsTab(openTab);
      toast.info(t('ged.toast.folderSelected'), {
        description: doc.name
      });
    } else {
      setSelectedDocument(doc);
      setSelectedFolder(null);
      setDetailsTab(openTab);
      toast.info(t('ged.toast.documentSelected'), {
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
    // Top-level Import button → space-level context
    setWizardOriginContext({
      kind: 'space',
      id: selectedSpace.id,
      name: selectedSpace.name,
      pathLabel: '/',
    });
    setWizardOpen(true);
  };

  const handleImportToFolder = (folder: Document) => {
    setWizardOriginContext({
      kind: 'folder',
      id: folder.id,
      name: folder.name,
      pathLabel: folder.path,
      spaceName: selectedSpace.name,
    });
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
    toast.success(t('ged.toast.downloadInProgress'), {
      description: t('ged.toast.archivePreparing')
    });
  };

  const handleExportList = () => {
    toast.success(t('ged.toast.exportSucceeded'), {
      description: t('ged.toast.listExported')
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

    toast.success(t('ged.toast.positionedOnResult'), {
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
    () => [{ id: 'root', label: t('ged.dataRoom.folderDefaults.root') }, ...buildFolderOptions(filteredDocuments)],
    [filteredDocuments, t]
  );

  const folderInheritedRestrictions = useMemo(() => {
    const map: Record<string, { fund?: string; segments?: string[]; shareClass?: string }> = {};
    const visit = (
      docs: Document[],
      parent: { fund?: string; segments: string[]; shareClass?: string }
    ) => {
      docs.forEach((doc) => {
        if (doc.type !== 'folder') return;
        const fund = parent.fund || doc.metadata?.fund;
        const segmentSet = new Set<string>(parent.segments);
        doc.metadata?.segments?.forEach((segment) => segmentSet.add(segment));
        const shareClass = parent.shareClass || doc.navigatorTargeting?.shareClass;
        const next = { fund, segments: Array.from(segmentSet), shareClass };
        map[doc.id] = {
          fund: next.fund,
          segments: next.segments,
          shareClass: next.shareClass,
        };
        if (doc.children?.length) visit(doc.children, next);
      });
    };
    visit(filteredDocuments, { segments: [] });
    return map;
  }, [filteredDocuments]);

  if (wizardOpen) {
    return (
      <div className="flex-1 min-h-0">
        <MassUploadWizard
          isOpen={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setWizardOriginContext(null);
          }}
          existingFolders={getAllFolderNames(spaceDocuments)}
          originContext={wizardOriginContext}
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
              onImportToFolder={handleImportToFolder}
              onAddDocument={() => openAddDocumentModal()}
              onOpenWizard={handleOpenWizard}
              onDownloadAll={handleDownloadAll}
              onAddFolder={() => openAddFolderPopup()}
              onAddFolderFromFolder={(folder) => openAddFolderPopup(folder.id)}
              onEditFolder={openEditFolderPopup}
              onDeleteFolder={handleDeleteFolder}
              folderInheritedRestrictions={folderInheritedRestrictions}
              folderOptions={folderOptions}
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
        folderInheritedRestrictions={folderInheritedRestrictions}
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
          const migrationTarget = folderOptions.find((folder) => folder.id === migrateToFolderId)?.label || t('ged.dataRoom.folderDefaults.targetFolder');
          toast.success(t('ged.toast.deletionSimulated'), {
            description: t('ged.toast.folderMigration', { id: folderId, target: migrationTarget }),
          });
        }}
      />

    </div>
  );
}
