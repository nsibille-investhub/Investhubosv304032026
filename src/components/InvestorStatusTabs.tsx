import { UserPlus, MessageCircle, UserCheck, List } from 'lucide-react';
import { FilterCard, FilterCardGroup } from './ui/filter-card';
import { useTranslation } from '../utils/languageContext';

interface InvestorStatusTabsProps {
  data: any[];
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

export function InvestorStatusTabs({ data, activeStatus, onStatusChange }: InvestorStatusTabsProps) {
  const { t } = useTranslation();
  const calculateKPIs = (filteredData: any[]) => {
    const total = filteredData.length;
    const totalInvested = filteredData.reduce((sum, inv) => sum + (inv.totalInvested || 0), 0);
    const avgInvested = total > 0 ? totalInvested / total : 0;

    return {
      total,
      totalInvested,
      avgInvested,
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

  const getFilteredData = (status: string) => {
    if (status === 'all') return data;

    switch (status) {
      case 'prospect':
        return data.filter((inv) => inv.status === 'Prospect');
      case 'en_discussion':
        return data.filter((inv) => inv.status === 'En discussion');
      case 'en_relation':
        return data.filter((inv) => inv.status === 'En relation');
      default:
        return data;
    }
  };

  const prospectKPIs = calculateKPIs(getFilteredData('prospect'));
  const discussionKPIs = calculateKPIs(getFilteredData('en_discussion'));
  const relationKPIs = calculateKPIs(getFilteredData('en_relation'));
  const allKPIs = calculateKPIs(getFilteredData('all'));

  return (
    <FilterCardGroup
      title={t('investors.pipeline.title')}
      badge={t('investors.pipeline.statusBadge')}
      hint={t('investors.pipeline.clickToFilter')}
      columns={4}
    >
        <FilterCard
          status="prospect"
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          label={t('investors.pipeline.prospect')}
          icon={UserPlus}
          total={prospectKPIs.total}
          metricLabel={t('investors.pipeline.totalInvested')}
          metricValue={`€${formatAmount(prospectKPIs.totalInvested)}`}
          averageValue={`€${formatAmount(prospectKPIs.avgInvested)}`}
        />
        <FilterCard
          status="en_discussion"
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          label={t('investors.pipeline.inDiscussion')}
          icon={MessageCircle}
          total={discussionKPIs.total}
          metricLabel={t('investors.pipeline.totalInvested')}
          metricValue={`€${formatAmount(discussionKPIs.totalInvested)}`}
          averageValue={`€${formatAmount(discussionKPIs.avgInvested)}`}
        />
        <FilterCard
          status="en_relation"
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          label={t('investors.pipeline.inRelation')}
          icon={UserCheck}
          total={relationKPIs.total}
          metricLabel={t('investors.pipeline.totalInvested')}
          metricValue={`€${formatAmount(relationKPIs.totalInvested)}`}
          averageValue={`€${formatAmount(relationKPIs.avgInvested)}`}
        />
        <FilterCard
          status="all"
          activeStatus={activeStatus}
          onStatusChange={onStatusChange}
          label={t('investors.pipeline.all')}
          icon={List}
          total={allKPIs.total}
          metricLabel={t('investors.pipeline.totalInvested')}
          metricValue={`€${formatAmount(allKPIs.totalInvested)}`}
          averageValue={`€${formatAmount(allKPIs.avgInvested)}`}
        />
    </FilterCardGroup>
  );
}
