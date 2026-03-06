import React, { useState } from 'react';
import { ModernMultiSelect } from './modern-multiselect';
import { Label } from './label';

/**
 * Composant de démonstration pour ModernMultiSelect
 * 
 * Fonctionnalités principales :
 * - Interface moderne avec animations fluides
 * - Recherche intégrée avec filtrage en temps réel
 * - Affichage des sélections en badges cliquables
 * - Actions rapides : "Tout sélectionner" / "Tout effacer"
 * - Compteur de sélections
 * - Support clavier et accessibilité
 * - Design cohérent avec le branding InvestHub
 */
export function ModernMultiSelectDemo() {
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['Segment Premium']);

  const funds = [
    'CARIN Capital I',
    'CARIN Capital II',
    'CARIN Capital III',
    'Collaboration I',
    'Edelweiss Croissance I',
    'Edelweiss Solutions',
    'Edelweiss Solutions II',
    'GAIA Energy Impact Fund II',
    'K2 Capital I',
    'K2 Capital II',
    'K2 Capital III',
    'K2 Capital IV',
    'Ternel Regenerative'
  ];

  const segments = [
    'Segment Premium',
    'Segment Gold',
    'Segment Silver',
    'Segment Bronze',
    'Investisseurs institutionnels',
    'Family Offices'
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl mb-2">ModernMultiSelect Component</h1>
          <p className="text-gray-600">
            Un composant multiselect moderne avec une UX premium pour InvestHub
          </p>
        </div>

        {/* Example 1: No selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg mb-4">Exemple 1 : Sans sélection</h2>
          <div>
            <Label className="text-sm mb-2 block">Fonds</Label>
            <ModernMultiSelect
              options={funds}
              value={selectedFunds}
              onChange={setSelectedFunds}
              placeholder="Sélectionner les fonds"
              searchPlaceholder="Rechercher un fonds..."
              maxDisplay={3}
            />
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <strong>Sélectionnés :</strong>{' '}
            {selectedFunds.length === 0 ? (
              <span className="text-gray-500">Aucun</span>
            ) : (
              selectedFunds.join(', ')
            )}
          </div>
        </div>

        {/* Example 2: With selection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg mb-4">Exemple 2 : Avec sélection</h2>
          <div>
            <Label className="text-sm mb-2 block">Segments d'investisseurs</Label>
            <ModernMultiSelect
              options={segments}
              value={selectedSegments}
              onChange={setSelectedSegments}
              placeholder="Sélectionner un ou plusieurs segments"
              searchPlaceholder="Rechercher un segment..."
              maxDisplay={2}
            />
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <strong>Sélectionnés :</strong>{' '}
            {selectedSegments.length === 0 ? (
              <span className="text-gray-500">Aucun</span>
            ) : (
              selectedSegments.join(', ')
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg mb-4">Fonctionnalités</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Recherche intégrée</strong> : Filtrez rapidement parmi les options disponibles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Badges interactifs</strong> : Cliquez sur X pour retirer une sélection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Actions rapides</strong> : "Tout sélectionner" et "Tout effacer" en un clic</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Compteur en temps réel</strong> : "X sur Y sélectionné(s)"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Animations fluides</strong> : Transitions douces avec Motion</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Indicateur visuel</strong> : Icône check avec gradient InvestHub</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Affichage intelligent</strong> : Badge "+X" pour les sélections excédentaires</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Click outside</strong> : Fermeture automatique au clic extérieur</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Auto-focus</strong> : Focus automatique sur la recherche à l'ouverture</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span><strong>Responsive</strong> : S'adapte à la largeur du conteneur</span>
            </li>
          </ul>
        </div>

        {/* Usage Example */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg mb-4">Exemple d'utilisation</h2>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`import { ModernMultiSelect } from './components/ui/modern-multiselect';

const [selectedValues, setSelectedValues] = useState<string[]>([]);

<ModernMultiSelect
  options={['Option 1', 'Option 2', 'Option 3']}
  value={selectedValues}
  onChange={setSelectedValues}
  placeholder="Sélectionner..."
  searchPlaceholder="Rechercher..."
  maxDisplay={3}
  disabled={false}
/>`}
          </pre>
        </div>
      </div>
    </div>
  );
}
