import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { Document } from '../utils/documentMockData';
import { useTranslation } from '../utils/languageContext';

export interface TreeHighlight {
  id: string;
  token: number;
}

interface DocumentTreeSidebarProps {
  documents: Document[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderPath: string[]) => void;
  searchTerm?: string;
  highlight?: TreeHighlight | null;
}

interface TreeItemProps {
  document: Document;
  level: number;
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderPath: string[]) => void;
  parentPath: string[];
  searchTerm: string;
  highlight?: TreeHighlight | null;
}

const containsFolder = (node: Document, folderId: string): boolean =>
  (node.children ?? []).some(
    (child) => child.type === 'folder' && (child.id === folderId || containsFolder(child, folderId)),
  );

function TreeItem({ document, level, currentFolderId, onFolderSelect, parentPath, searchTerm, highlight }: TreeItemProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const isActive = currentFolderId === document.id;
  const folderChildren = document.children?.filter(child => child.type === 'folder') || [];
  const itemCount = document.children?.length ?? 0;
  const containsCurrent = useMemo(
    () => (currentFolderId ? containsFolder(document, currentFolderId) : false),
    [document, currentFolderId],
  );

  useEffect(() => {
    if (containsCurrent) setIsExpanded(true);
  }, [containsCurrent]);

  const currentPath = [...parentPath, document.name];
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const hasSearchMatchInTree = (node: Document): boolean => {
    if (node.name.toLowerCase().includes(normalizedSearch)) return true;
    const children = node.children?.filter((child) => child.type === 'folder') || [];
    return children.some((child) => hasSearchMatchInTree(child));
  };

  const filteredChildren = normalizedSearch
    ? folderChildren.filter((child) => hasSearchMatchInTree(child))
    : folderChildren;

  const shouldShowItem = !normalizedSearch || document.name.toLowerCase().includes(normalizedSearch) || filteredChildren.length > 0;

  if (!shouldShowItem) return null;
  if (document.type !== 'folder') return null;

  const canExpand = filteredChildren.length > 0;
  const flashed = !!highlight && highlight.id === document.id;

  return (
    <motion.div layout="position" transition={{ duration: 0.3, ease: 'easeOut' }}>
      <motion.div
        key={flashed ? `flash-${highlight!.token}` : 'idle'}
        className="rounded-lg"
        initial={{ backgroundColor: flashed ? 'rgba(219, 234, 254, 1)' : 'rgba(219, 234, 254, 0)' }}
        animate={{ backgroundColor: 'rgba(219, 234, 254, 0)' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
      <motion.div
        whileHover={{ x: 2 }}
        onClick={() => {
          setIsExpanded(true);
          onFolderSelect(document.id, currentPath);
        }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors
          ${isActive
            ? 'font-medium'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px`, ...(isActive ? { backgroundColor: '#EEF1F7', color: '#000E2B' } : {}) }}
      >
        {canExpand ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setIsExpanded((open) => !open);
            }}
            aria-label={isExpanded ? t('ged.rank.tree.collapse') : t('ged.rank.tree.expand')}
            aria-expanded={isExpanded}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-700"
            style={{ margin: -4 }}
          >
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.span>
          </button>
        ) : (
          <div className="w-4 shrink-0" />
        )}

        {isExpanded && (isActive || canExpand) ? (
          <FolderOpen className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-gray-400'}`} style={isActive ? { color: '#000E2B' } : undefined} />
        ) : (
          <Folder className={`w-4 h-4 shrink-0 ${isActive ? '' : 'text-gray-400'}`} style={isActive ? { color: '#000E2B' } : undefined} />
        )}

        <span className="text-sm truncate flex-1">{document.name}</span>

        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
          {itemCount}
        </span>
      </motion.div>
      </motion.div>

      <AnimatePresence initial={false}>
        {isExpanded && canExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {filteredChildren.map((child) => (
              <TreeItem
                key={child.id}
                document={child}
                level={level + 1}
                currentFolderId={currentFolderId}
                onFolderSelect={onFolderSelect}
                parentPath={currentPath}
                searchTerm={searchTerm}
                highlight={highlight}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DocumentTreeSidebar({ documents, currentFolderId, onFolderSelect, searchTerm = '', highlight }: DocumentTreeSidebarProps) {
  const { t } = useTranslation();
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-3">
        {/* Root level */}
        <motion.div
          onClick={() => onFolderSelect(null, [])}
          className={`
            flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all
            ${currentFolderId === null
              ? 'font-medium'
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          style={currentFolderId === null ? { backgroundColor: '#EEF1F7', color: '#000E2B' } : undefined}
        >
          <Folder className={`w-4 h-4 ${currentFolderId === null ? '' : 'text-gray-400'}`} style={currentFolderId === null ? { color: '#000E2B' } : undefined} />
          <span className="text-sm flex-1">{t('ged.tree.allDocuments')}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {documents.length}
          </span>
        </motion.div>

        {/* Folders tree */}
        <div className="mt-1">
          {documents.map((doc) => (
            <TreeItem
              key={doc.id}
              document={doc}
              level={0}
              currentFolderId={currentFolderId}
              onFolderSelect={onFolderSelect}
              parentPath={[]}
              searchTerm={searchTerm}
              highlight={highlight}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
