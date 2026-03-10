import { useState } from 'react';
import { Plus, Download, Bell, HelpCircle, Search, AlertTriangle, Euro, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DataPagination } from '../ui/data-pagination';
import { motion } from 'motion/react';
import { InfoBanner } from '../InfoBanner';
import { Checkbox } from '../ui/checkbox';
import { RetrocessionFilterBar } from '../RetrocessionFilterBar';
import { PartenaireCard } from '../PartenaireCard';
import { HighlightText } from '../HighlightText';
import { RetrocessionsStatusTabs, RetrocessionStatusView } from '../RetrocessionsStatusTabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
  const [activeStatusView, setActiveStatusView] = useState<RetrocessionStatusView>('Tous');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredRetrocessions = retrocessions.filter(ret => {
    const matchesSearch = !searchQuery || 
      ret.partenaire.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.fonds.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = !filters.types || filters.types.length === 0 || filters.types.includes(ret.type);
    const matchesPartenaire = !filters.partenaires || filters.partenaires.length === 0 || filters.partenaires.includes(ret.partenaire);
    const matchesFonds = !filters.fonds || filters.fonds.length === 0 || filters.fonds.includes(ret.fonds);
    const matchesStatutFilters = !filters.statuts || filters.statuts.length === 0 || filters.statuts.includes(ret.statut);
    const matchesStatusView = activeStatusView === 'Tous' || ret.statut === activeStatusView;

    return matchesSearch && matchesType && matchesPartenaire && matchesFonds && matchesStatutFilters && matchesStatusView;
  });

  const totalPages = Math.ceil(filteredRetrocessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRetrocessions = filteredRetrocessions.slice(startIndex, startIndex + itemsPerPage);

  const canSelectRows = activeStatusView === 'En attente' || activeStatusView === 'Facturé - A payer';

  const selectedRetrocessions = paginatedRetrocessions.filter(r => selectedIds.includes(r.id));

  const handleExport = () => {
    alert('Export des rétrocessions');
  };

  const handleGenerate = () => {
    alert('Génération des décomptes');
  };

  const notifyRetrocessions = (ids: string[]) => {
    const today = new Date().toLocaleDateString('fr-FR');
    setRetrocessions(prev => prev.map(r => (
      ids.includes(r.id) ? { ...r, dateNotification: today } : r
    )));
    setSelectedIds([]);
  };

  const markAsPaidRetrocessions = (ids: string[]) => {
    const today = new Date().toLocaleDateString('fr-FR');
    setRetrocessions(prev => prev.map(r => (
      ids.includes(r.id) ? { ...r, statut: 'Facturé - Payé', datePaiement: today } : r
    )));
    setSelectedIds([]);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedIds(prev => prev.includes(itemId)
      ? prev.filter(id => id !== itemId)
      : [...prev, itemId]
    );
  };

  const toggleSelectAllVisible = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedRetrocessions.map(r => r.id));
      return;
    }
    setSelectedIds([]);
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



  return (
    <div className="relative flex h-full">
      <motion.div className="flex-1 overflow-auto">
        <div className="p-6">
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
                variant={helpMode ? 'default' : 'outline'}
                className="h-9"
                style={helpMode ? { background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: 'white' } : {}}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {helpMode ? 'Guidage activé' : 'Aide'}
              </Button>
              <Button
                onClick={handleGenerate}
                style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)', color: 'white' }}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Générer les décomptes
              </Button>
            </div>
          </div>

          <InfoBanner
            isVisible={helpMode}
            title="Les rétrocessions"
            description="Gérez les rétrocessions et commissions versées à vos partenaires. Suivez l'état de facturation, notifiez les partenaires et marquez les paiements effectués."
            helpUrl="https://investhub.zohodesk.eu/portal/fr/kb/articles/retrocessions"
          />

          <RetrocessionsStatusTabs
            data={retrocessions.map(item => ({ statut: item.statut, montantTotal: item.montantTotal }))}
            activeStatus={activeStatusView}
            onStatusChange={(status) => {
              setActiveStatusView(status);
              setCurrentPage(1);
              setSelectedIds([]);
            }}
          />

          <RetrocessionFilterBar
            onFilterChange={setFilters}
            onSearchChange={setSearchQuery}
            searchValue={searchQuery}
            allData={retrocessions}
          />

          <div className="flex items-center justify-between mt-4 mb-3">
            <div className="text-xs text-gray-500 px-6">
              {filteredRetrocessions.length} résultat{filteredRetrocessions.length > 1 ? 's' : ''} sur {retrocessions.length} rétrocession{retrocessions.length > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} className="h-8">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
              {activeStatusView === 'En attente' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => notifyRetrocessions(selectedRetrocessions.map(item => item.id))}
                  disabled={selectedRetrocessions.length === 0}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifier ({selectedRetrocessions.length})
                </Button>
              )}
              {activeStatusView === 'Facturé - A payer' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => markAsPaidRetrocessions(selectedRetrocessions.map(item => item.id))}
                  disabled={selectedRetrocessions.length === 0}
                >
                  <Euro className="w-4 h-4 mr-2" />
                  Marquer comme payé ({selectedRetrocessions.length})
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {canSelectRows && (
                      <th className="text-left px-4 py-3 text-xs text-gray-500 w-12">
                        <Checkbox
                          checked={paginatedRetrocessions.length > 0 && selectedIds.length === paginatedRetrocessions.length}
                          onCheckedChange={(checked) => toggleSelectAllVisible(!!checked)}
                        />
                      </th>
                    )}
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
                    <th className="text-right px-4 py-3 text-xs text-gray-500 w-44">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRetrocessions.length === 0 ? (
                    <tr>
                      <td colSpan={canSelectRows ? 13 : 12} className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-gray-300" />
                          <p className="text-sm">Aucune rétrocession trouvée</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRetrocessions.map((retrocession) => (
                      <tr key={retrocession.id} className="group border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        {canSelectRows && (
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedIds.includes(retrocession.id)}
                              onCheckedChange={() => toggleItemSelection(retrocession.id)}
                            />
                          </td>
                        )}
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
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </motion.button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Télécharger le décompte
                                </DropdownMenuItem>
                                {activeStatusView === 'En attente' && (
                                  <DropdownMenuItem onClick={() => notifyRetrocessions([retrocession.id])}>
                                    <Bell className="w-4 h-4 mr-2" />
                                    Notifier
                                  </DropdownMenuItem>
                                )}
                                {activeStatusView === 'Facturé - A payer' && (
                                  <DropdownMenuItem onClick={() => markAsPaidRetrocessions([retrocession.id])}>
                                    <Euro className="w-4 h-4 mr-2" />
                                    Marquer payé
                                  </DropdownMenuItem>
                                )}
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
    </div>
  );
}
