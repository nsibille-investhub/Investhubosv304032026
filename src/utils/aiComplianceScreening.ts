import type { AlertItem } from './alertsGenerator';

export type AiProposal = 'ACCEPT' | 'REJECT' | 'UNSURE';

export interface AiScreeningAnalysis {
  alertId: string;
  proposal: AiProposal;
  proposedComment: string;
  confidence: number;
  rationale: string[];
  matchesUsed: Array<{
    name: string;
    listType: string;
    jurisdiction: string;
    date: string;
  }>;
  generatedAt: string;
}

const KNOWN_TRUE_POSITIVES: Record<
  string,
  Omit<AiScreeningAnalysis, 'alertId' | 'generatedAt'>
> = {
  'Lombard International Assurance': {
    proposal: 'ACCEPT',
    confidence: 0.95,
    proposedComment:
      "Vrai positif confirmé. LOMBARD INTERNATIONAL ASSURANCE SA (LUCAA LU ; FISE SE). Amende LU CAA EUR 1.682m (Mar 2024) et pénalités FISE (2018–2019). Nom légal exact, juridiction Luxembourg cohérente, pertinence maintenue (Jan 2025).",
    rationale: [
      'Correspondance exacte du nom légal (LIA SA, LOMBARD INTERNATIONAL ASSURANCE).',
      'Sanction administrative récente du Commissariat aux Assurances (CAA) au Luxembourg en mars 2024, EUR 1.682m, manquements LCB-FT.',
      'Sanctions antérieures de la FISE (Suède) 2018–2019 confirmées en cour d\'appel.',
      'Juridiction (LU) et numéro RCS (B37604) cohérents avec l\'entité criblée.',
      'LEI 549300TG736IJQBL4N81 référencé sur les listes officielles.',
    ],
    matchesUsed: [
      {
        name: 'LOMBARD INTERNATIONAL ASSURANCE SA',
        listType: 'Regulatory Enforcement',
        jurisdiction: 'LU',
        date: '2024-03-20',
      },
      {
        name: 'LIA SA',
        listType: 'Special Interest Categories',
        jurisdiction: 'SE',
        date: '2019-06-15',
      },
    ],
  },
  'Atlas Resources SA': {
    proposal: 'ACCEPT',
    confidence: 0.92,
    proposedComment:
      "Vrai positif. Atlas Resources SA mentionnée dans plusieurs rapports OFAC liés au contournement de sanctions sur le secteur des matières premières (oct. 2024). Identifiants juridiques concordants (RCS, LEI). Articles de presse négative croisés.",
    rationale: [
      'Concordance du nom légal et du numéro de registre commercial.',
      'Inscription récente (oct. 2024) sur la SDN List de l\'OFAC.',
      'Adverse media corroborée par Reuters et FT (3 articles distincts en 2024).',
      'Activité de trading sur matières premières cohérente avec le profil.',
    ],
    matchesUsed: [
      {
        name: 'ATLAS RESOURCES SA',
        listType: 'Sanctions',
        jurisdiction: 'US/OFAC',
        date: '2024-10-12',
      },
    ],
  },
  'Black Sea Shipping Co': {
    proposal: 'ACCEPT',
    confidence: 0.9,
    proposedComment:
      "Vrai positif. Black Sea Shipping Co listée par l'UE (règlement 833/2014) et OFAC dans le cadre des sanctions sectorielles transport maritime. IMO et juridiction concordants. Activité de fret cohérente.",
    rationale: [
      'Inscription explicite sur les listes UE et OFAC.',
      'Numéro IMO de la flotte correspondant.',
      'Adverse media multiple (Lloyd\'s List, TradeWinds) sur contournement.',
      'Dernière mise à jour récente (< 6 mois).',
    ],
    matchesUsed: [
      {
        name: 'BLACK SEA SHIPPING CO',
        listType: 'Sanctions',
        jurisdiction: 'EU/US',
        date: '2024-12-03',
      },
    ],
  },
  'Northstar Energy Trading': {
    proposal: 'ACCEPT',
    confidence: 0.88,
    proposedComment:
      "Vrai positif. Northstar Energy Trading sanctionnée par l'OFAC en 2024 pour contournement du price cap pétrolier. Adresse et dirigeants concordants. Liens documentés avec entités déjà sanctionnées.",
    rationale: [
      'Inscription OFAC SDN List, juin 2024.',
      'Adresse de siège social concordante.',
      'Liens capitalistiques avec une entité déjà sanctionnée (price cap).',
    ],
    matchesUsed: [
      {
        name: 'NORTHSTAR ENERGY TRADING',
        listType: 'Sanctions',
        jurisdiction: 'US/OFAC',
        date: '2024-06-18',
      },
    ],
  },
  'Vladimir Petrov': {
    proposal: 'UNSURE',
    confidence: 0.55,
    proposedComment:
      "Données contradictoires. Vladimir Petrov est un nom très commun (>2000 entrées sur les listes PPE/sanctions). Match de score moyen (68%), date de naissance non confirmée, juridiction non précisée. Revue manuelle requise pour vérifier l'identité (DOB, lieu de naissance, fonction).",
    rationale: [
      'Nom et patronyme très répandus en zone russophone.',
      'Pas de date de naissance ni de lieu sur l\'alerte source.',
      'Plusieurs profils PPE distincts portent ce nom.',
      'Score de match modéré (68%) — insuffisant pour conclure.',
    ],
    matchesUsed: [
      {
        name: 'PETROV, Vladimir',
        listType: 'PEP',
        jurisdiction: 'RU',
        date: '2025-01-15',
      },
    ],
  },
  'Sergei Ivanov': {
    proposal: 'UNSURE',
    confidence: 0.52,
    proposedComment:
      "Homonymie probable mais non démontrée. Sergei Ivanov correspond à plusieurs profils PEP en Russie. Sans DOB ni numéro de passeport, impossible de trancher. À escalader pour confirmation KYC complémentaire.",
    rationale: [
      'Patronyme parmi les plus fréquents en Russie.',
      'Aucune information KYC complémentaire fournie.',
      'Plusieurs entrées PEP corroborent une homonymie possible.',
    ],
    matchesUsed: [
      {
        name: 'IVANOV, Sergei',
        listType: 'PEP',
        jurisdiction: 'RU',
        date: '2024-11-02',
      },
    ],
  },
  'John Smith': {
    proposal: 'REJECT',
    confidence: 0.78,
    proposedComment:
      "Faux positif probable. John Smith est l'un des noms les plus communs au monde (>50 profils Watch List). Le score de match (79%) repose sur le nom seul, sans concordance DOB, nationalité ou juridiction. Aucune information KYC pointant vers le profil listé.",
    rationale: [
      'Nom extrêmement générique (>50 profils sur la liste).',
      'Aucun identifiant secondaire concordant (DOB, passeport).',
      'Profils listés couvrent des juridictions hétérogènes.',
      'Activité connue de l\'investisseur sans rapport.',
    ],
    matchesUsed: [
      {
        name: 'SMITH, John',
        listType: 'Watch List',
        jurisdiction: 'Multi',
        date: '2024-08-10',
      },
    ],
  },
  'Aïcha Diallo': {
    proposal: 'REJECT',
    confidence: 0.74,
    proposedComment:
      "Faux positif. Le profil PEP listé (Aïcha Diallo, ministre, Guinée) ne correspond pas à l'investisseur (résidence FR, fonction privée, DOB différente). Match sur nom uniquement.",
    rationale: [
      'DOB de l\'investisseur (1985) différente du profil PEP listé (1962).',
      'Juridiction de résidence (France) différente (Guinée).',
      'Fonction privée vs fonction publique listée.',
    ],
    matchesUsed: [
      {
        name: 'DIALLO, Aïcha',
        listType: 'PEP',
        jurisdiction: 'GN',
        date: '2024-04-22',
      },
    ],
  },
  'Eastbridge Trust': {
    proposal: 'REJECT',
    confidence: 0.7,
    proposedComment:
      "Faux positif probable. Eastbridge Trust (alerte) est une fiducie successorale familiale britannique. Le profil listé correspond à une entité offshore distincte au Belize. Pas de lien capitalistique identifié.",
    rationale: [
      'Juridiction différente (UK vs BZ).',
      'Forme juridique différente (trust familial vs offshore).',
      'Aucun bénéficiaire effectif commun.',
    ],
    matchesUsed: [
      {
        name: 'EASTBRIDGE TRUST',
        listType: 'PEP',
        jurisdiction: 'BZ',
        date: '2024-09-05',
      },
    ],
  },
  'Crescent Capital Trust': {
    proposal: 'REJECT',
    confidence: 0.72,
    proposedComment:
      "Faux positif. Crescent Capital Trust (US, registered investment vehicle) n'a aucun lien avec l'entité Crescent Capital sanctionnée en Iran. Juridictions, dirigeants et registres distincts.",
    rationale: [
      'Juridiction de l\'investisseur (US/SEC) cohérente.',
      'Entité sanctionnée homonyme basée en Iran, sans lien capitalistique.',
      'Registre SEC consulté, pas de pavillon de complaisance.',
    ],
    matchesUsed: [
      {
        name: 'CRESCENT CAPITAL TRUST',
        listType: 'Sanctions',
        jurisdiction: 'IR',
        date: '2023-11-30',
      },
    ],
  },
};

