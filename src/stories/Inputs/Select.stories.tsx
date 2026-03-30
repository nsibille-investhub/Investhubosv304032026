import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const meta = {
  title: 'Inputs/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-72">
      <Select defaultValue="stable">
        <SelectTrigger>
          <SelectValue placeholder="Choisir un statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="stable">Stable</SelectItem>
          <SelectItem value="beta">Beta</SelectItem>
          <SelectItem value="deprecated">Deprecated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
