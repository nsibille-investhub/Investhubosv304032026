import { useRef, type CSSProperties, type ReactNode } from 'react';
import { Eye, FileCheck2, Trash2, UploadCloud, type LucideIcon } from 'lucide-react';
import { Button } from './button';
import { Label } from './label';
import { ModernMultiSelect } from './modern-multiselect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Switch } from './switch';
import { cn } from './utils';

/**
 * Briques des panneaux latéraux (Sheet) : détail d'un document, d'une alerte, d'un contact.
 * Section sur fond bleuté avec titre et icône, carte blanche intérieure, pied d'actions.
 */

const SECTION_STYLE: CSSProperties = { backgroundColor: '#EEF1F7', borderColor: '#000E2B1F' };
const CARD_STYLE: CSSProperties = { borderColor: '#000E2B33' };
export const SIDE_PANEL_ACCENT = '#000E2B';

/** Pastilles des multisélections (ModernMultiSelect) d'un panneau latéral. */
export const SIDE_PANEL_BADGE_STYLE: CSSProperties = {
  color: '#7a7a7a',
  borderColor: '#ddd7cc',
  backgroundColor: '#f5f3ee',
  border: '1px solid #ddd7cc',
};

/** Largeur des panneaux latéraux larges, avec l'animation d'entrée par la droite. */
export const SIDE_PANEL_WIDE_STYLE = {
  width: 'min(720px, 92vw)',
  maxWidth: 'none',
  ['--tw-enter-translate-x' as never]: '100%',
  ['--tw-exit-translate-x' as never]: '100%',
} as CSSProperties;

interface SidePanelSectionProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function SidePanelSection({ icon: Icon, title, description, className, children }: SidePanelSectionProps) {
  return (
    <section className={cn('space-y-3 rounded-2xl p-4 border', className)} style={SECTION_STYLE}>
      <div>
        <p className="font-semibold flex items-center gap-2" style={{ color: SIDE_PANEL_ACCENT }}>
          <Icon className="w-5 h-5" style={{ color: SIDE_PANEL_ACCENT }} />
          {title}
        </p>
        {description && <p className="text-sm text-slate-600">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/** Carte blanche d'une section. `flush` retire le padding, pour une liste à séparateurs par exemple. */
export function SidePanelCard({ flush, className, children }: { flush?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-2xl border bg-white', !flush && 'p-4 md:p-5', className)} style={CARD_STYLE}>
      {children}
    </div>
  );
}

export function SidePanelFooter({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('border-t bg-white px-6 py-4 flex justify-end gap-2', className)}>{children}</div>;
}

interface SidePanelSwitchRowProps {
  id?: string;
  label: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** Libellé et interrupteur sur une ligne, avec une précision facultative dessous. */
export function SidePanelSwitchRow({ id, label, description, checked, onCheckedChange, disabled }: SidePanelSwitchRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      </div>
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  );
}

export type ScopeMode = 'all' | 'some' | 'none';

/** Périmètre d'une dimension : tous, une sélection ou aucun. */
export interface ScopeValue {
  mode: ScopeMode;
  ids: string[];
}

interface SidePanelScopeFieldProps {
  id: string;
  label: string;
  value: ScopeValue;
  onChange: (value: ScopeValue) => void;
  options: { value: string; label: string; icon?: LucideIcon }[];
  /** Libellés des modes : « Tous les fonds », « Sélection », « Aucun fonds ». */
  modeLabels: Record<ScopeMode, string>;
  /** Le mode « aucun » n'a pas de sens pour toutes les dimensions (lien KYC : au moins une structure). */
  allowNone?: boolean;
  placeholder: string;
  searchPlaceholder: string;
}

/**
 * Champ de périmètre d'un panneau latéral : choix tous / sélection / aucun,
 * puis multisélection quand « sélection » est retenu.
 */
export function SidePanelScopeField({
  id,
  label,
  value,
  onChange,
  options,
  modeLabels,
  allowNone = true,
  placeholder,
  searchPlaceholder,
}: SidePanelScopeFieldProps) {
  const modes: ScopeMode[] = allowNone ? ['all', 'some', 'none'] : ['all', 'some'];
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value.mode} onValueChange={(mode) => onChange({ mode: mode as ScopeMode, ids: mode === 'some' ? value.ids : [] })}>
        <SelectTrigger id={id} className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {modes.map((mode) => (
            <SelectItem key={mode} value={mode}>
              {modeLabels[mode]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.mode === 'some' && (
        <ModernMultiSelect
          options={options}
          value={value.ids}
          onChange={(ids) => onChange({ mode: 'some', ids })}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          maxDisplay={3}
          showIconInBadge
          badgeStyle={SIDE_PANEL_BADGE_STYLE}
        />
      )}
    </div>
  );
}

interface SidePanelFileDropProps {
  fileName?: string;
  /** Aperçu image, si le fichier en a un. */
  previewUrl?: string;
  onSelectFile: (file: File) => void;
  onPreview?: () => void;
  /** Absent : le fichier ne peut pas être retiré. */
  onRemove?: () => void;
  /** Dépôt impossible (fichier figé). */
  disabled?: boolean;
  labels: { dropHint: string; dropHintDesc: string; fileReady: string; preview: string; remove: string };
}

/** Zone de dépôt d'un fichier (clic ou glisser-déposer), puis carte du fichier avec aperçu et suppression. */
export function SidePanelFileDrop({ fileName, previewUrl, onSelectFile, onPreview, onRemove, disabled, labels }: SidePanelFileDropProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const canUpload = !disabled;
  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelectFile(file);
          event.target.value = '';
        }}
      />
      <div
        onClick={() => canUpload && inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files?.[0];
          if (canUpload && file) onSelectFile(file);
        }}
        className={`rounded-xl border-2 border-dashed border-slate-300 bg-white/80 transition-colors p-5 ${
          canUpload ? 'hover:border-blue-400 cursor-pointer' : 'opacity-80'
        }`}
      >
        {!fileName ? (
          <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-600">
            <UploadCloud className="w-8 h-8 text-slate-500" />
            <p className="font-medium">{labels.dropHint}</p>
            <p className="text-xs text-slate-500">{labels.dropHintDesc}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {previewUrl ? (
                <img src={previewUrl} alt={fileName} className="w-14 h-14 rounded-lg object-cover border" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <FileCheck2 className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-slate-900">{fileName}</p>
                <p className="text-xs text-slate-500">{labels.fileReady}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPreview();
                  }}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  {labels.preview}
                </Button>
              )}
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove();
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  {labels.remove}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
