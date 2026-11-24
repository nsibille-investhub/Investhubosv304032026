import { useState, type ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  Ban,
  BellRing,
  CalendarClock,
  Check,
  Download,
  Eye,
  Mail,
  RefreshCw,
  Send,
  Undo2,
  Upload,
  Users,
  type LucideIcon,
} from 'lucide-react';

import { downloadDemoPdf } from '../../utils/demoPdf';
import { useTranslation } from '../../utils/languageContext';
import {
  BULK_LINE_ACTIONS,
  LINE_ACTIONS,
  ensureDocument,
  lineEligible,
  lineLockedWhileSending,
  regenerateDocument,
  uploadDocument,
  type NoticeContext,
  type NoticeLine,
  type NoticeLineAction,
  type NoticeRules,
} from '../../utils/noticeActions';
import type { EffectItem } from '../ui/effects-panel';
import { MailPreviewDialog } from '../ui/mail-preview-dialog';
import type { TableRowAction } from '../ui/row-actions';
import { NoticeActionDialog, NoticeDocumentPanel, NoticeUploadDialog } from './NoticeDialogs';
import { exportNoticeTarget, noticeMailPreview } from './noticeTarget';

const K = 'funds.notices';

const ICONS: Record<NoticeLineAction, LucideIcon> = {
  preview: Eye,
  notify: Send,
  validatePayment: Check,
  previewNotification: Mail,
  exportTarget: Users,
  download: Download,
  upload: Upload,
  regenerate: RefreshCw,
  editPayment: CalendarClock,
  invalidatePayment: Undo2,
};

/** Actions qui passent par la fenêtre de confirmation, sur une ligne comme sur une sélection. */
type ConfirmedAction = Exclude<NoticeLineAction, 'preview' | 'previewNotification' | 'upload'>;

const todayIso = () => toIso(new Date());

const parseIso = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};

interface NoticeLineActionsOptions<L extends NoticeLine> {
  rules: NoticeRules<L>;
  context: NoticeContext;
  parentName: string;
  fundName: string;
  lines: L[];
  onLinesChange: (update: (lines: L[]) => L[]) => void;
  /** Envoi : l'objet reste verrouillé le temps du traitement, puis les lignes sont mises à jour. */
  onSend: (apply: (lines: L[]) => L[], onDone: () => void) => void;
  /** Appelé quand une action sur une sélection aboutit : la sélection est vidée. */
  onCompleted?: () => void;
}

/**
 * Actions sur les lignes investisseurs d'une notice : mêmes règles et mêmes fenêtres pour les quatre familles.
 * Une action n'est proposée que si au moins une ligne y est éligible ; les lignes non éligibles sont ignorées.
 */
