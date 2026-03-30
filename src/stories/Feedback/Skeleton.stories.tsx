import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '../../components/ui/skeleton';

function SkeletonDemo() {
  return (
    <div className="space-y-2 w-72">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

const meta = {
  title: 'Feedback/Skeleton',
  component: SkeletonDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {};
