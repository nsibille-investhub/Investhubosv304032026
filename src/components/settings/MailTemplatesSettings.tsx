import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr as frLocale, enUS as enLocale } from 'date-fns/locale';
import {
  Archive,
  Copy,
  Download,
  FileEdit,
  Layers,
  List,
  Mail,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation, type Language } from '../../utils/languageContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FilterCard } from '../ui/filter-card';
import { PageHeader } from '../ui/page-header';
import { DataPagination } from '../ui/data-pagination';
import { RowActionButton } from '../ui/row-actions';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { cn } from '../ui/utils';
import { FilterBar, type FilterConfig } from '../FilterBar';
import { DataTable, type ColumnConfig } from '../DataTable';
import { LanguageFlagInline } from '../LanguageFlagInline';

type TemplateStatus = 'active' | 'draft' | 'archived';
type StatusTab = TemplateStatus | 'all';
type TemplateCategory =
  | 'onboarding'
  | 'subscription'
  | 'reminder'
  | 'automatic'
  | 'reporting'
  | 'compliance';
type UsagePreset = 'never' | 'low' | 'high';

interface MailTemplate {
  id: number;
  name: string;
  subject: string;
  category: TemplateCategory;
  group: string;
  status: TemplateStatus;
  languages: string[];
  usageCount: number;
  lastSentAt: string | null;
  updatedAt: string;
  updatedBy: string;
  body: string;
}

const CATEGORIES: TemplateCategory[] = [
  'onboarding',
  'subscription',
  'reminder',
  'automatic',
  'reporting',
  'compliance',
];

const STATUSES: TemplateStatus[] = ['active', 'draft', 'archived'];

const STATUS_TAB_ORDER: StatusTab[] = ['all', 'active', 'draft', 'archived'];

