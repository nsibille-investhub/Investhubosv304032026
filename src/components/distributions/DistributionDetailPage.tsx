import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CalendarClock,
  Coins,
  DollarSign,
  FileText,
  Landmark,
  SlidersHorizontal,
  TrendingDown,
  Users,
} from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { Distribution, DistributionLine } from '../../utils/distributionGenerator';
import { getHashParams } from '../../utils/routing';
import { DistributionLinesTab } from './DistributionLinesTab';
import { DetailLink } from '../ui/detail-summary';
import { DetailTabsList } from '../ui/detail-tabs';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '../ui/page-header';
import { Tabs, TabsContent } from '../ui/tabs';

const K = 'funds.distributions.detail';

const TABS = ['lines', 'parameters'] as const;
type TabId = (typeof TABS)[number];

function tabFromHash(): TabId {
  const tab = getHashParams().tab;
  return TABS.find(item => item === tab) ?? 'lines';
}

interface DistributionDetailPageProps {
  distribution: Distribution;
  lines: DistributionLine[];
  /** Parts du fonds, pour le filtre des lignes. */
  fundShares: string[];
  onOpenFund: (fundId: number) => void;
  onOpenCall: (callId: number) => void;
  onBack: () => void;
}

export function DistributionDetailPage({
  distribution,
  lines,
  fundShares,
  onOpenFund,
  onOpenCall,
  onBack,
}: DistributionDetailPageProps) {
  const { t, lang } = useTranslation();
  const [tab, setTab] = useState<TabId>(tabFromHash);

  // L'onglet est porté par l'adresse : il est retrouvé au retour d'une autre fiche.
  const changeTab = (value: string) => {
    const next = TABS.find(item => item === value) ?? 'lines';
    setTab(next);
    const path = window.location.hash.split('?')[0];
    window.history.replaceState(null, '', next === 'lines' ? path : `${path}?tab=${next}`);
  };

  const dateFormat = new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit', year: 'numeric' });
  const amount = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: distribution.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(distribution.amount);

  return (
    <>
      <PageHeader
        hideBackButton
        title={distribution.name}
        subtitle={
          <PageHeaderSubtitle>
            <DetailLink icon={Landmark} className="text-sm" onClick={() => onOpenFund(distribution.fundId)}>
              {distribution.fundName}
            </DetailLink>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={CalendarClock}>
              {t(`${K}.header.date`, { date: dateFormat.format(distribution.date) })}
            </PageHeaderSubtitleItem>
            {distribution.noticeDate && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={FileText}>
                  {t(`${K}.header.noticeDate`, { date: dateFormat.format(distribution.noticeDate) })}
                </PageHeaderSubtitleItem>
              </>
            )}
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Bell}>
              {t(`${K}.header.notification`, { value: t(distribution.notify ? `${K}.yes` : `${K}.no`) })}
            </PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Coins}>{t(`${K}.header.amount`, { amount })}</PageHeaderSubtitleItem>
            {distribution.linkedCalls.length > 0 && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={DollarSign}>
                  {t(`${K}.header.linkedCalls`)}
                  {distribution.linkedCalls.map(item => (
                    <DetailLink key={item.id} className="text-sm" onClick={() => onOpenCall(item.id)}>
                      {item.name}
                    </DetailLink>
                  ))}
                </PageHeaderSubtitleItem>
              </>
            )}
            {distribution.forecast && (
              <>
                <PageHeaderSubtitleSeparator />
                <DetailLink
                  icon={TrendingDown}
                  className="text-sm"
                  onClick={() => toast.info(t(`${K}.toast.notInMockup`, { name: distribution.forecast!.name }))}
                >
                  {distribution.forecast.name}
                </DetailLink>
              </>
            )}
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Calendar}>
              {t(`${K}.header.createdOn`, { date: dateFormat.format(distribution.createdAt) })}
            </PageHeaderSubtitleItem>
          </PageHeaderSubtitle>
        }
        secondaryAction={{
          label: t(`${K}.back`),
          icon: <ArrowLeft className="h-4 w-4" />,
          onClick: onBack,
        }}
      />

      <Tabs value={tab} onValueChange={changeTab} className="w-full gap-0">
        <div className="border-b border-border bg-card px-8">
          <DetailTabsList
            items={[
              { value: 'lines', icon: Users, label: t(`${K}.tabs.lines`) },
              { value: 'parameters', icon: SlidersHorizontal, label: t(`${K}.tabs.parameters`) },
            ]}
          />
        </div>
        <div className="px-8 py-6">
          <TabsContent value="lines">
            <DistributionLinesTab distribution={distribution} lines={lines} fundShares={fundShares} />
          </TabsContent>
          <TabsContent value="parameters" />
        </div>
      </Tabs>
    </>
  );
}
