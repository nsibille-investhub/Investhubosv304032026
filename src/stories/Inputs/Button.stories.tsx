import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/ui/button';

const meta = {
  title: 'Inputs/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: 'Action' },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger', 'link'] },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Variants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};
