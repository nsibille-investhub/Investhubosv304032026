import { Alert } from './mockData';

// Helper pour générer des noms de personnes/entités variés
const generateAlertName = (index: number, entityName: string, status: string): string => {
  const firstNames = ['Vladimir', 'Sergei', 'Dmitry', 'Igor', 'Alexander', 'Alexei', 'Mikhail', 'Andrei'];
  const lastNames = ['Petrov', 'Ivanov', 'Sokolov', 'Volkov', 'Kozlov', 'Popov', 'Smirnov', 'Kuznetsov'];
  const companies = ['Investment Trust', 'Holdings Ltd', 'Capital Partners', 'Financial Group', 'Ventures Inc'];
  
  if (index % 2 === 0) {
    return `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`;
  } else {
    const baseName = entityName.split(' ')[0];
    return `${baseName} ${companies[index % companies.length]}`;
  }
};

// Templates de détails enrichis pour différents types d'alertes
const enrichedDetailsTemplates = [
  // Russie - Financial Services Warning
  {
    country: 'Russian Federation',
    warningsNote: 'Entity shows signs of an illegal credit provider.',
    biography: 'Activities involving the provision of loans, including microloans, without the appropriate registration or licence. Provision of professional services in the securities market without a licence. Activities of credit consumer cooperatives that violated the Federal Law of June 18, 2009 No. 190-FZ "On Credit Cooperation". Activities related to insurance and pension provision without the appropriate licence. Activities involving the provision of services for the collection of monetary funds and accounting of electricity supply points without the appropriate licence.',
    identification: "Taxpayer's identification number (INN): 9500018193\nMain state registration number (OGRN): 1159500008366\nClassifier of enterprises and organizations number (OKPO): 39663930",
    reports: 'To be determined.',
    names: ['LOMBARD OOO (PRIMARY)', 'ООО "ЛОМБАРД" (CYRILLIC SCRIPT)', 'LOMBARD LIMITED LIABILITY COMPANY (ENGLISH TRANSLATION)'],
    sources: ['RUCBR-IFMP - RUSSIAN FEDERATION CENTRAL BANK ILLEGAL FINANCIAL MARKET PARTICIPANTS'],
    links: [
      'ООО "ЛОМБАРД", проверка по ИНН 9500018193',
      'Russian Central Bank Warning List Entry #9500018193'
    ]
  },
  // Chine - US OFAC Cyber
  {
    country: 'China',
    warningsNote: 'Designated under U.S. cyber-related sanctions program.',
    biography: 'Entity designated by the U.S. Department of the Treasury\'s Office of Foreign Assets Control (OFAC) for engaging in malicious cyber-enabled activities. Activities include unauthorized access to computer systems, theft of intellectual property, and interference with critical infrastructure operations.',
    identification: 'Unified Social Credit Code: 91110000MA01234567\nBusiness Registration Number: 110000450123456\nTax Registration Number: 110123456789012',
    reports: 'OFAC designation effective January 2024. Multiple U.S. government agencies confirmed attribution.',
    names: ['BEIJING TECH SECURITY CO LTD (PRIMARY)', '北京科技安全有限公司 (CHINESE)', 'BEIJING KEJI ANQUAN YOUXIAN GONGSI (PINYIN)'],
    sources: ['US OFAC SDN - Cyber-Related Designations', 'US DEPARTMENT OF TREASURY - Cyber Sanctions'],
    links: [
      'OFAC Sanctions List Search - Beijing Tech Security',
      'Federal Register Notice - Cyber Sanctions Designation'
    ]
  },
  // Iran - EU UAV Sanctions
  {
    country: 'Iran',
    warningsNote: 'Sanctioned for involvement in unmanned aerial vehicle (UAV) proliferation.',
    biography: 'Iranian entity involved in the development, production, and proliferation of unmanned aerial vehicles (UAVs) that have been supplied to Russia for use in the war against Ukraine. The entity has been designated under EU restrictive measures targeting Iran\'s drone program.',
    identification: 'Iranian National ID: IR-98765432101\nCompany Registration: 1234567890123\nEconomic Code: 123456789012',
    reports: 'EU Council Decision (CFSP) 2023/2123. Entity identified as key supplier of Shahed-series drones.',
    names: ['TEHRAN AEROSPACE INDUSTRIES (PRIMARY)', 'صنایع هوافضای تهران (PERSIAN)', 'SANAYE HAVAFAZAYE TEHRAN (TRANSLITERATION)'],
    sources: ['EU SANCTIONS MAP - Iran UAV Program', 'COUNCIL REGULATION (EU) 2023/2123'],
    links: [
      'EU Official Journal - Iran Sanctions List',
      'Council Decision on Iran UAV Proliferation'
    ]
  },
  // Corée du Nord - UN Nuclear
  {
    country: 'Democratic People\'s Republic of Korea',
    warningsNote: 'UN Security Council designation for nuclear weapons program support.',
    biography: 'Entity designated by the United Nations Security Council for providing support to the Democratic People\'s Republic of Korea\'s (DPRK) nuclear weapons and ballistic missile programs. Involved in procurement of prohibited items and financial facilitation for sanctioned programs.',
    identification: 'DPRK Entity Code: KP-2024-001\nRegistration Number: DPRK-REG-789456\nUN Designation ID: KPe.070',
    reports: 'UN Security Council Resolutions 1718, 2087, 2094, 2270, 2321, 2356, 2371, 2375. Panel of Experts reports confirm violations.',
    names: ['PYONGYANG TRADING CORPORATION (PRIMARY)', '평양무역회사 (KOREAN)', 'Korea Ryonbong General Corporation (ALIAS)'],
    sources: ['UN SECURITY COUNCIL SANCTIONS LIST - DPRK', 'UNSCR 2371 DESIGNATION'],
    links: [
      'UN Security Council DPRK Sanctions Committee',
      'Panel of Experts Report S/2024/215'
    ]
  },
  // Venezuela - Corruption PEP
  {
    country: 'Venezuela',
    warningsNote: 'Politically exposed person (PEP) with corruption allegations.',
    biography: 'Former high-ranking Venezuelan government official with alleged involvement in corruption schemes related to state-owned enterprises. Multiple investigations by international authorities for money laundering and embezzlement of public funds. Subject of asset freezes and travel bans.',
    identification: 'Venezuelan ID (Cédula): V-12.345.678\nPassport Number: VE-AB1234567\nDate of Birth: March 15, 1965',
    reports: 'Subject of investigations by US DOJ, Swiss authorities, and INTERPOL. Red Notice issued. Estimated USD 50M in allegedly illicit assets frozen.',
    names: ['RODRIGUEZ MARTINEZ CARLOS ALBERTO (PRIMARY)', 'Carlos A. Rodriguez (ALIAS)', 'CAR Martinez (ABBREVIATION)'],
    sources: ['ADVERSE MEDIA - International Consortium of Investigative Journalists', 'US TREASURY OFAC SDN LIST', 'INTERPOL RED NOTICE'],
    links: [
      'ICIJ Paradise Papers - Rodriguez Martinez',
      'US DOJ Press Release - Venezuelan Corruption Case',
      'Swiss Federal Office of Justice - MLAT Request'
    ]
  },
  // Myanmar - Human Rights
  {
    country: 'Myanmar',
    warningsNote: 'Designated for serious human rights violations.',
    biography: 'Military officer designated for involvement in serious human rights violations and abuses in Myanmar, including arbitrary detention, torture, and violence against civilians. Subject to targeted sanctions by multiple jurisdictions including the US, UK, EU, and Canada.',
    identification: 'Myanmar Military ID: MM-MIL-567890\nNational ID: 12/DAGANA(N)123456\nRank: Senior General',
    reports: 'UN Fact-Finding Mission on Myanmar documented involvement in atrocities. Multiple jurisdictions imposed asset freezes and travel bans in 2021-2024.',
    names: ['MIN AUNG HLAING (PRIMARY)', 'မင်းအောင်လှိုင် (BURMESE)', 'Senior General Min Aung Hlaing (FULL TITLE)'],
    sources: ['US OFAC - Burma Sanctions', 'UK HMT - Myanmar Sanctions List', 'EU RESTRICTIVE MEASURES - Myanmar', 'CANADA SEMA - Myanmar'],
    links: [
      'UN Human Rights Council Report A/HRC/51/25',
      'OFAC Burma-Related Sanctions Designations',
      'UK Foreign Office Myanmar Sanctions'
    ]
  },
  // Syrie - Chemical Weapons
  {
    country: 'Syrian Arab Republic',
    warningsNote: 'Designated for involvement in chemical weapons program.',
    biography: 'Syrian government entity designated for support to the Syrian Scientific Studies and Research Center (SSRC), which is responsible for developing and producing non-conventional weapons, including chemical weapons. Subject to comprehensive sanctions by US, EU, and other international partners.',
    identification: 'Syrian Business Registration: SY-REG-456789\nTax ID: 123456789\nFacility Code: SSRC-SUB-12',
    reports: 'OPCW Investigation confirmed use of chemical weapons. Entity designated under multiple executive orders and EU regulations.',
    names: ['DAMASCUS RESEARCH CENTER (PRIMARY)', 'مركز دمشق للأبحاث (ARABIC)', 'Syrian Scientific Research Facility (ALIAS)'],
    sources: ['US OFAC - Syria Sanctions Program', 'EU COUNCIL REGULATION 36/2012', 'OPCW FACT-FINDING MISSION REPORTS'],
    links: [
      'OPCW Report on Chemical Weapons in Syria',
      'US State Department - Syria Sanctions',
      'EU Syria Sanctions Map'
    ]
  }
];

