import type { Meta, StoryObj } from '@storybook/react';
import { IngestionModeBadge } from '../../features/datahub/components/IngestionModeBadge';
import type { IngestionMode } from '../../features/datahub/types';

const MODES: IngestionMode[] = ['manual', 'file', 'api-pull', 'api-push', 'mcp'];

const meta = {
  title: 'DataHub/IngestionModeBadge',
  component: IngestionModeBadge,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: MODES },
    size: { control: 'radio', options: ['sm', 'md'] },
    showIcon: { control: 'boolean' },
    showLabel: { control: 'boolean' },
  },
  args: {
    mode: 'api-pull',
    size: 'md',
    showIcon: true,
    showLabel: true,
  },
} satisfies Meta<typeof IngestionModeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllModes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {MODES.map((mode) => (
        <IngestionModeBadge key={mode} mode={mode} />
      ))}
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {MODES.map((mode) => (
        <IngestionModeBadge key={mode} mode={mode} showLabel={false} />
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
          {MODES.map((mode) => (
            <IngestionModeBadge key={`sm-${mode}`} mode={mode} size="sm" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">md</span>
        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => (
            <IngestionModeBadge key={`md-${mode}`} mode={mode} size="md" />
          ))}
        </div>
      </div>
    </div>
  ),
};
