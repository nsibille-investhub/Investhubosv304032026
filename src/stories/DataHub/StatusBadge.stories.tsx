import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from '../../features/datahub/components/StatusBadge';
import type { CollectionRowStatus } from '../../features/datahub/types';

const STATUSES: CollectionRowStatus[] = [
  'published',
  'draft',
  'unpublished',
  'changes',
];

const meta = {
  title: 'DataHub/StatusBadge',
  component: StatusBadge,
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: STATUSES,
    },
    size: { control: 'radio', options: ['sm', 'md'] },
    showIcon: { control: 'boolean' },
  },
  args: {
    status: 'published',
    size: 'md',
    showIcon: true,
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStatuses: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      {STATUSES.map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">sm</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <StatusBadge key={`sm-${status}`} status={status} size="sm" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">md</span>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <StatusBadge key={`md-${status}`} status={status} size="md" />
          ))}
        </div>
      </div>
    </div>
  ),
};

export const WithoutIcon: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((status) => (
        <StatusBadge key={status} status={status} showIcon={false} />
      ))}
    </div>
  ),
};
