import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription } from './alert';

/**
 * Avertissement dans une fenêtre ou un formulaire, juste avant la validation : document remplacé,
 * suppression définitive, saisie incohérente. Une phrase, pas de titre ni d'action.
 */
export function WarningNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Alert variant="destructive" className={className}>
      <TriangleAlert aria-hidden />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  );
}
