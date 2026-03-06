import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Briefcase, ChevronRight, TrendingUp, Percent } from 'lucide-react';
import { PartnerFund } from '../utils/partnerGenerator';
import { formatCurrency } from '../utils/formatters';
import { HighlightText } from './HighlightText';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from './ui/utils';

interface DistributionRightsCardProps {
  funds: PartnerFund[];
  searchTerm?: string;
}

interface GroupedFund {
  fundName: string;
  status?: string;
  totalShares: number;
  shares: Array<{
    shareClassName?: string;
    shares: number;
    commissionRate: number;
  }>;
}

export function DistributionRightsCard({ funds, searchTerm = '' }: DistributionRightsCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Regrouper les fonds par fundName et combiner leurs parts
  const groupedFunds = useMemo(() => {
    const grouped = new Map<string, GroupedFund>();
    
    funds.forEach(fund => {
      if (!grouped.has(fund.fundName)) {
        grouped.set(fund.fundName, {
          fundName: fund.fundName,
          status: fund.status,
          totalShares: 0,
          shares: []
        });
      }
      
      const group = grouped.get(fund.fundName)!;
      group.shares.push({
        shareClassName: fund.shareClassName,
        shares: fund.shares,
        commissionRate: fund.commissionRate
      });
      group.totalShares += fund.shares;
    });
    
    // Convertir en tableau et trier : Ouverts (En collecte/Actif) d'abord, puis Fermés (Clôturé/Suspendu)
    return Array.from(grouped.values()).sort((a, b) => {
      const aOpen = a.status === 'En collecte' || a.status === 'Actif';
      const bOpen = b.status === 'En collecte' || b.status === 'Actif';
      
      if (aOpen && !bOpen) return -1;
      if (!aOpen && bOpen) return 1;
      
      // Parmi les ouverts, prioriser "En collecte"
      if (aOpen && bOpen) {
        if (a.status === 'En collecte' && b.status !== 'En collecte') return -1;
        if (a.status !== 'En collecte' && b.status === 'En collecte') return 1;
      }
      
      return 0;
    });
  }, [funds]);

  // Compter les fonds en collecte
  const fundsInCollection = useMemo(() => {
    return groupedFunds.filter(f => f.status === 'En collecte').length;
  }, [groupedFunds]);

  if (!funds || funds.length === 0) {
    return (
      <span className="text-xs text-gray-400 dark:text-gray-500 italic">-</span>
    );
  }

  const getStatusConfig = (status?: string) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      'En collecte': { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
      'Actif': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' },
      'Clôturé': { bg: 'bg-gray-50 dark:bg-gray-900', text: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
      'Suspendu': { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' }
    };
    return configs[status || 'Actif'] || configs['Actif'];
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors group",
            fundsInCollection === 0
              ? "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              : "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40"
          )}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span className="flex items-center gap-1">
            <span className="font-semibold">{fundsInCollection}</span>
            <span>{fundsInCollection === 1 ? 'fonds' : 'fonds'}</span>
          </span>
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[480px] p-0 max-h-[550px] overflow-auto" 
        align="start" 
        side="right"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-3.5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 text-purple-600 dark:text-purple-400"
            >
              <TrendingUp className="w-4 h-4" />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Droits de distribution
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-purple-600 dark:text-purple-400">{fundsInCollection} en levée</span>
                {' '}&middot;{' '}
                {groupedFunds.length} {groupedFunds.length === 1 ? 'fonds autorisé' : 'fonds autorisés'}
              </p>
            </div>
          </div>

          {/* Liste des fonds groupés */}
          <div className="space-y-2.5">
            {groupedFunds.map((fund, idx) => {
              const statusConfig = getStatusConfig(fund.status);
              const isClosed = fund.status === 'Clôturé' || fund.status === 'Suspendu';
              
              return (
                <motion.div
                  key={fund.fundName}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-200",
                    isClosed 
                      ? "bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800 opacity-50" 
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-purple-200 dark:hover:border-purple-800"
                  )}
                >
                  {/* En-tête du fonds */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "text-sm font-semibold",
                        isClosed ? "text-gray-500 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"
                      )}>
                        <HighlightText text={fund.fundName} searchTerm={searchTerm} />
                      </h4>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {fund.shares.length} {fund.shares.length === 1 ? 'part habilitée' : 'parts habilitées'}
                      </p>
                    </div>
                    {fund.status && (
                      <span className={cn(
                        'px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap',
                        statusConfig.bg,
                        statusConfig.text,
                        statusConfig.border
                      )}>
                        {fund.status}
                      </span>
                    )}
                  </div>

                  {/* Total du fonds si plusieurs parts */}
                  {fund.shares.length > 1 && (
                    <div className={cn(
                      "mb-2 pb-2 border-b",
                      isClosed ? "border-gray-200 dark:border-gray-800" : "border-gray-100 dark:border-gray-800"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[11px] font-medium",
                          isClosed ? "text-gray-400 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"
                        )}>
                          Total fonds
                        </span>
                        <span className={cn(
                          "text-sm font-bold",
                          isClosed ? "text-gray-500 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"
                        )}>
                          {formatCurrency(fund.totalShares)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Liste des parts pour ce fonds */}
                  <div className="space-y-2">
                    {fund.shares.map((share, shareIdx) => (
                      <div key={shareIdx} className="space-y-1.5">
                        {share.shareClassName && (
                          <p className={cn(
                            "text-[11px] pl-2 border-l-2 font-medium",
                            isClosed 
                              ? "text-gray-400 dark:text-gray-600 border-gray-300 dark:border-gray-700" 
                              : "text-gray-600 dark:text-gray-400 border-purple-300 dark:border-purple-700"
                          )}>
                            Part: <HighlightText text={share.shareClassName} searchTerm={searchTerm} />
                          </p>
                        )}
                        
                        {/* Cartes KPIs pour cette part */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Montant levé */}
                          <div className={cn(
                            "p-2 rounded-lg border",
                            isClosed
                              ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
                              : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30"
                          )}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={cn(
                                "p-0.5 rounded",
                                isClosed
                                  ? "bg-gray-100 dark:bg-gray-800"
                                  : "bg-blue-100 dark:bg-blue-900/40"
                              )}>
                                <TrendingUp className={cn(
                                  "w-3 h-3",
                                  isClosed
                                    ? "text-gray-400 dark:text-gray-600"
                                    : "text-blue-600 dark:text-blue-400"
                                )} />
                              </div>
                              <p className={cn(
                                "text-[10px] uppercase tracking-wide font-medium",
                                isClosed
                                  ? "text-gray-400 dark:text-gray-600"
                                  : "text-blue-600 dark:text-blue-400"
                              )}>
                                Montant levé
                              </p>
                            </div>
                            <p className={cn(
                              "text-sm font-bold",
                              isClosed
                                ? "text-gray-500 dark:text-gray-500"
                                : "text-blue-700 dark:text-blue-300"
                            )}>
                              {formatCurrency(share.shares)}
                            </p>
                          </div>

                          {/* Taux rétrocession */}
                          <div className={cn(
                            "p-2 rounded-lg border",
                            isClosed
                              ? "bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800"
                              : "bg-purple-50/50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30"
                          )}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className={cn(
                                "p-0.5 rounded",
                                isClosed
                                  ? "bg-gray-100 dark:bg-gray-800"
                                  : "bg-purple-100 dark:bg-purple-900/40"
                              )}>
                                <Percent className={cn(
                                  "w-3 h-3",
                                  isClosed
                                    ? "text-gray-400 dark:text-gray-600"
                                    : "text-purple-600 dark:text-purple-400"
                                )} />
                              </div>
                              <p className={cn(
                                "text-[10px] uppercase tracking-wide font-medium",
                                isClosed
                                  ? "text-gray-400 dark:text-gray-600"
                                  : "text-purple-600 dark:text-purple-400"
                              )}>
                                Taux rétrocession
                              </p>
                            </div>
                            <p className={cn(
                              "text-sm font-bold",
                              isClosed
                                ? "text-gray-500 dark:text-gray-500"
                                : "text-purple-700 dark:text-purple-300"
                            )}>
                              {share.commissionRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}