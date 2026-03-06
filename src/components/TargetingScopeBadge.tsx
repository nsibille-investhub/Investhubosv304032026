import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Users, Building2, TrendingUp, FileSignature, ChevronRight } from 'lucide-react';
import { Document, mockDocuments } from '../utils/documentMockData';
import { availableInvestors, fundLabelMap } from '../utils/investorsMockData';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface TargetingScopeBadgeProps {
  document: Document;
  onClick?: () => void;
}

// Helper function to find a document/folder by ID in the tree
function findDocumentById(docs: Document[], id: string): Document | null {
  for (const doc of docs) {
    if (doc.id === id) return doc;
    if (doc.children) {
      const found = findDocumentById(doc.children, id);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to collect all inherited restrictions from parent chain
function collectInheritedRestrictions(document: Document): {
  inheritedFund: string | null;
  inheritedSegments: string[];
  allSegments: string[]; // For display purposes (union)
  hasConflict: boolean; // True if segments create an empty intersection
} {
  let inheritedFund: string | null = null;
  let inheritedSegments: string[] = [];
  const allSegmentsSet = new Set<string>();
  
  // Start from the document itself
  if (document.metadata?.fund) {
    inheritedFund = document.metadata.fund;
  }
  if (document.metadata?.segments && document.metadata.segments.length > 0) {
    inheritedSegments = [...document.metadata.segments];
    document.metadata.segments.forEach(s => allSegmentsSet.add(s));
  }
  
  // Walk up the parent chain
  let currentParentId = document.parentId;
  while (currentParentId && currentParentId !== 'root') {
    const parent = findDocumentById(mockDocuments, currentParentId);
    if (!parent) break;
    
    // Inherit fund if not already set
    if (!inheritedFund && parent.metadata?.fund) {
      inheritedFund = parent.metadata.fund;
    }
    
    // Collect all segments for display (union)
    if (parent.metadata?.segments && parent.metadata.segments.length > 0) {
      parent.metadata.segments.forEach(s => allSegmentsSet.add(s));
      
      // Calculate intersection for filtering (more restrictive)
      if (inheritedSegments.length > 0) {
        inheritedSegments = inheritedSegments.filter(s => 
          parent.metadata!.segments!.includes(s)
        );
      } else {
        inheritedSegments = [...parent.metadata.segments];
      }
    }
    
    currentParentId = parent.parentId;
  }
  
  const allSegments = Array.from(allSegmentsSet);
  
  // Detect conflict: if we have multiple segments but their intersection is empty
  const hasConflict = allSegments.length > 1 && inheritedSegments.length === 0;
  
  return { inheritedFund, inheritedSegments, allSegments, hasConflict };
}

export function TargetingScopeBadge({ document, onClick }: TargetingScopeBadgeProps) {
  // Calculer le scope réel basé sur les restrictions (incluant l'héritage)
  const scope = useMemo(() => {
    // Collecter les restrictions héritées de toute la chaîne de parents
    const { inheritedFund, inheritedSegments, allSegments, hasConflict } = collectInheritedRestrictions(document);
    
    let filteredInvestors = [];
    
    const hasFundRestriction = !!inheritedFund;
    const hasSegmentRestriction = inheritedSegments.length > 0 || allSegments.length > 0;

    // Commencer avec tous les investisseurs
    filteredInvestors = [...availableInvestors];
    
    // Appliquer les restrictions héritées (fonds + segments)
    if (hasFundRestriction) {
      filteredInvestors = filteredInvestors.filter(investor => investor.fund === inheritedFund);
    }
    
    // Utiliser inheritedSegments (intersection) pour le filtrage
    // Si hasConflict est true, inheritedSegments sera vide et filteredInvestors sera vide
    if (inheritedSegments.length > 0) {
      filteredInvestors = filteredInvestors.filter(investor => 
        inheritedSegments.includes(investor.segment)
      );
    } else if (hasConflict) {
      // Conflit détecté : intersection vide entre les segments
      filteredInvestors = [];
    }
    
    // Pour les documents (pas les dossiers), appliquer le ciblage spécifique
    if (document.type !== 'folder') {
      if (document.target.type === 'investor' && document.target.investors && document.target.investors.length > 0) {
        filteredInvestors = filteredInvestors.filter(investor => 
          document.target.investors!.includes(investor.name)
        );
      } else if (document.target.type === 'subscription' && document.target.subscriptions && document.target.subscriptions.length > 0) {
        // Pour les souscriptions, on garde le filtre actuel (pas de filtre supplémentaire sur les investisseurs)
        // Le nombre d'investisseurs reflète ceux qui ont ces souscriptions
      }
    }

    // Calculer le nombre total de contacts
    const totalContacts = filteredInvestors.reduce((sum, inv) => sum + inv.contacts.length, 0);

    return {
      investors: filteredInvestors,
      investorCount: filteredInvestors.length,
      contactCount: totalContacts,
      hasFundRestriction,
      hasSegmentRestriction,
      fundLabel: hasFundRestriction ? fundLabelMap[inheritedFund!] || inheritedFund : null,
      segments: allSegments.length > 0 ? allSegments : (document.target?.segments || []), // Use allSegments for display
      inheritedFund,
      inheritedSegments,
      allSegments,
      hasConflict,
    };
  }, [document]);

  // Déterminer les badges à afficher
  const badges = useMemo(() => {
    const result = [];
    
    // NIVEAU 1 : Badge Fonds (si restriction héritée)
    // S'affiche toujours si présent, car c'est une restriction sur tout le scope
    if (scope.hasFundRestriction && scope.fundLabel) {
      result.push({
        type: 'fund',
        label: scope.fundLabel,
        icon: Building2,
        color: 'amber'
      });
    }
    
    // NIVEAU 2 : Badge Segments (si restriction héritée ou directe)
    // S'affiche avec le Fonds car ce sont des restrictions complémentaires
    // Afficher TOUS les segments (allSegments) même en cas de conflit
    if (scope.hasSegmentRestriction && scope.segments && scope.segments.length > 0) {
      // Si conflit de segments, afficher chaque segment individuellement en rouge
      if (scope.hasConflict && scope.segments.length > 1) {
        scope.segments.forEach(segment => {
          result.push({
            type: 'segment',
            label: segment,
            icon: TrendingUp,
            color: 'purple',
            isConflict: true
          });
        });
      } else if (scope.segments.length === 1) {
        result.push({
          type: 'segment',
          label: scope.segments[0],
          icon: TrendingUp,
          color: 'purple'
        });
      } else {
        result.push({
          type: 'segment',
          label: `${scope.segments.length} segments`,
          icon: TrendingUp,
          color: 'purple'
        });
      }
    }
    
    // NIVEAU 3 : Ciblage spécifique (mutuellement exclusif)
    // Seulement pour les documents (pas les dossiers)
    if (document.type !== 'folder') {
      // Badge Investisseurs spécifiques (basé sur target.type)
      if (document.target.type === 'investor' && document.target.investors && document.target.investors.length > 0) {
        result.push({
          type: 'investor',
          label: document.target.investors.length > 1 ? `${document.target.investors.length} LPs` : 'LP',
          icon: Users,
          color: 'blue'
        });
      }
      // Badge Souscriptions (mutuellement exclusif avec Investisseurs)
      else if (document.target.type === 'subscription' && document.target.subscriptions && document.target.subscriptions.length > 0) {
        result.push({
          type: 'subscription',
          label: document.target.subscriptions.length.toString(),
          icon: FileSignature,
          color: 'emerald'
        });
      }
      // Badge Participation (si ce type existe)
      else if (document.target.type === 'participation' && document.target.participations && document.target.participations.length > 0) {
        result.push({
          type: 'participation',
          label: document.target.participations.length.toString(),
          icon: TrendingUp,
          color: 'indigo'
        });
      }
    }
    
    return result;
  }, [document, scope]);

  // Déterminer si on a un conflit
  // Un conflit peut survenir de 2 façons:
  // 1. Segments multiples avec intersection vide (scope.hasConflict)
  // 2. Restrictions qui ne correspondent à aucun investisseur
  const hasConflict = scope.hasConflict || (scope.investorCount === 0 && (scope.hasFundRestriction || scope.hasSegmentRestriction));
  
  if (hasConflict && scope.investorCount === 0) {
    return (
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs border border-red-200 hover:border-red-300 transition-all duration-200 cursor-pointer"
              >
                <Users className="w-3 h-3" />
                <span>Aucun LP</span>
              </motion.button>
            </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm bg-red-950 border-red-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-red-400" />
                <span className="font-semibold text-white">Conflit de ciblage</span>
              </div>
              <p className="text-xs text-red-200">
                Les restrictions appliquées ne correspondent à aucun investisseur.
              </p>
              
              {/* Afficher les règles en conflit */}
              <div className="pt-2 border-t border-red-800 space-y-1.5">
                {scope.hasFundRestriction && (
                  <div className="flex items-center gap-2 text-xs">
                    <Building2 className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span className="text-red-200">Fonds: {scope.fundLabel}</span>
                  </div>
                )}
                {scope.hasSegmentRestriction && scope.segments && (
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span className="text-red-200">Segment{scope.segments.length > 1 ? 's' : ''}: {scope.segments.join(', ')}</span>
                  </div>
                )}
              </div>
              
              <p className="text-[10px] text-red-300 pt-2 border-t border-red-800">
                💡 Vérifiez que les restrictions sont compatibles entre elles
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      </div>
    );
  }

  // Si aucune règle spécifique (tous les investisseurs)
  if (badges.length === 0) {
    return (
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onClick?.();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 rounded-md text-xs border border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group"
              >
                <Users className="w-3 h-3" />
                <span className="font-semibold">Tous ({scope.investorCount})</span>
                <ChevronRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-semibold">Scope: Tous les investisseurs</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
                <div className="text-xs">
                  <div className="text-gray-400">Limited Partners</div>
                  <div className="font-semibold text-white">{scope.investorCount} LP{scope.investorCount > 1 ? 's' : ''}</div>
                </div>
                <div className="text-xs">
                  <div className="text-gray-400">Contacts</div>
                  <div className="font-semibold text-white">{scope.contactCount} contact{scope.contactCount > 1 ? 's' : ''}</div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-700">
                Cliquez pour voir les détails
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      </div>
    );
  }

  // Afficher les badges composés
  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="inline-flex items-center gap-1.5 cursor-pointer group"
          >
            {badges.map((badge, index) => {
              const Icon = badge.icon;
              
              // Si ce badge a la propriété isConflict ou si hasConflict global, afficher en rouge
              const isRedBadge = (badge as any).isConflict || hasConflict;
              
              const colorClasses = isRedBadge ? {
                amber: 'bg-red-100 text-red-700 border-red-300 group-hover:bg-red-200 group-hover:border-red-400',
                purple: 'bg-red-100 text-red-700 border-red-300 group-hover:bg-red-200 group-hover:border-red-400',
                blue: 'bg-red-100 text-red-700 border-red-300 group-hover:bg-red-200 group-hover:border-red-400',
                emerald: 'bg-red-100 text-red-700 border-red-300 group-hover:bg-red-200 group-hover:border-red-400',
                indigo: 'bg-red-100 text-red-700 border-red-300 group-hover:bg-red-200 group-hover:border-red-400'
              } : {
                amber: 'bg-amber-100 text-amber-700 border-amber-300 group-hover:bg-amber-200 group-hover:border-amber-400',
                purple: 'bg-purple-100 text-purple-700 border-purple-300 group-hover:bg-purple-200 group-hover:border-purple-400',
                blue: 'bg-blue-100 text-blue-700 border-blue-300 group-hover:bg-blue-200 group-hover:border-blue-400',
                emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300 group-hover:bg-emerald-200 group-hover:border-emerald-400',
                indigo: 'bg-indigo-100 text-indigo-700 border-indigo-300 group-hover:bg-indigo-200 group-hover:border-indigo-400'
              };
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ y: -1 }}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border transition-all duration-200 ${colorClasses[badge.color as keyof typeof colorClasses]}`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="font-semibold">{badge.label}</span>
                </motion.div>
              );
            })}
            <motion.div
              animate={{ x: [0, 2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </motion.div>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm">
          <div className="space-y-3">
            {/* Titre */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">Scope de Ciblage</span>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700">
              <div className="text-xs">
                <div className="text-gray-400">Limited Partners</div>
                <div className="font-semibold text-white">{scope.investorCount} LP{scope.investorCount > 1 ? 's' : ''}</div>
              </div>
              <div className="text-xs">
                <div className="text-gray-400">Contacts</div>
                <div className="font-semibold text-white">{scope.contactCount} contact{scope.contactCount > 1 ? 's' : ''}</div>
              </div>
            </div>
            
            {/* Règles détaillées */}
            <div className="pt-2 border-t border-gray-700 space-y-2">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Règles appliquées
              </div>
              
              {/* Restrictions héritées */}
              {scope.hasFundRestriction && (
                <div className="flex items-start gap-2 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Fonds restreint</div>
                    <div className="text-gray-300">{scope.fundLabel}</div>
                  </div>
                </div>
              )}
              
              {scope.hasSegmentRestriction && scope.segments && scope.segments.length > 0 && (
                <div className="flex items-start gap-2 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Segment{scope.segments.length > 1 ? 's' : ''} restreint{scope.segments.length > 1 ? 's' : ''}</div>
                    <div className="text-gray-300">{scope.segments.join(', ')}</div>
                  </div>
                </div>
              )}
              
              {/* Ciblage spécifique (mutuellement exclusif) */}
              {document.type !== 'folder' && document.target.type === 'investor' && document.target.investors && document.target.investors.length > 0 && (
                <div className="flex items-start gap-2 text-xs">
                  <Users className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Investisseurs spécifiques</div>
                    <div className="text-gray-300">{document.target.investors.length} LP{document.target.investors.length > 1 ? 's' : ''} ciblé{document.target.investors.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              
              {document.type !== 'folder' && document.target.type === 'subscription' && document.target.subscriptions && document.target.subscriptions.length > 0 && (
                <div className="flex items-start gap-2 text-xs">
                  <FileSignature className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Souscriptions spécifiques</div>
                    <div className="text-gray-300">{document.target.subscriptions.length} souscription{document.target.subscriptions.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              
              {document.type !== 'folder' && document.target.type === 'participation' && document.target.participations && document.target.participations.length > 0 && (
                <div className="flex items-start gap-2 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-white">Participations spécifiques</div>
                    <div className="text-gray-300">{document.target.participations.length} participation{document.target.participations.length > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-[10px] text-gray-400 pt-2 border-t border-gray-700">
              Cliquez pour voir tous les détails et exporter
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    </div>
  );
}

// Export helper function to calculate scope (pour réutilisation)
export function calculateTargetingScope(document: Document) {
  // Collecter les restrictions héritées de toute la chaîne de parents
  const { inheritedFund, inheritedSegments, allSegments, hasConflict } = collectInheritedRestrictions(document);
  
  let filteredInvestors = [];

  const hasFundRestriction = !!inheritedFund;
  const hasSegmentRestriction = inheritedSegments.length > 0 || allSegments.length > 0;

  if (hasFundRestriction || inheritedSegments.length > 0) {
    filteredInvestors = availableInvestors.filter(investor => {
      let matches = true;
      
      if (hasFundRestriction) {
        matches = matches && investor.fund === inheritedFund;
      }
      
      if (inheritedSegments.length > 0) {
        matches = matches && inheritedSegments.includes(investor.segment);
      }
      
      return matches;
    });
  } else if (hasConflict) {
    // Conflit : intersection vide
    filteredInvestors = [];
  } else if (document.target.type === 'all') {
    filteredInvestors = [...availableInvestors];
  } else {
    if (document.target.segments && document.target.segments.length > 0) {
      filteredInvestors = availableInvestors.filter(investor => 
        document.target.segments!.includes(investor.segment)
      );
    } else if (document.target.investors && document.target.investors.length > 0) {
      filteredInvestors = availableInvestors.filter(investor => 
        document.target.investors!.includes(investor.name)
      );
    }
  }

  const totalContacts = filteredInvestors.reduce((sum, inv) => sum + inv.contacts.length, 0);

  return {
    investors: filteredInvestors,
    investorCount: filteredInvestors.length,
    contactCount: totalContacts,
    hasFundRestriction,
    hasSegmentRestriction,
    fundLabel: hasFundRestriction ? fundLabelMap[inheritedFund!] || inheritedFund : null,
    segments: allSegments.length > 0 ? allSegments : (document.target?.segments || []),
    inheritedFund,
    inheritedSegments,
    allSegments,
    hasConflict,
  };
}

// Export helper function pour télécharger le CSV
export function downloadTargetingScopeCSV(document: Document, scope: ReturnType<typeof calculateTargetingScope>) {
  const csvRows = [];
  csvRows.push(['Type', 'Nom', 'Email', 'Segment', 'Fonds', 'Rôle'].join(','));

  scope.investors.forEach(investor => {
    csvRows.push([
      'Investisseur',
      investor.name,
      investor.email,
      investor.segment,
      fundLabelMap[investor.fund] || investor.fund,
      '-'
    ].join(','));

    investor.contacts.forEach(contact => {
      csvRows.push([
        'Contact',
        contact.name,
        contact.email,
        investor.segment,
        fundLabelMap[investor.fund] || investor.fund,
        contact.role
      ].join(','));
    });
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = window.document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `ciblage_${document.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}