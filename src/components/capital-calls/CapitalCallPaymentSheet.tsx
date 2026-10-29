import { useEffect, useState } from 'react';
import { Banknote, History, Scale, Wallet } from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import {
  LinePayment,
  LineState,
  OVERPAYMENT_TREATMENTS,
  OverpaymentTreatment,
  PaymentOrigin,
  paymentState,
} from '../../utils/capitalCallLines';
import { StatusBadge, StatusVariant } from '../StatusBadge';
import { Button } from '../ui/button';
import { FormField } from '../ui/form-field';
import { Input } from '../ui/input';
import { SegmentedControl } from '../ui/segmented-control';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent } from '../ui/sheet';
import { SIDE_PANEL_WIDE_STYLE, SidePanelCard, SidePanelFooter, SidePanelHeader, SidePanelSection } from '../ui/side-panel';
import { Textarea } from '../ui/textarea';
import { WidgetMetric } from '../ui/widget-card';

const K = 'funds.capitalCalls.detail.lines.payment';
const LINES = 'funds.capitalCalls.detail.lines';

const ORIGINS: PaymentOrigin[] = ['manual', 'bankReconciliation', 'directDebit'];

export const LINE_STATE_VARIANT: Record<LineState, StatusVariant> = {
  toNotify: 'neutral',
  notified: 'info',
  paymentDeclared: 'warning',
  partiallyPaid: 'warning',
  paid: 'success',
  overpaid: 'info',
  cancelled: 'outline',
};

/** Ligne d'appel vue par le panneau : fiche de l'appel ou onglet Appels de la souscription. */
export interface PaymentSheetLine {
  investor: string;
  subscription: string;
  callName: string;
  total: number;
  payments: LinePayment[];
  state: LineState;
  overpaymentTreatment: OverpaymentTreatment | null;
}

export interface PaymentSheetResult {
  payment: Omit<LinePayment, 'id' | 'by'> | null;
  treatment: OverpaymentTreatment | null;
}

interface CapitalCallPaymentSheetProps {
  line: PaymentSheetLine | null;
  currency: string;
  onClose: () => void;
  onSave: (result: PaymentSheetResult) => void;
}

const cents = (value: number) => Math.round(value * 100) / 100;

const toInputDate = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const parseAmount = (value: string) => {
  if (value.trim() === '') return null;
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : NaN;
};

