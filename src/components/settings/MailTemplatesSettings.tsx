import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { fr as frLocale, enUS as enLocale } from 'date-fns/locale';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Coins,
  Copy,
  Download,
  FolderOpen,
  Handshake,
  KeyRound,
  LayoutList,
  Mail,
  Megaphone,
  MousePointerClick,
  Pencil,
  PenLine,
  Plus,
  ShieldCheck,
  Shuffle,
  Trash2,
  Undo2,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useTranslation, type Language } from '../../utils/languageContext';
import {
  MAIL_TEMPLATES,
  SECTION_NUMBER,
  SECTION_ORDER,
  TEMPLATE_AUTHORS,
  type MailTemplate,
  type TemplateRecipient,
  type TemplateSectionKey,
  type TemplateStatus,
  type TemplateTrigger,
} from '../../utils/mailTemplatesMockData';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
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
import { MailTemplateDetailPage } from './MailTemplateDetailPage';

type SectionFilter = TemplateSectionKey | 'all';
type UsagePreset = 'never' | 'low' | 'high';
type FormMode = 'create' | 'edit';

const CURRENT_USER = 'Jean';

const STATUSES: TemplateStatus[] = ['active', 'draft', 'archived'];
const RECIPIENTS: TemplateRecipient[] = ['investor', 'partner', 'team'];
const TRIGGERS: TemplateTrigger[] = ['auto', 'manual', 'mixed'];

const SECTION_ICON: Record<SectionFilter, React.ComponentType<{ className?: string }>> = {
  all: LayoutList,
  accounts: KeyRound,
  onboarding: ClipboardList,
  signature: PenLine,
  kyc: ShieldCheck,
  payments: Banknote,
  capitalCalls: ArrowDownToLine,
  distributions: Coins,
  redemptions: Undo2,
  secondary: ArrowLeftRight,
  documents: FolderOpen,
  partners: Handshake,
  communication: Megaphone,
};

