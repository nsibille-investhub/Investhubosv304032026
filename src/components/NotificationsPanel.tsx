import { ArrowUpRight, BellOff, PencilLine } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent } from './ui/sheet';
import { SIDE_PANEL_WIDE_STYLE, SidePanelCard, SidePanelFooter, SidePanelHeader } from './ui/side-panel';
import { EmptyState } from './EmptyState';
import { useTranslation } from '../utils/languageContext';
import type { AnswersModifiedNotification } from '../utils/notificationsContext';

const T = 'notifications.panel';
const MAX_LABELS = 3;

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: AnswersModifiedNotification[];
  /** Lien de la notification ; absent en aperçu. */
  onOpenNotification?: (notification: AnswersModifiedNotification) => void;
  onMarkAllRead?: () => void;
  title?: string;
  description?: string;
}

/** Notifications du back-office, ou aperçu de celle de l'espace distributeur. */
export function NotificationsPanel({
  open,
  onClose,
  notifications,
  onOpenNotification,
  onMarkAllRead,
  title,
  description,
}: NotificationsPanelProps) {
  const { t, lang } = useTranslation();
  const locale = lang === 'en' ? 'en-GB' : 'fr-FR';

  return (
    <Sheet open={open} onOpenChange={next => !next && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader title={title ?? t(`${T}.title`)} description={description ?? t(`${T}.description`)} />
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {notifications.length === 0 ? (
            <EmptyState icon={BellOff} title={t(`${T}.emptyTitle`)} description={t(`${T}.emptyDescription`)} />
          ) : (
            notifications.map(notification => {
              const shown = notification.labels.slice(0, MAX_LABELS);
              const more = notification.labels.length - shown.length;
              const date = new Date(notification.createdAt);
              return (
                <SidePanelCard key={notification.id}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <PencilLine className="w-4 h-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {t(
                            notification.labels.length === 1 ? `${T}.answersModifiedOne` : `${T}.answersModifiedMany`,
                            { count: notification.labels.length },
                          )}
                        </p>
                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label={t(`${T}.unread`)} />
                        )}
                      </div>
                      <p className="text-sm text-foreground/80">{notification.subscriptionName}</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {shown.map(label => (
                          <li key={label}>{label}</li>
                        ))}
                        {more > 0 && <li>{t(`${T}.moreAnswers`, { count: more })}</li>}
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        {t(`${T}.meta`, {
                          origin: t(`subscriptions.detail.audit.origin.${notification.origin}`),
                          author: notification.authorName,
                          date: date.toLocaleDateString(locale),
                          time: date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
                        })}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto px-0"
                        disabled={!onOpenNotification}
                        onClick={() => onOpenNotification?.(notification)}
                      >
                        {t(`${T}.open`)}
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </SidePanelCard>
              );
            })
          )}
        </div>
        <SidePanelFooter className={onMarkAllRead ? 'justify-between' : undefined}>
          {onMarkAllRead && (
            <Button variant="ghost" onClick={onMarkAllRead} disabled={notifications.every(n => n.read)}>
              {t(`${T}.markAllRead`)}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t(`${T}.close`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
