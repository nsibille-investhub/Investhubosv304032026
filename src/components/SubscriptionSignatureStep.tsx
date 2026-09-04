import { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Landmark,
  Lock,
  Mail,
  Paperclip,
  Pencil,
  PenTool,
  Plus,
  Radar,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../utils/languageContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { cn, WIDGET_LABEL_CLASS, WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { PRIMARY_BUTTON_GRADIENT } from './ui/page-header';
import {
  OnboardingCompletionCard,
  type OnboardingBucketStats,
} from './OnboardingCompletionOverview';
import { ToneBadge, type ComplianceStatus } from './SubscriptionComplianceSection';
import {
  mockFundCounterSignatories,
  mockSignaturePack,
  type MockSignaturePackDocument,
  type SignaturePackDocumentKind,
} from '../utils/subscriptionDetailMockData';
import { computeComplianceSnapshot } from '../utils/subscriptionRiskMockData';

export type SignatureStage = 'draft' | 'signing' | 'counterSigning' | 'completed';

type PartyStatus = 'notSent' | 'sent' | 'signed';
type PartyKind = 'signatory' | 'counterSignatory';

interface SignatureParty {
  id: string;
  name: string;
  /** Fonction issue de la fiche investisseur (donnee), ou cle de traduction pour les defauts du fonds. */
  role?: string;
  roleKey?: string;
  email: string;
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
  questions: OnboardingBucketStats;
  documents: OnboardingBucketStats;
  compliance: ComplianceSummary;
  onOpenOnboarding: () => void;
  onOpenCompliance: () => void;
  onProceedToPayment: () => void;
}

const KEY = 'subscriptions.detail.signatureStep';

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

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

function buildDefaultSignatories(subscription: any): SignatureParty[] {
  const fromInvestor: Array<{ name: string; role: string }> =
    subscription?.signatures?.signatories ?? [];

  if (fromInvestor.length > 0) {
    return fromInvestor.map((signatory, idx) => ({
      id: `investor-${idx}`,
      name: signatory.name,
      role: signatory.role,
      email: toMockEmail(signatory.name),
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
      name: fallbackName,
      roleKey: `${KEY}.roles.investor`,
      email: toMockEmail(fallbackName),
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
    name: item.name,
    roleKey: item.roleKey,
    email: item.email,
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
  questions,
  documents,
  compliance,
  onOpenOnboarding,
  onOpenCompliance,
  onProceedToPayment,
}: SubscriptionSignatureStepProps) {
  const { t } = useTranslation();
  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });

  const [stage, setStage] = useState<SignatureStage>('draft');
  const [sentAt, setSentAt] = useState<string | null>(null);
  const [lastReminderAt, setLastReminderAt] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [pack, setPack] = useState<MockSignaturePackDocument[]>(mockSignaturePack);
  const [signatories, setSignatories] = useState<SignatureParty[]>(() =>
    buildDefaultSignatories(subscription),
  );
  const [counterSignatories, setCounterSignatories] = useState<SignatureParty[]>(
    buildDefaultCounterSignatories,
  );

  const locked = stage !== 'draft';
  const complianceValidated = compliance.status === 'validated';

  const toSignDocs = pack.filter(doc => doc.kind === 'toSign');
  const annexDocs = pack.filter(doc => doc.kind === 'annex');

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

  const finishSignatures = (nextSignatories: SignatureParty[]) => {
    if (!allSigned(nextSignatories)) return;
    const stamp = now();
    if (activeCounter.length > 0) {
      setCounterSignatories(prev => markSent(prev, stamp));
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
    if (!allSigned(nextCounter)) return;
    setStage('completed');
    toast.success(t(`${KEY}.toast.fullySigned`), {
      description: t(`${KEY}.toast.fullySignedDesc`),
    });
  };

  const handleSaveDraft = () => {
    setDraftSavedAt(now());
    toast.success(t(`${KEY}.toast.draftSaved`));
  };

  const handleSend = () => {
    if (!canSend) return;
    const stamp = now();
    setSentAt(stamp);
    setStage('signing');
    setSignatories(prev => markSent(prev, stamp));
    toast.success(t(`${KEY}.toast.sent`), {
      description: `${tc(`${KEY}.toast.sentDesc`, activeSignatories.length)} · ${tc(
        `${KEY}.pack.documentsCount`,
        toSignDocs.length,
      )}`,
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
    patch: Pick<SignatureParty, 'name' | 'email'> & { role: string },
  ) => {
    setterFor(kind)(prev =>
      prev.map(party =>
        party.id === id
          ? { ...party, name: patch.name, email: patch.email, role: patch.role, roleKey: undefined }
          : party,
      ),
    );
    toast.success(t(`${KEY}.parties.toast.updated`));
  };

  const handleAdd = (kind: PartyKind, values: { name: string; email: string; role: string }) => {
    const id = `${kind}-manual-${Date.now()}`;
    setterFor(kind)(prev => [
      ...prev,
      {
        id,
        name: values.name,
        role: values.role,
        email: values.email,
        source: 'manual',
        included: true,
        status: 'notSent',
        reminders: 0,
      },
    ]);
    toast.success(t(`${KEY}.parties.toast.added`), { description: values.name });
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

  const handlePackKind = (id: string, kind: SignaturePackDocumentKind) => {
    setPack(prev => prev.map(doc => (doc.id === id ? { ...doc, kind } : doc)));
  };

  const handlePackAdd = (kind: SignaturePackDocumentKind) => {
    const index = pack.filter(doc => doc.source === 'manual').length + 1;
    const name = t(`${KEY}.pack.newDocumentName`, { index });
    setPack(prev => [
      ...prev,
      {
        id: `pack-manual-${Date.now()}`,
        name,
        file: `document-${index}.pdf`,
        kind,
        source: 'manual',
      },
    ]);
    toast.success(t(`${KEY}.pack.toast.added`), { description: name });
  };

  const handlePackRemove = (id: string) => {
    const removed = pack.find(doc => doc.id === id);
    setPack(prev => prev.filter(doc => doc.id !== id));
    toast.info(t(`${KEY}.pack.toast.removed`), { description: removed?.name });
  };

  const stageBadge: Record<SignatureStage, { className: string; icon: typeof Clock }> = {
    draft: { className: 'bg-muted text-muted-foreground border-border', icon: Pencil },
    signing: { className: 'bg-amber-100 text-amber-700 border-amber-300', icon: Clock },
    counterSigning: { className: 'bg-primary/10 text-primary border-primary/30', icon: Landmark },
    completed: { className: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  };
  const StageIcon = stageBadge[stage].icon;

  const substeps: Array<{
    id: string;
    icon: typeof Send;
    label: string;
    detail: string;
    state: 'done' | 'current' | 'pending';
  }> = [
    {
      id: 'send',
      icon: Send,
      label: t(`${KEY}.substeps.send`),
      detail: sentAt ? t(`${KEY}.tracking.sentOn`, { date: sentAt }) : t(`${KEY}.stage.draft`),
      state: stage === 'draft' ? 'current' : 'done',
    },
    {
      id: 'signatures',
      icon: PenTool,
      label: t(`${KEY}.substeps.signatures`),
      detail: t(`${KEY}.tracking.progress`, {
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
      detail:
        activeCounter.length === 0
          ? t(`${KEY}.tracking.noCounterSignatory`)
          : stage === 'counterSigning' || stage === 'completed'
            ? t(`${KEY}.tracking.progress`, { signed: signedCounter, total: activeCounter.length })
            : t(`${KEY}.parties.status.waitingSignatories`),
      state: stage === 'completed' ? 'done' : stage === 'counterSigning' ? 'current' : 'pending',
    },
  ];

  return (
    <div className="space-y-4">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))' }}
      >
        <OnboardingCompletionCard
          questions={questions}
          documents={documents}
          action={
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onOpenOnboarding}>
              <ChevronRight className="w-3.5 h-3.5" />
              {t(`${KEY}.completion.view`)}
            </Button>
          }
        />
        <ComplianceStatusCard compliance={compliance} onOpen={onOpenCompliance} />
      </div>

      {/* Suivi : statut global, sous-étapes, relances et action principale */}
      <Card className="shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.tracking.title`)}</h3>
            <p className={WIDGET_SUBTITLE_CLASS}>
              {sentAt ? t(`${KEY}.tracking.sentOn`, { date: sentAt }) : t(`${KEY}.tracking.notSent`)}
              {lastReminderAt && (
                <>
                  {' · '}
                  {t(`${KEY}.tracking.lastReminder`, { date: lastReminderAt })}
                  {' · '}
                  {tc(`${KEY}.tracking.reminders`, totalReminders)}
                </>
              )}
              {!sentAt && draftSavedAt && (
                <>
                  {' · '}
                  {t(`${KEY}.tracking.draftSavedOn`, { date: draftSavedAt })}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Badge className={stageBadge[stage].className}>
              <StageIcon className="w-3.5 h-3.5 mr-1.5" />
              {t(`${KEY}.stage.${stage}`)}
            </Badge>

            {stage === 'draft' && (
              <>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9" onClick={handleSaveDraft}>
                  <Save className="w-3.5 h-3.5" />
                  {t(`${KEY}.actions.saveDraft`)}
                </Button>
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
                  onClick={() =>
                    handleRegenerate(
                      stage === 'signing' ? 'signatory' : 'counterSignatory',
                      pendingIds(stage === 'signing' ? 'signatory' : 'counterSignatory'),
                    )
                  }
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {t(`${KEY}.actions.regenerateLinks`)}
                </Button>
                <Button
                  className="gap-2 text-white hover:opacity-90"
                  style={{ background: PRIMARY_BUTTON_GRADIENT }}
                  onClick={() =>
                    handleRemind(
                      stage === 'signing' ? 'signatory' : 'counterSignatory',
                      pendingIds(stage === 'signing' ? 'signatory' : 'counterSignatory'),
                    )
                  }
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
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{step.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{step.detail}</span>
                </span>
              </div>
            );
          })}
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
          <div className="min-w-0">
            <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.pack.title`)}</h3>
            <p className={WIDGET_SUBTITLE_CLASS}>
              {locked ? t(`${KEY}.pack.locked`) : t(`${KEY}.pack.subtitle`)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {locked ? (
              <Badge className="bg-muted text-muted-foreground border-border">
                <Lock className="w-3 h-3 mr-1" />
                {tc(`${KEY}.pack.documentsCount`, pack.length)}
              </Badge>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9"
                  onClick={() => handlePackAdd('toSign')}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t(`${KEY}.pack.addToSign`)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-9"
                  onClick={() => handlePackAdd('annex')}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {t(`${KEY}.pack.addAnnex`)}
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          className="grid gap-4 border-t px-4 py-4"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))' }}
        >
          <PackGroup
            icon={PenTool}
            title={t(`${KEY}.pack.toSign`)}
            hint={t(`${KEY}.pack.toSignHint`)}
            count={toSignDocs.length}
            emptyLabel={t(`${KEY}.pack.emptyToSign`)}
            documents={toSignDocs}
            locked={locked}
            signed={stage === 'completed'}
            onKindChange={handlePackKind}
            onRemove={handlePackRemove}
          />
          <PackGroup
            icon={Paperclip}
            title={t(`${KEY}.pack.annexes`)}
            hint={t(`${KEY}.pack.annexesHint`)}
            count={annexDocs.length}
            emptyLabel={t(`${KEY}.pack.emptyAnnexes`)}
            documents={annexDocs}
            locked={locked}
            signed={false}
            onKindChange={handlePackKind}
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
        />
        <PartyCard
          kind="counterSignatory"
          parties={counterSignatories}
          stage={stage}
          active={stage === 'counterSigning'}
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
        />
      </div>
    </div>
  );
}

interface ComplianceStatusCardProps {
  compliance: ComplianceSummary;
  onOpen: () => void;
}

/** Rappel de l'etat de conformite, en lecture seule, cale sur la hauteur du bandeau de completion. */
function ComplianceStatusCard({ compliance, onOpen }: ComplianceStatusCardProps) {
  const { t } = useTranslation();
  const tc = (key: string, count: number) => t(`${key}${count === 1 ? 'One' : 'Many'}`, { count });
  const snapshot = computeComplianceSnapshot();
  const validated = compliance.status === 'validated';
  const categoryLabel = t(`subscriptions.detail.compliance.categories.${snapshot.category}`);

  return (
    <Card className="flex flex-col justify-between p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className={WIDGET_TITLE_CLASS}>{t('subscriptions.detail.compliance.final.title')}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {validated ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 cursor-default">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  {t('subscriptions.detail.compliance.status.validated')}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <span className="text-xs">
                  {t('subscriptions.detail.compliance.final.validatedBy', {
                    name: compliance.by ?? '',
                    date: compliance.at ?? '',
                  })}
                </span>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Badge className="bg-amber-100 text-amber-700 border-amber-300">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              {t(`subscriptions.detail.compliance.status.${compliance.status}`)}
            </Badge>
          )}
          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onOpen}>
            <ChevronRight className="w-3.5 h-3.5" />
            {t(`${KEY}.compliance.view`)}
          </Button>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: 'auto auto minmax(0, 1fr)' }}>
        <div className="min-w-0">
          <span className={cn(WIDGET_LABEL_CLASS, 'flex items-center gap-1.5')}>
            <Radar className="w-3.5 h-3.5" />
            {t('subscriptions.detail.compliance.score.title')}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground tabular-nums">
              {snapshot.score ?? '-'}
            </span>
            {snapshot.tier && (
              <ToneBadge
                tone={snapshot.tier.tone}
                label={t(snapshot.tier.labelKey)}
                className="text-[11px]"
              />
            )}
          </div>
        </div>

        <div className="min-w-0">
          <span className={cn(WIDGET_LABEL_CLASS, 'flex items-center gap-1.5')}>
            <Users className="w-3.5 h-3.5" />
            {t('subscriptions.detail.compliance.final.thirdParties')}
          </span>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {snapshot.untreatedHits > 0 ? (
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
                <Clock className="w-3 h-3 mr-1" />
                {tc('subscriptions.detail.compliance.final.matchesToTreat', snapshot.untreatedHits)}
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t(`${KEY}.compliance.noPendingMatch`)}
              </span>
            )}
            {snapshot.acceptedHits > 0 && (
              <Badge className="bg-red-50 text-red-700 border-red-200 text-[11px]">
                {tc('subscriptions.detail.compliance.final.matchesAccepted', snapshot.acceptedHits)}
              </Badge>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <span className={cn(WIDGET_LABEL_CLASS, 'flex items-center gap-1.5')}>
            <UserCheck className="w-3.5 h-3.5" />
            {t('subscriptions.detail.compliance.categorisation.shortTitle')}
          </span>
          <p
            className="mt-1 truncate text-sm font-medium text-foreground"
            title={`${categoryLabel} · ${t('subscriptions.detail.compliance.categorisation.mifid')}`}
          >
            {categoryLabel}
          </p>
        </div>
      </div>
    </Card>
  );
}

interface PackGroupProps {
  icon: typeof PenTool;
  title: string;
  hint: string;
  count: number;
  emptyLabel: string;
  documents: MockSignaturePackDocument[];
  locked: boolean;
  signed: boolean;
  onKindChange: (id: string, kind: SignaturePackDocumentKind) => void;
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
  onKindChange,
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
        <ul className="space-y-2">
          {documents.map(doc => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3"
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
                  {locked && doc.kind === 'toSign' && signed && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[11px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {t(`${KEY}.pack.signed`)}
                    </Badge>
                  )}
                  <span className="truncate text-xs text-foreground/70">{doc.file}</span>
                </div>
              </div>

              {!locked && (
                <Select
                  value={doc.kind}
                  onValueChange={value => onKindChange(doc.id, value as SignaturePackDocumentKind)}
                >
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toSign">{t(`${KEY}.pack.kind.toSign`)}</SelectItem>
                    <SelectItem value="annex">{t(`${KEY}.pack.kind.annex`)}</SelectItem>
                  </SelectContent>
                </Select>
              )}

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
  name: string;
  role: string;
  email: string;
}

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
}: PartyCardProps) {
  const { t } = useTranslation();
  const locked = stage !== 'draft';
  const groupKey = kind === 'signatory' ? 'signatories' : 'counterSignatories';

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<PartyFormValues>({ name: '', role: '', email: '' });

  const visible = locked ? parties.filter(party => party.included) : parties;
  const includedCount = parties.filter(party => party.included).length;
  const signedCount = parties.filter(party => party.included && party.status === 'signed').length;

  const startEdit = (party: SignatureParty) => {
    setAdding(false);
    setEditingId(party.id);
    setForm({
      name: party.name,
      role: party.roleKey ? t(party.roleKey) : party.role ?? '',
      email: party.email,
    });
  };

  const startAdd = () => {
    setEditingId(null);
    setAdding(true);
    setForm({ name: '', role: '', email: '' });
  };

  const cancelForm = () => {
    setEditingId(null);
    setAdding(false);
  };

  const submitForm = () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error(t(`${KEY}.parties.toast.invalid`));
      return;
    }
    const values = { name: form.name.trim(), role: form.role.trim(), email: form.email.trim() };
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
          value={form.name}
          onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
          placeholder={t(`${KEY}.parties.form.name`)}
          className="h-8 text-sm"
        />
        <Input
          value={form.role}
          onChange={event => setForm(prev => ({ ...prev, role: event.target.value }))}
          placeholder={t(`${KEY}.parties.form.role`)}
          className="h-8 text-sm"
        />
      </div>
      <Input
        type="email"
        value={form.email}
        onChange={event => setForm(prev => ({ ...prev, email: event.target.value }))}
        placeholder={t(`${KEY}.parties.form.email`)}
        className="h-8 text-sm"
      />
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
          {locked ? (
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
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={startAdd}>
                <Plus className="w-3.5 h-3.5" />
                {t(`${KEY}.parties.${groupKey}.add`)}
              </Button>
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

          const roleLabel = party.roleKey ? t(party.roleKey) : party.role;

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
                  {roleLabel ? `${roleLabel} · ${party.email}` : party.email}
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
                    {party.status === 'notSent' && (
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

                {locked && party.status === 'notSent' && (
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
