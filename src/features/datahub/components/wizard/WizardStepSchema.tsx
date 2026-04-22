import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Send, Trash2 } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../../components/ui/alert';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
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
import { Separator } from '../../../../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { IngestionModeBadge } from '../IngestionModeBadge';
import { PivotTypeBadge } from '../PivotTypeBadge';
import {
  humanizeLabel,
  inferColumnType,
} from '../../lib/inferColumnType';
import type {
  CollectionColumn,
  CollectionColumnType,
  InvestHubPivotObject,
  PublicationWorkflow,
  WizardData,
} from '../../types';

const COLUMN_TYPE_OPTIONS: { value: CollectionColumnType; label: string }[] = [
  { value: 'text', label: 'Texte' },
  { value: 'number', label: 'Nombre' },
  { value: 'currency', label: 'Devise' },
  { value: 'percentage', label: 'Pourcentage' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date & heure' },
  { value: 'boolean', label: 'Booléen' },
  { value: 'url', label: 'URL' },
  { value: 'select', label: 'Liste déroulante' },
];

const PIVOT_OBJECT_LABELS: Record<InvestHubPivotObject, string> = {
  campaign: 'Fonds',
  subscription: 'Souscription',
  investor: 'Investisseur',
  contact: 'Contact',
  distributor: 'Distributeur',
  'capital-account': 'Capital Account',
  commitment: 'Engagement',
};

const WORKFLOW_LABELS: Record<PublicationWorkflow, string> = {
  direct: 'Publication directe',
  'manual-validation': 'Validation manuelle',
  'ai-validation': 'Validation IA',
};

const MOCK_PUSH_PAYLOAD = {
  rows: [
    {
      fund_id: 'ASTORG_VIII',
      period_end: '2026-03-31',
      tvpi: 1.42,
      dpi: 0.87,
      irr: 0.184,
      nav: 1_250_430_000,
      notes: 'Q1 2026 close',
    },
  ],
};

const MOCK_MCP_PAYLOAD = {
  rows: [
    {
      triggered_at: '2026-04-21T14:32:00Z',
      severity: 'medium',
      investor_id: 'LP_001',
      rule_name: 'kyc_expiry_horizon',
      resolution_status: 'pending',
    },
  ],
};

function autoKeyForColumn(
  technicalName: string,
  linked: InvestHubPivotObject[],
  pivotKeys: Partial<Record<InvestHubPivotObject, string>>,
): InvestHubPivotObject | undefined {
  for (const obj of linked) {
    const k = pivotKeys[obj];
    if (k && k.trim().toLowerCase() === technicalName.trim().toLowerCase()) {
      return obj;
    }
  }
  return undefined;
}

function parseCsvAll(rows: string[][]): {
  headers: string[];
  samples: string[][];
} {
  if (rows.length === 0) return { headers: [], samples: [] };
  return { headers: rows[0], samples: rows.slice(1) };
}

function columnsFromRecords(
  records: Array<Record<string, unknown>>,
  linked: InvestHubPivotObject[],
  pivotKeys: Partial<Record<InvestHubPivotObject, string>>,
  pivotColumnName: string | undefined,
): CollectionColumn[] {
  if (records.length === 0) return [];
  const keys = Array.from(
    new Set(records.flatMap((r) => Object.keys(r))),
  );
  return keys.map((key, idx) => {
    const samples = records.map((r) => r[key]);
    const type = inferColumnType(key, samples);
    const isPivotLike = pivotColumnName
      ? key.toLowerCase() === pivotColumnName.trim().toLowerCase()
      : false;
    return {
      id: `col_${idx}_${key}`,
      technicalName: key,
      label: humanizeLabel(key),
      type,
      required: false,
      isTemporalPivot: isPivotLike || undefined,
      isKeyToInvestHubObject: autoKeyForColumn(key, linked, pivotKeys),
    };
  });
}

function columnsFromCsv(
  preview: string[][],
  linked: InvestHubPivotObject[],
  pivotKeys: Partial<Record<InvestHubPivotObject, string>>,
  pivotColumnName: string | undefined,
): CollectionColumn[] {
  const { headers, samples } = parseCsvAll(preview);
  return headers.map((header, idx) => {
    const cells = samples.map((row) => row[idx]);
    const type = inferColumnType(header, cells);
    const isPivotLike = pivotColumnName
      ? header.toLowerCase() === pivotColumnName.trim().toLowerCase()
      : false;
    return {
      id: `col_${idx}_${header}`,
      technicalName: header,
      label: humanizeLabel(header),
      type,
      required: false,
      isTemporalPivot: isPivotLike || undefined,
      isKeyToInvestHubObject: autoKeyForColumn(header, linked, pivotKeys),
    };
  });
}

export interface WizardStepSchemaProps {
  data: Partial<WizardData>;
  onChange: (patch: Partial<WizardData>) => void;
}

export function WizardStepSchema({ data, onChange }: WizardStepSchemaProps) {
  const mode = data.ingestionMode;
  const pivotType = data.pivotType;
  const needsPivotColumn = pivotType === 'timeseries' || pivotType === 'event';
  const linked = data.linkedPivotObjects ?? [];
  const pivotKeys = (data.pivotKeys ?? {}) as Partial<
    Record<InvestHubPivotObject, string>
  >;
  const modeConfig = (data.modeConfig ?? {}) as Record<string, unknown>;
  const columns = data.columns ?? [];

  const [pushTestState, setPushTestState] = useState<
    'idle' | 'loading' | 'done'
  >('idle');

  // Initial inference, only once (when columns array is empty and data permits).
  useEffect(() => {
    if (columns.length > 0) return;

    if (mode === 'file') {
      const preview = modeConfig.preview as string[][] | undefined;
      if (preview && preview.length > 0) {
        onChange({
          columns: columnsFromCsv(preview, linked, pivotKeys, data.pivotColumn),
        });
      }
      return;
    }

    if (mode === 'api-pull' && modeConfig.lastTestSuccess === true) {
      const payload = modeConfig.lastPayload as
        | { data?: Array<Record<string, unknown>> }
        | undefined;
      const records = payload?.data ?? [];
      if (records.length > 0) {
        onChange({
          columns: columnsFromRecords(
            records,
            linked,
            pivotKeys,
            data.pivotColumn,
          ),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendPushTestPayload = () => {
    setPushTestState('loading');
    window.setTimeout(() => {
      const payload = mode === 'mcp' ? MOCK_MCP_PAYLOAD : MOCK_PUSH_PAYLOAD;
      onChange({
        columns: columnsFromRecords(
          payload.rows,
          linked,
          pivotKeys,
          data.pivotColumn,
        ),
      });
      setPushTestState('done');
    }, 2000);
  };

  const patchColumn = (idx: number, patch: Partial<CollectionColumn>) => {
    const next = columns.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange({ columns: next });
  };

  const togglePivotColumn = (idx: number) => {
    const next = columns.map((c, i) => ({
      ...c,
      isTemporalPivot: i === idx ? !c.isTemporalPivot : false,
    }));
    onChange({ columns: next });
  };

  const removeColumn = (idx: number) => {
    onChange({ columns: columns.filter((_, i) => i !== idx) });
  };

  const addColumn = () => {
    const idx = columns.length;
    const technicalName = `colonne_${idx + 1}`;
    onChange({
      columns: [
        ...columns,
        {
          id: `col_new_${Date.now()}_${idx}`,
          technicalName,
          label: humanizeLabel(technicalName),
          type: 'text',
          required: false,
        },
      ],
    });
  };

  const workflow = data.publicationWorkflow ?? 'manual-validation';
  const setWorkflow = (w: PublicationWorkflow) =>
    onChange({ publicationWorkflow: w });

  const recapColumnsCount = columns.length;
  const inferenceAvailable = useMemo(() => {
    if (mode === 'file') {
      return Array.isArray(modeConfig.preview) && (modeConfig.preview as unknown[]).length > 0;
    }
    if (mode === 'api-pull') return modeConfig.lastTestSuccess === true;
    return mode === 'api-push' || mode === 'mcp' || mode === 'manual';
  }, [mode, modeConfig]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          Schéma des données
        </h2>
        <p className="text-sm text-muted-foreground">
          Vérifiez les colonnes inférées, ajustez les types et déclarez le pivot
          temporel.
        </p>
      </header>

      {/* Mode-specific hints */}
      {mode === 'api-pull' && !inferenceAvailable && columns.length === 0 && (
        <Alert>
          <AlertTitle>Pas encore de schéma inféré</AlertTitle>
          <AlertDescription>
            Cliquez « Tester la connexion » à l'étape 2 pour inférer le schéma,
            ou construisez-le manuellement ici.
          </AlertDescription>
        </Alert>
      )}

      {(mode === 'api-push' || mode === 'mcp') && columns.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              Envoyer un payload de test
            </span>
            <span className="text-xs text-muted-foreground">
              InvestHub inférera le schéma à partir du premier payload reçu.
            </span>
          </div>
          <Button
            variant="secondary"
            onClick={sendPushTestPayload}
            disabled={pushTestState === 'loading'}
          >
            {pushTestState === 'loading' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send />
            )}
            Envoyer un payload de test
          </Button>
        </div>
      )}

      {/* Schema table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colonne technique</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Requis</TableHead>
              {needsPivotColumn && <TableHead>Pivot temporel</TableHead>}
              {linked.length > 0 && <TableHead>Clé IH</TableHead>}
              <TableHead className="w-12" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {columns.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5 + (needsPivotColumn ? 1 : 0) + (linked.length > 0 ? 1 : 0) + 1}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  Aucune colonne pour l'instant — ajoutez-en une ou importez un
                  payload de test.
                </TableCell>
              </TableRow>
            ) : (
              columns.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {c.technicalName}
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label={`Label ${c.technicalName}`}
                      value={c.label}
                      onChange={(e) => patchColumn(idx, { label: e.target.value })}
                      className="h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.type}
                      onValueChange={(v) =>
                        patchColumn(idx, { type: v as CollectionColumnType })
                      }
                    >
                      <SelectTrigger
                        className="h-8 w-[150px]"
                        aria-label={`Type ${c.technicalName}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLUMN_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label={`Unité ${c.technicalName}`}
                      placeholder="€ / % / x"
                      value={c.unit ?? ''}
                      onChange={(e) =>
                        patchColumn(idx, { unit: e.target.value || undefined })
                      }
                      className="h-8 w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={c.required}
                      onCheckedChange={(checked) =>
                        patchColumn(idx, { required: checked === true })
                      }
                      aria-label={`Requis ${c.technicalName}`}
                    />
                  </TableCell>
                  {needsPivotColumn && (
                    <TableCell>
                      <Checkbox
                        checked={!!c.isTemporalPivot}
                        onCheckedChange={() => togglePivotColumn(idx)}
                        aria-label={`Pivot temporel ${c.technicalName}`}
                      />
                    </TableCell>
                  )}
                  {linked.length > 0 && (
                    <TableCell>
                      <Select
                        value={c.isKeyToInvestHubObject ?? ''}
                        onValueChange={(v) =>
                          patchColumn(idx, {
                            isKeyToInvestHubObject:
                              v === '' ? undefined : (v as InvestHubPivotObject),
                          })
                        }
                      >
                        <SelectTrigger
                          className="h-8 w-[160px]"
                          aria-label={`Clé IH ${c.technicalName}`}
                        >
                          <SelectValue placeholder="—" />
                        </SelectTrigger>
                        <SelectContent>
                          {linked.map((obj) => (
                            <SelectItem key={obj} value={obj}>
                              {PIVOT_OBJECT_LABELS[obj]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeColumn(idx)}
                      aria-label={`Supprimer ${c.technicalName}`}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <Button variant="secondary" onClick={addColumn}>
          <Plus />
          Ajouter une colonne
        </Button>
      </div>

      <Separator />

      {/* Workflow de publication */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium text-foreground">
          Workflow de publication
        </h3>
        <RadioGroup
          value={workflow}
          onValueChange={(v) => setWorkflow(v as PublicationWorkflow)}
          className="gap-3"
        >
          <Label
            htmlFor="wf-direct"
            className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3"
          >
            <RadioGroupItem value="direct" id="wf-direct" className="mt-1" />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">Publication directe</span>
              <span className="text-xs text-muted-foreground">
                Les nouvelles données sont immédiatement visibles sur les
                portails.
              </span>
            </div>
          </Label>
          <Label
            htmlFor="wf-manual"
            className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3"
          >
            <RadioGroupItem
              value="manual-validation"
              id="wf-manual"
              className="mt-1"
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">
                Validation manuelle (recommandé)
              </span>
              <span className="text-xs text-muted-foreground">
                Les données arrivent en brouillon, un OPS doit valider pour
                publier.
              </span>
              <span className="text-xs text-muted-foreground">
                Vous pourrez configurer les rôles habilités à valider après
                création.
              </span>
            </div>
          </Label>
          <Label
            htmlFor="wf-ai"
            className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3"
          >
            <RadioGroupItem
              value="ai-validation"
              id="wf-ai"
              className="mt-1"
            />
            <div className="flex flex-col gap-0.5">
              <span className="flex items-center gap-2 font-medium">
                Validation IA
                <Badge variant="secondary" className="font-normal">
                  Bêta
                </Badge>
              </span>
              <span className="text-xs text-muted-foreground">
                Une IA contrôle la cohérence des données avant passage en
                brouillon.
              </span>
            </div>
          </Label>
        </RadioGroup>
      </section>

      <Separator />

      {/* Récap */}
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-foreground">Récapitulatif</h3>
        <Card>
          <CardContent className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Nom affiché</span>
              <span className="text-sm font-medium text-foreground">
                {data.displayName || '—'}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {data.technicalName || '—'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Mode d'ingestion</span>
              {mode ? (
                <IngestionModeBadge mode={mode} size="sm" />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Objets IH rattachés
              </span>
              {linked.length === 0 ? (
                <span className="text-sm text-muted-foreground">
                  Aucun — donnée libre
                </span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {linked.map((obj) => (
                    <Badge
                      key={obj}
                      variant="secondary"
                      className="font-normal"
                    >
                      {PIVOT_OBJECT_LABELS[obj]}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Dimension temporelle
              </span>
              {pivotType ? (
                <PivotTypeBadge type={pivotType} size="sm" />
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Colonnes</span>
              <span className="text-sm font-medium text-foreground">
                {recapColumnsCount}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Workflow</span>
              <span className="text-sm font-medium text-foreground">
                {WORKFLOW_LABELS[workflow]}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default WizardStepSchema;
