import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Grid3x3,
  List,
  Download,
  Eye,
  FileText,
  Folder,
  ChevronDown,
  PackageOpen,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { DocumentExplorer } from './DocumentExplorer';
import { DocumentDetailPanel } from './DocumentDetailPanel';
import { FolderDetailPanel } from './FolderDetailPanel';
import { DocumentFilterBar } from './DocumentFilterBar';
import { DocumentTreeSidebar } from './DocumentTreeSidebar';
import { DocumentListView } from './DocumentListView';
import { Document, mockDocuments } from '../utils/documentMockData';
import { toast } from 'sonner';
import { ViewAsSelector } from './ViewAsSelector';
import { ViewAsInfoBanner } from './ViewAsInfoBanner';
import { Viewer, canViewFolder } from '../utils/viewersMockData';
import { MassUploadWizard } from './MassUploadWizard';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';
import { getTreeForSpace, TreeNode } from '../utils/dataRoomTreeData';
import { Input } from './ui/input';

type ViewMode = 'list' | 'grid';

interface DocumentsPageProps {
  selectedSpace: DataRoomSpace;
}

export function DocumentsPage({ selectedSpace }: DocumentsPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Document | null>(null);
  const [detailsTab, setDetailsTab] = useState<string>('details');
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedViewer, setSelectedViewer] = useState<Viewer | null>(null);
  
  // Navigation state
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderPath, setCurrentFolderPath] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Convert TreeNode to Document format
  const convertTreeToDocuments = (treeNodes: TreeNode[]): Document[] => {
    return treeNodes.map((node, index) => {
      // Parse the french date format (DD/MM/YYYY) to create a proper Date object
      let uploadedAt = new Date();
      if (node.date) {
        const [day, month, year] = node.date.split('/');
        uploadedAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
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
        children: node.children ? convertTreeToDocuments(node.children) : undefined,
        isRoot: false,
        target: {
          type: 'all',
          segments: [],
          investors: [],
          subscriptions: [],
          participations: []
        },
        access: {
          level: 'view' as const,
          watermark: false,
          downloadable: true,
          printable: true
        },
        path: '/',
        version: 1,
        uploadedAt: uploadedAt.toISOString(),
        uploadedBy: node.owner || 'Système',
        updatedAt: uploadedAt.toISOString()
      };
      return doc;
    });
  };

  // Get documents for the selected space
  const spaceDocuments: Document[] = useMemo(() => {
    const treeData = getTreeForSpace(selectedSpace.id);
    return convertTreeToDocuments(treeData);
  }, [selectedSpace.id]);

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

  // Filter documents based on selected viewer
  const filteredDocuments = useMemo(() => {
    if (!selectedViewer) {
      return spaceDocuments;
    }

    // Function to filter documents recursively
    const filterDocumentsRecursive = (docs: Document[]): Document[] => {
      return docs
        .map(doc => {
          // If it's a folder
          if (doc.type === 'folder') {
            // Check if viewer can access this folder
            const canAccess = doc.isRoot || canViewFolder(selectedViewer, doc.id);
            
            // Filter children recursively
            const filteredChildren = doc.children 
              ? filterDocumentsRecursive(doc.children)
              : [];
            
            // Only include folder if:
            // 1. Viewer can access it directly, OR
            // 2. It has visible children (and it's not root)
            if (canAccess || (filteredChildren.length > 0 && !doc.isRoot)) {
              return {
                ...doc,
                children: filteredChildren
              };
            }
            
            return null;
          }
          
          // For documents, include if parent folder is accessible
          // We'll handle this at the folder level
          return doc;
        })
        .filter(doc => doc !== null) as Document[];
    };

    return filterDocumentsRecursive(spaceDocuments);
  }, [selectedViewer, spaceDocuments]);

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

  // Calculate viewer stats
  const viewerStats = useMemo(() => {
    if (!selectedViewer) {
      return { visibleFolders: 0, hiddenFolders: 0, visibleDocs: 0 };
    }

    let totalFolders = 0;
    let visibleFolders = 0;
    let visibleDocs = 0;

    const countItems = (docs: Document[], filtered: Document[]) => {
      docs.forEach(doc => {
        if (doc.type === 'folder' && !doc.isRoot) {
          totalFolders++;
          
          // Check if this folder is in filtered results
          const isVisible = filtered.some(fd => {
            if (fd.id === doc.id) return true;
            if (fd.children) {
              return checkInChildren(fd.children, doc.id);
            }
            return false;
          });

          if (isVisible) {
            visibleFolders++;
          }
        } else if (doc.type !== 'folder') {
          // Count visible documents
          const isVisible = checkDocInFiltered(filtered, doc.id);
          if (isVisible) {
            visibleDocs++;
          }
        }

        if (doc.children) {
          countItems(doc.children, filtered);
        }
      });
    };

    const checkInChildren = (children: Document[], id: string): boolean => {
      return children.some(child => {
        if (child.id === id) return true;
        if (child.children) return checkInChildren(child.children, id);
        return false;
      });
    };

    const checkDocInFiltered = (docs: Document[], docId: string): boolean => {
      return docs.some(doc => {
        if (doc.id === docId) return true;
        if (doc.children) return checkDocInFiltered(doc.children, docId);
        return false;
      });
    };

    countItems(spaceDocuments, filteredDocuments);

    return {
      visibleFolders,
      hiddenFolders: totalFolders - visibleFolders,
      visibleDocs
    };
  }, [selectedViewer, filteredDocuments, spaceDocuments]);

  // Calculate stats from documents (excluding root)
  const stats = {
    totalDocuments: spaceDocuments.reduce((acc, doc) => {
      const countDocs = (d: Document): number => {
        let count = d.type !== 'folder' ? 1 : 0;
        if (d.children) {
          count += d.children.reduce((sum, child) => sum + countDocs(child), 0);
        }
        return count;
      };
      // Skip root folder in count
      if (doc.isRoot && doc.children) {
        return acc + doc.children.reduce((sum, child) => sum + countDocs(child), 0);
      }
      return acc + countDocs(doc);
    }, 0),
    totalFolders: spaceDocuments.reduce((acc, doc) => {
      const countFolders = (d: Document, skipRoot: boolean = false): number => {
        let count = d.type === 'folder' && !skipRoot ? 1 : 0;
        if (d.children) {
          count += d.children.reduce((sum, child) => sum + countFolders(child, false), 0);
        }
        return count;
      };
      // Skip root folder in count
      if (doc.isRoot && doc.children) {
        return acc + doc.children.reduce((sum, child) => sum + countFolders(child, false), 0);
      }
      return acc + countFolders(doc);
    }, 0),
    totalViews: spaceDocuments.reduce((acc, doc) => {
      const sumViews = (d: Document): number => {
        let sum = d.isRoot ? 0 : d.views;
        if (d.children) {
          sum += d.children.reduce((total, child) => total + sumViews(child), 0);
        }
        return sum;
      };
      return acc + sumViews(doc);
    }, 0),
    totalDownloads: spaceDocuments.reduce((acc, doc) => {
      const sumDownloads = (d: Document): number => {
        let sum = d.isRoot ? 0 : d.downloads;
        if (d.children) {
          sum += d.children.reduce((total, child) => total + sumDownloads(child), 0);
        }
        return sum;
      };
      return acc + sumDownloads(doc);
    }, 0),
  };

  return (
    <div className="flex-1 flex gap-4 min-w-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          flex: (selectedDocument || selectedFolder) ? '0 0 60%' : '1 1 100%'
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-w-0"
      >
        {/* Header with Stats */}
        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gérez et partagez vos documents de Data Room
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View As Selector */}
              <ViewAsSelector
                selectedViewer={selectedViewer}
                onViewerChange={(viewer) => {
                  setSelectedViewer(viewer);
                  if (viewer) {
                    toast.success('Mode vue investisseur activé', {
                      description: `Visualisation comme ${viewer.name}`
                    });
                  } else {
                    toast.info('Mode vue investisseur désactivé');
                  }
                }}
              />

              {/* Selection Count - Always visible */}
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{selectedCount}</span> sélectionné{selectedCount > 1 ? 's' : ''}
              </div>

              <div className="flex-1" />

              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                    <ChevronDown className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleDownloadAll}>
                    <PackageOpen className="w-4 h-4 mr-2" />
                    Tout télécharger (.zip)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportList}>
                    <FileText className="w-4 h-4 mr-2" />
                    Exporter la liste (.csv)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Import Wizard Button */}
              <Button 
                onClick={handleOpenWizard} 
                size="sm" 
                className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4 mr-2" />
                Import Massif
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200"
            >
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium">Documents</span>
              </div>
              <p className="text-xl font-semibold text-blue-900">{stats.totalDocuments}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/30 rounded-xl border border-amber-200"
            >
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <Folder className="w-4 h-4" />
                <span className="text-xs font-medium">Dossiers</span>
              </div>
              <p className="text-xl font-semibold text-amber-900">{stats.totalFolders}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border border-purple-200"
            >
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-xs font-medium">Vues totales</span>
              </div>
              <p className="text-xl font-semibold text-purple-900">{stats.totalViews.toLocaleString()}</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/30 rounded-xl border border-emerald-200"
            >
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <Download className="w-4 h-4" />
                <span className="text-xs font-medium">Téléchargements</span>
              </div>
              <p className="text-xl font-semibold text-emerald-900">{stats.totalDownloads.toLocaleString()}</p>
            </motion.div>
          </div>
        </div>

        {/* View As Info Banner */}
        <AnimatePresence>
          {selectedViewer && (
            <ViewAsInfoBanner
              viewer={selectedViewer}
              visibleFoldersCount={viewerStats.visibleFolders}
              hiddenFoldersCount={viewerStats.hiddenFolders}
              visibleDocsCount={viewerStats.visibleDocs}
            />
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un document"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
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
            />
          </div>
        </div>
      </motion.div>

      {/* Document Detail Panel */}
      <AnimatePresence>
        {selectedDocument && (
          <DocumentDetailPanel
            key={selectedDocument.id}
            document={selectedDocument}
            onClose={() => {
              setSelectedDocument(null);
              setDetailsTab('details');
            }}
            defaultTab={detailsTab}
          />
        )}
      </AnimatePresence>

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

      {/* Mass Upload Wizard */}
      <MassUploadWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        existingFolders={getAllFolderNames(spaceDocuments)}
      />
    </div>
  );
}