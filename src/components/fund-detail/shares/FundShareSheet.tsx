import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Copy, Gem, LineChart, Lock, Trash2, Users, XCircle } from 'lucide-react';
import { useTranslation } from '../../../utils/languageContext';
import type { FundDetail, FundShare } from '../../../utils/fundDetailMock';
import { StatusBadge } from '../../StatusBadge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { ComputedSummary } from '../../ui/computed-summary';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { DisabledReason } from '../../ui/disabled-reason';
import { SectionNav, type SectionNavItem } from '../../ui/section-nav';
import {
  isSectionVisible,
  sectionCompletion,
  type SectionDef,
  type SettingsContext,
  type SettingsValues,
} from '../settings/settingsSchema';
import { SettingsSectionPanel, validateSettingsSection, type PanelState } from '../settings/SettingsSectionPanel';
import { CURRENT_OPERATOR, SHARE_PREFIX, SHARE_SECTIONS } from './shareSchema';
import { whoCanSubscribe } from './shareValues';

const P = SHARE_PREFIX;
const ISIN = /^[A-Z]{2}[A-Z0-9]{9}\d$/;

/**
 * Validation serveur simulée pour la maquette : nom obligatoire, format du code ISIN,
 * bornes minimum et maximum cohérentes, plus les contrôles communs des paramètres.
 */
function validateShareSection(section: SectionDef, ctx: SettingsContext, t: (key: string) => string) {
  const errors = validateSettingsSection(section, ctx, t);
  const { values } = ctx;
  if (errors.name) errors.name = t(`${P}.errors.nameRequired`);
  const isin = typeof values.isin === 'string' ? values.isin.trim() : '';
  if (section.id === 'identification' && isin && !ISIN.test(isin)) errors.isin = t(`${P}.errors.isin`);
  const pairs: [string, string][] = [
    ['minShares', 'maxShares'],
    ['minAmount', 'maxAmount'],
  ];
  for (const [min, max] of pairs) {
    const low = values[min];
    const high = values[max];
    if (section.id === 'bounds' && typeof low === 'number' && typeof high === 'number' && high < low)
      errors[max] = t(`${P}.errors.bounds`);
  }
  return errors;
}

export interface ShareActionHandlers {
  onOpenNavs: () => void;
  onDuplicate: () => void;
  onClose: () => void;
  onDelete: () => void;
}

