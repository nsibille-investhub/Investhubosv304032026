import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown, Eye, UserCircle, Building2, Copy, Check, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAppStore } from '../utils/appStoreContext';
import { EntitiesLandingPage } from './EntitiesLandingPage';
import { generateEntities } from '../utils/entityGenerator';
import { StatusTabs } from './StatusTabs';
import { EntityFilterBar } from './EntityFilterBar';
import { DataTable, ColumnConfig } from './DataTable';
import { DecisionPanel } from './DecisionPanel';
import { TableSkeleton } from './TableSkeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { EntityDetails } from '../utils/mockData';
import { EntityLink } from './EntityLinks';
import { copyToClipboard } from '../utils/clipboard';
import { ParentCell } from './ParentCell';
import { cn } from './ui/utils';

type StatusType = 'all' | 'conformity_required' | 'identified_risk' | 'to_check' | 'not_validated' | 'validated' | 'monitoring';

interface Entity {
  id: number;
  uid: string; // ID unique copiable
  name: string;
  type: 'Individual' | 'Corporate';
  links: EntityLink[];
  status: string;
  secondaryStatus: string | null;
  exposure: string | null;
  riskLevel: string;
  matchTypes: ('PEP' | 'Sanctions' | 'Media')[]; // Types de matches
  monitoring: boolean;
  hits: number;
  decisions: number;
  pendingMatches: number; // Nombre de matches restant à traiter
  analyst: string;
  parent: {
    type: 'Investor' | 'Partner' | 'Participation';
    name: string;
    entityType: 'Individual' | 'Corporate';
  };
  lastUpdate: {
    fullDate: string;
    relativeTime: string;
    timestamp: number;
  };
  details: EntityDetails;
}

