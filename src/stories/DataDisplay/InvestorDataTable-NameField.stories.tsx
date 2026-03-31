import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { InvestorDataTable } from '../../components/InvestorDataTable';
import { generateInvestors } from '../../utils/investorGenerator';

function InvestorNameFieldStory() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const investor = {
    ...generateInvestors(1)[0],
    id: 1,
    name: 'Vertex Capital SA',
  };

  return (
    <div className="w-[1200px]">
      <InvestorDataTable
        data={[investor]}
        hoveredRow={hoveredRow}
        setHoveredRow={setHoveredRow}
        onRowClick={() => {}}
        sortConfig={null}
        onSort={() => {}}
        searchTerm=""
      />
    </div>
  );
}

const meta = {
  title: 'Data Display/InvestorDataTable/Name Field',
  component: InvestorDataTable,
  tags: ['autodocs'],
} satisfies Meta<typeof InvestorDataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NomClickableWithIdCopy: Story = {
  render: () => <InvestorNameFieldStory />,
};
