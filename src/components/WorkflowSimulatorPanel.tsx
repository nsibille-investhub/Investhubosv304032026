import { useState } from 'react';
import {
  Check,
  FileStack,
  FlaskConical,
  GitBranch,
  Landmark,
  Link2,
  Lock,
  RotateCcw,
  Route,
  Shapes,
  UserCog,
  Waypoints,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { useWorkflowScenario } from '../utils/workflowScenarioContext';
import { copyToClipboard } from '../utils/clipboard';
import { contextKind, toLabelled, type SimulatorEngine } from '../utils/workflowSimulator/engine';
import {
  AXIS_KEYS,
  type ContextScalar,
  type ContextValue,
  type SimLabelled,
  type SimWorkflow,
  type WorkflowFamily,
} from '../utils/workflowSimulator/types';
import { Sheet, SheetContent } from './ui/sheet';
import {
  SIDE_PANEL_STYLE,
  SidePanelCard,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelSection,
  SidePanelSwitchRow,
} from './ui/side-panel';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { DisabledReason } from './ui/disabled-reason';
import { WizardSteps, type WizardStepBranch } from './ui/wizard-steps';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Tag } from './Tag';
import { WorkflowAudiencesCard } from './WorkflowAudiencesCard';

const P = 'subscriptions.workflowSimulator.panel';
const FAMILIES: WorkflowFamily[] = ['A', 'B', 'C'];

// Rangement des réglages de contexte dans le panneau (présentation seulement).
const FUND_FIELDS = ['payment_mode', 'internal_validation_enabled', 'custom_status_renaming'];
const DOSSIER_FIELDS = [
  'assisted',
  'self',
  'reopened',
  'exceptional_validation',
  'fast_add',
  'transferred_in',
  'deferred_processing',
  'sideletter',
  'sepa_mandate',
  'pending_changes',
];

const optionCode = (value: ContextScalar | SimLabelled) =>
  String(typeof value === 'object' && value !== null ? value.code : value);

interface WorkflowSimulatorPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkflowSimulatorPanel({ open, onOpenChange }: WorkflowSimulatorPanelProps) {
  const { t } = useTranslation();
  const sim = useWorkflowScenario();
  const [copied, setCopied] = useState(false);
  if (sim.status !== 'ready') return null;

  const { engine, scenario, update, transitions, locks } = sim;
  const { data } = engine;
  const tr = (key: string, fallback: string, vars?: Record<string, string | number>) => {
    const value = t(key, vars);
    return value === key ? fallback : value;
  };
  const workflow = engine.workflow(scenario.workflow);
  const { sequence, variants } = engine.sequenceOf(scenario.workflow);
  const stateLabel = engine.stateLabel;
  const currentLabel = stateLabel(scenario.state);
  const currentIndex = sequence.indexOf(scenario.state);
  const reachable = workflow?.reachable_states ?? [];

  const setState = (state: string) => update({ state });
  const setBranch = (state: string) => update(current => ({ ...current, state, previousState: current.state }));
  const setContext = (key: string, value: ContextValue) =>
    update(current => ({ ...current, context: { ...current.context, [key]: value } }));

  const branches: Record<number, WizardStepBranch & { onSelect?: () => void }> = {};
  variants.forEach(block => {
    (block.variant ?? []).forEach((code, position) => {
      if (sequence.includes(code)) return;
      const anchor = Math.min(position, sequence.length - 1);
      branches[anchor] = {
        label: stateLabel(code),
        note: block.note,
        active: scenario.state === code,
        onSelect: reachable.includes(code) ? () => setState(code) : undefined,
      };
    });
  });

  const branchTargets = Array.from(
    new Set(transitions.map(transition => transition.to).filter(to => !sequence.includes(to) && reachable.includes(to))),
  );
  const orderedReachable = [...sequence, ...reachable.filter(code => !sequence.includes(code))].filter(code =>
    reachable.includes(code),
  );

  const roleLabel = (code: string) => {
    const role = engine.roles.find(r => r.code === code);
    if (!role) return code;
    return role.right ? `${role.label} (${role.right})` : role.label;
  };
  const waiting = engine.waitingOn(scenario.state).map(code => engine.roles.find(r => r.code === code)?.label ?? code);
  const v1Mapping = engine.v1Mapping(scenario.state);
  const v1Label = engine.v1Label(scenario.state);
  const prerequisites = engine.prerequisitesOf(scenario.workflow);
  const contextLocks = engine.locksFromContext(scenario.context);

