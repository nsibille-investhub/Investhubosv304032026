import type { Meta, StoryObj } from '@storybook/react';
import { OneToManyPersonsCell } from '../../components/OneToManyPersonsCell';

const meta = {
  title: 'Data Display/OneToManyPersonsCell',
  component: OneToManyPersonsCell,
  tags: ['autodocs'],
} satisfies Meta<typeof OneToManyPersonsCell>;

export default meta;
type Story = StoryObj<typeof meta>;

const samplePersons = [
  { id: '1', fullName: 'Christine Fournier', role: 'Bénéficiaire effectif' },
  { id: '2', fullName: 'Isabelle Girard', role: 'Contact principal' },
  { id: '3', fullName: 'Claire Petit', role: 'Directrice Générale' },
];

export const Default: Story = {
  args: {
    persons: samplePersons,
    label: 'Contacts personnes physiques',
  },
  render: (args) => (
    <div className="w-[280px] p-4">
      <OneToManyPersonsCell {...args} />
    </div>
  ),
};
