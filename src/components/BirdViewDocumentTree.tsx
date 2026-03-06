import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  FileText,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  ChevronsRight,
  ChevronsDown,
  Users,
  User
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { BirdviewEvent, BirdviewInvestor, BirdviewContact } from '../utils/birdviewGenerator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface DocumentNode {
  id: string;
  name: string;
  type: 'space' | 'folder' | 'document';
  children?: DocumentNode[];
  views: number;
  downloads: number;
  totalUsers: number;
  engagedUsers: number;
}

interface BirdViewDocumentTreeProps {
  events: BirdviewEvent[];
  investors: BirdviewInvestor[];
  selectedInvestor: string | null;
  selectedContact: string | null;
  onInvestorChange: (investor: string | null) => void;
  onContactChange: (contact: string | null) => void;
}

export function BirdViewDocumentTree({
  events,
  investors,
  selectedInvestor,
  selectedContact,
  onInvestorChange,
  onContactChange
}: BirdViewDocumentTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Construire l'arbre de documents
  const documentTree = useMemo(() => {
    const tree: DocumentNode[] = [];
    const spacesMap = new Map<string, DocumentNode>();

    // Filtrer les événements selon la sélection
    let filteredEvents = events;
    if (selectedInvestor) {
      filteredEvents = filteredEvents.filter(e => e.investor === selectedInvestor);
    }
    if (selectedContact) {
      filteredEvents = filteredEvents.filter(e => e.contact === selectedContact);
    }

    events.forEach(event => {
      // Créer ou récupérer l'espace
      if (!spacesMap.has(event.space)) {
        const spaceNode: DocumentNode = {
          id: `space-${event.space}`,
          name: event.space,
          type: 'space',
          children: [],
          views: 0,
          downloads: 0,
          totalUsers: 0,
          engagedUsers: 0,
        };
        spacesMap.set(event.space, spaceNode);
        tree.push(spaceNode);
      }

      const spaceNode = spacesMap.get(event.space)!;

      // Créer ou récupérer le dossier
      let folderNode = spaceNode.children?.find(
        c => c.type === 'folder' && c.name === event.folder
      );

      if (!folderNode) {
        folderNode = {
          id: `folder-${event.space}-${event.folder}`,
          name: event.folder,
          type: 'folder',
          children: [],
          views: 0,
          downloads: 0,
          totalUsers: 0,
          engagedUsers: 0,
        };
        spaceNode.children?.push(folderNode);
      }

      // Créer ou récupérer le document
      let docNode = folderNode.children?.find(
        c => c.type === 'document' && c.name === event.document
      );

      if (!docNode) {
        docNode = {
          id: `doc-${event.documentId}`,
          name: event.document,
          type: 'document',
          views: 0,
          downloads: 0,
          totalUsers: 0,
          engagedUsers: 0,
        };
        folderNode.children?.push(docNode);
      }

      // Compter les événements
      if (event.eventType === 'document_viewed') {
        docNode.views++;
        folderNode.views++;
        spaceNode.views++;
      }
      if (event.eventType === 'document_downloaded') {
        docNode.downloads++;
        folderNode.downloads++;
        spaceNode.downloads++;
      }
    });

    // Calculer les stats d'engagement
    const calculateEngagement = (node: DocumentNode) => {
      if (node.type === 'document') {
        const uniqueUsers = new Set(
          filteredEvents
            .filter(e => e.document === node.name)
            .map(e => e.contact)
        );
        const engagedUsers = new Set(
          filteredEvents
            .filter(e => 
              e.document === node.name && 
              (e.eventType === 'document_viewed' || e.eventType === 'document_downloaded')
            )
            .map(e => e.contact)
        );
        node.totalUsers = uniqueUsers.size;
        node.engagedUsers = engagedUsers.size;
      } else {
        node.children?.forEach(calculateEngagement);
        const childStats = node.children?.reduce(
          (acc, child) => ({
            total: acc.total + child.totalUsers,
            engaged: acc.engaged + child.engagedUsers,
          }),
          { total: 0, engaged: 0 }
        ) || { total: 0, engaged: 0 };
        node.totalUsers = childStats.total;
        node.engagedUsers = childStats.engaged;
      }
    };

    tree.forEach(calculateEngagement);

    return tree;
  }, [events, selectedInvestor, selectedContact]);

  // Contacts disponibles
  const availableContacts = useMemo(() => {
    if (!selectedInvestor) return [];
    
    const investor = investors.find(i => i.name === selectedInvestor);
    if (!investor) return [];

    // Ajouter l'investisseur lui-même
    const contacts: BirdviewContact[] = [
      {
        id: 0,
        name: investor.name,
        role: 'Investisseur',
        relationLabel: 'Investisseur principal',
        email: investor.email,
        canAccess: true,
      },
      ...investor.contacts,
    ];

    return contacts;
  }, [selectedInvestor, investors]);

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
    const allNodeIds = new Set<string>();
    const collectIds = (nodes: DocumentNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(documentTree);
    setExpandedNodes(allNodeIds);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderNode = (node: DocumentNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const engagementRate = node.totalUsers > 0 
      ? Math.round((node.engagedUsers / node.totalUsers) * 100) 
      : 0;

    return (
      <div key={node.id}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            'group flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer',
            level > 0 && 'ml-6'
          )}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {/* Expand/Collapse */}
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Icon */}
          <div className="flex-shrink-0">
            {node.type === 'space' && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-white" />
              </div>
            )}
            {node.type === 'folder' && (
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Folder className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            )}
            {node.type === 'document' && (
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'truncate',
              node.type === 'space' && 'font-semibold text-gray-900 dark:text-gray-100',
              node.type === 'folder' && 'font-medium text-gray-800 dark:text-gray-200',
              node.type === 'document' && 'text-sm text-gray-700 dark:text-gray-300'
            )}>
              {node.name}
            </p>
            {node.type !== 'document' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {node.children?.length || 0} {node.type === 'space' ? 'dossiers' : 'documents'}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            {/* Views */}
            {node.views > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <Eye className="w-3.5 h-3.5" />
                <span>{node.views}</span>
              </div>
            )}

            {/* Downloads */}
            {node.downloads > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <Download className="w-3.5 h-3.5" />
                <span>{node.downloads}</span>
              </div>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {node.engagedUsers}/{node.totalUsers}
              </div>
              <div className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                engagementRate >= 80 && 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
                engagementRate >= 50 && engagementRate < 80 && 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
                engagementRate < 50 && 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              )}>
                {engagementRate}%
              </div>
            </div>
          </div>
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {node.children?.map(child => renderNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Investisseur */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-[38px] px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>{selectedInvestor || 'Tous les investisseurs'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-2" align="start">
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onInvestorChange(null);
                    onContactChange(null);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    !selectedInvestor
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  Tous les investisseurs
                </button>
                {investors.map(investor => (
                  <button
                    key={investor.id}
                    onClick={() => {
                      onInvestorChange(investor.name);
                      onContactChange(null);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      selectedInvestor === investor.name
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    {investor.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Contact */}
          {selectedInvestor && availableContacts.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button className="h-[38px] px-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>{selectedContact || 'Tous les contacts'}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-2" align="start">
                <div className="space-y-1">
                  <button
                    onClick={() => onContactChange(null)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      !selectedContact
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    Tous les contacts
                  </button>
                  {availableContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => onContactChange(contact.name)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                        selectedContact === contact.name
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span>{contact.name === selectedInvestor ? 'Investisseur principal' : contact.relationLabel}</span>
                        <Badge variant="outline" className="text-xs">
                          {contact.role}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Expand/Collapse All */}
        <div className="flex items-center gap-2">
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

      {/* Tree */}
      <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
        {documentTree.length > 0 ? (
          <div className="space-y-1">
            {documentTree.map(node => renderNode(node))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucun document trouvé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
