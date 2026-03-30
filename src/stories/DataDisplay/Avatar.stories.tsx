import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

const meta = {
  title: 'Data Display/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FallbackOnly: Story = {
  render: () => (
    <div className="flex gap-3">
      <Avatar><AvatarFallback>IH</AvatarFallback></Avatar>
      <Avatar className="size-12"><AvatarFallback>JD</AvatarFallback></Avatar>
    </div>
  ),
};
