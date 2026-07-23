import { XCircle, Ban, Clock, Archive, List } from 'lucide-react';
import { FilterCard } from './ui/filter-card';
import { Badge } from './ui/badge';
import { useTranslation } from '../utils/languageContext';

type InactiveStatus = 'rejected' | 'cancelled' | 'expired' | 'archived' | 'all';

interface InactiveSubscriptionTabsProps {
  data: any[];
  activeStatus: string;
  onStatusChange: (status: InactiveStatus) => void;
}

interface StatusKPIs {
  total: number;
  totalAmount: number;
  avgAmount: number;
}

export function InactiveSubscriptionTabs({ data, activeStatus, onStatusChange }: InactiveSubscriptionTabsProps) {
  const { t } = useTranslation();

  const calculateKPIs = (filteredData: any[]): StatusKPIs => {
    const total = filteredData.length;
    const totalAmount = filteredData.reduce((sum, s) => sum + (s.amount || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;
    return { total, totalAmount, avgAmount };
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
    return `€${amount}`;
  };

  const getFilteredData = (status: InactiveStatus) => {
    if (status === 'all') return data;
    const statusMap: Record<string, string> = {
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      expired: 'Expired',
      archived: 'Archived',
    };
    return data.filter(s => s.status === statusMap[status]);
  };

  const rejectedKPIs = calculateKPIs(getFilteredData('rejected'));
  const cancelledKPIs = calculateKPIs(getFilteredData('cancelled'));
  const expiredKPIs = calculateKPIs(getFilteredData('expired'));
  const archivedKPIs = calculateKPIs(getFilteredData('archived'));
  const allKPIs = calculateKPIs(getFilteredData('all'));

  return (
    <div className="bg-primary/5 pb-2 rounded-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-destructive rounded-full" />
          <h3 className="font-semibold text-gray-900">{t('subscriptions.inactiveTabs.sectionTitle')}</h3>
          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/25">
            {allKPIs.total}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5 items-center">
        <FilterCard
          status="rejected"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as InactiveStatus)}
          label={t('subscriptions.inactiveTabs.rejected')}
          icon={XCircle}
          total={rejectedKPIs.total}
          metricLabel={t('subscriptions.inactiveTabs.total')}
          metricValue={formatAmount(rejectedKPIs.totalAmount)}
          averageValue={formatAmount(rejectedKPIs.avgAmount)}
        />
        <FilterCard
          status="cancelled"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as InactiveStatus)}
          label={t('subscriptions.inactiveTabs.cancelled')}
          icon={Ban}
          total={cancelledKPIs.total}
          metricLabel={t('subscriptions.inactiveTabs.total')}
          metricValue={formatAmount(cancelledKPIs.totalAmount)}
          averageValue={formatAmount(cancelledKPIs.avgAmount)}
        />
        <FilterCard
          status="expired"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as InactiveStatus)}
          label={t('subscriptions.inactiveTabs.expired')}
          icon={Clock}
          total={expiredKPIs.total}
          metricLabel={t('subscriptions.inactiveTabs.total')}
          metricValue={formatAmount(expiredKPIs.totalAmount)}
          averageValue={formatAmount(expiredKPIs.avgAmount)}
        />
        <FilterCard
          status="archived"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as InactiveStatus)}
          label={t('subscriptions.inactiveTabs.archived')}
          icon={Archive}
          total={archivedKPIs.total}
          metricLabel={t('subscriptions.inactiveTabs.total')}
          metricValue={formatAmount(archivedKPIs.totalAmount)}
          averageValue={formatAmount(archivedKPIs.avgAmount)}
        />
        <FilterCard
          status="all"
          activeStatus={activeStatus}
          onStatusChange={(status) => onStatusChange(status as InactiveStatus)}
          label={t('subscriptions.inactiveTabs.all')}
          icon={List}
          total={allKPIs.total}
          metricLabel={t('subscriptions.inactiveTabs.total')}
          metricValue={formatAmount(allKPIs.totalAmount)}
          averageValue={formatAmount(allKPIs.avgAmount)}
        />
      </div>
    </div>
  );
}
