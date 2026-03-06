import { Subscription } from './subscriptionGenerator';
import { AlertItem } from './alertsGenerator';

export interface AIInsight {
  type: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  count: number;
  filterCriteria?: {
    field: string;
    condition: string;
    value: any;
  };
  items?: Subscription[] | AlertItem[];
}

export interface AIAnalysis {
  question: string;
  summary: string;
  insights: AIInsight[];
  timestamp: Date;
}

/**
 * Analyse les données de souscriptions pour répondre aux questions
 */
export function analyzeSubscriptions(
  question: string,
  subscriptions: Subscription[]
): AIAnalysis {
  const lowerQuestion = question.toLowerCase();
  const insights: AIInsight[] = [];

  // Analyse des souscriptions à relancer (cas spécifique prioritaire)
  if (
    lowerQuestion.includes('relancer') ||
    lowerQuestion.includes('relance') ||
    lowerQuestion.includes('bloqu')
  ) {
    // Souscriptions en Onboarding depuis plus de 30 jours
    const longOnboarding = subscriptions.filter(sub => {
      if (sub.status !== 'Onboarding') return false;
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceCreation > 30;
    });

    // Souscriptions "En attente de fonds" depuis plus de 30 jours
    const pendingFunds = subscriptions.filter(sub => {
      if (sub.status !== 'En attente de fonds') return false;
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - sub.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate > 30;
    });

    // Souscriptions "En attente de paiement" depuis plus de 30 jours
    const pendingPayment = subscriptions.filter(sub => {
      if (sub.status !== 'En attente de paiement') return false;
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - sub.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate > 30;
    });

    if (longOnboarding.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'Onboarding en retard',
        description: `${longOnboarding.length} souscription${longOnboarding.length > 1 ? 's' : ''} bloquée${longOnboarding.length > 1 ? 's' : ''} en Onboarding depuis plus de 30 jours`,
        count: longOnboarding.length,
        items: longOnboarding,
        filterCriteria: {
          field: 'status',
          condition: 'equals',
          value: 'Onboarding'
        }
      });
    }

    if (pendingFunds.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'En attente de fonds > 30 jours',
        description: `${pendingFunds.length} souscription${pendingFunds.length > 1 ? 's' : ''} en attente de fonds depuis plus de 30 jours`,
        count: pendingFunds.length,
        items: pendingFunds,
        filterCriteria: {
          field: 'status',
          condition: 'equals',
          value: 'En attente de fonds'
        }
      });
    }

    if (pendingPayment.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'En attente de paiement > 30 jours',
        description: `${pendingPayment.length} souscription${pendingPayment.length > 1 ? 's' : ''} en attente de paiement depuis plus de 30 jours`,
        count: pendingPayment.length,
        items: pendingPayment,
        filterCriteria: {
          field: 'status',
          condition: 'equals',
          value: 'En attente de paiement'
        }
      });
    }
  }

  // Analyse des actions urgentes
  if (
    lowerQuestion.includes('urgent') ||
    lowerQuestion.includes('priorité') ||
    lowerQuestion.includes('action')
  ) {
    // 1. Souscriptions avec onboarding trop long (>30 jours en Onboarding)
    const longOnboarding = subscriptions.filter(sub => {
      if (sub.status !== 'Onboarding') return false;
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceCreation > 30;
    });

    if (longOnboarding.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'Onboarding en retard',
        description: `${longOnboarding.length} souscription${longOnboarding.length > 1 ? 's' : ''} bloquée${longOnboarding.length > 1 ? 's' : ''} en Onboarding depuis plus de 30 jours`,
        count: longOnboarding.length,
        items: longOnboarding,
        filterCriteria: {
          field: 'status',
          condition: 'equals',
          value: 'Onboarding'
        }
      });
    }

    // 2. Souscriptions "À signer" depuis longtemps (>15 jours)
    const pendingSignature = subscriptions.filter(sub => {
      if (sub.status !== 'À signer') return false;
      const daysSinceUpdate = Math.floor(
        (new Date().getTime() - sub.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceUpdate > 15;
    });

    if (pendingSignature.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'Signatures en attente',
        description: `${pendingSignature.length} souscription${pendingSignature.length > 1 ? 's' : ''} en attente de signature depuis plus de 15 jours`,
        count: pendingSignature.length,
        items: pendingSignature,
        filterCriteria: {
          field: 'status',
          condition: 'equals',
          value: 'À signer'
        }
      });
    }

    // 3. Souscriptions avec KYC à reviewer
    const kycToReview = subscriptions.filter(sub => 
      sub.contrepartie.kycStatus === 'to review'
    );

    if (kycToReview.length > 0) {
      insights.push({
        type: 'warning',
        title: 'KYC à vérifier',
        description: `${kycToReview.length} contrepartie${kycToReview.length > 1 ? 's' : ''} en attente de vérification KYC`,
        count: kycToReview.length,
        items: kycToReview
      });
    }

    // 4. Draft ancien (>45 jours)
    const oldDrafts = subscriptions.filter(sub => {
      if (sub.status !== 'Draft') return false;
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - sub.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceCreation > 45;
    });

    if (oldDrafts.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Brouillons abandonnés',
        description: `${oldDrafts.length} brouillon${oldDrafts.length > 1 ? 's' : ''} créé${oldDrafts.length > 1 ? 's' : ''} il y a plus de 45 jours`,
        count: oldDrafts.length,
        items: oldDrafts,
        filterCriteria: {
          field: 'status',
          condition: 'equals',
          value: 'Draft'
        }
      });
    }

    // 5. Monitoring sans analyst assigné
    const monitoringWithoutAnalyst = subscriptions.filter(sub => 
      sub.monitoring && !sub.analyst
    );

    if (monitoringWithoutAnalyst.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Monitoring non assigné',
        description: `${monitoringWithoutAnalyst.length} souscription${monitoringWithoutAnalyst.length > 1 ? 's' : ''} en monitoring sans analyst assigné`,
        count: monitoringWithoutAnalyst.length,
        items: monitoringWithoutAnalyst
      });
    }

    // 6. Hits non traités
    const untreatedHits = subscriptions.filter(sub => 
      sub.hits > 0 && sub.decisions < sub.hits
    );

    if (untreatedHits.length > 0) {
      const totalPendingDecisions = untreatedHits.reduce(
        (sum, sub) => sum + (sub.hits - sub.decisions), 
        0
      );
      insights.push({
        type: 'urgent',
        title: 'Hits à traiter',
        description: `${totalPendingDecisions} hit${totalPendingDecisions > 1 ? 's' : ''} en attente de décision sur ${untreatedHits.length} souscription${untreatedHits.length > 1 ? 's' : ''}`,
        count: untreatedHits.length,
        items: untreatedHits
      });
    }
  }

  // Analyse des tendances
  if (
    lowerQuestion.includes('tendance') ||
    lowerQuestion.includes('statistique') ||
    lowerQuestion.includes('résumé')
  ) {
    const today = new Date();
    const last7Days = subscriptions.filter(sub => {
      const diff = today.getTime() - sub.createdAt.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    });

    insights.push({
      type: 'info',
      title: 'Nouvelles souscriptions',
      description: `${last7Days.length} nouvelle${last7Days.length > 1 ? 's' : ''} souscription${last7Days.length > 1 ? 's' : ''} créée${last7Days.length > 1 ? 's' : ''} cette semaine`,
      count: last7Days.length,
      items: last7Days
    });

    const executed = subscriptions.filter(sub => sub.status === 'Exécuté');
    insights.push({
      type: 'success',
      title: 'Souscriptions exécutées',
      description: `${executed.length} souscription${executed.length > 1 ? 's' : ''} exécutée${executed.length > 1 ? 's' : ''} (${Math.round((executed.length / subscriptions.length) * 100)}% du total)`,
      count: executed.length,
      items: executed
    });
  }

  // Analyse par montant
  if (
    lowerQuestion.includes('montant') ||
    lowerQuestion.includes('valeur') ||
    lowerQuestion.includes('volume')
  ) {
    const highValue = subscriptions.filter(sub => sub.amount >= 1000000);
    const totalVolume = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    insights.push({
      type: 'info',
      title: 'Souscriptions importantes',
      description: `${highValue.length} souscription${highValue.length > 1 ? 's' : ''} ≥ 1M€ (${Math.round((highValue.reduce((s, sub) => s + sub.amount, 0) / totalVolume) * 100)}% du volume total)`,
      count: highValue.length,
      items: highValue
    });
  }

  // Analyse par risque
  if (
    lowerQuestion.includes('risque') ||
    lowerQuestion.includes('compliance')
  ) {
    const highRisk = subscriptions.filter(sub => sub.riskLevel === 'High');
    const mediumRisk = subscriptions.filter(sub => sub.riskLevel === 'Medium');

    if (highRisk.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'Risque élevé',
        description: `${highRisk.length} souscription${highRisk.length > 1 ? 's' : ''} à risque élevé nécessitant une attention particulière`,
        count: highRisk.length,
        items: highRisk
      });
    }

    if (mediumRisk.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Risque moyen',
        description: `${mediumRisk.length} souscription${mediumRisk.length > 1 ? 's' : ''} à risque moyen`,
        count: mediumRisk.length,
        items: mediumRisk
      });
    }
  }

  // Générer le résumé avec explication du raisonnement
  let summary = '';
  if (insights.length === 0) {
    summary = "Aucune action urgente détectée. Toutes les souscriptions sont dans les temps.";
  } else {
    const urgentCount = insights.filter(i => i.type === 'urgent').length;
    const warningCount = insights.filter(i => i.type === 'warning').length;
    const totalItems = insights.reduce((sum, i) => sum + i.count, 0);
    
    // Explication spécifique pour les souscriptions à relancer
    if (lowerQuestion.includes('relancer') || lowerQuestion.includes('relance')) {
      const reasoningParts = [];
      if (insights.some(i => i.title.includes('Onboarding'))) {
        reasoningParts.push('souscriptions en Onboarding depuis plus de 30 jours');
      }
      if (insights.some(i => i.title.includes('attente de fonds'))) {
        reasoningParts.push('souscriptions en attente de fonds depuis plus de 30 jours');
      }
      if (insights.some(i => i.title.includes('attente de paiement'))) {
        reasoningParts.push('souscriptions en attente de paiement depuis plus de 30 jours');
      }
      
      if (reasoningParts.length > 0) {
        summary = `J'ai identifié ${totalItems} souscription${totalItems > 1 ? 's' : ''} à relancer : ${reasoningParts.join(', ')}. Le tableau ci-dessous a été filtré pour afficher uniquement ces souscriptions.`;
      } else {
        summary = `Aucune souscription à relancer détectée. Tous les processus sont dans les délais normaux.`;
      }
    } else if (urgentCount > 0) {
      summary = `${urgentCount} action${urgentCount > 1 ? 's' : ''} urgente${urgentCount > 1 ? 's' : ''} détectée${urgentCount > 1 ? 's' : ''} sur un total de ${totalItems} souscription${totalItems > 1 ? 's' : ''} nécessitant votre attention.`;
    } else if (warningCount > 0) {
      summary = `${warningCount} point${warningCount > 1 ? 's' : ''} d'attention identifié${warningCount > 1 ? 's' : ''} concernant ${totalItems} souscription${totalItems > 1 ? 's' : ''}.`;
    } else {
      summary = `${insights.length} insight${insights.length > 1 ? 's' : ''} disponible${insights.length > 1 ? 's' : ''} pour ${totalItems} souscription${totalItems > 1 ? 's' : ''}.`;
    }
  }

  return {
    question,
    summary,
    insights: insights.slice(0, 5), // Top 5 insights
    timestamp: new Date()
  };
}

