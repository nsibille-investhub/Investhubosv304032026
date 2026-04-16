import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsRight,
  FileText,
  FolderOpen,
  User,
  X,
  CheckCircle2,
  Search,
  Landmark,
  Layers3,
  UserRound,
  Tag as TagIcon,
  Users,
  Globe,
  FileSearch
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  generateBirdviewEvents,
  generateBirdviewInvestors,
  BirdviewInvestor,
  BirdviewEvent
} from '../utils/birdviewGenerator';
import {
  generateDataRoomSpaces,
  DataRoomDocument,
  DataRoomFolder,
  DataRoomSpace
} from '../utils/birdviewDataRoomGenerator';
import { filterTreeForIncomplete } from '../utils/birdviewFilters';
import { Button } from './ui/button';
import { Tag } from './Tag';
import { cn } from './ui/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { DocumentActivityPanel } from './DocumentActivityPanel';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface BirdViewPageProps {
  onBack: () => void;
}

interface DocumentNode {
  id: string;
  name: string;
  type: 'space' | 'folder' | 'document';
  children?: DocumentNode[];
  size?: string;
  date?: string;
  format?: string;
  isNominatif?: boolean;
  stats?: {
    sent: number;
    opened: number;
    viewed: number;
    downloaded: number;
  };
  engagement?: {
    viewedBy: number;
    totalViewers: number;
  };
  // Restrictions
  fundRestriction?: string;
  shareClassRestriction?: string;
  segmentRestrictions?: string[];
  investorRestriction?: string;
  subscriptionRestriction?: string;
}

