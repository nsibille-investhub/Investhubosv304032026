import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Document } from '../utils/documentMockData';

interface DocumentTreeSidebarProps {
  documents: Document[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderPath: string[]) => void;
}

interface TreeItemProps {
  document: Document;
  level: number;
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null, folderPath: string[]) => void;
  parentPath: string[];
}

function TreeItem({ document, level, currentFolderId, onFolderSelect, parentPath }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level === 0); // Auto-expand first level
  const isActive = currentFolderId === document.id;
  const hasChildren = document.children && document.children.length > 0;
  const folderChildren = document.children?.filter(child => child.type === 'folder') || [];

  const currentPath = [...parentPath, document.name];

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
            ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 font-medium' 
            : 'text-gray-700 hover:bg-gray-100'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren && folderChildren.length > 0 ? (
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
          <FolderOpen className="w-4 h-4 text-blue-600" />
        ) : (
          <Folder className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
        )}
        
        <span className="text-sm truncate flex-1">{document.name}</span>
        
        {folderChildren.length > 0 && (
          <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            {folderChildren.length}
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && folderChildren.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {folderChildren.map((child) => (
              <TreeItem
                key={child.id}
                document={child}
                level={level + 1}
                currentFolderId={currentFolderId}
                onFolderSelect={onFolderSelect}
                parentPath={currentPath}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DocumentTreeSidebar({ documents, currentFolderId, onFolderSelect }: DocumentTreeSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        <h3 className="text-sm font-semibold text-gray-900">Arborescence</h3>
        <p className="text-xs text-gray-500 mt-0.5">Navigation des dossiers</p>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Root level */}
        <motion.div
          onClick={() => onFolderSelect(null, [])}
          className={`
            flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all
            ${currentFolderId === null 
              ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700 font-medium' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <Folder className={`w-4 h-4 ${currentFolderId === null ? 'text-blue-600' : 'text-gray-400'}`} />
          <span className="text-sm">Tous les documents</span>
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
            />
          ))}
        </div>
      </div>
    </div>
  );
}
