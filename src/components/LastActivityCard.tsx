import { motion } from 'motion/react';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { useTranslation } from '../utils/languageContext';

interface LastActivityCardProps {
  date: Date;
  relativeTime?: string;
  fullDate?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'default' | 'neutral';
}

export function LastActivityCard({ date, relativeTime: providedRelativeTime, fullDate: providedFullDate, onClick, variant = 'default' }: LastActivityCardProps) {
  const { t, lang } = useTranslation();

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);
    const diffMonths = Math.floor(diffMs / 2592000000);

    if (diffMins < 60) return t('investors.relativeTime.minAgo', { count: diffMins });
    if (diffHours < 24) return t('investors.relativeTime.hoursAgo', { count: diffHours });
    if (diffDays === 1) return t('investors.relativeTime.oneDayAgo');
    if (diffDays < 7) return t('investors.relativeTime.daysAgo', { count: diffDays });
    if (diffWeeks === 1) return t('investors.relativeTime.oneWeekAgo');
    if (diffWeeks < 4) return t('investors.relativeTime.weeksAgo', { count: diffWeeks });
    if (diffMonths === 1) return t('investors.relativeTime.oneMonthAgo');
    if (diffMonths < 12) return t('investors.relativeTime.monthsAgo', { count: diffMonths });
    return t('investors.relativeTime.overOneYear');
  };

  const formatFullDate = (date: Date): string => {
    const locale = lang === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const relativeTime = providedRelativeTime || getRelativeTime(date);
  const fullDate = providedFullDate || formatFullDate(date);

  const getRecency = (date: Date): 'recent' | 'medium' | 'old' => {
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffHours < 24) return 'recent';
    if (diffDays < 28) return 'medium';
    return 'old';
  };

  const recency = getRecency(date);

  const getLastUpdateStyle = () => {
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

    if (recency === 'recent') {
      return {
        bg: 'from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        iconColor: 'text-blue-600',
        iconHoverColor: 'group-hover:text-blue-700',
        dotColor: 'bg-blue-500',
        hoverBorder: 'hover:border-blue-300'
      };
    } else if (recency === 'medium') {
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

  const updateStyle = getLastUpdateStyle();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${updateStyle.bg} border ${updateStyle.border} cursor-pointer group transition-all`}
        >
          <div className="relative flex-shrink-0">
            <CalendarIcon className={`w-3.5 h-3.5 ${updateStyle.iconColor} transition-colors`} />
            {variant === 'default' && recency === 'recent' && (
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
          <div className="font-semibold text-white">{t('investors.table.lastActivity')}</div>
          <div className="text-gray-200">{fullDate}</div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
