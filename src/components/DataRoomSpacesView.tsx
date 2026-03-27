import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Folder, Settings, Users, Building2, Briefcase, Target, ArrowRight, Eye, Search, FileText, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';
import { getTreeForSpace, TreeNode } from '../utils/dataRoomTreeData';
import { Input } from './ui/input';

export interface GlobalSearchHit {
  id: string;
  name: string;
  type: 'folder' | 'file';
  pathSegments: string[];
  path: string;
  spaceId: string;
  spaceName: string;
}

interface DataRoomSpacesViewProps {
  spaces: DataRoomSpace[];
  onSpaceSelect: (space: DataRoomSpace) => void;
  onAddSpace: () => void;
  onMassUpload: () => void;
  onConfigureSpace: (space: DataRoomSpace) => void;
  onOpenBirdView?: () => void;
  onSearchResultSelect?: (result: GlobalSearchHit) => void;
}

export function DataRoomSpacesView({
  spaces,
  onSpaceSelect,
  onAddSpace,
  onMassUpload,
  onConfigureSpace,
  onOpenBirdView,
  onSearchResultSelect
}: DataRoomSpacesViewProps) {
  const [globalSearch, setGlobalSearch] = useState('');

  const getTargetIcon = (userTypes: string[]) => {
    if (userTypes.includes('Investisseur')) return Users;
    if (userTypes.includes('Participation')) return Building2;
    if (userTypes.includes('Partenaire')) return Briefcase;
    return Target;
  };

  const getTargetSummary = (space: DataRoomSpace) => {
    const parts: string[] = [];
    
    if (space.targeting.userTypes.length > 0) {
      parts.push(space.targeting.userTypes.join(', '));
    }
    
    if (space.targeting.segments.length > 0) {
      parts.push(space.targeting.segments.join(', '));
    }
    
    if (space.targeting.funds.length > 0) {
      parts.push(space.targeting.funds.join(', '));
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Aucun ciblage défini';
  };

  const flattenTree = (nodes: TreeNode[], space: DataRoomSpace, parentPath: string[] = []): GlobalSearchHit[] => {
    return nodes.flatMap((node) => {
      const pathParts = [...parentPath, node.name];
      const current: GlobalSearchHit = {
        id: node.id,
        name: node.name,
        type: node.type === 'folder' ? 'folder' : 'file',
        pathSegments: pathParts,
        path: pathParts.join(' / '),
        spaceId: space.id,
        spaceName: space.name,
      };

      const children = node.children ? flattenTree(node.children, space, pathParts) : [];
      return [current, ...children];
    });
  };

  const indexedContent = useMemo(() => {
    return spaces.flatMap((space) => {
      const tree = getTreeForSpace(space.id);
      return flattenTree(tree, space);
    });
  }, [spaces]);

  const normalizedQuery = globalSearch.trim().toLowerCase();
  const globalResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return indexedContent
      .filter((item) => {
        const haystack = `${item.name} ${item.path} ${item.spaceName}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
      .slice(0, 30);
  }, [indexedContent, normalizedQuery]);

  const matchedSpaceIds = useMemo(() => {
    if (!normalizedQuery) return new Set<string>();
    return new Set(globalResults.map((item) => item.spaceId));
  }, [globalResults, normalizedQuery]);

  const visibleSpaces = normalizedQuery
    ? spaces.filter((space) => matchedSpaceIds.has(space.id) || space.name.toLowerCase().includes(normalizedQuery))
    : spaces;

  return (
    <div className="flex-1 flex flex-col px-6 pb-6 bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 pt-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Espaces Data Room</h1>
            <p className="text-gray-500 mt-1">
              Sélectionnez un espace pour accéder aux documents et dossiers
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onOpenBirdView && (
              <Button
                onClick={onOpenBirdView}
                variant="outline"
                className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
              >
                <Eye className="w-4 h-4" />
                Bird View
              </Button>
            )}
            <Button
              onClick={onMassUpload}
              className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white hover:shadow-lg transition-all duration-300 gap-2"
            >
              <Plus className="w-4 h-4" />
              Import Massif
            </Button>
            <Button
              onClick={onAddSpace}
              className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvel espace
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Global Search Across Spaces */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-gray-200 bg-white p-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Recherche globale dans tous les espaces (documents et dossiers)"
            className="pl-10"
          />
        </div>

        {normalizedQuery && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">
              {globalResults.length} résultat{globalResults.length > 1 ? 's' : ''} trouvé{globalResults.length > 1 ? 's' : ''} dans {matchedSpaceIds.size} espace{matchedSpaceIds.size > 1 ? 's' : ''}
            </p>

            <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-100">
              {globalResults.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  Aucun document ou dossier trouvé pour « {globalSearch} ».
                </div>
              ) : (
                globalResults.map((result) => (
                  <button
                    key={`${result.spaceId}-${result.id}`}
                    onClick={() => {
                      if (onSearchResultSelect) {
                        onSearchResultSelect(result);
                      } else {
                        const space = spaces.find((s) => s.id === result.spaceId);
                        if (space) {
                          onSpaceSelect(space);
                        }
                      }
                    }}
                    className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left hover:bg-blue-50/60"
                  >
                    <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
                      {result.type === 'folder' ? <FolderOpen className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{result.name}</p>
                      <p className="truncate text-xs text-gray-500">{result.spaceName} · {result.path}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {result.type === 'folder' ? 'Dossier' : 'Document'}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {visibleSpaces.map((space, index) => {
          const TargetIcon = getTargetIcon(space.targeting.userTypes);
          
          return (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="group relative bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
            >
              {/* Header with gradient */}
              <div className="h-24 bg-white transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/[0.03]" />
                
                {/* Settings button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfigureSpace(space);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 -mt-10 relative">
                {/* Icon */}
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mb-4">
                  <Folder className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">
                  {space.name}
                </h3>

                {/* Targeting */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <TargetIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-2 text-xs">{getTargetSummary(space)}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{space.documentCount} documents</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>{space.folderCount} dossiers</span>
                  </div>
                </div>

                {/* Open Button */}
                <button
                  onClick={() => onSpaceSelect(space)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gray-900 text-white hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 transition-all group/btn"
                >
                  <span className="font-medium">Ouvrir l'espace</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {visibleSpaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Folder className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {normalizedQuery ? 'Aucun espace ne correspond à la recherche' : 'Aucun espace créé'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md">
            {normalizedQuery
              ? `Ajustez votre recherche globale « ${globalSearch} » ou videz le champ pour revoir tous les espaces.`
              : 'Créez votre premier espace pour organiser vos documents et contrôler l\'accès'}
          </p>
          <Button
            onClick={onAddSpace}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            Créer un espace
          </Button>
        </motion.div>
      )}
    </div>
  );
}
