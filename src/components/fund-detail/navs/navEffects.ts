import type { FundDetail, FundNavRow, FundShare, NavEntryMeta, NavProducedEffect } from '../../../utils/fundDetailMock';

/**
 * Effets d'une valeur liquidative (PRD Détail d'un fonds V3, section 11.2).
 * Règles serveur simulées pour la maquette : rachats validés à la date valorisés au nombre de
 * parts final, souscriptions en attente de valeur, remplacement du prix nominal, valeur de
 * référence du marché secondaire. Le serveur reste seul juge.
 */

/** Jour calendaire local (AAAA-MM-JJ) : les dates se comparent au jour, dans le fuseau de l'utilisateur. */
export const isoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const INVESTORS = ['Camille', 'Hugo', 'Léa', 'Inès', 'Paul', 'Chloé'];

export interface RedemptionEffect {
  id: string;
  ref: string;
  investor: string;
  amount: number;
  /** Nombre de parts final : montant divisé par la valeur, arrondi aux décimales des parts. */
  finalShares: number;
}

export interface NavEffects {
  redemptions: RedemptionEffect[];
  /** Souscriptions en attente de valeur, une confirmation de paiement par souscription. */
  pendingSubscriptions: number;
  secondaryMarket: boolean;
}


function seed(text: string) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return hash;
}

export function computeNavEffects(
  detail: FundDetail,
  share: FundShare,
  date: Date,
  value: number,
  decimals = 3,
): NavEffects {
  const base = seed(`${share.id}-${isoDay(date)}`);
  const latest = detail.navs[0]?.date;
  const isNewest = !latest || date.getTime() >= latest.getTime();
  const count = share.closed || share.name === 'C' ? 0 : 1 + (base % 3);
  const factor = 10 ** decimals;
  return {
    redemptions: Array.from({ length: count }, (_, index) => {
      const amount = 10_000 + ((base * (index + 7)) % 50) * 1_000;
      return {
        id: `r-${share.id}-${index}`,
        ref: `R-${String(100 + ((base + index * 17) % 900)).padStart(4, '0')}`,
        investor: INVESTORS[(base + index) % INVESTORS.length],
        amount,
        finalShares: value > 0 ? Math.round((amount / value) * factor) / factor : 0,
      };
    }),
    // Seule une valeur à la date la plus récente confirme les souscriptions en attente.
    pendingSubscriptions: isNewest && !share.closed && share.name !== 'C' ? 12 : 0,
    secondaryMarket: detail.modules.secondaryMarket,
  };
}

export interface NavEntryInput {
  shareId: string;
  date: Date;
  value: number;
  proof: string | null;
  confirmSubscriptions: boolean;
  replaceNominal: boolean;
}

const sortRows = (rows: FundNavRow[]) => [...rows].sort((a, b) => b.date.getTime() - a.date.getTime());

/** Dernière valeur saisie de chaque part, relue après chaque changement. */
function refreshLastNav(shares: FundShare[], rows: FundNavRow[]) {
  return shares.map(share => {
    const row = rows.find(item => typeof item.values[share.id] === 'number');
    return { ...share, lastNav: row ? { value: row.values[share.id] as number, date: row.date } : null };
  });
}

export interface NavChange {
  navs: FundNavRow[];
  shares: FundShare[];
  expectedNavMissing: FundDetail['expectedNavMissing'];
  /** Prix nominaux changés par l'opération, à reporter sur la fiche part. */
  nominalUpdates: Record<string, number | null>;
}

/** Enregistre ou remplace une valeur et note les effets produits. */
export function applyNavEntry(detail: FundDetail, input: NavEntryInput): NavChange {
  const share = detail.shares.find(item => item.id === input.shareId)!;
  const effects = computeNavEffects(detail, share, input.date, input.value);
  const day = isoDay(input.date);
  const existing = detail.navs.find(row => isoDay(row.date) === day);
  const previousMeta = existing?.meta[share.id];

  const produced = new Set<NavProducedEffect>(previousMeta?.produced ?? []);
  if (effects.redemptions.length > 0) produced.add('redemptions');
  if (input.confirmSubscriptions && effects.pendingSubscriptions > 0) produced.add('subscriptions');
  if (input.replaceNominal) produced.add('nominal');
  if (effects.secondaryMarket) produced.add('secondary');

  const meta: NavEntryMeta = {
    proof: input.proof ?? previousMeta?.proof ?? null,
    produced: [...produced],
    previousNominal: input.replaceNominal ? share.nominalPrice : previousMeta?.previousNominal,
  };

  const rows = existing
    ? detail.navs.map(row =>
        row === existing ? { ...row, values: { ...row.values, [share.id]: input.value }, meta: { ...row.meta, [share.id]: meta } } : row,
      )
    : sortRows([
        ...detail.navs,
        {
          date: input.date,
          values: Object.fromEntries(detail.shares.map(item => [item.id, item.id === share.id ? input.value : null])),
          netAsset: null,
          meta: { [share.id]: meta },
        },
      ]);

  const nominalUpdates: Record<string, number | null> = input.replaceNominal ? { [share.id]: input.value } : {};
  const shares = refreshLastNav(
    detail.shares.map(item => (input.replaceNominal && item.id === share.id ? { ...item, nominalPrice: input.value } : item)),
    rows,
  );

  return {
    navs: rows,
    shares,
    // La valeur attendue est saisie : l'alerte de la vue d'ensemble disparaît.
    expectedNavMissing: detail.expectedNavMissing.filter(
      item => !(item.shareId === share.id && isoDay(item.expectedDate) === day),
    ),
    nominalUpdates,
  };
}

/** Supprime une valeur. Les effets réversibles sont annulés, les autres restent en l'état. */
export function deleteNavEntry(detail: FundDetail, shareId: string, date: Date): NavChange {
  const day = isoDay(date);
  const row = detail.navs.find(item => isoDay(item.date) === day);
  const meta = row?.meta[shareId];
  const revertNominal = Boolean(meta?.produced.includes('nominal'));
  const rows = detail.navs
    .map(item => {
      if (item !== row) return item;
      const { [shareId]: removed, ...restMeta } = item.meta;
      void removed;
      return { ...item, values: { ...item.values, [shareId]: null }, meta: restMeta };
    })
    .filter(item => item.netAsset !== null || Object.values(item.values).some(value => typeof value === 'number'));
  const nominalUpdates: Record<string, number | null> = revertNominal ? { [shareId]: meta?.previousNominal ?? null } : {};
  const shares = refreshLastNav(
    detail.shares.map(item => (revertNominal && item.id === shareId ? { ...item, nominalPrice: meta?.previousNominal ?? null } : item)),
    rows,
  );
  return { navs: rows, shares, expectedNavMissing: detail.expectedNavMissing, nominalUpdates };
}

export const REVERSIBLE_EFFECTS: NavProducedEffect[] = ['redemptions', 'nominal', 'secondary'];
