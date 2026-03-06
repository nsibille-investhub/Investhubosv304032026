import { useState, useEffect } from 'react';
import { Search, Building2, Users, Briefcase, Tag as TagIcon, TrendingUp, X, Target, Handshake } from 'lucide-react';
import { ModernMultiSelect, MultiSelectOption } from './ui/modern-multiselect';
import { SegmentMultiSelect, SegmentOption } from './ui/segment-multiselect';

interface InvestorFilterBarProps {
  onFilterChange: (filters: any) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchValue?: string;
  resetTrigger?: number; // Nouveau prop pour déclencher un reset
  allData?: any[]; // Toutes les données pour extraire les options
}

// Segments CRM avec couleurs stylées - PROFESSIONNEL SANS EMOJIS
const SEGMENTS: SegmentOption[] = [
  { value: 'HNWI', label: 'HNWI', color: '#3B82F6', bgColor: '#EFF6FF' },
  { value: 'UHNWI', label: 'UHNWI', color: '#F97316', bgColor: '#FFF7ED' },
  { value: 'Retail', label: 'Retail', color: '#EC4899', bgColor: '#FDF2F8' },
  { value: 'Professional', label: 'Professional', color: '#6B7280', bgColor: '#F3F4F6' },
  { value: 'Institutional', label: 'Institutional', color: '#6B7280', bgColor: '#F9FAFB' },
];

// Gestionnaires/Analysts
const ANALYSTS = [
  'Thomas',
  'Sophie Martin',
  'Marc Dubois',
  'Claire Bernard',
  'Alex Chen',
  'Julie Rousseau',
  'Pierre Lefèvre',
  'Nathalie Moreau'
];

// Partenaires avec icônes Lucide
const PARTNERS_OPTIONS: MultiSelectOption[] = [
  { value: 'Direct', label: 'Direct', icon: Target },
  { value: 'Patrimoine Conseil & Associés', label: 'Patrimoine Conseil & Associés', icon: Handshake },
  { value: 'CGP Excellence Partners', label: 'CGP Excellence Partners', icon: Handshake },
  { value: 'Quintessence Gestion Privée', label: 'Quintessence Gestion Privée', icon: Handshake },
  { value: 'Althéa Patrimoine', label: 'Althéa Patrimoine', icon: Handshake },
  { value: 'Primonial CGP Network', label: 'Primonial CGP Network', icon: Handshake },
  { value: 'Groupe Amplitude Patrimoine', label: 'Groupe Amplitude Patrimoine', icon: Handshake },
  { value: 'Masséna Wealth Management', label: 'Masséna Wealth Management', icon: Handshake },
  { value: 'Fidelis Gestion Privée', label: 'Fidelis Gestion Privée', icon: Handshake },
  { value: 'Apollon Conseil Patrimoine', label: 'Apollon Conseil Patrimoine', icon: Handshake },
  { value: 'Stratégis Family Office', label: 'Stratégis Family Office', icon: Handshake }
];

// Types avec icônes
const TYPES = [
  { value: 'Individual', label: 'Individual', icon: '👤' },
  { value: 'Company', label: 'Company', icon: '🏢' }
];

// Fonds
const FUNDS = [
  'InvestHub Growth Fund I',
  'InvestHub Value Fund',
  'European Real Estate Fund',
  'Tech Innovation Fund II',
  'Global Opportunities Fund',
  'Sustainable Investment Fund',
  'Private Equity Fund III',
  'Emerging Markets Fund'
];

