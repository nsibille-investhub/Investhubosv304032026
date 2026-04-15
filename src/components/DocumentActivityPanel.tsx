import { useState, useEffect } from 'react';
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

interface ActivityEvent {
  id: string;
  type: 'notification_sent' | 'notification_delivered' | 'notification_failed' | 'notification_opened' | 'notification_clicked' | 'document_viewed' | 'document_downloaded';
  userName: string;
  userType: 'Investor' | 'Contact' | 'Advisor';
  timestamp: string;
  metadata?: {
    contactName?: string;
  };
}

interface DocumentActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
  isNominatif?: boolean;
}

// Mock data generator
const generateMockActivities = (): ActivityEvent[] => {
  const events: ActivityEvent[] = [
    {
      id: '1',
      type: 'document_viewed',
      userName: 'Jean Dupont',
      userType: 'Investor',
      timestamp: '12:35',
    },
    {
      id: '2',
      type: 'document_viewed',
      userName: 'Jean Dupont',
      userType: 'Investor',
      timestamp: '12:30',
    },
    {
      id: '3',
      type: 'notification_opened',
      userName: 'Jean Dupont',
      userType: 'Investor',
      timestamp: '12:30',
    },
    {
      id: '4',
      type: 'notification_sent',
      userName: 'Pierre Dupont',
      userType: 'Contact',
      timestamp: '11:00',
      metadata: {
        contactName: 'Contact'
      }
    },
    {
      id: '5',
      type: 'notification_sent',
      userName: 'Marie Dupont',
      userType: 'Contact',
      timestamp: '11:00',
      metadata: {
        contactName: 'Contact'
      }
    },
    {
      id: '6',
      type: 'notification_sent',
      userName: 'Sophie Martin',
      userType: 'Investor',
      timestamp: '11:00',
    },
    {
      id: '7',
      type: 'notification_sent',
      userName: 'Luc Martin',
      userType: 'Contact',
      timestamp: '11:00',
      metadata: {
        contactName: 'Contact'
      }
    },
    {
      id: '8',
      type: 'notification_sent',
      userName: 'Thomas Bernard',
      userType: 'Investor',
      timestamp: '11:00',
    },
  ];
  
  return events;
};

// Mock engagement data
const mockEngagementData = {
  totalRecipients: 6, // 3 investisseurs + 3 contacts
  viewedRecipients: 4, // Nombre d'investisseurs/contacts ayant consulté
  engagementRate: 67, // Pourcentage
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

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setActivities(generateMockActivities());
        setIsLoading(false);
      }, 300);
    }
  }, [isOpen, documentId]);

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
            className="fixed top-0 right-0 h-full w-[480px] bg-white dark:bg-gray-950 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center flex-shrink-0">
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
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Taux d'engagement
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {mockEngagementData.viewedRecipients} / {mockEngagementData.totalRecipients} investisseurs
                  </span>
                  <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {mockEngagementData.engagementRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Chargement...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {activities.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getEventIcon(event.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {getEventLabel(event.type)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
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
                          {event.metadata?.contactName && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({event.metadata.contactName})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                        {event.timestamp}
                      </div>
                    </div>
                  ))}

                  {/* Event count */}
                  <div className="pt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activities.length} événements
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                onClick={() => setIsRelaunchModalOpen(true)}
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white'
                }}
              >
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