import { useState, type ReactNode } from 'react';
import { toast } from 'sonner@2.0.3';
import { Ban, Download, RefreshCw, Send, Trash2, Users, type LucideIcon } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import {
  PARENT_ACTIONS,
  ensureDocument,
  parentBlocker,
  parentTargetLines,
  regenerateDocument,
  type NoticeContext,
  type NoticeLine,
  type NoticeParentAction,
  type NoticeRules,
} from '../../utils/noticeActions';
import type { EffectItem } from '../ui/effects-panel';
import type { TableRowAction } from '../ui/row-actions';
import { NoticeActionDialog } from './NoticeDialogs';
import { exportNoticeTarget } from './noticeTarget';

const K = 'funds.notices';

interface NoticeParent {
  id: number;
  name: string;
  fundName: string;
}

/** Deux objets de fonds différents peuvent porter le même nom : le fonds les distingue. */
const displayName = (parent: NoticeParent) => `${parent.name} - ${parent.fundName}`;

const ICONS: Record<NoticeParentAction, LucideIcon> = {
  notify: Send,
  exportTarget: Users,
  regenerate: RefreshCw,
  download: Download,
  delete: Trash2,
};

interface NoticeParentActionsOptions<P extends NoticeParent, L extends NoticeLine> {
  rules: NoticeRules<L>;
  contextOf: (parent: P) => NoticeContext;
  linesOf: (parent: P) => L[];
  updateLines: (parent: P, update: (lines: L[]) => L[]) => void;
  send: (parent: P, apply: (lines: L[]) => L[], onDone: () => void) => void;
  remove: (parents: P[]) => void;
  /** Appelé quand une action sur une sélection aboutit : la sélection est vidée. */
  onCompleted?: () => void;
}

/**
 * Actions du listing d'une famille de notices, sur un objet ou sur une sélection : chaque action applique
 * aux lignes de l'objet l'action de ligne correspondante. Les objets non éligibles ou en cours d'envoi sont ignorés.
 */
