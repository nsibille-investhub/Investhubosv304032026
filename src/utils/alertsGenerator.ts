import { Alert, generateEntityDetails } from './mockData';

export type AlertListCategory =
  | 'PEP'
  | 'Watch List'
  | 'Sanctions'
  | 'Adverse Media'
  | 'Crime'
  | 'Financial Warning';

export type InvestorRole =
  | 'source'
  | 'beneficiary'
  | 'coInvestor'
  | 'legalRep'
  | 'proxy';

export interface AttachedInvestor {
  name: string;
  role: InvestorRole;
}

export interface AlertItem {
  id: string;
  name: string;
  entityName: string;
  changes: 'New' | 'Modified' | null;
  match: number;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  date: string;
  alert: Alert;
  source: 'Membercheck' | 'ORIAS';
  daysAgo: number;
  alertList: AlertListCategory;
  alertTypes: AlertListCategory[];
  attachedInvestors: AttachedInvestor[];
  previousFindings: AlertListCategory[];
  monitoring: boolean;
  analyst: string | null;
}

const individualNames: Array<{ firstName: string; lastName: string }> = [
  { firstName: 'John', lastName: 'Smith' },
  { firstName: 'Sarah', lastName: 'Connor' },
  { firstName: 'Michael', lastName: 'Chen' },
  { firstName: 'Emily', lastName: 'Rodriguez' },
  { firstName: 'David', lastName: 'Kim' },
  { firstName: 'Lisa', lastName: 'Anderson' },
  { firstName: 'James', lastName: 'Wilson' },
  { firstName: 'Maria', lastName: 'Garcia' },
  { firstName: 'Robert', lastName: 'Taylor' },
  { firstName: 'Jennifer', lastName: 'Martinez' },
  { firstName: 'Vladimir', lastName: 'Petrov' },
  { firstName: 'Sergei', lastName: 'Ivanov' },
  { firstName: 'Aïcha', lastName: 'Diallo' },
  { firstName: 'Hiroshi', lastName: 'Tanaka' },
  { firstName: 'Carlos', lastName: 'Mendoza' },
  { firstName: 'Fatima', lastName: 'Al-Hassan' },
  { firstName: 'Liang', lastName: 'Zhao' },
  { firstName: 'Olena', lastName: 'Kovalenko' },
  { firstName: 'Marco', lastName: 'Rossi' },
  { firstName: 'Sofia', lastName: 'Lindberg' },
];

const corporateNames: string[] = [
  'Lombard International Assurance',
  'LS HOLDING',
  'FMI Corporation',
  'Global Trading Partners',
  'Tech Solutions Ltd',
  'Alpha Capital Group',
  'Horizon Investments',
  'Meridian Finance',
  'Vertex Holdings',
  'Pinnacle Enterprises',
  'Eastbridge Trust',
  'Cayman Offshore Holdings',
  'Atlas Resources SA',
  'Northstar Energy Trading',
  'Silver Crescent Logistics',
  'Black Sea Shipping Co',
  'Nordic Petroleum AB',
  'Dubai Gold Refinery LLC',
  'Hong Kong Diamond Exchange',
  'Geneva Private Bank',
];

const ALERT_LISTS: AlertListCategory[] = [
  'PEP',
  'Watch List',
  'Sanctions',
  'Adverse Media',
  'Crime',
  'Financial Warning',
];

const INVESTOR_NAMES: string[] = [
  'Lombard SCS Fund I',
  'ABC Family Office',
  'Meridian Wealth Partners',
  'Atlantis Private Equity',
  'Crescent Capital Trust',
  'Nordic Pension Fund',
  'Helios Endowment',
  'BlueRock Holdings',
  'Lighthouse Investments',
  'Orion Asset Management',
];

const INVESTOR_ROLES: InvestorRole[] = [
  'source',
  'beneficiary',
  'coInvestor',
  'legalRep',
  'proxy',
];

