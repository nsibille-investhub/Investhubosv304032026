import { useMemo, useState } from 'react';
import {
  X,
  Send,
  Users,
  Mail,
  Eye,
  XCircle,
  MinusCircle,
  Download,
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { DocumentPreviewDrawer } from './DocumentPreviewDrawer';

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
  /**
   * Si `true` (défaut) : écran nominatif avec listing détaillé des
   * investisseurs et contacts. Si `false` : écran générique avec uniquement
   * un récapitulatif du nombre d'investisseurs concernés.
   */
  isNominatif?: boolean;
}

// Statistiques simulées pour un document générique
const mockGenericStats = {
  totalInvestors: 47,
  notConsulted: 19,
};

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

const getDocumentFormat = (name: string): string | undefined => {
  const match = name.match(/\.([A-Za-z0-9]+)$/);
  return match ? match[1].toLowerCase() : undefined;
};

export function DocumentRelaunchModal({
  isOpen,
  onClose,
  documentName,
  documentId,
  isNominatif = true,
}: DocumentRelaunchModalProps) {
  const [selectedCriteria, setSelectedCriteria] = useState<FilterCriteria>('all');
  const [model, setModel] = useState('Relance Standard');
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const investorRecipients = useMemo(
    () => mockRecipients.filter((recipient) => recipient.investorId === 'inv-1'),
    [],
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

  const notifiableRecipients = useMemo(
    () => filteredRecipients.filter((r) => r.inTarget),
    [filteredRecipients],
  );

  const notifiableCount = isNominatif
    ? notifiableRecipients.length
    : selectedCriteria === 'not-consulted'
    ? mockGenericStats.notConsulted
    : mockGenericStats.totalInvestors;

  const handleSend = () => {
    if (isNominatif) {
      console.log(
        'Sending notifications to:',
        notifiableRecipients.map((r) => r.id),
        'for document',
        documentId,
      );
    } else {
      console.log(
        'Sending notifications to',
        notifiableCount,
        'investors for generic document',
        documentId,
      );
    }
    onClose();
  };

  const handleExportCSV = () => {
    console.log('Exporting CSV for document:', documentId);
  };

  const renderDateOrIcon = (
    status: 'done' | 'pending' | 'not-targeted' | 'not-accessible',
    date?: string,
  ) => {
    if (status === 'done' && date) {
      return (
        <span className="text-xs text-foreground tabular-nums">{date}</span>
      );
    }

    if (status === 'pending') {
      return <XCircle className="w-4 h-4 text-destructive mx-auto" aria-label="En attente" />;
    }

    return (
      <MinusCircle
        className="w-4 h-4 text-muted-foreground/50 mx-auto"
        aria-label="Non applicable"
      />
    );
  };

  const renderConsultationCell = (recipient: Recipient) => {
    if (!recipient.inTarget || recipient.consultationStatus === 'not-targeted') {
      if (recipient.name === 'Pierre Dupont') {
        return (
          <div className="flex items-center justify-center gap-2">
            <MinusCircle className="w-4 h-4 text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">Non habilité au document</span>
          </div>
        );
      }

      return <MinusCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" />;
    }

    return renderDateOrIcon(recipient.consultationStatus, recipient.consultationDate);
  };

  const renderLastNotification = (recipient: Recipient) => {
    if (!recipient.inTarget || !recipient.lastNotificationDate) {
      return <MinusCircle className="w-4 h-4 text-muted-foreground/50 mx-auto" />;
    }

    return (
      <span className="text-xs text-foreground tabular-nums">
        {recipient.lastNotificationDate}
      </span>
    );
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent
          className={cn(
            'p-0 gap-0 overflow-hidden flex flex-col',
            'w-full max-w-full sm:max-w-full',
            'max-h-[88vh]',
            'bg-white',
          )}
          style={{
            width: 'min(960px, 60vw)',
            maxWidth: 'min(960px, 60vw)',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Header */}
          <AlertDialogHeader className="px-6 py-5 border-b border-border bg-white" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-brand"
                style={{
                  background:
                    'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                }}
              >
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <AlertDialogTitle className="text-lg font-semibold text-foreground">
                  Relancer une notification
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground">
                  Notifier les destinataires pour ce document
                </AlertDialogDescription>
              </div>
              <button
                onClick={onClose}
                aria-label="Fermer"
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </AlertDialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto scrollbar-thin bg-white" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="px-6 py-5 space-y-5">
              {/* Document preview card (clickable) */}
              <button
                type="button"
                onClick={() => {
                  // Close the modal first so the preview drawer layers above
                  // the activity panel cleanly instead of competing with the
                  // AlertDialog's portal stacking context.
                  onClose();
                  setIsPreviewOpen(true);
                }}
                className={cn(
                  'group w-full flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-white text-left',
                  'hover:bg-muted/40 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  'transition-colors',
                )}
                aria-label={`Ouvrir l'aperçu de ${documentName}`}
              >
                <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {documentName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cliquer pour afficher l'aperçu du document
                  </div>
                </div>
                <Badge variant="secondary" className="hidden sm:inline-flex gap-1">
                  <Eye className="w-3 h-3" />
                  Aperçu
                </Badge>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>

              {/* Recap header + template selector */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Récapitulatif de l'envoi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Modèle</span>
                  <Popover open={templatePopoverOpen} onOpenChange={setTemplatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 font-normal"
                      >
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        {model}
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-1" align="end">
                      <div className="space-y-0.5">
                        {emailTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              setModel(template.name);
                              setTemplatePopoverOpen(false);
                            }}
                            className={cn(
                              'w-full text-left px-2.5 py-2 rounded-md transition-colors',
                              model === template.name
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-muted',
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Mail
                                className={cn(
                                  'w-3.5 h-3.5',
                                  model === template.name
                                    ? 'text-primary'
                                    : 'text-muted-foreground',
                                )}
                              />
                              <span className="text-sm font-medium text-foreground">
                                {template.name}
                              </span>
                              {model === template.name && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary ml-auto" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground ml-6 mt-0.5">
                              {template.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Critère */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Critère
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCriteria('all')}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left transition-colors',
                      selectedCriteria === 'all'
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'border-border bg-white hover:bg-muted/40',
                    )}
                    aria-pressed={selectedCriteria === 'all'}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                        selectedCriteria === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">
                      Tous les destinataires
                    </span>
                  </button>

                  <button
                    onClick={() => setSelectedCriteria('not-consulted')}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-left transition-colors',
                      selectedCriteria === 'not-consulted'
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'border-border bg-white hover:bg-muted/40',
                    )}
                    aria-pressed={selectedCriteria === 'not-consulted'}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                        selectedCriteria === 'not-consulted'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-medium">
                      N'ont pas consulté le document
                    </span>
                  </button>
                </div>
              </div>

              <Separator />

              {/* Body: recipients table (nominatif) or summary (generic) */}
              {isNominatif ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Destinataires ({filteredRecipients.length})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportCSV}
                      className="h-7 text-xs gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exporter CSV
                    </Button>
                  </div>

                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-white hover:bg-white border-b-border">
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium">
                            Nom
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium">
                            Type
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            Notification
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            Réception
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            Ouverture
                          </TableHead>
                          <TableHead className="px-3 text-xs text-muted-foreground font-medium text-center">
                            Consultation
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecipients.map((recipient) => (
                          <TableRow key={recipient.id}>
                            <TableCell className="px-3 py-3 align-top">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-foreground">
                                  {recipient.name}
                                </span>
                                {recipient.role && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {recipient.role}
                                  </span>
                                )}
                                {recipient.name === 'Pierre Dupont' && (
                                  <span className="text-[11px] text-muted-foreground">
                                    Accès refusé · non habilité
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-3">
                              <Badge
                                variant="outline"
                                className="border-border bg-muted/60 text-muted-foreground font-normal"
                              >
                                {recipient.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-3 text-center">
                              {renderLastNotification(recipient)}
                            </TableCell>
                            <TableCell className="px-3 text-center">
                              {renderDateOrIcon(recipient.receptionStatus, recipient.receptionDate)}
                            </TableCell>
                            <TableCell className="px-3 text-center">
                              {renderDateOrIcon(recipient.openingStatus, recipient.openingDate)}
                            </TableCell>
                            <TableCell className="px-3 text-center">
                              {renderConsultationCell(recipient)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-border bg-white p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-foreground tabular-nums">
                          {notifiableCount}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          investisseur{notifiableCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedCriteria === 'not-consulted'
                          ? "Investisseurs n'ayant pas encore consulté ce document"
                          : 'Investisseurs ayant accès à ce document'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExportCSV}
                      className="h-8 text-xs gap-1.5 flex-shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exporter CSV
                    </Button>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
                        Total ayant accès
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {mockGenericStats.totalInvestors} investisseurs
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">
                        Non consulté
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {mockGenericStats.notConsulted} investisseur
                        {mockGenericStats.notConsulted > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-white flex items-center justify-between gap-2" style={{ backgroundColor: '#FFFFFF' }}>
            <Button variant="outline" onClick={onClose}>
              Retour
            </Button>
            <Button
              onClick={handleSend}
              disabled={notifiableCount === 0}
              className={cn(
                'gap-2 text-white border-0',
                notifiableCount === 0 && 'opacity-60',
              )}
              style={
                notifiableCount > 0
                  ? {
                      background:
                        'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)',
                    }
                  : undefined
              }
            >
              <Send className="w-4 h-4" />
              Envoyer{' '}
              {notifiableCount > 0
                ? `${notifiableCount} notification${notifiableCount > 1 ? 's' : ''}`
                : 'les notifications'}
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview drawer */}
      <DocumentPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        documentName={documentName}
        documentId={documentId}
        format={getDocumentFormat(documentName)}
      />
    </>
  );
}