function buildGenericAccept(alert: AlertItem): Omit<
  AiScreeningAnalysis,
  'alertId' | 'generatedAt'
> {
  return {
    proposal: 'ACCEPT',
    confidence: 0.85 + (alert.match - 80) * 0.005,
    proposedComment: `Vrai positif. ${alert.entityName} apparaît avec un score de ${alert.match}% sur la liste ${alert.alertList}. Les éléments d'identification croisés (nom, juridiction, date) concordent avec le profil listé. Pertinence confirmée par la fraîcheur de la donnée.`,
    rationale: [
      `Score de match élevé (${alert.match}%) suggérant une correspondance forte.`,
      `Liste source : ${alert.alertList}.`,
      `Statut de la donnée : ${alert.changes ?? 'inchangé depuis dernière revue'}.`,
      'Identifiants secondaires (lorsque disponibles) concordants.',
    ],
    matchesUsed: [
      {
        name: alert.entityName.toUpperCase(),
        listType: alert.alertList,
        jurisdiction: 'Multi',
        date: alert.date,
      },
    ],
  };
}

function buildGenericReject(alert: AlertItem): Omit<
  AiScreeningAnalysis,
  'alertId' | 'generatedAt'
> {
  return {
    proposal: 'REJECT',
    confidence: 0.7 + (60 - alert.match) * 0.003,
    proposedComment: `Faux positif probable. Le match de ${alert.match}% sur "${alert.entityName}" repose sur des éléments génériques (nom commun, juridiction non précise). Aucun identifiant secondaire (DOB, registre, LEI) ne corrobore. Recommandation : rejeter et conserver le monitoring actif.`,
    rationale: [
      `Score de match faible/modéré (${alert.match}%).`,
      'Aucun identifiant secondaire concordant.',
      'Liste source à fort taux d\'homonymie.',
      'Pas d\'élément KYC additionnel pointant vers le profil listé.',
    ],
    matchesUsed: [
      {
        name: alert.entityName.toUpperCase(),
        listType: alert.alertList,
        jurisdiction: 'Multi',
        date: alert.date,
      },
    ],
  };
}

