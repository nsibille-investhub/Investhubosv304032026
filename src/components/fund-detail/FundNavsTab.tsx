import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Download, LineChart, Mail, Pencil, Plus, Repeat, Tag, Trash2, TriangleAlert, Undo2, Upload } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { formatCurrency, formatDate, formatNavValue } from '../../utils/formatters';
import type { FundDetail, NavProducedEffect } from '../../utils/fundDetailMock';
import { EmptyState } from '../EmptyState';
import { StatusBadge } from '../StatusBadge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { ConfirmDialog } from '../ui/confirm-dialog';
import { DisabledReason } from '../ui/disabled-reason';
import { EffectsPanel, type EffectItem } from '../ui/effects-panel';
import { Sparkline } from '../ui/sparkline';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from '../ui/utils';
import { WidgetCard, WidgetMetric } from '../ui/widget-card';
import { applyNavEntry, deleteNavEntry, REVERSIBLE_EFFECTS, type NavChange, type NavEntryInput, isoDay } from './navs/navEffects';
import { NavEntryDialog } from './navs/NavEntryDialog';
import { NavImportDialog } from './navs/NavImportDialog';

const K = 'funds.detail.navs';
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const EFFECT_ICONS: Record<NavProducedEffect, typeof Undo2> = {
  redemptions: Undo2,
  subscriptions: Mail,
  nominal: Tag,
  secondary: Repeat,
};

interface FundNavsTabProps {
  detail: FundDetail;
  canEdit: boolean;
  editReason?: string;
  /** Part à ouvrir directement, depuis la liste des parts. */
  initialShareId: string | null;
  onInitialShareHandled: () => void;
  onNavChange: (change: NavChange) => void;
}

