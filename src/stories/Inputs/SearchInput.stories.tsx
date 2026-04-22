import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { SearchInput } from '../../components/ui/search-input';

const meta = {
  title: 'Inputs/SearchInput',
  component: SearchInput,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Input de recherche standard (Input + icône loupe + bouton clear). Vide le champ sur Escape. S'utilise avec les Select du DS pour composer une filter bar.",
      },
    },
  },
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <div className="max-w-md">
        <SearchInput
          value={value}
          onValueChange={setValue}
          placeholder="Rechercher une collection…"
        />
      </div>
    );
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('Reporting ESG');
    return (
      <div className="max-w-md">
        <SearchInput
          value={value}
          onValueChange={setValue}
          placeholder="Rechercher une collection…"
        />
      </div>
    );
  },
};

export const WithFilters: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    return (
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Rechercher une collection…"
          className="min-w-[240px] flex-1"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="published">Publiées</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  },
};
