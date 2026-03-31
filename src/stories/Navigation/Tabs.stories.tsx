import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="foundation" className="w-[480px]">
      <TabsList>
        <TabsTrigger value="foundation">Foundation</TabsTrigger>
        <TabsTrigger value="inputs">Inputs</TabsTrigger>
      </TabsList>
      <TabsContent value="foundation">Couleurs, typo, spacing.</TabsContent>
      <TabsContent value="inputs">Button, Input, Select, Checkbox.</TabsContent>
    </Tabs>
  ),
};
