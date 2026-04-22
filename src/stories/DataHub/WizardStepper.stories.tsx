import type { Meta, StoryObj } from '@storybook/react';
import { WizardStepper } from '../../features/datahub/components/WizardStepper';

const STEPS = [
  { id: 1, label: 'Mode' },
  { id: 2, label: 'Configuration' },
  { id: 3, label: 'Rattachement' },
  { id: 4, label: 'Schéma' },
];

const meta = {
  title: 'DataHub/WizardStepper',
  component: WizardStepper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    currentStep: { control: { type: 'range', min: 1, max: 4, step: 1 } },
  },
  args: {
    steps: STEPS,
    currentStep: 1,
  },
} satisfies Meta<typeof WizardStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StepOne: Story = { args: { currentStep: 1 } };
export const StepTwo: Story = { args: { currentStep: 2 } };
export const StepThree: Story = { args: { currentStep: 3 } };
export const Last: Story = { args: { currentStep: 4 } };

export const AllStates: Story = {
  render: () => (
    <div className="flex w-[600px] flex-col gap-6">
      {[1, 2, 3, 4].map((s) => (
        <WizardStepper key={s} steps={STEPS} currentStep={s} onStepClick={() => {}} />
      ))}
    </div>
  ),
};
