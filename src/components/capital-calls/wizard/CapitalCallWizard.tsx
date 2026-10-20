import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, RefreshCw, X } from 'lucide-react';

import { useTranslation } from '../../../utils/languageContext';
import type { Fund } from '../../../utils/fundGenerator';
import type { CapitalCallAttachment, CapitalCallShare, LinkedDistribution } from '../../../utils/capitalCallGenerator';
import {
  ShareInput,
  WizardSubscription,
  emptyShareInput,
  fundCallSettings,
  fundCurrency,
  fundDistributions,
  fundSubscriptions,
  parseNumber,
  pendingForecasts,
  proposedPercent,
  shareAmount,
  simulateCall,
} from '../../../utils/capitalCallWizard';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { BigModal, BigModalContent, BigModalDescription, BigModalTitle } from '../../ui/big-modal';
import { Button } from '../../ui/button';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { DisabledReason } from '../../ui/disabled-reason';
import { cn } from '../../ui/utils';
import { InfoErrors, InfoValues, WizardInfoStep } from './WizardInfoStep';
import { AmountsMode, WizardAmountsStep } from './WizardAmountsStep';
import { WizardControlStep } from './WizardControlStep';

const K = 'funds.capitalCalls.wizard';
const STEPS = ['info', 'amounts', 'control'] as const;
const CREATION_DELAY = 1200;

export interface CapitalCallDraft {
  fund: Fund;
  currency: string;
  name: string;
  dueDate: Date;
  noticeDate: Date | null;
  message: string;
  attachments: CapitalCallAttachment[];
  forecast: { id: number; name: string } | null;
  compensations: LinkedDistribution[];
  shares: CapitalCallShare[];
  calledAmount: number;
  lines: number;
}

interface CapitalCallWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funds: Fund[];
  /** Démonstration : une souscription est activée entre la simulation et la création. */
  subscriptionActivatedMeanwhile: boolean;
  onCreate: (draft: CapitalCallDraft) => void;
}

const emptyInfo = (): InfoValues => ({
  fundId: null,
  name: '',
  dueDate: undefined,
  noticeDate: undefined,
  publication: 'onNotification',
  message: '',
  attachments: [null, null],
  forecastId: null,
  distributionIds: [],
});

