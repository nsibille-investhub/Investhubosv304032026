import { generateAuditTrail, AuditEvent } from './auditMockData';
import { generateEnrichedAlert } from './enrichedAlertDetails';

export interface Alert {
  id: string;
  name: string;
  similarity: number;
  decision: 'true_hit' | 'false_hit' | 'unsure' | null;
  comment: string;
  date: string;
  analyst: string;
  enrichedDetails?: {
    warningsNote?: string;
    biography?: string;
    identification?: string;
    reports?: string;
    names?: string[];
    sources?: string[];
    links?: string[];
    fullDescription: string;
  };
  details: {
    keywords: string[];
    identification: {
      label: string;
      value: string;
    }[];
    sources: {
      label: string;
      url: string;
    }[];
  };
}

export interface EntityDetails {
  alerts: Alert[];
  auditTrail: AuditEvent[];
}

function createAlertsWithEnrichedDetails(count: number, entityName: string, status: string): Alert[] {
  const alerts: Alert[] = [];
  for (let i = 0; i < count; i++) {
    alerts.push(generateEnrichedAlert(i, entityName, status));
  }
  return alerts;
}

export function generateEntityDetails(status: string, entityName: string = '', alertCount?: number): EntityDetails {
  const auditTrail = generateAuditTrail(status);
  
  // Si alertCount est spécifié, l'utiliser
  if (alertCount !== undefined) {
    return {
      auditTrail,
      alerts: alertCount === 0 ? [] : createAlertsWithEnrichedDetails(alertCount, entityName, status)
    };
  }
  
  switch (status) {
    case 'Pending':
      return {
        auditTrail,
        alerts: createAlertsWithEnrichedDetails(3, entityName, status)
      };

    case 'Clear':
      // 30% de chance d'avoir 0 alertes pour les entités "Clear"
      const clearAlertCount = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 2) + 1;
      return {
        auditTrail,
        alerts: clearAlertCount === 0 ? [] : createAlertsWithEnrichedDetails(clearAlertCount, entityName, status)
      };

    case 'True Hit':
      return {
        auditTrail,
        alerts: createAlertsWithEnrichedDetails(Math.floor(Math.random() * 3) + 1, entityName, status)
      };

    case 'New Hit':
      return {
        auditTrail,
        alerts: createAlertsWithEnrichedDetails(Math.floor(Math.random() * 3) + 1, entityName, status)
      };

    default:
      return { 
        auditTrail: [],
        alerts: [] as Alert[] 
      };
  }
}

export type { AuditEvent } from './auditMockData';
