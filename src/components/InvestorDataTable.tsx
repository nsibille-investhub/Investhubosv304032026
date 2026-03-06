import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  Eye, 
  ChevronDown, 
  History, 
  X,
  User,
  Building2,
  UserPlus,
  MessageCircle,
  UserCheck,
  Archive,
  TrendingUp,
  FileText,
  MoreVertical,
  LogIn
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Investor } from '../utils/investorGenerator';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ContactsCard } from './ContactsCard';
import { StructuresCell } from './StructuresCell';
import { HighlightText } from './HighlightText';
import { LastActivityCard } from './LastActivityCard';
import { PartnerCard } from './PartnerCard';
import { cn } from './ui/utils';
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
import { toast } from 'sonner@2.0.3';
import { AuditLogDialog } from './AuditLogDialog';
import { copyToClipboard } from '../utils/clipboard';

// Définition des couleurs de segments - PROFESSIONNEL
const SEGMENT_COLORS: Record<string, { color: string; bgColor: string }> = {
  'HNWI': { color: '#3B82F6', bgColor: '#EFF6FF' },
  'UHNWI': { color: '#F97316', bgColor: '#FFF7ED' },
  'Retail': { color: '#EC4899', bgColor: '#FDF2F8' },
  'Professional': { color: '#6B7280', bgColor: '#F3F4F6' },
  'Institutional': { color: '#6B7280', bgColor: '#F9FAFB' },
};

interface InvestorDataTableProps {
  data: Investor[];
  hoveredRow: number | null;
  setHoveredRow: (id: number | null) => void;
  onRowClick: (row: Investor, tab?: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  compactMode?: boolean;
  onMonitoringChange?: (investorId: number, newState: boolean) => void;
  onAnalystChange?: (investorId: number, newAnalyst: string) => void;
  allFilteredData?: Investor[];
  searchTerm?: string;
}

export function InvestorDataTable({ 
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
  searchTerm = ''
}: InvestorDataTableProps) {
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedInvestorForAudit, setSelectedInvestorForAudit] = useState<Investor | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  const totalFilteredData = allFilteredData || data;
  
  useEffect(() => {
    const allIds = totalFilteredData.map(item => item.id);
    const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
    setSelectAll(isAllSelected);
  }, [selectedIds, totalFilteredData]);

  const handleViewAudit = (row: Investor, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvestorForAudit(row);
    setAuditDialogOpen(true);
  };

  const handleViewProfile = (row: Investor, e: React.MouseEvent) => {
    e.stopPropagation();
    onRowClick(row, 'profil');
  };

