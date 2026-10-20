/**
 * Adresses de démonstration réalistes : vraie ville, vrai code postal, rue existante, pays correspondant.
 * L'État n'est renseigné que pour les pays qui en ont un dans l'adresse postale (États-Unis).
 */
export interface LocationFixture {
  city: string;
  postalCode: string;
  streets: string[];
  country: string;
  state?: string;
}

export const LOCATIONS: LocationFixture[] = [
  { city: 'Paris', postalCode: '75008', country: 'France', streets: ['Boulevard Haussmann', 'Avenue Montaigne', 'Rue du Faubourg Saint-Honoré'] },
  { city: 'Paris', postalCode: '75016', country: 'France', streets: ['Avenue Victor Hugo', 'Avenue Kléber', 'Rue de la Pompe'] },
  { city: 'Lyon', postalCode: '69002', country: 'France', streets: ['Rue de la République', 'Quai Saint-Antoine', 'Rue Édouard Herriot'] },
  { city: 'Marseille', postalCode: '13008', country: 'France', streets: ['Avenue du Prado', 'Boulevard Périer', 'Rue Paradis'] },
  { city: 'Bordeaux', postalCode: '33000', country: 'France', streets: ['Cours de l\'Intendance', 'Allées de Tourny', 'Rue Sainte-Catherine'] },
  { city: 'Toulouse', postalCode: '31000', country: 'France', streets: ['Rue d\'Alsace-Lorraine', 'Allées Jean Jaurès', 'Rue de Metz'] },
  { city: 'Nantes', postalCode: '44000', country: 'France', streets: ['Cours des Cinquante-Otages', 'Rue Crébillon', 'Quai de la Fosse'] },
  { city: 'Lille', postalCode: '59000', country: 'France', streets: ['Rue Nationale', 'Boulevard de la Liberté', 'Rue Esquermoise'] },
  { city: 'Nice', postalCode: '06000', country: 'France', streets: ['Promenade des Anglais', 'Avenue Jean Médecin', 'Boulevard Victor Hugo'] },
  { city: 'Luxembourg', postalCode: 'L-2449', country: 'Luxembourg', streets: ['Boulevard Royal', 'Avenue de la Liberté', 'Rue Aldringen'] },
  { city: 'Genève', postalCode: '1204', country: 'Suisse', streets: ['Rue du Rhône', 'Quai du Mont-Blanc', 'Rue de la Corraterie'] },
  { city: 'Zurich', postalCode: '8001', country: 'Suisse', streets: ['Bahnhofstrasse', 'Talstrasse', 'Paradeplatz'] },
  { city: 'Lausanne', postalCode: '1003', country: 'Suisse', streets: ['Avenue de la Gare', 'Rue du Grand-Chêne', 'Place Saint-François'] },
  { city: 'Bruxelles', postalCode: '1000', country: 'Belgique', streets: ['Avenue Louise', 'Boulevard Anspach', 'Rue Royale'] },
  { city: 'Anvers', postalCode: '2000', country: 'Belgique', streets: ['Meir', 'Frankrijklei', 'Leopoldstraat'] },
  { city: 'Monaco', postalCode: '98000', country: 'Monaco', streets: ['Boulevard des Moulins', 'Avenue Princesse Grace', 'Boulevard Princesse Charlotte'] },
  { city: 'Londres', postalCode: 'W1K 1AA', country: 'Royaume-Uni', streets: ['Park Lane', 'Mount Street', 'Berkeley Square'] },
  { city: 'Francfort', postalCode: '60311', country: 'Allemagne', streets: ['Neue Mainzer Straße', 'Taunusanlage', 'Goethestraße'] },
  { city: 'Munich', postalCode: '80331', country: 'Allemagne', streets: ['Maximilianstraße', 'Theatinerstraße', 'Brienner Straße'] },
  { city: 'Amsterdam', postalCode: '1017', country: 'Pays-Bas', streets: ['Herengracht', 'Keizersgracht', 'Vijzelstraat'] },
  { city: 'New York', postalCode: '10022', country: 'États-Unis', state: 'New York', streets: ['Park Avenue', 'Madison Avenue', 'Fifth Avenue'] },
  { city: 'Boston', postalCode: '02116', country: 'États-Unis', state: 'Massachusetts', streets: ['Boylston Street', 'Newbury Street', 'Clarendon Street'] },
  { city: 'San Francisco', postalCode: '94111', country: 'États-Unis', state: 'Californie', streets: ['California Street', 'Montgomery Street', 'Battery Street'] },
  { city: 'Chicago', postalCode: '60606', country: 'États-Unis', state: 'Illinois', streets: ['South Wacker Drive', 'West Monroe Street', 'North LaSalle Street'] },
  { city: 'Miami', postalCode: '33131', country: 'États-Unis', state: 'Floride', streets: ['Brickell Avenue', 'Biscayne Boulevard', 'South Miami Avenue'] },
  { city: 'Greenwich', postalCode: '06830', country: 'États-Unis', state: 'Connecticut', streets: ['Greenwich Avenue', 'Steamboat Road', 'Field Point Road'] },
];

export const COUNTRIES = Array.from(new Set(LOCATIONS.map(location => location.country)));

/** Clé de traduction du libellé d'un pays (investors.detail.countryOptions.*). */
export const COUNTRY_LABEL_KEY: Record<string, string> = {
  France: 'France',
  Belgique: 'Belgium',
  Suisse: 'Switzerland',
  Luxembourg: 'Luxembourg',
  Allemagne: 'Germany',
  'Royaume-Uni': 'UnitedKingdom',
  Monaco: 'Monaco',
  'Pays-Bas': 'Netherlands',
  'États-Unis': 'UnitedStates',
};

export function randomLocation(): LocationFixture {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
}

/** Numéro et rue réalistes pour une adresse donnée. */
export function randomStreetAddress(location: LocationFixture): string {
  const street = location.streets[Math.floor(Math.random() * location.streets.length)];
  const number = Math.floor(Math.random() * 120) + 1;
  // Usage anglo-saxon : le numéro précède la rue ; usage germanique et néerlandais : il la suit.
  if (['Allemagne', 'Pays-Bas', 'Suisse', 'Belgique'].includes(location.country) && !/^(Rue|Avenue|Quai|Place|Boulevard)/.test(street)) {
    return `${street} ${number}`;
  }
  return `${number} ${street}`;
}
