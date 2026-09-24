/**
 * Document scope - Design System component
 * Key: ds-document-scope
 *
 * Single source of truth for "where does this document live and who can see
 * it". Used in the document explorer (list view), the Bird View tree and the
 * publication center (validation page).
 *
 *  - Nature badge (generic / nominative)
 *  - Investor as a link (PP / PM icon), outside of the tags
 *  - Targeting tags (subscription as a square chip, structure, fund, share, segments)
 *  - "i" button opening, on click, the full scope: location, subscription
 *    identification, targeting, audience and the audience CSV download
 *
 * Exports:
 *  - <DocumentScope>          the widget (layout "stacked" or "inline")
 *  - resolveScopeAudience()   audience computed from the GED fixtures
 *  - resolveScopeSubscription() subscription identification from the fixtures
 *  - downloadScopeAudience()  CSV export of the audience
 */

import { useMemo, type MouseEvent, type ReactNode } from 'react';
import {
  Building2,
  ChevronRight,
  Download,
  FileText,
  Folder,
  Globe,
  Info,
  Landmark,
  Layers3,
  Tag as TagIcon,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Tag } from '../Tag';
import { TYPOLOGY_TO_SEGMENT } from '../AudienceCounter';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from './utils';
import { useTranslation } from '../../utils/languageContext';
import { navigateToPage } from '../../utils/routing';
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
  /** PP / PM. Inferred from the GED fixtures or the name when omitted. */
  investorKind?: 'individual' | 'corporate';
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
  square?: boolean;
  hint?: string;
}

export interface ScopeSubscriptionInfo {
  code: string;
  investor?: string;
  structure?: string;
  fund?: string;
  shareClass?: string;
  commitmentEur?: number;
  label?: string;
}

const COMMITMENT_BY_ID = new Map(COMMITMENTS.map((c) => [c.subscriptionId, c] as const));

export function resolveScopeSubscription(scope: DocumentScopeData): ScopeSubscriptionInfo | null {
  if (!scope.subscription) return null;
  const commitment = COMMITMENT_BY_ID.get(scope.subscription);
  if (!commitment) {
    return {
      code: scope.subscription,
      investor: scope.investor,
      structure: scope.structure,
      fund: isSpecific(scope.fund, ALL_FUNDS_LABELS) ? scope.fund : undefined,
      shareClass: scope.shareClass,
      label: scope.subscriptionLabel,
    };
  }
  const investor = INVESTORS.find((i) => i.id === commitment.investorId);
  const fund = FUNDS.find((f) => f.code === commitment.fundCode);
  return {
    code: commitment.subscriptionId,
    investor: investor?.name ?? scope.investor,
    structure: investor?.structure ?? scope.structure,
    fund: fund?.name ?? commitment.fundCode,
    shareClass: commitment.shareClass,
    commitmentEur: commitment.commitmentEur,
  };
}

export type ScopeInvestorKind = 'individual' | 'corporate';

const CORPORATE_MARKERS =
  /\b(holdings?|sas|sa|sarl|sci|scpi|ltd|llc|lp|plc|gmbh|inc|fund|trust|capital|office|group|groupe|partners|pension|insurance|assurances?|bank|banque|foundation|fondation|société|societe|invest|management|plan|scheme)\b/i;

export function resolveInvestorKind(scope: DocumentScopeData): ScopeInvestorKind {
  if (scope.investorKind) return scope.investorKind;
  const inv = scope.investor ? INVESTORS_BY_NAME.get(scope.investor) : undefined;
  if (inv) return inv.typology === 'HNWI' || inv.typology === 'UHNWI' ? 'individual' : 'corporate';
  return scope.investor && CORPORATE_MARKERS.test(scope.investor) ? 'corporate' : 'individual';
}