/** Une famille de couleur par section : la pastille reste reconnaissable dans la liste. */
const SECTION_BADGE_STYLES: Record<TemplateSectionKey, string> = {
  accounts:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
  onboarding:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800',
  signature:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-800',
  kyc: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800',
  payments:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  capitalCalls:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  distributions:
    'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800',
  redemptions:
    'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
  secondary:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
  documents:
    'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-700',
  partners:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800',
  communication:
    'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const STATUS_BADGE_STYLES: Record<TemplateStatus, string> = {
  active:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800',
  draft:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800',
  archived:
    'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const RECIPIENT_BADGE_STYLES: Record<TemplateRecipient, string> = {
  investor:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
  partner:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
  team: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const TRIGGER_ICON: Record<TemplateTrigger, React.ComponentType<{ className?: string }>> = {
  auto: Zap,
  manual: MousePointerClick,
  mixed: Shuffle,
};

const VARIABLE_PATTERN = /\$[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)?/g;

function nextTemplateId(templates: MailTemplate[]): number {
  return templates.reduce((max, tpl) => Math.max(max, tpl.id), 0) + 1;
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
  slug: string;
  section: TemplateSectionKey;
  recipient: TemplateRecipient;
  trigger: TemplateTrigger;
  status: TemplateStatus;
}

const EMPTY_DRAFT: TemplateDraft = {
  name: '',
  slug: '',
  section: 'accounts',
  recipient: 'investor',
  trigger: 'auto',
  status: 'draft',
};

function draftFrom(template: MailTemplate): TemplateDraft {
  return {
    name: template.name,
    slug: template.slug,
    section: template.section,
    recipient: template.recipient,
    trigger: template.trigger,
    status: template.status,
  };
}

export function MailTemplatesSettings() {
  const { t, lang } = useTranslation();
  const dfLocale = (lang as Language) === 'en' ? enLocale : frLocale;

  const [templates, setTemplates] = useState<MailTemplate[]>(MAIL_TEMPLATES);
  const [activeSection, setActiveSection] = useState<SectionFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  );
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<TemplateDraft>(EMPTY_DRAFT);
  const [templateToDelete, setTemplateToDelete] = useState<MailTemplate | null>(null);

  const subjectOf = (template: MailTemplate) =>
    (lang as Language) === 'en' ? template.en.subject : template.fr.subject;

  /** Recherche et filtres hors section : sert aussi à calculer les compteurs du rail. */
  const dataBeforeSection = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const statusValue = activeFilters.status as TemplateStatus | undefined;
    const recipientValue = activeFilters.recipient as TemplateRecipient | undefined;
    const triggerValue = activeFilters.trigger as TemplateTrigger | undefined;
    const languageValue = activeFilters.language as string | undefined;
    const authorValue = activeFilters.author as string | undefined;
    const usageValue = activeFilters.usage as UsagePreset | undefined;

    return templates.filter((tpl) => {
      if (term) {
        const haystack = [
          tpl.name,
          tpl.slug,
          tpl.fr.subject,
          tpl.en.subject,
          tpl.fr.html,
          tpl.en.html,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (statusValue && tpl.status !== statusValue) return false;
      if (recipientValue && tpl.recipient !== recipientValue) return false;
      if (triggerValue && tpl.trigger !== triggerValue) return false;
      if (languageValue && !tpl.languages.includes(languageValue)) return false;
      if (authorValue && tpl.updatedBy !== authorValue) return false;
      if (usageValue === 'never' && tpl.usageCount > 0) return false;
      if (usageValue === 'low' && (tpl.usageCount === 0 || tpl.usageCount >= 100)) return false;
      if (usageValue === 'high' && tpl.usageCount < 100) return false;
      return true;
    });
  }, [templates, searchTerm, activeFilters]);

  const sectionCounts = useMemo(() => {
    const counts = { all: dataBeforeSection.length } as Record<SectionFilter, number>;
    SECTION_ORDER.forEach((section) => {
      counts[section] = 0;
    });
    dataBeforeSection.forEach((tpl) => {
      counts[tpl.section] += 1;
    });
    return counts;
  }, [dataBeforeSection]);

  const filteredData = useMemo(
    () =>
      activeSection === 'all'
        ? dataBeforeSection
        : dataBeforeSection.filter((tpl) => tpl.section === activeSection),
    [dataBeforeSection, activeSection],
  );

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    const dir = direction === 'asc' ? 1 : -1;
    const valueOf = (tpl: MailTemplate): string | number => {
      if (key === 'subject') return subjectOf(tpl);
      if (key === 'section') return t(`mailTemplates.sections.${tpl.section}`);
      if (key === 'recipient') return t(`mailTemplates.recipient.${tpl.recipient}`);
      if (key === 'status') return t(`mailTemplates.status.${tpl.status}`);
      const raw = (tpl as unknown as Record<string, unknown>)[key];
      return typeof raw === 'number' ? raw : String(raw ?? '');
    };
    return [...filteredData].sort((a, b) => {
      const av = valueOf(a);
      const bv = valueOf(b);
      if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir;
      return ((av as number) > (bv as number) ? 1 : -1) * dir;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredData, sortConfig, lang, t]);

  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(paginationPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const tableData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const detailIndex = detailId === null ? -1 : sortedData.findIndex((tpl) => tpl.id === detailId);
  const detailTemplate = detailIndex >= 0 ? sortedData[detailIndex] : null;
  const editingTemplate = templates.find((tpl) => tpl.id === editingId) ?? null;

  const filterConfigs: FilterConfig[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('mailTemplates.filters.status'),
        type: 'select',
        isPrimary: true,
        options: STATUSES.map((status) => ({
          value: status,
          label: t(`mailTemplates.status.${status}`),
        })),
      },
      {
        id: 'recipient',
        label: t('mailTemplates.filters.recipient'),
        type: 'select',
        isPrimary: true,
        options: RECIPIENTS.map((recipient) => ({
          value: recipient,
          label: t(`mailTemplates.recipient.${recipient}`),
        })),
      },
      {
        id: 'trigger',
        label: t('mailTemplates.filters.trigger'),
        type: 'select',
        isPrimary: false,
        options: TRIGGERS.map((trigger) => ({
          value: trigger,
          label: t(`mailTemplates.trigger.${trigger}`),
        })),
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
        options: TEMPLATE_AUTHORS.map((author) => ({ value: author, label: author })),
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
    [t],
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
    setPaginationPage(1);
    toast.success(t('mailTemplates.toast.filtersResetTitle'));
  };

  const handleSectionChange = (section: SectionFilter) => {
    setActiveSection(section);
    setPaginationPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const handleOpenCreate = () => {
    setDraft({
      ...EMPTY_DRAFT,
      section: activeSection === 'all' ? 'accounts' : activeSection,
    });
    setEditingId(null);
    setFormMode('create');
  };

  const handleOpenEdit = (template: MailTemplate) => {
    setDraft(draftFrom(template));
    setEditingId(template.id);
    setFormMode('edit');
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingId(null);
  };

  const handleSubmitForm = () => {
    const nowIso = new Date().toISOString();
    if (formMode === 'edit' && editingId !== null) {
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl.id === editingId
            ? { ...tpl, ...draft, updatedAt: nowIso, updatedBy: CURRENT_USER }
            : tpl,
        ),
      );
      toast.success(t('mailTemplates.toast.updatedTitle'), {
        description: t('mailTemplates.toast.updatedBody', { name: draft.name }),
      });
    } else {
      const created: MailTemplate = {
        ...draft,
        id: nextTemplateId(templates),
        origin: '',
        variables: [],
        proposedVariables: [],
        fr: { subject: '', html: '' },
        en: { subject: '', html: '' },
        languages: ['fr'],
        usageCount: 0,
        lastSentAt: null,
        updatedAt: nowIso,
        updatedBy: CURRENT_USER,
      };
      setTemplates((prev) => [created, ...prev]);
      toast.success(t('mailTemplates.toast.createdTitle'), {
        description: t('mailTemplates.toast.createdBody', { name: draft.name }),
      });
      // Enchaîner sur l'éditeur : un gabarit sans contenu n'est pas envoyable.
      setDetailId(created.id);
    }
    closeForm();
  };

  const handleDuplicate = (template: MailTemplate) => {
    const copySuffix = t('mailTemplates.csv.suffixCopy');
    const copyName = `${template.name} (${copySuffix})`;
    setTemplates((prev) => {
      const index = prev.findIndex((tpl) => tpl.id === template.id);
      const duplicated: MailTemplate = {
        ...template,
        id: nextTemplateId(prev),
        slug: `${template.slug}-${copySuffix}`,
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
    if (detailId === templateToDelete.id) setDetailId(null);
    toast.success(t('mailTemplates.toast.deletedTitle'), {
      description: t('mailTemplates.toast.deletedBody', { name: templateToDelete.name }),
    });
    setTemplateToDelete(null);
  };

  const handleSaveContent = (
    id: number,
    patch: { fr: { subject: string; html: string }; en: { subject: string; html: string } },
  ) => {
    const target = templates.find((tpl) => tpl.id === id);
    setTemplates((prev) =>
      prev.map((tpl) =>
        tpl.id === id
          ? {
              ...tpl,
              fr: patch.fr,
              en: patch.en,
              languages: patch.en.html.trim() ? ['fr', 'en'] : ['fr'],
              updatedAt: new Date().toISOString(),
              updatedBy: CURRENT_USER,
            }
          : tpl,
      ),
    );
    toast.success(t('mailTemplates.toast.updatedTitle'), {
      description: t('mailTemplates.toast.updatedBody', { name: target?.name ?? '' }),
    });
  };

  const handleExport = () => {
    const header = [
      t('mailTemplates.detail.slug'),
      t('mailTemplates.table.name'),
      t('mailTemplates.table.section'),
      t('mailTemplates.table.recipient'),
      t('mailTemplates.filters.trigger'),
      t('mailTemplates.table.status'),
      t('mailTemplates.table.subject'),
      t('mailTemplates.table.usage'),
    ];
    const rows = sortedData.map((tpl) => [
      tpl.slug,
      tpl.name,
      t(`mailTemplates.sections.${tpl.section}`),
      t(`mailTemplates.recipient.${tpl.recipient}`),
      t(`mailTemplates.trigger.${tpl.trigger}`),
      t(`mailTemplates.status.${tpl.status}`),
      subjectOf(tpl),
      String(tpl.usageCount),
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

  const columns: ColumnConfig<MailTemplate>[] = useMemo(() => {
    const list: ColumnConfig<MailTemplate>[] = [
      {
        key: 'name',
        label: t('mailTemplates.table.name'),
        sortable: true,
        className: 'px-3 py-4 min-w-[180px]',
        render: (row, term) => {
          const TriggerIcon = TRIGGER_ICON[row.trigger];
          return (
            <div className="flex items-start gap-2.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={cn(
                      'mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-md border shrink-0 text-[11px] font-semibold tabular-nums',
                      SECTION_BADGE_STYLES[row.section],
                    )}
                  >
                    {SECTION_NUMBER[row.section]}
                  </span>
                </TooltipTrigger>
                <TooltipContent>{t(`mailTemplates.sections.${row.section}`)}</TooltipContent>
              </Tooltip>
              <div className="min-w-0 max-w-[200px]">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {highlightMatch(row.name, term)}
                  </p>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TriggerIcon className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>{t(`mailTemplates.trigger.${row.trigger}`)}</TooltipContent>
                  </Tooltip>
                </div>
                <code className="mt-1 block text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                  {highlightMatch(row.slug, term)}
                </code>
              </div>
            </div>
          );
        },
      },
      {
        key: 'subject',
        label: t('mailTemplates.table.subject'),
        sortable: true,
        className: 'px-3 py-4',
        render: (row, term) => (
          <div className="max-w-[250px]">
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {highlightMatch(subjectOf(row), term)}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {row.languages.map((code) => (
                <LanguageFlagInline key={code} language={code} />
              ))}
            </div>
          </div>
        ),
      },
    ];

    list.push(
      {
        key: 'recipient',
        label: t('mailTemplates.table.recipient'),
        sortable: true,
        className: 'px-3 py-4 w-[140px]',
        render: (row) => (
          <Badge variant="outline" className={RECIPIENT_BADGE_STYLES[row.recipient]}>
            {t(`mailTemplates.recipient.${row.recipient}`)}
          </Badge>
        ),
      },
      {
        key: 'status',
        label: t('mailTemplates.table.status'),
        sortable: true,
        className: 'px-3 py-4 w-[130px]',
        render: (row) => (
          <Badge variant="outline" className={STATUS_BADGE_STYLES[row.status]}>
            {t(`mailTemplates.status.${row.status}`)}
          </Badge>
        ),
      },
      {
        key: 'usageCount',
        label: t('mailTemplates.table.usage'),
        sortable: true,
        className: 'px-3 py-4 w-[100px]',
        render: (row) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 tabular-nums cursor-default">
                {row.usageCount.toLocaleString(lang)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {row.lastSentAt
                ? t('mailTemplates.usage.lastSent', {
                    date: format(parseISO(row.lastSentAt), 'dd/MM/yyyy', { locale: dfLocale }),
                  })
                : t('mailTemplates.usage.never')}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        key: 'actions',
        label: t('mailTemplates.table.actions'),
        sortable: false,
        className: 'px-2 py-4 w-[130px] text-right',
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
    );

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, lang, dfLocale]);

  const isFiltered = searchTerm.trim().length > 0 || Object.keys(activeFilters).length > 0;

  if (detailTemplate) {
    return (
      <MailTemplateDetailPage
        template={detailTemplate}
        index={detailIndex}
        total={sortedData.length}
        onBack={() => setDetailId(null)}
        onNavigate={(offset) => {
          const next = sortedData[detailIndex + offset];
          if (next) setDetailId(next.id);
        }}
        onSave={(patch) => handleSaveContent(detailTemplate.id, patch)}
      />
    );
  }

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
            disabled: sortedData.length === 0,
          }}
          primaryAction={{
            label: t('mailTemplates.actions.create'),
            icon: <Plus className="w-4 h-4" />,
            onClick: handleOpenCreate,
          }}
        />

        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <SectionRail
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              counts={sectionCounts}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
              className="flex-1 min-w-0 bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
            >
              <SectionHeading section={activeSection} count={totalItems} />

              <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">
                <FilterBar
                  searchValue={searchTerm}
                  onSearchChange={(value) => {
                    setSearchTerm(value);
                    setPaginationPage(1);
                  }}
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
                    onRowClick={(row) => setDetailId(row.id)}
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
        </div>

        {/* Création / édition */}
        <Sheet open={formMode !== null} onOpenChange={(open) => !open && closeForm()}>
          <SheetContent className="w-[600px] p-0 flex flex-col">
            <TemplateForm
                isEditing={formMode === 'edit'}
                draft={draft}
                onDraftChange={setDraft}
                onCancel={closeForm}
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
                      <code className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {templateToDelete.slug}
                      </code>
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

/** Rail de navigation : les 12 sections du référentiel, toujours visibles. */
function SectionRail({
  activeSection,
  onSectionChange,
  counts,
}: {
  activeSection: SectionFilter;
  onSectionChange: (section: SectionFilter) => void;
  counts: Record<SectionFilter, number>;
}) {
  const { t } = useTranslation();

  return (
    <motion.nav
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 25 }}
      aria-label={t('mailTemplates.rail.title')}
      className="w-[260px] shrink-0 sticky top-6 bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t('mailTemplates.rail.title')}
        </span>
        <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700">
          {t('mailTemplates.rail.sectionCount')}
        </Badge>
      </div>

      <div className="p-2">
        <RailItem
          section="all"
          label={t('mailTemplates.rail.all')}
          count={counts.all}
          isActive={activeSection === 'all'}
          onClick={() => onSectionChange('all')}
        />

        <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

        {SECTION_ORDER.map((section) => (
          <RailItem
            key={section}
            section={section}
            label={t(`mailTemplates.sections.${section}`)}
            count={counts[section]}
            isActive={activeSection === section}
            onClick={() => onSectionChange(section)}
          />
        ))}
      </div>
    </motion.nav>
  );
}

function RailItem({
  section,
  label,
  count,
  isActive,
  onClick,
}: {
  section: SectionFilter;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = SECTION_ICON[section];
  const isEmpty = count === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg transition-colors',
        isActive
          ? 'bg-gray-100 dark:bg-gray-800'
          : 'hover:bg-gray-50 dark:hover:bg-gray-900',
        isEmpty && !isActive && 'opacity-50',
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        )}
      >
        {section === 'all' ? (
          <Icon className="w-3.5 h-3.5" />
        ) : (
          <span className="text-[11px] font-semibold tabular-nums">
            {SECTION_NUMBER[section as TemplateSectionKey]}
          </span>
        )}
      </span>

      <span
        className={cn(
          'min-w-0 flex-1 text-[13px] leading-tight',
          isActive
            ? 'font-semibold text-gray-900 dark:text-gray-100'
            : 'text-gray-700 dark:text-gray-300',
        )}
      >
        {label}
      </span>

      <span
        className={cn(
          'text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md shrink-0',
          isActive
            ? 'bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100'
            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        )}
      >
        {count}
      </span>
    </button>
  );
}

/** Rappelle la section affichée et ce qu'elle couvre, au-dessus de la liste. */
function SectionHeading({ section, count }: { section: SectionFilter; count: number }) {
  const { t } = useTranslation();
  const Icon = SECTION_ICON[section];

  return (
    <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start gap-3">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {section === 'all'
              ? t('mailTemplates.rail.all')
              : t(`mailTemplates.sections.${section}`)}
          </h2>
          <Badge variant="outline" className="text-xs border-gray-200 dark:border-gray-700">
            {t(count === 1 ? 'mailTemplates.rail.countOne' : 'mailTemplates.rail.countMany', {
              count,
            })}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t(`mailTemplates.sectionDescriptions.${section}`)}
        </p>
      </div>
    </div>
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

function TemplateForm({
  isEditing,
  draft,
  onDraftChange,
  onCancel,
  onSubmit,
}: {
  isEditing: boolean;
  draft: TemplateDraft;
  onDraftChange: (draft: TemplateDraft) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const isValid = draft.name.trim().length > 0 && draft.slug.trim().length > 0;

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
          <Label htmlFor="template-slug" className="text-xs">
            {t('mailTemplates.form.slug')}
          </Label>
          <Input
            id="template-slug"
            value={draft.slug}
            onChange={(e) => update('slug', e.target.value)}
            placeholder={t('mailTemplates.form.slugPlaceholder')}
            className="font-mono"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('mailTemplates.form.slugHint')}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{t('mailTemplates.form.section')}</Label>
          <Select
            value={draft.section}
            onValueChange={(value) => update('section', value as TemplateSectionKey)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SECTION_ORDER.map((section) => (
                <SelectItem key={section} value={section}>
                  {`${SECTION_NUMBER[section]}. ${t(`mailTemplates.sections.${section}`)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">{t('mailTemplates.form.recipient')}</Label>
            <Select
              value={draft.recipient}
              onValueChange={(value) => update('recipient', value as TemplateRecipient)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECIPIENTS.map((recipient) => (
                  <SelectItem key={recipient} value={recipient}>
                    {t(`mailTemplates.recipient.${recipient}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">{t('mailTemplates.form.trigger')}</Label>
            <Select
              value={draft.trigger}
              onValueChange={(value) => update('trigger', value as TemplateTrigger)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGERS.map((trigger) => (
                  <SelectItem key={trigger} value={trigger}>
                    {t(`mailTemplates.trigger.${trigger}`)}
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

        <p className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
          {isEditing
            ? t('mailTemplates.form.contentInEditorEdit')
            : t('mailTemplates.form.contentInEditorCreate')}
        </p>
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
