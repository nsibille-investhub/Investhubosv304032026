import { useTranslation } from '../utils/languageContext';

interface DateTimeCellProps {
  date: Date | string;
}

export function DateTimeCell({ date }: DateTimeCellProps) {
  const { lang } = useTranslation();
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    return null;
  }

  const locale = lang === 'en' ? 'en-US' : 'fr-FR';
  const dateLabel = dateObj.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeLabel = dateObj.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="flex flex-col gap-0.5 leading-tight">
      <span className="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
        {dateLabel}
      </span>
      <span className="text-xs font-light text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {timeLabel}
      </span>
    </div>
  );
}
