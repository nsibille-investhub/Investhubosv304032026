import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Folder, Settings, Users, Building2, Briefcase, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { DataRoomSpace } from '../utils/dataRoomSpacesData';

interface DataRoomSpaceSelectorProps {
  spaces: DataRoomSpace[];
  selectedSpace: DataRoomSpace | null;
  onSpaceSelect: (space: DataRoomSpace) => void;
  onAddSpace: () => void;
  onConfigureSpace: (space: DataRoomSpace) => void;
}

export function DataRoomSpaceSelector({
  spaces,
  selectedSpace,
  onSpaceSelect,
  onAddSpace,
  onConfigureSpace
}: DataRoomSpaceSelectorProps) {

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
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Espaces</h3>
            <p className="text-xs text-gray-500 mt-0.5">Sélectionnez un espace pour accéder aux documents</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddSpace}
            className="gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouvel espace
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {spaces.map((space) => {
            const isSelected = selectedSpace?.id === space.id;
            const TargetIcon = getTargetIcon(space.targeting.userTypes);
            
            return (
              <motion.div
                key={space.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all cursor-pointer group",
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                )}
                onClick={() => onSpaceSelect(space)}
              >
                {/* Icon & Name */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isSelected
                          ? "bg-gradient-to-br from-blue-500 to-blue-600"
                          : "bg-gray-100 group-hover:bg-gray-200"
                      )}
                    >
                      <Folder
                        className={cn(
                          "w-5 h-5",
                          isSelected ? "text-white" : "text-gray-600"
                        )}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConfigureSpace(space);
                    }}
                    className={cn(
                      "p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100",
                      isSelected
                        ? "hover:bg-blue-100 text-blue-600"
                        : "hover:bg-gray-100 text-gray-400"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h4
                    className={cn(
                      "font-medium text-sm line-clamp-1",
                      isSelected ? "text-blue-900" : "text-gray-900"
                    )}
                  >
                    {space.name}
                  </h4>

                  {/* Targeting summary */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <TargetIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="line-clamp-1">{getTargetSummary(space)}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{space.documentCount} docs</span>
                    <span>•</span>
                    <span>{space.folderCount} dossiers</span>
                  </div>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selected-space"
                    className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}