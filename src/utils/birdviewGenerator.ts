// BirdView events / investors / spaces — sourced from the unified
// gedFixtures so that every name surfaced in the activity timeline,
// the investor filter, the engagement cards and the document list
// corresponds to a real LP, contact or fund of the GED.

import {
  COMMITMENTS,
  DocumentSpec,
  FolderSpec,
  InvestorContact,
  InvestorProfile,
  InvestorTypology,
  INVESTORS as GED_INVESTORS,
  canContactAccessDoc,
  commitmentsForFund,
  findFund,
  findInvestor,
  getAllInvestorContacts,
  getInvestorContacts,
  getSpaces,
} from './gedFixtures';

export interface BirdviewEvent {
  id: number;
  timestamp: string;
  timestampFull: string;
  timestampRelative: string;
  eventType: 'notification_sent' | 'notification_opened' | 'document_viewed' | 'document_downloaded';
  eventTypeLabel: string;
  investor: string;
  contact: string;
  contactRole: 'Investisseur' | 'Contact' | 'Conseiller';
  email: string;
  document: string;
  documentId: number;
  space: string;
  folder: string;
  notificationOpened: boolean;
  documentViewed: boolean;
}

export interface BirdviewInvestor {
  id: number;
  name: string;
  type: 'HNWI' | 'UHNWI' | 'Institutional' | 'Professional';
  email: string;
  contacts: BirdviewContact[];
  totalDocuments: number;
  viewedDocuments: number;
  downloadedDocuments: number;
  engagementRate: number;
}

export interface BirdviewContact {
  id: number;
  name: string;
  role: 'Investisseur' | 'Contact' | 'Conseiller';
  relationLabel: string;
  email: string;
  canAccess: boolean;
  /** 'full' | 'commercial-only' | 'revoked' — drives greying in the tree. */
  accessLevel: 'full' | 'commercial-only' | 'revoked';
}

export interface BirdviewSpace {
  id: number;
  name: string;
  investors: string[];
  folders: number;
  documents: number;
  engagementRate: number;
}

/* ----------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ----------------------------------------------------------------------- */

const TODAY = new Date('2026-05-06');