const STATUS_BADGE_STYLES: Record<TemplateStatus, string> = {
  active:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  draft:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  archived:
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const STATUS_ICON: Record<TemplateStatus, React.ComponentType<{ className?: string }>> = {
  active: Send,
  draft: FileEdit,
  archived: Archive,
};

const STATUS_TAB_ICON: Record<StatusTab, React.ComponentType<{ className?: string }>> = {
  all: List,
  active: Send,
  draft: FileEdit,
  archived: Archive,
};

const STATUS_TAB_ICON_CLASS: Record<StatusTab, string | undefined> = {
  all: undefined,
  active: 'text-emerald-600',
  draft: 'text-amber-600',
  archived: 'text-gray-500',
};

const CATEGORY_BADGE_STYLES: Record<TemplateCategory, string> = {
  onboarding:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
  subscription:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800',
  reminder:
    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
  automatic:
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800',
  reporting:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800',
  compliance:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
};

const MAIL_GROUPS = [
  'Onboarding',
  'LPs',
  'Notices - Appels et Distributions',
  'Reportings et AIC',
  'Invitation aux réunions LP',
  'Autre',
];

const MOCK_TEMPLATES: MailTemplate[] = [
  {
    id: 1,
    name: 'Bienvenue investisseur',
    subject: 'Bienvenue chez InvestHub',
    category: 'onboarding',
    group: 'Onboarding',
    status: 'active',
    languages: ['fr', 'en'],
    usageCount: 245,
    lastSentAt: '2026-08-11T09:12:00Z',
    updatedAt: '2025-10-15T14:30:00Z',
    updatedBy: 'Camille',
    body: 'Bonjour {{firstName}},\n\nVotre accès à votre Espace LP est désormais actif. Vous pouvez consulter vos positions, vos documents et vos appels de fonds à tout moment.\n\nConnectez-vous ici : {{loginUrl}}\n\nL’équipe InvestHub',
  },
  {
    id: 2,
    name: 'Confirmation souscription',
    subject: 'Confirmation de votre souscription',
    category: 'subscription',
    group: 'LPs',
    status: 'active',
    languages: ['fr', 'en', 'es'],
    usageCount: 189,
    lastSentAt: '2026-08-12T16:40:00Z',
    updatedAt: '2025-10-20T09:05:00Z',
    updatedBy: 'Nicolas',
    body: 'Bonjour {{firstName}},\n\nNous confirmons la réception de votre souscription de {{amount}} sur le fonds {{fundName}}.\n\nVotre dossier passe en revue de conformité. Vous serez notifié dès sa validation.\n\nL’équipe InvestHub',
  },
  {
    id: 3,
    name: 'Relance documents',
    subject: 'Documents manquants pour votre dossier',
    category: 'reminder',
    group: 'LPs',
    status: 'active',
    languages: ['fr'],
    usageCount: 156,
    lastSentAt: '2026-08-10T08:00:00Z',
    updatedAt: '2025-10-10T11:20:00Z',
    updatedBy: 'Camille',
    body: 'Bonjour {{firstName}},\n\nIl manque {{documentCount}} document(s) pour finaliser votre dossier de souscription.\n\nDéposez-les directement depuis votre Espace LP : {{dataRoomUrl}}\n\nL’équipe InvestHub',
  },
  {
    id: 4,
    name: 'Rappel automatique',
    subject: 'Rappel : action requise',
    category: 'automatic',
    group: 'Autre',
    status: 'active',
    languages: ['fr', 'en'],
    usageCount: 432,
    lastSentAt: '2026-08-13T06:30:00Z',
    updatedAt: '2025-10-25T17:45:00Z',
    updatedBy: 'Sofia',
    body: 'Bonjour {{firstName}},\n\nUne action reste en attente sur votre dossier {{dossierRef}}. Merci de la traiter avant le {{dueDate}}.\n\nL’équipe InvestHub',
  },
  {
    id: 5,
    name: 'Notice d’appel de fonds',
    subject: 'Appel de fonds — {{fundName}}',
    category: 'reporting',
    group: 'Notices - Appels et Distributions',
    status: 'active',
    languages: ['fr', 'en'],
    usageCount: 318,
    lastSentAt: '2026-07-30T10:15:00Z',
    updatedAt: '2026-02-04T10:10:00Z',
    updatedBy: 'Nicolas',
    body: 'Bonjour {{firstName}},\n\nUn appel de fonds de {{amount}} est émis sur le fonds {{fundName}}, avec une date de valeur au {{dueDate}}.\n\nLa notice détaillée est disponible dans votre Espace LP.\n\nL’équipe InvestHub',
  },
  {
    id: 6,
    name: 'Notice de distribution',
    subject: 'Distribution — {{fundName}}',
    category: 'reporting',
    group: 'Notices - Appels et Distributions',
    status: 'active',
    languages: ['fr', 'en'],
    usageCount: 204,
    lastSentAt: '2026-06-28T09:00:00Z',
    updatedAt: '2026-02-04T10:25:00Z',
    updatedBy: 'Nicolas',
    body: 'Bonjour {{firstName}},\n\nUne distribution de {{amount}} vous est versée au titre du fonds {{fundName}}.\n\nLe détail figure dans la notice joignable depuis votre Espace LP.\n\nL’équipe InvestHub',
  },
  {
    id: 7,
    name: 'Invitation réunion annuelle LP',
    subject: 'Invitation — réunion annuelle des porteurs',
    category: 'onboarding',
    group: 'Invitation aux réunions LP',
    status: 'draft',
    languages: ['fr', 'en'],
    usageCount: 0,
    lastSentAt: null,
    updatedAt: '2026-07-18T15:00:00Z',
    updatedBy: 'Sofia',
    body: 'Bonjour {{firstName}},\n\nNous avons le plaisir de vous convier à la réunion annuelle des porteurs du {{eventDate}}.\n\nMerci de confirmer votre présence via le lien suivant : {{rsvpUrl}}\n\nL’équipe InvestHub',
  },
  {
    id: 8,
    name: 'Relance KYC expiré',
    subject: 'Vos pièces KYC arrivent à expiration',
    category: 'compliance',
    group: 'LPs',
    status: 'active',
    languages: ['fr', 'en'],
    usageCount: 87,
    lastSentAt: '2026-08-05T07:45:00Z',
    updatedAt: '2026-05-12T13:35:00Z',
    updatedBy: 'Camille',
    body: 'Bonjour {{firstName}},\n\nVos pièces justificatives expirent le {{expiryDate}}. Merci de déposer des pièces à jour afin de maintenir votre dossier conforme.\n\nL’équipe InvestHub',
  },
  {
    id: 9,
    name: 'Reporting trimestriel disponible',
    subject: 'Votre reporting {{quarter}} est disponible',
    category: 'reporting',
    group: 'Reportings et AIC',
    status: 'active',
    languages: ['fr', 'en', 'es'],
    usageCount: 512,
    lastSentAt: '2026-07-15T08:00:00Z',
    updatedAt: '2026-06-02T09:40:00Z',
    updatedBy: 'Sofia',
    body: 'Bonjour {{firstName}},\n\nVotre reporting {{quarter}} pour le fonds {{fundName}} est disponible dans votre Espace LP.\n\nL’équipe InvestHub',
  },
  {
    id: 10,
    name: 'Relance signature électronique',
    subject: 'Votre signature est attendue',
    category: 'reminder',
    group: 'LPs',
    status: 'active',
    languages: ['fr'],
    usageCount: 143,
    lastSentAt: '2026-08-09T14:20:00Z',
    updatedAt: '2026-04-21T16:15:00Z',
    updatedBy: 'Nicolas',
    body: 'Bonjour {{firstName}},\n\nLe bulletin de souscription {{dossierRef}} attend votre signature électronique.\n\nSignez en un clic : {{signatureUrl}}\n\nL’équipe InvestHub',
  },
  {
    id: 11,
    name: 'Ancien modèle de bienvenue',
    subject: 'Bienvenue sur la plateforme',
    category: 'onboarding',
    group: 'Onboarding',
    status: 'archived',
    languages: ['fr'],
    usageCount: 1204,
    lastSentAt: '2025-03-14T10:00:00Z',
    updatedAt: '2025-03-14T10:00:00Z',
    updatedBy: 'Camille',
    body: 'Bonjour {{firstName}},\n\nBienvenue sur la plateforme. Votre compte a été créé.\n\nL’équipe InvestHub',
  },
  {
    id: 12,
    name: 'Notification changement de RIB',
    subject: 'Modification de vos coordonnées bancaires',
    category: 'compliance',
    group: 'Autre',
    status: 'draft',
    languages: ['fr', 'en'],
    usageCount: 0,
    lastSentAt: null,
    updatedAt: '2026-08-01T11:05:00Z',
    updatedBy: 'Sofia',
    body: 'Bonjour {{firstName}},\n\nUne modification de vos coordonnées bancaires a été enregistrée le {{changeDate}}. Si vous n’êtes pas à l’origine de cette demande, contactez-nous immédiatement.\n\nL’équipe InvestHub',
  },
];

const CURRENT_USER = 'Jean';

const VARIABLE_PATTERN = /\{\{(\w+)\}\}/g;

function nextTemplateId(templates: MailTemplate[]): number {
  return templates.reduce((max, tpl) => Math.max(max, tpl.id), 0) + 1;
}

function extractVariables(template: MailTemplate): string[] {
  const found = new Set<string>();
  for (const source of [template.subject, template.body]) {
    for (const match of source.matchAll(VARIABLE_PATTERN)) {
      found.add(match[1]);
    }
  }
  return Array.from(found);
}

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function highlightMatch(text: string, term: string): React.ReactNode {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-100 text-gray-900 dark:bg-amber-950/30 dark:text-amber-100 rounded-sm px-0.5">
        {text.slice(idx, idx + term.length)}
      </mark>
      {text.slice(idx + term.length)}
    </>
  );
}

