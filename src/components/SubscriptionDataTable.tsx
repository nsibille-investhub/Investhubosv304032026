import { HighlightText } from './HighlightText';
import { ContrepartieCard } from './ContrepartieCard';
import { SignatureStatusCell } from './SignatureStatusCell';
import { getColumnsForStatus, SubscriptionWorkflowStatus } from '../utils/subscriptionColumns';

interface SubscriptionDataTableProps {
  data: any[];
  hoveredRow: number | null;
  setHoveredRow: (id: number | null) => void;
  onRowClick: (row: any) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  compactMode?: boolean;
  onMonitoringChange?: (subscriptionId: number, newState: boolean) => void;
  onAnalystChange?: (subscriptionId: number, newAnalyst: string) => void;
  allFilteredData?: any[]; // All filtered data across all pages
  searchTerm?: string; // Terme de recherche pour le surlignage
  activeStatus?: SubscriptionWorkflowStatus; // 🆕 Statut actif pour déterminer les colonnes
}

export function SubscriptionDataTable({ 
  data, 
  hoveredRow, 
  setHoveredRow, 
  onRowClick, 
  sortConfig, 
  onSort, 
  compactMode,
  onMonitoringChange,
  onAnalystChange,
  allFilteredData,
  searchTerm = '',
  activeStatus
}: SubscriptionDataTableProps) {
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedSubscriptionForAudit, setSelectedSubscriptionForAudit] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Total filtered data (across all pages)
  const totalFilteredData = allFilteredData || data;
  
  // Update selectAll state when selection changes
  useEffect(() => {
    const allIds = totalFilteredData.map(item => item.id);
    const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectAll(isAllSelected);
  }, [selectedIds, totalFilteredData]);

  const handleViewAudit = (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubscriptionForAudit(row);
    setAuditDialogOpen(true);
  };

  const handleCopyId = async (id: string, subscriptionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(id);
    if (success) {
      setCopiedId(subscriptionId);
      toast.success('ID copié !', { description: id });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Erreur de copie', { description: 'Impossible de copier dans le presse-papier' });
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedIds(new Set());
      toast.info('Sélection annulée', {
        description: 'Toutes les souscriptions ont été désélectionnées',
      });
    } else {
      // Select all filtered data (across all pages)
      const allIds = new Set(totalFilteredData.map(item => item.id));
      setSelectedIds(allIds);
      toast.success(`${allIds.size} souscriptions sélectionnées`, {
        description: `Toutes les pages sont sélectionnées (${allIds.size} souscriptions au total)`,
        duration: 4000,
      });
    }
  };

  const handleSelectRow = (id: number) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    toast.info('Sélection annulée');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Rejected': return <XCircle className="w-3.5 h-3.5" />;
      case 'Cancelled': return <XCircle className="w-3.5 h-3.5" />;
      case 'Expired': return <AlertCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
      case 'Onboarding': return 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100';
      case 'À signer': return 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100';
      case 'Investisseur signé': return 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100';
      case 'Exécuté': return 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100';
      case 'En attente de fonds': return 'bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100';
      case 'Active': return 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100';
      case 'Cancelled': return 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
      case 'Expired': return 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100';
      case 'Archived': return 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getCompletionColor = (completion: number): string => {
    if (completion === 0) return 'bg-gray-300';
    if (completion < 50) return 'bg-red-500';
    if (completion < 75) return 'bg-orange-500';
    if (completion < 100) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getLastUpdateStyle = (relativeTime: string) => {
    if (relativeTime.includes('min') || relativeTime.includes('h')) {
      return {
        bg: 'from-emerald-50 to-emerald-100/50',
        border: 'border-emerald-200',
        hoverBorder: 'hover:border-emerald-300',
        iconColor: 'text-emerald-500',
        iconHoverColor: 'group-hover:text-emerald-600',
        dotColor: 'bg-emerald-500'
      };
    } else if (relativeTime.includes('Yesterday') || (relativeTime.includes('days') && parseInt(relativeTime) <= 7)) {
      return {
        bg: 'from-blue-50 to-blue-100/50',
        border: 'border-blue-200',
        hoverBorder: 'hover:border-blue-300',
        iconColor: 'text-blue-500',
        iconHoverColor: 'group-hover:text-blue-600',
        dotColor: 'bg-blue-500'
      };
    } else {
      return {
        bg: 'from-gray-50 to-gray-100/50',
        border: 'border-gray-200',
        hoverBorder: 'hover:border-gray-300',
        iconColor: 'text-gray-400',
        iconHoverColor: 'group-hover:text-gray-500',
        dotColor: 'bg-gray-400'
      };
    }
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-gray-900" />
      : <ArrowDown className="w-3.5 h-3.5 text-gray-900" />;
  };

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => (
    <motion.th 
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      onClick={() => onSort(sortKey)}
      className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer group"
    >
      <div className="flex items-center gap-2">
        {label}
        <SortIcon columnKey={sortKey} />
      </div>
    </motion.th>
  );

  return (
    <>
      <div className="overflow-x-auto">
        {/* Selection info banner */}
        <AnimatePresence>
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 overflow-hidden"
            >
              <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-600 text-white px-3 py-1 shadow-md">
                    {selectedIds.size} {selectedIds.size === 1 ? 'souscription sélectionnée' : 'souscriptions sélectionnées'}
                  </Badge>
                  <span className="text-sm text-blue-700 font-medium">
                    {selectedIds.size === totalFilteredData.length 
                      ? '(Toutes les pages sont sélectionnées)'
                      : '(Sélection partielle sur toutes les pages)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Annuler la sélection
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-6 py-4 text-left">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input 
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all cursor-pointer hover:scale-110"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectAll 
                      ? `Désélectionner toutes les ${totalFilteredData.length} souscriptions (toutes pages)` 
                      : `Sélectionner toutes les ${totalFilteredData.length} souscriptions (toutes pages)`}
                  </TooltipContent>
                </Tooltip>
              </th>
              <SortableHeader label="Name" sortKey="name" />
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Contrepartie
              </th>
              <SortableHeader label="Type" sortKey="type" />
              <SortableHeader label="Amount" sortKey="amount" />
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Fund & Share
              </th>
              <SortableHeader label="Status" sortKey="status" />
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Signatures
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Completion
              </th>
              <SortableHeader label="Created" sortKey="createdAt" />
              <SortableHeader label="Updated" sortKey="updatedAt" />
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Partenaire
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {data.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  onHoverStart={() => setHoveredRow(row.id)}
                  onHoverEnd={() => setHoveredRow(null)}
                  onClick={() => onRowClick(row)}
                  className={`border-b border-gray-100 transition-all duration-200 cursor-pointer ${
                    hoveredRow === row.id ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4">
                    <motion.input
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all cursor-pointer"
                    />
                  </td>

                  {/* Name + ID avec copy */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 max-w-[300px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.span
                            whileHover={{ x: 2 }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline transition-all truncate"
                            onClick={() => console.log('Nom cliqué')}
                          >
                            <HighlightText 
                              text={row.name} 
                              searchTerm={searchTerm}
                            />
                          </motion.span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{row.name}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">ID: {row.id}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyId(row.name, row.id, e);
                          }}
                          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          {copiedId === row.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </td>

                  {/* Contrepartie */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <ContrepartieCard contrepartie={row.contrepartie} searchTerm={searchTerm} />
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="text-sm text-gray-700"
                    >
                      <HighlightText 
                        text={row.type} 
                        searchTerm={searchTerm}
                      />
                    </motion.span>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(row.amount)}
                    </div>
                  </td>

                  {/* Fund & Share */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="inline-block"
                          >
                            <Badge className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 hover:border-blue-300 cursor-pointer transition-all shadow-sm hover:shadow">
                              <HighlightText 
                                text={row.fund.name} 
                                searchTerm={searchTerm}
                              />
                            </Badge>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          Click to view fund details
                        </TooltipContent>
                      </Tooltip>
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200">
                        Part <HighlightText 
                          text={row.fund.shareClass} 
                          searchTerm={searchTerm}
                        />
                      </Badge>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-block"
                        >
                          <Badge 
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all duration-200 cursor-pointer shadow-sm hover:shadow ${getStatusColor(row.status)}`}
                          >
                            {getStatusIcon(row.status)}
                            <HighlightText 
                              text={row.status} 
                              searchTerm={searchTerm}
                            />
                          </Badge>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Status: {row.status}
                      </TooltipContent>
                    </Tooltip>
                  </td>

                  {/* Signatures */}
                  <td className="px-6 py-4">
                    <SignatureStatusCell signatures={row.signatures} searchTerm={searchTerm} />
                  </td>

                  {/* Completion onboarding */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[100px]">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${row.completionOnboarding}%` }}
                            transition={{ duration: 0.5, delay: index * 0.02 }}
                            className={`h-full ${getCompletionColor(row.completionOnboarding)}`}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600 min-w-[35px]">
                        {row.completionOnboarding}%
                      </span>
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {formatDate(row.createdAt)}
                    </div>
                  </td>

                  {/* Updated Date */}
                  <td className="px-6 py-4">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-gradient-to-r ${getLastUpdateStyle(row.lastUpdate.relativeTime).bg} ${getLastUpdateStyle(row.lastUpdate.relativeTime).border} ${getLastUpdateStyle(row.lastUpdate.relativeTime).hoverBorder} transition-all duration-200 cursor-pointer group`}
                        >
                          <div className="relative flex items-center">
                            <Calendar className={`w-3.5 h-3.5 ${getLastUpdateStyle(row.lastUpdate.relativeTime).iconColor} ${getLastUpdateStyle(row.lastUpdate.relativeTime).iconHoverColor} transition-colors`} />
                            <motion.div 
                              className={`absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full ${getLastUpdateStyle(row.lastUpdate.relativeTime).dotColor}`}
                              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {row.lastUpdate.relativeTime}
                          </span>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Last updated: {row.updatedAt.toLocaleString('en-GB')}
                      </TooltipContent>
                    </Tooltip>
                  </td>

                  {/* Partenaire */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <PartenaireCard partenaire={row.partenaire} searchTerm={searchTerm} />
                  </td>

                  {/* Actions Menu */}
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <motion.button
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,0,0,0.05)' }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Opening subscription details...');
                          }}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleViewAudit(row, e as any)}
                          className="cursor-pointer"
                        >
                          <History className="w-4 h-4 mr-2" />
                          View Audit Trail
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Audit Trail Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <History className="w-5 h-5 text-gray-600" />
              Audit Trail - {selectedSubscriptionForAudit?.name}
            </DialogTitle>
            <DialogDescription>
              Consultez l'historique complet des modifications et actions effectuées sur cette souscription.
            </DialogDescription>
          </DialogHeader>
          {selectedSubscriptionForAudit && (
            <AuditTrail entityId={selectedSubscriptionForAudit.id} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}