export function generateEnrichedAlert(index: number, entityName: string, status: string): Alert {
  const template = enrichedDetailsTemplates[index % enrichedDetailsTemplates.length];
  const name = generateAlertName(index, entityName, status);
  
  // Générer une similarité aléatoire
  const similarity = status === 'True Hit' 
    ? 90 + Math.floor(Math.random() * 10)
    : status === 'Pending'
    ? 75 + Math.floor(Math.random() * 20)
    : 70 + Math.floor(Math.random() * 25);
  
  // Déterminer la décision basée sur le statut
  let decision: 'true_hit' | 'false_hit' | 'unsure' | null = null;
  let comment = '';
  let analyst = '';
  let date = '2025-02-13';
  
  if (status === 'True Hit') {
    decision = 'true_hit';
    comment = 'Confirmed match after thorough review. Multiple data points align including identification numbers, business activities, and source verification.';
    analyst = 'Sophie Martin';
    date = '2025-01-28';
  } else if (status === 'Clear') {
    decision = index % 2 === 0 ? 'false_hit' : 'unsure';
    comment = decision === 'false_hit' 
      ? 'Name similarity only. Different entity confirmed through independent verification.'
      : 'Requires additional investigation before final determination.';
    analyst = 'Marc Dubois';
    date = '2025-02-05';
  }
  
  // Construire la description complète
  const fullDescription = `
${template.warningsNote ? `FINANCIAL SERVICES WARNINGS NOTE\n${template.warningsNote}\n\n` : ''}${template.biography ? `BIOGRAPHY\n${template.biography}\n\n` : ''}${template.identification ? `IDENTIFICATION\n${template.identification}\n\n` : ''}${template.reports ? `REPORTS\n${template.reports}\n\n` : ''}${template.names ? `Names\n${template.names.join('\n')}\n\n` : ''}${template.sources ? `Sources\n${template.sources.join('\n')}\n\n` : ''}${template.links ? `Links\n${template.links.join('\n')}` : ''}
  `.trim();
  
  return {
    id: `alert-${index + 1}`,
    name,
    similarity,
    decision,
    comment,
    date,
    analyst,
    enrichedDetails: {
      warningsNote: template.warningsNote,
      biography: template.biography,
      identification: template.identification,
      reports: template.reports,
      names: template.names,
      sources: template.sources,
      links: template.links,
      fullDescription
    },
    details: {
      keywords: generateKeywords(template.country),
      identification: generateIdentificationFields(template.identification || ''),
      sources: generateSourceLinks(template.sources || [])
    }
  };
}