interface TemplateDraft {
  name: string;
  subject: string;
  category: TemplateCategory;
  group: string;
  status: TemplateStatus;
  body: string;
}

const EMPTY_DRAFT: TemplateDraft = {
  name: '',
  subject: '',
  category: 'onboarding',
  group: MAIL_GROUPS[0],
  status: 'draft',
  body: '',
};

export function MailTemplatesSettings() {
  const { t, lang } = useTranslation();
  const dfLocale = (lang as Language) === 'en' ? enLocale : frLocale;

  const [templates, setTemplates] = useState<MailTemplate[]>(MOCK_TEMPLATES);
  const [activeStatus, setActiveStatus] = useState<StatusTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'updatedAt',
    direction: 'desc',
  });
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [previewTemplate, setPreviewTemplate] = useState<MailTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<MailTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draft, setDraft] = useState<TemplateDraft>(EMPTY_DRAFT);
  const [templateToDelete, setTemplateToDelete] = useState<MailTemplate | null>(null);

  const authors = useMemo(
    () => Array.from(new Set(templates.map((tpl) => tpl.updatedBy))).sort(),
    [templates],
  );

  const groups = useMemo(
    () => Array.from(new Set(templates.map((tpl) => tpl.group))).sort(),
    [templates],
  );

  const searchFilteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return templates;
    return templates.filter(
      (tpl) =>
        tpl.name.toLowerCase().includes(term) ||
        tpl.subject.toLowerCase().includes(term) ||
        tpl.body.toLowerCase().includes(term),
    );
  }, [templates, searchTerm]);

  const filteredData = useMemo(() => {
    const categoryValue = activeFilters.category as TemplateCategory | undefined;
    const groupValue = activeFilters.group as string | undefined;
    const languageValue = activeFilters.language as string | undefined;
    const authorValue = activeFilters.author as string | undefined;
    const usageValue = activeFilters.usage as UsagePreset | undefined;

    return searchFilteredData.filter((tpl) => {
      if (activeStatus !== 'all' && tpl.status !== activeStatus) return false;
      if (categoryValue && tpl.category !== categoryValue) return false;
      if (groupValue && tpl.group !== groupValue) return false;
      if (languageValue && !tpl.languages.includes(languageValue)) return false;
      if (authorValue && tpl.updatedBy !== authorValue) return false;
      if (usageValue === 'never' && tpl.usageCount > 0) return false;
      if (usageValue === 'low' && (tpl.usageCount === 0 || tpl.usageCount >= 100)) return false;
      if (usageValue === 'high' && tpl.usageCount < 100) return false;
      return true;
    });
  }, [searchFilteredData, activeFilters, activeStatus]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;
    return [...filteredData].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[key];
      const bv = (b as unknown as Record<string, unknown>)[key];
      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv) * dir;
      }
      return ((av as number) > (bv as number) ? 1 : -1) * dir;
    });
  }, [filteredData, sortConfig]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(paginationPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const tableData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const statusKpis = useMemo(() => {
    const counts: Record<StatusTab, number> = {
      all: searchFilteredData.length,
      active: 0,
      draft: 0,
      archived: 0,
    };
    for (const tpl of searchFilteredData) counts[tpl.status] += 1;
    return counts;
  }, [searchFilteredData]);

  const avgUsage = useMemo(() => {
    if (searchFilteredData.length === 0) return 0;
    const total = searchFilteredData.reduce((sum, tpl) => sum + tpl.usageCount, 0);
    return Math.round(total / searchFilteredData.length);
  }, [searchFilteredData]);

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'category',
        label: t('mailTemplates.filters.category'),
        type: 'select',
        isPrimary: true,
        options: CATEGORIES.map((category) => ({
          value: category,
          label: t(`mailTemplates.category.${category}`),
        })),
      },
      {
        id: 'group',
        label: t('mailTemplates.filters.group'),
        type: 'select',
        isPrimary: true,
        options: groups.map((group) => ({ value: group, label: group })),
      },
      {
        id: 'language',
        label: t('mailTemplates.filters.language'),
        type: 'select',
        isPrimary: false,
        options: ['fr', 'en', 'es'].map((code) => ({
          value: code,
          label: t(`subscriptions.language.${code}`),
        })),
      },
      {
        id: 'author',
        label: t('mailTemplates.filters.author'),
        type: 'select',
        isPrimary: false,
        options: authors.map((author) => ({ value: author, label: author })),
      },
      {
        id: 'usage',
        label: t('mailTemplates.filters.usage'),
        type: 'select',
        isPrimary: false,
        options: (['never', 'low', 'high'] as UsagePreset[]).map((preset) => ({
          value: preset,
          label: t(`mailTemplates.filters.usagePresets.${preset}`),
        })),
      },
    ],
    [t, groups, authors],
  );

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete next[filterId];
      } else {
        next[filterId] = value;
      }
      return next;
    });
    setPaginationPage(1);
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setActiveStatus('all');
    setPaginationPage(1);
    toast.success(t('mailTemplates.toast.filtersResetTitle'));
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPaginationPage(1);
  };

  const handleStatusChange = (status: StatusTab) => {
    setActiveStatus(status);
    setPaginationPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'desc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setDraft(EMPTY_DRAFT);
    setPreviewTemplate(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (template: MailTemplate) => {
    setEditingTemplate(template);
    setDraft({
      name: template.name,
      subject: template.subject,
      category: template.category,
      group: template.group,
      status: template.status,
      body: template.body,
    });
    setPreviewTemplate(null);
    setIsFormOpen(true);
  };

  const handleSubmitForm = () => {
    const nowIso = new Date().toISOString();
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl.id === editingTemplate.id
            ? { ...tpl, ...draft, updatedAt: nowIso, updatedBy: CURRENT_USER }
            : tpl,
        ),
      );
      toast.success(t('mailTemplates.toast.updatedTitle'), {
        description: t('mailTemplates.toast.updatedBody', { name: draft.name }),
      });
    } else {
      setTemplates((prev) => [
        {
          id: nextTemplateId(prev),
          ...draft,
          languages: ['fr'],
          usageCount: 0,
          lastSentAt: null,
          updatedAt: nowIso,
          updatedBy: CURRENT_USER,
        },
        ...prev,
      ]);
      toast.success(t('mailTemplates.toast.createdTitle'), {
        description: t('mailTemplates.toast.createdBody', { name: draft.name }),
      });
    }
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  const handleDuplicate = (template: MailTemplate) => {
    const copyName = `${template.name} (${t('mailTemplates.csv.suffixCopy')})`;
    setTemplates((prev) => {
      const index = prev.findIndex((tpl) => tpl.id === template.id);
      const duplicated: MailTemplate = {
        ...template,
        id: nextTemplateId(prev),
        name: copyName,
        status: 'draft',
        usageCount: 0,
        lastSentAt: null,
        updatedAt: new Date().toISOString(),
        updatedBy: CURRENT_USER,
      };
      return [...prev.slice(0, index + 1), duplicated, ...prev.slice(index + 1)];
    });
    toast.success(t('mailTemplates.toast.duplicatedTitle'), {
      description: t('mailTemplates.toast.duplicatedBody', { name: copyName }),
    });
  };

  const handleConfirmDelete = () => {
    if (!templateToDelete) return;
    setTemplates((prev) => prev.filter((tpl) => tpl.id !== templateToDelete.id));
    toast.success(t('mailTemplates.toast.deletedTitle'), {
      description: t('mailTemplates.toast.deletedBody', { name: templateToDelete.name }),
    });
    setTemplateToDelete(null);
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value).then(
      () =>
        toast.success(t('mailTemplates.toast.copySuccessTitle'), {
          description: t('mailTemplates.toast.copySuccessBody'),
        }),
      () => {},
    );
  };

  const handleExport = () => {
    const header = [
      t('mailTemplates.table.name'),
      t('mailTemplates.table.subject'),
      t('mailTemplates.table.category'),
      t('mailTemplates.filters.group'),
      t('mailTemplates.table.status'),
      t('mailTemplates.table.usage'),
      t('mailTemplates.table.updatedAt'),
    ];
    const rows = sortedData.map((tpl) => [
      tpl.name,
      tpl.subject,
      t(`mailTemplates.category.${tpl.category}`),
      tpl.group,
      t(`mailTemplates.status.${tpl.status}`),
      String(tpl.usageCount),
      format(parseISO(tpl.updatedAt), 'yyyy-MM-dd HH:mm'),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => csvEscape(String(cell))).join(','))
      .join('\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = t('mailTemplates.csv.filename', { date: format(new Date(), 'yyyy-MM-dd') });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t('mailTemplates.toast.exportStartedTitle'), {
      description: t('mailTemplates.toast.exportStartedBody', { count: sortedData.length }),
    });
  };

  const columns: ColumnConfig<MailTemplate>[] = useMemo(
    () => [
      {
        key: 'name',
        label: t('mailTemplates.table.name'),
        sortable: true,
        className: 'px-4 py-4 min-w-[200px]',
        render: (row, term) => (
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 shrink-0">
              <Mail className="w-4 h-4 text-blue-700 dark:text-blue-300" />
            </span>
            <div className="min-w-0 max-w-[200px]">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {highlightMatch(row.name, term)}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {row.group}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'subject',
        label: t('mailTemplates.table.subject'),
        sortable: true,
        className: 'px-4 py-4',
        render: (row, term) => (
          <div className="max-w-[250px]">
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {highlightMatch(row.subject, term)}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {row.languages.map((code) => (
                <LanguageFlagInline key={code} language={code} />
              ))}
            </div>
          </div>
        ),
      },
      {
        key: 'category',
        label: t('mailTemplates.table.category'),
        sortable: true,
        className: 'px-4 py-4 w-[130px]',
        render: (row) => (
          <Badge variant="outline" className={CATEGORY_BADGE_STYLES[row.category]}>
            {t(`mailTemplates.category.${row.category}`)}
          </Badge>
        ),
      },
      {
        key: 'status',
        label: t('mailTemplates.table.status'),
        sortable: true,
        className: 'px-4 py-4 w-[130px]',
        render: (row) => <TemplateStatusBadge status={row.status} />,
      },
      {
        key: 'usageCount',
        label: t('mailTemplates.table.usage'),
        sortable: true,
        className: 'px-4 py-4 w-[130px]',
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {row.usageCount.toLocaleString(lang)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {row.lastSentAt
                ? t('mailTemplates.usage.lastSent', {
                    date: format(parseISO(row.lastSentAt), 'dd/MM/yyyy', { locale: dfLocale }),
                  })
                : t('mailTemplates.usage.never')}
            </span>
          </div>
        ),
      },
      {
        key: 'updatedAt',
        label: t('mailTemplates.table.updatedAt'),
        sortable: true,
        className: 'px-4 py-4 w-[130px]',
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900 dark:text-gray-100 tabular-nums">
              {format(parseISO(row.updatedAt), 'dd/MM/yyyy', { locale: dfLocale })}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('mailTemplates.updatedBy', { name: row.updatedBy })}
            </span>
          </div>
        ),
      },
      {
        key: 'actions',
        label: t('mailTemplates.table.actions'),
        sortable: false,
        className: 'px-3 py-4 w-[130px] text-right',
        render: (row) => (
          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <RowActionButton
              icon={Copy}
              tooltip={t('mailTemplates.actions.duplicate')}
              onClick={() => handleDuplicate(row)}
            />
            <RowActionButton
              icon={Pencil}
              tooltip={t('mailTemplates.actions.edit')}
              onClick={() => handleOpenEdit(row)}
            />
            <RowActionButton
              icon={Trash2}
              tooltip={t('mailTemplates.actions.delete')}
              intent="danger"
              onClick={() => setTemplateToDelete(row)}
            />
          </div>
        ),
      },
    ],
    [t, lang, dfLocale],
  );

  const hasActiveSearch = searchTerm.trim().length > 0;
  const isFiltered =
    hasActiveSearch || Object.keys(activeFilters).length > 0 || activeStatus !== 'all';

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col bg-gray-50 dark:bg-gray-950 h-full">
        <PageHeader
          title={t('mailTemplates.title')}
          subtitle={t('mailTemplates.subtitle')}
          hideBackButton
          secondaryAction={{
            label: t('mailTemplates.actions.export'),
            icon: <Download className="w-4 h-4" />,
            onClick: handleExport,
            ariaLabel: t('mailTemplates.actions.exportTooltip'),
            disabled: sortedData.length === 0,
          }}
          primaryAction={{
            label: t('mailTemplates.actions.create'),
            icon: <Plus className="w-4 h-4" />,
            onClick: handleOpenCreate,
            ariaLabel: t('mailTemplates.actions.createTooltip'),
          }}
        />

        <div className="px-6 py-6 space-y-5">
          <TemplateStatusTabs
            activeStatus={activeStatus}
            onStatusChange={handleStatusChange}
            kpis={statusKpis}
            avgUsage={avgUsage}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, width: '100%' }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
            className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
          >
            <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">
              <FilterBar
                searchValue={searchTerm}
                onSearchChange={handleSearchChange}
                searchPlaceholder={t('mailTemplates.searchPlaceholder')}
                filters={filterConfigs}
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAllFilters}
              />
            </div>

            <div className="flex-1 overflow-auto">
              {sortedData.length === 0 ? (
                <TemplatesEmptyState isFiltered={isFiltered} onReset={handleClearAllFilters} />
              ) : (
                <DataTable<MailTemplate>
                  data={tableData}
                  columns={columns}
                  hoveredRow={hoveredRow}
                  setHoveredRow={setHoveredRow}
                  onRowClick={(row) => setPreviewTemplate(row)}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  compactMode
                  allFilteredData={sortedData}
                  searchTerm={searchTerm}
                  entityName={t('mailTemplates.entityName')}
                  hideSelection
                />
              )}
            </div>

            {sortedData.length > 0 && (
              <DataPagination
                currentPage={safePage}
                totalPages={totalPages}
                pageSize={itemsPerPage}
                totalItems={totalItems}
                onPageChange={(page) => setPaginationPage(page)}
                onPageSizeChange={(size) => {
                  setItemsPerPage(size);
                  setPaginationPage(1);
                }}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            )}
          </motion.div>
        </div>

        {/* Aperçu du gabarit */}
        <Sheet
          open={!!previewTemplate}
          onOpenChange={(open) => !open && setPreviewTemplate(null)}
        >
          <SheetContent className="w-[520px] p-0 flex flex-col">
            {previewTemplate && (
              <TemplatePreview
                template={previewTemplate}
                onClose={() => setPreviewTemplate(null)}
                onCopy={handleCopy}
                onEdit={() => handleOpenEdit(previewTemplate)}
              />
            )}
          </SheetContent>
        </Sheet>

        {/* Création / édition */}
        <Sheet
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingTemplate(null);
          }}
        >
          <SheetContent className="w-[520px] p-0 flex flex-col">
            <TemplateForm
              isEditing={!!editingTemplate}
              draft={draft}
              onDraftChange={setDraft}
              groups={MAIL_GROUPS}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTemplate(null);
              }}
              onSubmit={handleSubmitForm}
            />
          </SheetContent>
        </Sheet>

        {/* Suppression */}
        <AlertDialog
          open={!!templateToDelete}
          onOpenChange={(open) => !open && setTemplateToDelete(null)}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </span>
                <AlertDialogTitle className="text-left">
                  {t('mailTemplates.delete.title')}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription asChild>
                <div className="text-left space-y-3">
                  {templateToDelete && (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {templateToDelete.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {templateToDelete.subject}
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('mailTemplates.delete.body')}
                  </p>
                  {templateToDelete && templateToDelete.usageCount > 0 && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-100">
                      {t('mailTemplates.delete.usageWarning', {
                        count: templateToDelete.usageCount,
                      })}
                    </p>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setTemplateToDelete(null)}>
                {t('mailTemplates.delete.cancel')}
              </Button>
              <Button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {t('mailTemplates.delete.confirm')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}

function TemplateStatusTabs({
  activeStatus,
  onStatusChange,
  kpis,
  avgUsage,
}: {
  activeStatus: StatusTab;
  onStatusChange: (status: StatusTab) => void;
  kpis: Record<StatusTab, number>;
  avgUsage: number;
}) {
  const { t } = useTranslation();
  const avgLabel = t('mailTemplates.statusTabs.avgUsage', { count: avgUsage });

  const metricValueFor = (status: StatusTab): string => {
    if (kpis.all === 0) return '0%';
    if (status === 'all') return '100%';
    return `${Math.round((kpis[status] / kpis.all) * 100)}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {t('mailTemplates.statusTabs.title')}
          </h3>
          <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-gray-200 dark:border-gray-700">
            {t('mailTemplates.statusTabs.subtitle')}
          </Badge>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('mailTemplates.statusTabs.clickToFilter')}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 items-center">
        {STATUS_TAB_ORDER.map((status) => (
          <FilterCard
            key={status}
            status={status}
            activeStatus={activeStatus}
            onStatusChange={(s) => onStatusChange(s as StatusTab)}
            label={t(`mailTemplates.statusTabs.${status}`)}
            icon={STATUS_TAB_ICON[status]}
            total={kpis[status]}
            metricLabel={t('mailTemplates.statusTabs.metricShare')}
            metricValue={metricValueFor(status)}
            averageValue={avgLabel}
            iconActiveClassName={STATUS_TAB_ICON_CLASS[status] ?? 'text-primary'}
          />
        ))}
      </div>
    </motion.div>
  );
}

function TemplateStatusBadge({ status }: { status: TemplateStatus }) {
  const { t } = useTranslation();
  const Icon = STATUS_ICON[status];
  return (
    <Badge variant="outline" className={cn('gap-1.5', STATUS_BADGE_STYLES[status])}>
      <Icon className="w-3 h-3" />
      <span>{t(`mailTemplates.status.${status}`)}</span>
    </Badge>
  );
}

function TemplatesEmptyState({
  isFiltered,
  onReset,
}: {
  isFiltered: boolean;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
        <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {isFiltered ? t('mailTemplates.empty.title') : t('mailTemplates.empty.noDataTitle')}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {isFiltered ? t('mailTemplates.empty.body') : t('mailTemplates.empty.noDataBody')}
      </p>
      {isFiltered && (
        <Button variant="outline" size="sm" onClick={onReset} className="mt-4">
          {t('mailTemplates.empty.resetCta')}
        </Button>
      )}
    </div>
  );
}

function TemplatePreview({
  template,
  onClose,
  onCopy,
  onEdit,
}: {
  template: MailTemplate;
  onClose: () => void;
  onCopy: (value: string) => void;
  onEdit: () => void;
}) {
  const { t, lang } = useTranslation();
  const dfLocale = (lang as Language) === 'en' ? enLocale : frLocale;
  const variables = extractVariables(template);
  const templateId = `tpl_${String(template.id).padStart(4, '0')}`;

  return (
    <>
      <SheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <Mail className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </span>
            <div className="min-w-0">
              <SheetTitle className="text-base font-semibold truncate">
                {template.name}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {t('mailTemplates.detail.subtitle')}
              </SheetDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t('mailTemplates.detail.close')}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <TemplateStatusBadge status={template.status} />
          <Badge variant="outline" className={CATEGORY_BADGE_STYLES[template.category]}>
            {t(`mailTemplates.category.${template.category}`)}
          </Badge>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('mailTemplates.detail.subject')}
          </p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{template.subject}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('mailTemplates.detail.content')}
          </p>
          <div className="relative rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 p-4">
            <p className="text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {template.body}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onCopy(template.body)}
                  aria-label={t('mailTemplates.detail.copyContent')}
                  className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-gray-900 hover:bg-white dark:hover:bg-gray-800 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('mailTemplates.detail.copyContent')}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('mailTemplates.detail.variables')}
          </p>
          {variables.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('mailTemplates.detail.noVariables')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {variables.map((variable) => (
                <Badge
                  key={variable}
                  variant="outline"
                  className="font-mono text-[11px] border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  {`{{${variable}}}`}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <PreviewRow label={t('mailTemplates.detail.group')} value={template.group} />

        <div className="flex items-baseline gap-3">
          <span className="w-[140px] shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('mailTemplates.detail.languages')}
          </span>
          <span className="flex items-center gap-1.5">
            {template.languages.map((code) => (
              <LanguageFlagInline key={code} language={code} />
            ))}
          </span>
        </div>

        <PreviewRow
          label={t('mailTemplates.detail.sends')}
          value={template.usageCount.toLocaleString(lang)}
          mono
        />
        <PreviewRow
          label={t('mailTemplates.detail.lastSent')}
          value={
            template.lastSentAt
              ? format(parseISO(template.lastSentAt), 'dd/MM/yyyy — HH:mm', { locale: dfLocale })
              : t('mailTemplates.usage.never')
          }
        />
        <PreviewRow
          label={t('mailTemplates.detail.updatedAt')}
          value={format(parseISO(template.updatedAt), 'dd/MM/yyyy — HH:mm', { locale: dfLocale })}
        />
        <PreviewRow label={t('mailTemplates.detail.updatedBy')} value={template.updatedBy} />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            {t('mailTemplates.detail.templateId')}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 font-mono">
              {templateId}
            </code>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onCopy(templateId)}
                  aria-label={t('mailTemplates.detail.copyId')}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('mailTemplates.detail.copyId')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <Button variant="outline" onClick={onEdit} className="w-full gap-2">
          <Pencil className="w-4 h-4" />
          {t('mailTemplates.detail.editCta')}
        </Button>
      </div>
    </>
  );
}

function PreviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-[140px] shrink-0 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span
        className={cn('text-sm text-gray-900 dark:text-gray-100', mono && 'font-mono tabular-nums')}
      >
        {value}
      </span>
    </div>
  );
}

function TemplateForm({
  isEditing,
  draft,
  onDraftChange,
  groups,
  onCancel,
  onSubmit,
}: {
  isEditing: boolean;
  draft: TemplateDraft;
  onDraftChange: (draft: TemplateDraft) => void;
  groups: string[];
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const isValid = draft.name.trim().length > 0 && draft.subject.trim().length > 0;

  const update = <K extends keyof TemplateDraft>(key: K, value: TemplateDraft[K]) => {
    onDraftChange({ ...draft, [key]: value });
  };

  return (
    <>
      <SheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            {isEditing ? (
              <Pencil className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            ) : (
              <Plus className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            )}
          </span>
          <div>
            <SheetTitle className="text-base font-semibold">
              {isEditing ? t('mailTemplates.form.editTitle') : t('mailTemplates.form.createTitle')}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {isEditing
                ? t('mailTemplates.form.editSubtitle')
                : t('mailTemplates.form.createSubtitle')}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template-name" className="text-xs">
            {t('mailTemplates.form.name')}
          </Label>
          <Input
            id="template-name"
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder={t('mailTemplates.form.namePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-subject" className="text-xs">
            {t('mailTemplates.form.subject')}
          </Label>
          <Input
            id="template-subject"
            value={draft.subject}
            onChange={(e) => update('subject', e.target.value)}
            placeholder={t('mailTemplates.form.subjectPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">{t('mailTemplates.form.category')}</Label>
            <Select
              value={draft.category}
              onValueChange={(value) => update('category', value as TemplateCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(`mailTemplates.category.${category}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t('mailTemplates.form.status')}</Label>
            <Select
              value={draft.status}
              onValueChange={(value) => update('status', value as TemplateStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`mailTemplates.status.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{t('mailTemplates.form.group')}</Label>
          <Select value={draft.group} onValueChange={(value) => update('group', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="template-body" className="text-xs">
            {t('mailTemplates.form.body')}
          </Label>
          <Textarea
            id="template-body"
            value={draft.body}
            onChange={(e) => update('body', e.target.value)}
            placeholder={t('mailTemplates.form.bodyPlaceholder')}
            className="min-h-[200px]"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('mailTemplates.form.bodyHint')}
          </p>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {t('mailTemplates.form.cancel')}
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isValid}
          className="flex-1 text-white"
          style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
        >
          {isEditing ? t('mailTemplates.form.save') : t('mailTemplates.form.createCta')}
        </Button>
      </div>
    </>
  );
}
