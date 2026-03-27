import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown, Briefcase, Copy, Check, TrendingUp, TrendingDown, Users, FileText, PieChart, Handshake, CheckCircle2, Pause, DollarSign, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Fund } from '../utils/fundGenerator';
import { toast } from 'sonner';
import { DataTable, ColumnConfig } from './DataTable';
import { TableSkeleton } from './TableSkeleton';
import { InvestorFilterBar } from './InvestorFilterBar';
import { useTableSearch } from '../utils/useTableSearch';
import { FUND_SEARCH_FIELDS } from '../utils/searchConfig';
import { AIInsightBanner } from './AIInsightBanner';
import { AIAnalysis } from '../utils/aiAnalyzer';
import { EmptyState } from './EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { HighlightText } from './HighlightText';
import { cn } from './ui/utils';
import { StatusBadge } from './ui/status-badge';
import { Tag } from './ui/tag';
import { LinkText } from './ui/link-text';
import { copyToClipboard } from '../utils/clipboard';
import { LastActivityCard } from './LastActivityCard';
import { FundFilterBar } from './FundFilterBar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface AllFundsPageProps {
  data: Fund[];
  isLoading: boolean;
  allData: Fund[];
  setAllData: (data: Fund[]) => void;
  onFundClick?: (fund: Fund, tab?: string) => void;
}

