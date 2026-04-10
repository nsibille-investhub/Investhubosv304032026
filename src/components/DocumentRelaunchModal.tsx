import { useState, useMemo } from 'react';
import { 
  X, 
  Send, 
  Users, 
  Mail, 
  Eye, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { cn } from './ui/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from './ui/alert-dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface Recipient {
  id: string;
  name: string;
  role: string | null; // Groupe de diffusion pour les contacts ('Avocat', 'Comptable', 'Dirigeant'), null pour investisseur
  type: 'Investisseur' | 'Contact';
  emailOpened: boolean;
  docConsulted: boolean;
  emailDelivered: boolean; // Si false, on affiche le point d'exclamation rouge
}

interface DocumentRelaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
}

// Mock data
const mockRecipients: Recipient[] = [
  {
    id: '1',
    name: 'Jean Dupont',
    role: null,
    type: 'Investisseur',
    emailOpened: true,
    docConsulted: true,
    emailDelivered: true,
  },
  {
    id: '2',
    name: 'Marie Dupont',
    role: 'Avocat',
    type: 'Contact',
    emailOpened: true,
    docConsulted: true,
    emailDelivered: true,
  },
  {
    id: '3',
    name: 'Pierre Dupont',
    role: 'Comptable',
    type: 'Contact',
    emailOpened: false,
    docConsulted: false,
    emailDelivered: false, // Non reçu
  },
  {
    id: '4',
    name: 'Sophie Martin',
    role: null,
    type: 'Investisseur',
    emailOpened: true,
    docConsulted: true,
    emailDelivered: true,
  },
  {
    id: '5',
    name: 'Luc Martin',
    role: 'Dirigeant',
    type: 'Contact',
    emailOpened: true,
    docConsulted: true,
    emailDelivered: true,
  },
  {
    id: '6',
    name: 'Thomas Bernard',
    role: null,
    type: 'Investisseur',
    emailOpened: true,
    docConsulted: true,
    emailDelivered: true,
  },
];

type FilterCriteria = 'all' | 'not-opened' | 'not-consulted';

const emailTemplates = [
  { id: 'relance-standard', name: 'Relance Standard', description: 'Template classique de relance' },
  { id: 'relance-urgente', name: 'Relance Urgente', description: 'Pour les documents nécessitant une action rapide' },
  { id: 'relance-amicale', name: 'Relance Amicale', description: 'Ton plus décontracté et convivial' },
  { id: 'relance-formelle', name: 'Relance Formelle', description: 'Communication professionnelle formelle' },
  { id: 'rappel-douceur', name: 'Rappel en Douceur', description: 'Relance subtile et non intrusive' },
];

