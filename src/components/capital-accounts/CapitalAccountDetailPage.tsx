import { useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CalendarClock,
  Layers,
  FileText,
  Landmark,
  SlidersHorizontal,
  Users,
} from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import type { CapitalAccount, CapitalAccountLine } from '../../utils/capitalAccountGenerator';
import { getHashParams } from '../../utils/routing';
import { CapitalAccountLinesTab } from './CapitalAccountLinesTab';
import type { NoticeLineBindings } from '../notices/noticeListing';
import { DetailLink } from '../ui/detail-summary';
import { DetailTabsList } from '../ui/detail-tabs';
import { PageHeader, PageHeaderSubtitle, PageHeaderSubtitleItem, PageHeaderSubtitleSeparator } from '../ui/page-header';
import { Tabs, TabsContent } from '../ui/tabs';

const K = 'funds.capitalAccounts.detail';

const TABS = ['lines', 'parameters'] as const;
type TabId = (typeof TABS)[number];

function tabFromHash(): TabId {
  const tab = getHashParams().tab;
  return TABS.find(item => item === tab) ?? 'lines';
}

interface CapitalAccountDetailPageProps {
  account: CapitalAccount;
  lines: CapitalAccountLine[];
  /** Actions sur les lignes : réglages, droits et mise à jour des lignes. */
  lineBindings: NoticeLineBindings<CapitalAccountLine>;
  /** Parts du fonds, pour le filtre des lignes. */
  fundShares: string[];
  onOpenFund: (fundId: number) => void;
  onBack: () => void;
}

export function CapitalAccountDetailPage({
  account,
  lines,
  lineBindings,
  fundShares,
  onOpenFund,
  onBack,
}: CapitalAccountDetailPageProps) {
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
  const shares =
    account.shares.length > 0
      ? account.shares.map(name => t('funds.detail.sharePrefix', { name })).join(', ')
      : t('funds.capitalAccounts.allShares');

  return (
    <>
      <PageHeader
        hideBackButton
        title={account.name}
        subtitle={
          <PageHeaderSubtitle>
            <DetailLink icon={Landmark} className="text-sm" onClick={() => onOpenFund(account.fundId)}>
              {account.fundName}
            </DetailLink>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={CalendarClock}>
              {t(`${K}.header.date`, { date: dateFormat.format(account.date) })}
            </PageHeaderSubtitleItem>
            {account.noticeDate && (
              <>
                <PageHeaderSubtitleSeparator />
                <PageHeaderSubtitleItem icon={FileText}>
                  {t(`${K}.header.noticeDate`, { date: dateFormat.format(account.noticeDate) })}
                </PageHeaderSubtitleItem>
              </>
            )}
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Bell}>
              {t(`${K}.header.notification`, { value: t(account.notify ? `${K}.yes` : `${K}.no`) })}
            </PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Layers}>{t(`${K}.header.shares`, { shares })}</PageHeaderSubtitleItem>
            <PageHeaderSubtitleSeparator />
            <PageHeaderSubtitleItem icon={Calendar}>
              {t(`${K}.header.createdOn`, { date: dateFormat.format(account.createdAt) })}
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
            <CapitalAccountLinesTab account={account} lines={lines} fundShares={fundShares} {...lineBindings} />
          </TabsContent>
          <TabsContent value="parameters" />
        </div>
      </Tabs>
    </>
  );
}
