import { motion } from 'motion/react';
import { Building2, User } from 'lucide-react';
import { HighlightText } from './HighlightText';

/**
 * OriginStructureCell - Affiche la structure d'origine de l'investissement
 * 
 * CAS D'USAGE :
 * 
 * 1. INDIVIDU (PP) INVESTIT EN DIRECT
 *    - Affiche : "Individual" + icône User
 *    - Exemple : Sophie Martin investit directement
 * 
 * 2. INDIVIDU (PP) INVESTIT VIA SA STRUCTURE
 *    - Affiche : Nom de la structure + icône Building2 (cliquable)
 *    - Exemple : Sophie Martin investit via "SCI Patrimoine Martin"
 * 
 * 3. ENTREPRISE (PM) INVESTIT EN DIRECT
 *    - Affiche : "Company" + icône Building2
 *    - Exemple : Alpha Group investit directement
 * 
 * 4. ENTREPRISE (PM) INVESTIT VIA UNE STRUCTURE
 *    - Affiche : Nom de la structure + icône Building2 (cliquable)
 *    - Exemple : Alpha Group investit via "Alpha Capital Holding"
 */

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
  // CAS 1: Investissement VIA une structure (Individu via Holding OU Entreprise via Structure)
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

  // CAS 2: Individu (PP) investit EN DIRECT (sans structure)
  if (contrepartie.type === 'individual') {
    return (
      <div className="flex items-center gap-2">
        <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 dark:text-gray-400">Individidual</span>
      </div>
    );
  }

  // CAS 3: Entreprise (PM) investit EN DIRECT (sans structure)
  return (
    <div className="flex items-center gap-2">
      <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
      <span className="text-xs text-gray-500 dark:text-gray-400">Company</span>
    </div>
  );
}
