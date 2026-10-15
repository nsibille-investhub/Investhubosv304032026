import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Archive,
  Banknote,
  Calendar,
  CalendarRange,
  Coins,
  Copy,
  LayoutDashboard,
  Layers3,
  LineChart,
  Send,
  Settings2,
  Building2,
  CalendarClock,
  FileSignature,
  FileText,
  Handshake,
  Hash,
  IdCard,
  Landmark,
  Mail,
  Plug,
  Receipt,
  Scale,
  Tag,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency } from '../../utils/formatters';
import { FUND_STATUSES, FundStatusBadge } from '../FundStatusBadge';
import { StatusBadge } from '../StatusBadge';
import { DataTable } from '../DataTable';
import { EmptyState } from '../EmptyState';
import { BlockersPanel } from '../ui/blockers-panel';
import { Button } from '../ui/button';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '../ui/page-header';
import { RichTextEditor } from '../ui/rich-text-editor';
import { SegmentedControl } from '../ui/segmented-control';
import { SegmentedProgress } from '../ui/segmented-progress';
import { Sparkline } from '../ui/sparkline';
import { DetailTabsList } from '../ui/detail-tabs';
import { Tabs } from '../ui/tabs';
import { WidgetCard, WidgetMetric } from '../ui/widget-card';
import { ColorPicker } from '../ui/color-picker';
import { ComputedSummary } from '../ui/computed-summary';
import { DayMonthPicker, type DayMonthValue } from '../ui/day-month-picker';
import { EffectsPanel } from '../ui/effects-panel';
import { FrequencyDayField, type FrequencyDayValue } from '../ui/frequency-day-field';
import { Input } from '../ui/input';
import { PageStateBanner } from '../ui/page-state-banner';
import { SectionCard, SectionFieldRow, useSectionEditor } from '../ui/section-card';
import { SectionNav, type SectionNavItem } from '../ui/section-nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn, WIDGET_LABEL_CLASS } from '../ui/utils';

const K = 'designSystem.fundDetail';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function Code({ children }: { children: ReactNode }) {
  return <code className="rounded bg-muted px-1 py-0.5 text-xs">{children}</code>;
}

function Example({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className={WIDGET_LABEL_CLASS}>{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="rounded-xl border border-border bg-background p-4">{children}</div>
    </div>
  );
}

function DocBlock({
  id,
  name,
  importLine,
  children,
  usage,
}: {
  id: string;
  name: string;
  importLine: string;
  children: ReactNode;
  usage: string;
}) {
  const { t } = useTranslation();
  const variants = t(`${K}.${id}.variants`);
  const states = t(`${K}.${id}.states`);

  return (
    <section id={`ds-${id}`} className="rounded-2xl border border-border bg-card p-8">
      <header className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          {t(`${K}.${id}.title`)} <span className="text-muted-foreground">· {name}</span>
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {t(`${K}.${id}.description`)}
        </p>
        <p className="text-xs text-muted-foreground">
          {t(`${K}.import`)} <Code>{importLine}</Code>
        </p>
        <dl className="grid max-w-3xl gap-2 text-sm md:grid-cols-2">
          <div className="rounded-lg border border-border p-3">
            <dt className={WIDGET_LABEL_CLASS}>{t(`${K}.variantsLabel`)}</dt>
            <dd className="mt-1 text-foreground/80">{variants}</dd>
          </div>
          <div className="rounded-lg border border-border p-3">
            <dt className={WIDGET_LABEL_CLASS}>{t(`${K}.statesLabel`)}</dt>
            <dd className="mt-1 text-foreground/80">{states}</dd>
          </div>
        </dl>
      </header>
      <div className="space-y-6">
        {children}
        <Example label={t(`${K}.usageLabel`)}>
          <pre className="overflow-x-auto text-xs leading-relaxed">{usage}</pre>
        </Example>
      </div>
    </section>
  );
}

function SectionNavDemo() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState('identity');
  const d = `${K}.sectionNav.demo`;

  const items: SectionNavItem[] = [
    {
      id: 'identity',
      group: t(`${d}.groupFund`),
      title: t(`${d}.identity`),
      subtitle: t(`${d}.identitySubtitle`),
      icon: IdCard,
      iconTone: 'success',
      indicator: { kind: 'count', value: 11, total: 11, tone: 'success' },
    },
    {
      id: 'legal',
      group: t(`${d}.groupFund`),
      title: t(`${d}.legal`),
      subtitle: t(`${d}.legalSubtitle`),
      icon: Scale,
      indicator: { kind: 'count', value: 3, total: 5, tone: 'warning' },
    },
    {
      id: 'subscription',
      group: t(`${d}.groupFund`),
      title: t(`${d}.subscription`),
      subtitle: t(`${d}.subscriptionSubtitle`),
      icon: FileSignature,
      indicator: { kind: 'badge', label: t(`${d}.toComplete`), tone: 'warning' },
    },
    {
      id: 'banking',
      group: t(`${d}.groupFund`),
      title: t(`${d}.banking`),
      subtitle: t(`${d}.bankingSubtitle`),
      icon: Landmark,
      indicator: { kind: 'dot', tone: 'danger', label: t(`${d}.dotError`) },
    },
    {
      id: 'distribution',
      group: t(`${d}.groupDiffusion`),
      title: t(`${d}.distribution`),
      subtitle: t(`${d}.distributionSubtitle`),
      icon: Handshake,
      disabled: true,
      disabledReason: t(`${d}.distributionDisabled`),
    },
    {
      id: 'integrations',
      group: t(`${d}.groupDiffusion`),
      title: t(`${d}.integrations`),
      icon: Plug,
      indicator: { kind: 'none' },
    },
    {
      id: 'secondary',
      group: t(`${d}.groupDiffusion`),
      title: t(`${d}.secondary`),
      icon: TrendingUp,
      hidden: true,
    },
  ];

  return (
    <div className="max-w-sm">
      <SectionNav
        title={t(`${d}.title`)}
        items={items}
        activeId={activeId}
        onSelect={setActiveId}
        sticky={false}
      />
    </div>
  );
}

