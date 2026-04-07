import { LastActivityCard } from './LastActivityCard';

interface DateTimeCellProps {
  date: Date | string;
  variant?: 'default' | 'neutral';
}

export function DateTimeCell({ date, variant = 'neutral' }: DateTimeCellProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return <LastActivityCard date={dateObj} variant={variant} />;
}
