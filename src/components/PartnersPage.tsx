import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown, Copy, Check, Eye, X, User, Mail, Phone, Briefcase, FileText, Users, TrendingUp, Building2, ExternalLink, MoreVertical, LogIn } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { toast } from 'sonner@2.0.3';
import { Partner, generatePartners } from '../utils/partnerGenerator';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useTableSearch } from '../utils/useTableSearch';
import { PARTNER_SEARCH_FIELDS } from '../utils/searchConfig';
import { copyToClipboard } from '../utils/clipboard';
import { AIAnalysis } from '../utils/aiAnalyzer';
import { getSegmentConfig } from '../utils/segmentConfig';
import { cn } from './ui/utils';
import { ColumnConfig, DataTable } from './DataTable';
import { FilterBar, FilterConfig } from './FilterBar';
import { StructuresCard } from './StructuresCard';
import { DistributionRightsCard } from './DistributionRightsCard';
import { AdvisorsCard } from './AdvisorsCard';
import { ChildPartnersCell } from './ChildPartnersCell';
import { HighlightText } from './HighlightText';
import { AIInsightBanner } from './AIInsightBanner';
import { LastActivityCard } from './LastActivityCard';
import { InvestorEmptyState } from './InvestorEmptyState';
import { TableSkeleton } from './TableSkeleton';

interface PartnersPageProps {
  data: Partner[];
  isLoading: boolean;
  allData: Partner[];
  setAllData: (data: Partner[]) => void;
  onPartnerClick?: (partner: Partner, tab?: string) => void;
}

