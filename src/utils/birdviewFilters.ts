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
 * Filtre récursif pour ne garder que les documents nominatifs non
 * consultés. Un document est "consulté" dès qu'au moins un de ses
 * destinataires (l'investisseur lui-même ou un de ses contacts) l'a
 * vu/téléchargé/validé — i.e. engagement.viewedBy >= 1.
 *
 * Le filtre "non vus" ne garde donc que les documents nominatifs où
 * viewedBy === 0 (aucun destinataire ne l'a consulté).
 */
export function filterIncompleteNodes(node: DocumentNode): DocumentNode | null {
  // Si c'est un document
  if (node.type === 'document') {
    if (
      node.isNominatif &&
      node.engagement &&
      node.engagement.viewedBy === 0
    ) {
      return node; // Document nominatif non consulté : on le garde
    }
    return null; // Document non-nominatif, consulté, ou sans engagement : rejeté
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
