/**
 * Socle commun des actions sur les notices : appels de fonds, distributions, capital accounts et déblocages.
 * Les règles de disponibilité sont celles que le serveur applique ; l'interface les rejoue pour proposer ou non une action.
 */

export type NoticeFamily = 'capitalCalls' | 'distributions' | 'capitalAccounts' | 'releases';

export type NoticeSendKind = 'notification' | 'reminder';

export const NOTICE_DOCUMENT_SOURCES = ['generated', 'manual', 'generatedAndManual'] as const;
export type NoticeDocumentSource = (typeof NOTICE_DOCUMENT_SOURCES)[number];

/** Document d'une ligne : avis ou courrier, généré par la plateforme ou chargé à la main. */
export interface NoticeDocument {
  /** Fichier chargé à la place du document généré. */
  manualFile: string | null;
  /** Fichiers complémentaires, joints à la notification. */
  extraFiles: string[];
  /** Dernière génération ; vide quand le document est manuel ou repris de la V1. */
  generatedAt: Date | null;
  /** Dernier chargement manuel. */
  addedAt: Date | null;
}

export interface NoticeLine {
  id: number;
  investor: string;
  subscription: string;
  subscriptionId: number;
  notifiedAt: Date | null;
  document: NoticeDocument;
}

export const generatedDocument = (generatedAt: Date | null): NoticeDocument => ({
  manualFile: null,
  extraFiles: [],
  generatedAt,
  addedAt: null,
});

export function documentSource(document: NoticeDocument): NoticeDocumentSource {
  if (document.manualFile) return 'manual';
  return document.extraFiles.length > 0 ? 'generatedAndManual' : 'generated';
}

/** Paiement d'une ligne, pour les familles qui en suivent un. */
export interface NoticePaymentRules<L> {
  isPaid(line: L): boolean;
  paidAt(line: L): Date | null;
  validate(line: L, receivedOn: Date): L;
  editDate(line: L, receivedOn: Date): L;
  invalidate(line: L): L;
}

export interface NoticeRules<L extends NoticeLine> {
  family: NoticeFamily;
  /** Vocabulaire du document : avis ("document") ou courrier ("letter"). */
  documentKind: 'document' | 'letter';
  /** La famille relance une ligne déjà notifiée. */
  hasReminder: boolean;
  /** Gabarit que recevrait la ligne ; null quand elle n'est plus éligible à un envoi. */
  sendKind(line: L): NoticeSendKind | null;
  isHidden(line: L): boolean;
  /** Document jamais produit ou en échec : il est généré avant d'être affiché, téléchargé ou joint. */
  documentMissing(line: L): boolean;
  applySend(line: L, kind: NoticeSendKind, at: Date): L;
  /** Réaligne les champs propres à la famille après un changement de document. */
  syncDocument?(line: L): L;
  payment?: NoticePaymentRules<L>;
}

/** Réglages de l'objet parent et droits de l'utilisateur, tels que le serveur les contrôle. */
export interface NoticeContext {
  /** Créé avec Notification = Oui. Toujours vrai pour un déblocage. */
  notify: boolean;
  /** Avis affichés. */
  noticesShown: boolean;
  sending: boolean;
  canNotify: boolean;
  /** Droit de consulter les investisseurs du fonds, exigé pour le téléchargement groupé depuis le listing. */
  canDownload: boolean;
}

export const LINE_ACTIONS = [
  'preview',
  'notify',
  'validatePayment',
  'previewNotification',
  'exportTarget',
  'download',
  'upload',
  'regenerate',
  'editPayment',
  'invalidatePayment',
] as const;
export type NoticeLineAction = (typeof LINE_ACTIONS)[number];

/** Actions lancées sur une sélection depuis le bouton d'action global. */
export const BULK_LINE_ACTIONS: NoticeLineAction[] = [
  'notify',
  'validatePayment',
  'exportTarget',
  'download',
  'regenerate',
  'editPayment',
  'invalidatePayment',
];

