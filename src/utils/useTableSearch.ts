import { useState, useMemo } from 'react';

/**
 * Hook réutilisable pour la recherche multi-champs dans les tableaux
 * @param data - Tableau de données à filtrer
 * @param searchableFields - Liste des champs sur lesquels effectuer la recherche
 * @returns Données filtrées, terme de recherche, setter, et matches
 */
export function useTableSearch<T extends Record<string, any>>(
  data: T[],
  searchableFields: (keyof T | string)[]
) {
  const [searchTerm, setSearchTerm] = useState('');

  const { filteredData, searchMatches } = useMemo(() => {
    if (!searchTerm.trim()) {
      return { filteredData: data, searchMatches: new Map() };
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const matches = new Map<number, Set<string>>();
    
    const filtered = data.filter((item, index) => {
      const itemMatches = new Set<string>();
      let hasMatch = false;

      searchableFields.forEach((field) => {
        // Support for nested fields like "contrepartie.name"
        const fieldValue = getNestedValue(item, field as string);
        
        // Si le champ contient un tableau (comme structures), chercher dans chaque élément
        if (Array.isArray(fieldValue)) {
          fieldValue.forEach((arrayItem) => {
            // Si c'est un tableau d'objets, chercher dans les propriétés
            if (typeof arrayItem === 'object' && arrayItem !== null) {
              Object.values(arrayItem).forEach((value) => {
                if (value !== null && value !== undefined) {
                  const stringValue = String(value).toLowerCase();
                  if (stringValue.includes(lowerSearchTerm)) {
                    hasMatch = true;
                    itemMatches.add(field as string);
                  }
                }
              });
            } else {
              // Si c'est un tableau de primitives
              const stringValue = String(arrayItem).toLowerCase();
              if (stringValue.includes(lowerSearchTerm)) {
                hasMatch = true;
                itemMatches.add(field as string);
              }
            }
          });
        } else if (fieldValue !== null && fieldValue !== undefined) {
          const stringValue = String(fieldValue).toLowerCase();
          
          if (stringValue.includes(lowerSearchTerm)) {
            hasMatch = true;
            itemMatches.add(field as string);
          }
        }
      });

      if (hasMatch) {
        matches.set(item.id || index, itemMatches);
      }

      return hasMatch;
    });

    return { filteredData: filtered, searchMatches: matches };
  }, [data, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData,
    searchMatches,
    hasActiveSearch: searchTerm.trim().length > 0,
  };
}

/**
 * Récupère une valeur dans un objet en supportant les chemins imbriqués
 * Exemple: getNestedValue(obj, "contrepartie.name")
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Extrait les valeurs recherchables d'un objet selon les champs spécifiés
 * Utile pour créer un index de recherche
 */
export function extractSearchableText<T extends Record<string, any>>(
  item: T,
  fields: (keyof T | string)[]
): string {
  return fields
    .map((field) => {
      const value = getNestedValue(item, field as string);
      return value !== null && value !== undefined ? String(value) : '';
    })
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
