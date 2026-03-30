import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';

function TableDemo() {
  return (
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
          <TableRow>
            <TableCell>Table</TableCell>
            <TableCell>Data Display</TableCell>
            <TableCell><Badge variant="secondary">Loading</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

const meta = {
  title: 'Data Display/Table',
  component: TableDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof TableDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
