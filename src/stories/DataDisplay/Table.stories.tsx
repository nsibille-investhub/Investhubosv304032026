import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

const meta = {
  title: 'Data Display/Table',
  component: Table,
  tags: ['autodocs'],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[720px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Composant</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>État</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Button</TableCell>
            <TableCell>Input</TableCell>
            <TableCell><Badge>Stable</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
