import React from 'react';
import { motion } from 'motion/react';
import { Building2, User } from 'lucide-react';

import { useTranslation } from '../utils/languageContext';
import type { EntityParent } from '../utils/screeningMock';
import { openParentPage } from './entity-detail/entityDetailShared';

export function ParentCell({ parent }: { parent: EntityParent }) {
  const { t } = useTranslation();

  const handleParentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openParentPage(parent, t);
  };

  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleParentClick}
      title={t('complianceEntities.relations.openParent')}
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