function SectionCardValidationDemo() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const d = `${K}.sectionCard.demo`;

  return (
    <SectionCard
      mode="validation"
      icon={IdCard}
      title={t(`${d}.validationTitle`)}
      iconTone={validated ? 'success' : 'info'}
      open={open}
      onOpenChange={setOpen}
      active
      summary={
        <span className="font-semibold text-foreground">
          {t('subscriptions.detail.onboarding.answeredOf', { answered: 2, total: 2 })}
        </span>
      }
      badges={
        validated ? (
          <StatusBadge label={t('subscriptions.detail.onboarding.sectionValidated')} variant="success" />
        ) : (
          <StatusBadge label={t('subscriptions.detail.onboarding.inProgress')} variant="warning" />
        )
      }
      validationBar={
        validated
          ? undefined
          : {
              label: t('subscriptions.detail.onboarding.verifyAllResponses'),
              actionLabel: t('subscriptions.detail.onboarding.validateSection'),
              loading,
              onAction: async () => {
                setLoading(true);
                await wait(900);
                setLoading(false);
                setValidated(true);
              },
            }
      }
    >
      <div className="divide-y divide-border">
        <SectionFieldRow mode="read" label={t(`${d}.firstName`)} value="Camille" />
        <SectionFieldRow mode="read" label={t(`${d}.nationality`)} value={t(`${d}.nationalityValue`)} />
      </div>
    </SectionCard>
  );
}

type IdentityDraft = {
  name: string;
  adminName: string;
  currency: string;
  color: string | null;
  performance: string;
  valuation: FrequencyDayValue | null;
};

const PERFORMANCE_OPTIONS = ['irr', 'performance', 'none'] as const;

