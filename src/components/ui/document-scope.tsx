/**
 * Document scope — Design System component
 * Key: ds-document-scope
 *
 * Single source of truth for "where does this document live and who can see
 * it". Used in the document explorer (list view), the Bird View tree and the
 * publication center (validation page).
 *
 *  - Nature badge (generic / nominative)
 *  - Folder (last segment) with the full path on hover
 *  - Targeting tags (fund, share, segments, investor, structure, subscription)
 *  - Audience chip (investors or contacts)
 *  - "Full scope" popover, opened on hover or on click (pinned)
 *  - Download audience (CSV)
 *
 * Exports:
 *  - <DocumentScope>          the widget (layout "stacked" or "inline")
 *  - resolveScopeAudience()   audience computed from the GED fixtures
 *  - downloadScopeAudience()  CSV export of the audience
 */

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  Building2,
  ChevronRight,
  Download,
  FileText,
  Folder,
  Globe,
  Landmark,
  Layers3,
  ScanEye,
  Tag as TagIcon,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Tag } from '../Tag';
import { TYPOLOGY_TO_SEGMENT } from '../AudienceCounter';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from './utils';
import { useTranslation } from '../../utils/languageContext';
import {
  COMMITMENTS,
  FUNDS,
  INVESTORS,
  getInvestorContacts,
  type InvestorProfile,
} from '../../utils/gedFixtures';

export type DocumentScopeNature = 'generic' | 'nominative';

export interface DocumentScopeContact {
  id: string;
  name: string;
  role?: string;
}

export interface DocumentScopeData {
  nature: DocumentScopeNature;
  /** Full location, root first (space / folder / sub-folder). */
  folderPath?: string[];
  fund?: string;
  /** True when a generic doc targets every fund. */
  allFunds?: boolean;
  shareClass?: string;
  segments?: string[];
  investor?: string;
  structure?: string;
  subscription?: string;
  /** Long subscription label shown on hover (investor, fund, share). */
  subscriptionLabel?: string;
  /** Overrides for the computed audience, when the caller knows better. */
  investorCount?: number;
  contacts?: DocumentScopeContact[];
}

export interface ScopeAudienceInvestor {
  id: string;
  name: string;
  structure?: string;
  contacts: DocumentScopeContact[];
}

export interface ScopeAudience {
  investors: ScopeAudienceInvestor[];
  investorCount: number;
  contactCount: number;
}

const INVESTORS_BY_NAME = new Map(INVESTORS.map((i) => [i.name, i] as const));
const ALL_FUNDS_LABELS = ['Tous fonds', 'Tous les fonds', 'All funds'];
const ALL_SHARES_LABELS = ['Toutes parts', 'Toutes les parts', 'All shares'];
const ALL_SEGMENTS_LABELS = ['Tous segments', 'Tous les segments', 'All segments'];

const isSpecific = (value: string | undefined, allLabels: string[]) =>
  !!value && !allLabels.includes(value);

const accessibleContacts = (investorId: string): DocumentScopeContact[] =>
  getInvestorContacts(investorId)
    .filter((c) => c.canAccess)
    .map((c) => ({ id: c.id, name: c.name, role: c.role }));

const toAudienceInvestor = (inv: InvestorProfile): ScopeAudienceInvestor => ({
  id: inv.id,
  name: inv.name,
  structure: inv.structure,
  contacts: accessibleContacts(inv.id),
});

export function resolveScopeAudience(scope: DocumentScopeData): ScopeAudience {
  let investors: ScopeAudienceInvestor[] = [];

  if (scope.nature === 'nominative') {
    const inv = scope.investor ? INVESTORS_BY_NAME.get(scope.investor) : undefined;
    if (inv) {
      investors = [toAudienceInvestor(inv)];
    } else if (scope.investor) {
      investors = [
        {
          id: scope.investor,
          name: scope.investor,
          structure: scope.structure,
          contacts: scope.contacts ?? [],
        },
      ];
    }
    if (scope.contacts && investors[0]) {
      investors[0] = { ...investors[0], contacts: scope.contacts };
    }
  } else {
    const fund = isSpecific(scope.fund, ALL_FUNDS_LABELS)
      ? FUNDS.find((f) => f.name === scope.fund)
      : undefined;
    const shareClass = isSpecific(scope.shareClass, ALL_SHARES_LABELS)
      ? scope.shareClass
      : undefined;
    const segments = (scope.segments ?? []).filter((s) =>
      isSpecific(s, ALL_SEGMENTS_LABELS),
    );
    const ids = new Set<string>();
    COMMITMENTS.forEach((c) => {
      if (fund && c.fundCode !== fund.code) return;
      if (shareClass && c.shareClass !== shareClass) return;
      ids.add(c.investorId);
    });
    investors = INVESTORS.filter((inv) => ids.has(inv.id))
      .filter(
        (inv) =>
          segments.length === 0 ||
          segments.includes(inv.typology) ||
          segments.includes(TYPOLOGY_TO_SEGMENT[inv.typology]),
      )
      .map(toAudienceInvestor);
  }

  const contactCount = investors.reduce((sum, i) => sum + i.contacts.length, 0);
  return {
    investors,
    investorCount: scope.investorCount ?? investors.length,
    contactCount,
  };
}

