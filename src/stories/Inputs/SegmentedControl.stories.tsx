import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Globe, Server, UploadCloud } from 'lucide-react';
import { SegmentedControl } from '../../components/ui/segmented-control';

const meta = {
  title: 'Inputs/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Sélection exclusive à labels courts (2–5 options). À préférer à un RadioGroup dès que les options n'ont pas de descriptions. Basé sur @radix-ui/react-toggle-group (type=single).",
      },
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => {
    const [value, setValue] = useState<'all' | 'one' | 'many'>('all');
    return (
      <SegmentedControl
        aria-label="Portée"
        value={value}
        onValueChange={(v) => setValue(v as 'all' | 'one' | 'many')}
        options={[
          { value: 'all', label: 'Tous les fonds' },
          { value: 'one', label: 'Un fonds' },
          { value: 'many', label: 'Plusieurs fonds' },
        ]}
      />
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [value, setValue] = useState<'manual' | 'ftp' | 'url'>('url');
    return (
      <SegmentedControl
        aria-label="Canal de dépôt récurrent"
        value={value}
        onValueChange={(v) => setValue(v as 'manual' | 'ftp' | 'url')}
        options={[
          {
            value: 'manual',
            label: 'Upload manuel',
            icon: <UploadCloud className="size-4" />,
          },
          {
            value: 'ftp',
            label: 'Dépôt FTP / SFTP',
            icon: <Server className="size-4" />,
          },
          {
            value: 'url',
            label: 'URL d’upload dédiée',
            icon: <Globe className="size-4" />,
          },
        ]}
      />
    );
  },
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState('monthly');
    return (
      <SegmentedControl
        size="sm"
        aria-label="Période"
        value={value}
        onValueChange={setValue}
        options={[
          { value: 'daily', label: 'Jour' },
          { value: 'weekly', label: 'Semaine' },
          { value: 'monthly', label: 'Mois' },
          { value: 'quarterly', label: 'Trimestre' },
        ]}
      />
    );
  },
};

export const FullWidth: Story = {
  render: () => {
    const [value, setValue] = useState('table');
    return (
      <div className="w-[480px]">
        <SegmentedControl
          fullWidth
          aria-label="Vue"
          value={value}
          onValueChange={setValue}
          options={[
            { value: 'table', label: 'Tableau' },
            { value: 'cards', label: 'Cartes' },
            { value: 'kanban', label: 'Kanban' },
          ]}
        />
      </div>
    );
  },
};
