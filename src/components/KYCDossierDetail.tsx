/**
 * Layout choisi pour le compliance officer : header sticky (statut + risque +
 * actions) toujours visible, deux colonnes en dessous — corps tabulé à gauche
 * (Identité / Documents / UBO / Risque / Audit / Notes) et un rail droit
 * permanent (score de risque, workflow, assignée) pour garder la décision et
 * l'audit en contexte sans devoir naviguer entre onglets.
 */

import * as React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Flag,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Pin,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCog,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Textarea } from './ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import {
  Timeline,
  type TimelineEvent,
  type TimelineTypeMap,
} from './ui/timeline';
import { StatusBadge } from './StatusBadge';
import { UserCell } from './UserCell';
import { cn } from './ui/utils';
import type {
  AuditEventType,
  DocumentItem,
  DocumentStatus,
  DossierComment,
  DossierStatus,
  IdentityEntity,
  IdentityIndividual,
  KYCDossierDetail as KYCDossierDetailModel,
  RiskLevel,
  ScreeningResult,
  ScreeningType,
  UBO,
  WorkflowState,
} from './KYCDossierDetail.types';

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'neutral';

const STATUS_LABEL_FR: Record<DossierStatus, string> = {
  to_review: 'À traiter',
  in_review: 'En revue',
  approved: 'Validé',
  rejected: 'Rejeté',
  expired: 'Expiré',
};

const STATUS_VARIANT: Record<DossierStatus, StatusBadgeVariant> = {
  to_review: 'warning',
  in_review: 'warning',
  approved: 'success',
  rejected: 'danger',
  expired: 'neutral',
};

const RISK_LABEL_FR: Record<RiskLevel, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Élevé',
};

const RISK_VARIANT: Record<RiskLevel, StatusBadgeVariant> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

const RISK_TOKEN: Record<RiskLevel, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
};

const DOC_STATUS_LABEL: Record<DocumentStatus, string> = {
  verified: 'Vérifié',
  pending: 'En attente',
  expired: 'Expiré',
  rejected: 'Rejeté',
};

const DOC_STATUS_VARIANT: Record<DocumentStatus, StatusBadgeVariant> = {
  verified: 'success',
  pending: 'warning',
  expired: 'neutral',
  rejected: 'danger',
};

const SCREENING_LABEL: Record<ScreeningType, string> = {
  pep: 'PEP',
  sanctions: 'Sanctions internationales',
  adverse_media: 'Médias négatifs',
};

const SCREENING_ICON: Record<ScreeningType, React.ComponentType<{ className?: string }>> = {
  pep: Flag,
  sanctions: ShieldAlert,
  adverse_media: Globe,
};

const AUDIT_TYPES: TimelineTypeMap<AuditEventType> = {
  document_uploaded: { label: 'Document déposé', Icon: FileText },
  document_verified: { label: 'Document vérifié', Icon: CheckCircle2 },
  document_rejected: { label: 'Document rejeté', Icon: XCircle },
  screening_run: { label: 'Screening lancé', Icon: RefreshCw },
  screening_hit: { label: 'Hit screening', Icon: AlertTriangle },
  comment_added: { label: 'Note interne', Icon: MessageSquare },
  status_changed: { label: 'Changement de statut', Icon: Sparkles },
  reassigned: { label: 'Réassignation', Icon: UserCog },
  reminder_sent: { label: 'Relance envoyée', Icon: Send },
};

const SUBSCORE_META: Array<{
  key: keyof KYCDossierDetailModel['risk']['subscores'];
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: 'geography', label: 'Géographie', Icon: Globe },
  { key: 'activity', label: 'Activité', Icon: Sparkles },
  { key: 'politicalExposure', label: 'Exposition politique', Icon: Flag },
  { key: 'sanctions', label: 'Sanctions', Icon: ShieldAlert },
];

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFormatter.format(d);
}

function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateTimeFormatter.format(d);
}

