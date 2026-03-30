import type { Meta, StoryObj } from '@storybook/react';
import { DocumentAddModal } from '../../components/DocumentAddModal';

const folderOptions = [
  { id: 'root', label: 'Racine / Documents' },
  { id: 'space-fiee2', label: 'FIEE2' },
  { id: 'space-fiee2-dist', label: 'FIEE2 / Distribution Notice' },
  { id: 'space-fiee2-dist-2020', label: 'FIEE2 / Distribution Notice / 2020' },
  { id: 'space-fiee2-dist-2021', label: 'FIEE2 / Distribution Notice / 2021' },
  { id: 'space-fiee2-dist-2022', label: 'FIEE2 / Distribution Notice / 2022' },
  { id: 'space-fiee2-capital', label: 'FIEE2 / Capital Call Notice' },
  { id: 'space-fiee2-capital-2024', label: 'FIEE2 / Capital Call Notice / 2024' },
  { id: 'space-pere1', label: 'PERE 1' },
  { id: 'space-pere1-reporting', label: 'PERE 1 / Reporting' },
  { id: 'space-pere1-reporting-q1', label: 'PERE 1 / Reporting / 2026 / Q1' },
  { id: 'space-pere1-reporting-q2', label: 'PERE 1 / Reporting / 2026 / Q2' },
  { id: 'space-pere1-docs', label: 'PERE 1 / Dossiers légaux' },
  { id: 'space-pere1-docs-lux', label: 'PERE 1 / Dossiers légaux / Luxembourg / KYC / UBO' },
];

const meta = {
  title: 'Inputs/Folder Selector (GED)',
  component: DocumentAddModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    isOpen: true,
    onClose: () => {},
    folderOptions,
  },
} satisfies Meta<typeof DocumentAddModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultCollapsed: Story = {
  name: '1) Default (all collapsed)',
  args: {
    defaultFolderId: 'root',
    initialFolderPickerOpen: true,
  },
};

export const WithSelectedFolderContext: Story = {
  name: '2) Selected folder with parent context',
  args: {
    defaultFolderId: 'space-fiee2-dist-2021',
    initialFolderPickerOpen: false,
  },
};

export const OpenedWithAutoExpandedPath: Story = {
  name: '3) Opened + auto-expanded selected path',
  args: {
    defaultFolderId: 'space-fiee2-dist-2021',
    initialFolderPickerOpen: true,
  },
};

export const DeepNestedSelection: Story = {
  name: '4) Deep nested selected folder',
  args: {
    defaultFolderId: 'space-pere1-docs-lux',
    initialFolderPickerOpen: true,
  },
};
