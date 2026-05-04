import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
} from 'lucide-react';
import { FilterCard } from '../../components/ui/filter-card';

const meta = {
  title: 'DataDisplay/FilterCard',
  component: FilterCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          "Carte de filtre cliquable réutilisée dans les écrans Validation, Investisseurs et Souscriptions. Affiche un compteur, un libellé, une métrique principale et une moyenne. L'état actif est marqué par un liseré supérieur primaire et un fond légèrement teinté ; un effet ripple est joué au clic.",
      },
    },
  },
} satisfies Meta<typeof FilterCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: {
    status: 'pending',
    activeStatus: 'pending',
    onStatusChange: () => {},
    label: 'En attente de validation',
    icon: Clock,
    total: 11,
    metricLabel: 'À traiter',
    metricValue: '11',
    averageValue: '69%',
    iconActiveClassName: 'text-amber-600',
  },
};

export const Inactive: Story = {
  args: {
    ...Pending.args!,
    activeStatus: 'something-else',
  },
};

export const StripValidation: Story = {
  render: () => {
    const [active, setActive] = useState('pending');
    return (
      <div className="grid grid-cols-4 gap-1.5">
        <FilterCard
          status="pending"
          activeStatus={active}
          onStatusChange={setActive}
          label="En attente de validation"
          icon={Clock}
          total={11}
          metricLabel="À traiter"
          metricValue="11"
          averageValue="69%"
          iconActiveClassName="text-amber-600"
        />
        <FilterCard
          status="validated"
          activeStatus={active}
          onStatusChange={setActive}
          label="Validés"
          icon={CheckCircle2}
          total={4}
          metricLabel="Approuvés"
          metricValue="4"
          averageValue="25%"
          iconActiveClassName="text-emerald-600"
        />
        <FilterCard
          status="rejected"
          activeStatus={active}
          onStatusChange={setActive}
          label="Rejetés"
          icon={XCircle}
          total={1}
          metricLabel="Refusés"
          metricValue="1"
          averageValue="6%"
          iconActiveClassName="text-red-600"
        />
        <FilterCard
          status="all"
          activeStatus={active}
          onStatusChange={setActive}
          label="Tous"
          icon={FileText}
          total={16}
          metricLabel="Total"
          metricValue="16"
          averageValue="100%"
        />
      </div>
    );
  },
};

export const StripReviewWindows: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Variante "fenêtres de révision" utilisée par Conformité / Dossiers KYC pour filtrer les dossiers selon l\'échéance de la prochaine revue.',
      },
    },
  },
  render: () => {
    const [active, setActive] = useState<string | null>(null);
    return (
      <div className="grid grid-cols-5 gap-1.5">
        <FilterCard
          status="overdue"
          activeStatus={active ?? ''}
          onStatusChange={(s) => setActive(active === s ? null : s)}
          label="En retard"
          icon={AlertTriangle}
          total={8}
          metricLabel="Dépassées"
          metricValue="8"
          averageValue="9%"
          iconActiveClassName="text-red-600"
        />
        <FilterCard
          status="1w"
          activeStatus={active ?? ''}
          onStatusChange={(s) => setActive(active === s ? null : s)}
          label="Dans 1 semaine"
          icon={CalendarClock}
          total={4}
          metricLabel="À revoir"
          metricValue="4"
          averageValue="4%"
          iconActiveClassName="text-amber-600"
        />
        <FilterCard
          status="1m"
          activeStatus={active ?? ''}
          onStatusChange={(s) => setActive(active === s ? null : s)}
          label="Dans 1 mois"
          icon={CalendarRange}
          total={13}
          metricLabel="À revoir"
          metricValue="13"
          averageValue="14%"
          iconActiveClassName="text-amber-600"
        />
        <FilterCard
          status="3m"
          activeStatus={active ?? ''}
          onStatusChange={(s) => setActive(active === s ? null : s)}
          label="Dans 3 mois"
          icon={CalendarDays}
          total={27}
          metricLabel="À revoir"
          metricValue="27"
          averageValue="29%"
        />
        <FilterCard
          status="6m"
          activeStatus={active ?? ''}
          onStatusChange={(s) => setActive(active === s ? null : s)}
          label="Dans 6 mois"
          icon={CalendarCheck}
          total={34}
          metricLabel="À revoir"
          metricValue="34"
          averageValue="37%"
        />
      </div>
    );
  },
};
