import { Circle, Clock, CheckCircle, XCircle, Archive, FileText, Edit, PenLine, CheckCheck, HourglassIcon, Banknote, PlayCircle, Ban, FolderArchive } from 'lucide-react';
import { cn } from './ui/utils';

interface SubscriptionStatusBadgeProps {
  status: string;
}

export function SubscriptionStatusBadge({ status }: SubscriptionStatusBadgeProps) {
  // Configuration des statuts avec icônes et couleurs
  const statusConfig: Record<string, { 
    label: string; 
    icon: React.ReactNode;
    className: string;
  }> = {
    'Draft': {
      label: 'Draft',
      icon: <FileText className="w-3.5 h-3.5" />,
      className: 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
    },
    'Onboarding': {
      label: 'Onboarding',
      icon: <PenLine className="w-3.5 h-3.5" />,
      className: 'bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800'
    },
    'À signer': {
      label: 'Signature',
      icon: <Edit className="w-3.5 h-3.5" />,
      className: 'bg-violet-100 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 border border-violet-300 dark:border-violet-800'
    },
    'Investisseur signé': {
      label: 'Signature',
      icon: <CheckCheck className="w-3.5 h-3.5" />,
      className: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800'
    },
    'Exécuté': {
      label: 'Exécuté',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      className: 'bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border border-teal-300 dark:border-teal-800'
    },
    'En attente de fonds': {
      label: 'En attente',
      icon: <HourglassIcon className="w-3.5 h-3.5" />,
      className: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
    },
    'En attente de paiement': {
      label: 'En attente',
      icon: <Banknote className="w-3.5 h-3.5" />,
      className: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-800'
    },
    'Active': {
      label: 'Active',
      icon: <PlayCircle className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400" />,
      className: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
    },
    'Rejected': {
      label: 'Rejected',
      icon: <Ban className="w-3.5 h-3.5" />,
      className: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
    },
    'Cancelled': {
      label: 'Cancelled',
      icon: <XCircle className="w-3.5 h-3.5" />,
      className: 'bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-800'
    },
    'Expired': {
      label: 'Expired',
      icon: <Clock className="w-3.5 h-3.5" />,
      className: 'bg-stone-100 dark:bg-stone-950/30 text-stone-700 dark:text-stone-400 border border-stone-300 dark:border-stone-800'
    },
    'Archived': {
      label: 'Archived',
      icon: <FolderArchive className="w-3.5 h-3.5" />,
      className: 'bg-neutral-100 dark:bg-neutral-950/30 text-neutral-700 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-800'
    },
  };

  const config = statusConfig[status] || {
    label: status,
    icon: <Circle className="w-3.5 h-3.5" />,
    className: 'bg-gray-100 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-800'
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm",
      config.className
    )}>
      {config.icon}
      {config.label}
    </div>
  );
}