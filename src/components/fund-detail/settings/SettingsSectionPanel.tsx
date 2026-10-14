import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from '../../../utils/languageContext';
import { StatusBadge } from '../../StatusBadge';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { SectionCard, useSectionEditor } from '../../ui/section-card';
import { SettingsField } from './SettingsField';
import { sectionCompletion, visibleFields, type SectionDef, type SettingsContext, type SettingsValues } from './settingsSchema';

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
export function validateSettingsSection(section: SectionDef, ctx: SettingsContext, t: (key: string) => string) {
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

export interface PanelState {
  editing: boolean;
  dirty: boolean;
}

interface SettingsSectionPanelProps {
  section: SectionDef;
  /** Contexte hors valeurs : fonds, part ouverte. */
  context: Omit<SettingsContext, 'values'>;
  values: SettingsValues;
  canEdit: boolean;
  editReason?: string;
  highlightedField: string | null;
  onSave: (values: SettingsValues) => void;
  onStateChange: (state: PanelState) => void;
  /** Champ dont le changement passe par une confirmation. */
  onConfirmChange?: (value: unknown, apply: () => void) => void;
  onRegenerateKey?: () => void;
  /** Préfixe des libellés : paramètres du fonds ou fiche part. */
  prefix?: string;
  validate?: (section: SectionDef, ctx: SettingsContext, t: (key: string) => string) => Record<string, string>;
  /** Avertissement à confirmer avant l'enregistrement, ou rien. */
  saveWarning?: (ctx: SettingsContext) => string | undefined;
  /** Enveloppe des lignes, par exemple pour animer un changement de modalité. */
  wrapFields?: (rows: ReactNode, ctx: SettingsContext) => ReactNode;
}

/** Section éditable d'un écran de paramètres : lecture, édition, validation, enregistrement. */
export function SettingsSectionPanel({
  section,
  context,
  values,
  canEdit,
  editReason,
  highlightedField,
  onSave,
  onStateChange,
  onConfirmChange,
  onRegenerateKey,
  prefix = S,
  validate = validateSettingsSection,
  saveWarning,
  wrapFields,
}: SettingsSectionPanelProps) {
  const { t } = useTranslation();
  const detail = context.detail;
  const [warning, setWarning] = useState<string | null>(null);
  const initialValues = useMemo(
    () => Object.fromEntries(section.fields.map(field => [field.id, values[field.id]])),
    // Les valeurs de départ sont figées au montage de la section.
    [section],
  );

  const editor = useSectionEditor<SettingsValues>({
    initialValues,
    onSave: async draft => {
      await wait(900);
      const ctx = { ...context, values: { ...values, ...draft } };
      const errors = validate(section, ctx, t);
      if (Object.keys(errors).length > 0) return errors;
      // Un champ masqué n'est jamais modifié par l'enregistrement d'une section (PRD section 8.1).
      const visibleIds = new Set(visibleFields(section, ctx).map(field => field.id));
      onSave(Object.fromEntries(Object.entries(draft).filter(([id]) => visibleIds.has(id))));
    },
  });

  useEffect(() => {
    onStateChange({ editing: editor.mode === 'edit', dirty: editor.mode === 'edit' && editor.dirty });
  }, [editor.mode, editor.dirty, onStateChange]);

  const ctx: SettingsContext = { ...context, values: editor.mode === 'edit' ? { ...values, ...editor.draft } : values };
  const fields = visibleFields(section, ctx);
  const renderRows = (rows: ReactNode) => (wrapFields ? wrapFields(rows, ctx) : rows);
  const completion = sectionCompletion(section, ctx);

  const lockedReasonFor = (field: SectionDef['fields'][number]) => {
    if (detail.mirrorOf && field.fromMaster) return t(`${S}.locks.fromMaster`);
    const key = field.lockedKey?.(ctx);
    return key ? t(`${prefix}.locks.${key}`) : undefined;
  };

  return (
    <SectionCard
      mode={editor.mode}
      icon={section.icon}
      title={t(`${prefix}.sections.${section.id}.title`)}
      summary={<span className="text-muted-foreground">{t(`${prefix}.sections.${section.id}.subtitle`)}</span>}
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
      editBar={{
        ...editor.editBar,
        onSave: () => {
          const message = saveWarning?.(ctx);
          if (message) setWarning(message);
          else editor.save();
        },
      }}
    >
      {renderRows(fields.map(field => {
        const lockedReason = lockedReasonFor(field);
        return (
          <SettingsField
            key={field.id}
            field={field}
            ctx={ctx}
            mode={editor.mode}
            value={editor.mode === 'edit' ? editor.draft[field.id] : values[field.id]}
            onChange={next => editor.setField(field.id, next)}
            onConfirmChange={onConfirmChange ? next => onConfirmChange(next, () => editor.setField(field.id, next)) : undefined}
            prefix={prefix}
            error={editor.errors[field.id]}
            disabled={editor.saving}
            highlighted={highlightedField === field.id}
            lockedReason={lockedReason}
            onRegenerateKey={field.kind === 'secret' ? onRegenerateKey : undefined}
            regenerateDisabledReason={!canEdit ? t('funds.detail.reasons.noEditRight') : editReason}
          />
        );
      }))}
      <ConfirmDialog
        open={warning !== null}
        onOpenChange={open => !open && setWarning(null)}
        title={t('common.sectionCard.saveWarningTitle')}
        description={warning ?? undefined}
        confirmLabel={t('common.sectionCard.save')}
        onConfirm={() => {
          setWarning(null);
          editor.save();
        }}
      />
    </SectionCard>
  );
}
