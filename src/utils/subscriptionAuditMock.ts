import type { MockRequiredDocument, MockSection } from './subscriptionDetailMockData';

export type SubscriptionAuditEventType =
  | 'invitationSent'
  | 'answerEntered'
  | 'answerModified'
  | 'answerValidated'
  | 'answerInvalidated'
  | 'documentUploaded'
  | 'documentReplaced'
  | 'documentValidated'
  | 'documentRejected'
  | 'documentDatesUpdated'
  | 'dataPropagated'
  | 'dataReset'
  | 'answerReplayed'
  | 'notificationSent'
  | 'dataReported'
  | 'mandateCreated'
  | 'commentAdded'
  | 'dossierSubmitted';

export const SUBSCRIPTION_AUDIT_EVENT_TYPES: SubscriptionAuditEventType[] = [
  'invitationSent',
  'answerEntered',
  'answerModified',
  'answerValidated',
  'answerInvalidated',
  'documentUploaded',
  'documentReplaced',
  'documentValidated',
  'documentRejected',
  'documentDatesUpdated',
  'dataPropagated',
  'dataReset',
  'answerReplayed',
  'notificationSent',
  'dataReported',
  'mandateCreated',
  'commentAdded',
  'dossierSubmitted',
];

/** Origine d'un changement, reprise de IC-5264. */
export type SubscriptionAuditOrigin = 'investor' | 'operator' | 'automatic' | 'api';

export interface SubscriptionAuditEntry {
  id: string;
  type: SubscriptionAuditEventType;
  timestamp: string;
  origin: SubscriptionAuditOrigin;
  /** Absent pour une action automatique ou API : le libellé de l'origine sert d'auteur. */
  actorName?: string;
  /** `${sectionId}-${index}` pour une réponse, `document-${index}` pour une pièce. Absent pour le dossier. */
  elementId?: string;
  /** Absent pour un événement qui porte sur le dossier entier. */
  sectionId?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  /** Validation individuelle produite par la validation d'une section en un clic. */
  viaSection?: boolean;
  /** Donnée liée touchée par une propagation ou une remise à zéro. */
  target?: { object: string; field: string };
  /** Réponse dont la modification a causé cet effet. */
  causeElementId?: string;
}

