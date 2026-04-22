import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, RefreshCw, TriangleAlert } from 'lucide-react';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '../../../../../components/ui/alert';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';

export interface ApiPushConfig {
  endpointUrl?: string;
  apiKey?: string;
}

function generateApiKey(): string {
  const rand = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `ihk_live_${rand.slice(0, 32)}`;
}

function CopyField({
  id,
  label,
  value,
  onRegenerate,
}: {
  id: string;
  label: string;
  value: string;
  onRegenerate?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input id={id} value={value} readOnly className="font-mono text-xs" />
        <Button
          variant="secondary"
          size="sm"
          onClick={copy}
          aria-label={copied ? 'Copié' : 'Copier'}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? 'Copié' : 'Copier'}
        </Button>
        {onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            aria-label="Régénérer"
          >
            <RefreshCw />
            Régénérer
          </Button>
        )}
      </div>
    </div>
  );
}

export interface ConfigApiPushProps {
  value: ApiPushConfig;
  onChange: (patch: Partial<ApiPushConfig>) => void;
}

export function ConfigApiPush({ value, onChange }: ConfigApiPushProps) {
  const endpoint =
    value.endpointUrl ??
    'https://api.investhub.app/v1/collections/{collection_id}/items';

  // Freeze the generated key for the session unless regenerated.
  const apiKey = useMemo(() => value.apiKey ?? generateApiKey(), [value.apiKey]);

  // Persist the generated endpoint + key into wizardData on mount so they
  // survive step navigation even if the user never touches them.
  useEffect(() => {
    const patch: Partial<ApiPushConfig> = {};
    if (!value.endpointUrl) patch.endpointUrl = endpoint;
    if (!value.apiKey) patch.apiKey = apiKey;
    if (Object.keys(patch).length > 0) onChange(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const curl = [
    `curl -X POST "${endpoint}" \\`,
    `  -H "Authorization: Bearer ${apiKey}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"rows":[{"fund_id":"ASTORG_VIII","period_end":"2026-03-31","tvpi":1.42}]}'`,
  ].join('\n');

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          Connexion API (PUSH)
        </h2>
        <p className="text-sm text-muted-foreground">
          Votre système envoie les données vers l'endpoint dédié ci-dessous.
          Aucune configuration n'est requise côté InvestHub.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <CopyField
          id="push-endpoint"
          label="Endpoint généré"
          value={endpoint}
        />
        <CopyField
          id="push-key"
          label="Clé API dédiée"
          value={apiKey}
          onRegenerate={() => onChange({ apiKey: generateApiKey() })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">
          Exemple d'appel
        </Label>
        <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[11px] font-mono leading-relaxed">
{curl}
        </pre>
      </div>

      <Alert variant="destructive">
        <TriangleAlert />
        <AlertTitle>Schéma requis avant envoi</AlertTitle>
        <AlertDescription>
          Le schéma des données doit être défini en Étape 4 avant que vous
          puissiez envoyer des données.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export default ConfigApiPush;
