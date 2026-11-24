import { Layers, Loader2 } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import {
  NOTICE_DOCUMENT_SOURCES,
  documentSource,
  type NoticeContext,
  type NoticeFamily,
  type NoticeLine,
  type NoticeRules,
} from '../../utils/noticeActions';
import {
  noticeProgress,
  progressRank,
  type NoticeNotificationState,
  type NoticeProgress,
} from '../../utils/noticeProgress';
import type { ColumnConfig, DataTableSelection } from '../DataTable';
import type { FilterConfig } from '../FilterBar';
import { StatusBadge, type StatusVariant } from '../StatusBadge';
import { Tag } from '../Tag';
import { ActionsMenu, type TableRowAction } from '../ui/row-actions';

const K = 'funds.notices';

export const NOTICE_DOCUMENT_COLUMNS = ['documentSource', 'documentAddedAt', 'documentGeneratedAt'] as const;
export type NoticeDocumentColumn = (typeof NOTICE_DOCUMENT_COLUMNS)[number];

/** Colonnes masquées par défaut : seule la source du document est visible. */
export const NOTICE_DOCUMENT_HIDDEN: NoticeDocumentColumn[] = ['documentAddedAt', 'documentGeneratedAt'];

export const isNoticeDocumentColumn = (key: string): key is NoticeDocumentColumn =>
  (NOTICE_DOCUMENT_COLUMNS as readonly string[]).includes(key);

/** Valeur de tri d'une colonne de suivi du document : source par ordre alphabétique, dates par ordre chronologique. */
export function noticeDocumentSortValue(line: NoticeLine, key: NoticeDocumentColumn, sourceLabel: (line: NoticeLine) => string) {
  if (key === 'documentSource') return sourceLabel(line).toLowerCase();
  return (key === 'documentAddedAt' ? line.document.addedAt : line.document.generatedAt)?.getTime() ?? 0;
}

/** Colonnes et filtre de suivi du document d'une ligne, communs aux quatre familles de notices. */
export function useNoticeDocumentColumns<L extends NoticeLine>(documentKind: 'document' | 'letter') {
  const { t, lang } = useTranslation();
  const D = `${K}.docKind.${documentKind}`;
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const label = (key: NoticeDocumentColumn) => t(`${D}.columns.${key}`);
  const sourceLabel = (line: NoticeLine) => t(`${K}.common.sources.${documentSource(line.document)}`);
  const date = (value: Date | null) =>
    value ? <span className="text-sm tabular-nums">{dateFormat.format(value)}</span> : <span className="text-muted-foreground">-</span>;

  const columns: Record<NoticeDocumentColumn, ColumnConfig<L>> = {
    documentSource: {
      key: 'documentSource',
      label: label('documentSource'),
      sortable: true,
      render: line => <Tag label={sourceLabel(line)} />,
    },
    documentAddedAt: {
      key: 'documentAddedAt',
      label: label('documentAddedAt'),
      sortable: true,
      render: line => date(line.document.addedAt),
    },
    documentGeneratedAt: {
      key: 'documentGeneratedAt',
      label: label('documentGeneratedAt'),
      sortable: true,
      render: line => date(line.document.generatedAt),
    },
  };

  const filter: FilterConfig = {
    id: 'documentSource',
    label: label('documentSource'),
    type: 'multiselect',
    options: NOTICE_DOCUMENT_SOURCES.map(value => ({ value, label: t(`${K}.common.sources.${value}`) })),
  };

  const matches = (line: NoticeLine, sources: string[]) => sources.length === 0 || sources.includes(documentSource(line.document));

  const sortValue = (line: NoticeLine, key: NoticeDocumentColumn) => noticeDocumentSortValue(line, key, sourceLabel);

  return { label, columns, filter, matches, sortValue };
}

export const NOTICE_PROGRESS_COLUMNS = ['lines', 'documents', 'notification', 'sending'] as const;
export type NoticeProgressColumn = (typeof NOTICE_PROGRESS_COLUMNS)[number];

export const isNoticeProgressColumn = (key: string): key is NoticeProgressColumn =>
  (NOTICE_PROGRESS_COLUMNS as readonly string[]).includes(key);

const PROGRESS_VARIANT: Record<NoticeNotificationState, StatusVariant> = {
  immediate: 'info',
  none: 'neutral',
  partial: 'warning',
  full: 'success',
};