function relativeFromNow(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const day = 24 * 60 * 60 * 1000;
  if (abs < day) return ms >= 0 ? 'aujourd’hui' : 'hier';
  const days = Math.round(abs / day);
  if (days < 30) return ms >= 0 ? `dans ${days} j` : `il y a ${days} j`;
  const months = Math.round(days / 30);
  if (months < 12) return ms >= 0 ? `dans ${months} mois` : `il y a ${months} mois`;
  const years = Math.round(days / 365);
  return ms >= 0 ? `dans ${years} an${years > 1 ? 's' : ''}` : `il y a ${years} an${years > 1 ? 's' : ''}`;
}

interface DefinitionRowProps {
  label: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

function DefinitionRow({ label, children, icon: Icon }: DefinitionRowProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1.5">
        {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
        {label}
      </span>
      <span className="text-sm text-foreground break-words">{children}</span>
    </div>
  );
}

function ScreeningRow({ result }: { result: ScreeningResult }) {
  const Icon = SCREENING_ICON[result.type];
  const isHit = result.status === 'hit';
  const isClear = result.status === 'clear';
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full size-8 shrink-0',
            isHit ? 'bg-destructive/10' : isClear ? 'bg-muted' : 'bg-muted',
          )}
        >
          <Icon
            className="w-4 h-4"
            style={{
              color: isHit
                ? 'var(--danger)'
                : isClear
                  ? 'var(--success)'
                  : 'var(--warning)',
            }}
          />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {SCREENING_LABEL[result.type]}
          </p>
          <p className="text-xs text-muted-foreground">
            Dernier screening · {formatDateTime(result.lastChecked)}
          </p>
        </div>
      </div>
      <StatusBadge
        label={isHit ? `${result.hits} hit${result.hits > 1 ? 's' : ''}` : isClear ? 'Clean' : 'En cours'}
        variant={isHit ? 'danger' : isClear ? 'success' : 'warning'}
      />
    </div>
  );
}

function WorkflowStepIndicator({
  index,
  status,
}: {
  index: number;
  status: 'done' | 'current' | 'todo';
}) {
  const baseClass = 'inline-flex items-center justify-center rounded-full size-8 shrink-0 text-xs font-semibold';

  if (status === 'done') {
    return (
      <span className={cn(baseClass, 'bg-primary text-primary-foreground')}>
        <Check className="w-4 h-4" />
      </span>
    );
  }
  if (status === 'current') {
    return (
      <span
        className={cn(baseClass, 'bg-primary/10 text-primary border border-primary')}
      >
        {index + 1}
      </span>
    );
  }
  return (
    <span className={cn(baseClass, 'bg-muted text-muted-foreground border border-border')}>
      {index + 1}
    </span>
  );
}

function RiskGauge({ level, score }: { level: RiskLevel; score: number }) {
  const safeScore = Math.max(0, Math.min(100, score));
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative inline-flex items-center justify-center size-20 rounded-full"
        style={{
          background: `conic-gradient(${RISK_TOKEN[level]} ${safeScore * 3.6}deg, var(--muted) 0deg)`,
        }}
      >
        <div className="absolute inset-1.5 rounded-full bg-card flex flex-col items-center justify-center">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color: RISK_TOKEN[level] }}
          >
            {safeScore}
          </span>
          <span className="text-[10px] text-muted-foreground -mt-0.5">/ 100</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Score global
        </p>
        <StatusBadge label={`Risque ${RISK_LABEL_FR[level]}`} variant={RISK_VARIANT[level]} />
        <p className="text-xs text-muted-foreground mt-1.5">
          Recalculé après chaque screening
        </p>
      </div>
    </div>
  );
}

interface KYCDossierDetailProps extends KYCDossierDetailModel {
  onBack?: () => void;
  onValidate?: () => void;
  onReject?: () => void;
  onRequestComplement?: () => void;
  onReassign?: () => void;
  onRunScreening?: () => void;
  onDocumentDownload?: (doc: DocumentItem) => void;
  onDocumentPreview?: (doc: DocumentItem) => void;
  onCommentSubmit?: (body: string) => void;
}

