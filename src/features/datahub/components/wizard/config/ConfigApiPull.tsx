import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Play } from 'lucide-react';

import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';

export type AuthType = 'bearer' | 'apikey' | 'oauth2' | 'mtls' | 'none';
export type Frequency =
  | 'realtime'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'manual';

export interface ApiPullConfig {
  endpointUrl?: string;
  authType?: AuthType;
  bearerToken?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  oauthTokenUrl?: string;
  frequency?: Frequency;
}

const MOCK_PAYLOAD = {
  data: [
    {
      id: '001',
      fund: 'Astorg VIII',
      period_end: '2026-03-31',
      tvpi: 1.42,
      dpi: 0.87,
      irr: 0.184,
      nav: 1_250_430_000,
    },
    {
      id: '002',
      fund: 'Astorg VII',
      period_end: '2026-03-31',
      tvpi: 1.71,
      dpi: 1.12,
      irr: 0.212,
      nav: 982_100_000,
    },
  ],
  pagination: { page: 1, total: 142 },
};

function isValidUrl(raw: string): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export interface ConfigApiPullProps {
  value: ApiPullConfig;
  onChange: (patch: Partial<ApiPullConfig>) => void;
}

export function ConfigApiPull({ value, onChange }: ConfigApiPullProps) {
  const [testState, setTestState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const urlOk = isValidUrl(value.endpointUrl ?? '');
  const canTest =
    urlOk && !!value.authType && testState !== 'loading';

  const runTest = () => {
    setTestState('loading');
    // Simulated 1s roundtrip, deterministic success for demo.
    window.setTimeout(() => setTestState('success'), 1000);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          Connexion API (PULL)
        </h2>
        <p className="text-sm text-muted-foreground">
          Indiquez l'endpoint que InvestHub interrogera périodiquement.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="api-endpoint">URL de l'endpoint</Label>
          <Input
            id="api-endpoint"
            placeholder="https://api.mondomaine.com/v1/collections"
            value={value.endpointUrl ?? ''}
            onChange={(e) => onChange({ endpointUrl: e.target.value })}
            aria-invalid={
              !!value.endpointUrl && !urlOk ? true : undefined
            }
          />
          {!!value.endpointUrl && !urlOk && (
            <p className="text-xs text-destructive">
              URL invalide — doit commencer par http(s)://.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="auth-type">Authentification</Label>
            <Select
              value={value.authType ?? ''}
              onValueChange={(v) => onChange({ authType: v as AuthType })}
            >
              <SelectTrigger id="auth-type">
                <SelectValue placeholder="Choisir une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bearer">Bearer token</SelectItem>
                <SelectItem value="apikey">API Key</SelectItem>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="mtls">mTLS</SelectItem>
                <SelectItem value="none">Aucune</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="frequency">Fréquence de rafraîchissement</Label>
            <Select
              value={value.frequency ?? ''}
              onValueChange={(v) => onChange({ frequency: v as Frequency })}
            >
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Choisir une fréquence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Temps réel (webhook)</SelectItem>
                <SelectItem value="hourly">Toutes les heures</SelectItem>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
                <SelectItem value="manual">Manuel uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {value.authType === 'bearer' && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="bearer-token">Bearer token</Label>
            <Input
              id="bearer-token"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
              value={value.bearerToken ?? ''}
              onChange={(e) => onChange({ bearerToken: e.target.value })}
            />
          </div>
        )}

        {value.authType === 'apikey' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="api-key">Clé API</Label>
              <Input
                id="api-key"
                type="password"
                value={value.apiKey ?? ''}
                onChange={(e) => onChange({ apiKey: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="api-key-header">Nom du header</Label>
              <Input
                id="api-key-header"
                placeholder="X-API-Key"
                value={value.apiKeyHeader ?? ''}
                onChange={(e) => onChange({ apiKeyHeader: e.target.value })}
              />
            </div>
          </div>
        )}

        {value.authType === 'oauth2' && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="oauth-client-id">Client ID</Label>
              <Input
                id="oauth-client-id"
                value={value.oauthClientId ?? ''}
                onChange={(e) => onChange({ oauthClientId: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="oauth-client-secret">Client secret</Label>
              <Input
                id="oauth-client-secret"
                type="password"
                value={value.oauthClientSecret ?? ''}
                onChange={(e) =>
                  onChange({ oauthClientSecret: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="oauth-token-url">Token URL</Label>
              <Input
                id="oauth-token-url"
                placeholder="https://auth.mondomaine.com/oauth/token"
                value={value.oauthTokenUrl ?? ''}
                onChange={(e) => onChange({ oauthTokenUrl: e.target.value })}
              />
            </div>
          </div>
        )}

        {value.authType === 'mtls' && (
          <p className="text-xs text-muted-foreground">
            Le certificat client et la clé privée seront uploadés depuis le
            détail de la collection, après création.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">
              Tester la connexion
            </span>
            <span className="text-xs text-muted-foreground">
              Envoie une requête à l'endpoint pour vérifier la réponse.
            </span>
          </div>
          <Button variant="secondary" onClick={runTest} disabled={!canTest}>
            {testState === 'loading' ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Play />
            )}
            Tester la connexion
          </Button>
        </div>

        {testState === 'success' && (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2
                aria-hidden
                className="size-4"
                style={{ color: 'var(--success)' }}
              />
              Connexion réussie — preview du payload
            </div>
            <pre className="overflow-x-auto rounded bg-card px-3 py-2 text-[11px] font-mono leading-relaxed">
{JSON.stringify(MOCK_PAYLOAD, null, 2)}
            </pre>
          </div>
        )}

        {testState === 'error' && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle aria-hidden className="size-4" />
            Impossible de joindre l'endpoint — vérifiez l'URL et les
            identifiants.
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfigApiPull;
