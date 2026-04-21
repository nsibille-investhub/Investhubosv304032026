import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Zap,
  Eye,
  Send,
  FileText,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import {
  Timeline,
  type TimelineEvent,
  type TimelineCsvColumn,
} from './ui/timeline';
import { DocumentRelaunchModal } from './DocumentRelaunchModal';
import {
  birdviewActivityTypes,
  type BirdviewActivityEventCode,
} from '../utils/birdviewActivityCatalog';

type ActivityType = BirdviewActivityEventCode;

type UserType = 'Investor' | 'Contact' | 'Advisor';

interface ActivitySource {
  id: string;
  type: ActivityType;
  userName: string;
  userEmail: string;
  userType: UserType;
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
const generateGenericMockActivities = (): ActivitySource[] => [
  // Aujourd'hui — validation du document après consultation
  { id: 'g1',  type: 'document_validated', userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 14, 30) },
  { id: 'g2',  type: 'document_downloaded', userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 14, 12) },
  { id: 'g3',  type: 'document_viewed',     userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 12, 35) },
  { id: 'g4',  type: 'notification_opened', userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 12, 30) },
  { id: 'g5',  type: 'notification_clicked',userName: 'Marie Dupont',    userEmail: 'marie.dupont@lvmh.fr',      userType: 'Contact',  timestamp: iso(0, 11, 45), primaryInvestor: 'Jean Dupont' },
  { id: 'g6',  type: 'notification_opened', userName: 'Pierre Dupont',   userEmail: 'pierre.dupont@cabinet-kl.fr', userType: 'Contact', timestamp: iso(0, 11, 20), primaryInvestor: 'Jean Dupont' },
  // Aujourd'hui — broadcast initial (initiation puis envoi)
  { id: 'g7',  type: 'notification_sent',   userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'g8',  type: 'notification_sent',   userName: 'Marie Dupont',    userEmail: 'marie.dupont@lvmh.fr',      userType: 'Contact',  timestamp: iso(0, 11, 0), primaryInvestor: 'Jean Dupont' },
  { id: 'g9',  type: 'notification_sent',   userName: 'Pierre Dupont',   userEmail: 'pierre.dupont@cabinet-kl.fr', userType: 'Contact', timestamp: iso(0, 11, 0), primaryInvestor: 'Jean Dupont' },
  { id: 'g10', type: 'notification_sent',   userName: 'Sophie Martin',   userEmail: 'sophie.martin@kering.com',  userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'g11', type: 'notification_sent',   userName: 'Luc Martin',      userEmail: 'luc.martin@kering.com',     userType: 'Contact',  timestamp: iso(0, 11, 0), primaryInvestor: 'Sophie Martin' },
  { id: 'g12', type: 'notification_sent',   userName: 'Thomas Bernard',  userEmail: 'thomas.bernard@axa-im.fr',  userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'g13', type: 'notification_sent',   userName: 'Claire Moreau',   userEmail: 'claire.moreau@bnp-wm.fr',   userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'g14', type: 'notification_send_initiated', userName: 'Jean Dupont',     userEmail: 'jean.dupont@lvmh.fr',       userType: 'Investor', timestamp: iso(0, 10, 58) },
  { id: 'g15', type: 'notification_send_initiated', userName: 'Marie Dupont',    userEmail: 'marie.dupont@lvmh.fr',      userType: 'Contact',  timestamp: iso(0, 10, 58), primaryInvestor: 'Jean Dupont' },
  { id: 'g16', type: 'notification_send_initiated', userName: 'Sophie Martin',   userEmail: 'sophie.martin@kering.com',  userType: 'Investor', timestamp: iso(0, 10, 58) },
  { id: 'g17', type: 'notification_send_initiated', userName: 'Thomas Bernard',  userEmail: 'thomas.bernard@axa-im.fr',  userType: 'Investor', timestamp: iso(0, 10, 58) },
  // Hier — Sophie Martin consulte, Luc Martin signale comme spam
  { id: 'g18', type: 'document_viewed',     userName: 'Sophie Martin',   userEmail: 'sophie.martin@kering.com',  userType: 'Investor', timestamp: iso(1, 16, 42) },
  { id: 'g19', type: 'notification_complained', userName: 'Luc Martin',  userEmail: 'luc.martin@kering.com',     userType: 'Contact',  timestamp: iso(1, 14, 20), primaryInvestor: 'Sophie Martin' },
  { id: 'g20', type: 'notification_delivered', userName: 'Thomas Bernard', userEmail: 'thomas.bernard@axa-im.fr', userType: 'Investor', timestamp: iso(1, 11, 2) },
  { id: 'g21', type: 'notification_failed', userName: 'Claire Moreau',   userEmail: 'claire.moreau@bnp-wm.fr',   userType: 'Investor', timestamp: iso(1, 10, 58) },
  // Avant-hier — advisor
  { id: 'g22', type: 'notification_opened', userName: 'Antoine Leroy',   userEmail: 'a.leroy@conseil-patrimoine.fr', userType: 'Advisor', timestamp: iso(2, 9, 30) },
];

