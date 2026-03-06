import { memo } from 'react';

interface HighlightTextProps {
  text: string;
  searchTerm: string;
  className?: string;
}

/**
 * Composant réutilisable pour surligner les termes de recherche dans un texte
 * Utilise memo pour optimiser les performances sur les grands tableaux
 */
export const HighlightText = memo(({ text, searchTerm, className = '' }: HighlightTextProps) => {
  if (!searchTerm.trim() || !text) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === searchTerm.toLowerCase();
        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 text-gray-900 rounded px-0.5 font-medium"
            style={{ backgroundColor: 'rgba(250, 204, 21, 0.4)' }}
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
});

HighlightText.displayName = 'HighlightText';

/**
 * Échappe les caractères spéciaux pour les regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Helper pour vérifier si un champ contient le terme de recherche
 */
export function fieldContainsSearch(
  value: any,
  searchTerm: string
): boolean {
  if (!searchTerm.trim() || value === null || value === undefined) {
    return false;
  }
  
  const stringValue = String(value).toLowerCase();
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return stringValue.includes(lowerSearchTerm);
}
