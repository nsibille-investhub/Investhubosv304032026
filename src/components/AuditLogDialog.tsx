import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Investor } from '../utils/investorGenerator';
import { formatDateTime } from '../utils/formatters';
import { Clock, User, FileEdit } from 'lucide-react';
import { Badge } from './ui/badge';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
}

interface AuditLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investor: Investor | null;
}

// Mock audit log data generator
function generateAuditLog(investor: Investor | null): AuditLogEntry[] {
  if (!investor) return [];
  
  return [
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      user: 'Jean Dupont',
      action: 'update',
      field: 'Status',
      oldValue: 'Prospect',
      newValue: investor.status,
      description: `Statut modifié de "Prospect" à "${investor.status}"`,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      user: 'Marie Martin',
      action: 'create',
      description: `Investisseur créé`,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
      user: 'Pierre Bernard',
      action: 'update',
      field: 'Email',
      oldValue: 'old@example.com',
      newValue: investor.email,
      description: `Email mis à jour`,
    },
  ];
}

export function AuditLogDialog({ open, onOpenChange, investor }: AuditLogDialogProps) {
  const auditLog = generateAuditLog(investor);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'update':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Création';
      case 'update':
        return 'Modification';
      case 'delete':
        return 'Suppression';
      default:
        return action;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-700" />
            Historique d'audit - {investor?.name}
          </DialogTitle>
          <DialogDescription>
            Suivez les modifications apportées à cet investisseur.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {auditLog.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune entrée d'audit disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLog.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={getActionColor(entry.action)}
                      >
                        {getActionLabel(entry.action)}
                      </Badge>
                      {entry.field && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                          <FileEdit className="w-3 h-3 mr-1" />
                          {entry.field}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(entry.timestamp)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {entry.description}
                    </p>

                    {entry.oldValue && entry.newValue && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded">
                          {entry.oldValue}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                          {entry.newValue}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{entry.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}