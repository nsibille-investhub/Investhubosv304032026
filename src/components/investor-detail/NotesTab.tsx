import { useMemo, useState } from 'react';
import { Bell, Download, FileText, Paperclip, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '../../utils/investorGenerator';
import { formatDate } from '../../utils/formatters';
import { useTranslation } from '../../utils/languageContext';
import { DataTable, type ColumnConfig } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { FilterBar, type FilterConfig } from '../FilterBar';
import { StatusBadge } from '../StatusBadge';
import { Tag } from '../Tag';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { ListingCard, ListingNameCell } from '../ui/listing';
import { TableRowActions } from '../ui/row-actions';
import { NOTE_TYPES, NoteEditSheet } from './NoteEditSheet';

const K = 'investors.detail.notes';

/** Auteur des notes créées depuis la maquette : l'utilisateur connecté. */
const CURRENT_USER = 'Jean Dault';

type Row = Note & { id: number; noteId: string };
type SortKey = 'title' | 'type' | 'date' | 'author' | 'reminderDate';

const plainText = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

interface NotesTabProps {
  notes: Note[];
}

export function NotesTab({ notes: initialNotes }: NotesTabProps) {
  const { t, lang } = useTranslation();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selected, setSelected] = useState<Note | null>(null);
  const [toDelete, setToDelete] = useState<Note | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'desc' });
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string | string[]>>({});

  const isNew = !!selected && !notes.some((note) => note.id === selected.id);

  const create = () =>
    setSelected({
      id: `note-${Date.now()}`,
      title: '',
      author: CURRENT_USER,
      date: new Date(),
      content: '',
      type: 'General',
      isImportant: false,
    });

  const save = () => {
    if (!selected) return;
    if (isNew) {
      setNotes([selected, ...notes]);
      toast.success(t(`${K}.toast.added`, { title: selected.title }));
    } else {
      setNotes(notes.map((note) => (note.id === selected.id ? selected : note)));
      toast.success(t(`${K}.toast.updated`, { title: selected.title }));
    }
    setSelected(null);
  };

  const filterConfigs: FilterConfig[] = [
    {
      id: 'type',
      label: t(`${K}.columns.type`),
      type: 'multiselect',
      isPrimary: true,
      options: NOTE_TYPES.map((type) => ({ value: type, label: t(`investors.detail.noteTypes.${type}`) })),
    },
    {
      id: 'important',
      label: t(`${K}.columns.importance`),
      type: 'select',
      isPrimary: true,
      options: [
        { value: 'yes', label: t(`${K}.important`) },
        { value: 'no', label: t(`${K}.filters.normal`) },
      ],
    },
    {
      id: 'reminder',
      label: t(`${K}.columns.reminder`),
      type: 'select',
      isPrimary: true,
      options: [
        { value: 'yes', label: t(`${K}.filters.withReminder`) },
        { value: 'no', label: t(`${K}.filters.withoutReminder`) },
      ],
    },
  ];

  const rows: Row[] = useMemo(() => {
    const term = search.trim().toLowerCase();
    const types = (filters.type as string[] | undefined) ?? [];
    const filtered = notes.filter((note) => {
      if (term && ![note.title, plainText(note.content), note.author].some((value) => value.toLowerCase().includes(term))) return false;
      if (types.length > 0 && !types.includes(note.type)) return false;
      if (filters.important === 'yes' && !note.isImportant) return false;
      if (filters.important === 'no' && note.isImportant) return false;
      if (filters.reminder === 'yes' && !note.reminderDate) return false;
      if (filters.reminder === 'no' && note.reminderDate) return false;
      return true;
    });
    const list: Row[] = filtered.map((note, index) => ({ ...note, id: index + 1, noteId: note.id }));
    if (!sortConfig) return list;
    const key = sortConfig.key as SortKey;
    return [...list].sort((a, b) => {
      const left = a[key];
      const right = b[key];
      if (left === undefined) return 1;
      if (right === undefined) return -1;
      const result = left instanceof Date && right instanceof Date ? left.getTime() - right.getTime() : String(left).localeCompare(String(right), lang);
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [notes, sortConfig, lang, search, filters]);

  const toNote = (row: Row) => notes.find((note) => note.id === row.noteId) ?? notes[0];
  const empty = <span className="text-gray-400 text-sm">—</span>;

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'title',
      label: t(`${K}.columns.title`),
      sortable: true,
      render: (row, term) => <ListingNameCell name={row.title} searchTerm={term} secondary={plainText(row.content)} className="max-w-[350px]" />,
    },
    { key: 'type', label: t(`${K}.columns.type`), sortable: true, render: (row) => <Tag label={t(`investors.detail.noteTypes.${row.type}`)} /> },
    {
      key: 'date',
      label: t(`${K}.columns.date`),
      sortable: true,
      render: (row) => <span className="text-sm text-gray-700 whitespace-nowrap">{formatDate(row.date)}</span>,
    },
    { key: 'author', label: t(`${K}.columns.author`), sortable: true, render: (row) => <span className="text-sm text-gray-700 whitespace-nowrap">{row.author}</span> },
    {
      key: 'reminderDate',
      label: t(`${K}.columns.reminder`),
      sortable: true,
      render: (row) =>
        row.reminderDate ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700 whitespace-nowrap">
            <Bell className="w-3.5 h-3.5 text-gray-400" />
            {formatDate(row.reminderDate)}
          </span>
        ) : (
          empty
        ),
    },
    {
      key: 'attachment',
      label: t(`${K}.columns.attachment`),
      render: (row) => (row.attachment ? <Tag icon={Paperclip} label={row.attachment.name} /> : empty),
    },
    {
      key: 'importance',
      label: t(`${K}.columns.importance`),
      render: (row) => (row.isImportant ? <StatusBadge variant="danger" label={t(`${K}.important`)} /> : empty),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <TableRowActions
          actions={[
            { label: t(`${K}.actions.edit`), icon: Pencil, onClick: () => setSelected(toNote(row)) },
            {
              label: t(`${K}.actions.download`),
              icon: Download,
              onClick: () => toast.info(t('investors.detail.actions.comingSoon')),
              disabledReason: row.attachment ? undefined : t(`${K}.actions.noAttachment`),
            },
            { label: t(`${K}.actions.delete`), icon: Trash2, intent: 'danger', onClick: () => setToDelete(toNote(row)) },
          ]}
        />
      ),
    },
  ];

  const hasFilters = Object.values(filters).some((value) => (Array.isArray(value) ? value.length > 0 : Boolean(value)));

  return (
    <>
      <ListingCard
        toolbar={
          <div className="flex items-start justify-between gap-3">
            <FilterBar
              className="flex-1"
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t(`${K}.searchPlaceholder`)}
              filters={filterConfigs}
              activeFilters={filters}
              onFilterChange={(id, value) =>
                setFilters((prev) => {
                  const next = { ...prev };
                  if (value === null || (Array.isArray(value) && value.length === 0)) delete next[id];
                  else next[id] = value;
                  return next;
                })
              }
              onClearAll={() => setFilters({})}
            />
            <Button onClick={create} className="shrink-0">
              <Plus className="w-4 h-4" />
              {t(`${K}.newNote`)}
            </Button>
          </div>
        }
      >
        {rows.length === 0 ? (
          <EmptyState
            icon={FileText}
            hasFilters={hasFilters}
            hasSearch={Boolean(search.trim())}
            entityName={t(`${K}.entity`)}
            onReset={() => {
              setSearch('');
              setFilters({});
            }}
          />
        ) : (
          <DataTable
            data={rows}
            columns={columns}
            hoveredRow={hoveredRow}
            setHoveredRow={setHoveredRow}
            onRowClick={(row) => setSelected(toNote(row))}
            sortConfig={sortConfig}
            onSort={(key) =>
              setSortConfig((prev) =>
                prev?.key === key ? (prev.direction === 'asc' ? { key, direction: 'desc' } : null) : { key, direction: 'asc' },
              )
            }
            compactMode
            hideSelection
            searchTerm={search}
          />
        )}
      </ListingCard>

      <NoteEditSheet
        open={selected !== null}
        isNew={isNew}
        note={selected}
        onChange={setSelected}
        onClose={() => setSelected(null)}
        onSave={save}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t(`${K}.deleteDialog.title`, { title: toDelete?.title ?? '' })}
        description={t(`${K}.deleteDialog.description`)}
        confirmLabel={t(`${K}.actions.delete`)}
        cancelLabel={t('investors.detail.contactsTab.cancel')}
        destructive
        onConfirm={() => {
          if (!toDelete) return;
          setNotes(notes.filter((note) => note.id !== toDelete.id));
          toast.success(t(`${K}.toast.deleted`, { title: toDelete.title }));
          setToDelete(null);
        }}
      />
    </>
  );
}
