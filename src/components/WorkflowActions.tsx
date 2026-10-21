import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { CalendarCheck, Construction, Info, Loader2, PenTool, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { useWorkflowScenario } from '../utils/workflowScenarioContext';
import { evaluateCondition, toLabelled } from '../utils/workflowSimulator/engine';
import { buildActionMenu, widgetFor, type ActionMenu, type MenuAction } from '../utils/workflowSimulator/pageActions';
import type { SimContextCondition, SimLabelled, WorkflowScenario } from '../utils/workflowSimulator/types';
import { mockRequiredDocuments, mockSections } from '../utils/subscriptionDetailMockData';
import { ConfirmDialog } from './ui/confirm-dialog';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { DisabledReason } from './ui/disabled-reason';
import { Callout } from './ui/callout';
import { Tag } from './Tag';

const A = 'subscriptions.workflowSimulator.actions';
const MIN_EXCEPTIONAL_REASON = 20;
// Délai fictif d'enregistrement d'une action.
const SAVE_DELAY_MS = 600;

type Prerequisite = SimLabelled & { condition?: SimContextCondition };

interface WorkflowActionsValue {
  menu: ActionMenu | null;
  request: (action: MenuAction) => void;
  pending: string | null;
}

const WorkflowActionsContext = createContext<WorkflowActionsValue>({ menu: null, request: () => undefined, pending: null });

export function useWorkflowActions() {
  return useContext(WorkflowActionsContext);
}

/** Menu d'actions du scénario et confirmations, partagés par l'en-tête et les widgets. */
export function WorkflowActionsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const sim = useWorkflowScenario();
  const [current, setCurrent] = useState<MenuAction | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [selection, setSelection] = useState<string[]>([]);
  const [prereqMet, setPrereqMet] = useState<Record<string, boolean>>({});

  const menu = useMemo(
    () => (sim.status === 'ready' ? buildActionMenu(sim.engine, sim.scenario, sim.actions, t) : null),
    // t ne change qu'avec la langue, déjà portée par sim.engine.
    [sim],
  );

  const ready = sim.status === 'ready' ? sim : null;
  const prerequisites: Prerequisite[] = useMemo(() => {
    const raw = (ready?.engine.data.axes.signature as { send_prerequisites?: Array<Prerequisite | string> } | undefined)
      ?.send_prerequisites;
    return (raw ?? []).map(p => toLabelled<Prerequisite>(p));
  }, [ready?.engine]);

  const request = (action: MenuAction) => {
    if (!ready || action.disabled) return;
    setReason('');
    setDate(new Date().toISOString().slice(0, 10));
    setSelection([]);
    setMessage(t(`${A}.reopen.defaultMessage`));
    setPrereqMet(
      Object.fromEntries(prerequisites.map(p => [p.code, p.condition ? evaluateCondition(p.condition, ready.scenario.context) : false])),
    );
    setCurrent(action);
  };

  const value: WorkflowActionsValue = { menu, request, pending };

  if (!ready) return <WorkflowActionsContext.Provider value={value}>{children}</WorkflowActionsContext.Provider>;

  const stateLabel = ready.engine.stateLabel;
  const action = current;
  const alreadySent = action ? ready.history.some(h => h.trigger === action.code) : false;
  const signatureSubstates = (ready.engine.data.axes.signature?.substates ?? []).map(s => toLabelled(s).code);
  const packSent =
    ready.history.some(h => ready.engine.actionLabel(h.trigger).toLowerCase().includes('signature')) ||
    (signatureSubstates.length > 0 &&
      signatureSubstates.includes(ready.scenario.axes.signature) &&
      ready.scenario.axes.signature !== signatureSubstates[0]);

  let confirmDisabledReason: string | undefined;
  if (action?.kind === 'cancel' || action?.kind === 'refuseFinal') {
    if (!reason.trim()) confirmDisabledReason = t(`${A}.reasonRequired`);
  }
  if (action?.kind === 'exceptional' && reason.trim().length < MIN_EXCEPTIONAL_REASON) {
    confirmDisabledReason = t(`${A}.reasonMin`, { count: MIN_EXCEPTIONAL_REASON });
  }
  if (action?.kind === 'reopen' && selection.length === 0) confirmDisabledReason = t(`${A}.reopen.selectionRequired`);
  if (action?.kind === 'sendSignature') {
    const missing = prerequisites.filter(p => !prereqMet[p.code]);
    if (missing.length) confirmDisabledReason = t(`${A}.signature.missing`, { list: missing.map(p => p.label).join(', ') });
  }
  if (action?.kind === 'validateWithoutSignature' && !date) confirmDisabledReason = t(`${A}.dateRequired`);

  const confirm = () => {
    if (!action) return;
    if (action.kind === 'comingSoon') {
      setCurrent(null);
      return;
    }
    const snapshot: WorkflowScenario = ready.scenario;
    setPending(action.code);
    window.setTimeout(() => {
      const note = reason.trim() || undefined;
      if (action.target) {
        ready.playTransition(action.target, action.code, { note });
        const target = stateLabel(action.target);
        toast.success(t(`${A}.done`, { action: action.label, state: target }), {
          action: {
            label: t(`${A}.undo`),
            onClick: () => {
              ready.restore(snapshot);
              toast.info(t(`${A}.undone`, { state: stateLabel(snapshot.state) }));
            },
          },
        });
      } else {
        toast.success(t(`${A}.doneNoTransition`, { action: action.label }));
      }
      setPending(null);
      setCurrent(null);
    }, SAVE_DELAY_MS);
  };

  const body = action && renderBody();

  function renderBody() {
    if (!action || !ready) return null;
    const targetLabel = action.target ? stateLabel(action.target) : null;
    const reasonField = (min?: number) => (
      <div className="space-y-1.5">
        <Label htmlFor="workflow-action-reason">{t(`${A}.reasonLabel`)}</Label>
        <Textarea
          id="workflow-action-reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          aria-invalid={Boolean(confirmDisabledReason) && reason.length > 0}
        />
        {min && (
          <p className="text-xs text-muted-foreground">{t(`${A}.reasonCounter`, { count: reason.trim().length, min })}</p>
        )}
      </div>
    );
    switch (action.kind) {
      case 'cancel':
        return (
          <div className="space-y-4">
            <Callout tone="warning" role="alert">{t(`${A}.cancel.reminder`)}</Callout>
            {reasonField()}
          </div>
        );
      case 'exceptional':
        return (
          <div className="space-y-4">
            <Callout tone="info">{t(`${A}.exceptional.right`)}</Callout>
            {reasonField(MIN_EXCEPTIONAL_REASON)}
          </div>
        );
      case 'refuseFinal':
        return (
          <div className="space-y-4">
            <Callout tone="danger" role="alert">{t(`${A}.refuseFinal.warning`)}</Callout>
            {reasonField()}
          </div>
        );
      case 'reopen': {
        const items = [
          ...mockSections.map(s => ({ id: `section-${s.id}`, label: t(s.titleKey) })),
          ...mockRequiredDocuments.filter(d => d.hasFile).map(d => ({ id: `doc-${d.nameKey}`, label: t(d.nameKey) })),
        ];
        return (
          <div className="space-y-4">
            {packSent && <Callout tone="warning" role="alert">{t(`${A}.reopen.packSent`)}</Callout>}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t(`${A}.reopen.selectionLabel`)}</p>
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <Checkbox
                    id={item.id}
                    checked={selection.includes(item.id)}
                    onCheckedChange={checked =>
                      setSelection(list => (checked ? [...list, item.id] : list.filter(id => id !== item.id)))
                    }
                  />
                  <Label htmlFor={item.id} className="font-normal">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="workflow-action-message">{t(`${A}.reopen.messageLabel`)}</Label>
              <Textarea id="workflow-action-message" value={message} onChange={e => setMessage(e.target.value)} />
            </div>
          </div>
        );
      }
      case 'sendSignature':
        return (
          <div className="space-y-4">
            {alreadySent && <Callout tone="warning" role="alert">{t(`${A}.signature.secondSend`)}</Callout>}
            {prerequisites.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t(`${A}.signature.noPrerequisites`)}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t(`${A}.signature.prerequisites`)}</p>
                {prerequisites.map(p => (
                  <div key={p.code} className="flex items-center gap-2">
                    <Checkbox
                      id={`prereq-${p.code}`}
                      checked={Boolean(prereqMet[p.code])}
                      onCheckedChange={checked => setPrereqMet(m => ({ ...m, [p.code]: Boolean(checked) }))}
                    />
                    <Label htmlFor={`prereq-${p.code}`} className="font-normal">
                      {p.label}
                    </Label>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">{t(`${A}.signature.simulateHint`)}</p>
              </div>
            )}
          </div>
        );
      case 'validateWithoutSignature':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="workflow-action-date">{t(`${A}.withoutSignature.dateLabel`)}</Label>
              <Input id="workflow-action-date" type="date" className="h-11" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <Callout tone="info">{t(`${A}.withoutSignature.reminder`)}</Callout>
          </div>
        );
      case 'restore':
        return targetLabel ? <Callout tone="info">{t(`${A}.restore.reminder`, { state: targetLabel })}</Callout> : null;
      case 'comingSoon':
        return <Callout tone="info">{t(`${A}.comingSoon`)}</Callout>;
      default:
        return null;
    }
  }

  const iconFor = () => {
    switch (action?.kind) {
      case 'sendSignature':
        return PenTool;
      case 'validateKyc':
      case 'exceptional':
        return ShieldCheck;
      case 'validateWithoutSignature':
        return CalendarCheck;
      case 'comingSoon':
        return Construction;
      default:
        return action?.destructive ? undefined : Info;
    }
  };

  return (
    <WorkflowActionsContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={Boolean(action)}
        onOpenChange={open => !open && setCurrent(null)}
        title={action ? t(`${A}.confirmTitle`, { action: action.label }) : ''}
        description={
          action && action.kind !== 'comingSoon'
            ? action.target
              ? t(`${A}.confirmTarget`, { state: stateLabel(action.target) })
              : t(`${A}.confirmNoTarget`)
            : undefined
        }
        confirmLabel={action?.kind === 'comingSoon' ? t(`${A}.close`) : action?.label ?? ''}
        cancelLabel={t(`${A}.keep`)}
        destructive={action?.destructive}
        loading={Boolean(action && pending === action.code)}
        confirmDisabledReason={confirmDisabledReason}
        onConfirm={confirm}
        icon={iconFor()}
      >
        {body}
      </ConfirmDialog>
    </WorkflowActionsContext.Provider>
  );
}

/** Boutons des actions du rôle simulé dans un widget (validateurs : Conformité, Suivi des signatures). */
export function WorkflowRoleActions({ widget }: { widget: 'compliance' | 'signature' }) {
  const { t } = useTranslation();
  const { menu, request, pending } = useWorkflowActions();
  if (!menu || menu.placement !== 'compliance') return null;
  const actions = menu.all.filter(a => widgetFor(a) === widget);
  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">{t(`${A}.roleActions`)}</span>
      {actions.map(action => (
        <DisabledReason key={action.code} reason={action.disabledReason}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={action.disabled || pending === action.code}
            onClick={() => request(action)}
          >
            {pending === action.code && <Loader2 className="w-4 h-4 animate-spin" />}
            {action.label}
          </Button>
        </DisabledReason>
      ))}
    </div>
  );
}

/** Libellé d'une entrée de menu, avec l'étiquette "Droit dédié" le cas échéant. */
export function WorkflowActionLabel({ action }: { action: MenuAction }) {
  const { t } = useTranslation();
  if (!action.dedicated) return <>{action.label}</>;
  return (
    <span className="inline-flex items-center gap-2">
      {action.label}
      <Tag label={t(`${A}.dedicatedRight`)} />
    </span>
  );
}