function SectionCardEditDemo() {
  const { t } = useTranslation();
  const d = `${K}.sectionCard.demo`;

  const editor = useSectionEditor<IdentityDraft>({
    initialValues: {
      name: t(`${d}.fundName`),
      adminName: '',
      currency: 'EUR',
      color: null,
      performance: 'irr',
      valuation: { frequency: 'quarterly', day: 'last' },
    },
    // Validation simulée pour la démonstration : le serveur reste seul juge des règles de saisie.
    onSave: async draft => {
      await wait(1000);
      if (draft.name.trim() === '') return { name: t(`${d}.nameRequired`) };
    },
  });

  const { mode, values, draft, errors, setField } = editor;
  const source = mode === 'edit' ? draft : values;

  const performanceLabel = (value: string) => t(`${d}.performanceOptions.${value}`);
  const valuationLabel = (value: FrequencyDayValue | null) => {
    if (!value) return '';
    const frequency = t(`common.frequencyDayField.frequencies.${value.frequency}`);
    if (value.day === 'last') return `${frequency}, ${t('common.frequencyDayField.lastDay').toLowerCase()}`;
    return value.day ? `${frequency}, ${t('common.frequencyDayField.dayOfMonth', { day: value.day })}` : frequency;
  };

  return (
    <SectionCard
      mode={mode}
      icon={IdCard}
      title={t(`${d}.editTitle`)}
      summary={<span className="text-muted-foreground">{t(`${d}.editSummary`)}</span>}
      badges={<StatusBadge label={t(`${d}.editBadge`)} variant="info" />}
      onEdit={editor.startEdit}
      saved={editor.saved}
      editBar={editor.editBar}
    >
      <SectionFieldRow
        mode={mode}
        label={t(`${d}.fundNameLabel`)}
        htmlFor="ds-fund-name"
        required
        value={source.name}
        error={errors.name}
      >
        <Input
          id="ds-fund-name"
          value={draft.name}
          onChange={event => setField('name', event.target.value)}
          aria-invalid={Boolean(errors.name) || undefined}
          aria-describedby={errors.name ? 'ds-fund-name-error' : undefined}
          className="border-border"
          disabled={editor.saving}
        />
      </SectionFieldRow>
      <SectionFieldRow
        mode={mode}
        label={t(`${d}.adminNameLabel`)}
        htmlFor="ds-fund-admin-name"
        value={source.adminName}
      >
        <Input
          id="ds-fund-admin-name"
          value={draft.adminName}
          onChange={event => setField('adminName', event.target.value)}
          className="border-border"
          disabled={editor.saving}
        />
      </SectionFieldRow>
      <SectionFieldRow
        mode={mode}
        label={t(`${d}.currencyLabel`)}
        value={source.currency}
        lockedReason={t(`${d}.currencyLocked`)}
      />
      <SectionFieldRow
        mode={mode}
        label={t(`${d}.colorLabel`)}
        htmlFor="ds-fund-color"
        value={
          source.color && (
            <span className="inline-flex items-center gap-2 font-mono">
              <span className="h-4 w-4 rounded border border-border" style={{ backgroundColor: source.color }} />
              {source.color}
            </span>
          )
        }
      >
        <ColorPicker
          id="ds-fund-color"
          value={draft.color}
          onChange={value => setField('color', value)}
          disabled={editor.saving}
        />
      </SectionFieldRow>
      <SectionFieldRow
        mode={mode}
        label={t(`${d}.performanceLabel`)}
        htmlFor="ds-fund-performance"
        value={performanceLabel(source.performance)}
        legacySettingEffect={t(`${d}.performanceLegacy`)}
      >
        <Select
          value={draft.performance}
          onValueChange={value => setField('performance', value)}
          disabled={editor.saving}
        >
          <SelectTrigger id="ds-fund-performance" className="w-56 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERFORMANCE_OPTIONS.map(option => (
              <SelectItem key={option} value={option}>
                {performanceLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SectionFieldRow>
      <SectionFieldRow
        mode={mode}
        label={t(`${d}.valuationLabel`)}
        value={valuationLabel(source.valuation)}
      >
        <FrequencyDayField
          idPrefix="ds-fund-valuation"
          value={draft.valuation}
          onChange={value => setField('valuation', value)}
          disabled={editor.saving}
        />
      </SectionFieldRow>
    </SectionCard>
  );
}

function SectionCardLockedDemo() {
  const { t } = useTranslation();
  const d = `${K}.sectionCard.demo`;
  return (
    <SectionCard
      mode="read"
      icon={Banknote}
      title={t(`${d}.mirrorTitle`)}
      summary={<span className="text-muted-foreground">{t(`${d}.mirrorSummary`)}</span>}
      onEdit={() => undefined}
      editDisabledReason={t(`${d}.editDisabled`)}
    >
      <SectionFieldRow
        mode="read"
        label={t(`${d}.entryFeeLabel`)}
        value="2 %"
        lockedReason={t(`${d}.fromMaster`)}
      />
      <SectionFieldRow mode="read" label={t(`${d}.minimumLabel`)} value="10 000 €" />
      <SectionFieldRow mode="read" label={t(`${d}.decimalsLabel`)} value={null} />
    </SectionCard>
  );
}

function PageStateBannerDemo() {
  const { t } = useTranslation();
  const d = `${K}.pageStateBanner.demo`;
  const [archived, setArchived] = useState(true);
  const [unarchiving, setUnarchiving] = useState(false);

  return (
    <div className="space-y-3">
      {archived ? (
        <PageStateBanner
          variant="archived"
          date="02/09/2026"
          author="Julien"
          unarchiving={unarchiving}
          onUnarchive={async () => {
            setUnarchiving(true);
            await wait(1000);
            setUnarchiving(false);
            setArchived(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
          onClick={() => setArchived(true)}
        >
          {t(`${d}.reset`)}
        </button>
      )}
      <PageStateBanner
        variant="archived"
        date="02/09/2026"
        author="Julien"
        onUnarchive={() => undefined}
        unarchiveDisabledReason={t(`${d}.noRight`)}
      />
      <PageStateBanner variant="locked" date="15/09/2026" reason={t(`${d}.lockReason`)} />
      <PageStateBanner variant="mirror" masterName={t(`${d}.masterName`)} onOpenMaster={() => undefined} />
      <PageStateBanner
        variant="sendingNotices"
        blockedActions={[t(`${d}.blockedDelete`), t(`${d}.blockedNav`), t(`${d}.blockedArchive`)]}
      />
      <PageStateBanner variant="readOnly" />
    </div>
  );
}

function EffectsPanelDemo() {
  const { t } = useTranslation();
  const [confirm, setConfirm] = useState(true);
  const d = `${K}.effectsPanel.demo`;
  return (
    <EffectsPanel
      description={t(`${d}.description`)}
      effects={[
        {
          id: 'redemptions',
          icon: Receipt,
          label: t(`${d}.redemptions`),
          reversible: false,
          objects: [
            { id: 'r1', label: t(`${d}.redemptionItem`, { ref: 'R-0112', name: 'Camille' }) },
            { id: 'r2', label: t(`${d}.redemptionItem`, { ref: 'R-0115', name: 'Hugo' }) },
            { id: 'r3', label: t(`${d}.redemptionItem`, { ref: 'R-0119', name: 'Léa' }) },
          ],
        },
        {
          id: 'subscriptions',
          icon: FileSignature,
          label: t(`${d}.subscriptions`),
          reversible: true,
          objects: [
            { id: 's1', label: t(`${d}.subscriptionItem`, { ref: 'S-2041', name: 'Inès' }) },
            { id: 's2', label: t(`${d}.subscriptionItem`, { ref: 'S-2043', name: 'Paul' }) },
          ],
        },
        {
          id: 'emails',
          icon: Mail,
          label: t(`${d}.emails`),
          reversible: false,
          count: 2,
          note: confirm ? t('funds.detail.navs.effects.emails', { count: 2 }) : t('funds.detail.navs.effects.noEmails'),
          option: { checked: confirm, onCheckedChange: setConfirm },
        },
        { id: 'nominal', icon: Tag, label: t(`${d}.nominal`), reversible: true },
      ]}
    />
  );
}

function BlockersPanelDemo() {
  const { t } = useTranslation();
  const d = `${K}.blockersPanel.demo`;
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-3">
      <BlockersPanel
        title={t(`${d}.title`)}
        blockers={[
          { id: 'subscriptions', icon: FileSignature, label: t(`${d}.subscriptions`), count: 12, onOpen: () => undefined },
          { id: 'operations', icon: Receipt, label: t(`${d}.operations`), count: 3, onOpen: () => undefined },
          { id: 'navs', icon: TrendingUp, label: t(`${d}.navs`), count: 24, onOpen: () => undefined },
          { id: 'contracts', icon: FileText, label: t(`${d}.contracts`), count: 1, onOpen: () => undefined },
        ]}
        alternative={{
          label: t(`${d}.archive`),
          description: t(`${d}.archiveDescription`),
          loading,
          onAction: async () => {
            setLoading(true);
            await wait(1000);
            setLoading(false);
            setDone(true);
          },
        }}
      />
      {done && <StatusBadge label={t(`${d}.archived`)} variant="strong" />}
    </div>
  );
}

function InputsDemo() {
  const { t } = useTranslation();
  const d = `${K}.inputs.demo`;
  const [color, setColor] = useState<string | null>(null);
  const [from, setFrom] = useState<DayMonthValue | null>({ day: 1, month: 6 });
  const [to, setTo] = useState<DayMonthValue | null>({ day: 30, month: 6 });
  const [frequency, setFrequency] = useState<FrequencyDayValue | null>({ frequency: 'monthly', day: 'last' });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-2">
        <label htmlFor="ds-color" className="text-sm font-medium text-foreground">
          {t(`${d}.color`)}
        </label>
        <ColorPicker id="ds-color" value={color} onChange={setColor} />
        <ColorPicker value="#0b3c49" onChange={() => undefined} disabled />
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{t(`${d}.liquidity`)}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-6">{t(`${d}.from`)}</span>
          <DayMonthPicker idPrefix="ds-liquidity-from" value={from} onChange={setFrom} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-6">{t(`${d}.to`)}</span>
          <DayMonthPicker idPrefix="ds-liquidity-to" value={to} onChange={setTo} />
        </div>
        <span className="block pt-2 text-xs text-muted-foreground">{t(`${d}.errorState`)}</span>
        <DayMonthPicker idPrefix="ds-liquidity-error" value={{ day: 15, month: 3 }} onChange={() => undefined} invalid />
        <p className="text-xs text-destructive">{t(`${d}.liquidityError`)}</p>
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">{t(`${d}.frequency`)}</span>
        <FrequencyDayField idPrefix="ds-frequency" value={frequency} onChange={setFrequency} />
        <FrequencyDayField idPrefix="ds-frequency-annual" value={{ frequency: 'annual', day: 31, month: 12 }} onChange={() => undefined} disabled />
      </div>
    </div>
  );
}

function WidgetsDemo() {
  const { t } = useTranslation();
  const d = `${K}.widgetCard.demo`;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <WidgetCard
        icon={Wallet}
        title={t(`${d}.title`)}
        subtitle={t(`${d}.subtitle`)}
        action={<StatusBadge label={t(`${d}.badge`)} variant="info" />}
        footer={<span className="text-xs font-medium text-primary">{t(`${d}.footer`)}</span>}
      >
        <div className="grid grid-cols-2 gap-3">
          <WidgetMetric size="lg" label={t(`${d}.called`)} value="4 200 000 €" secondary={t(`${d}.calledSecondary`)} />
          <WidgetMetric label={t(`${d}.remaining`)} value="2 800 000 €" />
        </div>
      </WidgetCard>
      <WidgetCard title={t(`${K}.segmentedProgress.demo.title`)} subtitle={t(`${K}.segmentedProgress.demo.subtitle`)}>
        <div className="space-y-3">
          <SegmentedProgress
            total={10}
            segments={[
              { id: 'pending', value: 1, tone: 'neutral' },
              { id: 'awaiting', value: 4, tone: 'warning' },
              { id: 'correction', value: 1, tone: 'danger' },
              { id: 'validated', value: 4, tone: 'success' },
            ]}
          />
          <SegmentedProgress
            total={5}
            segments={[
              { id: 'done', value: 3, tone: 'success' },
              { id: 'missing', value: 2, tone: 'danger' },
            ]}
          />
          <SegmentedProgress total={100} segments={[{ id: 'called', value: 60, tone: 'info' }]} />
        </div>
      </WidgetCard>
    </div>
  );
}

function DetailTabsDemo() {
  const { t } = useTranslation();
  const [tab, setTab] = useState('overview');
  return (
    <Tabs value={tab} onValueChange={setTab} className="gap-0">
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="px-8 bg-card border-b border-border">
          <DetailTabsList
            items={[
              { value: 'overview', icon: LayoutDashboard, label: t('funds.detail.tabs.overview') },
              { value: 'settings', icon: Settings2, label: t('funds.detail.tabs.settings') },
              { value: 'shares', icon: Layers3, label: t('funds.detail.tabs.shares'), badge: 3 },
              { value: 'navs', icon: LineChart, label: t('funds.detail.tabs.navs'), badge: 6 },
            ]}
          />
        </div>
      </div>
    </Tabs>
  );
}

function PageHeaderDemo() {
  const { t } = useTranslation();
  const d = `${K}.pageHeader.demo`;
  const [loading, setLoading] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <PageHeader
        hideBackButton
        title={
          <span className="inline-flex items-center gap-3">
            {t(`${d}.name`)}
            <FundStatusBadge status="draft" />
          </span>
        }
        subtitle={
          <PageHeaderSubtitle>
            <PageHeaderSubtitleItem icon={Hash}>{t(`${d}.id`)}</PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Landmark}>{t(`${d}.structure`)}</PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Coins}>{t(`${d}.currency`)}</PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={CalendarRange}>{t(`${d}.collection`)}</PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Calendar}>{t(`${d}.created`)}</PageHeaderSubtitleItem>
          </PageHeaderSubtitle>
        }
        primaryAction={{
          label: t('funds.detail.actions.publish'),
          icon: <Send className="w-4 h-4" />,
          disabledReason: t(`${d}.publishReason`),
        }}
        extraActions={[
          {
            label: t('funds.detail.actions.duplicate'),
            icon: <Copy className="w-4 h-4" />,
            loading,
            onClick: async () => {
              setLoading(true);
              await wait(1000);
              setLoading(false);
            },
          },
          { label: t('funds.detail.actions.archive'), icon: <Archive className="w-4 h-4" /> },
        ]}
        tertiaryLabel={t('funds.detail.actions.more')}
        tertiaryActions={[
          { label: t('funds.detail.actions.journal') },
          {
            label: t('funds.detail.actions.delete'),
            destructive: true,
            separatorBefore: true,
            disabledReason: t('funds.detail.reasons.noDeleteRight'),
          },
        ]}
      />
    </div>
  );
}

