import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Plus, UserCheck, FileSignature, CheckCircle2, Activity, List } from 'lucide-react';
import { FilterCard } from './FilterCard';

type SubscriptionStatus = 'created' | 'onboarding' | 'signature' | 'counter_signature' | 'active' | 'all';

interface SubscriptionStatusTabsProps {
  data: any[];
  activeStatus: string;
  onStatusChange: (status: SubscriptionStatus) => void;
}

interface StatusKPIs {
  total: number;
  totalAmount: number;
  avgAmount: number;
}

export function SubscriptionStatusTabs({ data, activeStatus, onStatusChange }: SubscriptionStatusTabsProps) {
  const calculateKPIs = (filteredData: any[]): StatusKPIs => {
    const total = filteredData.length;
    const totalAmount = filteredData.reduce((sum, s) => sum + (s.amount || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;

    return {
      total,
      totalAmount,
      avgAmount,
    };
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  const getFilteredData = (status: SubscriptionStatus) => {
    if (status === 'all') return data;

    switch (status) {
      case 'created':
        return data.filter((s) => s.status === 'Draft');
      case 'onboarding':
        return data.filter((s) => s.status === 'Onboarding');
      case 'signature':
        return data.filter((s) => s.status === 'À signer');
      case 'counter_signature':
        return data.filter((s) => s.status === 'Investisseur signé');
      case 'active':
        return data.filter((s) => ['Exécuté', 'En attente de fonds', 'Active'].includes(s.status));
      default:
        return data;
    }
  };

  const createdKPIs = calculateKPIs(getFilteredData('created'));
  const onboardingKPIs = calculateKPIs(getFilteredData('onboarding'));
  const signatureKPIs = calculateKPIs(getFilteredData('signature'));
  const counterSignatureKPIs = calculateKPIs(getFilteredData('counter_signature'));
  const activeKPIs = calculateKPIs(getFilteredData('active'));
  const allKPIs = calculateKPIs(getFilteredData('all'));

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-primary/5 pb-2 rounded-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h3 className="font-semibold text-gray-900">Workflow de Souscription</h3>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/25">
            6 étapes
          </Badge>
        </div>
        <div className="text-xs text-gray-500">Cliquez sur une étape pour filtrer</div>
      </div>

      <div className="grid grid-cols-6 gap-1.5 items-center">
        <FilterCard
          status="created"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as SubscriptionStatus)}
          label="Créées"
          icon={Plus}
          total={createdKPIs.total}
          metricLabel="Total"
          metricValue={`€${formatAmount(createdKPIs.totalAmount)}`}
          averageValue={`€${formatAmount(createdKPIs.avgAmount)}`}
        />
        <FilterCard
          status="onboarding"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as SubscriptionStatus)}
          label="Onboarding"
          icon={UserCheck}
          total={onboardingKPIs.total}
          metricLabel="Total"
          metricValue={`€${formatAmount(onboardingKPIs.totalAmount)}`}
          averageValue={`€${formatAmount(onboardingKPIs.avgAmount)}`}
        />
        <FilterCard
          status="signature"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as SubscriptionStatus)}
          label="Signature"
          icon={FileSignature}
          total={signatureKPIs.total}
          metricLabel="Total"
          metricValue={`€${formatAmount(signatureKPIs.totalAmount)}`}
          averageValue={`€${formatAmount(signatureKPIs.avgAmount)}`}
        />
        <FilterCard
          status="counter_signature"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as SubscriptionStatus)}
          label="Contre-Signature"
          icon={CheckCircle2}
          total={counterSignatureKPIs.total}
          metricLabel="Total"
          metricValue={`€${formatAmount(counterSignatureKPIs.totalAmount)}`}
          averageValue={`€${formatAmount(counterSignatureKPIs.avgAmount)}`}
        />
        <FilterCard
          status="active"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as SubscriptionStatus)}
          label="Actives"
          icon={Activity}
          total={activeKPIs.total}
          metricLabel="Total"
          metricValue={`€${formatAmount(activeKPIs.totalAmount)}`}
          averageValue={`€${formatAmount(activeKPIs.avgAmount)}`}
        />
        <FilterCard
          status="all"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as SubscriptionStatus)}
          label="Toutes"
          icon={List}
          total={allKPIs.total}
          metricLabel="Total"
          metricValue={`€${formatAmount(allKPIs.totalAmount)}`}
          averageValue={`€${formatAmount(allKPIs.avgAmount)}`}
        />
      </div>
    </motion.div>
  );
}