/** Modifications d'une réponse depuis la soumission et sa dernière validation : compteur du bouton de piste d'audit. */
export function countPendingModifications(entries: SubscriptionAuditEntry[], elementId: string): number {
  const submittedAt = entries.find(e => e.type === 'dossierSubmitted')?.timestamp ?? '';
  let count = 0;
  [...entries]
    .filter(e => e.elementId === elementId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .forEach(e => {
      if (e.type === 'answerValidated') count = 0;
      else if ((e.type === 'answerModified' || e.type === 'answerReplayed') && e.timestamp > submittedAt) count += 1;
    });
  return count;
}

/**
 * Origine du dernier changement de valeur après la première soumission du dossier,
 * null si la réponse n'a pas changé depuis (IC-5264).
 */
export function lastModificationOrigin(
  entries: SubscriptionAuditEntry[],
  elementId: string,
): SubscriptionAuditOrigin | null {
  const submittedAt = entries.find(e => e.type === 'dossierSubmitted')?.timestamp ?? '';
  const last = entries
    .filter(
      e =>
        e.elementId === elementId &&
        (e.type === 'answerModified' || e.type === 'answerReplayed') &&
        e.timestamp > submittedAt,
    )
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .pop();
  return last ? last.origin : null;
}

/** La réponse a déjà été modifiée par le back-office : le rejeu des déclenchements la conserve. */
export function isModifiedByOperator(entries: SubscriptionAuditEntry[], elementId: string): boolean {
  return entries.some(e => e.elementId === elementId && e.type === 'answerModified' && e.origin === 'operator');
}

export const AUDIT_DOSSIER_SCOPE = 'dossier';
export const AUDIT_DOCUMENTS_SECTION = 'documents';

/** Opérateur connecté dans la maquette. */
export const CURRENT_OPERATOR = 'Jean Dupont';
const CONTROLLER = 'Claire Martin';

let liveSequence = 0;

export function createLiveAuditEntry(
  entry: Omit<SubscriptionAuditEntry, 'id' | 'timestamp' | 'origin' | 'actorName'> &
    Partial<Pick<SubscriptionAuditEntry, 'origin' | 'actorName'>>,
): SubscriptionAuditEntry {
  liveSequence += 1;
  return {
    origin: 'operator',
    actorName: CURRENT_OPERATOR,
    ...entry,
    id: `live-${Date.now()}-${liveSequence}`,
    timestamp: new Date().toISOString(),
  };
}

const at = (day: string, minutes: number) => {
  const base = new Date(`${day}:00`);
  base.setMinutes(base.getMinutes() + minutes);
  return base.toISOString();
};

interface BuildInitialAuditInput {
  investorName: string;
  sections: MockSection[];
  documents: MockRequiredDocument[];
  questionStatuses: Record<string, string>;
  documentStatuses: Record<string, string>;
}

/**
 * Piste d'audit de départ de la maquette : invitation, saisie (préremplissage
 * compris), correction avant soumission, soumission, revue du contrôleur,
 * corrections postérieures par le back-office et l'API.
 */
export function buildInitialSubscriptionAudit({
  investorName,
  sections,
  documents,
  questionStatuses,
  documentStatuses,
}: BuildInitialAuditInput): SubscriptionAuditEntry[] {
  const entries: SubscriptionAuditEntry[] = [];
  let seq = 0;
  const push = (entry: Omit<SubscriptionAuditEntry, 'id'>) => {
    seq += 1;
    entries.push({ id: `audit-${seq}`, ...entry });
  };

  push({ type: 'invitationSent', timestamp: at('2026-05-12T09:00', 0), origin: 'automatic' });

  const questionSections = sections.filter(s => s.id !== AUDIT_DOCUMENTS_SECTION);
  questionSections.forEach((section, sectionIdx) => {
    const day = section.preonboarding ? '2026-05-12T10:15' : '2026-05-18T14:00';
    section.questions.forEach((question, idx) => {
      if (!question.response) return;
      const prefilled = (section.id === 'identity' && idx < 5) || Boolean(question.computed);
      push({
        type: 'answerEntered',
        timestamp: at(day, sectionIdx * 25 + idx),
        origin: prefilled ? 'automatic' : 'investor',
        actorName: prefilled ? undefined : investorName,
        elementId: `${section.id}-${idx}`,
        sectionId: section.id,
        newValue: question.response,
      });
    });
  });

  // Correction de l'investisseur avant la soumission : historisée, sans indicateur.
  push({
    type: 'answerModified',
    timestamp: at('2026-05-19T15:50', 0),
    origin: 'investor',
    actorName: investorName,
    elementId: 'financial-0',
    sectionId: 'financial',
    previousValue: '500 000,00 EUR',
    newValue: '800 000,00 EUR',
  });

  documents.forEach((doc, idx) => {
    if (!doc.hasFile) return;
    push({
      type: 'documentUploaded',
      timestamp: at('2026-05-19T16:00', idx),
      origin: 'investor',
      actorName: investorName,
      elementId: `document-${idx}`,
      sectionId: AUDIT_DOCUMENTS_SECTION,
    });
  });

  push({
    type: 'dossierSubmitted',
    timestamp: at('2026-05-19T16:10', 0),
    origin: 'investor',
    actorName: investorName,
  });

  // Report des réponses mappées sur la souscription et la fiche investisseur (IC-5269).
  questionSections.forEach(section => {
    section.questions.forEach((question, idx) => {
      (question.targets ?? []).forEach(target => {
        push({
          type: 'dataReported',
          timestamp: at('2026-05-19T16:10', 0),
          origin: 'automatic',
          elementId: `${section.id}-${idx}`,
          sectionId: section.id,
          previousValue: target.previousValue,
          newValue: question.response,
          target: { object: target.object, field: target.field },
        });
      });
      if (question.createsMandate && question.response === 'Oui') {
        push({
          type: 'mandateCreated',
          timestamp: at('2026-05-19T16:10', 0),
          origin: 'automatic',
          elementId: `${section.id}-${idx}`,
          sectionId: section.id,
          newValue: 'RUM-2026-000184',
        });
      }
    });
  });

  push({
    type: 'answerModified',
    timestamp: at('2026-05-20T08:00', 0),
    origin: 'api',
    elementId: 'professional-1',
    sectionId: 'professional',
    previousValue: 'Cadres',
    newValue: 'Artisans',
  });

  let reviewMinute = 0;
  Object.entries(questionStatuses).forEach(([elementId, status]) => {
    if (status !== 'approved' && status !== 'rejected') return;
    reviewMinute += 2;
    push({
      type: status === 'approved' ? 'answerValidated' : 'answerInvalidated',
      timestamp: at('2026-05-21T10:00', reviewMinute),
      origin: 'operator',
      actorName: CONTROLLER,
      elementId,
      sectionId: elementId.slice(0, elementId.lastIndexOf('-')),
      reason: status === 'rejected' ? "Nationalité incohérente avec la pièce d'identité fournie" : undefined,
    });
  });

  push({
    type: 'answerModified',
    timestamp: at('2026-05-21T10:30', 0),
    origin: 'operator',
    actorName: CONTROLLER,
    elementId: 'banking-4',
    sectionId: 'banking',
    previousValue: 'BNP',
    newValue: 'BNP Paribas',
  });

  // Réponse changée par l'investisseur après une réouverture du dossier.
  push({
    type: 'answerModified',
    timestamp: at('2026-05-20T18:12', 0),
    origin: 'investor',
    actorName: investorName,
    elementId: 'professional-3',
    sectionId: 'professional',
    previousValue: 'Conseiller bancaire',
    newValue: 'banquier',
  });

  push({
    type: 'answerModified',
    timestamp: at('2026-05-21T10:35', 0),
    origin: 'operator',
    actorName: CONTROLLER,
    elementId: 'financial-3',
    sectionId: 'financial',
    previousValue: '900,00 EUR',
    newValue: '1 000,00 EUR',
  });

  Object.entries(documentStatuses).forEach(([elementId, status], idx) => {
    if (status !== 'approved' && status !== 'rejected') return;
    push({
      type: status === 'approved' ? 'documentValidated' : 'documentRejected',
      timestamp: at('2026-05-21T10:40', idx * 3),
      origin: 'operator',
      actorName: CONTROLLER,
      elementId,
      sectionId: AUDIT_DOCUMENTS_SECTION,
      reason: status === 'rejected' ? 'Document illisible, merci de transmettre une copie complète' : undefined,
    });
  });

  return entries;
}
