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

interface AudienceCounterCardsProps {
  investors: number;
  contacts: number;
}

export function AudienceCounterCards({ investors, contacts }: AudienceCounterCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border bg-white p-3 flex items-center gap-3" style={{ borderColor: '#000E2B1F' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF1F7' }}>
          <UserRound className="w-5 h-5" style={{ color: '#000E2B' }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: '#000E2B' }}>Investisseurs</p>
          <p className="text-2xl font-bold leading-tight" style={{ color: '#000E2B' }}>{investors}</p>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-3 flex items-center gap-3" style={{ borderColor: '#000E2B1F' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EEF1F7' }}>
          <Users className="w-5 h-5" style={{ color: '#000E2B' }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: '#000E2B' }}>Contacts</p>
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
  title = 'Audience concernée',
  description = 'Basée sur le ciblage défini ci-dessus.',
}: AudienceCounterProps) {
  return (
    <div className="space-y-3 rounded-2xl p-4 border" style={{ backgroundColor: '#EEF1F7', borderColor: '#000E2B1F' }}>
      <div>
        <p className="font-semibold flex items-center gap-2" style={{ color: '#000E2B' }}>
          <Users className="w-5 h-5" style={{ color: '#000E2B' }} />
          {title}
        </p>
        <p className="text-sm text-slate-600">{description}</p>
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

export const FOLDER_SPACE_MOCK_INVESTORS: AudienceInvestor[] = [
  { id: 'ai-1', segment: 'HNWI', fund: 'VENTECH I', contactsCount: 3 },
  { id: 'ai-2', segment: 'HNWI', fund: 'VENTECH I', contactsCount: 2 },
  { id: 'ai-3', segment: 'HNWI', fund: 'VENTECH II', contactsCount: 4 },
  { id: 'ai-4', segment: 'UHNWI', fund: 'VENTECH I', contactsCount: 5 },
  { id: 'ai-5', segment: 'UHNWI', fund: 'KORELYA I', contactsCount: 6 },
  { id: 'ai-6', segment: 'UHNWI', fund: 'VENTECH II', contactsCount: 3 },
  { id: 'ai-7', segment: 'Retail', fund: 'VENTECH I', contactsCount: 1 },
  { id: 'ai-8', segment: 'Retail', fund: 'KORELYA I', contactsCount: 2 },
  { id: 'ai-9', segment: 'Retail', fund: 'VENTECH II', contactsCount: 1 },
  { id: 'ai-10', segment: 'Professional', fund: 'VENTECH I', contactsCount: 2 },
  { id: 'ai-11', segment: 'Professional', fund: 'KORELYA I', contactsCount: 3 },
  { id: 'ai-12', segment: 'Professional', fund: 'VENTECH II', contactsCount: 2 },
  { id: 'ai-13', segment: 'Institutional', fund: 'VENTECH I', contactsCount: 8 },
  { id: 'ai-14', segment: 'Institutional', fund: 'KORELYA I', contactsCount: 7 },
  { id: 'ai-15', segment: 'Institutional', fund: 'VENTECH II', contactsCount: 9 },
];

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
  return {
    investors: filtered.length,
    contacts: filtered.reduce((sum, inv) => sum + inv.contactsCount, 0),
  };
}
