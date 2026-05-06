import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Activity,
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
  FileType,
  Users,
  Globe,
  Lock
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
import { DocumentActivityPanel } from './DocumentActivityPanel';
import { DocumentCategoryBadge } from './DocumentCategoryBadge';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';
import type { DocumentCategory } from '../utils/documentMockData';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { SegmentsMultiSelect, FundSingleSelect } from './ui/targeting-selects';
import { AutocompleteSingleSelect } from './ui/autocomplete-select';
import { useTranslation } from '../utils/languageContext';

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
  documentCategory?: DocumentCategory;
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
  const { t } = useTranslation();
  const [events, setEvents] = useState<BirdviewEvent[]>([]);
  const [investors, setInvestors] = useState<BirdviewInvestor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    id: string;
    name: string;
    isNominatif: boolean;
    documentCategory?: DocumentCategory;
    investorRestriction?: string;
    subscriptionRestriction?: string;
    fundRestriction?: string;
    segmentRestrictions?: string[];
  } | null>(null);
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
  const [selectedDocumentCategory, setSelectedDocumentCategory] = useState<string | null>(null);
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);

  // Charger les données
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const generatedEvents = generateBirdviewEvents(200);
      const generatedInvestors = generateBirdviewInvestors();
      setEvents(generatedEvents);
      setInvestors(generatedInvestors);
      setIsLoading(false);
      toast.success(t('ged.birdview.loadedToast'));
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
          documentCategory: item.documentCategory,
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

  // Contact sélectionné (objet) — null tant qu'aucun contact n'est choisi
  const selectedContactData = useMemo(() => {
    if (!selectedContact) return null;
    return availableContacts.find((c) => c.name === selectedContact) ?? null;
  }, [selectedContact, availableContacts]);

  /**
   * Renvoie true quand le document n'est PAS accessible par le contact
   * sélectionné (mais l'investisseur lui y a bien accès). Ces documents
   * sont rendus en gris dans l'arbre pour montrer la limite d'audience.
   */
  const isInaccessibleForContact = useCallback(
    (node: DocumentNode): boolean => {
      if (!selectedContactData) return false;
      const lvl = selectedContactData.accessLevel;
      if (lvl === 'full') return false;
      if (lvl === 'revoked') return true;
      // commercial-only: marketing category OR segment-targeted only
      if (node.documentCategory === 'marketing') return false;
      if (node.segmentRestrictions && node.segmentRestrictions.length > 0) return false;
      return true;
    },
    [selectedContactData],
  );

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

            // Filtre type de document
            if (selectedDocumentCategory && node.documentCategory !== selectedDocumentCategory) {
              matches = false;
            }

            // Filtre fonds (restriction exacte)
            if (selectedFund && node.fundRestriction) {
              if (node.fundRestriction !== selectedFund) {
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
            if (selectedSubscription) {
              if (node.subscriptionRestriction !== selectedSubscription) {
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
            
            if (selectedFund && node.fundRestriction) {
              folderMatches = node.fundRestriction === selectedFund;
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
    const hasActiveFilters = !!documentNameFilter || !!selectedDocumentCategory || !!selectedFund || selectedSegments.length > 0 || !!selectedSubscription;

    if (hasActiveFilters) {
      tree = filterTree(tree);
    }

    // Ensuite appliquer le filtre "documents non vus"
    if (showOnlyIncomplete) {
      return filterTreeForIncomplete(tree);
    }

    return tree;
  }, [documentTree, showOnlyIncomplete, documentNameFilter, selectedDocumentCategory, selectedFund, selectedSegments, selectedSubscription]);

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
    if ((showOnlyIncomplete || !!selectedSubscription) && displayedTree.length > 0) {
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
  }, [showOnlyIncomplete, selectedSubscription, displayedTree]);

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

  const joinList = (items: string[]): string => {
    const and = t('ged.birdview.access.joinAnd');
    const comma = t('ged.birdview.access.joinComma');
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]}${and}${items[1]}`;
    return `${items.slice(0, -1).join(comma)}${and}${items[items.length - 1]}`;
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
      const investor = node.investorRestriction || t('ged.birdview.access.anInvestor');
      const title = t('ged.birdview.access.nominativeTitle');

      const parts: string[] = [
        t('ged.birdview.access.limitedToInvestor', { name: investor }),
      ];

      if (node.subscriptionRestriction) {
        parts.push(t('ged.birdview.access.withSubscriptionAccess', { name: node.subscriptionRestriction }));
      }

      if (effectiveFund && effectiveShareClass) {
        parts.push(t('ged.birdview.access.inFundWithShare', { fund: effectiveFund, share: effectiveShareClass }));
      } else if (effectiveFund) {
        parts.push(t('ged.birdview.access.inFund', { fund: effectiveFund }));
      }

      return { title, body: parts.join(' '), color: 'purple' as const };
    }

    const title = t('ged.birdview.access.genericTitle');
    const constraints: string[] = [];

    if (effectiveFund) {
      const fundLabel = effectiveShareClass
        ? `${effectiveFund} (${effectiveShareClass})`
        : effectiveFund;
      constraints.push(t('ged.birdview.access.havingInvestedIn', { fund: fundLabel }));
    }

    if (effectiveSegments && effectiveSegments.length > 0) {
      const key = effectiveSegments.length > 1 ? 'ged.birdview.access.belongingToSegmentMany' : 'ged.birdview.access.belongingToSegmentOne';
      constraints.push(t(key, { segments: joinList(effectiveSegments) }));
    }

    const viewerCount = node.engagement?.totalViewers ?? 0;

    let body: string;
    if (constraints.length === 0) {
      body = t(viewerCount > 1 ? 'ged.birdview.access.accessibleAllMany' : 'ged.birdview.access.accessibleAllOne', { count: viewerCount });
    } else {
      const key = viewerCount > 1 ? 'ged.birdview.access.limitedToInvestorsMany' : 'ged.birdview.access.limitedToInvestorsOne';
      body = t(key, { constraints: constraints.join(t('ged.birdview.access.joinAnd')), count: viewerCount });
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
          <div className="flex items-center gap-2 py-2 px-2 -mx-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors group">
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
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: '#000E2B' }}>
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
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetFund')}</span></TooltipContent>
                </Tooltip>
              )}
              {node.segmentRestrictions && node.segmentRestrictions.map(seg => (
                <Tooltip key={seg}>
                  <TooltipTrigger asChild>
                    <span><Tag icon={TagIcon} label={seg} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetSegment')}</span></TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Count */}
            <span className="ml-auto text-xs text-gray-500">
              {t('ged.birdview.elementCount', { count: node.children?.length || 0 })}
            </span>
          </div>
        )}

        {/* Folder */}
        {node.type === 'folder' && (
          <div className="flex items-center gap-2 py-2 px-2 -mx-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors group">
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
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetFund')}</span></TooltipContent>
                </Tooltip>
              )}
              {node.shareClassRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={Layers3} label={node.shareClassRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetShare')}</span></TooltipContent>
                </Tooltip>
              )}
              {node.segmentRestrictions && node.segmentRestrictions.map(seg => (
                <Tooltip key={seg}>
                  <TooltipTrigger asChild>
                    <span><Tag icon={TagIcon} label={seg} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetSegment')}</span></TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Count */}
            <span className="ml-auto text-xs text-gray-500">
              {t('ged.birdview.elementCount', { count: node.children?.length || 0 })}
            </span>
          </div>
        )}

        {/* Document */}
        {node.type === 'document' && (() => {
          const inaccessible = isInaccessibleForContact(node);
          return (
          <div
            className={cn(
              'flex items-center gap-3 py-2 px-3 bg-blue-50/30 dark:bg-blue-950/10 rounded hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors group',
              inaccessible && 'opacity-50 grayscale',
            )}
            title={
              inaccessible && selectedContactData
                ? t('ged.birdview.tooltips.contactNoAccess', {
                    contact: selectedContactData.name,
                  })
                : undefined
            }
          >
            {/* Icon */}
            <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              {inaccessible ? (
                <Lock className="w-4 h-4 text-gray-400" />
              ) : (
                <FileText className="w-4 h-4 text-gray-400" />
              )}
            </div>

            {/* Name */}
            <span className="text-sm text-gray-900 dark:text-gray-100">{node.name}</span>
            <DocumentCategoryBadge category={node.documentCategory} />

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
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetInvestor')}</span></TooltipContent>
                </Tooltip>
              )}
              {node.subscriptionRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={FileText} label={node.subscriptionRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetSubscription')}</span></TooltipContent>
                </Tooltip>
              )}
              {node.fundRestriction && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Tag icon={Landmark} label={node.fundRestriction} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetFund')}</span></TooltipContent>
                </Tooltip>
              )}
              {node.segmentRestrictions && node.segmentRestrictions.map(seg => (
                <Tooltip key={seg}>
                  <TooltipTrigger asChild>
                    <span><Tag icon={TagIcon} label={seg} /></span>
                  </TooltipTrigger>
                  <TooltipContent side="top"><span className="text-xs">{t('ged.birdview.tooltips.targetSegment')}</span></TooltipContent>
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
                // Document nominatif : Consulté dès qu'au moins une personne
                // (LP ou contact accessible) a consulté le doc.
                const consulted = (node.engagement.viewedBy ?? 0) > 0;
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1.5 ml-4 cursor-help">
                        {consulted ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-medium text-green-600">{t('ged.birdview.node.viewed')}</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-medium text-red-500">{t('ged.birdview.node.notViewed')}</span>
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
            <div className="ml-auto flex items-center gap-1">
              {/* Preview button (icon-only, like in the arbo) */}
              <button
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
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
                title={t('ged.birdview.node.preview')}
              >
                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Activity button */}
              <button
                className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                onClick={() => {
                  setSelectedDocument({
                    id: node.id,
                    name: node.name,
                    isNominatif: !!node.isNominatif,
                    documentCategory: node.documentCategory,
                    investorRestriction: node.investorRestriction,
                    subscriptionRestriction: node.subscriptionRestriction,
                    fundRestriction: node.fundRestriction,
                    segmentRestrictions: node.segmentRestrictions,
                  });
                  setIsActivityPanelOpen(true);
                }}
                title={t('ged.birdview.node.activity')}
              >
                <Activity className="w-4 h-4" />
                {t('ged.birdview.node.activityLabel')}
              </button>
            </div>
          </div>
          );
        })()}

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
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('ged.birdview.loading')}</p>
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
            {t('ged.birdview.backToSpaces')}
          </Button>
        </div>

        <div className="flex items-start gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#000E2B' }}>
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('ged.birdview.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('ged.birdview.subtitle')}
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-5 h-5" style={{ color: '#000E2B' }} />
              <span className="text-sm" style={{ color: '#000E2B' }}>{t('ged.birdview.kpi.spaces')}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#000E2B' }}>
              {filteredStats.totalSpaces}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen className="w-5 h-5" style={{ color: '#000E2B' }} />
              <span className="text-sm" style={{ color: '#000E2B' }}>{t('ged.birdview.kpi.folders')}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#000E2B' }}>
              {filteredStats.totalFolders}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-100 dark:border-blue-900">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5" style={{ color: '#000E2B' }} />
              <span className="text-sm" style={{ color: '#000E2B' }}>{t('ged.birdview.kpi.documents')}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#000E2B' }}>
              {filteredStats.totalDocuments}
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-900 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              {t('ged.birdview.engagement.rate')}
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
              {t('ged.birdview.engagement.summary', { viewed: filteredStats.viewedNominatifDocs, total: filteredStats.totalNominatifDocs })}
              {selectedInvestorData && (
                <span className="ml-2">
                  • {t('ged.birdview.engagement.contactsSuffix', { name: selectedInvestorData.name })}
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
              {showOnlyIncomplete ? t('ged.birdview.engagement.showAll') : t('ged.birdview.engagement.showIncomplete')}
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-gray-300">{t('ged.birdview.filters.visualizeAs')}</span>

          {/* Investisseur */}
          <div className="min-w-[260px]">
            <AutocompleteSingleSelect
              value={selectedInvestor}
              onChange={(next) => {
                setSelectedInvestor(next);
                setSelectedContact(null);
              }}
              options={investors.map(inv => ({
                value: inv.name,
                label: inv.name,
                description: inv.type,
              }))}
              placeholder={t('ged.birdview.filters.pickEntity')}
              icon={User}
            />
          </div>

          {/* Contact */}
          {selectedInvestor && availableContacts.length > 0 && (
            <div className="min-w-[220px]">
              <AutocompleteSingleSelect
                value={selectedContact}
                onChange={setSelectedContact}
                options={availableContacts.map(c => ({
                  value: c.name,
                  label: c.name,
                  description: c.relationLabel,
                }))}
                placeholder={t('ged.birdview.filters.pickContact')}
                icon={User}
              />
            </div>
          )}
        </div>

        {/* Barre de filtres */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {/* Nom du document */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('ged.birdview.filters.documentName')}
              value={documentNameFilter}
              onChange={(e) => setDocumentNameFilter(e.target.value)}
              className="h-10 pl-9 pr-3 min-w-[200px] border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-950"
            />
          </div>

          {/* Filtre Type de document */}
          <div className="min-w-[220px]">
            <AutocompleteSingleSelect
              value={selectedDocumentCategory}
              onChange={setSelectedDocumentCategory}
              options={(['capitalCall','distribution','quarterlyReport','annualReport','subscription','kyc','legal','tax','marketing','other'] as DocumentCategory[]).map((c) => ({
                value: c,
                label: t(`ged.addModal.documentCategory.${c}`),
              }))}
              placeholder={t('ged.birdview.filters.documentCategory')}
              icon={FileType}
            />
          </div>

          {/* Filtre Fonds */}
          <div className="min-w-[220px]">
            <FundSingleSelect
              value={selectedFund}
              onChange={setSelectedFund}
              options={availableFunds}
              placeholder={t('ged.birdview.filters.fund')}
            />
          </div>

          {/* Filtre Segment */}
          <div className="min-w-[220px]">
            <SegmentsMultiSelect
              value={selectedSegments}
              onChange={setSelectedSegments}
              options={availableSegments}
              placeholder={t('ged.birdview.filters.segment')}
              icon={TagIcon}
            />
          </div>

          {/* Filtre Souscription */}
          <div className="min-w-[240px]">
            <AutocompleteSingleSelect
              value={selectedSubscription}
              onChange={setSelectedSubscription}
              options={availableSubscriptions.map(s => ({ value: s, label: s }))}
              placeholder={t('ged.birdview.filters.subscription')}
              icon={FileText}
            />
          </div>

          {/* Réinitialiser les filtres */}
          {(documentNameFilter || selectedDocumentCategory || selectedFund || selectedSegments.length > 0 || selectedSubscription) && (
            <button
              onClick={() => {
                setDocumentNameFilter('');
                setSelectedDocumentCategory(null);
                setSelectedFund(null);
                setSelectedSegments([]);
                setSelectedSubscription(null);
              }}
              className="h-10 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {t('ged.birdview.filters.reset')}
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
              {t('ged.birdview.filters.expandAll')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="gap-2"
            >
              <ChevronsRight className="w-4 h-4" />
              {t('ged.birdview.filters.collapseAll')}
            </Button>
          </div>
        </div>

        {/* Vue complete message */}
        {selectedInvestor && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg">
            <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-purple-900 dark:text-purple-100">
              {selectedContact
                ? t('ged.birdview.filters.fullViewContact', {
                    contact: selectedContact,
                    investor: selectedInvestor,
                  })
                : t('ged.birdview.filters.fullView', { name: selectedInvestor })}
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
        investorRestriction={selectedDocument?.investorRestriction}
        subscriptionRestriction={selectedDocument?.subscriptionRestriction}
        fundRestriction={selectedDocument?.fundRestriction}
        segmentRestrictions={selectedDocument?.segmentRestrictions}
        viewerScope={
          selectedInvestor
            ? { investorName: selectedInvestor, contactName: selectedContact ?? undefined }
            : undefined
        }
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

