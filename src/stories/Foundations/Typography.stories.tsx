import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../components/ui/label';

const meta = {
  title: 'Foundations/Label',
  component: Label,
  tags: ['autodocs'],
  args: { children: 'Label composant' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = {
  render: () => <Label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Label disabled style</Label>,
};
