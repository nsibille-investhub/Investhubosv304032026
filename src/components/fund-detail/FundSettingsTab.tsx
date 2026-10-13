import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '../../utils/languageContext';
import type { FieldTarget, FundDetail } from '../../utils/fundDetailMock';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { PageStateBanner } from '../ui/page-state-banner';
import { SectionCard, useSectionEditor } from '../ui/section-card';
import { SectionNav, type SectionNavItem } from '../ui/section-nav';
import { SegmentedControl } from '../ui/segmented-control';
import { StatusBadge } from '../StatusBadge';
import { SettingsField } from './settings/SettingsField';
import {
  findSection,
  isSectionVisible,
  sectionCompletion,
  SETTINGS_SCHEMA,
  SUB_TAB_ICONS,
  visibleFields,
  type SectionDef,
  type SettingsContext,
  type SettingsValues,
  type SubTabDef,
} from './settings/settingsSchema';

const S = 'funds.detail.settings';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIC = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
const IBAN = /^[A-Z]{2}\d{2}[A-Z0-9 •]{10,34}$/;
const VIDEO = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|vimeo\.com\/)[\w-]+/;

/**
 * Validation serveur simulée pour la maquette (PRD section 8.1) : formats d'email, d'IBAN et de BIC,
 * pourcentages entre 0 et 100, décimales entre 0 et 10, cohérence des dates de collecte,
 * montants positifs, vidéo YouTube ou Vimeo, nom du fonds obligatoire.
 */
function validateSection(section: SectionDef, ctx: SettingsContext, t: (key: string) => string) {
  const errors: Record<string, string> = {};
  for (const field of visibleFields(section, ctx)) {
    const value = ctx.values[field.id];
    const text = typeof value === 'string' ? value.trim() : '';
    if (field.id === 'name' && !text) errors.name = t(`${S}.errors.nameRequired`);
    if (field.id === 'bic' && text && !BIC.test(text)) errors.bic = t(`${S}.errors.bic`);
    if (field.id === 'iban' && text && !IBAN.test(text.toUpperCase())) errors.iban = t(`${S}.errors.iban`);
    if (field.kind === 'emails' && text && text.split(/[,;]\s*/).some(item => !EMAIL.test(item.trim())))
      errors[field.id] = t(`${S}.errors.emails`);
    if (field.kind === 'percent' && typeof value === 'number' && (value < 0 || value > 100))
      errors[field.id] = t(`${S}.errors.percent`);
    if (field.kind === 'amount' && typeof value === 'number' && value < 0) errors[field.id] = t(`${S}.errors.amount`);
    if (field.id === 'shareDecimals' && typeof value === 'number' && (!Number.isInteger(value) || value < 0 || value > 10))
      errors.shareDecimals = t(`${S}.errors.decimals`);
    if (field.kind === 'video' && text && !VIDEO.test(text)) errors[field.id] = t(`${S}.errors.video`);
  }
  const start = ctx.values.collectionStart;
  const end = ctx.values.collectionEnd;
  if (section.id === 'calendar' && typeof start === 'string' && typeof end === 'string' && start && end && end < start)
    errors.collectionEnd = t(`${S}.errors.collectionDates`);
  return errors;
}

interface PanelState {
  editing: boolean;
  dirty: boolean;
}

interface SectionPanelProps {
  section: SectionDef;
  detail: FundDetail;
  values: SettingsValues;
  canEdit: boolean;
  editReason?: string;
  highlightedField: string | null;
  onSave: (values: SettingsValues) => void;
  onStateChange: (state: PanelState) => void;
  onConfirmPaymentMode: (value: unknown, apply: () => void) => void;
  onRegenerateKey: () => void;
}

