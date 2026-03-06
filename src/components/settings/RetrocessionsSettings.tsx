import React, { useState } from 'react';
import { Plus, Download, Bell, CheckCircle, HelpCircle, Search, MoreVertical, AlertTriangle, Euro, Mail, X, Filter } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DataPagination } from '../ui/data-pagination';
import { cn } from '../ui/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { InfoBanner } from '../InfoBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { RetrocessionFilterBar } from '../RetrocessionFilterBar';
import { PartenaireCard } from '../PartenaireCard';
import { HighlightText } from '../HighlightText';

interface Retrocession {
  id: string;
  numero: string;
  type: 'Droits d\'entrée' | 'Commissions';
  date: string;
  dateNotification?: string;
  datePaiement?: string;
  partenaire: string;
  fonds: string;
  periode: string;
  montantTotal: string;
  lignes: number;
  statut: 'En attente' | 'À facturer' | 'Facturé - A payer' | 'Facturé - Payé';
  hasAlert?: boolean;
  alertMessage?: string;
}

const mockRetrocessions: Retrocession[] = [
  {
    id: '1',
    numero: '5605',
    type: 'Droits d\'entrée',
    date: '03/10/2025',
    partenaire: 'Simol 1',
    fonds: 'Fonds III',
    periode: '03/02/2025-30/10/2025',
    montantTotal: '965,00 €',
    lignes: 1,
    statut: 'À facturer',
    dateNotification: '01/03/2026'
  },
  {
    id: '2',
    numero: '5606',
    type: 'Droits d\'entrée',
    date: '03/10/2025',
    partenaire: 'Simol 1',
    fonds: 'Fonds I',
    periode: '03/02/2025-30/10/2025',
    montantTotal: '985,00 €',
    lignes: 2,
    statut: 'À facturer',
    hasAlert: true,
    alertMessage: 'Documents manquants',
    dateNotification: '01/03/2026'
  },
  {
    id: '12',
    numero: '5607',
    type: 'Commissions',
    date: '15/02/2025',
    partenaire: 'SAIGID PATRIMOINE',
    fonds: 'Fonds III',
    periode: '01/01/2025-31/03/2025',
    montantTotal: '1 450,00 €',
    lignes: 3,
    statut: 'En attente'
  },
  {
    id: '13',
    numero: '5608',
    type: 'Droits d\'entrée',
    date: '20/02/2025',
    partenaire: 'partenaire Imane',
    fonds: 'Fonds IV',
    periode: '01/02/2025-28/02/2025',
    montantTotal: '725,50 €',
    lignes: 2,
    statut: 'En attente'
  },
  {
    id: '3',
    numero: '3671',
    type: 'Droits d\'entrée',
    date: '26/10/2024',
    partenaire: 'SAIGID PATRIMOINE',
    fonds: 'Fonds IV',
    periode: '01/08/2024-31/10/2024',
    montantTotal: '240,96 €',
    lignes: 1,
    statut: 'Facturé - Payé',
    dateNotification: '15/10/2024',
    datePaiement: '20/10/2024'
  },
  {
    id: '4',
    numero: '3632',
    type: 'Droits d\'entrée',
    date: '01/06/2024',
    partenaire: 'Simol 1',
    fonds: 'Fonds IV',
    periode: '01/06/2024-27/06/2024',
    montantTotal: '2 534,60 €',
    lignes: 4,
    statut: 'À facturer',
    dateNotification: '10/06/2024'
  },
  {
    id: '5',
    numero: '2299',
    type: 'Droits d\'entrée',
    date: '24/01/2024',
    partenaire: 'partenaire Imane',
    fonds: 'Fonds IV',
    periode: '14/11/2023-24/01/2024',
    montantTotal: '385,06 €',
    lignes: 1,
    statut: 'Facturé - Payé',
    dateNotification: '25/01/2024',
    datePaiement: '05/02/2024'
  },
  {
    id: '6',
    numero: '2170',
    type: 'Droits d\'entrée',
    date: '08/01/2024',
    partenaire: 'partenaire Imane',
    fonds: 'Fonds IV',
    periode: '01/12/2023-31/01/2024',
    montantTotal: '1 055,00 €',
    lignes: 3,
    statut: 'Facturé - Payé',
    hasAlert: true,
    alertMessage: 'Paiement partiel',
    dateNotification: '09/01/2024',
    datePaiement: '15/01/2024'
  },
  {
    id: '7',
    numero: '2171',
    type: 'Droits d\'entrée',
    date: '08/01/2024',
    datePaiement: '29/10/2024',
    partenaire: 'SAIGID PATRIMOINE',
    fonds: 'Fonds IV',
    periode: '01/12/2023-31/01/2024',
    montantTotal: '100,66 €',
    lignes: 1,
    statut: 'Facturé - Payé',
    dateNotification: '10/01/2024'
  },
  {
    id: '8',
    numero: '1864',
    type: 'Commissions',
    date: '26/11/2023',
    partenaire: 'Simol 1',
    fonds: 'Fonds IV',
    periode: '01/11/2023-30/11/2023',
    montantTotal: '3 050,00 €',
    lignes: 5,
    statut: 'Facturé - A payer',
    dateNotification: '28/11/2023'
  },
  {
    id: '9',
    numero: '1865',
    type: 'Droits d\'entrée',
    date: '26/11/2023',
    datePaiement: '04/03/2025',
    partenaire: 'Simol 1',
    fonds: 'Fonds IV',
    periode: '01/11/2023-30/11/2023',
    montantTotal: '3 050,00 €',
    lignes: 2,
    statut: 'Facturé - Payé',
    dateNotification: '27/11/2023'
  },
  {
    id: '10',
    numero: '984',
    type: 'Droits d\'entrée',
    date: '21/08/2023',
    datePaiement: '10/01/2024',
    partenaire: 'Simol 1',
    fonds: 'Fonds IV',
    periode: '01/08/2023-30/08/2023',
    montantTotal: '300,58 €',
    lignes: 1,
    statut: 'Facturé - Payé',
    dateNotification: '22/08/2023'
  },
  {
    id: '11',
    numero: '983',
    type: 'Droits d\'entrée',
    date: '16/09/2023',
    partenaire: 'TEST Imane',
    fonds: 'Fonds IV',
    periode: '01/01/2020-31/12/2023',
    montantTotal: '1 000,16 €',
    lignes: 1,
    statut: 'À facturer'
  },
  {
    id: '14',
    numero: '1863',
    type: 'Commissions',
    date: '15/10/2023',
    partenaire: 'SAIGID PATRIMOINE',
    fonds: 'Fonds II',
    periode: '01/09/2023-30/09/2023',
    montantTotal: '1 850,00 €',
    lignes: 4,
    statut: 'Facturé - A payer',
    dateNotification: '16/10/2023'
  }
];

