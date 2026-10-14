import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Ban, Copy, Landmark, LineChart, Lock, Trash2, Trophy, Users, XCircle } from 'lucide-react';
import { useTranslation } from '../../../utils/languageContext';
import { CURRENT_OPERATOR, type FundDetail, type FundShare } from '../../../utils/fundDetailMock';
import { StatusBadge } from '../../StatusBadge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { ComputedSummary } from '../../ui/computed-summary';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { DetailLink } from '../../ui/detail-summary';
import { DisabledReason } from '../../ui/disabled-reason';
import { SectionCard, useSectionEditor } from '../../ui/section-card';
import { SectionNav, type SectionNavItem } from '../../ui/section-nav';
import { cn, WIDGET_LABEL_CLASS } from '../../ui/utils';
import { ShareField } from './ShareField';
import {
  buildShareAudience,
  sectionValueIds,
  shareToValues,
  visibleSections,
  visibleShareFields,
  type ShareContext,
  type ShareSectionDef,
  type ShareSectionId,
  type ShareValues,
} from './shareSchema';

const K = 'funds.detail.shares';
const P = `${K}.page`;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const ISIN = /^[A-Z]{2}[A-Z0-9]{9}\d$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Validation serveur simulée pour la maquette. */
function validateShare(section: ShareSectionDef, values: ShareValues, t: Translate) {
  const errors: Record<string, string> = {};
  const num = (id: string) => (typeof values[id] === 'number' ? (values[id] as number) : null);
  if (section.id === 'identification') {
    if (!String(values.name ?? '').trim()) errors.name = t(`${P}.errors.nameRequired`);
    const isin = String(values.isin ?? '').trim();
    if (isin && !ISIN.test(isin)) errors.isin = t(`${P}.errors.isin`);
  }
  if (section.id === 'pricing') {
    const price = num('nominalPrice');
    if (price === null || price <= 0) errors.nominalPrice = t(`${P}.errors.priceRequired`);
  }
  if (section.id === 'limits') {
    const pairs = values.mode === 'perAmount' ? ['minAmount', 'maxAmount'] : ['minShares', 'maxShares'];
    pairs.forEach(id => {
      const value = num(id);
      if (value !== null && value < 0) errors[id] = t(`${P}.errors.positive`);
    });
    const [min, max] = pairs.map(num);
    if (min !== null && max !== null && max < min) errors[pairs[1]] = t(`${P}.errors.minMax`);
  }
  ['managementFee', 'entryFee', 'defaultCommission', 'equityPercent'].forEach(id => {
    const value = num(id);
    if (section.fields.some(field => field.id === id) && value !== null && (value < 0 || value > 100))
      errors[id] = t(`${P}.errors.percent`);
  });
  ['minEntryFee', 'feeFreeThreshold'].forEach(id => {
    const value = num(id);
    if (section.fields.some(field => field.id === id) && value !== null && value < 0) errors[id] = t(`${P}.errors.positive`);
  });
  const cc = String(values.validationCcEmail ?? '').trim();
  if (section.id === 'emails' && cc && cc.split(/[,;]\s*/).some(item => !EMAIL.test(item.trim())))
    errors.validationCcEmail = t(`${P}.errors.email`);
  return errors;
}

interface PanelState {
  dirty: boolean;
  draft: ShareValues | null;
}

interface SharePanelProps {
  section: ShareSectionDef;
  detail: FundDetail;
  values: ShareValues;
  canEdit: boolean;
  editReason?: string;
  highlighted: string | null;
  fundPeriodicity: string;
  onSave: (values: ShareValues) => void;
  onStateChange: (state: PanelState) => void;
}

