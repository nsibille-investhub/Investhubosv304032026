import type { Meta, StoryObj } from '@storybook/react';
import { PivotTypeBadge } from '../../features/datahub/components/PivotTypeBadge';
import type { PivotTemporalType } from '../../features/datahub/types';

const TYPES: PivotTemporalType[] = ['timeseries', 'reference', 'event'];

const meta = {
  title: 'DataHub/PivotTypeBadge',
  component: PivotTypeBadge,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: TYPES },
    size: { control: 'radio', options: ['sm', 'md'] },
    showIcon: { control: 'boolean' },
  },
  args: {
    type: 'timeseries',
    size: 'md',
    showIcon: true,
  },
} satisfies Meta<typeof PivotTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((type) => (
        <PivotTypeBadge key={type} type={type} />
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
          {TYPES.map((type) => (
            <PivotTypeBadge key={`sm-${type}`} type={type} size="sm" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">md</span>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <PivotTypeBadge key={`md-${type}`} type={type} size="md" />
          ))}
        </div>
      </div>
    </div>
  ),
};
