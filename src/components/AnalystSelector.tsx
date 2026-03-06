import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Check, ChevronDown, Search } from 'lucide-react';

interface Analyst {
  id: string;
  name: string;
  avatar: string;
  email: string;
  status: 'active' | 'away' | 'busy';
}

const mockAnalysts: Analyst[] = [
  { id: '1', name: 'Jean Dault', avatar: 'JD', email: 'jean.dault@investhub.io', status: 'active' },
  { id: '2', name: 'Sophie Martin', avatar: 'SM', email: 'sophie.martin@investhub.io', status: 'active' },
  { id: '3', name: 'Marc Dubois', avatar: 'MD', email: 'marc.dubois@investhub.io', status: 'active' },
  { id: '4', name: 'Claire Rousseau', avatar: 'CR', email: 'claire.rousseau@investhub.io', status: 'active' },
  { id: '5', name: 'Thomas Bernard', avatar: 'TB', email: 'thomas.bernard@investhub.io', status: 'active' },
  { id: '6', name: 'Emma Leroy', avatar: 'EL', email: 'emma.leroy@investhub.io', status: 'active' },
];

interface AnalystSelectorProps {
  currentAnalyst: string | null;
  onAnalystChange: (analystName: string) => void;
  compact?: boolean;
}

export function AnalystSelector({ currentAnalyst, onAnalystChange, compact = false }: AnalystSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredAnalysts = mockAnalysts.filter(analyst =>
    analyst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    analyst.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedAnalyst = mockAnalysts.find(a => a.name === currentAnalyst);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleAnalystSelect = (analyst: Analyst) => {
    onAnalystChange(analyst.name);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getStatusColor = (status: Analyst['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500';
      case 'away':
        return 'bg-amber-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (compact) {
    return (
      <div ref={containerRef} className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all duration-200 ${
            isOpen
              ? 'bg-blue-50 border-blue-200 shadow-sm'
              : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
          } border`}
        >
          {selectedAnalyst ? (
            <>
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[10px] text-white font-medium">
                {selectedAnalyst.avatar}
              </div>
              <span className="text-xs font-medium text-gray-700">{selectedAnalyst.name.split(' ')[0]}</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Assign</span>
            </>
          )}
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
            >
              {/* Search */}
              <div className="p-2 border-b border-gray-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search analysts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-xs placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Analysts List */}
              <div className="max-h-64 overflow-y-auto p-1">
                {filteredAnalysts.length > 0 ? (
                  filteredAnalysts.map((analyst) => (
                    <motion.button
                      key={analyst.id}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleAnalystSelect(analyst)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        selectedAnalyst?.id === analyst.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs text-white font-medium">
                          {analyst.avatar}
                        </div>
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-xs font-semibold text-gray-900 truncate">{analyst.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{analyst.email}</div>
                      </div>
                      {selectedAnalyst?.id === analyst.id && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </motion.button>
                  ))
                ) : (
                  <div className="px-3 py-6 text-center text-xs text-gray-500">
                    No analysts found
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full size version (for DecisionPanel)
  return (
    <div ref={containerRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isOpen
            ? 'bg-blue-50 border-2 border-blue-300 shadow-md'
            : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {selectedAnalyst ? (
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm text-white font-medium shadow-sm">
                {selectedAnalyst.avatar}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-gray-900">{selectedAnalyst.name}</div>
                <div className="text-xs text-gray-500">{selectedAnalyst.email}</div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-500">Assign Analyst</div>
                <div className="text-xs text-gray-400">Click to select</div>
              </div>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search analysts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Analysts List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredAnalysts.length > 0 ? (
                filteredAnalysts.map((analyst) => (
                  <motion.button
                    key={analyst.id}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleAnalystSelect(analyst)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${
                      selectedAnalyst?.id === analyst.id
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-sm text-white font-medium shadow-sm">
                        {analyst.avatar}
                      </div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{analyst.name}</div>
                      <div className="text-xs text-gray-500 truncate">{analyst.email}</div>
                    </div>
                    {selectedAnalyst?.id === analyst.id && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </motion.button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No analysts found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