const csvCell = (value: string | undefined) =>
  `"${(value ?? '').replace(/"/g, '""')}"`;

export function downloadScopeAudience(
  audience: ScopeAudience,
  headers: [string, string, string, string],
  fileName: string,
) {
  const rows: string[] = [headers.map(csvCell).join(';')];
  audience.investors.forEach((inv) => {
    if (inv.contacts.length === 0) {
      rows.push([inv.name, inv.structure, '', ''].map(csvCell).join(';'));
      return;
    }
    inv.contacts.forEach((c) => {
      rows.push([inv.name, inv.structure, c.name, c.role].map(csvCell).join(';'));
    });
  });
  const blob = new Blob([`﻿${rows.join('\n')}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

interface ScopeTagItem {
  key: string;
  icon: LucideIcon;
  label: string;
  typeKey: string;
  hint?: string;
}

function buildTags(scope: DocumentScopeData, allFundsLabel: string): ScopeTagItem[] {
  const tags: ScopeTagItem[] = [];
  if (scope.nature === 'nominative') {
    if (scope.investor) {
      tags.push({ key: 'investor', icon: UserRound, label: scope.investor, typeKey: 'ged.scope.types.investor' });
    }
    if (scope.structure) {
      tags.push({ key: 'structure', icon: Building2, label: scope.structure, typeKey: 'ged.scope.types.structure' });
    }
    if (scope.subscription) {
      tags.push({
        key: 'subscription',
        icon: FileText,
        label: scope.subscription,
        typeKey: 'ged.scope.types.subscription',
        hint: scope.subscriptionLabel,
      });
    }
    if (isSpecific(scope.fund, ALL_FUNDS_LABELS)) {
      tags.push({ key: 'fund', icon: Landmark, label: scope.fund!, typeKey: 'ged.scope.types.fund' });
    }
    return tags;
  }
  if (isSpecific(scope.fund, ALL_FUNDS_LABELS)) {
    tags.push({ key: 'fund', icon: Landmark, label: scope.fund!, typeKey: 'ged.scope.types.fund' });
  } else if (scope.allFunds) {
    tags.push({ key: 'fund', icon: Landmark, label: allFundsLabel, typeKey: 'ged.scope.types.fund' });
  }
  if (isSpecific(scope.shareClass, ALL_SHARES_LABELS)) {
    tags.push({ key: 'share', icon: Layers3, label: scope.shareClass!, typeKey: 'ged.scope.types.share' });
  }
  (scope.segments ?? [])
    .filter((s) => isSpecific(s, ALL_SEGMENTS_LABELS))
    .forEach((seg) =>
      tags.push({ key: `segment-${seg}`, icon: TagIcon, label: seg, typeKey: 'ged.scope.types.segment' }),
    );
  return tags;
}

const stop = (e: MouseEvent) => e.stopPropagation();

export function DocumentNatureBadge({
  nature,
  className,
}: {
  nature: DocumentScopeNature;
  className?: string;
}) {
  const { t } = useTranslation();
  const Icon = nature === 'nominative' ? UserRound : Globe;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none',
        nature === 'nominative'
          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300'
          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300',
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {nature === 'nominative' ? t('ged.scope.nature.nominative') : t('ged.scope.nature.generic')}
    </span>
  );
}

function FolderLocation({ path }: { path: string[] }) {
  const { t } = useTranslation();
  const folderName = path[path.length - 1];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex min-w-0 items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span className="truncate max-w-[200px]">{folderName}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm">
        <div className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
          {t('ged.scope.fullPath')}
        </div>
        <div className="text-xs">{path.join(' / ')}</div>
      </TooltipContent>
    </Tooltip>
  );
}

interface DocumentScopeProps {
  scope: DocumentScopeData;
  /** "stacked" for table cells, "inline" for tree rows. */
  layout?: 'stacked' | 'inline';
  showNature?: boolean;
  showFolder?: boolean;
  showAudience?: boolean;
  className?: string;
}

export function DocumentScope({
  scope,
  layout = 'stacked',
  showNature = true,
  showFolder = true,
  showAudience = true,
  className,
}: DocumentScopeProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const audience = useMemo(() => resolveScopeAudience(scope), [scope]);
  const tags = buildTags(scope, t('ged.scope.allFunds'));
  const hasPath = !!scope.folderPath && scope.folderPath.length > 0;
  const isNominative = scope.nature === 'nominative';

  const audienceLabel = isNominative
    ? t(audience.contactCount > 1 ? 'ged.scope.contactsMany' : 'ged.scope.contactsOne', {
        count: audience.contactCount,
      })
    : t(audience.investorCount > 1 ? 'ged.scope.investorsMany' : 'ged.scope.investorsOne', {
        count: audience.investorCount,
      });

  const clearTimers = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (openTimer.current) clearTimeout(openTimer.current);
  };
  const hoverOpen = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 250);
  };
  const hoverClose = () => {
    clearTimers();
    if (pinned) return;
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  const handleDownload = (e: MouseEvent) => {
    e.stopPropagation();
    const base = (scope.folderPath?.[scope.folderPath.length - 1] ?? 'audience')
      .replace(/[^\w-]+/g, '_');
    downloadScopeAudience(
      audience,
      [
        t('ged.scope.csv.investor'),
        t('ged.scope.csv.structure'),
        t('ged.scope.csv.contact'),
        t('ged.scope.csv.role'),
      ],
      `${t('ged.scope.csv.fileName')}_${base}.csv`,
    );
    toast.success(t('ged.scope.downloadStarted'));
  };

  const iconButton =
    'inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200';

  const actions = (
    <div className="flex items-center gap-0.5" onClick={stop}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setPinned(false);
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(iconButton, open && 'bg-gray-100 text-gray-700 dark:bg-gray-800')}
            aria-label={t('ged.scope.viewFullScope')}
            onMouseEnter={hoverOpen}
            onMouseLeave={hoverClose}
            onClick={(e) => {
              e.stopPropagation();
              clearTimers();
              if (pinned) {
                setPinned(false);
                setOpen(false);
              } else {
                setPinned(true);
                setOpen(true);
              }
            }}
          >
            <ScanEye className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-80 p-0"
          onClick={stop}
          onMouseEnter={clearTimers}
          onMouseLeave={hoverClose}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <ScopeDetails
            scope={scope}
            tags={tags}
            audience={audience}
            onDownload={handleDownload}
          />
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={iconButton}
            aria-label={t('ged.scope.downloadAudience')}
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="text-xs">{t('ged.scope.downloadAudience')}</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  const tagList = tags.map((tag) => (
    <Tooltip key={tag.key}>
      <TooltipTrigger asChild>
        <span className="min-w-0">
          <Tag icon={tag.icon} label={tag.label} className="px-2 py-0.5 text-[11px]" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="text-xs">
          {t(tag.typeKey)}
          {tag.hint ? ` · ${tag.hint}` : ''}
        </span>
      </TooltipContent>
    </Tooltip>
  ));

  const audienceChip = (
    <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-medium text-gray-500 dark:text-gray-400">
      <Users className="h-3 w-3" />
      {audienceLabel}
    </span>
  );

  if (layout === 'inline') {
    return (
      <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
        {showNature && <DocumentNatureBadge nature={scope.nature} />}
        {showFolder && hasPath && <FolderLocation path={scope.folderPath!} />}
        {tags.length > 0 && (
          <div className="flex min-w-0 items-center gap-1 overflow-hidden">{tagList}</div>
        )}
        {showAudience && audienceChip}
        {actions}
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 flex-col items-start gap-1.5', className)}>
      {(showNature || (showFolder && hasPath)) && (
        <div className="flex min-w-0 max-w-full items-center gap-2">
          {showNature && <DocumentNatureBadge nature={scope.nature} />}
          {showFolder && hasPath && <FolderLocation path={scope.folderPath!} />}
        </div>
      )}
      {tags.length > 0 && (
        <div className="flex max-w-full flex-wrap items-center gap-1">{tagList}</div>
      )}
      <div className="flex items-center gap-1.5">
        {showAudience && audienceChip}
        {actions}
      </div>
    </div>
  );
}

const DETAIL_PREVIEW_LIMIT = 5;

function ScopeDetails({
  scope,
  tags,
  audience,
  onDownload,
}: {
  scope: DocumentScopeData;
  tags: ScopeTagItem[];
  audience: ScopeAudience;
  onDownload: (e: MouseEvent) => void;
}) {
  const { t } = useTranslation();
  const isNominative = scope.nature === 'nominative';
  const path = scope.folderPath ?? [];
  const contacts = audience.investors.flatMap((i) => i.contacts);
  const previewInvestors = audience.investors.slice(0, DETAIL_PREVIEW_LIMIT);
  const remaining = audience.investors.length - previewInvestors.length;

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {t('ged.scope.detailsTitle')}
        </span>
        <DocumentNatureBadge nature={scope.nature} />
      </div>

      <div className="space-y-3 px-4 py-3">
        {path.length > 0 && (
          <section>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {t('ged.scope.location')}
            </div>
            <div className="flex flex-wrap items-center gap-0.5 text-xs text-gray-700 dark:text-gray-300">
              {path.map((segment, i) => (
                <span key={`${segment}-${i}`} className="inline-flex items-center gap-0.5">
                  {i > 0 && <ChevronRight className="h-3 w-3 text-gray-400" />}
                  {i === path.length - 1 && <Folder className="h-3 w-3 text-amber-500" />}
                  <span className={cn(i === path.length - 1 && 'font-medium')}>{segment}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {t('ged.scope.targeting')}
          </div>
          {tags.length > 0 ? (
            <dl className="space-y-1">
              {tags.map((tag) => {
                const Icon = tag.icon;
                return (
                  <div key={tag.key} className="flex items-start gap-2 text-xs">
                    <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <dt className="w-24 shrink-0 text-gray-500">{t(tag.typeKey)}</dt>
                    <dd className="min-w-0 break-words text-gray-900 dark:text-gray-100">
                      {tag.label}
                      {tag.hint && <div className="text-[11px] text-gray-500">{tag.hint}</div>}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <div className="text-xs text-gray-500">{t('ged.scope.noRestriction')}</div>
          )}
        </section>

        <section>
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            <span>{t('ged.scope.audience')}</span>
            <span className="normal-case tracking-normal font-medium">
              {t(audience.investorCount > 1 ? 'ged.scope.investorsMany' : 'ged.scope.investorsOne', {
                count: audience.investorCount,
              })}
              {' · '}
              {t(audience.contactCount > 1 ? 'ged.scope.contactsMany' : 'ged.scope.contactsOne', {
                count: audience.contactCount,
              })}
            </span>
          </div>
          {isNominative ? (
            contacts.length > 0 ? (
              <ul className="space-y-0.5">
                {contacts.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-gray-800 dark:text-gray-200">{c.name}</span>
                    {c.role && <span className="shrink-0 text-[10px] text-gray-400">{c.role}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-gray-400">{t('ged.scope.noContact')}</div>
            )
          ) : previewInvestors.length > 0 ? (
            <ul className="space-y-0.5">
              {previewInvestors.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-gray-800 dark:text-gray-200">{inv.name}</span>
                  <span className="shrink-0 text-[10px] text-gray-400">
                    {t(inv.contacts.length > 1 ? 'ged.scope.contactsMany' : 'ged.scope.contactsOne', {
                      count: inv.contacts.length,
                    })}
                  </span>
                </li>
              ))}
              {remaining > 0 && (
                <li className="text-[11px] text-gray-500">
                  {t(remaining > 1 ? 'ged.scope.moreInvestorsMany' : 'ged.scope.moreInvestorsOne', {
                    count: remaining,
                  })}
                </li>
              )}
            </ul>
          ) : (
            <div className="text-xs text-gray-400">{t('ged.scope.noInvestor')}</div>
          )}
        </section>
      </div>

      <div className="border-t px-4 py-2.5">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Download className="h-3.5 w-3.5" />
          {t('ged.scope.downloadAudience')}
        </button>
      </div>
    </div>
  );
}
