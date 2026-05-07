/**
 * AudienceCounter — Design System component
 * Key: ds-audience-counter
 *
 * Displays a 2-card counter of investors and contacts concerned by a given
 * targeting (segments + fund). Used in:
 *  - Document creation/edit (generic audience — uses AudienceCounterCards embedded)
 *  - Folder / Space creation/edit (uses full AudienceCounter with wrapper)
 *
 * Exports:
 *  - <AudienceCounter>      full section with heading + background + cards
 *  - <AudienceCounterCards> just the 2 cards (for embedding in existing sections)
 *  - computeAudience()      helper to compute counts from segments/fund selection
 */

import { Users, UserRound } from 'lucide-react';
import { useTranslation } from '../utils/languageContext';
import {
  COMMITMENTS,
  FUNDS,
  INVESTORS,
  getInvestorContacts,
  type InvestorTypology,
} from '../utils/gedFixtures';

interface AudienceCounterCardsProps {
  investors: number;
  contacts: number;
}

export function AudienceCounterCards({ investors, contacts }: AudienceCounterCardsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border bg-white p-3 flex items-center gap-3" style={{ borderColor: '#000E2B1F' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF1F7' }}>
          <UserRound className="w-5 h-5" style={{ color: '#000E2B' }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: '#000E2B' }}>{t('ged.dataRoom.audienceCounter.investors')}</p>
          <p className="text-2xl font-bold leading-tight" style={{ color: '#000E2B' }}>{investors}</p>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-3 flex items-center gap-3" style={{ borderColor: '#000E2B1F' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF1F7' }}>
          <Users className="w-5 h-5" style={{ color: '#000E2B' }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: '#000E2B' }}>{t('ged.dataRoom.audienceCounter.contacts')}</p>
          <p className="text-2xl font-bold leading-tight" style={{ color: '#000E2B' }}>{contacts}</p>
        </div>
      </div>
    </div>
  );
}

interface AudienceCounterProps extends AudienceCounterCardsProps {
  title?: string;
  description?: string;
}

export function AudienceCounter({
  investors,
  contacts,
  title,
  description,
}: AudienceCounterProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('ged.dataRoom.audienceCounter.title');
  const resolvedDescription = description ?? t('ged.dataRoom.audienceCounter.description');
  return (
    <div className="space-y-3 rounded-2xl p-4 border" style={{ backgroundColor: '#EEF1F7', borderColor: '#000E2B1F' }}>
      <div>
        <p className="font-semibold flex items-center gap-2" style={{ color: '#000E2B' }}>
          <Users className="w-5 h-5" style={{ color: '#000E2B' }} />
          {resolvedTitle}
        </p>
        <p className="text-sm text-slate-600">{resolvedDescription}</p>
      </div>
      <AudienceCounterCards investors={investors} contacts={contacts} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: compute investors/contacts counts for folder/space targeting
// ---------------------------------------------------------------------------

export interface AudienceInvestor {
  id: string;
  segment: string;
  fund: string;
  contactsCount: number;
}

// Map GED investor typologies to the audience segments exposed in the
// folder/space targeting UI (HNWI / UHNWI / Retail / Professional /
// Institutional).
const TYPOLOGY_TO_SEGMENT: Record<InvestorTypology, string> = {
  'Family Office': 'UHNWI',
  HNWI: 'HNWI',
  UHNWI: 'UHNWI',
  Institutional: 'Institutional',
  Insurance: 'Institutional',
  'Pension Fund': 'Institutional',
  Sovereign: 'Institutional',
  Distributor: 'Professional',
};

// Audience rows derived from the real GED fixtures: one row per
// (fund, investor) commitment, with the segment inferred from the
// investor typology and the contacts count taken from the investor's
// declared contacts.
export const FOLDER_SPACE_MOCK_INVESTORS: AudienceInvestor[] = COMMITMENTS.map(
  (c) => {
    const investor = INVESTORS.find((i) => i.id === c.investorId);
    const fund = FUNDS.find((f) => f.code === c.fundCode);
    const segment = investor ? TYPOLOGY_TO_SEGMENT[investor.typology] : 'Institutional';
    const contactsCount = investor ? getInvestorContacts(investor.id).length : 0;
    return {
      id: c.investorId,
      segment,
      fund: fund?.name ?? c.fundCode,
      contactsCount,
    };
  },
);

export function computeAudience(
  selectedSegments: string[],
  selectedFund: string | null | undefined,
  investors: AudienceInvestor[] = FOLDER_SPACE_MOCK_INVESTORS,
): { investors: number; contacts: number } {
  let filtered = investors;
  if (selectedSegments.length > 0) {
    filtered = filtered.filter((inv) => selectedSegments.includes(inv.segment));
  }
  if (selectedFund) {
    filtered = filtered.filter((inv) => inv.fund === selectedFund);
  }
  // Dedupe by investor id so an investor committed in several funds is
  // counted once when no fund filter is applied.
  const unique = new Map<string, AudienceInvestor>();
  for (const inv of filtered) {
    if (!unique.has(inv.id)) unique.set(inv.id, inv);
  }
  const deduped = Array.from(unique.values());
  return {
    investors: deduped.length,
    contacts: deduped.reduce((sum, inv) => sum + inv.contactsCount, 0),
  };
}
