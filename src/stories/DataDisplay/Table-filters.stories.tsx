import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterBar, type FilterConfig } from '../../components/FilterBar';

const structureOptions = [
  'Alpha Family Trust',
  'Alpha SARL',
  'Anne Family Trust',
  'Anne SA',
  'Athena Family Trust',
  'Fondation Global',
  'Holding Alpha',
  'Holding Omega',
  'Laurent SA',
  'Meridian Family Trust',
  'Omega Family Trust',
  'Phoenix Family Trust',
  'SCI Zenith Patrimoine 2',
  'Strategic Family Trust',
  'Zenith SAS',
].map((name) => ({ value: name, label: name }));

const segmentOptions = [
  { value: 'HNWI', label: 'HNWI' },
  { value: 'UHNWI', label: 'UHNWI' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Professional', label: 'Professional' },
  { value: 'Institutional', label: 'Institutional' },
];

const advancedFilters: FilterConfig[] = [
  {
    id: 'status',
    label: 'Statut relation',
    type: 'select',
    placeholder: 'Statut',
    options: [
      { value: 'prospect', label: 'Prospect' },
      { value: 'discussion', label: 'En discussion' },
      { value: 'relation', label: 'En relation' },
    ],
  },
];

function TableFiltersStory() {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});

  const filters: FilterConfig[] = [
    {
      id: 'structure',
      label: 'Structure',
      type: 'select',
      isPrimary: true,
      options: structureOptions,
      placeholder: 'Structure',
    },
    {
      id: 'segment',
      label: 'Segment',
      type: 'select',
      isPrimary: true,
      options: segmentOptions,
      placeholder: 'Segment',
    },
    ...advancedFilters,
  ];

  return (
    <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800 max-w-[1120px]">
      <FilterBar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Rechercher un investisseur..."
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={(filterId, value) => {
          setActiveFilters((prev) => {
            if (value === null || value === '') {
              const next = { ...prev };
              delete next[filterId];
              return next;
            }

            return {
              ...prev,
              [filterId]: value,
            };
          });
        }}
        onClearAll={() => setActiveFilters({})}
      />
    </div>
  );
}

const meta = {
  title: 'Data Display/table-filters',
  component: FilterBar,
  tags: ['autodocs'],
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <TableFiltersStory />,
};