const LINE_LOCKED_WHILE_SENDING = new Set<NoticeLineAction>(['notify', 'upload', 'regenerate']);

export const lineLockedWhileSending = (action: NoticeLineAction) => LINE_LOCKED_WHILE_SENDING.has(action);

export function lineEligible<L extends NoticeLine>(
  rules: NoticeRules<L>,
  context: NoticeContext,
  action: NoticeLineAction,
  line: L,
): boolean {
  switch (action) {
    case 'notify':
    case 'exportTarget':
    case 'previewNotification':
      return context.notify && context.canNotify && rules.sendKind(line) !== null;
    case 'regenerate':
      return context.canNotify && context.noticesShown && line.notifiedAt === null;
    case 'preview':
    case 'download':
      return context.noticesShown && !rules.isHidden(line);
    case 'upload':
      return true;
    case 'validatePayment':
      return Boolean(rules.payment) && !rules.payment!.isPaid(line);
    case 'editPayment':
    case 'invalidatePayment':
      return Boolean(rules.payment) && rules.payment!.isPaid(line);
  }
}

export const PARENT_ACTIONS = ['notify', 'exportTarget', 'regenerate', 'download', 'delete'] as const;
export type NoticeParentAction = (typeof PARENT_ACTIONS)[number];

export type NoticeParentBlocker = 'notEligible' | 'sending';

const PARENT_LOCKED_WHILE_SENDING = new Set<NoticeParentAction>(['notify', 'regenerate', 'delete']);

/** Lignes de l'objet sur lesquelles l'action du listing s'applique. */
export function parentTargetLines<L extends NoticeLine>(
  rules: NoticeRules<L>,
  context: NoticeContext,
  action: NoticeParentAction,
  lines: L[],
): L[] {
  switch (action) {
    case 'notify':
    case 'exportTarget':
      return context.notify && context.canNotify ? lines.filter(line => rules.sendKind(line) !== null) : [];
    case 'regenerate':
      return context.canNotify && context.noticesShown ? lines.filter(line => line.notifiedAt === null) : [];
    case 'download':
      return context.canDownload && context.noticesShown ? lines.filter(line => !rules.isHidden(line)) : [];
    case 'delete':
      return lines.some(line => line.notifiedAt !== null) ? [] : lines;
  }
}

export function parentBlocker<L extends NoticeLine>(
  rules: NoticeRules<L>,
  context: NoticeContext,
  action: NoticeParentAction,
  lines: L[],
): NoticeParentBlocker | null {
  const targets = parentTargetLines(rules, context, action, lines);
  // Un objet sans ligne reste supprimable.
  if (targets.length === 0 && !(action === 'delete' && lines.length === 0)) return 'notEligible';
  if (context.sending && PARENT_LOCKED_WHILE_SENDING.has(action)) return 'sending';
  return null;
}

export function regenerateDocument<L extends NoticeLine>(rules: NoticeRules<L>, line: L, at: Date): L {
  const next = { ...line, document: { ...line.document, manualFile: null, generatedAt: at } };
  return rules.syncDocument ? rules.syncDocument(next) : next;
}

/** Document manquant : il est produit avant d'être affiché, téléchargé ou joint. */
export function ensureDocument<L extends NoticeLine>(rules: NoticeRules<L>, line: L, at: Date): L {
  return rules.documentMissing(line) ? regenerateDocument(rules, line, at) : line;
}

export type NoticeUploadUsage = 'add' | 'replace';

export function uploadDocument<L extends NoticeLine>(
  rules: NoticeRules<L>,
  line: L,
  fileName: string,
  usage: NoticeUploadUsage,
  at: Date,
): L {
  const document: NoticeDocument =
    usage === 'replace'
      ? { ...line.document, manualFile: fileName, generatedAt: null, addedAt: at }
      : { ...line.document, extraFiles: [...line.document.extraFiles, fileName], addedAt: at };
  const next = { ...line, document };
  return rules.syncDocument ? rules.syncDocument(next) : next;
}