export function KYCDossierDetail(props: KYCDossierDetailProps) {
  const {
    subjectType,
    displayName,
    reference,
    status,
    riskLevel,
    createdAt,
    updatedAt,
    identity,
    documents,
    ubos,
    risk,
    workflow,
    auditEvents,
    comments,
    onBack,
    onValidate,
    onReject,
    onRequestComplement,
    onReassign,
    onRunScreening,
    onDocumentDownload,
    onDocumentPreview,
    onCommentSubmit,
  } = props;

  const [commentDraft, setCommentDraft] = React.useState('');

  const isEntity = subjectType === 'entity';
  const headerSubjectIcon = isEntity ? Building2 : User;
  const HeaderIcon = headerSubjectIcon;

  const auditTimelineEvents: TimelineEvent<AuditEventType>[] = React.useMemo(
    () =>
      auditEvents.map((event) => ({
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        actorName: event.actorName,
        actorSublabel: event.actorSublabel,
        actorRole: event.actorRole,
        description: event.description,
      })),
    [auditEvents],
  );

  const verifiedDocs = documents.filter((d) => d.status === 'verified').length;
  const docsTotal = documents.length;

  const sortedComments = React.useMemo(
    () =>
      [...comments].sort((a, b) => {
        if ((b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) !== 0) {
          return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }),
    [comments],
  );

  const handleSubmitComment = () => {
    const value = commentDraft.trim();
    if (!value) return;
    onCommentSubmit?.(value);
    setCommentDraft('');
  };

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col bg-muted/30">
        {/* Breadcrumb / Back */}
        <div className="px-6 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-muted-foreground">Conformité</span>
            <span className="text-muted-foreground/60">/</span>
            <button
              type="button"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dossiers
            </button>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-medium text-foreground truncate">{displayName}</span>
          </div>
        </div>

        {/* Sticky header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-20 px-6 py-5 border-b border-border bg-card/95 backdrop-blur"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-4 min-w-0">
              <Avatar className="size-12 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <HeaderIcon className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold text-foreground tracking-tight truncate">
                    {displayName}
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    {isEntity ? 'Personne morale' : 'Personne physique'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <FileText className="w-3 h-3" /> ID {reference}
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <StatusBadge
                    label={STATUS_LABEL_FR[status]}
                    variant={STATUS_VARIANT[status]}
                  />
                  <StatusBadge
                    label={`Risque ${RISK_LABEL_FR[riskLevel]}`}
                    variant={RISK_VARIANT[riskLevel]}
                  />
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Maj. {relativeFromNow(updatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Button variant="outline" size="sm" onClick={onReassign} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Réassigner
              </Button>
              <Button variant="outline" size="sm" onClick={onRequestComplement} className="gap-2">
                <Mail className="w-4 h-4" />
                Demander un complément
              </Button>
              <Button variant="danger" size="sm" onClick={onReject} className="gap-2">
                <XCircle className="w-4 h-4" />
                Rejeter
              </Button>
              <Button variant="primary" size="sm" onClick={onValidate} className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                Valider
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Body */}
        <div className="flex-1 px-6 py-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Main column */}
            <div className="min-w-0">
              <Tabs defaultValue="identity">
                <TabsList className="h-auto p-1 flex flex-wrap gap-1 bg-muted">
                  <TabsTrigger value="identity" className="gap-2">
                    <User className="w-4 h-4" /> Identité
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="gap-2">
                    <FileText className="w-4 h-4" /> Documents
                    <Badge variant="secondary" className="ml-1 px-1.5">
                      {docsTotal}
                    </Badge>
                  </TabsTrigger>
                  {isEntity && (
                    <TabsTrigger value="ubo" className="gap-2">
                      <Users className="w-4 h-4" /> UBO
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="risk" className="gap-2">
                    <ShieldAlert className="w-4 h-4" /> Risque
                  </TabsTrigger>
                  <TabsTrigger value="audit" className="gap-2">
                    <Clock className="w-4 h-4" /> Audit
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="gap-2">
                    <MessageSquare className="w-4 h-4" /> Notes
                    <Badge variant="secondary" className="ml-1 px-1.5">
                      {comments.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                {/* Identity */}
                <TabsContent value="identity" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {isEntity ? 'Informations légales' : 'Identité'}
                      </CardTitle>
                      <CardDescription>
                        {isEntity
                          ? 'Données légales déclarées et représentants.'
                          : 'Données personnelles déclarées par l’investisseur.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                      {isEntity ? (
                        <EntityIdentityFields identity={identity as IdentityEntity} />
                      ) : (
                        <IndividualIdentityFields identity={identity as IdentityIndividual} />
                      )}
                    </CardContent>
                  </Card>

                  {isEntity && (identity as IdentityEntity).legalRepresentatives.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Représentants légaux</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(identity as IdentityEntity).legalRepresentatives.map((rep) => (
                          <div
                            key={`${rep.name}-${rep.role}`}
                            className="rounded-lg border border-border bg-card p-3"
                          >
                            <UserCell name={rep.name} sublabel={rep.role} size="md" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Documents */}
                <TabsContent value="documents" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <CardTitle className="text-base">Documents justificatifs</CardTitle>
                          <CardDescription>
                            {verifiedDocs} sur {docsTotal} vérifié{docsTotal > 1 ? 's' : ''}
                          </CardDescription>
                        </div>
                        <div className="w-48">
                          <Progress value={docsTotal === 0 ? 0 : (verifiedDocs / docsTotal) * 100} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Déposé le</TableHead>
                            <TableHead>Expire le</TableHead>
                            <TableHead>Déposé par</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documents.map((doc) => (
                            <DocumentRow
                              key={doc.id}
                              doc={doc}
                              onPreview={onDocumentPreview}
                              onDownload={onDocumentDownload}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* UBO */}
                {isEntity && (
                  <TabsContent value="ubo" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Bénéficiaires effectifs (UBO)</CardTitle>
                        <CardDescription>
                          Personnes physiques détenant in fine plus de 25 % du capital ou des droits de vote.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Bénéficiaire</TableHead>
                              <TableHead>% détention</TableHead>
                              <TableHead>Contrôle</TableHead>
                              <TableHead>Nationalité</TableHead>
                              <TableHead>PEP</TableHead>
                              <TableHead>KYC propre</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(ubos ?? []).map((ubo) => (
                              <UboRow key={ubo.id} ubo={ubo} />
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* Risk */}
                <TabsContent value="risk" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Sous-scores</CardTitle>
                      <CardDescription>
                        Décomposition du risque global en facteurs réglementaires.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                      {SUBSCORE_META.map(({ key, label, Icon }) => {
                        const sub = risk.subscores[key];
                        return (
                          <div
                            key={key}
                            className="rounded-lg border border-border bg-card p-3"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-sm font-medium text-foreground inline-flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                {label}
                              </span>
                              <StatusBadge
                                label={RISK_LABEL_FR[sub.level]}
                                variant={RISK_VARIANT[sub.level]}
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Progress value={sub.score} className="flex-1" />
                              <span className="text-sm font-semibold tabular-nums text-foreground w-10 text-right">
                                {sub.score}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <CardTitle className="text-base">Screenings réglementaires</CardTitle>
                          <CardDescription>
                            PEP, listes de sanctions et médias négatifs.
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onRunScreening}
                          className="gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Relancer le screening
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-border">
                        {risk.screenings.map((s) => (
                          <ScreeningRow key={s.type} result={s} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {risk.screenings.some((s) => s.status === 'hit') && (
                    <Alert variant="destructive">
                      <AlertTriangle />
                      <AlertTitle>Hits à examiner</AlertTitle>
                      <AlertDescription>
                        Au moins un screening a remonté un résultat positif. Confirmez ou
                        écartez chaque hit avant de pouvoir valider le dossier.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                {/* Audit */}
                <TabsContent value="audit" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Historique du dossier</CardTitle>
                      <CardDescription>
                        Trace exhaustive des actions humaines et système, du dépôt à la décision.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Timeline<AuditEventType>
                        events={auditTimelineEvents}
                        types={AUDIT_TYPES}
                        pageSize={0}
                        enableExport={false}
                        emptyLabel="Aucun événement enregistré sur ce dossier."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Notes */}
                <TabsContent value="notes" className="mt-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes & commentaires internes</CardTitle>
                      <CardDescription>
                        Visible uniquement par l’équipe compliance. Utilisez @ pour mentionner.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CommentComposer
                        value={commentDraft}
                        onChange={setCommentDraft}
                        onSubmit={handleSubmitComment}
                      />
                      <Separator />
                      <div className="space-y-3">
                        {sortedComments.map((c) => (
                          <CommentItemBlock key={c.id} comment={c} />
                        ))}
                        {sortedComments.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            Pas encore de note interne sur ce dossier.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right rail */}
            <div className="space-y-4 lg:sticky lg:top-[140px] lg:self-start">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Score de risque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RiskGauge level={risk.level} score={risk.globalScore} />
                  <Separator />
                  <ul className="space-y-2">
                    {SUBSCORE_META.map(({ key, label, Icon }) => {
                      const sub = risk.subscores[key];
                      return (
                        <li
                          key={key}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="inline-flex items-center gap-2 text-muted-foreground">
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <span className="text-foreground font-medium tabular-nums">
                              {sub.score}
                            </span>
                            <span
                              aria-hidden
                              className="inline-block size-2 rounded-full"
                              style={{ backgroundColor: RISK_TOKEN[sub.level] }}
                            />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>

              <WorkflowCard workflow={workflow} />

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Assignation</CardTitle>
                  <CardDescription>Personne en charge du dossier.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workflow.assignee ? (
                    <UserCell
                      name={workflow.assignee.name}
                      sublabel={workflow.assignee.sublabel}
                      size="md"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Non assigné.</p>
                  )}
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={onReassign}>
                    <UserCog className="w-4 h-4" />
                    Réassigner le dossier
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Métadonnées</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Créé le
                    </span>
                    <span className="text-foreground">{formatDate(createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Maj. le
                    </span>
                    <span className="text-foreground">{formatDateTime(updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function IndividualIdentityFields({ identity }: { identity: IdentityIndividual }) {
  return (
    <>
      <DefinitionRow label="Prénom" icon={User}>
        {identity.firstName}
      </DefinitionRow>
      <DefinitionRow label="Nom" icon={User}>
        {identity.lastName}
      </DefinitionRow>
      <DefinitionRow label="Date de naissance" icon={Calendar}>
        {formatDate(identity.birthDate)}
      </DefinitionRow>
      <DefinitionRow label="Lieu de naissance" icon={MapPin}>
        {identity.birthPlace}
      </DefinitionRow>
      <DefinitionRow label="Nationalité" icon={Flag}>
        {identity.nationality}
      </DefinitionRow>
      <DefinitionRow label="Profession" icon={Sparkles}>
        {identity.profession}
      </DefinitionRow>
      <DefinitionRow label="Adresse" icon={MapPin}>
        {identity.address}
      </DefinitionRow>
      <DefinitionRow label="Email" icon={Mail}>
        <a
          href={`mailto:${identity.email}`}
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          {identity.email} <ExternalLink className="w-3 h-3" />
        </a>
      </DefinitionRow>
      <DefinitionRow label="Téléphone" icon={Phone}>
        {identity.phone}
      </DefinitionRow>
    </>
  );
}

function EntityIdentityFields({ identity }: { identity: IdentityEntity }) {
  return (
    <>
      <DefinitionRow label="Raison sociale" icon={Building2}>
        {identity.legalName}
      </DefinitionRow>
      <DefinitionRow label="Forme juridique" icon={FileText}>
        {identity.legalForm}
      </DefinitionRow>
      <DefinitionRow label="Immatriculation" icon={FileText}>
        {identity.registrationNumber}
      </DefinitionRow>
      <DefinitionRow label="Date de constitution" icon={Calendar}>
        {formatDate(identity.incorporationDate)}
      </DefinitionRow>
      <DefinitionRow label="Siège social" icon={MapPin}>
        {identity.headOffice}
      </DefinitionRow>
      <DefinitionRow label="Secteur d’activité" icon={Sparkles}>
        {identity.sector}
      </DefinitionRow>
    </>
  );
}

function DocumentRow({
  doc,
  onPreview,
  onDownload,
}: {
  doc: DocumentItem;
  onPreview?: (doc: DocumentItem) => void;
  onDownload?: (doc: DocumentItem) => void;
}) {
  const isExpiringSoon =
    doc.expiresAt &&
    new Date(doc.expiresAt).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30;
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center justify-center rounded-md size-8 bg-muted text-muted-foreground shrink-0">
            <FileText className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{doc.type}</p>
            {doc.fileSize ? (
              <p className="text-xs text-muted-foreground">{doc.fileSize}</p>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge
          label={DOC_STATUS_LABEL[doc.status]}
          variant={DOC_STATUS_VARIANT[doc.status]}
        />
      </TableCell>
      <TableCell className="text-sm text-foreground whitespace-nowrap">
        {formatDate(doc.uploadedAt)}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {doc.expiresAt ? (
          <span
            className={cn(
              'text-sm inline-flex items-center gap-1.5',
              isExpiringSoon ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {formatDate(doc.expiresAt)}
            {isExpiringSoon && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <AlertTriangle
                      className="w-3.5 h-3.5"
                      style={{ color: 'var(--warning)' }}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Expire bientôt</TooltipContent>
              </Tooltip>
            )}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <UserCell name={doc.uploader.name} sublabel={doc.uploader.sublabel} size="sm" />
      </TableCell>
      <TableCell className="text-right">
        <div className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onPreview?.(doc)}
            aria-label="Aperçu"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onDownload?.(doc)}
            aria-label="Télécharger"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function UboRow({ ubo }: { ubo: UBO }) {
  return (
    <TableRow>
      <TableCell>
        <UserCell name={ubo.name} sublabel={`${ubo.controlType === 'direct' ? 'Direct' : 'Indirect'}`} size="md" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 max-w-[160px]">
          <Progress value={ubo.ownership} className="flex-1" />
          <span className="text-sm font-semibold tabular-nums text-foreground w-10 text-right">
            {ubo.ownership}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs capitalize">
          {ubo.controlType === 'direct' ? 'Direct' : 'Indirect'}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-foreground">{ubo.nationality}</TableCell>
      <TableCell>
        {ubo.isPep ? (
          <StatusBadge label="PEP" variant="danger" />
        ) : (
          <StatusBadge label="Non PEP" variant="neutral" />
        )}
      </TableCell>
      <TableCell>
        <StatusBadge
          label={STATUS_LABEL_FR[ubo.kycStatus]}
          variant={STATUS_VARIANT[ubo.kycStatus]}
        />
      </TableCell>
    </TableRow>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowState }) {
  const total = workflow.steps.length;
  const doneCount = workflow.steps.filter((s) => s.status === 'done').length;
  const progressPct = total === 0 ? 0 : (doneCount / total) * 100;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Workflow de validation</CardTitle>
        <CardDescription>
          {doneCount} sur {total} étape{total > 1 ? 's' : ''} terminée{doneCount > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={progressPct} />
        <ol className="space-y-3">
          {workflow.steps.map((step, idx) => (
            <li key={step.key} className="flex items-start gap-3">
              <WorkflowStepIndicator index={idx} status={step.status} />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    step.status === 'done' && 'text-muted-foreground line-through decoration-1',
                    step.status === 'current' && 'text-foreground',
                    step.status === 'todo' && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
                {step.status === 'current' && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Étape en cours
                  </p>
                )}
              </div>
              {idx < workflow.steps.length - 1 && step.status !== 'todo' && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-1.5" />
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function CommentComposer({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ajouter une note interne... utilisez @ pour mentionner un collègue."
        rows={3}
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="primary"
          size="sm"
          className="gap-2"
          disabled={!value.trim()}
          onClick={onSubmit}
        >
          <Send className="w-4 h-4" />
          Publier la note
        </Button>
      </div>
    </div>
  );
}

function CommentItemBlock({ comment }: { comment: DossierComment }) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3',
        comment.pinned ? 'border-primary/40 bg-primary/5' : 'border-border bg-card',
      )}
    >
      <div className="flex items-start gap-3">
        <UserCell name={comment.author.name} sublabel={comment.author.sublabel} size="md" avatarOnly />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{comment.author.name}</span>
              {comment.author.sublabel && (
                <span className="text-xs text-muted-foreground">·  {comment.author.sublabel}</span>
              )}
              {comment.pinned && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Pin className="w-3 h-3" /> Épinglée
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{formatDateTime(comment.timestamp)}</span>
          </div>
          <p className="text-sm text-foreground mt-1.5 whitespace-pre-line">{comment.body}</p>
        </div>
      </div>
    </div>
  );
}