/**
 * Nominative document: tied to ONE investor and his contacts only.
 * Engagement = viewed by at least one of the linked contacts.
 */
const generateNominatifMockActivities = (): ActivitySource[] => [
  { id: 'n1', type: 'document_validated', userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 15, 25) },
  { id: 'n2', type: 'document_downloaded', userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 15, 10) },
  { id: 'n3', type: 'document_viewed',     userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 12, 35) },
  { id: 'n4', type: 'notification_clicked',userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 12, 30) },
  { id: 'n5', type: 'notification_opened', userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 12, 30) },
  { id: 'n6', type: 'notification_opened', userName: 'Marie Dupont',  userEmail: 'marie.dupont@lvmh.fr',         userType: 'Contact',  timestamp: iso(0, 11, 42), primaryInvestor: 'Jean Dupont' },
  { id: 'n7', type: 'notification_complained', userName: 'Pierre Dupont', userEmail: 'pierre.dupont@cabinet-kl.fr', userType: 'Contact', timestamp: iso(0, 11, 35), primaryInvestor: 'Jean Dupont' },
  { id: 'n8', type: 'notification_delivered', userName: 'Jean Dupont', userEmail: 'jean.dupont@lvmh.fr',         userType: 'Investor', timestamp: iso(0, 11, 2) },
  { id: 'n9', type: 'notification_delivered', userName: 'Marie Dupont', userEmail: 'marie.dupont@lvmh.fr',       userType: 'Contact',  timestamp: iso(0, 11, 2),  primaryInvestor: 'Jean Dupont' },
  { id: 'n10',type: 'notification_delivered', userName: 'Pierre Dupont', userEmail: 'pierre.dupont@cabinet-kl.fr', userType: 'Contact', timestamp: iso(0, 11, 2),  primaryInvestor: 'Jean Dupont' },
  { id: 'n11',type: 'notification_sent',   userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 11, 0) },
  { id: 'n12',type: 'notification_sent',   userName: 'Marie Dupont',  userEmail: 'marie.dupont@lvmh.fr',         userType: 'Contact',  timestamp: iso(0, 11, 0),  primaryInvestor: 'Jean Dupont' },
  { id: 'n13',type: 'notification_sent',   userName: 'Pierre Dupont', userEmail: 'pierre.dupont@cabinet-kl.fr',  userType: 'Contact',  timestamp: iso(0, 11, 0),  primaryInvestor: 'Jean Dupont' },
  { id: 'n14',type: 'notification_send_initiated', userName: 'Jean Dupont',   userEmail: 'jean.dupont@lvmh.fr',          userType: 'Investor', timestamp: iso(0, 10, 58) },
  { id: 'n15',type: 'notification_send_initiated', userName: 'Marie Dupont',  userEmail: 'marie.dupont@lvmh.fr',         userType: 'Contact',  timestamp: iso(0, 10, 58), primaryInvestor: 'Jean Dupont' },
  { id: 'n16',type: 'notification_send_initiated', userName: 'Pierre Dupont', userEmail: 'pierre.dupont@cabinet-kl.fr',  userType: 'Contact',  timestamp: iso(0, 10, 58), primaryInvestor: 'Jean Dupont' },
  { id: 'n17',type: 'notification_failed', userName: 'Antoine Leroy', userEmail: 'a.leroy@conseil-patrimoine.fr', userType: 'Advisor', timestamp: iso(1, 18, 5),  primaryInvestor: 'Jean Dupont' },
];

