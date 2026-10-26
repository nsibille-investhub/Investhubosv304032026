import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, PencilLine, RefreshCw, Save, Trash2, X } from 'lucide-react';

import { useTranslation } from '../../../utils/languageContext';
import type { Fund } from '../../../utils/fundGenerator';
import type {
  CapitalCall,
  CapitalCallAttachment,
  CapitalCallDraftProgress,
  CapitalCallShare,
  LinkedDistribution,
} from '../../../utils/capitalCallGenerator';
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
import { Button } from '../../ui/button';
import { ConfirmDialog } from '../../ui/confirm-dialog';
import { DisabledReason } from '../../ui/disabled-reason';
import { PageHeader } from '../../ui/page-header';
import { WizardPageFooter, WizardStepsBar } from '../../ui/wizard-steps';
import { StatusBadge } from '../../StatusBadge';
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
  publication: 'onNotification' | 'immediate';
}

interface CapitalCallWizardProps {
  funds: Fund[];
  /** Brouillon repris depuis le listing ; absent pour un nouvel appel. */
  draftCall: CapitalCall | null;
  /** Démonstration : une souscription est activée entre la simulation et la création. */
  subscriptionActivatedMeanwhile: boolean;
  /** Enregistre le brouillon (création à la première étape, mise à jour ensuite) et renvoie son identifiant. */
  onSaveDraft: (id: number | null, draft: CapitalCallDraft, progress: CapitalCallDraftProgress) => number;
  onCreate: (id: number | null, draft: CapitalCallDraft) => void;
  onDeleteDraft: (id: number) => void;
  onExit: () => void;
}

const infoFromCall = (call: CapitalCall): InfoValues => ({
  fundId: call.fundId,
  name: call.name,
  dueDate: call.dueDate,
  noticeDate: call.noticeDate ?? undefined,
  publication: call.publication,
  message: call.message,
  attachments: [call.attachments[0] ?? null, call.attachments[1] ?? null],
  forecastId: call.forecast?.id ?? null,
  distributionIds: call.compensations.map(item => item.id),
});

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

