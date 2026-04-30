import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Separator } from './separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { DatePicker } from './date-picker';
import { cn } from './utils';
import { UserCell } from '../UserCell';
import { useTranslation, type Language } from '../../utils/languageContext';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Generic timeline event. Any domain-specific type can be passed as `TType`.
 * The only hard requirements are `id`, `type` and `timestamp`. Everything else
 * is optional so the component stays fully neutral.
 */
export interface TimelineEvent<TType extends string = string> {
  /** Stable unique identifier — used as React key. */
  id: string;
  /** Domain-specific event type (e.g. 'notification_sent'). */
  type: TType;
  /** ISO-8601 datetime string. Source of truth for date/time display. */
  timestamp: string;
  /** Optional primary actor name shown in the avatar row. */
  actorName?: string;
  /** Optional secondary label below the actor (e.g. email). */
  actorSublabel?: string;
  /** Short role label (e.g. "Investor", "Admin"). Used for filtering. */
  actorRole?: string;
  /** Optional extra content rendered under the actor row (small caption). */
  description?: React.ReactNode;
  /** Arbitrary metadata kept in the object for downstream use. */
  meta?: Record<string, unknown>;
}

/**
 * Descriptor attached to each event type. Kept neutral (icon + label only).
 * Extend downstream via the `meta` prop if you need colors or grouping.
 */
export interface TimelineTypeDescriptor {
  label: string;
  Icon: LucideIcon;
}

export type TimelineTypeMap<TType extends string = string> = Record<
  TType,
  TimelineTypeDescriptor
>;

/** Column definition used when exporting the timeline as CSV. */
export interface TimelineCsvColumn<TType extends string = string> {
  header: string;
  value: (event: TimelineEvent<TType>) => string;
}

/** Filter state shared by the built-in toolbar. */
export interface TimelineFilters<TType extends string = string> {
  actor: string; // '' = all
  search: string;
  type: TType | 'all';
  role: string; // '' = all
  dateFrom?: Date;
  dateTo?: Date;
}

export const emptyTimelineFilters: TimelineFilters = {
  actor: '',
  search: '',
  type: 'all',
  role: '',
  dateFrom: undefined,
  dateTo: undefined,
};

