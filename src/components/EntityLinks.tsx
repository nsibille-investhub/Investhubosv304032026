import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Users, TrendingUp, ExternalLink, ChevronRight, User } from 'lucide-react';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { LinkDetailCard } from './LinkDetailCard';

export interface EntityLink {
  id: string;
  type: 'investor' | 'distributor' | 'participation';
  reference: string;
  name: string;
  status?: string;
  amount?: string;
  percentage?: string;
  date?: string;
}

// Simple entity reference component (for single entities like contrepartie/partenaire)
interface SimpleEntityProps {
  entity: {
    name: string;
    id: string;
    type: 'individual' | 'corporate';
  };
}

export function SimpleEntityLink({ entity }: SimpleEntityProps) {
  const getIcon = () => {
    return entity.type === 'individual' ? (
      <User className="w-3 h-3" />
    ) : (
      <Building2 className="w-3 h-3" />
    );
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Navigate to entity details
          }}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors group"
        >
          <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
            {getIcon()}
          </span>
          <span className="max-w-[150px] truncate group-hover:underline">{entity.name}</span>
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-xs space-y-1">
          <div className="font-semibold">{entity.name}</div>
          <div className="text-gray-400">ID: {entity.id}</div>
          <div className="text-gray-400 capitalize">{entity.type}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface EntityLinksProps {
  links: EntityLink[];
  maxVisible?: number;
}

export function EntityLinks({ links, maxVisible = 2 }: EntityLinksProps) {
  const [selectedLink, setSelectedLink] = useState<EntityLink | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'investor':
        return <TrendingUp className="w-3 h-3" />;
      case 'distributor':
        return <Users className="w-3 h-3" />;
      case 'participation':
        return <Building2 className="w-3 h-3" />;
      default:
        return <ExternalLink className="w-3 h-3" />;
    }
  };

  const visibleLinks = links.slice(0, maxVisible);
  const remainingCount = links.length - maxVisible;

  const handleLinkClick = (link: EntityLink, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLink(link);
    setIsOpen(true);
  };

  if (links.length === 0) {
    return (
      <span className="text-sm text-gray-400 italic">No links</span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visibleLinks.map((link, idx) => (
        <Popover key={link.id} open={isOpen && selectedLink?.id === link.id} onOpenChange={(open) => {
          if (!open) {
            setIsOpen(false);
            setSelectedLink(null);
          }
        }}>
          <PopoverTrigger asChild>
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => handleLinkClick(link, e)}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <span className="text-gray-400 group-hover:text-blue-500 transition-colors">
                {getLinkIcon(link.type)}
              </span>
              <span className="max-w-[120px] truncate group-hover:underline">{link.reference}</span>
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-96 p-0" 
            align="start" 
            side="right"
            onClick={(e) => e.stopPropagation()}
          >
            <LinkDetailCard link={link} />
          </PopoverContent>
        </Popover>
      ))}

      {remainingCount > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <motion.button
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              +{remainingCount} more
            </motion.button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-3" 
            align="start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1">
              <h4 className="font-medium text-sm text-gray-900 mb-2">All Links ({links.length})</h4>
              {links.slice(maxVisible).map((link) => (
                <Popover key={link.id}>
                  <PopoverTrigger asChild>
                    <motion.button
                      whileHover={{ x: 2, backgroundColor: 'rgba(0,0,0,0.03)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLink(link);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-gray-50 group"
                    >
                      <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                        {getLinkIcon(link.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{link.reference}</div>
                        <div className="text-xs text-gray-500 capitalize">{link.type}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-0" side="right" onClick={(e) => e.stopPropagation()}>
                    <LinkDetailCard link={link} />
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