export function PartnersPage({ data, isLoading, allData, setAllData, onPartnerClick }: PartnersPageProps) {
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiFilteredData, setAiFilteredData] = useState<Partner[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPartnerFunds, setSelectedPartnerFunds] = useState<Partner | null>(null);
  const [selectedPartnerContacts, setSelectedPartnerContacts] = useState<Partner | null>(null);
  const [showAllContacts, setShowAllContacts] = useState<Record<number, boolean>>({});

  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: 'parentGroups',
      label: 'Groupe parent',
      type: 'select',
      isPrimary: true,
      options: Array.from(new Set(allData.map(partner => partner.parentGroup).filter(Boolean)))
        .sort()
        .map(group => ({ value: group!, label: group! }))
    },
    {
      id: 'statuses',
      label: 'Statut',
      type: 'select',
      isPrimary: true,
      options: Array.from(new Set(allData.map(partner => partner.status).filter(Boolean)))
        .sort()
        .map(status => ({ value: status!, label: status! }))
    },
    {
      id: 'analysts',
      label: 'Responsable',
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(allData.map(partner => partner.analyst).filter(Boolean)))
        .sort()
        .map(analyst => ({ value: analyst!, label: analyst! }))
    },
    {
      id: 'segments',
      label: 'Segment',
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(allData.flatMap(partner => partner.segments || []).filter(Boolean)))
        .sort()
        .map(segment => ({ value: segment, label: segment }))
    },
    {
      id: 'contractStatuses',
      label: 'Convention',
      type: 'select',
      isPrimary: false,
      options: Array.from(new Set(allData.map(partner => partner.contractStatus).filter(Boolean)))
        .sort()
        .map(status => ({ value: status!, label: status! }))
    }
  ], [allData]);

  // Hook de recherche multi-champs
  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchFilteredData,
    hasActiveSearch,
  } = useTableSearch(data, PARTNER_SEARCH_FIELDS);

  const handleCopy = async (text: string, id: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      toast.success(`${label} copié !`, { description: text });
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Configuration des colonnes pour les partenaires
  const partnerColumns: ColumnConfig<Partner>[] = [
    {
      key: 'name',
      label: 'Partenaire',
      sortable: true,
      render: (partner, searchTerm) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            <HighlightText text={partner.name} searchTerm={searchTerm} />
          </span>
          <div className="flex flex-col gap-0.5">
            {partner.siret && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">SIRET</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  <HighlightText text={partner.siret} searchTerm={searchTerm} />
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => handleCopy(partner.siret!, `siret-${partner.id}`, 'SIRET', e)}
                      className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      {copiedId === `siret-${partner.id}` ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-gray-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Copier le SIRET</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            {partner.orias && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide">ORIAS</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  <HighlightText text={partner.orias} searchTerm={searchTerm} />
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => handleCopy(partner.orias!, `orias-${partner.id}`, 'ORIAS', e)}
                      className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      {copiedId === `orias-${partner.id}` ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-gray-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Copier l'ORIAS</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (partner) => {
        const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
          'Actif': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
          'En cours d\'agrément': { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
          'Inactif': { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
          'Suspendu': { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' }
        };
        const config = statusConfig[partner.status] || statusConfig['Actif'];
        return (
          <span className={cn(
            'inline-flex px-2.5 py-1 rounded-md text-xs font-medium border',
            config.bg,
            config.text,
            config.border
          )}>
            {partner.status}
          </span>
        );
      },
    },
    {
      key: 'segments',
      label: 'Segments',
      sortable: false,
      render: (partner) => (
        <div className="flex flex-wrap gap-1">
          {partner.segments && partner.segments.length > 0 ? (
            partner.segments.map((segment, idx) => {
              const config = getSegmentConfig(segment);
              return (
                <span
                  key={idx}
                  className={cn(
                    'inline-flex px-2 py-0.5 rounded-md text-xs font-medium border',
                    config.bg,
                    config.text,
                    config.border
                  )}
                >
                  {segment}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 italic">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'funds',
      label: 'Droits de distribution',
      sortable: false,
      render: (partner, searchTerm) => (
        <DistributionRightsCard 
          funds={partner.funds || []} 
          searchTerm={searchTerm}
        />
      ),
    },
    {
      key: 'advisors',
      label: 'Conseillers',
      sortable: false,
      render: (partner, searchTerm) => (
        <AdvisorsCard 
          advisors={partner.contacts || []} 
          partnerName={partner.name}
          partnerId={partner.id}
          searchTerm={searchTerm}
        />
      ),
    },
    {
      key: 'subscriptionsCount',
      label: 'Souscriptions',
      sortable: true,
      render: (partner) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-sm font-medium text-indigo-700 dark:text-indigo-400">
          <FileText className="w-3.5 h-3.5" />
          {partner.subscriptionsCount}
        </span>
      ),
    },
    {
      key: 'totalVolumeGenerated',
      label: 'Volume Généré',
      sortable: true,
      render: (partner) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(partner.totalVolumeGenerated)}
        </span>
      ),
    },
    {
      key: 'activeInvestors',
      label: 'Investisseurs Actifs',
      sortable: true,
      render: (partner) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-400">
          <Users className="w-3.5 h-3.5" />
          {partner.activeInvestors}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Dernière activité',
      sortable: true,
      render: (partner) => (
        <LastActivityCard date={partner.lastActivity} variant="neutral" />
      ),
    },
    {
      key: 'location',
      label: 'Localisation',
      sortable: false,
      render: (partner, searchTerm) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            <HighlightText text={partner.city} searchTerm={searchTerm} />
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <HighlightText text={partner.country} searchTerm={searchTerm} />
          </span>
        </div>
      ),
    },
    {
      key: 'children',
      label: 'Enfants',
      sortable: false,
      render: (partner, searchTerm) => {
        // Trouver les partenaires enfants (ceux qui ont ce partenaire comme parent)
        const childPartners = allData.filter(p => p.parentGroup === partner.name);
        return (
          <ChildPartnersCell 
            childPartners={childPartners} 
            searchTerm={searchTerm}
          />
        );
      },
    },
    {
      key: 'parent',
      label: 'Parent',
      sortable: false,
      render: (partner, searchTerm) => {
        if (!partner.parentGroup) {
          return (
            <span className="text-xs text-gray-400 italic">-</span>
          );
        }
        return (
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                  <Building2 className="w-3 h-3" />
                </span>
                <span className="max-w-[150px] truncate group-hover:underline">
                  <HighlightText text={partner.parentGroup} searchTerm={searchTerm} />
                </span>
                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[450px] p-0" 
              align="start" 
              side="right"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600"
                    >
                      <Building2 className="w-5 h-5" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {partner.parentGroup}
                      </h3>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className="text-xs px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                          Groupe Parent
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Partenaire principal
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                <motion.div 
                  className="mt-4 pt-4 border-t border-gray-100"
                  whileHover={{ backgroundColor: 'rgba(0,102,255,0.02)' }}
                >
                  <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const parentPartner = allData.find(p => p.name === partner.parentGroup);
                      if (parentPartner && onPartnerClick) {
                        onPartnerClick(parentPartner);
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-purple-600 hover:text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    <span>Voir la fiche partenaire parent</span>
                    <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.div>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (partner) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              if (onPartnerClick) {
                onPartnerClick(partner, 'profil');
              }
            }}>
              <Eye className="w-4 h-4 mr-2" />
              Voir la fiche
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              toast.info('Connexion au portail', {
                description: `Redirection vers le portail pour ${partner.name}...`,
              });
            }}>
              <LogIn className="w-4 h-4 mr-2" />
              Connexion Portail
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleFilterChange = (filterId: string, value: string | string[] | null) => {
    setActiveFilters((prev: Record<string, string | string[]>) => {
      const nextFilters = { ...prev };
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        delete nextFilters[filterId];
      } else {
        nextFilters[filterId] = value;
      }
      return nextFilters;
    });
    setPaginationPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPaginationPage(1);
  };

  // Appliquer les filtres
  const filteredData = useMemo(() => {
    let baseData = hasActiveSearch ? searchFilteredData : data;
    
    if (aiFilteredData) {
      baseData = aiFilteredData;
    }
    
    if (Object.keys(activeFilters).length === 0) return baseData;
    
    return baseData.filter(partner => {
      // Filtre sur le partenaire parent
      if (activeFilters.parentGroups) {
        if (!partner.parentGroup || activeFilters.parentGroups !== partner.parentGroup) {
          return false;
        }
      }

      // Filtre sur le responsable/analyste
      if (activeFilters.analysts) {
        if (activeFilters.analysts !== partner.analyst) {
          return false;
        }
      }

      // Filtre sur les segments (match si au moins un segment correspond)
      if (activeFilters.segments) {
        const hasSegment = partner.segments?.some(seg => seg === activeFilters.segments);
        if (!hasSegment) return false;
      }

      // Filtre sur le statut de convention
      if (activeFilters.contractStatuses) {
        if (!partner.contractStatus || activeFilters.contractStatuses !== partner.contractStatus) {
          return false;
        }
      }

      // Filtre sur le statut (conservé pour compatibilité)
      if (activeFilters.statuses) {
        if (activeFilters.statuses !== partner.status) return false;
      }

      return true;
    });
  }, [data, searchFilteredData, hasActiveSearch, aiFilteredData, activeFilters]);

  // Tri
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof Partner];
      let bValue = b[sortConfig.key as keyof Partner];
      
      if (sortConfig.key === 'registrationDate' || sortConfig.key === 'lastActivity') {
        aValue = (a[sortConfig.key as 'registrationDate' | 'lastActivity'] as Date).getTime();
        bValue = (b[sortConfig.key as 'registrationDate' | 'lastActivity'] as Date).getTime();
      }
      
      if (sortConfig.key === 'totalVolumeGenerated' || sortConfig.key === 'subscriptionsCount' || sortConfig.key === 'activeInvestors') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    toast.success('Tri appliqué', {
      description: `Tri par ${key} (${direction === 'asc' ? 'croissant' : 'décroissant'})`,
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPaginationPage(page);
      toast.info('Page changée', { description: `Page ${page} sur ${totalPages}` });
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
    toast.success('Affichage modifié', { description: `${newItemsPerPage} items par page` });
  };

  const handleRowClick = (row: Partner, tab?: string) => {
    if (onPartnerClick) {
      onPartnerClick(row, tab);
    }
  };

  const handleCloseBanner = () => {
    setAiAnalysis(null);
    setAiFilteredData(null);
  };

  const handleResetFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    setAiFilteredData(null);
    setPaginationPage(1);
    toast.success('Filtres réinitialisés');
  };

  const handleInsightClick = (index: number) => {
    if (aiAnalysis && aiAnalysis.insights[index].items) {
      setAiFilteredData(aiAnalysis.insights[index].items!);
      setAiAnalysis(null);
      setPaginationPage(1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (paginationPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (paginationPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = paginationPage - 1; i <= paginationPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <TableSkeleton />
      </div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
        className="bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow duration-500 flex flex-col"
      >
        {/* Filter Bar */}
        <div className="relative z-10">
          <FilterBar
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Rechercher un partenaire, un SIRET, une ville..."
            filters={filterConfigs}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleResetFilters}
          />
        </div>
        
        <AIInsightBanner 
          analysis={aiAnalysis}
          onClose={handleCloseBanner}
          onInsightClick={handleInsightClick}
        />

        <div className="flex-1">
          {isLoading ? (
            <TableSkeleton />
          ) : sortedData.length === 0 ? (
            <InvestorEmptyState
              hasFilters={Object.keys(activeFilters).length > 0}
              hasSearch={hasActiveSearch}
              onReset={handleResetFilters}
            />
          ) : (
            <DataTable
              data={tableData}
              columns={partnerColumns}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              onRowClick={handleRowClick}
              sortConfig={sortConfig}
              onSort={handleSort}
              compactMode={false}
              allFilteredData={sortedData}
              searchTerm={searchTerm}
              entityName="partenaire"
            />
          )}
        </div>

        {/* Pagination */}
        {sortedData.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {startIndex + 1}-{endIndex} of {totalItems} partenaires
              {(hasActiveSearch || Object.keys(activeFilters).length > 0) && (
                <span className="ml-2 text-blue-600 dark:text-blue-400">
                  (filtré{totalItems !== data.length && ` de ${data.length}`})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: paginationPage > 1 ? 1.05 : 1, x: paginationPage > 1 ? -2 : 0 }}
                whileTap={{ scale: paginationPage > 1 ? 0.95 : 1 }}
                onClick={() => handlePageChange(paginationPage - 1)}
                disabled={paginationPage === 1}
                className={`p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm ${
                  paginationPage === 1 ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              {getPageNumbers().map((page, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: page !== '...' ? 1.1 : 1, y: page !== '...' ? -2 : 0 }}
                  whileTap={{ scale: page !== '...' ? 0.95 : 1 }}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg transition-all duration-300 ${
                    page === paginationPage
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : page === '...'
                      ? 'text-gray-400 dark:text-gray-600 cursor-default'
                      : 'hover:bg-white dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm'
                  }`}
                  disabled={page === '...'}
                >
                  {page}
                </motion.button>
              ))}
              
              <motion.button
                whileHover={{ scale: paginationPage < totalPages ? 1.05 : 1, x: paginationPage < totalPages ? 2 : 0 }}
                whileTap={{ scale: paginationPage < totalPages ? 0.95 : 1 }}
                onClick={() => handlePageChange(paginationPage + 1)}
                disabled={paginationPage === totalPages}
                className={`p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm ${
                  paginationPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="ml-2 flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200 outline-none">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{itemsPerPage}/page</span>
                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(10)} className="cursor-pointer">10 par page</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(20)} className="cursor-pointer">20 par page</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(50)} className="cursor-pointer">50 par page</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleItemsPerPageChange(100)} className="cursor-pointer">100 par page</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Dialog pour afficher les fonds */}
      <Dialog open={!!selectedPartnerFunds} onOpenChange={() => setSelectedPartnerFunds(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Fonds de {selectedPartnerFunds?.name}
            </DialogTitle>
            <DialogDescription>
              Liste des fonds associés à {selectedPartnerFunds?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedPartnerFunds?.funds && selectedPartnerFunds.funds.length > 0 ? (
              <div className="space-y-3">
                {selectedPartnerFunds.funds.map((fund, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {fund.fundName}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Parts</span>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {formatCurrency(fund.shares)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Taux de commission</span>
                            <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                              {fund.commissionRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Aucun fonds associé
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
