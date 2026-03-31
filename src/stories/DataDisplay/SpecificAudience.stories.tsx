import type { Meta, StoryObj } from '@storybook/react';
import { SpecificAudience } from '../../components/SpecificAudience';

const meta = {
  title: 'Data Display/SpecificAudience',
  component: SpecificAudience,
  tags: ['autodocs'],
  args: {
    investor: 'Sophie Bernard',
    structure: 'SAS Bernard Invest',
    subscription: 'SUB-004',
  },
} satisfies Meta<typeof SpecificAudience>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const InvestorOnly: Story = {
  args: {
    structure: undefined,
    subscription: undefined,
  },
};

export const InvestorAndSubscription: Story = {
  args: {
    structure: undefined,
    subscription: 'SUB-002',
  },
};
