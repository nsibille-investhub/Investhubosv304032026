import { useEffect, useState } from 'react';
import { BellOff, Gauge, History, Lock, MessageSquare, MessageSquarePlus, PencilLine } from 'lucide-react';
import { Button } from './ui/button';
import { DisabledReason } from './ui/disabled-reason';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent } from './ui/sheet';
import {
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelSection,
  SidePanelSwitchRow,
} from './ui/side-panel';
import { Textarea } from './ui/textarea';
import { useTranslation } from '../utils/languageContext';
import type { RiskComponentSource } from '../utils/subscriptionRiskMockData';

const T = 'subscriptions.detail.compliance.profile.panel';

export interface ScoreComment {
  id: string;
  /** Composante, section ou score global concerné. */
  targetId: string;
  labelKey: string;
  /** Absent pour un commentaire sans modification de score. `next` null : retour au score calculé. */
  scoreChange?: { previous: number | null; next: number | null };
  answerChange?: { previous: string; next: string };
  comment: string;
  by: string;
  at: string;
}

export interface RiskScoreTarget {
  id: string;
  kind: RiskComponentSource | 'section' | 'profile';
  labelKey: string;
  /** Réponse retenue pour le calcul, absente pour une section et pour le score global. */
  answer?: string;
  /** Valeurs proposées quand la question est une liste. */
  answerOptions?: string[];
  score: number | null;
  min: number;
  max: number;
  /** Score de section ou score global déjà saisi à la main : le retour au calcul est proposé. */
  resettable: boolean;
}

export interface RiskScoreSave {
  /** Absent quand la réponse n'a pas changé. */
  answer?: string;
  /** Absent quand le score n'a pas changé, null pour un retour au score calculé. */
  score?: number | null;
  comment: string;
}

const ANSWER_EDITABLE: ReadonlyArray<RiskScoreTarget['kind']> = ['onboardingAnswer', 'manualQuestion'];

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Un commentaire de score : objet, variation de la réponse et du score, texte, auteur et date. */
export function ScoreCommentItem({ item, showLabel = true }: { item: ScoreComment; showLabel?: boolean }) {
  const { t } = useTranslation();
  const format = (value: number | null) => (value === null ? t(`${T}.computedValue`) : String(value));

  return (
    <li className="px-4 py-3">
      {showLabel && <p className="text-sm font-semibold text-foreground">{t(item.labelKey)}</p>}
      {item.answerChange && (
        <p className="text-xs text-muted-foreground">
          {t(`${T}.answerChange`, {
            previous: item.answerChange.previous || t(`${T}.noAnswer`),
            next: item.answerChange.next || t(`${T}.noAnswer`),
          })}
        </p>
      )}
      {item.scoreChange && (
        <p className="text-xs text-muted-foreground tabular-nums">
          {t(`${T}.scoreChange`, {
            previous: format(item.scoreChange.previous),
            next: format(item.scoreChange.next),
          })}
        </p>
      )}
      <p className="mt-1 text-sm text-foreground">{item.comment}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.by} · {item.at}
      </p>
    </li>
  );
}

interface RiskScorePanelProps {
  /** Score consulté, absent quand le panneau est fermé. */
  target: RiskScoreTarget | null;
  /** Section du profil, pour l'en-tête. */
  context?: string;
  comments: ScoreComment[];
  /** Score validé ou dossier validé : le panneau est en lecture seule, motif affiché. */
  readOnlyReason?: string;
  onClose: () => void;
  onSave: (target: RiskScoreTarget, change: RiskScoreSave) => void;
  onOpenAllComments: () => void;
}

