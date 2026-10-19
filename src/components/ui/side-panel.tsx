import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Label } from './label';
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
