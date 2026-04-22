import { useEffect, useState } from 'react';
import { FileSpreadsheet, FileText, FileJson, FileCode, Trash2 } from 'lucide-react';

import { Button } from '../../../../../components/ui/button';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';
import { Switch } from '../../../../../components/ui/switch';
import { FileDropZone } from '../../FileDropZone';

type RecurringKind = 'manual' | 'ftp' | 'url';

type Separator = ',' | ';' | '\t';

interface FileConfig {
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  separator?: Separator;
  preview?: string[][];
  recurring?: boolean;
  recurringKind?: RecurringKind;
  ftpHost?: string;
  ftpPort?: string;
  ftpUser?: string;
  configureLater?: boolean;
}

function kindOf(filename: string): 'csv' | 'xlsx' | 'xml' | 'json' | 'other' {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) return 'csv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'xlsx';
  if (lower.endsWith('.xml')) return 'xml';
  if (lower.endsWith('.json')) return 'json';
  return 'other';
}

function iconFor(filename: string) {
  switch (kindOf(filename)) {
    case 'csv':
    case 'xlsx':
      return FileSpreadsheet;
    case 'json':
      return FileJson;
    case 'xml':
      return FileCode;
    default:
      return FileText;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function detectSeparator(firstLine: string): Separator {
  const counts: Record<Separator, number> = {
    ',': (firstLine.match(/,/g) ?? []).length,
    ';': (firstLine.match(/;/g) ?? []).length,
    '\t': (firstLine.match(/\t/g) ?? []).length,
  };
  if (counts[';'] >= counts[','] && counts[';'] >= counts['\t']) return ';';
  if (counts['\t'] >= counts[',']) return '\t';
  return ',';
}

function parseCsv(text: string, sep: Separator): string[][] {
  return text
    .split(/\r?\n/)
    .filter((l) => l.length > 0)
    .slice(0, 5)
    .map((line) => line.split(sep));
}

export interface ConfigFileProps {
  value: FileConfig;
  onChange: (patch: Partial<FileConfig>) => void;
}

export function ConfigFile({ value, onChange }: ConfigFileProps) {
  const [rawText, setRawText] = useState<string | null>(null);

  useEffect(() => {
    if (!rawText || !value.separator) return;
    onChange({ preview: parseCsv(rawText, value.separator) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.separator, rawText]);

  const handleFiles = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    const base: Partial<FileConfig> = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      configureLater: false,
    };

    if (kindOf(file.name) === 'csv') {
      const slice = file.slice(0, 8 * 1024); // first 8KB is enough for 5 rows
      const text = await slice.text();
      const sep = detectSeparator(text.split(/\r?\n/)[0] ?? '');
      setRawText(text);
      onChange({ ...base, separator: sep, preview: parseCsv(text, sep) });
    } else {
      setRawText(null);
      onChange({ ...base, separator: undefined, preview: undefined });
    }
  };

  const handleRemove = () => {
    setRawText(null);
    onChange({
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      separator: undefined,
      preview: undefined,
    });
  };

  const Icon = value.fileName ? iconFor(value.fileName) : null;
  const isCsv = value.fileName ? kindOf(value.fileName) === 'csv' : false;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">
          Import de fichier
        </h2>
        <p className="text-sm text-muted-foreground">
          Déposez un fichier CSV, Excel, XML ou JSON. InvestHub analysera les
          colonnes détectées lors de l'étape 4.
        </p>
      </header>

      {!value.fileName ? (
        <FileDropZone
          accept=".csv,.xlsx,.xls,.xml,.json"
          hint="Formats acceptés : CSV, XLSX, XML, JSON (max. 20 Mo en démo)"
          onFiles={handleFiles}
        />
      ) : (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {Icon && <Icon aria-hidden className="size-6 text-muted-foreground" />}
            <div className="flex flex-1 flex-col">
              <span className="text-sm font-medium text-foreground">
                {value.fileName}
              </span>
              <span className="text-xs text-muted-foreground">
                {value.fileSize != null ? formatSize(value.fileSize) : '—'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              aria-label="Supprimer le fichier"
            >
              <Trash2 />
            </Button>
          </div>

          {isCsv && (
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="csv-separator" className="text-xs text-muted-foreground">
                Séparateur détecté
              </Label>
              <Select
                value={value.separator ?? ','}
                onValueChange={(v) => onChange({ separator: v as Separator })}
              >
                <SelectTrigger id="csv-separator" className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Virgule ( , )</SelectItem>
                  <SelectItem value=";">Point-virgule ( ; )</SelectItem>
                  <SelectItem value={'\t'}>Tabulation ( \t )</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {value.preview && value.preview.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <tbody>
                  {value.preview.map((row, i) => (
                    <tr
                      key={i}
                      className={i === 0 ? 'bg-muted/60 font-medium' : 'border-t border-border'}
                    >
                      {row.map((cell, j) => (
                        <td key={j} className="whitespace-nowrap px-3 py-1.5">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="recurring-switch" className="text-sm font-medium">
              Je déposerai ce fichier régulièrement
            </Label>
            <p className="text-xs text-muted-foreground">
              Choisissez le canal de dépôt récurrent. Les identifiants seront
              configurés à l'étape 4.
            </p>
          </div>
          <Switch
            id="recurring-switch"
            checked={value.recurring === true}
            onCheckedChange={(checked) =>
              onChange({
                recurring: checked,
                recurringKind: checked ? (value.recurringKind ?? 'manual') : undefined,
              })
            }
          />
        </div>

        {value.recurring && (
          <RadioGroup
            value={value.recurringKind ?? 'manual'}
            onValueChange={(v) => onChange({ recurringKind: v as RecurringKind })}
            className="gap-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="manual" id="kind-manual" />
              <Label htmlFor="kind-manual">Upload manuel depuis InvestHub</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ftp" id="kind-ftp" />
              <Label htmlFor="kind-ftp">Dépôt FTP / SFTP</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="url" id="kind-url" />
              <Label htmlFor="kind-url">URL d'upload dédiée</Label>
            </div>
          </RadioGroup>
        )}

        {value.recurring && value.recurringKind === 'ftp' && (
          <div className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="ftp-host" className="text-xs text-muted-foreground">
                  Hôte
                </Label>
                <Input
                  id="ftp-host"
                  placeholder="ftp.mondomaine.com"
                  value={value.ftpHost ?? ''}
                  onChange={(e) => onChange({ ftpHost: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="ftp-port" className="text-xs text-muted-foreground">
                  Port
                </Label>
                <Input
                  id="ftp-port"
                  placeholder="21"
                  value={value.ftpPort ?? ''}
                  onChange={(e) => onChange({ ftpPort: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="ftp-user" className="text-xs text-muted-foreground">
                  Utilisateur
                </Label>
                <Input
                  id="ftp-user"
                  placeholder="user"
                  value={value.ftpUser ?? ''}
                  onChange={(e) => onChange({ ftpUser: e.target.value })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Les identifiants seront configurés en Étape 4.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-4 py-3">
        <Checkbox
          id="configure-later"
          checked={value.configureLater === true}
          onCheckedChange={(checked) =>
            onChange({ configureLater: checked === true })
          }
        />
        <Label htmlFor="configure-later" className="text-sm">
          Je configurerai le fichier plus tard
        </Label>
      </div>
    </div>
  );
}

export default ConfigFile;
