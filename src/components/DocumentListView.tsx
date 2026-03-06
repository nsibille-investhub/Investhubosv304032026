import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Folder, 
  Eye, 
  Download, 
  MoreVertical,
  ChevronRight,
  File
} from 'lucide-react';
import { Document } from '../utils/documentMockData';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DocumentListViewProps {
  documents: Document[];
  currentFolder: Document | null;
  onDocumentClick: (doc: Document) => void;
  onFolderNavigate: (folderId: string, folderPath: string[]) => void;
  currentPath: string[];
}

export function DocumentListView({ 
  documents, 
  currentFolder, 
  onDocumentClick,
  onFolderNavigate,
  currentPath
}: DocumentListViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      {currentPath.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => onFolderNavigate(null as any, [])}
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

      {/* Table Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/30">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <div className="col-span-6">Nom</div>
          <div className="col-span-2">Ajouté le</div>
          <div className="col-span-2">Taille</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Folder className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Ce dossier est vide</p>
          </div>
        ) : (
          <>
            {/* Folders first */}
            {folders.map((folder) => {
              const Icon = getFileIcon(folder.type);
              const isHovered = hoveredId === folder.id;
              
              return (
                <motion.div
                  key={folder.id}
                  onMouseEnter={() => setHoveredId(folder.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  onClick={() => handleRowClick(folder)}
                  className="px-6 py-3 border-b border-gray-100 cursor-pointer transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {folder.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {folder.children?.length || 0} élément{(folder.children?.length || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
                        Dossier
                      </Badge>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{formatDate(folder.date)}</p>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">—</p>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentClick(folder);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </motion.button>
                      
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
                            Télécharger le dossier
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Then files */}
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              const isHovered = hoveredId === file.id;
              
              return (
                <motion.div
                  key={file.id}
                  onMouseEnter={() => setHoveredId(file.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                  onClick={() => handleRowClick(file)}
                  className="px-6 py-3 border-b border-gray-100 cursor-pointer transition-colors"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {file.type === 'pdf' ? 'PDF' : 'Document'}
                      </Badge>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{formatDate(file.date)}</p>
                    </div>
                    
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                    </div>
                    
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDocumentClick(file);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </motion.button>
                      
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
            {folders.length} dossier{folders.length > 1 ? 's' : ''} · {files.length} document{files.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