const seededRand = (() => {
  let s = 1234567;
  return () => {
    s = (s + 0x9e3779b9) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(seededRand() * arr.length)];

const getRelativeTime = (date: Date): string => {
  const diffMs = TODAY.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'À l\'instant';
  if (mins < 60) return `Il y a ${mins} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  if (days < 7) return `Il y a ${days} jours`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
};

const typologyToBVType = (typology: InvestorTypology): BirdviewInvestor['type'] => {
  switch (typology) {
    case 'HNWI':          return 'HNWI';
    case 'UHNWI':         return 'UHNWI';
    case 'Family Office': return 'Professional';
    case 'Distributor':   return 'Professional';
    default:              return 'Institutional';
  }
};

/* ----------------------------------------------------------------------- */
/* Document index — flatten every space into a list of files               */
/* ----------------------------------------------------------------------- */

interface DocIndexEntry {
  id: number;
  doc: DocumentSpec;
  spaceName: string;
  fundName?: string;
  folderPath: string[]; // parent folders names from space root
}

const flattenSpace = (
  folders: FolderSpec[],
  spaceName: string,
  fundName: string | undefined,
  parents: string[],
  out: DocIndexEntry[],
  counter: { id: number },
): void => {
  for (const folder of folders) {
    const path = [...parents, folder.name];
    if (folder.documents) {
      for (const doc of folder.documents) {
        counter.id++;
        out.push({ id: counter.id, doc, spaceName, fundName, folderPath: path });
      }
    }
    if (folder.folders) {
      flattenSpace(folder.folders, spaceName, fundName, path, out, counter);
    }
  }
};

const buildDocIndex = (): DocIndexEntry[] => {
  const out: DocIndexEntry[] = [];
  const counter = { id: 0 };
  for (const space of getSpaces()) {
    const fundName = space.fundCode ? findFund(space.fundCode)?.name : undefined;
    flattenSpace(space.folders, space.name, fundName, [], out, counter);
  }
  return out;
};

/* ----------------------------------------------------------------------- */
/* Public generators                                                       */
/* ----------------------------------------------------------------------- */

const EVENT_TYPES: { value: BirdviewEvent['eventType']; label: string; weight: number }[] = [
  { value: 'notification_sent',   label: 'Notification envoyée',   weight: 35 },
  { value: 'notification_opened', label: 'Notification ouverte',   weight: 30 },
  { value: 'document_viewed',     label: 'Document consulté',      weight: 25 },
  { value: 'document_downloaded', label: 'Document téléchargé',    weight: 10 },
];

const weightedEventType = (): { value: BirdviewEvent['eventType']; label: string } => {
  const total = EVENT_TYPES.reduce((s, e) => s + e.weight, 0);
  let r = seededRand() * total;
  for (const e of EVENT_TYPES) {
    if (r < e.weight) return { value: e.value, label: e.label };
    r -= e.weight;
  }
  return EVENT_TYPES[0];
};

interface RecipientCandidate {
  investorName: string;
  investorEmail: string;
  contactName: string;
  contactEmail: string;
  contactRole: 'Investisseur' | 'Contact';
}

/**
 * Returns the recipients suitable for the given document, based on its
 * targeting field. Nominatif = the linked LP and his contacts only;
 * fund-level = every LP committed to the fund + their contacts; segment
 * = LPs whose typology matches one of the segments.
 */
const recipientsForDocument = (entry: DocIndexEntry): RecipientCandidate[] => {
  const out: RecipientCandidate[] = [];
  const include = (inv: InvestorProfile, contacts: InvestorContact[]) => {
    out.push({
      investorName: inv.name,
      investorEmail: inv.email,
      contactName: inv.name,
      contactEmail: inv.email,
      contactRole: 'Investisseur',
    });
    for (const c of contacts) {
      if (!canContactAccessDoc(c, entry.doc)) continue;
      out.push({
        investorName: inv.name,
        investorEmail: inv.email,
        contactName: c.name,
        contactEmail: c.email,
        contactRole: 'Contact',
      });
    }
  };

  const t = entry.doc.targeting;
  switch (t.mode) {
    case 'investor': {
      const inv = findInvestor(t.investorId);
      if (inv) include(inv, getInvestorContacts(inv.id));
      break;
    }
    case 'fund':
    case 'fund-internal':
    case 'shareClass': {
      // Look up the fund by the fund name we resolved earlier
      const fundCode = getSpaces()
        .find((s) => s.name === entry.spaceName)?.fundCode;
      if (!fundCode) return [];
      for (const c of commitmentsForFund(fundCode)) {
        if (t.mode === 'shareClass' && c.shareClass !== t.shareClass) continue;
        const inv = findInvestor(c.investorId);
        if (inv) include(inv, getInvestorContacts(inv.id));
      }
      break;
    }
    case 'segment': {
      for (const inv of GED_INVESTORS) {
        if (t.segments.includes(inv.typology)) {
          include(inv, getInvestorContacts(inv.id));
        }
      }
      break;
    }
  }
  return out;
};

export function generateBirdviewEvents(count: number): BirdviewEvent[] {
  const docIndex = buildDocIndex();
  if (docIndex.length === 0) return [];

  const events: BirdviewEvent[] = [];
  let id = 0;

  for (let i = 0; i < count; i++) {
    const entry = docIndex[Math.floor(seededRand() * docIndex.length)];
    const recipients = recipientsForDocument(entry);
    if (recipients.length === 0) continue;
    const r = recipients[Math.floor(seededRand() * recipients.length)];
    const evType = weightedEventType();

    // Spread events over the past 30 days, weighted toward more recent.
    const daysAgo = Math.pow(seededRand(), 1.6) * 30;
    const ts = new Date(TODAY.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    id++;
    events.push({
      id,
      timestamp: ts.toISOString(),
      timestampFull: ts.toLocaleString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }),
      timestampRelative: getRelativeTime(ts),
      eventType: evType.value,
      eventTypeLabel: evType.label,
      investor: r.investorName,
      contact: r.contactName,
      contactRole: r.contactRole,
      email: r.contactEmail,
      document: entry.doc.name,
      documentId: entry.id,
      space: entry.spaceName,
      folder: entry.folderPath.join(' / ') || '/',
      notificationOpened: evType.value === 'notification_opened' || evType.value === 'document_viewed' || evType.value === 'document_downloaded',
      documentViewed: evType.value === 'document_viewed' || evType.value === 'document_downloaded',
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateBirdviewInvestors(): BirdviewInvestor[] {
  // Only LPs who committed to at least one fund — those are the ones with
  // documents and engagement to display.
  const committed = new Set(COMMITMENTS.map((c) => c.investorId));
  const list = GED_INVESTORS.filter((inv) => committed.has(inv.id));

  return list.map((inv, idx) => {
    const contacts = getInvestorContacts(inv.id);
    const fundCodes = COMMITMENTS.filter((c) => c.investorId === inv.id).map((c) => c.fundCode);
    // Estimate document count: 1 nominative per drawdown / distribution + a share of fund-level docs
    const total = fundCodes.length * 60 + contacts.length * 5;
    const seed = (idx + 1) * 31 + total;
    const viewed = Math.floor(total * (0.45 + (seed % 40) / 100));
    const downloaded = Math.floor(viewed * (0.35 + (seed % 25) / 100));

    return {
      id: idx + 1,
      name: inv.name,
      type: typologyToBVType(inv.typology),
      email: inv.email,
      contacts: contacts.map((c, i) => ({
        id: idx * 100 + i,
        name: c.name,
        role: 'Contact' as const,
        relationLabel: c.role,
        email: c.email,
        canAccess: c.canAccess,
        accessLevel: c.accessLevel,
      })),
      totalDocuments: total,
      viewedDocuments: viewed,
      downloadedDocuments: downloaded,
      engagementRate: total === 0 ? 0 : Math.round((viewed / total) * 100),
    };
  });
}

export function generateBirdviewSpaces(): BirdviewSpace[] {
  return getSpaces().map((space, idx) => {
    const fundCode = space.fundCode;
    const fundLPs = fundCode
      ? commitmentsForFund(fundCode).map((c) => findInvestor(c.investorId)?.name).filter(Boolean) as string[]
      : [];
    const seed = (idx + 1) * 17;
    return {
      id: idx + 1,
      name: space.name,
      investors: fundLPs,
      folders: countFoldersFlat(space.folders),
      documents: countDocsFlat(space.folders),
      engagementRate: 50 + (seed % 45),
    };
  });
}

const countFoldersFlat = (folders: FolderSpec[] | undefined): number => {
  if (!folders) return 0;
  let n = 0;
  for (const f of folders) n += 1 + countFoldersFlat(f.folders);
  return n;
};

const countDocsFlat = (folders: FolderSpec[] | undefined): number => {
  if (!folders) return 0;
  let n = 0;
  for (const f of folders) n += (f.documents?.length ?? 0) + countDocsFlat(f.folders);
  return n;
};

// Backwards-compat exports — formerly hardcoded arrays in this file.
const FALLBACK_INVESTORS = GED_INVESTORS.map((inv) => ({
  name: inv.name,
  type: typologyToBVType(inv.typology),
  email: inv.email,
}));
export { FALLBACK_INVESTORS as INVESTORS };
export const SPACES = getSpaces().map((s) => s.name);
export const DOCUMENTS = buildDocIndex().map((e) => e.doc.name);
export const CONTACTS_PHYSICAL = getAllInvestorContacts()
  .filter((c) => {
    const inv = findInvestor(c.investorId);
    return inv?.typology === 'HNWI' || inv?.typology === 'UHNWI' || inv?.typology === 'Family Office';
  })
  .map((c) => ({ name: c.name, relation: c.role, role: 'Contact' as const }));
export const CONTACTS_INSTITUTIONAL = getAllInvestorContacts()
  .filter((c) => {
    const inv = findInvestor(c.investorId);
    return inv && !['HNWI', 'UHNWI', 'Family Office'].includes(inv.typology);
  })
  .map((c) => ({ name: c.name, relation: c.role, role: 'Contact' as const }));
export { EVENT_TYPES };

// Avoid an unused-import warning when typologyToBVType is the only user
// of `pick`. Keep `pick` exported for tests / debugging convenience.
export { pick };
