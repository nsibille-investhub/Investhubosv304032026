import { useState } from 'react';
import {
  Download,
  Eye,
  FileSignature,
  FolderOpen,
  PenTool,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import { useTranslation } from '../utils/languageContext';
import {
  mockDocuments,
  mockSpecificDocuments,
  type MockDocument,
  type MockDocumentFamily,
  type MockSpecificDocument,
} from '../utils/subscriptionDetailMockData';

const KEY = 'subscriptions.detail.documentsTab';

const FAMILIES: Array<{ id: MockDocumentFamily; labelKey: string }> = [
  { id: 'toSign', labelKey: `${KEY}.families.toSign` },
  { id: 'postSubscription', labelKey: `${KEY}.families.postSubscription` },
  { id: 'other', labelKey: `${KEY}.families.other` },
  { id: 'specific', labelKey: `${KEY}.families.specific` },
];

interface SpecificFormValues {
  name: string;
  file: string;
  signatureCoordinates: string;
  counterSignatureCoordinates: string;
  signaturePages: string;
  counterSignaturePages: string;
}

const EMPTY_FORM: SpecificFormValues = {
  name: '',
  file: '',
  signatureCoordinates: '',
  counterSignatureCoordinates: '',
  signaturePages: '',
  counterSignaturePages: '',
};

/**
 * Documents de la souscription regroupés par famille, avec les documents
 * spécifiques à signer et leurs coordonnées de signature.
 */
export function SubscriptionDocumentsPanel() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<MockDocument[]>(mockDocuments);
  const [specifics, setSpecifics] = useState<MockSpecificDocument[]>(mockSpecificDocuments);
  const [deleting, setDeleting] = useState<MockDocument | null>(null);
  const [editing, setEditing] = useState<MockSpecificDocument | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<SpecificFormValues>(EMPTY_FORM);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (document: MockSpecificDocument) => {
    setEditing(document);
    setForm({
      name: document.name,
      file: document.file,
      signatureCoordinates: document.signatureCoordinates,
      counterSignatureCoordinates: document.counterSignatureCoordinates,
      signaturePages: document.signaturePages,
      counterSignaturePages: document.counterSignaturePages,
    });
    setFormOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error(t(`${KEY}.specific.nameRequired`));
      return;
    }
    if (editing) {
      setSpecifics(prev =>
        prev.map(item => (item.id === editing.id ? { ...item, ...form } : item)),
      );
      toast.success(t(`${KEY}.specific.updated`), { description: form.name });
    } else {
      const id = `spec-${specifics.length + 1}`;
      setSpecifics(prev => [...prev, { id, ...form }]);
      setDocuments(prev => [
        ...prev,
        {
          id: Math.max(...prev.map(item => item.id)) + 1,
          date: new Date().toLocaleDateString('fr-FR'),
          name: form.name,
          language: 'FR',
          type: t(`${KEY}.families.specific`),
          status: 'toSign',
          file: form.file || `${form.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          family: 'specific',
        },
      ]);
      toast.success(t(`${KEY}.specific.added`), { description: form.name });
    }
    setFormOpen(false);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setDocuments(prev => prev.filter(item => item.id !== deleting.id));
    toast.info(t(`${KEY}.deleted`), { description: deleting.name });
    setDeleting(null);
  };

  return (
    <div className="px-8 py-6 space-y-6">
      <Card className="shadow-sm overflow-hidden p-0 gap-0">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
          <div className="min-w-0">
            <h3 className={`${WIDGET_TITLE_CLASS} flex items-center gap-1.5`}>
              <FolderOpen className="w-4 h-4" />
              {t(`${KEY}.title`)}
            </h3>
            <p className={WIDGET_SUBTITLE_CLASS}>{t(`${KEY}.subtitle`)}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => toast.info(t('subscriptions.detail.toast.addDocumentToast'))}
            >
              <Plus className="w-3.5 h-3.5" />
              {t(`${KEY}.addDocument`)}
            </Button>
            <Button size="sm" className="h-8 gap-1.5 text-xs text-white" onClick={openCreate}>
              <FileSignature className="w-3.5 h-3.5" />
              {t(`${KEY}.specific.add`)}
            </Button>
          </div>
        </div>

        {FAMILIES.map(family => {
          const rows = documents.filter(document => document.family === family.id);
          return (
            <div key={family.id} className="border-b last:border-b-0">
              <div className="flex items-center justify-between gap-2 bg-muted/60 px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(family.labelKey)}
                </span>
                <Badge className="bg-muted text-muted-foreground text-[11px]">{rows.length}</Badge>
              </div>

              {rows.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">{t(`${KEY}.emptyFamily`)}</p>
              ) : (
                <ul className="divide-y">
                  {rows.map(document => {
                    const specific = specifics.find(item => item.name === document.name);
                    return (
                      <li
                        key={document.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="min-w-0">
                            <span className="block truncate text-sm text-foreground">
                              {document.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {document.date}
                              {document.language ? ` · ${document.language}` : ''}
                              {document.type ? ` · ${document.type}` : ''}
                            </span>
                          </span>
                        </span>

                        <span className="flex shrink-0 items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            title={t(`${KEY}.preview`)}
                            aria-label={t(`${KEY}.preview`)}
                            onClick={() =>
                              toast.info(t('subscriptions.detail.toast.documentPreview'), {
                                description: document.name,
                              })
                            }
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground"
                            title={t(`${KEY}.downloadSigned`)}
                            aria-label={t(`${KEY}.downloadSigned`)}
                            disabled={document.status !== 'signed'}
                            onClick={() =>
                              toast.success(t(`${KEY}.downloadSignedToast`), {
                                description: document.file,
                              })
                            }
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>

                          {document.unsignedFile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground"
                              title={t(`${KEY}.downloadToSign`)}
                              aria-label={t(`${KEY}.downloadToSign`)}
                              onClick={() =>
                                toast.success(t(`${KEY}.downloadToSignToast`), {
                                  description: document.unsignedFile,
                                })
                              }
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </Button>
                          )}

                          {specific && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                              onClick={() => openEdit(specific)}
                            >
                              {t(`${KEY}.specific.edit`)}
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-600"
                            title={t(`${KEY}.delete`)}
                            aria-label={t(`${KEY}.delete`)}
                            onClick={() => setDeleting(document)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        <div className="flex justify-end px-4 py-3">
          <Button
            className="h-9 gap-1.5 text-xs text-white hover:opacity-90"
            style={{ background: PRIMARY_BUTTON_GRADIENT }}
            onClick={() => toast.success(t(`${KEY}.exportPackToast`))}
          >
            <Download className="w-3.5 h-3.5" />
            {t(`${KEY}.exportPack`)}
          </Button>
        </div>
      </Card>

      {/* Document specifique : nom, fichier, coordonnees et pages de signature */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {t(editing ? `${KEY}.specific.editTitle` : `${KEY}.specific.addTitle`)}
            </DialogTitle>
            <DialogDescription>{t(`${KEY}.specific.subtitle`)}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: 'name', labelKey: `${KEY}.specific.name`, full: true },
                { key: 'file', labelKey: `${KEY}.specific.file`, full: true },
                { key: 'signatureCoordinates', labelKey: `${KEY}.specific.signatureCoordinates` },
                {
                  key: 'counterSignatureCoordinates',
                  labelKey: `${KEY}.specific.counterSignatureCoordinates`,
                },
                { key: 'signaturePages', labelKey: `${KEY}.specific.signaturePages` },
                { key: 'counterSignaturePages', labelKey: `${KEY}.specific.counterSignaturePages` },
              ] as Array<{ key: keyof SpecificFormValues; labelKey: string; full?: boolean }>
            ).map(field => (
              <div key={field.key} className={field.full ? 'col-span-2' : undefined}>
                <label className="text-xs text-muted-foreground">{t(field.labelKey)}</label>
                <Input
                  value={form[field.key]}
                  onChange={event => setForm(prev => ({ ...prev, [field.key]: event.target.value }))}
                  className="mt-1 h-9"
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
              {t('subscriptions.detail.action.common.cancel')}
            </Button>
            <Button size="sm" className="text-white" onClick={handleSubmit}>
              {t('subscriptions.detail.action.common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={open => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${KEY}.deleteTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(`${KEY}.deleteDescription`, { name: deleting?.name ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('subscriptions.detail.action.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('subscriptions.detail.action.common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
