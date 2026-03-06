import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Edit, 
  UserPlus,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

interface AuditEvent {
  id: string;
  type: 'decision_change' | 'comment_added' | 'comment_edited' | 'status_change' | 'assignment_change' | 'alert_created' | 'field_updated';
  timestamp: string;
  user: {
    name: string;
    avatar: string;
    email: string;
  };
  action: string;
  details?: {
    before?: any;
    after?: any;
    field?: string;
  };
  comment?: string;
  alertName?: string;
}

interface AuditTrailProps {
  entityName: string;
  events: AuditEvent[];
  compact?: boolean;
}

export function AuditTrail({ entityName, events, compact = false }: AuditTrailProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  const toggleEvent = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'decision_change':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'comment_added':
      case 'comment_edited':
        return <MessageSquare className="w-4 h-4" />;
      case 'status_change':
        return <RefreshCw className="w-4 h-4" />;
      case 'assignment_change':
        return <UserPlus className="w-4 h-4" />;
      case 'alert_created':
        return <AlertCircle className="w-4 h-4" />;
      case 'field_updated':
        return <Edit className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'decision_change':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'comment_added':
      case 'comment_edited':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'status_change':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'assignment_change':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'alert_created':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'field_updated':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDecisionBadge = (decision: string) => {
    const badges = {
      'true_hit': <Badge className="bg-red-50 text-red-700 border-red-300 border text-xs">True Hit</Badge>,
      'false_hit': <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 border text-xs">Clear</Badge>,
      'unsure': <Badge className="bg-amber-50 text-amber-700 border-amber-300 border text-xs">Unsure</Badge>,
    };
    return badges[decision as keyof typeof badges] || decision;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-2">
          {events.slice(0, 5).map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-2 text-xs"
            >
              <div className={`p-1 rounded border ${getEventColor(event.type)} flex-shrink-0 mt-0.5`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 truncate">{event.action}</p>
                <p className="text-gray-500 text-xs">{formatTimestamp(event.timestamp)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full w-full">
      <div className="p-6">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0066FF] via-gray-200 to-transparent" />

          <div className="space-y-4">
            {events.map((event, idx) => {
              const isExpanded = expandedEvents.has(event.id);
              const hasDetails = event.details || event.comment;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-14"
                >
                  {/* Icon */}
                  <div className={`absolute left-0 w-12 h-12 rounded-xl border-2 ${getEventColor(event.type)} flex items-center justify-center shadow-sm bg-white`}>
                    {getEventIcon(event.type)}
                  </div>

                  {/* Content */}
                  <motion.div
                    whileHover={{ x: 2 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => hasDetails && toggleEvent(event.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{event.action}</p>
                          {event.alertName && (
                            <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                              {event.alertName}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <div className="w-5 h-5 bg-gradient-to-br from-[#0066FF] to-[#00C2FF] rounded-md flex items-center justify-center text-white text-[10px] font-medium">
                              {event.user.avatar}
                            </div>
                            <span>{event.user.name}</span>
                          </div>
                          <span>•</span>
                          <span>{formatTimestamp(event.timestamp)}</span>
                        </div>

                        {/* Quick preview of changes */}
                        {event.details && !isExpanded && (
                          <div className="mt-2 flex items-center gap-2">
                            {event.details.before && (
                              <>
                                {typeof event.details.before === 'string' && event.details.before.includes('_') ? 
                                  getDecisionBadge(event.details.before) : 
                                  <span className="text-xs text-gray-600">{event.details.before}</span>
                                }
                                <span className="text-xs text-gray-400">→</span>
                              </>
                            )}
                            {event.details.after && (
                              typeof event.details.after === 'string' && event.details.after.includes('_') ? 
                                getDecisionBadge(event.details.after) : 
                                <span className="text-xs text-gray-900 font-medium">{event.details.after}</span>
                            )}
                          </div>
                        )}
                      </div>

                      {hasDetails && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </motion.button>
                      )}
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <Separator className="my-3" />
                          
                          {event.details && (
                            <div className="space-y-2">
                              {event.details.field && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Field:</span> {event.details.field}
                                </div>
                              )}
                              
                              {event.details.before && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <div className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Before
                                  </div>
                                  <div className="text-sm text-red-900">
                                    {typeof event.details.before === 'string' ? 
                                      event.details.before : 
                                      JSON.stringify(event.details.before, null, 2)
                                    }
                                  </div>
                                </div>
                              )}
                              
                              {event.details.after && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                  <div className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    After
                                  </div>
                                  <div className="text-sm text-emerald-900">
                                    {typeof event.details.after === 'string' ? 
                                      event.details.after : 
                                      JSON.stringify(event.details.after, null, 2)
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {event.comment && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2">
                              <div className="text-xs font-medium text-purple-700 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Comment
                              </div>
                              <p className="text-sm text-purple-900 leading-relaxed">{event.comment}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* End marker */}
          <div className="relative pl-14 mt-4">
            <div className="absolute left-0 w-12 h-12 rounded-xl border-2 border-gray-200 bg-white flex items-center justify-center">
              <FileText className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-sm text-gray-500">Entity created</div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
