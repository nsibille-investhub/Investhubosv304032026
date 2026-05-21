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
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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

const SCOPES: { value: 'generic' | 'nominative'; label: string; description: string }[] = [
  { value: 'generic', label: 'Documents génériques', description: 'Documents non personnalisés (diffusion large)' },
  { value: 'nominative', label: 'Documents nominatifs', description: 'Documents adressés à un investisseur précis' },
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

  const currentScopes = publicationCenterSettings.aggregationScope;
  const toggleScope = (value: 'generic' | 'nominative') => {
    const set = new Set<'generic' | 'nominative'>(
      currentScopes === 'both'
        ? ['generic', 'nominative']
        : currentScopes === 'generic'
          ? ['generic']
          : currentScopes === 'nominative'
            ? ['nominative']
            : [],
    );
    if (set.has(value)) set.delete(value);
    else set.add(value);
    const arr = Array.from(set);
    const next: AggregationScope =
      arr.length === 2
        ? 'both'
        : arr.length === 1
          ? arr[0]
          : // Empty selection is not allowed — keep the previously selected scope.
            currentScopes;
    updatePublicationCenterSettings({ aggregationScope: next });
  };

  const isScopeSelected = (value: 'generic' | 'nominative') =>
    currentScopes === 'both' || currentScopes === value;

  const handleClose = () => {
    toast.success('Paramètres du Centre de Publication mis à jour');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle>Paramètres du Centre de Publication</DialogTitle>
          <DialogDescription>
            Configurez le workflow de validation et le regroupement automatique des documents.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <Card>
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">Notion d'équipe</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      Permet d'assigner une équipe de validation (Compliance, Legal, Middle Office…)
                      à chaque document à publier.
                    </CardDescription>
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
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                  <Shapes className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Critères d'agrégation</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    Les documents partageant le même <em>gabarit de notification</em> sont regroupés.
                    Cochez les critères supplémentaires à cumuler pour former un lot.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="space-y-2">
                {CRITERIA.map((c) => {
                  const checked = publicationCenterSettings.aggregationCriteria.includes(c.value);
                  const id = `criterion-${c.value}`;
                  return (
                    <label
                      key={c.value}
                      htmlFor={id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        onCheckedChange={() => toggleCriterion(c.value)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-gray-900">
                          {c.label}
                        </Label>
                        <p className="mt-0.5 text-xs text-gray-500">{c.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 pt-5 pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-700">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm">Portée du regroupement</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    Choisissez quels types de documents sont concernés par l'agrégation. Au moins
                    un type doit rester sélectionné.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0">
              <div className="space-y-2">
                {SCOPES.map((s) => {
                  const checked = isScopeSelected(s.value);
                  const onlyOneLeft = !isScopeSelected(s.value === 'generic' ? 'nominative' : 'generic');
                  const id = `scope-${s.value}`;
                  return (
                    <label
                      key={s.value}
                      htmlFor={id}
                      className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white p-3 hover:bg-gray-50"
                    >
                      <Checkbox
                        id={id}
                        checked={checked}
                        disabled={checked && onlyOneLeft}
                        onCheckedChange={() => toggleScope(s.value)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-gray-900">
                          {s.label}
                        </Label>
                        <p className="mt-0.5 text-xs text-gray-500">{s.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t border-gray-200 px-6 py-4">
          <Button onClick={handleClose}>Terminé</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
