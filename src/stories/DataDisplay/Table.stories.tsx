import type { Meta, StoryObj } from '@storybook/react';
import { CircleCheck, CircleX } from 'lucide-react';
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
    <div className="w-[780px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Composant</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>État</TableHead>
            <TableHead className="text-center">Dépositaire</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Button</TableCell>
            <TableCell>Input</TableCell>
            <TableCell><Badge>Stable</Badge></TableCell>
            <TableCell className="text-center">
              <CircleCheck className="mx-auto h-5 w-5 text-green-600" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Table</TableCell>
            <TableCell>Data Display</TableCell>
            <TableCell><Badge variant="secondary">Beta</Badge></TableCell>
            <TableCell className="text-center">
              <CircleX className="mx-auto h-5 w-5 text-gray-400" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  ),
};