export function useNoticeParentActions<P extends NoticeParent, L extends NoticeLine>({
  rules,
  contextOf,
  linesOf,
  updateLines,
  send,
  remove,
  onCompleted,
}: NoticeParentActionsOptions<P, L>) {
  const { t, lang } = useTranslation();
  const [pending, setPending] = useState<{ action: NoticeParentAction; parents: P[] } | null>(null);

  const C = `${K}.common`;
  const D = `${K}.docKind.${rules.documentKind}`;
  const F = `${K}.families.${rules.family}`;

  const label = (action: NoticeParentAction) =>
    action === 'download' || action === 'regenerate' ? t(`${D}.${action}Many`) : t(`${C}.actions.${action}`);

  const blocker = (action: NoticeParentAction, parent: P) => parentBlocker(rules, contextOf(parent), action, linesOf(parent));
  const targetsOf = (action: NoticeParentAction, parent: P) =>
    parentTargetLines(rules, contextOf(parent), action, linesOf(parent));

  const toAction = (action: NoticeParentAction, parents: P[]): TableRowAction => ({
    label: label(action),
    icon: ICONS[action],
    intent: action === 'delete' ? 'danger' : 'neutral',
    separatorBefore: action === 'delete',
    onClick: () => setPending({ action, parents }),
  });

  // Un objet en cours d'envoi garde l'action : la fenêtre annonce qu'il est ignoré.
  const proposed = (action: NoticeParentAction, parent: P) => blocker(action, parent) !== 'notEligible';

  const rowActions = (parent: P): TableRowAction[] =>
    PARENT_ACTIONS.filter(action => proposed(action, parent)).map(action => toAction(action, [parent]));

  const bulkActions = (parents: P[]): TableRowAction[] =>
    PARENT_ACTIONS.filter(action => parents.some(parent => proposed(action, parent))).map(action => toAction(action, parents));

  const action = pending?.action;
  const retained = pending && action ? pending.parents.filter(parent => blocker(action, parent) === null) : [];
  const ignored = pending && action ? pending.parents.filter(parent => blocker(action, parent) !== null) : [];

  const noteOf = (parent: P): string => {
    if (!action) return '';
    const targets = targetsOf(action, parent);
    switch (action) {
      case 'notify': {
        const notifications = targets.filter(line => rules.sendKind(line) === 'notification').length;
        return rules.hasReminder
          ? t(`${C}.parentNotes.notify`, { notifications, reminders: targets.length - notifications })
          : t(`${C}.parentNotes.notifyOnly`, { notifications });
      }
      case 'exportTarget':
        return t(`${C}.parentNotes.exportTarget`, { count: targets.length });
      case 'regenerate':
        return t(`${D}.parentNotes.regenerate`, { count: targets.length, ignored: linesOf(parent).length - targets.length });
      case 'download':
        return t(`${D}.parentNotes.download`, { count: targets.length });
      case 'delete':
        return t(`${C}.parentNotes.delete`, { count: linesOf(parent).length });
    }
  };

  const effects: EffectItem[] = action
    ? [
        ...retained.map(parent => ({
          id: String(parent.id),
          icon: ICONS[action],
          label: displayName(parent),
          note: noteOf(parent),
          reversible: action !== 'delete',
        })),
        {
          id: 'ignored',
          icon: Ban,
          label: t(`${F}.ignored`),
          note: ignored.length > 0 ? t(`${F}.ignoredNote`) : undefined,
          objects: ignored.map(parent => ({
            id: String(parent.id),
            label: blocker(action, parent) === 'sending' ? t(`${C}.dialog.sendingSuffix`, { name: displayName(parent) }) : displayName(parent),
          })),
          count: ignored.length,
          reversible: true,
        },
      ]
    : [];

  const manualOverwritten =
    action === 'regenerate'
      ? retained.reduce((sum, parent) => sum + targetsOf(action, parent).filter(line => line.document.manualFile).length, 0)
      : 0;

  const warning = () => {
    if (action === 'delete') return t(`${F}.deleteWarning`);
    if (manualOverwritten > 0) return t(manualOverwritten === 1 ? `${D}.overwriteOne` : `${D}.overwriteMany`, { count: manualOverwritten });
    return undefined;
  };

  const confirm = () => {
    if (!pending || !action) return;
    setPending(null);
    if (retained.length === 0) return;
    const now = new Date();
    const names = retained.map(parent => parent.name).join(', ');
    ignored
      .filter(parent => blocker(action, parent) === 'sending')
      .forEach(parent => toast.error(t(`${C}.toast.refused`, { name: parent.name }), { description: t(`${F}.sending`) }));
    switch (action) {
      case 'notify':
        retained.forEach(parent => {
          const ids = new Set(targetsOf(action, parent).map(line => line.id));
          const notifications = targetsOf(action, parent).filter(line => rules.sendKind(line) === 'notification').length;
          const reminders = ids.size - notifications;
          toast.info(t(`${C}.toast.sendStarted`, { name: parent.name }));
          send(
            parent,
            lines =>
              lines.map(line => {
                const kind = ids.has(line.id) ? rules.sendKind(line) : null;
                return kind ? rules.applySend(ensureDocument(rules, line, now), kind, new Date()) : line;
              }),
            () =>
              toast.success(
                rules.hasReminder
                  ? t(`${C}.toast.sendDone`, { name: parent.name, notifications, reminders })
                  : t(`${C}.toast.sendDoneNotifications`, { name: parent.name, notifications }),
              ),
          );
        });
        break;
      case 'exportTarget': {
        const count = exportNoticeTarget(
          t,
          lang,
          rules,
          retained.map(parent => ({ parentName: parent.name, lines: targetsOf(action, parent) })),
          true,
        );
        toast.success(t(`${C}.toast.targetExported`, { count }));
        break;
      }
      case 'regenerate': {
        let count = 0;
        retained.forEach(parent => {
          const ids = new Set(targetsOf(action, parent).map(line => line.id));
          count += ids.size;
          updateLines(parent, lines => lines.map(line => (ids.has(line.id) ? regenerateDocument(rules, line, now) : line)));
        });
        toast.success(t(`${D}.toast.regenerated`, { count }));
        break;
      }
      case 'download': {
        let count = 0;
        retained.forEach(parent => {
          const ids = new Set(targetsOf(action, parent).map(line => line.id));
          count += ids.size;
          if (linesOf(parent).some(line => ids.has(line.id) && rules.documentMissing(line))) {
            updateLines(parent, lines => lines.map(line => (ids.has(line.id) ? ensureDocument(rules, line, now) : line)));
          }
        });
        toast.success(t(`${D}.toast.zipDownloaded`, { count }));
        break;
      }
      case 'delete':
        remove(retained);
        toast.success(t(`${C}.toast.deleted`, { names }));
        break;
    }
    onCompleted?.();
  };

  const dialogs: ReactNode = (
    <NoticeActionDialog
      open={Boolean(pending)}
      onClose={() => setPending(null)}
      title={action ? label(action) : ''}
      description={
        pending
          ? t(pending.parents.length === 1 ? `${F}.selectionOne` : `${F}.selectionMany`, { count: pending.parents.length })
          : undefined
      }
      icon={action ? ICONS[action] : undefined}
      effects={effects}
      warning={warning()}
      confirmLabel={action ? label(action) : ''}
      destructive={action === 'delete'}
      confirmDisabledReason={retained.length === 0 ? t(`${F}.noneEligible`) : undefined}
      onConfirm={confirm}
    />
  );

  return { rowActions, bulkActions, dialogs };
}
