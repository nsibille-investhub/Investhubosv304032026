import { LucideIcon, FilterX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
  hasSearch: boolean;
  onReset?: () => void;
  icon: LucideIcon;
  entityName: string; // "investisseur", "partenaire", etc.
  entityNamePlural: string; // "investisseurs", "partenaires", etc.
}

export function EmptyState({ 
  hasFilters, 
  hasSearch, 
  onReset,
  icon: Icon,
  entityName,
  entityNamePlural
}: EmptyStateProps) {
  const isFiltered = hasFilters || hasSearch;

  return (
    <div className="flex items-center justify-center py-20 px-6">
      <div className="max-w-md text-center">
        {/* Icône */}
        <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
          {isFiltered ? (
            <FilterX className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          ) : (
            <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          )}
        </div>

        {/* Titre */}
        <h3 className="text-gray-900 dark:text-gray-100 mb-2">
          {isFiltered ? `Aucun ${entityName} trouvé` : `Aucun ${entityName}`}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {isFiltered ? (
            <>
              Les filtres appliqués ne correspondent à aucun {entityName} actuellement présent dans la base de données.
            </>
          ) : (
            <>
              Aucun {entityName} n'est enregistré dans la base de données.
            </>
          )}
        </p>

        {/* Bouton reset */}
        {isFiltered && onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
}
