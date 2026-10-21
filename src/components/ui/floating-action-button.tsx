import type { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  /** Bouton enfoncé quand l'outil qu'il ouvre est affiché. */
  pressed?: boolean;
  /** false : rendu dans le flux, pour la page Design System. */
  docked?: boolean;
  className?: string;
}

/** Bouton flottant en bas à droite de la page, pour ouvrir un outil de démonstration (simulateur). */
export function FloatingActionButton({ icon: Icon, label, onClick, pressed, docked = true, className }: FloatingActionButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn('gap-2 rounded-full shadow-lg', docked && 'fixed bottom-6 right-6 z-40', className)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
