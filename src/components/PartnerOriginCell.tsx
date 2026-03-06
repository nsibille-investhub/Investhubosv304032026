import { motion } from 'motion/react';
import { Building, ArrowRight } from 'lucide-react';
import { HighlightText } from './HighlightText';

/**
 * PartnerOriginCell - Affiche le partenaire à l'origine de la souscription
 * 
 * CAS D'USAGE :
 * 
 * 1. SOUSCRIPTION DIRECTE (sans partenaire/CGP)
 *    - Affiche : "Direct" + icône ArrowRight (vert)
 *    - Exemple : L'investisseur a souscrit directement sans intermédiaire
 * 
 * 2. SOUSCRIPTION VIA PARTENAIRE (CGP/Distributeur)
 *    - Affiche : Nom du partenaire + icône Building (cliquable)
 *    - Exemple : Souscription via "Patrimoine Conseil & Associés"
 */

interface PartnerOriginCellProps {
  partenaire?: {
    name: string;
    id: string;
    type: 'corporate';
  } | null;
  searchTerm?: string;
  onPartnerClick?: (partnerId: string, partnerName: string) => void;
}

export function PartnerOriginCell({ 
  partenaire, 
  searchTerm = '',
  onPartnerClick 
}: PartnerOriginCellProps) {
  // CAS 1: Souscription DIRECTE (sans partenaire)
  if (!partenaire) {
    return (
      <div className="flex items-center gap-2">
        <ArrowRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 dark:text-gray-400">Direct</span>
      </div>
    );
  }

  // CAS 2: Souscription VIA un partenaire/CGP
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.stopPropagation();
        if (onPartnerClick) {
          onPartnerClick(partenaire.id, partenaire.name);
        }
      }}
      className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group max-w-[200px]"
    >
      <Building className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
      <span className="truncate group-hover:underline">
        <HighlightText 
          text={partenaire.name} 
          searchTerm={searchTerm}
        />
      </span>
    </motion.button>
  );
}
