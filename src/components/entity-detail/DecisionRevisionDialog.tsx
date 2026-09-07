import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { StatusBadge } from '../StatusBadge';
import { useTranslation } from '../../utils/languageContext';
import type { MatchDecisionValue, ScreeningMatch } from '../../utils/screeningMock';
import { DECISION_KEY, DECISION_VARIANT } from './entityDetailShared';

interface DecisionRevisionDialogProps {
  match: ScreeningMatch | null;
  onClose: () => void;
  onConfirm: (decision: MatchDecisionValue, comment: string) => void;
}

const DECISIONS: MatchDecisionValue[] = ['true_hit', 'false_hit', 'unsure'];

const TONE_CLASS: Record<MatchDecisionValue, { active: string; dot: string }> = {
  true_hit: { active: 'bg-red-50 text-red-700 border-red-300', dot: 'bg-red-500' },
  false_hit: { active: 'bg-slate-100 text-slate-800 border-slate-300', dot: 'bg-slate-500' },
  unsure: { active: 'bg-amber-50 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
};

export function DecisionRevisionDialog({ match, onClose, onConfirm }: DecisionRevisionDialogProps) {
  const { t } = useTranslation();
  const [decision, setDecision] = useState<MatchDecisionValue | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (match) {
      setDecision(null);
      setComment('');
    }
  }, [match?.id]);

  const current = match?.currentDecision ?? null;

  const handleConfirm = () => {
    if (!decision) {
      toast.error(t('complianceEntities.revise.missingDecision'));
      return;
    }
    if (!comment.trim()) {
      toast.error(t('complianceEntities.revise.missingComment'));
      return;
    }
    onConfirm(decision, comment.trim());
  };

  return (
    <Dialog open={!!match} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            {t('complianceEntities.revise.title')}
          </DialogTitle>
          <DialogDescription>{t('complianceEntities.revise.body')}</DialogDescription>
        </DialogHeader>

        {match && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {t('complianceEntities.revise.current')}
                </p>
                <p className="text-sm font-medium text-foreground truncate">{match.profileName}</p>
                {current && (
                  <p className="text-xs text-muted-foreground">
                    {t('complianceEntities.matches.decidedBy', { name: current.analyst })} ·{' '}
                    {t('complianceEntities.matches.revision', { n: current.revision })}
                  </p>
                )}
              </div>
              {current && (
                <StatusBadge label={t(DECISION_KEY[current.decision])} variant={DECISION_VARIANT[current.decision]} />
              )}
            </div>

            <div className="space-y-2">
              <Label>{t('complianceEntities.revise.newDecision')}</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {DECISIONS.map((value) => {
                  const active = decision === value;
                  const disabled = current?.decision === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={disabled}
                      onClick={() => setDecision(value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        active ? TONE_CLASS[value].active : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${active ? TONE_CLASS[value].dot : 'bg-slate-300'}`} />
                      {t(DECISION_KEY[value])}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="revision-comment">{t('complianceEntities.revise.comment')}</Label>
              <Textarea
                id="revision-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('complianceEntities.revise.commentPlaceholder')}
                className="min-h-[90px] resize-none"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t('complianceEntities.revise.cancel')}
          </Button>
          <Button onClick={handleConfirm}>{t('complianceEntities.revise.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
