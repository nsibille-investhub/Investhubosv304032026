import { useState, useMemo } from 'react';
import {
  X,
  Send,
  Users,
  Mail,
  Eye,
  XCircle,
  MinusCircle,
  Download,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { Tag } from './Tag';
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
  investorId: string;
  name: string;
  role: string | null;
  type: 'Investisseur' | 'Contact';
  inTarget: boolean;
  lastNotificationDate: string | null;
  receptionStatus: 'done' | 'pending' | 'not-targeted';
  receptionDate?: string;
  openingStatus: 'done' | 'pending' | 'not-targeted';
  openingDate?: string;
  consultationStatus: 'done' | 'pending' | 'not-accessible' | 'not-targeted';
  consultationDate?: string;
}

interface DocumentRelaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentId: string;
}

const mockRecipients: Recipient[] = [
  {
    id: '1',
    investorId: 'inv-1',
    name: 'Jean Dupont',
    role: null,
    type: 'Investisseur',
    inTarget: true,
    lastNotificationDate: '09/04/2026 09:12',
    receptionStatus: 'done',
    receptionDate: '09/04/2026 09:13',
    openingStatus: 'done',
    openingDate: '09/04/2026 09:35',
    consultationStatus: 'done',
    consultationDate: '09/04/2026 10:02',
  },
  {
    id: '2',
    investorId: 'inv-1',
    name: 'Marie Dupont',
    role: 'Avocat',
    type: 'Contact',
    inTarget: true,
    lastNotificationDate: '09/04/2026 09:12',
    receptionStatus: 'done',
    receptionDate: '09/04/2026 09:14',
    openingStatus: 'done',
    openingDate: '09/04/2026 11:08',
    consultationStatus: 'pending',
  },
  {
    id: '3',
    investorId: 'inv-1',
    name: 'Pierre Dupont',
    role: 'Comptable',
    type: 'Contact',
    inTarget: false,
    lastNotificationDate: null,
    receptionStatus: 'not-targeted',
    openingStatus: 'not-targeted',
    consultationStatus: 'not-targeted',
  },
  {
    id: '4',
    investorId: 'inv-1',
    name: 'Luc Martin',
    role: 'Dirigeant',
    type: 'Contact',
    inTarget: true,
    lastNotificationDate: '09/04/2026 09:12',
    receptionStatus: 'pending',
    openingStatus: 'pending',
    consultationStatus: 'pending',
  },
];

type FilterCriteria = 'all' | 'not-consulted';

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
  const [model, setModel] = useState('Relance Standard');

  const investorRecipients = useMemo(
    () => mockRecipients.filter((recipient) => recipient.investorId === 'inv-1'),
    []
  );

  const filteredRecipients = useMemo(() => {
    switch (selectedCriteria) {
      case 'not-consulted':
        return investorRecipients.filter((r) => r.inTarget && r.consultationStatus !== 'done');
      case 'all':
      default:
        return investorRecipients;
    }
  }, [investorRecipients, selectedCriteria]);

  // Les destinataires réellement notifiables (cherry-pick impossible : on envoie à tous
  // ceux qui sont dans la cible du filtre courant)
  const notifiableRecipients = useMemo(
    () => filteredRecipients.filter((r) => r.inTarget),
    [filteredRecipients]
  );

  const handleSend = () => {
    console.log(
      'Sending notifications to:',
      notifiableRecipients.map((r) => r.id),
      'for document',
      documentId
    );
    onClose();
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV for document:', documentId);
  };

  const handleCriteriaChange = (criteria: FilterCriteria) => {
    setSelectedCriteria(criteria);
  };

  const renderDateOrIcon = (
    status: 'done' | 'pending' | 'not-targeted' | 'not-accessible',
    date?: string,
  ) => {
    if (status === 'done' && date) {
      return <span className="text-xs text-gray-700 dark:text-gray-300">{date}</span>;
    }

    if (status === 'pending') {
      return <XCircle className="w-4 h-4 text-red-500 mx-auto" />;
    }

    return <MinusCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />;
  };

  const renderConsultationCell = (recipient: Recipient) => {
    if (!recipient.inTarget || recipient.consultationStatus === 'not-targeted') {
      if (recipient.name === 'Pierre Dupont') {
        return (
          <div className="flex items-center justify-center gap-2">
            <MinusCircle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
            <span className="text-xs text-gray-500">Non habilité au document</span>
          </div>
        );
      }

      return <MinusCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />;
    }

    return renderDateOrIcon(recipient.consultationStatus, recipient.consultationDate);
  };

  const renderLastNotification = (recipient: Recipient) => {
    if (!recipient.inTarget || !recipient.lastNotificationDate) {
      return <MinusCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />;
    }

    return <span className="text-xs text-gray-700 dark:text-gray-300">{recipient.lastNotificationDate}</span>;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[90vw] max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white dark:bg-black">
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

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-white dark:bg-black">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {documentName}
            </span>
          </div>

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

          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critère</span>

            <div className="grid grid-cols-2 gap-3">
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

          <div className="space-y-3">
            <div className="flex items-center justify-end">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter CSV
              </button>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Nom</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">Dernière notification</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">Dernière Réception</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">Dernière Ouverture</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400">Dernière Consultation document</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredRecipients.map((recipient) => (
                    <tr
                      key={recipient.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{recipient.name}</span>
                          {recipient.name === 'Pierre Dupont' && (
                            <span className="text-xs text-gray-500">Accès refusé : non habilité au document</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Tag label={recipient.type} />
                      </td>
                      <td className="px-4 py-3 text-center">{renderLastNotification(recipient)}</td>
                      <td className="px-4 py-3 text-center">{renderDateOrIcon(recipient.receptionStatus, recipient.receptionDate)}</td>
                      <td className="px-4 py-3 text-center">{renderDateOrIcon(recipient.openingStatus, recipient.openingDate)}</td>
                      <td className="px-4 py-3 text-center">{renderConsultationCell(recipient)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-black">
          <Button variant="outline" onClick={onClose}>
            Retour
          </Button>
          <Button
            onClick={handleSend}
            disabled={notifiableRecipients.length === 0}
            className="gap-2"
            style={{
              background: notifiableRecipients.length > 0
                ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                : undefined,
              color: notifiableRecipients.length > 0 ? 'white' : undefined
            }}
          >
            <Send className="w-4 h-4" />
            Envoyer {notifiableRecipients.length > 0
              ? `${notifiableRecipients.length} notification${notifiableRecipients.length > 1 ? 's' : ''}`
              : 'les notifications'}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
