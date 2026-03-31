import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
import { ChevronDown, ChevronRight, UploadCloud, FileCheck2, Download, Users2, UserRound, Mail, Eye, Trash2, Check, Folder, FileText, Bell, ShieldCheck, Clock3, CheckCircle2, Star } from 'lucide-react';
import { Document } from '../utils/documentMockData';
import { DocumentTargetingMarker } from './DocumentTargetingMarker';

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

interface DocumentAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderOptions: FolderOption[];
  defaultFolderId: string;
  document?: Document | null;
  initialFolderPickerOpen?: boolean;
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
        className="w-[420px] min-w-[var(--radix-popover-trigger-width)] p-0 max-h-[460px] overflow-hidden rounded-xl border border-gray-200 shadow-xl"
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
        <div
          className="h-[390px] overflow-y-scroll overscroll-contain p-2 pr-1.5"
          style={{ scrollbarGutter: 'stable' }}
        >
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

export function DocumentAddModal({ isOpen, onClose, folderOptions, defaultFolderId, document, initialFolderPickerOpen = false }: DocumentAddModalProps) {
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
  const detailState = document ? (documentLifecycleMock[document.id] || { validation: { status: 'pending' as const } }) : null;

  useEffect(() => {
    if (!isOpen) return;
    setParentFolderId(defaultFolderId);
    setAddDate(new Date().toISOString().slice(0, 10));
    if (document) {
      setVersions([
        { language: 'fr', name: document.name, fileName: document.name },
        { language: 'en', name: document.name, fileName: '' },
      ]);
      setSelectedFund(document.metadata?.fund || 'all');
      setAudienceMode(document.target?.type === 'investor' ? 'nominative' : 'general');
      setSelectedInvestor(document.target?.investors?.[0] || '');
      setSelectedSubscription(document.target?.subscriptions?.[0] || '');
      setSelectedSegments(document.target?.segments?.length ? document.target.segments : ['all']);
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

  const selectedValidators = useMemo(() => {
    return TEAMS.filter((team) => validationTeams.includes(team.id)).flatMap((team) =>
      team.validators.map((validator) => ({ team: team.name, validator }))
    );
  }, [validationTeams]);

  const updateVersion = (language: 'fr' | 'en', patch: Partial<DocumentVersion>) => {
    setVersions((prev) => prev.map((version) => (version.language === language ? { ...version, ...patch } : version)));
  };

  const toggleArrayValue = (list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
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
          <section className="space-y-3 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Document</p>
              <p className="text-sm text-slate-600">Versions, fichiers et emplacement du document.</p>
            </div>
            <div className="rounded-2xl border bg-gradient-to-b from-white to-slate-50 p-4 md:p-5">
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

          <section className="space-y-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-2"><Users2 className="w-5 h-5 text-blue-600" /> Audience</p>
              <p className="text-sm text-slate-600">Configuration des critères de ciblage.</p>
            </div>
            {isDetailMode && document && (
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ciblage harmonisé</p>
                <DocumentTargetingMarker document={document} />
              </div>
            )}
            <div className="flex gap-2 p-1 rounded-xl bg-slate-100 w-fit">
              <Button variant={audienceMode === 'general' ? 'default' : 'outline'} onClick={() => setAudienceMode('general')} disabled={isDetailMode}>Document général</Button>
              <Button variant={audienceMode === 'nominative' ? 'default' : 'outline'} onClick={() => setAudienceMode('nominative')} disabled={isDetailMode}>Document nominatif</Button>
            </div>

            {audienceMode === 'general' ? (
              <div className="space-y-4 border rounded-2xl p-5 bg-gradient-to-br from-white to-blue-50/40 shadow-sm">
                <div className="space-y-2">
                  <Label>Segments investisseurs</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between h-11 font-normal" disabled={isDetailMode}>
                        {selectedSegments.includes('all')
                          ? 'Tous les segments'
                          : `${selectedSegments.length} segment(s) sélectionné(s)`}
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[320px]">
                      <DropdownMenuCheckboxItem
                        checked={selectedSegments.includes('all')}
                        onCheckedChange={(checked) => setSelectedSegments(checked ? ['all'] : [])}
                      >
                        Tous les segments
                      </DropdownMenuCheckboxItem>
                      {SEGMENTS.map((segment) => (
                        <DropdownMenuCheckboxItem
                          key={segment}
                          checked={selectedSegments.includes(segment)}
                          onCheckedChange={(checked) => {
                            let next = selectedSegments.filter((item) => item !== 'all');
                            if (isDetailMode) return;
                            next = checked ? [...next, segment] : next.filter((item) => item !== segment);
                            if (next.length === 0) next = ['all'];
                            setSelectedSegments(next);
                          }}
                        >
                          {segment}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fonds</Label>
                    <Select
                      value={selectedFund}
                      onValueChange={(value) => {
                        if (isDetailMode) return;
                        setSelectedFund(value);
                        setSelectedShareClass('');
                      }}
                      disabled={isDetailMode}
                    >
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FUNDS.map((fund) => (
                          <SelectItem key={fund} value={fund}>
                            {fund === 'all' ? 'Tous les fonds' : fund}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedFund !== 'all' && (
                    <div className="space-y-2">
                      <Label>Part du fonds</Label>
                      <Select
                        value={selectedShareClass || 'all'}
                        onValueChange={(value) => setSelectedShareClass(value === 'all' ? '' : value)}
                        disabled={isDetailMode}
                      >
                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les parts</SelectItem>
                          {shareClassOptions.map((shareClass) => (
                            <SelectItem key={shareClass} value={shareClass}>{shareClass}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 border rounded-2xl p-5 bg-gradient-to-br from-white to-indigo-50/40 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Investisseur (unique)</Label>
                    <Select
                      value={selectedInvestor || 'none'}
                      onValueChange={(value) => {
                        if (isDetailMode) return;
                        const nextInvestor = value === 'none' ? '' : value;
                        setSelectedInvestor(nextInvestor);
                        setSelectedStructureId('');
                        setSelectedSubscription('');
                      }}
                    >
                      <SelectTrigger className="h-11" disabled={isDetailMode}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sélectionner</SelectItem>
                        {INVESTORS.map((investor) => <SelectItem key={investor.id} value={investor.id}>{investor.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Structure (optionnelle)</Label>
                    <Select
                      value={selectedStructureId || 'none'}
                      onValueChange={(value) => {
                        if (isDetailMode) return;
                        setSelectedStructureId(value === 'none' ? '' : value);
                        setSelectedSubscription('');
                      }}
                      disabled={!selectedInvestor || isDetailMode}
                    >
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Toutes les structures</SelectItem>
                        {structureOptions.map((structure) => (
                          <SelectItem key={structure.id} value={structure.id}>{structure.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Souscription (optionnelle)</Label>
                    <Select
                      value={selectedSubscription || 'none'}
                      onValueChange={(value) => setSelectedSubscription(value === 'none' ? '' : value)}
                      disabled={!selectedInvestor || isDetailMode}
                    >
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Toutes les souscriptions</SelectItem>
                        {subscriptionOptions.map((subscription) => (
                          <SelectItem key={subscription} value={subscription}>{subscription}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-600" /> Droits d'accès</p>
                    <p className="text-sm text-slate-600">Ce document sera visible selon le ciblage défini.</p>
                  </div>
                  {audienceMode === 'general' && (
                  <Button variant="outline" className="border-blue-300 text-blue-700" onClick={handleExportScope}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  )}
                </div>
                {audienceMode === 'general' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-blue-200 bg-white p-3">
                    <p className="text-blue-700 text-sm font-medium">Investisseurs</p>
                    <p className="text-3xl font-bold text-blue-800">{audience.investors}</p>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-white p-3">
                    <p className="text-indigo-700 text-sm font-medium">Contacts</p>
                    <p className="text-3xl font-bold text-indigo-800">{audience.contacts}</p>
                  </div>
                </div>
                ) : (
                  selectedInvestorProfile ? (
                    <div className="rounded-2xl border bg-white p-4 space-y-3">
                      <div>
                        <p className="text-xl font-semibold text-slate-900">{selectedInvestorProfile.name}</p>
                      </div>
                      <div className="border-t pt-3 space-y-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Contacts autorisés</p>
                        <div className="rounded-xl border bg-blue-50/60 p-3 flex items-center gap-3">
                          <Checkbox checked disabled />
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                            <UserRound className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 flex items-center gap-2">
                              {selectedInvestorProfile.name}
                              <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                <Star className="w-3 h-3 fill-current" />
                                Principal
                              </span>
                            </p>
                            <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Investisseur principal (obligatoire)</p>
                          </div>
                        </div>
                        {selectedInvestorProfile.contacts.map((contact) => {
                          const selected = (selectedContactAccess[selectedInvestorProfile.id] || []).includes(contact.name);
                          return (
                            <label key={contact.name} className="rounded-xl border bg-slate-50 p-3 flex items-center gap-3 cursor-pointer">
                              <Checkbox
                                checked={selected}
                                onCheckedChange={(checked) => {
                                  const current = selectedContactAccess[selectedInvestorProfile.id] || [];
                                  const next = checked
                                    ? Array.from(new Set([...current, contact.name]))
                                    : current.filter((name) => name !== contact.name);
                                  setSelectedContactAccess((prev) => ({ ...prev, [selectedInvestorProfile.id]: next }));
                                }}
                              />
                              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                                <UserRound className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{contact.name}</p>
                                <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.role}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">Sélectionnez un investisseur pour définir les accès contacts.</p>
                  )
                )}
              </div>

          </section>

          <section className="space-y-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600" /> Notification</p>
              <p className="text-sm text-slate-600">Notifications immédiates et relances automatiques.</p>
            </div>
            {isDetailMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2 border rounded-xl p-4 bg-white">
                  <Label>Notification document</Label>
                  {detailState?.notification ? (
                    <p className="text-sm text-slate-700">
                      Notification envoyée le <span className="font-medium">{detailState.notification.sentAt}</span> via le gabarit <span className="font-medium">{detailState.notification.template}</span>.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-500">Aucune notification envoyée pour ce document.</p>
                  )}
                </div>
                <div className="space-y-2 border rounded-xl p-4 bg-white">
                  <Label>Relance auto si non consulté</Label>
                  {detailState?.reminder?.dueInDays !== undefined ? (
                    <p className="text-sm text-slate-700">Relance prévue dans <span className="font-medium">{detailState.reminder.dueInDays} jour(s)</span> avec le gabarit <span className="font-medium">{detailState.reminder.template}</span>.</p>
                  ) : detailState?.reminder?.sentAt ? (
                    <p className="text-sm text-slate-700">Relance envoyée le <span className="font-medium">{detailState.reminder.sentAt}</span> avec le gabarit <span className="font-medium">{detailState.reminder.template}</span>.</p>
                  ) : (
                    <p className="text-sm text-slate-500">Aucune relance automatique configurée.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3 border rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <Label>Notification document</Label>
                    <Switch checked={notify} onCheckedChange={setNotify} />
                  </div>
                  <Select value={notifyTemplate} onValueChange={setNotifyTemplate} disabled={!notify}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MAIL_TEMPLATES.map((template) => <SelectItem key={template} value={template}>{template}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 border rounded-xl p-4">
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

          <section className="space-y-3 pb-2 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div>
              <p className="font-semibold text-slate-900 flex items-center gap-2"><Check className="w-5 h-5 text-blue-600" /> Validation</p>
              <p className="text-sm text-slate-600">Équipes de validation et validateurs associés.</p>
            </div>
            {isDetailMode ? (
              <>
                {detailState?.validation.status === 'approved' ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Document validé</p>
                    <p className="text-sm text-emerald-700 mt-1">Équipe: {detailState.validation.team} • Validé par {detailState.validation.validator}</p>
                    <p className="text-sm text-emerald-700">Le {detailState.validation.validatedAt}</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="font-semibold text-amber-800 flex items-center gap-2"><Clock3 className="h-4 w-4" /> En attente de validation</p>
                    <p className="text-sm text-amber-700 mt-1">Ce document est en cours de revue par les équipes de validation.</p>
                  </div>
                )}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                  <p className="font-medium text-slate-900">Équipes de validation et personnes associées</p>
                  <div className="space-y-2">
                    {TEAMS.map((team) => (
                      <div key={team.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="font-medium text-slate-800">{team.name}</p>
                        <p className="text-sm text-slate-600 mt-1">Personnes: {team.validators.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {TEAMS.map((team) => (
                    <label key={team.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                      <Checkbox
                        checked={validationTeams.includes(team.id)}
                        onCheckedChange={() => toggleArrayValue(validationTeams, team.id, setValidationTeams)}
                      />
                      {team.name}
                    </label>
                  ))}
                </div>
                <div className="border rounded-xl p-3 text-sm space-y-1">
                  <p className="font-medium">Détail des validateurs</p>
                  {selectedValidators.length === 0 ? (
                    <p className="text-gray-500">Aucune équipe sélectionnée.</p>
                  ) : (
                    selectedValidators.map((item) => <p key={`${item.team}-${item.validator}`}>• {item.validator} ({item.team})</p>)
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
