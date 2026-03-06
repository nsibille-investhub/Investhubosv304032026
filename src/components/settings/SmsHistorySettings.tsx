import React, { useState } from 'react';
import { Search, MessageSquare, Download, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface SmsLog {
  id: string;
  date: string;
  recipient: string;
  message: string;
  status: 'sent' | 'delivered' | 'failed';
}

const mockSms: SmsLog[] = [
  { id: '1', date: '2025-10-28 14:30', recipient: '+33612345678', message: 'Votre code de vérification: 123456', status: 'delivered' },
  { id: '2', date: '2025-10-28 12:15', recipient: '+33687654321', message: 'Document validé. Merci.', status: 'delivered' },
  { id: '3', date: '2025-10-27 16:45', recipient: '+33698765432', message: 'Rappel: signature en attente', status: 'sent' },
  { id: '4', date: '2025-10-27 10:20', recipient: '+33623456789', message: 'Code OTP: 789012', status: 'failed' }
];

export function SmsHistorySettings() {
  const [sms] = useState(mockSms);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: SmsLog['status']) => {
    const styles = {
      sent: 'bg-blue-50 text-blue-700 border-blue-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      failed: 'bg-red-50 text-red-700 border-red-200'
    };
    const labels = {
      sent: 'Envoyé',
      delivered: 'Délivré',
      failed: 'Échec'
    };
    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  const filteredSms = sms.filter(s =>
    s.recipient.includes(searchQuery) ||
    s.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Historique des SMS</h1>
          <p className="text-gray-600">Consultez l'historique complet des SMS envoyés</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par numéro ou message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-3 text-sm text-gray-600">Date</th>
                <th className="text-left p-3 text-sm text-gray-600">Destinataire</th>
                <th className="text-left p-3 text-sm text-gray-600">Message</th>
                <th className="text-left p-3 text-sm text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredSms.map(s => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-600">{s.date}</td>
                  <td className="p-3 text-sm">{s.recipient}</td>
                  <td className="p-3 text-sm text-gray-600">{s.message}</td>
                  <td className="p-3">{getStatusBadge(s.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
