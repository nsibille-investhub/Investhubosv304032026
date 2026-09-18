import { useMemo, useState } from 'react';
import { Banknote, Check, CheckCircle2, Clock, Save, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import { useTranslation } from '../utils/languageContext';

const KEY = 'subscriptions.detail.paymentStep';

/** Les trois états de paiement suivis par la V1. */
type PaymentState = 'awaitingDirectDebit' | 'paidAwaitingNav' | 'confirmed';

const STATE_STYLES: Record<PaymentState, { badge: string; box: string; icon: typeof Clock }> = {
  awaitingDirectDebit: {
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    box: 'bg-amber-50 border-amber-200',
    icon: Clock,
  },
  paidAwaitingNav: {
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    box: 'bg-blue-50 border-blue-200',
    icon: Banknote,
  },
  confirmed: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    box: 'bg-emerald-50 border-emerald-200',
    icon: CheckCircle2,
  },
};

const formatAmount = (value: number) =>
  `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

const parseNumber = (value: string): number | null => {
  const parsed = Number(value.replace(',', '.'));
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
};

interface SubscriptionPaymentPanelProps {
  subscribedAmount: number;
  entryFeesRate: number;
}

/**
 * Confirmation du paiement : date du versement, valeur liquidative et sa date,
 * puis parts et montant estimés recalculés à la saisie.
 */
export function SubscriptionPaymentPanel({
  subscribedAmount,
  entryFeesRate,
}: SubscriptionPaymentPanelProps) {
  const { t } = useTranslation();

  const [state, setState] = useState<PaymentState>('awaitingDirectDebit');
  const [paymentDate, setPaymentDate] = useState('');
  const [navValue, setNavValue] = useState('');
  const [navDate, setNavDate] = useState('');
  const [lastReminderAt, setLastReminderAt] = useState<string | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);

  const entryFees = (subscribedAmount * entryFeesRate) / 100;

  const estimate = useMemo(() => {
    const nav = parseNumber(navValue);
    if (nav === null) return null;
    const shares = subscribedAmount / nav;
    return { shares, amount: shares * nav };
  }, [navValue, subscribedAmount]);

  const handleSave = () => {
    if (!paymentDate) {
      toast.error(t(`${KEY}.paymentDateRequired`));
      return;
    }
    setState(navValue && navDate ? 'confirmed' : 'paidAwaitingNav');
    toast.success(t(`${KEY}.saved`));
  };

  const handleReminder = () => {
    const date = new Date();
    const at = `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    setLastReminderAt(at);
    setReminderOpen(false);
    toast.success(t(`${KEY}.reminderSent`), { description: at });
  };

  const StateIcon = STATE_STYLES[state].icon;

  return (
    <div className="space-y-6">
      <Card className="shadow-sm overflow-hidden p-0 gap-0">
        <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
          <div className="min-w-0">
            <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.confirmationTitle`)}</h3>
            <p className={WIDGET_SUBTITLE_CLASS}>{t(`${KEY}.confirmationSubtitle`)}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-xs"
            onClick={() => setReminderOpen(true)}
          >
            <Send className="w-3.5 h-3.5" />
            {t(`${KEY}.remind`)}
          </Button>
        </div>

        <div className={`flex items-center gap-3 border-b px-4 py-3 ${STATE_STYLES[state].box}`}>
          <StateIcon className="w-5 h-5 shrink-0 text-foreground/70" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">{t(`${KEY}.states.${state}`)}</div>
            <div className="text-xs text-muted-foreground">
              {t(`${KEY}.statesDesc.${state}`)}
            </div>
          </div>
          <Badge className={`${STATE_STYLES[state].badge} shrink-0 text-xs`}>
            {t(`${KEY}.states.${state}`)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">{t(`${KEY}.paymentDateLabel`)}</label>
            <Input
              type="date"
              value={paymentDate}
              onChange={event => setPaymentDate(event.target.value)}
              className="mt-1 h-9"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t(`${KEY}.navValueLabel`)}</label>
            <Input
              value={navValue}
              onChange={event => setNavValue(event.target.value)}
              placeholder="100,00"
              className="mt-1 h-9"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t(`${KEY}.navDateLabel`)}</label>
            <Input
              type="date"
              value={navDate}
              onChange={event => setNavDate(event.target.value)}
              className="mt-1 h-9"
            />
          </div>
        </div>

        <div className="mx-4 mb-3 rounded-lg bg-muted p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t(`${KEY}.subscriptionAmount`)}</span>
            <span className="font-semibold text-foreground">{formatAmount(subscribedAmount)}</span>
          </div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t(`${KEY}.entryFees`, { pct: entryFeesRate.toLocaleString('fr-FR') })}
            </span>
            <span className="font-semibold text-foreground">{formatAmount(entryFees)}</span>
          </div>
          <Separator className="my-3" />
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t(`${KEY}.estimatedShares`)}</span>
            <span className="font-semibold tabular-nums text-foreground">
              {estimate
                ? estimate.shares.toLocaleString('fr-FR', { maximumFractionDigits: 4 })
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{t(`${KEY}.estimatedAmount`)}</span>
            <span className="text-xl font-bold text-primary">
              {estimate ? formatAmount(estimate.amount) : '—'}
            </span>
          </div>
        </div>

        {lastReminderAt && (
          <p className="border-t px-4 py-2 text-xs text-muted-foreground">
            {t(`${KEY}.lastReminder`, { date: lastReminderAt })}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t px-4 py-3">
          <Button variant="outline" className="h-9 gap-1.5 text-xs" onClick={handleSave}>
            <Save className="w-3.5 h-3.5" />
            {t(`${KEY}.save`)}
          </Button>
          <Button
            className="h-9 gap-1.5 text-xs text-white hover:opacity-90"
            style={{ background: PRIMARY_BUTTON_GRADIENT }}
            onClick={() => {
              setState('confirmed');
              toast.success(t(`${KEY}.paymentConfirmed`));
            }}
          >
            <Check className="w-3.5 h-3.5" />
            {t(`${KEY}.confirmPayment`)}
          </Button>
        </div>
      </Card>

      <AlertDialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${KEY}.reminderTitle`)}</AlertDialogTitle>
            <AlertDialogDescription>
              {lastReminderAt
                ? t(`${KEY}.reminderAgain`, { date: lastReminderAt })
                : t(`${KEY}.reminderFirst`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('subscriptions.detail.action.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReminder}>
              {t('subscriptions.detail.action.common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