function generateKeywords(country: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'Russian Federation': ['Russian Sectoral Sanctions', 'RSSFE-WC', 'Financial Services Warning'],
    'China': ['US OFAC', 'Cyber Sanctions', 'Technology Transfer'],
    'Iran': ['EU Sanctions', 'UAV Program', 'Proliferation'],
    'Democratic People\'s Republic of Korea': ['UN Sanctions', 'Nuclear Program', 'DPRK'],
    'Venezuela': ['PEP', 'Corruption', 'Adverse Media'],
    'Myanmar': ['Human Rights', 'Military', 'Targeted Sanctions'],
    'Syrian Arab Republic': ['Chemical Weapons', 'OPCW', 'SSRC']
  };
  
  return keywordMap[country] || ['Sanctions', 'Compliance Risk'];
}

function generateIdentificationFields(identification: string): Array<{ label: string; value: string }> {
  const lines = identification.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const parts = line.split(':');
    return {
      label: parts[0]?.trim() || 'ID',
      value: parts[1]?.trim() || 'N/A'
    };
  }).slice(0, 3); // Limiter à 3 pour ne pas surcharger
}

function generateSourceLinks(sources: string[]): Array<{ label: string; url: string }> {
  return sources.map(source => ({
    label: source,
    url: '#' // Placeholder URL
  }));
}
