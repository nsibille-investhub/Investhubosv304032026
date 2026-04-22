import { useEffect, useMemo, useRef, type ComponentType } from 'react';
import {
  ArrowRight,
  BookOpen,
  Info,
  Link2,
  Plus,
  Sparkles,
  TrendingUp,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { SegmentedControl } from '../../../../components/ui/segmented-control';
import { Separator } from '../../../../components/ui/separator';
import { Switch } from '../../../../components/ui/switch';
import { Textarea } from '../../../../components/ui/textarea';
import {
  MAPPING_TEMPLATES,
  templatesFor,
} from '../../seed/mappings';
import type {
  CollectionLinkStrategy,
  FieldMapping,
  InvestHubPivotObject,
  PivotReferential,
  PivotTemporalType,
  WizardData,
  WizardVisibility,
} from '../../types';

type LucideIcon = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

function newMappingId(): string {
  return `map_${Math.random().toString(36).slice(2, 9)}`;
}

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
  const fieldMappings: FieldMapping[] = data.fieldMappings ?? [];
  const pivotReferentials: PivotReferential[] = data.pivotReferentials ?? [];

  // Resolved link strategy (persisted in WizardData).
  const linkStrategy: CollectionLinkStrategy =
    data.linkStrategy ?? (linked.length > 0 ? 'link' : 'free');

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

  const handleLinkStrategyChange = (next: CollectionLinkStrategy) => {
    if (next === 'free') {
      onChange({
        linkStrategy: 'free',
        linkedPivotObjects: [],
        pivotKeys: {},
        fieldMappings: [],
        pivotReferentials: [],
        mappingTemplateId: undefined,
      });
    } else {
      onChange({
        linkStrategy: next,
        linkedPivotObjects: linked,
      });
    }
  };

  const addFieldMapping = () => {
    onChange({
      fieldMappings: [
        ...fieldMappings,
        { id: newMappingId(), sourceColumn: '', targetField: '' },
      ],
    });
  };

  const updateFieldMapping = (id: string, patch: Partial<FieldMapping>) => {
    onChange({
      fieldMappings: fieldMappings.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    });
  };

  const removeFieldMapping = (id: string) => {
    onChange({ fieldMappings: fieldMappings.filter((m) => m.id !== id) });
  };

  const applyMappingTemplate = (templateId: string) => {
    const template = MAPPING_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    // Overwrite existing mappings with the template and union the pivot
    // objects, so the user keeps their existing selections as a superset.
    const mergedObjects: InvestHubPivotObject[] = Array.from(
      new Set([...linked, ...template.pivotObjects]),
    );
    onChange({
      mappingTemplateId: templateId,
      fieldMappings: template.mappings.map((m) => ({
        id: newMappingId(),
        ...m,
      })),
      linkedPivotObjects: mergedObjects,
    });
  };

  const getReferential = (
    pivot: InvestHubPivotObject,
  ): PivotReferential | undefined =>
    pivotReferentials.find((r) => r.pivotObject === pivot);

  const setReferential = (
    pivot: InvestHubPivotObject,
    patch: Partial<PivotReferential>,
  ) => {
    const existing = getReferential(pivot);
    const next: PivotReferential = existing
      ? { ...existing, ...patch }
      : { pivotObject: pivot, mode: 'existing', ...patch };
    onChange({
      pivotReferentials: [
        ...pivotReferentials.filter((r) => r.pivotObject !== pivot),
        next,
      ],
    });
  };

  const collectionColumns = data.columns ?? [];

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
      <section className="flex flex-col gap-5">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Rattachement aux objets InvestHub
          </h3>
          <p className="text-sm text-muted-foreground">
            Cette collection est-elle rattachée à des objets métier InvestHub&nbsp;?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <SegmentedControl<CollectionLinkStrategy>
            aria-label="Stratégie de rattachement"
            value={linkStrategy}
            onValueChange={handleLinkStrategyChange}
            options={[
              { value: 'free', label: 'Non, donnée libre' },
              {
                value: 'link',
                label: 'Relier aux objets existants',
                icon: <Link2 className="size-4" />,
              },
              {
                value: 'create',
                label: 'Créer des objets InvestHub',
                icon: <Sparkles className="size-4" />,
              },
            ]}
          />
          <p className="text-xs text-muted-foreground">
            {linkStrategy === 'free' &&
              'Éditoriale, générale — non rattachée à un objet métier.'}
            {linkStrategy === 'link' &&
              'Chaque ligne référence un objet InvestHub existant via une clé pivot (fund_id, lp_id…).'}
            {linkStrategy === 'create' &&
              'Chaque ligne crée (ou met à jour) un objet dans InvestHub. L’agent d’ingestion les instancie automatiquement.'}
          </p>
        </div>

        {linkStrategy !== 'free' && (
          <>
            {/* Objects grid — same pattern as before but also surfaces referentials */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Objets pivots
              </h4>
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
            </div>

            <Separator />

            {/* Mapping des champs */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Mapping des champs
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {linkStrategy === 'link'
                      ? 'Associez chaque colonne source à l’attribut de l’objet InvestHub qu’elle renseigne.'
                      : 'Associez chaque colonne source à l’attribut de l’objet à créer.'}
                  </p>
                </div>
                <div className="shrink-0">
                  <Select
                    value={data.mappingTemplateId ?? ''}
                    onValueChange={applyMappingTemplate}
                  >
                    <SelectTrigger className="w-[260px]" aria-label="Appliquer un modèle de mapping">
                      <Wand2 className="mr-2 size-4 text-muted-foreground" />
                      <SelectValue placeholder="Appliquer un modèle…" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {MAPPING_TEMPLATES.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{tpl.name}</span>
                            {tpl.description ? (
                              <span className="text-xs text-muted-foreground">
                                {tpl.description}
                              </span>
                            ) : null}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {fieldMappings.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                  <p className="text-sm text-foreground">
                    Aucun mapping configuré.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Appliquez un modèle ci-dessus ou ajoutez un mapping manuel.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFieldMapping}
                    className="mt-1 gap-1.5"
                  >
                    <Plus className="size-4" />
                    Ajouter un mapping
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border rounded-md border border-border">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-3 bg-muted/40 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    <span>Colonne source</span>
                    <span aria-hidden />
                    <span>Attribut InvestHub</span>
                    <span className="w-8" aria-hidden />
                  </div>
                  {fieldMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2"
                    >
                      {collectionColumns.length > 0 ? (
                        <Select
                          value={mapping.sourceColumn}
                          onValueChange={(v) =>
                            updateFieldMapping(mapping.id, { sourceColumn: v })
                          }
                        >
                          <SelectTrigger className="h-9" aria-label="Colonne source">
                            <SelectValue placeholder="Sélectionner…" />
                          </SelectTrigger>
                          <SelectContent>
                            {collectionColumns.map((col) => (
                              <SelectItem
                                key={col.id}
                                value={col.technicalName}
                              >
                                <span className="font-mono text-xs">
                                  {col.technicalName}
                                </span>
                                {col.label ? (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {col.label}
                                  </span>
                                ) : null}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={mapping.sourceColumn}
                          onChange={(e) =>
                            updateFieldMapping(mapping.id, {
                              sourceColumn: e.target.value,
                            })
                          }
                          placeholder="ex : fund_id"
                          className="h-9 font-mono text-xs"
                        />
                      )}
                      <ArrowRight
                        aria-hidden
                        className="size-4 text-muted-foreground"
                      />
                      <Input
                        value={mapping.targetField}
                        onChange={(e) =>
                          updateFieldMapping(mapping.id, {
                            targetField: e.target.value,
                          })
                        }
                        placeholder="ex : campaign.code"
                        className="h-9 font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Supprimer ce mapping"
                        onClick={() => removeFieldMapping(mapping.id)}
                        className="size-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-muted/20 px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      {fieldMappings.length} mapping(s)
                      {data.mappingTemplateId ? (
                        <>
                          {' · '}
                          <Badge variant="outline" className="ml-1 gap-1">
                            <Wand2 className="size-3" />
                            {
                              MAPPING_TEMPLATES.find(
                                (t) => t.id === data.mappingTemplateId,
                              )?.name
                            }
                          </Badge>
                        </>
                      ) : null}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addFieldMapping}
                      className="gap-1.5"
                    >
                      <Plus className="size-4" />
                      Ajouter un mapping
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {linked.length > 0 && (
              <>
                <Separator />

                {/* Référentiels d'identifiants */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Référentiels d’identifiants
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Pour chaque objet pivot, maintenez la correspondance
                      entre l’id externe (ex.&nbsp;
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                        ext_fund_id
                      </code>
                      ) et l’id interne InvestHub (ex.&nbsp;
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                        fund_id
                      </code>
                      ).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {linked.map((pivot) => {
                      const descriptor = PIVOT_OBJECTS.find(
                        (p) => p.key === pivot,
                      );
                      const ref = getReferential(pivot);
                      const mode = ref?.mode ?? 'existing';
                      const available = templatesFor(pivot);
                      return (
                        <div
                          key={pivot}
                          className="flex flex-col gap-3 rounded-md border border-border bg-card p-3"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {descriptor?.label ?? pivot}
                            </span>
                            <Badge variant="outline" className="gap-1">
                              <Link2 className="size-3" />
                              Pivot
                            </Badge>
                          </div>

                          <SegmentedControl<'existing' | 'new'>
                            size="sm"
                            aria-label={`Référentiel pour ${descriptor?.label ?? pivot}`}
                            value={mode}
                            onValueChange={(v) =>
                              setReferential(pivot, { mode: v })
                            }
                            options={[
                              { value: 'existing', label: 'Existant' },
                              { value: 'new', label: 'Nouveau' },
                            ]}
                          />

                          {mode === 'existing' ? (
                            available.length === 0 ? (
                              <p className="text-xs text-muted-foreground">
                                Aucun référentiel pré-enregistré pour cet
                                objet. Choisissez « Nouveau ».
                              </p>
                            ) : (
                              <Select
                                value={ref?.referentialId ?? ''}
                                onValueChange={(v) =>
                                  setReferential(pivot, { referentialId: v })
                                }
                              >
                                <SelectTrigger
                                  className="h-9"
                                  aria-label="Sélectionner un référentiel"
                                >
                                  <SelectValue placeholder="Sélectionner un référentiel…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {available.map((tpl) => (
                                    <SelectItem key={tpl.id} value={tpl.id}>
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-medium">
                                          {tpl.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          <code className="font-mono">
                                            {tpl.externalKey}
                                          </code>{' '}
                                          →{' '}
                                          <code className="font-mono">
                                            {tpl.internalKey}
                                          </code>
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )
                          ) : (
                            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-2">
                              <div className="flex flex-col gap-1">
                                <Label
                                  htmlFor={`ref-ext-${pivot}`}
                                  className="text-[11px] text-muted-foreground"
                                >
                                  Id externe
                                </Label>
                                <Input
                                  id={`ref-ext-${pivot}`}
                                  placeholder="ext_fund_id"
                                  value={ref?.externalKey ?? ''}
                                  onChange={(e) =>
                                    setReferential(pivot, {
                                      externalKey: e.target.value,
                                    })
                                  }
                                  className="h-9 font-mono text-xs"
                                />
                              </div>
                              <ArrowRight
                                aria-hidden
                                className="mb-2 size-4 text-muted-foreground"
                              />
                              <div className="flex flex-col gap-1">
                                <Label
                                  htmlFor={`ref-int-${pivot}`}
                                  className="text-[11px] text-muted-foreground"
                                >
                                  Id InvestHub
                                </Label>
                                <Input
                                  id={`ref-int-${pivot}`}
                                  placeholder="campaign.code"
                                  value={ref?.internalKey ?? ''}
                                  onChange={(e) =>
                                    setReferential(pivot, {
                                      internalKey: e.target.value,
                                    })
                                  }
                                  className="h-9 font-mono text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {linkStrategy === 'free' && (
          <Alert>
            <Info />
            <AlertTitle>Pas de rattachement ?</AlertTitle>
            <AlertDescription>
              La collection reste exploitable en back-office mais ne peut pas
              filtrer l’affichage par LP ou campagne dans le portail.
            </AlertDescription>
          </Alert>
        )}
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
