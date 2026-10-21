import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, Loader2, Mail, Repeat, Tag, Undo2, X } from 'lucide-react';
import { useTranslation } from '../../../utils/languageContext';
import { formatCurrency, formatDate, formatNavValue } from '../../../utils/formatters';
import type { FundDetail } from '../../../utils/fundDetailMock';
import { FileDropZone } from '../../../features/datahub/components/FileDropZone';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { EffectsPanel, type EffectItem } from '../../ui/effects-panel';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toneText } from '../../ui/tone';
import { Callout } from '../../ui/callout';
import { computeNavEffects, type NavEntryInput, isoDay } from './navEffects';

const N = 'funds.detail.navs';

const fromIso = (value: string) => new Date(`${value}T12:00:00`);

interface NavEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  detail: FundDetail;
  initial?: { shareId?: string; date?: Date };
  onSubmit: (input: NavEntryInput) => Promise<void>;
}

/** Saisie ou correction d'une valeur liquidative : formulaire, puis effets avant validation. */
export function NavEntryDialog({ open, onOpenChange, mode, detail, initial, onSubmit }: NavEntryDialogProps) {
  const { t, lang } = useTranslation();
  const money = (value: number) => formatCurrency(value, detail.currency);
  const nav = (value: number) => formatNavValue(value, detail.currency);
  const shareFormat = new Intl.NumberFormat(lang, { maximumFractionDigits: 3 });
  const openShares = detail.shares.filter(share => !share.closed || share.id === initial?.shareId);

  const [step, setStep] = useState<1 | 2>(1);
  const [shareId, setShareId] = useState('');
  const [date, setDate] = useState('');
  const [value, setValue] = useState('');
  const [proof, setProof] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmSubscriptions, setConfirmSubscriptions] = useState(false);
  const [replaceNominal, setReplaceNominal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const row = initial?.shareId && initial.date ? detail.navs.find(item => isoDay(item.date) === isoDay(initial.date!)) : undefined;
    setStep(1);
    setShareId(initial?.shareId ?? openShares[0]?.id ?? '');
    setDate(initial?.date ? isoDay(initial.date) : isoDay(new Date()));
    setValue(mode === 'edit' && row && initial?.shareId ? String(row.values[initial.shareId] ?? '') : '');
    setProof(mode === 'edit' && row && initial?.shareId ? row.meta[initial.shareId]?.proof ?? null : null);
    setErrors({});
    // Option cochée par défaut sur un fonds en paiement direct (PRD section 11.2).
    setConfirmSubscriptions(detail.paymentMode === 'direct');
    setReplaceNominal(false);
    setSaving(false);
    // Réinitialisation à chaque ouverture seulement.
  }, [open]);

  const share = detail.shares.find(item => item.id === shareId);
  const numericValue = Number(value.replace(',', '.'));
  const existingRow = date ? detail.navs.find(row => isoDay(row.date) === date) : undefined;
  const existingValue = existingRow && shareId ? existingRow.values[shareId] : null;
  const existingMeta = existingRow && shareId ? existingRow.meta[shareId] : undefined;

  const effects = useMemo(
    () => (share && date && numericValue > 0 ? computeNavEffects(detail, share, fromIso(date), numericValue) : null),
    [detail, share, date, numericValue],
  );

  /** Contrôles serveur simulés : part, date passée ou du jour, valeur strictement positive. */
  const validate = () => {
    const next: Record<string, string> = {};
    if (!shareId) next.share = t(`${N}.errors.share`);
    if (!date) next.date = t(`${N}.errors.date`);
    else if (fromIso(date) > new Date()) next.date = t(`${N}.errors.future`);
    if (!(numericValue > 0)) next.value = t(`${N}.errors.value`);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSaving(true);
    await onSubmit({
      shareId,
      date: fromIso(date),
      value: numericValue,
      proof,
      confirmSubscriptions,
      replaceNominal,
    });
    setSaving(false);
  };

  const redemptionEffect = (reversibleLabel: string): EffectItem | null =>
    effects && effects.redemptions.length > 0
      ? {
          id: 'redemptions',
          icon: Undo2,
          label: reversibleLabel,
          reversible: true,
          objects: effects.redemptions.map(item => ({
            id: item.id,
            label: t(`${N}.effects.redemptionItem`, {
              ref: item.ref,
              investor: item.investor,
              amount: money(item.amount),
              shares: shareFormat.format(item.finalShares),
            }),
          })),
        }
      : null;

  const secondaryEffect: EffectItem | null = effects?.secondaryMarket
    ? { id: 'secondary', icon: Repeat, label: t(`${N}.effects.secondary`), reversible: true }
    : null;

  const createEffects: EffectItem[] = [
    redemptionEffect(t(`${N}.effects.redemptions`)),
    effects && effects.pendingSubscriptions > 0
      ? {
          id: 'subscriptions',
          icon: Mail,
          label: t(`${N}.effects.subscriptions`, { count: effects.pendingSubscriptions }),
          reversible: false,
          note: confirmSubscriptions ? t(`${N}.effects.emails`, { count: effects.pendingSubscriptions }) : t(`${N}.effects.noEmails`),
          option: { checked: confirmSubscriptions, onCheckedChange: setConfirmSubscriptions },
        }
      : null,
    {
      id: 'nominal',
      icon: Tag,
      label: t(`${N}.effects.nominal`, {
        from: share?.nominalPrice !== null && share?.nominalPrice !== undefined ? money(share.nominalPrice) : t('common.sectionCard.notProvided'),
        to: numericValue > 0 ? nav(numericValue) : '',
      }),
      reversible: true,
      note: t(`${N}.effects.nominalNote`),
      option: { checked: replaceNominal, onCheckedChange: setReplaceNominal },
    },
    secondaryEffect,
  ].filter((item): item is EffectItem => item !== null);

  // Correction : effets recalculés d'un côté, effets déjà produits et non annulables de l'autre.
  const recalculated: EffectItem[] = [
    redemptionEffect(t(`${N}.effects.redemptionsRecalculated`)),
    existingMeta?.produced.includes('nominal')
      ? { id: 'nominal', icon: Tag, label: t(`${N}.effects.nominalRecalculated`, { to: nav(numericValue) }), reversible: true }
      : null,
    secondaryEffect,
  ].filter((item): item is EffectItem => item !== null);
  const alreadyProduced: EffectItem[] = existingMeta?.produced.includes('subscriptions')
    ? [{ id: 'subscriptions', icon: Mail, label: t(`${N}.effects.subscriptionsDone`), note: t(`${N}.effects.emailsSent`), reversible: false }]
    : [];

  const title = mode === 'edit' ? t(`${N}.dialog.editTitle`) : t(`${N}.dialog.createTitle`);

  return (
    <Dialog open={open} onOpenChange={next => !saving && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{t(`${N}.dialog.step`, { step, total: 2 })}</DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="nav-share" className="text-sm font-medium text-foreground">
                {t(`${N}.dialog.share`)}
              </label>
              <Select value={shareId} onValueChange={setShareId} disabled={mode === 'edit'}>
                <SelectTrigger id="nav-share" aria-invalid={Boolean(errors.share) || undefined} className="border-border">
                  <SelectValue placeholder={t(`${N}.dialog.sharePlaceholder`)} />
                </SelectTrigger>
                <SelectContent>
                  {openShares.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {t('funds.detail.sharePrefix', { name: item.name })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.share && <p className="text-xs" style={toneText('danger')}>{errors.share}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="nav-date" className="text-sm font-medium text-foreground">
                  {t(`${N}.dialog.date`)}
                </label>
                <Input
                  id="nav-date"
                  type="date"
                  value={date}
                  onChange={event => setDate(event.target.value)}
                  disabled={mode === 'edit'}
                  aria-invalid={Boolean(errors.date) || undefined}
                  className="border-border"
                />
                {errors.date && <p className="text-xs" style={toneText('danger')}>{errors.date}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="nav-value" className="text-sm font-medium text-foreground">
                  {t(`${N}.dialog.value`, { currency: detail.currency })}
                </label>
                <Input
                  id="nav-value"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={value}
                  onChange={event => setValue(event.target.value)}
                  aria-invalid={Boolean(errors.value) || undefined}
                  className="border-border"
                />
                {errors.value && <p className="text-xs" style={toneText('danger')}>{errors.value}</p>}
              </div>
            </div>

            {mode === 'create' && typeof existingValue === 'number' && (
              <Callout tone="warning">
                {t(`${N}.dialog.existing`, { date: formatDate(fromIso(date)), value: nav(existingValue) })}
              </Callout>
            )}
            {mode === 'edit' && typeof existingValue === 'number' && (
              <p className="text-xs text-muted-foreground">{t(`${N}.dialog.current`, { value: nav(existingValue) })}</p>
            )}

            <div className="space-y-1">
              <span className="text-sm font-medium text-foreground">{t(`${N}.dialog.proof`)}</span>
              {proof ? (
                <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{proof}</span>
                  <Button variant="ghost" size="icon" aria-label={t(`${N}.dialog.removeProof`)} onClick={() => setProof(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <FileDropZone
                  accept=".pdf,.png,.jpg"
                  onFiles={files => setProof(files[0]?.name ?? null)}
                  title={t(`${N}.dialog.proofDrop`)}
                  hint={t(`${N}.dialog.proofHint`)}
                />
              )}
            </div>
          </div>
        ) : mode === 'create' ? (
          <EffectsPanel
            title={t(`${N}.effects.title`)}
            description={t(`${N}.effects.description`, {
              share: share?.name ?? '',
              date: date ? formatDate(fromIso(date)) : '',
              value: nav(numericValue),
            })}
            effects={createEffects}
          />
        ) : (
          <div className="space-y-3">
            <EffectsPanel title={t(`${N}.effects.recalculatedTitle`)} effects={recalculated} />
            <EffectsPanel
              title={t(`${N}.effects.producedTitle`)}
              description={t(`${N}.effects.producedDescription`)}
              effects={alreadyProduced}
              marker="none"
            />
          </div>
        )}

        <DialogFooter>
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.confirmDialog.cancel')}
              </Button>
              <Button onClick={() => validate() && setStep(2)}>
                {t(`${N}.dialog.next`)}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(1)} disabled={saving}>
                <ArrowLeft className="w-4 h-4" />
                {t(`${N}.dialog.back`)}
              </Button>
              <Button onClick={submit} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {mode === 'edit' ? t(`${N}.dialog.submitEdit`) : t(`${N}.dialog.submit`)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
