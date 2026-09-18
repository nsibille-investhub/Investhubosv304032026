import { ArrowLeftRight, ExternalLink } from 'lucide-react';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { useTranslation } from '../utils/languageContext';
import { getShareableUrl } from '../utils/routing';

const KEY = 'subscriptions.detail.transfer';

interface TransferTarget {
  id: string;
  ref: string;
  holder: string;
  amount: string;
}

const MOCK_TRANSFER_TARGETS: TransferTarget[] = [
  { id: 'tt-1', ref: 'SUB-21', holder: 'Delta Holding', amount: '450 000,00 €' },
  { id: 'tt-2', ref: 'SUB-22', holder: 'Gamma Invest', amount: '300 000,00 €' },
];

interface SubscriptionTransferCardProps {
  /** Souscription issue d'un transfert : la fiche affiche son origine. */
  origin: boolean;
  /** Souscription transférée : la fiche affiche la date et l'auteur du transfert. */
  transferred: boolean;
}

/** Panneau Transfert : origine, souscriptions issues du transfert et accès au suivi. */
export function SubscriptionTransferCard({ origin, transferred }: SubscriptionTransferCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="shadow-sm overflow-hidden p-0 gap-0">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className={`${WIDGET_TITLE_CLASS} flex items-center gap-1.5`}>
            <ArrowLeftRight className="w-4 h-4" />
            {t(`${KEY}.title`)}
          </h3>
          <p className={WIDGET_SUBTITLE_CLASS}>
            {origin
              ? t(`${KEY}.fromSubscription`, { ref: 'SUB-07' })
              : t(`${KEY}.transferredOn`, { date: '12/09/2026', name: 'Marie Dubois' })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 gap-1.5 text-xs"
          onClick={() => window.open(getShareableUrl('subscriptions'), '_blank', 'noopener')}
        >
          {t(`${KEY}.viewTransfers`)}
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      </div>

      {transferred && (
        <ul className="divide-y">
          {MOCK_TRANSFER_TARGETS.map(target => (
            <li key={target.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2">
                <Badge className="bg-muted text-muted-foreground text-[11px] tabular-nums">
                  {target.ref}
                </Badge>
                <span className="truncate text-sm text-foreground">{target.holder}</span>
              </span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {target.amount}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
