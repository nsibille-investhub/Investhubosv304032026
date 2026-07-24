import { motion } from 'motion/react';
import { Mail, X } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import { useAppStore } from '../utils/appStoreContext';

export function MailRedirectBanner() {
  const { t } = useTranslation();
  const { mailRedirect, setMailRedirect } = useAppStore();

  if (!mailRedirect.enabled) return null;

  const emails = mailRedirect.emails.join(', ');

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full bg-amber-50 dark:bg-amber-950/60 border-b border-amber-300 dark:border-amber-800 flex items-center justify-center gap-3 px-4 py-1.5 z-50 flex-shrink-0"
    >
      <div className="flex items-center gap-2">
        <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600 dark:bg-amber-400" />
        </span>
        <span className="text-[11px] font-bold tracking-wide uppercase text-amber-800 dark:text-amber-200">
          {t('mailRedirect.label')}
        </span>
      </div>

      <div className="w-px h-3.5 bg-amber-300 dark:bg-amber-700" />

      <span className="text-xs font-mono font-medium text-amber-700 dark:text-amber-300">
        {emails}
      </span>

      <button
        onClick={() => setMailRedirect({ enabled: false, emails: [] })}
        className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-md px-2.5 py-1 hover:bg-amber-600 hover:text-white hover:border-amber-600 dark:hover:bg-amber-500 dark:hover:text-amber-950 dark:hover:border-amber-500 transition-colors"
      >
        <X className="w-3 h-3" />
        {t('mailRedirect.disable')}
      </button>
    </motion.div>
  );
}
