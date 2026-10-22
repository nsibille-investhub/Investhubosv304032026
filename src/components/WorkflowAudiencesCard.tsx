import { useState } from 'react';
import { useTranslation } from '../utils/languageContext';
import { useWorkflowScenario } from '../utils/workflowScenarioContext';
import { normalizeText } from '../utils/workflowSimulator/engine';
import type { ResolvedAction } from '../utils/workflowSimulator/types';
import { Sheet, SheetContent } from './ui/sheet';
import { SIDE_PANEL_STYLE, SidePanelCard, SidePanelHeader } from './ui/side-panel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Callout } from './ui/callout';
import { Tag } from './Tag';

const C = 'subscriptions.workflowSimulator.panel.audiences';

// Audiences résumées (spécifications, prompt 8), avec la colonne de portal_labels_v1 qu'elles lisent.
const AUDIENCES = [
  { role: 'investor', column: 'investor' },
  { role: 'distributor', column: 'distributor' },
  { role: 'delegated_partner', column: 'distributor' },
  { role: 'fund_signer', column: null },
  { role: 'platform', column: null },
] as const;

// Actions du distributeur réservées à une souscription administrée (spécifications, prompt 8).
const ADMINISTERED_ONLY = ["completer pour l'investisseur", "soumettre pour l'investisseur", 'valider et envoyer a signer'];

interface AudienceRow {
  key: string;
  title: string;
  label: string | null;
  showLabel: boolean;
  actions: ResolvedAction[];
  notApplicable?: string;
}

/** Carte "Ce que voient les autres" : libellé V1 et actions des autres audiences dans l'état courant. */
export function WorkflowAudiencesCard() {
  const { t } = useTranslation();
  const sim = useWorkflowScenario();
  const [rulesOpen, setRulesOpen] = useState(false);
  if (sim.status !== 'ready') return null;

  const { engine, scenario } = sim;
  const { state, workflow, context } = scenario;
  const family = engine.familyOf(workflow);
  const options = engine.optionsOf(workflow);
  const administered = Boolean(context.assisted);

  const portalLabel = (column: string): string | null => {
    const entry = engine.data.portal_labels_v1?.[state];
    if (entry === undefined || entry === null) return null;
    if (typeof entry === 'string') return entry;
    return entry[column] ?? null;
  };
  const isAdministeredOnly = (action: ResolvedAction) => ADMINISTERED_ONLY.includes(normalizeText(action.label));

  const rows: AudienceRow[] = AUDIENCES.flatMap(({ role, column }) => {
    const base = {
      title: t(`${C}.roles.${role}`),
      label: column ? portalLabel(column) : null,
      showLabel: Boolean(column),
    };
    const actions = engine.actionsFor(state, role);
    if ((role === 'distributor' || role === 'delegated_partner') && family === 'A') {
      return [{ ...base, key: role, actions: [], notApplicable: t(`${C}.notApplicable.direct`) }];
    }
    if (role === 'delegated_partner' && !options.includes('prevalidation')) {
      return [{ ...base, key: role, actions: [], notApplicable: t(`${C}.notApplicable.noPrevalidation`) }];
    }
    if (role === 'fund_signer' && !options.includes('countersignature')) {
      return [{ ...base, key: role, actions: [], notApplicable: t(`${C}.notApplicable.noCountersignature`) }];
    }
    if (role === 'distributor') {
      const pure = { ...base, key: 'distributor-pure', actions: actions.filter(a => !isAdministeredOnly(a)) };
      if (!administered) return [pure];
      return [
        { ...pure, title: t(`${C}.roles.distributorPure`) },
        { ...base, key: 'distributor-administered', title: t(`${C}.roles.distributorAdministered`), actions },
      ];
    }
    return [{ ...base, key: role, actions }];
  });

  const portal = engine.data.editability.portal;

  return (
    <SidePanelCard flush>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <p className="text-sm font-semibold">{t(`${C}.title`, { state: engine.stateLabel(state) })}</p>
        <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={() => setRulesOpen(true)}>
          {t(`${C}.seeRules`)}
        </Button>
      </div>
      <ul className="divide-y">
        {rows.map(row => (
          <li key={row.key} className="space-y-1 px-4 py-3">
            <p className="text-sm font-medium">{row.title}</p>
            {row.notApplicable ? (
              <p className="text-xs text-muted-foreground">{row.notApplicable}</p>
            ) : (
              <>
                {row.showLabel && (
                  <p className="text-xs text-muted-foreground">
                    {row.label ? t(`${C}.label`, { label: row.label }) : t(`${C}.noLabel`)}
                  </p>
                )}
                {row.actions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">{t(`${C}.noAction`)}</p>
                ) : (
                  <ul className="space-y-1">
                    {row.actions.map(action => (
                      <li key={action.code} className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span>{action.label}</span>
                        {action.condition && <span className="text-muted-foreground">{action.condition}</span>}
                        {action.decision && <Tag label={t(`${C}.hypothesis`, { id: action.decision })} />}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </li>
        ))}
      </ul>

      <Sheet open={rulesOpen} onOpenChange={setRulesOpen}>
        <SheetContent side="right" style={SIDE_PANEL_STYLE} className="h-full p-0 gap-0">
          <SidePanelHeader title={t(`${C}.rules.title`)} description={t(`${C}.rules.description`)} />
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <PortalRules portal={portal} />
          </div>
        </SheetContent>
      </Sheet>
    </SidePanelCard>
  );
}

/** Reproduit editability.portal tel que le fichier le donne, sans reformulation. */
function PortalRules({ portal }: { portal: unknown }) {
  const { t } = useTranslation();
  if (portal === undefined || portal === null) {
    return <Callout tone="warning">{t(`${C}.rules.missing`)}</Callout>;
  }
  const cell = (value: unknown) => (typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value));
  if (Array.isArray(portal) && portal.every(row => typeof row === 'object' && row !== null)) {
    const columns = Array.from(new Set(portal.flatMap(row => Object.keys(row as object))));
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(column => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {portal.map((row, index) => (
            <TableRow key={index}>
              {columns.map(column => (
                <TableCell key={column} className="whitespace-normal align-top">
                  {cell((row as Record<string, unknown>)[column] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
  if (typeof portal === 'object') {
    return (
      <Table>
        <TableBody>
          {Object.entries(portal as Record<string, unknown>).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="align-top font-medium">{key}</TableCell>
              <TableCell className="whitespace-normal align-top">{cell(value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
  return <p className="whitespace-pre-wrap text-sm">{cell(portal)}</p>;
}

