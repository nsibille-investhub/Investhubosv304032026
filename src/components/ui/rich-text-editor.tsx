import { useEffect, useRef } from 'react';
import { Bold, Italic, Link2, List, ListOrdered, Underline } from 'lucide-react';
import { useTranslation } from '../../utils/languageContext';
import { Button } from './button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { cn } from './utils';

interface RichTextEditorProps {
  /** Contenu HTML. */
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Bold;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          disabled={disabled}
          // onMouseDown pour garder la sélection courante avant la commande.
          onMouseDown={event => event.preventDefault()}
          onClick={onClick}
          className="h-8 w-8"
        >
          <Icon className="w-3.5 h-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Éditeur riche minimal : gras, italique, souligné, listes, lien.
 * Mise en forme via execCommand, API dépréciée mais seule disponible sans dépendance.
 */
export function RichTextEditor({ value, onChange, ariaLabel, id, disabled = false, invalid = false, className }: RichTextEditorProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement | null>(null);
  // Dernière valeur émise : évite de réécrire le DOM sous le curseur à chaque frappe.
  const emitted = useRef<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || emitted.current === value) return;
    node.innerHTML = value;
    emitted.current = value;
  }, [value]);

  const emit = () => {
    const node = ref.current;
    if (!node) return;
    emitted.current = node.innerHTML;
    onChange(node.innerHTML);
  };

  const run = (command: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  };

  const insertLink = () => {
    const url = window.prompt(t('common.richTextEditor.linkPrompt'), 'https://');
    if (url) run('createLink', url);
  };

  return (
    <div
      aria-invalid={invalid || undefined}
      className={cn(
        'flex flex-col overflow-hidden rounded-md border border-border bg-card',
        'aria-invalid:border-destructive',
        disabled && 'opacity-50',
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-border px-2 py-1">
        <ToolbarButton icon={Bold} label={t('common.richTextEditor.bold')} onClick={() => run('bold')} disabled={disabled} />
        <ToolbarButton icon={Italic} label={t('common.richTextEditor.italic')} onClick={() => run('italic')} disabled={disabled} />
        <ToolbarButton icon={Underline} label={t('common.richTextEditor.underline')} onClick={() => run('underline')} disabled={disabled} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton icon={List} label={t('common.richTextEditor.bulletList')} onClick={() => run('insertUnorderedList')} disabled={disabled} />
        <ToolbarButton icon={ListOrdered} label={t('common.richTextEditor.numberedList')} onClick={() => run('insertOrderedList')} disabled={disabled} />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <ToolbarButton icon={Link2} label={t('common.richTextEditor.link')} onClick={insertLink} disabled={disabled} />
      </div>
      <div
        id={id}
        ref={ref}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label={ariaLabel}
        onInput={emit}
        className="rich-text rich-text-surface px-3 py-2 text-sm leading-relaxed text-foreground outline-none"
      />
    </div>
  );
}
