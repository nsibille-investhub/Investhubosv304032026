import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { CalendarDays, FileSignature, IdCard, Landmark, LineChart, PenLine, Scale } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { FieldTarget, FundDetail } from '../../utils/fundDetailMock';
import { ColorPicker } from '../ui/color-picker';
import { useMonthLabels } from '../ui/day-month-picker';
import { Input } from '../ui/input';
import { SectionCard, SectionFieldRow, useSectionEditor } from '../ui/section-card';
import { SectionNav, type SectionNavItem } from '../ui/section-nav';
import { StatusBadge } from '../StatusBadge';

const K = 'funds.detail.settings';

type SectionId = 'identity' | 'legal' | 'subscription' | 'signature' | 'banking' | 'calendar' | 'performance';

const SECTIONS: { id: SectionId; icon: LucideIcon }[] = [
  { id: 'identity', icon: IdCard },
  { id: 'legal', icon: Scale },
  { id: 'subscription', icon: FileSignature },
  { id: 'signature', icon: PenLine },
  { id: 'banking', icon: Landmark },
  { id: 'calendar', icon: CalendarDays },
  { id: 'performance', icon: LineChart },
];

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface FundSettingsTabProps {
  detail: FundDetail;
  target: FieldTarget | null;
  onTargetHandled: () => void;
  editReason?: string;
  onIdentitySaved: (values: { name: string; adminName: string; color: string | null }) => void;
}

interface FieldDef {
  id: string;
  value: ReactNode;
  lockedReason?: string;
  legacySettingEffect?: string;
}

