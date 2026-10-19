import { useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronDown, ChevronRight, Copy, type LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '../../utils/languageContext';
import { copyToClipboard } from '../../utils/clipboard';
import { ClickableText } from '../ClickableText';
import { HighlightText } from '../HighlightText';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';

/**
 * Briques des listings (référence : listing des investisseurs).
 * Carte du listing, cellule nom, pastille de type, compteur cliquable, cellule multiple à carte de détail.
 * Actions de ligne : TableRowActions (ui/row-actions).
 */

interface ListingCardProps {
  /** Barre au-dessus du tableau : FilterBar, bouton d'ajout. */
  toolbar?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function ListingCard({ toolbar, footer, className, children }: ListingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 25 }}
      className={cn(
        'bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg dark:hover:shadow-gray-900 transition-shadow duration-500 flex flex-col',
        className,
      )}
    >
      {toolbar && <div className="relative z-10 p-4 border-b border-gray-100 dark:border-gray-800">{toolbar}</div>}
      <div className="flex-1">{children}</div>
      {footer}
    </motion.div>
  );
}

interface ListingNameCellProps {
  name: string;
  searchTerm?: string;
  /** Identifiant affiché sous le nom, copiable. */
  id?: string | number;
  /** Ligne secondaire libre, à la place de l'identifiant. */
  secondary?: ReactNode;
  /** Élément accolé au nom : drapeau, picto. */
  adornment?: ReactNode;
  className?: string;
}

export function ListingNameCell({ name, searchTerm = '', id, secondary, adornment, className }: ListingNameCellProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (id === undefined) return;
    const success = await copyToClipboard(String(id));
    if (!success) {
      toast.error(t('common.listing.copyError'));
      return;
    }
    setCopied(true);
    toast.success(t('common.listing.idCopied'), { description: String(id) });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex flex-col gap-1 max-w-[300px]', className)}>
      <motion.div whileHover={{ x: 2 }} title={name} className="flex items-center gap-2 text-sm font-medium cursor-pointer transition-all min-w-0">
        <ClickableText className="truncate">
          <HighlightText text={name} searchTerm={searchTerm} />
        </ClickableText>
        {adornment}
      </motion.div>
      {id !== undefined ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">{t('common.listing.id', { id })}</span>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={copy}
            aria-label={t('common.listing.copyId')}
            title={t('common.listing.copyId')}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
          </motion.button>
        </div>
      ) : secondary ? (
        <span className="text-xs text-gray-500 truncate">{secondary}</span>
      ) : null}
    </div>
  );
}

/** Pastille neutre de type (Entreprise, Particulier, SAS...), avec icône. */
export function ListingTypeTag({ icon: Icon, label }: { icon?: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-colors bg-muted text-muted-foreground border-border whitespace-nowrap">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </div>
  );
}

interface ListingCountTagProps {
  icon: LucideIcon;
  count: number;
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
}

/** Compteur cliquable (souscriptions, contacts...) qui ouvre le détail. */
export function ListingCountTag({ icon: Icon, count, onClick, ariaLabel, disabled }: ListingCountTagProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border transition-all duration-200 cursor-pointer group hover:scale-[1.03] hover:shadow-md hover:border-border/80 hover:bg-white disabled:pointer-events-none disabled:opacity-50"
    >
      <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground tabular-nums">{count}</span>
      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

interface ListingStackCellProps {
  icon: LucideIcon;
  /** Libellés affichés : le premier en clair, les autres comptés en « +n ». */
  items: string[];
  /** En-tête de la carte de détail. */
  title: string;
  subtitle?: string;
  /** Contenu de la carte de détail ouverte au clic. */
  children: ReactNode;
  /** Largeur de la carte, en classe Tailwind. */
  cardClassName?: string;
}

/**
 * Cellule « un élément + n autres » d'un listing (structures, accès, rôles...).
 * Au clic, une carte présente le détail complet. Référence : colonne Structure du listing investisseurs.
 */
export function ListingStackCell({ icon: Icon, items, title, subtitle, children, cardClassName }: ListingStackCellProps) {
  const { t } = useTranslation();
  if (items.length === 0) return <span className="text-gray-400 text-sm">—</span>;
  const remaining = items.length - 1;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <motion.button
          type="button"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex flex-col items-start gap-1 text-xs group max-w-full"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors max-w-full">
            <Icon className="w-3 h-3 shrink-0 text-gray-400 group-hover:text-primary transition-colors" />
            <span className="truncate max-w-[160px] group-hover:underline" title={items[0]}>
              {items[0]}
            </span>
            <ChevronRight className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-100 transition-all" />
          </span>
          {remaining > 0 && (
            <span className="flex items-center gap-1 text-primary ml-[18px] font-medium">
              {t('common.listing.more', { count: remaining })}
              <ChevronDown className="w-3 h-3" />
            </span>
          )}
        </motion.button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-96 p-0', cardClassName)}
        align="start"
        side="right"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-muted text-foreground">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
            </div>
          </div>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Ligne de la carte de détail d'une ListingStackCell : intitulé à gauche, valeur à droite. */
export function ListingStackRow({ icon: Icon, label, children }: { icon?: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
      <span className="flex min-w-[140px] flex-1 items-center gap-2 text-sm font-medium text-gray-900">
        {Icon && <Icon className="w-4 h-4 shrink-0 text-gray-400" />}
        <span className="truncate" title={label}>
          {label}
        </span>
      </span>
      <span className="flex flex-wrap justify-end gap-1.5">{children}</span>
    </div>
  );
}
