import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronUp, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { AlertItem } from '../utils/alertsGenerator';
import { useTranslation } from '../utils/languageContext';
import type { AlertBulkAction } from './AlertDataTable';

interface AlertBulkActionDialogProps {
  open: boolean;
  alerts: AlertItem[];
  action: AlertBulkAction | null;
  onClose: () => void;
  onConfirm: (
    alertIds: string[],
    action: AlertBulkAction,
    comments: Record<string, string>,
  ) => void;
}

type Mode = 'same' | 'individual';

const BRAND_BLUE = '#000E2B';

const ACTION_TITLE_KEY: Record<AlertBulkAction, string> = {
  true_hit: 'complianceAlerts.bulkDialog.titleConfirm',
  false_hit: 'complianceAlerts.bulkDialog.titleReject',
  unsure: 'complianceAlerts.bulkDialog.titleUnsure',
  escalate: 'complianceAlerts.bulkDialog.titleEscalate',
};

const ACTION_TITLE_SINGLE_KEY: Record<AlertBulkAction, string> = {
  true_hit: 'complianceAlerts.bulkDialog.titleSingleConfirm',
  false_hit: 'complianceAlerts.bulkDialog.titleSingleReject',
  unsure: 'complianceAlerts.bulkDialog.titleSingleUnsure',
  escalate: 'complianceAlerts.bulkDialog.titleSingleEscalate',
};

const ACTION_SUBMIT_SINGLE_KEY: Record<AlertBulkAction, string> = {
  true_hit: 'complianceAlerts.bulkDialog.submitSingleConfirm',
  false_hit: 'complianceAlerts.bulkDialog.submitSingleReject',
  unsure: 'complianceAlerts.bulkDialog.submitSingleUnsure',
  escalate: 'complianceAlerts.bulkDialog.submitSingleEscalate',
};

const ACTION_ICON: Record<AlertBulkAction, typeof Check> = {
  true_hit: Check,
  false_hit: X,
  unsure: ChevronUp,
  escalate: ChevronUp,
};

