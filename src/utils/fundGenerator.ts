export interface Fund {
  id: number;
  name: string;
  lei: string; // Legal Entity Identifier
  type: 'FCPR' | 'FCPI' | 'FIP' | 'SLP' | 'FPCI' | 'SICAV' | 'FCP';
  status: 'En collecte' | 'Actif' | 'Clôturé' | 'Suspendu';
  aum: number; // Assets Under Management (toujours en EUR)
  investors: number; // Nombre d'investisseurs
  subscriptions: number; // Nombre de souscriptions
  distributors: number; // Nombre de distributeurs
  shareClasses: { name: string; isin: string }[]; // Liste des parts avec leurs ISIN
  vintage: number; // Année de création
  strategy: 'Private Equity' | 'Venture Capital' | 'Real Estate' | 'Infrastructure' | 'Debt' | 'Multi-Strategy' | 'Growth' | 'Buyout';
  manager: string;
  domicile: string;
  currency: 'EUR'; // Toujours EUR
  targetReturn: number; // en %
  minimumInvestment: number;
  managementFee: number; // en %
  performanceFee: number; // en %
  lastNav: number;
  lastNavDate: Date;
  inceptionDate: Date;
  maturityDate: Date | null;
  investmentPeriodEnd: Date | null;
  subscriptionFrequency: 'Mensuelle' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle' | 'À la demande';
  redemptionFrequency: 'Mensuelle' | 'Trimestrielle' | 'Semestrielle' | 'Annuelle' | 'Fermé';
  lastActivity: Date;
  totalCommitments: number; // Montant levé
  totalCalled: number; // Montant appelé
  totalDistributed: number; // Montant distribué
  participations: number; // Nombre de participations/investissements
  tvpi: number; // Total Value to Paid-In
  dpi: number; // Distributions to Paid-In
  rvpi: number; // Residual Value to Paid-In
  irr: number; // Internal Rate of Return en %
  moic: number; // Multiple on Invested Capital
}

const fundNames = [
  'InvestHub Growth Fund I',
  'InvestHub Venture Capital II',
  'European Innovation Fund',
  'Tech Ventures Europe',
  'Sustainable Growth Fund',
  'Digital Transformation Fund',
  'Healthcare Innovation Fund',
  'Real Estate Opportunity Fund',
  'Infrastructure Development Fund',
  'Climate Tech Ventures',
  'FinTech Investment Fund',
  'AI & Machine Learning Fund',
  'Biotech Growth Fund',
  'European Mid-Market Fund',
  'Green Energy Transition Fund',
  'Consumer Brands Fund',
  'Software as a Service Fund',
  'Industrial Technology Fund',
  'Life Sciences Fund III',
  'Smart Cities Investment Fund',
  'Mobility & Transport Fund',
  'Cybersecurity Ventures',
  'E-commerce Growth Fund',
  'Impact Investment Fund',
  'Luxury Goods Fund',
  'Media & Entertainment Fund',
  'Education Technology Fund',
  'Food & Agriculture Fund',
  'Space Technology Ventures',
  'Quantum Computing Fund',
  'Metaverse Investment Fund',
  'Supply Chain Innovation Fund',
  'Energy Storage Fund',
  'Water Resources Fund',
  'Advanced Materials Fund',
  'Robotics & Automation Fund',
  'Cloud Infrastructure Fund',
  'Digital Health Fund',
  'PropTech Ventures',
  'InsurTech Fund',
  'BlockChain Ventures',
  'Data Analytics Fund',
  'Clean Tech Fund IV',
  'Circular Economy Fund',
  'Smart Manufacturing Fund',
  'Telecom Infrastructure Fund',
  'Gaming & Esports Fund',
  'Aerospace & Defense Fund',
  'Maritime Technology Fund',
  'Agricultural Tech Fund'
];

const managers = [
  'Pierre Dubois',
  'Marie Laurent',
  'Jean-François Martin',
  'Sophie Bernard',
  'Alexandre Petit',
  'Isabelle Rousseau',
  'Thomas Lefebvre',
  'Catherine Moreau',
  'Nicolas Simon',
  'Émilie Blanc',
  'Laurent Girard',
  'Nathalie Bonnet',
  'Olivier Lambert',
  'Céline Fontaine',
  'Julien Roussel'
];

const domiciles = [
  'Luxembourg',
  'France',
  'Ireland',
  'Netherlands',
  'Switzerland',
  'United Kingdom',
  'Germany',
  'Belgium'
];

const strategies: Fund['strategy'][] = [
  'Private Equity',
  'Venture Capital',
  'Real Estate',
  'Infrastructure',
  'Debt',
  'Multi-Strategy',
  'Growth',
  'Buyout'
];

const types: Fund['type'][] = ['FCPR', 'FCPI', 'FIP', 'SLP', 'FPCI', 'SICAV', 'FCP'];

