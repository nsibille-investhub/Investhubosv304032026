import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Check,
  CheckCircle2,
  Clock,
  Handshake,
  PenTool,
  RotateCcw,
  Send,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import { SignatoriesListDialog, type SignatoryRow } from './SignatoriesListDialog';
import { useTranslation } from '../utils/languageContext';
import {
  SUBSCRIPTION_TYPE_LABEL_KEYS,
  type SubscriptionType,
} from '../utils/subscriptionGenerator';
import { mockFundCounterSignatories } from '../utils/subscriptionDetailMockData';
import { isSubscriptionTypeSet, useSubscriptionDemo } from '../utils/subscriptionDemoContext';

const KEY = 'subscriptions.detail.action';
const CURRENT_OPERATOR = 'Jean Dault';
const SUBSCRIPTION_TYPES: SubscriptionType[] = ['free', 'commitment', 'capitalCall'];
const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

type InternalValidation = 'none' | 'requested' | 'refused' | 'granted';

interface SubscriptionActionPanelProps {
  subscription: any;
  /** Réponses refusées au contrôle : premier garde-fou avant validation. */
  invalidQuestions: number;
  /** Pièces sans date d'émission alors qu'elle est exigée. */
  missingIssueDates: number;
  investorEmail: string;
  onOpenSignature: () => void;
}

