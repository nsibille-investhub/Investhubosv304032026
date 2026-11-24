import { useState, type ReactNode } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileCheck,
  FileText,
  Landmark,
  Lock,
  Mail,
  Pencil,
  PenTool,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ConfirmDialog } from './ui/confirm-dialog';
import { DisabledReason } from './ui/disabled-reason';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn, WIDGET_LABEL_CLASS, WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import { DetailLink } from './ui/detail-summary';
import { RowActionButton } from './ui/row-actions';
import { type ComplianceStatus } from './SubscriptionComplianceSection';
import {
  mockFundCounterSignatories,
  mockSignaturePack,
  type MockSignaturePackDocument,
} from '../utils/subscriptionDetailMockData';
import { MAIL_TEMPLATES } from '../utils/mailTemplatesMockData';
import { downloadCsv } from '../utils/capitalCallRecipients';

export type SignatureStage = 'draft' | 'signing' | 'counterSigning' | 'completed';

type PartyStatus = 'notSent' | 'sent' | 'signed';
type PartyKind = 'signatory' | 'counterSignatory';

interface SignatureParty {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  source: 'investor' | 'fund' | 'manual';
  included: boolean;
  status: PartyStatus;
  sentAt?: string;
  signedAt?: string;
  remindedAt?: string;
  reminders: number;
}

export interface ComplianceSummary {
  status: ComplianceStatus;
  by: string | null;
  at: string | null;
}

interface SubscriptionSignatureStepProps {
  subscription: any;
  compliance: ComplianceSummary;
  onOpenCompliance: () => void;
  onProceedToPayment: () => void;
}

const KEY = 'subscriptions.detail.signatureStep';

/** Gabarit d'envoi du lien de signature, à défaut de gabarit spécifique sur la part. */
const SIGNATURE_TEMPLATE = MAIL_TEMPLATES.find(template => template.slug === 'signature_doc');

