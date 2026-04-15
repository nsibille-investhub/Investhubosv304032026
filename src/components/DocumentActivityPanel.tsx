import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Download,
  Zap,
  Eye,
  MailOpen,
  MailCheck,
  Send,
  FileText,
  AlertCircle,
  MousePointerClick,
  ChevronLeft,
  ChevronRight,
  Users,
  SlidersHorizontal,
  Search,
  User as UserIcon,
  Mail,
  Calendar as CalendarIcon,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { DatePicker } from './ui/date-picker';
import { cn } from './ui/utils';
import { DocumentRelaunchModal } from './DocumentRelaunchModal';

type ActivityType =
  | 'notification_sent'
  | 'notification_delivered'
  | 'notification_failed'
  | 'notification_opened'
  | 'notification_clicked'
  | 'document_viewed'
  | 'document_downloaded';

interface ActivityEvent {
  id: string;
  type: ActivityType;
  userName: string;
  userEmail: string;
  userType: 'Investor' | 'Contact' | 'Advisor';
  /** ISO-8601 datetime string. Always the source of truth for date/time display. */
  timestamp: string;
  /** Required when userType === 'Contact' — name of the investor this contact is linked to. */
  primaryInvestor?: string;
}

interface DocumentActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
  isNominatif?: boolean;
}

const PAGE_SIZE = 6;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const iso = (daysAgo: number, h: number, m: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

/**
 * Generic document: broadcast to many investors + their contacts.
 * Engagement = share of distinct investors who at least consulted it.
 */
const generateGenericMockActivities = (): ActivityEvent[] => [
  // Aujourd'hui — Jean Dupont (investisseur principal) + son cercle
  { id: 'g1',  type: 'document_downloaded', userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 14, 12) },
  { id: 'g2',  type: 'document_viewed',     userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 12, 35) },
  { id: 'g3',  type: 'notification_opened', userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 12, 30) },
  { id: 'g4',  type: 'notification_clicked',userName: 'Marie Dupont',    userEmail: 'marie.dupont@lvmh.fr',      userType: 'Contact',  timestamp: iso(0, 11, 45), primaryInvestor: 'Jean Dupont' },
  { id: 'g5',  type: 'notification_opened', userName: 'Pierre Dupont',   userEmail: 'pierre.dupont@cabinet-kl.fr', userType: 'Contact', timestamp: iso(0, 11, 20), primaryInvestor: 'Jean Dupont' },
  // Aujourd'hui — broadcast initial
  { id: 'g6',  type: 'notification_sent',   userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'g7',  type: 'notification_sent',   userName: 'Marie Dupont',    userEmail: 'marie.dupont@lvmh.fr',      userType: 'Contact',  timestamp: iso(0, 11, 0), primaryInvestor: 'Jean Dupont' },
  { id: 'g8',  type: 'notification_sent',   userName: 'Pierre Dupont',   userEmail: 'pierre.dupont@cabinet-kl.fr', userType: 'Contact', timestamp: iso(0, 11, 0), primaryInvestor: 'Jean Dupont' },
  { id: 'g9',  type: 'notification_sent',   userName: 'Sophie Martin',   userEmail: 'sophie.martin@kering.com',  userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'g10', type: 'notification_sent',   userName: 'Luc Martin',      userEmail: 'luc.martin@kering.com',     userType: 'Contact',  timestamp: iso(0, 11, 0), primaryInvestor: 'Sophie Martin' },
  { id: 'g11', type: 'notification_sent',   userName: 'Thomas Bernard',  userEmail: 'thomas.bernard@axa-im.fr',  userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'g12', type: 'notification_sent',   userName: 'Claire Moreau',   userEmail: 'claire.moreau@bnp-wm.fr',   userType: 'Investor', timestamp: iso(0, 11, 0) },
  // Hier — Sophie Martin consulte
  { id: 'g13', type: 'document_viewed',     userName: 'Sophie Martin',   userEmail: 'sophie.martin@kering.com',  userType: 'Investor', timestamp: iso(1, 16, 42) },
  { id: 'g14', type: 'notification_delivered', userName: 'Thomas Bernard', userEmail: 'thomas.bernard@axa-im.fr', userType: 'Investor', timestamp: iso(1, 11, 2) },
  { id: 'g15', type: 'notification_failed', userName: 'Claire Moreau',   userEmail: 'claire.moreau@bnp-wm.fr',   userType: 'Investor', timestamp: iso(1, 10, 58) },
  // Avant-hier — advisor
  { id: 'g16', type: 'notification_opened', userName: 'Antoine Leroy',   userEmail: 'a.leroy@conseil-patrimoine.fr', userType: 'Advisor', timestamp: iso(2, 9, 30) },
];