export function AlertBulkActionDialog({
  open,
  alerts,
  action,
  onClose,
  onConfirm,
}: AlertBulkActionDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('same');
  const [sharedComment, setSharedComment] = useState('');
  const [comments, setComments] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentComment, setCurrentComment] = useState('');

  useEffect(() => {
    if (open) {
      setMode('same');
      setSharedComment('');
      setComments({});
      setCurrentIndex(0);
      setCurrentComment('');
    }
  }, [open]);

  const total = alerts.length;
  const currentAlert = alerts[currentIndex];

  const ActionIcon = useMemo(
    () => (action ? ACTION_ICON[action] : Check),
    [action],
  );

  if (!action || total === 0) return null;

  const isSingle = total === 1;
  const single = alerts[0];

  const title = isSingle
    ? t(ACTION_TITLE_SINGLE_KEY[action], { name: single.entityName })
    : t(ACTION_TITLE_KEY[action], { count: total });

  const allIndividualCommentsFilled = () => {
    const updatedComments = { ...comments };
    if (currentAlert) {
      updatedComments[currentAlert.id] = currentComment.trim();
    }
    return alerts.every((a) => (updatedComments[a.id] ?? '').trim().length > 0);
  };

  const handleApplyToAll = () => {
    if (!sharedComment.trim()) {
      toast.error(t('complianceAlerts.bulkDialog.missingComment'));
      return;
    }
    const allComments: Record<string, string> = {};
    alerts.forEach((a) => {
      allComments[a.id] = sharedComment.trim();
    });
    onConfirm(
      alerts.map((a) => a.id),
      action,
      allComments,
    );
    const isSingleSubmit = total === 1;
    toast.success(
      isSingleSubmit
        ? t('complianceAlerts.bulkDialog.doneSingleTitle')
        : t('complianceAlerts.bulkDialog.doneTitle'),
      {
        description: isSingleSubmit
          ? t('complianceAlerts.bulkDialog.doneSingleBody', {
              name: alerts[0].entityName,
            })
          : t('complianceAlerts.bulkDialog.doneBody', { count: total }),
      },
    );
    onClose();
  };

  const handleNavigateIndividual = (direction: 'prev' | 'next') => {
    const updatedComments = {
      ...comments,
      ...(currentComment.trim()
        ? { [currentAlert.id]: currentComment.trim() }
        : {}),
    };
    setComments(updatedComments);

    if (direction === 'next') {
      if (currentIndex + 1 < total) {
        const nextIdx = currentIndex + 1;
        setCurrentIndex(nextIdx);
        setCurrentComment(updatedComments[alerts[nextIdx].id] ?? '');
      }
    } else {
      if (currentIndex > 0) {
        const prevIdx = currentIndex - 1;
        setCurrentIndex(prevIdx);
        setCurrentComment(updatedComments[alerts[prevIdx].id] ?? '');
      }
    }
  };

  const handleFinishIndividual = () => {
    if (!currentComment.trim()) {
      toast.error(t('complianceAlerts.bulkDialog.missingComment'));
      return;
    }
    const finalComments = {
      ...comments,
      [currentAlert.id]: currentComment.trim(),
    };
    const missingCount = alerts.filter(
      (a) => !(finalComments[a.id] ?? '').trim(),
    ).length;
    if (missingCount > 0) {
      toast.error(t('complianceAlerts.bulkDialog.missingComment'));
      return;
    }
    onConfirm(
      alerts.map((a) => a.id),
      action,
      finalComments,
    );
    toast.success(t('complianceAlerts.bulkDialog.doneTitle'), {
      description: t('complianceAlerts.bulkDialog.doneBody', { count: total }),
    });
    onClose();
  };

  const isLast = currentIndex + 1 === total;
  const isFirst = currentIndex === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!max-w-[50vw] !w-[50vw] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 bg-white">
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {isSingle
                  ? t('complianceAlerts.bulkDialog.descriptionSingle')
                  : t('complianceAlerts.bulkDialog.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary card */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                {isSingle ? (
                  <>
                    <span
                      className="text-sm font-medium block truncate"
                      style={{ color: BRAND_BLUE }}
                    >
                      {single.entityName}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {single.name} · {single.source} ·{' '}
                      {t('complianceAlerts.bulkDialog.matchReminder', {
                        match: single.match,
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-900 font-medium block">
                      {total}{' '}
                      {t('complianceAlerts.selection.selectedMany')}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('complianceAlerts.bulkDialog.summaryHint')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mode toggle — bulk only */}
          {!isSingle && (
            <div className="space-y-2">
              <Label>{t('complianceAlerts.bulkDialog.modeLabel')}</Label>
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="same">
                    {t('complianceAlerts.bulkDialog.modeSame')}
                  </TabsTrigger>
                  <TabsTrigger value="individual">
                    {t('complianceAlerts.bulkDialog.modeIndividual')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-gray-500">
                {mode === 'same'
                  ? t('complianceAlerts.bulkDialog.modeSameHint')
                  : t('complianceAlerts.bulkDialog.modeIndividualHint')}
              </p>
            </div>
          )}

          {/* Comment input */}
          {isSingle || mode === 'same' ? (
            <div className="space-y-2">
              <Label htmlFor="ds-bulk-shared-comment">
                {t('complianceAlerts.bulkDialog.commentLabel')}
              </Label>
              <Textarea
                id="ds-bulk-shared-comment"
                value={sharedComment}
                onChange={(e) => setSharedComment(e.target.value)}
                placeholder={t('complianceAlerts.bulkDialog.commentPlaceholder')}
                className="min-h-[120px] resize-none"
                autoFocus
              />
              <div className="flex justify-end">
                <span className="text-xs text-gray-500">
                  {sharedComment.length} / 1234
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress + stepper */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {t('complianceAlerts.bulkDialog.progress', {
                    current: currentIndex + 1,
                    total,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  {alerts.map((a, idx) => {
                    const filled = !!(comments[a.id] ?? '').trim() ||
                      (idx === currentIndex && currentComment.trim());
                    return (
                      <span
                        key={idx}
                        className="block h-1.5 rounded-full transition-all"
                        style={{
                          width: idx === currentIndex ? '20px' : '8px',
                          backgroundColor:
                            filled && idx !== currentIndex
                              ? 'var(--success)'
                              : idx === currentIndex
                                ? BRAND_BLUE
                                : '#E5E7EB',
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Current alert card with match reminder */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
                      {t('complianceAlerts.bulkDialog.currentAlert')}
                    </div>
                    <div className="font-medium text-sm text-gray-900">
                      {currentAlert?.entityName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {currentAlert?.name} · {currentAlert?.source}
                    </div>
                  </div>
                  {currentAlert && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-xs font-semibold text-foreground tabular-nums">
                      {t('complianceAlerts.bulkDialog.matchReminder', {
                        match: currentAlert.match,
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ds-bulk-individual-comment">
                  {t('complianceAlerts.bulkDialog.commentLabel')}
                </Label>
                <Textarea
                  id="ds-bulk-individual-comment"
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  placeholder={t(
                    'complianceAlerts.bulkDialog.commentPlaceholder',
                  )}
                  className="min-h-[120px] resize-none"
                  autoFocus
                />
                <div className="flex justify-end">
                  <span className="text-xs text-gray-500">
                    {currentComment.length} / 1234
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-2">
          {/* Left side: navigation arrows in individual mode */}
          <div className="flex items-center gap-2">
            {!isSingle && mode === 'individual' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigateIndividual('prev')}
                  disabled={isFirst}
                  className="h-8"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigateIndividual('next')}
                  disabled={isLast}
                  className="h-8"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Right side: cancel + submit */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('complianceAlerts.bulkDialog.cancel')}
            </Button>
            {isSingle || mode === 'same' ? (
              <Button
                onClick={handleApplyToAll}
                className="text-white"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <ActionIcon className="w-4 h-4 mr-2" />
                {isSingle
                  ? t(ACTION_SUBMIT_SINGLE_KEY[action])
                  : t('complianceAlerts.bulkDialog.applyToAll')}
              </Button>
            ) : (
              <Button
                onClick={handleFinishIndividual}
                className="text-white"
                disabled={!allIndividualCommentsFilled()}
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <Check className="w-4 h-4 mr-2" />
                {t('complianceAlerts.bulkDialog.finish')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
