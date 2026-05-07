import { useMemo, useState } from 'react';
import {
  Bell,
  BellOff,
  Check,
  X,
  RotateCcw,
  Mail,
  Globe,
  Eye,
  Package,
  Users,
  Paperclip,
  ChevronRight,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { StatusBadge } from './StatusBadge';
import { DocumentNameCell } from './DocumentNameCell';
import { UserCell } from './UserCell';
import { CommentIndicator } from './CommentIndicator';
import {
  ValidationBatch,
  ValidationDocument,
  ValidationStatus,
} from '../utils/validationDocumentsGenerator';
import { useTranslation } from '../utils/languageContext';
import { cn } from './ui/utils';

interface NotificationPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  batch: ValidationBatch | null;
  documents: ValidationDocument[];
  status: ValidationStatus;
  onValidate: () => void;
  onReject: () => void;
  onResetToPending: () => void;
  onPreviewDocument: (doc: ValidationDocument) => void;
}

const STATUS_VARIANT: Record<
  ValidationStatus,
  { variant: 'warning' | 'success' | 'danger' }
> = {
  pending: { variant: 'warning' },
  validated: { variant: 'success' },
  rejected: { variant: 'danger' },
};

function ChannelBadge({ channel }: { channel: 'email' | 'portal' | 'both' }) {
  const { t } = useTranslation();
  const map = {
    email: { icon: Mail, label: t('ged.dataRoom.validation.drawer.channelLabelEmail') },
    portal: { icon: Globe, label: t('ged.dataRoom.validation.drawer.channelLabelPortal') },
    both: { icon: Mail, label: t('ged.dataRoom.validation.drawer.channelLabelBoth') },
  } as const;
  const { icon: Icon, label } = map[channel];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/**
 * Render a markdown-ish body with **bold** spans.
 */
function renderParagraph(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-gray-900 dark:text-gray-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export function NotificationPreviewDrawer({
  isOpen,
  onClose,
  batch,
  documents,
  status,
  onValidate,
  onReject,
  onResetToPending,
  onPreviewDocument,
}: NotificationPreviewDrawerProps) {
  const { t, lang } = useTranslation();
  const [tab, setTab] = useState<'email' | 'recipients' | 'attachments'>('email');

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [lang],
  );
  const formatDate = (iso: string) => dateFormatter.format(new Date(iso));

  const recipientCount = batch?.notification?.recipients.length ?? 0;
  const isSilent = !batch?.notification;
  const statusConf = STATUS_VARIANT[status];
  const statusLabel = t(`ged.dataRoom.validation.status.${status}`);

  const headerSubtitle = useMemo(() => {
    if (isSilent) return t('ged.dataRoom.validation.drawer.noNotificationOnly');
    const channelKey =
      batch?.notification?.channel === 'portal'
        ? 'channelPortal'
        : batch?.notification?.channel === 'both'
          ? 'channelBoth'
          : 'channelEmail';
    return t(
      recipientCount > 1
        ? 'ged.dataRoom.validation.drawer.headerMany'
        : 'ged.dataRoom.validation.drawer.headerOne',
      {
        count: recipientCount,
        channel: t(`ged.dataRoom.validation.drawer.${channelKey}`),
      },
    );
  }, [isSilent, batch, recipientCount, t]);

  if (!batch) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="!w-[92vw] sm:!w-[640px] lg:!w-[720px] !max-w-none p-0 flex flex-col gap-0"
      >
        {/* Header */}
        <SheetHeader className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#000E2B' }}
            >
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  {batch.kind}
                </span>
                <StatusBadge label={statusLabel} variant={statusConf.variant} />
              </div>
              <SheetTitle className="text-base leading-snug truncate">
                {batch.name}
              </SheetTitle>
              <SheetDescription className="mt-1 flex items-center gap-1.5 text-xs">
                {isSilent ? (
                  <BellOff className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <Bell className="h-3.5 w-3.5 text-blue-500" />
                )}
                {headerSubtitle}
              </SheetDescription>
            </div>
          </div>

          {!isSilent && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ChannelBadge channel={batch.notification!.channel} />
              <Badge variant="outline" className="gap-1">
                <Paperclip className="h-3 w-3" />
                {t(
                  documents.length > 1
                    ? 'ged.dataRoom.validation.drawer.attachmentsMany'
                    : 'ged.dataRoom.validation.drawer.attachmentsOne',
                  { count: documents.length },
                )}
              </Badge>
              <span className="text-xs text-gray-500">
                {t('ged.dataRoom.validation.drawer.createdByOn', {
                  name: batch.createdBy.name,
                  date: formatDate(batch.createdAt),
                })}
              </span>
            </div>
          )}
        </SheetHeader>

        {/* Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as typeof tab)}
            className="flex h-full flex-col"
          >
            <TabsList className="mx-6 mt-4 grid w-fit grid-cols-3 gap-1">
              <TabsTrigger value="email" disabled={isSilent} className="gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {t('ged.dataRoom.validation.drawer.tabEmail')}
              </TabsTrigger>
              <TabsTrigger value="recipients" disabled={isSilent} className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {t('ged.dataRoom.validation.drawer.tabRecipients')}
                {recipientCount > 0 && (
                  <span className="ml-1 rounded-full bg-gray-200 px-1.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    {recipientCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="attachments" className="gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                {t('ged.dataRoom.validation.drawer.tabAttachments')}
                <span className="ml-1 rounded-full bg-gray-200 px-1.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {documents.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 px-6 py-4">
              {/* Email tab */}
              <TabsContent value="email" className="m-0 mt-0">
                {isSilent ? (
                  <SilentBatchPlaceholder />
                ) : (
                  <EmailPreview
                    notification={batch.notification!}
                    documents={documents}
                  />
                )}
              </TabsContent>

              {/* Recipients tab */}
              <TabsContent value="recipients" className="m-0 mt-0">
                {isSilent ? (
                  <SilentBatchPlaceholder />
                ) : (
                  <RecipientsList notification={batch.notification!} />
                )}
              </TabsContent>

              {/* Attachments tab */}
              <TabsContent value="attachments" className="m-0 mt-0 space-y-2">
                {documents.map((doc) => (
                  <AttachmentRow
                    key={doc.id}
                    doc={doc}
                    onPreview={() => onPreviewDocument(doc)}
                    formatDate={formatDate}
                  />
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Footer actions */}
        <SheetFooter className="border-t border-gray-200 bg-white px-6 py-3 dark:border-gray-800 dark:bg-gray-950 mt-0">
          <div className="flex w-full items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {t('ged.dataRoom.validation.drawer.close')}
            </Button>
            <div className="flex items-center gap-2">
              {status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={onReject}
                  >
                    <X className="h-4 w-4" />
                    {t('ged.dataRoom.validation.tooltip.rejectBatch')}
                  </Button>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={onValidate}
                  >
                    <Check className="h-4 w-4" />
                    {isSilent
                      ? t('ged.dataRoom.validation.tooltip.validateBatch')
                      : t('ged.dataRoom.validation.tooltip.validateAndNotify')}
                  </Button>
                </>
              )}
              {(status === 'validated' || status === 'rejected') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-amber-700 hover:bg-amber-50"
                  onClick={onResetToPending}
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('ged.dataRoom.validation.drawer.resetToPending')}
                </Button>
              )}
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SilentBatchPlaceholder() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center dark:border-gray-800 dark:bg-gray-900/40">
      <BellOff className="h-8 w-8 text-gray-400" />
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('ged.dataRoom.validation.drawer.silentTitle')}
      </p>
      <p className="max-w-xs text-xs text-gray-500">
        {t('ged.dataRoom.validation.drawer.silentDescription')}
      </p>
    </div>
  );
}

