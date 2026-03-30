import type { Meta, StoryObj } from '@storybook/react';

const tokens = [
  { name: 'Bleu solide', value: '#000E2B' },
  { name: 'Bleu financier', value: '#0A3D4A' },
  { name: 'Vert croissance', value: '#25563F' },
  { name: 'Écru papier', value: '#D9D8CB' },
  { name: 'Rouge interdiction', value: '#DC2626' },
  { name: 'Orange warning', value: '#F97316' },
];

function ColorGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-[720px]">
      {tokens.map((t) => (
        <div key={t.name} className="rounded-lg border overflow-hidden">
          <div className="h-16" style={{ backgroundColor: t.value }} />
          <div className="p-2 text-xs">
            <div className="font-semibold">{t.name}</div>
            <code>{t.value}</code>
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Colors',
  component: ColorGrid,
  tags: ['autodocs'],
} satisfies Meta<typeof ColorGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandingAndFunctional: Story = {};
