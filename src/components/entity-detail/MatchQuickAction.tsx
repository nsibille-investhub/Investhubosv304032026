import type { LucideIcon } from 'lucide-react';

interface MatchQuickActionProps {
  label: string;
  icon: LucideIcon;
  tone: 'danger' | 'warning' | 'success';
  onClick: () => void;
}

/** Bouton de qualification rapide d'un match (True Hit / Incertain / False Hit). */
export function MatchQuickAction({ label, icon: Icon, tone, onClick }: MatchQuickActionProps) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : 'var(--success)';
  const soft = tone === 'danger' ? 'var(--danger-soft)' : tone === 'warning' ? 'var(--warning-soft)' : 'var(--success-soft)';

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors hover:opacity-80"
      style={{ color, backgroundColor: soft, borderColor: `color-mix(in oklab, ${color} 35%, transparent)` }}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
