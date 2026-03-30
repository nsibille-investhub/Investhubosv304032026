import type { Meta, StoryObj } from '@storybook/react';

function TypographyScale() {
  return (
    <div className="space-y-2 w-[720px]">
      <h1 className="text-3xl font-semibold">Heading 1 — 32px</h1>
      <h2 className="text-2xl font-semibold">Heading 2 — 24px</h2>
      <h3 className="text-xl font-medium">Heading 3 — 20px</h3>
      <p className="text-base">Body — 16px, lecture et contenus principaux.</p>
      <p className="text-sm text-muted-foreground">Caption — 14px, aides contextuelles.</p>
    </div>
  );
}

const meta = {
  title: 'Foundations/Typography',
  component: TypographyScale,
  tags: ['autodocs'],
} satisfies Meta<typeof TypographyScale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};
