import type { Meta, StoryObj } from '@storybook/react';
import { CollectionCard } from '../../features/datahub/components/CollectionCard';
import { astorgCollections } from '../../features/datahub/seed/collections';

const byName = (name: string) => {
  const c = astorgCollections.find((x) => x.technicalName === name);
  if (!c) throw new Error(`seed missing: ${name}`);
  return c;
};

const meta = {
  title: 'DataHub/CollectionCard',
  component: CollectionCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    collection: byName('performance_fonds_astorg'),
  },
} satisfies Meta<typeof CollectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDraftsAlert: Story = {
  args: { collection: byName('esg_reporting_astorg') },
};

export const ManualMode: Story = {
  args: { collection: byName('news_investisseurs') },
};

export const MCPMode: Story = {
  args: { collection: byName('alertes_compliance') },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {astorgCollections.map((c) => (
        <CollectionCard key={c.id} collection={c} onClick={() => {}} />
      ))}
    </div>
  ),
};