function ConfirmDialogDemo() {
  const { t } = useTranslation();
  const d = `${K}.confirmDialog.demo`;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Archive className="w-4 h-4" />
        {t('funds.detail.actions.archive')}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t(`${d}.title`)}
        description={t(`${d}.description`)}
        confirmLabel={t('funds.detail.actions.archive')}
        loading={loading}
        onConfirm={async () => {
          setLoading(true);
          await wait(1000);
          setLoading(false);
          setOpen(false);
        }}
      />
    </>
  );
}

function RichTextDemo() {
  const { t } = useTranslation();
  const [language, setLanguage] = useState('fr');
  const [content, setContent] = useState<Record<string, string>>({
    fr: '<p>Un fonds qui accompagne des <strong>entreprises de croissance</strong>.</p><ul><li>Équipe dédiée</li><li>Reporting trimestriel</li></ul>',
    en: '',
  });
  const names = new Intl.DisplayNames(['fr'], { type: 'language' });
  return (
    <div className="max-w-2xl space-y-2">
      <SegmentedControl
        size="sm"
        value={language}
        onValueChange={setLanguage}
        options={['fr', 'en'].map(code => {
          const label = names.of(code) ?? code;
          return { value: code, label: label.charAt(0).toUpperCase() + label.slice(1) };
        })}
      />
      <RichTextEditor
        key={language}
        ariaLabel={t('funds.detail.settings.fields.description')}
        value={content[language]}
        onChange={html => setContent(prev => ({ ...prev, [language]: html }))}
      />
    </div>
  );
}

