import * as React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  LayoutDashboard,
  LifeBuoy,
  Search,
  Sparkles,
} from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from '../utils/languageContext';
import { navigateToPage, type Page } from '../utils/routing';

type NotFoundPageProps = {
  onNavigate?: (page: Page) => void;
};

type Shortcut = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  page: Page;
  titleKey: string;
  descKey: string;
};

const shortcuts: Shortcut[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    page: 'investors',
    titleKey: 'notFound.shortcuts.dashboard.title',
    descKey: 'notFound.shortcuts.dashboard.desc',
  },
  {
    id: 'datahub',
    icon: Compass,
    page: 'datahub',
    titleKey: 'notFound.shortcuts.datahub.title',
    descKey: 'notFound.shortcuts.datahub.desc',
  },
  {
    id: 'designSystem',
    icon: Sparkles,
    page: 'design-system',
    titleKey: 'notFound.shortcuts.designSystem.title',
    descKey: 'notFound.shortcuts.designSystem.desc',
  },
];

export function NotFoundPage({ onNavigate }: NotFoundPageProps) {
  const { t } = useTranslation();

  const handleNavigate = (page: Page) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      navigateToPage(page);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      handleNavigate('investors');
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-br from-[#F8FAFA] via-[#EEF4F2] to-[#E6F0EC] dark:from-[#0B0D0D] dark:via-[#0E1614] dark:to-[#101D19]">
      <div className="relative min-h-full px-6 py-12 md:px-12 md:py-16 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#B6E68A]/40 to-[#25563F]/20 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            className="absolute -bottom-40 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-[#0A3D4A]/25 to-[#8DB4B8]/30 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 1.6, delay: 0.4 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full border border-[#3F7358]/10 dark:border-[#3F7358]/20"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.6, delay: 0.6 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full border border-[#3F7358]/10 dark:border-[#3F7358]/20"
          />
        </div>

        <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: copy + CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-7"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#101615]/80 backdrop-blur border border-[#D7E0DD] dark:border-[#1F2D2A] text-xs font-medium uppercase tracking-[0.16em] text-[#456B6C] dark:text-[#9DB2AE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3F7358]" />
              {t('notFound.badge')}
            </span>

            <div className="space-y-4">
              <h1 className="text-[88px] md:text-[120px] leading-none font-semibold tracking-tight bg-gradient-to-br from-[#000E2B] via-[#25563F] to-[#3F7358] dark:from-[#E8F0EE] dark:via-[#B6E68A] dark:to-[#8DB4B8] bg-clip-text text-transparent">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-[#1F3137] dark:text-[#E8F0EE]">
                {t('notFound.title')}
              </h2>
              <p className="text-base text-[#4F6166] dark:text-[#9DB2AE] max-w-lg leading-relaxed">
                {t('notFound.description')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleNavigate('investors')}
                className="bg-[#000E2B] hover:bg-[#0A1F4A] text-white shadow-sm h-11 px-5"
              >
                <LayoutDashboard className="w-4 h-4" />
                {t('notFound.cta.primary')}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-11 px-5 border-[#D7E0DD] dark:border-[#1F2D2A] text-[#1F3137] dark:text-[#E8F0EE]"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('notFound.cta.back')}
              </Button>
              <button
                type="button"
                onClick={() => handleNavigate('investors')}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#3F7358] hover:text-[#25563F] dark:text-[#B6E68A] dark:hover:text-[#D5F0AE] transition-colors"
              >
                <Search className="w-4 h-4" />
                {t('notFound.cta.search')}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#4F6166] dark:text-[#9DB2AE]">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>
                {t('notFound.support.prefix')}{' '}
                <a
                  href="mailto:support@investhub.io"
                  className="font-medium text-[#1F3137] dark:text-[#E8F0EE] underline underline-offset-4 decoration-[#B6E68A] hover:decoration-[#3F7358]"
                >
                  support@investhub.io
                </a>
              </span>
            </div>
          </motion.div>

          {/* Right: illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="relative hidden md:flex items-center justify-center"
          >
            <NotFoundIllustration />
          </motion.div>
        </div>

        {/* Shortcuts grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          className="relative max-w-6xl mx-auto mt-16"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#456B6C] dark:text-[#9DB2AE] mb-4">
            {t('notFound.shortcuts.heading')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <motion.button
                  key={shortcut.id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleNavigate(shortcut.page)}
                  className="group text-left rounded-2xl border border-[#D7E0DD] dark:border-[#1F2D2A] bg-white/80 dark:bg-[#101615]/80 backdrop-blur p-5 transition-all hover:border-[#3F7358]/40 hover:shadow-[0_8px_30px_-12px_rgba(63,115,88,0.35)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#B6E68A]/30 to-[#3F7358]/20 dark:from-[#B6E68A]/15 dark:to-[#3F7358]/10 flex items-center justify-center text-[#25563F] dark:text-[#B6E68A]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#9DB2AE] group-hover:text-[#3F7358] group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[#1F3137] dark:text-[#E8F0EE]">
                    {t(shortcut.titleKey)}
                  </p>
                  <p className="mt-1 text-xs text-[#4F6166] dark:text-[#9DB2AE] leading-relaxed">
                    {t(shortcut.descKey)}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function NotFoundIllustration() {
  return (
    <div className="relative w-full max-w-[460px] aspect-square">
      {/* Soft halo */}
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-white to-[#E6F0EC] dark:from-[#101D19] dark:to-[#0B0D0D] shadow-[0_30px_80px_-30px_rgba(15,40,33,0.25)]" />

      {/* Orbit rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-dashed border-[#3F7358]/30"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-10 rounded-full border border-[#8DB4B8]/30"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      {/* Floating tiles */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-6 left-8 w-20 h-20 rounded-2xl bg-white dark:bg-[#101615] border border-[#D7E0DD] dark:border-[#1F2D2A] shadow-[0_10px_30px_-12px_rgba(15,40,33,0.25)] flex items-center justify-center"
      >
        <Search className="w-7 h-7 text-[#456B6C] dark:text-[#8DB4B8]" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute bottom-10 left-4 w-24 h-24 rounded-2xl bg-[#000E2B] text-white shadow-[0_18px_40px_-12px_rgba(0,14,43,0.45)] flex flex-col items-center justify-center"
      >
        <Compass className="w-7 h-7 text-[#B6E68A]" />
        <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#8DB4B8]">404</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute top-12 right-4 w-28 h-20 rounded-2xl bg-gradient-to-br from-[#B6E68A] to-[#3F7358] shadow-[0_18px_40px_-12px_rgba(63,115,88,0.45)] flex items-center justify-center"
      >
        <Sparkles className="w-7 h-7 text-white" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.1 }}
        className="absolute bottom-6 right-10 w-20 h-20 rounded-2xl bg-white dark:bg-[#101615] border border-[#D7E0DD] dark:border-[#1F2D2A] shadow-[0_10px_30px_-12px_rgba(15,40,33,0.25)] flex items-center justify-center"
      >
        <LifeBuoy className="w-7 h-7 text-[#0A3D4A] dark:text-[#8DB4B8]" />
      </motion.div>

      {/* Central monogram */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          className="relative w-40 h-40 rounded-full bg-white dark:bg-[#101615] border border-[#D7E0DD] dark:border-[#1F2D2A] shadow-[0_30px_60px_-20px_rgba(15,40,33,0.35)] flex items-center justify-center"
        >
          <span className="text-5xl font-semibold bg-gradient-to-br from-[#000E2B] to-[#3F7358] dark:from-[#E8F0EE] dark:to-[#B6E68A] bg-clip-text text-transparent">
            404
          </span>
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-[#000E2B] text-white text-base flex items-center justify-center shadow-lg"
          >
            ?
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