export function BirdViewPage({ onBack }: BirdViewPageProps) {
  const [events, setEvents] = useState<BirdviewEvent[]>([]);
  const [investors, setInvestors] = useState<BirdviewInvestor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showInvestorDropdown, setShowInvestorDropdown] = useState(false);
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; name: string; isNominatif: boolean } | null>(null);
  const [isActivityPanelOpen, setIsActivityPanelOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    name: string;
    format?: string;
    size?: string;
    date?: string;
  } | null>(null);
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);

  // Filtres avancés
  const [documentNameFilter, setDocumentNameFilter] = useState('');
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [subscriptionSearch, setSubscriptionSearch] = useState('');
  const [fundSearch, setFundSearch] = useState('');
  const [segmentSearch, setSegmentSearch] = useState('');

  // Charger les données
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const generatedEvents = generateBirdviewEvents(200);
      const generatedInvestors = generateBirdviewInvestors();
      setEvents(generatedEvents);
      setInvestors(generatedInvestors);
      setIsLoading(false);
      toast.success('Bird View chargé');
    }, 800);
  }, []);

  // Construire l'arbre de documents
  const documentTree = useMemo(() => {
    const realSpaces = generateDataRoomSpaces();
    
    const convertToDocumentNode = (item: DataRoomFolder | DataRoomDocument): DocumentNode => {
      if ('format' in item) {
        // C'est un document
        return {
          id: item.id,
          name: item.name,
          type: 'document',
          size: item.size,
          date: item.date,
          format: item.format,
          isNominatif: item.isNominatif,
          stats: item.stats,
          engagement: item.engagement,
          fundRestriction: item.fundRestriction,
          segmentRestrictions: item.segmentRestrictions,
          investorRestriction: item.investorRestriction,
          subscriptionRestriction: item.subscriptionRestriction,
        };
      } else {
        // C'est un dossier
        const children = item.children.map(convertToDocumentNode);

        return {
          id: item.id,
          name: item.name,
          type: 'folder',
          children,
          fundRestriction: item.fundRestriction,
          shareClassRestriction: item.shareClassRestriction,
          segmentRestrictions: item.segmentRestrictions,
        };
      }
    };

    return realSpaces.map(space => {
      const children = space.folders.map(convertToDocumentNode);

      return {
        id: space.id,
        name: space.name,
        type: 'space' as const,
        children,
        fundRestriction: space.fundRestriction,
        segmentRestrictions: space.segmentRestrictions,
      };
    });
  }, []);

  // Souscriptions disponibles (collectées depuis l'arbre de documents)
  const availableSubscriptions = useMemo(() => {
    const subs = new Set<string>();
    const collect = (nodes: DocumentNode[]) => {
      nodes.forEach(node => {
        if (node.type === 'document' && node.subscriptionRestriction) {
          subs.add(node.subscriptionRestriction);
        }
        if (node.children) collect(node.children);
      });
    };
    collect(documentTree);
    return Array.from(subs).sort();
  }, [documentTree]);

  // Fonds disponibles (collectés depuis l'arbre de documents)
  const availableFunds = useMemo(() => {
    const funds = new Set<string>();
    const collect = (nodes: DocumentNode[]) => {
      nodes.forEach(node => {
        if (node.fundRestriction) funds.add(node.fundRestriction);
        if (node.children) collect(node.children);
      });
    };
    collect(documentTree);
    return Array.from(funds).sort();
  }, [documentTree]);

  // Segments disponibles (collectés depuis l'arbre de documents)
  const availableSegments = useMemo(() => {
    const segments = new Set<string>();
    const collect = (nodes: DocumentNode[]) => {
      nodes.forEach(node => {
        node.segmentRestrictions?.forEach(s => segments.add(s));
        if (node.children) collect(node.children);
      });
    };
    collect(documentTree);
    return Array.from(segments).sort();
  }, [documentTree]);

  // Contacts disponibles
  const availableContacts = useMemo(() => {
    if (!selectedInvestor) return [];
    const investor = investors.find(i => i.name === selectedInvestor);
    return investor?.contacts || [];
  }, [selectedInvestor, investors]);

  // Investisseur sélectionné
  const selectedInvestorData = useMemo(() => {
    if (!selectedInvestor) return null;
    return investors.find(i => i.name === selectedInvestor);
  }, [selectedInvestor, investors]);

  // Filtrer les investisseurs
  const filteredInvestors = useMemo(() => {
    if (!searchQuery) return investors;
    return investors.filter(inv =>
      inv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [investors, searchQuery]);

  // Arbre affiché (filtré ou complet)
  const displayedTree = useMemo(() => {
    let tree = documentTree;

    // Fonction récursive pour filtrer l'arbre
    const filterTree = (nodes: DocumentNode[]): DocumentNode[] => {
      return nodes
        .map(node => {
          // Filtre sur les documents
          if (node.type === 'document') {
            let matches = true;

            // Filtre nom du document
            if (documentNameFilter && !node.name.toLowerCase().includes(documentNameFilter.toLowerCase())) {
              matches = false;
            }

            // Filtre fonds (restriction exacte)
            if (selectedFunds.length > 0 && node.fundRestriction) {
              if (!selectedFunds.includes(node.fundRestriction)) {
                matches = false;
              }
            }

            // Filtre segment (au moins un match dans les restrictions)
            if (selectedSegments.length > 0 && node.segmentRestrictions && node.segmentRestrictions.length > 0) {
              const hasMatch = node.segmentRestrictions.some(seg => selectedSegments.includes(seg));
              if (!hasMatch) {
                matches = false;
              }
            }

            // Filtre souscription (match exact sur la restriction du document)
            if (selectedSubscriptions.length > 0) {
              if (!node.subscriptionRestriction || !selectedSubscriptions.includes(node.subscriptionRestriction)) {
                matches = false;
              }
            }

            return matches ? node : null;
          }

          // Filtre sur les folders et spaces (récursif)
          if (node.children) {
            const filteredChildren = filterTree(node.children);
            
            if (filteredChildren.length > 0) {
              // On garde le folder/space s'il a des enfants après filtrage
              return {
                ...node,
                children: filteredChildren,
              };
            }

            // Vérifier aussi les restrictions du folder lui-même
            let folderMatches = false;
            
            if (selectedFunds.length > 0 && node.fundRestriction) {
              folderMatches = selectedFunds.includes(node.fundRestriction);
            }
            
            if (selectedSegments.length > 0 && node.segmentRestrictions && node.segmentRestrictions.length > 0) {
              const hasMatch = node.segmentRestrictions.some(seg => selectedSegments.includes(seg));
              folderMatches = folderMatches || hasMatch;
            }

            // Si le folder matche lui-même, on le garde avec ses enfants d'origine
            if (folderMatches) {
              return node;
            }

            return null;
          }

          return node;
        })
        .filter((node): node is DocumentNode => node !== null);
    };

    // Appliquer les filtres avancés si au moins un est actif
    const hasActiveFilters = documentNameFilter || selectedFunds.length > 0 || selectedSegments.length > 0 || selectedSubscriptions.length > 0;

    if (hasActiveFilters) {
      tree = filterTree(tree);
    }

    // Ensuite appliquer le filtre "documents non vus"
    if (showOnlyIncomplete) {
      return filterTreeForIncomplete(tree);
    }

    return tree;
  }, [documentTree, showOnlyIncomplete, documentNameFilter, selectedFunds, selectedSegments, selectedSubscriptions]);

  // Statistiques filtrées basées sur displayedTree
  const filteredStats = useMemo(() => {
    const treToUse = displayedTree;
    const totalSpaces = treToUse.length;

    const countFoldersAndDocs = (node: DocumentNode): { folders: number; docs: number } => {
      if (node.type === 'document') {
        return { folders: 0, docs: 1 };
      }

      let folders = node.type === 'folder' ? 1 : 0;
      let docs = 0;

      node.children?.forEach(child => {
        const counts = countFoldersAndDocs(child);
        folders += counts.folders;
        docs += counts.docs;
      });

      return { folders, docs };
    };

    let totalFolders = 0;
    let totalDocuments = 0;

    treToUse.forEach(space => {
      const counts = countFoldersAndDocs(space);
      totalFolders += counts.folders;
      totalDocuments += counts.docs;
    });

    // Compter les documents nominatifs et ceux consultés
    const countNominatifDocs = (node: DocumentNode): { total: number; viewed: number } => {
      if (node.type === 'document' && node.isNominatif) {
        const isViewed = node.engagement && node.engagement.viewedBy === node.engagement.totalViewers;
        return { total: 1, viewed: isViewed ? 1 : 0 };
      }

      let total = 0;
      let viewed = 0;
      node.children?.forEach(child => {
        const counts = countNominatifDocs(child);
        total += counts.total;
        viewed += counts.viewed;
      });

      return { total, viewed };
    };

    let totalNominatifDocs = 0;
    let viewedNominatifDocs = 0;

    treToUse.forEach(space => {
      const counts = countNominatifDocs(space);
      totalNominatifDocs += counts.total;
      viewedNominatifDocs += counts.viewed;
    });

    const engagementRate = totalNominatifDocs > 0 ? Math.round((viewedNominatifDocs / totalNominatifDocs) * 100) : 0;

    return {
      totalSpaces,
      totalFolders,
      totalDocuments,
      totalNominatifDocs,
      viewedNominatifDocs,
      engagementRate,
    };
  }, [displayedTree]);

  // Auto-expand l'arbre quand le filtre est actif
  useEffect(() => {
    if ((showOnlyIncomplete || selectedSubscriptions.length > 0) && displayedTree.length > 0) {
      const allIds = new Set<string>();
      const collect = (nodes: DocumentNode[]) => {
        nodes.forEach(node => {
          allIds.add(node.id);
          if (node.children) collect(node.children);
        });
      };
      collect(displayedTree);
      setExpandedNodes(allIds);
    }
  }, [showOnlyIncomplete, selectedSubscriptions, displayedTree]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collect = (nodes: DocumentNode[]) => {
      nodes.forEach(node => {
        allIds.add(node.id);
        if (node.children) collect(node.children);
      });
    };
    collect(documentTree);
    setExpandedNodes(allIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Contexte hérité par un document depuis ses parents (space / folders)
  interface AccessContext {
    fund?: string;
    shareClass?: string;
    segments?: string[];
  }

  // Joindre une liste en français : "A", "A et B", "A, B et C"
  const joinFr = (items: string[]): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} et ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
  };

  // Construire le message d'accès dynamique selon le contexte du document
  const buildAccessMessage = (node: DocumentNode, context: AccessContext) => {
    // Résoudre les restrictions effectives (document > parent)
    const effectiveFund = node.fundRestriction || context.fund;
    const effectiveShareClass = context.shareClass; // seuls les folders ont un shareClass
    const effectiveSegments =
      node.segmentRestrictions && node.segmentRestrictions.length > 0
        ? node.segmentRestrictions
        : context.segments && context.segments.length > 0
        ? context.segments
        : undefined;

    if (node.isNominatif) {
      // ── Document nominatif ─────────────────────────────────────────
      const investor = node.investorRestriction || 'un investisseur';
      const title = 'Document nominatif';

      const parts: string[] = [
        `Limité à l'investisseur ${investor} et ses contacts`,
      ];

      if (node.subscriptionRestriction) {
        parts.push(
          `ayant les droits d'accès sur la souscription ${node.subscriptionRestriction}`
        );
      }

      // Contexte fonds / part si hérité du dossier parent
      if (effectiveFund && effectiveShareClass) {
        parts.push(`dans le fonds ${effectiveFund} (${effectiveShareClass})`);
      } else if (effectiveFund) {
        parts.push(`dans le fonds ${effectiveFund}`);
      }

      return { title, body: parts.join(' '), color: 'purple' as const };
    }

    // ── Document générique ──────────────────────────────────────────
    const title = 'Document générique';
    const constraints: string[] = [];

    if (effectiveFund) {
      const fundLabel = effectiveShareClass
        ? `${effectiveFund} (${effectiveShareClass})`
        : effectiveFund;
      constraints.push(`ayant investi dans ${fundLabel}`);
    }

    if (effectiveSegments && effectiveSegments.length > 0) {
      constraints.push(
        `appartenant au${effectiveSegments.length > 1 ? 'x' : ''} segment${
          effectiveSegments.length > 1 ? 's' : ''
        } ${joinFr(effectiveSegments)}`
      );
    }

    const viewerCount = node.engagement?.totalViewers ?? 0;

    let body: string;
    if (constraints.length === 0) {
      body = `Accessible à tous les investisseurs ayant accès à cet espace (${viewerCount} investisseur${viewerCount > 1 ? 's' : ''}).`;
    } else {
      body = `Limité aux investisseurs ${constraints.join(' et ')} — ${viewerCount} investisseur${viewerCount > 1 ? 's' : ''} y ${viewerCount > 1 ? 'ont' : 'a'} accès.`;
    }

    return { title, body, color: 'blue' as const };
  };

  const renderNode = (
    node: DocumentNode,
    level: number = 0,
    inheritedContext: AccessContext = {}
  ) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    // Accumuler le contexte pour les enfants
    const childContext: AccessContext =
      node.type === 'document'
        ? inheritedContext
        : {
            fund: node.fundRestriction || inheritedContext.fund,
            shareClass: node.shareClassRestriction || inheritedContext.shareClass,
            segments:
              node.segmentRestrictions && node.segmentRestrictions.length > 0
                ? node.segmentRestrictions
                : inheritedContext.segments,
          };

    return (
      <div key={node.id} className={cn(level > 0 && 'ml-8')}>
        {/* Space */}
        {node.type === 'space' && (
          <div className="flex items-center gap-2 py-2 group">
            {/* Chevron */}
            <button onClick={() => hasChildren && toggleNode(node.id)} className="flex-shrink-0">
              <ChevronRight
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>

            {/* Icon */}
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>

            {/* Name */}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.name}</span>

            {/* Restrictions */}
            <div className="flex items-center gap-1.5">
              {node.fundRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={Landmark} label={node.fundRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par fonds</span></TooltipContent>
                </Tooltip>
              )}
              {node.segmentRestrictions && node.segmentRestrictions.map(seg => (
                <Tooltip key={seg}>
                  <TooltipTrigger asChild>
                    <span><Tag icon={TagIcon} label={seg} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par segment</span></TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Count */}
            <span className="ml-auto text-xs text-gray-500">
              {node.children?.length || 0} éléments
            </span>
          </div>
        )}

        {/* Folder */}
        {node.type === 'folder' && (
          <div className="flex items-center gap-2 py-2 group">
            {/* Chevron */}
            <button onClick={() => hasChildren && toggleNode(node.id)} className="flex-shrink-0">
              <ChevronRight
                className={cn(
                  'w-4 h-4 text-gray-400 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>

            {/* Icon */}
            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-4 h-4 text-yellow-500" />
            </div>

            {/* Name */}
            <span className="text-sm text-gray-900 dark:text-gray-100">{node.name}</span>

            {/* Restrictions */}
            <div className="flex items-center gap-1.5">
              {node.fundRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={Landmark} label={node.fundRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par fonds</span></TooltipContent>
                </Tooltip>
              )}
              {node.shareClassRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={Layers3} label={node.shareClassRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par part</span></TooltipContent>
                </Tooltip>
              )}
              {node.segmentRestrictions && node.segmentRestrictions.map(seg => (
                <Tooltip key={seg}>
                  <TooltipTrigger asChild>
                    <span><Tag icon={TagIcon} label={seg} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par segment</span></TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Count */}
            <span className="ml-auto text-xs text-gray-500">
              {node.children?.length || 0} éléments
            </span>
          </div>
        )}

        {/* Document */}
        {node.type === 'document' && (
          <div className="flex items-center gap-3 py-2 px-3 bg-blue-50/30 dark:bg-blue-950/10 rounded hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group">
            {/* Icon */}
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>

            {/* Name */}
            <span className="text-sm text-gray-900 dark:text-gray-100">{node.name}</span>

            {/* Metadata */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{node.date}</span>
              <span className="uppercase font-medium">{node.format}</span>
            </div>

            {/* Restrictions du document */}
            <div className="flex items-center gap-1.5">
              {node.investorRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={UserRound} label={node.investorRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage nominatif (investisseur)</span></TooltipContent>
                </Tooltip>
              )}
              {node.subscriptionRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={FileText} label={node.subscriptionRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par souscription</span></TooltipContent>
                </Tooltip>
              )}
              {node.fundRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={Landmark} label={node.fundRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par fonds</span></TooltipContent>
                </Tooltip>
              )}
              {node.segmentRestrictions && node.segmentRestrictions.map(seg => (
                <Tooltip key={seg}>
                  <TooltipTrigger asChild>
                    <span><Tag icon={TagIcon} label={seg} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">Ciblage par segment</span></TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Statut selon le type de document */}
            {(() => {
              const access = buildAccessMessage(node, inheritedContext);
              const headerColorClass =
                access.color === 'purple'
                  ? 'text-purple-200'
                  : 'text-blue-200';

              if (node.isNominatif && node.engagement) {
                // Document nominatif : Consulté / Non Consulté (avec hover)
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 ml-4 cursor-help">
                        {node.engagement.viewedBy === node.engagement.totalViewers ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-green-600">Consulté</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-medium text-red-500">Non Consulté</span>
                          </>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm">
                      <div className={cn('text-[11px] font-semibold uppercase tracking-wide mb-0.5', headerColorClass)}>
                        {access.title}
                      </div>
                      <div className="text-xs leading-snug">{access.body}</div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              // Document générique : indicateur discret avec nombre d'investisseurs (avec hover)
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 ml-4 text-gray-400 dark:text-gray-500 cursor-help">
                      <Globe className="w-3.5 h-3.5" />
                      <span className="text-xs">
                        {node.engagement?.totalViewers ?? 0}
                      </span>
                      <Users className="w-3 h-3" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    <div className={cn('text-[11px] font-semibold uppercase tracking-wide mb-0.5', headerColorClass)}>
                      {access.title}
                    </div>
                    <div className="text-xs leading-snug">{access.body}</div>
                  </TooltipContent>
                </Tooltip>
              );
            })()}

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Preview button */}
              <button
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                onClick={() => {
                  setPreviewDocument({
                    id: node.id,
                    name: node.name,
                    format: node.format,
                    size: node.size,
                    date: node.date,
                  });
                  setIsPreviewDrawerOpen(true);
                }}
                title="Aperçu du document"
              >
                <FileSearch className="w-3.5 h-3.5" />
                Aperçu
              </button>

              {/* Activity button */}
              <button
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                onClick={() => {
                  setSelectedDocument({ id: node.id, name: node.name, isNominatif: !!node.isNominatif });
                  setIsActivityPanelOpen(true);
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activité
              </button>
            </div>
          </div>
        )}

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-1">
            {node.children!.map(child => renderNode(child, level + 1, childContext))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement de Bird View...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux espaces
          </Button>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Bird View</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Arborescence complète de tous les espaces
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-600 dark:bg-blue-700 rounded-lg p-4 border border-blue-700 dark:border-blue-600">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-5 h-5 text-blue-100" />
              <span className="text-sm text-blue-50">Espaces</span>
            </div>
            <div className="text-3xl font-bold text-white">
              {filteredStats.totalSpaces}
            </div>
          </div>

          <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-5 h-5 text-blue-700 dark:text-blue-300" />
              <span className="text-sm text-blue-800 dark:text-blue-200">Dossiers</span>
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {filteredStats.totalFolders}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Documents</span>
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              {filteredStats.totalDocuments}
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-900 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Taux d'engagement documentaire
            </span>
            {selectedInvestorData && (
              <div className="w-14 h-14 rounded-full border-4 border-green-600 dark:border-green-400 flex items-center justify-center">
                <span className="text-lg font-bold text-green-900 dark:text-green-100">
                  {selectedInvestorData.engagementRate}
                </span>
              </div>
            )}
          </div>
          <div className="w-full h-2 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${filteredStats.engagementRate}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-green-600 dark:bg-green-400"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-green-700 dark:text-green-300">
              {filteredStats.viewedNominatifDocs} sur {filteredStats.totalNominatifDocs} documents nominatifs vus ou téléchargés
              {selectedInvestorData && (
                <span className="ml-2">
                  • par <span className="font-semibold">{selectedInvestorData.name}</span> et ses contacts
                </span>
              )}
            </div>
            <Button
              variant={showOnlyIncomplete ? "default" : "outline"}
              size="sm"
              className={cn(
                "gap-2",
                showOnlyIncomplete && "bg-gradient-to-r from-black to-[#0F323D] text-white hover:opacity-90"
              )}
              onClick={() => setShowOnlyIncomplete(!showOnlyIncomplete)}
            >
              <EyeOff className="w-4 h-4" />
              {showOnlyIncomplete ? "Afficher tous" : "Documents nominatifs non vus"}
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">Visualiser comme :</span>

          {/* Investisseur */}
          <Popover open={showInvestorDropdown} onOpenChange={setShowInvestorDropdown}>
            <PopoverTrigger asChild>
              <button className="h-10 px-4 py-2 bg-white dark:bg-gray-950 border border-purple-300 dark:border-purple-700 rounded-lg text-sm hover:bg-purple-50 dark:hover:bg-purple-950 transition-all flex items-center gap-2 min-w-[250px]">
                {selectedInvestorData ? (
                  <>
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="flex-1 text-left">{selectedInvestorData.name}</span>
                    <Tag label={selectedInvestorData.type} />
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-left text-gray-500">Sélectionner une entité...</span>
                  </>
                )}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 border border-purple-200 dark:border-purple-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Investors */}
              <div className="max-h-[300px] overflow-y-auto p-2">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
                  Investisseurs
                </div>
                {filteredInvestors.map(investor => (
                  <button
                    key={investor.id}
                    onClick={() => {
                      setSelectedInvestor(investor.name);
                      setSelectedContact(null);
                      setShowInvestorDropdown(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors',
                      selectedInvestor === investor.name && 'bg-purple-100 dark:bg-purple-900'
                    )}
                  >
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="flex-1 text-left font-medium">{investor.name}</span>
                    <Tag label={investor.type} />
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Contact */}
          {selectedInvestor && availableContacts.length > 0 && (
            <Popover open={showContactDropdown} onOpenChange={setShowContactDropdown}>
              <PopoverTrigger asChild>
                <button className="h-10 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-2 min-w-[200px]">
                  <span className="flex-1 text-left text-gray-500">
                    {selectedContact || 'Contact ou conseiller...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <div className="max-h-[300px] overflow-y-auto p-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                    Contacts
                  </div>
                  
                  {/* Investisseur principal */}
                  <button
                    onClick={() => {
                      setSelectedContact(null);
                      setShowContactDropdown(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-900',
                      !selectedContact && 'bg-gray-100 dark:bg-gray-800'
                    )}
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{selectedInvestor}</div>
                      <div className="text-xs text-gray-500">Investisseur principal</div>
                    </div>
                  </button>

                  {/* Tous les contacts */}
                  {availableContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact.name);
                        setShowContactDropdown(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-900',
                        selectedContact === contact.name && 'bg-gray-100 dark:bg-gray-800'
                      )}
                    >
                      <User className="w-4 h-4 text-gray-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-xs text-gray-500">{contact.relationLabel}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Reset */}
          {selectedInvestor && (
            <button
              onClick={() => {
                setSelectedInvestor(null);
                setSelectedContact(null);
              }}
              className="h-10 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Barre de filtres */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {/* Nom du document */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nom du document..."
              value={documentNameFilter}
              onChange={(e) => setDocumentNameFilter(e.target.value)}
              className="h-10 pl-9 pr-3 min-w-[200px] border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950"
            />
          </div>

          {/* Filtre Fonds (autocomplete, multi-select) */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-10 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-2 min-w-[150px]">
                <Landmark className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                  {selectedFunds.length > 0 ? `Fonds (${selectedFunds.length})` : 'Fonds'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un fonds..."
                    value={fundSearch}
                    onChange={(e) => setFundSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950"
                  />
                </div>
              </div>

              {/* Selected chips */}
              {selectedFunds.length > 0 && (
                <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                  {selectedFunds.map(fund => (
                    <span
                      key={fund}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300"
                    >
                      {fund}
                      <button
                        onClick={() => setSelectedFunds(selectedFunds.filter(f => f !== fund))}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Options */}
              <div className="max-h-[260px] overflow-y-auto p-2">
                {(() => {
                  const filtered = availableFunds.filter(f =>
                    f.toLowerCase().includes(fundSearch.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <div className="px-3 py-6 text-center text-xs text-gray-500">
                        Aucun fonds trouvé
                      </div>
                    );
                  }
                  return filtered.map(fund => (
                    <label
                      key={fund}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFunds.includes(fund)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFunds([...selectedFunds, fund]);
                          } else {
                            setSelectedFunds(selectedFunds.filter(f => f !== fund));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{fund}</span>
                    </label>
                  ));
                })()}
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtre Segment (autocomplete, multi-select) */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-10 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-2 min-w-[150px]">
                <TagIcon className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                  {selectedSegments.length > 0 ? `Segment (${selectedSegments.length})` : 'Segment'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un segment..."
                    value={segmentSearch}
                    onChange={(e) => setSegmentSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950"
                  />
                </div>
              </div>

              {/* Selected chips */}
              {selectedSegments.length > 0 && (
                <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                  {selectedSegments.map(seg => (
                    <span
                      key={seg}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300"
                    >
                      {seg}
                      <button
                        onClick={() => setSelectedSegments(selectedSegments.filter(s => s !== seg))}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Options */}
              <div className="max-h-[260px] overflow-y-auto p-2">
                {(() => {
                  const filtered = availableSegments.filter(s =>
                    s.toLowerCase().includes(segmentSearch.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <div className="px-3 py-6 text-center text-xs text-gray-500">
                        Aucun segment trouvé
                      </div>
                    );
                  }
                  return filtered.map(segment => (
                    <label
                      key={segment}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSegments.includes(segment)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSegments([...selectedSegments, segment]);
                          } else {
                            setSelectedSegments(selectedSegments.filter(s => s !== segment));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{segment}</span>
                    </label>
                  ));
                })()}
              </div>
            </PopoverContent>
          </Popover>

          {/* Filtre Souscription (autocomplete, multi-select) */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-10 px-4 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-2 min-w-[180px]">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                  {selectedSubscriptions.length > 0
                    ? `Souscription (${selectedSubscriptions.length})`
                    : 'Souscription'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0" align="start">
              {/* Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une souscription..."
                    value={subscriptionSearch}
                    onChange={(e) => setSubscriptionSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950"
                  />
                </div>
              </div>

              {/* Selected chips */}
              {selectedSubscriptions.length > 0 && (
                <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                  {selectedSubscriptions.map(sub => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded text-xs text-blue-700 dark:text-blue-300"
                    >
                      {sub}
                      <button
                        onClick={() =>
                          setSelectedSubscriptions(selectedSubscriptions.filter(s => s !== sub))
                        }
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Options */}
              <div className="max-h-[260px] overflow-y-auto p-2">
                {(() => {
                  const filtered = availableSubscriptions.filter(sub =>
                    sub.toLowerCase().includes(subscriptionSearch.toLowerCase())
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="px-3 py-6 text-center text-xs text-gray-500">
                        Aucune souscription trouvée
                      </div>
                    );
                  }

                  return filtered.map(sub => {
                    const isSelected = selectedSubscriptions.includes(sub);
                    return (
                      <label
                        key={sub}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubscriptions([...selectedSubscriptions, sub]);
                            } else {
                              setSelectedSubscriptions(
                                selectedSubscriptions.filter(s => s !== sub)
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                          {sub}
                        </span>
                      </label>
                    );
                  });
                })()}
              </div>
            </PopoverContent>
          </Popover>

          {/* Réinitialiser les filtres */}
          {(documentNameFilter || selectedFunds.length > 0 || selectedSegments.length > 0 || selectedSubscriptions.length > 0) && (
            <button
              onClick={() => {
                setDocumentNameFilter('');
                setSelectedFunds([]);
                setSelectedSegments([]);
                setSelectedSubscriptions([]);
                setSubscriptionSearch('');
                setFundSearch('');
                setSegmentSearch('');
              }}
              className="h-10 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser les filtres
            </button>
          )}

          {/* Expand / Collapse All */}
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="gap-2"
            >
              <ChevronsDown className="w-4 h-4" />
              Tout ouvrir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="gap-2"
            >
              <ChevronsRight className="w-4 h-4" />
              Tout fermer
            </Button>
          </div>
        </div>

        {/* Vue complete message */}
        {selectedInvestor && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-purple-900 dark:text-purple-100">
              Vue complète de <span className="font-semibold">{selectedInvestor}</span>
            </span>
          </div>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-2">
          {displayedTree.map(node => renderNode(node))}
        </div>
      </div>

      {/* Document Activity Panel */}
      <DocumentActivityPanel
        isOpen={isActivityPanelOpen}
        documentId={selectedDocument?.id || ''}
        documentName={selectedDocument?.name || ''}
        isNominatif={selectedDocument?.isNominatif ?? true}
        onClose={() => {
          setIsActivityPanelOpen(false);
          setSelectedDocument(null);
        }}
      />

      {/* Document Preview Drawer */}
      <DocumentPreviewDrawer
        isOpen={isPreviewDrawerOpen}
        documentId={previewDocument?.id || ''}
        documentName={previewDocument?.name || ''}
        format={previewDocument?.format}
        size={previewDocument?.size}
        date={previewDocument?.date}
        onClose={() => {
          setIsPreviewDrawerOpen(false);
          setPreviewDocument(null);
        }}
      />
    </div>
  );
}

