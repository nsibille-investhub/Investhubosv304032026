import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';

function CheckboxSwitchDemo() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Checkbox defaultChecked /> <span>Option activée</span></div>
      <div className="flex items-center gap-2"><Checkbox disabled /> <span>Option désactivée</span></div>
      <div className="flex items-center gap-2"><Switch defaultChecked /> <span>Switch actif</span></div>
      <div className="flex items-center gap-2"><Switch disabled /> <span>Switch inactif</span></div>
    </div>
  );
}

const meta = {
  title: 'Inputs/Checkbox & Switch',
  component: CheckboxSwitchDemo,
  tags: ['autodocs'],
} satisfies Meta<typeof CheckboxSwitchDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {};
