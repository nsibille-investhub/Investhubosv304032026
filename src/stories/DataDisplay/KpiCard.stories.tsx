import type { Meta, StoryObj } from '@storybook/react';
import { CheckCircle2, Database, FileEdit, Rows3 } from 'lucide-react';
import { KpiCard, KpiStrip } from '../../components/ui/kpi-card';

const meta = {
  title: 'DataDisplay/KpiCard',
  component: KpiCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Card KPI unifiée (bg-blue-50 / texte #000E2B) utilisée dans les dashboards (DataHub, Bird View…). Trois variants : statique, avec progress bar (ratio current / total), ou avec indicateur d'alerte (dot pulse ambre + hint).",
      },
    },
  },
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Static: Story = {
  args: {
    icon: Database,
    label: 'Collections',
    value: 6,
  },
};

export const WithProgress: Story = {
  args: {
    icon: CheckCircle2,
    label: 'Publiées',
    value: 317,
    progress: { current: 317, total: 327 },
  },
};

export const WithAlert: Story = {
  args: {
    icon: FileEdit,
    label: 'Brouillons',
    value: 10,
    pulse: true,
    hint: 'à publier',
  },
};

export const Strip4Columns: Story = {
  render: () => (
    <KpiStrip columns={4}>
      <KpiCard index={0} icon={Database} label="Collections" value={6} />
      <KpiCard index={1} icon={Rows3} label="Total lignes" value={327} />
      <KpiCard
        index={2}
        icon={CheckCircle2}
        label="Publiées"
        value={317}
        progress={{ current: 317, total: 327 }}
      />
      <KpiCard
        index={3}
        icon={FileEdit}
        label="Brouillons"
        value={10}
        pulse
        hint="à publier"
      />
    </KpiStrip>
  ),
};
