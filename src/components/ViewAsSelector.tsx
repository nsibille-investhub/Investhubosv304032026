import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, X, Search, User, Building2, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Viewer, mockViewers, getInvestors, getContactsForInvestor } from '../utils/viewersMockData';

interface ViewAsSelectorProps {
  selectedViewer: Viewer | null;
  onViewerChange: (viewer: Viewer | null) => void;
}

export function ViewAsSelector({ selectedViewer, onViewerChange }: ViewAsSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer et grouper les viewers
  const filteredViewers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const investors = getInvestors().filter(inv => 
      inv.name.toLowerCase().includes(query) ||
      inv.email.toLowerCase().includes(query) ||
      inv.company?.toLowerCase().includes(query)
    );

    const contacts = mockViewers
      .filter(v => v.type === 'contact')
      .filter(contact => 
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query) ||
        contact.role?.toLowerCase().includes(query)
      );

    return { investors, contacts };
  }, [searchQuery]);

  const handleSelectViewer = (viewer: Viewer) => {
    onViewerChange(viewer);
    setOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onViewerChange(null);
    setSearchQuery('');
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={selectedViewer ? "default" : "outline"}
            className={`gap-2 ${
              selectedViewer 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30' 
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <Eye className="w-4 h-4" />
            {selectedViewer ? (
              <>
                <span className="font-medium">En tant que</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            ) : (
              <span>Vue investisseur</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un investisseur ou contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {/* Investisseurs Section */}
            {filteredViewers.investors.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <Building2 className="w-3.5 h-3.5" />
                    Investisseurs ({filteredViewers.investors.length})
                  </div>
                </div>
                <div className="py-1">
                  {filteredViewers.investors.map((investor) => (
                    <motion.button
                      key={investor.id}
                      whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
                      onClick={() => handleSelectViewer(investor)}
                      className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
                        {investor.avatar}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {investor.name}
                          </p>
                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                            Investisseur
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-500 truncate">{investor.company}</p>
                          {investor.role && (
                            <>
                              <span className="text-gray-300">•</span>
                              <p className="text-xs text-gray-500 truncate">{investor.role}</p>
                            </>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{investor.email}</p>
                      </div>

                      {/* Access count */}
                      <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{investor.allowedFolders.length} dossiers</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Contacts Section */}
            {filteredViewers.contacts.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-100 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    <User className="w-3.5 h-3.5" />
                    Contacts ({filteredViewers.contacts.length})
                  </div>
                </div>
                <div className="py-1">
                  {filteredViewers.contacts.map((contact) => {
                    const investor = mockViewers.find(v => v.id === contact.investorId);
                    return (
                      <motion.button
                        key={contact.id}
                        whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
                        onClick={() => handleSelectViewer(contact)}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm">
                          {contact.avatar}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {contact.name}
                            </p>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                              Contact
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {investor && (
                              <p className="text-xs text-gray-500 truncate">
                                Contact de {investor.name}
                              </p>
                            )}
                            {contact.role && (
                              <>
                                <span className="text-gray-300">•</span>
                                <p className="text-xs text-gray-500 truncate">{contact.role}</p>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{contact.email}</p>
                        </div>

                        {/* Access count */}
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{contact.allowedFolders.length} dossiers</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No results */}
            {filteredViewers.investors.length === 0 && filteredViewers.contacts.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Aucun résultat trouvé</p>
                <p className="text-xs text-gray-400 mt-1">
                  Essayez avec un autre nom ou email
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected viewer badge */}
      <AnimatePresence>
        {selectedViewer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {selectedViewer.avatar}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-medium text-purple-900 truncate">
                {selectedViewer.name}
              </p>
              <p className="text-xs text-purple-600 truncate">
                {selectedViewer.type === 'investor' ? selectedViewer.company : `Contact - ${selectedViewer.company}`}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="ml-2 p-1 hover:bg-purple-100 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-purple-700" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
