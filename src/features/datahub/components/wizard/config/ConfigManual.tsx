import { Info } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../../../components/ui/alert';

export function ConfigManual() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          Saisie manuelle
        </h2>
        <p className="text-sm text-muted-foreground">
          Aucune configuration n'est requise à cette étape.
        </p>
      </header>

      <Alert>
        <Info />
        <AlertTitle>Rien à configurer pour l'instant</AlertTitle>
        <AlertDescription>
          Vous pourrez définir les colonnes et ajouter vos premières lignes à
          l'étape 4.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default ConfigManual;