export function AllFundsPage({ data, isLoading, allData, setAllData, onFundClick }: AllFundsPageProps) {
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiFilteredData, setAiFilteredData] = useState<Fund[] | null>(null);
  const [filterResetTrigger, setFilterResetTrigger] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Filtres spécifiques
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchIsin, setSearchIsin] = useState('');

  // Hook de recherche multi-champs
  const {
    searchTerm,
    setSearchTerm,
    filteredData: searchFilteredData,
    hasActiveSearch,
  } = useTableSearch(data, FUND_SEARCH_FIELDS);

  const handleCopy = async (text: string, id: string, label: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      toast.success(`${label} copié !`, { description: text });
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; border: string; icon: any }> = {
      'Actif': { 
        bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
        text: 'text-emerald-700 dark:text-emerald-400', 
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2
      },
      'Clôturé': { 
        bg: 'bg-gray-50 dark:bg-gray-900', 
        text: 'text-gray-700 dark:text-gray-400', 
        border: 'border-gray-200 dark:border-gray-700',
        icon: XCircle
      },
      'En collecte': { 
        bg: 'bg-blue-50 dark:bg-blue-950/30', 
        text: 'text-blue-700 dark:text-blue-400', 
        border: 'border-blue-200 dark:border-blue-800',
        icon: DollarSign
      },
      'Suspendu': { 
        bg: 'bg-orange-50 dark:bg-orange-950/30', 
        text: 'text-orange-700 dark:text-orange-400', 
        border: 'border-orange-200 dark:border-orange-800',
        icon: Pause
      },
    };
    return configs[status] || configs['Actif'];
  };

  const getTypeConfig = (_type: string) => ({ className: 'neutral' });

  const getStrategyConfig = (_strategy: string) => ({ className: 'neutral' });

  // Configuration des colonnes pour les fonds
  const fundColumns: ColumnConfig<Fund>[] = [
    {
      key: 'name',
      label: 'Fonds',
      sortable: true,
      render: (fund, searchTerm) => (
        <div className="flex flex-col gap-1.5">
          <LinkText className="text-sm">
            <HighlightText text={fund.name} searchTerm={searchTerm} />
          </LinkText>
          <div className="flex flex-col gap-1.5">
            {fund.lei && (
              <div className="flex items-center gap-1.5 group">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wide group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">LEI</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-mono group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  <HighlightText text={fund.lei} searchTerm={searchTerm} />
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => handleCopy(fund.lei!, `lei-${fund.id}`, 'LEI', e)}
                      className="p-0.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded transition-all duration-200 hover:scale-110"
                    >
                      {copiedId === `lei-${fund.id}` ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Copier le LEI</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
            {/* Parts disponibles */}
            <div className="flex flex-wrap gap-1 mt-0.5">
              {fund.shareClasses.map((shareClass, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <Tag className="hover:shadow-sm transition-all duration-200 cursor-pointer">Part {shareClass.name}</Tag>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500">
                    <div className="flex flex-col gap-1.5 p-1">
                      <p className="text-xs font-semibold text-white">Part {shareClass.name}</p>
                      <p className="text-xs font-mono text-indigo-100">{shareClass.isin}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(shareClass.isin, `share-${fund.id}-${idx}`, `ISIN Part ${shareClass.name}`, e);
                        }}
                        className="text-xs text-indigo-200 hover:text-white mt-1 text-left hover:underline transition-colors"
                      >
                        Copier l'ISIN
                      </button>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (fund) => {
        const config = getTypeConfig(fund.type);
        return <Tag>{fund.type}</Tag>;
      },
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (fund) => {
        const config = getStatusConfig(fund.status);
        const StatusIcon = config.icon;
        return (
          <StatusBadge variant={fund.status === 'Actif' ? 'success' : fund.status === 'Suspendu' ? 'warning' : fund.status === 'Clôturé' ? 'danger' : 'neutral'}>
            <StatusIcon className="w-3.5 h-3.5 flex-shrink-0" />
            {fund.status}
          </StatusBadge>
        );
      },
    },
    {
      key: 'aum',
      label: 'AUM',
      sortable: true,
      render: (fund) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default">
          {formatCurrency(fund.aum, 'EUR')}
        </span>
      ),
    },
    {
      key: 'totalCommitments',
      label: 'Montant levé',
      sortable: true,
      render: (fund) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors cursor-default">
          {formatCurrency(fund.totalCommitments, 'EUR')}
        </span>
      ),
    },
    {
      key: 'totalCalled',
      label: 'Montant appelé',
      sortable: true,
      render: (fund) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors cursor-default">
          {formatCurrency(fund.totalCalled, 'EUR')}
        </span>
      ),
    },
    {
      key: 'totalDistributed',
      label: 'Montant distribué',
      sortable: true,
      render: (fund) => (
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors cursor-default">
          {formatCurrency(fund.totalDistributed, 'EUR')}
        </span>
      ),
    },
    {
      key: 'irr',
      label: 'IRR',
      sortable: true,
      render: (fund) => {
        const irrValue = fund.irr;
        return (
          <div className="flex items-center gap-1.5 group cursor-default">
            {irrValue >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 transition-all duration-200 group-hover:scale-110" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 transition-all duration-200 group-hover:scale-110" />
            )}
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors">
              {irrValue.toFixed(1)}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'tvpi',
      label: 'TVPI',
      sortable: true,
      render: (fund) => {
        const tvpiValue = fund.tvpi;
        return (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors cursor-default">
            {tvpiValue.toFixed(2)}x
          </span>
        );
      },
    },
    {
      key: 'dpi',
      label: 'DPI',
      sortable: true,
      render: (fund) => {
        const dpiValue = fund.dpi;
        return (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors cursor-default">
            {dpiValue.toFixed(2)}x
          </span>
        );
      },
    },
    {
      key: 'participations',
      label: 'Participations',
      sortable: true,
      render: (fund) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-sm font-medium text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 group">
          <PieChart className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          {fund.participations}
        </span>
      ),
    },
    {
      key: 'investors',
      label: 'Investisseurs',
      sortable: true,
      render: (fund) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-sm font-medium text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 group">
          <Users className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          {fund.investors}
        </span>
      ),
    },
    {
      key: 'subscriptions',
      label: 'Souscriptions',
      sortable: true,
      render: (fund) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 group">
          <FileText className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          {fund.subscriptions}
        </span>
      ),
    },
    {
      key: 'distributors',
      label: 'Distributeurs',
      sortable: true,
      render: (fund) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-sm font-medium text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 group">
          <Handshake className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          {fund.distributors}
        </span>
      ),
    },
  ];

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    setPaginationPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPaginationPage(1);
  };

  // Appliquer les filtres
  const filteredData = useMemo(() => {
    let baseData = data;
    
    // Appliquer les filtres spécifiques aux fonds
    if (activeFilters.searchName) {
      const search = activeFilters.searchName.toLowerCase();
      baseData = baseData.filter(fund => 
        fund.name.toLowerCase().includes(search) ||
        fund.id.toString().includes(search) ||
        fund.lei?.toLowerCase().includes(search) ||
        fund.shareClasses.some(sc => sc.name.toLowerCase().includes(search))
      );
    }
    
    if (activeFilters.filterType) {
      baseData = baseData.filter(fund => fund.type === activeFilters.filterType);
    }
    
    if (activeFilters.filterStatus) {
      baseData = baseData.filter(fund => fund.status === activeFilters.filterStatus);
    }
    
    if (activeFilters.searchIsin) {
      const isinSearch = activeFilters.searchIsin.toLowerCase();
      baseData = baseData.filter(fund => 
        fund.shareClasses.some(sc => sc.isin.toLowerCase().includes(isinSearch))
      );
    }
    
    if (aiFilteredData) {
      baseData = aiFilteredData;
    }
    
    return baseData;
  }, [data, aiFilteredData, activeFilters]);

  // Tri
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key as keyof Fund];
      let bValue = b[sortConfig.key as keyof Fund];
      
      if (sortConfig.key === 'inceptionDate' || sortConfig.key === 'lastActivity') {
        aValue = (a[sortConfig.key as 'inceptionDate' | 'lastActivity'] as Date).getTime();
        bValue = (b[sortConfig.key as 'inceptionDate' | 'lastActivity'] as Date).getTime();
      }
      
      if (sortConfig.key === 'aum' || sortConfig.key === 'irr' || sortConfig.key === 'tvpi' || sortConfig.key === 'dpi' || sortConfig.key === 'investors') {
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

  const handleRowClick = (row: Fund, tab?: string) => {
    if (onFundClick) {
      onFundClick(row, tab);
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
    setFilterResetTrigger(filterResetTrigger + 1);
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
          <FundFilterBar 
            onFilterChange={handleFilterChange} 
            resetTrigger={filterResetTrigger}
            allData={allData}
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
            <EmptyState 
              hasFilters={Object.keys(activeFilters).length > 0}
              hasSearch={hasActiveSearch}
              onReset={handleResetFilters}
              icon={Briefcase}
              entityName="fonds"
              entityNamePlural="fonds"
            />
          ) : (
            <DataTable
              data={tableData}
              columns={fundColumns}
              hoveredRow={hoveredRow}
              setHoveredRow={setHoveredRow}
              onRowClick={handleRowClick}
              sortConfig={sortConfig}
              onSort={handleSort}
              compactMode={false}
              allFilteredData={sortedData}
              searchTerm={searchTerm}
              entityName="fonds"
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
              {startIndex + 1}-{endIndex} of {totalItems} fonds
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
                      ? 'bg-gradient-to-br from-[#0066FF] to-[#0052CC] text-white shadow-md'
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
    </>
  );
}