import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { Document } from '../utils/documentMockData';
import { useTranslation } from '../utils/languageContext';

interface DocumentTreeSidebarProps {
  documents: Document[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderPath: string[]) => void;
  searchTerm?: string;
}

interface TreeItemProps {
  document: Document;
  level: number;
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderPath: string[]) => void;
  parentPath: string[];
  searchTerm: string;
}

function TreeItem({ document, level, currentFolderId, onFolderSelect, parentPath, searchTerm }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0); // Auto-expand first level
  const isActive = currentFolderId === document.id;
  const hasChildren = document.children && document.children.length > 0;
  const folderChildren = document.children?.filter(child => child.type === 'folder') || [];

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

  const handleClick = () => {
    if (document.type === 'folder') {
      setIsExpanded(!isExpanded);
      onFolderSelect(document.id, currentPath);
    }
  };

  if (document.type !== 'folder') return null;

  return (
    <div>
      <motion.div
        whileHover={{ x: 2 }}
        onClick={handleClick}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
          ${isActive
            ? 'font-medium'
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px`, ...(isActive ? { backgroundColor: '#EEF1F7', color: '#000E2B' } : {}) }}
      >
        {hasChildren && filteredChildren.length > 0 ? (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </motion.div>
        ) : (
          <div className="w-4" />
        )}

        {isExpanded && isActive ? (
          <FolderOpen className="w-4 h-4" style={{ color: '#000E2B' }} />
        ) : (
          <Folder className={`w-4 h-4 ${isActive ? '' : 'text-gray-400'}`} style={isActive ? { color: '#000E2B' } : undefined} />
        )}
        
        <span className="text-sm truncate flex-1">{document.name}</span>
        
        {folderChildren.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {folderChildren.length}
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && filteredChildren.length > 0 && (
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
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DocumentTreeSidebar({ documents, currentFolderId, onFolderSelect, searchTerm = '' }: DocumentTreeSidebarProps) {
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
          <span className="text-sm">{t('ged.tree.allDocuments')}</span>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
