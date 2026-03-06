import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';

interface SearchResultsIndicatorProps {
  totalResults: number;
  totalItems: number;
  searchTerm: string;
  onClear: () => void;
  className?: string;
}

/**
 * Composant pour afficher un indicateur visuel des résultats de recherche
 * Affiche le nombre de résultats trouvés et permet de clear la recherche
 */
export function SearchResultsIndicator({
  totalResults,
  totalItems,
  searchTerm,
  onClear,
  className = ''
}: SearchResultsIndicatorProps) {
  const hasActiveSearch = searchTerm.trim().length > 0;
  const isFiltered = totalResults !== totalItems;

  if (!hasActiveSearch) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg ${className}`}
      >
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-blue-600" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-900">
              {totalResults === 0 ? 'Aucun résultat' : `${totalResults} résultat${totalResults > 1 ? 's' : ''} trouvé${totalResults > 1 ? 's' : ''}`}
            </span>
            {isFiltered && (
              <span className="text-xs text-blue-600">
                pour "{searchTerm}" (sur {totalItems} items)
              </span>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClear}
          className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
          title="Effacer la recherche"
        >
          <X className="w-4 h-4 text-blue-600" />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Version compacte pour afficher uniquement dans la pagination
 */
export function InlineSearchIndicator({
  totalResults,
  totalItems,
  hasActiveSearch,
}: {
  totalResults: number;
  totalItems: number;
  hasActiveSearch: boolean;
}) {
  if (!hasActiveSearch || totalResults === totalItems) return null;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="ml-2 text-blue-600"
    >
      (filtré de {totalItems})
    </motion.span>
  );
}