export function CapitalCallWizard({
  funds,
  draftCall,
  subscriptionActivatedMeanwhile,
  onSaveDraft,
  onCreate,
  onDeleteDraft,
  onExit,
}: CapitalCallWizardProps) {
  const { t, lang } = useTranslation();
  const [draftId, setDraftId] = useState<number | null>(draftCall?.id ?? null);
  const [step, setStep] = useState(draftCall?.draft?.step ?? 0);
  const [info, setInfo] = useState<InfoValues>(() => (draftCall ? infoFromCall(draftCall) : emptyInfo()));
  const [infoErrors, setInfoErrors] = useState<InfoErrors>({});
  const [mode, setMode] = useState<AmountsMode>(draftCall?.draft?.mode ?? 'perShare');
  const [amountToRaise, setAmountToRaise] = useState(draftCall?.draft?.amountToRaise ?? '');
  const [inputs, setInputs] = useState<Record<string, ShareInput>>(() => {
    const draftFund = draftCall ? funds.find(item => item.id === draftCall.fundId) : undefined;
    return Object.fromEntries(
      (draftFund?.shareClasses ?? []).map(item => [item.name, draftCall?.draft?.inputs[item.name] ?? emptyShareInput()]),
    );
  });
  /** Saisie du brouillon repris, appliquée une seule fois quand les parts du fonds sont connues. */
  const restoredInputs = useRef<Record<string, ShareInput> | null>(draftCall?.draft?.inputs ?? null);
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
    const restored = restoredInputs.current;
    restoredInputs.current = null;
    setInputs(Object.fromEntries(shares.map(share => [share, restored?.[share] ?? emptyShareInput()])));
    setAmountErrors({});
    setLateActivation(false);
    if (restored) return;
    setMode('perShare');
    setAmountToRaise('');
  }, [shares]);

  const simulation = useMemo(
    () => (settings && info.dueDate && step === 2 ? simulateCall(subscriptions, inputs, info.dueDate, settings) : null),
    [settings, info.dueDate, step, subscriptions, inputs],
  );

  const dirty = info.fundId !== null || info.name.trim() !== '' || Boolean(info.dueDate) || info.message.trim() !== '';

  const requestClose = () => {
    if (creating) return;
    if (dirty) setConfirmClose(true);
    else onExit();
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
    goTo(Math.min(step + 1, STEPS.length - 1));
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

  const buildDraft = (calledAmount: number, lines: number): CapitalCallDraft | null => {
    if (!fund || !info.dueDate) return null;
    const calledShares: CapitalCallShare[] = shares
      .map(share => {
        const input = inputs[share] ?? emptyShareInput();
        const value = parseNumber(input.value) ?? 0;
        return {
          share,
          mode: settings?.perUnit ? 'perUnit' : input.kind === 'percent' ? 'percent' : 'totalAmount',
          value,
          entryFeesCalled: input.callEntryFees,
          premiumCalled: input.callPremium,
          releasedAmount: parseNumber(input.recall) ?? 0,
          restrictedTo: input.restriction?.length ?? null,
        } satisfies CapitalCallShare;
      })
      .filter(share => share.value > 0);
    const forecast = forecasts.find(item => item.id === info.forecastId);
    return {
      fund,
      currency,
      name: info.name.trim(),
      dueDate: info.dueDate,
      noticeDate: info.noticeDate ?? null,
      message: info.message,
      attachments: info.attachments.filter((file): file is CapitalCallAttachment => Boolean(file)),
      forecast: forecast ? { id: forecast.id, name: forecast.name } : null,
      compensations: distributions
        .filter(item => info.distributionIds.includes(item.id))
        .map(item => ({ id: item.id, name: item.name })),
      shares: calledShares,
      calledAmount,
      lines,
      publication: info.publication,
    };
  };

  /** Le brouillon n'a ni ligne ni avis : il ne pèse sur aucun autre appel ni sur les souscriptions. */
  const saveDraft = (nextStep: number) => {
    const total = settings && info.dueDate ? simulateCall(subscriptions, inputs, info.dueDate, settings).total : 0;
    const draft = buildDraft(total, 0);
    if (!draft) return null;
    const id = onSaveDraft(draftId, draft, { step: nextStep, mode, amountToRaise, inputs });
    setDraftId(id);
    return id;
  };

  const goTo = (nextStep: number) => {
    setSuspended(null);
    setStep(nextStep);
    saveDraft(nextStep);
  };

  const saveAndExit = () => {
    if (!validateInfo()) {
      setStep(0);
      return;
    }
    saveDraft(step);
    onExit();
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
      const draft = buildDraft(simulation.total, simulation.lines.length);
      setCreating(false);
      if (draft) onCreate(draftId, draft);
    }, CREATION_DELAY);
  };

  const createDisabledReason = simulation?.blockers.length ? t(`${K}.createBlocked`) : null;
  const stepLabel = (index: number) => t(`${K}.steps.${STEPS[index]}`);

  return (
    <>
      <PageHeader
        hideBackButton
        title={
          <span className="inline-flex items-center gap-3">
            {info.name.trim() || t(`${K}.title`)}
            {draftId !== null && (
              <StatusBadge label={t('funds.capitalCalls.callStates.draft')} variant="outline" icon={PencilLine} />
            )}
          </span>
        }
        subtitle={fund ? fund.name : t(`${K}.subtitle`)}
        tertiaryActions={
          draftId !== null
            ? [
                {
                  label: t(`${K}.deleteDraft`),
                  icon: <Trash2 className="h-4 w-4" />,
                  destructive: true,
                  onClick: () => onDeleteDraft(draftId),
                },
              ]
            : undefined
        }
      />

      <WizardStepsBar steps={STEPS.map((_, index) => stepLabel(index))} current={step} ariaLabel={t(`${K}.stepsLabel`)} />

      <div className="flex-1 px-8 py-6">
        <div className="mx-auto w-full max-w-6xl">
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
      </div>

      <WizardPageFooter
        start={
          draftId !== null ? (
            <Button variant="ghost" size="sm" className="h-9" onClick={saveAndExit} disabled={creating}>
              <Save className="mr-1 h-4 w-4" />
              {t(`${K}.saveAndExit`)}
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="h-9" onClick={requestClose} disabled={creating}>
              <X className="mr-1 h-4 w-4" />
              {t(`${K}.cancel`)}
            </Button>
          )
        }
        end={
          <>
            {step === 2 && simulation && (
              <span className="mr-2 text-xs text-muted-foreground">
                {t(`${K}.nothingSaved`, {
                  amount: new Intl.NumberFormat(lang, { style: 'currency', currency, minimumFractionDigits: 2 }).format(
                    simulation.total,
                  ),
                })}
              </span>
            )}
            {step > 0 && (
              <Button variant="outline" size="sm" className="h-9" onClick={() => goTo(step - 1)} disabled={creating}>
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
          </>
        }
      />

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
          onExit();
        }}
      />
    </>
  );
}
