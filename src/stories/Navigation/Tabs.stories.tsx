import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

function TabsDemo() {
  return (
    <Tabs defaultValue="foundation" className="w-[480px]">
      <TabsList>
        <TabsTrigger value="foundation">Foundation</TabsTrigger>
        <TabsTrigger value="inputs">Inputs</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>
      <TabsContent value="foundation">Couleurs, typo, spacing.</TabsContent>
      <TabsContent value="inputs">Button, Input, Select, Checkbox.</TabsContent>
      <TabsContent value="feedback">Alert, Toast, Skeleton.</TabsContent>
    </Tabs>
  );
}

const meta = {
  title: 'Navigation/Tabs',
  component: TabsDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof TabsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
