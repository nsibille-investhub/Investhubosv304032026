import { motion, AnimatePresence } from 'motion/react';
import { FlaskConical } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';

export function EnvironmentBanner() {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center gap-2.5 px-5 py-2 border-b border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 flex-shrink-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(139,92,246,0.06) 6px, rgba(139,92,246,0.06) 12px)',
        }}
        role="status"
        aria-live="polite"
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
        </span>

        <div className="flex items-center justify-center w-6 h-6 rounded bg-violet-500 flex-shrink-0">
          <FlaskConical className="w-3.5 h-3.5 text-white" />
        </div>

        <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400 flex-shrink-0">
          {t('environmentBanner.label')}
        </span>

        <div className="w-px h-3.5 bg-violet-300 dark:bg-violet-700 flex-shrink-0" />

        <span className="text-xs text-violet-800 dark:text-violet-300">
          {t('environmentBanner.message')}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
