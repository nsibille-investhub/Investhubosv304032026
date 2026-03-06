import React, { useState } from 'react';
import { Search, Mail, Download, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface MailLog {
  id: string;
  date: string;
  recipient: string;
  subject: string;
  status: 'sent' | 'delivered' | 'failed' | 'opened';
  template: string;
}

const mockMails: MailLog[] = [
  { id: '1', date: '2025-10-28 14:30', recipient: 'jean.dupont@email.com', subject: 'Confirmation de souscription', status: 'opened', template: 'Confirmation souscription' },
  { id: '2', date: '2025-10-28 12:15', recipient: 'marie.martin@email.com', subject: 'Document manquant', status: 'delivered', template: 'Relance documents' },
  { id: '3', date: '2025-10-27 16:45', recipient: 'paul.bernard@email.com', subject: 'Bienvenue', status: 'sent', template: 'Bienvenue investisseur' },
  { id: '4', date: '2025-10-27 10:20', recipient: 'sophie.dubois@email.com', subject: 'Rappel échéance', status: 'failed', template: 'Rappel automatique' }
];

export function MailHistorySettings() {
  const [mails] = useState(mockMails);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusBadge = (status: MailLog['status']) => {
    const styles = {
      sent: 'bg-blue-50 text-blue-700 border-blue-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
      opened: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    const labels = {
      sent: 'Envoyé',
      delivered: 'Délivré',
      failed: 'Échec',
      opened: 'Ouvert'
    };
    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  const filteredMails = mails.filter(mail =>
    mail.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mail.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl mb-2">Historique des mails</h1>
          <p className="text-gray-600">Consultez l'historique complet des emails envoyés</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par destinataire ou sujet..."
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
                <th className="text-left p-3 text-sm text-gray-600">Sujet</th>
                <th className="text-left p-3 text-sm text-gray-600">Template</th>
                <th className="text-left p-3 text-sm text-gray-600">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredMails.map(mail => (
                <tr key={mail.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="p-3 text-sm text-gray-600">{mail.date}</td>
                  <td className="p-3 text-sm">{mail.recipient}</td>
                  <td className="p-3 text-sm">{mail.subject}</td>
                  <td className="p-3 text-sm text-gray-600">{mail.template}</td>
                  <td className="p-3">{getStatusBadge(mail.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