function buildTags(
  scope: DocumentScopeData,
  subscription: ScopeSubscriptionInfo | null,
  allFundsLabel: string,
): ScopeTagItem[] {
  const tags: ScopeTagItem[] = [];
  if (scope.nature === 'nominative') {
    if (subscription) {
      tags.push({
        key: 'subscription',
        icon: FileText,
        label: subscription.code,
        typeKey: 'ged.scope.types.subscription',
        square: true,
        hint: [subscription.fund, subscription.shareClass].filter(Boolean).join(' · ') || subscription.label,
      });
    }
    if (scope.structure) {
      tags.push({ key: 'structure', icon: Building2, label: scope.structure, typeKey: 'ged.scope.types.structure' });
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

function openInvestor(scope: DocumentScopeData) {
  const inv = scope.investor ? INVESTORS_BY_NAME.get(scope.investor) : undefined;
  navigateToPage('investors', inv ? { investor: inv.id } : { search: scope.investor ?? '' });
}

export function ScopeInvestorLink({
  scope,
  onClick,
  className,
}: {
  scope: DocumentScopeData;
  onClick?: () => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const kind = resolveInvestorKind(scope);
  const Icon = kind === 'corporate' ? Building2 : UserRound;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            (onClick ?? (() => openInvestor(scope)))();
          }}
          className={cn(
            'group inline-flex min-w-0 items-center gap-1.5 text-xs text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-300',
            className,
          )}
        >
          <Icon className="h-3 w-3 shrink-0 text-gray-400 transition-colors group-hover:text-blue-500" />
          <span className="max-w-[200px] truncate group-hover:underline">{scope.investor}</span>
          <ChevronRight className="h-3 w-3 shrink-0 opacity-50 transition-opacity group-hover:opacity-100" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="text-xs">
          {kind === 'corporate' ? t('ged.scope.investorCorporate') : t('ged.scope.investorIndividual')}
          {' · '}
          {t('ged.scope.openInvestor')}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

function ScopeTag({ tag }: { tag: ScopeTagItem }) {
  const { t } = useTranslation();
  const Icon = tag.icon;
  const chip = tag.square ? (
    <span className="inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[11px] font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
      <Icon className="h-3 w-3 shrink-0" />
      {tag.label}
    </span>
  ) : (
    <Tag icon={Icon} label={tag.label} className="px-2 py-0.5 text-[11px]" />
  );
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={tag.square ? 'shrink-0' : 'min-w-0'}>{chip}</span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="text-xs">
          {t(tag.typeKey)}
          {tag.hint ? ` · ${tag.hint}` : ''}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

interface DocumentScopeProps {
  scope: DocumentScopeData;
  /** "stacked" for table cells, "inline" for tree rows. */
  layout?: 'stacked' | 'inline';
  showNature?: boolean;
  onInvestorClick?: () => void;
  className?: string;
}

export function DocumentScope({
  scope,
  layout = 'stacked',
  showNature = true,
  onInvestorClick,
  className,
}: DocumentScopeProps) {
  const { t } = useTranslation();
  const subscription = useMemo(() => resolveScopeSubscription(scope), [scope]);
  const tags = buildTags(scope, subscription, t('ged.scope.allFunds'));
  const showInvestor = scope.nature === 'nominative' && !!scope.investor;

  const infoButton = (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={stop}
              aria-label={t('ged.scope.viewFullScope')}
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 dark:data-[state=open]:bg-gray-800"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="text-xs">{t('ged.scope.viewFullScope')}</span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-80 p-0" onClick={stop}>
        <ScopeDetails
          scope={scope}
          tags={tags}
          subscription={subscription}
          onInvestorClick={onInvestorClick}
        />
      </PopoverContent>
    </Popover>
  );

  const tagList = tags.map((tag) => <ScopeTag key={tag.key} tag={tag} />);

  if (layout === 'inline') {
    const inlineTags = subscription
      ? tags.filter((tag) => tag.key === 'subscription')
      : tags;
    return (
      <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
        {showNature && <DocumentNatureBadge nature={scope.nature} />}
        {showInvestor && (
          <ScopeInvestorLink scope={scope} onClick={onInvestorClick} className="min-w-[6rem] shrink" />
        )}
        {inlineTags.length > 0 && (
          <div
            className={cn(
              'flex items-center gap-1',
              subscription ? 'shrink-0' : 'min-w-0 overflow-hidden',
            )}
          >
            {inlineTags.map((tag) => (
              <ScopeTag key={tag.key} tag={tag} />
            ))}
          </div>
        )}
        {infoButton}
      </div>
    );
  }

  return (
    <div className={cn('flex min-w-0 flex-col items-start gap-1.5', className)}>
      {showNature && (
        <div className="flex items-center gap-1.5">
          <DocumentNatureBadge nature={scope.nature} />
          {infoButton}
        </div>
      )}
      {showInvestor && <ScopeInvestorLink scope={scope} onClick={onInvestorClick} />}
      {tags.length > 0 && (
        <div className="flex max-w-full flex-wrap items-center gap-1">
          {tagList}
          {!showNature && infoButton}
        </div>
      )}
    </div>
  );
}

const DETAIL_PREVIEW_LIMIT = 5;

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
      <dt className="w-24 shrink-0 text-gray-500">{label}</dt>
      <dd className="min-w-0 break-words text-gray-900 dark:text-gray-100">{children}</dd>
    </div>
  );
}

function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-gray-500">
      <span>{children}</span>
      {aside && <span className="font-medium normal-case tracking-normal">{aside}</span>}
    </div>
  );
}