/** Une table par date, une colonne par part, l'actif net daté dans le même onglet (PRD section 11.1). */
export function FundNavsTab({ detail, canEdit, editReason, initialShareId, onInitialShareHandled, onNavChange }: FundNavsTabProps) {
  const { t } = useTranslation();
  const money = (value: number) => formatCurrency(value, detail.currency);
  const nav = (value: number) => formatNavValue(value, detail.currency);
  const [shareView, setShareView] = useState<string | null>(null);
  const [entry, setEntry] = useState<null | { mode: 'create' | 'edit'; shareId?: string; date?: Date }>(null);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState<null | { shareId: string; date: Date }>(null);
  const [deletePending, setDeletePending] = useState(false);

  useEffect(() => {
    if (!initialShareId) return;
    setShareView(initialShareId);
    onInitialShareHandled();
  }, [initialShareId, onInitialShareHandled]);

  const writeReason = !canEdit ? t('funds.detail.reasons.noEditRight') : editReason;
  const missing = new Set(detail.expectedNavMissing.map(item => `${item.shareId}-${isoDay(item.expectedDate)}`));

  const submitEntry = async (input: NavEntryInput) => {
    await wait(900);
    onNavChange(applyNavEntry(detail, input));
    const share = detail.shares.find(item => item.id === input.shareId)!;
    toast.success(
      t(entry?.mode === 'edit' ? `${K}.toast.corrected` : `${K}.toast.saved`, {
        share: share.name,
        date: formatDate(input.date),
      }),
    );
    setEntry(null);
  };

  const runImport = async (inputs: NavEntryInput[]) => {
    await wait(1100);
    let current = detail;
    for (const input of inputs) {
      const change = applyNavEntry(current, input);
      current = { ...current, navs: change.navs, shares: change.shares, expectedNavMissing: change.expectedNavMissing };
    }
    onNavChange({ navs: current.navs, shares: current.shares, expectedNavMissing: current.expectedNavMissing, nominalUpdates: {} });
    toast.success(t(`${K}.toast.imported`, { count: inputs.length }));
    setImporting(false);
  };

  const deletingRow = deleting ? detail.navs.find(row => isoDay(row.date) === isoDay(deleting.date)) : undefined;
  const deletingMeta = deleting ? deletingRow?.meta[deleting.shareId] : undefined;
  const produced = deletingMeta?.produced ?? [];
  const cancelled: EffectItem[] = produced
    .filter(effect => REVERSIBLE_EFFECTS.includes(effect))
    .map(effect => ({ id: effect, icon: EFFECT_ICONS[effect], label: t(`${K}.delete.cancel.${effect}`), reversible: true }));
  const kept: EffectItem[] = produced
    .filter(effect => !REVERSIBLE_EFFECTS.includes(effect))
    .map(effect => ({ id: effect, icon: EFFECT_ICONS[effect], label: t(`${K}.delete.keep.${effect}`), reversible: false }));

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletePending(true);
    await wait(900);
    onNavChange(deleteNavEntry(detail, deleting.shareId, deleting.date));
    setDeletePending(false);
    setDeleting(null);
    toast.success(t(produced.length > 0 ? `${K}.toast.deletedWithEffects` : `${K}.toast.deleted`));
  };

  const downloadProof = (name: string) => {
    // Justificatif de démonstration : un fichier texte au nom du document déposé.
    const blob = new Blob([t(`${K}.proofContent`, { name })], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name.replace(/\.pdf$/, '.txt');
    link.click();
    URL.revokeObjectURL(url);
  };

  const actions = (
    <div className="flex items-center gap-2">
      <DisabledReason reason={writeReason}>
        <Button variant="outline" size="sm" onClick={() => setImporting(true)} disabled={Boolean(writeReason)}>
          <Upload className="w-4 h-4" />
          {t(`${K}.importAction`)}
        </Button>
      </DisabledReason>
      <DisabledReason reason={writeReason}>
        <Button
          size="sm"
          onClick={() => setEntry({ mode: 'create', shareId: shareView ?? undefined })}
          disabled={Boolean(writeReason)}
        >
          <Plus className="w-4 h-4" />
          {t(`${K}.add`)}
        </Button>
      </DisabledReason>
    </div>
  );

  const chronological = [...detail.navs].reverse().filter(row => row.netAsset !== null);
  const lastNetAsset = detail.navs.find(row => row.netAsset !== null);
  const share = shareView ? detail.shares.find(item => item.id === shareView) : undefined;

  let body;
  if (share) {
    const rows = detail.navs.filter(row => typeof row.values[share.id] === 'number' || missing.has(`${share.id}-${isoDay(row.date)}`));
    body = (
      <Card className="gap-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShareView(null)}>
              <ArrowLeft className="w-4 h-4" />
              {t(`${K}.allShares`)}
            </Button>
            <div>
              <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.shareTitle`, { name: share.name })}</h3>
              <p className={WIDGET_SUBTITLE_CLASS}>{t(`${K}.shareSubtitle`, { count: rows.length })}</p>
            </div>
          </div>
          {actions}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t(`${K}.date`)}</TableHead>
              <TableHead className="text-right">{t(`${K}.value`)}</TableHead>
              <TableHead>{t(`${K}.proof`)}</TableHead>
              <TableHead>{t(`${K}.produced`)}</TableHead>
              <TableHead className="text-right ds-sticky-actions">{t(`${K}.actions`)}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(row => {
              const value = row.values[share.id];
              const meta = row.meta[share.id];
              const filled = typeof value === 'number';
              return (
                <TableRow key={row.date.getTime()}>
                  <TableCell className="font-medium">{formatDate(row.date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {filled ? nav(value) : <StatusBadge variant="warning" icon={TriangleAlert} label={t(`${K}.expectedMissing`)} />}
                  </TableCell>
                  <TableCell>
                    {meta?.proof ? (
                      <Button variant="link" size="sm" className="h-auto px-0" onClick={() => downloadProof(meta.proof!)}>
                        <Download className="w-3.5 h-3.5" />
                        {meta.proof}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground/60 italic">{t(`${K}.noProof`)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {meta && meta.produced.length > 0 ? (
                        meta.produced.map(effect => (
                          <StatusBadge key={effect} variant="outline" label={t(`${K}.effectBadges.${effect}`)} />
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">{t(`${K}.noEffect`)}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right ds-sticky-actions">
                    <div className="inline-flex items-center gap-1">
                      {filled ? (
                        <>
                          <DisabledReason reason={writeReason}>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={Boolean(writeReason)}
                              onClick={() => setEntry({ mode: 'edit', shareId: share.id, date: row.date })}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              {t(`${K}.correct`)}
                            </Button>
                          </DisabledReason>
                          <DisabledReason reason={writeReason}>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={Boolean(writeReason)}
                              onClick={() => setDeleting({ shareId: share.id, date: row.date })}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {t(`${K}.delete.action`)}
                            </Button>
                          </DisabledReason>
                        </>
                      ) : (
                        <DisabledReason reason={writeReason}>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={Boolean(writeReason)}
                            onClick={() => setEntry({ mode: 'create', shareId: share.id, date: row.date })}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {t(`${K}.enter`)}
                          </Button>
                        </DisabledReason>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    );
  } else if (detail.navs.length === 0) {
    body = (
      <Card className="shadow-sm">
        <EmptyState icon={LineChart} title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyDescription`)} action={actions} />
      </Card>
    );
  } else {
    body = (
      <div className="space-y-4">
        <WidgetCard
          icon={LineChart}
          title={t(`${K}.netAssetTitle`)}
          subtitle={t(`${K}.subtitle`, { frequency: t(`common.frequencyDayField.frequencies.${detail.navFrequency}`).toLowerCase() })}
          action={actions}
        >
          <div className="flex flex-wrap items-center gap-6">
            <WidgetMetric
              className="shrink-0"
              size="lg"
              label={t(`${K}.lastNetAsset`)}
              value={lastNetAsset?.netAsset !== null && lastNetAsset?.netAsset !== undefined ? money(lastNetAsset.netAsset) : t('common.sectionCard.notProvided')}
              secondary={lastNetAsset ? t(`${K}.onDate`, { date: formatDate(lastNetAsset.date) }) : undefined}
            />
            <div className="min-w-0 flex-1">
              {chronological.length > 1 && (
                <Sparkline
                  ariaLabel={t(`${K}.netAssetHistory`)}
                  format={money}
                  points={chronological.map(row => ({ label: formatDate(row.date), value: row.netAsset as number }))}
                />
              )}
            </div>
          </div>
        </WidgetCard>

        <Card className="gap-0 shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h3 className={WIDGET_TITLE_CLASS}>{t(`${K}.title`)}</h3>
            <p className={WIDGET_SUBTITLE_CLASS}>{t(`${K}.tableHint`)}</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(`${K}.date`)}</TableHead>
                {detail.shares.map(item => (
                  <TableHead key={item.id} className="text-right">
                    <button
                      type="button"
                      onClick={() => setShareView(item.id)}
                      className="font-medium text-primary hover:underline"
                    >
                      {t('funds.detail.sharePrefix', { name: item.name })}
                    </button>
                  </TableHead>
                ))}
                <TableHead className="text-right">{t(`${K}.netAsset`)}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detail.navs.map(row => (
                <TableRow key={row.date.getTime()}>
                  <TableCell className="font-medium">{formatDate(row.date)}</TableCell>
                  {detail.shares.map(item => {
                    const value = row.values[item.id];
                    return (
                      <TableCell key={item.id} className="text-right tabular-nums">
                        {typeof value === 'number' ? (
                          nav(value)
                        ) : missing.has(`${item.id}-${isoDay(row.date)}`) ? (
                          <StatusBadge variant="warning" icon={TriangleAlert} label={t(`${K}.expectedMissing`)} />
                        ) : (
                          <span className="text-muted-foreground/60 italic">{t('common.sectionCard.notProvided')}</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right tabular-nums">
                    {row.netAsset !== null ? money(row.netAsset) : t('common.sectionCard.notProvided')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  return (
    <>
      {body}

      <NavEntryDialog
        open={entry !== null}
        onOpenChange={open => !open && setEntry(null)}
        mode={entry?.mode ?? 'create'}
        detail={detail}
        initial={entry ?? undefined}
        onSubmit={submitEntry}
      />

      <NavImportDialog open={importing} onOpenChange={setImporting} detail={detail} onImport={runImport} />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={open => !open && setDeleting(null)}
        title={t(`${K}.delete.title`, {
          share: detail.shares.find(item => item.id === deleting?.shareId)?.name ?? '',
          date: deleting ? formatDate(deleting.date) : '',
        })}
        description={produced.length > 0 ? t(`${K}.delete.withEffects`) : t(`${K}.delete.simple`)}
        confirmLabel={produced.length > 0 ? t(`${K}.delete.confirmWithEffects`) : t(`${K}.delete.action`)}
        destructive
        loading={deletePending}
        onConfirm={confirmDelete}
      >
        {produced.length > 0 && (
          <div className="space-y-3">
            <EffectsPanel title={t(`${K}.delete.cancelledTitle`)} effects={cancelled} marker="none" />
            <EffectsPanel title={t(`${K}.delete.keptTitle`)} effects={kept} marker="none" />
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