const ANALYSTS: string[] = [
  'Sophie Martin',
  'Marc Dubois',
  'Claire Rousseau',
  'Thomas Bernard',
  'Emma Leroy',
  'Jean Dault',
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildAlertName(
  isIndividual: boolean,
  entityName: string,
  individual?: { firstName: string; lastName: string },
): string {
  if (isIndividual && individual) {
    const aliasLastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Petrov', 'Khan', 'Müller'];
    return `${individual.firstName} ${individual.lastName.charAt(0)}. ${randomElement(aliasLastNames)}`;
  }
  return entityName;
}

/**
 * Generate a varied set of mock alerts for the Compliance Alerts page.
 *
 * We force a wide distribution across:
 *  - status (Pending / Confirmed / Rejected)
 *  - source (Membercheck / ORIAS)
 *  - alert list (PEP / Watch List / Sanctions / Adverse Media / Crime / Financial Warning)
 *  - entity kind (individual / corporate)
 *  - changes (New / Modified / none)
 *  - match score and date range
 */
export function generateAlerts(count: number = 100): AlertItem[] {
  const alerts: AlertItem[] = [];

  // Deterministic-ish distribution so each batch reliably covers the matrix.
  const statusCycle: Array<'Pending' | 'Confirmed' | 'Rejected'> = [
    'Pending',
    'Pending',
    'Pending',
    'Confirmed',
    'Confirmed',
    'Rejected',
    'Rejected',
    'Rejected',
    'Rejected',
    'Rejected',
  ];

  for (let i = 0; i < count; i++) {
    const isIndividual = i % 3 !== 0;
    const source: 'Membercheck' | 'ORIAS' = i % 2 === 0 ? 'Membercheck' : 'ORIAS';
    const alertList = ALERT_LISTS[i % ALERT_LISTS.length];
    const status = statusCycle[i % statusCycle.length];

    const individual = isIndividual
      ? individualNames[i % individualNames.length]
      : undefined;
    const entityName = isIndividual && individual
      ? `${individual.firstName} ${individual.lastName}`
      : corporateNames[i % corporateNames.length];
    const alertName = buildAlertName(isIndividual, entityName, individual);

    const changes: 'New' | 'Modified' | null =
      status === 'Pending'
        ? i % 2 === 0
          ? 'New'
          : 'Modified'
        : i % 7 === 0
          ? 'Modified'
          : null;

    let match: number;
    if (status === 'Confirmed') {
      match = randomNumber(75, 99);
    } else if (status === 'Rejected') {
      match = randomNumber(20, 70);
    } else {
      match = randomNumber(40, 95);
    }

    const daysAgo =
      status === 'Pending'
        ? randomNumber(0, 21)
        : status === 'Confirmed'
          ? randomNumber(5, 90)
          : randomNumber(15, 240);

    const date = randomDate(daysAgo);

    // Enriched alert detail used by the drawer body.
    const detailStatusHint =
      status === 'Confirmed' ? 'True Hit' : status === 'Rejected' ? 'Clear' : 'Pending';
    const entityDetails = generateEntityDetails(detailStatusHint, alertName, 1);
    const fullAlert = entityDetails.alerts[0];

    const attachedInvestorCount = randomNumber(1, 3);
    const attachedInvestors: AttachedInvestor[] = Array.from(
      { length: attachedInvestorCount },
      (_, k) => ({
        name: INVESTOR_NAMES[(i + k) % INVESTOR_NAMES.length],
        role: INVESTOR_ROLES[(i + k) % INVESTOR_ROLES.length],
      }),
    );

    const extraTypes: AlertListCategory[] =
      i % 4 === 0
        ? [ALERT_LISTS[(i + 1) % ALERT_LISTS.length]]
        : i % 6 === 0
          ? [
              ALERT_LISTS[(i + 1) % ALERT_LISTS.length],
              ALERT_LISTS[(i + 3) % ALERT_LISTS.length],
            ]
          : [];
    const alertTypes = Array.from(new Set([alertList, ...extraTypes]));

    const previousFindings: AlertListCategory[] =
      i % 5 === 0
        ? [ALERT_LISTS[(i + 2) % ALERT_LISTS.length]]
        : i % 7 === 0
          ? [
              ALERT_LISTS[(i + 2) % ALERT_LISTS.length],
              ALERT_LISTS[(i + 4) % ALERT_LISTS.length],
            ]
          : [];

    const analyst =
      status === 'Pending'
        ? null
        : ANALYSTS[i % ANALYSTS.length];

    alerts.push({
      id: `ALERT-${1000 + i}`,
      name: alertName,
      entityName,
      changes,
      match,
      status,
      date: formatDate(date),
      alert: fullAlert,
      source,
      daysAgo,
      alertList,
      alertTypes,
      attachedInvestors,
      previousFindings,
      monitoring: true,
      analyst,
    });
  }

  return alerts.sort((a, b) => {
    // Pending first, then by date desc
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getAlertsStats(alerts: AlertItem[]) {
  return {
    pending: alerts.filter((a) => a.status === 'Pending').length,
    confirmed: alerts.filter((a) => a.status === 'Confirmed').length,
    rejected: alerts.filter((a) => a.status === 'Rejected').length,
  };
}
