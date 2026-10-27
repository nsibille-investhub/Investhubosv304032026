import { Fragment, useEffect, useState } from 'react';
import { FileText, Info, ListChecks, Mail, RotateCcw, X } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import {
  BigModal,
  BigModalBody,
  BigModalContent,
  BigModalPanelFooter,
  BigModalPanelHeader,
} from './ui/big-modal';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { DisabledReason } from './ui/disabled-reason';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { EmptyState } from './EmptyState';

/** Réponse ou pièce invalidée au contrôle, proposée à la correction. */
export interface ReopenItem {
  id: string;
  kind: 'question' | 'document';
  sectionLabel: string;
  label: string;
  /** Motif saisi à l'invalidation, repris comme commentaire par défaut. */
  defaultComment?: string;
}

export interface ReopenRecipient {
  audienceKey: string;
  email: string;
  copies: Array<{ audienceKey: string; email: string }>;
  /** Règle de destinataire à expliquer (dossier intermédié). */
  hintKey?: string;
}

export interface ReopenSubmission {
  itemIds: string[];
  comments: Record<string, string>;
  message: string;
}

interface SubscriptionReopenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ReopenItem[];
  recipient: ReopenRecipient;
  templateLabel: string;
  /** Réglage "Keep docs at subscription reopen" : pièces pointées conservées ou supprimées. */
  keepDocuments: boolean;
  /** Le partenaire délégué a déjà validé : le dossier lui revient, pas à l'investisseur. */
  backToPartner: boolean;
  onConfirm: (submission: ReopenSubmission) => void;
}

const T = 'subscriptions.detail.reopen.dialog';

export function SubscriptionReopenDialog({
  open,
  onOpenChange,
  items,
  recipient,
  templateLabel,
  keepDocuments,
  backToPartner,
  onConfirm,
}: SubscriptionReopenDialogProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelected(items.map(item => item.id));
    setComments(Object.fromEntries(items.map(item => [item.id, item.defaultComment ?? ''])));
    setMessage('');
  }, [open]);

  const toggle = (id: string) =>
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const selectedDocuments = items.filter(item => item.kind === 'document' && selected.includes(item.id)).length;
  const confirmDisabledReason =
    selected.length === 0 && !message.trim() ? t(`${T}.emptyReason`) : undefined;
  const close = () => onOpenChange(false);

  return (
    <BigModal open={open} onOpenChange={onOpenChange}>
      <BigModalContent className="h-auto max-h-[85vh] max-w-2xl p-0 gap-0">
        <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl">
          <BigModalPanelHeader
            icon={RotateCcw}
            title={t(backToPartner ? `${T}.titlePartner` : `${T}.title`)}
            subtitle={t(backToPartner ? `${T}.subtitlePartner` : `${T}.subtitle`)}
            onClose={close}
            closeLabel={t('common.confirmDialog.close')}
          />
          <BigModalBody className="space-y-6">
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ListChecks className="w-4 h-4 text-muted-foreground" />
                  {t(`${T}.itemsTitle`)}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {t(`${T}.itemsSelected`, { count: selected.length, total: items.length })}
                </span>
              </div>
              {items.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title={t(`${T}.noItemsTitle`)}
                  description={t(`${T}.noItemsDescription`)}
                />
              ) : (
                <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                  {items.map(item => {
                    const checked = selected.includes(item.id);
                    return (
                      <li key={item.id} className="space-y-2 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={`reopen-${item.id}`}
                            checked={checked}
                            onCheckedChange={() => toggle(item.id)}
                            className="mt-0.5"
                          />
                          <Label htmlFor={`reopen-${item.id}`} className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                            <span className="text-sm font-medium text-foreground">{item.label}</span>
                            <span className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                              {item.kind === 'document' && <FileText className="w-3 h-3" />}
                              {item.sectionLabel}
                            </span>
                          </Label>
                          <Badge className="bg-red-50 text-red-700 border-red-200 shrink-0">
                            {t(`${T}.kind.${item.kind}`)}
                          </Badge>
                        </div>
                        {checked && (
                          <Textarea
                            value={comments[item.id] ?? ''}
                            onChange={e => setComments(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder={t(`${T}.commentPlaceholder`)}
                            aria-label={t(`${T}.commentLabel`, { item: item.label })}
                            className="ml-7 w-auto text-sm"
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="space-y-2">
              <Label htmlFor="reopen-message" className="text-sm font-semibold text-foreground">
                {t(`${T}.messageLabel`)}
              </Label>
              <Textarea
                id="reopen-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={t(`${T}.messagePlaceholder`)}
              />
            </section>

            <section className="rounded-lg border border-border bg-muted/40 p-4 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {t(`${T}.emailTitle`)}
              </h3>
              <div
                className="grid items-center gap-x-3 gap-y-2"
                style={{ gridTemplateColumns: 'max-content minmax(0, 1fr)' }}
              >
                <Badge className="bg-green-50 text-green-700 border-green-200">{t(recipient.audienceKey)}</Badge>
                <span className="text-sm font-semibold text-foreground break-all">{recipient.email}</span>
                {recipient.copies.map(copy => (
                  <Fragment key={copy.email}>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">{t(copy.audienceKey)}</Badge>
                    <span className="text-sm text-foreground break-all">
                      {t(`${T}.copy`, { email: copy.email })}
                    </span>
                  </Fragment>
                ))}
              </div>
              {recipient.hintKey && <p className="text-xs text-muted-foreground">{t(recipient.hintKey)}</p>}
              <p className="text-xs text-muted-foreground">{t(`${T}.template`, { template: templateLabel })}</p>
            </section>

            {selectedDocuments > 0 && (
              <p className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {t(keepDocuments ? `${T}.documentsKept` : `${T}.documentsDeleted`, { count: selectedDocuments })}
              </p>
            )}
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {t(backToPartner ? `${T}.effectsPartner` : `${T}.effects`)}
            </p>
          </BigModalBody>
          <BigModalPanelFooter
            start={
              <Button variant="ghost" size="sm" className="h-9" onClick={close}>
                <X className="w-4 h-4 mr-1" />
                {t('common.confirmDialog.cancel')}
              </Button>
            }
            end={
              <DisabledReason reason={confirmDisabledReason}>
                <Button
                  variant="primary"
                  size="sm"
                  className="h-9 gap-2"
                  disabled={Boolean(confirmDisabledReason)}
                  onClick={() =>
                    onConfirm({
                      itemIds: selected,
                      comments: Object.fromEntries(selected.map(id => [id, (comments[id] ?? '').trim()])),
                      message: message.trim(),
                    })
                  }
                >
                  <RotateCcw className="w-4 h-4" />
                  {t(`${T}.confirm`)}
                </Button>
              </DisabledReason>
            }
          />
        </div>
      </BigModalContent>
    </BigModal>
  );
}
