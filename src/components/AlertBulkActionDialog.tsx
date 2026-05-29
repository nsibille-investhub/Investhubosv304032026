import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, HelpCircle, ShieldCheck, X } from 'lucide-react';
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
};

const ACTION_TITLE_SINGLE_KEY: Record<AlertBulkAction, string> = {
  true_hit: 'complianceAlerts.bulkDialog.titleSingleConfirm',
  false_hit: 'complianceAlerts.bulkDialog.titleSingleReject',
  unsure: 'complianceAlerts.bulkDialog.titleSingleUnsure',
};

const ACTION_SUBMIT_SINGLE_KEY: Record<AlertBulkAction, string> = {
  true_hit: 'complianceAlerts.bulkDialog.submitSingleConfirm',
  false_hit: 'complianceAlerts.bulkDialog.submitSingleReject',
  unsure: 'complianceAlerts.bulkDialog.submitSingleUnsure',
};

const ACTION_ICON: Record<AlertBulkAction, typeof Check> = {
  true_hit: Check,
  false_hit: X,
  unsure: HelpCircle,
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

  const handleNextIndividual = () => {
    if (!currentComment.trim()) {
      toast.error(t('complianceAlerts.bulkDialog.missingComment'));
      return;
    }
    const updatedComments = {
      ...comments,
      [currentAlert.id]: currentComment.trim(),
    };
    if (currentIndex + 1 < total) {
      setComments(updatedComments);
      setCurrentComment('');
      setCurrentIndex(currentIndex + 1);
    } else {
      onConfirm(
        alerts.map((a) => a.id),
        action,
        updatedComments,
      );
      toast.success(t('complianceAlerts.bulkDialog.doneTitle'), {
        description: t('complianceAlerts.bulkDialog.doneBody', { count: total }),
      });
      onClose();
    }
  };

  const isLast = currentIndex + 1 === total;

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
                      {single.name} · {single.source} · {single.match}%
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
              <div
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                <ActionIcon className="w-4 h-4 text-white" />
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
                  {alerts.map((_, idx) => (
                    <span
                      key={idx}
                      className="block h-1.5 rounded-full transition-all"
                      style={{
                        width: idx === currentIndex ? '20px' : '8px',
                        backgroundColor:
                          idx < currentIndex
                            ? 'var(--success)'
                            : idx === currentIndex
                              ? BRAND_BLUE
                              : '#E5E7EB',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Current alert card */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  {t('complianceAlerts.bulkDialog.currentAlert')}
                </div>
                <div className="font-medium text-sm text-gray-900">
                  {currentAlert?.entityName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {currentAlert?.name} · {currentAlert?.source} ·{' '}
                  {currentAlert?.match}%
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

        <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-2">
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
              onClick={handleNextIndividual}
              className="text-white"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t('complianceAlerts.bulkDialog.finish')}
                </>
              ) : (
                <>
                  {t('complianceAlerts.bulkDialog.nextAlert')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
