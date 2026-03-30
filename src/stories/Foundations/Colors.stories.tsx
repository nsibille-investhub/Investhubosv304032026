import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '../../components/ui/separator';

const meta = {
  title: 'Foundations/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};
export const Vertical: Story = {
  args: { orientation: 'vertical', className: 'h-16' },
};