function buildGenericUnsure(alert: AlertItem): Omit<
  AiScreeningAnalysis,
  'alertId' | 'generatedAt'
> {
  return {
    proposal: 'UNSURE',
    confidence: 0.5 + Math.abs(alert.match - 70) * 0.002,
    proposedComment: `Données insuffisantes pour conclure. ${alert.entityName} présente un score de ${alert.match}% sur ${alert.alertList}, sans corroboration d'identifiant secondaire. Revue manuelle recommandée : compléter KYC (DOB, juridiction, registre) avant décision.`,
    rationale: [
      `Score de match intermédiaire (${alert.match}%).`,
      'Données KYC incomplètes côté investisseur.',
      'Indices contradictoires entre les listes croisées.',
      'Recommandation : escalade à l\'analyste senior.',
    ],
    matchesUsed: [
      {
        name: alert.entityName.toUpperCase(),
        listType: alert.alertList,
        jurisdiction: 'Multi',
        date: alert.date,
      },
    ],
  };
}

export function generateAiAnalysis(alert: AlertItem): AiScreeningAnalysis {
  const known = KNOWN_TRUE_POSITIVES[alert.entityName];
  if (known) {
    return {
      alertId: alert.id,
      generatedAt: new Date().toISOString(),
      ...known,
    };
  }

  const isSanctions =
    alert.alertList === 'Sanctions' || alert.alertList === 'Crime';
  const isFinancialWarning = alert.alertList === 'Financial Warning';
  const isPep = alert.alertList === 'PEP';
  const isWatchList = alert.alertList === 'Watch List';

  let base: Omit<AiScreeningAnalysis, 'alertId' | 'generatedAt'>;

  if (alert.match >= 85 && (isSanctions || isFinancialWarning)) {
    base = buildGenericAccept(alert);
  } else if (alert.match >= 80 && isPep && alert.attachedInvestors.length > 1) {
    base = buildGenericAccept(alert);
  } else if (alert.match <= 65 && (isWatchList || isPep)) {
    base = buildGenericReject(alert);
  } else if (alert.match <= 55) {
    base = buildGenericReject(alert);
  } else if (alert.match >= 70 && alert.match < 85) {
    base = buildGenericUnsure(alert);
  } else if (alert.previousFindings.length === 0 && alert.match < 75) {
    base = buildGenericReject(alert);
  } else {
    base = buildGenericUnsure(alert);
  }

  return {
    alertId: alert.id,
    generatedAt: new Date().toISOString(),
    proposal: base.proposal,
    proposedComment: base.proposedComment,
    confidence: Math.max(0.5, Math.min(0.98, base.confidence)),
    rationale: base.rationale,
    matchesUsed: base.matchesUsed,
  };
}

export function proposalToDecision(
  proposal: AiProposal,
): 'true_hit' | 'false_hit' | 'unsure' {
  switch (proposal) {
    case 'ACCEPT':
      return 'true_hit';
    case 'REJECT':
      return 'false_hit';
    case 'UNSURE':
      return 'unsure';
  }
}
