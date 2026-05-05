import type { Meta, StoryObj } from '@storybook/react';
import { PartyTypeBadge } from '../../components/ui/party-type-badge';

const meta = {
  title: 'DataDisplay/PartyTypeBadge',
  component: PartyTypeBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Compact badge representing a party type — Personne physique (PP), Personne morale (PM) or Structure. Pairs an icon with a short label, used in autocomplete rows, selected chips and listings. Uses neutral DS tokens (border-border / bg-muted / text-muted-foreground); the type is reflected in the icon, not the colour, in line with the design-system rule that 'Tags are intentionally neutral-only'.",
      },
    },
  },
} satisfies Meta<typeof PartyTypeBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Individual: Story = {
  args: { type: 'individual' },
};

export const Corporate: Story = {
  args: { type: 'corporate' },
};

export const Structure: Story = {
  args: { type: 'structure' },
};

export const CustomLabel: Story = {
  args: { type: 'individual', label: 'PHYS' },
  parameters: {
    docs: {
      description: {
        story: 'Pass a custom `label` to override the default short text (PP / PM / STR).',
      },
    },
  },
};

export const InListRow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Typical usage: as the leading element of an autocomplete row, paired with name + email.',
      },
    },
  },
  render: () => (
    <div className="w-[420px] rounded-md border border-border bg-card divide-y divide-border">
      <div className="flex items-center gap-3 px-3 py-2">
        <PartyTypeBadge type="individual" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">Sophie Martin</div>
          <div className="text-xs text-muted-foreground truncate">sophie.martin@email.com</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-3 py-2">
        <PartyTypeBadge type="corporate" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">Alpha Capital Holding</div>
          <div className="text-xs text-muted-foreground truncate">contact@alphacapital.com</div>
        </div>
      </div>
      <div className="flex items-center gap-3 px-3 py-2">
        <PartyTypeBadge type="structure" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">Alpha Capital Holding SAS</div>
          <div className="text-xs text-muted-foreground truncate">Lié à Sophie Martin · 123 456 789 00012</div>
        </div>
      </div>
    </div>
  ),
};
