import type { Fund } from './fundGenerator';

export type CapitalCallOrigin = 'backOffice' | 'import' | 'api';

export const CAPITAL_CALL_ORIGINS: CapitalCallOrigin[] = ['backOffice', 'import', 'api'];

export interface LinkedDistribution {
  id: number;
  name: string;
}

export interface CapitalCall {
  id: number;
  fundId: number;
  fundName: string;
  currency: string;
  name: string;
  dueDate: Date;
  /** Date imprimée sur l'avis, seulement quand elle diffère de la date d'échéance. */
  noticeDate: Date | null;
  calledAmount: number;
  origin: CapitalCallOrigin;
  compensations: LinkedDistribution[];
  createdAt: Date;
  createdBy: string;
  /** Verrou d'envoi actif. */
  sending: boolean;
}

const CREATORS = ['Camille', 'Thomas', 'Léa', 'Hugo', 'Inès', 'Julien'];

/** Quelques fonds de la maquette sont libellés hors euro pour illustrer la devise du fonds. */
export function capitalCallCurrency(fundId: number): string {
  if (fundId % 6 === 3) return 'USD';
  if (fundId % 11 === 0) return 'GBP';
  return 'EUR';
}

function seeded(seed: number) {
  let value = Math.abs(Math.imul(seed ^ 0x5bd1e995, 0x27d4eb2d)) % 2147483647 || 1;
  for (let i = 0; i < 5; i++) value = (value * 16807) % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const DAY = 24 * 60 * 60 * 1000;

export function generateCapitalCalls(funds: Fund[], today = new Date()): CapitalCall[] {
  const calls: CapitalCall[] = [];
  let id = 1;
  let distributionId = 1;

  funds.forEach(fund => {
    const random = seeded(fund.id);
    const count = 2 + Math.floor(random() * 5);
    const currency = capitalCallCurrency(fund.id);
    const firstDue = today.getTime() - (count - 1) * 120 * DAY + Math.floor(random() * 60) * DAY;

    for (let index = 0; index < count; index++) {
      const dueDate = new Date(firstDue + index * (90 + Math.floor(random() * 60)) * DAY);
      const createdAt = new Date(dueDate.getTime() - (20 + Math.floor(random() * 25)) * DAY);
      const noticeDate = random() < 0.3 ? new Date(createdAt.getTime() + 2 * DAY) : null;
      const originDraw = random();
      const origin: CapitalCallOrigin = originDraw < 0.7 ? 'backOffice' : originDraw < 0.9 ? 'import' : 'api';
      const compensations: LinkedDistribution[] =
        random() < 0.2 ? [{ id: distributionId, name: `Distribution ${distributionId++}` }] : [];
      const isUpcoming = dueDate.getTime() > today.getTime();

      calls.push({
        id: id++,
        fundId: fund.id,
        fundName: fund.name,
        currency,
        name: `Appel n°${index + 1}`,
        dueDate,
        noticeDate,
        calledAmount: Math.round((fund.totalCommitments * (0.05 + random() * 0.15)) / 1000) * 1000,
        origin,
        compensations,
        createdAt,
        createdBy: CREATORS[Math.floor(random() * CREATORS.length)],
        sending: isUpcoming && random() < 0.6,
      });
    }
  });

  return calls;
}
