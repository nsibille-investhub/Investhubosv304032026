import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, BellOff, Eraser, ListChecks, PencilLine, Repeat, Share2 } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { RowActionButton } from './ui/row-actions';
import { EffectsPanel, type EffectItem } from './ui/effects-panel';
import {
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelSection,
} from './ui/side-panel';
import { useTranslation } from '../utils/languageContext';
import type { MockQuestion } from '../utils/subscriptionDetailMockData';
import {
  AMOUNT_CURRENCIES,
  COUNTRY_OPTIONS,
  describeConstraints,
  fromDraft,
  toDraft,
  validateDraft,
  type OnboardingDraftValue,
} from '../utils/onboardingQuestionTypes';

const T = 'subscriptions.detail.answerEdit';
const E = 'subscriptions.detail.answerEffects';

/** Donnée alimentée par la question, avec sa valeur actuelle. */
export interface AnswerEditTarget {
  key: string;
  object: string;
  field: string;
  currentValue: string;
}

/** Réponse qui changerait si les déclenchements sont rejoués. */
export interface AnswerEditTriggerChange {
  elementId: string;
  label: string;
  currentValue: string;
  nextValue: string;
  /** Déjà modifiée par le back-office : jamais écrasée par le rejeu. */
  kept: boolean;
}

export interface AnswerEditEffects {
  propagate: string[];
  replay: boolean;
}

interface AnswerEditPanelProps {
  /** Question modifiée, absente quand le panneau est fermé. */
  question: MockQuestion | null;
  currentValue: string;
  /** Section et itération, pour l'en-tête. */
  context: string;
  /** Après envoi en signature : motif obligatoire. */
  requiresReason: boolean;
  targets?: AnswerEditTarget[];
  /** Réponses déclenchées par la question ; absent si elle n'en déclenche aucune. */
  resolveTriggers?: (nextValue: string) => AnswerEditTriggerChange[];
  onClose: () => void;
  onSave: (value: string, reason: string | undefined, effects: AnswerEditEffects) => void;
}

