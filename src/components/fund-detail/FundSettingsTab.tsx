import { useCallback, useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '../../utils/languageContext';
import type { FieldTarget, FundDetail } from '../../utils/fundDetailMock';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { PageStateBanner } from '../ui/page-state-banner';
import { SectionNav, type SectionNavItem } from '../ui/section-nav';
import { TabCount } from '../ui/detail-tabs';
import { SegmentedControl } from '../ui/segmented-control';
import { SettingsSectionPanel, type PanelState } from './settings/SettingsSectionPanel';
import {
  findSection,
  isSectionVisible,
  sectionCompletion,
  SETTINGS_SCHEMA,
  SUB_TAB_ICONS,
  type SettingsContext,
  type SettingsValues,
} from './settings/settingsSchema';

const S = 'funds.detail.settings';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Sous-onglet hors schéma de champs : marché secondaire, contrats, contrôles. */
export interface ExtraSettingsSubTab {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  content: ReactNode;
}

interface FundSettingsTabProps {
  detail: FundDetail;
  values: SettingsValues;
  onValuesSaved: (values: SettingsValues) => void;
  target: FieldTarget | null;
  onTargetHandled: () => void;
  canEdit: boolean;
  editReason?: string;
  onDirtyChange: (dirty: boolean) => void;
  extraSubTabs?: ExtraSettingsSubTab[];
}

export function FundSettingsTab({
  detail,
  values,
  onValuesSaved,
  target,
  onTargetHandled,
  canEdit,
  editReason,
  onDirtyChange,
  extraSubTabs = [],
}: FundSettingsTabProps) {
  const { t } = useTranslation();
  const ctx: SettingsContext = { detail, values };
  const [subTab, setSubTab] = useState<string>('profile');
  const [activeBySubTab, setActiveBySubTab] = useState<Record<string, string>>({});
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>({ editing: false, dirty: false });
  const [pendingLeave, setPendingLeave] = useState<null | (() => void)>(null);
  const [paymentConfirm, setPaymentConfirm] = useState<null | { value: unknown; apply: () => void }>(null);
  const [regenerating, setRegenerating] = useState<null | 'confirm' | 'pending'>(null);

  const extraSubTab = extraSubTabs.find(item => item.id === subTab) ?? null;
  const currentSubTab = SETTINGS_SCHEMA.find(item => item.id === subTab) ?? SETTINGS_SCHEMA[0];
  const sections = currentSubTab.sections.filter(section => isSectionVisible(section, ctx));
  const activeId =
    sections.find(section => section.id === activeBySubTab[subTab])?.id ?? sections[0]?.id ?? null;
  const activeSection = sections.find(section => section.id === activeId) ?? null;

  const handleStateChange = useCallback((state: PanelState) => setPanel(state), []);

  useEffect(() => onDirtyChange(panel.dirty), [panel.dirty, onDirtyChange]);

  /** Quitter une section modifiée demande confirmation. */
  const guard = (action: () => void) => {
    if (panel.dirty) setPendingLeave(() => action);
    else action();
  };

  useEffect(() => {
    if (!target || target.tab !== 'settings') return;
    const found = findSection(target.sectionId);
    if (found) {
      setSubTab(found.subTab.id);
      setActiveBySubTab(prev => ({ ...prev, [found.subTab.id]: found.section.id }));
    } else if (extraSubTabs.some(item => item.id === target.sectionId)) {
      setSubTab(target.sectionId);
    }
    setHighlighted(target.fieldId);
    const frame = requestAnimationFrame(() =>
      document.getElementById(`fund-field-${target.fieldId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
    onTargetHandled();
    const timer = setTimeout(() => setHighlighted(null), 2500);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [target, onTargetHandled]);

  const navItems: SectionNavItem[] = sections.map(section => {
    const completion = sectionCompletion(section, ctx);
    return {
      id: section.id,
      title: t(`${S}.sections.${section.id}.title`),
      subtitle: t(`${S}.sections.${section.id}.subtitle`),
      icon: section.icon,
      iconTone: completion.blockingMissing ? 'warning' : 'neutral',
      indicator:
        completion.total > 0
          ? {
              kind: 'count',
              value: completion.filled,
              total: completion.total,
              tone: completion.blockingMissing ? 'warning' : completion.filled === completion.total ? 'success' : 'neutral',
            }
          : { kind: 'none' },
    };
  });

  // Règle serveur simulée (PRD section 8.2, D5) : changement refusé si des opérations existent dans l'ancien mode.
  const paymentRefused = detail.deleteBlockers.operations > 0 ? t(`${S}.paymentMode.refused`) : undefined;

  const subTabOptions = [
    ...SETTINGS_SCHEMA.map(item => {
      const Icon = SUB_TAB_ICONS[item.id];
      return { value: item.id, label: t(`${S}.subTabs.${item.id}`), icon: <Icon className="w-4 h-4" /> };
    }),
    ...extraSubTabs.map(item => {
      const Icon = item.icon;
      return {
        value: item.id,
        label: (
          <span className="inline-flex items-center gap-2">
            {item.label}
            {item.count !== undefined && <TabCount>{item.count}</TabCount>}
          </span>
        ),
        icon: <Icon className="w-4 h-4" />,
      };
    }),
  ];

  return (
    <div className="space-y-4">
      {!canEdit && <PageStateBanner variant="readOnly" />}

      <SegmentedControl
        value={subTab}
        onValueChange={next => guard(() => setSubTab(next))}
        options={subTabOptions}
        aria-label={t(`${S}.subTabsLabel`)}
      />

      {extraSubTab ? (
        extraSubTab.content
      ) : (
      <div className="grid items-start gap-6" style={{ gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)' }}>
        <SectionNav
          title={t(`${S}.subTabs.${currentSubTab.id}`)}
          items={navItems}
          activeId={activeId}
          onSelect={id => {
            if (id === activeId) return;
            guard(() => setActiveBySubTab(prev => ({ ...prev, [subTab]: id })));
          }}
        />

        {activeSection && (
          <SettingsSectionPanel
            key={activeSection.id}
            section={activeSection}
            context={{ detail }}
            values={values}
            canEdit={canEdit}
            editReason={editReason}
            highlightedField={highlighted}
            onSave={onValuesSaved}
            onStateChange={handleStateChange}
            onConfirmChange={(value, apply) => setPaymentConfirm({ value, apply })}
            onRegenerateKey={() => setRegenerating('confirm')}
          />
        )}
      </div>
      )}

      <ConfirmDialog
        open={pendingLeave !== null}
        onOpenChange={open => !open && setPendingLeave(null)}
        title={t(`${S}.leave.title`)}
        description={t(`${S}.leave.description`)}
        confirmLabel={t(`${S}.leave.confirm`)}
        cancelLabel={t(`${S}.leave.stay`)}
        destructive
        onConfirm={() => {
          const action = pendingLeave;
          setPendingLeave(null);
          setPanel({ editing: false, dirty: false });
          action?.();
        }}
      />

      <ConfirmDialog
        open={paymentConfirm !== null}
        onOpenChange={open => !open && setPaymentConfirm(null)}
        title={t(`${S}.paymentMode.title`)}
        description={t(`${S}.paymentMode.description`, {
          mode: paymentConfirm?.value ? t(`funds.detail.paymentMode.${String(paymentConfirm.value)}`) : t(`${S}.values.empty`),
        })}
        confirmLabel={t(`${S}.paymentMode.confirm`)}
        confirmDisabledReason={paymentRefused}
        onConfirm={() => {
          paymentConfirm?.apply();
          setPaymentConfirm(null);
        }}
      >
        {paymentRefused && (
          <p className="text-sm text-destructive" role="alert">
            {paymentRefused}
          </p>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={regenerating !== null}
        onOpenChange={open => !open && setRegenerating(null)}
        title={t(`${S}.apiKey.title`)}
        description={t(`${S}.apiKey.description`)}
        confirmLabel={t(`${S}.regenerate`)}
        destructive
        loading={regenerating === 'pending'}
        onConfirm={async () => {
          setRegenerating('pending');
          await wait(1000);
          const suffix = Math.random().toString(16).slice(2, 6);
          onValuesSaved({ apiKey: `ih_live_••••••••••••${suffix}` });
          setRegenerating(null);
          toast.success(t(`${S}.apiKey.done`));
        }}
      />
    </div>
  );
}

