import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileDropZone } from '../../features/datahub/components/FileDropZone';

const meta = {
  title: 'DataHub/FileDropZone',
  component: FileDropZone,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    accept: '.csv,.xlsx,.xml,.json',
    hint: 'Formats acceptés : CSV, XLSX, XML, JSON',
    onFiles: () => {},
  },
} satisfies Meta<typeof FileDropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = { args: { disabled: true } };

export const Multiple: Story = { args: { multiple: true, title: 'Glissez plusieurs fichiers' } };

export const WithState: Story = {
  render: (args) => {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div className="flex w-[560px] flex-col gap-3">
        <FileDropZone {...args} onFiles={setFiles} />
        {files.length > 0 && (
          <ul className="text-xs text-muted-foreground">
            {files.map((f) => (
              <li key={f.name}>{f.name} — {f.size} o</li>
            ))}
          </ul>
        )}
      </div>
    );
  },
};
