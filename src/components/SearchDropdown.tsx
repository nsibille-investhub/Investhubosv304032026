import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Building2,
  User,
  FileText,
  HelpCircle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from '../utils/languageContext';

interface SearchResult {
  id: string;
  type: 'subscription' | 'investor_individual' | 'investor_corporate' | 'help' | 'document' | 'ai_suggestion';
  title: string;
  subtitle?: string;
  description?: string;
  icon?: any;
  path?: string;
  metadata?: string;
}

type TFn = (key: string, vars?: Record<string, string | number>) => string;

const mockSearchResults = (query: string, t: TFn): SearchResult[] => {
  const q = query.toLowerCase();
  
  const allResults: SearchResult[] = [
    // Subscriptions
    {
      id: 'sub-1',
      type: 'subscription',
      title: 'Souscription Premium Q1 2024',
      subtitle: '€250,000',
      description: 'Active • 15 investors',
      path: '/subscriptions/premium-q1-2024',
      metadata: '2 days ago'
    },
    {
      id: 'sub-2',
      type: 'subscription',
      title: 'Sous-fonds Innovation Tech',
      subtitle: '€1,2M',
      description: 'Closed • 42 investors',
      path: '/subscriptions/innovation-tech',
      metadata: '1 week ago'
    },
    {
      id: 'sub-3',
      type: 'subscription',
      title: 'Souscription Seed Round',
      subtitle: '€500K',
      description: 'Pending • 8 investors',
      path: '/subscriptions/seed-round',
      metadata: '3 days ago'
    },
    
    // Individual Investors
    {
      id: 'inv-1',
      type: 'investor_individual',
      title: 'Michel De Sousa',
      subtitle: 'Individual Investor',
      description: '12 subscriptions • €2.5M invested',
      path: '/investors/michel-de-sousa',
      metadata: 'Active'
    },
    {
      id: 'inv-2',
      type: 'investor_individual',
      title: 'Sophie Souchon',
      subtitle: 'Individual Investor',
      description: '5 subscriptions • €800K invested',
      path: '/investors/sophie-souchon',
      metadata: 'Active'
    },
    
    // Corporate Investors
    {
      id: 'corp-1',
      type: 'investor_corporate',
      title: 'RENDS-LES-SOUS SAS',
      subtitle: 'Corporate Entity',
      description: '8 subscriptions • €5.2M invested',
      path: '/investors/rends-les-sous',
      metadata: 'Active'
    },
    {
      id: 'corp-2',
      type: 'investor_corporate',
      title: 'Sous-Traitance Holding',
      subtitle: 'Corporate Entity',
      description: '3 subscriptions • €1.8M invested',
      path: '/investors/sous-traitance',
      metadata: 'Active'
    },
    
    // Help Articles
    {
      id: 'help-1',
      type: 'help',
      title: 'Comment créer une souscription ?',
      subtitle: 'Getting Started Guide',
      description: 'Learn how to create and manage subscriptions',
      path: '/help/create-subscription',
      metadata: '5 min read'
    },
    {
      id: 'help-2',
      type: 'help',
      title: 'Gérer les souscriptions multiples',
      subtitle: 'Advanced Features',
      description: 'Best practices for handling multiple subscriptions',
      path: '/help/manage-multiple-subscriptions',
      metadata: '8 min read'
    },
    {
      id: 'help-3',
      type: 'help',
      title: 'Comprendre les statuts de souscription',
      subtitle: 'FAQ',
      description: 'Everything about subscription statuses',
      path: '/help/subscription-statuses',
      metadata: '3 min read'
    },
    
    // Documents
    {
      id: 'doc-1',
      type: 'document',
      title: 'Souscriptions A.pdf',
      subtitle: 'Legal Document',
      description: 'Contract • Uploaded 2024-01-15',
      path: '/documents/souscriptions-a',
      metadata: '2.4 MB'
    },
    {
      id: 'doc-2',
      type: 'document',
      title: 'Sous-fonds Agreement.docx',
      subtitle: 'Legal Document',
      description: 'Agreement • Uploaded 2024-02-20',
      path: '/documents/sous-fonds-agreement',
      metadata: '1.8 MB'
    },
    {
      id: 'doc-3',
      type: 'document',
      title: 'Souscription Terms Q1.pdf',
      subtitle: 'Legal Document',
      description: 'Terms & Conditions • Uploaded 2024-03-01',
      path: '/documents/souscription-terms',
      metadata: '3.1 MB'
    },
  ];
  
  // Filter results based on query
  if (!query || query.length < 2) return [];
  
  const filtered = allResults.filter(result => 
    result.title.toLowerCase().includes(q) ||
    result.subtitle?.toLowerCase().includes(q) ||
    result.description?.toLowerCase().includes(q)
  );
  
  // Add AI suggestion if there are results
  if (filtered.length > 0 && query.length >= 3) {
    filtered.unshift({
      id: 'ai-1',
      type: 'ai_suggestion',
      title: t('search.ai.suggestionTitle', { query }),
      description: t('search.ai.suggestionDescription'),
      path: `/ai/ask?q=${encodeURIComponent(query)}`,
    });
  }
  
  return filtered.slice(0, 12); // Limit to 12 results
};

const getResultIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'subscription':
      return TrendingUp;
    case 'investor_individual':
      return User;
    case 'investor_corporate':
      return Building2;
    case 'help':
      return HelpCircle;
    case 'document':
      return FileText;
    case 'ai_suggestion':
      return Sparkles;
    default:
      return Search;
  }
};

const getResultColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'subscription':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        hover: 'hover:bg-blue-100/50'
      };
    case 'investor_individual':
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        hover: 'hover:bg-purple-100/50'
      };
    case 'investor_corporate':
      return {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600',
        hover: 'hover:bg-indigo-100/50'
      };
    case 'help':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: 'text-emerald-600',
        hover: 'hover:bg-emerald-100/50'
      };
    case 'document':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        hover: 'hover:bg-amber-100/50'
      };
    case 'ai_suggestion':
      return {
        bg: 'bg-gradient-to-r from-violet-50 to-fuchsia-50',
        border: 'border-violet-200',
        icon: 'text-violet-600',
        hover: 'hover:from-violet-100/50 hover:to-fuchsia-100/50'
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        icon: 'text-gray-600',
        hover: 'hover:bg-gray-100/50'
      };
  }
};

const getCategoryLabel = (type: SearchResult['type'], t: TFn) => {
  switch (type) {
    case 'subscription':
      return t('search.category.subscription');
    case 'investor_individual':
      return t('search.category.investorIndividual');
    case 'investor_corporate':
      return t('search.category.investorCorporate');
    case 'help':
      return t('search.category.help');
    case 'document':
      return t('search.category.document');
    case 'ai_suggestion':
      return t('search.category.aiSuggestion');
    default:
      return '';
  }
};

const highlightMatch = (text: string, query: string) => {
  if (!query || query.length < 2) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} className="bg-blue-100 text-blue-900 font-semibold rounded px-0.5">
        {part}
      </span>
    ) : (
      part
    )
  );
};

