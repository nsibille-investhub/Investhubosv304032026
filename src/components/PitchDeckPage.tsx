import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  FolderTree,
  FileUp,
  ShieldCheck,
  Bell,
  Users,
  Eye,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  LineChart,
  Radar,
  MailCheck,
  UserCheck,
  Zap,
  Layers,
  Lock,
  Database,
  Quote,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useTranslation } from '../utils/languageContext';
import { navigateToPage } from '../utils/routing';

const BRAND = {
  blueSolid: '#000E2B',
  blueFinance: '#0A3D4A',
  greenGray: '#456B6C',
  blueLight: '#8DB4B8',
  greenGrowth: '#25563F',
  greenForest: '#3F7358',
  greenLight: '#B6E68A',
  paper: '#D9D8CB',
  beige: '#B4AEA4',
};

type FlowStage = {
  key: string;
  icon: typeof FolderTree;
  color: string;
};

const FLOW_STAGES: FlowStage[] = [
  { key: 'sources', icon: Database, color: BRAND.blueFinance },
  { key: 'organize', icon: FolderTree, color: BRAND.greenGray },
  { key: 'validation', icon: ShieldCheck, color: BRAND.blueSolid },
  { key: 'notifications', icon: Bell, color: BRAND.greenForest },
  { key: 'portals', icon: Users, color: BRAND.greenGrowth },
  { key: 'birdview', icon: Radar, color: BRAND.greenLight },
];

const PILLAR_ICONS = [Layers, Target, Lock, Zap, LineChart, MailCheck];

