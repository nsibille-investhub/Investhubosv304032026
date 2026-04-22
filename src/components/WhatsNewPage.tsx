import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Calendar, Mail, Rocket } from 'lucide-react';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { PageHeader } from './ui/page-header';
import { useTranslation } from '../utils/languageContext';
import { useWhatsNewUnread } from '../utils/useWhatsNewUnread';
import {
  changelog,
  newsletters,
  type ChangelogEntryType,
  type Newsletter,
} from '../data/whatsNew';

function formatDate(iso: string, locale: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const CHANGELOG_BADGE: Record<ChangelogEntryType, { label: string; className: string }> = {
  added: { label: 'Added', className: 'bg-[#DCFDBC] text-[#0F323D] border-transparent' },
  changed: { label: 'Changed', className: 'bg-[#DBEAFE] text-[#1E3A8A] border-transparent' },
  fixed: { label: 'Fixed', className: 'bg-[#FEF3C7] text-[#78350F] border-transparent' },
  removed: { label: 'Removed', className: 'bg-[#FEE2E2] text-[#7F1D1D] border-transparent' },
};

interface WhatsNewPageProps {
  initialTab?: 'newsletters' | 'changelog';
}

export function WhatsNewPage({ initialTab = 'newsletters' }: WhatsNewPageProps) {
  const { t, lang } = useTranslation();
  const { markAsSeen } = useWhatsNewUnread();
  const [selected, setSelected] = useState<Newsletter | null>(null);
  const [tab, setTab] = useState<'newsletters' | 'changelog'>(initialTab);

  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';

  // Mark content as seen as soon as the page is opened.
  useEffect(() => {
    markAsSeen();
  }, [markAsSeen]);

  const sortedNewsletters = useMemo(
    () => [...newsletters].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );
  const sortedChangelog = useMemo(
    () => [...changelog].sort((a, b) => b.date.localeCompare(a.date)),
    []
  );

  return (
    <div className="flex-1">
      <PageHeader
        breadcrumb={[
          { label: t('breadcrumb.investhubOs') },
          { label: t('breadcrumb.whatsNew') },
        ]}
        title={t('whatsNew.title')}
        subtitle={t('whatsNew.subtitle')}
      />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="max-w-[1100px] mx-auto px-6 pt-6 pb-6"
      >
        {/* Tabs */}
        {!selected && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'newsletters' | 'changelog')}>
            <TabsList className="mb-4">
              <TabsTrigger value="newsletters" className="gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {t('whatsNew.tabs.newsletters')}
              </TabsTrigger>
              <TabsTrigger value="changelog" className="gap-1.5">
                <Rocket className="w-3.5 h-3.5" />
                {t('whatsNew.tabs.changelog')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="newsletters">
              {sortedNewsletters.length === 0 ? (
                <EmptyState message={t('whatsNew.emptyNewsletters')} />
              ) : (
                <div className="grid gap-3">
                  {sortedNewsletters.map((n) => (
                    <motion.button
                      key={n.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => setSelected(n)}
                      className="text-left"
                    >
                      <Card className="p-5 hover:border-[#0066FF]/40 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{formatDate(n.date, locale)}</span>
                            </div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                              {n.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {n.excerpt}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {t('whatsNew.read')}
                          </Badge>
                        </div>
                      </Card>
                    </motion.button>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="changelog">
              {sortedChangelog.length === 0 ? (
                <EmptyState message={t('whatsNew.emptyChangelog')} />
              ) : (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800" />
                  <div className="space-y-6">
                    {sortedChangelog.map((r) => (
                      <div key={r.version} className="relative pl-8">
                        <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full bg-white dark:bg-black border-2 border-[#0066FF]" />
                        <div className="flex items-baseline gap-3 flex-wrap">
                          <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                            v{r.version}
                          </span>
                          {r.title && (
                            <span className="text-sm text-gray-700 dark:text-gray-300">{r.title}</span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(r.date, locale)}
                          </span>
                        </div>
                        <ul className="mt-2 space-y-1.5">
                          {r.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Badge
                                className={`${CHANGELOG_BADGE[item.type].className} text-[10px] uppercase tracking-wide h-5 shrink-0`}
                              >
                                {CHANGELOG_BADGE[item.type].label}
                              </Badge>
                              <span
                                className="flex-1 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: item.text }}
                              />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Newsletter detail view */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected(null)}
              className="mb-4 -ml-2 text-gray-600 dark:text-gray-400"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              {t('whatsNew.backToList')}
            </Button>
            <Card className="p-8">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(selected.date, locale)}</span>
              </div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-6">
                {selected.title}
              </h2>
              {/* Newsletters provided as a full HTML email document render in an
                  isolated iframe so their own <style> blocks don't leak. Inline
                  `html` snippets render through `.newsletter-content`, which
                  resets a few defaults without affecting the rest of the app. */}
              {selected.htmlUrl ? (
                <NewsletterFrame src={selected.htmlUrl} title={selected.title} />
              ) : selected.html ? (
                <div
                  className="newsletter-content"
                  dangerouslySetInnerHTML={{ __html: selected.html }}
                />
              ) : null}
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
      {message}
    </div>
  );
}

function NewsletterFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState<number>(800);

  const resize = () => {
    const doc = ref.current?.contentDocument;
    if (!doc) return;
    const h = Math.max(
      doc.body?.scrollHeight ?? 0,
      doc.documentElement?.scrollHeight ?? 0,
    );
    if (h > 0) setHeight(h + 16);
  };

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let observer: ResizeObserver | null = null;
    const onLoad = () => {
      resize();
      const doc = iframe.contentDocument;
      if (doc?.body && 'ResizeObserver' in window) {
        observer = new ResizeObserver(() => resize());
        observer.observe(doc.body);
      }
    };
    iframe.addEventListener('load', onLoad);
    return () => {
      iframe.removeEventListener('load', onLoad);
      observer?.disconnect();
    };
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      sandbox="allow-same-origin allow-popups"
      className="w-full border-0 bg-transparent"
      style={{ height }}
    />
  );
}

export default WhatsNewPage;