export function CapitalCallPaymentSheet({ line, currency, onClose, onSave }: CapitalCallPaymentSheetProps) {
  const { t, lang } = useTranslation();
  const [amount, setAmount] = useState('');
  const [valueDate, setValueDate] = useState(toInputDate(new Date()));
  const [origin, setOrigin] = useState<PaymentOrigin>('manual');
  const [comment, setComment] = useState('');
  const [treatment, setTreatment] = useState<OverpaymentTreatment | null>(null);

  const received = line ? cents(line.payments.reduce((sum, payment) => sum + payment.amount, 0)) : 0;
  const balance = line ? cents(line.total - received) : 0;

  useEffect(() => {
    if (!line) return;
    setAmount(balance > 0 ? String(balance).replace('.', lang === 'fr' ? ',' : '.') : '');
    setValueDate(toInputDate(new Date()));
    setOrigin('manual');
    setComment('');
    setTreatment(line.overpaymentTreatment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line]);

  if (!line) return null;

  const money = (value: number) =>
    new Intl.NumberFormat(lang, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });

  const parsed = parseAmount(amount);
  const amountError =
    parsed !== null && (Number.isNaN(parsed) || parsed <= 0) ? t(`${K}.errors.amount`) : !valueDate && parsed ? t(`${K}.errors.date`) : null;
  const nextReceived = cents(received + (parsed && !Number.isNaN(parsed) && parsed > 0 ? parsed : 0));
  const nextState = paymentState(line.total, nextReceived, line.state);
  const nextGap = cents(nextReceived - line.total);
  const willBeOverpaid = nextState === 'overpaid';
  const hasPayment = parsed !== null && !amountError;
  const treatmentChanged = willBeOverpaid && treatment !== line.overpaymentTreatment;
  const canSave = !amountError && (hasPayment || treatmentChanged);

  const save = () => {
    if (!canSave) return;
    onSave({
      payment: hasPayment
        ? { amount: cents(parsed as number), valueDate: new Date(`${valueDate}T09:00:00`), origin, comment: comment.trim() }
        : null,
      treatment: willBeOverpaid ? treatment : null,
    });
  };

  return (
    <Sheet open onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" style={SIDE_PANEL_WIDE_STYLE} className="h-full p-0 gap-0">
        <SidePanelHeader
          title={t(`${K}.title`)}
          description={t(`${K}.description`, { investor: line.investor, subscription: line.subscription, call: line.callName })}
        />

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <SidePanelSection icon={Wallet} title={t(`${K}.summary.title`)}>
            <SidePanelCard className="grid grid-cols-3 gap-4">
              <WidgetMetric label={t(`${K}.summary.due`)} value={money(line.total)} />
              <WidgetMetric label={t(`${K}.summary.received`)} value={money(received)} />
              <WidgetMetric
                label={balance < 0 ? t(`${K}.summary.overpaid`) : t(`${K}.summary.remaining`)}
                value={money(Math.abs(balance))}
                tone={balance < 0 ? 'info' : balance > 0 ? 'warning' : 'success'}
              />
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={History} title={t(`${K}.history.title`)}>
            <SidePanelCard flush className="divide-y divide-border">
              {line.payments.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">{t(`${K}.history.empty`)}</p>
              ) : (
                line.payments.map(payment => (
                  <div key={payment.id} className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">
                        {t(`${K}.history.row`, {
                          date: dateFormat.format(payment.valueDate),
                          origin: t(`${LINES}.paymentOrigins.${payment.origin}`),
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.by ? t(`${K}.history.by`, { name: payment.by }) : t(`${K}.history.automatic`)}
                      </p>
                      {payment.comment && <p className="mt-1 text-xs text-muted-foreground">{payment.comment}</p>}
                    </div>
                    <span className="shrink-0 text-sm font-medium tabular-nums">{money(payment.amount)}</span>
                  </div>
                ))
              )}
            </SidePanelCard>
          </SidePanelSection>

          <SidePanelSection icon={Banknote} title={t(`${K}.form.title`)} description={t(`${K}.form.description`)}>
            <SidePanelCard className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField id="payment-amount" label={t(`${K}.form.amount`)} error={amountError ?? undefined}>
                  <Input
                    id="payment-amount"
                    className="h-11"
                    inputMode="decimal"
                    value={amount}
                    onChange={event => setAmount(event.target.value)}
                    aria-invalid={Boolean(amountError)}
                  />
                </FormField>
                <FormField id="payment-date" label={t(`${K}.form.valueDate`)}>
                  <Input
                    id="payment-date"
                    type="date"
                    className="h-11"
                    value={valueDate}
                    onChange={event => setValueDate(event.target.value)}
                  />
                </FormField>
              </div>
              <FormField id="payment-origin" label={t(`${K}.form.origin`)}>
                <Select value={origin} onValueChange={value => setOrigin(value as PaymentOrigin)}>
                  <SelectTrigger id="payment-origin" className="h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGINS.map(item => (
                      <SelectItem key={item} value={item}>
                        {t(`${LINES}.paymentOrigins.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="payment-comment" label={t(`${K}.form.comment`)}>
                <Textarea
                  id="payment-comment"
                  rows={2}
                  value={comment}
                  onChange={event => setComment(event.target.value)}
                  placeholder={t(`${K}.form.commentPlaceholder`)}
                />
              </FormField>
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
                {t(`${K}.form.result`)}
                <StatusBadge label={t(`${LINES}.states.${nextState}`)} variant={LINE_STATE_VARIANT[nextState]} />
                {nextState === 'partiallyPaid' && t(`${K}.form.resultRemaining`, { amount: money(-nextGap) })}
                {willBeOverpaid && t(`${K}.form.resultOverpaid`, { amount: money(nextGap) })}
              </div>
            </SidePanelCard>
          </SidePanelSection>

          {willBeOverpaid && (
            <SidePanelSection icon={Scale} title={t(`${K}.treatment.title`)} description={t(`${K}.treatment.description`)}>
              <SidePanelCard className="space-y-2">
                <SegmentedControl<OverpaymentTreatment | 'undecided'>
                  fullWidth
                  aria-label={t(`${K}.treatment.title`)}
                  value={treatment ?? 'undecided'}
                  onValueChange={value => setTreatment(value === 'undecided' ? null : value)}
                  options={[
                    ...OVERPAYMENT_TREATMENTS.map(item => ({ value: item, label: t(`${LINES}.treatments.${item}`) })),
                    { value: 'undecided' as const, label: t(`${K}.treatment.undecided`) },
                  ]}
                />
                <p className="text-xs text-muted-foreground">
                  {t(`${K}.treatment.hints.${treatment ?? 'undecided'}`, { amount: money(nextGap) })}
                </p>
              </SidePanelCard>
            </SidePanelSection>
          )}
        </div>

        <SidePanelFooter>
          <Button variant="outline" onClick={onClose}>
            {t(`${K}.cancel`)}
          </Button>
          <Button onClick={save} disabled={!canSave}>
            {t(`${K}.save`)}
          </Button>
        </SidePanelFooter>
      </SheetContent>
    </Sheet>
  );
}
