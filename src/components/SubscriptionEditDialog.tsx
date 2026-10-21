import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Clock, Pencil, PencilOff, Save, ShieldAlert, TrendingDown, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { useWorkflowScenario } from '../utils/workflowScenarioContext';
import { normalizeText } from '../utils/workflowSimulator/engine';
import { assignFields, groupViews, lockFlavor, summarize, UNASSIGNED_GROUP, type GroupView } from '../utils/workflowSimulator/editability';
import { useWorkflowActions } from './WorkflowActions';
import {
  BigModal,
  BigModalBody,
  BigModalContent,
  BigModalPanelFooter,
  BigModalPanelHeader,
} from './ui/big-modal';
import { FormSection, FormSubsection } from './ui/form-section';
import { FormField } from './ui/form-field';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Callout } from './ui/callout';
import { DisabledReason } from './ui/disabled-reason';
import { SidePanelSwitchRow } from './ui/side-panel';
import { ConfirmDialog } from './ui/confirm-dialog';

const E = 'subscriptions.workflowSimulator.edit';
const MIN_EXCEPTIONAL_REASON = 20;
// Délai fictif d'enregistrement.
const SAVE_DELAY_MS = 600;
const BANK_FIELDS = ['iban', 'bic'];
const SUBSCRIBER_TYPE_FIELD = 'subscriberTitle';

export interface EditableField {
  id: string;
  label: string;
  value: string;
}

/** État d'éditabilité de chaque champ de la fiche, pour le mode Plus et la modale. */
export function useFieldEditability(fieldIds: string[], exceptionalOn = false) {
  const { t } = useTranslation();
  const sim = useWorkflowScenario();
  return useMemo(() => {
    if (sim.status !== 'ready') return null;
    const views = groupViews(sim.engine, sim.scenario, sim.editability, exceptionalOn, t);
    const assignment = assignFields(sim.engine, fieldIds);
    const byField = new Map<string, GroupView | null>();
    Object.entries(assignment).forEach(([group, ids]) =>
      ids.forEach(id => byField.set(id, views.find(v => v.group === group) ?? null)),
    );
    return { views, assignment, byField };
    // t ne change qu'avec la langue, déjà portée par sim.engine.
  }, [sim, fieldIds.join('|'), exceptionalOn]);
}

/** Bouton Modifier : gp et gp_exceptional seulement. */
export function canEditSubscription(role: string): boolean {
  return role === 'gp' || role === 'gp_exceptional';
}

/** Icône d'une valeur du mode Plus : modifier, motif du verrou ou demande en attente. */
export function FieldEditIcon({
  view,
  onEdit,
}: {
  view: GroupView | null | undefined;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  if (view === undefined) return null;
  if (!view) {
    return (
      <DisabledReason reason={t(`${E}.unassigned`)}>
        <PencilOff className="w-3 h-3 opacity-50" aria-label={t(`${E}.unassigned`)} />
      </DisabledReason>
    );
  }
  if (view.pendingRequest) {
    return (
      <button
        type="button"
        className="inline-flex"
        aria-label={t(`${E}.pendingRequest`)}
        title={t(`${E}.pendingRequest`)}
        onClick={() => toast.info(t(`${E}.openRequest`))}
      >
        <Clock className="w-3 h-3" />
      </button>
    );
  }
  if (!view.editable || view.amountsOnActive) {
    return (
      <DisabledReason reason={view.message}>
        <PencilOff className="w-3 h-3 opacity-50" aria-label={view.message} />
      </DisabledReason>
    );
  }
  return (
    <button type="button" className="inline-flex hover:text-foreground" aria-label={t(`${E}.editField`)} onClick={onEdit}>
      <Pencil className="w-3 h-3" />
    </button>
  );
}

interface SubscriptionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: EditableField[];
  /** Groupe sur lequel ouvrir la modale. */
  initialGroup?: string | null;
  onSaved: (values: Record<string, string>) => void;
}