export function SearchDropdown() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const searchResults = mockSearchResults(query, t);
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query, t]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleResultClick(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('Navigate to:', result.path);
    setQuery('');
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const showDropdown = isFocused && results.length > 0;

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const orderedTypes: SearchResult['type'][] = [
    'ai_suggestion',
    'subscription',
    'investor_individual',
    'investor_corporate',
    'document',
    'help'
  ];

  return (
    <div ref={containerRef} className="relative">
      <motion.div 
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 border ${
          isFocused 
            ? 'bg-white border-blue-300 shadow-lg shadow-blue-500/10' 
            : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-200 shadow-sm'
        }`}
        whileHover={{ scale: isFocused ? 1 : 1.01 }}
      >
        <Search className={`w-4 h-4 transition-colors ${
          isFocused ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
        }`} />
        <input
          ref={inputRef}
          type="text"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none w-64 placeholder:text-gray-400 text-sm"
        />
        
        {/* Powered by AI badge */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-md"
            >
              <Sparkles className="w-3 h-3 text-violet-600" />
              <span className="text-[10px] font-semibold text-violet-700 uppercase tracking-wide">AI</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute top-full mt-2 w-[900px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-900">
                    {t(results.length > 1 ? 'search.resultsCountMany' : 'search.resultsCountOne', { count: results.length })}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-lg">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold text-violet-700">{t('search.poweredBy')}</span>
                </div>
              </div>
            </div>

            {/* 2 Column Layout */}
            <div className="grid grid-cols-[1fr_320px] h-[520px]">
              {/* Left Column - Main Results */}
              <div className="overflow-y-auto border-r border-gray-100 custom-scrollbar h-full">
                {orderedTypes.map((type) => {
                  // Skip help articles in left column
                  if (type === 'help') return null;
                  
                  const typeResults = groupedResults[type];
                  if (!typeResults || typeResults.length === 0) return null;

                  return (
                    <div key={type} className="border-b border-gray-100 last:border-b-0">
                      {/* Category Header - Only for non-AI suggestions */}
                      {type !== 'ai_suggestion' && (
                        <div className="px-4 py-2 bg-gray-50/50 sticky top-0 z-10">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {getCategoryLabel(type, t)}
                          </span>
                        </div>
                      )}
                      
                      {/* Results List */}
                      <div className="p-2">
                        {typeResults.map((result, index) => {
                          const Icon = getResultIcon(result.type);
                          const colors = getResultColor(result.type);
                          const globalIndex = results.indexOf(result);
                          const isSelected = globalIndex === selectedIndex;
                          const isAI = result.type === 'ai_suggestion';

                          return (
                            <motion.button
                              key={result.id}
                              whileHover={{ scale: 1.01, x: 2 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => handleResultClick(result)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                              className={`w-full px-3 py-2.5 rounded-xl transition-all duration-200 flex items-start gap-3 group ${
                                isSelected ? 'bg-gray-100 shadow-sm' : 'hover:bg-gray-50'
                              } ${isAI ? 'border-2 border-violet-200' : ''}`}
                            >
                              {/* Icon */}
                              <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center mt-0.5 ${
                                isSelected ? 'scale-110 shadow-md' : ''
                              } transition-all duration-200`}>
                                <Icon className={`w-4 h-4 ${colors.icon}`} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 text-left min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`font-semibold text-gray-900 truncate ${isAI ? 'text-sm' : 'text-sm'}`}>
                                    {highlightMatch(result.title, query)}
                                  </h4>
                                  {result.subtitle && !isAI && (
                                    <>
                                      <div className="w-1 h-1 bg-gray-300 rounded-full flex-shrink-0" />
                                      <span className="text-xs text-gray-500 flex-shrink-0">
                                        {result.subtitle}
                                      </span>
                                    </>
                                  )}
                                </div>
                                
                                {result.description && (
                                  <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">
                                    {highlightMatch(result.description, query)}
                                  </p>
                                )}
                                
                                {result.metadata && !isAI && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    <span>{result.metadata}</span>
                                  </div>
                                )}
                              </div>

                              {/* Arrow indicator */}
                              <motion.div
                                animate={{ 
                                  x: isSelected ? [0, 4, 0] : 0,
                                  opacity: isSelected ? 1 : 0.4
                                }}
                                transition={{ 
                                  duration: 1.5, 
                                  repeat: isSelected ? Infinity : 0,
                                  ease: "easeInOut"
                                }}
                                className="flex-shrink-0 mt-2.5"
                              >
                                {isAI ? (
                                  <Sparkles className="w-4 h-4 text-violet-500" />
                                ) : (
                                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                                )}
                              </motion.div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column - Help Center (Always Visible) */}
              <div className="bg-gradient-to-br from-emerald-50/30 to-teal-50/20 overflow-y-auto custom-scrollbar h-full flex flex-col">
                {/* Help Section Header */}
                <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">{t('search.helpCenter')}</h3>
                      <p className="text-[10px] text-emerald-600">{t('search.needHelp')}</p>
                    </div>
                  </div>
                </div>

                {/* Help Articles */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar">
                  {(() => {
                    const helpResults = groupedResults['help'] || [];
                    
                    // If no help results match query, show default articles
                    const articlesToShow = helpResults.length > 0 ? helpResults : [
                      {
                        id: 'help-default-1',
                        type: 'help' as const,
                        title: t('search.defaultHelp.gettingStartedTitle'),
                        subtitle: t('search.defaultHelp.gettingStartedSubtitle'),
                        description: t('search.defaultHelp.gettingStartedDescription'),
                        path: '/help/getting-started',
                        metadata: '5 min read'
                      },
                      {
                        id: 'help-default-2',
                        type: 'help' as const,
                        title: t('search.defaultHelp.entitiesTitle'),
                        subtitle: t('search.defaultHelp.entitiesSubtitle'),
                        description: t('search.defaultHelp.entitiesDescription'),
                        path: '/help/manage-entities',
                        metadata: '7 min read'
                      },
                      {
                        id: 'help-default-3',
                        type: 'help' as const,
                        title: t('search.defaultHelp.complianceTitle'),
                        subtitle: t('search.defaultHelp.complianceSubtitle'),
                        description: t('search.defaultHelp.complianceDescription'),
                        path: '/help/compliance',
                        metadata: '10 min read'
                      }
                    ];

                    return articlesToShow.map((article, idx) => {
                      const globalIndex = results.indexOf(article);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <motion.button
                          key={article.id}
                          whileHover={{ scale: 1.02, x: 2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleResultClick(article)}
                          onMouseEnter={() => globalIndex >= 0 && setSelectedIndex(globalIndex)}
                          className={`w-full p-3 rounded-xl transition-all duration-200 text-left group ${
                            isSelected 
                              ? 'bg-white shadow-md border-2 border-emerald-200' 
                              : 'bg-white/70 hover:bg-white border border-emerald-100/50 hover:border-emerald-200 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 mb-2">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center ${
                              isSelected ? 'scale-110 shadow-sm' : ''
                            } transition-all`}>
                              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-gray-900 mb-0.5 line-clamp-2 leading-snug">
                                {highlightMatch(article.title, query)}
                              </h4>
                              <p className="text-[11px] text-emerald-600 font-medium">
                                {article.subtitle}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-[11px] text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                            {article.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                              <Clock className="w-3 h-3" />
                              <span>{article.metadata}</span>
                            </div>
                            <motion.div
                              animate={{ 
                                x: isSelected ? [0, 3, 0] : 0 
                              }}
                              transition={{ 
                                duration: 1.5, 
                                repeat: isSelected ? Infinity : 0,
                                ease: "easeInOut"
                              }}
                            >
                              <ArrowRight className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-gray-400 group-hover:text-emerald-500'} transition-colors`} />
                            </motion.div>
                          </div>
                        </motion.button>
                      );
                    });
                  })()}
                </div>

                {/* Help Footer CTA */}
                <div className="sticky bottom-0 p-3 bg-gradient-to-t from-emerald-50 to-transparent border-t border-emerald-100/50">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">{t('search.viewAllArticles')}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm font-mono">↑↓</kbd>
                  <span>{t('search.navigate')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm font-mono">↵</kbd>
                  <span>{t('search.select')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded shadow-sm font-mono">Esc</kbd>
                  <span>{t('search.close')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
      `}</style>
    </div>
  );
}
