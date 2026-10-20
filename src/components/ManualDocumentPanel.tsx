import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sheet, SheetContent } from './ui/sheet';
import {
  SIDE_PANEL_WIDE_STYLE,
  SidePanelCard,
  SidePanelFileDrop,
  SidePanelFooter,
  SidePanelHeader,
  SidePanelSection,
} from './ui/side-panel';
import { useTranslation } from '../utils/languageContext';

export interface ManualDocumentInput {
  name: string;
  fileName: string;
  /** Format jj/mm/aaaa, vide si non renseignée. */
  issueDate: string;
  expiration: string;
}

interface ManualDocumentPanelProps {
  open: boolean;
  onClose: () => void;
  onSave: (doc: ManualDocumentInput) => void;
}

const T = 'subscriptions.detail.manualDocument';

export const isoToDisplayDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

/** Ajout d'une pièce hors nomenclature par l'opérateur. */
export function ManualDocumentPanel({ open, onClose, onSave }: ManualDocumentPanelProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [fileName, setFileName] = useState<string | undefined>();
  const [issueDate, setIssueDate] = useState('');
  const [expiration, setExpiration] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setFileName(undefined);
    setIssueDate('');
    setExpiration('');
  }, [open]);

  const canSave = name.trim() !== '' && Boolean(fileName);

  return (
    <Sheet open={open} onOpenChange={next => !next && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={t(`${T}.title`)} description={t(`${T}.description`)} />
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={FileText} title={t(`${T}.section`)} description={t(`${T}.sectionDesc`)}>
            <SidePanelCard>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>
                    {t(`${T}.name`)}
                    <span className="text-red-600 ml-0.5">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={event => setName(event.target.value)}
                    placeholder={t(`${T}.namePlaceholder`)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t(`${T}.file`)}
                    <span className="text-red-600 ml-0.5">*</span>
                  </Label>
                  <SidePanelFileDrop
                    fileName={fileName}
                    onSelectFile={file => setFileName(file.name)}
                    onRemove={() => setFileName(undefined)}
                    labels={{
                      dropHint: t('ged.addModal.dropHint'),
                      dropHintDesc: t('ged.addModal.dropHintDesc'),
                      fileReady: t('ged.addModal.fileReady'),
                      preview: t('ged.addModal.preview'),
                      remove: t('ged.addModal.delete'),
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t(`${T}.issueDate`)}</Label>
                    <Input type="date" className="h-11" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t(`${T}.expiration`)}</Label>
                    <Input type="date" className="h-11" value={expiration} onChange={e => setExpiration(e.target.value)} />
                  </div>
                </div>
              </div>
            </SidePanelCard>
          </SidePanelSection>
        </div>
        <SidePanelFooter>
          <Button variant="outline" onClick={onClose}>
            {t(`${T}.cancel`)}
          </Button>
          <Button
            disabled={!canSave}
            onClick={() =>
              onSave({
                name: name.trim(),
                fileName: fileName ?? '',
                issueDate: isoToDisplayDate(issueDate),
                expiration: isoToDisplayDate(expiration),
              })
            }
          >
            {t(`${T}.save`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