// ---------------------------------------------------------------------------
// Timeline type descriptors (shared icon + label map)
// ---------------------------------------------------------------------------

const activityTypes = birdviewActivityTypes;

const userTypeLabel: Record<UserType, string> = {
  Investor: 'Investisseur',
  Contact: 'Contact',
  Advisor: 'Conseiller',
};

// Map the domain-specific source to the neutral TimelineEvent shape.
const toTimelineEvent = (
  source: ActivitySource,
): TimelineEvent<ActivityType> => ({
  id: source.id,
  type: source.type,
  timestamp: source.timestamp,
  actorName: source.userName,
  actorSublabel: source.userEmail,
  actorRole: userTypeLabel[source.userType],
  description:
    source.userType === 'Contact' && source.primaryInvestor ? (
      <span className="inline-flex items-center gap-1">
        <Users className="w-3 h-3" />
        Rattaché à{' '}
        <span className="font-medium text-foreground">
          {source.primaryInvestor}
        </span>
      </span>
    ) : undefined,
  meta: {
    userType: source.userType,
    primaryInvestor: source.primaryInvestor,
  },
});

// ---------------------------------------------------------------------------
// Engagement computation (domain-specific, kept local)
// ---------------------------------------------------------------------------

interface EngagementResult {
  label: string;
  sublabel: string;
  /** 0–100 for the progress ring. */
  percent: number;
  /** success / warning / neutral for color accent. */
  tone: 'success' | 'warning' | 'neutral';
}

