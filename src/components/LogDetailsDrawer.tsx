import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Code, 
  Activity, 
  Clock, 
  Globe, 
  Terminal,
  Calendar,
  Monitor,
  Database,
  FileJson,
  Hash,
  Layers
} from 'lucide-react';
import { LogEntry } from '../utils/logsGenerator';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from './ui/utils';

interface LogDetailsDrawerProps {
  log: LogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LogDetailsDrawer({ log, isOpen, onClose }: LogDetailsDrawerProps) {
  if (!log) return null;

  // Badge pour le status code
  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400 font-mono">
          {statusCode}
        </Badge>
      );
    }
    if (statusCode >= 400 && statusCode < 500) {
      return (
        <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400 font-mono">
          {statusCode}
        </Badge>
      );
    }
    if (statusCode >= 500) {
      return (
        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 font-mono">
          {statusCode}
        </Badge>
      );
    }
    return <Badge variant="outline" className="font-mono">{statusCode}</Badge>;
  };

  // Badge pour la méthode HTTP
  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
      POST: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
      PUT: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400',
      DELETE: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
      PATCH: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400',
    };

    return (
      <Badge variant="outline" className={cn('font-mono text-xs', colors[method] || '')}>
        {method}
      </Badge>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[600px] bg-white dark:bg-gray-950 shadow-2xl z-50 overflow-hidden flex flex-col border-l border-gray-200 dark:border-gray-800"
          >
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Détails du log
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {log.timestampFull}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Section Utilisateur */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    <User className="w-4 h-4" />
                    Utilisateur
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-black to-[#0F323D] flex items-center justify-center text-white text-sm font-medium">
                        {log.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{log.user}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{log.userEmail}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Session ID</div>
                        <div className="text-xs font-mono text-gray-900 dark:text-gray-100 break-all">{log.sessionId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">IP Address</div>
                        <div className="text-sm font-mono text-gray-900 dark:text-gray-100">{log.ipAddress}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Action */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    <Activity className="w-4 h-4" />
                    Action
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Module</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.controllerLabel}</div>
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{log.controller}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Action</div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.actionLabel}</div>
                        <div className="text-xs font-mono text-gray-500 dark:text-gray-400">{log.action}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Requête HTTP */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    <Globe className="w-4 h-4" />
                    Requête HTTP
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Méthode</div>
                      {getMethodBadge(log.method)}
                      <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">Status</div>
                      {getStatusBadge(log.statusCode)}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">URL</div>
                      <div className="text-sm font-mono text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-950 px-3 py-2 rounded border border-gray-200 dark:border-gray-700 break-all">
                        {log.url}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className={cn(
                          "text-sm font-mono font-medium",
                          log.responseTime < 100 ? "text-green-600 dark:text-green-400" :
                          log.responseTime < 500 ? "text-orange-600 dark:text-orange-400" :
                          "text-red-600 dark:text-red-400"
                        )}>
                          {log.responseTime}ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Entité cible */}
                {log.targetEntity && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                      <Database className="w-4 h-4" />
                      Entité cible
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-800">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Type</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.entityType || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID</div>
                          <div className="text-sm font-mono text-gray-900 dark:text-gray-100">{log.entityId || 'N/A'}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nom</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100">{log.targetEntity}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section Payload */}
                {log.payload && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                      <FileJson className="w-4 h-4" />
                      Payload
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
                      <pre className="text-xs font-mono text-gray-900 dark:text-gray-100 overflow-x-auto">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Section Métadonnées */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                    <Layers className="w-4 h-4" />
                    Métadonnées
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-gray-800">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">User Agent</div>
                      <div className="text-xs text-gray-900 dark:text-gray-100 break-all">{log.userAgent}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Timestamp</div>
                        <div className="text-xs font-mono text-gray-900 dark:text-gray-100">{log.timestamp}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Timestamp relatif</div>
                        <div className="text-xs text-gray-900 dark:text-gray-100">{log.timestampRelative}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Log ID: <span className="font-mono">{log.id}</span>
                </div>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-black to-[#0F323D] text-white"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