const stamp = () => {
  const date = new Date();
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

function buildSignatoryRows(subscription: any, counterSignatoryId: string | null): SignatoryRow[] {
  const investorName: string =
    subscription?.contrepartie?.mainContact ||
    subscription?.contrepartie?.investor ||
    subscription?.contrepartie?.name ||
    '';

  const rows: SignatoryRow[] = [
    {
      id: 'signatory-0',
      name: investorName,
      email: subscription?.email ?? '',
      phone: subscription?.phone,
      order: 1,
      counterSignatory: false,
    },
  ];

  mockFundCounterSignatories.forEach((item, index) => {
    rows.push({
      id: item.id,
      name: item.name,
      email: item.email,
      order: rows.length + index + 1,
      counterSignatory: true,
      pendingValidation: counterSignatoryId !== null && counterSignatoryId !== item.id,
    });
  });

  return rows;
}

function Mention({
  icon: Icon,
  tone,
  children,
}: {
  icon: typeof Clock;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}) {
  const toneClass = {
    neutral: 'bg-muted text-muted-foreground',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
  }[tone];

  return (
    <p className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${toneClass}`}>
      <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/**
 * Panneau Action de la fiche : le type de souscription commande l'ouverture des
 * actions, puis l'état du dossier, le paramétrage et les droits commandent les
 * boutons proposés. Une action indisponible reste affichée, désactivée avec son
 * motif.
 */
export function SubscriptionActionPanel({
  subscription,
  invalidQuestions,
  missingIssueDates,
  investorEmail,
  onOpenSignature,
}: SubscriptionActionPanelProps) {
  const { t } = useTranslation();
  const { config } = useSubscriptionDemo();
  const { state, settings, rights } = config;

  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>(
    (subscription?.subscriptionType as SubscriptionType) ?? 'commitment',
  );
  const [typeValidated, setTypeValidated] = useState(() => isSubscriptionTypeSet(config));

  const [internalValidation, setInternalValidation] = useState<InternalValidation>(() => {
    if (state === 'awaitingInternalValidation') return 'requested';
    if (state === 'inProgress') return 'none';
    return 'granted';
  });
  const [requestedAt, setRequestedAt] = useState<string | null>(
    state === 'awaitingInternalValidation' ? '17/09/2026 09:12' : null,
  );
  const [decisionBy, setDecisionBy] = useState<string | null>(null);
  const [decisionAt, setDecisionAt] = useState<string | null>(null);
  const [refusalReason, setRefusalReason] = useState('');
  const [refusalDraft, setRefusalDraft] = useState('');

  const [kycValidated, setKycValidated] = useState(false);
  const [reopenedAt, setReopenedAt] = useState<string | null>(null);
  const [preSignatureAt, setPreSignatureAt] = useState<string | null>(null);
  const [signatureRequestedAt, setSignatureRequestedAt] = useState<string | null>(
    state === 'signing' ? '19/09/2026 11:40' : null,
  );
  const [paymentReminderAt, setPaymentReminderAt] = useState<string | null>(
    state === 'active' ? '02/10/2026 08:30' : null,
  );
  const [counterSignatoryId, setCounterSignatoryId] = useState<string | null>(
    mockFundCounterSignatories[0]?.id ?? null,
  );

  const [signatoriesOpen, setSignatoriesOpen] = useState(false);
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [noSignatureOpen, setNoSignatureOpen] = useState(false);
  const [validationDate, setValidationDate] = useState('');
  const [validationDateError, setValidationDateError] = useState<string | null>(null);
  const [guard, setGuard] = useState<{ reasons: string[]; run: () => void } | null>(null);
  const [confirm, setConfirm] = useState<{ titleKey: string; run: () => void } | null>(null);

  const signatoryRows = useMemo(
    () => buildSignatoryRows(subscription, counterSignatoryId),
    [subscription, counterSignatoryId],
  );

  /** Les trois garde-fous de la V1, évalués avant toute validation. */
  const guardReasons = (target: 'validation' | 'signature'): string[] => {
    const reasons: string[] = [];
    if (missingIssueDates > 0) {
      reasons.push(t(`${KEY}.guards.missingIssueDates`, { count: missingIssueDates }));
    }
    if (invalidQuestions > 0) {
      reasons.push(t(`${KEY}.guards.invalidQuestions`, { count: invalidQuestions }));
    }
    if (target === 'signature') {
      if (signatureRequestedAt) {
        reasons.push(t(`${KEY}.guards.signatureAlreadyRequested`, { date: signatureRequestedAt }));
      }
      if (!investorEmail) {
        reasons.push(t(`${KEY}.guards.noInvestorEmail`));
      }
    }
    return reasons;
  };

  const runGuarded = (target: 'validation' | 'signature', run: () => void) => {
    const reasons = guardReasons(target);
    if (reasons.length > 0) {
      setGuard({ reasons, run });
      return;
    }
    run();
  };

  const handleValidateType = () => {
    setTypeValidated(true);
    toast.success(t(`${KEY}.toast.typeValidated`), {
      description: t(SUBSCRIPTION_TYPE_LABEL_KEYS[subscriptionType]),
    });
  };

  const handleRequestValidation = () => {
    const at = stamp();
    setInternalValidation('requested');
    setRequestedAt(at);
    toast.success(t(`${KEY}.toast.validationRequested`), { description: at });
  };

  const handleValidateFile = () => {
    const at = stamp();
    setInternalValidation('granted');
    setDecisionAt(at);
    setDecisionBy(CURRENT_OPERATOR);
    toast.success(t(`${KEY}.toast.fileValidated`), { description: at });
  };

  const handleRefuseFile = () => {
    if (!refusalDraft.trim()) {
      toast.error(t(`${KEY}.toast.refusalReasonRequired`));
      return;
    }
    setInternalValidation('refused');
    setRefusalReason(refusalDraft.trim());
    setDecisionBy(CURRENT_OPERATOR);
    setDecisionAt(stamp());
    setRefuseOpen(false);
    setRefusalDraft('');
    toast.info(t(`${KEY}.toast.fileRefused`));
  };

  const handleValidateKyc = (thenSign: boolean) => {
    setKycValidated(true);
    setReopenedAt(null);
    if (thenSign) {
      const at = stamp();
      setSignatureRequestedAt(at);
      toast.success(t(`${KEY}.toast.kycValidatedAndSent`), { description: at });
      onOpenSignature();
      return;
    }
    toast.success(t(`${KEY}.toast.kycValidated`));
  };

  const handleReopenKyc = () => {
    setKycValidated(false);
    setReopenedAt(stamp());
    toast.info(t(`${KEY}.toast.kycReopened`));
  };

  const handleSign = () => {
    const at = stamp();
    setSignatureRequestedAt(at);
    toast.success(t(`${KEY}.toast.signatureRequested`), { description: at });
    onOpenSignature();
  };

  const handlePartnerSignature = () => {
    const at = stamp();
    setPreSignatureAt(at);
    toast.success(t(`${KEY}.toast.partnerSignaturePrepared`), { description: at });
  };

  const handleValidateWithoutSignature = () => {
    if (!DATE_PATTERN.test(validationDate)) {
      setValidationDateError(t(`${KEY}.withoutSignature.invalidDate`));
      return;
    }
    const [day, month, year] = validationDate.split('/').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getDate() !== day ||
      parsed.getMonth() !== month - 1 ||
      parsed.getFullYear() !== year
    ) {
      setValidationDateError(t(`${KEY}.withoutSignature.invalidDate`));
      return;
    }
    setValidationDateError(null);
    setNoSignatureOpen(false);
    toast.success(t(`${KEY}.toast.validatedWithoutSignature`), { description: validationDate });
  };

  const handlePaymentReminder = () => {
    const at = stamp();
    setPaymentReminderAt(at);
    toast.success(t(`${KEY}.toast.paymentReminderSent`), { description: at });
  };

  const disabledForRight = t(`${KEY}.disabled.noFundRight`);

  return (
    <Card className="shadow-sm overflow-hidden p-0 gap-0">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.title`)}</h3>
          <p className={WIDGET_SUBTITLE_CLASS}>{t(`${KEY}.subtitle`)}</p>
        </div>
        <Badge className="bg-muted text-muted-foreground text-xs shrink-0">
          {t(`subscriptions.detail.demo.states.${state}`)}
        </Badge>
      </div>

      {/* Type de souscription : tant qu'il n'est pas pose, la suite reste fermee. */}
      <div className="border-b px-4 py-3">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t(`${KEY}.subscriptionType.label`)}
        </label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Select
            value={subscriptionType}
            disabled={typeValidated}
            onValueChange={value => setSubscriptionType(value as SubscriptionType)}
          >
            <SelectTrigger className="h-9 w-[220px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUBSCRIPTION_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  {t(SUBSCRIPTION_TYPE_LABEL_KEYS[type])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {typeValidated ? (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
              <Check className="w-3 h-3 mr-1" />
              {t(`${KEY}.subscriptionType.validated`)}
            </Badge>
          ) : (
            <Button size="sm" className="h-9 gap-1.5 text-xs" onClick={handleValidateType}>
              <Check className="w-3.5 h-3.5" />
              {t(`${KEY}.subscriptionType.validate`)}
            </Button>
          )}
        </div>
        {!typeValidated && (
          <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {t(`${KEY}.subscriptionType.gate`)}
          </p>
        )}
      </div>

      {typeValidated && (
        <div className="space-y-3 px-4 py-3">
          {settings.directSignaturePartner && (
            <Mention icon={Handshake} tone="neutral">
              {t(`${KEY}.mentions.directSignaturePartner`)}
            </Mention>
          )}

          {/* Dossier en cours, validation interne activee */}
          {state === 'inProgress' && settings.internalValidation && (
            <>
              {internalValidation === 'refused' && (
                <Mention icon={Ban} tone="danger">
                  {t(`${KEY}.mentions.internalRefused`, { name: decisionBy ?? '' })}
                  <span className="mt-0.5 block italic">{refusalReason}</span>
                </Mention>
              )}
              <Button
                className="h-9 w-full gap-1.5 text-xs text-white hover:opacity-90"
                style={{ background: PRIMARY_BUTTON_GRADIENT }}
                onClick={() => runGuarded('validation', handleRequestValidation)}
              >
                <Send className="w-3.5 h-3.5" />
                {t(`${KEY}.buttons.sendToValidation`)}
              </Button>
            </>
          )}

          {/* Validation interne demandee */}
          {state === 'awaitingInternalValidation' && internalValidation === 'requested' && (
            <>
              <Mention icon={Clock} tone="warning">
                {t(`${KEY}.mentions.validationRequested`, {
                  date: requestedAt ?? '',
                  name: 'Marie Dubois',
                })}
              </Mention>

              {rights.validateFund ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="h-9 flex-1 gap-1.5 text-xs text-white hover:opacity-90"
                    style={{ background: PRIMARY_BUTTON_GRADIENT }}
                    onClick={() =>
                      setConfirm({ titleKey: `${KEY}.confirm.validateFile`, run: handleValidateFile })
                    }
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t(`${KEY}.buttons.validateFile`)}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-9 flex-1 gap-1.5 text-xs text-red-700 border-red-200 hover:bg-red-50"
                    onClick={() => setRefuseOpen(true)}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {t(`${KEY}.buttons.refuseFile`)}
                  </Button>
                </div>
              ) : (
                <Mention icon={ShieldCheck} tone="neutral">
                  {t(`${KEY}.disabled.noFundRight`)}
                </Mention>
              )}
            </>
          )}

          {internalValidation === 'granted' && decisionAt && (
            <Mention icon={CheckCircle2} tone="success">
              {t(`${KEY}.mentions.internalValidated`, {
                date: decisionAt,
                name: decisionBy ?? CURRENT_OPERATOR,
              })}
            </Mention>
          )}

          {/* Dossier en cours, sans validation interne : le KYC se valide ici */}
          {state === 'inProgress' && !settings.internalValidation && (
            <div className="flex flex-wrap gap-2">
              <Button
                className="h-9 gap-1.5 text-xs text-white hover:opacity-90"
                style={{ background: PRIMARY_BUTTON_GRADIENT }}
                onClick={() => runGuarded('validation', () => handleValidateKyc(false))}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t(`${KEY}.buttons.validateKyc`)}
              </Button>
              <Button
                variant="outline"
                className="h-9 gap-1.5 text-xs"
                onClick={() => runGuarded('signature', () => handleValidateKyc(true))}
              >
                <PenTool className="w-3.5 h-3.5" />
                {t(`${KEY}.buttons.validateKycAndSign`)}
              </Button>
              <Button
                variant="outline"
                className="h-9 gap-1.5 text-xs"
                onClick={() => setSignatoriesOpen(true)}
              >
                <Users className="w-3.5 h-3.5" />
                {t(`${KEY}.buttons.viewSignatories`)}
              </Button>
              <Button
                variant="ghost"
                className="h-9 gap-1.5 text-xs"
                disabled={!kycValidated}
                title={kycValidated ? undefined : t(`${KEY}.disabled.kycNotValidated`)}
                onClick={handleReopenKyc}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t(`${KEY}.buttons.reopenKyc`)}
              </Button>
            </div>
          )}

          {/* Dossier valide, en attente de signature */}
          {(state === 'validatedAwaitingSignature' || state === 'signing') && (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="h-9 gap-1.5 text-xs text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  onClick={() => runGuarded('signature', handleSign)}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  {t(`${KEY}.buttons.sign`)}
                </Button>

                {settings.partnerSignature ? (
                  <Button
                    variant="outline"
                    className="h-9 gap-1.5 text-xs"
                    onClick={handlePartnerSignature}
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    {t(`${KEY}.buttons.preparePartnerSignature`)}
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button variant="outline" className="h-9 gap-1.5 text-xs" disabled>
                          <Handshake className="w-3.5 h-3.5" />
                          {t(`${KEY}.buttons.preparePartnerSignature`)}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span className="text-xs">{t(`${KEY}.disabled.partnerSignatureOff`)}</span>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Button
                  variant="outline"
                  className="h-9 gap-1.5 text-xs"
                  disabled={!rights.validateFund}
                  title={rights.validateFund ? undefined : disabledForRight}
                  onClick={() => setNoSignatureOpen(true)}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t(`${KEY}.buttons.validateWithoutSignature`)}
                </Button>

                <Button
                  variant="outline"
                  className="h-9 gap-1.5 text-xs"
                  onClick={() => setSignatoriesOpen(true)}
                >
                  <Users className="w-3.5 h-3.5" />
                  {t(`${KEY}.buttons.viewSignatories`)}
                </Button>
              </div>

              {settings.counterSignatoryChoice && (
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t(`${KEY}.counterSignatory.label`)}
                  </label>
                  <Select
                    value={counterSignatoryId ?? ''}
                    onValueChange={value => setCounterSignatoryId(value)}
                  >
                    <SelectTrigger className="mt-1.5 h-9 w-full text-sm">
                      <SelectValue placeholder={t(`${KEY}.counterSignatory.placeholder`)} />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFundCounterSignatories.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}

          {state === 'active' && (
            <>
              <Mention icon={CheckCircle2} tone="success">
                {t(`${KEY}.mentions.activeSubscription`)}
              </Mention>
              <Button variant="outline" className="h-9 gap-1.5 text-xs" onClick={handlePaymentReminder}>
                <Send className="w-3.5 h-3.5" />
                {t(`${KEY}.buttons.remindPayment`)}
              </Button>
            </>
          )}

          {state === 'transferred' && (
            <Mention icon={AlertTriangle} tone="warning">
              {t(`${KEY}.mentions.transferred`)}
            </Mention>
          )}

          {/* Mentions horodatees communes */}
          <div className="space-y-1.5">
            {signatureRequestedAt && (
              <Mention icon={PenTool} tone="neutral">
                {t(`${KEY}.mentions.signatureRequested`, { date: signatureRequestedAt })}
              </Mention>
            )}
            {preSignatureAt && (
              <Mention icon={Clock} tone="neutral">
                {t(`${KEY}.mentions.preSignature`, { date: preSignatureAt })}
              </Mention>
            )}
            {reopenedAt && (
              <Mention icon={RotateCcw} tone="warning">
                {t(`${KEY}.mentions.reopened`, { date: reopenedAt })}
              </Mention>
            )}
            {paymentReminderAt && (
              <Mention icon={Send} tone="neutral">
                {t(`${KEY}.mentions.paymentReminder`, { date: paymentReminderAt })}
              </Mention>
            )}
          </div>
        </div>
      )}

      <SignatoriesListDialog
        open={signatoriesOpen}
        onOpenChange={setSignatoriesOpen}
        rows={signatoryRows}
      />

      {/* Refus du dossier : explications obligatoires */}
      <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t(`${KEY}.refuse.title`)}</DialogTitle>
            <DialogDescription>{t(`${KEY}.refuse.subtitle`)}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={refusalDraft}
            onChange={event => setRefusalDraft(event.target.value)}
            placeholder={t(`${KEY}.refuse.placeholder`)}
            className="min-h-[110px]"
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRefuseOpen(false)}>
              {t('subscriptions.detail.action.common.cancel')}
            </Button>
            <Button
              size="sm"
              className="text-white"
              disabled={!refusalDraft.trim()}
              onClick={handleRefuseFile}
            >
              {t(`${KEY}.refuse.confirm`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Validation sans signature : date saisie au format JJ/MM/AAAA */}
      <Dialog open={noSignatureOpen} onOpenChange={setNoSignatureOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{t(`${KEY}.withoutSignature.title`)}</DialogTitle>
            <DialogDescription>{t(`${KEY}.withoutSignature.subtitle`)}</DialogDescription>
          </DialogHeader>
          <div>
            <label className="text-xs text-muted-foreground">
              {t(`${KEY}.withoutSignature.dateLabel`)}
            </label>
            <Input
              value={validationDate}
              onChange={event => {
                setValidationDate(event.target.value);
                setValidationDateError(null);
              }}
              placeholder="JJ/MM/AAAA"
              className="mt-1 h-9"
            />
            {validationDateError && (
              <p className="mt-1 text-xs text-red-600">{validationDateError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNoSignatureOpen(false)}>
              {t('subscriptions.detail.action.common.cancel')}
            </Button>
            <Button size="sm" className="text-white" onClick={handleValidateWithoutSignature}>
              {t(`${KEY}.withoutSignature.confirm`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Garde-fous : la V1 laisse passer apres confirmation explicite */}
      <AlertDialog open={guard !== null} onOpenChange={open => !open && setGuard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t(`${KEY}.guards.title`)}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <ul className="list-disc space-y-1 pl-4">
                  {guard?.reasons.map(reason => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
                <p className="mt-2">{t(`${KEY}.guards.question`)}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('subscriptions.detail.action.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                guard?.run();
                setGuard(null);
              }}
            >
              {t(`${KEY}.guards.confirm`)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirm !== null} onOpenChange={open => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm ? t(confirm.titleKey) : ''}</AlertDialogTitle>
            <AlertDialogDescription>{t(`${KEY}.confirm.subtitle`)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('subscriptions.detail.action.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirm?.run();
                setConfirm(null);
              }}
            >
              {t('subscriptions.detail.action.common.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