export function FundSettingsTab({ detail, target, onTargetHandled, editReason, onIdentitySaved }: FundSettingsTabProps) {
  const { t } = useTranslation();
  const months = useMonthLabels();
  const [activeId, setActiveId] = useState<SectionId>('identity');
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const editor = useSectionEditor({
    initialValues: { name: detail.name, adminName: detail.adminName, color: detail.color as string | null },
    // Validation simulée pour la maquette : le serveur décide des règles de saisie.
    onSave: async draft => {
      await wait(900);
      if (draft.name.trim() === '') return { name: t(`${K}.errors.nameRequired`) };
      onIdentitySaved(draft);
    },
  });

  useEffect(() => {
    if (!target || target.tab !== 'settings') return;
    setActiveId(target.sectionId as SectionId);
    setHighlighted(target.fieldId);
    requestAnimationFrame(() =>
      document.getElementById(`fund-field-${target.fieldId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
    onTargetHandled();
    const timer = setTimeout(() => setHighlighted(null), 2500);
    return () => clearTimeout(timer);
  }, [target, onTargetHandled]);

  const fromMaster = detail.mirrorOf ? t(`${K}.locks.fromMaster`) : undefined;
  // Règle serveur simulée (PRD section 8.2, D6) : la devise se verrouille dès la première souscription.
  const currencyLock = detail.subscribed > 0 ? t(`${K}.locks.currency`) : undefined;
  const yesNo = (value: boolean) => (value ? t(`${K}.values.yes`) : t(`${K}.values.no`));
  const missingFields = new Set(detail.missingConfig.filter(item => item.target.tab === 'settings').map(item => item.target.fieldId));

  const fields: Record<Exclude<SectionId, 'identity'>, FieldDef[]> = useMemo(
    () => ({
      legal: [
        { id: 'legalForm', value: detail.legalForm, lockedReason: fromMaster },
        { id: 'depositary', value: detail.depositary, lockedReason: fromMaster },
        { id: 'currency', value: detail.currency, lockedReason: fromMaster ?? currencyLock },
        { id: 'countries', value: detail.settings.countries.join(', '), lockedReason: fromMaster },
        { id: 'targetSize', value: detail.targetSize ? formatCurrency(detail.targetSize, detail.currency) : null },
      ],
      subscription: [
        { id: 'paymentMode', value: t(`funds.detail.paymentMode.${detail.paymentMode}`), lockedReason: fromMaster },
        {
          id: 'channels',
          value: detail.channels.map(channel => t(`funds.detail.overview.access.channel.${channel}`)).join(', '),
        },
        { id: 'onboarding', value: detail.settings.onboarding },
        { id: 'subscriptionContract', value: detail.settings.subscriptionContract },
      ],
      signature: [{ id: 'signatories', value: detail.settings.signatories.join(', ') }],
      banking: [{ id: 'iban', value: detail.settings.iban }],
      calendar: [
        { id: 'collectionStart', value: detail.collectionStart ? formatDate(detail.collectionStart) : null },
        { id: 'collectionEnd', value: detail.collectionEnd ? formatDate(detail.collectionEnd) : null },
        { id: 'closingDate', value: detail.closingDate ? formatDate(detail.closingDate) : null },
        { id: 'evergreen', value: yesNo(detail.evergreen) },
        {
          id: 'liquidityWindow',
          value: detail.liquidityWindow
            ? t('funds.detail.overview.calendar.window', {
                from: t('funds.detail.overview.calendar.dayMonth', {
                  day: detail.liquidityWindow.from.day,
                  month: months[detail.liquidityWindow.from.month - 1].toLowerCase(),
                }),
                to: t('funds.detail.overview.calendar.dayMonth', {
                  day: detail.liquidityWindow.to.day,
                  month: months[detail.liquidityWindow.to.month - 1].toLowerCase(),
                }),
              })
            : null,
        },
        { id: 'navFrequency', value: t(`common.frequencyDayField.frequencies.${detail.navFrequency}`) },
      ],
      performance: [
        {
          id: 'performanceIndicator',
          value: t(`${K}.values.performance.${detail.settings.performanceIndicator}`),
          legacySettingEffect: t(`${K}.legacy.performanceIndicator`),
        },
      ],
    }),
    [detail, fromMaster, currencyLock, months, t],
  );

  const sectionMissing = (id: SectionId) =>
    id === 'identity' ? 0 : fields[id].filter(field => missingFields.has(field.id)).length;

  const navItems: SectionNavItem[] = SECTIONS.map(section => {
    const missing = sectionMissing(section.id);
    return {
      id: section.id,
      title: t(`${K}.sections.${section.id}.title`),
      subtitle: t(`${K}.sections.${section.id}.subtitle`),
      icon: section.icon,
      iconTone: missing > 0 ? 'danger' : 'neutral',
      indicator: missing > 0 ? { kind: 'badge', label: t(`${K}.toComplete`), tone: 'danger' } : { kind: 'none' },
    };
  });

  const comingSoon = editReason ?? t(`${K}.editComingSoon`);
  const visibleSection = SECTIONS.find(section => section.id === activeId) ?? SECTIONS[0];

  return (
    <div className="grid items-start gap-6" style={{ gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)' }}>
      <SectionNav
        title={t(`${K}.navTitle`)}
        items={navItems}
        activeId={activeId}
        onSelect={id => setActiveId(id as SectionId)}
      />

      {visibleSection.id === 'identity' ? (
        <SectionCard
          mode={editor.mode}
          icon={IdCard}
          title={t(`${K}.sections.identity.title`)}
          summary={<span className="text-muted-foreground">{t(`${K}.sections.identity.subtitle`)}</span>}
          onEdit={editor.startEdit}
          editDisabledReason={editReason}
          saved={editor.saved}
          editBar={editor.editBar}
        >
          <SectionFieldRow
            id="fund-field-name"
            highlighted={highlighted === 'name'}
            mode={editor.mode}
            label={t(`${K}.fields.name`)}
            htmlFor="fund-name"
            required
            value={editor.values.name}
            error={editor.errors.name}
          >
            <Input
              id="fund-name"
              value={editor.draft.name}
              onChange={event => editor.setField('name', event.target.value)}
              aria-invalid={Boolean(editor.errors.name) || undefined}
              aria-describedby={editor.errors.name ? 'fund-name-error' : undefined}
              disabled={editor.saving}
              className="border-border"
            />
          </SectionFieldRow>
          <SectionFieldRow
            mode={editor.mode}
            label={t(`${K}.fields.adminName`)}
            htmlFor="fund-admin-name"
            value={editor.values.adminName}
          >
            <Input
              id="fund-admin-name"
              value={editor.draft.adminName}
              onChange={event => editor.setField('adminName', event.target.value)}
              disabled={editor.saving}
              className="border-border"
            />
          </SectionFieldRow>
          <SectionFieldRow
            mode={editor.mode}
            label={t(`${K}.fields.fundType`)}
            value={t(`funds.detail.type.${detail.fundType}`)}
            lockedReason={t(`${K}.locks.typeComingSoon`)}
          />
          <SectionFieldRow
            mode={editor.mode}
            label={t(`${K}.fields.parent`)}
            value={detail.parent?.name}
            lockedReason={detail.parent ? t(`${K}.locks.typeComingSoon`) : undefined}
          />
          <SectionFieldRow mode={editor.mode} label={t(`${K}.fields.managementCompany`)} value={detail.managementCompany} lockedReason={t(`${K}.locks.typeComingSoon`)} />
          <SectionFieldRow
            mode={editor.mode}
            label={t(`${K}.fields.color`)}
            htmlFor="fund-color"
            value={
              editor.values.color && (
                <span className="inline-flex items-center gap-2 font-mono">
                  <span className="h-4 w-4 rounded border border-border" style={{ backgroundColor: editor.values.color }} />
                  {editor.values.color}
                </span>
              )
            }
          >
            <ColorPicker
              id="fund-color"
              value={editor.draft.color}
              onChange={value => editor.setField('color', value)}
              disabled={editor.saving}
            />
          </SectionFieldRow>
          <SectionFieldRow mode={editor.mode} label={t(`${K}.fields.externalId`)} value={detail.settings.externalId} lockedReason={t(`${K}.locks.typeComingSoon`)} />
        </SectionCard>
      ) : (
        <SectionCard
          mode="read"
          icon={visibleSection.icon}
          title={t(`${K}.sections.${visibleSection.id}.title`)}
          summary={<span className="text-muted-foreground">{t(`${K}.sections.${visibleSection.id}.subtitle`)}</span>}
          badges={
            sectionMissing(visibleSection.id) > 0 ? (
              <StatusBadge label={t(`${K}.toComplete`)} variant="danger" />
            ) : undefined
          }
          onEdit={() => undefined}
          editDisabledReason={comingSoon}
        >
          {fields[visibleSection.id].map(field => (
            <SectionFieldRow
              key={field.id}
              id={`fund-field-${field.id}`}
              highlighted={highlighted === field.id}
              mode="read"
              label={t(`${K}.fields.${field.id}`)}
              value={field.value}
              lockedReason={field.lockedReason}
              legacySettingEffect={field.legacySettingEffect}
            />
          ))}
        </SectionCard>
      )}
    </div>
  );
}