/**
 * Analyse les alertes pour répondre aux questions
 */
export function analyzeQuery(
  question: string,
  alerts: AlertItem[]
): AIAnalysis {
  const lowerQuestion = question.toLowerCase();
  const insights: AIInsight[] = [];

  // Analyse des alertes urgentes
  if (
    lowerQuestion.includes('urgent') ||
    lowerQuestion.includes('priorité') ||
    lowerQuestion.includes('action')
  ) {
    // 1. Alertes Pending avec match élevé
    const highMatchPending = alerts.filter(a => 
      a.status === 'Pending' && a.match >= 80
    );

    if (highMatchPending.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'Alertes haute correspondance',
        description: `${highMatchPending.length} alerte${highMatchPending.length > 1 ? 's' : ''} en attente avec un match ≥ 80%`,
        count: highMatchPending.length,
        items: highMatchPending
      });
    }

    // 2. Nouvelles alertes
    const newAlerts = alerts.filter(a => a.changes === 'New' && a.status === 'Pending');
    if (newAlerts.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'Nouvelles alertes',
        description: `${newAlerts.length} nouvelle${newAlerts.length > 1 ? 's' : ''} alerte${newAlerts.length > 1 ? 's' : ''} nécessitant une attention immédiate`,
        count: newAlerts.length,
        items: newAlerts
      });
    }

    // 3. Alertes anciennes non traitées
    const oldPending = alerts.filter(a => 
      a.status === 'Pending' && a.daysAgo > 30
    );
    if (oldPending.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Alertes en retard',
        description: `${oldPending.length} alerte${oldPending.length > 1 ? 's' : ''} en attente depuis plus de 30 jours`,
        count: oldPending.length,
        items: oldPending
      });
    }
  }

  // Analyse par source
  if (
    lowerQuestion.includes('membercheck') ||
    lowerQuestion.includes('orias')
  ) {
    const source = lowerQuestion.includes('membercheck') ? 'Membercheck' : 'ORIAS';
    const sourceAlerts = alerts.filter(a => a.source === source);
    const pendingSource = sourceAlerts.filter(a => a.status === 'Pending');

    insights.push({
      type: 'info',
      title: `Alertes ${source}`,
      description: `${sourceAlerts.length} alerte${sourceAlerts.length > 1 ? 's' : ''} ${source} dont ${pendingSource.length} en attente`,
      count: sourceAlerts.length,
      items: sourceAlerts
    });
  }

  // Analyse par match score
  if (
    lowerQuestion.includes('match') ||
    lowerQuestion.includes('score') ||
    lowerQuestion.includes('correspondance')
  ) {
    const highMatch = alerts.filter(a => a.match >= 80);
    const mediumMatch = alerts.filter(a => a.match >= 60 && a.match < 80);
    const lowMatch = alerts.filter(a => a.match < 60);

    if (highMatch.length > 0) {
      insights.push({
        type: 'urgent',
        title: 'Match élevé (≥80%)',
        description: `${highMatch.length} alerte${highMatch.length > 1 ? 's' : ''} avec une correspondance très élevée`,
        count: highMatch.length,
        items: highMatch
      });
    }

    if (mediumMatch.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Match moyen (60-79%)',
        description: `${mediumMatch.length} alerte${mediumMatch.length > 1 ? 's' : ''} avec une correspondance moyenne`,
        count: mediumMatch.length,
        items: mediumMatch
      });
    }
  }

  // Analyse des statuts
  if (
    lowerQuestion.includes('pending') ||
    lowerQuestion.includes('attente') ||
    lowerQuestion.includes('traiter')
  ) {
    const pending = alerts.filter(a => a.status === 'Pending');
    
    insights.push({
      type: 'warning',
      title: 'Alertes en attente',
      description: `${pending.length} alerte${pending.length > 1 ? 's' : ''} en attente de traitement`,
      count: pending.length,
      items: pending
    });
  }

  if (
    lowerQuestion.includes('confirmed') ||
    lowerQuestion.includes('confirmé')
  ) {
    const confirmed = alerts.filter(a => a.status === 'Confirmed');
    
    insights.push({
      type: 'info',
      title: 'Alertes confirmées',
      description: `${confirmed.length} alerte${confirmed.length > 1 ? 's' : ''} confirmée${confirmed.length > 1 ? 's' : ''}`,
      count: confirmed.length,
      items: confirmed
    });
  }

  if (
    lowerQuestion.includes('rejected') ||
    lowerQuestion.includes('rejeté')
  ) {
    const rejected = alerts.filter(a => a.status === 'Rejected');
    
    insights.push({
      type: 'success',
      title: 'Alertes rejetées',
      description: `${rejected.length} alerte${rejected.length > 1 ? 's' : ''} rejetée${rejected.length > 1 ? 's' : ''}`,
      count: rejected.length,
      items: rejected
    });
  }

  // Analyse temporelle
  if (
    lowerQuestion.includes('récent') ||
    lowerQuestion.includes('aujourd') ||
    lowerQuestion.includes('semaine')
  ) {
    const today = alerts.filter(a => a.daysAgo === 0);
    const thisWeek = alerts.filter(a => a.daysAgo <= 7);

    if (today.length > 0) {
      insights.push({
        type: 'info',
        title: 'Alertes du jour',
        description: `${today.length} alerte${today.length > 1 ? 's' : ''} reçue${today.length > 1 ? 's' : ''} aujourd'hui`,
        count: today.length,
        items: today
      });
    }

    if (thisWeek.length > today.length) {
      insights.push({
        type: 'info',
        title: 'Alertes de la semaine',
        description: `${thisWeek.length} alerte${thisWeek.length > 1 ? 's' : ''} reçue${thisWeek.length > 1 ? 's' : ''} cette semaine`,
        count: thisWeek.length,
        items: thisWeek
      });
    }
  }

  // Statistiques générales
  if (
    lowerQuestion.includes('tendance') ||
    lowerQuestion.includes('statistique') ||
    lowerQuestion.includes('résumé') ||
    lowerQuestion.includes('vue d\'ensemble')
  ) {
    const pending = alerts.filter(a => a.status === 'Pending');
    const confirmed = alerts.filter(a => a.status === 'Confirmed');
    const avgMatch = Math.round(alerts.reduce((sum, a) => sum + a.match, 0) / alerts.length);

    insights.push({
      type: 'info',
      title: 'Vue d\'ensemble',
      description: `${alerts.length} alerte${alerts.length > 1 ? 's' : ''} au total | ${pending.length} en attente | ${confirmed.length} confirmée${confirmed.length > 1 ? 's' : ''} | Match moyen: ${avgMatch}%`,
      count: alerts.length,
      items: alerts
    });
  }

  // Générer le résumé
  let summary = '';
  if (insights.length === 0) {
    summary = "Aucune alerte spécifique détectée pour votre question. Essayez de reformuler ou de poser une question plus précise.";
  } else {
    const urgentCount = insights.filter(i => i.type === 'urgent').length;
    const warningCount = insights.filter(i => i.type === 'warning').length;
    const totalItems = insights.reduce((sum, i) => sum + i.count, 0);
    
    if (urgentCount > 0) {
      summary = `${urgentCount} élément${urgentCount > 1 ? 's' : ''} urgent${urgentCount > 1 ? 's' : ''} détecté${urgentCount > 1 ? 's' : ''} concernant ${totalItems} alerte${totalItems > 1 ? 's' : ''}.`;
    } else if (warningCount > 0) {
      summary = `${warningCount} point${warningCount > 1 ? 's' : ''} d'attention identifié${warningCount > 1 ? 's' : ''} pour ${totalItems} alerte${totalItems > 1 ? 's' : ''}.`;
    } else {
      summary = `${insights.length} insight${insights.length > 1 ? 's' : ''} disponible${insights.length > 1 ? 's' : ''} pour ${totalItems} alerte${totalItems > 1 ? 's' : ''}.`;
    }
  }

  return {
    question,
    summary,
    insights: insights.slice(0, 5),
    timestamp: new Date()
  };
}
