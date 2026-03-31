import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InvestorStatusTabs } from '../../components/InvestorStatusTabs';

type InvestorPipelineRow = {
  status: 'Prospect' | 'En discussion' | 'En relation';
  totalInvested: number;
};

function buildRows(status: InvestorPipelineRow['status'], count: number, totals: number[]): InvestorPipelineRow[] {
  return Array.from({ length: count }, (_, index) => ({
    status,
    totalInvested: totals[index] ?? 0,
  }));
}

const pipelineData: InvestorPipelineRow[] = [
  ...buildRows('Prospect', 28, []),
  ...buildRows('En discussion', 35, [
    2500000, 1800000, 3500000, 2100000, 2700000,
    1900000, 2600000, 2200000, 2000000, 3100000,
    2400000, 2300000, 2900000, 1700000, 2800000,
    2100000, 2500000, 1600000, 2700000, 3200000,
    1900000, 2200000, 2600000, 2000000, 2300000,
    2400000, 1800000, 3000000, 2100000, 2500000,
    1700000, 2800000, 2600000, 2200000, 2400000,
  ]),
  ...buildRows('En relation', 31, [
    2300000, 2100000, 2500000, 1800000, 2600000,
    2200000, 1900000, 2400000, 2000000, 2700000,
    2100000, 2300000, 2500000, 1800000, 2600000,
    2200000, 1900000, 2400000, 2000000, 2700000,
    2100000, 2300000, 2500000, 1800000, 2600000,
    2200000, 1900000, 2400000, 2000000, 2700000,
    2100000,
  ]),
];

function CardsPipelineStory() {
  const [activeStatus, setActiveStatus] = useState('all');

  return (
    <div className="px-6 pt-6 w-[1120px]">
      <InvestorStatusTabs
        data={pipelineData}
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
      />
    </div>
  );
}

const meta = {
  title: 'Data Display/cards-pipeline',
  component: InvestorStatusTabs,
  tags: ['autodocs'],
} satisfies Meta<typeof InvestorStatusTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CardsPipelineStory />,
};
