import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

function AvatarDemo() {
  return (
    <div className="flex gap-3">
      <Avatar><AvatarFallback>IH</AvatarFallback></Avatar>
      <Avatar className="size-12"><AvatarFallback>JD</AvatarFallback></Avatar>
    </div>
  );
}

const meta = {
  title: 'Data Display/Avatar',
  component: AvatarDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof AvatarDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FallbackOnly: Story = {};