/** État d'avancement d'une opération (notification, paiement), avec la date du dernier événement dessous. */
export function NoticeProgressBadge({ state, label, date }: { state: NoticeNotificationState; label: string; date?: string | null }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <StatusBadge label={label} variant={PROGRESS_VARIANT[state]} />
      {date && <span className="text-xs tabular-nums text-muted-foreground">{date}</span>}
    </div>
  );
}

/** Texte d'une cellule calculée : compteur, ratio "11 / 12". */
export const noticeCount = (value: string | number) => <span className="whitespace-nowrap text-sm tabular-nums">{value}</span>;

/** Colonnes d'avancement d'un listing d'opérations, calculées sur les lignes et communes aux quatre familles. */
export function useNoticeProgressColumns<G extends { id: number }, L extends NoticeLine>({
  rules,
  contextOf,
  linesOf,
}: {
  rules: NoticeRules<L>;
  contextOf: (parent: G) => NoticeContext;
  linesOf: (parent: G) => L[];
}) {
  const { t, lang } = useTranslation();
  const P = `${K}.progress`;
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const progressOf = (parent: G): NoticeProgress => noticeProgress(rules, contextOf(parent), linesOf(parent));
  const label = (key: NoticeProgressColumn) =>
    key === 'documents' ? t(`${P}.documents.${rules.family}`) : t(`${P}.columns.${key}`);

  const columns: Record<NoticeProgressColumn, ColumnConfig<G>> = {
    lines: {
      key: 'lines',
      label: label('lines'),
      sortable: true,
      align: 'right',
      render: parent => noticeCount(progressOf(parent).lines),
    },
    documents: {
      key: 'documents',
      label: label('documents'),
      sortable: true,
      render: parent => {
        const progress = progressOf(parent);
        return noticeCount(t(`${P}.ratio`, { done: progress.documents, total: progress.lines }));
      },
    },
    notification: {
      key: 'notification',
      label: label('notification'),
      sortable: true,
      render: parent => {
        const progress = progressOf(parent);
        return (
          <NoticeProgressBadge
            state={progress.notification}
            label={t(`${P}.notification.${progress.notification}`, { done: progress.notified, total: progress.lines })}
            date={progress.lastNotifiedAt ? dateFormat.format(progress.lastNotifiedAt) : null}
          />
        );
      },
    },
    sending: {
      key: 'sending',
      label: label('sending'),
      sortable: true,
      render: parent =>
        contextOf(parent).sending ? (
          <StatusBadge label={t(`${P}.sending`)} variant="info" icon={Loader2} />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
  };

  const sortValue = (parent: G, key: NoticeProgressColumn): number => {
    if (key === 'sending') return contextOf(parent).sending ? 1 : 0;
    const progress = progressOf(parent);
    if (key === 'lines') return progress.lines;
    if (key === 'documents') return progress.documents;
    return progressRank(progress.notification, progress.notified, progress.lines);
  };

  return { label, columns, sortValue, progressOf };
}

/** Sélection d'un tableau de notices : libellé du bandeau et bouton d'action global. */
export function useNoticeSelection(
  /** `lines` pour un onglet de lignes, sinon la famille dont on sélectionne les objets. */
  unit: 'lines' | NoticeFamily,
  selectedIds: Set<number>,
  onChange: (ids: Set<number>) => void,
  actions: TableRowAction[],
): DataTableSelection {
  const { t } = useTranslation();
  const base = unit === 'lines' ? `${K}.common.selection.lines` : `${K}.families.${unit}.selection`;
  return {
    selectedIds,
    onChange,
    label: t(selectedIds.size === 1 ? `${base}One` : `${base}Many`, { count: selectedIds.size }),
    clearLabel: t(`${K}.common.selection.clear`),
    selectAllLabel: t(`${K}.common.selection.selectAll`),
    actions:
      actions.length > 0 ? (
        <ActionsMenu actions={actions} variant="outline" icon={Layers} text={t(`${K}.common.actions.bulk`)} />
      ) : undefined,
  };
}

/** Ce qu'une page de détail transmet à son onglet de lignes pour y brancher les actions. */
export interface NoticeLineBindings<L> {
  context: NoticeContext;
  onLinesChange: (update: (lines: L[]) => L[]) => void;
  onSend: (apply: (lines: L[]) => L[], onDone: () => void) => void;
}