export function RetrocessionsSettings() {
  const [retrocessions, setRetrocessions] = useState<Retrocession[]>(mockRetrocessions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [helpMode, setHelpMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [markAsPaidDialogOpen, setMarkAsPaidDialogOpen] = useState(false);
  const [itemsToNotify, setItemsToNotify] = useState<Retrocession[]>([]);
  const [itemsToMarkAsPaid, setItemsToMarkAsPaid] = useState<Retrocession[]>([]);

  // Search states for modals
  const [notifySearch, setNotifySearch] = useState('');
  const [paidSearch, setPaidSearch] = useState('');

  // Filtrage principal
  const filteredRetrocessions = retrocessions.filter(ret => {
    const matchesSearch = !searchQuery || 
      ret.partenaire.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.fonds.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !filters.types || filters.types.length === 0 || filters.types.includes(ret.type);
    const matchesPartenaire = !filters.partenaires || filters.partenaires.length === 0 || filters.partenaires.includes(ret.partenaire);
    const matchesFonds = !filters.fonds || filters.fonds.length === 0 || filters.fonds.includes(ret.fonds);
    const matchesStatut = !filters.statuts || filters.statuts.length === 0 || filters.statuts.includes(ret.statut);
    
    return matchesSearch && matchesType && matchesPartenaire && matchesFonds && matchesStatut;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRetrocessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRetrocessions = filteredRetrocessions.slice(startIndex, startIndex + itemsPerPage);

  // Get only eligible items for notification (En attente)
  const eligibleForNotification = retrocessions.filter(r => r.statut === 'En attente');
  const filteredNotifyItems = eligibleForNotification.filter(r =>
    !notifySearch ||
    r.partenaire.toLowerCase().includes(notifySearch.toLowerCase()) ||
    r.numero.toLowerCase().includes(notifySearch.toLowerCase()) ||
    r.fonds.toLowerCase().includes(notifySearch.toLowerCase())
  );

  // Get only eligible items for payment (Facturé - A payer)
  const eligibleForPayment = retrocessions.filter(r => r.statut === 'Facturé - A payer');
  const filteredPaidItems = eligibleForPayment.filter(r =>
    !paidSearch ||
    r.partenaire.toLowerCase().includes(paidSearch.toLowerCase()) ||
    r.numero.toLowerCase().includes(paidSearch.toLowerCase()) ||
    r.fonds.toLowerCase().includes(paidSearch.toLowerCase())
  );

  const handleNotify = () => {
    setItemsToNotify(eligibleForNotification);
    setNotifyDialogOpen(true);
  };

  const handleMarkAsPaid = () => {
    setItemsToMarkAsPaid(eligibleForPayment);
    setMarkAsPaidDialogOpen(true);
  };

  const confirmNotify = () => {
    const idsToNotify = itemsToNotify.map(item => item.id);
    const today = new Date().toLocaleDateString('fr-FR');
    setRetrocessions(retrocessions.map(r => 
      idsToNotify.includes(r.id) 
        ? { ...r, dateNotification: today }
        : r
    ));
    setNotifyDialogOpen(false);
    setItemsToNotify([]);
    setNotifySearch('');
  };

  const confirmMarkAsPaid = () => {
    const idsToMark = itemsToMarkAsPaid.map(item => item.id);
    setRetrocessions(retrocessions.map(r => 
      idsToMark.includes(r.id) 
        ? { ...r, statut: 'Facturé - Payé', datePaiement: new Date().toLocaleDateString('fr-FR') }
        : r
    ));
    setMarkAsPaidDialogOpen(false);
    setItemsToMarkAsPaid([]);
    setPaidSearch('');
  };

  const handleExport = () => {
    alert('Export des rétrocessions');
  };

  const handleGenerate = () => {
    alert('Génération des décomptes');
  };

  const getStatutBadge = (statut: Retrocession['statut']) => {
    switch (statut) {
      case 'En attente':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">En attente</Badge>;
      case 'À facturer':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">À facturer</Badge>;
      case 'Facturé - A payer':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Facturé - A payer</Badge>;
      case 'Facturé - Payé':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Facturé - Payé</Badge>;
      default:
        return null;
    }
  };

  const getAvatarInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-[#0066FF] to-[#00C2FF]',
      'from-[#7C3AED] to-[#A78BFA]',
      'from-[#10B981] to-[#34D399]',
      'from-[#F59E0B] to-[#FBBF24]',
      'from-[#EF4444] to-[#F87171]',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const toggleItemSelection = (itemId: string) => {
    if (itemsToNotify.find(item => item.id === itemId)) {
      setItemsToNotify(itemsToNotify.filter(item => item.id !== itemId));
    } else {
      const item = retrocessions.find(r => r.id === itemId);
      if (item) {
        setItemsToNotify([...itemsToNotify, item]);
      }
    }
  };

  const toggleItemSelectionPaid = (itemId: string) => {
    if (itemsToMarkAsPaid.find(item => item.id === itemId)) {
      setItemsToMarkAsPaid(itemsToMarkAsPaid.filter(item => item.id !== itemId));
    } else {
      const item = retrocessions.find(r => r.id === itemId);
      if (item) {
        setItemsToMarkAsPaid([...itemsToMarkAsPaid, item]);
      }
    }
  };

  return (
    <div className="relative flex h-full">
      <motion.div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-2">Rétrocessions</h1>
              <p className="text-sm text-gray-600">
                {retrocessions.length} rétrocession{retrocessions.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setHelpMode(!helpMode)}
                variant={helpMode ? "default" : "outline"}
                className="h-9"
                style={helpMode ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white'
                } : {}}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {helpMode ? 'Guidage activé' : 'Aide'}
              </Button>
              <Button
                onClick={handleGenerate}
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                  color: 'white'
                }}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Générer les décomptes
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <InfoBanner
            isVisible={helpMode}
            title="Les rétrocessions"
            description="Gérez les rétrocessions et commissions versées à vos partenaires. Suivez l'état de facturation, notifiez les partenaires et marquez les paiements effectués."
            helpUrl="https://investhub.zohodesk.eu/portal/fr/kb/articles/retrocessions"
          />

          {/* Filters Section */}
          <RetrocessionFilterBar
            onFilterChange={setFilters}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            allData={retrocessions}
          />

          {/* Actions bar */}
          <div className="flex items-center justify-between mt-4 mb-3">
            <div className="text-xs text-gray-500 px-6">
              {filteredRetrocessions.length} résultat{filteredRetrocessions.length > 1 ? 's' : ''} sur {retrocessions.length} rétrocession{retrocessions.length > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-8"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNotify}
                disabled={eligibleForNotification.length === 0}
                className="h-8"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifier ({eligibleForNotification.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAsPaid}
                disabled={eligibleForPayment.length === 0}
                className="h-8"
              >
                <Euro className="w-4 h-4 mr-2" />
                Marquer comme payé ({eligibleForPayment.length})
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-20">#</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-36">Type</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-28">Date</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-32">Date notification</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-32">Date paiement</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-48">Partenaire</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-32">Fonds</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-40">Période</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 w-32">Montant total</th>
                    <th className="text-center px-4 py-3 text-xs text-gray-500 w-20">Lignes</th>
                    <th className="text-left px-4 py-3 text-xs text-gray-500 w-48">Statut</th>
                    <th className="text-right px-4 py-3 text-xs text-gray-500 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRetrocessions.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-gray-300" />
                          <p className="text-sm">Aucune rétrocession trouvée</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRetrocessions.map((retrocession) => (
                      <tr key={retrocession.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600">{retrocession.numero}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{retrocession.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{retrocession.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{retrocession.dateNotification || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{retrocession.datePaiement || '-'}</td>
                        <td className="px-4 py-3">
                          <PartenaireCard 
                            partenaire={{
                              name: retrocession.partenaire,
                              id: retrocession.id,
                              type: 'corporate'
                            }}
                            searchTerm={searchQuery}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                            <HighlightText text={retrocession.fonds} searchTerm={searchQuery} />
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{retrocession.periode}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{retrocession.montantTotal}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-center">{retrocession.lignes}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {retrocession.hasAlert && (
                              <div className="relative group">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                                    {retrocession.alertMessage}
                                  </div>
                                </div>
                              </div>
                            )}
                            {getStatutBadge(retrocession.statut)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </motion.button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {retrocession.statut === 'En attente' && (
                                  <DropdownMenuItem>
                                    <Bell className="w-4 h-4 mr-2" />
                                    Notifier le partenaire
                                  </DropdownMenuItem>
                                )}
                                {retrocession.statut === 'Facturé - A payer' && (
                                  <DropdownMenuItem>
                                    <Euro className="w-4 h-4 mr-2" />
                                    Marquer comme payé
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Télécharger le décompte
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredRetrocessions.length > 0 && (
              <DataPagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredRetrocessions.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Notify Dialog */}
      <AlertDialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
        <AlertDialogContent className="max-w-6xl max-h-[90vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Notifier les partenaires</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez les rétrocessions "En attente" pour lesquelles vous souhaitez envoyer une notification aux partenaires.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={notifySearch}
              onChange={(e) => setNotifySearch(e.target.value)}
              placeholder="Rechercher par numéro, partenaire, fonds..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Table */}
          <div className="overflow-y-auto max-h-[50vh] border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 w-12">
                    <Checkbox
                      checked={itemsToNotify.length === filteredNotifyItems.length && filteredNotifyItems.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setItemsToNotify(filteredNotifyItems);
                        } else {
                          setItemsToNotify([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Partenaire</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Fonds</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Période</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">Montant</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">Lignes</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifyItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" />
                        <p className="text-sm">Aucune rétrocession trouvée</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredNotifyItems.map((retrocession) => (
                    <tr
                      key={retrocession.id}
                      className={cn(
                        "border-b border-gray-100 cursor-pointer transition-colors",
                        itemsToNotify.find(item => item.id === retrocession.id)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => toggleItemSelection(retrocession.id)}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={!!itemsToNotify.find(item => item.id === retrocession.id)}
                          onCheckedChange={() => toggleItemSelection(retrocession.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{retrocession.numero}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{retrocession.type}</td>
                      <td className="px-4 py-3">
                        <PartenaireCard 
                          partenaire={{
                            name: retrocession.partenaire,
                            id: retrocession.id,
                            type: 'corporate'
                          }}
                          searchTerm={notifySearch}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          <HighlightText text={retrocession.fonds} searchTerm={notifySearch} />
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{retrocession.periode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{retrocession.montantTotal}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">{retrocession.lignes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-gray-500">
              {itemsToNotify.length} élément{itemsToNotify.length > 1 ? 's' : ''} sélectionné{itemsToNotify.length > 1 ? 's' : ''} sur {filteredNotifyItems.length}
            </p>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => {
                setNotifyDialogOpen(false);
                setNotifySearch('');
                setItemsToNotify([]);
              }}>
                Annuler
              </Button>
              <Button
                onClick={confirmNotify}
                disabled={itemsToNotify.length === 0}
                style={
                  itemsToNotify.length === 0
                    ? { opacity: 0.5, cursor: 'not-allowed' }
                    : {
                        background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                        color: 'white'
                      }
                }
              >
                <Bell className="w-4 h-4 mr-2" />
                Envoyer les notifications
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Paid Dialog */}
      <AlertDialog open={markAsPaidDialogOpen} onOpenChange={setMarkAsPaidDialogOpen}>
        <AlertDialogContent className="max-w-6xl max-h-[90vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Marquer comme payé</AlertDialogTitle>
            <AlertDialogDescription>
              Sélectionnez les rétrocessions "Facturé - A payer" que vous souhaitez marquer comme payées.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={paidSearch}
              onChange={(e) => setPaidSearch(e.target.value)}
              placeholder="Rechercher par numéro, partenaire, fonds..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Table */}
          <div className="overflow-y-auto max-h-[50vh] border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 w-12">
                    <Checkbox
                      checked={itemsToMarkAsPaid.length === filteredPaidItems.length && filteredPaidItems.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setItemsToMarkAsPaid(filteredPaidItems);
                        } else {
                          setItemsToMarkAsPaid([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Partenaire</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Fonds</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Période</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">Montant</th>
                  <th className="text-center px-4 py-3 text-xs text-gray-500">Lignes</th>
                </tr>
              </thead>
              <tbody>
                {filteredPaidItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-gray-300" />
                        <p className="text-sm">Aucune rétrocession trouvée</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPaidItems.map((retrocession) => (
                    <tr
                      key={retrocession.id}
                      className={cn(
                        "border-b border-gray-100 cursor-pointer transition-colors",
                        itemsToMarkAsPaid.find(item => item.id === retrocession.id)
                          ? "bg-green-50"
                          : "hover:bg-gray-50"
                      )}
                      onClick={() => toggleItemSelectionPaid(retrocession.id)}
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={!!itemsToMarkAsPaid.find(item => item.id === retrocession.id)}
                          onCheckedChange={() => toggleItemSelectionPaid(retrocession.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{retrocession.numero}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{retrocession.type}</td>
                      <td className="px-4 py-3">
                        <PartenaireCard 
                          partenaire={{
                            name: retrocession.partenaire,
                            id: retrocession.id,
                            type: 'corporate'
                          }}
                          searchTerm={paidSearch}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                          <HighlightText text={retrocession.fonds} searchTerm={paidSearch} />
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{retrocession.periode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{retrocession.montantTotal}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">{retrocession.lignes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-xs text-gray-500">
              {itemsToMarkAsPaid.length} élément{itemsToMarkAsPaid.length > 1 ? 's' : ''} sélectionné{itemsToMarkAsPaid.length > 1 ? 's' : ''} sur {filteredPaidItems.length}
            </p>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => {
                setMarkAsPaidDialogOpen(false);
                setPaidSearch('');
                setItemsToMarkAsPaid([]);
              }}>
                Annuler
              </Button>
              <Button
                onClick={confirmMarkAsPaid}
                disabled={itemsToMarkAsPaid.length === 0}
                style={
                  itemsToMarkAsPaid.length === 0
                    ? { opacity: 0.5, cursor: 'not-allowed' }
                    : {
                        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                        color: 'white'
                      }
                }
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Marquer comme payé
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}