function SharePanel({
  section,
  detail,
  values,
  canEdit,
  editReason,
  highlighted,
  fundPeriodicity,
  onSave,
  onStateChange,
}: SharePanelProps) {
  const { t } = useTranslation();
  const [restrictWarning, setRestrictWarning] = useState(false);
  const initialValues = useMemo(
    () => Object.fromEntries(sectionValueIds(section).map(id => [id, values[id]])),
    // Les valeurs de départ sont figées au montage de la section.
    [section],
  );

  const editor = useSectionEditor<ShareValues>({
    initialValues,
    onSave: async draft => {
      await wait(700);
      const merged = { ...values, ...draft };
      const errors = validateShare(section, merged, t);
      if (Object.keys(errors).length > 0) return errors;
      // Un champ masqué n'est jamais modifié par l'enregistrement d'une section.
      const ctx = { detail, values: merged };
      const visibleIds = new Set(
        section.id === 'limits' ? sectionValueIds(section) : visibleShareFields(section, ctx).map(field => field.id),
      );
      onSave(Object.fromEntries(Object.entries(draft).filter(([id]) => visibleIds.has(id))));
    },
  });

  const editing = editor.mode === 'edit';
  useEffect(() => {
    onStateChange({ dirty: editing && editor.dirty, draft: editing ? editor.draft : null });
  }, [editing, editor.dirty, editor.draft, onStateChange]);

  const current = editing ? { ...values, ...editor.draft } : values;
  const ctx: ShareContext = { detail, values: current };
  const fields = visibleShareFields(section, ctx);

  // Restreindre la part sans s'inclure : l'opérateur perd la vue sur ses souscriptions.
  const draftOperators = (editor.draft.operators as string[] | undefined) ?? [];
  const excludesMe =
    section.id === 'access' &&
    detail.rights.restrictShare &&
    draftOperators.length > 0 &&
    !draftOperators.includes(CURRENT_OPERATOR) &&
    editor.draft.operators !== values.operators;

  return (
    <>
      <SectionCard
        mode={editor.mode}
        icon={section.icon}
        title={t(`${P}.sections.${section.id}.title`)}
        summary={<span className="text-muted-foreground">{t(`${P}.sections.${section.id}.subtitle`)}</span>}
        onEdit={canEdit ? editor.startEdit : undefined}
        editDisabledReason={editReason}
        saved={editor.saved}
        editBar={{ ...editor.editBar, onSave: excludesMe ? () => setRestrictWarning(true) : editor.save }}
      >
        {fields.map(field => (
          <ShareField
            key={field.id}
            field={field}
            ctx={ctx}
            mode={editor.mode}
            values={current}
            onChange={editor.setField}
            errors={editor.errors}
            disabled={editor.saving}
            highlighted={highlighted}
            fundPeriodicity={fundPeriodicity}
          />
        ))}
      </SectionCard>

      <ConfirmDialog
        open={restrictWarning}
        onOpenChange={setRestrictWarning}
        title={t(`${P}.restrictWarning.title`)}
        description={t(`${P}.restrictWarning.description`)}
        confirmLabel={t(`${P}.restrictWarning.confirm`)}
        destructive
        onConfirm={() => {
          setRestrictWarning(false);
          editor.save();
        }}
      />
    </>
  );
}

export interface ShareTarget {
  sectionId: ShareSectionId;
  fieldId: string;
}

