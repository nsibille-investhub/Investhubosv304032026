import { motion } from 'motion/react';
import { Building2, ChevronRight, UserRound } from 'lucide-react';
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
      <div className="flex items-center gap-2 text-muted-foreground">
        <UserRound className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-sm">Direct</span>
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
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group max-w-[240px]"
    >
      <Building2 className="w-3.5 h-3.5 text-muted-foreground/80 group-hover:text-foreground/80 transition-colors flex-shrink-0" />
      <span className="truncate group-hover:underline text-left">
        <HighlightText 
          text={partenaire.name} 
          searchTerm={searchTerm}
        />
      </span>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground/80 transition-colors flex-shrink-0" />
    </motion.button>
  );
}