export function PitchDeckPage({ onBack }: { onBack?: () => void }) {
  const { t } = useTranslation();

  const pillars = [0, 1, 2, 3, 4, 5].map((i) => ({
    title: t(`ged.pitchDeck.pillars.${i}.title`),
    body: t(`ged.pitchDeck.pillars.${i}.body`),
    Icon: PILLAR_ICONS[i],
  }));

  const kpis = [
    { value: '80%', label: t('ged.pitchDeck.kpis.engagement'), Icon: TrendingUp, color: BRAND.greenGrowth },
    { value: '+10×', label: t('ged.pitchDeck.kpis.massUpload'), Icon: FileUp, color: BRAND.blueFinance },
    { value: '100%', label: t('ged.pitchDeck.kpis.audit'), Icon: ShieldCheck, color: BRAND.blueSolid },
    { value: '24/7', label: t('ged.pitchDeck.kpis.availability'), Icon: Eye, color: BRAND.greenForest },
  ];

  const compareLeft = [0, 1, 2].map((i) => t(`ged.pitchDeck.compare.classic.${i}`));
  const compareRight = [0, 1, 2, 3, 4, 5].map((i) => t(`ged.pitchDeck.compare.gedPlus.${i}`));

  const useCases = [0, 1].map((i) => ({
    title: t(`ged.pitchDeck.useCases.${i}.title`),
    steps: [0, 1, 2, 3].map((j) => t(`ged.pitchDeck.useCases.${i}.steps.${j}`)),
    icon: i === 0 ? UserCheck : Sparkles,
  }));

  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F6F1]">
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(120deg, ${BRAND.blueSolid} 0%, ${BRAND.blueFinance} 60%, ${BRAND.greenGray} 100%)`,
        }}
      >
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div
            className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full blur-3xl"
            style={{ background: BRAND.greenLight }}
          />
          <div
            className="absolute -bottom-40 -left-20 h-[460px] w-[460px] rounded-full blur-3xl"
            style={{ background: BRAND.blueLight }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-6 pb-16">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-8 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('ged.pitchDeck.backToSpaces')}
            </button>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl"
          >
            <Badge
              className="mb-6 border-white/30 bg-white/10 text-white backdrop-blur-sm"
              variant="outline"
            >
              <Sparkles className="mr-1.5 h-3 w-3" />
              {t('ged.pitchDeck.hero.badge')}
            </Badge>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl">
              {t('ged.pitchDeck.hero.title')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              {t('ged.pitchDeck.hero.subtitle')}
            </p>

            <div
              className="mt-10 inline-flex items-start gap-3 rounded-2xl px-5 py-4 backdrop-blur-sm"
              style={{ background: 'rgba(182, 230, 138, 0.15)', borderLeft: `3px solid ${BRAND.greenLight}` }}
            >
              <Quote className="mt-0.5 h-5 w-5 shrink-0" style={{ color: BRAND.greenLight }} />
              <p className="text-lg italic text-white">
                « {t('ged.pitchDeck.hero.quote')} »
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND.greenGrowth }}>
              {t('ged.pitchDeck.vision.kicker')}
            </p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ color: BRAND.blueSolid }}>
              {t('ged.pitchDeck.vision.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-gray-700">
              {t('ged.pitchDeck.vision.body')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl p-8 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${BRAND.greenLight} 0%, ${BRAND.paper} 100%)` }}
          >
            <p className="text-xl font-semibold leading-relaxed" style={{ color: BRAND.blueSolid }}>
              {t('ged.pitchDeck.vision.callout')}
            </p>
            <ul className="mt-6 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: BRAND.blueFinance }}>
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" style={{ color: BRAND.greenGrowth }} />
                  <span>{t(`ged.pitchDeck.vision.bullets.${i}`)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Flow */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND.greenGrowth }}>
              {t('ged.pitchDeck.flow.kicker')}
            </p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ color: BRAND.blueSolid }}>
              {t('ged.pitchDeck.flow.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-600">
              {t('ged.pitchDeck.flow.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-2">
            {FLOW_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="relative"
                >
                  <div
                    className="flex h-full flex-col items-center rounded-2xl p-5 text-center transition-transform hover:-translate-y-1"
                    style={{
                      background: `linear-gradient(160deg, ${stage.color} 0%, ${BRAND.blueSolid} 140%)`,
                    }}
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">
                      {t('ged.pitchDeck.flow.step', { n: idx + 1 })}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {t(`ged.pitchDeck.flow.stages.${stage.key}.title`)}
                    </p>
                    <p className="mt-2 text-xs leading-snug text-white/80">
                      {t(`ged.pitchDeck.flow.stages.${stage.key}.body`)}
                    </p>
                  </div>
                  {idx < FLOW_STAGES.length - 1 && (
                    <div className="pointer-events-none absolute -right-2 top-1/2 hidden -translate-y-1/2 md:block">
                      <ArrowRight className="h-4 w-4" style={{ color: BRAND.greenGray }} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND.greenGrowth }}>
            {t('ged.pitchDeck.pillars.kicker')}
          </p>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ color: BRAND.blueSolid }}>
            {t('ged.pitchDeck.pillars.title')}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.Icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-transparent hover:shadow-xl"
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: `${BRAND.greenLight}40` }}
                >
                  <Icon className="h-5 w-5" style={{ color: BRAND.greenGrowth }} />
                </div>
                <h3 className="mb-2 text-base font-semibold" style={{ color: BRAND.blueSolid }}>
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">{pillar.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* KPIs */}
      <section
        className="py-16"
        style={{ background: `linear-gradient(135deg, ${BRAND.blueSolid} 0%, ${BRAND.greenGrowth} 100%)` }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              {t('ged.pitchDeck.kpis.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/70">
              {t('ged.pitchDeck.kpis.subtitle')}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.Icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <Icon className="mb-4 h-6 w-6" style={{ color: BRAND.greenLight }} />
                  <p className="text-4xl font-bold text-white">{kpi.value}</p>
                  <p className="mt-2 text-sm leading-snug text-white/80">{kpi.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compare GED classique vs GED+ */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND.greenGrowth }}>
            {t('ged.pitchDeck.compare.kicker')}
          </p>
          <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ color: BRAND.blueSolid }}>
            {t('ged.pitchDeck.compare.title')}
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-7">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              {t('ged.pitchDeck.compare.classicLabel')}
            </p>
            <h3 className="text-xl font-semibold text-gray-900">
              {t('ged.pitchDeck.compare.classicTitle')}
            </h3>
            <ul className="mt-5 space-y-3">
              {compareLeft.map((line, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="relative overflow-hidden rounded-2xl p-7 text-white"
            style={{
              background: `linear-gradient(135deg, ${BRAND.greenGrowth} 0%, ${BRAND.blueFinance} 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: BRAND.greenLight, opacity: 0.3 }}
              aria-hidden
            />
            <p className="relative mb-4 inline-flex items-center gap-2 text-sm font-medium" style={{ color: BRAND.greenLight }}>
              <Sparkles className="h-3.5 w-3.5" />
              {t('ged.pitchDeck.compare.gedPlusLabel')}
            </p>
            <h3 className="relative text-xl font-semibold">
              {t('ged.pitchDeck.compare.gedPlusTitle')}
            </h3>
            <ul className="relative mt-5 space-y-3">
              {compareRight.map((line, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-white/90">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND.greenLight }} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest" style={{ color: BRAND.greenGrowth }}>
              {t('ged.pitchDeck.useCases.kicker')}
            </p>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ color: BRAND.blueSolid }}>
              {t('ged.pitchDeck.useCases.title')}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {useCases.map((uc, idx) => {
              const Icon = uc.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.06 }}
                  className="rounded-2xl border border-gray-100 p-7 shadow-sm"
                  style={{ background: BRAND.paper + '60' }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: BRAND.blueSolid }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: BRAND.blueSolid }}>
                      {uc.title}
                    </h3>
                  </div>
                  <ol className="space-y-2">
                    {uc.steps.map((step, sidx) => (
                      <li key={sidx} className="flex items-start gap-3 text-sm text-gray-700">
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: BRAND.greenForest }}
                        >
                          {sidx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl px-8 py-14 text-center"
          style={{
            background: `linear-gradient(135deg, ${BRAND.blueSolid} 0%, ${BRAND.blueFinance} 100%)`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 80% 20%, ${BRAND.greenLight}, transparent 50%), radial-gradient(circle at 20% 80%, ${BRAND.blueLight}, transparent 50%)`,
            }}
            aria-hidden
          />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl">
              {t('ged.pitchDeck.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              {t('ged.pitchDeck.cta.subtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => navigateToPage('documents')}
                className="gap-2"
                style={{ background: BRAND.greenLight, color: BRAND.blueSolid }}
              >
                <FolderTree className="h-4 w-4" />
                {t('ged.pitchDeck.cta.primary')}
              </Button>
              <Button
                onClick={() => navigateToPage('birdview')}
                variant="outline"
                className="gap-2 border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Radar className="h-4 w-4" />
                {t('ged.pitchDeck.cta.secondary')}
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