function ScopeDetails({
  scope,
  tags,
  subscription,
  onInvestorClick,
}: {
  scope: DocumentScopeData;
  tags: ScopeTagItem[];
  subscription: ScopeSubscriptionInfo | null;
  onInvestorClick?: () => void;
}) {
  const { t, lang } = useTranslation();
  const audience = useMemo(() => resolveScopeAudience(scope), [scope]);
  const isNominative = scope.nature === 'nominative';
  const path = scope.folderPath ?? [];
  const contacts = audience.investors.flatMap((i) => i.contacts);
  const previewInvestors = audience.investors.slice(0, DETAIL_PREVIEW_LIMIT);
  const remaining = audience.investors.length - previewInvestors.length;
  const targetingTags = tags.filter((tag) => !subscription || tag.key !== 'subscription');
  const amountFormatter = new Intl.NumberFormat(lang === 'en' ? 'en-GB' : 'fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });

  const handleDownload = (e: MouseEvent) => {
    e.stopPropagation();
    const base = (path[path.length - 1] ?? scope.investor ?? 'audience').replace(/[^\w-]+/g, '_');
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

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {t('ged.scope.detailsTitle')}
        </span>
        <DocumentNatureBadge nature={scope.nature} />
      </div>

      <div className="max-h-[60vh] space-y-3 overflow-y-auto px-4 py-3">
        {path.length > 0 && (
          <section>
            <SectionTitle>{t('ged.scope.location')}</SectionTitle>
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

        {isNominative && scope.investor && (
          <section>
            <SectionTitle>{t('ged.scope.types.investor')}</SectionTitle>
            <ScopeInvestorLink scope={scope} onClick={onInvestorClick} />
          </section>
        )}

        {subscription && (
          <section>
            <SectionTitle>{t('ged.scope.types.subscription')}</SectionTitle>
            <dl className="space-y-1">
              <DetailRow icon={FileText} label={t('ged.scope.subscription.code')}>
                <span className="font-medium">{subscription.code}</span>
              </DetailRow>
              {subscription.investor && (
                <DetailRow icon={resolveInvestorKind(scope) === 'corporate' ? Building2 : UserRound} label={t('ged.scope.types.investor')}>
                  {subscription.investor}
                </DetailRow>
              )}
              {subscription.structure && (
                <DetailRow icon={Building2} label={t('ged.scope.types.structure')}>
                  {subscription.structure}
                </DetailRow>
              )}
              {subscription.fund && (
                <DetailRow icon={Landmark} label={t('ged.scope.types.fund')}>
                  {subscription.fund}
                </DetailRow>
              )}
              {subscription.shareClass && (
                <DetailRow icon={Layers3} label={t('ged.scope.types.share')}>
                  {subscription.shareClass}
                </DetailRow>
              )}
              {subscription.commitmentEur !== undefined && (
                <DetailRow icon={Wallet} label={t('ged.scope.subscription.commitment')}>
                  {amountFormatter.format(subscription.commitmentEur)}
                </DetailRow>
              )}
              {!subscription.fund && subscription.label && (
                <DetailRow icon={Info} label={t('ged.scope.subscription.label')}>
                  {subscription.label}
                </DetailRow>
              )}
            </dl>
          </section>
        )}

        {(!subscription || targetingTags.length > 0) && (
          <section>
            <SectionTitle>{t('ged.scope.targeting')}</SectionTitle>
            {targetingTags.length > 0 ? (
              <dl className="space-y-1">
                {targetingTags.map((tag) => (
                  <DetailRow key={tag.key} icon={tag.icon} label={t(tag.typeKey)}>
                    {tag.label}
                  </DetailRow>
                ))}
              </dl>
            ) : (
              <div className="text-xs text-gray-500">{t('ged.scope.noRestriction')}</div>
            )}
          </section>
        )}

        <section>
          <SectionTitle
            aside={
              <>
                {t(audience.investorCount > 1 ? 'ged.scope.investorsMany' : 'ged.scope.investorsOne', {
                  count: audience.investorCount,
                })}
                {' · '}
                {t(audience.contactCount > 1 ? 'ged.scope.contactsMany' : 'ged.scope.contactsOne', {
                  count: audience.contactCount,
                })}
              </>
            }
          >
            {t('ged.scope.audience')}
          </SectionTitle>
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
          onClick={handleDownload}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <Download className="h-3.5 w-3.5" />
          {t('ged.scope.downloadAudience')}
        </button>
      </div>
    </div>
  );
}
