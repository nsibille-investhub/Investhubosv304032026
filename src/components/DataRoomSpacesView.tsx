import { motion } from 'motion/react';
import { Plus, Folder, Settings, Users, Building2, Briefcase, Target, ArrowRight, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';

interface DataRoomSpacesViewProps {
  spaces: DataRoomSpace[];
  onSpaceSelect: (space: DataRoomSpace) => void;
  onAddSpace: () => void;
  onMassUpload: () => void;
  onConfigureSpace: (space: DataRoomSpace) => void;
  onOpenBirdView?: () => void;
}

export function DataRoomSpacesView({
  spaces,
  onSpaceSelect,
  onAddSpace,
  onMassUpload,
  onConfigureSpace,
  onOpenBirdView
}: DataRoomSpacesViewProps) {

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

  return (
    <div className="flex-1 flex flex-col px-6 pb-6">
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

      {/* Spaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {spaces.map((space, index) => {
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
              <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />
                
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
      {spaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Folder className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun espace créé</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Créez votre premier espace pour organiser vos documents et contrôler l'accès
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