export function InvestorFilterBar({ onFilterChange, onSearchChange, searchValue = '', resetTrigger, allData }: InvestorFilterBarProps) {
  const [nameSearch, setNameSearch] = useState('');
  const [selectedStructures, setSelectedStructures] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>([]);
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);

  // Extraire les structures uniques de toutes les données
  const availableStructures = Array.from(
    new Set([
      'Sans structure', // Option pour les investisseurs sans structure
      ...(allData?.flatMap(investor => 
        investor.structures?.map((s: any) => s.name) || []
      ) || [])
    ])
  ).sort();

  // Gérer les changements de recherche
  const handleNameSearchChange = (value: string) => {
    setNameSearch(value);
    onSearchChange?.(value);
  };

  // Mettre à jour les filtres à chaque changement d'état
  useEffect(() => {
    const filters: any = {};
    if (selectedStructures.length > 0) filters.structures = selectedStructures;
    if (selectedSegments.length > 0) filters.segments = selectedSegments;
    if (selectedAnalysts.length > 0) filters.analysts = selectedAnalysts;
    if (selectedPartners.length > 0) filters.partners = selectedPartners;
    if (selectedTypes.length > 0) filters.types = selectedTypes;
    if (selectedFunds.length > 0) filters.funds = selectedFunds;
    onFilterChange(filters);
  }, [selectedStructures, selectedSegments, selectedAnalysts, selectedPartners, selectedTypes, selectedFunds]);

  const hasActiveFilters = 
    selectedStructures.length > 0 ||
    selectedSegments.length > 0 ||
    selectedAnalysts.length > 0 ||
    selectedPartners.length > 0 ||
    selectedTypes.length > 0 ||
    selectedFunds.length > 0;

  const resetAllFilters = () => {
    setSelectedStructures([]);
    setSelectedSegments([]);
    setSelectedAnalysts([]);
    setSelectedPartners([]);
    setSelectedTypes([]);
    setSelectedFunds([]);
  };

  // Réinitialiser les filtres si resetTrigger change
  useEffect(() => {
    if (resetTrigger !== undefined) {
      resetAllFilters();
      setNameSearch(''); // Réinitialiser aussi le champ de recherche
    }
  }, [resetTrigger]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Nom - Champ de recherche */}
          <div className="relative w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Nom"
              value={nameSearch}
              onChange={(e) => handleNameSearchChange(e.target.value)}
              className="w-full h-[42px] pl-9 pr-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
            />
          </div>

          {/* Structure - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={availableStructures}
              value={selectedStructures}
              onChange={setSelectedStructures}
              placeholder="Structure"
              searchPlaceholder="Rechercher une structure..."
            />
          </div>

          {/* Segment(s) - MultiSelect avec icônes */}
          <div className="w-[200px]">
            <SegmentMultiSelect
              options={SEGMENTS}
              value={selectedSegments}
              onChange={setSelectedSegments}
              placeholder="Segment(s)"
              searchPlaceholder="Rechercher un segment..."
            />
          </div>

          {/* Gestionnaire(s) - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={ANALYSTS}
              value={selectedAnalysts}
              onChange={setSelectedAnalysts}
              placeholder="Gestionnaire(s)"
              searchPlaceholder="Rechercher un gestionnaire..."
            />
          </div>

          {/* Partenaire - MultiSelect avec icônes Lucide */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={PARTNERS_OPTIONS}
              value={selectedPartners}
              onChange={setSelectedPartners}
              placeholder="Partenaire"
              searchPlaceholder="Rechercher un partenaire..."
            />
          </div>

          {/* Type - MultiSelect avec icônes */}
          <div className="w-[180px]">
            <ModernMultiSelect
              options={TYPES.map(t => `${t.icon} ${t.label}`)}
              value={selectedTypes}
              onChange={setSelectedTypes}
              placeholder="Type"
              searchPlaceholder="Rechercher un type..."
            />
          </div>

          {/* Fonds - MultiSelect */}
          <div className="w-[220px]">
            <ModernMultiSelect
              options={FUNDS}
              value={selectedFunds}
              onChange={setSelectedFunds}
              placeholder="Fonds"
              searchPlaceholder="Rechercher un fonds..."
            />
          </div>

          {/* Bouton Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="h-[42px] px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
  );
}