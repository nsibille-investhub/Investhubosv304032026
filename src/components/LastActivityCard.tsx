import { motion } from 'motion/react';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

interface LastActivityCardProps {
  date: Date;
  relativeTime?: string;
  fullDate?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'default' | 'neutral';
}

export function LastActivityCard({ date, relativeTime: providedRelativeTime, fullDate: providedFullDate, onClick, variant = 'default' }: LastActivityCardProps) {
  // Calculer le temps relatif si non fourni
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2592000000);
    
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffWeeks === 1) return 'Il y a 1 sem';
    if (diffWeeks < 4) return `Il y a ${diffWeeks} sem`;
    if (diffMonths === 1) return 'Il y a 1 mois';
    if (diffMonths < 12) return `Il y a ${diffMonths} mois`;
    return 'Il y a plus d\'un an';
  };

  // Formater la date complète si non fournie
  const formatFullDate = (date: Date): string => {
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const relativeTime = providedRelativeTime || getRelativeTime(date);
  const fullDate = providedFullDate || formatFullDate(date);

  // Déterminer le style en fonction du temps écoulé
  const getLastUpdateStyle = (relativeTime: string) => {
    // Si variant est "neutral", toujours retourner le style gris neutre
    if (variant === 'neutral') {
      return {
        bg: 'from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-900',
        border: 'border-gray-200 dark:border-gray-700',
        iconColor: 'text-gray-600 dark:text-gray-400',
        iconHoverColor: 'group-hover:text-gray-700 dark:group-hover:text-gray-300',
        dotColor: 'bg-gray-500',
        hoverBorder: 'hover:border-gray-300 dark:hover:border-gray-600'
      };
    }
    
    if (relativeTime.includes('min') || relativeTime.includes('h')) {
      return {
        bg: 'from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        iconColor: 'text-blue-600',
        iconHoverColor: 'group-hover:text-blue-700',
        dotColor: 'bg-blue-500',
        hoverBorder: 'hover:border-blue-300'
      };
    } else if (relativeTime.includes('jour') || relativeTime.includes('sem')) {
      return {
        bg: 'from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        iconColor: 'text-amber-600',
        iconHoverColor: 'group-hover:text-amber-700',
        dotColor: 'bg-amber-500',
        hoverBorder: 'hover:border-amber-300'
      };
    } else {
      return {
        bg: 'from-gray-50 to-slate-50',
        border: 'border-gray-200',
        iconColor: 'text-gray-600',
        iconHoverColor: 'group-hover:text-gray-700',
        dotColor: 'bg-gray-500',
        hoverBorder: 'hover:border-gray-300'
      };
    }
  };

  const updateStyle = getLastUpdateStyle(relativeTime);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${updateStyle.bg} border ${updateStyle.border} cursor-pointer group transition-all`}
        >
          <div className="relative flex-shrink-0">
            <CalendarIcon className={`w-3.5 h-3.5 ${updateStyle.iconColor} transition-colors`} />
            {variant === 'default' && (relativeTime.includes('min') || relativeTime.includes('h')) && (
              <motion.div
                className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 ${updateStyle.dotColor} rounded-full shadow-sm`}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>
          <div className="flex flex-col items-start gap-0 flex-1">
            <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 transition-colors whitespace-nowrap">
              {relativeTime}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 transition-colors whitespace-nowrap">
              {fullDate}
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="text-xs space-y-1">
          <div className="font-semibold text-white">Dernière activité</div>
          <div className="text-gray-200">{fullDate}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
