import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  FileText,
  Folder,
  Eye,
  Download,
  MoreVertical,
  ChevronRight,
  Search,
  X,
  Plus,
  Trash2,
  SquarePen,
  Copy,
} from 'lucide-react';
import { Document } from '../utils/documentMockData';
import { Button } from './ui/button';
import { DocumentTargetingMarker } from './DocumentTargetingMarker';
import { Tag } from './Tag';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

interface DocumentListViewProps {
  documents: Document[];
  currentFolder: Document | null;
  onDocumentClick: (doc: Document) => void;
  onFolderNavigate: (folderId: string | null, folderPath: string[]) => void;
  currentPath: string[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  searchResults?: Array<{ item: Document; path: string[] }>;
  focusedItemId?: string | null;
  onAddDocumentFromFolder?: (folder: Document) => void;
  onAddDocument?: () => void;
  onOpenWizard?: () => void;
  onDownloadAll?: () => void;
  onAddFolder?: () => void;
  onAddFolderFromFolder?: (folder: Document) => void;
  onEditFolder?: (folder: Document) => void;
  onDeleteFolder?: (folder: Document) => void;
  onDuplicateFolder?: (folder: Document) => void;
  onDuplicateDocument?: (doc: Document) => void;
}

export function DocumentListView({
  documents, 
  currentFolder, 
  onDocumentClick,
  onFolderNavigate,
  currentPath,
  searchTerm,
  onSearchTermChange,
  searchResults = [],
  focusedItemId = null,
  onAddDocumentFromFolder,
  onAddDocument,
  onOpenWizard,
  onAddFolder,
  onAddFolderFromFolder,
  onEditFolder,
  onDeleteFolder,
  onDuplicateFolder,
  onDuplicateDocument,
}: DocumentListViewProps) {
  const tableGridClassName = 'document-list-grid';
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get current level items
  const currentItems = currentFolder?.children || documents;
  
  // Separate folders and files
  const folders = currentItems.filter(item => item.type === 'folder');
  const files = currentItems.filter(item => item.type !== 'folder');

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatDate = (date: string) => {
    return date;
  };

  const getFileIcon = (type: string) => {
    if (type === 'folder') return Folder;
    return FileText;
  };

  const handleRowClick = (item: Document) => {
    if (item.type === 'folder') {
      onFolderNavigate(item.id, [...currentPath, item.name]);
    } else {
      onDocumentClick(item);
    }
  };

  const findFolderIdByPath = (path: string[]): string | null => {
    if (path.length === 0) return null;

    let currentLevel = documents;
    let currentFolder: Document | null = null;

    for (const segment of path) {
      const matchedFolder = currentLevel.find(
        (entry) => entry.type === 'folder' && entry.name === segment
      );

      if (!matchedFolder) return null;

      currentFolder = matchedFolder;
      currentLevel = matchedFolder.children || [];
    }

    return currentFolder?.id || null;
  };

  const hasActiveSearch = searchTerm.trim().length > 0;
  const itemsToRender = hasActiveSearch
    ? searchResults.map((result) => ({ ...result.item, __path: result.path } as Document & { __path: string[] }))
    : currentItems;

  const searchFolders = itemsToRender.filter(item => item.type === 'folder');
  const searchFiles = itemsToRender.filter(item => item.type !== 'folder');

  const defaultPreviewUrl = 'https://www.osureunion.fr/wp-content/uploads/2022/03/pdf-exemple.pdf#zoom=page-width';

  const openViewer = (file: Document) => {
    setViewerDocument(file);
    setViewerOpen(true);
  };

  useEffect(() => {
    if (!focusedItemId) return;
    const target = itemRefs.current[focusedItemId];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusedItemId, itemsToRender.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      {currentPath.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => onFolderNavigate(null, [])}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Documents
            </button>
            {currentPath.map((folder, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => {
                    const newPath = currentPath.slice(0, index + 1);
                    const targetFolderId = findFolderIdByPath(newPath);
                    onFolderNavigate(targetFolderId, newPath);
                  }}
                  className={`${
                    index === currentPath.length - 1
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  } transition-colors`}
                >
                  {folder}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search below breadcrumb */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher un document ou un dossier"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 h-10"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchTermChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onOpenWizard}>
            <Plus className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="secondary" size="sm" onClick={onAddFolder}>
            <Folder className="w-4 h-4 mr-2" />
            Ajouter un dossier
          </Button>
          <Button size="sm" onClick={onAddDocument} className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
        </div>
        {searchTerm.trim() && (
          <p className="mt-2 text-xs text-gray-500">
            {itemsToRender.length} résultat{itemsToRender.length > 1 ? 's' : ''} dans {currentPath.length > 0 ? currentPath.join(' / ') : 'Documents'}
          </p>
        )}
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/30">
        <div className={`grid ${tableGridClassName} gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide`}>
          <div>Nom</div>
          <div>Nature</div>
          <div>Audience</div>
          <div>Ajouté le</div>
          <div>Statut</div>
          <div className="text-right">Actions</div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {itemsToRender.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">{hasActiveSearch ? 'Aucun résultat trouvé' : 'Ce dossier est vide'}</p>
          </div>
        ) : (
          <>
            {/* Folders first */}
            {(hasActiveSearch ? searchFolders : folders).map((folder) => {
              const Icon = getFileIcon(folder.type);
              const isHovered = hoveredId === folder.id;
              
              return (
                <motion.div
                  key={folder.id}
                  ref={(el) => { itemRefs.current[folder.id] = el; }}
                  onMouseEnter={() => setHoveredId(folder.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  onClick={() => handleRowClick(folder)}
                  className={`px-6 py-3 border-b border-gray-100 cursor-pointer transition-colors ${focusedItemId === folder.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : ''}`}
                >
                  <div className={`grid ${tableGridClassName} gap-4 items-center`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {folder.name}
                        </p>
                        {hasActiveSearch && (folder as any).__path && (
                          <p className="text-xs text-gray-400 truncate">{(folder as any).__path.slice(0, -1).join(' / ') || 'Racine'}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {folder.children?.length || 0} élément{(folder.children?.length || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Tag label="Dossier" />
                    </div>

                    <div>
                      {folder.navigatorTargeting ? (
                        <DocumentTargetingMarker document={folder} mode="details" />
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">{formatDate(folder.date)}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">—</p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditFolder?.(folder);
                        }}
                        className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
                        style={isHovered ? { backgroundColor: '#EEF1F7', color: '#000E2B' } : undefined}
                        aria-label={`Modifier le dossier ${folder.name}`}
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              onAddDocumentFromFolder?.(folder);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter un document
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              onAddFolderFromFolder?.(folder);
                            }}
                          >
                            <Folder className="w-4 h-4 mr-2" />
                            Ajouter un dossier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              onDuplicateFolder?.(folder);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger le dossier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              onDeleteFolder?.(folder);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer le dossier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Then files */}
            {(hasActiveSearch ? searchFiles : files).map((file) => {
              const Icon = getFileIcon(file.type);
              const isHovered = hoveredId === file.id;
              
              return (
                <motion.div
                  key={file.id}
                  ref={(el) => { itemRefs.current[file.id] = el; }}
                  onMouseEnter={() => setHoveredId(file.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  onClick={() => handleRowClick(file)}
                  className={`px-6 py-3 border-b border-gray-100 cursor-pointer transition-colors ${focusedItemId === file.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : ''}`}
                >
                  <div className={`grid ${tableGridClassName} gap-4 items-center`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF1F7' }}>
                        <Icon className="w-4 h-4" style={{ color: '#000E2B' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        {hasActiveSearch && (file as any).__path && (
                          <p className="text-xs text-gray-400 truncate">{(file as any).__path.slice(0, -1).join(' / ') || 'Racine'}</p>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <DocumentTargetingMarker document={file} mode="tag" />
                    </div>

                    <div className="min-w-0">
                      <DocumentTargetingMarker document={file} mode="details" />
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">{formatDate(file.date)}</p>
                    </div>

                    <div>
                      {file.status === 'published' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          Publié
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          En Attente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openViewer(file);
                        }}
                        className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
                        style={isHovered ? { backgroundColor: '#EEF1F7', color: '#000E2B' } : undefined}
                        aria-label={`Ouvrir la visionneuse pour ${file.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDocumentClick(file);
                        }}
                        className="p-2 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
                        style={isHovered ? { backgroundColor: '#EEF1F7', color: '#000E2B' } : undefined}
                        aria-label={`Modifier le document ${file.name}`}
                      >
                        <SquarePen className="w-4 h-4" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              onDuplicateDocument?.(file);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteTarget(file);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer le document
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/30">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {(hasActiveSearch ? searchFolders.length : folders.length)} dossier{(hasActiveSearch ? searchFolders.length : folders.length) > 1 ? 's' : ''} · {(hasActiveSearch ? searchFiles.length : files.length)} document{(hasActiveSearch ? searchFiles.length : files.length) > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {viewerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/45 z-40"
              onClick={() => setViewerOpen(false)}
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              style={{ width: '70vw', minWidth: '70vw' }}
              className="fixed top-0 right-0 bottom-0 z-50 bg-white shadow-2xl border-l border-gray-200 flex flex-col"
            >
              <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">
                  {viewerDocument?.name || 'Document'}
                </h2>
                <button
                  type="button"
                  onClick={() => setViewerOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label="Fermer la visionneuse"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {!viewerDocument ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    Aucun document à afficher.
                  </div>
                ) : (
                  <div className="h-full w-full bg-white">
                    <iframe
                      title={`Visionneuse ${viewerDocument.name}`}
                      src={defaultPreviewUrl}
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le document</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer « {deleteTarget?.name} » ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setDeleteTarget(null)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
