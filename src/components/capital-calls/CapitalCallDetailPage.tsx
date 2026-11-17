import { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import {
  ArrowDownCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  Coins,
  Landmark,
  SlidersHorizontal,
  Tag,
  TrendingDown,
  Users,
} from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalCall } from '../../utils/capitalCallGenerator';
import type { CapitalCallLine } from '../../utils/capitalCallLines';
import type { FundCallSettings } from '../../utils/capitalCallWizard';
import { getHashParams } from '../../utils/routing';
import { CapitalCallLinesTab } from './CapitalCallLinesTab';
import { CapitalCallParametersTab } from './CapitalCallParametersTab';
import { DetailLink } from '../ui/detail-summary';
import { DetailTabsList } from '../ui/detail-tabs';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '../ui/page-header';
import { Tabs, TabsContent } from '../ui/tabs';

const K = 'funds.capitalCalls.detail';

const TABS = ['lines', 'parameters'] as const;
type TabId = (typeof TABS)[number];

function tabFromHash(): TabId {
  const tab = getHashParams().tab;
  return TABS.find(item => item === tab) ?? 'lines';
}

interface CapitalCallDetailPageProps {
  call: CapitalCall;
  lines: CapitalCallLine[];
  /** Paramètres de l'instance qui pilotent les colonnes de la ventilation. */
  settings: FundCallSettings;
  onOpenFund: (fundId: number) => void;
  onBack: () => void;
}

export function CapitalCallDetailPage({ call, lines, settings, onOpenFund, onBack }: CapitalCallDetailPageProps) {
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
  const calledAmount = new Intl.NumberFormat(lang, {
    style: 'currency',
    currency: call.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(call.calledAmount);
  const notInMockup = (name: string) => toast.info(t(`${K}.toast.notInMockup`, { name }));

  return (
    <>
      <PageHeader
        hideBackButton
        title={call.name}
        subtitle={
          <PageHeaderSubtitle>
            <DetailLink icon={Landmark} className="text-sm" onClick={() => onOpenFund(call.fundId)}>
              {call.fundName}
            </DetailLink>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={CalendarClock}>
              {t(`${K}.header.dueDate`, { date: dateFormat.format(call.dueDate) })}
            </PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Coins}>
              {t(`${K}.header.calledAmount`, { amount: calledAmount })}
            </PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Tag}>
              {t(`${K}.header.origin`, { origin: t(`funds.capitalCalls.origins.${call.origin}`) })}
            </PageHeaderSubtitleItem>
            {call.compensations.length > 0 && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={ArrowDownCircle}>
                  {t(`${K}.header.compensatedBy`)}
                  {call.compensations.map(item => (
                    <DetailLink key={item.id} className="text-sm" onClick={() => notInMockup(item.name)}>
                      {item.name}
                    </DetailLink>
                  ))}
                </PageHeaderSubtitleItem>
              </>
            )}
            {call.forecast && (
              <>
                <PageHeaderSubtitleSeparator />
                <DetailLink icon={TrendingDown} className="text-sm" onClick={() => notInMockup(call.forecast!.name)}>
                  {call.forecast.name}
                </DetailLink>
              </>
            )}
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Calendar}>
              {t(`${K}.header.createdOn`, { date: dateFormat.format(call.createdAt) })}
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
            <CapitalCallLinesTab call={call} lines={lines} />
          </TabsContent>
          <TabsContent value="parameters">
            <CapitalCallParametersTab call={call} settings={settings} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