export function CapitalCallWizard({ open, onOpenChange, funds, subscriptionActivatedMeanwhile, onCreate }: CapitalCallWizardProps) {
  const { t, lang } = useTranslation();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState<InfoValues>(emptyInfo);
  const [infoErrors, setInfoErrors] = useState<InfoErrors>({});
  const [mode, setMode] = useState<AmountsMode>('perShare');
  const [amountToRaise, setAmountToRaise] = useState('');
  const [inputs, setInputs] = useState<Record<string, ShareInput>>({});
  const [amountErrors, setAmountErrors] = useState<Record<string, string>>({});
  const [lateActivation, setLateActivation] = useState(false);
  const [suspended, setSuspended] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);

  const fund = funds.find(item => item.id === info.fundId) ?? null;
  const settings = useMemo(() => (fund ? fundCallSettings(fund) : null), [fund]);
  const currency = fund ? fundCurrency(fund) : 'EUR';
  const forecasts = useMemo(() => (fund ? pendingForecasts(fund) : []), [fund]);
  const distributions = useMemo(() => (fund ? fundDistributions(fund) : []), [fund]);
  const baseSubscriptions = useMemo(() => (fund ? fundSubscriptions(fund) : []), [fund]);
  const shares = useMemo(() => fund?.shareClasses.map(item => item.name) ?? [], [fund]);

  /** Souscription activée pendant la création, pour le scénario de démonstration. */
  const lateSubscription = useMemo<WizardSubscription | null>(() => {
    const first = baseSubscriptions.find(item => (inputs[item.share] ? shareAmount(inputs[item.share], [item], settings!) > 0 : false));
    if (!first) return null;
    return { ...first, id: `${first.id}-N`, investor: 'Holding Boréal', calledGross: 0, recalled: 0 };
  }, [baseSubscriptions, inputs, settings]);

  const subscriptions = lateActivation && lateSubscription ? [...baseSubscriptions, lateSubscription] : baseSubscriptions;

  useEffect(() => {
    setInputs(Object.fromEntries(shares.map(share => [share, emptyShareInput()])));
    setAmountErrors({});
    setMode('perShare');
    setAmountToRaise('');
    setLateActivation(false);
  }, [shares]);

  const reset = () => {
    setStep(0);
    setInfo(emptyInfo());
    setInfoErrors({});
    setSuspended(null);
    setCreating(false);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const simulation = useMemo(
    () => (settings && info.dueDate && step === 2 ? simulateCall(subscriptions, inputs, info.dueDate, settings) : null),
    [settings, info.dueDate, step, subscriptions, inputs],
  );

  const dirty = info.fundId !== null || info.name.trim() !== '' || Boolean(info.dueDate) || info.message.trim() !== '';

  const requestClose = () => {
    if (creating) return;
    if (dirty) setConfirmClose(true);
    else onOpenChange(false);
  };

  const validateInfo = () => {
    const errors: InfoErrors = {};
    if (!info.fundId) errors.fundId = t(`${K}.errors.fund`);
    if (!info.name.trim()) errors.name = t(`${K}.errors.name`);
    if (!info.dueDate) errors.dueDate = t(`${K}.errors.dueDate`);
    setInfoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAmounts = () => {
    const errors: Record<string, string> = {};
    let called = 0;
    shares.forEach(share => {
      const input = inputs[share];
      const value = parseNumber(input.value);
      if (input.value.trim() !== '' && (value === null || value < 0)) errors[share] = t(`${K}.errors.invalidNumber`);
      else if (settings?.capAt100 && !settings.perUnit && input.kind === 'percent' && value !== null && value > 100) {
        errors[share] = t(`${K}.errors.over100`);
      }
      if (value && value > 0) called += 1;
    });
    if (called === 0 && Object.keys(errors).length === 0) errors._global = t(`${K}.errors.noShare`);
    setAmountErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateInfo()) return;
    if (step === 1 && !validateAmounts()) return;
    setSuspended(null);
    setStep(current => Math.min(current + 1, STEPS.length - 1));
  };

  const changeShare = (share: string, patch: Partial<ShareInput>) => {
    setInputs(prev => ({ ...prev, [share]: { ...prev[share], ...patch } }));
    setAmountErrors(prev => {
      const nextErrors = { ...prev };
      delete nextErrors[share];
      delete nextErrors._global;
      return nextErrors;
    });
  };

  const decimal = (value: number) => new Intl.NumberFormat(lang, { maximumFractionDigits: 2, useGrouping: false }).format(value);

  const applyAmountToRaise = (value: string) => {
    setAmountToRaise(value);
    const amount = parseNumber(value);
    if (amount === null || amount <= 0) return;
    const percent = proposedPercent(amount, subscriptions);
    setInputs(prev =>
      Object.fromEntries(Object.entries(prev).map(([share, input]) => [share, { ...input, kind: 'percent', value: decimal(percent) }])),
    );
  };

  const changeMode = (nextMode: AmountsMode) => {
    setMode(nextMode);
    if (nextMode === 'toRaise' && !amountToRaise) {
      const forecast = forecasts.find(item => item.id === info.forecastId);
      if (forecast) applyAmountToRaise(String(forecast.amount));
    }
  };

  const create = () => {
    if (!simulation || !fund || !settings || !info.dueDate || simulation.blockers.length > 0) return;
    // Le calcul est refait à la création ; un écart avec la simulation suspend la création.
    const current =
      subscriptionActivatedMeanwhile && !lateActivation && lateSubscription
        ? simulateCall([...baseSubscriptions, lateSubscription], inputs, info.dueDate, settings)
        : simulation;
    if (current.lines.length !== simulation.lines.length) {
      setSuspended(current.lines.length - simulation.lines.length);
      return;
    }
    setCreating(true);
    window.setTimeout(() => {
      const calledShares: CapitalCallShare[] = shares
        .map(share => {
          const input = inputs[share];
          const value = parseNumber(input.value) ?? 0;
          return {
            share,
            mode: settings.perUnit ? 'perUnit' : input.kind === 'percent' ? 'percent' : 'totalAmount',
            value,
            entryFeesCalled: input.callEntryFees,
            premiumCalled: input.callPremium,
            releasedAmount: parseNumber(input.recall) ?? 0,
            restrictedTo: input.restriction?.length ?? null,
          } satisfies CapitalCallShare;
        })
        .filter(share => share.value > 0);
      const forecast = forecasts.find(item => item.id === info.forecastId);
      onCreate({
        fund,
        currency,
        name: info.name.trim(),
        dueDate: info.dueDate!,
        noticeDate: info.noticeDate ?? null,
        message: info.message,
        attachments: info.attachments.filter((file): file is CapitalCallAttachment => Boolean(file)),
        forecast: forecast ? { id: forecast.id, name: forecast.name } : null,
        compensations: distributions
          .filter(item => info.distributionIds.includes(item.id))
          .map(item => ({ id: item.id, name: item.name })),
        shares: calledShares,
        calledAmount: simulation.total,
        lines: simulation.lines.length,
      });
      setCreating(false);
      onOpenChange(false);
    }, CREATION_DELAY);
  };

  const createDisabledReason = simulation?.blockers.length ? t(`${K}.createBlocked`) : null;
  const stepLabel = (index: number) => t(`${K}.steps.${STEPS[index]}`);

  return (
    <>
      <BigModal open={open} onOpenChange={value => (value ? onOpenChange(true) : requestClose())}>
        <BigModalContent className="gap-0 p-0">
          <BigModalTitle className="sr-only">{t(`${K}.title`)}</BigModalTitle>
          <BigModalDescription className="sr-only">{t(`${K}.subtitle`)}</BigModalDescription>
          <div className="flex h-full flex-col overflow-hidden rounded-3xl">
            <div className="border-b border-border bg-card px-8 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{t(`${K}.title`)}</h2>
                    <p className="text-xs text-muted-foreground">
                      {fund ? fund.name : t(`${K}.subtitle`)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={requestClose}
                  variant="ghost"
                  size="icon"
                  aria-label={t(`${K}.close`)}
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <ol className="mt-4 flex items-center gap-2" aria-label={t(`${K}.stepsLabel`)}>
                {STEPS.map((id, index) => (
                  <li key={id} className="flex flex-1 items-center gap-2">
                    <span
                      aria-current={index === step ? 'step' : undefined}
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                        index < step && 'bg-primary text-primary-foreground',
                        index === step && 'bg-primary text-primary-foreground ring-2 ring-offset-2',
                        index > step && 'bg-muted text-muted-foreground',
                      )}
                    >
                      {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className={cn('text-sm', index === step ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                      {stepLabel(index)}
                    </span>
                    {index < STEPS.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden />}
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/40 px-8 py-6">
              {step === 0 && (
                <WizardInfoStep
                  funds={funds}
                  values={info}
                  errors={infoErrors}
                  settings={settings}
                  forecasts={forecasts}
                  distributions={distributions}
                  currency={currency}
                  onChange={patch => {
                    setInfo(prev => ({ ...prev, ...patch }));
                    setInfoErrors(prev => {
                      const nextErrors = { ...prev };
                      Object.keys(patch).forEach(key => delete nextErrors[key as keyof InfoErrors]);
                      return nextErrors;
                    });
                  }}
                />
              )}
              {step === 1 && settings && (
                <div className="space-y-4">
                  {amountErrors._global && (
                    <Alert variant="destructive">
                      <AlertDescription>{amountErrors._global}</AlertDescription>
                    </Alert>
                  )}
                  <WizardAmountsStep
                    shares={shares}
                    subscriptions={subscriptions}
                    settings={settings}
                    currency={currency}
                    inputs={inputs}
                    mode={mode}
                    amountToRaise={amountToRaise}
                    errors={amountErrors}
                    onModeChange={changeMode}
                    onAmountToRaiseChange={applyAmountToRaise}
                    onShareChange={changeShare}
                  />
                </div>
              )}
              {step === 2 && simulation && settings && fund && info.dueDate && (
                <div className="space-y-4">
                  {suspended !== null && (
                    <Alert variant="destructive">
                      <RefreshCw className="h-4 w-4" />
                      <AlertTitle>{t(`${K}.suspended.title`)}</AlertTitle>
                      <AlertDescription>
                        <span>
                          {t(
                            Math.abs(suspended) === 1
                              ? suspended > 0
                                ? `${K}.suspended.moreOne`
                                : `${K}.suspended.lessOne`
                              : suspended > 0
                                ? `${K}.suspended.moreMany`
                                : `${K}.suspended.lessMany`,
                            { count: Math.abs(suspended) },
                          )}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 gap-1.5"
                          onClick={() => {
                            setLateActivation(true);
                            setSuspended(null);
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                          {t(`${K}.suspended.refresh`)}
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  <WizardControlStep
                    simulation={simulation}
                    settings={settings}
                    currency={currency}
                    callName={info.name}
                    fundName={fund.name}
                    dueDate={info.dueDate}
                  />
                </div>
              )}
            </div>

            <div className="border-t border-border bg-muted px-8 py-4">
              <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" size="sm" className="h-9" onClick={requestClose} disabled={creating}>
                  <X className="mr-1 h-4 w-4" />
                  {t(`${K}.cancel`)}
                </Button>
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button variant="outline" size="sm" className="h-9" onClick={() => setStep(step - 1)} disabled={creating}>
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      {t(`${K}.previous`)}
                    </Button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <Button size="sm" className="h-9 min-w-[140px]" onClick={next}>
                      {t(`${K}.next`)}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  ) : (
                    <DisabledReason reason={createDisabledReason}>
                      <Button
                        size="sm"
                        className="h-9 min-w-[180px]"
                        onClick={create}
                        disabled={creating || Boolean(createDisabledReason) || suspended !== null}
                      >
                        {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        {creating ? t(`${K}.creating`) : t(`${K}.create`)}
                      </Button>
                    </DisabledReason>
                  )}
                </div>
              </div>
              {step === 2 && simulation && (
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  {t(`${K}.nothingSaved`, {
                    amount: new Intl.NumberFormat(lang, { style: 'currency', currency, minimumFractionDigits: 2 }).format(
                      simulation.total,
                    ),
                  })}
                </p>
              )}
            </div>
          </div>
        </BigModalContent>
      </BigModal>

      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title={t(`${K}.abandon.title`)}
        description={t(`${K}.abandon.description`)}
        confirmLabel={t(`${K}.abandon.confirm`)}
        cancelLabel={t(`${K}.abandon.cancel`)}
        destructive
        onConfirm={() => {
          setConfirmClose(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
