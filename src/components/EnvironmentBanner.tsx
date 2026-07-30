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
        className="flex items-center justify-center gap-2 px-5 py-1.5 border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 flex-shrink-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(245,158,11,0.06) 6px, rgba(245,158,11,0.06) 12px)',
        }}
        role="status"
        aria-live="polite"
      >
        <FlaskConical className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />

        <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
          {t('environmentBanner.label')}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
