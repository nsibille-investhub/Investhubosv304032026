import { useState, useEffect, useMemo } from 'react';
import { AppStoreProvider } from './utils/appStoreContext';
import { ThemeProvider } from './utils/themeContext';
import { useTranslation } from './utils/languageContext';
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Search, Bell, Settings, Menu, ChevronDown, Plus, Info, MoreVertical, ArrowLeft, ChevronLeft, ChevronRight, Download, FileSpreadsheet, History, ArchiveX, Users, Palette, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './components/ui/badge';
import { Switch } from './components/ui/switch';
import { Button } from './components/ui/button';
import { Toaster } from 'sonner@2.0.3';
import { toast } from 'sonner@2.0.3';
import { exportTableToCSV, exportAllAuditTrailsToCSV, exportContactsToCSV, exportPartnerContactsToCSV } from './utils/exportUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/ui/dropdown-menu";
import { ModernSidebar } from './components/ModernSidebar';
import { EntityCard } from './components/EntityCard';
import { DataTable } from './components/DataTable';
import { DecisionPanel } from './components/DecisionPanel';
import { TableSkeleton } from './components/TableSkeleton';
import { FilterBar } from './components/FilterBar';
import { StatusTabs } from './components/StatusTabs';
import { SubscriptionStatusTabs } from './components/SubscriptionStatusTabs';
import { InactiveSubscriptionTabs } from './components/InactiveSubscriptionTabs';
import { DataRoomPage } from './components/DataRoomPage';
import { BirdViewPage } from './components/BirdViewPage';
import { CompliancePlusPage } from './components/CompliancePlusPage';
import { SubscriptionsPage } from './components/SubscriptionsPage';
import { SubscriptionDetailPage } from './components/SubscriptionDetailPage';
import { EntitiesPage } from './components/EntitiesPage';
import { AlertsPage } from './components/AlertsPage';
import { TrackingPage } from './components/TrackingPage';
import { SearchDropdown } from './components/SearchDropdown';
import { SettingsDialog } from './components/SettingsDialog';
import { NewSubscriptionDialog } from './components/NewSubscriptionDialog';
import { generateEntityDetails } from './utils/mockData';
import { generateEntities } from './utils/entityGenerator';
import { generateSubscriptions } from './utils/subscriptionGenerator';
import { Subscription } from './utils/subscriptionGenerator';
import { generateAlerts, getAlertsStats } from './utils/alertsGenerator';
import { generateInvestors, Investor } from './utils/investorGenerator';
import { generatePartners, Partner } from './utils/partnerGenerator';
import { InvestorsPage } from './components/InvestorsPage';
import { PartnersPage } from './components/PartnersPage';
import { InvestorStatusTabs } from './components/InvestorStatusTabs';
import { InactiveInvestorTabs } from './components/InactiveInvestorTabs';
import { InvestorDetailPage } from './components/InvestorDetailPage';
import { EventsPage } from './components/EventsPage';
import { NewsPage } from './components/NewsPage';
import EcosystemPage from './components/EcosystemPage';
import { DesignSystemPage } from './components/DesignSystemPage';
import { WhatsNewPage } from './components/WhatsNewPage';
import { useWhatsNewUnread } from './utils/useWhatsNewUnread';
import { DataHubRouter } from './features/datahub/pages/DataHubRouter';
import { generateFunds, Fund } from './utils/fundGenerator';
import { AllFundsPage } from './components/AllFundsPage';
import { FundStatusTabs } from './components/FundStatusTabs';
import { RetrocessionsSettings } from './components/settings/RetrocessionsSettings';
// Settings imports
import { AppStore } from './components/settings/AppStore';
import { UsersSettings } from './components/settings/UsersSettings';
import { TeamsSettings } from './components/settings/TeamsSettings';
import { RightsSettings } from './components/settings/RightsSettings';
import { MailHistorySettings } from './components/settings/MailHistorySettings';
import { SmsHistorySettings } from './components/settings/SmsHistorySettings';
import { MailTemplatesSettings } from './components/settings/MailTemplatesSettings';
import { MailStatsSettings } from './components/settings/MailStatsSettings';
import { MailGroupsSettings } from './components/settings/MailGroupsSettings';
import { InvestorStatusSettings } from './components/settings/InvestorStatusSettings';
import { DealStatusSettings } from './components/settings/DealStatusSettings';
import { DealTypesSettings } from './components/settings/DealTypesSettings';
import { FlowTypesSettings } from './components/settings/FlowTypesSettings';
import { ManagementCompaniesSettings } from './components/settings/ManagementCompaniesSettings';
import { CustomFieldsSettings } from './components/settings/CustomFieldsSettings';
import { CustomStatusSettings } from './components/settings/CustomStatusSettings';
import { CountriesRisksSettings } from './components/settings/CountriesRisksSettings';
import { ProvidersSettings } from './components/settings/ProvidersSettings';
import { ChartOfAccountsSettings } from './components/settings/ChartOfAccountsSettings';
import { LogsSettings } from './components/settings/LogsSettings';
import { LemonwayLogsSettings } from './components/settings/LemonwayLogsSettings';
import { HarvestLogsSettings } from './components/settings/HarvestLogsSettings';
import { KnownIPsSettings } from './components/settings/KnownIPsSettings';
import { DocuSignSettings } from './components/settings/DocuSignSettings';
import { ControlsSettings } from './components/settings/ControlsSettings';
import { AICsSettings } from './components/settings/AICsSettings';
import { ImportsSettings } from './components/settings/ImportsSettings';
import { HostedFilesSettings } from './components/settings/HostedFilesSettings';
import { SectionCategoriesSettings } from './components/settings/SectionCategoriesSettings';
import { ReportingSettings } from './components/settings/ReportingSettings';
import { ReportsSettings } from './components/settings/ReportsSettings';
import { QueriesSettings } from './components/settings/QueriesSettings';
import { VariableFormattingSettings } from './components/settings/VariableFormattingSettings';
import { ToolsSettings } from './components/settings/ToolsSettings';
import { ConventionsSettings } from './components/settings/ConventionsSettings';

import { Page, getPageFromHash, navigateToPage, onHashChange } from './utils/routing';
import './utils/hashPreserver'; // Import to execute hash preservation logic

type StatusType = 'need_review' | 'reviewed' | 'all' | 'rejected' | 'archived' | 'deleted' | 'flagged' | 'created' | 'onboarding' | 'signature' | 'counter_signature' | 'active' | 'prospect' | 'en_discussion' | 'en_relation';

