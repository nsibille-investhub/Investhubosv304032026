import { useCallback, useEffect, useState } from 'react';
import { getLatestWhatsNewDate } from '../data/whatsNew';

const STORAGE_KEY = 'investhub.whatsNew.lastSeenDate';

function readLastSeen(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

/**
 * Tracks whether there is unread content on the "What's New" page.
 * Compares the latest newsletter/changelog date to the last-seen date
 * persisted in localStorage. Call `markAsSeen()` when the user opens the page.
 */
export function useWhatsNewUnread() {
  const latestDate = getLatestWhatsNewDate();
  const [lastSeen, setLastSeen] = useState<string>(() => readLastSeen());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLastSeen(e.newValue ?? '');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markAsSeen = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, latestDate);
    } catch {
      // ignore — storage may be unavailable (private mode, etc.)
    }
    setLastSeen(latestDate);
  }, [latestDate]);

  const hasUnread = Boolean(latestDate) && lastSeen < latestDate;

  return { hasUnread, markAsSeen, latestDate, lastSeen };
}
