import { StatusBadge } from './StatusBadge';
import { useTranslation } from '../utils/languageContext';

interface SubscriptionStatusBadgeProps {
  status: string;
}

const STATUS_KEY_BY_RAW: Record<string, string> = {
  'Draft': 'subscriptions.status.draft',
  'Onboarding': 'subscriptions.status.onboarding',
  'À signer': 'subscriptions.status.toSign',
  'Investisseur signé': 'subscriptions.status.investorSigned',
  'Exécuté': 'subscriptions.status.executed',
  'En attente de fonds': 'subscriptions.status.pendingFunds',
  'En attente de paiement': 'subscriptions.status.pendingPayment',
  'Active': 'subscriptions.status.active',
  'Rejected': 'subscriptions.status.rejected',
  'Cancelled': 'subscriptions.status.cancelled',
  'Expired': 'subscriptions.status.expired',
  'Archived': 'subscriptions.status.archived',
};

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const { t } = useTranslation();
  const isSuccess = ['Active', 'Exécuté', 'Investisseur signé'].includes(status);
  const isWarning = ['Onboarding', 'À signer', 'En attente de fonds', 'En attente de paiement', 'Draft'].includes(status);
  const isDanger = ['Rejected', 'Cancelled', 'Expired'].includes(status);

  const variant = isSuccess ? 'success' : isWarning ? 'warning' : isDanger ? 'danger' : 'neutral';
  const key = STATUS_KEY_BY_RAW[status];
  const label = key ? t(key) : status;

  return <StatusBadge label={label} variant={variant} />;
}
