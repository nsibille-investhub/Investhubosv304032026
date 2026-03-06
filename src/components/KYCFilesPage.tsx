import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ChevronDown, Eye, Download, UserCircle, Building2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { generateKYCFiles, KYCFile } from '../utils/kycFileGenerator';
import { DataTable, ColumnConfig } from './DataTable';
import { TableSkeleton } from './TableSkeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { copyToClipboard } from '../utils/clipboard';
import { cn } from './ui/utils';

export function KYCFilesPage() {
  const [paginationPage, setPaginationPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<KYCFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [allTableData, setAllTableData] = useState<KYCFile[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Charger les dossiers au démarrage
  useEffect(() => {
    if (allTableData.length === 0) {
      setIsLoading(true);
      setTimeout(() => {
        const generatedData = generateKYCFiles(100);
        setAllTableData(generatedData);
        setIsLoading(false);
        toast.success('Dossiers KYC chargés', {
          description: `${generatedData.length} dossiers disponibles`,
        });
      }, 800);
    }
  }, []);

  // Trier les données
  const sortedData = useMemo(() => {
    if (!sortConfig) return allTableData;
    
    const sorted = [...allTableData].sort((a, b) => {
      let aVal = a[sortConfig.key as keyof KYCFile];
      let bVal = b[sortConfig.key as keyof KYCFile];
      
      // Handle special case for lastActivity
      if (sortConfig.key === 'lastActivity') {
        aVal = (a.lastActivity as any).timestamp;
        bVal = (b.lastActivity as any).timestamp;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [allTableData, sortConfig]);

  // Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (paginationPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const tableData = sortedData.slice(startIndex, endIndex);

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

  const handleRowClick = (row: KYCFile) => {
    setSelectedFile(row);
    toast.info('Dossier sélectionné', {
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

  const handleCopyId = async (uid: string, fileId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(uid);
    if (success) {
      setCopiedId(fileId);
      toast.success('ID copié !', { description: uid });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Erreur de copie', { description: 'Impossible de copier dans le presse-papier' });
    }
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

  // Définition des colonnes
  const columns: ColumnConfig<KYCFile>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      render: (file) => (
        <div className="flex flex-col gap-1 max-w-[300px]">
          <motion.span
            whileHover={{ x: 2 }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline transition-all truncate"
          >
            {file.name}
          </motion.span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">ID: {file.uid}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleCopyId(file.uid, file.id, e)}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors"
            >
              {copiedId === file.id ? (
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
      render: (file) => {
        const isIndividual = file.type === 'Personne physique';
        return (
          <div className="flex items-center gap-2">
            {isIndividual ? (
              <UserCircle className="w-4 h-4 text-blue-500" />
            ) : (
              <Building2 className="w-4 h-4 text-purple-500" />
            )}
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium",
                isIndividual 
                  ? "bg-blue-50 text-blue-700 border-blue-200" 
                  : "bg-purple-50 text-purple-700 border-purple-200"
              )}
            >
              {file.type}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (file) => {
        const statusColors: Record<string, string> = {
          'Rejeté': 'bg-red-100 text-red-700 border-red-200',
          'Brouillon': 'bg-gray-100 text-gray-700 border-gray-200',
          'Ouvert': 'bg-green-100 text-green-700 border-green-200',
          'Approuvé': 'bg-blue-100 text-blue-700 border-blue-200',
        };
        const statusClass = statusColors[file.status] || 'bg-gray-100 text-gray-700 border-gray-200';
        
        return (
          <Badge variant="outline" className={cn("text-xs font-medium", statusClass)}>
            {file.status}
          </Badge>
        );
      }
    },
    {
      key: 'nextReview',
      label: 'Prochaine révision',
      sortable: true,
      render: (file) => (
        file.nextReview ? (
          <span className="text-sm text-gray-600">{file.nextReview}</span>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )
      )
    },
    {
      key: 'progress',
      label: 'Progression',
      sortable: false,
      render: (file) => {
        const progressIcons: Record<string, string> = {
          'En révision': '👁️',
          'En collecte': '⬇️',
          'Recollecte': '🔄',
          'Finalisation': '✅'
        };
        
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm">{progressIcons[file.progress.status]}</span>
            <span className="text-sm text-gray-600">{file.progress.status}</span>
          </div>
        );
      }
    },
    {
      key: 'risk',
      label: 'Risque',
      sortable: true,
      render: (file) => {
        if (!file.risk) {
          return <span className="text-sm text-gray-400">—</span>;
        }
        
        const riskConfig: Record<string, { color: string; bars: number }> = {
          'Prohibé': { color: 'bg-red-500', bars: 4 },
          'Élevé': { color: 'bg-orange-500', bars: 3 },
          'Moyen': { color: 'bg-yellow-500', bars: 2 },
          'Faible': { color: 'bg-green-500', bars: 1 },
        };
        
        const config = riskConfig[file.risk];
        
        return (
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-4">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={cn(
                    "w-1 rounded-sm transition-all",
                    bar <= config.bars ? config.color : 'bg-gray-200'
                  )}
                  style={{ height: `${bar * 25}%` }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">{file.risk}</span>
          </div>
        );
      }
    },
    {
      key: 'template',
      label: 'Modèle',
      sortable: true,
      render: (file) => (
        <span className="text-sm text-gray-600 truncate max-w-[180px] block">
          {file.template}
        </span>
      )
    },
    {
      key: 'tags',
      label: 'Tags',
      sortable: false,
      render: (file) => {
        if (file.tags.length === 0) {
          return <span className="text-sm text-gray-400">—</span>;
        }
        
        const tagColors: Record<string, string> = {
          'Démo': 'bg-purple-50 text-purple-700 border-purple-200',
          'LP': 'bg-blue-50 text-blue-700 border-blue-200',
          'Actif': 'bg-green-50 text-green-700 border-green-200',
          'EDD': 'bg-red-50 text-red-700 border-red-200',
          'Déclaration 4': 'bg-gray-50 text-gray-700 border-gray-200',
          'Prioritaire': 'bg-orange-50 text-orange-700 border-orange-200',
          'Urgent': 'bg-red-50 text-red-700 border-red-200',
          'Révision requise': 'bg-yellow-50 text-yellow-700 border-yellow-200',
          'Compliance': 'bg-indigo-50 text-indigo-700 border-indigo-200',
          'Juridique': 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
        
        return (
          <div className="flex flex-wrap gap-1">
            {file.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={cn("text-xs", tagColors[tag] || 'bg-gray-50 text-gray-700 border-gray-200')}
              >
                {tag}
              </Badge>
            ))}
            {file.tags.length > 2 && (
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                +{file.tags.length - 2}
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'assignee',
      label: 'Assigné à',
      sortable: false,
      render: (file) => {
        if (!file.assignee) {
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircle className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-sm text-gray-400">Non assigné</span>
            </div>
          );
        }
        
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
              {file.assignee.initials}
            </div>
            <span className="text-sm text-gray-600">{file.assignee.name}</span>
          </div>
        );
      }
    },
    {
      key: 'lastActivity',
      label: 'Dernière activité',
      sortable: true,
      render: (file) => (
        <span className="text-sm text-gray-500">{file.lastActivity.text}</span>
      )
    }
  ];

  return (
    <div className="flex-1 px-6 pt-6 pb-6 flex gap-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-500 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dossiers KYC</h2>
              <p className="text-sm text-gray-600 mt-1">
                Gérez tous les dossiers KYC des investisseurs, partenaires et participations
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gradient-to-r from-[#000000] to-[#0F323D] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </motion.button>
          </div>
        </div>

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
              compactMode={false}
              columns={columns}
            />
          )}
        </div>

        {/* Pagination */}
        {!isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50"
          >
            <div className="text-sm text-gray-600">
              {startIndex + 1}-{endIndex} sur {totalItems} dossiers
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
    </div>
  );
}