function EmailPreview({
  notification,
  documents,
}: {
  notification: NonNullable<ValidationBatch['notification']>;
  documents: ValidationDocument[];
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      {/* Email header */}
      <div className="space-y-1 border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-gray-900/40">
        <div className="flex items-baseline gap-2 text-xs">
          <span className="w-12 shrink-0 font-medium text-gray-500">{t('ged.dataRoom.validation.drawer.fieldFrom')}</span>
          <span className="text-gray-900 dark:text-gray-100">
            InvestHub &lt;no-reply@investhub.io&gt;
          </span>
        </div>
        <div className="flex items-baseline gap-2 text-xs">
          <span className="w-12 shrink-0 font-medium text-gray-500">{t('ged.dataRoom.validation.drawer.fieldTo')}</span>
          <span className="text-gray-900 dark:text-gray-100">
            {notification.recipients
              .slice(0, 2)
              .map((r) => r.name)
              .join(', ')}
            {notification.recipients.length > 2 &&
              ` ${t('ged.dataRoom.validation.drawer.moreRecipients', { count: notification.recipients.length - 2 })}`}
          </span>
        </div>
        <div className="flex items-baseline gap-2 text-xs">
          <span className="w-12 shrink-0 font-medium text-gray-500">{t('ged.dataRoom.validation.drawer.fieldSubject')}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {notification.subject}
          </span>
        </div>
      </div>

      {/* Email body */}
      <div className="space-y-3 px-5 py-5 text-sm text-gray-700 dark:text-gray-300">
        <p>{notification.greeting}</p>
        {notification.paragraphs.map((p, idx) => (
          <p key={idx} className="leading-relaxed">
            {renderParagraph(p)}
          </p>
        ))}

        {documents.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/40">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              <Paperclip className="h-3 w-3" />
              {t('ged.dataRoom.validation.drawer.attachmentsHeading')}
            </div>
            <ul className="space-y-1.5">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 text-xs">
                  <Paperclip className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="truncate text-gray-700 dark:text-gray-300">
                    {doc.name}
                  </span>
                  {doc.size && (
                    <span className="ml-auto shrink-0 text-[11px] text-gray-400">
                      {doc.size}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="pt-2">{notification.signature}</p>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-2 text-[10px] text-gray-400 dark:border-gray-900 dark:bg-gray-900/30">
        {t('ged.dataRoom.validation.drawer.footer')}
      </div>
    </div>
  );
}

function RecipientsList({
  notification,
}: {
  notification: NonNullable<ValidationBatch['notification']>;
}) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900/40">
          <tr>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {t('ged.dataRoom.validation.drawer.tableRecipient')}
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {t('ged.dataRoom.validation.drawer.tableEmail')}
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {t('ged.dataRoom.validation.drawer.tableType')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {notification.recipients.map((r) => (
            <tr key={r.email}>
              <td className="px-4 py-3">
                <UserCell name={r.name} sublabel={r.role} />
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {r.email}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">{r.role ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttachmentRow({
  doc,
  onPreview,
  formatDate,
}: {
  doc: ValidationDocument;
  onPreview: () => void;
  formatDate: (iso: string) => string;
}) {
  return (
    <button
      type="button"
      onClick={onPreview}
      className={cn(
        'group flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40',
        'dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900',
      )}
    >
      <div className="min-w-0 flex-1">
        <DocumentNameCell name={doc.name} pathSegments={doc.pathSegments} />
      </div>
      <CommentIndicator
        comment={doc.comment}
        author={doc.createdBy.name}
        date={formatDate(doc.createdAt)}
      />
      <span className="hidden text-xs text-gray-400 sm:inline">
        {doc.size ?? '—'}
      </span>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-950">
        <Eye className="h-4 w-4" />
      </span>
      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
    </button>
  );
}
