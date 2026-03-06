import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Package, ChevronRight, FileText } from 'lucide-react';
import { HighlightText } from './HighlightText';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from './ui/utils';
import { Badge } from './ui/badge';

interface ConventionProductsCardProps {
  produits: string[];
  searchTerm?: string;
}

interface GroupedProduct {
  fundName: string;
  parts: Array<{
    partName: string;
    isinCode: string;
    fullName: string;
  }>;
}

export function ConventionProductsCard({ produits, searchTerm = '' }: ConventionProductsCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Regrouper les produits par fonds
  const groupedProducts = useMemo(() => {
    const grouped = new Map<string, GroupedProduct>();
    
    produits.forEach(produit => {
      // Extraire le nom du fonds et le code ISIN
      const match = produit.match(/^(.+?)\s-\s(.+?)\s\(([A-Z0-9]+)\)$/);
      if (match) {
        const fundName = match[1];
        const partName = match[2];
        const isinCode = match[3];
        
        if (!grouped.has(fundName)) {
          grouped.set(fundName, {
            fundName,
            parts: []
          });
        }
        
        const group = grouped.get(fundName)!;
        group.parts.push({
          partName,
          isinCode,
          fullName: produit
        });
      } else {
        // Si le format ne correspond pas, on crée un groupe simple
        if (!grouped.has(produit)) {
          grouped.set(produit, {
            fundName: produit,
            parts: [{
              partName: produit,
              isinCode: '',
              fullName: produit
            }]
          });
        }
      }
    });
    
    return Array.from(grouped.values());
  }, [produits]);

  const totalParts = useMemo(() => {
    return produits.length;
  }, [produits]);

  if (!produits || produits.length === 0) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500 italic">-</span>
    );
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors group",
            "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
          )}
        >
          <Package className="w-3.5 h-3.5" />
          <span className="flex items-center gap-1">
            <span className="font-semibold">{groupedProducts.length}</span>
            <span>{groupedProducts.length === 1 ? 'fonds' : 'fonds'}</span>
            {totalParts !== groupedProducts.length && (
              <span className="text-indigo-600 dark:text-indigo-300">
                ({totalParts} {totalParts === 1 ? 'part' : 'parts'})
              </span>
            )}
          </span>
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[480px] p-0 max-h-[550px] overflow-auto" 
        align="start" 
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 text-indigo-600 dark:text-indigo-400"
            >
              <FileText className="w-4 h-4" />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Produits autorisés
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{groupedProducts.length} fonds</span>
                {' '}&middot;{' '}
                {totalParts} {totalParts === 1 ? 'part habilitée' : 'parts habilitées'}
              </p>
            </div>
          </div>

          {/* Liste des fonds groupés */}
          <div className="space-y-2.5">
            {groupedProducts.map((product, idx) => {
              return (
                <motion.div
                  key={product.fundName}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="p-3 rounded-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200"
                >
                  {/* En-tête du fonds */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        <HighlightText text={product.fundName} searchTerm={searchTerm} />
                      </h4>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {product.parts.length} {product.parts.length === 1 ? 'part habilitée' : 'parts habilitées'}
                      </p>
                    </div>
                    <Badge className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 text-[11px]">
                      {product.parts.length}
                    </Badge>
                  </div>

                  {/* Liste des parts pour ce fonds */}
                  <div className="space-y-2">
                    {product.parts.map((part, partIdx) => (
                      <div 
                        key={partIdx} 
                        className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
                        title={part.fullName}
                      >
                        {part.partName && part.isinCode ? (
                          <>
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-1.5 pl-2 border-l-2 border-indigo-300 dark:border-indigo-700">
                              <HighlightText text={part.partName} searchTerm={searchTerm} />
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-wide font-medium">
                                Code ISIN
                              </span>
                              <code className="text-[11px] font-mono bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                                {part.isinCode}
                              </code>
                            </div>
                          </>
                        ) : (
                          <p className="text-[11px] text-gray-600 dark:text-gray-400">
                            <HighlightText text={part.partName} searchTerm={searchTerm} />
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
