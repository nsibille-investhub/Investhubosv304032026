import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
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
  AlertTriangle,
  ShieldAlert,
  FileUp,
  Layers3,
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
import { Label } from './ui/label';
import { FolderSelectionTreeviewDropdown, FolderOption } from './DocumentAddModal';
import {
  collectDescendantDocuments,
  collectFolderIds,
  countDescendantDocuments,
  checkDestinationForDocs,
  normalizeInheritedRestrictions,
  type RestrictionsMap,
} from '../utils/folderDeletion';
import { useTranslation } from '../utils/languageContext';

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
  onImportToFolder?: (folder: Document) => void;
  onAddDocument?: () => void;
  onOpenWizard?: () => void;
  onDownloadAll?: () => void;
  onAddFolder?: () => void;
  onAddFolderFromFolder?: (folder: Document) => void;
  onEditFolder?: (folder: Document) => void;
  onDeleteFolder?: (folder: Document, migrateToFolderId: string | null) => void;
  onDuplicateFolder?: (folder: Document) => void;
  onDuplicateDocument?: (doc: Document) => void;
  folderInheritedRestrictions?: RestrictionsMap;
  folderOptions?: FolderOption[];
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
  onImportToFolder,
  onAddDocument,
  onOpenWizard,
  onAddFolder,
  onAddFolderFromFolder,
  onEditFolder,
  onDeleteFolder,
  onDuplicateFolder,
  onDuplicateDocument,
  folderInheritedRestrictions,
  folderOptions,
}: DocumentListViewProps) {
  const { t } = useTranslation();
  const tableGridClassName = 'document-list-grid';
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerDocument, setViewerDocument] = useState<Document | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState<Document | null>(null);
  const [migrationDestId, setMigrationDestId] = useState<string>('');
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!deleteFolderTarget) setMigrationDestId('');
  }, [deleteFolderTarget]);

  const compatibleDestinationOptions = useMemo<FolderOption[]>(() => {
    if (!deleteFolderTarget || !folderOptions) return [];

    const docs = collectDescendantDocuments(deleteFolderTarget);
    if (docs.length === 0) return [];

    const excludedIds = collectFolderIds(deleteFolderTarget);

    return folderOptions.filter((option) => {
      if (excludedIds.has(option.id)) return false;
      const inherited = normalizeInheritedRestrictions(
        option.id === 'root' ? undefined : folderInheritedRestrictions?.[option.id],
      );
      const { compatible } = checkDestinationForDocs(inherited, docs);
      return compatible;
    });
  }, [deleteFolderTarget, folderOptions, folderInheritedRestrictions]);

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
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onFolderNavigate(null, [])}
            className={`${currentPath.length === 0 ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
          >
            {t('ged.listView.breadcrumbRoot')}
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

      {/* Search below breadcrumb */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('ged.listView.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 h-10"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchTermChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={t('ged.listView.clearSearchAria')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onOpenWizard}>
            <FileUp className="w-4 h-4 mr-2" />
            {t('ged.listView.import')}
          </Button>
          <Button variant="secondary" size="sm" onClick={onAddFolder}>
            <Folder className="w-4 h-4 mr-2" />
            {t('ged.listView.addFolder')}
          </Button>
          <Button size="sm" onClick={onAddDocument} className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t('ged.listView.addDocument')}
          </Button>
        </div>
        {searchTerm.trim() && (
          <p className="mt-2 text-xs text-gray-500">
            {t(itemsToRender.length > 1 ? 'ged.listView.resultsCountMany' : 'ged.listView.resultsCountOne', { count: itemsToRender.length, path: currentPath.length > 0 ? currentPath.join(' / ') : t('ged.listView.breadcrumbRoot') })}
          </p>
        )}
      </div>

      {/* Table Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/30">
        <div className={`grid ${tableGridClassName} gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide`}>
          <div>{t('ged.listView.headers.name')}</div>
          <div>{t('ged.listView.headers.nature')}</div>
          <div>{t('ged.listView.headers.audience')}</div>
          <div>{t('ged.listView.headers.addedOn')}</div>
          <div>{t('ged.listView.headers.status')}</div>
          <div className="text-right">{t('ged.listView.headers.actions')}</div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {itemsToRender.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">{hasActiveSearch ? t('ged.listView.noResults') : t('ged.listView.emptyFolder')}</p>
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
                          <p className="text-xs text-gray-400 truncate">{(folder as any).__path.slice(0, -1).join(' / ') || t('ged.listView.root')}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {t((folder.children?.length || 0) > 1 ? 'ged.listView.folderCount' : 'ged.listView.folderCountOne', { count: folder.children?.length || 0 })}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Tag label={t('ged.listView.folderTag')} />
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
                        aria-label={t('ged.listView.actions.editFolderAria', { name: folder.name })}
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
                            {t('ged.listView.actions.addDocument')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              onImportToFolder?.(folder);
                            }}
                          >
                            <FileUp className="w-4 h-4 mr-2" />
                            {t('ged.listView.actions.importDocuments')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              onAddFolderFromFolder?.(folder);
                            }}
                          >
                            <Folder className="w-4 h-4 mr-2" />
                            {t('ged.listView.actions.addFolder')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(event) => {
                              event.stopPropagation();
                              onDuplicateFolder?.(folder);
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            {t('ged.listView.actions.duplicate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            {t('ged.listView.actions.downloadFolder')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteFolderTarget(folder);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('ged.listView.actions.deleteFolder')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Then files — batched documents are grouped under a banner with a single
                consolidated notification indicator. */}
            {(() => {
              const items = hasActiveSearch ? searchFiles : files;
              // Order so members of a batch sit contiguously, anchored at the first
              // member's position; standalone files keep their original order.
              const sorted: Document[] = [];
              const seenBatches = new Set<string>();
              for (const f of items) {
                if (f.batchId) {
                  if (seenBatches.has(f.batchId)) continue;
                  seenBatches.add(f.batchId);
                  for (const ff of items) if (ff.batchId === f.batchId) sorted.push(ff);
                } else {
                  sorted.push(f);
                }
              }
              let prevBatchId: string | undefined;
              return sorted.map((file) => {
              const Icon = getFileIcon(file.type);
              const isHovered = hoveredId === file.id;
              const showBatchBanner = !!file.batchId && file.batchId !== prevBatchId;
              const batchCount = showBatchBanner
                ? sorted.filter((x) => x.batchId === file.batchId).length
                : 0;
              const inBatch = !!file.batchId;
              prevBatchId = file.batchId;

              return (
                <Fragment key={file.id}>
                {showBatchBanner && (
                  <div className="px-6 py-2 border-b border-blue-200/60 bg-gradient-to-r from-blue-50 to-blue-50/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-100">
                        <Layers3 className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-blue-900 truncate">{file.batchName ?? 'Lot de documents'}</p>
                        <p className="text-[11px] text-blue-700/80">
                          {batchCount} document{batchCount > 1 ? 's' : ''} · 1 notification consolidée
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <motion.div
                  ref={(el) => { itemRefs.current[file.id] = el; }}
                  onMouseEnter={() => setHoveredId(file.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  onClick={() => handleRowClick(file)}
                  className={`px-6 py-3 border-b border-gray-100 cursor-pointer transition-colors ${focusedItemId === file.id ? 'bg-blue-50 ring-1 ring-inset ring-blue-300' : ''} ${inBatch ? 'bg-blue-50/20' : ''}`}
                >
                  <div className={`grid ${tableGridClassName} gap-4 items-center`}>
                    <div className="flex items-center gap-3">
                      {inBatch && (
                        <span className="text-blue-300 select-none" aria-hidden>└</span>
                      )}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEF1F7' }}>
                        <Icon className="w-4 h-4" style={{ color: '#000E2B' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        {hasActiveSearch && (file as any).__path && (
                          <p className="text-xs text-gray-400 truncate">{(file as any).__path.slice(0, -1).join(' / ') || t('ged.listView.root')}</p>
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
                          {t('ged.listView.status.published')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          {t('ged.listView.status.pending')}
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
                        aria-label={t('ged.listView.actions.openViewerAria', { name: file.name })}
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
                        aria-label={t('ged.listView.actions.editDocumentAria', { name: file.name })}
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
                            {t('ged.listView.actions.duplicate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            {t('ged.listView.actions.download')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleteTarget(file);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('ged.listView.actions.deleteDocument')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
                </Fragment>
              );
              });
            })()}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50/30">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {t((hasActiveSearch ? searchFolders.length : folders.length) > 1 ? 'ged.listView.footerFolders' : 'ged.listView.footerFoldersOne', { count: hasActiveSearch ? searchFolders.length : folders.length })} · {t((hasActiveSearch ? searchFiles.length : files.length) > 1 ? 'ged.listView.footerDocuments' : 'ged.listView.footerDocumentsOne', { count: hasActiveSearch ? searchFiles.length : files.length })}
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
                  {viewerDocument?.name || t('ged.listView.viewerTitle')}
                </h2>
                <button
                  type="button"
                  onClick={() => setViewerOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  aria-label={t('ged.listView.closeViewerAria')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {!viewerDocument ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-500">
                    {t('ged.listView.noDocumentToShow')}
                  </div>
                ) : (
                  <div className="h-full w-full bg-white">
                    <iframe
                      title={t('ged.listView.viewerTitleFor', { name: viewerDocument.name })}
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

      {/* Document delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ged.listView.deleteDocumentTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('ged.listView.deleteDocumentConfirm', { name: deleteTarget?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('ged.listView.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setDeleteTarget(null)}
            >
              {t('ged.listView.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Folder delete confirmation */}
      <AlertDialog open={!!deleteFolderTarget} onOpenChange={(open) => { if (!open) setDeleteFolderTarget(null); }}>
        <AlertDialogContent className="max-w-lg">
          {(() => {
            if (!deleteFolderTarget) return null;
            const documentCount = countDescendantDocuments(deleteFolderTarget);
            const isEmpty = documentCount === 0;
            const hasFolderOptions = !!folderOptions;
            const noCompatibleDestination = !isEmpty && hasFolderOptions && compatibleDestinationOptions.length === 0;

            return (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('ged.listView.deleteFolderTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {isEmpty
                      ? t('ged.listView.deleteFolderConfirmEmpty', { name: deleteFolderTarget.name })
                      : t(documentCount > 1 ? 'ged.listView.deleteFolderReassignMany' : 'ged.listView.deleteFolderReassignOne', { name: deleteFolderTarget.name, count: documentCount })}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {!isEmpty && hasFolderOptions && (
                  <div className="space-y-3 py-2">
                    {noCompatibleDestination ? (
                      <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                        <ShieldAlert className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                        <div className="text-sm text-amber-900">
                          {t('ged.listView.deleteFolderNoCompatible')}
                        </div>
                      </div>
                    ) : (
                      <>
                        <Label htmlFor="ds-folder-delete-target">
                          {t('ged.listView.deleteFolderTargetLabel')}
                        </Label>
                        <FolderSelectionTreeviewDropdown
                          value={migrationDestId}
                          onChange={setMigrationDestId}
                          folderOptions={compatibleDestinationOptions}
                        />
                        <div className="flex items-start gap-2 text-xs text-gray-500">
                          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                          <span>{t('ged.listView.deleteFolderRestrictionHint')}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <AlertDialogFooter>
                  <AlertDialogCancel>{t('ged.listView.cancel')}</AlertDialogCancel>
                  {isEmpty ? (
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => {
                        onDeleteFolder?.(deleteFolderTarget, null);
                        setDeleteFolderTarget(null);
                      }}
                    >
                      {t('ged.listView.delete')}
                    </AlertDialogAction>
                  ) : (
                    !noCompatibleDestination && (
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:pointer-events-none"
                        disabled={!migrationDestId}
                        onClick={() => {
                          if (!migrationDestId) return;
                          onDeleteFolder?.(deleteFolderTarget, migrationDestId);
                          setDeleteFolderTarget(null);
                        }}
                      >
                        {t('ged.listView.deleteFolderReassignCta')}
                      </AlertDialogAction>
                    )
                  )}
                </AlertDialogFooter>
              </>
            );
          })()}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