/** Modale de modification pilotée par editabilityFor(state, locks) : une section par groupe. */
export function SubscriptionEditDialog({ open, onOpenChange, fields, initialGroup, onSaved }: SubscriptionEditDialogProps) {
  const { t } = useTranslation();
  const sim = useWorkflowScenario();
  const { menu, request } = useWorkflowActions();
  const [exceptionalOn, setExceptionalOn] = useState(false);
  const [reason, setReason] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmSave, setConfirmSave] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const fieldIds = useMemo(() => fields.map(f => f.id), [fields]);
  const editability = useFieldEditability(fieldIds, exceptionalOn);

  const initial = useMemo(() => Object.fromEntries(fields.map(f => [f.id, f.value])), [fields]);

  useEffect(() => {
    if (!open) return;
    setValues(initial);
    setExceptionalOn(false);
    setReason('');
    if (initialGroup) {
      window.setTimeout(() => document.getElementById(`edit-group-${initialGroup}`)?.scrollIntoView({ block: 'start' }), 50);
    }
  }, [open]);

  if (sim.status !== 'ready' || !editability) return null;

  const { engine, scenario, locks } = sim;
  const changed = fieldIds.filter(id => (values[id] ?? '') !== (initial[id] ?? ''));
  const dirty = changed.length > 0 || reason.length > 0;
  const groupOf = (id: string) => editability.byField.get(id) ?? null;
  const changedGroups = new Set(changed.map(id => groupOf(id)?.value));
  const resetsSignature = changedGroups.has('O*');
  const sepaLock = locks.find(code => lockFlavor(code) === 'sepaApproved');
  const bankChanged = sepaLock && changed.some(id => BANK_FIELDS.includes(id));
  const onboardingLock = locks.find(code => lockFlavor(code) === 'onboardingStarted');
  const isExceptionalRole = scenario.role === 'gp_exceptional';

  let blockingError: string | undefined;
  if (exceptionalOn && reason.trim().length < MIN_EXCEPTIONAL_REASON) {
    blockingError = t(`${E}.reasonMin`, { count: MIN_EXCEPTIONAL_REASON });
  } else if (changed.length === 0) {
    blockingError = t(`${E}.nothingChanged`);
  }

  const close = () => (dirty ? setConfirmDiscard(true) : onOpenChange(false));

  const persist = () => {
    setConfirmSave(false);
    setSaving(true);
    window.setTimeout(() => {
      if (resetsSignature) {
        const target = engine.findState('validee_a_envoyer') ?? engine.findState('Validée à envoyer');
        if (target) {
          sim.playTransition(target.code, 'edit_resets_signature', {
            note: reason.trim() || undefined,
            patch: next => ({ ...next, axes: { ...next.axes, signature: '' } }),
          });
        } else {
          console.warn('[Simulateur] État validee_a_envoyer introuvable : la procédure de signature n\'est pas réinitialisée');
        }
      }
      const effects = changed.flatMap(id => sim.demo.editSideEffects[id] ?? []);
      toast.success(t(`${E}.saved`), {
        description: effects.length ? t(`${E}.effects`, { list: effects.join(', ') }) : undefined,
      });
      onSaved(Object.fromEntries(changed.map(id => [id, values[id]])));
      setSaving(false);
      onOpenChange(false);
    }, SAVE_DELAY_MS);
  };

  const save = () => (resetsSignature || bankChanged ? setConfirmSave(true) : persist());

  const actionByPrefix = (prefix: string) => menu?.all.find(a => normalizeText(a.label).startsWith(prefix));
  const openAmountAction = (prefix: string) => {
    const action = actionByPrefix(prefix);
    if (action && !action.disabled) request(action);
    else toast.info(t(`${E}.comingSoon`));
  };

  const renderField = (id: string, view: GroupView | null) => {
    const field = fields.find(f => f.id === id);
    if (!field) return null;
    const editable = Boolean(view?.editable);
    const reasonText = view ? view.message : t(`${E}.unassigned`);
    const hint =
      onboardingLock && id === SUBSCRIBER_TYPE_FIELD && view?.value === 'E' ? t(`${E}.onboardingStarted`) : undefined;
    return (
      <FormField key={id} id={`edit-${id}`} label={field.label} hint={hint}>
        {editable ? (
          <Input
            id={`edit-${id}`}
            className="h-11"
            value={values[id] ?? ''}
            onChange={e => setValues(v => ({ ...v, [id]: e.target.value }))}
          />
        ) : (
          <DisabledReason reason={reasonText} className="w-full">
            <Input id={`edit-${id}`} className="h-11" value={values[id] ?? ''} readOnly disabled />
          </DisabledReason>
        )}
      </FormField>
    );
  };

  const sections = [
    ...editability.views.map(view => ({ view, ids: editability.assignment[view.group] ?? [] })),
    { view: null as GroupView | null, ids: editability.assignment[UNASSIGNED_GROUP] ?? [] },
  ].filter(section => section.ids.length > 0 || section.view);

  return (
    <>
      <BigModal open={open} onOpenChange={next => (next ? onOpenChange(true) : close())}>
        <BigModalContent className="p-0 gap-0">
          <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-3xl">
            <BigModalPanelHeader
              icon={Pencil}
              title={t(`${E}.title`)}
              subtitle={t(`${E}.subtitle`)}
              onClose={close}
              closeLabel={t(`${E}.close`)}
            />
            <BigModalBody className="flex-1 space-y-5 overflow-y-auto">
              <Callout tone={exceptionalOn ? 'warning' : 'info'}>
                <div className="space-y-3">
                  <p>{summarize(engine, scenario, editability.views, t)}</p>
                  {isExceptionalRole && (
                    <SidePanelSwitchRow
                      id="edit-exceptional"
                      label={t(`${E}.exceptional.toggle`)}
                      description={t(`${E}.exceptional.description`)}
                      checked={exceptionalOn}
                      onCheckedChange={setExceptionalOn}
                    />
                  )}
                  {exceptionalOn && (
                    <FormField
                      id="edit-exceptional-reason"
                      label={t(`${E}.exceptional.reason`)}
                      required
                      error={reason.length > 0 && reason.trim().length < MIN_EXCEPTIONAL_REASON ? blockingError : undefined}
                      hint={t(`${E}.exceptional.counter`, { count: reason.trim().length, min: MIN_EXCEPTIONAL_REASON })}
                    >
                      <Textarea id="edit-exceptional-reason" value={reason} onChange={e => setReason(e.target.value)} />
                    </FormField>
                  )}
                </div>
              </Callout>

              {sections.map(({ view, ids }) => (
                <FormSection
                  key={view?.group ?? UNASSIGNED_GROUP}
                  id={`edit-group-${view?.group ?? UNASSIGNED_GROUP}`}
                  icon={view && !view.editable ? ShieldAlert : undefined}
                  title={view ? view.label : t(`${E}.unassignedTitle`)}
                  description={view ? view.message : t(`${E}.unassigned`)}
                  action={
                    view?.pendingRequest ? (
                      <Button type="button" variant="link" size="sm" onClick={() => toast.info(t(`${E}.openRequest`))}>
                        {t(`${E}.seeRequest`)}
                      </Button>
                    ) : undefined
                  }
                >
                  <FormSubsection>
                    {view?.amountsOnActive ? (
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => openAmountAction("reduction d'engagement")}>
                          <TrendingDown className="w-4 h-4" />
                          {t(`${E}.reduceCommitment`)}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => openAmountAction('transferer')}>
                          <ArrowRightLeft className="w-4 h-4" />
                          {t(`${E}.transfer`)}
                        </Button>
                      </div>
                    ) : ids.length ? (
                      <div className="grid gap-4 md:grid-cols-2">{ids.map(id => renderField(id, view))}</div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t(`${E}.noField`)}</p>
                    )}
                  </FormSubsection>
                </FormSection>
              ))}
            </BigModalBody>
            <BigModalPanelFooter
              start={
                <Button variant="ghost" size="sm" className="h-9" onClick={close} disabled={saving}>
                  <X className="w-4 h-4 mr-1" />
                  {t(`${E}.cancel`)}
                </Button>
              }
              end={
                <DisabledReason reason={blockingError}>
                  <Button size="sm" className="h-9" onClick={save} disabled={saving || Boolean(blockingError)}>
                    <Save className="w-4 h-4" />
                    {saving ? t(`${E}.saving`) : t(`${E}.save`)}
                  </Button>
                </DisabledReason>
              }
            />
          </div>
        </BigModalContent>
      </BigModal>

      <ConfirmDialog
        open={confirmSave}
        onOpenChange={setConfirmSave}
        title={t(`${E}.confirm.title`)}
        confirmLabel={t(`${E}.confirm.action`)}
        onConfirm={persist}
        destructive={resetsSignature}
      >
        <div className="space-y-3">
          {resetsSignature && (
            <Callout tone="warning" role="alert">
              {t(`${E}.confirm.resetsSignature`, {
                state: engine.stateLabel(
                  (engine.findState('validee_a_envoyer') ?? engine.findState('Validée à envoyer'))?.code ?? '',
                ),
              })}
            </Callout>
          )}
          {bankChanged && (
            <Callout tone="warning" role="alert">
              {t(`${E}.confirm.sepa`)}
            </Callout>
          )}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
        title={t(`${E}.discard.title`)}
        description={t(`${E}.discard.description`)}
        confirmLabel={t(`${E}.discard.action`)}
        destructive
        onConfirm={() => {
          setConfirmDiscard(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
