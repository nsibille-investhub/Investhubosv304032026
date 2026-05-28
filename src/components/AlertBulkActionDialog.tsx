import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, HelpCircle, X } from 'lucide-react';
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
import { Badge } from './ui/badge';
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

const ACTION_TITLE_KEY: Record<AlertBulkAction, string> = {
  true_hit: 'complianceAlerts.bulkDialog.titleConfirm',
  false_hit: 'complianceAlerts.bulkDialog.titleReject',
  unsure: 'complianceAlerts.bulkDialog.titleUnsure',
};

const ACTION_ICON: Record<AlertBulkAction, typeof Check> = {
  true_hit: Check,
  false_hit: X,
  unsure: HelpCircle,
};

const ACTION_INTENT: Record<AlertBulkAction, string> = {
  true_hit: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  false_hit: 'bg-red-600 hover:bg-red-700 text-white',
  unsure: 'bg-amber-500 hover:bg-amber-600 text-white',
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

  const title = t(ACTION_TITLE_KEY[action], { count: total });

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
    toast.success(t('complianceAlerts.bulkDialog.doneTitle'), {
      description: t('complianceAlerts.bulkDialog.doneBody', { count: total }),
    });
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
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${ACTION_INTENT[action]}`}
            >
              <ActionIcon className="w-4 h-4" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>
            {t('complianceAlerts.bulkDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4">
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

          {mode === 'same' ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {t('complianceAlerts.bulkDialog.modeSameHint')}
              </p>
              <Label htmlFor="bulk-shared-comment" className="text-sm">
                {t('complianceAlerts.bulkDialog.commentLabel')}
              </Label>
              <Textarea
                id="bulk-shared-comment"
                value={sharedComment}
                onChange={(e) => setSharedComment(e.target.value)}
                placeholder={t('complianceAlerts.bulkDialog.commentPlaceholder')}
                className="min-h-[110px] resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <Badge variant="outline" className="text-[11px]">
                    {total}
                  </Badge>{' '}
                  {total === 1
                    ? t('complianceAlerts.selection.selectedOne')
                    : t('complianceAlerts.selection.selectedMany')}
                </span>
                <span>{sharedComment.length} / 1234</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {t('complianceAlerts.bulkDialog.modeIndividualHint')}
              </p>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[11px]">
                  {t('complianceAlerts.bulkDialog.progress', {
                    current: currentIndex + 1,
                    total,
                  })}
                </Badge>
                <div className="flex items-center gap-1">
                  {alerts.map((_, idx) => (
                    <span
                      key={idx}
                      className={`block w-1.5 h-1.5 rounded-full ${
                        idx < currentIndex
                          ? 'bg-emerald-500'
                          : idx === currentIndex
                            ? 'bg-blue-600'
                            : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  {t('complianceAlerts.bulkDialog.currentAlert')}
                </div>
                <div className="font-medium text-sm">
                  {currentAlert?.entityName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentAlert?.name} · {currentAlert?.source} ·{' '}
                  {currentAlert?.match}%
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bulk-individual-comment" className="text-sm">
                  {t('complianceAlerts.bulkDialog.commentLabel')}
                </Label>
                <Textarea
                  id="bulk-individual-comment"
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  placeholder={t(
                    'complianceAlerts.bulkDialog.commentPlaceholder',
                  )}
                  className="min-h-[100px] resize-none"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="ghost" onClick={onClose}>
            {t('complianceAlerts.bulkDialog.cancel')}
          </Button>
          {mode === 'same' ? (
            <Button
              onClick={handleApplyToAll}
              className={ACTION_INTENT[action]}
            >
              <ActionIcon className="w-4 h-4 mr-1.5" />
              {t('complianceAlerts.bulkDialog.applyToAll')}
            </Button>
          ) : (
            <Button
              onClick={handleNextIndividual}
              className={ACTION_INTENT[action]}
            >
              {isLast ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  {t('complianceAlerts.bulkDialog.finish')}
                </>
              ) : (
                <>
                  {t('complianceAlerts.bulkDialog.nextAlert')}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