const computeEngagement = (
  events: ActivitySource[],
  isNominatif: boolean,
): EngagementResult => {
  const viewedEvents = events.filter(
    (e) =>
      e.type === 'document_viewed' ||
      e.type === 'document_downloaded' ||
      e.type === 'document_validated',
  );

  if (isNominatif) {
    const viewers = new Set(viewedEvents.map((e) => e.userEmail));
    const recipients = new Set(events.map((e) => e.userEmail));
    const count = viewers.size;
    const total = recipients.size;
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

  const investorEvents = events.filter((e) => e.userType === 'Investor');
  const allInvestors = new Set(investorEvents.map((e) => e.userEmail));
  const viewedInvestors = new Set(
    viewedEvents.filter((e) => e.userType === 'Investor').map((e) => e.userEmail),
  );
  const total = allInvestors.size;
  const count = viewedInvestors.size;
  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
  const tone: EngagementResult['tone'] =
    percent >= 75 ? 'success' : percent >= 35 ? 'warning' : 'neutral';
  return {
    label: `${count} / ${total} investisseur${total > 1 ? 's' : ''}`,
    sublabel: 'ont consulté le document',
    percent,
    tone,
  };
};

// Domain-specific CSV columns (keeps the "Investisseur principal" field).
const buildExportColumns = (): TimelineCsvColumn<ActivityType>[] => [
  {
    header: 'Date',
    value: (ev) => new Date(ev.timestamp).toLocaleDateString('fr-FR'),
  },
  {
    header: 'Heure',
    value: (ev) =>
      new Date(ev.timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
  },
  {
    header: "Type d'événement",
    value: (ev) => activityTypes[ev.type]?.label ?? String(ev.type),
  },
  { header: 'Utilisateur', value: (ev) => ev.actorName ?? '' },
  { header: 'Email', value: (ev) => ev.actorSublabel ?? '' },
  { header: 'Type utilisateur', value: (ev) => ev.actorRole ?? '' },
  {
    header: 'Investisseur principal',
    value: (ev) => (ev.meta?.primaryInvestor as string | undefined) ?? '',
  },
];

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
  const [activities, setActivities] = useState<ActivitySource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRelaunchModalOpen, setIsRelaunchModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        const source = isNominatif
          ? generateNominatifMockActivities()
          : generateGenericMockActivities();
        setActivities(source);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, documentId, isNominatif]);

  const timelineEvents = useMemo(
    () => activities.map(toTimelineEvent),
    [activities],
  );

  const engagement = useMemo(
    () => computeEngagement(activities, isNominatif),
    [activities, isNominatif],
  );

  const exportColumns = useMemo(buildExportColumns, []);

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
            className="fixed top-0 right-0 h-full w-[560px] max-w-full bg-white text-foreground shadow-2xl z-50 flex flex-col border-l border-border"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-5 border-b border-border bg-white" style={{ backgroundColor: '#FFFFFF' }}>
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
            <div className="px-6 py-4 space-y-3 bg-white border-b border-border" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-2 rounded-md border border-border bg-white px-3 py-2">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">
                  {documentName}
                </span>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {isNominatif ? 'Nominatif' : 'Générique'}
                </span>
              </div>

              {isNominatif ? (
                /* Nominatif: compact single-row layout */
                <div className="flex items-center gap-3 rounded-md border border-border bg-white px-3 py-2.5">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" className="stroke-border" strokeWidth="3" fill="none" />
                      <circle
                        cx="18" cy="18" r="15.9155"
                        className={cn(engagement.tone === 'success' ? 'stroke-brand-success' : 'stroke-muted-foreground/50')}
                        strokeWidth="3" fill="none"
                        strokeDasharray={`${engagement.percent}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {engagement.tone === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-brand-success" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{engagement.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{engagement.sublabel}</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsRelaunchModalOpen(true)}
                    className="text-white border-0 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)' }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Relancer
                  </Button>
                </div>
              ) : (
                /* Générique: enhanced layout with prominent percentage */
                <div className="rounded-lg border border-border bg-white overflow-hidden">
                  <div className="flex items-center gap-4 px-4 py-3">
                    {/* Large progress ring */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9155" className="stroke-border" strokeWidth="2.5" fill="none" />
                        <circle
                          cx="18" cy="18" r="15.9155"
                          className={cn(
                            engagement.tone === 'success'
                              ? 'stroke-brand-success'
                              : engagement.tone === 'warning'
                                ? 'stroke-amber-500'
                                : 'stroke-muted-foreground/50',
                          )}
                          strokeWidth="2.5" fill="none"
                          strokeDasharray={`${engagement.percent}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={cn(
                            'text-base font-bold',
                            engagement.tone === 'success'
                              ? 'text-brand-success'
                              : engagement.tone === 'warning'
                                ? 'text-amber-600'
                                : 'text-muted-foreground',
                          )}
                        >
                          {engagement.percent}%
                        </span>
                      </div>
                    </div>

                    {/* Text + sub-bar */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="text-sm font-semibold text-foreground">
                        {engagement.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {engagement.sublabel}
                      </div>
                      {/* Mini progress bar */}
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            engagement.tone === 'success'
                              ? 'bg-brand-success'
                              : engagement.tone === 'warning'
                                ? 'bg-amber-500'
                                : 'bg-muted-foreground/50',
                          )}
                          style={{ width: `${engagement.percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Relancer */}
                    <Button
                      size="sm"
                      onClick={() => setIsRelaunchModalOpen(true)}
                      className="text-white border-0 flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Relancer
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline (shared, neutral DS component) */}
            <div className="flex-1 overflow-y-auto scrollbar-thin bg-white px-6 py-2" style={{ backgroundColor: '#FFFFFF' }}>
              <Timeline<ActivityType>
                events={timelineEvents}
                types={activityTypes}
                isLoading={isLoading}
                pageSize={6}
                exportFileName={`piste-activite-${documentName}`}
                exportColumns={exportColumns}
                emptyLabel="Aucune activité enregistrée pour ce document."
              />
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
