import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { LucideIcon } from 'lucide-react';
import {
  faClock,
  faPaperPlane,
  faEnvelopeCircleCheck,
  faCircleExclamation,
  faEnvelopeOpen,
  faArrowPointer,
  faFlag,
  faEye,
  faDownload,
  faFileCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import type { TimelineTypeMap } from '../components/ui/timeline';

/**
 * Wraps a FontAwesome icon definition into a React component compatible with
 * the Timeline `LucideIcon` prop (same contract: accepts a `className`).
 */
const faIcon = (icon: IconDefinition): LucideIcon => {
  const Component = (props: { className?: string }) => (
    <FontAwesomeIcon icon={icon} className={props.className} />
  );
  Component.displayName = `FaIcon(${icon.iconName})`;
  return Component as unknown as LucideIcon;
};

export type BirdviewActivityEventCode =
  | 'notification_send_initiated'
  | 'notification_sent'
  | 'notification_delivered'
  | 'notification_failed'
  | 'notification_opened'
  | 'notification_clicked'
  | 'notification_complained'
  | 'document_viewed'
  | 'document_downloaded'
  | 'document_validated';

export interface BirdviewActivityCatalogEntry {
  code: BirdviewActivityEventCode;
  labelFr: string;
  labelEn: string;
  description: string;
  Icon: LucideIcon;
  faIcon: IconDefinition;
  faCode: string;
  group: 'Notification' | 'Document';
}

/**
 * Référentiel unique des événements de la piste d'activité Birdview.
 * Ordonné selon le cycle de vie : envoi → réception → engagement → action document.
 * Source de vérité consommée par le panneau d'activité et le Design System.
 */
export const birdviewActivityCatalog: BirdviewActivityCatalogEntry[] = [
  {
    code: 'notification_send_initiated',
    labelFr: 'Envoi initié',
    labelEn: 'Send initiated',
    description: "L'envoi de la notification a été mis en file d'attente par le système.",
    Icon: faIcon(faClock),
    faIcon: faClock,
    faCode: 'fa-clock',
    group: 'Notification',
  },
  {
    code: 'notification_sent',
    labelFr: 'Notification envoyée',
    labelEn: 'Notification sent',
    description: 'La notification a été transmise au serveur SMTP.',
    Icon: faIcon(faPaperPlane),
    faIcon: faPaperPlane,
    faCode: 'fa-paper-plane',
    group: 'Notification',
  },
  {
    code: 'notification_delivered',
    labelFr: 'Notification délivrée',
    labelEn: 'Notification delivered',
    description: 'Le serveur du destinataire a confirmé la réception du message.',
    Icon: faIcon(faEnvelopeCircleCheck),
    faIcon: faEnvelopeCircleCheck,
    faCode: 'fa-envelope-circle-check',
    group: 'Notification',
  },
  {
    code: 'notification_failed',
    labelFr: 'Notification échouée',
    labelEn: 'Notification failed',
    description: "L'envoi ou la remise a échoué (bounce, adresse invalide, rejet).",
    Icon: faIcon(faCircleExclamation),
    faIcon: faCircleExclamation,
    faCode: 'fa-circle-exclamation',
    group: 'Notification',
  },
  {
    code: 'notification_opened',
    labelFr: 'Notification ouverte',
    labelEn: 'Notification opened',
    description: "Le destinataire a ouvert l'email dans sa messagerie.",
    Icon: faIcon(faEnvelopeOpen),
    faIcon: faEnvelopeOpen,
    faCode: 'fa-envelope-open',
    group: 'Notification',
  },
  {
    code: 'notification_clicked',
    labelFr: 'Notification cliquée',
    labelEn: 'Notification clicked',
    description: 'Le destinataire a cliqué sur un lien de la notification.',
    Icon: faIcon(faArrowPointer),
    faIcon: faArrowPointer,
    faCode: 'fa-arrow-pointer',
    group: 'Notification',
  },
  {
    code: 'notification_complained',
    labelFr: 'Signalée comme spam',
    labelEn: 'Marked as spam',
    description: 'Le destinataire a signalé le message comme indésirable.',
    Icon: faIcon(faFlag),
    faIcon: faFlag,
    faCode: 'fa-flag',
    group: 'Notification',
  },
  {
    code: 'document_viewed',
    labelFr: 'Document consulté',
    labelEn: 'Document viewed',
    description: 'Le document a été ouvert depuis le portail investisseur.',
    Icon: faIcon(faEye),
    faIcon: faEye,
    faCode: 'fa-eye',
    group: 'Document',
  },
  {
    code: 'document_downloaded',
    labelFr: 'Document téléchargé',
    labelEn: 'Document downloaded',
    description: 'Le document a été téléchargé localement par le destinataire.',
    Icon: faIcon(faDownload),
    faIcon: faDownload,
    faCode: 'fa-download',
    group: 'Document',
  },
  {
    code: 'document_validated',
    labelFr: 'Document validé',
    labelEn: 'Document validated',
    description: 'Le destinataire a validé le document (acceptation, accusé de lecture).',
    Icon: faIcon(faFileCircleCheck),
    faIcon: faFileCircleCheck,
    faCode: 'fa-file-circle-check',
    group: 'Document',
  },
];

/** Map ready to feed the generic Timeline component. */
export const birdviewActivityTypes: TimelineTypeMap<BirdviewActivityEventCode> =
  birdviewActivityCatalog.reduce((acc, entry) => {
    acc[entry.code] = { label: entry.labelFr, Icon: entry.Icon };
    return acc;
  }, {} as TimelineTypeMap<BirdviewActivityEventCode>);
