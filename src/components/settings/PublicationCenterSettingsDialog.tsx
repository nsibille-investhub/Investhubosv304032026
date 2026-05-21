import React from 'react';
import { Users, Shapes, Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  useAppStore,
  AggregationCriterion,
  AggregationScope,
} from '../../utils/appStoreContext';

interface PublicationCenterSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const CRITERIA: { value: AggregationCriterion; label: string; description: string }[] = [
  { value: 'investor', label: 'Investisseur', description: 'Documents partageant le même investisseur' },
  { value: 'subscription', label: 'Souscription', description: 'Documents liés à la même souscription' },
  { value: 'fund', label: 'Fonds', description: 'Documents portant sur le même fonds' },
];

const SCOPES: { value: AggregationScope; label: string; description: string }[] = [
  { value: 'generic', label: 'Documents génériques', description: 'Uniquement les documents non personnalisés' },
  { value: 'nominative', label: 'Documents nominatifs', description: 'Uniquement les documents adressés nominativement' },
  { value: 'both', label: 'Les deux', description: 'Génériques et nominatifs sont regroupés' },
];

export function PublicationCenterSettingsDialog({
  open,
  onClose,
}: PublicationCenterSettingsDialogProps) {
  const { publicationCenterSettings, updatePublicationCenterSettings } = useAppStore();

  const toggleCriterion = (criterion: AggregationCriterion) => {
    const current = publicationCenterSettings.aggregationCriteria;
    const next = current.includes(criterion)
      ? current.filter((c) => c !== criterion)
      : [...current, criterion];
    updatePublicationCenterSettings({ aggregationCriteria: next });
  };

  const handleClose = () => {
    toast.success('Paramètres du Centre de Publication mis à jour');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Paramètres du Centre de Publication</DialogTitle>
          <DialogDescription>
            Configurez le workflow de validation et le regroupement automatique des documents.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Teams toggle */}
          <section className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <Label htmlFor="teams-enabled" className="text-sm font-medium">
                    Notion d'équipe
                  </Label>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Permet d'assigner une équipe de validation (Compliance, Legal, Middle Office…)
                    à chaque document à publier.
                  </p>
                </div>
              </div>
              <Switch
                id="teams-enabled"
                checked={publicationCenterSettings.teamsEnabled}
                onCheckedChange={(checked) =>
                  updatePublicationCenterSettings({ teamsEnabled: checked === true })
                }
              />
            </div>
          </section>

          {/* Aggregation criteria */}
          <section className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                <Shapes className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Critères d'agrégation</Label>
                <p className="mt-0.5 text-xs text-gray-500">
                  Les documents partageant le même <em>gabarit de notification</em> sont regroupés.
                  Cochez les critères supplémentaires à cumuler pour former un lot.
                </p>
                <div className="mt-3 space-y-2">
                  {CRITERIA.map((c) => {
                    const checked = publicationCenterSettings.aggregationCriteria.includes(c.value);
                    return (
                      <label
                        key={c.value}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-2.5 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCriterion(c.value)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-gray-900">{c.label}</span>
                          <span className="block text-xs text-gray-500">{c.description}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Aggregation scope */}
          <section className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">Portée du regroupement</Label>
                <p className="mt-0.5 text-xs text-gray-500">
                  Choisissez quels types de documents sont concernés par l'agrégation.
                </p>
                <RadioGroup
                  value={publicationCenterSettings.aggregationScope}
                  onValueChange={(value) =>
                    updatePublicationCenterSettings({ aggregationScope: value as AggregationScope })
                  }
                  className="mt-3 space-y-2"
                >
                  {SCOPES.map((s) => (
                    <label
                      key={s.value}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-2.5 hover:bg-gray-50"
                    >
                      <RadioGroupItem value={s.value} id={`scope-${s.value}`} className="mt-0.5" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-gray-900">{s.label}</span>
                        <span className="block text-xs text-gray-500">{s.description}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button onClick={handleClose}>Terminé</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
