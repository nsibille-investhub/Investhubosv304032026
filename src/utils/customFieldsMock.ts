/** Champs personnalisés de démonstration, partagés par le paramétrage et les fiches. */
export interface CustomField {
  id: string;
  nom: string;
  objet: string;
  nomChamp: string;
  type: string;
  visibleFO: boolean;
  obligatoireFO: boolean;
  obligatoireBO: boolean;
  cacheBO: boolean;
  rank: number;
}

export const mockCustomFields: CustomField[] = [
  {
    id: '5',
    nom: 'Forme juridique',
    objet: 'Investisseur',
    nomChamp: 'Forme juridique',
    type: 'text',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 0
  },
  {
    id: '7',
    nom: 'Statut fiscal',
    objet: 'Investisseur',
    nomChamp: 'Statut fiscal dans le pays de résidence',
    type: 'text',
    visibleFO: false,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 1
  },
  {
    id: '8',
    nom: 'Activité principale',
    objet: 'Investisseur',
    nomChamp: 'Activité principale',
    type: 'text',
    visibleFO: true,
    obligatoireFO: true,
    obligatoireBO: false,
    cacheBO: false,
    rank: 2
  },
  {
    id: '9',
    nom: 'Place of incorporation',
    objet: 'Investisseur',
    nomChamp: 'Place of incorporation',
    type: 'text',
    visibleFO: false,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 3
  },
  {
    id: '10',
    nom: 'Taxable year end',
    objet: 'Investisseur',
    nomChamp: 'Taxable year end',
    type: 'text',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 4
  },
  {
    id: '11',
    nom: 'Validé',
    objet: 'Investisseur',
    nomChamp: 'Validé',
    type: 'checkbox',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 5
  },
  {
    id: '20',
    nom: 'Code interne',
    objet: 'Fonds',
    nomChamp: 'Code interne du fonds',
    type: 'text',
    visibleFO: false,
    obligatoireFO: false,
    obligatoireBO: true,
    cacheBO: false,
    rank: 0
  },
  {
    id: '21',
    nom: 'Millésime',
    objet: 'Fonds',
    nomChamp: 'Millésime',
    type: 'number',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 1
  },
  {
    id: '22',
    nom: 'Label ISR',
    objet: 'Fonds',
    nomChamp: 'Label ISR obtenu',
    type: 'checkbox',
    visibleFO: true,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 2
  },
  {
    id: '23',
    nom: "Date d'agrément",
    objet: 'Fonds',
    nomChamp: "Date d'agrément AMF",
    type: 'date',
    visibleFO: false,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: false,
    rank: 3
  },
  {
    id: '24',
    nom: 'Note de gestion',
    objet: 'Fonds',
    nomChamp: 'Note de gestion interne',
    type: 'textarea',
    visibleFO: false,
    obligatoireFO: false,
    obligatoireBO: false,
    cacheBO: true,
    rank: 4
  }
];

export const objetOptions = [
  'Investisseur',
  'Souscription',
  'Document',
  'Partenaire',
  'Deal',
  'Contrepartie',
  'Fonds'
];
