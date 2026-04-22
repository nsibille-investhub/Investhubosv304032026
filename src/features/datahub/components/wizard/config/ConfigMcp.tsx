import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';

import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../components/ui/radio-group';
import { Switch } from '../../../../../components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../components/ui/tabs';

export type McpIngestionMode = 'constrained' | 'free';

export interface McpConfig {
  mcpUrl?: string;
  mcpToken?: string;
  ingestionMode?: McpIngestionMode;
  aiValidation?: boolean;
}

function generateToken(): string {
  const rand = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `mcp_${rand.slice(0, 40)}`;
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

const CLAUDE_SNIPPET = `{
  "mcpServers": {
    "investhub-datahub": {
      "url": "{{MCP_URL}}",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer {{MCP_TOKEN}}"
      }
    }
  }
}`;

const CURSOR_SNIPPET = `// .cursor/mcp.json
{
  "investhub-datahub": {
    "command": "npx",
    "args": ["-y", "@investhub/mcp-client"],
    "env": {
      "INVESTHUB_MCP_URL": "{{MCP_URL}}",
      "INVESTHUB_MCP_TOKEN": "{{MCP_TOKEN}}"
    }
  }
}`;

const CUSTOM_SNIPPET = `from investhub_mcp import DatahubClient

client = DatahubClient(
    url="{{MCP_URL}}",
    token="{{MCP_TOKEN}}",
)

client.collections.push_row(
    collection="performance_fonds_astorg",
    row={"fund_id": "ASTORG_VIII", "period_end": "2026-03-31", "tvpi": 1.42},
)`;

export interface ConfigMcpProps {
  value: McpConfig;
  onChange: (patch: Partial<McpConfig>) => void;
}

export function ConfigMcp({ value, onChange }: ConfigMcpProps) {
  const url =
    value.mcpUrl ??
    'https://mcp.investhub.app/v1/collections/{collection_id}';
  const token = useMemo(
    () => value.mcpToken ?? generateToken(),
    [value.mcpToken],
  );

  useEffect(() => {
    const patch: Partial<McpConfig> = {};
    if (!value.mcpUrl) patch.mcpUrl = url;
    if (!value.mcpToken) patch.mcpToken = token;
    if (value.ingestionMode === undefined) patch.ingestionMode = 'constrained';
    if (value.aiValidation === undefined) patch.aiValidation = true;
    if (Object.keys(patch).length > 0) onChange(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const render = (snippet: string) =>
    snippet.replaceAll('{{MCP_URL}}', url).replaceAll('{{MCP_TOKEN}}', token);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-foreground">
            Agent intelligent (MCP)
          </h2>
          <p className="text-sm text-muted-foreground">
            Connectez un agent ou une source compatible MCP pour une ingestion
            autonome.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Bêta
        </Badge>
      </header>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <CopyField id="mcp-url" label="URL MCP dédiée" value={url} />
        <CopyField
          id="mcp-token"
          label="Token d'authentification"
          value={token}
          onRegenerate={() => onChange({ mcpToken: generateToken() })}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">
            Mode d'ingestion
          </span>
          <span className="text-xs text-muted-foreground">
            Choisissez comment l'agent doit respecter votre schéma.
          </span>
        </div>
        <RadioGroup
          value={value.ingestionMode ?? 'constrained'}
          onValueChange={(v) => onChange({ ingestionMode: v as McpIngestionMode })}
          className="gap-3"
        >
          <div className="flex items-start gap-2">
            <RadioGroupItem
              value="constrained"
              id="mcp-constrained"
              className="mt-1"
            />
            <Label htmlFor="mcp-constrained" className="flex flex-col gap-0.5">
              <span className="font-medium">
                Ingestion contrainte (recommandé)
              </span>
              <span className="text-xs text-muted-foreground">
                Le schéma défini en étape 4 est imposé à l'agent.
              </span>
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <RadioGroupItem value="free" id="mcp-free" className="mt-1" />
            <Label htmlFor="mcp-free" className="flex flex-col gap-0.5">
              <span className="font-medium">Ingestion libre</span>
              <span className="text-xs text-muted-foreground">
                Le schéma se crée automatiquement à la première ingestion.
              </span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="mcp-ai-validation" className="text-sm font-medium">
            Validation IA des données entrantes
          </Label>
          <p className="text-xs text-muted-foreground">
            Vérifie la cohérence avant passage en brouillon.
          </p>
        </div>
        <Switch
          id="mcp-ai-validation"
          checked={value.aiValidation !== false}
          onCheckedChange={(v) => onChange({ aiValidation: v })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs text-muted-foreground">
          Exemples d'appel
        </Label>
        <Tabs defaultValue="claude">
          <TabsList>
            <TabsTrigger value="claude">Claude</TabsTrigger>
            <TabsTrigger value="cursor">Cursor</TabsTrigger>
            <TabsTrigger value="custom">Agent custom</TabsTrigger>
          </TabsList>
          <TabsContent value="claude">
            <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[11px] font-mono leading-relaxed">
{render(CLAUDE_SNIPPET)}
            </pre>
          </TabsContent>
          <TabsContent value="cursor">
            <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[11px] font-mono leading-relaxed">
{render(CURSOR_SNIPPET)}
            </pre>
          </TabsContent>
          <TabsContent value="custom">
            <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-[11px] font-mono leading-relaxed">
{render(CUSTOM_SNIPPET)}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ConfigMcp;
