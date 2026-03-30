import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Folder, 
  Eye, 
  Download, 
  MoreVertical,
  ChevronRight,
  Search,
  X,
  Plus
} from 'lucide-react';
import { Document } from '../utils/documentMockData';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { DocumentTargetingMarker } from './DocumentTargetingMarker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';

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
  onDownloadAll,
  onAddFolder,
  onAddFolderFromFolder,
  onEditFolder,
  onDeleteFolder,
}: DocumentListViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
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

  const hasActiveSearch = searchTerm.trim().length > 0;
  const itemsToRender = hasActiveSearch
    ? searchResults.map((result) => ({ ...result.item, __path: result.path } as Document & { __path: string[] }))
    : currentItems;

  const searchFolders = itemsToRender.filter(item => item.type === 'folder');
  const searchFiles = itemsToRender.filter(item => item.type !== 'folder');

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
                    // Navigate to this level
                    const newPath = currentPath.slice(0, index + 1);
                    // Find the folder ID for this path
                    // For now, just show the current folder
                    onFolderNavigate(currentFolder?.id || null, newPath);
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
          <Button variant="outline" size="sm" onClick={onDownloadAll}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button size="sm" onClick={onOpenWizard} className="bg-gradient-to-r from-[#0066FF] to-[#0052CC]">
            <Plus className="w-4 h-4 mr-2" />
            Import Massif
          </Button>
          <Button variant="outline" size="sm" onClick={onAddDocument}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un document
          </Button>
          <Button variant="outline" size="sm" onClick={onAddFolder}>
            <Folder className="w-4 h-4 mr-2" />
            Ajouter un dossier
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
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div className="col-span-5">Nom</div>
          <div className="col-span-3">Ciblage</div>
          <div className="col-span-1">Ajouté le</div>
          <div className="col-span-1">Taille</div>
          <div className="col-span-2 text-right">Actions</div>
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
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center gap-3">
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
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        Dossier
                      </Badge>
                    </div>

                    <div className="col-span-3">
                      <p className="text-xs text-gray-400">—</p>
                    </div>
                    
                    <div className="col-span-1">
                      <p className="text-sm text-gray-600">{formatDate(folder.date)}</p>
                    </div>
                    
                    <div className="col-span-1">
                      <p className="text-sm text-gray-600">—</p>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end gap-2">
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
                              onEditFolder?.(folder);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
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
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
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

                    <div className="col-span-3 min-w-0">
                      <DocumentTargetingMarker document={file} />
                    </div>
                    
                    <div className="col-span-1">
                      <p className="text-sm text-gray-600">{formatDate(file.date)}</p>
                    </div>
                    
                    <div className="col-span-1">
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end gap-2">
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            Archiver document
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
    </div>
  );
}