/** Modification d'une réponse d'onboarding par le back-office (IC-5616). */
export function AnswerEditPanel({
  question,
  currentValue,
  context,
  requiresReason,
  targets = [],
  resolveTriggers,
  onClose,
  onSave,
}: AnswerEditPanelProps) {
  const { t } = useTranslation();
  const type = question?.type ?? 'text';
  const [draft, setDraft] = useState<OnboardingDraftValue>({ text: '', items: [], currency: 'EUR' });
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [propagate, setPropagate] = useState<string[]>([]);

  useEffect(() => {
    if (!question) return;
    setDraft(toDraft(question.type ?? 'text', currentValue));
    setReason('');
    setSubmitted(false);
    setPropagate(targets.map(target => target.key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, currentValue]);

  const violation = question ? validateDraft(type, draft, question.constraints) : null;
  const constraintHints = useMemo(() => describeConstraints(question?.constraints), [question]);
  const nextValue = question ? fromDraft(type, draft) : '';
  const unchanged = nextValue === currentValue;
  const reasonMissing = requiresReason && reason.trim() === '';

  const handleSave = () => {
    setSubmitted(true);
    if (violation || reasonMissing || unchanged) return;
    onSave(nextValue, requiresReason ? reason.trim() : undefined, { propagate, replay: true });
  };

  const emptyLabel = t(`${E}.empty`);
  const cleared = nextValue === '';
  const triggerChanges = resolveTriggers ? resolveTriggers(nextValue) : null;
  const effects: EffectItem[] = [
    ...targets.map(target => ({
      id: target.key,
      icon: cleared ? Eraser : Share2,
      label: t(cleared ? `${E}.reset` : `${E}.propagate`, {
        object: t(`${E}.objects.${target.object}`),
        field: t(`${E}.fields.${target.field}`),
      }),
      note: t(`${E}.valueChange`, {
        current: target.currentValue || emptyLabel,
        next: cleared ? emptyLabel : unchanged ? target.currentValue || emptyLabel : nextValue,
      }),
      reversible: true,
      option: {
        checked: propagate.includes(target.key),
        onCheckedChange: (checked: boolean) =>
          setPropagate(prev => (checked ? [...prev, target.key] : prev.filter(key => key !== target.key))),
      },
    })),
    ...(triggerChanges
      ? [
          {
            id: 'replay',
            icon: Repeat,
            label: t(`${E}.replay`),
            note:
              triggerChanges.length === 0
                ? t(`${E}.replayNone`)
                : t(`${E}.replayNote`),
            objects: triggerChanges.map(change => ({
              id: change.elementId,
              label: change.kept
                ? t(`${E}.replayKept`, { label: change.label, current: change.currentValue || emptyLabel })
                : t(`${E}.replayChange`, {
                    label: change.label,
                    current: change.currentValue || emptyLabel,
                    next: change.nextValue || emptyLabel,
                  }),
            })),
            defaultOpen: true,
            reversible: true,
          },
        ]
      : []),
  ];

  const options = type === 'country' ? COUNTRY_OPTIONS : question?.options ?? [];
  const label = question?.question.replace(/\s*\*\s*$/, '') ?? '';

  const moveItem = (from: number, to: number) =>
    setDraft(prev => {
      const items = [...prev.items];
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { ...prev, items };
    });

  const renderField = () => {
    switch (type) {
      case 'list':
      case 'country':
        return (
          <Select value={draft.text} onValueChange={text => setDraft(prev => ({ ...prev, text }))}>
            <SelectTrigger className="h-11" aria-label={t(`${T}.newValue`)}>
              <SelectValue placeholder={t(`${T}.selectPlaceholder`)} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'multiChoice':
        return (
          <div className="space-y-2">
            {options.map(option => {
              const checked = draft.items.includes(option);
              return (
                <label key={option} className="flex items-center gap-3 text-sm text-foreground">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={next =>
                      setDraft(prev => ({
                        ...prev,
                        items: next
                          ? options.filter(o => o === option || prev.items.includes(o))
                          : prev.items.filter(item => item !== option),
                      }))
                    }
                  />
                  {option}
                </label>
              );
            })}
          </div>
        );
      case 'rankedChoice':
        return (
          <ol className="divide-y divide-border rounded-lg border border-border bg-card">
            {draft.items.map((item, idx) => (
              <li key={item} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="w-5 text-muted-foreground tabular-nums">{idx + 1}.</span>
                <span className="flex-1 text-foreground">{item}</span>
                <RowActionButton
                  icon={ArrowUp}
                  tooltip={t(`${T}.moveUp`)}
                  disabledReason={idx === 0 ? t(`${T}.alreadyFirst`) : undefined}
                  onClick={() => moveItem(idx, idx - 1)}
                />
                <RowActionButton
                  icon={ArrowDown}
                  tooltip={t(`${T}.moveDown`)}
                  disabledReason={idx === draft.items.length - 1 ? t(`${T}.alreadyLast`) : undefined}
                  onClick={() => moveItem(idx, idx + 1)}
                />
              </li>
            ))}
          </ol>
        );
      case 'amount':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="decimal"
              className="h-11 flex-1"
              value={draft.text}
              onChange={e => setDraft(prev => ({ ...prev, text: e.target.value }))}
              aria-label={t(`${T}.newValue`)}
            />
            <Select value={draft.currency} onValueChange={currency => setDraft(prev => ({ ...prev, currency }))}>
              <SelectTrigger className="h-11 w-28" aria-label={t(`${T}.currency`)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AMOUNT_CURRENCIES.map(currency => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'percentage':
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="h-11 flex-1"
              value={draft.text}
              onChange={e => setDraft(prev => ({ ...prev, text: e.target.value }))}
              aria-label={t(`${T}.newValue`)}
            />
            {type === 'percentage' && <span className="text-sm text-muted-foreground">%</span>}
          </div>
        );
      case 'date':
        return (
          <Input
            type="date"
            className="h-11"
            value={draft.text}
            onChange={e => setDraft(prev => ({ ...prev, text: e.target.value }))}
            aria-label={t(`${T}.newValue`)}
          />
        );
      default:
        return (
          <Input
            className="h-11"
            value={draft.text}
            onChange={e => setDraft(prev => ({ ...prev, text: e.target.value }))}
            aria-label={t(`${T}.newValue`)}
          />
        );
    }
  };

  return (
    <Sheet open={question !== null} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={t(`${T}.title`)} description={context} />
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={PencilLine} title={label} description={t(`${T}.typeLabel.${type}`)}>
            <SidePanelCard>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>{t(`${T}.currentValue`)}</Label>
                  <p className="text-sm text-foreground">{currentValue || t(`${T}.noValue`)}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t(`${T}.newValue`)}</Label>
                  {renderField()}
                  {violation && (submitted || !unchanged) && (
                    <p role="alert" className="text-xs text-red-600">
                      {t(violation.key, violation.vars)}
                    </p>
                  )}
                  {submitted && !violation && unchanged && (
                    <p className="text-xs text-muted-foreground">{t(`${T}.unchanged`)}</p>
                  )}
                </div>
                {requiresReason && (
                  <div className="space-y-2">
                    <Label>
                      {t(`${T}.reason`)}
                      <span className="text-red-600 ml-0.5">*</span>
                    </Label>
                    <Textarea
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder={t(`${T}.reasonPlaceholder`)}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">{t(`${T}.reasonHint`)}</p>
                    {submitted && reasonMissing && (
                      <p role="alert" className="text-xs text-red-600">
                        {t(`${T}.reasonRequired`)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </SidePanelCard>
          </SidePanelSection>

          {effects.length > 0 && (
            <EffectsPanel
              title={t(`${E}.title`)}
              description={t(`${E}.description`)}
              effects={effects}
              marker="none"
            />
          )}

          {constraintHints.length > 0 && (
            <SidePanelSection icon={ListChecks} title={t(`${T}.constraintsTitle`)} description={t(`${T}.constraintsDesc`)}>
              <SidePanelCard>
                <ul className="space-y-1 text-sm text-foreground/80">
                  {constraintHints.map(hint => (
                    <li key={hint.key}>{t(hint.key, hint.vars)}</li>
                  ))}
                </ul>
              </SidePanelCard>
            </SidePanelSection>
          )}

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <BellOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {t(`${T}.afterSave`)}
          </p>
        </div>
        <SidePanelFooter>
          <Button variant="outline" onClick={onClose}>
            {t(`${T}.cancel`)}
          </Button>
          <Button onClick={handleSave} disabled={submitted && Boolean(violation || reasonMissing || unchanged)}>
            {t(`${T}.save`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
