import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ModernMultiSelect, type MultiSelectOption } from './ui/modern-multiselect';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, UploadCloud, FileCheck2, Download, Users2, UserRound, Mail, Eye, Trash2, Check, Folder, FileText, Bell, ShieldCheck, Clock3, CheckCircle2, Star, Lock, TrendingUp } from 'lucide-react';
import { Document, mockDocuments } from '../utils/documentMockData';
import { AudienceCounterCards } from './AudienceCounter';
import { SegmentsMultiSelect, FundSingleSelect, ShareClassSingleSelect } from './ui/targeting-selects';
import { AutocompleteSingleSelect } from './ui/autocomplete-select';
import { Building2 } from 'lucide-react';

function formatFrenchDate(dateStr: string): string {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const d = new Date(dateStr.replace(' ', 'T'));
  if (isNaN(d.getTime())) return dateStr;
  const dayName = days[d.getDay()];
  const dayNum = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${dayName} ${dayNum} ${month} ${year} à ${hours}h${minutes}`;
}

export interface FolderOption {
  id: string;
  label: string;
}

interface DocumentVersion {
  language: 'fr' | 'en';
  name: string;
  fileName: string;
  previewUrl?: string;
  fileUrl?: string;
}

interface ValidationTeam {
  id: string;
  name: string;
  validators: string[];
}

interface InvestorProfile {
  id: string;
  name: string;
  segment: string;
  fund: string;
  subscriptions: string[];
  structures: Array<{
    id: string;
    name: string;
    subscriptions: string[];
  }>;
  contacts: Array<{
    name: string;
    role: string;
  }>;
}

export interface FolderInheritedRestrictions {
  fund?: string;
  segments?: string[];
  shareClass?: string;
}

interface DocumentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultFolderId: string;
  document?: Document | null;
  initialFolderPickerOpen?: boolean;
  folderInheritedRestrictions?: Record<string, FolderInheritedRestrictions>;
}

interface FolderTreeNode {
  id: string;
  name: string;
  fullLabel: string;
  parentId: string | null;
  children: FolderTreeNode[];
}

const SEGMENTS = ['Institutionnels', 'Family Office', 'Retail', 'Corporate'];
const FUNDS = ['all', 'PERE 1', 'PERE 2', 'Growth Tech'];
const SHARE_CLASSES_BY_FUND: Record<string, string[]> = {
  'PERE 1': ['A', 'I'],
  'PERE 2': ['I', 'P'],
  'Growth Tech': ['Seed', 'Growth'],
};
const MAIL_TEMPLATES = ['Nouveau document', 'Rapport trimestriel', 'Appel de fonds'];
const REMINDER_DELAYS = ['3 jours', '7 jours', '14 jours'];

const TEAMS: ValidationTeam[] = [
  { id: 'front', name: 'Front Office', validators: ['N. Sibille', 'L. Martin'] },
  { id: 'middle', name: 'Middle Office', validators: ['S. Roussel', 'M. Dupont'] },
  { id: 'compliance', name: 'Compliance', validators: ['P. Mercier', 'C. Bernard'] },
];

const documentLifecycleMock: Record<string, {
  notification?: { sentAt: string; template: string };
  reminder?: { dueInDays?: number; sentAt?: string; template: string };
  validation: { status: 'pending' | 'approved'; team?: string; validator?: string; validatedAt?: string };
}> = {
  'doc-1': { notification: { sentAt: '2026-03-18 09:42', template: 'Nouveau document' }, reminder: { dueInDays: 2, template: 'Relance standard' }, validation: { status: 'pending' } },
  'doc-2': { notification: { sentAt: '2026-03-15 14:20', template: 'Rapport trimestriel' }, reminder: { sentAt: '2026-03-19 10:00', template: 'Relance premium' }, validation: { status: 'approved', team: 'Compliance', validator: 'Patricia Mercier', validatedAt: '2026-03-16 11:05' } },
  'doc-3': { validation: { status: 'approved', team: 'Middle Office', validator: 'S. Roussel', validatedAt: '2026-03-10 16:32' } },
  'doc-pere2-hnwi-1': { notification: { sentAt: '2024-03-05 10:00', template: 'Nouveau document' }, validation: { status: 'approved', team: 'Compliance', validator: 'P. Mercier', validatedAt: '2024-03-04 14:20' } },
  'doc-pere2-hnwi-2': { validation: { status: 'pending' } },
  'doc-pere2-hnwi-3': { validation: { status: 'pending' } },
};

const INVESTORS: InvestorProfile[] = [
  {
    id: 'i1',
    name: 'Jean Dupont',
    segment: 'Institutionnels',
    fund: 'PERE 1',
    subscriptions: ['SUB-001', 'SUB-001-B'],
    structures: [
      { id: 'st-1', name: 'Holding Dupont', subscriptions: ['SUB-001'] },
      { id: 'st-2', name: 'SPV Dupont', subscriptions: ['SUB-001-B'] },
    ],
    contacts: [
      { name: 'Maître Leblanc', role: 'Conseil Juridique' },
      { name: 'Antoine Mercier', role: 'Expert Comptable' },
    ],
  },
  {
    id: 'i2',
    name: 'Marie Martin',
    segment: 'Family Office',
    fund: 'PERE 1',
    subscriptions: ['SUB-002'],
    structures: [{ id: 'st-3', name: 'SCI Martin', subscriptions: ['SUB-002'] }],
    contacts: [
      { name: 'Claire Dubois', role: 'Family Office' },
      { name: 'Jean Rousseau', role: 'Conseil Fiscal' },
      { name: 'Marc Vincent', role: 'Gestionnaire Patrimoine' },
    ],
  },
  {
    id: 'i3',
    name: 'Thomas Petit',
    segment: 'Retail',
    fund: 'Growth Tech',
    subscriptions: ['SUB-003', 'SUB-003-C'],
    structures: [{ id: 'st-4', name: 'Patrimoine Petit', subscriptions: ['SUB-003-C'] }],
    contacts: [{ name: 'Émilie Moreau', role: 'Gestionnaire Patrimoine' }],
  },
  {
    id: 'i4',
    name: 'Sophie Bernard',
    segment: 'Corporate',
    fund: 'PERE 2',
    subscriptions: ['SUB-004'],
    structures: [{ id: 'st-5', name: 'SAS Bernard Invest', subscriptions: ['SUB-004'] }],
    contacts: [
      { name: 'Paul Girard', role: 'Partenaire Bancaire' },
      { name: 'Lucie Fontaine', role: 'Compliance' },
    ],
  },
];

const defaultVersions: DocumentVersion[] = [
  { language: 'fr', name: '', fileName: '' },
  { language: 'en', name: '', fileName: '' },
];

function findFolderById(docs: Document[], id: string): Document | null {
  for (const doc of docs) {
    if (doc.id === id) return doc;
    if (doc.children) {
      const found = findFolderById(doc.children, id);
      if (found) return found;
    }
  }
  return null;
}

function collectParentFolderRestrictions(folderId: string | undefined): {
  fund: string | null;
  segments: string[];
} {
  if (!folderId || folderId === 'root') return { fund: null, segments: [] };

  let inheritedFund: string | null = null;
  const segmentSet = new Set<string>();

  let currentId: string | undefined = folderId;
  while (currentId && currentId !== 'root') {
    const folder = findFolderById(mockDocuments, currentId);
    if (!folder) break;
    if (!inheritedFund && folder.metadata?.fund) {
      inheritedFund = folder.metadata.fund;
    }
    folder.metadata?.segments?.forEach((segment) => segmentSet.add(segment));
    currentId = folder.parentId;
  }

  return { fund: inheritedFund, segments: Array.from(segmentSet) };
}

interface FolderSelectionTreeviewDropdownProps {
  value: string;
  onChange: (folderId: string) => void;
  folderOptions: FolderOption[];
  disabled?: boolean;
  initialOpen?: boolean;
}

export function FolderSelectionTreeviewDropdown({
  value,
  onChange,
  folderOptions,
  disabled = false,
  initialOpen = false,
}: FolderSelectionTreeviewDropdownProps) {
  const [open, setOpen] = useState(initialOpen);
  const [folderSearch, setFolderSearch] = useState('');
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(new Set());
  const folderItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  const folderTreeData = useMemo(() => {
    const rootOption = folderOptions.find((folder) => folder.id === 'root') || { id: 'root', label: 'Racine / Documents' };
    const rootNode: FolderTreeNode = {
      id: rootOption.id,
      name: rootOption.label,
      fullLabel: rootOption.label,
      parentId: null,
      children: [],
    };

    const folderMap = new Map<string, FolderTreeNode>([[rootNode.id, rootNode]]);

    folderOptions
      .filter((folder) => folder.id !== 'root')
      .forEach((folder) => {
        const parts = folder.label.split(' / ').filter(Boolean);
        const name = parts[parts.length - 1] || folder.label;
        const parentLabel = parts.slice(0, -1).join(' / ');
        const parentOption = folderOptions.find((candidate) => candidate.label === parentLabel) || rootOption;
        const parentId = parentOption?.id || rootNode.id;

        const node: FolderTreeNode = {
          id: folder.id,
          name,
          fullLabel: folder.label,
          parentId,
          children: [],
        };
        folderMap.set(folder.id, node);
      });

    folderMap.forEach((node) => {
      if (node.id === rootNode.id) return;
      const parentId = node.parentId || rootNode.id;
      const parent = folderMap.get(parentId) || rootNode;
      parent.children.push(node);
    });

    const sortTree = (node: FolderTreeNode) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      node.children.forEach(sortTree);
    };
    sortTree(rootNode);

    const buildPathToRoot = (nodeId: string): string[] => {
      const path: string[] = [];
      let current = folderMap.get(nodeId);
      while (current?.parentId) {
        path.unshift(current.parentId);
        current = folderMap.get(current.parentId);
      }
      return path.filter((id) => id !== rootNode.id);
    };

    const getSelectedBreadcrumbDisplay = (nodeId: string) => {
      const node = folderMap.get(nodeId);
      if (!node) return 'Choisir un dossier';
      if (node.id === rootNode.id) return rootNode.name;
      const partsFromRoot = node.fullLabel.split(' / ').filter(Boolean);
      if (partsFromRoot.length <= 3) {
        return partsFromRoot.join(' / ');
      }
      return `... / ${partsFromRoot.slice(-3).join(' / ')}`;
    };

    const getSelectedBreadcrumbHover = (nodeId: string) => {
      const node = folderMap.get(nodeId);
      if (!node) return 'Choisir un dossier';
      if (node.id === rootNode.id) return rootNode.name;
      const partsFromRoot = node.fullLabel.split(' / ').filter(Boolean);
      return partsFromRoot.join(' / ');
    };

    return {
      rootNode,
      getPathToRoot: buildPathToRoot,
      getSelectedBreadcrumbDisplay,
      getSelectedBreadcrumbHover,
    };
  }, [folderOptions]);

  useEffect(() => {
    if (!open) return;
    setFolderSearch('');
    const selectedId = value || 'root';
    const pathToOpen = folderTreeData.getPathToRoot(selectedId);
    setExpandedFolderIds(new Set(pathToOpen));

    requestAnimationFrame(() => {
      const selectedNode = folderItemRefs.current[selectedId];
      if (selectedNode) {
        selectedNode.focus();
        selectedNode.scrollIntoView({ block: 'nearest' });
      }
    });
  }, [open, value, folderTreeData]);

  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const folderMatchesSearch = (node: FolderTreeNode): boolean => {
    if (!folderSearch.trim()) return true;
    const query = folderSearch.toLowerCase();
    if (node.name.toLowerCase().includes(query) || node.fullLabel.toLowerCase().includes(query)) return true;
    return node.children.some(folderMatchesSearch);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-11 w-full justify-between font-normal"
          disabled={disabled}
          data-component="folder-selection-treeview-dropdown"
        >
          <span className="truncate text-left" title={folderTreeData.getSelectedBreadcrumbHover(value)}>
            {folderTreeData.getSelectedBreadcrumbDisplay(value)}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[420px] min-w-[var(--radix-popover-trigger-width)] p-0 max-h-[min(460px,calc(100vh-32px))] overflow-hidden rounded-xl border border-gray-200 shadow-xl flex flex-col"
        align="start"
      >
        <div className="border-b border-gray-100 p-2.5">
          <Input
            value={folderSearch}
            onChange={(event) => setFolderSearch(event.target.value)}
            placeholder="Rechercher un dossier..."
            className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-[min(390px,calc(100vh-220px))] overflow-y-auto overscroll-contain p-2 pr-1.5">
          {(() => {
            const query = folderSearch.trim().toLowerCase();
            const renderTreeNode = (node: FolderTreeNode, depth: number): JSX.Element | null => {
              const hasChildren = node.children.length > 0;
              const isExpanded = expandedFolderIds.has(node.id);
              const isSelected = value === node.id;
              const selfMatches = node.name.toLowerCase().includes(query) || node.fullLabel.toLowerCase().includes(query);
              const childMatches = node.children.some(folderMatchesSearch);
              const visible = !query || selfMatches || childMatches || node.id === 'root';

              if (!visible) return null;

              return (
                <div key={node.id}>
                  {node.id !== 'root' && (
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => hasChildren && toggleFolderExpansion(node.id)}
                        className="h-7 w-5 flex items-center justify-center text-gray-500 hover:text-gray-700 disabled:opacity-0"
                        disabled={!hasChildren}
                        aria-label={hasChildren ? `Déplier ${node.name}` : undefined}
                        style={{ marginLeft: `${depth * 14}px` }}
                      >
                        {hasChildren ? (
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        ) : (
                          <span className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        ref={(element) => {
                          folderItemRefs.current[node.id] = element;
                        }}
                        onClick={() => {
                          onChange(node.id);
                          setOpen(false);
                        }}
                        className={`flex-1 h-8 px-2 rounded-md flex items-center gap-2 text-left text-sm ${
                          isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Folder className={`w-3.5 h-3.5 stroke-[1.75] ${isSelected ? 'text-blue-600' : 'text-amber-500'}`} />
                        <span className="truncate">{node.name}</span>
                        {isSelected && <Check className="w-4 h-4 ml-auto text-blue-600" />}
                      </button>
                    </div>
                  )}
                  {(node.id === 'root' || isExpanded || !!query) &&
                    node.children.map((child) => renderTreeNode(child, node.id === 'root' ? 0 : depth + 1))}
                </div>
              );
            };

            const renderedTree = renderTreeNode(folderTreeData.rootNode, 0);
            return renderedTree ?? <p className="text-sm text-gray-500 py-6 text-center">Aucun dossier trouvé.</p>;
          })()}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DocumentAddModal({ isOpen, onClose, folderOptions, defaultFolderId, document, initialFolderPickerOpen = false, folderInheritedRestrictions }: DocumentAddModalProps) {
  const isDetailMode = !!document;
  const [versions, setVersions] = useState<DocumentVersion[]>(defaultVersions);
  const [addDate, setAddDate] = useState(new Date().toISOString().slice(0, 10));
  const [parentFolderId, setParentFolderId] = useState(defaultFolderId);
  const [audienceMode, setAudienceMode] = useState<'general' | 'nominative'>('general');
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['all']);
  const [selectedFund, setSelectedFund] = useState('all');
  const [selectedShareClass, setSelectedShareClass] = useState<string>('');
  const [selectedInvestor, setSelectedInvestor] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [selectedStructureId, setSelectedStructureId] = useState<string>('');
  const [notify, setNotify] = useState(false);
  const [notifyTemplate, setNotifyTemplate] = useState(MAIL_TEMPLATES[0]);
  const [reminder, setReminder] = useState(false);
  const [reminderDelay, setReminderDelay] = useState(REMINDER_DELAYS[1]);
  const [reminderTemplate, setReminderTemplate] = useState(MAIL_TEMPLATES[0]);
  const [validationTeams, setValidationTeams] = useState<string[]>([]);
  const fileInputRefs = useRef<Record<'fr' | 'en', HTMLInputElement | null>>({ fr: null, en: null });
  const [selectedContactAccess, setSelectedContactAccess] = useState<Record<string, string[]>>({});
  const detailState = document ? (documentLifecycleMock[document.id] || {
    validation: document.status === 'published'
      ? { status: 'approved' as const, team: 'Front Office', validator: 'N. Sibille', validatedAt: document.uploadedAt ? `${document.uploadedAt} 10:00` : '2026-03-01 10:00' }
      : { status: 'pending' as const }
  }) : null;

  useEffect(() => {
    if (!isOpen) return;
    setParentFolderId(defaultFolderId);
    setAddDate(new Date().toISOString().slice(0, 10));
    if (document) {
      setVersions([
        { language: 'fr', name: document.name, fileName: document.name },
        { language: 'en', name: document.name, fileName: '' },
      ]);
      const nt = document.navigatorTargeting;
      if (nt?.mode === 'nominative') {
        setAudienceMode('nominative');
        const matchedInvestor = INVESTORS.find((inv) => inv.name === nt.investor);
        setSelectedInvestor(matchedInvestor?.id || '');
        setSelectedSubscription(nt.subscription || '');
      } else {
        setAudienceMode('general');
        const fundName = nt?.fund || document.metadata?.fund || '';
        const matchedFund = FUNDS.find((f) => f !== 'all' && fundName.toLowerCase().includes(f.toLowerCase()));
        setSelectedFund(matchedFund || 'all');
        setSelectedShareClass(nt?.shareClass || '');
        const seg = nt?.segment;
        if (seg && seg !== 'Tous segments' && seg !== 'Tous les segments') {
          setSelectedSegments([seg]);
        } else {
          setSelectedSegments(document.target?.segments?.length ? document.target.segments : ['all']);
        }
      }
    }
  }, [defaultFolderId, isOpen]);

  const selectedInvestorProfile = useMemo(
    () => INVESTORS.find((inv) => inv.id === selectedInvestor),
    [selectedInvestor]
  );

  const structureOptions = selectedInvestorProfile?.structures || [];
  const selectedStructure = structureOptions.find((st) => st.id === selectedStructureId);
  const subscriptionOptions = useMemo(() => {
    if (!selectedInvestorProfile) return [];
    if (selectedStructure) return selectedStructure.subscriptions;
    return selectedInvestorProfile.subscriptions;
  }, [selectedInvestorProfile, selectedStructure]);

  const shareClassOptions = selectedFund !== 'all' ? SHARE_CLASSES_BY_FUND[selectedFund] || [] : [];

  const parentFolderRestrictions = useMemo(() => {
    if (folderInheritedRestrictions && folderInheritedRestrictions[parentFolderId]) {
      const entry = folderInheritedRestrictions[parentFolderId];
      return {
        fund: entry.fund ?? null,
        segments: entry.segments ?? [],
        shareClass: entry.shareClass ?? null,
      };
    }
    const fallback = collectParentFolderRestrictions(parentFolderId);
    return { ...fallback, shareClass: null };
  }, [parentFolderId, folderInheritedRestrictions]);
  const hasParentFolderRestrictions =
    !!parentFolderRestrictions.fund ||
    parentFolderRestrictions.segments.length > 0 ||
    !!parentFolderRestrictions.shareClass;

  useEffect(() => {
    if (!selectedInvestorProfile) return;
    setSelectedContactAccess((prev) => ({
      ...prev,
      [selectedInvestorProfile.id]: prev[selectedInvestorProfile.id] || selectedInvestorProfile.contacts.map((contact) => contact.name),
    }));
  }, [selectedInvestorProfile]);

  useEffect(() => {
    if (!document || !selectedInvestorProfile) return;
    const structureName = document.navigatorTargeting?.mode === 'nominative'
      ? document.navigatorTargeting.structure
      : undefined;
    if (!structureName) return;
    const matchedStructure = selectedInvestorProfile.structures.find((structure) => structure.name === structureName);
    if (matchedStructure) {
      setSelectedStructureId(matchedStructure.id);
    }
  }, [document, selectedInvestorProfile]);

  const targetedInvestors = useMemo(() => {
    if (audienceMode === 'general') {
      let candidates = INVESTORS;
      if (!selectedSegments.includes('all')) {
        candidates = candidates.filter((inv) => selectedSegments.includes(inv.segment));
      }
      if (selectedFund !== 'all') {
        candidates = candidates.filter((inv) => inv.fund === selectedFund);
      }
      return candidates;
    }

    const investor = selectedInvestorProfile;
    if (!investor) {
      return [] as InvestorProfile[];
    }
    if (selectedStructureId && !investor.structures.some((st) => st.id === selectedStructureId)) {
      return [] as InvestorProfile[];
    }
    if (selectedSubscription) {
      const authorizedSubscriptions = selectedStructure
        ? selectedStructure.subscriptions
        : investor.subscriptions;
      if (!authorizedSubscriptions.includes(selectedSubscription)) {
        return [] as InvestorProfile[];
      }
    }
    if (!selectedInvestor) {
      return [] as InvestorProfile[];
    }
    return [investor];
  }, [
    audienceMode,
    selectedSegments,
    selectedFund,
    selectedInvestor,
    selectedInvestorProfile,
    selectedSubscription,
    selectedStructureId,
    selectedStructure,
  ]);

  const audience = useMemo(() => {
    return {
      investors: targetedInvestors.length,
      contacts: targetedInvestors.reduce((sum, investor) => sum + investor.contacts.length, 0),
    };
  }, [targetedInvestors]);

  const teamOptions: MultiSelectOption[] = useMemo(
    () => TEAMS.map((team) => ({ value: team.id, label: team.name, icon: Users2 })),
    []
  );

  const selectedTeamsDetailed = useMemo(
    () => TEAMS.filter((team) => validationTeams.includes(team.id)),
    [validationTeams]
  );

  const totalValidators = useMemo(
    () => selectedTeamsDetailed.reduce((sum, team) => sum + team.validators.length, 0),
    [selectedTeamsDetailed]
  );

  const getInitials = (name: string) =>
    name
      .split(/[\s.]+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() || '')
      .slice(0, 2)
      .join('');

  const updateVersion = (language: 'fr' | 'en', patch: Partial<DocumentVersion>) => {
    setVersions((prev) => prev.map((version) => (version.language === language ? { ...version, ...patch } : version)));
  };

  const handleSubmit = () => {
    if (!versions.some((version) => version.name.trim() && version.fileName.trim())) {
      toast.error('Ajouter au moins une version FR ou EN du document.');
      return;
    }

    if (validationTeams.length === 0) {
      toast.error('Sélectionnez au moins une équipe de validation.');
      return;
    }

    const folderLabel = folderOptions.find((folder) => folder.id === parentFolderId)?.label || 'Dossier courant';
    toast.success('Document prêt à être ajouté', {
      description: `${audience.investors} investisseur(s), ${audience.contacts} contact(s) • ${folderLabel}`,
    });
    onClose();
  };

  const handleVersionFile = (language: 'fr' | 'en', file?: File | null) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const previewUrl = file.type.startsWith('image/') ? objectUrl : undefined;
    updateVersion(language, { fileName: file.name, previewUrl, fileUrl: objectUrl });
  };

  const handleRemoveVersionFile = (language: 'fr' | 'en') => {
    const current = versions.find((version) => version.language === language);
    if (current?.fileUrl) URL.revokeObjectURL(current.fileUrl);
    updateVersion(language, { fileName: '', previewUrl: undefined, fileUrl: undefined });
  };

  const handleExportScope = () => {
    if (targetedInvestors.length === 0) {
      toast.error('Aucun investisseur ciblé à exporter.');
      return;
    }
    const rows = ['Investisseur,Fonds,Segment,Contact,Rôle'];
    targetedInvestors.forEach((investor) => {
      investor.contacts.forEach((contact) => {
        rows.push(`"${investor.name}","${investor.fund}","${investor.segment}","${contact.name}","${contact.role}"`);
      });
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `scope-ciblage-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="h-full p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b bg-white">
          <div>
            <SheetTitle className="text-[26px] leading-8">{document ? 'Détail du document' : 'Ajouter un document'}</SheetTitle>
          <SheetDescription className="mt-1 text-[15px]">
            Créez des versions FR/EN, configurez l'audience et le workflow de validation.
          </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <section className="space-y-3 rounded-2xl p-4 border" style={{ backgroundColor: '#EEF1F7', borderColor: '#000E2B1F' }}>
            <div>
              <p className="font-semibold flex items-center gap-2" style={{ color: '#000E2B' }}><FileText className="w-5 h-5" style={{ color: '#000E2B' }} /> Document</p>
              <p className="text-sm text-slate-600">Versions, fichiers et emplacement du document.</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 md:p-5" style={{ borderColor: '#000E2B33' }}>
              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-11">
                  <TabsTrigger value="fr">🇫🇷 FR</TabsTrigger>
                  <TabsTrigger value="en">🇬🇧 EN</TabsTrigger>
                </TabsList>
                {(['fr', 'en'] as const).map((language) => {
                  const version = versions.find((item) => item.language === language)!;
                  return (
                    <TabsContent key={language} value={language} className="mt-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label>Nom du document ({language.toUpperCase()})</Label>
                          <Input
                            value={version.name}
                            onChange={(event) => updateVersion(language, { name: event.target.value })}
                            placeholder={`Nom ${language.toUpperCase()}`}
                            className="h-11"
                            disabled={isDetailMode}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>
                            {language === 'fr' ? 'Ajouter un document (FR)' : 'Ajouter un document (EN) optionnel'}
                          </Label>
                          <input
                            ref={(el) => { fileInputRefs.current[language] = el; }}
                            type="file"
                            className="hidden"
                            onChange={(event) => handleVersionFile(language, event.target.files?.[0])}
                          />
                          <div
                            onClick={() => {
                              const canUpload = !isDetailMode || (language === 'en' && !version.fileName);
                              if (canUpload) fileInputRefs.current[language]?.click();
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              const canUpload = !isDetailMode || (language === 'en' && !version.fileName);
                              if (canUpload) handleVersionFile(language, event.dataTransfer.files?.[0]);
                            }}
                            className={`rounded-xl border-2 border-dashed border-slate-300 bg-white/80 transition-colors p-5 ${
                              !isDetailMode || (language === 'en' && !version.fileName) ? 'hover:border-blue-400 cursor-pointer' : 'opacity-80'
                            }`}
                          >
                            {!version.fileName ? (
                              <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-600">
                                <UploadCloud className="w-8 h-8 text-slate-500" />
                                <p className="font-medium">Glissez-déposez ou cliquez pour choisir un fichier</p>
                                <p className="text-xs text-slate-500">PDF, DOCX, XLSX, PNG... max 10MB</p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                {version.previewUrl ? (
                                  <img src={version.previewUrl} alt={version.fileName} className="w-14 h-14 rounded-lg object-cover border" />
                                ) : (
                                  <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                                    <FileCheck2 className="w-6 h-6 text-blue-600" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-slate-900">{version.fileName}</p>
                                  <p className="text-xs text-slate-500">Fichier prêt à être envoyé</p>
                                </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (version.fileUrl) window.open(version.fileUrl, '_blank', 'noopener,noreferrer');
                                    }}
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                                    Aperçu
                                  </Button>
                                  {!isDetailMode && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleRemoveVersionFile(language);
                                      }}
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                      Supprimer
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          {isDetailMode && language === 'fr' && (
                            <p className="text-xs text-slate-500">La version FR existante ne peut pas être remplacée.</p>
                          )}
                          {isDetailMode && language === 'en' && !version.fileName && (
                            <p className="text-xs text-slate-500">Vous pouvez uniquement ajouter la version anglaise.</p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Date d'ajout</Label>
                <Input type="date" className="h-11" value={addDate} onChange={(event) => setAddDate(event.target.value)} disabled={isDetailMode} />
              </div>
              <div className="space-y-2">
                <Label>Dossier parent (dans l'espace courant)</Label>
                <FolderSelectionTreeviewDropdown
                  value={parentFolderId}
                  onChange={setParentFolderId}
                  folderOptions={folderOptions}
                  disabled={isDetailMode}
                  initialOpen={initialFolderPickerOpen}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl p-4 border" style={{ backgroundColor: '#EEF1F7', borderColor: '#000E2B1F' }}>
            <div>
              <p className="font-semibold flex items-center gap-2" style={{ color: '#000E2B' }}><Users2 className="w-5 h-5" style={{ color: '#000E2B' }} /> Audience</p>
              <p className="text-sm text-slate-600">Configuration des critères de ciblage.</p>
            </div>
            {hasParentFolderRestrictions && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600" />
                  Restrictions du dossier parent
                </div>
                <p className="text-xs text-amber-800">
                  Le ciblage de ce document sera automatiquement limité par les restrictions héritées du dossier parent.
                </p>
                <div className="flex flex-wrap gap-2">
                  {parentFolderRestrictions.fund && (
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-amber-700 font-medium">Fonds restreint</span>
                      <span className="text-amber-900 font-semibold">{parentFolderRestrictions.fund}</span>
                    </div>
                  )}
                  {parentFolderRestrictions.shareClass && (
                    <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-300 bg-white px-2 py-1 text-xs">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                      <span className="text-amber-700 font-medium">Part restreinte</span>
                      <span className="text-amber-900 font-semibold">{parentFolderRestrictions.shareClass}</span>
                    </div>
                  )}
                  {parentFolderRestrictions.segments.map((segment) => (
                    <div key={segment} className="inline-flex items-center gap-1.5 rounded-md border border-purple-300 bg-white px-2 py-1 text-xs">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-purple-700 font-medium">Segment restreint</span>
                      <span className="text-purple-900 font-semibold">{segment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 p-1 rounded-xl bg-slate-100 w-fit">
              <Button variant={audienceMode === 'general' ? 'default' : 'outline'} onClick={() => setAudienceMode('general')}>Document général</Button>
              <Button variant={audienceMode === 'nominative' ? 'default' : 'outline'} onClick={() => setAudienceMode('nominative')}>Document nominatif</Button>
            </div>

            {audienceMode === 'general' ? (
              <div className="space-y-4 border rounded-2xl p-5 bg-white shadow-sm" style={{ borderColor: '#000E2B33' }}>
                <div className="space-y-2">
                  <Label>Segments investisseurs</Label>
                  <SegmentsMultiSelect
                    value={selectedSegments.includes('all') ? [] : selectedSegments}
                    onChange={(next) => setSelectedSegments(next.length === 0 ? ['all'] : next)}
                    options={SEGMENTS}
                    placeholder="Tous les segments"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fonds</Label>
                    <FundSingleSelect
                      value={selectedFund === 'all' ? null : selectedFund}
                      onChange={(next) => {
                        setSelectedFund(next || 'all');
                        setSelectedShareClass('');
                      }}
                      options={FUNDS.filter((f) => f !== 'all')}
                      placeholder="Tous les fonds"
                    />
                  </div>
                  {selectedFund !== 'all' && (
                    <div className="space-y-2">
                      <Label>Part du fonds</Label>
                      <ShareClassSingleSelect
                        value={selectedShareClass || null}
                        onChange={(next) => setSelectedShareClass(next || '')}
                        options={shareClassOptions}
                        placeholder="Toutes les parts"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 border rounded-2xl p-5 bg-white" style={{ borderColor: '#000E2B1F' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Investisseur (unique)</Label>
                    <AutocompleteSingleSelect
                      value={selectedInvestor || null}
                      onChange={(value) => {
                        setSelectedInvestor(value || '');
                        setSelectedStructureId('');
                        setSelectedSubscription('');
                      }}
                      options={INVESTORS.map((inv) => ({
                        value: inv.id,
                        label: inv.name,
                      }))}
                      placeholder="Sélectionner un investisseur"
                      icon={UserRound}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Structure (optionnelle)</Label>
                    <AutocompleteSingleSelect
                      value={selectedStructureId || null}
                      onChange={(value) => {
                        setSelectedStructureId(value || '');
                        setSelectedSubscription('');
                      }}
                      options={structureOptions.map((st) => ({
                        value: st.id,
                        label: st.name,
                        description: `${st.subscriptions.length} souscription${st.subscriptions.length > 1 ? 's' : ''}`,
                      }))}
                      placeholder="Toutes les structures"
                      icon={Building2}
                      disabled={!selectedInvestor}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Souscription (optionnelle)</Label>
                    <AutocompleteSingleSelect
                      value={selectedSubscription || null}
                      onChange={(value) => setSelectedSubscription(value || '')}
                      options={subscriptionOptions.map((sub) => ({
                        value: sub,
                        label: sub,
                      }))}
                      placeholder="Toutes les souscriptions"
                      icon={FileText}
                      disabled={!selectedInvestor}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border p-4 space-y-4" style={{ borderColor: '#000E2B1F', backgroundColor: '#EEF1F7' }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold flex items-center gap-2" style={{ color: '#000E2B' }}><ShieldCheck className="w-5 h-5" style={{ color: '#000E2B' }} /> Droits d'accès</p>
                    <p className="text-sm text-slate-600">Ce document sera visible selon le ciblage défini.</p>
                  </div>
                  {audienceMode === 'general' && (
                  <Button variant="outline" onClick={handleExportScope} style={{ borderColor: '#000E2B', color: '#000E2B' }}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  )}
                </div>
                {audienceMode === 'general' ? (
                  <AudienceCounterCards investors={audience.investors} contacts={audience.contacts} />
                ) : (
                  selectedInvestorProfile ? (
                    <div className="rounded-2xl border bg-white p-4 space-y-3" style={{ borderColor: '#000E2B1F' }}>
                      <div>
                        <p className="text-xl font-semibold" style={{ color: '#000E2B' }}>{selectedInvestorProfile.name}</p>
                      </div>
                      <div className="border-t pt-3 space-y-2">
                        <p className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#000E2B' }}>Contacts autorisés</p>
                        <div className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: '#000E2B1F', backgroundColor: '#EEF1F7' }}>
                          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF1F7', color: '#000E2B' }}>
                            <UserRound className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium flex items-center gap-2" style={{ color: '#000E2B' }}>
                              {selectedInvestorProfile.name}
                              <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium" style={{ borderColor: '#000E2B', backgroundColor: '#EEF1F7', color: '#000E2B' }}>
                                <Star className="w-3 h-3 fill-current" />
                                Principal
                              </span>
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Investisseur principal (obligatoire)</p>
                          </div>
                        </div>
                        {selectedInvestorProfile.contacts.map((contact) => (
                          <div key={contact.name} className="rounded-xl border bg-white p-3 flex items-center gap-3" style={{ borderColor: '#000E2B1F' }}>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEF1F7', color: '#000E2B' }}>
                              <UserRound className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: '#000E2B' }}>{contact.name}</p>
                              <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">Sélectionnez un investisseur pour définir les accès contacts.</p>
                  )
                )}
              </div>

          </section>

          <section className="space-y-4 rounded-2xl p-4 border" style={{ backgroundColor: '#EEF1F7', borderColor: '#000E2B1F' }}>
            <div>
              <p className="font-semibold flex items-center gap-2" style={{ color: '#000E2B' }}><Bell className="w-5 h-5" style={{ color: '#000E2B' }} /> Notification</p>
              <p className="text-sm text-slate-600">Notifications immédiates et relances automatiques.</p>
            </div>
            {isDetailMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-xl p-4 bg-white" style={{ borderColor: '#000E2B33' }}>
                  <Label>Notification document</Label>
                  {detailState?.notification ? (
                    <p className="text-sm text-slate-700">
                      Notification envoyée le <span className="font-medium">{formatFrenchDate(detailState.notification.sentAt)}</span> via le gabarit <span className="font-medium">{detailState.notification.template}</span>.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">Aucune notification envoyée pour ce document.</p>
                  )}
                </div>
                <div className="space-y-2 border rounded-xl p-4 bg-white" style={{ borderColor: '#000E2B33' }}>
                  <Label>Relance auto si non consulté</Label>
                  {detailState?.reminder?.dueInDays !== undefined ? (
                    <p className="text-sm text-slate-700">Relance prévue dans <span className="font-medium">{detailState.reminder.dueInDays} jour(s)</span> avec le gabarit <span className="font-medium">{detailState.reminder.template}</span>.</p>
                  ) : detailState?.reminder?.sentAt ? (
                    <p className="text-sm text-slate-700">Relance envoyée le <span className="font-medium">{formatFrenchDate(detailState.reminder.sentAt)}</span> avec le gabarit <span className="font-medium">{detailState.reminder.template}</span>.</p>
                  ) : (
                    <p className="text-sm text-slate-500">Aucune relance automatique configurée.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3 border rounded-xl p-4" style={{ borderColor: '#000E2B33' }}>
                  <div className="flex items-center justify-between">
                    <Label>Notification document</Label>
                    <Switch checked={notify} onCheckedChange={setNotify} />
                  </div>
                  <Select value={notifyTemplate} onValueChange={setNotifyTemplate} disabled={!notify}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MAIL_TEMPLATES.map((template) => <SelectItem key={template} value={template}>{template}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 border rounded-xl p-4" style={{ borderColor: '#000E2B33' }}>
                  <div className="flex items-center justify-between">
                    <Label>Relance auto si non consulté</Label>
                    <Switch checked={reminder} onCheckedChange={setReminder} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={reminderDelay} onValueChange={setReminderDelay} disabled={!reminder}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{REMINDER_DELAYS.map((delay) => <SelectItem key={delay} value={delay}>{delay}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={reminderTemplate} onValueChange={setReminderTemplate} disabled={!reminder}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MAIL_TEMPLATES.map((template) => <SelectItem key={template} value={template}>{template}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-3 pb-2 rounded-2xl p-4 border" style={{ backgroundColor: '#EEF1F7', borderColor: '#000E2B1F' }}>
            <div>
              <p className="font-semibold flex items-center gap-2" style={{ color: '#000E2B' }}><Check className="w-5 h-5" style={{ color: '#000E2B' }} /> Validation</p>
              <p className="text-sm text-slate-600">Équipes de validation et validateurs associés.</p>
            </div>
            {isDetailMode ? (
              <>
                {detailState?.validation.status === 'approved' ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Document validé</p>
                    <p className="text-sm text-emerald-700 mt-1">Équipe: {detailState.validation.team} • Validé par {detailState.validation.validator}</p>
                    <p className="text-sm text-emerald-700">Le {formatFrenchDate(detailState.validation.validatedAt || '')}</p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="font-semibold text-amber-800 flex items-center gap-2"><Clock3 className="h-4 w-4" /> En attente de validation</p>
                      <p className="text-sm text-amber-700 mt-1">Ce document est en cours de revue par les équipes de validation.</p>
                    </div>
                    <div className="rounded-xl border bg-white p-4 space-y-3" style={{ borderColor: '#000E2B33' }}>
                      <p className="font-medium text-slate-900">Équipes de validation et personnes associées</p>
                      <div className="space-y-2">
                        {TEAMS.map((team) => (
                          <div key={team.id} className="rounded-lg border p-3" style={{ borderColor: '#000E2B33' }}>
                            <p className="font-medium text-slate-800">{team.name}</p>
                            <p className="text-sm text-slate-600 mt-1">Personnes: {team.validators.join(', ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-800">Équipes de validation</Label>
                  <ModernMultiSelect
                    options={teamOptions}
                    value={validationTeams}
                    onChange={setValidationTeams}
                    placeholder="Sélectionner une ou plusieurs équipes…"
                    searchPlaceholder="Rechercher une équipe…"
                    maxDisplay={4}
                    showIconInBadge
                    badgeStyle={{ color: '#7a7a7a', borderColor: '#ddd7cc', backgroundColor: '#f5f3ee', border: '1px solid #ddd7cc' }}
                  />
                  <p className="text-xs text-slate-500">
                    Sélectionnez les équipes qui devront approuver ce document. Tous les validateurs de chaque équipe seront notifiés.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF1F7', color: '#000E2B' }}>
                        <Users2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">Détail des validateurs</p>
                        <p className="text-xs text-slate-500">
                          Personnes qui recevront la demande de validation
                        </p>
                      </div>
                    </div>
                    {selectedTeamsDetailed.length > 0 && (
                      <Badge variant="outline" style={{ backgroundColor: '#EEF1F7', borderColor: '#000E2B', color: '#000E2B' }}>
                        {totalValidators} {totalValidators > 1 ? 'validateurs' : 'validateur'} · {selectedTeamsDetailed.length} {selectedTeamsDetailed.length > 1 ? 'équipes' : 'équipe'}
                      </Badge>
                    )}
                  </div>

                  {selectedTeamsDetailed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/60 py-8 text-center">
                      <Users2 className="w-6 h-6 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700">Aucune équipe sélectionnée</p>
                      <p className="text-xs text-slate-500">
                        Choisissez une ou plusieurs équipes ci-dessus pour afficher leurs validateurs.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTeamsDetailed.map((team) => (
                        <div
                          key={team.id}
                          className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800">{team.name}</p>
                            <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 text-[11px]">
                              {team.validators.length} {team.validators.length > 1 ? 'validateurs' : 'validateur'}
                            </Badge>
                          </div>
                          <ul className="space-y-1.5">
                            {team.validators.map((validator) => (
                              <li
                                key={`${team.id}-${validator}`}
                                className="flex items-center gap-2 rounded-md bg-white border border-slate-200 px-2 py-1.5"
                              >
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="text-[10px] font-semibold bg-gradient-to-r from-black to-[#0F323D] text-white">
                                    {getInitials(validator)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-slate-800 truncate">{validator}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

        </div>
        <div className="border-t bg-white px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit}>{document ? 'Enregistrer' : 'Valider'}</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
