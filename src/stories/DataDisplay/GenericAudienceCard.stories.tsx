import type { Meta, StoryObj } from '@storybook/react';
import { GenericAudienceCard } from '../../components/GenericAudienceCard';

const meta = {
  title: 'Data Display/GenericAudienceCard',
  component: GenericAudienceCard,
  tags: ['autodocs'],
  args: {
    title: 'Investisseurs LP',
    audienceType: 'Investisseur',
    fundLabel: 'Tous fonds',
    segmentLabel: 'LP Institutionnels',
    documentsCount: 127,
    foldersCount: 18,
  },
} satisfies Meta<typeof GenericAudienceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSegment: Story = {
  args: {
    segmentLabel: undefined,
  },
};
