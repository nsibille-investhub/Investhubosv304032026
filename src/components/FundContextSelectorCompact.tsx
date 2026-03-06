import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown, Check, Building2, Search, X } from 'lucide-react';
import { Fund } from '../utils/fundGenerator';
import { cn } from './ui/utils';

interface FundContextSelectorCompactProps {
  selectedFundId: number | null;
  onSelectFund: (fundId: number | null) => void;
  allFunds: Fund[];
  expanded: boolean;
}

export function FundContextSelectorCompact({ selectedFundId, onSelectFund, allFunds, expanded }: FundContextSelectorCompactProps) {
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

  if (!expanded) {
    // Version minimisée - juste l'icône
    return (
      <div className="relative px-2.5 mb-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full p-2 rounded-lg transition-all duration-200 flex items-center justify-center relative",
            isGlobalContext
              ? "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50"
              : isClosed
                ? "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                : "bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
          )}
          title={isGlobalContext ? 'Tous les fonds' : selectedFund?.name}
        >
          {isGlobalContext ? (
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Building2 className={cn(
              "w-4 h-4",
              isClosed ? "text-gray-600 dark:text-gray-400" : "text-emerald-600 dark:text-emerald-400"
            )} />
          )}
          {/* Indicator pour montrer qu'il y a une dropdown */}
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-400" />
        </motion.button>

        {/* Dropdown pour version minimisée */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-[9998]"
              />
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="fixed left-[72px] top-[80px] w-[380px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] overflow-hidden"
                style={{ 
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-blue-500 dark:bg-blue-600">
                      <Globe className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        Sélecteur de fonds
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        {allFunds.length} fonds disponibles
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher un fonds..."
                      className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      autoFocus
                    />
                    {searchTerm && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchTerm('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                  <GlobalOption isSelected={isGlobalContext} onClick={() => handleSelectFund(null)} fundsCount={allFunds.length} />
                  {filteredFunds.length > 0 ? (
                    filteredFunds.map((fund) => (
                      <FundOption
                        key={fund.id}
                        fund={fund}
                        isSelected={selectedFundId === fund.id}
                        onClick={() => handleSelectFund(fund.id)}
                      />
                    ))
                  ) : searchTerm ? (
                    <div className="px-4 py-8 text-center">
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-20 text-gray-400" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Aucun fonds trouvé
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        Essayez un autre terme de recherche
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="p-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center font-medium">
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

  // Version expandée
  return (
    <div className="relative px-2.5 mb-3">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2.5 border-2",
          isGlobalContext
            ? "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
            : isClosed
              ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
              : "bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700"
        )}
      >
        {/* Icon */}
        <div className={cn(
          "p-1.5 rounded-lg",
          isGlobalContext
            ? "bg-blue-100 dark:bg-blue-900/30"
            : isClosed
              ? "bg-gray-100 dark:bg-gray-800"
              : "bg-emerald-100 dark:bg-emerald-900/30"
        )}>
          {isGlobalContext ? (
            <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Building2 className={cn(
              "w-3.5 h-3.5",
              isClosed ? "text-gray-600 dark:text-gray-400" : "text-emerald-600 dark:text-emerald-400"
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          <div className={cn(
            "text-xs font-semibold truncate",
            isGlobalContext
              ? "text-gray-900 dark:text-gray-100"
              : isClosed
                ? "text-gray-900 dark:text-gray-100"
                : "text-emerald-900 dark:text-emerald-100"
          )}>
            {isGlobalContext ? 'Tous les fonds' : selectedFund?.name || 'Fonds sélectionné'}
          </div>
        </div>

        {/* Badge */}
        <div className={cn(
          "px-2 py-0.5 rounded-md text-[10px] font-bold",
          isGlobalContext
            ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
            : isClosed
              ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              : "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
        )}>
          {isGlobalContext ? allFunds.length : '1'}
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className={cn(
            "w-3 h-3",
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-full left-2.5 right-2.5 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* Header with Search */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full pl-9 pr-9 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    autoFocus
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Options List */}
              <div className="max-h-[350px] overflow-y-auto">
                <GlobalOption isSelected={isGlobalContext} onClick={() => handleSelectFund(null)} fundsCount={allFunds.length} />
                
                {filteredFunds.length > 0 ? (
                  filteredFunds.map((fund) => (
                    <FundOption
                      key={fund.id}
                      fund={fund}
                      isSelected={selectedFundId === fund.id}
                      onClick={() => handleSelectFund(fund.id)}
                    />
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">Aucun fonds trouvé</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
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

// Composants helper
function GlobalOption({ isSelected, onClick, fundsCount }: { isSelected: boolean; onClick: () => void; fundsCount: number }) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2.5 flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-800 transition-all text-left",
        isSelected && "bg-blue-50 dark:bg-blue-950/30"
      )}
    >
      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex-shrink-0">
        <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
          Tous les fonds
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400">
          Vue globale • {fundsCount} fonds
        </div>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        </motion.div>
      )}
    </motion.button>
  );
}

function FundOption({ fund, isSelected, onClick }: { fund: Fund; isSelected: boolean; onClick: () => void }) {
  const isClosed = fund.status === 'Clôturé';
  const iconBg = isClosed ? 'bg-gray-100 dark:bg-gray-800' : 'bg-emerald-100 dark:bg-emerald-900/50';
  const iconColor = isClosed ? 'text-gray-600 dark:text-gray-400' : 'text-emerald-600 dark:text-emerald-400';
  const hoverBg = isClosed ? 'rgba(156, 163, 175, 0.05)' : 'rgba(16, 185, 129, 0.05)';
  const selectedBg = isClosed ? 'bg-gray-50 dark:bg-gray-900' : 'bg-emerald-50 dark:bg-emerald-950/30';
  const checkColor = isClosed ? 'text-gray-600 dark:text-gray-400' : 'text-emerald-600 dark:text-emerald-400';

  return (
    <motion.button
      whileHover={{ backgroundColor: hoverBg }}
      onClick={onClick}
      className={cn(
        "w-full px-3 py-2.5 flex items-center gap-2.5 border-b border-gray-100 dark:border-gray-800 transition-all text-left",
        isSelected && selectedBg
      )}
    >
      <div className={cn("p-1.5 rounded-lg flex-shrink-0", iconBg)}>
        <Building2 className={cn("w-4 h-4", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
          {fund.name}
        </div>
      </div>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <Check className={cn("w-4 h-4 flex-shrink-0", checkColor)} />
        </motion.div>
      )}
    </motion.button>
  );
}