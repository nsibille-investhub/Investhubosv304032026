// Filtres pour Bird View

interface DocumentNode {
  id: string;
  name: string;
  type: 'space' | 'folder' | 'document';
  children?: DocumentNode[];
  isNominatif?: boolean;
  engagement?: {
    viewedBy: number;
    totalViewers: number;
  };
}

/**
 * Filtre récursif pour ne garder que les documents nominatifs non consultés
 * Un document nominatif est non consulté si viewedBy < totalViewers
 * Les documents non-nominatifs sont exclus du filtre
 */
export function filterIncompleteNodes(node: DocumentNode): DocumentNode | null {
  // Si c'est un document
  if (node.type === 'document') {
    // Ne garder que les documents nominatifs non consultés
    if (node.isNominatif && node.engagement && node.engagement.viewedBy < node.engagement.totalViewers) {
      return node; // Document nominatif non consulté : on le garde
    }
    return null; // Document non-nominatif ou consulté : on le rejette
  }

  // Si c'est un dossier ou un espace avec des enfants
  if (node.children) {
    // Filtrer récursivement les enfants
    const filteredChildren = node.children
      .map(child => filterIncompleteNodes(child))
      .filter((child): child is DocumentNode => child !== null);

    // Si au moins un enfant est incomplet, on garde ce nœud
    if (filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }
  }

  // Aucun enfant incomplet : on rejette ce nœud
  return null;
}

/**
 * Filtre un arbre complet pour ne garder que les documents incomplets
 */
export function filterTreeForIncomplete(tree: DocumentNode[]): DocumentNode[] {
  return tree
    .map(node => filterIncompleteNodes(node))
    .filter((node): node is DocumentNode => node !== null);
}
