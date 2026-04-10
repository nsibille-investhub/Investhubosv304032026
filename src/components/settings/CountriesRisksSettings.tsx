import React, { useState, useRef, useMemo } from 'react';
import { Plus, Trash2, Edit2, X, AlertTriangle, Globe, Search, FileDown, FileUp, Users, Shield, HelpCircle, Info, XCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface Country {
  code: string;
  nom: string;
  risque: number;
}

interface RiskProfile {
  id: string;
  nom: string;
  type: string;
}

interface CountryList {
  id: string;
  nom: string;
  description: string;
  countries: Country[];
  createdAt: string;
  usedByProfiles: number; // Nombre de profils de risque qui utilisent cette matrice
  linkedProfiles?: RiskProfile[]; // Profils de risque qui utilisent cette matrice
}

// Liste exhaustive des pays
const allCountries: Country[] = [
  { code: 'AFG', nom: 'Afghanistan', risque: 11 },
  { code: 'ALB', nom: 'Albanie', risque: 11 },
  { code: 'ATA', nom: 'Antarctique', risque: 6 },
  { code: 'DZA', nom: 'Algérie', risque: 11 },
  { code: 'ASM', nom: 'Samoa Américaines', risque: 6 },
  { code: 'AND', nom: 'Andorre', risque: 6 },
  { code: 'AGO', nom: 'Angola', risque: 11 },
  { code: 'ATG', nom: 'Antigua-et-Barbuda', risque: 6 },
  { code: 'AZE', nom: 'Azerbaïdjan', risque: 11 },
  { code: 'ARG', nom: 'Argentine', risque: 6 },
  { code: 'AUS', nom: 'Australie', risque: 0 },
  { code: 'AUT', nom: 'Autriche', risque: 0 },
  { code: 'BHS', nom: 'Bahamas', risque: 11 },
  { code: 'BHR', nom: 'Bahreïn', risque: 6 },
  { code: 'BGD', nom: 'Bangladesh', risque: 11 },
  { code: 'ARM', nom: 'Arménie', risque: 11 },
  { code: 'BRB', nom: 'Barbade', risque: 11 },
  { code: 'BEL', nom: 'Belgique', risque: 0 },
  { code: 'BMU', nom: 'Bermudes', risque: 6 },
  { code: 'BTN', nom: 'Bhoutan', risque: 11 },
  { code: 'BOL', nom: 'Bolivie', risque: 11 },
  { code: 'BIH', nom: 'Bosnie-Herzégovine', risque: 11 },
  { code: 'BWA', nom: 'Botswana', risque: 11 },
  { code: 'BVT', nom: 'Île Bouvet', risque: 6 },
  { code: 'BRA', nom: 'Brésil', risque: 6 },
  { code: 'BLZ', nom: 'Belize', risque: 6 },
  { code: 'IOT', nom: 'Territoire Britannique de l\'Océan Indien', risque: 6 },
  { code: 'SLB', nom: 'Îles Salomon', risque: 11 },
  { code: 'VGB', nom: 'Îles Vierges Britanniques', risque: 6 },
  { code: 'BRN', nom: 'Brunéi Darussalam', risque: 6 },
  { code: 'BGR', nom: 'Bulgarie', risque: 6 },
  { code: 'MMR', nom: 'Myanmar', risque: 11 },
  { code: 'BDI', nom: 'Burundi', risque: 11 },
  { code: 'BLR', nom: 'Bélarus', risque: 11 },
  { code: 'KHM', nom: 'Cambodge', risque: 11 },
  { code: 'CMR', nom: 'Cameroun', risque: 11 },
  { code: 'CAN', nom: 'Canada', risque: 0 },
  { code: 'CPV', nom: 'Cap-vert', risque: 11 },
  { code: 'CYM', nom: 'Îles Caïmanes', risque: 11 },
  { code: 'CAF', nom: 'République Centrafricaine', risque: 11 },
  { code: 'LKA', nom: 'Sri Lanka', risque: 11 },
  { code: 'TCD', nom: 'Tchad', risque: 11 },
  { code: 'CHL', nom: 'Chili', risque: 6 },
  { code: 'CHN', nom: 'Chine', risque: 6 },
  { code: 'TWN', nom: 'Taïwan', risque: 11 },
  { code: 'CXR', nom: 'Île Christmas', risque: 6 },
  { code: 'CCK', nom: 'Îles Cocos (Keeling)', risque: 6 },
  { code: 'COL', nom: 'Colombie', risque: 6 },
  { code: 'COM', nom: 'Comores', risque: 11 },
  { code: 'MYT', nom: 'Mayotte', risque: 6 },
  { code: 'COG', nom: 'République du Congo', risque: 11 },
  { code: 'COD', nom: 'République Démocratique du Congo', risque: 11 },
  { code: 'COK', nom: 'Îles Cook', risque: 6 },
  { code: 'CRI', nom: 'Costa Rica', risque: 6 },
  { code: 'HRV', nom: 'Croatie', risque: 6 },
  { code: 'CUB', nom: 'Cuba', risque: 100 },
  { code: 'CYP', nom: 'Chypre', risque: 6 },
  { code: 'CZE', nom: 'République Tchèque', risque: 6 },
  { code: 'BEN', nom: 'Bénin', risque: 11 },
  { code: 'DNK', nom: 'Danemark', risque: 0 },
  { code: 'DMA', nom: 'Dominique', risque: 6 },
  { code: 'DOM', nom: 'République Dominicaine', risque: 11 },
  { code: 'ECU', nom: 'Équateur', risque: 11 },
  { code: 'SLV', nom: 'El Salvador', risque: 11 },
  { code: 'GNQ', nom: 'Guinée Équatoriale', risque: 11 },
  { code: 'ETH', nom: 'Éthiopie', risque: 11 },
  { code: 'ERI', nom: 'Érythrée', risque: 11 },
  { code: 'EST', nom: 'Estonie', risque: 6 },
  { code: 'FRO', nom: 'Îles Féroé', risque: 6 },
  { code: 'FLK', nom: 'Îles (malvinas) Falkland', risque: 6 },
  { code: 'SGS', nom: 'Géorgie du Sud et les Îles Sandwich du Sud', risque: 6 },
  { code: 'FJI', nom: 'Fidji', risque: 11 },
  { code: 'FIN', nom: 'Finlande', risque: 0 },
  { code: 'ALA', nom: 'Îles Åland', risque: 6 },
  { code: 'FRA', nom: 'France', risque: 0 },
  { code: 'GUF', nom: 'Guyane Française', risque: 6 },
  { code: 'PYF', nom: 'Polynésie Française', risque: 6 },
  { code: 'ATF', nom: 'Terres Australes Françaises', risque: 6 },
  { code: 'DJI', nom: 'Djibouti', risque: 11 },
  { code: 'GAB', nom: 'Gabon', risque: 11 },
  { code: 'GEO', nom: 'Géorgie', risque: 11 },
  { code: 'GMB', nom: 'Gambie', risque: 11 },
  { code: 'PSE', nom: 'Territoire Palestinien Occupé', risque: 11 },
  { code: 'DEU', nom: 'Allemagne', risque: 0 },
  { code: 'GHA', nom: 'Ghana', risque: 11 },
  { code: 'GIB', nom: 'Gibraltar', risque: 6 },
  { code: 'KIR', nom: 'Kiribati', risque: 11 },
  { code: 'GRC', nom: 'Grèce', risque: 6 },
  { code: 'GRL', nom: 'Groenland', risque: 6 },
  { code: 'GRD', nom: 'Grenade', risque: 6 },
  { code: 'GLP', nom: 'Guadeloupe', risque: 6 },
  { code: 'GUM', nom: 'Guam', risque: 6 },
  { code: 'GTM', nom: 'Guatemala', risque: 11 },
  { code: 'GIN', nom: 'Guinée', risque: 11 },
  { code: 'GUY', nom: 'Guyana', risque: 11 },
  { code: 'HTI', nom: 'Haïti', risque: 11 },
  { code: 'HMD', nom: 'Îles Heard et Mcdonald', risque: 6 },
  { code: 'VAT', nom: 'Saint-Siège (état de la Cité du Vatican)', risque: 11 },
  { code: 'HND', nom: 'Honduras', risque: 11 },
  { code: 'HKG', nom: 'Hong-Kong', risque: 0 },
  { code: 'HUN', nom: 'Hongrie', risque: 6 },
  { code: 'ISL', nom: 'Islande', risque: 6 },
  { code: 'IND', nom: 'Inde', risque: 6 },
  { code: 'IDN', nom: 'Indonésie', risque: 6 },
  { code: 'IRN', nom: 'République Islamique d\'Iran', risque: 100 },
  { code: 'IRQ', nom: 'Iraq', risque: 11 },
  { code: 'IRL', nom: 'Irlande', risque: 0 },
  { code: 'ISR', nom: 'Israël', risque: 6 },
  { code: 'ITA', nom: 'Italie', risque: 0 },
  { code: 'CIV', nom: 'Côte d\'Ivoire', risque: 11 },
  { code: 'JAM', nom: 'Jamaïque', risque: 11 },
  { code: 'JPN', nom: 'Japon', risque: 6 },
  { code: 'KAZ', nom: 'Kazakhstan', risque: 11 },
  { code: 'JOR', nom: 'Jordanie', risque: 11 },
  { code: 'KEN', nom: 'Kenya', risque: 11 },
  { code: 'PRK', nom: 'République Populaire Démocratique de Corée', risque: 100 },
  { code: 'KOR', nom: 'République de Corée', risque: 0 },
  { code: 'KWT', nom: 'Koweït', risque: 6 },
  { code: 'KGZ', nom: 'Kirghizistan', risque: 11 },
  { code: 'LAO', nom: 'République Démocratique Populaire Lao', risque: 11 },
  { code: 'LBN', nom: 'Liban', risque: 11 },
  { code: 'LSO', nom: 'Lesotho', risque: 11 },
  { code: 'LVA', nom: 'Lettonie', risque: 6 },
  { code: 'LBR', nom: 'Libéria', risque: 11 },
  { code: 'LBY', nom: 'Jamahiriya Arabe Libyenne', risque: 11 },
  { code: 'LIE', nom: 'Liechtenstein', risque: 0 },
  { code: 'LTU', nom: 'Lituanie', risque: 6 },
  { code: 'LUX', nom: 'Luxembourg', risque: 0 },
  { code: 'MAC', nom: 'Macao', risque: 6 },
  { code: 'MDG', nom: 'Madagascar', risque: 11 },
  { code: 'MWI', nom: 'Malawi', risque: 11 },
  { code: 'MYS', nom: 'Malaisie', risque: 6 },
  { code: 'MDV', nom: 'Maldives', risque: 11 },
  { code: 'MLI', nom: 'Mali', risque: 6 },
  { code: 'MLT', nom: 'Malte', risque: 6 },
  { code: 'MTQ', nom: 'Martinique', risque: 6 },
  { code: 'MRT', nom: 'Mauritanie', risque: 11 },
  { code: 'MUS', nom: 'Maurice', risque: 0 },
  { code: 'MEX', nom: 'Mexique', risque: 11 },
  { code: 'MCO', nom: 'Monaco', risque: 6 },
  { code: 'MNG', nom: 'Mongolie', risque: 11 },
  { code: 'MDA', nom: 'République de Moldova', risque: 11 },
  { code: 'MSR', nom: 'Montserrat', risque: 6 },
  { code: 'MAR', nom: 'Maroc', risque: 11 },
  { code: 'MOZ', nom: 'Mozambique', risque: 11 },
  { code: 'OMN', nom: 'Oman', risque: 6 },
  { code: 'NAM', nom: 'Namibie', risque: 11 },
  { code: 'NRU', nom: 'Nauru', risque: 11 },
  { code: 'NPL', nom: 'Népal', risque: 11 },
  { code: 'NLD', nom: 'Pays-Bas', risque: 0 },
  { code: 'ABW', nom: 'Aruba', risque: 6 },
  { code: 'NCL', nom: 'Nouvelle-Calédonie', risque: 0 },
  { code: 'VUT', nom: 'Vanuatu', risque: 11 },
  { code: 'NZL', nom: 'Nouvelle-Zélande', risque: 0 },
  { code: 'NIC', nom: 'Nicaragua', risque: 11 },
  { code: 'NER', nom: 'Niger', risque: 11 },
  { code: 'NGA', nom: 'Nigéria', risque: 11 },
  { code: 'NIU', nom: 'Niué', risque: 11 },
  { code: 'NFK', nom: 'Île Norfolk', risque: 6 },
  { code: 'NOR', nom: 'Norvège', risque: 0 },
  { code: 'MNP', nom: 'Îles Mariannes du Nord', risque: 6 },
  { code: 'UMI', nom: 'Îles Mineures Éloignées des États-Unis', risque: 6 },
  { code: 'FSM', nom: 'États Fédérés de Micronésie', risque: 11 },
  { code: 'MHL', nom: 'Îles Marshall', risque: 6 },
  { code: 'PLW', nom: 'Palaos', risque: 11 },
  { code: 'PAK', nom: 'Pakistan', risque: 11 },
  { code: 'PAN', nom: 'Panama', risque: 11 },
  { code: 'PNG', nom: 'Papouasie-Nouvelle-Guinée', risque: 11 },
  { code: 'PRY', nom: 'Paraguay', risque: 11 },
  { code: 'PER', nom: 'Pérou', risque: 11 },
  { code: 'PHL', nom: 'Philippines', risque: 11 },
  { code: 'PCN', nom: 'Pitcairn', risque: 6 },
  { code: 'POL', nom: 'Pologne', risque: 0 },
  { code: 'PRT', nom: 'Portugal', risque: 0 },
  { code: 'GNB', nom: 'Guinée-Bissau', risque: 11 },
  { code: 'TLS', nom: 'Timor-Leste', risque: 11 },
  { code: 'PRI', nom: 'Porto Rico', risque: 11 },
  { code: 'QAT', nom: 'Qatar', risque: 6 },
  { code: 'REU', nom: 'Réunion', risque: 0 },
  { code: 'ROU', nom: 'Roumanie', risque: 0 },
  { code: 'RUS', nom: 'Fédération de Russie', risque: 11 },
  { code: 'RWA', nom: 'Rwanda', risque: 11 },
  { code: 'SHN', nom: 'Sainte-Hélène', risque: 6 },
  { code: 'KNA', nom: 'Saint-Kitts-et-Nevis', risque: 6 },
  { code: 'AIA', nom: 'Anguilla', risque: 6 },
  { code: 'LCA', nom: 'Sainte-Lucie', risque: 6 },
  { code: 'SPM', nom: 'Saint-Pierre-et-Miquelon', risque: 6 },
  { code: 'VCT', nom: 'Saint-Vincent-et-les Grenadines', risque: 6 },
  { code: 'SMR', nom: 'Saint-Marin', risque: 6 },
  { code: 'STP', nom: 'Sao Tomé-et-Principe', risque: 11 },
  { code: 'SAU', nom: 'Arabie Saoudite', risque: 6 },
  { code: 'SEN', nom: 'Sénégal', risque: 11 },
  { code: 'SYC', nom: 'Seychelles', risque: 6 },
  { code: 'SLE', nom: 'Sierra Leone', risque: 11 },
  { code: 'SGP', nom: 'Singapour', risque: 0 },
  { code: 'SVK', nom: 'Slovaquie', risque: 0 },
  { code: 'VNM', nom: 'Viet Nam', risque: 11 },
  { code: 'SVN', nom: 'Slovénie', risque: 0 },
  { code: 'SOM', nom: 'Somalie', risque: 11 },
  { code: 'ZAF', nom: 'Afrique du Sud', risque: 6 },
  { code: 'ZWE', nom: 'Zimbabwe', risque: 11 },
  { code: 'ESP', nom: 'Espagne', risque: 0 },
  { code: 'ESH', nom: 'Sahara Occidental', risque: 6 },
  { code: 'SDN', nom: 'Soudan', risque: 11 },
  { code: 'SUR', nom: 'Suriname', risque: 11 },
  { code: 'SJM', nom: 'Svalbard etÎle Jan Mayen', risque: 6 },
  { code: 'SWZ', nom: 'Swaziland', risque: 11 },
  { code: 'SWE', nom: 'Suède', risque: 0 },
  { code: 'CHE', nom: 'Suisse', risque: 0 },
  { code: 'SYR', nom: 'République Arabe Syrienne', risque: 100 },
  { code: 'TJK', nom: 'Tadjikistan', risque: 11 },
  { code: 'THA', nom: 'Thaïlande', risque: 11 },
  { code: 'TGO', nom: 'Togo', risque: 11 },
  { code: 'TKL', nom: 'Tokelau', risque: 6 },
  { code: 'TON', nom: 'Tonga', risque: 11 },
  { code: 'TTO', nom: 'Trinité-et-Tobago', risque: 11 },
  { code: 'ARE', nom: 'Émirats Arabes Unis', risque: 6 },
  { code: 'TUN', nom: 'Tunisie', risque: 11 },
  { code: 'TUR', nom: 'Turquie', risque: 6 },
  { code: 'TKM', nom: 'Turkménistan', risque: 11 },
  { code: 'TCA', nom: 'Îles Turks et Caïques', risque: 6 },
  { code: 'TUV', nom: 'Tuvalu', risque: 11 },
  { code: 'UGA', nom: 'Ouganda', risque: 11 },
  { code: 'UKR', nom: 'Ukraine', risque: 11 },
  { code: 'MKD', nom: 'L\'ex-République Yougoslave de Macédoine', risque: 11 },
  { code: 'EGY', nom: 'Égypte', risque: 11 },
  { code: 'GBR', nom: 'Royaume-Uni', risque: 0 },
  { code: 'IMN', nom: 'Île de Man', risque: 6 },
  { code: 'TZA', nom: 'République-Unie de Tanzanie', risque: 11 },
  { code: 'USA', nom: 'États-Unis', risque: 0 },
  { code: 'VIR', nom: 'Îles Vierges des États-Unis', risque: 6 },
  { code: 'BFA', nom: 'Burkina Faso', risque: 11 },
  { code: 'URY', nom: 'Uruguay', risque: 6 },
  { code: 'UZB', nom: 'Ouzbékistan', risque: 11 },
  { code: 'VEN', nom: 'Venezuela', risque: 11 },
  { code: 'WLF', nom: 'Wallis et Futuna', risque: 6 },
  { code: 'WSM', nom: 'Samoa', risque: 11 },
  { code: 'YEM', nom: 'Yémen', risque: 11 },
  { code: 'ZMB', nom: 'Zambie', risque: 11 },
  { code: 'BQQ', nom: 'Bonaire, Saint Eustatius et Saba', risque: 6 },
  { code: 'GGG', nom: 'Guernesey', risque: 6 },
  { code: 'CWW', nom: 'Curaçao', risque: 6 },
  { code: 'JEE', nom: 'Jersey', risque: 6 },
  { code: 'MEE', nom: 'Montenegro', risque: 11 },
  { code: 'BLL', nom: 'Saint Barthélemy', risque: 6 },
  { code: 'MFF', nom: 'Saint Martin (partie française)', risque: 6 },
  { code: 'RSS', nom: 'Serbie', risque: 11 },
  { code: 'SXX', nom: 'Sint Maarten (partie néerlandaise)', risque: 6 },
  { code: 'SSS', nom: 'Soudan du sud', risque: 11 },
];

const mockCountryLists: CountryList[] = [
  {
    id: '1',
    nom: 'AML - Risque Pays',
    description: 'Matrice de risque Anti-Blanchiment standard',
    countries: allCountries,
    createdAt: '2024-01-15',
    usedByProfiles: 8,
    linkedProfiles: [
      { id: 'p1', nom: 'Profil Standard', type: 'Personne Physique' },
      { id: 'p2', nom: 'Profil Élevé - PEP', type: 'Personne Physique' },
      { id: 'p3', nom: 'Profil PME', type: 'Personne Morale' },
      { id: 'p4', nom: 'Profil Corporate Standard', type: 'Personne Morale' },
      { id: 'p5', nom: 'Profil Institutionnel', type: 'Personne Morale' },
      { id: 'p6', nom: 'Profil Trust & Fiducie', type: 'Structure Complexe' },
      { id: 'p7', nom: 'Profil Investisseur Qualifié', type: 'Personne Physique' },
      { id: 'p8', nom: 'Profil Fonds d\'investissement', type: 'Personne Morale' },
    ]
  },
  {
    id: '2',
    nom: 'FATF - Liste étendue',
    description: 'Matrice basée sur les recommandations FATF/GAFI',
    countries: allCountries.map(c => ({
      ...c,
      risque: c.risque === 0 ? 0 : c.risque === 100 ? 100 : c.risque + 2
    })),
    createdAt: '2024-02-22',
    usedByProfiles: 3,
    linkedProfiles: [
      { id: 'p9', nom: 'Profil High Net Worth', type: 'Personne Physique' },
      { id: 'p10', nom: 'Profil Banque Privée', type: 'Personne Morale' },
      { id: 'p11', nom: 'Profil Family Office', type: 'Structure Complexe' },
    ]
  },
  {
    id: '3',
    nom: 'OFAC Sanctions',
    description: 'Matrice de risque OFAC (Office of Foreign Assets Control)',
    countries: allCountries.map(c => {
      if (['CUB', 'IRN', 'PRK', 'SYR'].includes(c.code)) return { ...c, risque: 100 };
      if (['RUS', 'VEN', 'MMR'].includes(c.code)) return { ...c, risque: 50 };
      return c;
    }),
    createdAt: '2024-03-10',
    usedByProfiles: 5,
    linkedProfiles: [
      { id: 'p12', nom: 'Profil US Person', type: 'Personne Physique' },
      { id: 'p13', nom: 'Profil Société US', type: 'Personne Morale' },
      { id: 'p14', nom: 'Profil Compliance Renforcée', type: 'Personne Morale' },
      { id: 'p15', nom: 'Profil Trading International', type: 'Personne Morale' },
      { id: 'p16', nom: 'Profil Export/Import', type: 'Personne Morale' },
    ]
  },
  {
    id: '4',
    nom: 'UE - Pays à Haut Risque',
    description: 'Liste des pays à haut risque selon l\'Union Européenne',
    countries: allCountries.map(c => ({
      ...c,
      risque: ['AFG', 'PRK', 'IRN', 'PAK', 'SYR', 'YEM', 'UGA'].includes(c.code) ? 100 : c.risque
    })),
    createdAt: '2024-01-28',
    usedByProfiles: 12,
    linkedProfiles: [
      { id: 'p17', nom: 'Profil Résident UE', type: 'Personne Physique' },
      { id: 'p18', nom: 'Profil Non-Résident UE', type: 'Personne Physique' },
      { id: 'p19', nom: 'Profil Société UE', type: 'Personne Morale' },
      { id: 'p20', nom: 'Profil Société Non-UE', type: 'Personne Morale' },
      { id: 'p21', nom: 'Profil OPCVM', type: 'Personne Morale' },
      { id: 'p22', nom: 'Profil FIA', type: 'Personne Morale' },
      { id: 'p23', nom: 'Profil Holding', type: 'Structure Complexe' },
      { id: 'p24', nom: 'Profil SPV', type: 'Structure Complexe' },
      { id: 'p25', nom: 'Profil Asset Management', type: 'Personne Morale' },
      { id: 'p26', nom: 'Profil Private Equity', type: 'Personne Morale' },
      { id: 'p27', nom: 'Profil Venture Capital', type: 'Personne Morale' },
      { id: 'p28', nom: 'Profil Real Estate Fund', type: 'Personne Morale' },
    ]
  },
  {
    id: '5',
    nom: 'Matrice Personnalisée - Fonds Émergents',
    description: 'Matrice ajustée pour investissements dans les marchés émergents',
    countries: allCountries.map(c => ({
      ...c,
      risque: ['BRA', 'IND', 'CHN', 'ZAF'].includes(c.code) ? Math.max(0, c.risque - 3) : c.risque
    })),
    createdAt: '2024-04-05',
    usedByProfiles: 0,
    linkedProfiles: []
  },
];

const getRiskColor = (risque: number): string => {
  if (risque === 0) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
  if (risque <= 6) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  if (risque <= 11) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
  if (risque < 100) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
  return 'bg-red-900 text-white dark:bg-red-950 dark:text-red-200 border-red-900 dark:border-red-800';
};

interface CountryListPanelProps {
  countryList?: CountryList;
  isOpen: boolean;
  onClose: () => void;
  onSave: (countryList: Omit<CountryList, 'id'>) => void;
}

const CountryListPanel: React.FC<CountryListPanelProps> = ({ countryList, isOpen, onClose, onSave }) => {
  const [nom, setNom] = useState(countryList?.nom || '');
  const [description, setDescription] = useState(countryList?.description || '');
  const [countries, setCountries] = useState<Country[]>(countryList?.countries || []);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (countryList) {
      setNom(countryList.nom);
      setDescription(countryList.description);
      setCountries(countryList.countries);
    } else {
      setNom('');
      setDescription('');
      setCountries([...allCountries]);
    }
    setSearchQuery('');
  }, [countryList, isOpen]);

  const handleSave = () => {
    if (!nom.trim()) return;
    
    onSave({
      nom,
      description,
      countries,
      createdAt: countryList?.createdAt || new Date().toISOString().split('T')[0],
      usedByProfiles: countryList?.usedByProfiles || 0
    });
    onClose();
  };

  const handleRiskChange = (code: string, newRisk: number) => {
    setCountries(countries.map(c => 
      c.code === code ? { ...c, risque: newRisk } : c
    ));
  };

  const filteredCountries = countries.filter(country =>
    country.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.risque.toString().includes(searchQuery)
  );

  const handleExportCSV = () => {
    const csvContent = [
      'Code,Nom,Risque',
      ...countries.map(c => `${c.code},"${c.nom}",${c.risque}`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nom || 'liste_pays'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header
      const dataLines = lines.slice(1);
      
      const importedCountries: Country[] = dataLines.map(line => {
        const match = line.match(/^([^,]+),"([^"]+)",(\d+)$/);
        if (match) {
          return {
            code: match[1].trim(),
            nom: match[2].trim(),
            risque: parseInt(match[3].trim(), 10)
          };
        }
        return null;
      }).filter((c): c is Country => c !== null);

      if (importedCountries.length > 0) {
        setCountries(importedCountries);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: 520 }}
          animate={{ x: 0 }}
          exit={{ x: 520 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 h-full w-[520px] bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col shadow-xl"
        >
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm text-gray-900 dark:text-gray-100">
                  {countryList ? 'Modifier une liste' : 'Ajouter une liste'}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Configuration de la liste pays/risques
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Basic Information */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Label className="text-xs text-gray-700 dark:text-gray-300">
                      Nom<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">Nom de la matrice de risque. Choisissez un nom explicite (ex: "AML - Risque Pays", "FATF - Liste étendue")</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="AML - Risque Pays"
                    className="h-9 text-sm"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1.5">
                    <Label className="text-xs text-gray-700 dark:text-gray-300">
                      Description
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <HelpCircle className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-xs">Description détaillée de la matrice (ex: "Matrice de risque Anti-Blanchiment standard", "Basée sur les recommandations FATF/GAFI")</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Matrice de risque Anti-Blanchiment standard"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Countries List */}
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs text-gray-700 dark:text-gray-300">Liste des pays ({countries.length})</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">Attribuez un niveau de risque de 0 à 100 pour chaque pays. 0 = Faible, 6 = Moyen, 11 = Élevé, 100 = Critique</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                      >
                        <FileUp className="w-3 h-3" />
                        Importer CSV
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 px-2 py-1 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded transition-colors"
                      >
                        <FileDown className="w-3 h-3" />
                        Exporter CSV
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-3.5 h-3.5" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un pays, code ou risque..."
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[400px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="text-left p-2 text-gray-600 dark:text-gray-400 w-16">Code</th>
                        <th className="text-left p-2 text-gray-600 dark:text-gray-400">Nom</th>
                        <th className="text-left p-2 text-gray-600 dark:text-gray-400 w-24">Risque</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCountries.map((country) => (
                        <tr key={country.code} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                          <td className="p-2">
                            <span className="font-mono text-gray-600 dark:text-gray-400">{country.code}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-gray-900 dark:text-gray-100">{country.nom}</span>
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={country.risque}
                              onChange={(e) => handleRiskChange(country.code, parseInt(e.target.value, 10) || 0)}
                              className="h-7 text-xs w-20 text-center font-mono"
                              min="0"
                              max="100"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredCountries.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-xs">
                    Aucun pays trouvé
                  </div>
                )}
              </div>

              {/* Risk Legend */}
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <h4 className="text-xs text-gray-700 dark:text-gray-300 mb-2">Légende des risques</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${getRiskColor(0)} text-xs`}>0 - Faible</Badge>
                  <Badge className={`${getRiskColor(6)} text-xs`}>6 - Moyen</Badge>
                  <Badge className={`${getRiskColor(11)} text-xs`}>11 - Élevé</Badge>
                  <Badge className={`${getRiskColor(100)} text-xs`}>100 - Critique</Badge>
                </div>
              </div>

              {/* Profils de risque liés - Only show when editing */}
              {countryList && countryList.linkedProfiles && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <Label className="text-xs text-gray-700 dark:text-gray-300">
                      Profils de risque liés ({countryList.linkedProfiles.length})
                    </Label>
                  </div>
                  {countryList.linkedProfiles.length > 0 ? (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {countryList.linkedProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className="p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="text-xs text-gray-900 dark:text-gray-100">{profile.nom}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic p-2 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
                      Aucun profil lié
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Sticky Buttons */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-9 text-sm"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                  color: 'white'
                }}
                className="flex-1 h-9 text-sm"
                disabled={!nom.trim()}
              >
                {countryList ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function CountriesRisksSettingsContent() {
  const [countryLists, setCountryLists] = useState(mockCountryLists);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingCountryList, setEditingCountryList] = useState<CountryList | undefined>();
  const [deletingCountryList, setDeletingCountryList] = useState<CountryList | undefined>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [substituteMatrixId, setSubstituteMatrixId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  // Filtered and searched lists
  const filteredLists = useMemo(() => {
    if (!searchTerm.trim()) return countryLists;
    
    const search = searchTerm.toLowerCase();
    return countryLists.filter(list => 
      list.nom.toLowerCase().includes(search) ||
      list.description.toLowerCase().includes(search)
    );
  }, [countryLists, searchTerm]);

  const handleAdd = () => {
    setEditingCountryList(undefined);
    setIsPanelOpen(true);
  };

  const handleEdit = (countryList: CountryList) => {
    setEditingCountryList(countryList);
    setIsPanelOpen(true);
  };

  const handleSave = (countryListData: Omit<CountryList, 'id'>) => {
    if (editingCountryList) {
      setCountryLists(countryLists.map(countryList => 
        countryList.id === editingCountryList.id 
          ? { ...countryList, ...countryListData }
          : countryList
      ));
    } else {
      const newCountryList: CountryList = {
        id: Date.now().toString(),
        ...countryListData,
      };
      setCountryLists([...countryLists, newCountryList]);
    }
    setIsPanelOpen(false);
    setEditingCountryList(undefined);
  };

  const handleDelete = (id: string) => {
    const countryList = countryLists.find(cl => cl.id === id);
    if (countryList) {
      setDeletingCountryList(countryList);
      setSubstituteMatrixId('');
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (deletingCountryList) {
      // Si des profils utilisent cette matrice et qu'une substitution est définie
      if (deletingCountryList.usedByProfiles > 0 && substituteMatrixId) {
        // On simule la substitution (dans un vrai système, on mettrait à jour les profils de risque)
        console.log(`Substitution de la matrice ${deletingCountryList.id} par ${substituteMatrixId} pour ${deletingCountryList.usedByProfiles} profils`);
      }
      
      setCountryLists(countryLists.filter(cl => cl.id !== deletingCountryList.id));
      setIsDeleteDialogOpen(false);
      setDeletingCountryList(undefined);
      setSubstituteMatrixId('');
    }
  };

  const canDelete = !deletingCountryList || deletingCountryList.usedByProfiles === 0 || (deletingCountryList.usedByProfiles > 0 && substituteMatrixId);

  return (
    <div className="flex h-full bg-white dark:bg-black">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) {
          setDeletingCountryList(undefined);
          setSubstituteMatrixId('');
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <AlertDialogTitle className="text-left mb-1">
                  Supprimer la liste pays/risques ?
                </AlertDialogTitle>
              </div>
            </div>
            <AlertDialogDescription className="text-left space-y-4">
              {deletingCountryList && (
                <>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium dark:text-gray-100">{deletingCountryList.nom}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {deletingCountryList.countries.length} pays configurés • {deletingCountryList.usedByProfiles} profil{deletingCountryList.usedByProfiles > 1 ? 's' : ''} de risque
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {deletingCountryList.usedByProfiles > 0 ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-orange-800 dark:text-orange-300">
                            <strong>{deletingCountryList.usedByProfiles} profil{deletingCountryList.usedByProfiles > 1 ? 's' : ''} de risque</strong> utilise{deletingCountryList.usedByProfiles > 1 ? 'nt' : ''} cette matrice. 
                            Vous devez sélectionner une matrice de substitution avant de pouvoir supprimer.
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Matrice de substitution<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Select value={substituteMatrixId} onValueChange={setSubstituteMatrixId}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Sélectionner une matrice..." />
                          </SelectTrigger>
                          <SelectContent>
                            {countryLists
                              .filter(cl => cl.id !== deletingCountryList.id)
                              .map(cl => (
                                <SelectItem key={cl.id} value={cl.id} className="text-sm">
                                  {cl.nom}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Les {deletingCountryList.usedByProfiles} profils seront automatiquement basculés sur cette matrice
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Cette matrice n'est utilisée par aucun profil de risque. Vous pouvez la supprimer sans risque.
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cette action est <strong>irréversible</strong>. Êtes-vous sûr de vouloir continuer ?
                      </p>
                    </div>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingCountryList(undefined);
                setSubstituteMatrixId('');
              }}
              className="h-9"
            >
              Annuler
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={!canDelete}
              className="bg-red-600 hover:bg-red-700 text-white h-9 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Supprimer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <motion.div 
        animate={{ 
          width: isPanelOpen ? 'calc(100% - 520px)' : '100%' 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 overflow-auto"
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1 dark:text-gray-100">Gestion des pays/risques</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{countryLists.length} matrice{countryLists.length > 1 ? 's' : ''} de risque</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowGuide(!showGuide)}
                variant={showGuide ? "default" : "outline"}
                className="h-9"
                style={showGuide ? {
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: 'white'
                } : {}}
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                {showGuide ? 'Guidage activé' : 'Aide'}
              </Button>
              <Button
                onClick={handleAdd}
                style={{
                  background: 'linear-gradient(62.32deg, #000000 10.53%, #0F323D 88.82%)',
                  color: 'white'
                }}
                className="h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une matrice
              </Button>
            </div>
          </div>

          {/* Guide Section */}
          {showGuide && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Gestion des matrices de risque pays
                    </h3>
                    <button
                      onClick={() => setShowGuide(false)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Les matrices de risque pays vous permettent de configurer des niveaux de risque pour chaque pays. 
                    Chaque matrice peut être associée à un ou plusieurs profils de risque.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5"></div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Créer une matrice :</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">Définissez les niveaux de risque (0-100) pour chaque pays</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5"></div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Importer/Exporter :</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">Utilisez le format CSV pour gérer vos matrices en masse</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5"></div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Profils liés :</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">Le badge violet indique le nombre de profils utilisant cette matrice</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 mt-1.5"></div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">Suppression :</span>
                        <span className="text-gray-600 dark:text-gray-400 ml-1">Une matrice utilisée nécessite une substitution avant suppression</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Search Bar intégrée */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom..."
                  className="pl-9 h-10 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400">Nom</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400">Description</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-center p-3 text-xs text-gray-500 dark:text-gray-400">Profils de risque liés</th>
                    <th className="text-right p-3 text-xs text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLists.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm ? 'Aucun résultat trouvé' : 'Aucune liste de pays/risques'}
                      </td>
                    </tr>
                  ) : (
                    filteredLists.map((countryList) => (
                      <tr
                        key={countryList.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <td className="p-3">
                          <span className="text-sm dark:text-gray-100">{countryList.nom}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{countryList.description}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {new Date(countryList.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {countryList.usedByProfiles > 0 ? (
                            <Badge 
                              className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800 inline-flex items-center gap-1 px-2 py-0.5 text-xs"
                            >
                              <Shield className="w-3 h-3" />
                              {countryList.usedByProfiles}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleEdit(countryList)}
                              className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(countryList.id)}
                              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panel */}
      <CountryListPanel
        countryList={editingCountryList}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setEditingCountryList(undefined);
        }}
        onSave={handleSave}
      />
    </div>
  );
}

export function CountriesRisksSettings() {
  return <CountriesRisksSettingsContent />;
}
