import { StatusBadge } from './StatusBadge';

interface SubscriptionStatusBadgeProps {
  status: string;
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const isSuccess = ['Active', 'Exécuté', 'Investisseur signé'].includes(status);
  const isWarning = ['Onboarding', 'À signer', 'En attente de fonds', 'En attente de paiement', 'Draft'].includes(status);
  const isDanger = ['Rejected', 'Cancelled', 'Expired'].includes(status);

  const variant = isSuccess ? 'success' : isWarning ? 'warning' : isDanger ? 'danger' : 'neutral';

  return <StatusBadge label={status} variant={variant} />;
}
