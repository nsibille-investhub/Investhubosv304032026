import { Timer } from 'lucide-react';

interface DurationCellProps {
  date: Date | string;
}

const formatDuration = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(diffMs / 604800000);
  const months = Math.floor(diffMs / 2592000000);

  if (minutes < 60) return `Il y a ${Math.max(minutes, 1)} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Il y a 1 jour';
  if (days < 7) return `Il y a ${days} jours`;
  if (weeks === 1) return 'Il y a 1 sem';
  if (weeks < 5) return `Il y a ${weeks} sem`;
  if (months === 1) return 'Il y a 1 mois';
  return `Il y a ${months} mois`;
};

export function DurationCell({ date }: DurationCellProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D8CB] bg-[#F8F7F1] px-3 py-1.5">
      <Timer className="h-3.5 w-3.5 text-[#0A3D4A]" />
      <span className="text-xs font-medium text-[#000E2B]">{formatDuration(dateObj)}</span>
    </div>
  );
}
