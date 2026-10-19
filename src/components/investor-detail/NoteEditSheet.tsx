import { Bell, CalendarDays, Paperclip, StickyNote } from 'lucide-react';
import { toast } from 'sonner';
import type { Note } from '../../utils/investorGenerator';
import { useTranslation } from '../../utils/languageContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import {
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFileDrop,
  SidePanelFooter,
  SidePanelSection,
  SidePanelSwitchRow,
} from '../ui/side-panel';

const K = 'investors.detail.notes';

export const NOTE_TYPES: Note['type'][] = ['General', 'KYC', 'Risk', 'Commercial', 'Legal'];

/** Valeur d'un champ date (AAAA-MM-JJ) à partir d'une date locale. */
const toInputDate = (date?: Date) => {
  if (!date) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const fromInputDate = (value: string) => (value ? new Date(`${value}T09:00:00`) : undefined);

interface NoteEditSheetProps {
  open: boolean;
  isNew: boolean;
  note: Note | null;
  onChange: (note: Note) => void;
  onClose: () => void;
  onSave: () => void;
}

export function NoteEditSheet({ open, isNew, note, onChange, onClose, onSave }: NoteEditSheetProps) {
  const { t } = useTranslation();
  if (!note) return null;

  const update = <F extends keyof Note>(field: F, value: Note[F]) => onChange({ ...note, [field]: value });
  const hasContent = note.content.replace(/<[^>]*>/g, '').trim().length > 0;
  const canSave = note.title.trim().length > 0 && hasContent;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SheetHeader className="px-6 py-5 border-b bg-white">
          <div>
            <SheetTitle className="text-[26px] leading-8">{isNew ? t(`${K}.sheet.addTitle`) : t(`${K}.sheet.editTitle`)}</SheetTitle>
            <SheetDescription className="mt-1 text-[15px]">{t(`${K}.sheet.description`)}</SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={StickyNote} title={t(`${K}.sheet.noteSection`)}>
            <SidePanelCard className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noteTitle">
                  {t(`${K}.sheet.title`)}
                  <span className="text-red-600 ml-0.5">*</span>
                </Label>
                <Input
                  id="noteTitle"
                  className="h-11"
                  value={note.title}
                  onChange={(e) => update('title', e.target.value)}
                  placeholder={t(`${K}.sheet.titlePlaceholder`)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteType">{t(`${K}.sheet.type`)}</Label>
                <Select value={note.type} onValueChange={(value) => update('type', value as Note['type'])}>
                  <SelectTrigger id="noteType" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`investors.detail.noteTypes.${type}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="noteContent">
                  {t(`${K}.sheet.content`)}
                  <span className="text-red-600 ml-0.5">*</span>
                </Label>
                <RichTextEditor
                  id="noteContent"
                  ariaLabel={t(`${K}.sheet.content`)}
                  value={note.content}
                  onChange={(value) => update('content', value)}
                  className="min-h-[180px]"
                />
              </div>
              <SidePanelSwitchRow
                id="noteImportant"
                label={t(`${K}.sheet.important`)}
                description={t(`${K}.sheet.importantHint`)}
                checked={note.isImportant}
                onCheckedChange={(value) => update('isImportant', value)}
              />
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={CalendarDays} title={t(`${K}.sheet.dateSection`)} description={t(`${K}.sheet.dateSectionHint`)}>
            <SidePanelCard className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="noteDate">{t(`${K}.sheet.date`)}</Label>
                <Input
                  id="noteDate"
                  type="date"
                  className="h-11"
                  value={toInputDate(note.date)}
                  onChange={(e) => update('date', fromInputDate(e.target.value) ?? note.date)}
                />
              </div>
              <SidePanelSwitchRow
                id="noteReminder"
                label={t(`${K}.sheet.reminder`)}
                description={t(`${K}.sheet.reminderHint`)}
                checked={Boolean(note.reminderDate)}
                onCheckedChange={(value) =>
                  update('reminderDate', value ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined)
                }
              />
              {note.reminderDate && (
                <div className="space-y-2">
                  <Label htmlFor="noteReminderDate" className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-muted-foreground" />
                    {t(`${K}.sheet.reminderDate`)}
                  </Label>
                  <Input
                    id="noteReminderDate"
                    type="date"
                    className="h-11"
                    value={toInputDate(note.reminderDate)}
                    onChange={(e) => update('reminderDate', fromInputDate(e.target.value))}
                  />
                </div>
              )}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Paperclip} title={t(`${K}.sheet.attachmentSection`)}>
            <SidePanelCard>
              <SidePanelFileDrop
                fileName={note.attachment?.name}
                onSelectFile={(file) => update('attachment', { name: file.name })}
                onPreview={() => toast.info(t('investors.detail.actions.comingSoon'))}
                onRemove={() => update('attachment', undefined)}
                labels={{
                  dropHint: t('ged.addModal.dropHint'),
                  dropHintDesc: t('ged.addModal.dropHintDesc'),
                  fileReady: t('ged.addModal.fileReady'),
                  preview: t('ged.addModal.preview'),
                  remove: t('ged.addModal.delete'),
                }}
              />
            </SidePanelCard>
          </SidePanelSection>
        </div>

        <SidePanelFooter>
          <Button variant="outline" onClick={onClose}>
            {t('investors.detail.contactsTab.cancel')}
          </Button>
          <Button onClick={onSave} disabled={!canSave}>
            {t('investors.detail.contactsTab.save')}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
