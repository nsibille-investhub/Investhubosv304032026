import { Layers } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import {
  NOTICE_DOCUMENT_SOURCES,
  documentSource,
  type NoticeContext,
  type NoticeFamily,
  type NoticeLine,
} from '../../utils/noticeActions';
import type { ColumnConfig, DataTableSelection } from '../DataTable';
import type { FilterConfig } from '../FilterBar';
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