  const handlePortalConnection = (row: Investor, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Connexion au portail', {
      description: `Redirection vers le portail pour ${row.name}...`,
    });
    // Logique de redirection vers le portail ici
  };

  const handleCopyId = async (id: string, investorId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(id);
    if (success) {
      setCopiedId(investorId);
      toast.success('ID copié !', { description: id });
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      toast.error('Erreur de copie', { description: 'Impossible de copier dans le presse-papier' });
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
      toast.info('Sélection annulée', {
        description: 'Tous les investisseurs ont été désélectionnés',
      });
    } else {
      const allIds = new Set(totalFilteredData.map(item => item.id));
      setSelectedIds(allIds);
      toast.success(`${allIds.size} investisseurs sélectionnés`, {
        description: `Toutes les pages sont sélectionnées (${allIds.size} investisseurs au total)`,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Prospect': return 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100';
      case 'En discussion': return 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100';
      case 'En relation': return 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100';
      case 'Archivé': return 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100';
      default: return 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'Validé': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'En cours': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'En revue': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'À revoir': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Expiré': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    return formatDate(date);
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
      className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider cursor-pointer group"
    >
      <div className="flex items-center gap-2">
        {label}
        <SortIcon columnKey={sortKey} />
      </div>
    </motion.th>
  );

  return (
    <>
      {/* Selection info banner - Outside scrollable area */}
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
                  {selectedIds.size} {selectedIds.size === 1 ? 'investisseur sélectionné' : 'investisseurs sélectionnés'}
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

      <div className="overflow-x-auto relative">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <th className="px-6 py-4 text-left">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <input 
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all cursor-pointer hover:scale-110"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectAll 
                      ? `Désélectionner tous les ${totalFilteredData.length} investisseurs (toutes pages)` 
                      : `Sélectionner tous les ${totalFilteredData.length} investisseurs (toutes pages)`}
                  </TooltipContent>
                </Tooltip>
              </th>
              <SortableHeader label="Nom" sortKey="name" />
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Contacts
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Structure
              </th>
              <SortableHeader label="Type" sortKey="type" />
              <SortableHeader label="Statut" sortKey="status" />
              <SortableHeader label="Date d'inscription" sortKey="registrationDate" />
              <SortableHeader label="Capital Investi" sortKey="totalInvested" />
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Souscriptions
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Segment
              </th>
              <SortableHeader label="Dernière activité" sortKey="lastActivity" />
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
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
                  onClick={() => onRowClick(row, 'profil')}
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

                  {/* Name + ID */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 max-w-[300px]">
                      <motion.span
                        whileHover={{ x: 2 }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline transition-all truncate"
                      >
                        <HighlightText 
                          text={row.name} 
                          searchTerm={searchTerm}
                        />
                      </motion.span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">ID: {row.id}</span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleCopyId(row.name, row.id, e)}
                          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          {copiedId === row.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </td>

                  {/* Contacts */}
                  <td className="px-6 py-4">
                    <ContactsCard 
                      contacts={row.contacts || []} 
                      investorName={row.name}
                      investorEmail={row.email}
                      investorPhone={row.phone}
                      searchTerm={searchTerm}
                    />
                  </td>

                  {/* Structure */}
                  <td className="px-6 py-4">
                    <StructuresCell 
                      structures={row.structures || []} 
                      searchTerm={searchTerm}
                    />
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors",
                      row.type === 'Individual' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    )}>
                      {row.type === 'Individual' ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5" />
                      )}
                      <span>{row.type}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors",
                      row.status === 'Prospect' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      row.status === 'En discussion' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      row.status === 'En relation' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    )}>
                      {row.status === 'Prospect' && <UserPlus className="w-3.5 h-3.5" />}
                      {row.status === 'En discussion' && <MessageCircle className="w-3.5 h-3.5" />}
                      {row.status === 'En relation' && <UserCheck className="w-3.5 h-3.5" />}
                      {row.status === 'Archivé' && <Archive className="w-3.5 h-3.5" />}
                      <span>{row.status}</span>
                    </div>
                  </td>

                  {/* Registration Date */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{formatDate(row.registrationDate)}</span>
                  </td>

                  {/* Total Invested */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(row.totalInvested)}
                      </span>
                    </div>
                  </td>

                  {/* Subscriptions Count - Clickable Badge */}
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(row, 'souscriptions');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer group"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-700" />
                      <span className="text-sm font-medium text-blue-700 group-hover:text-blue-800">
                        {row.subscriptionsCount}
                      </span>
                    </button>
                  </td>

                  {/* CRM Segment - Badge coloré professionnel */}
                  <td className="px-6 py-4">
                    {row.crmSegment ? (
                      <Badge 
                        variant="outline" 
                        style={{
                          backgroundColor: SEGMENT_COLORS[row.crmSegment]?.bgColor || '#F3F4F6',
                          color: SEGMENT_COLORS[row.crmSegment]?.color || '#6B7280',
                          borderColor: SEGMENT_COLORS[row.crmSegment]?.color || '#6B7280',
                        }}
                      >
                        {row.crmSegment}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-sm">—</span>
                    )}
                  </td>

                  {/* Last Activity */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <LastActivityCard date={row.lastActivity} />
                  </td>

                  {/* Partner */}
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <PartnerCard 
                      partnerName={row.partner} 
                      searchTerm={searchTerm}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </motion.button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => handleViewProfile(row, e as any)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir la fiche
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handlePortalConnection(row, e as any)}>
                          <LogIn className="w-4 h-4 mr-2" />
                          Connexion Portail
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

      {/* Audit Dialog */}
      <AuditLogDialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen} investor={selectedInvestorForAudit} />
    </>
  );
}