/**
 * Nominative document: tied to ONE investor and his contacts only.
 * Engagement = viewed by at least one of the linked contacts.
 */
const generateNominatifMockActivities = (): ActivityEvent[] => [
  { id: 'n1', type: 'document_downloaded', userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 15, 10) },
  { id: 'n2', type: 'document_viewed',     userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 12, 35) },
  { id: 'n3', type: 'notification_clicked',userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 12, 30) },
  { id: 'n4', type: 'notification_opened', userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 12, 30) },
  { id: 'n5', type: 'notification_opened', userName: 'Marie Dupont',  userEmail: 'marie.dupont@lvmh.fr',         userType: 'Contact',  timestamp: iso(0, 11, 42), primaryInvestor: 'Jean Dupont' },
  { id: 'n6', type: 'notification_delivered', userName: 'Jean Dupont', userEmail: 'jean.dupont@lvmh.fr',         userType: 'Investor', timestamp: iso(0, 11, 2) },
  { id: 'n7', type: 'notification_delivered', userName: 'Marie Dupont', userEmail: 'marie.dupont@lvmh.fr',       userType: 'Contact',  timestamp: iso(0, 11, 2),  primaryInvestor: 'Jean Dupont' },
  { id: 'n8', type: 'notification_delivered', userName: 'Pierre Dupont', userEmail: 'pierre.dupont@cabinet-kl.fr', userType: 'Contact', timestamp: iso(0, 11, 2),  primaryInvestor: 'Jean Dupont' },
  { id: 'n9', type: 'notification_sent',   userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'n10',type: 'notification_sent',   userName: 'Marie Dupont',  userEmail: 'marie.dupont@lvmh.fr',         userType: 'Contact',  timestamp: iso(0, 11, 0),  primaryInvestor: 'Jean Dupont' },
  { id: 'n11',type: 'notification_sent',   userName: 'Pierre Dupont', userEmail: 'pierre.dupont@cabinet-kl.fr',  userType: 'Contact',  timestamp: iso(0, 11, 0),  primaryInvestor: 'Jean Dupont' },
  { id: 'n12',type: 'notification_failed', userName: 'Antoine Leroy', userEmail: 'a.leroy@conseil-patrimoine.fr', userType: 'Advisor', timestamp: iso(1, 18, 5),  primaryInvestor: 'Jean Dupont' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const eventMeta: Record<ActivityType, { label: string; Icon: typeof Send }> = {
  notification_sent:      { label: 'Notification envoyée',   Icon: Send },
  notification_delivered: { label: 'Notification délivrée',  Icon: MailCheck },
  notification_failed:    { label: 'Notification échouée',   Icon: AlertCircle },
  notification_opened:    { label: 'Notification ouverte',   Icon: MailOpen },
  notification_clicked:   { label: 'Notification cliquée',   Icon: MousePointerClick },
  document_viewed:        { label: 'Document consulté',      Icon: Eye },
  document_downloaded:    { label: 'Document téléchargé',    Icon: Download },
};

const eventTypeOptions: { value: ActivityType; label: string }[] = (
  Object.entries(eventMeta) as [ActivityType, { label: string }][]
).map(([value, { label }]) => ({ value, label }));

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatDateGroupLabel = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return "Aujourd'hui";
  if (sameDay(date, yesterday)) return 'Hier';

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const groupByDay = (events: ActivityEvent[]) => {
  const groups = new Map<string, ActivityEvent[]>();
  for (const ev of events) {
    const key = new Date(ev.timestamp).toDateString();
    const bucket = groups.get(key);
    if (bucket) bucket.push(ev);
    else groups.set(key, [ev]);
  }
  return Array.from(groups.entries()).map(([, items]) => items);
};

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

const userTypeLabel: Record<ActivityEvent['userType'], string> = {
  Investor: 'Investisseur',
  Contact: 'Contact',
  Advisor: 'Conseiller',
};

/** RFC 4180-ish quoting for a single CSV field. */
const csvField = (value: string | undefined | null) => {
  const v = value ?? '';
  if (/[",;\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
};

const sanitizeFilename = (name: string) =>
  name
    .replace(/\.[A-Za-z0-9]+$/, '')
    .replace(/[^A-Za-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'document';

const buildCsv = (events: ActivityEvent[]) => {
  const headers = [
    'Date',
    'Heure',
    "Type d'événement",
    'Utilisateur',
    'Email',
    'Type utilisateur',
    'Investisseur principal',
  ];
  const lines = [headers.map(csvField).join(';')];

  for (const ev of events) {
    const d = new Date(ev.timestamp);
    const date = d.toLocaleDateString('fr-FR');
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    lines.push(
      [
        csvField(date),
        csvField(time),
        csvField(eventMeta[ev.type].label),
        csvField(ev.userName),
        csvField(ev.userEmail),
        csvField(userTypeLabel[ev.userType]),
        csvField(ev.primaryInvestor ?? ''),
      ].join(';'),
    );
  }

  // Prepend BOM so Excel opens UTF-8 properly.
  return '\ufeff' + lines.join('\r\n');
};

const downloadCsv = (events: ActivityEvent[], documentName: string) => {
  if (typeof document === 'undefined') return;
  const csv = buildCsv(events);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `piste-activite-${sanitizeFilename(documentName)}-${today}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Defer revocation so Safari has time to trigger the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

interface Filters {
  userName: string; // '' = all
  email: string;
  type: ActivityType | 'all';
  dateFrom?: Date;
  dateTo?: Date;
}

const emptyFilters: Filters = {
  userName: '',
  email: '',
  type: 'all',
  dateFrom: undefined,
  dateTo: undefined,
};

const hasActiveFilters = (f: Filters) =>
  f.userName !== '' ||
  f.email.trim() !== '' ||
  f.type !== 'all' ||
  f.dateFrom !== undefined ||
  f.dateTo !== undefined;

const applyFilters = (events: ActivityEvent[], f: Filters) => {
  return events.filter((ev) => {
    if (f.userName && ev.userName !== f.userName) return false;
    if (f.email.trim() && !ev.userEmail.toLowerCase().includes(f.email.trim().toLowerCase()))
      return false;
    if (f.type !== 'all' && ev.type !== f.type) return false;
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
// Engagement computation
// ---------------------------------------------------------------------------

interface EngagementResult {
  label: string;
  sublabel: string;
  /** 0–100 for the progress ring. */
  percent: number;
  /** success / neutral for color accent. */
  tone: 'success' | 'neutral';
}

const computeEngagement = (events: ActivityEvent[], isNominatif: boolean): EngagementResult => {
  const viewedEvents = events.filter(
    (e) => e.type === 'document_viewed' || e.type === 'document_downloaded',
  );

  if (isNominatif) {
    // Unique people who have consulted (investor + his contacts).
    const viewers = new Set(viewedEvents.map((e) => e.userEmail));
    const recipients = new Set(events.map((e) => e.userEmail));
    const count = viewers.size;
    const total = recipients.size;
    const percent = total === 0 ? 0 : Math.round((count / total) * 100);
    return {
      label: count > 0 ? 'Document consulté' : 'Non consulté',
      sublabel:
        count > 0
          ? `Par ${count} contact${count > 1 ? 's' : ''} sur ${total}`
          : `Aucun destinataire n'a encore ouvert`,
      percent: count > 0 ? 100 : 0,
      tone: count > 0 ? 'success' : 'neutral',
    };
  }

  // Generic: share of distinct *investors* who consulted.
  const investorEvents = events.filter((e) => e.userType === 'Investor');
  const allInvestors = new Set(investorEvents.map((e) => e.userEmail));
  const viewedInvestors = new Set(
    viewedEvents.filter((e) => e.userType === 'Investor').map((e) => e.userEmail),
  );
  const total = allInvestors.size;
  const count = viewedInvestors.size;
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
  return {
    label: `${count} / ${total} investisseur${total > 1 ? 's' : ''}`,
    sublabel: 'ont consulté le document',
    percent,
    tone: percent >= 50 ? 'success' : 'neutral',
  };
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DocumentActivityPanel({
  isOpen,
  onClose,
  documentName,
  documentId,
  isNominatif = true,
}: DocumentActivityPanelProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRelaunchModalOpen, setIsRelaunchModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(emptyFilters);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setCurrentPage(1);
      setFilters(emptyFilters);
      setShowFilters(false);
      const timer = setTimeout(() => {
        const source = isNominatif
          ? generateNominatifMockActivities()
          : generateGenericMockActivities();
        const data = source.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setActivities(data);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, documentId, isNominatif]);

  // Distinct users for the "utilisateur" filter dropdown.
  const distinctUsers = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of activities) if (!map.has(e.userName)) map.set(e.userName, e.userEmail);
    return Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const filteredActivities = useMemo(
    () => applyFilters(activities, filters),
    [activities, filters],
  );

  // Engagement is always computed from the full dataset (not filter-dependent).
  const engagement = useMemo(
    () => computeEngagement(activities, isNominatif),
    [activities, isNominatif],
  );

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  useEffect(() => {
    // Reset to page 1 when filters change the pool.
    setCurrentPage(1);
  }, [filters]);

  const pagedActivities = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredActivities.slice(start, start + PAGE_SIZE);
  }, [filteredActivities, safePage]);

  const grouped = useMemo(() => groupByDay(pagedActivities), [pagedActivities]);

  const rangeStart = filteredActivities.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredActivities.length);

  const filtersActive = hasActiveFilters(filters);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[560px] max-w-full bg-background text-foreground shadow-2xl z-50 flex flex-col border-l border-border"
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-5 border-b border-border">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-brand"
                style={{
                  background:
                    'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                }}
              >
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">
                  Piste d'activité
                </h2>
                <p className="text-sm text-muted-foreground">
                  Historique des interactions
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer la piste d'activité"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Document info + engagement KPI + Relancer */}
            <div className="px-6 py-4 space-y-3 bg-muted/40 border-b border-border">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {documentName}
                </span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isNominatif ? 'Nominatif' : 'Générique'}
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5">
                {/* Engagement visual */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      className="stroke-border"
                      strokeWidth="3"
                      fill="none"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      className={cn(
                        engagement.tone === 'success'
                          ? 'stroke-brand-success'
                          : 'stroke-muted-foreground/50',
                      )}
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${engagement.percent}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isNominatif ? (
                      engagement.tone === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-success" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )
                    ) : (
                      <span className="text-[11px] font-semibold text-foreground">
                        {engagement.percent}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Engagement text */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {engagement.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {engagement.sublabel}
                  </div>
                </div>

                {/* Relancer */}
                <Button
                  size="sm"
                  onClick={() => setIsRelaunchModalOpen(true)}
                  className="text-white border-0 flex-shrink-0"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                  }}
                >
                  <Send className="w-3.5 h-3.5" />
                  Relancer
                </Button>
              </div>
            </div>

            {/* Filters toolbar */}
            <div className="px-6 py-3 border-b border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filtres
                  {filtersActive && (
                    <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1">
                      {[
                        filters.userName ? 1 : 0,
                        filters.email.trim() ? 1 : 0,
                        filters.type !== 'all' ? 1 : 0,
                        filters.dateFrom ? 1 : 0,
                        filters.dateTo ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => downloadCsv(filteredActivities, documentName)}
                  disabled={filteredActivities.length === 0}
                  title="Télécharger la piste d'activité au format CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  Exporter CSV
                </Button>
              </div>

              <span className="text-xs text-muted-foreground">
                {filteredActivities.length} événement{filteredActivities.length > 1 ? 's' : ''}
                {filtersActive && activities.length !== filteredActivities.length && (
                  <span className="text-muted-foreground/70"> / {activities.length}</span>
                )}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  key="filters"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden border-b border-border bg-muted/30"
                >
                  <div className="px-6 py-4 grid grid-cols-2 gap-3">
                    {/* Utilisateur */}
                    <div className="col-span-1">
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        Utilisateur
                      </label>
                      <Select
                        value={filters.userName || 'all'}
                        onValueChange={(v) =>
                          setFilters((f) => ({ ...f, userName: v === 'all' ? '' : v }))
                        }
                      >
                        <SelectTrigger size="sm" className="h-8 text-xs">
                          <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les utilisateurs</SelectItem>
                          {distinctUsers.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type d'événement */}
                    <div className="col-span-1">
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Type d'événement
                      </label>
                      <Select
                        value={filters.type}
                        onValueChange={(v) =>
                          setFilters((f) => ({ ...f, type: v as Filters['type'] }))
                        }
                      >
                        <SelectTrigger size="sm" className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les types</SelectItem>
                          {eventTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Email */}
                    <div className="col-span-2">
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Adresse email
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input
                          className="pl-8 h-8 text-xs"
                          placeholder="exemple@domaine.com"
                          value={filters.email}
                          onChange={(e) =>
                            setFilters((f) => ({ ...f, email: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="col-span-1">
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Du
                      </label>
                      <DatePicker
                        date={filters.dateFrom}
                        onDateChange={(d) => setFilters((f) => ({ ...f, dateFrom: d }))}
                        placeholder="Date de début"
                        className="h-8 text-xs"
                        maxDate={filters.dateTo}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Au
                      </label>
                      <DatePicker
                        date={filters.dateTo}
                        onDateChange={(d) => setFilters((f) => ({ ...f, dateTo: d }))}
                        placeholder="Date de fin"
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
                          onClick={() => setFilters(emptyFilters)}
                        >
                          <X className="w-3.5 h-3.5" />
                          Réinitialiser les filtres
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  </div>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {filtersActive
                        ? 'Aucun événement ne correspond à vos filtres.'
                        : "Aucune activité enregistrée pour ce document."}
                    </p>
                    {filtersActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => setFilters(emptyFilters)}
                      >
                        Réinitialiser les filtres
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-5">
                  {grouped.map((dayEvents, groupIdx) => (
                    <div key={groupIdx}>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {formatDateGroupLabel(dayEvents[0].timestamp)}
                        </span>
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {formatFullDate(dayEvents[0].timestamp)}
                        </span>
                      </div>

                      <ol className="relative space-y-3">
                        {dayEvents.map((event, idx) => {
                          const meta = eventMeta[event.type];
                          const Icon = meta.Icon;
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
                                <Icon className="w-4 h-4 text-muted-foreground" />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-sm font-medium text-foreground">
                                    {meta.label}
                                  </span>
                                  <div className="flex flex-col items-end flex-shrink-0">
                                    <span className="text-xs font-medium text-foreground tabular-nums">
                                      {formatTime(event.timestamp)}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {formatFullDate(event.timestamp)}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-1.5 flex items-center gap-2 min-w-0">
                                  <Avatar className="size-6">
                                    <AvatarFallback className="text-[10px] font-semibold text-primary-foreground bg-primary">
                                      {getInitials(event.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm text-foreground truncate">
                                      {event.userName}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground truncate">
                                      {event.userEmail}
                                    </span>
                                  </div>
                                </div>

                                {event.userType === 'Contact' && event.primaryInvestor && (
                                  <div className="mt-1 ml-8 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="w-3 h-3" />
                                    <span>
                                      Rattaché à{' '}
                                      <span className="font-medium text-foreground">
                                        {event.primaryInvestor}
                                      </span>
                                    </span>
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
            {!isLoading && filteredActivities.length > 0 && (
              <div className="flex items-center justify-between gap-2 px-6 py-3 border-t border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{rangeStart}</span>
                  {'–'}
                  <span className="font-medium text-foreground">{rangeEnd}</span>
                  {' sur '}
                  <span className="font-medium text-foreground">{filteredActivities.length}</span>
                  {' événements'}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    aria-label="Page précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="text-xs text-muted-foreground px-2 tabular-nums">
                    Page <span className="font-medium text-foreground">{safePage}</span>
                    {' / '}
                    <span className="font-medium text-foreground">{totalPages}</span>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    aria-label="Page suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Relaunch Modal */}
          <DocumentRelaunchModal
            documentId={documentId}
            documentName={documentName}
            isNominatif={isNominatif}
            isOpen={isRelaunchModalOpen}
            onClose={() => setIsRelaunchModalOpen(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
