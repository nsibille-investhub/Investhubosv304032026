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
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
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

const generateMockActivities = (): ActivityEvent[] => {
  // Spread over a few days to demonstrate date grouping + pagination.
  const base = new Date();
  const d = (daysAgo: number, h: number, m: number) => {
    const date = new Date(base);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(h, m, 0, 0);
    return date.toISOString();
  };

  return [
    { id: '1',  type: 'document_downloaded', userName: 'Jean Dupont',    userType: 'Investor', timestamp: d(0, 14, 12) },
    { id: '2',  type: 'document_viewed',     userName: 'Jean Dupont',    userType: 'Investor', timestamp: d(0, 12, 35) },
    { id: '3',  type: 'document_viewed',     userName: 'Jean Dupont',    userType: 'Investor', timestamp: d(0, 12, 30) },
    { id: '4',  type: 'notification_opened', userName: 'Jean Dupont',    userType: 'Investor', timestamp: d(0, 12, 30) },
    { id: '5',  type: 'notification_clicked',userName: 'Pierre Dupont',  userType: 'Contact',  timestamp: d(0, 11, 45), primaryInvestor: 'Jean Dupont' },
    { id: '6',  type: 'notification_opened', userName: 'Marie Dupont',   userType: 'Contact',  timestamp: d(0, 11, 20), primaryInvestor: 'Jean Dupont' },
    { id: '7',  type: 'notification_sent',   userName: 'Pierre Dupont',  userType: 'Contact',  timestamp: d(0, 11, 0),  primaryInvestor: 'Jean Dupont' },
    { id: '8',  type: 'notification_sent',   userName: 'Marie Dupont',   userType: 'Contact',  timestamp: d(0, 11, 0),  primaryInvestor: 'Jean Dupont' },
    { id: '9',  type: 'notification_sent',   userName: 'Sophie Martin',  userType: 'Investor', timestamp: d(0, 11, 0) },
    { id: '10', type: 'notification_sent',   userName: 'Luc Martin',     userType: 'Contact',  timestamp: d(0, 11, 0),  primaryInvestor: 'Sophie Martin' },
    { id: '11', type: 'notification_sent',   userName: 'Thomas Bernard', userType: 'Investor', timestamp: d(0, 11, 0) },
    { id: '12', type: 'notification_failed', userName: 'Claire Moreau',  userType: 'Investor', timestamp: d(1, 18, 5) },
    { id: '13', type: 'document_viewed',     userName: 'Sophie Martin',  userType: 'Investor', timestamp: d(1, 16, 42) },
    { id: '14', type: 'notification_delivered', userName: 'Thomas Bernard', userType: 'Investor', timestamp: d(1, 11, 2) },
    { id: '15', type: 'notification_sent',   userName: 'Antoine Leroy',  userType: 'Advisor',  timestamp: d(2, 9, 30) },
  ];
};