export interface TimelineProps<TType extends string = string> {
  /** Events to display. Sorted descending by timestamp by default. */
  events: TimelineEvent<TType>[];
  /** Maps an event type to its icon + label. */
  types: TimelineTypeMap<TType>;
  /** Loading skeleton. */
  isLoading?: boolean;
  /** Enables the built-in filter toolbar. */
  enableFilters?: boolean;
  /** Enables the built-in CSV export button. */
  enableExport?: boolean;
  /** File name stem used by the CSV export (extension & date appended). */
  exportFileName?: string;
  /**
   * Columns used for CSV export. If not provided, a sensible default is used
   * (date, time, type, actor, sublabel, role).
   */
  exportColumns?: TimelineCsvColumn<TType>[];
  /** Page size for the built-in pagination (set to 0 to disable). */
  pageSize?: number;
  /** Empty state message shown when no events are present. */
  emptyLabel?: string;
  /** Empty state message shown when filters yield no result. */
  emptyFilteredLabel?: string;
  /** Renders a custom right-aligned content area for each event (optional). */
  renderEventAside?: (event: TimelineEvent<TType>) => React.ReactNode;
  /** Additional classes applied to the outer container. */
  className?: string;
  /** Compact mode reduces padding & font sizes. */
  dense?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const localeFor = (lang: Language) => (lang === 'en' ? 'en-US' : 'fr-FR');

const formatTime = (iso: string, lang: Language) =>
  new Date(iso).toLocaleTimeString(localeFor(lang), {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatFullDate = (iso: string, lang: Language) =>
  new Date(iso).toLocaleDateString(localeFor(lang), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const formatDateGroupLabel = (iso: string, lang: Language, t: TFn) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return t('ged.timeline.today');
  if (sameDay(date, yesterday)) return t('ged.timeline.yesterday');

  return date.toLocaleDateString(localeFor(lang), {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const groupByDay = <TType extends string>(events: TimelineEvent<TType>[]) => {
  const groups = new Map<string, TimelineEvent<TType>[]>();
  for (const ev of events) {
    const key = new Date(ev.timestamp).toDateString();
    const bucket = groups.get(key);
    if (bucket) bucket.push(ev);
    else groups.set(key, [ev]);
  }
  return Array.from(groups.entries()).map(([, items]) => items);
};

const hasActiveFilters = <TType extends string>(
  f: TimelineFilters<TType>,
) =>
  f.actor !== '' ||
  f.search.trim() !== '' ||
  f.type !== 'all' ||
  f.role !== '' ||
  f.dateFrom !== undefined ||
  f.dateTo !== undefined;

const applyFilters = <TType extends string>(
  events: TimelineEvent<TType>[],
  f: TimelineFilters<TType>,
) => {
  const search = f.search.trim().toLowerCase();
  return events.filter((ev) => {
    if (f.actor && ev.actorName !== f.actor) return false;
    if (f.type !== 'all' && ev.type !== f.type) return false;
    if (f.role && ev.actorRole !== f.role) return false;
    if (search) {
      const haystack = [ev.actorName, ev.actorSublabel]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (f.dateFrom || f.dateTo) {
      const t = new Date(ev.timestamp).getTime();
      if (f.dateFrom) {
        const from = new Date(f.dateFrom);
        from.setHours(0, 0, 0, 0);
        if (t < from.getTime()) return false;
      }
      if (f.dateTo) {
        const to = new Date(f.dateTo);
        to.setHours(23, 59, 59, 999);
        if (t > to.getTime()) return false;
      }
    }
    return true;
  });
};

// ---------------------------------------------------------------------------
// CSV export (RFC 4180-ish, UTF-8 BOM so Excel is happy)
// ---------------------------------------------------------------------------

const csvField = (value: string | undefined | null) => {
  const v = value ?? '';
  if (/[",;\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
};

const sanitizeFilename = (name: string) =>
  name
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/[^A-Za-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'timeline';

const buildCsv = <TType extends string>(
  events: TimelineEvent<TType>[],
  columns: TimelineCsvColumn<TType>[],
) => {
  const lines = [columns.map((c) => csvField(c.header)).join(';')];
  for (const ev of events) {
    lines.push(columns.map((c) => csvField(c.value(ev))).join(';'));
  }
  return '\ufeff' + lines.join('\r\n');
};

const downloadCsv = <TType extends string>(
  events: TimelineEvent<TType>[],
  columns: TimelineCsvColumn<TType>[],
  fileStem: string,
) => {
  if (typeof document === 'undefined') return;
  const csv = buildCsv(events, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(fileStem)}-${today}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const buildDefaultExportColumns = <TType extends string>(
  types: TimelineTypeMap<TType>,
  lang: Language,
): TimelineCsvColumn<TType>[] => [
  {
    header: 'Date',
    value: (ev) => new Date(ev.timestamp).toLocaleDateString(localeFor(lang)),
  },
  {
    header: lang === 'en' ? 'Time' : 'Heure',
    value: (ev) =>
      new Date(ev.timestamp).toLocaleTimeString(localeFor(lang), {
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
  {
    header: lang === 'en' ? 'Event type' : "Type d'événement",
    value: (ev) => types[ev.type]?.label ?? String(ev.type),
  },
  { header: lang === 'en' ? 'Actor' : 'Acteur', value: (ev) => ev.actorName ?? '' },
  { header: lang === 'en' ? 'Detail' : 'Détail', value: (ev) => ev.actorSublabel ?? '' },
  { header: lang === 'en' ? 'Role' : 'Rôle', value: (ev) => ev.actorRole ?? '' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Timeline<TType extends string = string>({
  events,
  types,
  isLoading = false,
  enableFilters = true,
  enableExport = true,
  exportFileName = 'timeline',
  exportColumns,
  pageSize = 10,
  emptyLabel,
  emptyFilteredLabel,
  renderEventAside,
  className,
  dense = false,
}: TimelineProps<TType>) {
  const { t, lang } = useTranslation();
  const resolvedEmptyLabel = emptyLabel ?? t('ged.timeline.emptyLabel');
  const resolvedEmptyFilteredLabel =
    emptyFilteredLabel ?? t('ged.timeline.emptyFilteredLabel');
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<TimelineFilters<TType>>(
    emptyTimelineFilters as TimelineFilters<TType>,
  );
  const [currentPage, setCurrentPage] = React.useState(1);

  // Distinct actors for the dropdown.
  const distinctActors = React.useMemo(() => {
    const set = new Set<string>();
    for (const e of events) if (e.actorName) set.add(e.actorName);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const distinctRoles = React.useMemo(() => {
    const set = new Set<string>();
    for (const e of events) if (e.actorRole) set.add(e.actorRole);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [events]);

  const typeOptions = React.useMemo(
    () =>
      (Object.entries(types) as [TType, TimelineTypeDescriptor][]).map(
        ([value, { label }]) => ({ value, label }),
      ),
    [types],
  );

  const sortedEvents = React.useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    [events],
  );

  const filteredEvents = React.useMemo(
    () => (enableFilters ? applyFilters(sortedEvents, filters) : sortedEvents),
    [enableFilters, sortedEvents, filters],
  );

  const filtersActive = enableFilters && hasActiveFilters(filters);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const paginated = pageSize > 0;
  const totalPages = paginated
    ? Math.max(1, Math.ceil(filteredEvents.length / pageSize))
    : 1;
  const safePage = Math.min(currentPage, totalPages);
  const pagedEvents = React.useMemo(() => {
    if (!paginated) return filteredEvents;
    const start = (safePage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, paginated, safePage, pageSize]);

  const grouped = React.useMemo(() => groupByDay(pagedEvents), [pagedEvents]);

  const rangeStart =
    filteredEvents.length === 0 ? 0 : (safePage - 1) * (pageSize || 1) + 1;
  const rangeEnd = Math.min(
    safePage * (pageSize || filteredEvents.length),
    filteredEvents.length,
  );

  const resolvedExportColumns = React.useMemo(
    () => exportColumns ?? buildDefaultExportColumns(types, lang),
    [exportColumns, types, lang],
  );

  const activeFilterCount = React.useMemo(
    () =>
      [
        filters.actor ? 1 : 0,
        filters.search.trim() ? 1 : 0,
        filters.type !== 'all' ? 1 : 0,
        filters.role ? 1 : 0,
        filters.dateFrom ? 1 : 0,
        filters.dateTo ? 1 : 0,
      ].reduce((a, b) => a + b, 0),
    [filters],
  );

  const resetFilters = () =>
    setFilters(emptyTimelineFilters as TimelineFilters<TType>);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      data-slot="timeline"
      className={cn('flex flex-col w-full', className)}
    >
      {(enableFilters || enableExport) && (
        <div
          className={cn(
            'flex items-center justify-between gap-2 flex-wrap',
            dense ? 'py-2' : 'py-3',
          )}
        >
          <div className="flex items-center gap-2">
            {enableFilters && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {t('ged.timeline.filters')}
                {filtersActive && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}
            {enableExport && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  downloadCsv(filteredEvents, resolvedExportColumns, exportFileName)
                }
                disabled={filteredEvents.length === 0}
                title={t('ged.timeline.exportCsvTitle')}
              >
                <Download className="w-3.5 h-3.5" />
                {t('ged.timeline.exportCsv')}
              </Button>
            )}
          </div>

          <span className="text-xs text-muted-foreground">
            {t(
              filteredEvents.length > 1
                ? 'ged.timeline.eventCountMany'
                : 'ged.timeline.eventCountOne',
              { count: filteredEvents.length },
            )}
            {filtersActive && events.length !== filteredEvents.length && (
              <span className="text-muted-foreground/70"> / {events.length}</span>
            )}
          </span>
        </div>
      )}

      <AnimatePresence initial={false}>
        {enableFilters && showFilters && (
          <motion.div
            key="timeline-filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border bg-muted/30 p-3 grid grid-cols-2 gap-3 mb-3">
              {distinctActors.length > 0 && (
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    {t('ged.timeline.actor')}
                  </label>
                  <Select
                    value={filters.actor || 'all'}
                    onValueChange={(v) =>
                      setFilters((f) => ({ ...f, actor: v === 'all' ? '' : v }))
                    }
                  >
                    <SelectTrigger size="sm" className="h-8 text-xs">
                      <SelectValue placeholder={t('ged.timeline.allPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('ged.timeline.allActors')}</SelectItem>
                      {distinctActors.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {typeOptions.length > 0 && (
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    {t('ged.timeline.eventType')}
                  </label>
                  <Select
                    value={filters.type as string}
                    onValueChange={(v) =>
                      setFilters((f) => ({
                        ...f,
                        type: v as TimelineFilters<TType>['type'],
                      }))
                    }
                  >
                    <SelectTrigger size="sm" className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('ged.timeline.allTypes')}</SelectItem>
                      {typeOptions.map((opt) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {distinctRoles.length > 0 && (
                <div className="col-span-1">
                  <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                    {t('ged.timeline.role')}
                  </label>
                  <Select
                    value={filters.role || 'all'}
                    onValueChange={(v) =>
                      setFilters((f) => ({ ...f, role: v === 'all' ? '' : v }))
                    }
                  >
                    <SelectTrigger size="sm" className="h-8 text-xs">
                      <SelectValue placeholder={t('ged.timeline.allPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('ged.timeline.allRoles')}</SelectItem>
                      {distinctRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div
                className={cn(
                  distinctRoles.length > 0 ? 'col-span-1' : 'col-span-2',
                )}
              >
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  {t('ged.timeline.search')}
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-8 text-xs"
                    placeholder={t('ged.timeline.searchPlaceholder')}
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, search: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="col-span-1">
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  {t('ged.timeline.dateFrom')}
                </label>
                <DatePicker
                  date={filters.dateFrom}
                  onDateChange={(d) =>
                    setFilters((f) => ({ ...f, dateFrom: d }))
                  }
                  placeholder={t('ged.timeline.dateFromPlaceholder')}
                  className="h-8 text-xs"
                  maxDate={filters.dateTo}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">
                  {t('ged.timeline.dateTo')}
                </label>
                <DatePicker
                  date={filters.dateTo}
                  onDateChange={(d) => setFilters((f) => ({ ...f, dateTo: d }))}
                  placeholder={t('ged.timeline.dateToPlaceholder')}
                  className="h-8 text-xs"
                  minDate={filters.dateFrom}
                />
              </div>

              {filtersActive && (
                <div className="col-span-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={resetFilters}
                  >
                    <X className="w-3.5 h-3.5" />
                    {t('ged.timeline.resetFilters')}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('ged.timeline.loading')}</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {filtersActive ? resolvedEmptyFilteredLabel : resolvedEmptyLabel}
              </p>
              {filtersActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={resetFilters}
                >
                  {t('ged.timeline.resetFilters')}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className={cn('space-y-5', dense && 'space-y-4')}>
            {grouped.map((dayEvents, groupIdx) => (
              <div key={groupIdx}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {formatDateGroupLabel(dayEvents[0].timestamp, lang, t)}
                  </span>
                  <Separator className="flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {formatFullDate(dayEvents[0].timestamp, lang)}
                  </span>
                </div>

                <ol className="relative space-y-3">
                  {dayEvents.map((event, idx) => {
                    const descriptor = types[event.type];
                    const Icon = descriptor?.Icon;
                    const label = descriptor?.label ?? String(event.type);
                    const isLastInGroup = idx === dayEvents.length - 1;

                    return (
                      <li key={event.id} className="relative flex gap-3">
                        {!isLastInGroup && (
                          <span
                            aria-hidden
                            className="absolute left-4 top-8 bottom-0 w-px bg-border -translate-x-1/2"
                          />
                        )}

                        {/* Neutral icon bubble */}
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-border bg-muted">
                          {Icon ? (
                            <Icon className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm font-medium text-foreground">
                              {label}
                            </span>
                            {renderEventAside ? (
                              renderEventAside(event)
                            ) : (
                              <div className="flex flex-col items-end flex-shrink-0">
                                <span className="text-xs font-medium text-foreground tabular-nums">
                                  {formatTime(event.timestamp, lang)}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {formatFullDate(event.timestamp, lang)}
                                </span>
                              </div>
                            )}
                          </div>

                          {event.actorName && (
                            <div className="mt-1.5">
                              <UserCell
                                name={event.actorName}
                                sublabel={event.actorSublabel}
                                size="sm"
                              />
                            </div>
                          )}

                          {event.description && (
                            <div className="mt-1 ml-8 text-xs text-muted-foreground">
                              {event.description}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {paginated && !isLoading && filteredEvents.length > 0 && (
        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{rangeStart}</span>
            {'–'}
            <span className="font-medium text-foreground">{rangeEnd}</span>{' '}
            {t(
              filteredEvents.length > 1
                ? 'ged.timeline.paginationRangeMany'
                : 'ged.timeline.paginationRangeOne',
              { total: filteredEvents.length },
            )}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label={t('ged.timeline.previousPage')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-xs text-muted-foreground px-2 tabular-nums">
              {t('ged.timeline.page')}{' '}
              <span className="font-medium text-foreground">{safePage}</span>
              {' / '}
              <span className="font-medium text-foreground">{totalPages}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={safePage === totalPages}
              aria-label={t('ged.timeline.nextPage')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

Timeline.displayName = 'Timeline';
