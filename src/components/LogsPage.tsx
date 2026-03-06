import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  User, 
  Code, 
  Activity,
  Clock,
  Globe,
  Terminal
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { generateLogs, LogEntry } from '../utils/logsGenerator';
import { DataTable, ColumnConfig } from './DataTable';
import { LogsFilterBar } from './LogsFilterBar';
import { LogsTypeTabs, LogType } from './LogsTypeTabs';
import { LogDetailsDrawer } from './LogDetailsDrawer';
import { TableSkeleton } from './TableSkeleton';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from './ui/tooltip';

export function LogsPage() {
  // États pour la page
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({
    key: 'timestamp',
    direction: 'desc'
  });
  const [activeFilters, setActiveFilters] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [allTableData, setAllTableData] = useState<LogEntry[]>([]);
  const [activeLogType, setActiveLogType] = useState<LogType>('user');

  // Charger les logs au démarrage
  useEffect(() => {
    if (allTableData.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        const generatedData = generateLogs(500); // Générer 500 logs
        setAllTableData(generatedData);
        setIsLoading(false);
        toast.success('Logs chargés avec succès', {
          description: `${generatedData.length} entrées chargées`,
        });
      }, 800);
    }
  }, []);

  // Fonction pour déterminer si un log est technique
  const isTechnicalLog = (log: LogEntry): boolean => {
    const technicalControllers = [
      'Requêtes techniques (AJAX)',
      'Système',
      'Reporting (technique)',
    ];

    const technicalActions = [
      'Requête AJAX',
      'Action système',
      'Reporting technique',
      'Chargement composants',
      'Asset',
      'Collecte logs',
    ];

    return (
      technicalControllers.includes(log.controllerLabel) ||
      technicalActions.includes(log.actionLabel)
    );
  };

  // Filtrer par type de log (utilisateur vs technique)
  const logsByType = useMemo(() => {
    if (activeLogType === 'user') {
      return allTableData.filter(log => !isTechnicalLog(log));
    } else {
      return allTableData.filter(log => isTechnicalLog(log));
    }
  }, [allTableData, activeLogType]);

  // Appliquer les filtres
  const filteredData = useMemo(() => {
    let results = logsByType;

    // Filtre par contrôleur
    if (activeFilters.controllers?.length > 0) {
      results = results.filter(log => {
        return activeFilters.controllers.includes(log.controllerLabel);
      });
    }

    // Filtre par action
    if (activeFilters.actions?.length > 0) {
      results = results.filter(log => {
        return activeFilters.actions.includes(log.actionLabel);
      });
    }

    // Filtre par méthode HTTP
    if (activeFilters.methods?.length > 0) {
      results = results.filter(log => {
        return activeFilters.methods.includes(log.method);
      });
    }

    // Filtre par status code
    if (activeFilters.statusCodes?.length > 0) {
      results = results.filter(log => {
        const codes = activeFilters.statusCodes.map((s: string) => {
          const match = s.match(/(\d+)/);
          return match ? parseInt(match[1]) : null;
        }).filter(Boolean);
        return codes.includes(log.statusCode);
      });
    }

    // Filtre par utilisateur
    if (activeFilters.users?.length > 0) {
      results = results.filter(log => activeFilters.users.includes(log.user));
    }

    // Filtre par date
    if (activeFilters.dateRange) {
      results = results.filter(log => {
        const logDate = new Date(log.timestamp);
        const startDate = new Date(activeFilters.dateRange.start);
        const endDate = new Date(activeFilters.dateRange.end);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Recherche globale
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(log => 
        log.user.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower) ||
        log.controllerLabel.toLowerCase().includes(searchLower) ||
        log.controller.toLowerCase().includes(searchLower) ||
        log.actionLabel.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.ipAddress.includes(searchLower) ||
        log.method.toLowerCase().includes(searchLower) ||
        log.statusCode.toString().includes(searchLower) ||
        log.targetEntity?.toLowerCase().includes(searchLower)
      );
    }

    return results;
  }, [logsByType, activeFilters, searchTerm]);

  // Appliquer le tri
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof LogEntry];
      let bValue: any = b[sortConfig.key as keyof LogEntry];

      // Gestion spéciale pour les timestamps
      if (sortConfig.key === 'timestamp') {
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (paginationPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, paginationPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Gérer le tri
  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'desc' };
    });
  };

  // Gérer le clic sur une ligne
  const handleRowClick = (log: LogEntry) => {
    setSelectedLog(log);
  };

  // Badge pour le status code
  const getStatusBadge = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) {
      return (
        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400 font-mono">
          {statusCode}
        </Badge>
      );
    }
    if (statusCode >= 400 && statusCode < 500) {
      return (
        <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400 font-mono">
          {statusCode}
        </Badge>
      );
    }
    if (statusCode >= 500) {
      return (
        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 font-mono">
          {statusCode}
        </Badge>
      );
    }
    return <Badge variant="outline" className="font-mono">{statusCode}</Badge>;
  };

  // Badge pour la méthode HTTP
  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400',
      POST: 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400',
      PUT: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-400',
      DELETE: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400',
      PATCH: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-400',
    };

    return (
      <Badge variant="outline" className={cn('font-mono text-xs', colors[method] || '')}>
        {method}
      </Badge>
    );
  };

  // Colonnes pour la DataTable
  const columns: ColumnConfig<LogEntry>[] = [
    {
      key: 'timestamp',
      label: 'Date & Heure',
      sortable: true,
      className: 'w-[180px]',
      render: (log) => (
        <div className="flex flex-col">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {log.timestampRelative}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{log.timestampFull}</p>
            </TooltipContent>
          </Tooltip>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {new Date(log.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Utilisateur',
      sortable: true,
      className: 'w-[200px]',
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-black to-[#0F323D] flex items-center justify-center text-white text-xs font-medium">
            {log.user.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {log.user}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {log.userEmail}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'controller',
      label: 'Module',
      sortable: true,
      className: 'w-[180px]',
      render: (log) => (
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {log.controllerLabel}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{log.controller}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      className: 'w-[180px]',
      render: (log) => (
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {log.actionLabel}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{log.action}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      key: 'method',
      label: 'Méthode',
      sortable: true,
      className: 'w-[100px]',
      render: (log) => getMethodBadge(log.method),
    },
    {
      key: 'statusCode',
      label: 'Status',
      sortable: true,
      className: 'w-[90px]',
      render: (log) => getStatusBadge(log.statusCode),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      sortable: true,
      className: 'w-[140px]',
      render: (log) => (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {log.ipAddress}
          </span>
        </div>
      ),
    },
    {
      key: 'responseTime',
      label: 'Response Time',
      sortable: true,
      className: 'w-[130px]',
      render: (log) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className={cn(
            "text-sm font-mono",
            log.responseTime < 100 ? "text-green-600 dark:text-green-400" :
            log.responseTime < 500 ? "text-orange-600 dark:text-orange-400" :
            "text-red-600 dark:text-red-400"
          )}>
            {log.responseTime}ms
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      className: 'w-[60px]',
      render: (log) => (
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLog(log);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      ),
    },
  ];

  // Export des logs
  const handleExport = () => {
    toast.success('Export en cours', {
      description: `${filteredData.length} logs seront exportés`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black">
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1">Logs</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consultez les logs système
              </p>
            </div>
          </div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Terminal className="w-7 h-7 text-gray-700 dark:text-gray-300" />
              <h1 className="text-2xl">Logs</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consultez les logs système et suivez l'activité de la plateforme
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-gradient-to-r from-black to-[#0F323D] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <LogsFilterBar
        onFilterChange={setActiveFilters}
        onSearchChange={setSearchTerm}
        searchValue={searchTerm}
        allData={logsByType}
      />

      {/* Tabs pour séparer Actions utilisateurs / Logs techniques */}
      <LogsTypeTabs
        data={allTableData}
        activeType={activeLogType}
        onTypeChange={setActiveLogType}
      />

      {/* Stats rapides */}
      <div className="px-6 py-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{allTableData.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Filtrés: <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredData.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Affichés: <span className="font-semibold text-gray-900 dark:text-gray-100">{paginatedData.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <DataTable
          data={paginatedData}
          columns={columns}
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
          onRowClick={handleRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
          allFilteredData={filteredData}
          searchTerm={searchTerm}
          entityName="log"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Affichage de {((paginationPage - 1) * itemsPerPage) + 1} à{' '}
              {Math.min(paginationPage * itemsPerPage, sortedData.length)} sur{' '}
              {sortedData.length} logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginationPage(prev => Math.max(1, prev - 1))}
                disabled={paginationPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (paginationPage <= 3) {
                    pageNum = i + 1;
                  } else if (paginationPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = paginationPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={paginationPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPaginationPage(pageNum)}
                      className={paginationPage === pageNum ? 'bg-gradient-to-r from-black to-[#0F323D]' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginationPage(prev => Math.min(totalPages, prev + 1))}
                disabled={paginationPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Panel de détails (optionnel) */}
      <LogDetailsDrawer
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}