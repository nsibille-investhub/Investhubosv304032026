import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/ui/input';

const meta = {
  title: 'Inputs/Input',
  component: Input,
  tags: ['autodocs'],
  args: { placeholder: 'Saisir une valeur' },
  argTypes: {
    disabled: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'email', 'password', 'number'] },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { value: '' } };