function SectionPanel({
  section,
  detail,
  values,
  canEdit,
  editReason,
  highlightedField,
  onSave,
  onStateChange,
  onConfirmPaymentMode,
  onRegenerateKey,
}: SectionPanelProps) {
  const { t } = useTranslation();
  const initialValues = useMemo(
    () => Object.fromEntries(section.fields.map(field => [field.id, values[field.id]])),
    // Les valeurs de départ sont figées au montage de la section.
    [section],
  );

  const editor = useSectionEditor<SettingsValues>({
    initialValues,
    onSave: async draft => {
      await wait(900);
      const ctx = { detail, values: { ...values, ...draft } };
      const errors = validateSection(section, ctx, t);
      if (Object.keys(errors).length > 0) return errors;
      // Un champ masqué n'est jamais modifié par l'enregistrement d'une section (PRD section 8.1).
      const visibleIds = new Set(visibleFields(section, ctx).map(field => field.id));
      onSave(Object.fromEntries(Object.entries(draft).filter(([id]) => visibleIds.has(id))));
    },
  });

  useEffect(() => {
    onStateChange({ editing: editor.mode === 'edit', dirty: editor.mode === 'edit' && editor.dirty });
  }, [editor.mode, editor.dirty, onStateChange]);

  const ctx: SettingsContext = { detail, values: editor.mode === 'edit' ? { ...values, ...editor.draft } : values };
  const fields = visibleFields(section, ctx);
  const completion = sectionCompletion(section, ctx);

  const lockedReasonFor = (field: SectionDef['fields'][number]) => {
    if (detail.mirrorOf && field.fromMaster) return t(`${S}.locks.fromMaster`);
    const key = field.lockedKey?.(ctx);
    return key ? t(`${S}.locks.${key}`) : undefined;
  };

  return (
    <SectionCard
      mode={editor.mode}
      icon={section.icon}
      title={t(`${S}.sections.${section.id}.title`)}
      summary={<span className="text-muted-foreground">{t(`${S}.sections.${section.id}.subtitle`)}</span>}
      badges={
        completion.total > 0 ? (
          <StatusBadge
            variant={completion.blockingMissing ? 'warning' : completion.filled === completion.total ? 'success' : 'neutral'}
            label={t(`${S}.requiredCount`, { filled: completion.filled, total: completion.total })}
          />
        ) : undefined
      }
      onEdit={canEdit ? editor.startEdit : undefined}
      editDisabledReason={editReason}
      saved={editor.saved}
      editBar={editor.editBar}
    >
      {fields.map(field => {
        const lockedReason = lockedReasonFor(field);
        return (
          <SettingsField
            key={field.id}
            field={field}
            ctx={ctx}
            mode={editor.mode}
            value={editor.mode === 'edit' ? editor.draft[field.id] : values[field.id]}
            onChange={next => editor.setField(field.id, next)}
            onConfirmChange={next => onConfirmPaymentMode(next, () => editor.setField(field.id, next))}
            error={editor.errors[field.id]}
            disabled={editor.saving}
            highlighted={highlightedField === field.id}
            lockedReason={lockedReason}
            onRegenerateKey={field.kind === 'secret' ? onRegenerateKey : undefined}
            regenerateDisabledReason={!canEdit ? t('funds.detail.reasons.noEditRight') : editReason}
          />
        );
      })}
    </SectionCard>
  );
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
}: FundSettingsTabProps) {
  const { t } = useTranslation();
  const ctx: SettingsContext = { detail, values };
  const [subTab, setSubTab] = useState<SubTabDef['id']>('profile');
  const [activeBySubTab, setActiveBySubTab] = useState<Record<string, string>>({});
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>({ editing: false, dirty: false });
  const [pendingLeave, setPendingLeave] = useState<null | (() => void)>(null);
  const [paymentConfirm, setPaymentConfirm] = useState<null | { value: unknown; apply: () => void }>(null);
  const [regenerating, setRegenerating] = useState<null | 'confirm' | 'pending'>(null);

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

  const subTabOptions = SETTINGS_SCHEMA.map(item => {
    const Icon = SUB_TAB_ICONS[item.id];
    return { value: item.id, label: t(`${S}.subTabs.${item.id}`), icon: <Icon className="w-4 h-4" /> };
  });

  return (
    <div className="space-y-4">
      {!canEdit && <PageStateBanner variant="readOnly" />}

      <SegmentedControl
        value={subTab}
        onValueChange={next => guard(() => setSubTab(next as SubTabDef['id']))}
        options={subTabOptions}
        aria-label={t(`${S}.subTabsLabel`)}
      />

      <div className="grid items-start gap-6" style={{ gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)' }}>
        <SectionNav
          title={t(`${S}.subTabs.${subTab}`)}
          items={navItems}
          activeId={activeId}
          onSelect={id => {
            if (id === activeId) return;
            guard(() => setActiveBySubTab(prev => ({ ...prev, [subTab]: id })));
          }}
        />

        {activeSection && (
          <SectionPanel
            key={activeSection.id}
            section={activeSection}
            detail={detail}
            values={values}
            canEdit={canEdit}
            editReason={editReason}
            highlightedField={highlighted}
            onSave={onValuesSaved}
            onStateChange={handleStateChange}
            onConfirmPaymentMode={(value, apply) => setPaymentConfirm({ value, apply })}
            onRegenerateKey={() => setRegenerating('confirm')}
          />
        )}
      </div>

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

