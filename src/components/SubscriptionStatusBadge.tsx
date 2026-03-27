import { Circle, Clock, CheckCircle, XCircle, FileText, Edit, PenLine, CheckCheck, HourglassIcon, Banknote, PlayCircle, Ban, FolderArchive } from 'lucide-react';
import { StatusBadge } from './ui/status-badge';

interface SubscriptionStatusBadgeProps {
  status: string;
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; icon: React.ReactNode; variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
    Draft: { label: 'Draft', icon: <FileText className="w-3.5 h-3.5" />, variant: 'neutral' },
    Onboarding: { label: 'Onboarding', icon: <PenLine className="w-3.5 h-3.5" />, variant: 'warning' },
    'À signer': { label: 'Signature', icon: <Edit className="w-3.5 h-3.5" />, variant: 'warning' },
    'Investisseur signé': { label: 'Signature', icon: <CheckCheck className="w-3.5 h-3.5" />, variant: 'warning' },
    Exécuté: { label: 'Exécuté', icon: <CheckCircle className="w-3.5 h-3.5" />, variant: 'success' },
    'En attente de fonds': { label: 'En attente', icon: <HourglassIcon className="w-3.5 h-3.5" />, variant: 'warning' },
    'En attente de paiement': { label: 'En attente', icon: <Banknote className="w-3.5 h-3.5" />, variant: 'warning' },
    Active: { label: 'Active', icon: <PlayCircle className="w-3.5 h-3.5" />, variant: 'success' },
    Rejected: { label: 'Rejected', icon: <Ban className="w-3.5 h-3.5" />, variant: 'danger' },
    Cancelled: { label: 'Cancelled', icon: <XCircle className="w-3.5 h-3.5" />, variant: 'danger' },
    Expired: { label: 'Expired', icon: <Clock className="w-3.5 h-3.5" />, variant: 'neutral' },
    Archived: { label: 'Archived', icon: <FolderArchive className="w-3.5 h-3.5" />, variant: 'neutral' },
  };

  const config = statusConfig[status] || {
    label: status,
    icon: <Circle className="w-3.5 h-3.5" />,
    variant: 'neutral' as const,
  };

  return (
    <StatusBadge variant={config.variant} className="shadow-sm">
      {config.icon}
      {config.label}
    </StatusBadge>
  );
}