export function EntitiesPage() {
  const { isModuleActive } = useAppStore();
  const isCompliancePlusActive = isModuleActive('Compliance Plus');
  
  // États pour la page
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<StatusType>('all');
  const [allTableData, setAllTableData] = useState<Entity[]>([]);
  
  // Show landing page if Compliance Plus is not active
  if (!isCompliancePlusActive) {
    return <EntitiesLandingPage />;
  }

  // Charger les entités au démarrage
  useEffect(() => {
    if (allTableData.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        const generatedData = generateEntities(100);
        setAllTableData(generatedData);
        setIsLoading(false);
        toast.success('Données chargées avec succès', {
          description: `${generatedData.length} entités chargées`,
        });
      }, 800);
    }
  }, []);

  // Filtrer par status
  const filteredByStatus = useMemo(() => {
    if (activeStatus === 'all') return allTableData;
    
    const statusMap: { [key in StatusType]: string[] } = {
      all: [],
      conformity_required: ['Conformité requise'],
      identified_risk: ['Risque identifié'],
      to_check: ['À vérifier'],
      not_validated: ['Non validé'],
      validated: ['Validé'],
      monitoring: ['Monitoring'],
    };

    return allTableData.filter(item => 
      statusMap[activeStatus]?.includes(item.status)
    );
  }, [allTableData, activeStatus]);

  // Appliquer les filtres de la barre de filtres
  const filteredData = useMemo(() => {
    let data = filteredByStatus;
    
    // Filtre de recherche par nom
    if (searchTerm.trim()) {
      data = data.filter(entity =>
        entity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par type
    if (activeFilters.types && activeFilters.types.length > 0) {
      data = data.filter(entity => {
        // Extraire le type réel (enlever l'emoji)
        const types = activeFilters.types.map((t: string) => t.replace(/[^\w\s]/g, '').trim());
        return types.includes(entity.type);
      });
    }
    
    // Filtre par status
    if (activeFilters.statuses && activeFilters.statuses.length > 0) {
      data = data.filter(entity =>
        activeFilters.statuses.includes(entity.status)
      );
    }
    
    // Filtre par niveau de risque
    if (activeFilters.riskLevels && activeFilters.riskLevels.length > 0) {
      data = data.filter(entity =>
        activeFilters.riskLevels.includes(entity.riskLevel)
      );
    }
    
    // Filtre par analyste
    if (activeFilters.analysts && activeFilters.analysts.length > 0) {
      data = data.filter(entity =>
        activeFilters.analysts.includes(entity.analyst)
      );
    }
    
    // Filtre par monitoring
    if (activeFilters.monitoring && activeFilters.monitoring.length > 0) {
      data = data.filter(entity => {
        if (activeFilters.monitoring.includes('Monitored')) return entity.monitoring;
        if (activeFilters.monitoring.includes('Not Monitored')) return !entity.monitoring;
        return true;
      });
    }
    
    return data;
  }, [filteredByStatus, activeFilters, searchTerm]);

  // Trier les données
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key as keyof Entity];
      let bVal = b[sortConfig.key as keyof Entity];
      
      // Handle special case for lastUpdate which is an object
      if (sortConfig.key === 'lastUpdate') {
        aVal = (a.lastUpdate as any).timestamp;
        bVal = (b.lastUpdate as any).timestamp;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = sortedData.slice(startIndex, endIndex);

  // Handlers
  const handleStatusChange = (status: StatusType) => {
    setActiveStatus(status);
    setPaginationPage(1);
    setSelectedEntity(null);
  };

  const handleFilterChange = (filters: any) => {
    setActiveFilters(filters);
    setPaginationPage(1);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
    setPaginationPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleRowClick = (row: Entity) => {
    setSelectedEntity(row);
    toast.info('Entité sélectionnée', {
      description: `${row.name}`,
    });
  };

  const handlePageChange = (page: number) => {
    setPaginationPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setPaginationPage(1);
  };

  const handleMonitoringChange = (entityId: number, newValue: boolean) => {
    setAllTableData(prev =>
      prev.map(item =>
        item.id === entityId ? { ...item, monitoring: newValue } : item
      )
    );
    
    if (selectedEntity?.id === entityId) {
      setSelectedEntity((prev: any) => ({ ...prev, monitoring: newValue }));
    }
    
    toast.success(newValue ? 'Monitoring activé' : 'Monitoring désactivé');
  };

  const handleAnalystChange = (entityId: number, newAnalyst: string) => {
    setAllTableData(prev =>
      prev.map(item =>
        item.id === entityId ? { ...item, analyst: newAnalyst } : item
      )
    );
    
    if (selectedEntity?.id === entityId) {
      setSelectedEntity((prev: any) => ({ ...prev, analyst: newAnalyst }));
    }
    
    toast.success('Analyste modifié', {
      description: `Assigné à ${newAnalyst}`,
    });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (paginationPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (paginationPage >= totalPages - 3) {
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

  // Définition des colonnes du tableau
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyId = async (uid: string, entityId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(uid);
    if (success) {
      setCopiedId(entityId);
      toast.success('ID copié !', { description: uid });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Erreur de copie', { description: 'Impossible de copier dans le presse-papier' });
    }
  };

  const columns: ColumnConfig<Entity>[] = [
    {
      key: 'name',
      label: 'Entity',
      sortable: true,
      render: (entity) => (
        <div className="flex flex-col gap-1 max-w-[300px]">
          <motion.span
            whileHover={{ x: 2 }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline transition-all truncate"
          >
            {entity.name}
          </motion.span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">ID: {entity.uid}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleCopyId(entity.uid, entity.id, e)}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
            >
              {copiedId === entity.id ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-gray-400" />
              )}
            </motion.button>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (entity) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors",
          entity.type === 'Individual' 
            ? 'bg-blue-50 text-blue-700 border-blue-200' 
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        )}>
          {entity.type === 'Individual' ? (
            <User className="w-3.5 h-3.5" />
          ) : (
            <Building2 className="w-3.5 h-3.5" />
          )}
          <span>{entity.type}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (entity) => {
        const statusColors: Record<string, string> = {
          'Clear': 'bg-green-100 text-green-700 border-green-200',
          'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
          'True Hit': 'bg-red-100 text-red-700 border-red-200',
          'New Hit': 'bg-purple-100 text-purple-700 border-purple-200',
        };
        const statusClass = statusColors[entity.status] || 'bg-gray-100 text-gray-700 border-gray-200';
        
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={statusClass}>
              {entity.status}
            </Badge>
            {entity.status === 'Pending' && entity.pendingMatches > 0 && (
              <Badge 
                variant="outline" 
                className="bg-orange-50 text-orange-700 border-orange-200 font-bold"
              >
                {entity.pendingMatches}
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'riskLevel',
      label: 'Risk',
      sortable: true,
      render: (entity) => {
        if (entity.matchTypes.length === 0) {
          return (
            <span className="text-xs text-gray-400 italic">No matches</span>
          );
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {entity.matchTypes.map((matchType) => {
              const matchColors: Record<string, string> = {
                'PEP': 'bg-amber-50 text-amber-700 border-amber-200',
                'Sanctions': 'bg-red-50 text-red-700 border-red-200',
                'Media': 'bg-blue-50 text-blue-700 border-blue-200',
              };
              const matchClass = matchColors[matchType] || 'bg-gray-50 text-gray-700 border-gray-200';
              
              return (
                <Badge 
                  key={matchType}
                  variant="outline" 
                  className={cn("text-xs font-medium", matchClass)}
                >
                  {matchType}
                </Badge>
              );
            })}
          </div>
        );
      }
    },
    {
      key: 'hits',
      label: 'Matches',
      sortable: true,
      render: (entity) => (
        <Badge 
          variant="outline" 
          className="bg-blue-50 text-blue-700 border-blue-200 font-semibold"
        >
          {entity.hits}
        </Badge>
      )
    },
    {
      key: 'decisions',
      label: 'Decisions',
      sortable: true,
      render: (entity) => (
        <Badge 
          variant="outline" 
          className="bg-purple-50 text-purple-700 border-purple-200 font-semibold"
        >
          {entity.decisions}
        </Badge>
      )
    },
    {
      key: 'parent',
      label: 'Parent',
      sortable: false,
      render: (entity) => (
        <ParentCell parent={entity.parent} />
      )
    },
    {
      key: 'monitoring',
      label: 'Monitoring',
      render: (entity) => (
        <Switch 
          checked={entity.monitoring}
          onCheckedChange={(checked) => handleMonitoringChange(entity.id, checked)}
        />
      )
    },
    {
      key: 'lastUpdate',
      label: 'Last Update',
      sortable: true,
      render: (entity) => (
        <span className="text-sm text-gray-500">{entity.lastUpdate.relativeTime}</span>
      )
    }
  ];

  return (
    <>
      {/* Status Tabs - Always full width at top */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 pt-6"
      >
        <StatusTabs 
          data={allTableData} 
          activeStatus={activeStatus}
          onStatusChange={handleStatusChange}
        />
      </motion.div>

      {/* Table Section */}
      <div className="flex-1 px-6 pt-4 pb-6 flex gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            width: selectedEntity ? '40%' : '100%'
          }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 25 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-500 flex flex-col"
        >
          {/* Filter Bar */}
          <EntityFilterBar 
            onFilterChange={handleFilterChange} 
            onSearchChange={handleSearchChange}
          />

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <DataTable 
                data={tableData} 
                hoveredRow={hoveredRow}
                setHoveredRow={setHoveredRow}
                onRowClick={handleRowClick}
                sortConfig={sortConfig}
                onSort={handleSort}
                compactMode={!!selectedEntity}
                onMonitoringChange={handleMonitoringChange}
                onAnalystChange={handleAnalystChange}
                allFilteredData={filteredByStatus}
                columns={columns}
              />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50"
            >
              <div className="text-sm text-gray-600">
                {startIndex + 1}-{endIndex} of {totalItems} items
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: paginationPage > 1 ? 1.05 : 1, x: paginationPage > 1 ? -2 : 0 }}
                  whileTap={{ scale: paginationPage > 1 ? 0.95 : 1 }}
                  onClick={() => handlePageChange(paginationPage - 1)}
                  disabled={paginationPage === 1}
                  className={`p-2 hover:bg-white rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm ${
                    paginationPage === 1 ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
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
                        ? 'text-gray-400 cursor-default'
                        : 'hover:bg-white text-gray-600 hover:text-gray-900 border border-transparent hover:border-gray-200 hover:shadow-sm'
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
                  className={`p-2 hover:bg-white rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm ${
                    paginationPage === totalPages ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </motion.button>
                
                <div className="ml-2 flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 px-2 py-1 hover:bg-white rounded-lg transition-all duration-200 outline-none">
                      <span className="text-sm text-gray-600">{itemsPerPage}/page</span>
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleItemsPerPageChange(10)} className="cursor-pointer">
                        10 par page
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleItemsPerPageChange(20)} className="cursor-pointer">
                        20 par page
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleItemsPerPageChange(50)} className="cursor-pointer">
                        50 par page
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleItemsPerPageChange(100)} className="cursor-pointer">
                        100 par page
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Decision Panel */}
        <AnimatePresence>
          {selectedEntity && (
            <DecisionPanel 
              entity={selectedEntity} 
              onClose={() => {
                setSelectedEntity(null);
                toast.info('Panneau fermé');
              }}
              onMonitoringChange={handleMonitoringChange}
              onAnalystChange={handleAnalystChange}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}