interface FundSharePageProps {
  share: FundShare;
  detail: FundDetail;
  fundPeriodicity: string;
  canEdit: boolean;
  editReason?: string;
  initialTarget?: ShareTarget | null;
  onBack: () => void;
  onSave: (values: ShareValues) => void;
  onOpenNavs: () => void;
  onDuplicate: () => void;
  onClose: () => void;
  onDelete: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

/**
 * Fiche d'une part, ouverte en page dans l'onglet Parts : même grille SectionNav et SectionCard
 * que l'onglet Paramètres, panneau "Qui peut souscrire cette part" toujours visible en tête.
 */
export function FundSharePage({
  share,
  detail,
  fundPeriodicity,
  canEdit,
  editReason,
  initialTarget,
  onBack,
  onSave,
  onOpenNavs,
  onDuplicate,
  onClose,
  onDelete,
  onDirtyChange,
}: FundSharePageProps) {
  const { t } = useTranslation();
  const values = useMemo(() => shareToValues(share, detail.currency), [share, detail.currency]);
  const ctx: ShareContext = { detail, values };
  const sections = visibleSections(ctx);
  const [activeId, setActiveId] = useState<ShareSectionId>(initialTarget?.sectionId ?? 'identification');
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>({ dirty: false, draft: null });
  const [pendingLeave, setPendingLeave] = useState<null | (() => void)>(null);
  const activeSection = sections.find(section => section.id === activeId) ?? sections[0];

  const handleStateChange = useCallback((state: PanelState) => setPanel(state), []);
  useEffect(() => onDirtyChange(panel.dirty), [panel.dirty, onDirtyChange]);

  const guard = (action: () => void) => {
    if (panel.dirty) setPendingLeave(() => action);
    else action();
  };

  const goTo = useCallback((sectionId: ShareSectionId, fieldId: string) => {
    setActiveId(sectionId);
    setHighlighted(fieldId);
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.getElementById(`share-field-${fieldId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      ),
    );
  }, []);

  useEffect(() => {
    if (initialTarget) goTo(initialTarget.sectionId, initialTarget.fieldId);
  }, [initialTarget, goTo]);

  useEffect(() => {
    if (!highlighted) return;
    const timer = setTimeout(() => setHighlighted(null), 2500);
    return () => clearTimeout(timer);
  }, [highlighted]);

  // La synthèse suit la saisie en cours : elle reflète ce qui sera enregistré.
  const audience = buildShareAudience({ ...values, ...(panel.draft ?? {}) }, detail, t);

  const audienceRows: { id: string; label: string; value: string; fieldId: string; visible: boolean }[] = [
    { id: 'investorTypes', label: t(`${P}.audience.rows.investorTypes`), value: audience.investorTypes, fieldId: 'investorTypes', visible: true },
    { id: 'segments', label: t(`${P}.audience.rows.segments`), value: audience.segments, fieldId: 'segments', visible: true },
    { id: 'channels', label: t(`${P}.audience.rows.channels`), value: audience.channels, fieldId: 'onlineSubscription', visible: true },
    {
      id: 'distributors',
      label: t(`${P}.audience.rows.distributors`),
      value: audience.distributors,
      fieldId: 'distributorSubscription',
      visible: detail.modules.partners,
    },
    {
      id: 'operators',
      label: t(`${P}.audience.rows.operators`),
      value: audience.operators,
      fieldId: 'operators',
      visible: detail.rights.restrictShare,
    },
  ];

  const navItems: SectionNavItem[] = sections.map(section => ({
    id: section.id,
    title: t(`${P}.sections.${section.id}.title`),
    subtitle: t(`${P}.sections.${section.id}.subtitle`),
    icon: section.icon,
    indicator: { kind: 'none' },
  }));

  const actionReason = !canEdit ? t('funds.detail.reasons.noEditRight') : editReason;
  const flags = [
    share.restricted && { key: 'restricted', icon: Lock },
    share.carried && { key: 'carried', icon: Trophy },
    share.lemonwayDebit && detail.modules.lemonway && { key: 'lemonway', icon: Landmark },
  ].filter(Boolean) as { key: string; icon: typeof Lock }[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <DetailLink icon={ArrowLeft} onClick={() => guard(onBack)}>
            {t(`${P}.back`)}
          </DetailLink>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-foreground">{t('funds.detail.sharePrefix', { name: share.name })}</h2>
            {share.closed && <StatusBadge label={t(`${K}.closed`)} variant="neutral" icon={Ban} />}
            {flags.map(flag => (
              <StatusBadge key={flag.key} label={t(`${K}.flags.${flag.key}`)} variant="info" icon={flag.icon} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {[share.isin || t(`${P}.noIsin`), t(`${K}.mode.${share.mode}`), detail.name].join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => guard(onOpenNavs)}>
            <LineChart className="w-4 h-4" />
            {t(`${K}.actions.navs`)}
          </Button>
          <DisabledReason reason={actionReason}>
            <Button variant="outline" size="sm" onClick={() => guard(onDuplicate)} disabled={Boolean(actionReason)}>
              <Copy className="w-4 h-4" />
              {t(`${K}.actions.duplicate`)}
            </Button>
          </DisabledReason>
          <DisabledReason reason={actionReason ?? (share.closed ? t(`${K}.alreadyClosed`) : undefined)}>
            <Button variant="outline" size="sm" onClick={onClose} disabled={Boolean(actionReason) || share.closed}>
              <XCircle className="w-4 h-4" />
              {t(`${K}.actions.close`)}
            </Button>
          </DisabledReason>
          <DisabledReason reason={actionReason}>
            <Button variant="outline" size="sm" onClick={onDelete} disabled={Boolean(actionReason)} className="text-destructive">
              <Trash2 className="w-4 h-4" />
              {t(`${K}.actions.delete`)}
            </Button>
          </DisabledReason>
        </div>
      </div>

      <Card className="gap-0 p-4 shadow-sm">
        <ComputedSummary icon={Users} label={t(`${P}.audience.title`)}>
          {audience.sentence}
        </ComputedSummary>
        <dl className="mt-3 divide-y divide-border">
          {audienceRows.map(row => (
            <div key={row.id} className="grid grid-cols-3 items-center gap-4 py-2">
              <dt className={cn(WIDGET_LABEL_CLASS)}>{row.label}</dt>
              <dd className="text-sm font-medium text-foreground">{row.value}</dd>
              <dd className="text-right text-sm">
                {row.visible && (
                  <DetailLink onClick={() => guard(() => goTo('access', row.fieldId))}>
                    {t(`${P}.audience.goTo`)}
                  </DetailLink>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid items-start gap-6" style={{ gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)' }}>
        <SectionNav
          title={t(`${P}.sectionsTitle`)}
          items={navItems}
          activeId={activeSection?.id ?? null}
          onSelect={id => {
            if (id === activeSection?.id) return;
            guard(() => setActiveId(id as ShareSectionId));
          }}
        />
        {activeSection && (
          <SharePanel
            key={`${share.id}-${activeSection.id}`}
            section={activeSection}
            detail={detail}
            values={values}
            canEdit={canEdit}
            editReason={editReason}
            highlighted={highlighted}
            fundPeriodicity={fundPeriodicity}
            onSave={onSave}
            onStateChange={handleStateChange}
          />
        )}
      </div>

      <ConfirmDialog
        open={pendingLeave !== null}
        onOpenChange={open => !open && setPendingLeave(null)}
        title={t('funds.detail.settings.leave.title')}
        description={t('funds.detail.settings.leave.description')}
        confirmLabel={t('funds.detail.settings.leave.confirm')}
        cancelLabel={t('funds.detail.settings.leave.stay')}
        destructive
        onConfirm={() => {
          const action = pendingLeave;
          setPendingLeave(null);
          setPanel({ dirty: false, draft: null });
          action?.();
        }}
      />
    </div>
  );
}
