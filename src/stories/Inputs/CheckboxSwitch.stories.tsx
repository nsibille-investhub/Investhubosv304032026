import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';

const meta = {
  title: 'Inputs/Checkbox & Switch',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckboxStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Checkbox defaultChecked /> <span>Option activée</span></div>
      <div className="flex items-center gap-2"><Checkbox disabled /> <span>Option désactivée</span></div>
    </div>
  ),
};

export const SwitchStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Switch defaultChecked /> <span>Switch actif</span></div>
      <div className="flex items-center gap-2"><Switch disabled /> <span>Switch inactif</span></div>
    </div>
  ),
};
