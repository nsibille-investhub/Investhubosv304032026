import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SubscriptionAuditOrigin } from './subscriptionAuditMock';

/** Notification "réponses modifiées après soumission" (IC-5620). */
export interface AnswersModifiedNotification {
  id: string;
  createdAt: string;
  read: boolean;
  subscriptionName: string;
  /** Souscription à rouvrir depuis le lien de la notification. */
  subscription: unknown;
  labels: string[];
  origin: SubscriptionAuditOrigin;
  authorName: string;
  /** Espace qui reçoit la notification. */
  channel: 'backOffice' | 'distributor';
}

interface NotificationsContextValue {
  notifications: AnswersModifiedNotification[];
  unreadCount: number;
  push: (notification: Omit<AnswersModifiedNotification, 'id' | 'createdAt' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

let sequence = 0;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AnswersModifiedNotification[]>([]);

  const push = useCallback<NotificationsContextValue['push']>(notification => {
    sequence += 1;
    setNotifications(prev => [
      { ...notification, id: `notif-${Date.now()}-${sequence}`, createdAt: new Date().toISOString(), read: false },
      ...prev,
    ]);
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
      push,
      markRead,
      markAllRead,
    }),
    [notifications, push, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
