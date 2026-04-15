import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Zap, 
  Eye, 
  Mail, 
  CheckCircle, 
  Send, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { DocumentRelaunchModal } from './DocumentRelaunchModal';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DatePicker } from './ui/date-picker';
import { DataPagination } from './ui/data-pagination';

interface ActivityEvent {
  id: string;
  type: 'notification_sent' | 'notification_delivered' | 'notification_failed' | 'notification_opened' | 'notification_clicked' | 'document_viewed' | 'document_downloaded';
  userName: string;
  userEmail: string;
  userType: 'Investor' | 'Contact' | 'Advisor';
  timestamp: string; // ISO
  metadata?: {
    mainInvestor?: string;
    documentMode: 'generic' | 'nominative';
  };
}

interface DocumentActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
  isNominatif?: boolean;
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatTime = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const generateMockActivities = (isNominatif: boolean, documentName: string): ActivityEvent[] => {
  const docMode: ActivityEvent['metadata']['documentMode'] = isNominatif ? 'nominative' : 'generic';
  const baseDate = '2026-04-15';

  if (isNominatif) {
    return [
      { id: '1', type: 'notification_sent', userName: 'Jean Dupont', userEmail: 'jean.dupont@alpheon-capital.com', userType: 'Investor', timestamp: `${baseDate}T09:00:00Z`, metadata: { documentMode: docMode } },
      { id: '2', type: 'notification_opened', userName: 'Jean Dupont', userEmail: 'jean.dupont@alpheon-capital.com', userType: 'Investor', timestamp: `${baseDate}T09:04:00Z`, metadata: { documentMode: docMode } },
      { id: '3', type: 'document_viewed', userName: 'Jean Dupont', userEmail: 'jean.dupont@alpheon-capital.com', userType: 'Investor', timestamp: `${baseDate}T09:06:00Z`, metadata: { documentMode: docMode } },
      { id: '4', type: 'notification_sent', userName: 'Luc Martin', userEmail: 'luc.martin@novacrest.com', userType: 'Contact', timestamp: `${baseDate}T09:11:00Z`, metadata: { mainInvestor: 'Sophie Martin', documentMode: docMode } },
      { id: '5', type: 'notification_delivered', userName: 'Luc Martin', userEmail: 'luc.martin@novacrest.com', userType: 'Contact', timestamp: `${baseDate}T09:12:00Z`, metadata: { mainInvestor: 'Sophie Martin', documentMode: docMode } },
      { id: '6', type: 'notification_sent', userName: 'Pierre Bernard', userEmail: 'pierre.bernard@helios-am.fr', userType: 'Contact', timestamp: `${baseDate}T09:20:00Z`, metadata: { mainInvestor: 'Thomas Bernard', documentMode: docMode } },
      { id: '7', type: 'notification_opened', userName: 'Pierre Bernard', userEmail: 'pierre.bernard@helios-am.fr', userType: 'Contact', timestamp: `${baseDate}T09:24:00Z`, metadata: { mainInvestor: 'Thomas Bernard', documentMode: docMode } },
      { id: '8', type: 'document_viewed', userName: 'Pierre Bernard', userEmail: 'pierre.bernard@helios-am.fr', userType: 'Contact', timestamp: `${baseDate}T09:28:00Z`, metadata: { mainInvestor: 'Thomas Bernard', documentMode: docMode } },
      { id: '9', type: 'notification_sent', userName: 'Sophie Martin', userEmail: 'sophie.martin@novacrest.com', userType: 'Investor', timestamp: `${baseDate}T09:32:00Z`, metadata: { documentMode: docMode } },
      { id: '10', type: 'notification_failed', userName: 'Marie Durand', userEmail: 'marie.durand@bluepeak.vc', userType: 'Investor', timestamp: `${baseDate}T09:39:00Z`, metadata: { documentMode: docMode } },
      { id: '11', type: 'notification_clicked', userName: 'Jean Dupont', userEmail: 'jean.dupont@alpheon-capital.com', userType: 'Investor', timestamp: `${baseDate}T09:42:00Z`, metadata: { documentMode: docMode } },
      { id: '12', type: 'document_downloaded', userName: 'Pierre Bernard', userEmail: 'pierre.bernard@helios-am.fr', userType: 'Contact', timestamp: `${baseDate}T09:55:00Z`, metadata: { mainInvestor: 'Thomas Bernard', documentMode: docMode } },
    ];
  }

  return [
    { id: '1', type: 'notification_sent', userName: 'Sophie Martin', userEmail: 'sophie.martin@novacrest.com', userType: 'Investor', timestamp: `${baseDate}T10:00:00Z`, metadata: { documentMode: docMode } },
    { id: '2', type: 'notification_opened', userName: 'Sophie Martin', userEmail: 'sophie.martin@novacrest.com', userType: 'Investor', timestamp: `${baseDate}T10:05:00Z`, metadata: { documentMode: docMode } },
    { id: '3', type: 'document_viewed', userName: 'Sophie Martin', userEmail: 'sophie.martin@novacrest.com', userType: 'Investor', timestamp: `${baseDate}T10:08:00Z`, metadata: { documentMode: docMode } },
    { id: '4', type: 'notification_sent', userName: 'Thomas Bernard', userEmail: 'thomas.bernard@helios-am.fr', userType: 'Investor', timestamp: `${baseDate}T10:12:00Z`, metadata: { documentMode: docMode } },
    { id: '5', type: 'notification_opened', userName: 'Thomas Bernard', userEmail: 'thomas.bernard@helios-am.fr', userType: 'Investor', timestamp: `${baseDate}T10:15:00Z`, metadata: { documentMode: docMode } },
    { id: '6', type: 'document_viewed', userName: 'Thomas Bernard', userEmail: 'thomas.bernard@helios-am.fr', userType: 'Investor', timestamp: `${baseDate}T10:17:00Z`, metadata: { documentMode: docMode } },
    { id: '7', type: 'notification_sent', userName: 'Jean Dupont', userEmail: 'jean.dupont@alpheon-capital.com', userType: 'Investor', timestamp: `${baseDate}T10:20:00Z`, metadata: { documentMode: docMode } },
    { id: '8', type: 'notification_failed', userName: 'Camille Leroy', userEmail: 'camille.leroy@altaris.fr', userType: 'Investor', timestamp: `${baseDate}T10:23:00Z`, metadata: { documentMode: docMode } },
    { id: '9', type: 'notification_delivered', userName: 'Aline Moreau', userEmail: 'aline.moreau@equinoxe-cp.fr', userType: 'Advisor', timestamp: `${baseDate}T10:24:00Z`, metadata: { documentMode: docMode } },
    { id: '10', type: 'notification_opened', userName: 'Aline Moreau', userEmail: 'aline.moreau@equinoxe-cp.fr', userType: 'Advisor', timestamp: `${baseDate}T10:29:00Z`, metadata: { documentMode: docMode } },
    { id: '11', type: 'document_downloaded', userName: 'Sophie Martin', userEmail: 'sophie.martin@novacrest.com', userType: 'Investor', timestamp: `${baseDate}T10:31:00Z`, metadata: { documentMode: docMode } },
    { id: '12', type: 'notification_clicked', userName: 'Thomas Bernard', userEmail: 'thomas.bernard@helios-am.fr', userType: 'Investor', timestamp: `${baseDate}T10:35:00Z`, metadata: { documentMode: docMode } },
    { id: '13', type: 'document_viewed', userName: 'Jean Dupont', userEmail: 'jean.dupont@alpheon-capital.com', userType: 'Investor', timestamp: `${baseDate}T10:37:00Z`, metadata: { documentMode: docMode } },
    { id: '14', type: 'notification_sent', userName: 'Nora Petit', userEmail: 'nora.petit@meridian-partners.fr', userType: 'Investor', timestamp: `${baseDate}T10:40:00Z`, metadata: { documentMode: docMode } },
    { id: '15', type: 'notification_opened', userName: 'Nora Petit', userEmail: 'nora.petit@meridian-partners.fr', userType: 'Investor', timestamp: `${baseDate}T10:43:00Z`, metadata: { documentMode: docMode } },
    { id: '16', type: 'document_viewed', userName: 'Nora Petit', userEmail: 'nora.petit@meridian-partners.fr', userType: 'Investor', timestamp: `${baseDate}T10:44:00Z`, metadata: { documentMode: docMode } },
  ].map((event) => ({
    ...event,
    metadata: {
      ...event.metadata,
      documentMode: documentName.toLowerCase().includes('cap') ? 'generic' : docMode,
    },
  }));
};

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
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setActivities(generateMockActivities(isNominatif, documentName));
        setCurrentPage(1);
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen, documentId, isNominatif, documentName]);

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'notification_sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'notification_delivered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'notification_failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'notification_opened':
        return <Mail className="w-4 h-4 text-purple-500" />;
      case 'notification_clicked':
        return <Mail className="w-4 h-4 text-purple-600" />;
      case 'document_viewed':
        return <Eye className="w-4 h-4 text-green-500" />;
      case 'document_downloaded':
        return <Download className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventLabel = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'notification_sent':
        return 'Notification envoyée';
      case 'notification_delivered':
        return 'Notification délivrée';
      case 'notification_failed':
        return 'Notification échouée';
      case 'notification_opened':
        return 'Notification ouverte';
      case 'notification_clicked':
        return 'Notification cliquée';
      case 'document_viewed':
        return 'Accueil de réception';
      case 'document_downloaded':
        return 'Document téléchargé';
      default:
        return 'Action inconnue';
    }
  };

  const getAvatarColor = (userName: string) => {
    const colors = [
      'from-orange-400 to-orange-500',
      'from-blue-400 to-blue-500',
      'from-green-400 to-green-500',
      'from-purple-400 to-purple-500',
      'from-pink-400 to-pink-500',
    ];
    const index = userName.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredActivities = useMemo(() => {
    return activities
      .filter((event) => selectedUser === 'all' || event.userName === selectedUser)
      .filter((event) => selectedEventType === 'all' || event.type === selectedEventType)
      .filter((event) => event.userEmail.toLowerCase().includes(emailFilter.toLowerCase().trim()))
      .filter((event) => {
        const eventDate = new Date(event.timestamp);
        if (startDate) {
          const startOfDay = new Date(startDate);
          startOfDay.setHours(0, 0, 0, 0);
          if (eventDate < startOfDay) {
            return false;
          }
        }
        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          if (eventDate > endOfDay) {
            return false;
          }
        }
        return true;
      });
  }, [activities, selectedUser, selectedEventType, emailFilter, startDate, endDate]);

  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredActivities.slice(startIndex, startIndex + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const engagementData = useMemo(() => {
    const viewers = new Set(
      activities
        .filter((event) => event.type === 'document_viewed')
        .map((event) => event.userEmail)
    );

    if (isNominatif) {
      const hasAtLeastOneView = viewers.size > 0;
      return {
        title: "Taux d'engagement (nominatif)",
        detail: hasAtLeastOneView ? 'Consulté par au moins un contact' : 'Aucune consultation',
        percentage: hasAtLeastOneView ? 100 : 0,
      };
    }

    const investorRecipients = new Set(
      activities
        .filter((event) => event.userType === 'Investor')
        .map((event) => event.userEmail)
    );

    const investorViewers = new Set(
      activities
        .filter((event) => event.type === 'document_viewed' && event.userType === 'Investor')
        .map((event) => event.userEmail)
    );

    const percentage = investorRecipients.size === 0 ? 0 : Math.round((investorViewers.size / investorRecipients.size) * 100);
    return {
      title: "Taux d'engagement (générique)",
      detail: `${investorViewers.size} / ${investorRecipients.size} investisseurs`,
      percentage,
    };
  }, [activities, isNominatif]);

  const users = Array.from(new Set(activities.map((event) => event.userName)));

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
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[560px] bg-white dark:bg-gray-950 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Piste d'activité
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Historique des interactions
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Document Info */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {documentName}
                </span>
              </div>
            </div>

            {/* Engagement KPI */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{engagementData.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{engagementData.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {engagementData.percentage}%
                    </span>
                  </div>
                  <Button
                    onClick={() => setIsRelaunchModalOpen(true)}
                    className="h-9"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      color: 'white'
                    }}
                  >
                    Relancer
                  </Button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <Select value={selectedUser} onValueChange={(value) => { setSelectedUser(value); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les utilisateurs</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedEventType} onValueChange={(value) => { setSelectedEventType(value); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Type d'événement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les événements</SelectItem>
                    <SelectItem value="notification_sent">Notification envoyée</SelectItem>
                    <SelectItem value="notification_opened">Notification ouverte</SelectItem>
                    <SelectItem value="notification_delivered">Notification délivrée</SelectItem>
                    <SelectItem value="notification_failed">Notification échouée</SelectItem>
                    <SelectItem value="notification_clicked">Notification cliquée</SelectItem>
                    <SelectItem value="document_viewed">Document consulté</SelectItem>
                    <SelectItem value="document_downloaded">Document téléchargé</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filtrer par email"
                  value={emailFilter}
                  onChange={(event) => { setEmailFilter(event.target.value); setCurrentPage(1); }}
                  className="h-9"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center px-2">
                  Date range
                </div>
                <DatePicker
                  date={startDate}
                  onDateChange={(date) => {
                    setStartDate(date);
                    setCurrentPage(1);
                  }}
                  placeholder="Date début"
                  className="h-9"
                />
                <DatePicker
                  date={endDate}
                  onDateChange={(date) => {
                    setEndDate(date);
                    setCurrentPage(1);
                  }}
                  placeholder="Date fin"
                  className="h-9"
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/50 dark:bg-gray-950">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Chargement...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {paginatedActivities.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 py-3 px-3 rounded-lg border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getEventIcon(event.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getEventLabel(event.type)}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">
                            {event.metadata?.documentMode === 'generic' ? 'Générique' : 'Nominatif'}
                          </Badge>
                          <span className="text-xs text-gray-500">{formatDate(event.timestamp)} · {formatTime(event.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Avatar */}
                          <div className={cn(
                            'w-5 h-5 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                            getAvatarColor(event.userName)
                          )}>
                            <span className="text-[9px] font-bold text-white">
                              {getInitials(event.userName)}
                            </span>
                          </div>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {event.userName}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {event.userEmail}
                          </span>
                          {event.userType === 'Contact' && event.metadata?.mainInvestor && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              (Contact de {event.metadata.mainInvestor})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(event.timestamp)}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500">
                          {formatDate(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Event count */}
                  <div className="pt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {filteredActivities.length} événements filtrés sur {activities.length}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800">
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredActivities.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                showPageSizeSelector={true}
                pageSizeOptions={[4, 6, 10, 20]}
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