function DataTableDemo() {
  const { t, lang } = useTranslation();
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const format = new Intl.NumberFormat(lang, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const base = [
    { id: 1, name: 'A', management: 2.05, entry: 1.5 },
    { id: 2, name: 'B', management: 1.8, entry: 3 },
  ];
  const rows = sort
    ? [...base].sort((a, b) => {
        const key = sort.key as 'management' | 'entry';
        return sort.direction === 'asc' ? a[key] - b[key] : b[key] - a[key];
      })
    : base;
  return (
    <div className="max-w-2xl overflow-hidden rounded-xl border border-border bg-card">
      <DataTable
        data={rows}
        columns={[
          { key: 'name', label: t('funds.detail.shares.columns.name'), render: row => t('funds.detail.sharePrefix', { name: row.name }) },
          { key: 'management', label: t('funds.detail.shares.columns.managementFee'), sortable: true, align: 'right', render: row => format.format(row.management / 100) },
          { key: 'entry', label: t('funds.detail.shares.columns.entryFee'), sortable: true, align: 'right', render: row => format.format(row.entry / 100) },
        ]}
        hoveredRow={hovered}
        setHoveredRow={setHovered}
        onRowClick={() => undefined}
        sortConfig={sort}
        onSort={key => setSort(prev => (prev?.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' }))}
        compactMode
        hideSelection
      />
    </div>
  );
}

/** Composants du détail d'un fonds V3, documentés avec variantes, états et exemple. */
export function FundDetailComponentsSection() {
  const { t } = useTranslation();

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-6">
        <p className={cn('mb-2', WIDGET_LABEL_CLASS)}>{t(`${K}.eyebrow`)}</p>
        <h2 className="text-2xl font-semibold text-foreground">{t(`${K}.title`)}</h2>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">{t(`${K}.intro`)}</p>
      </section>

      <DocBlock
        id="sectionNav"
        name="SectionNav"
        importLine="import { SectionNav } from '@/components/ui/section-nav'"
        usage={`<SectionNav
  title={t('...')}
  activeId={activeId}
  onSelect={setActiveId}
  items={[
    { id: 'identity', title, subtitle, icon: IdCard, iconTone: 'success', group,
      indicator: { kind: 'count', value: 11, total: 11, tone: 'success' } },
    { id: 'subscription', title, icon: FileSignature,
      indicator: { kind: 'badge', label: t('...'), tone: 'warning' } },
    { id: 'banking', title, icon: Landmark, indicator: { kind: 'dot', tone: 'danger', label } },
    { id: 'distribution', title, icon: Handshake, disabled: true, disabledReason: t('...') },
    { id: 'secondary', title, icon: TrendingUp, hidden: true },
  ]}
/>`}
      >
        <Example label={t(`${K}.sectionNav.exampleLabel`)} hint={t(`${K}.sectionNav.exampleHint`)}>
          <SectionNavDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="sectionCard"
        name="SectionCard, SectionFieldRow, useSectionEditor"
        importLine="import { SectionCard, SectionFieldRow, useSectionEditor } from '@/components/ui/section-card'"
        usage={`const editor = useSectionEditor({ initialValues, onSave: draft => api.save(draft) });
// onSave renvoie les erreurs par champ du serveur, ou rien en cas de succès.

<SectionCard
  mode={editor.mode}                 // 'validation' | 'read' | 'edit'
  icon={IdCard} title={t('...')} summary={...} badges={...}
  onEdit={editor.startEdit} editDisabledReason={reason}
  saved={editor.saved} editBar={editor.editBar}
>
  <SectionFieldRow mode={editor.mode} label={t('...')} value={values.name}
    htmlFor="name" error={editor.errors.name}>
    <Input id="name" value={editor.draft.name} onChange={...} />
  </SectionFieldRow>
  <SectionFieldRow mode={editor.mode} label={t('...')} value="EUR" lockedReason={t('...')} />
  <SectionFieldRow mode={editor.mode} label={t('...')} value={...} legacySettingEffect={t('...')}>...</SectionFieldRow>
</SectionCard>`}
      >
        <Example label={t(`${K}.sectionCard.validationLabel`)} hint={t(`${K}.sectionCard.validationHint`)}>
          <SectionCardValidationDemo />
        </Example>
        <Example label={t(`${K}.sectionCard.editLabel`)} hint={t(`${K}.sectionCard.editHint`)}>
          <SectionCardEditDemo />
        </Example>
        <Example label={t(`${K}.sectionCard.lockedLabel`)} hint={t(`${K}.sectionCard.lockedHint`)}>
          <SectionCardLockedDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="fundStatusBadge"
        name="FundStatusBadge"
        importLine="import { FundStatusBadge } from '@/components/FundStatusBadge'"
        usage={`<FundStatusBadge status={fund.status} />   // statut calculé par le serveur
// 'draft' | 'upcoming' | 'collecting' | 'collectionEnded' | 'closed' | 'archived'`}
      >
        <Example label={t(`${K}.fundStatusBadge.exampleLabel`)}>
          <div className="flex flex-wrap gap-2">
            {FUND_STATUSES.map(status => (
              <FundStatusBadge key={status} status={status} />
            ))}
          </div>
        </Example>
      </DocBlock>

      <DocBlock
        id="pageStateBanner"
        name="PageStateBanner"
        importLine="import { PageStateBanner } from '@/components/ui/page-state-banner'"
        usage={`<PageStateBanner variant="archived" date={date} author="Julien"
  onUnarchive={unarchive} unarchiving={pending} unarchiveDisabledReason={reason} />
<PageStateBanner variant="locked" date={date} reason={reason} />
<PageStateBanner variant="mirror" masterName={name} onOpenMaster={open} />
<PageStateBanner variant="sendingNotices" blockedActions={[...]} />
<PageStateBanner variant="readOnly" />`}
      >
        <Example label={t(`${K}.pageStateBanner.exampleLabel`)} hint={t(`${K}.pageStateBanner.exampleHint`)}>
          <PageStateBannerDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="effectsPanel"
        name="EffectsPanel"
        importLine="import { EffectsPanel } from '@/components/ui/effects-panel'"
        usage={`<EffectsPanel effects={[
  { id, icon: Receipt, label, reversible: false, objects: [{ id, label }] },
  { id, icon: Mail, label, reversible: false, count: 2 },
]} />`}
      >
        <Example label={t(`${K}.effectsPanel.exampleLabel`)} hint={t(`${K}.effectsPanel.exampleHint`)}>
          <div className="max-w-2xl">
            <EffectsPanelDemo />
          </div>
        </Example>
      </DocBlock>

      <DocBlock
        id="blockersPanel"
        name="BlockersPanel"
        importLine="import { BlockersPanel } from '@/components/ui/blockers-panel'"
        usage={`<BlockersPanel
  title={t('...')}
  blockers={[{ id, icon: FileSignature, label, count: 12, onOpen }]}
  alternative={{ label: t('...'), onAction: archive, loading }}
/>`}
      >
        <Example label={t(`${K}.blockersPanel.exampleLabel`)}>
          <div className="max-w-2xl">
            <BlockersPanelDemo />
          </div>
        </Example>
      </DocBlock>

      <DocBlock
        id="computedSummary"
        name="ComputedSummary"
        importLine="import { ComputedSummary } from '@/components/ui/computed-summary'"
        usage={`<ComputedSummary label={t('...')} footnote={t('...')}>
  {sentenceFromServer}
</ComputedSummary>`}
      >
        <Example label={t(`${K}.computedSummary.exampleLabel`)}>
          <div className="max-w-2xl space-y-3">
            <ComputedSummary
              icon={Users}
              label={t(`${K}.computedSummary.demo.label`)}
              footnote={t(`${K}.computedSummary.demo.footnote`)}
            >
              {t(`${K}.computedSummary.demo.sentence`)}
            </ComputedSummary>
            <ComputedSummary icon={Building2}>{t(`${K}.computedSummary.demo.closed`)}</ComputedSummary>
          </div>
        </Example>
      </DocBlock>

      <DocBlock
        id="inputs"
        name="ColorPicker, DayMonthPicker, FrequencyDayField"
        importLine="import { ColorPicker } from '@/components/ui/color-picker'"
        usage={`<ColorPicker id="color" value={color} onChange={setColor} />
<DayMonthPicker idPrefix="liquidity-from" value={{ day: 1, month: 6 }} onChange={setFrom} />
<FrequencyDayField idPrefix="valuation" value={{ frequency: 'monthly', day: 'last' }} onChange={setValue} />`}
      >
        <Example label={t(`${K}.inputs.exampleLabel`)} hint={t(`${K}.inputs.exampleHint`)}>
          <InputsDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="pageHeader"
        name="PageHeader"
        importLine="import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '@/components/ui/page-header'"
        usage={`<PageHeader
  title={<>{name}<StatusBadge /></>}
  subtitle={
    <PageHeaderSubtitle>
      <PageHeaderSubtitleItem icon={Hash}>{t('...')}</PageHeaderSubtitleItem>
      <PageHeaderSubtitleSeparator />
      <DetailLink icon={Landmark} className="text-sm">...</DetailLink>
    </PageHeaderSubtitle>
  }
  primaryAction={{ label, icon, onClick, loading, disabledReason }}
  extraActions={[{ label, icon, onClick, loading, disabledReason }]}
  tertiaryLabel={t('...')}                 // menu "Plus" libellé ; sans libellé : icône
  tertiaryActions={[{ label, destructive, disabledReason }]}
/>`}
      >
        <Example label={t(`${K}.pageHeader.exampleLabel`)} hint={t(`${K}.pageHeader.exampleHint`)}>
          <PageHeaderDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="detailTabs"
        name="Tabs, DetailTabsList, TabCount"
        importLine="import { DetailTabsList, TabCount } from '@/components/ui/detail-tabs'"
        usage={`<Tabs value={tab} onValueChange={setTab}>
  <div className="px-8 bg-card border-b border-border">
    <DetailTabsList
      overflow="scroll"                    // "truncate" par défaut
      items={[{ value: 'shares', icon: Layers3, label: t('...'), badge: 3 }]}
    />
  </div>
  <TabsContent value="shares">...</TabsContent>
</Tabs>`}
      >
        <Example label={t(`${K}.detailTabs.exampleLabel`)}>
          <DetailTabsDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="widgetCard"
        name="WidgetCard, WidgetMetric, SegmentedProgress"
        importLine="import { WidgetCard, WidgetMetric } from '@/components/ui/widget-card'"
        usage={`<WidgetCard icon={Wallet} title={t('...')} subtitle={...} action={<StatusBadge ... />} footer={...}>
  <WidgetMetric size="lg" label={t('...')} value={money(called)} secondary={...} />
  <SegmentedProgress total={total} segments={[{ id: 'done', value: 3, tone: 'success' }]} />
</WidgetCard>`}
      >
        <Example label={t(`${K}.widgetCard.exampleLabel`)}>
          <WidgetsDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="confirmDialog"
        name="ConfirmDialog"
        importLine="import { ConfirmDialog } from '@/components/ui/confirm-dialog'"
        usage={`<ConfirmDialog open={open} onOpenChange={setOpen} title={t('...')} description={...}
  confirmLabel={t('...')} destructive loading={pending} onConfirm={archive}>
  {/* contenu complémentaire : avertissement, EffectsPanel */}
</ConfirmDialog>`}
      >
        <Example label={t(`${K}.confirmDialog.exampleLabel`)} hint={t(`${K}.confirmDialog.exampleHint`)}>
          <ConfirmDialogDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="sparkline"
        name="Sparkline"
        importLine="import { Sparkline } from '@/components/ui/sparkline'"
        usage={`<Sparkline ariaLabel={t('...')} format={money}
  points={rows.map(row => ({ label: formatDate(row.date), value: row.netAsset }))} />`}
      >
        <Example label={t(`${K}.sparkline.exampleLabel`)}>
          <div className="max-w-md">
            <Sparkline
              ariaLabel={t(`${K}.sparkline.exampleLabel`)}
              format={value => formatCurrency(value, 'EUR')}
              points={[52, 54, 53, 57, 60, 63].map((value, index) => ({ label: `T${index + 1}`, value: value * 1_000_000 }))}
            />
          </div>
        </Example>
      </DocBlock>

      <DocBlock
        id="dataTable"
        name="DataTable"
        importLine="import { DataTable } from '@/components/DataTable'"
        usage={`columns={[
  { key: 'managementFee', label: t('...'), sortable: true, align: 'right', render: row => percent(row.managementFee) },
  { key: 'entryFee', label: t('...'), sortable: true, align: 'right', render: row => percent(row.entryFee) },
]}`}
      >
        <Example label={t(`${K}.dataTable.exampleLabel`)}>
          <DataTableDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="richTextEditor"
        name="RichTextEditor"
        importLine="import { RichTextEditor } from '@/components/ui/rich-text-editor'"
        usage={`<SegmentedControl size="sm" value={language} onValueChange={setLanguage} options={languages} />
<RichTextEditor key={language} ariaLabel={t('...')} value={content[language]}
  onChange={html => setContent({ ...content, [language]: html })} invalid={Boolean(error)} />`}
      >
        <Example label={t(`${K}.richTextEditor.exampleLabel`)}>
          <RichTextDemo />
        </Example>
      </DocBlock>

      <DocBlock
        id="emptyState"
        name="EmptyState"
        importLine="import { EmptyState } from '@/components/EmptyState'"
        usage={`<EmptyState icon={FileText} title={t('...')} description={t('...')} action={<Button ... />} />
<EmptyState icon={Users} entityName="investisseur" entityNamePlural="investisseurs" hasFilters onReset={reset} />`}
      >
        <Example label={t(`${K}.emptyState.exampleLabel`)}>
          <div className="rounded-xl border border-border bg-card">
            <EmptyState
              icon={FileText}
              title={t('funds.detail.comingSoon')}
              description={t('funds.detail.comingSoonDescription')}
            />
          </div>
        </Example>
      </DocBlock>

      <DocBlock
        id="statusBadge"
        name="StatusBadge"
        importLine="import { StatusBadge } from '@/components/StatusBadge'"
        usage={`<StatusBadge label={t('...')} variant="info" icon={CalendarClock} />
// 'neutral' | 'outline' | 'info' | 'success' | 'warning' | 'danger' | 'strong'`}
      >
        <Example label={t(`${K}.statusBadge.exampleLabel`)}>
          <div className="flex flex-wrap gap-2">
            {(['neutral', 'outline', 'info', 'success', 'warning', 'danger', 'strong'] as const).map(variant => (
              <StatusBadge
                key={variant}
                variant={variant}
                label={t(`${K}.statusBadge.tones.${variant}`)}
                icon={variant === 'info' ? CalendarClock : undefined}
              />
            ))}
          </div>
        </Example>
      </DocBlock>
    </>
  );
}