export default function App() {
  const { t } = useTranslation();
  const { hasUnread: whatsNewHasUnread } = useWhatsNewUnread();
  // Initialize from URL hash
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const page = getPageFromHash();
    console.log('[App] Initial page from URL:', page, '- Full URL:', window.location.href);
    
    // If we have a valid hash, preserve it
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      console.log('[App] Preserving initial hash:', hash);
    }
    
    return page;
  });
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeFilters, setActiveFilters] = useState<any[]>([]);
  const [activeStatus, setActiveStatus] = useState<StatusType>('all');
  const [activeFundStatus, setActiveFundStatus] = useState<string>('all');
  const [subscriptionViewMode, setSubscriptionViewMode] = useState<'active' | 'inactive'>('active');
  const [showEntitiesDescription, setShowEntitiesDescription] = useState(true);
  const [showSubscriptionsDescription, setShowSubscriptionsDescription] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [entitiesManagementEnabled, setEntitiesManagementEnabled] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [newSubscriptionDialogOpen, setNewSubscriptionDialogOpen] = useState(false);
  const [selectedSubscriptionDetail, setSelectedSubscriptionDetail] = useState<Subscription | null>(null);
  const [ecosystemPageOpen, setEcosystemPageOpen] = useState(false);
  const [selectedDataRoomSpace, setSelectedDataRoomSpace] = useState<any | null>(null);
  const [selectedFundContextId, setSelectedFundContextId] = useState<number | null>(null);
  
  // Debug: Log when selectedSubscriptionDetail changes
  useEffect(() => {
    console.log('App.tsx - selectedSubscriptionDetail changed:', selectedSubscriptionDetail);
  }, [selectedSubscriptionDetail]);

  // Générer 100 entités pour la démo - useState pour permettre les modifications
  // Only generate entities if entity management is enabled
  const [allTableData, setAllTableData] = useState<any[]>([]);
  
  // Générer 247 souscriptions pour la démo
  const [allSubscriptionsData, setAllSubscriptionsData] = useState(() => generateSubscriptions(247));

  // Générer 150 investisseurs pour la démo
  const [allInvestorsData, setAllInvestorsData] = useState(() => generateInvestors(150));

  // Générer 25 partenaires pour la démo
  const [allPartnersData, setAllPartnersData] = useState(() => generatePartners(25));

  // Générer 50 fonds pour la démo
  const [allFundsData, setAllFundsData] = useState(() => generateFunds(50));

  // Gérer le mode actif/inactif pour les investisseurs
  const [investorViewMode, setInvestorViewMode] = useState<'active' | 'inactive'>('active');

  // Filtrer les investisseurs par statuts actifs/inactifs
  const getActiveInvestorStatuses = () => ['Prospect', 'En discussion', 'En relation'];
  const getInactiveInvestorStatuses = () => ['Archivé'];

  // Gérer la sélection d'un investisseur pour la page de détail
  const [selectedInvestorDetail, setSelectedInvestorDetail] = useState<Investor | null>(null);
  const [investorDetailTab, setInvestorDetailTab] = useState<string>('profil');

  // Générer les alertes pour la démo
  const [allAlerts] = useState(() => generateAlerts(100));

  // Handler pour créer une nouvelle souscription
  const handleSubscriptionCreated = (newSubscription: any) => {
    setAllSubscriptionsData(prevData => [newSubscription, ...prevData]);
    toast.success(t('toast.subscriptionCreated'), {
      description: `${newSubscription.name} a été ajoutée au statut Draft`,
      duration: 5000
    });
  };

  // Filtrage basé sur le contexte du fonds sélectionné
  const contextFilteredSubscriptions = useMemo(() => {
    if (selectedFundContextId === null) {
      return allSubscriptionsData;
    }
    const selectedFund = allFundsData.find(f => f.id === selectedFundContextId);
    if (!selectedFund) return allSubscriptionsData;
    
    // Filtrer les souscriptions qui correspondent au fonds sélectionné
    return allSubscriptionsData.filter(sub => sub.fund === selectedFund.name);
  }, [allSubscriptionsData, selectedFundContextId, allFundsData]);

  const contextFilteredInvestors = useMemo(() => {
    if (selectedFundContextId === null) {
      return allInvestorsData;
    }
    const selectedFund = allFundsData.find(f => f.id === selectedFundContextId);
    if (!selectedFund) return allInvestorsData;
    
    // Filtrer les investisseurs qui ont des souscriptions dans ce fonds
    const investorIdsInFund = new Set(
      allSubscriptionsData
        .filter(sub => sub.fund === selectedFund.name)
        .map(sub => sub.investorName)
    );
    
    return allInvestorsData.filter(inv => investorIdsInFund.has(inv.name));
  }, [allInvestorsData, selectedFundContextId, allFundsData, allSubscriptionsData]);
  
  // Generate entities on mount
  useEffect(() => {
    if (allTableData.length === 0) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const generatedData = generateEntities(100);
        setAllTableData(generatedData);
        setIsLoading(false);
        toast.success(t('toast.dataLoaded'), {
          description: `${generatedData.length} entités chargées`,
        });
      }, 800);
    }
  }, []);

  // Ensure the hash is respected on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash !== '#') {
      const pageFromHash = getPageFromHash();
      console.log('[App] Mount - Ensuring hash is respected:', hash, '-> Page:', pageFromHash);
      if (currentPage !== pageFromHash) {
        setCurrentPage(pageFromHash);
      }
    }
  }, []); // Run only once on mount

  // Listen to hash changes (back/forward browser buttons)
  useEffect(() => {
    const cleanup = onHashChange(() => {
      const newPage = getPageFromHash();
      console.log('[App] Hash changed, setting page to:', newPage);
      setCurrentPage(newPage);
    });
    
    return cleanup;
  }, []);
  
  // Filtrer par statut actif
  const filteredByStatus = useMemo(() => {
    let filtered = [];
    switch (activeStatus) {
      case 'need_review':
        filtered = allTableData.filter(e => e.status === 'Pending' || e.status === 'New Hit');
        break;
      case 'reviewed':
        filtered = allTableData.filter(e => e.status === 'Clear' || e.status === 'True Hit');
        break;
      case 'rejected':
        filtered = allTableData.filter(e => e.secondaryStatus === 'rejected');
        break;
      case 'archived':
        filtered = allTableData.filter(e => e.secondaryStatus === 'archived');
        break;
      case 'deleted':
        filtered = allTableData.filter(e => e.secondaryStatus === 'deleted');
        break;
      case 'flagged':
        filtered = allTableData.filter(e => e.secondaryStatus === 'flagged');
        break;
      case 'all':
      default:
        filtered = allTableData;
    }
    
    // Appliquer le tri si un critère de tri est configuré
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Gestion spéciale pour la colonne lastUpdate
        if (sortConfig.key === 'lastUpdate') {
          aValue = a.lastUpdate.timestamp;
          bValue = b.lastUpdate.timestamp;
        }
        
        // Gestion des types différents
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filtered;
  }, [allTableData, activeStatus, sortConfig]);
  
  // Calculer la pagination
  const totalItems = filteredByStatus.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = filteredByStatus.slice(startIndex, endIndex);
  
  // Calculer le nombre de pending hits - mémorisé
  const pendingHitsCount = useMemo(() => 
    allTableData.filter(e => e.status === 'Pending').length, 
    [allTableData]
  );

  // Calculer le nombre d'alertes pending pour le badge (Membercheck + ORIAS uniquement)
  const pendingAlertsCount = useMemo(() => {
    const pending = allAlerts.filter(a => a.status === 'Pending');
    console.log('Total pending alerts:', pending.length);
    console.log('Pending by source:', {
      membercheck: pending.filter(a => a.source === 'Membercheck').length,
      orias: pending.filter(a => a.source === 'ORIAS').length
    });
    return pending.length;
  }, [allAlerts]);

  // Simulate loading - réinitialiser lors du changement de page
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      let description = 'Données chargées';
      if (currentPage === 'subscriptions') {
        description = `${allSubscriptionsData.length} souscriptions trouvées`;
        toast.success(t('toast.dataLoaded'), {
          description,
        });
      } else if (currentPage === 'entities') {
        description = `${allTableData.length} entités trouvées`;
        toast.success(t('toast.dataLoaded'), {
          description,
        });
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [currentPage, allSubscriptionsData.length, allTableData.length]);

  const handleRowClick = (row: any) => {
    setSelectedEntity(row);
    toast.info(t('toast.entityDetails'), {
      description: `Ouverture des détails pour ${row.name}`,
    });
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    toast.success(t('toast.sortApplied'), {
      description: `Tri par ${key} (${direction === 'asc' ? 'croissant' : 'décroissant'})`,
    });
  };

  const handleFilterChange = (filters: any[]) => {
    setActiveFilters(filters);
  };

  const handleStatusChange = (status: StatusType) => {
    // Animation de transition
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
    
    // Calculer le nombre d'entités pour ce statut
    let count = 0;
    switch (status) {
      case 'need_review':
        count = allTableData.filter(e => e.status === 'Pending' || e.status === 'New Hit').length;
        break;
      case 'reviewed':
        count = allTableData.filter(e => e.status === 'Clear' || e.status === 'True Hit').length;
        break;
      case 'rejected':
        count = allTableData.filter(e => e.secondaryStatus === 'rejected').length;
        break;
      case 'archived':
        count = allTableData.filter(e => e.secondaryStatus === 'archived').length;
        break;
      case 'deleted':
        count = allTableData.filter(e => e.secondaryStatus === 'deleted').length;
        break;
      case 'flagged':
        count = allTableData.filter(e => e.secondaryStatus === 'flagged').length;
        break;
      case 'all':
      default:
        count = allTableData.length;
    }
    
    setActiveStatus(status);
    setPaginationPage(1); // Reset to first page
    setSelectedEntity(null); // Close detail panel
    
    const statusLabels: Record<StatusType, string> = {
      'need_review': 'Need Review',
      'reviewed': 'Reviewed',
      'all': 'All Entities',
      'rejected': 'Rejected',
      'archived': 'Archived',
      'deleted': 'Deleted',
      'flagged': 'Flagged'
    };
    
    toast.info(t('toast.activeFilter', { label: statusLabels[status] }), {
      description: `${count} entités affichées`,
    });
  };

  const handleExportTable = () => {
    exportTableToCSV(allTableData);
    toast.success(t('toast.tableExported'), {
      description: `${totalItems} entités exportées en CSV`,
    });
  };

  const handleExportAllAudits = () => {
    exportAllAuditTrailsToCSV(allTableData);
    toast.success(t('toast.auditTrailsExported'), {
      description: 'Toutes les pistes d\'audit ont été exportées',
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationPage(page);
      setSelectedEntity(null);
      toast.info(t('toast.pageChanged'), {
        description: `Page ${page} sur ${totalPages}`,
      });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
    toast.success(t('toast.displayUpdated'), {
      description: `${newItemsPerPage} items par page`,
    });
  };

  const handleMonitoringChange = (entityId: number, newMonitoringState: boolean) => {
    setAllTableData(prevData => 
      prevData.map(entity => 
        entity.id === entityId 
          ? { ...entity, monitoring: newMonitoringState }
          : entity
      )
    );
    
    // Mettre à jour l'entité sélectionnée si c'est celle qui a changé
    if (selectedEntity && selectedEntity.id === entityId) {
      setSelectedEntity({ ...selectedEntity, monitoring: newMonitoringState });
    }
    
    toast.success(newMonitoringState ? t('toast.monitoringEnabled') : t('toast.monitoringDisabled'), {
      description: `pour ${allTableData.find(e => e.id === entityId)?.name}`,
    });
  };

  const handleAnalystChange = (entityId: number, newAnalyst: string) => {
    setAllTableData(prevData => 
      prevData.map(entity => 
        entity.id === entityId 
          ? { ...entity, analyst: newAnalyst }
          : entity
      )
    );
    
    // Mettre à jour l'entité sélectionnée si c'est celle qui a changé
    if (selectedEntity && selectedEntity.id === entityId) {
      setSelectedEntity({ ...selectedEntity, analyst: newAnalyst });
    }
    
    toast.success(t('toast.analystUpdated'), {
      description: `${newAnalyst} assigned to ${allTableData.find(e => e.id === entityId)?.name}`,
    });
  };

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages avec ...
      if (paginationPage <= 3) {
        // Début
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (paginationPage >= totalPages - 2) {
        // Fin
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu
        pages.push(1);
        pages.push('...');
        for (let i = paginationPage - 1; i <= paginationPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <ThemeProvider>
      <AppStoreProvider>
        <TooltipProvider delayDuration={200}>
          <div className="min-h-screen bg-background flex">
          <Toaster position="top-right" richColors />
        
        {/* Sidebar */}
        <ModernSidebar 
          expanded={sidebarExpanded} 
          onToggle={() => setSidebarExpanded(!sidebarExpanded)}
          currentPage={currentPage}
          onPageChange={(page) => {
            console.log('[App] onPageChange called with page:', page);
            // Only update URL - the hashchange listener will update the state
            navigateToPage(page);
            setActiveStatus('all'); // Réinitialiser le filtre de statut
            setSelectedEntity(null); // Fermer le panneau de détails
            setPaginationPage(1); // Réinitialiser la pagination
          }}
          entitiesManagementEnabled={entitiesManagementEnabled}
          pendingAlertsCount={pendingAlertsCount}
          onOpenEcosystem={() => setEcosystemPageOpen(true)}
          selectedFundId={selectedFundContextId}
          onSelectFund={setSelectedFundContextId}
          allFunds={allFundsData}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Header */}
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-black/95"
          >
            <div className="flex items-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              
              <SearchDropdown />
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage('whats-new')}
                className="relative inline-flex items-center gap-2 border-[#D2DDD9] text-[#2F4D51] hover:text-[#1F3137] bg-white"
              >
                <Sparkles className="w-4 h-4" />
                {t('header.whatsNew')}
                {whatsNewHasUnread && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0066FF] rounded-full ring-2 ring-white"
                    aria-label={t('header.whatsNewUnread')}
                  />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateToPage('design-system')}
                className="inline-flex items-center gap-2 border-[#D2DDD9] text-[#2F4D51] hover:text-[#1F3137] bg-white"
              >
                <Palette className="w-4 h-4" />
                {t('header.designSystem')}
              </Button>
              <ThemeToggle />

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: -15 }}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300 relative group"
                  >
                    <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>{t('header.notifications', { count: 11 })}</TooltipContent>
              </Tooltip>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#0066FF] to-[#00C2FF] rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Jean Dault</span>
              </motion.div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95, rotate: 90 }}
                    onClick={() => navigateToPage('settings-app-store')}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 relative group"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>{t('header.appStore')}</TooltipContent>
              </Tooltip>

              <LanguageSwitcher />
            </div>
          </motion.header>

          {/* Breadcrumb (the datahub module renders its own PageHeader with breadcrumb) */}
          {currentPage !== 'datahub' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-black/60 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 text-sm">
              <motion.button 
                whileHover={{ x: -2 }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.button>
              <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.investhubOs')}</span>
              <span className="text-gray-300 dark:text-gray-700">/</span>
              {currentPage === 'entities' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.compliance')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.entities')}</span>
                </>
              ) : currentPage === 'investors' ? (
                <>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.investors')}</span>
                </>
              ) : currentPage === 'partners' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.partners')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.partners')}</span>
                </>
              ) : currentPage === 'retrocessions' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.partners')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.retrocessions')}</span>
                </>
              ) : currentPage === 'allfunds' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.fundLife')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.allFunds')}</span>
                </>
              ) : currentPage === 'subscriptions' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.investors')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  {selectedSubscriptionDetail ? (
                    <>
                      <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.subscriptions')}</span>
                      <span className="text-gray-300 dark:text-gray-700">/</span>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                        FutureInvest Fund
                      </Badge>
                      <span className="text-gray-300 dark:text-gray-700">/</span>
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200 font-medium">
                        Part A
                      </Badge>
                      <span className="text-gray-300 dark:text-gray-700">/</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.subscriptionDetail')}</span>
                    </>
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.subscriptions')}</span>
                  )}
                </>
              ) : currentPage === 'dossiers' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.compliance')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.dossiers')}</span>
                </>
              ) : currentPage === 'monitoring' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.compliance')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.alerts')}</span>
                </>
              ) : currentPage === 'tracking' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.dataRoom')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.tracking')}</span>
                </>
              ) : currentPage === 'birdview' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.dataRoom')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.birdView')}</span>
                </>
              ) : currentPage === 'events' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.portalsAndContent')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.events')}</span>
                </>
              ) : currentPage === 'news' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.portalsAndContent')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.news')}</span>
                </>
              ) : currentPage === 'design-system' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.portalsAndContent')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.designSystem')}</span>
                </>
              ) : currentPage === 'whats-new' ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.investhubOs')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.whatsNew')}</span>
                </>
              ) : currentPage?.startsWith('settings-') ? (
                <>
                  <span className="text-gray-400">{t('breadcrumb.administration')}</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-900 font-medium">
                    {currentPage === 'settings-app-store' ? t('sidebar.submenu.appStore') :
                     currentPage === 'settings-users' ? t('sidebar.submenu.users') :
                     currentPage === 'settings-teams' ? t('sidebar.submenu.teams') :
                     currentPage === 'settings-rights' ? t('sidebar.submenu.rights') :
                     currentPage === 'settings-mail-history' ? t('sidebar.submenu.mailHistory') :
                     currentPage === 'settings-sms-history' ? t('sidebar.submenu.smsHistory') :
                     currentPage === 'settings-mail-templates' ? t('sidebar.submenu.mailTemplates') :
                     currentPage === 'settings-mail-stats' ? t('sidebar.submenu.mailStats') :
                     currentPage === 'settings-mail-groups' ? t('sidebar.submenu.mailGroups') :
                     currentPage === 'settings-investor-status' ? t('sidebar.submenu.investorStatus') :
                     currentPage === 'settings-deal-status' ? t('sidebar.submenu.dealStatus') :
                     currentPage === 'settings-deal-types' ? t('sidebar.submenu.dealTypes') :
                     currentPage === 'settings-flow-types' ? t('sidebar.submenu.flowTypes') :
                     currentPage === 'settings-management-companies' ? t('sidebar.submenu.managementCompanies') :
                     currentPage === 'settings-custom-fields' ? t('sidebar.submenu.customFields') :
                     currentPage === 'settings-custom-status' ? t('sidebar.submenu.customStatus') :
                     currentPage === 'settings-countries-risks' ? t('sidebar.submenu.countriesRisks') :
                     currentPage === 'settings-providers' ? t('sidebar.submenu.providers') :
                     currentPage === 'settings-chart-of-accounts' ? t('sidebar.submenu.chartOfAccounts') :
                     currentPage === 'settings-logs' ? t('sidebar.submenu.logs') :
                     currentPage === 'settings-logs-lemonway' ? t('sidebar.submenu.logsLemonway') :
                     currentPage === 'settings-logs-harvest' ? t('sidebar.submenu.logsHarvest') :
                     currentPage === 'settings-known-ips' ? t('sidebar.submenu.knownIps') :
                     currentPage === 'settings-docusign' ? t('sidebar.submenu.docusign') :
                     currentPage === 'settings-controls' ? t('sidebar.submenu.controls') :
                     currentPage === 'settings-aics' ? t('sidebar.submenu.aics') :
                     currentPage === 'settings-imports' ? t('sidebar.submenu.imports') :
                     currentPage === 'settings-hosted-files' ? t('sidebar.submenu.hostedFiles') :
                     currentPage === 'settings-section-categories' ? t('sidebar.submenu.sectionCategories') :
                     currentPage === 'settings-reporting' ? t('sidebar.submenu.reporting') :
                     currentPage === 'settings-reports' ? t('sidebar.submenu.reports') :
                     currentPage === 'settings-queries' ? t('sidebar.submenu.queries') :
                     currentPage === 'settings-variable-formatting' ? t('sidebar.submenu.variableFormatting') :
                     currentPage === 'settings-tools' ? t('sidebar.submenu.tools') :
                     t('breadcrumb.settings')}
                  </span>
                </>
              ) : selectedDataRoomSpace ? (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.dataRoom')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{selectedDataRoomSpace.name}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-400 dark:text-gray-500">{t('breadcrumb.dataRoom')}</span>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{t('breadcrumb.spaces')}</span>
                </>
              )}
            </div>
          </motion.div>
          )}

          {/* Page Header - Subscriptions */}
          {currentPage === 'subscriptions' && !selectedSubscriptionDetail && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
              className="px-6 py-5 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                {/* Left Section - Title & Yousign Badge */}
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                      {subscriptionViewMode === 'active' ? 'Souscriptions' : 'Souscriptions Inactives'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subscriptionViewMode === 'active' 
                        ? 'Gérer et suivre toutes les souscriptions' 
                        : 'Consultez les souscriptions terminées et archivées'}
                    </p>
                  </motion.div>
                </div>

                {/* Right Section - Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3"
                >
                  {subscriptionViewMode === 'inactive' && (
                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setSubscriptionViewMode('active');
                          setActiveStatus('all');
                          toast.info(t('toast.backToActiveSubscriptions'));
                        }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux souscriptions
                      </Button>
                    </motion.div>
                  )}
                  
                  {subscriptionViewMode === 'active' && (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            onClick={() => setNewSubscriptionDialogOpen(true)}
                            style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                            className="gap-2 hover:opacity-90 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group relative overflow-hidden text-white"
                          >
                            {/* Shimmer effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              animate={{
                                x: ['-100%', '100%']
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                                repeatDelay: 1
                              }}
                            />
                            
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-semibold relative z-10">Nouvelle Souscription</span>
                          </Button>
                        </motion.div>
                      </motion.div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSubscriptionViewMode('inactive');
                              setActiveStatus('all');
                              toast.info(t('toast.viewInactiveSubscriptions'), {
                                description: `${allSubscriptionsData.filter(s => ['Rejected', 'Cancelled', 'Expired', 'Archived'].includes(s.status)).length} souscriptions inactives`
                              });
                            }}
                            className="cursor-pointer"
                          >
                            <ArchiveX className="w-4 h-4 mr-2 text-red-600" />
                            <span>Inactives</span>
                            <Badge className="ml-2 bg-red-100 text-red-700 border-red-300">
                              {allSubscriptionsData.filter(s => ['Rejected', 'Cancelled', 'Expired', 'Archived'].includes(s.status)).length}
                            </Badge>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Page Header - Investors */}
          {currentPage === 'investors' && !selectedInvestorDetail && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
              className="px-6 py-5 bg-white border-b border-gray-100"
            >
              <div className="flex items-center justify-between">
                {/* Left Section - Title */}
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                      {investorViewMode === 'active' ? 'Investisseurs' : 'Investisseurs Archivés'}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {investorViewMode === 'active' 
                        ? 'Gérer et suivre tous les investisseurs' 
                        : 'Consultez les investisseurs archivés'}
                    </p>
                  </motion.div>
                </div>

                {/* Right Section - Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3"
                >
                  {investorViewMode === 'inactive' && (
                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setInvestorViewMode('active');
                          setActiveStatus('all');
                          toast.info(t('toast.backToActiveInvestors'));
                        }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux investisseurs
                      </Button>
                    </motion.div>
                  )}
                  
                  {investorViewMode === 'active' && (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          onClick={() => toast.success(t('toast.comingSoon'))}
                          style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                          className="gap-2 hover:opacity-90 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group relative overflow-hidden text-white"
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{
                              x: ['-100%', '100%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                              repeatDelay: 1
                            }}
                          />
                          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                          <span className="font-semibold relative z-10">Nouvel Investisseur</span>
                        </Button>
                      </motion.div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setInvestorViewMode('inactive');
                              setActiveStatus('all');
                              toast.info(t('toast.viewArchivedInvestors'), {
                                description: `${allInvestorsData.filter(i => getInactiveInvestorStatuses().includes(i.status)).length} investisseurs archivés`
                              });
                            }}
                            className="cursor-pointer"
                          >
                            <ArchiveX className="w-4 h-4 mr-2 text-gray-600" />
                            <span>Archivés</span>
                            <Badge className="ml-2 bg-gray-100 text-gray-700 border-gray-300">
                              {allInvestorsData.filter(i => getInactiveInvestorStatuses().includes(i.status)).length}
                            </Badge>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              exportTableToCSV(allInvestorsData, 'investisseurs');
                              toast.success(t('toast.exportCsv'), {
                                description: 'Les données ont été exportées en CSV'
                              });
                            }}
                            className="cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                            <span>Télécharger .csv</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast.info(t('toast.exportXlsx'), {
                                description: 'Fonctionnalité à venir'
                              });
                            }}
                            className="cursor-pointer"
                          >
                            <Download className="w-4 h-4 mr-2 text-blue-600" />
                            <span>Télécharger .xlsx</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const totalContacts = allInvestorsData.reduce((sum, inv) => sum + (inv.contacts?.length || 0), 0);
                              exportContactsToCSV(allInvestorsData);
                              toast.success(t('toast.contactsExported'), {
                                description: `${totalContacts} contacts exportés en CSV`
                              });
                            }}
                            className="cursor-pointer"
                          >
                            <Users className="w-4 h-4 mr-2 text-purple-600" />
                            <span>Exporter contacts .csv</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Content based on current page */}
          {currentPage === 'entities' && (
            <EntitiesPage />
          )}
          
          {currentPage === 'subscriptions' && !selectedSubscriptionDetail && (
            /* Subscriptions Page */
            <>
              {/* Status Tabs for Subscriptions - different depending on mode */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-6 pt-6"
              >
                {subscriptionViewMode === 'active' ? (
                  <SubscriptionStatusTabs 
                    data={allSubscriptionsData.filter(s => ['Draft', 'Onboarding', 'À signer', 'Investisseur signé', 'Exécuté', 'En attente de fonds', 'Active'].includes(s.status))} 
                    activeStatus={activeStatus}
                    onStatusChange={(status) => {
                      setActiveStatus(status as any);
                      setPaginationPage(1);
                      setSelectedEntity(null);
                    }}
                  />
                ) : (
                  <InactiveSubscriptionTabs
                    data={allSubscriptionsData.filter(s => ['Rejected', 'Cancelled', 'Expired', 'Archived'].includes(s.status))}
                    activeStatus={activeStatus}
                    onStatusChange={(status) => {
                      setActiveStatus(status as any);
                      setPaginationPage(1);
                      setSelectedEntity(null);
                    }}
                  />
                )}
              </motion.div>

              {/* Subscriptions Table Section */}
              <div className="flex-1 px-6 pt-2 pb-6">
                <SubscriptionsPage 
                  data={contextFilteredSubscriptions.filter(s => {
                    // Filtrer par mode actif/inactif
                    const activeStatuses = ['Draft', 'Onboarding', 'À signer', 'Investisseur signé', 'Exécuté', 'En attente de fonds', 'Active'];
                    const inactiveStatuses = ['Rejected', 'Cancelled', 'Expired', 'Archived'];
                    const modeFilter = subscriptionViewMode === 'active' 
                      ? activeStatuses.includes(s.status)
                      : inactiveStatuses.includes(s.status);
                    
                    if (!modeFilter) return false;
                    
                    // Filtrer par statut sélectionné
                    if (activeStatus === 'all') return true;
                    
                    if (subscriptionViewMode === 'active') {
                      switch (activeStatus) {
                        case 'created':
                          return s.status === 'Draft';
                        case 'onboarding':
                          return s.status === 'Onboarding';
                        case 'signature':
                          return s.status === 'À signer';
                        case 'counter_signature':
                          return s.status === 'Investisseur signé';
                        case 'active':
                          return ['Exécuté', 'En attente de fonds', 'Active'].includes(s.status);
                        default:
                          return true;
                      }
                    } else {
                      // Mode inactive
                      const statusMap: { [key: string]: string } = {
                        'rejected': 'Rejected',
                        'cancelled': 'Cancelled',
                        'expired': 'Expired',
                        'archived': 'Archived'
                      };
                      return statusMap[activeStatus] ? s.status === statusMap[activeStatus] : true;
                    }
                  })} 
                  isLoading={isLoading}
                  allData={contextFilteredSubscriptions}
                  setAllData={setAllSubscriptionsData}
                  activeStatus={activeStatus as any}
                  onSubscriptionClick={(subscription) => {
                    console.log('App.tsx - onSubscriptionClick called with:', subscription);
                    console.log('App.tsx - currentPage:', currentPage);
                    setSelectedSubscriptionDetail(subscription);
                    console.log('App.tsx - selectedSubscriptionDetail set to:', subscription);
                    toast.info(t('toast.subscriptionDetails'), {
                      description: `Ouverture des détails pour ${subscription.name}`,
                    });
                  }}
                />
              </div>
            </>
          )}

          {currentPage === 'subscriptions' && selectedSubscriptionDetail && (
            /* Subscription Detail Page */
            (() => {
              console.log('App.tsx - Rendering SubscriptionDetailPage');
              console.log('App.tsx - selectedSubscriptionDetail:', selectedSubscriptionDetail);
              return (
                <div className="flex-1">
                  <SubscriptionDetailPage
                    subscription={selectedSubscriptionDetail}
                    onBack={() => {
                      console.log('App.tsx - onBack called');
                      setSelectedSubscriptionDetail(null);
                      toast.info(t('toast.backToSubscriptions'));
                    }}
                  />
                </div>
              );
            })()
          )}
          
          {currentPage === 'investors' && !selectedInvestorDetail && (
            /* Investors Page */
            <>
              {/* Status Tabs for Investors - different depending on mode */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-6 pt-6"
              >
                {investorViewMode === 'active' ? (
                  <InvestorStatusTabs 
                    data={allInvestorsData.filter(i => getActiveInvestorStatuses().includes(i.status))} 
                    activeStatus={activeStatus}
                    onStatusChange={(status) => {
                      setActiveStatus(status as any);
                      setPaginationPage(1);
                      setSelectedEntity(null);
                    }}
                  />
                ) : (
                  <InactiveInvestorTabs
                    data={allInvestorsData.filter(i => getInactiveInvestorStatuses().includes(i.status))}
                    activeStatus={activeStatus}
                    onStatusChange={(status) => {
                      setActiveStatus(status as any);
                      setPaginationPage(1);
                      setSelectedEntity(null);
                    }}
                  />
                )}
              </motion.div>

              {/* Investors Table Section */}
              <div className="flex-1 px-6 pt-2 pb-6">
                <InvestorsPage 
                  data={contextFilteredInvestors.filter(i => {
                    // Filtrer par mode actif/inactif
                    const activeStatuses = getActiveInvestorStatuses();
                    const inactiveStatuses = getInactiveInvestorStatuses();
                    const modeFilter = investorViewMode === 'active' 
                      ? activeStatuses.includes(i.status)
                      : inactiveStatuses.includes(i.status);
                    
                    if (!modeFilter) return false;
                    
                    // Filtrer par statut sélectionné
                    if (activeStatus === 'all') return true;
                    
                    if (investorViewMode === 'active') {
                      switch (activeStatus) {
                        case 'prospect':
                          return i.status === 'Prospect';
                        case 'en_discussion':
                          return i.status === 'En discussion';
                        case 'en_relation':
                          return i.status === 'En relation';
                        default:
                          return true;
                      }
                    } else {
                      // Mode inactive
                      return activeStatus === 'archived' ? i.status === 'Archivé' : true;
                    }
                  })} 
                  isLoading={isLoading}
                  allData={contextFilteredInvestors}
                  setAllData={setAllInvestorsData}
                  onInvestorClick={(investor, tab) => {
                    console.log('App.tsx - onInvestorClick called with:', investor, 'tab:', tab);
                    console.log('App.tsx - currentPage:', currentPage);
                    setSelectedInvestorDetail(investor);
                    setInvestorDetailTab(tab || 'profil');
                    console.log('App.tsx - selectedInvestorDetail set to:', investor);
                    toast.info(t('toast.investorDetails'), {
                      description: `Ouverture des détails pour ${investor.name}`,
                    });
                  }}
                />
              </div>
            </>
          )}

          {currentPage === 'investors' && selectedInvestorDetail && (
            /* Investor Detail Page */
            <div className="flex-1">
              <InvestorDetailPage
                investor={selectedInvestorDetail}
                initialTab={investorDetailTab}
                onBack={() => {
                  console.log('App.tsx - onBack called for investor');
                  setSelectedInvestorDetail(null);
                  setInvestorDetailTab('profil');
                  toast.info(t('toast.backToInvestors'));
                }}
              />
            </div>
          )}

          {currentPage === 'allfunds' && (
            /* All Funds Page */
            <>
              {/* Page Header - All Funds */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
                className="px-6 py-5 bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Title */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        Tous les fonds
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Gérer et suivre tous vos fonds d'investissement
                      </p>
                    </motion.div>
                  </div>

                  {/* Right Section - Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        onClick={() => toast.success(t('toast.comingSoon'))}
                        style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                        className="gap-2 hover:opacity-90 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group relative overflow-hidden text-white"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatDelay: 1
                          }}
                        />
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-semibold relative z-10">Nouveau Fonds</span>
                      </Button>
                    </motion.div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const archivedCount = allFundsData.filter(f => f.status === 'Clôturé').length;
                            toast.info(t('toast.comingSoon'), {
                              description: `${archivedCount} fonds clôturés`
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <ArchiveX className="w-4 h-4 mr-2 text-gray-600" />
                          <span>Fonds archivés</span>
                          <Badge className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700">
                            {allFundsData.filter(f => f.status === 'Clôturé').length}
                          </Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            exportTableToCSV(allFundsData, 'fonds');
                            toast.success(t('toast.exportCsv'), {
                              description: 'Les données ont été exportées en CSV'
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                          <span>Télécharger .csv</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            toast.info(t('toast.exportXlsx'), {
                              description: 'Fonctionnalité à venir'
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <Download className="w-4 h-4 mr-2 text-blue-600" />
                          <span>Télécharger .xlsx</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                </div>
              </motion.div>

              {/* Fund Status Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-6 pt-6"
              >
                <FundStatusTabs 
                  data={allFundsData} 
                  activeStatus={activeFundStatus}
                  onStatusChange={(status) => {
                    setActiveFundStatus(status);
                    setPaginationPage(1);
                  }}
                />
              </motion.div>

              {/* Funds Table Section */}
              <div className="flex-1 px-6 pt-4 pb-6">
                <AllFundsPage
                  data={allFundsData.filter(fund => {
                    // Filtrer par statut sélectionné
                    if (activeFundStatus === 'all') return true;
                    
                    if (activeFundStatus === 'collecte') {
                      return fund.status === 'En collecte';
                    } else if (activeFundStatus === 'investissement') {
                      return fund.status === 'Actif';
                    } else if (activeFundStatus === 'distribution') {
                      return fund.dpi > 1.0;
                    } else if (activeFundStatus === 'cloture') {
                      return fund.status === 'Clôturé';
                    }
                    
                    return true;
                  })}
                  isLoading={false}
                  allData={allFundsData}
                  setAllData={setAllFundsData}
                  onFundClick={(fund) => {
                    toast.info(t('toast.fundDetails'), {
                      description: `Ouverture des détails pour ${fund.name}`,
                    });
                  }}
                />
              </div>
            </>
          )}

          {currentPage === 'retrocessions' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <RetrocessionsSettings />
            </div>
          )}

          {currentPage === 'partners' && (
            /* Partners Page */
            <>
              {/* Page Header - Partners */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
                className="px-6 py-5 bg-white border-b border-gray-100"
              >
                <div className="flex items-center justify-between">
                  {/* Left Section - Title */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Partenaires
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        Gérer et suivre tous vos partenaires de distribution
                      </p>
                    </motion.div>
                  </div>

                  {/* Right Section - Action Buttons */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center gap-3"
                  >
                    <motion.div
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        onClick={() => toast.success(t('toast.comingSoon'))}
                        style={{ background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)' }}
                        className="gap-2 hover:opacity-90 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 group relative overflow-hidden text-white"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '100%']
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                            repeatDelay: 1
                          }}
                        />
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        <span className="font-semibold relative z-10">Nouveau Partenaire</span>
                      </Button>
                    </motion.div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const archivedCount = allPartnersData.filter(p => p.status === 'Archivé').length;
                            toast.info(t('toast.comingSoon'), {
                              description: `${archivedCount} partenaires archivés`
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <ArchiveX className="w-4 h-4 mr-2 text-gray-600" />
                          <span>Archivés</span>
                          <Badge className="ml-2 bg-gray-100 text-gray-700 border-gray-300">
                            {allPartnersData.filter(p => p.status === 'Archivé').length}
                          </Badge>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            exportTableToCSV(allPartnersData, 'partenaires');
                            toast.success(t('toast.exportCsv'), {
                              description: 'Les données ont été exportées en CSV'
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
                          <span>Télécharger .csv</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            toast.info(t('toast.exportXlsx'), {
                              description: 'Fonctionnalité à venir'
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <Download className="w-4 h-4 mr-2 text-blue-600" />
                          <span>Télécharger .xlsx</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const totalAdvisors = allPartnersData.reduce((sum, partner) => sum + (partner.contacts?.length || 0), 0);
                            exportPartnerContactsToCSV(allPartnersData);
                            toast.success(t('toast.advisorsExported'), {
                              description: `${totalAdvisors} conseillers exportés en CSV`
                            });
                          }}
                          className="cursor-pointer"
                        >
                          <Users className="w-4 h-4 mr-2 text-purple-600" />
                          <span>Exporter conseillers .csv</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                </div>
              </motion.div>

              {/* Partners Table */}
              <div className="flex-1 px-6 pt-4 pb-6">
                <PartnersPage 
                  data={allPartnersData}
                  isLoading={false}
                  allData={allPartnersData}
                  setAllData={setAllPartnersData}
                  onPartnerClick={(partner) => {
                    toast.info(t('toast.partnerDetails'), {
                      description: `Ouverture des détails pour ${partner.name}`,
                    });
                  }}
                />
              </div>
            </>
          )}
          
          {currentPage === 'dossiers' && (
            <CompliancePlusPage 
              onEnableModule={() => {
                setEntitiesManagementEnabled(true);
                toast.success(t('toast.moduleActivated'), {
                  description: 'Le module Compliance+ est maintenant actif'
                });
              }}
            />
          )}
          
          {currentPage === 'monitoring' && (
            <AlertsPage 
              alerts={allAlerts}
              entitiesManagementEnabled={entitiesManagementEnabled}
              onEnableModule={() => {
                setEntitiesManagementEnabled(true);
                toast.success(t('toast.moduleActivated'), {
                  description: 'Le module de filtrage LCB-FT est maintenant actif'
                });
              }}
            />
          )}
          
          {currentPage === 'documents' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <DataRoomPage onSpaceChange={(space) => setSelectedDataRoomSpace(space)} />
            </div>
          )}
          
          {currentPage === 'tracking' && (
            <TrackingPage 
              trackingEnabled={trackingEnabled}
              onEnableModule={() => {
                setTrackingEnabled(true);
                toast.success(t('toast.moduleActivated'), {
                  description: 'Le module Tracking de la Data Room est maintenant actif'
                });
              }}
            />
          )}

          {currentPage === 'birdview' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <BirdViewPage onBack={() => setCurrentPage('documents')} />
            </div>
          )}
          
          {currentPage === 'events' && (
            <div className="flex-1 px-6 pb-6">
              <EventsPage />
            </div>
          )}
          
          {currentPage === 'news' && (
            <div className="flex-1 px-6 pb-6">
              <NewsPage />
            </div>
          )}

          {currentPage === 'design-system' && (
            <DesignSystemPage />
          )}

          {currentPage === 'whats-new' && (
            <WhatsNewPage />
          )}

          {currentPage === 'datahub' && (
            <DataHubRouter />
          )}
          
          {/* Settings Pages */}
          {currentPage === 'settings-app-store' && (
            <div className="flex-1 px-6 pb-6">
              <AppStore />
            </div>
          )}
          {currentPage === 'settings-users' && (
            <div className="flex-1 px-6 pb-6">
              <UsersSettings />
            </div>
          )}
          {currentPage === 'settings-teams' && (
            <div className="flex-1 px-6 pb-6">
              <TeamsSettings />
            </div>
          )}
          {currentPage === 'settings-rights' && (
            <div className="flex-1 px-6 pb-6">
              <RightsSettings />
            </div>
          )}
          {currentPage === 'settings-mail-history' && (
            <div className="flex-1 px-6 pb-6">
              <MailHistorySettings />
            </div>
          )}
          {currentPage === 'settings-sms-history' && (
            <div className="flex-1 px-6 pb-6">
              <SmsHistorySettings />
            </div>
          )}
          {currentPage === 'settings-mail-templates' && (
            <div className="flex-1 px-6 pb-6">
              <MailTemplatesSettings />
            </div>
          )}
          {currentPage === 'settings-mail-stats' && (
            <div className="flex-1 px-6 pb-6">
              <MailStatsSettings />
            </div>
          )}
          {currentPage === 'settings-mail-groups' && (
            <div className="flex-1 px-6 pb-6">
              <MailGroupsSettings />
            </div>
          )}
          {currentPage === 'settings-investor-status' && (
            <div className="flex-1 px-6 pb-6">
              <InvestorStatusSettings />
            </div>
          )}
          {currentPage === 'settings-deal-status' && (
            <div className="flex-1 px-6 pb-6">
              <DealStatusSettings />
            </div>
          )}
          {currentPage === 'settings-deal-types' && (
            <div className="flex-1 px-6 pb-6">
              <DealTypesSettings />
            </div>
          )}
          {currentPage === 'settings-flow-types' && (
            <div className="flex-1 px-6 pb-6">
              <FlowTypesSettings />
            </div>
          )}
          {currentPage === 'settings-management-companies' && (
            <div className="flex-1 px-6 pb-6">
              <ManagementCompaniesSettings />
            </div>
          )}
          {currentPage === 'settings-custom-fields' && (
            <div className="flex-1 px-6 pb-6">
              <CustomFieldsSettings />
            </div>
          )}
          {currentPage === 'settings-custom-status' && (
            <div className="flex-1 px-6 pb-6">
              <CustomStatusSettings />
            </div>
          )}
          {currentPage === 'settings-countries-risks' && (
            <div className="flex-1 px-6 pb-6">
              <CountriesRisksSettings />
            </div>
          )}
          {currentPage === 'settings-providers' && (
            <div className="flex-1 px-6 pb-6">
              <ProvidersSettings />
            </div>
          )}
          {currentPage === 'settings-chart-of-accounts' && (
            <div className="flex-1 px-6 pb-6">
              <ChartOfAccountsSettings />
            </div>
          )}
          {currentPage === 'settings-logs' && (
            <div className="flex-1 px-6 pb-6">
              <LogsSettings />
            </div>
          )}
          {currentPage === 'settings-logs-lemonway' && (
            <div className="flex-1 px-6 pb-6">
              <LemonwayLogsSettings />
            </div>
          )}
          {currentPage === 'settings-logs-harvest' && (
            <div className="flex-1 px-6 pb-6">
              <HarvestLogsSettings />
            </div>
          )}
          {currentPage === 'settings-known-ips' && (
            <div className="flex-1 px-6 pb-6">
              <KnownIPsSettings />
            </div>
          )}
          {currentPage === 'settings-docusign' && (
            <div className="flex-1">
              <DocuSignSettings />
            </div>
          )}
          {currentPage === 'settings-controls' && (
            <div className="flex-1 px-6 pb-6">
              <ControlsSettings />
            </div>
          )}
          {currentPage === 'settings-aics' && (
            <div className="flex-1 px-6 pb-6">
              <AICsSettings />
            </div>
          )}
          {currentPage === 'settings-imports' && (
            <div className="flex-1 px-6 pb-6">
              <ImportsSettings />
            </div>
          )}
          {currentPage === 'settings-hosted-files' && (
            <div className="flex-1 px-6 pb-6">
              <HostedFilesSettings />
            </div>
          )}
          {currentPage === 'settings-section-categories' && (
            <div className="flex-1 px-6 pb-6">
              <SectionCategoriesSettings />
            </div>
          )}
          {currentPage === 'settings-reporting' && (
            <div className="flex-1 px-6 pb-6">
              <ReportingSettings />
            </div>
          )}
          {currentPage === 'settings-reports' && (
            <div className="flex-1 px-6 pb-6">
              <ReportsSettings />
            </div>
          )}
          {currentPage === 'settings-queries' && (
            <div className="flex-1 px-6 pb-6">
              <QueriesSettings />
            </div>
          )}
          {currentPage === 'settings-variable-formatting' && (
            <VariableFormattingSettings />
          )}
          {currentPage === 'settings-tools' && (
            <div className="flex-1 px-6 pb-6">
              <ToolsSettings />
            </div>
          )}
          {currentPage === 'settings-conventions' && (
            <div className="flex-1 px-6 pb-6">
              <ConventionsSettings />
            </div>
          )}
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        entitiesManagementEnabled={entitiesManagementEnabled}
        onEntitiesManagementChange={(enabled) => {
          setEntitiesManagementEnabled(enabled);
          toast.success(
            enabled ? t('toast.moduleActivated') : t('toast.moduleDeactivated'),
            {
              description: enabled 
                ? 'La gestion des entités est maintenant active'
                : 'Consultez la page de présentation pour découvrir les fonctionnalités'
            }
          );
        }}
      />

      {/* New Subscription Dialog */}
      <NewSubscriptionDialog
        open={newSubscriptionDialogOpen}
        onClose={() => setNewSubscriptionDialogOpen(false)}
        onSubscriptionCreated={handleSubscriptionCreated}
      />

      {/* Ecosystem Page */}
      {ecosystemPageOpen && (
        <EcosystemPage onClose={() => setEcosystemPageOpen(false)} />
      )}
        </TooltipProvider>
      </AppStoreProvider>
    </ThemeProvider>
  );
}