/** Détail d'un score du profil de risque : réponse, score, commentaire et commentaires précédents. */
export function RiskScorePanel({
  target,
  context,
  comments,
  readOnlyReason,
  onClose,
  onSave,
  onOpenAllComments,
}: RiskScorePanelProps) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState('');
  const [reset, setReset] = useState(false);
  const [comment, setComment] = useState('');

  const initialScore = target?.score === null || target?.score === undefined ? '' : String(target.score);

  useEffect(() => {
    if (!target) return;
    setAnswer(target.answer ?? '');
    setScore(target.score === null ? '' : String(target.score));
    setReset(false);
    setComment('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.id]);

  const readOnly = Boolean(readOnlyReason);
  const hasAnswer = target?.answer !== undefined;
  const answerEditable = Boolean(target) && ANSWER_EDITABLE.includes(target!.kind);

  const parsed = score.trim() === '' ? Number.NaN : Number(score.replace(',', '.'));
  const scoreTouched = score.trim() !== initialScore;
  const scoreInvalid =
    !reset && scoreTouched && (Number.isNaN(parsed) || parsed < (target?.min ?? 0) || parsed > (target?.max ?? 0));
  const scoreChanged = reset || (scoreTouched && !scoreInvalid);
  const answerChanged = answerEditable && answer.trim() !== (target?.answer ?? '');
  const commentMissing = comment.trim() === '';

  const saveReason = scoreInvalid
    ? t(`${T}.scoreHint`, { min: target?.min ?? 0, max: target?.max ?? 0 })
    : commentMissing
      ? t(scoreChanged || answerChanged ? `${T}.commentRequired` : `${T}.nothingToSave`)
      : undefined;

  const history = comments.filter(item => item.targetId === target?.id);

  const handleSave = () => {
    if (!target || saveReason) return;
    onSave(target, {
      answer: answerChanged ? answer.trim() : undefined,
      score: reset ? null : scoreChanged ? round1(parsed) : undefined,
      comment: comment.trim(),
    });
  };

  return (
    <Sheet open={target !== null} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={target ? t(target.labelKey) : ''} description={context} />
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {hasAnswer && target && (
            <SidePanelSection
              icon={PencilLine}
              title={t(`${T}.answerTitle`)}
              description={t(`${T}.kind.${target.kind}`)}
            >
              <SidePanelCard>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>{t(`${T}.currentValue`)}</Label>
                    <p className="text-sm text-foreground">{target.answer || t(`${T}.noAnswer`)}</p>
                  </div>
                  {answerEditable && !readOnly ? (
                    <div className="space-y-2">
                      <Label htmlFor="risk-panel-answer">{t(`${T}.newValue`)}</Label>
                      {target.answerOptions ? (
                        <Select value={answer} onValueChange={setAnswer}>
                          <SelectTrigger id="risk-panel-answer" className="h-11">
                            <SelectValue placeholder={t(`${T}.selectPlaceholder`)} />
                          </SelectTrigger>
                          <SelectContent>
                            {target.answerOptions.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="risk-panel-answer"
                          className="h-11"
                          value={answer}
                          onChange={event => setAnswer(event.target.value)}
                        />
                      )}
                    </div>
                  ) : (
                    !answerEditable && (
                      <p className="text-xs text-muted-foreground">{t(`${T}.answerLocked.${target.kind}`)}</p>
                    )
                  )}
                </div>
              </SidePanelCard>
            </SidePanelSection>
          )}

          {target && (
            <SidePanelSection
              icon={Gauge}
              title={t(`${T}.scoreTitle`)}
              description={hasAnswer ? undefined : t(`${T}.kind.${target.kind}`)}
            >
              <SidePanelCard>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label>{t(`${T}.currentScore`)}</Label>
                    <p className="text-sm text-foreground tabular-nums">
                      {target.score === null ? t(`${T}.notEvaluated`) : target.score}
                    </p>
                  </div>
                  {!readOnly && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="risk-panel-score">{t(`${T}.newScore`)}</Label>
                        <Input
                          id="risk-panel-score"
                          inputMode="decimal"
                          className="h-11 tabular-nums"
                          value={reset ? '' : score}
                          disabled={reset}
                          onChange={event => setScore(event.target.value)}
                        />
                        <p
                          role={scoreInvalid ? 'alert' : undefined}
                          className={scoreInvalid ? 'text-xs text-red-600' : 'text-xs text-muted-foreground'}
                        >
                          {t(`${T}.scoreHint`, { min: target.min, max: target.max })}
                        </p>
                      </div>
                      {target.resettable && (
                        <SidePanelSwitchRow
                          id="risk-panel-reset"
                          label={t(`${T}.backToComputed`)}
                          description={t(`${T}.backToComputedDesc`)}
                          checked={reset}
                          onCheckedChange={setReset}
                        />
                      )}
                    </>
                  )}
                </div>
              </SidePanelCard>
            </SidePanelSection>
          )}

          {!readOnly && (
            <SidePanelSection
              icon={MessageSquarePlus}
              title={t(`${T}.commentTitle`)}
              description={t(`${T}.commentDesc`)}
            >
              <SidePanelCard>
                <div className="space-y-2">
                  <Label htmlFor="risk-panel-comment">
                    {t(`${T}.comment`)}
                    {(scoreChanged || answerChanged) && <span className="text-red-600 ml-0.5">*</span>}
                  </Label>
                  <Textarea
                    id="risk-panel-comment"
                    value={comment}
                    onChange={event => setComment(event.target.value)}
                    placeholder={t(`${T}.commentPlaceholder`)}
                    rows={3}
                  />
                </div>
              </SidePanelCard>
            </SidePanelSection>
          )}

          <SidePanelSection
            icon={History}
            title={t(`${T}.historyTitle`)}
            description={t(`${T}.historyDesc`)}
          >
            <SidePanelCard flush>
              {history.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">{t(`${T}.historyEmpty`)}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {history.map(item => (
                    <ScoreCommentItem key={item.id} item={item} showLabel={false} />
                  ))}
                </ul>
              )}
            </SidePanelCard>
            <Button variant="outline" className="w-full gap-2" onClick={onOpenAllComments}>
              <MessageSquare className="w-4 h-4" />
              {t(`${T}.allComments`, { count: comments.length })}
            </Button>
          </SidePanelSection>

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            {readOnly ? (
              <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            ) : (
              <BellOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            )}
            {readOnlyReason ?? t(`${T}.afterSave`)}
          </p>
        </div>
        <SidePanelFooter>
          <Button variant="outline" onClick={onClose}>
            {t(readOnly ? `${T}.close` : `${T}.cancel`)}
          </Button>
          {!readOnly && (
            <DisabledReason reason={saveReason}>
              <Button onClick={handleSave} disabled={Boolean(saveReason)}>
                {t(`${T}.save`)}
              </Button>
            </DisabledReason>
          )}
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
