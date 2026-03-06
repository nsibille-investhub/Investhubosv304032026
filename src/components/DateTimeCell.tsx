import { Calendar as CalendarIcon } from 'lucide-react';

interface DateTimeCellProps {
  date: Date | string;
  variant?: 'default' | 'neutral';
}

export function DateTimeCell({ date, variant = 'neutral' }: DateTimeCellProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Calculer le temps relatif
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

  // Formater la date complète
  const formatFullDate = (date: Date): string => {
    const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const relativeTime = getRelativeTime(dateObj);
  const fullDate = formatFullDate(dateObj);

  // Déterminer le style en fonction du temps écoulé
  const getStyle = (relativeTime: string) => {
    // Si variant est "neutral", toujours retourner le style gris neutre
    if (variant === 'neutral') {
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-700',
        iconColor: 'text-gray-500 dark:text-gray-400',
        textColor: 'text-gray-900 dark:text-gray-100',
        subTextColor: 'text-gray-500 dark:text-gray-400'
      };
    }
    
    if (relativeTime.includes('min') || relativeTime.includes('h')) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-900 dark:text-blue-100',
        subTextColor: 'text-blue-600 dark:text-blue-400'
      };
    } else if (relativeTime.includes('jour') || relativeTime.includes('sem')) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-900 dark:text-amber-100',
        subTextColor: 'text-amber-600 dark:text-amber-400'
      };
    } else {
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-700',
        iconColor: 'text-gray-500 dark:text-gray-400',
        textColor: 'text-gray-900 dark:text-gray-100',
        subTextColor: 'text-gray-500 dark:text-gray-400'
      };
    }
  };

  const style = getStyle(relativeTime);

  return (
    <div className={`inline-flex items-start gap-2.5 px-3 py-2 rounded-lg ${style.bg} border ${style.border} min-w-[160px]`}>
      <CalendarIcon className={`w-4 h-4 ${style.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex flex-col gap-0.5">
        <div className={`text-sm font-medium ${style.textColor}`}>
          {relativeTime}
        </div>
        <div className={`text-xs ${style.subTextColor}`}>
          {fullDate}
        </div>
      </div>
    </div>
  );
}
