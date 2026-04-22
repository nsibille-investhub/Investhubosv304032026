type Token = { name: string; label: string; varBase: string };

type Group = {
  title: string;
  description: string;
  tokens: Token[];
};

const groups: Group[] = [
  {
    title: 'Statuts',
    description: '--datahub-status-*',
    tokens: [
      { name: 'published', label: 'Publié', varBase: '--datahub-status-published' },
      { name: 'draft', label: 'Brouillon', varBase: '--datahub-status-draft' },
      { name: 'unpublished', label: 'Dépublié', varBase: '--datahub-status-unpublished' },
      { name: 'changes', label: 'Modifié', varBase: '--datahub-status-changes' },
    ],
  },
  {
    title: "Modes d'ingestion",
    description: '--datahub-mode-*',
    tokens: [
      { name: 'manual', label: 'Manuel', varBase: '--datahub-mode-manual' },
      { name: 'file', label: 'Fichier', varBase: '--datahub-mode-file' },
      { name: 'api', label: 'API', varBase: '--datahub-mode-api' },
      { name: 'mcp', label: 'MCP', varBase: '--datahub-mode-mcp' },
    ],
  },
  {
    title: 'Pivots temporels',
    description: '--datahub-pivot-*',
    tokens: [
      { name: 'timeseries', label: 'Time-series', varBase: '--datahub-pivot-timeseries' },
      { name: 'reference', label: 'Référence', varBase: '--datahub-pivot-reference' },
      { name: 'event', label: 'Événement', varBase: '--datahub-pivot-event' },
    ],
  },
];

function Pill({ token }: { token: Token }) {
  const bg = `var(${token.varBase}-bg)`;
  const fg = `var(${token.varBase}-fg)`;
  const border = `var(${token.varBase}-border)`;

  return (
    <div className="flex flex-col gap-2">
      <div
        style={{
          backgroundColor: bg,
          color: fg,
          borderColor: border,
          borderWidth: 1,
          borderStyle: 'solid',
        }}
        className="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium w-fit"
      >
        <span
          aria-hidden
          style={{ backgroundColor: fg }}
          className="mr-1.5 size-1.5 rounded-full"
        />
        {token.label}
      </div>
      <code className="text-[10px] leading-tight text-muted-foreground break-all">
        {token.varBase}-{'{bg,fg,border}'}
      </code>
    </div>
  );
}

function Swatch({ token }: { token: Token }) {
  const parts: Array<'bg' | 'fg' | 'border'> = ['bg', 'fg', 'border'];
  return (
    <div className="flex items-center gap-2">
      {parts.map((p) => (
        <div
          key={p}
          className="flex flex-col items-center gap-1"
          title={`${token.varBase}-${p}`}
        >
          <div
            style={{ backgroundColor: `var(${token.varBase}-${p})` }}
            className="size-8 rounded-md border border-border"
          />
          <span className="text-[10px] text-muted-foreground">{p}</span>
        </div>
      ))}
    </div>
  );
}

export function DataHubTokensPreview() {
  return (
    <div className="mx-auto max-w-5xl p-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">
          DataHub — Tokens preview
        </h1>
        <p className="text-sm text-muted-foreground">
          Validation visuelle des tokens de couleur DataHub (pastilles +
          swatches bg / fg / border). Basculer la classe <code>.dark</code> sur{' '}
          <code>html</code> pour vérifier le mode sombre.
        </p>
      </header>

      {groups.map((group) => (
        <section key={group.title} className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">
              {group.title}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {group.description}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {group.tokens.map((token) => (
              <div
                key={token.name}
                className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
              >
                <Pill token={token} />
                <Swatch token={token} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <footer className="pt-6 border-t border-border text-xs text-muted-foreground">
        <p>
          Tokens exposés sous le namespace Tailwind{' '}
          <code>colors.datahub.&#123;status,mode,pivot&#125;.*</code> (voir{' '}
          <code>tailwind.config.ts</code>). Usage direct en CSS via{' '}
          <code>var(--datahub-*-bg/fg/border)</code>.
        </p>
      </footer>
    </div>
  );
}

export default DataHubTokensPreview;
