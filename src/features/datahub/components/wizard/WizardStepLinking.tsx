import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { BookOpen, Info, TrendingUp, Zap } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../../components/ui/alert';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../components/ui/radio-group';
import { SegmentedControl } from '../../../../components/ui/segmented-control';
import { Separator } from '../../../../components/ui/separator';
import { Switch } from '../../../../components/ui/switch';
import { Textarea } from '../../../../components/ui/textarea';
import type {
  InvestHubPivotObject,
  PivotTemporalType,
  WizardData,
  WizardVisibility,
} from '../../types';

type LucideIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

type LinkedMode = 'free' | 'objects';

interface PivotObjectDescriptor {
  key: InvestHubPivotObject;
  label: string;
  hint: string;
}

const PIVOT_OBJECTS: PivotObjectDescriptor[] = [
  { key: 'campaign', label: 'Campagne / Fonds', hint: 'ex : fund_code' },
  { key: 'subscription', label: 'Souscription', hint: 'ex : subscription_id' },
  { key: 'investor', label: 'Investisseur — LP', hint: 'ex : lp_id' },
  { key: 'contact', label: 'Contact', hint: 'ex : contact_email' },
  { key: 'distributor', label: 'Distributeur / CGP', hint: 'ex : distributor_id' },
  { key: 'capital-account', label: 'Capital Account', hint: 'ex : account_id' },
  { key: 'commitment', label: 'Engagement', hint: 'ex : commitment_id' },
];

interface PivotTypeDescriptor {
  key: PivotTemporalType;
  icon: LucideIcon;
  title: string;
  description: string;
  example: string;
  requiresColumn: boolean;
}

const PIVOT_TYPES: PivotTypeDescriptor[] = [
  {
    key: 'timeseries',
    icon: TrendingUp,
    title: 'Série temporelle',
    description:
      'Une ligne par date de valeur — recommandé pour KPIs fonds, NAV, flux trimestriels.',
    example: 'TVPI au 31/03/2026, TVPI au 31/12/2025…',
    requiresColumn: true,
  },
  {
    key: 'reference',
    icon: BookOpen,
    title: 'Référentiel',
    description: 'Une ligne par entité, mise à jour sur place.',
    example: 'Liste des participations, contacts, news',
    requiresColumn: false,
  },
  {
    key: 'event',
    icon: Zap,
    title: 'Évènementielle',
    description: 'Une ligne par évènement daté.',
    example: 'Appel de fonds, distribution, alerte',
    requiresColumn: true,
  },
];

const DEFAULT_VISIBILITY: WizardVisibility = {
  lpPortal: false,
  autoFilterByInvestor: true,
  distributorPortal: false,
};

export function slugifyTechnicalName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

const TECH_NAME_RE = /^[a-z0-9_]+$/;

export interface WizardStepLinkingProps {
  data: Partial<WizardData>;
  onChange: (patch: Partial<WizardData>) => void;
}

