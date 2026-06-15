import { motion } from 'motion/react';
import { Building2, User } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { useTranslation } from '../utils/languageContext';

interface OriginStructureCellProps {
  contrepartie: {
    name: string;
    type: 'individual' | 'corporate';
    structure?: string;
    investor?: string;
    investorType?: string;
  };
  searchTerm?: string;
  onStructureClick?: (structureName: string) => void;
}

export function OriginStructureCell({
  contrepartie,
  searchTerm = '',
  onStructureClick
}: OriginStructureCellProps) {
  const { t } = useTranslation();

  if (contrepartie.structure) {
    return (
      <motion.button
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          if (onStructureClick) {
            onStructureClick(contrepartie.structure!);
          }
        }}
        className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group max-w-[180px]"
      >
        <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
        <span className="truncate group-hover:underline">
          <HighlightText
            text={contrepartie.structure}
            searchTerm={searchTerm}
          />
        </span>
      </motion.button>
    );
  }

  if (contrepartie.type === 'individual') {
    return (
      <div className="flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{t('subscriptions.infoPopover.individual')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      <span className="text-xs text-gray-500 dark:text-gray-400">{t('subscriptions.infoPopover.corporate')}</span>
    </div>
  );
}
