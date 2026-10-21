import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Archive, ArrowUpRight, Ban, Copy, FlaskConical, Handshake, Hourglass, Lightbulb, Loader2, Lock, Send, ShieldOff } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { DisabledReason } from './disabled-reason';
import { cn } from './utils';
import { toneSurface, type Tone } from './tone';

export type PageStateBannerProps =
  | {
      variant: 'archived';
      date: string;
      author: string;
      onUnarchive?: () => void;
      unarchiving?: boolean;
      /** Motif quand le droit "Archiver un fonds" manque : l'action reste visible, désactivée. */
      unarchiveDisabledReason?: string;
      className?: string;
    }
  | { variant: 'locked'; date: string; reason: string; className?: string }
  | { variant: 'mirror'; masterName: string; onOpenMaster: () => void; className?: string }
  | { variant: 'sendingNotices'; blockedActions: string[]; className?: string }
  /** scope "subscription" : souscription consultée sans droit de modification. */
  | { variant: 'readOnly'; scope?: 'fund' | 'subscription'; className?: string }
  /** Dossier en état terminal : raison, puis action de retour quand le workflow en propose une. */
  | {
      variant: 'terminalState';
      title: string;
      description?: string;
      tone?: Tone;
      action?: { label: string; onClick: () => void; loading?: boolean; disabledReason?: string };
      className?: string;
    }
  /** Dossier entre les mains d'un tiers (distributeur délégué, signataire...). */
  | { variant: 'externalReview'; who: string; className?: string }
  /** L'état affiché dépend d'hypothèses ouvertes, non décidées. */
  | { variant: 'hypothesis'; ids: string[]; className?: string }
  /** Validation KYC déléguée au partenaire : en attente, ou validée et transmise à l'analyste 1. */
  | { variant: 'delegatedReview'; partner: string; validatedBy?: string; date?: string; className?: string }
  /** Fichier de scénarios du simulateur de workflow absent ou invalide : la page reste utilisable. */
  | { variant: 'simulatorUnavailable'; className?: string };

const VARIANT_STYLE: Record<PageStateBannerProps['variant'], { icon: LucideIcon; tone: Tone }> = {
  archived: { icon: Archive, tone: 'strong' },
  locked: { icon: Lock, tone: 'danger' },
  mirror: { icon: Copy, tone: 'info' },
  sendingNotices: { icon: Send, tone: 'warning' },
  readOnly: { icon: ShieldOff, tone: 'neutral' },
  terminalState: { icon: Ban, tone: 'strong' },
  externalReview: { icon: Hourglass, tone: 'caution' },
  hypothesis: { icon: Lightbulb, tone: 'info' },
  delegatedReview: { icon: Handshake, tone: 'info' },
  simulatorUnavailable: { icon: FlaskConical, tone: 'warning' },
};

/** Bandeau d'état placé sous l'en-tête d'une page de détail (PRD Détail d'un fonds V3, section 6.1). */
export function PageStateBanner(props: PageStateBannerProps) {
  const { t } = useTranslation();
  const { icon: Icon } = VARIANT_STYLE[props.variant];
  const tone = props.variant === 'terminalState' && props.tone ? props.tone : VARIANT_STYLE[props.variant].tone;

  let title: string;
  let description: ReactNode = null;
  let action: ReactNode = null;

  switch (props.variant) {
    case 'archived':
      title = t('funds.stateBanner.archived.title', { date: props.date, author: props.author });
      description = t('funds.stateBanner.archived.description');
      if (props.onUnarchive) {
        action = (
          <DisabledReason reason={props.unarchiveDisabledReason}>
            <Button
              variant="outline"
              size="sm"
              onClick={props.onUnarchive}
              disabled={props.unarchiving || Boolean(props.unarchiveDisabledReason)}
            >
              {props.unarchiving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('funds.stateBanner.archived.action')}
            </Button>
          </DisabledReason>
        );
      }
      break;
    case 'locked':
      title = t('funds.stateBanner.locked.title', { date: props.date });
      description = t('funds.stateBanner.locked.reason', { reason: props.reason });
      break;
    case 'mirror':
      title = t('funds.stateBanner.mirror.title', { master: props.masterName });
      description = t('funds.stateBanner.mirror.description');
      action = (
        <Button variant="outline" size="sm" onClick={props.onOpenMaster}>
          {t('funds.stateBanner.mirror.action')}
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Button>
      );
      break;
    case 'sendingNotices':
      title = t('funds.stateBanner.sendingNotices.title');
      description =
        props.blockedActions.length > 0
          ? t('funds.stateBanner.sendingNotices.blocked', {
              actions: props.blockedActions.join(', '),
            })
          : null;
      break;
    case 'readOnly': {
      const base = props.scope === 'subscription' ? 'subscriptions.stateBanner.readOnly' : 'funds.stateBanner.readOnly';
      title = t(`${base}.title`);
      description = t(`${base}.description`);
      break;
    }
    case 'terminalState':
      title = props.title;
      description = props.description ?? null;
      if (props.action) {
        const { label, onClick, loading, disabledReason } = props.action;
        action = (
          <DisabledReason reason={disabledReason}>
            <Button variant="outline" size="sm" onClick={onClick} disabled={loading || Boolean(disabledReason)}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {label}
            </Button>
          </DisabledReason>
        );
      }
      break;
    case 'externalReview':
      title = t('subscriptions.stateBanner.externalReview.title', { who: props.who });
      description = t('subscriptions.stateBanner.externalReview.description');
      break;
    case 'hypothesis':
      title = t('subscriptions.stateBanner.hypothesis.title', { ids: props.ids.join(', ') });
      description = t('subscriptions.stateBanner.hypothesis.description');
      break;
    case 'delegatedReview':
      if (props.validatedBy) {
        title = t('subscriptions.stateBanner.delegatedReview.validatedTitle', {
          author: props.validatedBy,
          partner: props.partner,
          date: props.date ?? '',
        });
        description = t('subscriptions.stateBanner.delegatedReview.validatedDescription');
      } else {
        title = t('subscriptions.stateBanner.delegatedReview.pendingTitle', { partner: props.partner });
        description = t('subscriptions.stateBanner.delegatedReview.pendingDescription');
      }
      break;
    case 'simulatorUnavailable':
      title = t('subscriptions.stateBanner.simulatorUnavailable.title');
      description = t('subscriptions.stateBanner.simulatorUnavailable.description');
      break;
  }

  return (
    <Alert className={cn('flex items-start gap-3', props.className)} style={toneSurface(tone)}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-sm font-semibold">{title}</p>
        {description && (
          <AlertDescription className="text-foreground/80">{description}</AlertDescription>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Alert>
  );
}