export function WizardStepLinking({ data, onChange }: WizardStepLinkingProps) {
  const linked = data.linkedPivotObjects ?? [];
  const pivotKeys = (data.pivotKeys ?? {}) as Partial<
    Record<InvestHubPivotObject, string>
  >;

  // Derive initial radio choice from data; otherwise default to 'free' once the
  // user interacts. We keep this local because an empty `linkedPivotObjects`
  // array is ambiguous (free vs. picked "objects" then unchecked everything).
  const [linkedMode, setLinkedMode] = useState<LinkedMode | undefined>(() => {
    if (linked.length > 0) return 'objects';
    if (data.linkedPivotObjects === undefined) return undefined;
    return 'free';
  });

  // Auto-slugify technicalName from displayName until the user manually edits it.
  const techEditedRef = useRef<boolean>(
    typeof data.technicalName === 'string' && data.technicalName.length > 0,
  );

  useEffect(() => {
    if (techEditedRef.current) return;
    const slug = slugifyTechnicalName(data.displayName ?? '');
    if (slug !== data.technicalName) onChange({ technicalName: slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.displayName]);

  const visibility: WizardVisibility = {
    ...DEFAULT_VISIBILITY,
    ...(data.visibility ?? {}),
  };

  const patchVisibility = (patch: Partial<WizardVisibility>) =>
    onChange({ visibility: { ...visibility, ...patch } });

  const toggleObject = (key: InvestHubPivotObject, checked: boolean) => {
    let nextLinked: InvestHubPivotObject[];
    let nextKeys: Partial<Record<InvestHubPivotObject, string>> = { ...pivotKeys };
    if (checked) {
      nextLinked = linked.includes(key) ? linked : [...linked, key];
    } else {
      nextLinked = linked.filter((o) => o !== key);
      delete nextKeys[key];
    }
    onChange({ linkedPivotObjects: nextLinked, pivotKeys: nextKeys });
  };

  const setPivotKey = (obj: InvestHubPivotObject, value: string) => {
    onChange({ pivotKeys: { ...pivotKeys, [obj]: value } });
  };

  const handleLinkedModeChange = (next: LinkedMode) => {
    setLinkedMode(next);
    if (next === 'free') {
      onChange({ linkedPivotObjects: [], pivotKeys: {} });
    } else if (data.linkedPivotObjects === undefined) {
      onChange({ linkedPivotObjects: [] });
    }
  };

  const selectedPivot = useMemo(
    () => PIVOT_TYPES.find((p) => p.key === data.pivotType),
    [data.pivotType],
  );

  const techNameInvalid =
    typeof data.technicalName === 'string' &&
    data.technicalName.length > 0 &&
    !TECH_NAME_RE.test(data.technicalName);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          Rattachement aux objets InvestHub
        </h2>
        <p className="text-sm text-muted-foreground">
          Déclarez comment votre collection se connecte aux objets métier
          InvestHub et comment elle sera exposée.
        </p>
      </header>

      {/* Bloc 1 — Identité */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">
          Identité de la collection
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="display-name">
              Nom affiché
              <span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="display-name"
              placeholder="Performance des fonds"
              value={data.displayName ?? ''}
              onChange={(e) => onChange({ displayName: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="technical-name">Nom technique</Label>
            <Input
              id="technical-name"
              placeholder="performance_fonds_astorg"
              value={data.technicalName ?? ''}
              onChange={(e) => {
                techEditedRef.current = true;
                onChange({
                  technicalName: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '_'),
                });
              }}
              aria-invalid={techNameInvalid || undefined}
              className="font-mono"
            />
            {techNameInvalid ? (
              <p className="text-xs text-destructive">
                Caractères autorisés : a-z, 0-9, underscore.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Auto-généré depuis le nom affiché — éditable.
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={2}
            placeholder="Décrivez brièvement ce que contient cette collection."
            value={data.description ?? ''}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </section>

      <Separator />

      {/* Bloc 2 — Rattachement */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">
          Rattachement aux objets InvestHub
        </h3>
        <p className="text-sm text-muted-foreground">
          Cette collection est-elle rattachée à des objets métier InvestHub ?
        </p>

        <div className="flex flex-col gap-2">
          <SegmentedControl<LinkedMode>
            aria-label="Rattachement aux objets InvestHub"
            value={linkedMode ?? 'free'}
            onValueChange={handleLinkedModeChange}
            options={[
              { value: 'free', label: 'Non, donnée libre' },
              { value: 'objects', label: 'Oui, rattachée aux objets' },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            {linkedMode === 'objects'
              ? 'Sélectionnez les objets et indiquez la colonne qui fait clé.'
              : 'Éditoriale, générale — non rattachée à un objet métier.'}
          </p>
        </div>

        {linkedMode === 'objects' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {PIVOT_OBJECTS.map((obj) => {
              const checked = linked.includes(obj.key);
              return (
                <div
                  key={obj.key}
                  className="flex flex-col gap-2 rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id={`obj-${obj.key}`}
                      checked={checked}
                      onCheckedChange={(c) =>
                        toggleObject(obj.key, c === true)
                      }
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={`obj-${obj.key}`}
                      className="font-medium"
                    >
                      {obj.label}
                    </Label>
                  </div>
                  {checked && (
                    <div className="flex flex-col gap-1 pl-6">
                      <Label
                        htmlFor={`key-${obj.key}`}
                        className="text-xs text-muted-foreground"
                      >
                        Clé de rattachement
                      </Label>
                      <Input
                        id={`key-${obj.key}`}
                        placeholder={obj.hint}
                        value={pivotKeys[obj.key] ?? ''}
                        onChange={(e) =>
                          setPivotKey(obj.key, e.target.value)
                        }
                        className="font-mono"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Alert>
          <Info />
          <AlertTitle>Pas de rattachement ?</AlertTitle>
          <AlertDescription>
            La collection reste exploitable en back-office mais ne peut pas
            filtrer l'affichage par LP ou campagne dans le portail.
          </AlertDescription>
        </Alert>
      </section>

      <Separator />

      {/* Bloc 3 — Dimension temporelle */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">
          Dimension temporelle
        </h3>
        <p className="text-sm text-muted-foreground">
          Comment le temps est-il structuré dans votre donnée ?
        </p>

        <RadioGroup
          value={data.pivotType ?? ''}
          onValueChange={(v) => onChange({ pivotType: v as PivotTemporalType })}
          className="gap-3"
        >
          {PIVOT_TYPES.map((p) => {
            const Icon = p.icon;
            const isSelected = data.pivotType === p.key;
            return (
              <Label
                key={p.key}
                htmlFor={`pivot-${p.key}`}
                className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                  isSelected
                    ? 'border-primary bg-muted/30'
                    : 'border-border hover:border-foreground/20'
                }`}
              >
                <RadioGroupItem
                  value={p.key}
                  id={`pivot-${p.key}`}
                  className="mt-1"
                />
                <Icon aria-hidden className="mt-0.5 size-5 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">{p.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {p.description}
                  </span>
                  <span className="text-xs text-muted-foreground italic">
                    {p.example}
                  </span>
                </div>
              </Label>
            );
          })}
        </RadioGroup>

        {selectedPivot?.requiresColumn && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="pivot-column">
              Quelle colonne contient la date pivot ?
            </Label>
            <Input
              id="pivot-column"
              placeholder="ex : date_valeur, date_call"
              value={data.pivotColumn ?? ''}
              onChange={(e) => onChange({ pivotColumn: e.target.value })}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              La correspondance sera vérifiée à l'étape 4.
            </p>
          </div>
        )}
      </section>

      <Separator />

      {/* Bloc 4 — Visibilité portail */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">
          Visibilité portail
        </h3>

        <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-card p-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="visibility-lp" className="text-sm font-medium">
              Afficher cette collection dans le portail LP ?
            </Label>
            <p className="text-xs text-muted-foreground">
              La collection devient visible pour les investisseurs connectés.
            </p>
          </div>
          <Switch
            id="visibility-lp"
            checked={visibility.lpPortal}
            onCheckedChange={(v) => patchVisibility({ lpPortal: v })}
          />
        </div>

        {visibility.lpPortal && (
          <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-card p-4">
            <div className="flex flex-col gap-0.5">
              <Label
                htmlFor="visibility-autofilter"
                className="text-sm font-medium"
              >
                Filtrer automatiquement par investisseur connecté ?
              </Label>
              <p className="text-xs text-muted-foreground">
                Chaque LP ne voit que les lignes qui le concernent.
              </p>
            </div>
            <Switch
              id="visibility-autofilter"
              checked={visibility.autoFilterByInvestor}
              onCheckedChange={(v) =>
                patchVisibility({ autoFilterByInvestor: v })
              }
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-card p-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="visibility-dist" className="text-sm font-medium">
              Afficher cette collection dans le portail Distributeur ?
            </Label>
            <p className="text-xs text-muted-foreground">
              Les CGP et distributeurs y auront accès.
            </p>
          </div>
          <Switch
            id="visibility-dist"
            checked={visibility.distributorPortal}
            onCheckedChange={(v) => patchVisibility({ distributorPortal: v })}
          />
        </div>
      </section>
    </div>
  );
}

export default WizardStepLinking;
