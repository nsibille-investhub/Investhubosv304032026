import type { ReactNode } from 'react';
import { cn } from './utils';
import { toneSurface, type Tone } from './tone';

interface CalloutProps {
  tone?: Tone;
  children: ReactNode;
  /** "alert" pour un avertissement bloquant, "status" pour une information. */
  role?: 'alert' | 'status';
  className?: string;
}

/** Encadré d'information ou d'avertissement dans une modale ou un panneau. */
export function Callout({ tone = 'info', children, role = 'status', className }: CalloutProps) {
  return (
    <div className={cn('rounded-lg border px-3 py-2 text-sm', className)} style={toneSurface(tone)} role={role}>
      {children}
    </div>
  );
}
