import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight } from 'lucide-react';
import { useAppStore } from '../utils/appStoreContext';
import { useTranslation } from '../utils/languageContext';
import { navigateToPage } from '../utils/routing';

export function MailRedirectBanner() {
  const { mailRedirect } = useAppStore();
  const { t } = useTranslation();

  if (!mailRedirect.active || mailRedirect.emails.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center gap-2.5 px-5 py-2 border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 flex-shrink-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(245,158,11,0.06) 6px, rgba(245,158,11,0.06) 12px)',
        }}
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
        </span>

        <div className="flex items-center justify-center w-6 h-6 rounded bg-amber-500 flex-shrink-0">
          <Mail className="w-3.5 h-3.5 text-white" />
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 flex-shrink-0">
          {t('mailRedirect.label')}
        </span>

        <div className="w-px h-3.5 bg-amber-300 dark:bg-amber-700 flex-shrink-0" />

        <span className="text-xs text-amber-800 dark:text-amber-300">
          {t('mailRedirect.message')}
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {mailRedirect.emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-semibold font-mono px-2 py-0.5 rounded"
            >
              <ArrowRight className="w-3 h-3" />
              {email}
            </span>
          ))}
        </div>

        <button
          onClick={() => navigateToPage('settings-mail-redirect')}
          className="ml-auto text-[11px] font-medium text-amber-700 dark:text-amber-400 underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-200 transition-colors flex-shrink-0"
        >
          {t('mailRedirect.configure')}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