export function DocumentRelaunchModal({
  isOpen,
  onClose,
  documentName,
  documentId,
}: DocumentRelaunchModalProps) {
  const [selectedCriteria, setSelectedCriteria] = useState<FilterCriteria>('all');
  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(new Set());
  const [model, setModel] = useState('Relance Standard');

  // Filtrer les destinataires selon le critère
  const filteredRecipients = useMemo(() => {
    switch (selectedCriteria) {
      case 'not-opened':
        return mockRecipients.filter(r => !r.emailOpened);
      case 'not-consulted':
        return mockRecipients.filter(r => !r.docConsulted);
      case 'all':
      default:
        return mockRecipients;
    }
  }, [selectedCriteria]);

  // Sélection globale
  const toggleSelectAll = () => {
    if (selectedRecipients.size === filteredRecipients.length) {
      setSelectedRecipients(new Set());
    } else {
      setSelectedRecipients(new Set(filteredRecipients.map(r => r.id)));
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSend = () => {
    console.log('Sending notifications to:', Array.from(selectedRecipients));
    onClose();
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV...');
  };

  // Réinitialiser les sélections quand on change de critère
  const handleCriteriaChange = (criteria: FilterCriteria) => {
    setSelectedCriteria(criteria);
    setSelectedRecipients(new Set());
  };

  const allSelected = selectedRecipients.size === filteredRecipients.length && filteredRecipients.length > 0;
  const someSelected = selectedRecipients.size > 0 && selectedRecipients.size < filteredRecipients.length;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-black">
        {/* Header */}
        <AlertDialogHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Relancer une notification
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-gray-500 dark:text-gray-400">
                Notifier les destinataires pour ce document
              </AlertDialogDescription>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </AlertDialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white dark:bg-black">
          {/* Document */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {documentName}
            </span>
          </div>

          {/* Récapitulatif de l'envoi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Récapitulatif de l'envoi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Modèle :</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                      {model}
                      <ChevronDown className="w-4 h-4 text-blue-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-2" align="end">
                    <div className="space-y-1">
                      {emailTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setModel(template.name)}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg transition-colors',
                            model === template.name
                              ? 'bg-blue-50 dark:bg-blue-950'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Mail className={cn(
                              'w-4 h-4',
                              model === template.name ? 'text-blue-500' : 'text-gray-400'
                            )} />
                            <span className={cn(
                              'text-sm font-medium',
                              model === template.name
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-900 dark:text-gray-100'
                            )}>
                              {template.name}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                            {template.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Critères */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Critère
              </span>
              <Badge className="bg-blue-500 text-white">
                Destinataires : {filteredRecipients.length}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Tous les destinataires */}
              <button
                onClick={() => handleCriteriaChange('all')}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 transition-all',
                  selectedCriteria === 'all'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <Users className={cn(
                  'w-5 h-5',
                  selectedCriteria === 'all' ? 'text-blue-500' : 'text-gray-400'
                )} />
                <span className={cn(
                  'text-xs font-medium',
                  selectedCriteria === 'all' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                )}>
                  Tous les destinataires
                </span>
              </button>

              {/* N'ont pas ouvert l'email */}
              <button
                onClick={() => handleCriteriaChange('not-opened')}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 transition-all',
                  selectedCriteria === 'not-opened'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <Mail className={cn(
                  'w-5 h-5',
                  selectedCriteria === 'not-opened' ? 'text-blue-500' : 'text-gray-400'
                )} />
                <span className={cn(
                  'text-xs font-medium text-center',
                  selectedCriteria === 'not-opened' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                )}>
                  N'ont pas ouvert l'email
                </span>
              </button>

              {/* N'ont pas consulté le document */}
              <button
                onClick={() => handleCriteriaChange('not-consulted')}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg border-2 transition-all',
                  selectedCriteria === 'not-consulted'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                <Eye className={cn(
                  'w-5 h-5',
                  selectedCriteria === 'not-consulted' ? 'text-blue-500' : 'text-gray-400'
                )} />
                <span className={cn(
                  'text-xs font-medium text-center',
                  selectedCriteria === 'not-consulted' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                )}>
                  N'ont pas consulté le document
                </span>
              </button>
            </div>
          </div>

          {/* Liste des destinataires */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Liste des destinataires ({filteredRecipients.length})
              </span>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter CSV
              </button>
            </div>

            {/* Tableau */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        className={cn(
                          someSelected && !allSelected && 'data-[state=checked]:bg-gray-400'
                        )}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                      Groupe
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      Email reçu
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      Email ouvert
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      Doc consulté
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredRecipients.map((recipient) => (
                    <tr
                      key={recipient.id}
                      className={cn(
                        'hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors',
                        selectedRecipients.has(recipient.id) && 'bg-blue-50/50 dark:bg-blue-950/20'
                      )}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedRecipients.has(recipient.id)}
                          onCheckedChange={() => toggleRecipient(recipient.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {recipient.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {recipient.role || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {recipient.type}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {recipient.emailDelivered ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {recipient.emailOpened ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {recipient.docConsulted ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-black">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Retour
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedRecipients.size === 0}
            className="gap-2"
            style={{
              background: selectedRecipients.size > 0 
                ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)' 
                : undefined,
              color: selectedRecipients.size > 0 ? 'white' : undefined
            }}
          >
            <Send className="w-4 h-4" />
            Envoyer {selectedRecipients.size > 0 ? `${selectedRecipients.size} notification${selectedRecipients.size > 1 ? 's' : ''}` : 'les notifications'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}