import { Alert, generateEntityDetails } from './mockData';

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
}

const individualNames = [
  { firstName: 'John', lastName: 'Smith' },
  { firstName: 'Sarah', lastName: 'Connor' },
  { firstName: 'Michael', lastName: 'Chen' },
  { firstName: 'Emily', lastName: 'Rodriguez' },
  { firstName: 'David', lastName: 'Kim' },
  { firstName: 'Lisa', lastName: 'Anderson' },
  { firstName: 'James', lastName: 'Wilson' },
  { firstName: 'Maria', lastName: 'Garcia' },
  { firstName: 'Robert', lastName: 'Taylor' },
  { firstName: 'Jennifer', lastName: 'Martinez' }
];

const corporateNames = [
  'Lombard International Assurance',
  'LS HOLDING',
  'FMI Corporation',
  'Global Trading Partners',
  'Tech Solutions Ltd',
  'Alpha Capital Group',
  'Horizon Investments',
  'Meridian Finance',
  'Vertex Holdings',
  'Pinnacle Enterprises'
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

/**
 * Génère des alertes mockées pour la page Alerts
 */
export function generateAlerts(count: number = 50): AlertItem[] {
  const alerts: AlertItem[] = [];
  
  for (let i = 0; i < count; i++) {
    const isIndividual = Math.random() > 0.3;
    const source: 'Membercheck' | 'ORIAS' = Math.random() > 0.5 ? 'ORIAS' : 'Membercheck';
    
    let entityName: string;
    let alertName: string;
    
    if (isIndividual) {
      const person = randomElement(individualNames);
      entityName = `${person.firstName} ${person.lastName}`;
      // Pour l'alerte, on utilise une variation du nom
      alertName = `${person.firstName} ${person.lastName.charAt(0)}. ${randomElement(['Smith', 'Johnson', 'Brown', 'Davis'])}`;
    } else {
      entityName = randomElement(corporateNames);
      alertName = entityName;
    }
    
    // Générer le statut avec distribution réaliste
    const rand = Math.random();
    let status: 'Pending' | 'Confirmed' | 'Rejected';
    if (rand < 0.15) {
      status = 'Pending'; // 15% Pending (plus visible pour la démo)
    } else if (rand < 0.40) {
      status = 'Confirmed'; // 25% Confirmed
    } else {
      status = 'Rejected'; // 60% Rejected
    }
    
    const changes: 'New' | 'Modified' | null = 
      status === 'Pending' 
        ? (Math.random() > 0.5 ? 'New' : 'Modified')
        : null;
    
    const match = status === 'Pending' 
      ? randomNumber(20, 97)
      : randomNumber(40, 95);
    
    const daysAgo = status === 'Pending'
      ? randomNumber(1, 30)
      : randomNumber(10, 180);
    
    const date = randomDate(daysAgo);
    
    // Générer une alerte complète avec détails enrichis
    const entityDetails = generateEntityDetails('Pending', alertName, 1);
    const fullAlert = entityDetails.alerts[0];
    
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
      daysAgo
    });
  }
  
  return alerts.sort((a, b) => {
    // Trier par statut (Pending d'abord) puis par date
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Obtenir les statistiques des alertes
 */
export function getAlertsStats(alerts: AlertItem[]) {
  return {
    pending: alerts.filter(a => a.status === 'Pending').length,
    confirmed: alerts.filter(a => a.status === 'Confirmed').length,
    rejected: alerts.filter(a => a.status === 'Rejected').length
  };
}
