import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ModernMultiSelect } from './ui/modern-multiselect';
import { SegmentMultiSelect, SegmentOption } from './ui/segment-multiselect';
import { Partner } from '../utils/partnerGenerator';

interface PartnerFilterBarProps {
  onFilterChange: (filters: any) => void;
  onSearchChange?: (searchTerm: string) => void;
  searchValue?: string;
  resetTrigger?: number;
  allData?: Partner[];
}

// Segments CRM avec couleurs stylées - PROFESSIONNEL SANS EMOJIS
const SEGMENTS: SegmentOption[] = [
  { value: 'HNWI', label: 'HNWI', color: '#3B82F6', bgColor: '#EFF6FF' },
  { value: 'UHNWI', label: 'UHNWI', color: '#F97316', bgColor: '#FFF7ED' },
  { value: 'Retail', label: 'Retail', color: '#EC4899', bgColor: '#FDF2F8' },
  { value: 'Professional', label: 'Professional', color: '#6B7280', bgColor: '#F3F4F6' },
  { value: 'Institutional', label: 'Institutional', color: '#6B7280', bgColor: '#F9FAFB' },
];

// Statuts de convention
const CONTRACT_STATUSES = [
  'Signé',
  'En attente',
  'À relancer',
  'Expiré',
  'Aucun'
];

export function PartnerFilterBar({ onFilterChange, onSearchChange, searchValue = '', resetTrigger, allData }: PartnerFilterBarProps) {
  const [nameSearch, setNameSearch] = useState('');
  const [selectedParentGroups, setSelectedParentGroups] = useState<string[]>([]);
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [selectedContractStatuses, setSelectedContractStatuses] = useState<string[]>([]);

  // Extraire les valeurs uniques pour les filtres
  const availableParentGroups = Array.from(
    new Set(allData?.map(p => p.parentGroup).filter(Boolean) || [])
  ).sort() as string[];

  const availableAnalysts = Array.from(
    new Set(allData?.map(p => p.analyst) || [])
  ).sort();

  // Gérer les changements de recherche
  const handleNameSearchChange = (value: string) => {
    setNameSearch(value);
    onSearchChange?.(value);
  };

  // Mettre à jour les filtres à chaque changement d'état
  useEffect(() => {
    const filters: any = {};
    if (selectedParentGroups.length > 0) filters.parentGroups = selectedParentGroups;
    if (selectedAnalysts.length > 0) filters.analysts = selectedAnalysts;
    if (selectedSegments.length > 0) filters.segments = selectedSegments;
    if (selectedContractStatuses.length > 0) filters.contractStatuses = selectedContractStatuses;
    onFilterChange(filters);
  }, [selectedParentGroups, selectedAnalysts, selectedSegments, selectedContractStatuses]);

  const hasActiveFilters = 
    selectedParentGroups.length > 0 ||
    selectedAnalysts.length > 0 ||
    selectedSegments.length > 0 ||
    selectedContractStatuses.length > 0;

  const resetAllFilters = () => {
    setSelectedParentGroups([]);
    setSelectedAnalysts([]);
    setSelectedSegments([]);
    setSelectedContractStatuses([]);
  };

  // Réinitialiser les filtres si resetTrigger change
  useEffect(() => {
    if (resetTrigger !== undefined) {
      resetAllFilters();
      setNameSearch('');
    }
  }, [resetTrigger]);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="px-6 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Recherche par nom */}
          <div className="relative w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, responsable..."
              value={nameSearch}
              onChange={(e) => handleNameSearchChange(e.target.value)}
              className="w-full h-[42px] pl-9 pr-3 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:ring-offset-2 transition-all"
            />
          </div>

          {/* Partenaire parent - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={availableParentGroups}
              value={selectedParentGroups}
              onChange={setSelectedParentGroups}
              placeholder="Partenaire parent"
              searchPlaceholder="Rechercher un groupe..."
            />
          </div>

          {/* Responsable - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={availableAnalysts}
              value={selectedAnalysts}
              onChange={setSelectedAnalysts}
              placeholder="Responsable"
              searchPlaceholder="Rechercher un responsable..."
            />
          </div>

          {/* Segment(s) - MultiSelect avec icônes */}
          <div className="w-[200px]">
            <SegmentMultiSelect
              options={SEGMENTS}
              value={selectedSegments}
              onChange={setSelectedSegments}
              placeholder="Segment"
              searchPlaceholder="Rechercher un segment..."
            />
          </div>

          {/* Statut convention - MultiSelect */}
          <div className="w-[200px]">
            <ModernMultiSelect
              options={CONTRACT_STATUSES}
              value={selectedContractStatuses}
              onChange={setSelectedContractStatuses}
              placeholder="Statut convention"
              searchPlaceholder="Rechercher un statut..."
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
