import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, ChevronDown, Check, Globe, Search, X } from 'lucide-react';
import { Fund } from '../utils/fundGenerator';
import { cn } from './ui/utils';

interface FundContextSelectorProps {
  selectedFundId: number | null;
  onSelectFund: (fundId: number | null) => void;
  allFunds: Fund[];
}

export function FundContextSelector({ selectedFundId, onSelectFund, allFunds }: FundContextSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedFund = selectedFundId ? allFunds.find(f => f.id === selectedFundId) : null;
  const isGlobalContext = selectedFundId === null;
  const isClosed = selectedFund?.status === 'Clôturé';

  const filteredFunds = allFunds.filter(fund =>
    fund.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectFund = (fundId: number | null) => {
    onSelectFund(fundId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md group",
          isGlobalContext
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-300 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-600"
            : isClosed
              ? "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
              : "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-300 dark:border-emerald-700 hover:border-emerald-400 dark:hover:border-emerald-600"
        )}
      >
        {/* Icon */}
        <div className={cn(
          "p-2 rounded-lg transition-all duration-300",
          isGlobalContext
            ? "bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900"
            : isClosed
              ? "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
              : "bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900"
        )}>
          {isGlobalContext ? (
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Building2 className={cn(
              "w-5 h-5",
              isClosed ? "text-gray-600 dark:text-gray-400" : "text-emerald-600 dark:text-emerald-400"
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col items-start min-w-[200px]">
          <span className={cn(
            "text-sm font-semibold",
            isGlobalContext
              ? "text-blue-900 dark:text-blue-100"
              : isClosed
                ? "text-gray-900 dark:text-gray-100"
                : "text-emerald-900 dark:text-emerald-100"
          )}>
            {isGlobalContext ? 'Tous les fonds' : selectedFund?.name || 'Fonds sélectionné'}
          </span>
        </div>

        {/* Badge Count */}
        <div className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold",
          isGlobalContext
            ? "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
            : isClosed
              ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              : "bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200"
        )}>
          {isGlobalContext ? allFunds.length : '1'}
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={cn(
            "w-4 h-4",
            isGlobalContext
              ? "text-blue-600 dark:text-blue-400"
              : isClosed
                ? "text-gray-600 dark:text-gray-400"
                : "text-emerald-600 dark:text-emerald-400"
          )} />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-full left-0 mt-2 w-[450px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* Header with Search */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un fonds..."
                    className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-[400px] overflow-y-auto">
                {/* Global Context Option */}
                <motion.button
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                  onClick={() => handleSelectFund(null)}
                  className={cn(
                    "w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 transition-all",
                    isGlobalContext && "bg-blue-50 dark:bg-blue-950/30"
                  )}
                >
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      Tous les fonds
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Vue globale • {allFunds.length} fonds disponibles
                    </div>
                  </div>
                  {isGlobalContext && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Individual Funds */}
                {filteredFunds.length > 0 ? (
                  filteredFunds.map((fund) => {
                    const isSelected = selectedFundId === fund.id;
                    const isClosed = fund.status === 'Clôturé';
                    const iconBg = isClosed ? 'bg-gray-100 dark:bg-gray-800' : 'bg-emerald-100 dark:bg-emerald-900/50';
                    const iconColor = isClosed ? 'text-gray-600 dark:text-gray-400' : 'text-emerald-600 dark:text-emerald-400';
                    const hoverBg = isClosed ? 'rgba(156, 163, 175, 0.05)' : 'rgba(16, 185, 129, 0.05)';
                    const selectedBg = isClosed ? 'bg-gray-50 dark:bg-gray-900' : 'bg-emerald-50 dark:bg-emerald-950/30';
                    const checkColor = isClosed ? 'text-gray-600 dark:text-gray-400' : 'text-emerald-600 dark:text-emerald-400';
                    
                    return (
                      <motion.button
                        key={fund.id}
                        whileHover={{ backgroundColor: hoverBg }}
                        onClick={() => handleSelectFund(fund.id)}
                        className={cn(
                          "w-full px-4 py-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 transition-all",
                          isSelected && selectedBg
                        )}
                      >
                        <div className={cn("p-2 rounded-lg", iconBg)}>
                          <Building2 className={cn("w-5 h-5", iconColor)} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">
                            {fund.name}
                          </div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check className={cn("w-5 h-5", checkColor)} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun fonds trouvé</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {filteredFunds.length === allFunds.length 
                    ? `${allFunds.length} fonds au total`
                    : `${filteredFunds.length} sur ${allFunds.length} fonds`}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}