interface FundShareSheetProps extends ShareActionHandlers {
  share: FundShare;
  values: SettingsValues;
  detail: FundDetail;
  fundValues: SettingsValues;
  canEdit: boolean;
  editReason?: string;
  highlight: { sectionId: string; fieldId: string } | null;
  onHighlightHandled: () => void;
  onSave: (values: SettingsValues) => void;
  onBack: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

export function FundShareSheet({
  share,
  values,
  detail,
  fundValues,
  canEdit,
  editReason,
  highlight,
  onHighlightHandled,
  onSave,
  onBack,
  onDirtyChange,
  onOpenNavs,
  onDuplicate,
  onClose,
  onDelete,
}: FundShareSheetProps) {
  const { t, lang } = useTranslation();
  const context = { detail, share, fundValues };
  const ctx: SettingsContext = { ...context, values };
  const sections = SHARE_SECTIONS.filter(section => isSectionVisible(section, ctx));
  const [activeId, setActiveId] = useState(sections[0].id);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>({ editing: false, dirty: false });
  const [pendingLeave, setPendingLeave] = useState<null | (() => void)>(null);
  const activeSection = sections.find(section => section.id === activeId) ?? sections[0];
  const handleStateChange = useCallback((state: PanelState) => setPanel(state), []);

  useEffect(() => onDirtyChange(panel.dirty), [panel.dirty, onDirtyChange]);

  /** Quitter une section modifiée demande confirmation. */
  const guard = (action: () => void) => {
    if (panel.dirty) setPendingLeave(() => action);
    else action();
  };

  const focusField = (sectionId: string, fieldId: string) => {
    setActiveId(sectionId);
    setHighlighted(fieldId);
    requestAnimationFrame(() =>
      document.getElementById(`fund-field-${fieldId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
    setTimeout(() => setHighlighted(null), 2500);
  };

  useEffect(() => {
    if (!highlight) return;
    focusField(highlight.sectionId, highlight.fieldId);
    onHighlightHandled();
    // focusField ne dépend que de setters stables.
  }, [highlight, onHighlightHandled]);

  const who = whoCanSubscribe(share, values, detail, fundValues, t, lang);

  const navItems: SectionNavItem[] = sections.map(section => {
    const completion = sectionCompletion(section, ctx);
    return {
      id: section.id,
      title: t(`${P}.sections.${section.id}.title`),
      subtitle: t(`${P}.sections.${section.id}.subtitle`),
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

  const closeReason = !canEdit
    ? t('funds.detail.reasons.noEditRight')
    : editReason ?? (share.closed ? t(`${P}.reasons.alreadyClosed`) : undefined);
  const writeReason = !canEdit ? t('funds.detail.reasons.noEditRight') : editReason;

  const action = (label: string, icon: ReactNode, onClick: () => void, reason?: string) => (
    <DisabledReason reason={reason}>
      <Button variant="outline" size="sm" onClick={() => guard(onClick)} disabled={Boolean(reason)}>
        {icon}
        {label}
      </Button>
    </DisabledReason>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => guard(onBack)}>
            <ArrowLeft className="w-4 h-4" />
            {t(`${P}.back`)}
          </Button>
          <h2 className="text-xl font-semibold text-foreground">{t('funds.detail.sharePrefix', { name: share.name })}</h2>
          {share.closed && <StatusBadge label={t('funds.detail.shares.closed')} variant="neutral" icon={XCircle} />}
          {share.restricted && <StatusBadge label={t('funds.detail.shares.pictos.restricted')} variant="info" icon={Lock} />}
          {share.carried && <StatusBadge label={t('funds.detail.shares.pictos.carried')} variant="outline" icon={Gem} />}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {action(t('funds.detail.shares.actions.navs'), <LineChart className="w-4 h-4" />, onOpenNavs)}
          {action(t('funds.detail.shares.actions.duplicate'), <Copy className="w-4 h-4" />, onDuplicate, writeReason)}
          {action(t('funds.detail.shares.actions.close'), <XCircle className="w-4 h-4" />, onClose, closeReason)}
          {action(t('funds.detail.shares.actions.delete'), <Trash2 className="w-4 h-4" />, onDelete, writeReason)}
        </div>
      </div>

      <Card className="gap-3 p-4 shadow-sm">
        <ComputedSummary icon={Users} label={t(`${P}.who.title`)} footnote={t(`${P}.who.footnote`)}>
          {who.sentence}
        </ComputedSummary>
        <ul className="divide-y divide-border rounded-lg border border-border">
          {who.rows.map(row => (
            <li key={row.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="w-48 shrink-0 text-muted-foreground">{t(`${P}.who.rows.${row.id}`)}</span>
              <span className="min-w-0 flex-1 text-foreground">{row.value}</span>
              <button
                type="button"
                onClick={() => guard(() => focusField('access', row.fieldId))}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {t(`${P}.who.open`)}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid items-start gap-6" style={{ gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)' }}>
        <SectionNav
          title={t(`${P}.navTitle`)}
          items={navItems}
          activeId={activeSection.id}
          onSelect={id => {
            if (id !== activeSection.id) guard(() => setActiveId(id));
          }}
        />
        <SettingsSectionPanel
          key={`${share.id}-${activeSection.id}`}
          section={activeSection}
          context={context}
          values={values}
          canEdit={canEdit}
          editReason={editReason}
          highlightedField={highlighted}
          onSave={onSave}
          onStateChange={handleStateChange}
          prefix={P}
          validate={validateShareSection}
          saveWarning={sectionCtx => {
            // Restreindre la part sans s'inclure masque ses souscriptions à l'utilisateur.
            if (activeSection.id !== 'access') return undefined;
            const operators = Array.isArray(sectionCtx.values.operators) ? (sectionCtx.values.operators as string[]) : [];
            return operators.length > 0 && !operators.includes(CURRENT_OPERATOR) ? t(`${P}.restrictionWarning`) : undefined;
          }}
          wrapFields={(rows, sectionCtx) => {
            if (activeSection.id !== 'bounds' || !Array.isArray(rows)) return rows;
            // La ligne Modalité reste en place ; les bornes de la modalité active entrent en transition.
            const [modeRow, ...boundRows] = rows;
            return (
              <>
                {modeRow}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={String(sectionCtx.values.mode)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="divide-y divide-border"
                  >
                    {boundRows}
                  </motion.div>
                </AnimatePresence>
              </>
            );
          }}
        />
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
          const next = pendingLeave;
          setPendingLeave(null);
          setPanel({ editing: false, dirty: false });
          next?.();
        }}
      />
    </div>
  );
}
