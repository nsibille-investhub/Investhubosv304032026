import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveX, Download, FileSpreadsheet, Plus, Users } from 'lucide-react';
import { PageHeader } from '../../components/ui/page-header';

const meta = {
  title: 'Navigation/PageHeader',
  component: PageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "En-tête de page unifié. Expose un breadcrumb optionnel (avec bouton retour), un titre, un sous-titre optionnel, une action principale optionnelle, une action secondaire optionnelle, et un menu tertiaire \"...\" optionnel pour des actions additionnelles (exports, archivage, etc.).",
      },
    },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    breadcrumb: [
      { label: 'InvestHub OS' },
      { label: 'Investors' },
    ],
    title: 'Investisseurs',
    subtitle: 'Gérer et suivre tous les investisseurs',
    primaryAction: {
      label: 'Nouvel Investisseur',
      onClick: () => undefined,
    },
  },
};

export const WithTertiaryMenu: Story = {
  args: {
    breadcrumb: [
      { label: 'InvestHub OS' },
      { label: 'Portails et Contenu' },
      { label: 'DataHub' },
    ],
    title: 'DataHub',
    subtitle: 'Gestion des collections de données personnalisées',
    primaryAction: {
      label: 'Nouvelle collection',
      onClick: () => undefined,
    },
    tertiaryActions: [
      {
        label: 'Archivées',
        icon: <ArchiveX className="w-4 h-4 text-gray-600" />,
        onClick: () => undefined,
      },
      {
        label: 'Télécharger .csv',
        icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
        onClick: () => undefined,
      },
      {
        label: 'Télécharger .xlsx',
        icon: <Download className="w-4 h-4 text-blue-600" />,
        onClick: () => undefined,
      },
      {
        label: 'Exporter contacts .csv',
        icon: <Users className="w-4 h-4 text-purple-600" />,
        onClick: () => undefined,
      },
    ],
  },
};

export const FullStack: Story = {
  args: {
    breadcrumb: [
      { label: 'InvestHub OS' },
      { label: 'Data Room' },
      { label: 'Investisseurs LP' },
    ],
    onBack: () => undefined,
    title: 'Investisseurs LP',
    subtitle: 'Espace documentaire dédié aux Limited Partners',
    primaryAction: {
      label: 'Nouveau document',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => undefined,
    },
    secondaryAction: {
      label: 'Importer',
      icon: <Download className="w-4 h-4" />,
      onClick: () => undefined,
    },
    tertiaryActions: [
      {
        label: 'Télécharger .csv',
        icon: <FileSpreadsheet className="w-4 h-4 text-green-600" />,
        onClick: () => undefined,
      },
      {
        label: 'Archiver l’espace',
        icon: <ArchiveX className="w-4 h-4" />,
        destructive: true,
        separatorBefore: true,
        onClick: () => undefined,
      },
    ],
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Paramètres',
  },
};
