import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { UserPlus, MessageCircle, UserCheck, List } from 'lucide-react';
import { FilterCard } from './ui/filter-card';
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-primary/5 pb-2 rounded-lg"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h3 className="font-semibold text-gray-900">{t('investors.pipeline.title')}</h3>
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/25">
            {t('investors.pipeline.statusBadge')}
          </Badge>
        </div>
        <div className="text-xs text-gray-500">{t('investors.pipeline.clickToFilter')}</div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 items-center">
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
      </div>
    </motion.div>
  );
}
