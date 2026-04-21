import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronDown,
  File,
  FileText,
  Image,
  Video,
  Folder,
  FolderOpen,
  MoreVertical,
  Eye,
  Download,
  Share2,
  Edit,
  Archive,
  Copy,
  Trash2,
  Droplet,
  Lock,
  Users,
  TrendingUp,
  Building2,
  Plus,
  FolderPlus,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Document } from '../utils/documentMockData';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { AddDocumentDialog } from './AddDocumentDialog';
import { TargetingScopeBadge } from './TargetingScopeBadge';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { useTranslation } from '../utils/languageContext';

interface DocumentExplorerProps {
  documents: Document[];
  onDocumentClick: (doc: Document, openTab?: string) => void;
  compactMode?: boolean;
  onSelectionChange?: (count: number, items: Document[]) => void;
}

export function DocumentExplorer({ documents, onDocumentClick, compactMode, onSelectionChange }: DocumentExplorerProps) {
  const { t } = useTranslation();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root', 'cat-1', 'cat-2']));
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [allDocIds, setAllDocIds] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogType, setAddDialogType] = useState<'document' | 'folder'>('document');
  const [addDialogParent, setAddDialogParent] = useState<string>('');

  // Collect all document IDs on mount
  useEffect(() => {
    const collectIds = (docs: Document[]): string[] => {
      const ids: string[] = [];
      docs.forEach(doc => {
        ids.push(doc.id);
        if (doc.children && doc.children.length > 0) {
          ids.push(...collectIds(doc.children));
        }
      });
      return ids;
    };
    setAllDocIds(collectIds(documents));
  }, [documents]);

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  // Collect all folder IDs recursively at all levels (excluding root)
  const getAllFolderIds = (docs: Document[], excludeRoot = true): string[] => {
    const folderIds: string[] = [];
    
    const collectFolders = (items: Document[]) => {
      items.forEach(item => {
        // If it's a folder and not excluded
        if (item.type === 'folder' && (!excludeRoot || item.id !== 'root')) {
          folderIds.push(item.id);
        }
        
        // Recursively check children regardless of parent type
        if (item.children && item.children.length > 0) {
          collectFolders(item.children);
        }
      });
    };
    
    collectFolders(docs);
    return folderIds;
  };

  // Expand all folders at all depth levels (except root)
  const expandAll = () => {
    const allFolderIds = getAllFolderIds(documents);
    setExpandedFolders(new Set(['root', ...allFolderIds]));
    const count = allFolderIds.length;
    toast.success(t('ged.explorer.openedAllToast'), {
      description: t(count > 1 ? 'ged.explorer.openedAllDescMany' : 'ged.explorer.openedAllDesc', { count })
    });
  };

  // Collapse all folders (except root)
  const collapseAll = () => {
    setExpandedFolders(new Set(['root']));
    toast.success(t('ged.explorer.closedAllToast'));
  };

  // Get all children IDs recursively
  const getAllChildrenIds = (doc: Document): string[] => {
    const ids: string[] = [doc.id];
    if (doc.children && doc.children.length > 0) {
      doc.children.forEach(child => {
        ids.push(...getAllChildrenIds(child));
      });
    }
    return ids;
  };

  // Get selected documents objects
  const getSelectedDocuments = (selectedSet: Set<string>): Document[] => {
    const selected: Document[] = [];
    const findDocs = (docs: Document[]) => {
      docs.forEach(doc => {
        if (selectedSet.has(doc.id)) {
          selected.push(doc);
        }
        if (doc.children && doc.children.length > 0) {
          findDocs(doc.children);
        }
      });
    };
    findDocs(documents);
    return selected;
  };

  // Handle checkbox selection
  const handleCheckboxChange = (doc: Document, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    const affectedIds = getAllChildrenIds(doc);
    
    if (checked) {
      affectedIds.forEach(id => newSelected.add(id));
    } else {
      affectedIds.forEach(id => newSelected.delete(id));
    }
    
    setSelectedItems(newSelected);
    
    // Update parent with count and selected documents
    const selectedDocs = getSelectedDocuments(newSelected);
    onSelectionChange?.(newSelected.size, selectedDocs);
    
    const count = affectedIds.length;
    const descKey = checked
      ? (count > 1 ? 'ged.explorer.selectionAddedDescMany' : 'ged.explorer.selectionAddedDescOne')
      : (count > 1 ? 'ged.explorer.selectionRemovedDescMany' : 'ged.explorer.selectionRemovedDescOne');
    toast.success(checked ? t('ged.explorer.selectionAdded') : t('ged.explorer.selectionRemoved'), {
      description: t(descKey, { count })
    });
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(allDocIds);
      setSelectedItems(newSelected);
      const selectedDocs = getSelectedDocuments(newSelected);
      onSelectionChange?.(allDocIds.length, selectedDocs);
      toast.success(t('ged.explorer.allSelected'), {
        description: t('ged.explorer.allSelectedDesc', { count: allDocIds.length })
      });
    } else {
      setSelectedItems(new Set());
      onSelectionChange?.(0, []);
      toast.info(t('ged.explorer.selectionCleared'));
    }
  };

  // Check if item is selected (including partial selection for folders)
  const isItemSelected = (doc: Document): boolean => {
    return selectedItems.has(doc.id);
  };

  // Check if all items are selected
  const isAllSelected = (): boolean => {
    return allDocIds.length > 0 && allDocIds.every(id => selectedItems.has(id));
  };

  // Check if some (but not all) items are selected
  const isSomeSelected = (): boolean => {
    return selectedItems.size > 0 && !isAllSelected();
  };

  const getFileIcon = (type: string, isOpen: boolean = false) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'excel':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'word':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'image':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-pink-500" />;
      case 'folder':
        return isOpen ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-amber-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'investor':
        return <TrendingUp className="w-3 h-3" />;
      case 'distributor':
        return <Users className="w-3 h-3" />;
      case 'subscription':
        return <Building2 className="w-3 h-3" />;
      case 'participation':
        return <Building2 className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  const getTargetBadges = (doc: Document) => {
    const badges: JSX.Element[] = [];
    
    // Afficher le badge du fonds si défini dans metadata
    if (doc.metadata?.fund) {
      badges.push(
        <motion.div
          key="fund-metadata"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs border border-amber-200"
        >
          <Building2 className="w-3 h-3" />
          <span>{doc.metadata.fund}</span>
        </motion.div>
      );
    }
    
    // Afficher les segments si définis dans metadata
    if (doc.metadata?.segments && doc.metadata.segments.length > 0) {
      badges.push(
        <motion.div
          key="segment-metadata"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs border border-purple-200"
        >
          <TrendingUp className="w-3 h-3" />
          <span>{doc.metadata.segments[0]}</span>
          {doc.metadata.segments.length > 1 && (
            <Badge className="bg-purple-200 text-purple-800 px-1 py-0 text-[10px] ml-0.5">
              +{doc.metadata.segments.length - 1}
            </Badge>
          )}
        </motion.div>
      );
    }
    
    // Afficher "Tous" seulement si pas de restrictions dans metadata
    if (doc.target.type === 'all' && !doc.metadata?.fund && !doc.metadata?.segments) {
      badges.push(
        <motion.div
          key="all"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-200"
        >
          <Users className="w-3 h-3" />
          <span>{t('ged.explorer.targetAll')}</span>
        </motion.div>
      );
    }
    
    // Afficher les segments de target UNIQUEMENT s'ils ne sont pas déjà dans metadata.segments
    if (doc.target.segments && doc.target.segments.length > 0 && !doc.metadata?.segments) {
      badges.push(
        <motion.div
          key="segment"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs border border-purple-200"
        >
          <TrendingUp className="w-3 h-3" />
          <span>{doc.target.segments[0]}</span>
          {doc.target.segments.length > 1 && (
            <Badge className="bg-purple-200 text-purple-800 px-1 py-0 text-[10px] ml-0.5">
              +{doc.target.segments.length - 1}
            </Badge>
          )}
        </motion.div>
      );
    }
    
    if (doc.target.investors && doc.target.investors.length > 0) {
      badges.push(
        <motion.div
          key="investor"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-200"
        >
          <TrendingUp className="w-3 h-3" />
          <span className="truncate max-w-[120px]">{doc.target.investors[0]}</span>
          {doc.target.investors.length > 1 && (
            <Badge className="bg-blue-200 text-blue-800 px-1 py-0 text-[10px] ml-0.5">
              +{doc.target.investors.length - 1}
            </Badge>
          )}
        </motion.div>
      );
    }
    
    if (doc.target.subscriptions && doc.target.subscriptions.length > 0) {
      badges.push(
        <motion.div
          key="subscription"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs border border-emerald-200"
        >
          <Building2 className="w-3 h-3" />
          <span>{t('ged.explorer.targetSubscription')}</span>
          {doc.target.subscriptions.length > 1 && (
            <Badge className="bg-emerald-200 text-emerald-800 px-1 py-0 text-[10px] ml-0.5">
              +{doc.target.subscriptions.length - 1}
            </Badge>
          )}
        </motion.div>
      );
    }
    
    return badges.length > 0 ? badges : null;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
            {t('ged.explorer.statusPublished')}
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
            {t('ged.explorer.statusDraft')}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Count documents in folder recursively
  const countDocumentsInFolder = (doc: Document): number => {
    if (doc.type !== 'folder' || !doc.children) return 0;
    
    let count = 0;
    doc.children.forEach(child => {
      if (child.type !== 'folder') {
        count++;
      }
      if (child.children && child.children.length > 0) {
        count += countDocumentsInFolder(child);
      }
    });
    return count;
  };

  const renderDocument = (doc: Document, level: number = 0) => {
    const isFolder = doc.type === 'folder';
    const isExpanded = expandedFolders.has(doc.id);
    const hasChildren = doc.children && doc.children.length > 0;
    const isHovered = hoveredRow === doc.id;
    const isRoot = doc.isRoot === true;
    const docCount = isFolder && !isRoot ? countDocumentsInFolder(doc) : 0;

    return (
      <div key={doc.id}>
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          onMouseEnter={() => setHoveredRow(doc.id)}
          onMouseLeave={() => setHoveredRow(null)}
          className={`group flex items-center gap-3 py-3 pr-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 cursor-pointer border-b border-gray-50 ${
            isHovered ? 'bg-gradient-to-r from-blue-50/30 to-transparent' : ''
          } ${isItemSelected(doc) ? 'bg-blue-50/40' : ''}`}
        >
          {/* Left section with indentation - Checkbox + Expand + Name */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0"
            style={{ paddingLeft: `${16 + (level * 24)}px` }}
          >
            {/* Checkbox */}
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <Checkbox
                checked={isItemSelected(doc)}
                onCheckedChange={(checked) => handleCheckboxChange(doc, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Expand/Collapse Icon */}
            <div className="w-8 flex-shrink-0 flex items-center justify-center">
              {isFolder && hasChildren && (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(doc.id);
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </motion.div>
                </motion.button>
              )}
            </div>

            {/* File Icon & Name */}
            <div 
              className="flex items-center gap-2 flex-1 min-w-0"
              onClick={() => onDocumentClick(doc)}
            >
            <motion.div
              whileHover={{ scale: 1.1, rotate: isFolder ? 5 : 0 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="flex-shrink-0"
            >
              {getFileIcon(doc.type, isExpanded)}
            </motion.div>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span className={`text-sm truncate ${isFolder ? 'font-medium text-gray-900' : 'text-gray-700'} ${isRoot ? 'text-[#0066FF]' : ''}`}>
                  {doc.name}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" className="max-w-md">
                <p className="break-words">{doc.name}</p>
              </TooltipContent>
            </Tooltip>
            {isFolder && docCount > 0 && !isRoot && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex-shrink-0"
              >
                <Badge className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 border border-gray-300">
                  {docCount}
                </Badge>
              </motion.div>
            )}
            {isFolder && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="flex-shrink-0"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddDialogType('document');
                        setAddDialogParent(doc.path);
                        setAddDialogOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Nouveau document
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddDialogType('folder');
                        setAddDialogParent(doc.path);
                        setAddDialogOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4 mr-2 text-amber-600" />
                      Nouveau dossier
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
            {doc.isNew && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex-shrink-0"
              >
                <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0">NEW</Badge>
              </motion.div>
            )}
            </div>
          </div>

          {/* Right section - fixed columns without indentation */}
          {/* Targeting Scope Badge */}
          {!compactMode && (
            <div className="hidden lg:flex items-center justify-start gap-1 w-56 flex-shrink-0">
              <TargetingScopeBadge 
                document={doc} 
                onClick={() => onDocumentClick(doc, 'targeting')}
              />
            </div>
          )}

          {/* Size & Format */}
          {!compactMode && (
            <div className="hidden md:flex items-center w-24 flex-shrink-0">
              <span className="text-xs text-gray-500">{isFolder ? '-' : doc.size}</span>
            </div>
          )}

          {/* Status */}
          {!compactMode && (
            <div className="hidden xl:flex items-center w-28 flex-shrink-0">
              {getStatusBadge(doc.status)}
            </div>
          )}

          {/* Dernière modification */}
          {!compactMode && (
            <div className="hidden lg:flex items-center w-32 text-xs text-gray-500 flex-shrink-0">
              {new Date(doc.updatedAt).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              })}
            </div>
          )}

          {/* Actions - Always visible */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg transition-colors opacity-70 hover:opacity-100 hover:bg-gray-100"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!isFolder && (
                  <>
                    <DropdownMenuItem onClick={() => onDocumentClick(doc)}>
                      <Eye className="w-4 h-4 mr-2" />
                      {t('ged.explorer.actions.preview')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      {t('ged.explorer.actions.download')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isFolder && (
                  <>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Ajouter un document
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Folder className="w-4 h-4 mr-2" />
                      Ajouter un dossier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Renommer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Dupliquer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="w-4 h-4 mr-2" />
                  Archiver
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Render Children */}
        <AnimatePresence>
          {isFolder && isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {doc.children!.map((child) => renderDocument(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
    <div className="w-full">
      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide sticky top-0 z-10">
        {/* Checkbox column */}
        <div className="w-10 flex-shrink-0 flex items-center justify-center">
          <Checkbox
            checked={isAllSelected()}
            onCheckedChange={handleSelectAll}
            className={isSomeSelected() ? 'data-[state=checked]:bg-blue-400' : ''}
          />
        </div>
        
        {/* Expand/Icon column */}
        <div className="w-8 flex-shrink-0"></div>
        
        <div className="flex-1 min-w-0">{t('ged.explorer.headers.name')}</div>
        {!compactMode && (
          <>
            <div className="hidden lg:flex items-center w-56 flex-shrink-0">{t('ged.explorer.headers.targeting')}</div>
            <div className="hidden md:flex items-center w-24 flex-shrink-0">{t('ged.explorer.headers.size')}</div>
            <div className="hidden xl:flex items-center w-28 flex-shrink-0">{t('ged.explorer.headers.status')}</div>
            <div className="hidden lg:flex items-center w-32 flex-shrink-0">{t('ged.explorer.headers.updated')}</div>
            <div className="flex items-center w-24 flex-shrink-0">{t('ged.explorer.headers.actions')}</div>
          </>
        )}
        
        {/* Expand/Collapse All Buttons */}
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={expandAll}
                className="p-1.5 rounded-lg hover:bg-white transition-all duration-200 opacity-70 hover:opacity-100 group"
              >
                <Maximize2 className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>{t('ged.explorer.tooltips.expandAll')}</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={collapseAll}
                className="p-1.5 rounded-lg hover:bg-white transition-all duration-200 opacity-70 hover:opacity-100 group"
              >
                <Minimize2 className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>{t('ged.explorer.tooltips.collapseAll')}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Documents List */}
      <div className="divide-y divide-gray-100">
        {documents.map((doc) => renderDocument(doc))}
      </div>
    </div>

    {/* Add Document/Folder Dialog */}
    <AddDocumentDialog
      isOpen={addDialogOpen}
      onClose={() => setAddDialogOpen(false)}
      type={addDialogType}
      parentFolder={addDialogParent}
    />
  </TooltipProvider>
  );
}
