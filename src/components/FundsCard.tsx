import { motion } from 'motion/react';
import { TrendingUp, ChevronDown, Copy, Check } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { PartnerFund } from '../utils/partnerGenerator';
import { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

interface FundsCardProps {
  funds: PartnerFund[];
  searchTerm?: string;
}

export function FundsCard({ funds, searchTerm = '' }: FundsCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (funds.length === 0) {
    return (
      <span className="text-xs text-gray-400 italic">Aucun fonds</span>
    );
  }

  const handleCopy = async (text: string, field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      toast.success('Copié !', { description: text });
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      toast.error('Erreur de copie', { description: 'Impossible de copier dans le presse-papier' });
    }
  };

  // Afficher seulement le premier fonds avec un compteur
  const firstFund = funds[0];
  const remainingCount = funds.length - 1;

  // Grouper les fonds par nom de fonds
  const fundsByName = funds.reduce((acc, fund) => {
    if (!acc[fund.fundName]) {
      acc[fund.fundName] = [];
    }
    acc[fund.fundName].push(fund);
    return acc;
  }, {} as Record<string, PartnerFund[]>);

  // Nombre de fonds uniques
  const uniqueFundsCount = Object.keys(fundsByName).length;
  const remainingFundsCount = uniqueFundsCount - 1;

  // Trier les fonds : En collecte d'abord, puis les autres
  const sortedFundNames = Object.keys(fundsByName).sort((a, b) => {
    const aShares = fundsByName[a];
    const bShares = fundsByName[b];
    
    // Vérifier si au moins une part du fonds est en collecte
    const aInCollecte = aShares.some(s => s.status === 'En collecte');
    const bInCollecte = bShares.some(s => s.status === 'En collecte');
    
    if (aInCollecte && !bInCollecte) return -1;
    if (!aInCollecte && bInCollecte) return 1;
    return 0;
  });

  // Compter les fonds en collecte et fermés
  const fundsInCollecte = sortedFundNames.filter(name => 
    fundsByName[name].some(s => s.status === 'En collecte')
  );
  const fundsClosed = sortedFundNames.filter(name => 
    !fundsByName[name].some(s => s.status === 'En collecte')
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; border: string }> = {
      'En collecte': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      },
      'Actif': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200'
      },
      'Clôturé': {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200'
      },
      'Suspendu': {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200'
      }
    };
    return configs[status] || configs['Actif'];
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => handleCopy(text, field, e)}
      className="p-1 hover:bg-gray-100 rounded transition-colors"
    >
      {copiedField === field ? (
        <Check className="w-3 h-3 text-emerald-600" />
      ) : (
        <Copy className="w-3 h-3 text-gray-400" />
      )}
    </motion.button>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex flex-col items-start gap-1 text-xs group w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors w-full">
            <span className="text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0">
              <TrendingUp className="w-3 h-3" />
            </span>
            <span className="truncate max-w-[120px] group-hover:underline">
              {firstFund.fundName}
            </span>
          </div>
          {remainingFundsCount > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors ml-[18px]"
            >
              <span className="font-medium">+{remainingFundsCount} more</span>
              <ChevronDown className="w-3 h-3" />
            </motion.div>
          )}
        </motion.button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[520px] p-0" 
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
                className="p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600"
              >
                <TrendingUp className="w-5 h-5" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Droits de distribution
                </h3>
                <div className="text-xs text-gray-500">
                  {uniqueFundsCount} fonds autorisé{uniqueFundsCount > 1 ? 's' : ''} • {funds.length} part{funds.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Liste des fonds groupés par statut */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
            {/* Fonds en collecte */}
            {fundsInCollecte.length > 0 && (
              <div className="space-y-3">
                {/* En-tête du groupe de statut */}
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-semibold text-emerald-700 tracking-wide">
                    EN COLLECTE ({fundsInCollecte.length})
                  </div>
                  <div className="flex-1 h-px bg-emerald-200" />
                </div>

                {/* Cartes de fonds */}
                {fundsInCollecte.map((fundName, fundIdx) => {
                  const fundShares = fundsByName[fundName];
                  const isInCollecte = fundShares.some(s => s.status === 'En collecte');
                  
                  return (
                    <motion.div
                      key={fundName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fundIdx * 0.05 }}
                      className="rounded-lg border border-emerald-200 bg-white overflow-hidden"
                    >
                      {/* Nom du fonds - Carte principale */}
                      <div className="p-3 bg-emerald-50/50 border-b border-emerald-200">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div className="font-semibold text-gray-900 text-sm">
                            {fundName}
                          </div>
                        </div>
                      </div>

                      {/* Sous-cartes des parts */}
                      <div className="divide-y divide-gray-100">
                        {fundShares.map((share, shareIdx) => (
                          <div
                            key={share.fundId}
                            className="p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Nom de la part */}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-600">
                                  {share.shareClassName || 'Part Standard'}
                                </div>
                              </div>

                              {/* Taux de commission */}
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-sm px-2.5 py-1"
                                >
                                  {share.commissionRate.toFixed(2)}%
                                </Badge>
                                <CopyButton 
                                  text={`${fundName} - ${share.shareClassName || 'Part Standard'} - ${share.commissionRate.toFixed(2)}%`} 
                                  field={`share-${share.fundId}`} 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Fonds fermés */}
            {fundsClosed.length > 0 && (
              <div className="space-y-3">
                {/* En-tête du groupe de statut */}
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-semibold text-gray-500 tracking-wide">
                    FERMÉS ({fundsClosed.length})
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Cartes de fonds */}
                {fundsClosed.map((fundName, fundIdx) => {
                  const fundShares = fundsByName[fundName];
                  
                  return (
                    <motion.div
                      key={fundName}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fundIdx * 0.05 }}
                      className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                    >
                      {/* Nom du fonds - Carte principale */}
                      <div className="p-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <div className="font-semibold text-gray-700 text-sm">
                            {fundName}
                          </div>
                        </div>
                      </div>

                      {/* Sous-cartes des parts */}
                      <div className="divide-y divide-gray-100">
                        {fundShares.map((share, shareIdx) => (
                          <div
                            key={share.fundId}
                            className="p-3 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3">
                              {/* Nom de la part */}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-600">
                                  {share.shareClassName || 'Part Standard'}
                                </div>
                              </div>

                              {/* Taux de commission */}
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="bg-gray-50 text-gray-700 border-gray-300 font-semibold text-sm px-2.5 py-1"
                                >
                                  {share.commissionRate.toFixed(2)}%
                                </Badge>
                                <CopyButton 
                                  text={`${fundName} - ${share.shareClassName || 'Part Standard'} - ${share.commissionRate.toFixed(2)}%`} 
                                  field={`share-${share.fundId}`} 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 text-center">
              Taux de rétrocession par fonds • <Copy className="w-3 h-3 inline mx-0.5" /> pour copier
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}