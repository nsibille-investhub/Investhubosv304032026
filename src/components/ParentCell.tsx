import React from 'react';
import { motion } from 'motion/react';
import { Building2, User } from 'lucide-react';
import { toast } from 'sonner';

interface Parent {
  type: 'Investor' | 'Partner' | 'Participation';
  name: string;
  entityType: 'Individual' | 'Corporate';
}

export function ParentCell({ parent }: { parent: Parent }) {
  const handleParentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Redirection vers la fiche parent', {
      description: `${parent.name}`,
    });
    // TODO: Navigation vers la fiche du parent
  };

  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleParentClick}
      className="inline-flex items-center gap-1.5 text-xs group"
    >
      <span className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0">
        {parent.entityType === 'Individual' ? (
          <User className="w-3 h-3" />
        ) : (
          <Building2 className="w-3 h-3" />
        )}
      </span>
      <span className="text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[150px] group-hover:underline">
        {parent.name}
      </span>
    </motion.button>
  );
}