import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { HighlightText } from './HighlightText';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface ShareClassBadgeProps {
  shareClassName: string;
  isin?: string;
  searchTerm?: string;
  showTooltip?: boolean;
}

export function ShareClassBadge({ 
  shareClassName, 
  isin, 
  searchTerm = '',
  showTooltip = true 
}: ShareClassBadgeProps) {
  const badgeContent = (
    <Badge className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all duration-200">
      <span>Part <HighlightText text={shareClassName} searchTerm={searchTerm} /></span>
    </Badge>
  );

  if (!showTooltip || !isin) {
    return badgeContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-block"
        >
          {badgeContent}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500">
        <div className="flex flex-col gap-1.5 p-1">
          <p className="text-xs font-semibold text-white">Part {shareClassName}</p>
          {isin && <p className="text-xs font-mono text-indigo-100">{isin}</p>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