// Engagement KPI (kept in sync conceptually with the mock above)
const mockEngagementData = {
  totalRecipients: 6,
  viewedRecipients: 4,
  engagementRate: 67,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const eventVisuals: Record<
  ActivityType,
  { label: string; Icon: typeof Send; iconClass: string; bgClass: string }
> = {
  notification_sent: {
    label: 'Notification envoyée',
    Icon: Send,
    iconClass: 'text-brand-primary',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
  },
  notification_delivered: {
    label: 'Notification délivrée',
    Icon: MailCheck,
    iconClass: 'text-brand-success',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  notification_failed: {
    label: 'Notification échouée',
    Icon: AlertCircle,
    iconClass: 'text-brand-danger',
    bgClass: 'bg-red-50 dark:bg-red-950/40',
  },
  notification_opened: {
    label: 'Notification ouverte',
    Icon: MailOpen,
    iconClass: 'text-brand-accent',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
  },
  notification_clicked: {
    label: 'Notification cliquée',
    Icon: MousePointerClick,
    iconClass: 'text-brand-accent',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
  },
  document_viewed: {
    label: 'Document consulté',
    Icon: Eye,
    iconClass: 'text-brand-success',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
  },
  document_downloaded: {
    label: 'Document téléchargé',
    Icon: Download,
    iconClass: 'text-brand-warning',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
  },
};

// Deterministic avatar gradient based on the user name.
const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-[#0066FF] to-[#00C2FF]',
    'from-[#7C3AED] to-[#0066FF]',
    'from-[#10B981] to-[#00C2FF]',
    'from-[#F59E0B] to-[#EF4444]',
    'from-[#EC4899] to-[#7C3AED]',
    'from-[#0066FF] to-[#7C3AED]',
  ];
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[sum % gradients.length];
};

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

// Group events (already sorted desc) by calendar day.
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

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setCurrentPage(1);
      const timer = setTimeout(() => {
        const data = generateMockActivities().sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        setActivities(data);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, documentId]);

  const totalPages = Math.max(1, Math.ceil(activities.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedActivities = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return activities.slice(start, start + PAGE_SIZE);
  }, [activities, safePage]);

  const grouped = useMemo(() => groupByDay(pagedActivities), [pagedActivities]);

  const rangeStart = activities.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, activities.length);

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
            className="fixed top-0 right-0 h-full w-[520px] max-w-full bg-background text-foreground shadow-2xl z-50 flex flex-col border-l border-border"
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

            {/* Document info + engagement KPI (cards following the design system) */}
            <div className="px-6 py-4 space-y-3 bg-muted/40 border-b border-border">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {documentName}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <Users className="w-3.5 h-3.5 text-brand-success" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Taux d'engagement
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {mockEngagementData.viewedRecipients} / {mockEngagementData.totalRecipients} destinataires
                    </span>
                  </div>
                </div>
                <div className="relative w-12 h-12">
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
                      className="stroke-brand-success"
                      strokeWidth="3"
                      fill="none"
                      strokeDasharray={`${mockEngagementData.engagementRate}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-foreground">
                      {mockEngagementData.engagementRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Chargement...</p>
                  </div>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex items-center justify-center h-full p-6">
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Aucune activité enregistrée pour ce document.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-5">
                  {grouped.map((dayEvents, groupIdx) => (
                    <div key={groupIdx}>
                      {/* Day separator */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {formatDateGroupLabel(dayEvents[0].timestamp)}
                        </span>
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {formatFullDate(dayEvents[0].timestamp)}
                        </span>
                      </div>

                      {/* Events */}
                      <ol className="relative space-y-3">
                        {dayEvents.map((event, idx) => {
                          const visuals = eventVisuals[event.type];
                          const Icon = visuals.Icon;
                          const isLastInGroup = idx === dayEvents.length - 1;

                          return (
                            <li key={event.id} className="relative flex gap-3">
                              {/* Vertical connector */}
                              {!isLastInGroup && (
                                <span
                                  aria-hidden
                                  className="absolute left-4 top-8 bottom-0 w-px bg-border -translate-x-1/2"
                                />
                              )}

                              {/* Icon bubble */}
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-border',
                                  visuals.bgClass,
                                )}
                              >
                                <Icon className={cn('w-4 h-4', visuals.iconClass)} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-start justify-between gap-3">
                                  <span className="text-sm font-medium text-foreground">
                                    {visuals.label}
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

                                <div className="mt-1.5 flex items-center gap-2">
                                  <Avatar className="size-6">
                                    <AvatarFallback
                                      className={cn(
                                        'text-[10px] font-semibold text-white bg-gradient-to-br',
                                        getAvatarGradient(event.userName),
                                      )}
                                    >
                                      {getInitials(event.userName)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-foreground truncate">
                                    {event.userName}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-[10px] px-1.5 py-0 h-5',
                                      event.userType === 'Investor' &&
                                        'border-blue-200 text-brand-primary bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900',
                                      event.userType === 'Contact' &&
                                        'border-purple-200 text-brand-accent bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900',
                                      event.userType === 'Advisor' &&
                                        'border-amber-200 text-brand-warning bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900',
                                    )}
                                  >
                                    {event.userType === 'Investor'
                                      ? 'Investisseur'
                                      : event.userType === 'Contact'
                                      ? 'Contact'
                                      : 'Conseiller'}
                                  </Badge>
                                </div>

                                {/* Primary investor reminder for contacts */}
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
            {!isLoading && activities.length > 0 && (
              <div className="flex items-center justify-between gap-2 px-6 py-3 border-t border-border bg-muted/30">
                <span className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{rangeStart}</span>
                  {'–'}
                  <span className="font-medium text-foreground">{rangeEnd}</span>
                  {' sur '}
                  <span className="font-medium text-foreground">{activities.length}</span>
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

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-background">
              <Button
                onClick={() => setIsRelaunchModalOpen(true)}
                className="w-full text-white border-0"
                style={{
                  background:
                    'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                }}
              >
                <Send className="w-4 h-4" />
                Relancer
              </Button>
            </div>
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