export function useNoticeLineActions<L extends NoticeLine>({
  rules,
  context,
  parentName,
  fundName,
  lines,
  onLinesChange,
  onSend,
  onCompleted,
}: NoticeLineActionsOptions<L>) {
  const { t, lang } = useTranslation();
  const [pending, setPending] = useState<{ action: ConfirmedAction; ids: number[] } | null>(null);
  const [receivedOn, setReceivedOn] = useState(todayIso);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [mailId, setMailId] = useState<number | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);

  const C = `${K}.common`;
  const D = `${K}.docKind.${rules.documentKind}`;
  const F = `${K}.families.${rules.family}`;

  const label = (action: NoticeLineAction) =>
    action === 'preview' || action === 'download' || action === 'regenerate' ? t(`${D}.${action}`) : t(`${C}.actions.${action}`);

  const eligible = (action: NoticeLineAction, line: L) => lineEligible(rules, context, action, line);

  const byIds = (ids: number[]) => {
    const wanted = new Set(ids);
    return lines.filter(line => wanted.has(line.id));
  };

  const patch = (ids: Set<number>, change: (line: L) => L) =>
    onLinesChange(current => current.map(line => (ids.has(line.id) ? change(line) : line)));

  const refuseWhileSending = (action: NoticeLineAction) => {
    if (!context.sending || !lineLockedWhileSending(action)) return false;
    toast.error(t(`${C}.toast.refused`, { name: parentName }), { description: t(`${F}.sending`) });
    return true;
  };

  const downloadOne = (line: L) => {
    if (rules.documentMissing(line)) patch(new Set([line.id]), item => ensureDocument(rules, item, new Date()));
    downloadDemoPdf(
      [
        t(`${F}.documentTitle`),
        parentName,
        '',
        `${t(`${C}.documentPanel.fund`)} ${fundName}`,
        `${t(`${C}.documentPanel.investor`)} ${line.investor}`,
        `${t(`${C}.documentPanel.subscription`)} ${line.subscription}`,
      ],
      line.document.manualFile ?? `${t(`${F}.target.fileName`)}-${line.id}.pdf`,
    );
    toast.success(t(`${D}.toast.downloaded`, { name: line.subscription }));
  };

  const start = (action: NoticeLineAction, selection: L[], fromRow: boolean) => {
    const [first] = selection;
    if (!first) return;
    if (action === 'preview') {
      if (rules.documentMissing(first)) patch(new Set([first.id]), item => ensureDocument(rules, item, new Date()));
      setPreviewId(first.id);
    } else if (action === 'previewNotification') setMailId(first.id);
    else if (action === 'upload') setUploadId(first.id);
    else if (action === 'download' && fromRow) downloadOne(first);
    else {
      setReceivedOn(action === 'editPayment' ? toIso(rules.payment?.paidAt(first)) : todayIso());
      setPending({ action, ids: selection.map(line => line.id) });
    }
  };

  const rowActions = (line: L): TableRowAction[] =>
    LINE_ACTIONS.filter(action => eligible(action, line)).map(action => ({
      label: label(action),
      icon: ICONS[action],
      onClick: () => start(action, [line], true),
    }));

  const bulkActions = (selection: L[]): TableRowAction[] =>
    BULK_LINE_ACTIONS.filter(action => selection.some(line => eligible(action, line))).map(action => ({
      label: label(action),
      icon: ICONS[action],
      onClick: () => start(action, selection, false),
    }));

  const pendingLines = pending ? byIds(pending.ids) : [];
  const targets = pending ? pendingLines.filter(line => eligible(pending.action, line)) : [];
  const ignored = pending ? pendingLines.filter(line => !eligible(pending.action, line)) : [];
  const objects = (items: L[]) => items.map(line => ({ id: String(line.id), label: line.subscription }));
  const ignoredEffect: EffectItem = {
    id: 'ignored',
    icon: Ban,
    label: t(`${C}.effects.ignoredLines`),
    note: ignored.length > 0 ? t(`${C}.effects.ignoredNote`) : undefined,
    objects: objects(ignored),
    count: ignored.length,
    reversible: true,
  };
  const effect = (id: string, icon: LucideIcon, text: string, items: L[], note?: string): EffectItem => ({
    id,
    icon,
    label: text,
    note,
    objects: objects(items),
    count: items.length,
    reversible: true,
  });

  const manualOverwritten = targets.filter(line => line.document.manualFile).length;
  const needsDate = pending?.action === 'validatePayment' || pending?.action === 'editPayment';
  const date = parseIso(receivedOn);

  const effects = (): EffectItem[] => {
    if (!pending) return [];
    switch (pending.action) {
      case 'notify': {
        const notifications = targets.filter(line => rules.sendKind(line) === 'notification');
        const reminders = targets.filter(line => rules.sendKind(line) === 'reminder');
        return [
          effect('notifications', Send, t(`${C}.effects.notifications`), notifications),
          ...(rules.hasReminder ? [effect('reminders', BellRing, t(`${C}.effects.reminders`), reminders)] : []),
          ignoredEffect,
        ];
      }
      case 'validatePayment':
        return [effect('validated', Check, t(`${C}.effects.paymentsValidated`), targets, t(`${C}.effects.confirmationMail`)), ignoredEffect];
      case 'editPayment':
        return [effect('edited', CalendarClock, t(`${C}.effects.paymentDatesEdited`), targets, t(`${C}.effects.noMail`)), ignoredEffect];
      case 'invalidatePayment':
        return [effect('invalidated', Undo2, t(`${C}.effects.paymentsInvalidated`), targets, t(`${C}.effects.invalidatedNote`)), ignoredEffect];
      case 'exportTarget':
        return [effect('exported', Users, t(`${C}.effects.exported`), targets, t(`${C}.effects.exportNote`)), ignoredEffect];
      case 'regenerate':
        return [effect('regenerated', RefreshCw, t(`${D}.effects.regenerated`), targets, t(`${C}.effects.regenerateNote`)), ignoredEffect];
      case 'download':
        return [effect('downloaded', Download, t(`${D}.effects.downloaded`), targets, t(`${D}.effects.downloadNote`)), ignoredEffect];
    }
  };

  const confirm = () => {
    if (!pending) return;
    const { action } = pending;
    setPending(null);
    if (targets.length === 0 || refuseWhileSending(action)) return;
    const ids = new Set(targets.map(line => line.id));
    const now = new Date();
    switch (action) {
      case 'notify': {
        const notifications = targets.filter(line => rules.sendKind(line) === 'notification').length;
        const reminders = targets.length - notifications;
        toast.info(t(`${C}.toast.sendStarted`, { name: parentName }));
        onSend(
          current =>
            current.map(line => {
              const kind = ids.has(line.id) ? rules.sendKind(line) : null;
              // Le document manquant est généré avant d'être joint.
              return kind ? rules.applySend(ensureDocument(rules, line, now), kind, new Date()) : line;
            }),
          () =>
            toast.success(
              rules.hasReminder
                ? t(`${C}.toast.sendDone`, { name: parentName, notifications, reminders })
                : t(`${C}.toast.sendDoneNotifications`, { name: parentName, notifications }),
            ),
        );
        break;
      }
      case 'validatePayment':
        if (!date || !rules.payment) return;
        patch(ids, line => rules.payment!.validate(line, date));
        toast.success(t(`${C}.toast.paymentsValidated`, { count: targets.length }));
        break;
      case 'editPayment':
        if (!date || !rules.payment) return;
        patch(ids, line => rules.payment!.editDate(line, date));
        toast.success(t(`${C}.toast.paymentDatesEdited`, { count: targets.length }));
        break;
      case 'invalidatePayment':
        if (!rules.payment) return;
        patch(ids, line => rules.payment!.invalidate(line));
        toast.success(t(`${C}.toast.paymentsInvalidated`, { count: targets.length }));
        break;
      case 'exportTarget': {
        const count = exportNoticeTarget(t, lang, rules, [{ parentName, lines: targets }], false);
        toast.success(t(`${C}.toast.targetExported`, { count }));
        break;
      }
      case 'regenerate':
        patch(ids, line => regenerateDocument(rules, line, now));
        toast.success(t(`${D}.toast.regenerated`, { count: targets.length }));
        break;
      case 'download':
        patch(ids, line => ensureDocument(rules, line, now));
        toast.success(t(`${D}.toast.zipDownloaded`, { count: targets.length }));
        break;
    }
    onCompleted?.();
  };

  const previewLine = previewId === null ? null : lines.find(line => line.id === previewId) ?? null;
  const mailLine = mailId === null ? null : lines.find(line => line.id === mailId) ?? null;
  const mailKind = mailLine ? rules.sendKind(mailLine) : null;
  const mail = mailKind ? noticeMailPreview(rules.family, mailKind, lang, fundName) : null;
  const uploadLine = uploadId === null ? null : lines.find(line => line.id === uploadId) ?? null;

  const dialogs: ReactNode = (
    <>
      <NoticeActionDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending ? label(pending.action) : ''}
        description={t(pendingLines.length === 1 ? `${C}.dialog.scopeOne` : `${C}.dialog.scopeMany`, {
          name: parentName,
          count: pendingLines.length,
        })}
        icon={pending ? ICONS[pending.action] : undefined}
        effects={effects()}
        warning={
          pending?.action === 'regenerate' && manualOverwritten > 0
            ? t(manualOverwritten === 1 ? `${D}.overwriteOne` : `${D}.overwriteMany`, { count: manualOverwritten })
            : undefined
        }
        date={needsDate ? { label: t(`${C}.dialog.receivedOn`), value: receivedOn, onChange: setReceivedOn } : undefined}
        confirmLabel={pending ? label(pending.action) : ''}
        confirmDisabledReason={
          targets.length === 0 ? t(`${C}.dialog.noEligibleLine`) : needsDate && !date ? t(`${C}.dialog.dateRequired`) : undefined
        }
        onConfirm={confirm}
      />
      <NoticeUploadDialog
        open={Boolean(uploadLine)}
        onClose={() => setUploadId(null)}
        documentKind={rules.documentKind}
        lineLabel={uploadLine?.subscription ?? ''}
        onConfirm={(fileName, usage) => {
          const line = uploadLine;
          setUploadId(null);
          if (!line || refuseWhileSending('upload')) return;
          patch(new Set([line.id]), item => uploadDocument(rules, item, fileName, usage, new Date()));
          toast.success(t(usage === 'replace' ? `${D}.toast.replaced` : `${C}.toast.fileAdded`, { name: fileName }));
        }}
      />
      <NoticeDocumentPanel
        open={Boolean(previewLine)}
        onClose={() => setPreviewId(null)}
        family={rules.family}
        documentKind={rules.documentKind}
        parentName={parentName}
        fundName={fundName}
        line={previewLine}
        onDownload={() => previewLine && downloadOne(previewLine)}
        onDownloadExtra={name => toast.success(t(`${C}.toast.fileDownloaded`, { name }))}
      />
      <MailPreviewDialog
        open={Boolean(mailLine && mail)}
        onOpenChange={next => !next && setMailId(null)}
        title={mailKind ? t(`${F}.mail.${mailKind}`) : ''}
        description={t(`${C}.mailPreview.description`, { name: mailLine?.subscription ?? '' })}
        subject={mail?.subject ?? ''}
        html={mail?.html ?? ''}
        subjectLabel={t(`${C}.mailPreview.subject`)}
        frameLabel={t(`${C}.mailPreview.frame`)}
        templateSlug={mail?.slug}
      />
    </>
  );

  return { rowActions, bulkActions, dialogs };
}

function toIso(value: Date | null | undefined) {
  if (!value) return todayIso();
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}
