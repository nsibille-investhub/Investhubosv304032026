import type { Meta, StoryObj } from '@storybook/react';
import { SyncIndicator } from '../../features/datahub/components/SyncIndicator';

const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

const meta = {
  title: 'DataHub/SyncIndicator',
  component: SyncIndicator,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'radio', options: ['inline', 'badge'] },
    isSyncing: { control: 'boolean' },
    showIcon: { control: 'boolean' },
  },
  args: {
    variant: 'inline',
    isSyncing: false,
    showIcon: true,
    lastSyncAt: iso(2 * 60 * 60 * 1000),
  },
} satisfies Meta<typeof SyncIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const JustNow: Story = {
  args: { lastSyncAt: iso(30 * 1000) },
};

export const RecentSync: Story = {
  args: { lastSyncAt: iso(2 * 60 * 60 * 1000) },
};

export const OldSync: Story = {
  args: { lastSyncAt: iso(5 * 24 * 60 * 60 * 1000) },
};

export const NeverSynced: Story = {
  args: { lastSyncAt: undefined },
};

export const Syncing: Story = {
  args: { isSyncing: true },
};

export const BadgeVariant: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <SyncIndicator variant="badge" lastSyncAt={iso(30 * 1000)} />
      <SyncIndicator variant="badge" lastSyncAt={iso(2 * 60 * 60 * 1000)} />
      <SyncIndicator variant="badge" lastSyncAt={iso(5 * 24 * 60 * 60 * 1000)} />
      <SyncIndicator variant="badge" />
      <SyncIndicator variant="badge" isSyncing />
    </div>
  ),
};