  const handleCopy = async () => {
    const ok = await copyToClipboard(window.location.href);
    if (!ok) {
      toast.error(t(`${P}.copyError`));
      return;
    }
    setCopied(true);
    toast.success(t(`${P}.copyDone`));
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    sim.reset();
    toast.success(t(`${P}.resetDone`));
  };

  const workflowTitle = (w: SimWorkflow) =>
    [
      w.id,
      w.initiator && tr(`${P}.workflow.initiators.${w.initiator}`, w.initiator),
      w.channel && tr(`${P}.workflow.channels.${w.channel}`, w.channel),
    ]
      .filter(Boolean)
      .join(' · ');

  const renderContextField = (key: string) => {
    const field = key;
    const setting = data.context[key];
    const label = tr(`${P}.context.fields.${field}`, setting?.label ?? key);
    if (!setting) {
      return (
        <p key={key} className="text-xs text-muted-foreground">
          {t(`${P}.context.missing`, { field: label })}
        </p>
      );
    }
    const value = scenario.context[key];

    let disabledReason: string | null = null;
    if (key === 'assisted' && !workflow?.assisted_allowed) {
      disabledReason = t(`${P}.context.assistedUnavailable`, { workflow: scenario.workflow });
    }
    if (key === 'self' && engine.selfForced(scenario.workflow)) {
      disabledReason = t(`${P}.context.selfForced`, { workflow: scenario.workflow });
    }

    const { kind } = contextKind(setting);
    const options = Array.isArray(setting.values) ? setting.values : [];

    if (kind === 'select') {
      return (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`sim-${key}`}>{label}</Label>
          <DisabledReason reason={disabledReason} className="w-full">
            <Select
              value={value === undefined ? undefined : String(value)}
              onValueChange={next => {
                const match = options.find(option => optionCode(option) === next);
                setContext(key, match === undefined ? next : typeof match === 'object' && match !== null ? match.code : match);
              }}
              disabled={Boolean(disabledReason)}
            >
              <SelectTrigger id={`sim-${key}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map(option => {
                  const code = optionCode(option);
                  const optionLabel =
                    typeof option === 'object' && option !== null
                      ? option.label
                      : tr(`${P}.context.values.${field}.${code}`, code);
                  return (
                    <SelectItem key={code} value={code}>
                      {optionLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </DisabledReason>
        </div>
      );
    }

    if (kind === 'counters' && value !== null && typeof value === 'object') {
      return (
        <div key={key} className="space-y-1.5">
          <Label>{label}</Label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(value).map(([counter, count]) => (
              <div key={counter} className="space-y-1">
                <Label htmlFor={`sim-${key}-${counter}`} className="text-xs text-muted-foreground">
                  {tr(`${P}.context.counters.${key}.${counter}`, counter)}
                </Label>
                <Input
                  id={`sim-${key}-${counter}`}
                  type="number"
                  min={0}
                  value={count}
                  onChange={e => setContext(key, { ...value, [counter]: Math.max(0, Number(e.target.value) || 0) })}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (kind === 'date') {
      return (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`sim-${key}`}>{label}</Label>
          <Input
            id={`sim-${key}`}
            type="date"
            value={typeof value === 'string' ? value : ''}
            onChange={e => setContext(key, e.target.value || null)}
          />
          <p className="text-xs text-muted-foreground">{t(`${P}.context.dateHint`)}</p>
        </div>
      );
    }

    if (kind === 'counter') {
      return (
        <div key={key} className="space-y-1.5">
          <Label htmlFor={`sim-${key}`}>{label}</Label>
          <Input
            id={`sim-${key}`}
            type="number"
            min={0}
            value={typeof value === 'number' ? value : 0}
            onChange={e => setContext(key, Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
      );
    }

    return (
      <DisabledReason key={key} reason={disabledReason} className="w-full">
        <div className="w-full">
          <SidePanelSwitchRow
            id={`sim-${key}`}
            label={label}
            checked={Boolean(value)}
            onCheckedChange={checked => setContext(key, checked)}
            disabled={Boolean(disabledReason)}
            description={disabledReason ?? undefined}
          />
        </div>
      </DisabledReason>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent
        side="right"
        style={SIDE_PANEL_STYLE}
        className="h-full p-0 gap-0"
        onInteractOutside={event => event.preventDefault()}
      >
        <SidePanelHeader title={t(`${P}.title`)} description={t(`${P}.description`)}>
          <DemoDossierMenu engine={engine} />
        </SidePanelHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={GitBranch} title={t(`${P}.workflow.title`)}>
            <SidePanelCard className="space-y-4">
              <Select value={scenario.workflow} onValueChange={id => update({ workflow: id })}>
                <SelectTrigger aria-label={t(`${P}.workflow.title`)}>
                  <SelectValue>
                    {workflow ? workflowTitle(workflow) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FAMILIES.map(family => {
                    const items = data.workflows.filter(w => engine.familyOf(w.id) === family);
                    if (!items.length) return null;
                    return (
                      <SelectGroup key={family}>
                        <SelectLabel>{t(`${P}.workflow.families.${family}`)}</SelectLabel>
                        {items.map(w => (
                          <SelectItem key={w.id} value={w.id}>
                            <span className="flex flex-col gap-1">
                              <span>{workflowTitle(w)}</span>
                              {engine.optionsOf(w.id).length > 0 && (
                                <span className="flex flex-wrap gap-1">
                                  {engine.optionsOf(w.id).map(option => (
                                    <Tag key={option} label={t(`${P}.workflow.options.${option}`)} />
                                  ))}
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    );
                  })}
                </SelectContent>
              </Select>
              {prerequisites.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t(`${P}.workflow.prerequisites`, { list: prerequisites.join(', ') })}
                </p>
              )}

              <WizardSteps
                steps={sequence.map(stateLabel)}
                current={currentIndex}
                ariaLabel={t(`${P}.sequence.ariaLabel`)}
                onSelect={index => setState(sequence[index])}
                branches={branches}
                labelPosition="below"
              />
              {currentIndex < 0 && (
                <p className="text-xs text-muted-foreground">
                  {t(`${P}.sequence.outOfSequence`, { state: currentLabel })}
                </p>
              )}
              {branchTargets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t(`${P}.sequence.branches`, { state: currentLabel })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {branchTargets.map(code => (
                      <Button
                        key={code}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        onClick={() => setBranch(code)}
                      >
                        {stateLabel(code)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Route} title={t(`${P}.state.title`)}>
            <SidePanelCard className="space-y-3">
              <Select value={scenario.state} onValueChange={setState}>
                <SelectTrigger aria-label={t(`${P}.state.title`)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderedReachable.map(code => (
                    <SelectItem key={code} value={code}>
                      {stateLabel(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm">
                {waiting.length
                  ? t(`${P}.state.waitingOn`, { who: waiting.join(', ') })
                  : t(`${P}.state.waitingOnUnknown`)}
              </p>
              {(v1Mapping || v1Label) && (
                <p className="text-xs text-muted-foreground">
                  {[
                    v1Mapping && t(`${P}.state.v1Mapping`, { value: v1Mapping }),
                    v1Label && t(`${P}.state.v1Label`, { value: v1Label }),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={UserCog} title={t(`${P}.role.title`)} collapsible>
            <SidePanelCard>
              <Select value={scenario.role} onValueChange={role => update({ role })}>
                <SelectTrigger aria-label={t(`${P}.role.title`)}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(data.context.role.values) ? data.context.role.values : []).map(option => {
                    const code = optionCode(option);
                    return (
                      <SelectItem key={code} value={code}>
                        {roleLabel(code)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </SidePanelCard>
            <WorkflowAudiencesCard />
          </SidePanelSection>

          <SidePanelSection icon={Landmark} title={t(`${P}.fund.title`)} collapsible>
            <SidePanelCard className="space-y-4">{FUND_FIELDS.map(renderContextField)}</SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={FileStack} title={t(`${P}.dossier.title`)} collapsible>
            <SidePanelCard className="space-y-4">{DOSSIER_FIELDS.map(renderContextField)}</SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Waypoints} title={t(`${P}.axes.title`)} collapsible>
            <SidePanelCard className="space-y-4">
              {AXIS_KEYS.map(axis => {
                const allowed = engine.allowedSubstates(axis, scenario.state, scenario.context, scenario.workflow);
                const substates = (data.axes[axis]?.substates ?? []).map(s => toLabelled(s));
                const id = `sim-axis-${axis}`;
                return (
                  <div key={axis} className="space-y-1.5">
                    <Label htmlFor={id}>{t(`${P}.axes.${axis}`)}</Label>
                    <Select
                      value={allowed.length ? scenario.axes[axis] : undefined}
                      onValueChange={value =>
                        update(current => ({ ...current, axes: { ...current.axes, [axis]: value } }))
                      }
                      disabled={!allowed.length}
                    >
                      <SelectTrigger id={id}>
                        <SelectValue placeholder={t(`${P}.axes.notApplicable`)} />
                      </SelectTrigger>
                      <SelectContent>
                        {substates
                          .filter(s => allowed.includes(s.code))
                          .map(s => (
                            <SelectItem key={s.code} value={s.code}>
                              {s.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Lock} title={t(`${P}.locks.title`)} collapsible>
            <SidePanelCard className="space-y-3">
              {data.editability.locks.map(lock => {
                const fromContext = contextLocks.includes(lock.code);
                const reason = fromContext ? t(`${P}.locks.fromContext`, { state: currentLabel }) : null;
                const id = `sim-lock-${lock.code}`;
                return (
                  <div key={lock.code} className="flex items-start gap-3">
                    <DisabledReason reason={reason}>
                      <Checkbox
                        id={id}
                        checked={locks.includes(lock.code)}
                        disabled={fromContext}
                        onCheckedChange={checked =>
                          update(current => ({
                            ...current,
                            manualLocks: checked
                              ? [...current.manualLocks, lock.code]
                              : current.manualLocks.filter(code => code !== lock.code),
                          }))
                        }
                      />
                    </DisabledReason>
                    <div className="space-y-0.5">
                      <Label htmlFor={id}>{lock.label ?? lock.code}</Label>
                      {reason && <p className="text-xs text-muted-foreground">{reason}</p>}
                    </div>
                  </div>
                );
              })}
            </SidePanelCard>
          </SidePanelSection>
        </div>

        <SidePanelFooter className="flex-col">
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              {t(`${P}.reset`)}
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? t(`${P}.copied`) : t(`${P}.copyLink`)}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t(`${P}.source`, { version: data.meta?.last_updated ?? t(`${P}.versionUnknown`) })}
          </p>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}

function DemoDossierMenu({ engine: e }: { engine: SimulatorEngine }) {
  const { t, lang } = useTranslation();
  const sim = useWorkflowScenario();
  if (sim.status !== 'ready' || sim.dossiers.length === 0) return null;
  const formatAmount = (amount: number) =>
    new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="self-start">
          <Shapes className="h-4 w-4" />
          {t(`${P}.examples.button`)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-96">
        {sim.dossiers.map(resolved => {
          const { dossier } = resolved;
          const state = e.findState(dossier.state);
          const reason = resolved.ok ? null : t(`${P}.examples.unresolved`, { missing: resolved.missing.join(', ') });
          return (
            <DropdownMenuItem
              key={dossier.id}
              disabled={!resolved.ok}
              onClick={() => {
                sim.loadDossier(dossier.id);
                toast.success(t(`${P}.examples.loaded`, { investor: dossier.data.investor }));
              }}
            >
              <FlaskConical className="h-4 w-4" />
              <span className="flex flex-col">
                <span>
                  {t(`${P}.examples.itemTitle`, {
                    workflow: dossier.workflow,
                    state: state?.label ?? dossier.state,
                    investor: dossier.data.investor,
                  })}
                </span>
                <span className="text-xs text-muted-foreground">
                  {[dossier.data.fund, dossier.data.distributor, formatAmount(dossier.data.amount)]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                {dossier.data.summary && <span className="text-xs text-muted-foreground">{dossier.data.summary}</span>}
                {reason && <span className="text-xs text-muted-foreground">{reason}</span>}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