const statuses: Fund['status'][] = ['En collecte', 'Actif', 'Clôturé', 'Suspendu'];

const subscriptionFrequencies: Fund['subscriptionFrequency'][] = [
  'Mensuelle',
  'Trimestrielle',
  'Semestrielle',
  'Annuelle',
  'À la demande'
];

const redemptionFrequencies: Fund['redemptionFrequency'][] = [
  'Mensuelle',
  'Trimestrielle',
  'Semestrielle',
  'Annuelle',
  'Fermé'
];

function generateLEI(fundId: number): string {
  const countryCode = ['FR', 'LU', 'IE', 'NL', 'CH'][Math.floor(Math.random() * 5)];
  const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let lei = countryCode;
  for (let i = 0; i < 18; i++) {
    lei += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  }
  return lei;
}

function generateISIN(fundId: number, shareClass: number): string {
  const countryCode = ['LU', 'FR', 'IE', 'NL', 'CH'][Math.floor(Math.random() * 5)];
  const nsin = String(fundId).padStart(9, '0') + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${countryCode}${nsin}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFunds(count: number = 50): Fund[] {
  const funds: Fund[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name = randomFromArray(fundNames);
    while (usedNames.has(name)) {
      name = randomFromArray(fundNames);
    }
    usedNames.add(name);

    const vintage = 2015 + Math.floor(Math.random() * 10); // 2015-2024
    const inceptionDate = new Date(vintage, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const fundLife = 8 + Math.floor(Math.random() * 7); // 8-14 ans
    const maturityDate = new Date(inceptionDate);
    maturityDate.setFullYear(maturityDate.getFullYear() + fundLife);

    const investmentPeriod = 3 + Math.floor(Math.random() * 3); // 3-5 ans
    const investmentPeriodEnd = new Date(inceptionDate);
    investmentPeriodEnd.setFullYear(investmentPeriodEnd.getFullYear() + investmentPeriod);

    const status = randomFromArray(statuses);
    const totalCommitments = (5 + Math.random() * 45) * 1000000; // 5M - 50M (plus petits montants)
    const totalCalled = totalCommitments * (0.3 + Math.random() * 0.7); // 30-100% called
    const totalDistributed = totalCalled * (0 + Math.random() * 1.2); // 0-120% of called
    const residualValue = totalCalled * (0.5 + Math.random() * 2); // 50-250% of called
    
    const dpi = totalDistributed / totalCalled;
    const rvpi = residualValue / totalCalled;
    const tvpi = dpi + rvpi;
    const irr = -5 + Math.random() * 35; // -5% to 30%
    const moic = tvpi;

    const shareClassCount = 1 + Math.floor(Math.random() * 4); // 1-4 classes
    const shareClasses = Array.from({ length: shareClassCount }, (_, idx) => ({
      name: String.fromCharCode(65 + idx), 
      isin: generateISIN(i + 1, idx)
    })); // A, B, C, D

    const lastActivity = randomDate(
      new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
      new Date()
    );

    funds.push({
      id: i + 1,
      name,
      lei: generateLEI(i + 1), // Placeholder for LEI
      type: randomFromArray(types),
      status,
      aum: totalCalled - totalDistributed + residualValue,
      investors: 10 + Math.floor(Math.random() * 190), // 10-200 investisseurs
      subscriptions: 5 + Math.floor(Math.random() * 100), // 5-105 souscriptions
      distributors: 1 + Math.floor(Math.random() * 5), // 1-5 distributeurs
      shareClasses,
      vintage,
      strategy: randomFromArray(strategies),
      manager: randomFromArray(managers),
      domicile: randomFromArray(domiciles),
      currency: 'EUR',
      targetReturn: 8 + Math.random() * 17, // 8-25%
      minimumInvestment: [100000, 250000, 500000, 1000000, 5000000][Math.floor(Math.random() * 5)],
      managementFee: 1 + Math.random() * 2, // 1-3%
      performanceFee: 15 + Math.random() * 10, // 15-25%
      lastNav: 90 + Math.random() * 30, // 90-120
      lastNavDate: randomDate(
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date()
      ),
      inceptionDate,
      maturityDate: status === 'Clôturé' ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) : maturityDate,
      investmentPeriodEnd: new Date() > investmentPeriodEnd ? investmentPeriodEnd : null,
      subscriptionFrequency: randomFromArray(subscriptionFrequencies),
      redemptionFrequency: randomFromArray(redemptionFrequencies),
      lastActivity,
      totalCommitments,
      totalCalled,
      totalDistributed,
      participations: 3 + Math.floor(Math.random() * 27), // 3-30 participations
      tvpi,
      dpi,
      rvpi,
      irr,
      moic
    });
  }

  return funds;
}