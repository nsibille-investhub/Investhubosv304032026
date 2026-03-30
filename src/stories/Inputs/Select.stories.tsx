import type { Meta, StoryObj } from '@storybook/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

function SelectDemo() {
  return (
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
  );
}

const meta = {
  title: 'Inputs/Select',
  component: SelectDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof SelectDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
