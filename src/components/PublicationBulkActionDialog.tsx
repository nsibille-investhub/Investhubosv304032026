import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, FileCheck2, RotateCcw, X } from 'lucide-react';
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
import { ValidationDocument } from '../utils/validationDocumentsGenerator';
import { useTranslation } from '../utils/languageContext';

export type PublicationBulkAction = 'validate' | 'reject' | 'revision';

interface PublicationBulkActionDialogProps {
  open: boolean;
  docs: ValidationDocument[];
  action: PublicationBulkAction | null;
  onClose: () => void;
  onConfirm: (
    docIds: number[],
    action: PublicationBulkAction,
    comments: Record<number, string>,
  ) => void;
}

type Mode = 'same' | 'individual';

const BRAND_BLUE = '#000E2B';

const ACTION_TITLE_KEY: Record<PublicationBulkAction, string> = {
  validate: 'validation.bulkDialog.titleValidate',
  reject: 'validation.bulkDialog.titleReject',
  revision: 'validation.bulkDialog.titleRevision',
};

const ACTION_TITLE_SINGLE_KEY: Record<PublicationBulkAction, string> = {
  validate: 'validation.bulkDialog.titleSingleValidate',
  reject: 'validation.bulkDialog.titleSingleReject',
  revision: 'validation.bulkDialog.titleSingleRevision',
};

const ACTION_SUBMIT_SINGLE_KEY: Record<PublicationBulkAction, string> = {
  validate: 'validation.bulkDialog.submitSingleValidate',
  reject: 'validation.bulkDialog.submitSingleReject',
  revision: 'validation.bulkDialog.submitSingleRevision',
};

const ACTION_ICON: Record<PublicationBulkAction, typeof Check> = {
  validate: Check,
  reject: X,
  revision: RotateCcw,
};

export function PublicationBulkActionDialog({
  open,
  docs,
  action,
  onClose,
  onConfirm,
}: PublicationBulkActionDialogProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('same');
  const [sharedComment, setSharedComment] = useState('');
  const [comments, setComments] = useState<Record<number, string>>({});
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

  const total = docs.length;
  const currentDoc = docs[currentIndex];

  const ActionIcon = useMemo(
    () => (action ? ACTION_ICON[action] : Check),
    [action],
  );

  if (!action || total === 0) return null;

  const isSingle = total === 1;
  const single = docs[0];

  const title = isSingle
    ? t(ACTION_TITLE_SINGLE_KEY[action], { name: single.name })
    : t(ACTION_TITLE_KEY[action], { count: total });

  const handleApplyToAll = () => {
    if (!sharedComment.trim()) {
      toast.error(t('validation.bulkDialog.missingComment'));
      return;
    }
    const allComments: Record<number, string> = {};
    docs.forEach((d) => {
      allComments[d.id] = sharedComment.trim();
    });
    onConfirm(
      docs.map((d) => d.id),
      action,
      allComments,
    );
    const isSingleSubmit = total === 1;
    toast.success(
      isSingleSubmit
        ? t('validation.bulkDialog.doneSingleTitle')
        : t('validation.bulkDialog.doneTitle'),
      {
        description: isSingleSubmit
          ? t('validation.bulkDialog.doneSingleBody', {
              name: docs[0].name,
            })
          : t('validation.bulkDialog.doneBody', { count: total }),
      },
    );
    onClose();
  };

  const handleNextIndividual = () => {
    if (!currentComment.trim()) {
      toast.error(t('validation.bulkDialog.missingComment'));
      return;
    }
    const updatedComments = {
      ...comments,
      [currentDoc.id]: currentComment.trim(),
    };
    if (currentIndex + 1 < total) {
      setComments(updatedComments);
      setCurrentComment('');
      setCurrentIndex(currentIndex + 1);
    } else {
      onConfirm(
        docs.map((d) => d.id),
        action,
        updatedComments,
      );
      toast.success(t('validation.bulkDialog.doneTitle'), {
        description: t('validation.bulkDialog.doneBody', { count: total }),
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
              <FileCheck2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {isSingle
                  ? t('validation.bulkDialog.descriptionSingle')
                  : t('validation.bulkDialog.description')}
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
                      {single.name}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {single.pathSegments.join(' / ') || single.createdBy.name}
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-900 font-medium block">
                      {total}{' '}
                      {t('validation.selection.selectedMany')}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('validation.bulkDialog.summaryHint')}
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
              <Label>{t('validation.bulkDialog.modeLabel')}</Label>
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="same">
                    {t('validation.bulkDialog.modeSame')}
                  </TabsTrigger>
                  <TabsTrigger value="individual">
                    {t('validation.bulkDialog.modeIndividual')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-xs text-gray-500">
                {mode === 'same'
                  ? t('validation.bulkDialog.modeSameHint')
                  : t('validation.bulkDialog.modeIndividualHint')}
              </p>
            </div>
          )}

          {/* Comment input */}
          {isSingle || mode === 'same' ? (
            <div className="space-y-2">
              <Label htmlFor="ds-pubbulk-shared-comment">
                {t('validation.bulkDialog.commentLabel')}
              </Label>
              <Textarea
                id="ds-pubbulk-shared-comment"
                value={sharedComment}
                onChange={(e) => setSharedComment(e.target.value)}
                placeholder={t('validation.bulkDialog.commentPlaceholder')}
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {t('validation.bulkDialog.progress', {
                    current: currentIndex + 1,
                    total,
                  })}
                </span>
                <div className="flex items-center gap-1">
                  {docs.map((_, idx) => (
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

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
                  {t('validation.bulkDialog.currentDoc')}
                </div>
                <div className="font-medium text-sm text-gray-900">
                  {currentDoc?.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {currentDoc?.pathSegments.join(' / ') ||
                    currentDoc?.createdBy.name}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ds-pubbulk-individual-comment">
                  {t('validation.bulkDialog.commentLabel')}
                </Label>
                <Textarea
                  id="ds-pubbulk-individual-comment"
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  placeholder={t('validation.bulkDialog.commentPlaceholder')}
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
            {t('validation.bulkDialog.cancel')}
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
                : t('validation.bulkDialog.applyToAll')}
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
                  {t('validation.bulkDialog.finish')}
                </>
              ) : (
                <>
                  {t('validation.bulkDialog.nextDoc')}
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