const now = () => {
  const date = new Date();
  return `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
};

const toMockEmail = (name: string) =>
  `${name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z\s-]/g, '')
    .trim()
    .replace(/\s+/g, '.')}@example.com`;

const splitName = (name: string) => {
  const [firstName = '', ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

const toMockPhone = (name: string) => {
  const seed = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const pair = (offset: number) => String((seed * (offset + 3)) % 100).padStart(2, '0');
  return `+33 6 ${pair(1)} ${pair(2)} ${pair(3)} ${pair(4)}`;
};

interface SignatureBox {
  page: string;
  x: string;
  y: string;
}

/** Document du pack, avec l'emplacement des encarts de signature saisi à l'ajout. */
type PackDocument = MockSignaturePackDocument & {
  signatureBox?: SignatureBox;
  counterSignatureBox?: SignatureBox;
};

interface PlacementDraft {
  name: string;
  signatureBox: SignatureBox;
  counterSignatureBox: SignatureBox;
}

const EMPTY_BOX: SignatureBox = { page: '', x: '', y: '' };

const isBoxComplete = (box: SignatureBox) =>
  [box.page, box.x, box.y].every(value => value.trim() !== '' && Number(value) >= 0) &&
  Number(box.page) >= 1;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

function buildDefaultSignatories(subscription: any): SignatureParty[] {
  const fromInvestor: Array<{ name: string }> = subscription?.signatures?.signatories ?? [];

  if (fromInvestor.length > 0) {
    return fromInvestor.map((signatory, idx) => ({
      id: `investor-${idx}`,
      ...splitName(signatory.name),
      name: signatory.name,
      email: toMockEmail(signatory.name),
      phone: toMockPhone(signatory.name),
      source: 'investor',
      included: true,
      status: 'notSent',
      reminders: 0,
    }));
  }

  const fallbackName: string =
    subscription?.contrepartie?.mainContact ||
    subscription?.contrepartie?.investor ||
    subscription?.contrepartie?.name ||
    '';

  return [
    {
      id: 'investor-0',
      ...splitName(fallbackName),
      name: fallbackName,
      email: toMockEmail(fallbackName),
      phone: toMockPhone(fallbackName),
      source: 'investor',
      included: true,
      status: 'notSent',
      reminders: 0,
    },
  ];
}

function buildDefaultCounterSignatories(): SignatureParty[] {
  return mockFundCounterSignatories.map(item => ({
    id: item.id,
    ...splitName(item.name),
    name: item.name,
    email: item.email,
    phone: toMockPhone(item.name),
    source: 'fund',
    included: true,
    status: 'notSent',
    reminders: 0,
  }));
}

const allSigned = (parties: SignatureParty[]) => {
  const included = parties.filter(party => party.included);
  return included.length > 0 && included.every(party => party.status === 'signed');
};

const markSent = (parties: SignatureParty[], stamp: string): SignatureParty[] =>
  parties.map(party =>
    party.included && party.status !== 'signed'
      ? { ...party, status: 'sent' as PartyStatus, sentAt: stamp }
      : party,
  );

/** Etat Signatures : pack de documents, signataires, contre-signataires et suivi des envois. */
export function SubscriptionSignatureStep({
  subscription,
  compliance,
  onOpenCompliance,
  onProceedToPayment,
}: SubscriptionSignatureStepProps) {
  const { t } = useTranslation();
  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const [stage, setStage] = useState<SignatureStage>('draft');
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [lastReminderAt, setLastReminderAt] = useState<string | null>(null);
  const [lastMailAt, setLastMailAt] = useState<string | null>(null);
  const [manualValidatedAt, setManualValidatedAt] = useState<string | null>(null);
  const [confirmManual, setConfirmManual] = useState(false);
  const [pack, setPack] = useState<PackDocument[]>(mockSignaturePack);
  const [parallel, setParallel] = useState(false);
  const [placement, setPlacement] = useState<PlacementDraft | null>(null);
  const [signatories, setSignatories] = useState<SignatureParty[]>(() =>
    buildDefaultSignatories(subscription),
  );
  const [counterSignatories, setCounterSignatories] = useState<SignatureParty[]>(
    buildDefaultCounterSignatories,
  );

  const locked = stage !== 'draft';
  const complianceValidated = compliance.status === 'validated';

  const toSignDocs = pack.filter(doc => !doc.signed);
  const signedDocs = pack.filter(doc => doc.signed);
  const manualValidated = manualValidatedAt !== null;

  const activeSignatories = signatories.filter(party => party.included);
  const signedSignatories = activeSignatories.filter(party => party.status === 'signed').length;
  const activeCounter = counterSignatories.filter(party => party.included);
  const signedCounter = activeCounter.filter(party => party.status === 'signed').length;
  const totalReminders =
    signatories.reduce((sum, party) => sum + party.reminders, 0) +
    counterSignatories.reduce((sum, party) => sum + party.reminders, 0);

  const blockers = [
    ...(!complianceValidated ? [`${KEY}.blockers.compliance`] : []),
    ...(toSignDocs.length === 0 ? [`${KEY}.blockers.noDocument`] : []),
    ...(activeSignatories.length === 0 ? [`${KEY}.blockers.noSignatory`] : []),
  ];
  const canSend = blockers.length === 0;
  const manualBlocker = !complianceValidated
    ? t(`${KEY}.manualValidation.blockedCompliance`)
    : signedDocs.length === 0
      ? t(`${KEY}.manualValidation.blockedNoSignedDocument`)
      : undefined;

  const finishSignatures = (nextSignatories: SignatureParty[]) => {
    if (!allSigned(nextSignatories)) return;
    const stamp = now();
    if (parallel && activeCounter.length > 0) {
      if (allSigned(counterSignatories)) {
        setStage('completed');
        toast.success(t(`${KEY}.toast.fullySigned`), {
          description: t(`${KEY}.toast.fullySignedDesc`),
        });
      } else {
        setStage('counterSigning');
      }
      return;
    }
    if (activeCounter.length > 0) {
      setCounterSignatories(prev => markSent(prev, stamp));
      setLastMailAt(stamp);
      setStage('counterSigning');
      toast.success(t(`${KEY}.toast.counterSignatureStarted`), {
        description: tc(`${KEY}.toast.counterSignatureStartedDesc`, activeCounter.length),
      });
    } else {
      setStage('completed');
      toast.success(t(`${KEY}.toast.fullySigned`), {
        description: t(`${KEY}.toast.fullySignedDesc`),
      });
    }
  };

  const finishCounterSignatures = (nextCounter: SignatureParty[]) => {
    if (!allSigned(nextCounter) || !allSigned(signatories)) return;
    setStage('completed');
    toast.success(t(`${KEY}.toast.fullySigned`), {
      description: t(`${KEY}.toast.fullySignedDesc`),
    });
  };

  const handleSend = () => {
    if (!canSend) return;
    const stamp = now();
    setSentAt(stamp);
    setLastMailAt(stamp);
    setStage('signing');
    setSignatories(prev => markSent(prev, stamp));
    if (parallel) setCounterSignatories(prev => markSent(prev, stamp));
    const recipients = activeSignatories.length + (parallel ? activeCounter.length : 0);
    toast.success(t(`${KEY}.toast.sent`), {
      description: `${tc(`${KEY}.toast.sentDesc`, recipients)} · ${tc(
        `${KEY}.pack.documentsCount`,
        toSignDocs.length,
      )}`,
    });
  };

  const handleManualValidation = () => {
    setManualValidatedAt(now());
    setStage('completed');
    setConfirmManual(false);
    toast.success(t(`${KEY}.toast.manuallyValidated`), {
      description: t(`${KEY}.toast.fullySignedDesc`),
    });
  };

  const setterFor = (kind: PartyKind) =>
    kind === 'signatory' ? setSignatories : setCounterSignatories;
  const listFor = (kind: PartyKind) => (kind === 'signatory' ? signatories : counterSignatories);

  const handleToggle = (kind: PartyKind, id: string, included: boolean) => {
    setterFor(kind)(prev => prev.map(party => (party.id === id ? { ...party, included } : party)));
  };

  const handleUpdate = (
    kind: PartyKind,
    id: string,
    patch: PartyFormValues,
  ) => {
    setterFor(kind)(prev =>
      prev.map(party =>
        party.id === id
          ? { ...party, ...patch, name: `${patch.firstName} ${patch.lastName}` }
          : party,
      ),
    );
    toast.success(t(`${KEY}.parties.toast.updated`));
  };

  const handleAdd = (kind: PartyKind, values: PartyFormValues) => {
    const id = `${kind}-manual-${Date.now()}`;
    const name = `${values.firstName} ${values.lastName}`;
    setterFor(kind)(prev => [
      ...prev,
      {
        id,
        ...values,
        name,
        source: 'manual',
        included: true,
        status: 'notSent',
        reminders: 0,
      },
    ]);
    toast.success(t(`${KEY}.parties.toast.added`), { description: name });
  };

  const handleRemove = (kind: PartyKind, id: string) => {
    const removed = listFor(kind).find(party => party.id === id);
    setterFor(kind)(prev => prev.filter(party => party.id !== id));
    toast.info(t(`${KEY}.parties.toast.removed`), { description: removed?.name });
  };

  const handleRemind = (kind: PartyKind, ids: string[]) => {
    if (ids.length === 0) return;
    const stamp = now();
    setLastReminderAt(stamp);
    setLastMailAt(stamp);
    setterFor(kind)(prev =>
      prev.map(party =>
        ids.includes(party.id) && party.status === 'sent'
          ? { ...party, remindedAt: stamp, reminders: party.reminders + 1 }
          : party,
      ),
    );
    const names = listFor(kind)
      .filter(party => ids.includes(party.id))
      .map(party => party.name)
      .join(', ');
    toast.success(t(`${KEY}.parties.toast.reminded`), {
      description: t(`${KEY}.parties.toast.remindedDesc`, { names }),
    });
  };

  const handleRegenerate = (kind: PartyKind, ids: string[]) => {
    if (ids.length === 0) return;
    const stamp = now();
    setLastMailAt(stamp);
    setterFor(kind)(prev =>
      prev.map(party =>
        ids.includes(party.id) && party.status === 'sent' ? { ...party, sentAt: stamp } : party,
      ),
    );
    toast.success(t(`${KEY}.parties.toast.linkRegenerated`), {
      description: t(`${KEY}.parties.toast.linkRegeneratedDesc`),
    });
  };

  const handleMarkSigned = (kind: PartyKind, id: string) => {
    const stamp = now();
    const next = listFor(kind).map(party =>
      party.id === id ? { ...party, status: 'signed' as PartyStatus, signedAt: stamp } : party,
    );
    setterFor(kind)(next);
    const signed = next.find(party => party.id === id);
    toast.success(t(`${KEY}.parties.toast.markedSigned`), { description: signed?.name });
    if (kind === 'signatory') finishSignatures(next);
    else finishCounterSignatures(next);
  };

  const pendingIds = (kind: PartyKind) =>
    listFor(kind)
      .filter(party => party.included && party.status === 'sent')
      .map(party => party.id);

  const nextManualIndex = pack.filter(doc => doc.source === 'manual').length + 1;

  /** Un document déposé déjà signé n'a pas d'encart à placer ; un document à signer en exige. */
  const handlePackAdd = (signed: boolean) => {
    const name = t(`${KEY}.pack.newDocumentName`, { index: nextManualIndex });
    if (!signed) {
      setPlacement({ name, signatureBox: EMPTY_BOX, counterSignatureBox: EMPTY_BOX });
      return;
    }
    setPack(prev => [
      ...prev,
      {
        id: `pack-manual-${Date.now()}`,
        name,
        file: `document-${nextManualIndex}.pdf`,
        source: 'manual',
        signed,
      },
    ]);
    toast.success(t(signed ? `${KEY}.pack.toast.addedSigned` : `${KEY}.pack.toast.added`), { description: name });
  };

  const placementNeedsCounter = activeCounter.length > 0;
  const placementMissing =
    placement !== null &&
    (!placement.name.trim() ||
      !isBoxComplete(placement.signatureBox) ||
      (placementNeedsCounter && !isBoxComplete(placement.counterSignatureBox)));

  const handlePlacementConfirm = () => {
    if (!placement || placementMissing) return;
    const name = placement.name.trim();
    const boxes = {
      signatureBox: placement.signatureBox,
      counterSignatureBox: placementNeedsCounter ? placement.counterSignatureBox : undefined,
    };
    setPack(prev => [
      ...prev,
      {
        id: `pack-manual-${Date.now()}`,
        name,
        file: `document-${nextManualIndex}.pdf`,
        source: 'manual',
        signed: false,
        ...boxes,
      },
    ]);
    toast.success(t(`${KEY}.pack.toast.added`), { description: name });
    setPlacement(null);
  };

  const remindKinds: PartyKind[] =
    stage === 'counterSigning'
      ? ['counterSignatory']
      : parallel
        ? ['signatory', 'counterSignatory']
        : ['signatory'];

  const handlePackRemove = (id: string) => {
    const removed = pack.find(doc => doc.id === id);
    setPack(prev => prev.filter(doc => doc.id !== id));
    toast.info(t(`${KEY}.pack.toast.removed`), { description: removed?.name });
  };

  const investorName: string =
    subscription?.contrepartie?.investor || subscription?.contrepartie?.name || '';

  const handleExportTarget = () => {
    downloadCsv(
      [
        t(`${KEY}.target.columns.type`),
        t(`${KEY}.target.columns.lastName`),
        t(`${KEY}.target.columns.firstName`),
        t(`${KEY}.target.columns.email`),
        t(`${KEY}.target.columns.phone`),
      ],
      activeSignatories.map(party => [
        t(`${KEY}.target.type.${party.name === investorName ? 'investor' : 'contact'}`),
        party.lastName,
        party.firstName,
        party.email,
        party.phone,
      ]),
      t(`${KEY}.target.filename`, { id: String(subscription?.id ?? '') }),
    );
    toast.success(t(`${KEY}.target.exported`), {
      description: tc(`${KEY}.target.exportedDesc`, activeSignatories.length),
    });
  };

  const stageBadge: Record<Exclude<SignatureStage, 'draft'>, { className: string; icon: typeof Clock }> = {
    signing: { className: 'bg-amber-100 text-amber-700 border-amber-300', icon: Clock },
    counterSigning: { className: 'bg-primary/10 text-primary border-primary/30', icon: Landmark },
    completed: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  };

  const substeps: Array<{
    id: string;
    icon: typeof Send;
    label: string;
    detail: string;
    state: 'done' | 'current' | 'pending';
    meta?: ReactNode;
    action?: ReactNode;
  }> = [
    {
      id: 'send',
      icon: Send,
      label: t(`${KEY}.substeps.send`),
      detail: manualValidated
        ? t(`${KEY}.manualValidation.label`)
        : lastMailAt
          ? t(`${KEY}.tracking.lastMailOn`, { date: lastMailAt })
          : t(`${KEY}.tracking.notSent`),
      state: stage === 'draft' ? 'current' : 'done',
      meta: (
        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="shrink-0">{t(`${KEY}.template.label`)}</span>
          {SIGNATURE_TEMPLATE ? (
            <DetailLink
              href={`#/settings/mail-templates?template=${SIGNATURE_TEMPLATE.slug}`}
              icon={Mail}
              title={t(`${KEY}.template.open`)}
              className="min-w-0 text-xs"
            >
              <span className="truncate">{SIGNATURE_TEMPLATE.name}</span>
            </DetailLink>
          ) : (
            <span>{t(`${KEY}.template.none`)}</span>
          )}
        </span>
      ),
      action: (
        <RowActionButton
          icon={Download}
          tooltip={t(`${KEY}.target.export`)}
          onClick={handleExportTarget}
          disabledReason={
            activeSignatories.length === 0 ? t(`${KEY}.blockers.noSignatory`) : undefined
          }
        />
      ),
    },
    {
      id: 'signatures',
      icon: PenTool,
      label: t(`${KEY}.substeps.signatures`),
      detail: manualValidated
        ? t(`${KEY}.manualValidation.label`)
        : t(`${KEY}.tracking.progress`, {
            signed: signedSignatories,
            total: activeSignatories.length,
          }),
      state:
        stage === 'signing'
          ? 'current'
          : stage === 'counterSigning' || stage === 'completed'
            ? 'done'
            : 'pending',
    },
    {
      id: 'counterSignature',
      icon: Landmark,
      label: t(`${KEY}.substeps.counterSignature`),
      detail: manualValidated
        ? t(`${KEY}.manualValidation.label`)
        : activeCounter.length === 0
          ? t(`${KEY}.tracking.noCounterSignatory`)
          : t(`${KEY}.tracking.progress`, { signed: signedCounter, total: activeCounter.length }),
      state:
        stage === 'completed'
          ? 'done'
          : stage === 'counterSigning' || (parallel && stage === 'signing')
            ? 'current'
            : 'pending',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Suivi : statut global, sous-étapes, relances et action principale */}
      <Card className="shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.tracking.title`)}</h3>
            <p className={WIDGET_SUBTITLE_CLASS}>
              {manualValidatedAt
                ? t(`${KEY}.manualValidation.validatedOn`, { date: manualValidatedAt })
                : sentAt
                  ? t(`${KEY}.tracking.sentOn`, { date: sentAt })
                  : t(`${KEY}.tracking.notSent`)}
              {lastReminderAt && (
                <>
                  {' · '}
                  {t(`${KEY}.tracking.lastReminder`, { date: lastReminderAt })}
                  {' · '}
                  {tc(`${KEY}.tracking.reminders`, totalReminders)}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {stage !== 'draft' &&
              (() => {
                const StageIcon = stageBadge[stage].icon;
                return (
                  <Badge className={stageBadge[stage].className}>
                    <StageIcon className="w-3.5 h-3.5 mr-1.5" />
                    {t(`${KEY}.stage.${stage}`)}
                  </Badge>
                );
              })()}

            {stage === 'draft' && (
              <>
                <DisabledReason reason={manualBlocker}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs h-9"
                    disabled={Boolean(manualBlocker)}
                    onClick={() => setConfirmManual(true)}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    {t(`${KEY}.actions.validateWithoutESignature`)}
                  </Button>
                </DisabledReason>
                <Button
                  size="lg"
                  className="gap-2 px-6 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  disabled={!canSend}
                  onClick={handleSend}
                >
                  <Send className="w-4 h-4" />
                  {t(`${KEY}.actions.send`)}
                </Button>
              </>
            )}

            {(stage === 'signing' || stage === 'counterSigning') && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9"
                  onClick={() => remindKinds.forEach(kind => handleRegenerate(kind, pendingIds(kind)))}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t(`${KEY}.actions.regenerateLinks`)}
                </Button>
                <Button
                  className="gap-2 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  onClick={() => remindKinds.forEach(kind => handleRemind(kind, pendingIds(kind)))}
                >
                  <Mail className="w-4 h-4" />
                  {stage === 'signing'
                    ? t(`${KEY}.actions.remindSignatories`)
                    : t(`${KEY}.actions.remindCounterSignatories`)}
                </Button>
              </>
            )}

            {stage === 'completed' && (
              <Button
                className="gap-2 text-white hover:opacity-90"
                style={{ background: PRIMARY_BUTTON_GRADIENT }}
                onClick={onProceedToPayment}
              >
                <ChevronRight className="w-4 h-4" />
                {t(`${KEY}.actions.toPayment`)}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t px-4 py-3">
          {substeps.map(step => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  step.state === 'done' && 'border-emerald-200 bg-emerald-50/60',
                  step.state === 'current' && 'border-primary/40 bg-primary/5',
                  step.state === 'pending' && 'border-border bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    step.state === 'done'
                      ? 'bg-emerald-100 text-emerald-600'
                      : step.state === 'current'
                        ? 'bg-primary/10 text-primary'
                        : 'border border-border bg-card text-foreground/70',
                  )}
                >
                  {step.state === 'done' ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{step.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{step.detail}</span>
                  {step.meta}
                </span>
                {step.action}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
          <div className="min-w-0">
            <Label htmlFor="signature-parallel">{t(`${KEY}.sequencing.parallel`)}</Label>
            <p className={WIDGET_SUBTITLE_CLASS}>
              {t(`${KEY}.sequencing.${parallel ? 'parallelHint' : 'sequentialHint'}`)}
            </p>
          </div>
          <Switch
            id="signature-parallel"
            checked={parallel}
            onCheckedChange={setParallel}
            disabled={locked}
          />
        </div>

        {stage === 'draft' && blockers.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-amber-50 px-4 py-2">
            <span className="flex items-start gap-2 text-xs text-amber-700 min-w-0">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {t(`${KEY}.blockers.title`)} : {blockers.map(key => t(key)).join(', ')}
              </span>
            </span>
            {!complianceValidated && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1 text-xs text-amber-700 border-amber-300 hover:bg-amber-100"
                onClick={onOpenCompliance}
              >
                <ShieldCheck className="w-3 h-3" />
                {t(`${KEY}.compliance.view`)}
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Pack de signature */}
      <Card className="shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.pack.title`)}</h3>
            <p className={WIDGET_SUBTITLE_CLASS}>
              {locked ? t(`${KEY}.pack.locked`) : t(`${KEY}.pack.subtitle`)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {locked && (
              <Badge className="bg-muted text-muted-foreground border-border">
                <Lock className="w-3 h-3 mr-1" />
                {tc(`${KEY}.pack.documentsCount`, pack.length)}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-9"
              onClick={() => toast.success(t(`${KEY}.pack.toast.downloaded`))}
            >
              <Download className="w-3.5 h-3.5" />
              {t(`${KEY}.pack.downloadAll`)}
            </Button>
            {!locked && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9"
                  onClick={() => handlePackAdd(false)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t(`${KEY}.pack.addToSign`)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9"
                  onClick={() => handlePackAdd(true)}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  {t(`${KEY}.pack.addSigned`)}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="border-t px-4 py-4">
          <PackGroup
            icon={PenTool}
            title={t(`${KEY}.pack.toSign`)}
            hint={t(`${KEY}.pack.toSignHint`)}
            count={pack.length}
            emptyLabel={t(`${KEY}.pack.emptyToSign`)}
            documents={pack}
            locked={locked}
            signed={stage === 'completed'}
            onRemove={handlePackRemove}
          />
        </div>
      </Card>

      {/* Signataires et contre-signataires */}
      <div
        className="grid items-start gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))' }}
      >
        <PartyCard
          kind="signatory"
          parties={signatories}
          stage={stage}
          active={stage === 'signing'}
          subtitle={t(`${KEY}.parties.signatories.subtitle`)}
          onToggle={(id, included) => handleToggle('signatory', id, included)}
          onUpdate={(id, patch) => handleUpdate('signatory', id, patch)}
          onAdd={values => handleAdd('signatory', values)}
          onRemove={id => handleRemove('signatory', id)}
          onRemind={id => handleRemind('signatory', [id])}
          onRegenerate={id => handleRegenerate('signatory', [id])}
          onMarkSigned={id => handleMarkSigned('signatory', id)}
          manualValidated={manualValidated}
        />
        <PartyCard
          kind="counterSignatory"
          parties={counterSignatories}
          stage={stage}
          active={stage === 'counterSigning' || (parallel && stage === 'signing')}
          subtitle={t(`${KEY}.parties.counterSignatories.subtitle`, {
            fund: subscription?.fund?.name ?? '',
          })}
          onToggle={(id, included) => handleToggle('counterSignatory', id, included)}
          onUpdate={(id, patch) => handleUpdate('counterSignatory', id, patch)}
          onAdd={values => handleAdd('counterSignatory', values)}
          onRemove={id => handleRemove('counterSignatory', id)}
          onRemind={id => handleRemind('counterSignatory', [id])}
          onRegenerate={id => handleRegenerate('counterSignatory', [id])}
          onMarkSigned={id => handleMarkSigned('counterSignatory', id)}
          manualValidated={manualValidated}
        />
      </div>

      <ConfirmDialog
        open={placement !== null}
        onOpenChange={open => !open && setPlacement(null)}
        icon={PenTool}
        title={t(`${KEY}.pack.placement.title`)}
        description={t(`${KEY}.pack.placement.description`)}
        confirmLabel={t(`${KEY}.pack.placement.confirm`)}
        confirmDisabledReason={placementMissing ? t(`${KEY}.pack.placement.missing`) : undefined}
        onConfirm={handlePlacementConfirm}
      >
        {placement && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="placement-name">{t(`${KEY}.pack.placement.name`)} *</Label>
              <Input
                id="placement-name"
                value={placement.name}
                onChange={event => setPlacement({ ...placement, name: event.target.value })}
              />
            </div>
            <SignatureBoxFields
              id="placement-signatory"
              legend={t(`${KEY}.pack.placement.signatoryBox`)}
              value={placement.signatureBox}
              onChange={signatureBox => setPlacement({ ...placement, signatureBox })}
            />
            {placementNeedsCounter && (
              <SignatureBoxFields
                id="placement-counter"
                legend={t(`${KEY}.pack.placement.counterSignatoryBox`)}
                value={placement.counterSignatureBox}
                onChange={counterSignatureBox => setPlacement({ ...placement, counterSignatureBox })}
              />
            )}
            <p className={WIDGET_SUBTITLE_CLASS}>{t(`${KEY}.pack.placement.hint`)}</p>
          </div>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmManual}
        onOpenChange={setConfirmManual}
        icon={FileCheck}
        title={t(`${KEY}.manualValidation.title`)}
        description={tc(`${KEY}.manualValidation.description`, signedDocs.length)}
        confirmLabel={t(`${KEY}.actions.validateWithoutESignature`)}
        onConfirm={handleManualValidation}
      />
    </div>
  );
}

interface SignatureBoxFieldsProps {
  id: string;
  legend: string;
  value: SignatureBox;
  onChange: (value: SignatureBox) => void;
}

const BOX_FIELDS = ['page', 'x', 'y'] as const;

function SignatureBoxFields({ id, legend, value, onChange }: SignatureBoxFieldsProps) {
  const { t } = useTranslation();

  return (
    <fieldset className="space-y-1.5">
      <legend className={WIDGET_LABEL_CLASS}>{legend}</legend>
      <div className="grid grid-cols-3 gap-2">
        {BOX_FIELDS.map(field => (
          <div key={field} className="space-y-1.5">
            <Label htmlFor={`${id}-${field}`}>{t(`${KEY}.pack.placement.${field}`)} *</Label>
            <Input
              id={`${id}-${field}`}
              type="number"
              min={field === 'page' ? 1 : 0}
              value={value[field]}
              onChange={event => onChange({ ...value, [field]: event.target.value })}
            />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

interface PackGroupProps {
  icon: typeof PenTool;
  title: string;
  hint: string;
  count: number;
  emptyLabel: string;
  documents: PackDocument[];
  locked: boolean;
  signed: boolean;
  onRemove: (id: string) => void;
}

function PackGroup({
  icon: Icon,
  title,
  hint,
  count,
  emptyLabel,
  documents,
  locked,
  signed,
  onRemove,
}: PackGroupProps) {
  const { t } = useTranslation();

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className={cn(WIDGET_LABEL_CLASS, 'flex items-center gap-1.5')}>
          <Icon className="w-3.5 h-3.5" />
          {title}
          <Badge className="bg-muted text-muted-foreground border-border text-[11px] px-1.5 py-0">
            {count}
          </Badge>
        </span>
        <span className="text-xs text-muted-foreground truncate">{hint}</span>
      </div>

      {documents.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <ul className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}>
          {documents.map(doc => (
            <li
              key={doc.id}
              className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-muted p-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                <FileText className="w-4 h-4 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground" title={doc.name}>
                  {doc.name}
                </span>
                <div className="mt-0.5 flex items-center gap-2 min-w-0">
                  <Badge
                    className={cn(
                      'text-[11px]',
                      doc.source === 'bulletin'
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-card text-foreground/80 border-border',
                    )}
                  >
                    {doc.source === 'bulletin'
                      ? t(`${KEY}.pack.sourceBulletin`)
                      : t(`${KEY}.pack.sourceAdded`)}
                  </Badge>
                  {(doc.signed || signed) && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {t(`${KEY}.pack.signed`)}
                    </Badge>
                  )}
                  <span className="truncate text-xs text-foreground/70">
                    {doc.file}
                    {doc.signatureBox && (
                      <>
                        {' · '}
                        {t(`${KEY}.pack.placement.summary`, doc.signatureBox)}
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label={t(`${KEY}.pack.preview`)}
                      onClick={() =>
                        toast.info(t(`${KEY}.pack.toast.preview`), { description: doc.name })
                      }
                    >
                      <Eye className="w-4 h-4 text-foreground/70" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t(`${KEY}.pack.preview`)}</TooltipContent>
                </Tooltip>
                {!locked && doc.source === 'manual' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        aria-label={t(`${KEY}.pack.remove`)}
                        onClick={() => onRemove(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t(`${KEY}.pack.remove`)}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface PartyFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const EMPTY_PARTY_FORM: PartyFormValues = { firstName: '', lastName: '', email: '', phone: '' };

interface PartyCardProps {
  kind: PartyKind;
  parties: SignatureParty[];
  stage: SignatureStage;
  /** La liste est en cours de collecte : relances et enregistrement de signature possibles. */
  active: boolean;
  subtitle: string;
  onToggle: (id: string, included: boolean) => void;
  onUpdate: (id: string, patch: PartyFormValues) => void;
  onAdd: (values: PartyFormValues) => void;
  onRemove: (id: string) => void;
  onRemind: (id: string) => void;
  onRegenerate: (id: string) => void;
  onMarkSigned: (id: string) => void;
  /** Pack validé sur dépôt de documents signés : aucun lien de signature n'a été envoyé. */
  manualValidated: boolean;
}

function PartyCard({
  kind,
  parties,
  stage,
  active,
  subtitle,
  onToggle,
  onUpdate,
  onAdd,
  onRemove,
  onRemind,
  onRegenerate,
  onMarkSigned,
  manualValidated,
}: PartyCardProps) {
  const { t } = useTranslation();
  const locked = stage !== 'draft';
  const groupKey = kind === 'signatory' ? 'signatories' : 'counterSignatories';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<PartyFormValues>(EMPTY_PARTY_FORM);

  const visible = locked ? parties.filter(party => party.included) : parties;
  const includedCount = parties.filter(party => party.included).length;
  const signedCount = parties.filter(party => party.included && party.status === 'signed').length;

  const startEdit = (party: SignatureParty) => {
    setAdding(false);
    setEditingId(party.id);
    setForm({
      firstName: party.firstName,
      lastName: party.lastName,
      email: party.email,
      phone: party.phone,
    });
  };

  const startAdd = () => {
    setEditingId(null);
    setAdding(true);
    setForm(EMPTY_PARTY_FORM);
  };

  const cancelForm = () => {
    setEditingId(null);
    setAdding(false);
  };

  const submitForm = () => {
    const values: PartyFormValues = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    };
    if (Object.values(values).some(value => !value)) {
      toast.error(t(`${KEY}.parties.toast.invalid`));
      return;
    }
    if (editingId) onUpdate(editingId, values);
    else onAdd(values);
    cancelForm();
  };

  const sourceLabel = (party: SignatureParty) => {
    if (party.source === 'manual') return t(`${KEY}.parties.sourceAdded`);
    return party.source === 'investor'
      ? t(`${KEY}.parties.sourceInvestor`)
      : t(`${KEY}.parties.sourceFund`);
  };

  const renderForm = () => (
    <div className="grid gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={form.lastName}
          onChange={event => setForm(prev => ({ ...prev, lastName: event.target.value }))}
          placeholder={`${t(`${KEY}.parties.form.lastName`)} *`}
          aria-label={t(`${KEY}.parties.form.lastName`)}
          className="h-8 text-sm"
        />
        <Input
          value={form.firstName}
          onChange={event => setForm(prev => ({ ...prev, firstName: event.target.value }))}
          placeholder={`${t(`${KEY}.parties.form.firstName`)} *`}
          aria-label={t(`${KEY}.parties.form.firstName`)}
          className="h-8 text-sm"
        />
        <Input
          type="email"
          value={form.email}
          onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
          placeholder={`${t(`${KEY}.parties.form.email`)} *`}
          aria-label={t(`${KEY}.parties.form.email`)}
          className="h-8 text-sm"
        />
        <Input
          type="tel"
          value={form.phone}
          onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))}
          placeholder={`${t(`${KEY}.parties.form.phone`)} *`}
          aria-label={t(`${KEY}.parties.form.phone`)}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={cancelForm}>
          <X className="w-3.5 h-3.5" />
          {t(`${KEY}.parties.form.cancel`)}
        </Button>
        <Button size="sm" className="h-8 gap-1 text-xs" onClick={submitForm}>
          <Check className="w-3.5 h-3.5" />
          {t(`${KEY}.parties.form.save`)}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.parties.${groupKey}.title`)}</h3>
          <p className={WIDGET_SUBTITLE_CLASS}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {manualValidated ? (
            <Badge className="bg-muted text-muted-foreground border-border">
              {t(`${KEY}.manualValidation.label`)}
            </Badge>
          ) : locked ? (
            <Badge
              className={cn(
                'tabular-nums',
                includedCount > 0 && signedCount === includedCount
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : active
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-muted text-muted-foreground border-border',
              )}
            >
              {t(`${KEY}.tracking.progress`, { signed: signedCount, total: includedCount })}
            </Badge>
          ) : (
            <>
              <Badge className="bg-muted text-muted-foreground border-border tabular-nums">
                {t(`${KEY}.parties.includedCount`, { count: includedCount })}
              </Badge>
              {kind === 'signatory' && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={startAdd}>
                  <Plus className="w-3.5 h-3.5" />
                  {t(`${KEY}.parties.signatories.add`)}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <ul className="space-y-2 border-t px-4 py-4">
        {visible.length === 0 && !adding && (
          <li className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground">
            {t(`${KEY}.parties.${groupKey}.empty`)}
          </li>
        )}

        {visible.map(party => {
          if (editingId === party.id) {
            return <li key={party.id}>{renderForm()}</li>;
          }

          return (
            <li
              key={party.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-border bg-muted p-3',
                !party.included && 'opacity-60',
                party.status === 'signed' && 'border-emerald-200 bg-emerald-50/50',
              )}
            >
              {!locked && (
                <Checkbox
                  checked={party.included}
                  onCheckedChange={checked => onToggle(party.id, checked === true)}
                  aria-label={t(`${KEY}.parties.include`)}
                  className="mt-1.5"
                />
              )}

              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  party.status === 'signed'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-primary/10 text-primary',
                )}
              >
                {initials(party.name) || '?'}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{party.name}</span>
                  <Badge
                    className={cn(
                      'text-[11px]',
                      party.source === 'manual'
                        ? 'bg-card text-foreground/80 border-border'
                        : 'bg-primary/10 text-primary border-primary/30',
                    )}
                  >
                    {sourceLabel(party)}
                  </Badge>
                </div>
                <span className="block truncate text-xs text-foreground/70">
                  {party.email} · {party.phone}
                </span>

                {locked && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    {party.status === 'signed' && party.signedAt && (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t(`${KEY}.parties.status.signedOn`, { date: party.signedAt })}
                      </span>
                    )}
                    {party.status === 'sent' && party.sentAt && (
                      <span className="inline-flex items-center gap-1 text-foreground/70">
                        <Mail className="w-3.5 h-3.5" />
                        {t(`${KEY}.parties.status.linkSentOn`, { date: party.sentAt })}
                      </span>
                    )}
                    {party.status === 'sent' && party.remindedAt && (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        {t(`${KEY}.parties.status.remindedOn`, {
                          date: party.remindedAt,
                          count: party.reminders,
                        })}
                      </span>
                    )}
                    {party.status === 'notSent' && !manualValidated && (
                      <span className="inline-flex items-center gap-1 text-foreground/70">
                        <Clock className="w-3.5 h-3.5" />
                        {t(`${KEY}.parties.status.waitingSignatories`)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {!locked && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={t(`${KEY}.parties.edit`)}
                          onClick={() => startEdit(party)}
                        >
                          <Pencil className="w-4 h-4 text-foreground/70" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t(`${KEY}.parties.edit`)}</TooltipContent>
                    </Tooltip>
                    {party.source === 'manual' && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            aria-label={t(`${KEY}.parties.remove`)}
                            onClick={() => onRemove(party.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t(`${KEY}.parties.remove`)}</TooltipContent>
                      </Tooltip>
                    )}
                  </>
                )}

                {locked && party.status === 'signed' && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    {t(`${KEY}.parties.status.signed`)}
                  </Badge>
                )}

                {locked && party.status === 'sent' && active && (
                  <>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300 mr-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {t(`${KEY}.parties.status.pending`)}
                    </Badge>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={t(`${KEY}.parties.remind`)}
                          onClick={() => onRemind(party.id)}
                        >
                          <Mail className="w-4 h-4 text-foreground/70" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t(`${KEY}.parties.remind`)}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={t(`${KEY}.parties.regenerateLink`)}
                          onClick={() => onRegenerate(party.id)}
                        >
                          <RefreshCw className="w-4 h-4 text-foreground/70" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t(`${KEY}.parties.regenerateLink`)}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          aria-label={t(`${KEY}.parties.markSigned`)}
                          onClick={() => onMarkSigned(party.id)}
                        >
                          <PenTool className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t(`${KEY}.parties.markSigned`)}</TooltipContent>
                    </Tooltip>
                  </>
                )}

                {locked && party.status === 'notSent' && !manualValidated && (
                  <Badge className="bg-card text-foreground/70 border-border">
                    {t(`${KEY}.parties.status.notSent`)}
                  </Badge>
                )}
              </div>
            </li>
          );
        })}

        {adding && <li>{renderForm()}</li>}
      </ul>
    </Card>
  );
}
