import React, { useEffect, useRef } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  Underline,
} from 'lucide-react';

import { useTranslation } from '../../utils/languageContext';
import { formatHtml } from '../../utils/htmlFormat';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { VARIABLE_DND_TYPE } from './MailTemplateVariablePanel';

const VARIABLE_RE = /\$[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)?/g;

/**
 * Logo d'affichage : $logo n'est pas une URL, une image cassée dans l'éditeur
 * visuel passerait pour un défaut. La substitution est purement visuelle et
 * annulée à la sérialisation.
 */
const DISPLAY_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="56">' +
      '<rect width="180" height="56" rx="6" fill="#0F323D"/>' +
      '<text x="90" y="34" font-family="Arial,Helvetica,sans-serif" font-size="16" ' +
      'fill="#ffffff" text-anchor="middle">$logo</text></svg>',
  );

/** Rendu d'une variable sous forme de pastille dans l'éditeur visuel. */
const PILL_STYLE =
  'background:#fef3c7;border:1px solid #f0c96b;border-radius:4px;padding:0 4px;' +
  'font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;white-space:nowrap';

function pill(name: string): string {
  return `<span data-var="${name}" contenteditable="false" style="${PILL_STYLE}">${name}</span>`;
}

/** Transforme les variables du HTML en pastilles, hors attributs. */
export function toPillHtml(html: string): string {
  return html
    .replace(/src="\$logo"/g, `src="${DISPLAY_LOGO}" data-src-var="$logo"`)
    .replace(/(<[^>]*>)|([^<]+)/g, (match, tag, text) => {
      if (tag) return tag;
      return (text as string).replace(VARIABLE_RE, (name) => pill(name));
    });
}

/** Reconvertit les pastilles en variables, puis remet le balisage en forme. */
export function fromPillHtml(html: string): string {
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('span[data-var]').forEach((node) => {
    node.replaceWith(document.createTextNode(node.getAttribute('data-var') ?? ''));
  });
  container.querySelectorAll('[data-src-var]').forEach((node) => {
    node.setAttribute('src', node.getAttribute('data-src-var') ?? '');
    node.removeAttribute('data-src-var');
  });
  // Le navigateur normalise le balisage : on le remet au format du référentiel.
  return formatHtml(container.innerHTML);
}

export interface MailTemplateWysiwygProps {
  /** HTML source, variables en clair. */
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Largeur de la surface d'édition, pour juger le rendu bureau ou mobile. */
  width: number;
}

export function MailTemplateWysiwyg({
  value,
  onChange,
  ariaLabel,
  width,
}: MailTemplateWysiwygProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement | null>(null);
  // Dernière valeur émise : évite de réécrire le DOM sous le curseur à chaque frappe.
  const emitted = useRef<string | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (emitted.current === value) return;
    node.innerHTML = toPillHtml(value);
    emitted.current = value;
  }, [value]);

  const emit = () => {
    const node = ref.current;
    if (!node) return;
    const next = fromPillHtml(node.innerHTML);
    emitted.current = next;
    onChange(next);
  };

  /**
   * Mise en forme via execCommand : l'API est dépréciée mais reste la seule
   * disponible sans dépendance pour piloter un contenu éditable.
   */
  const run = (command: string, argument?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, argument);
    emit();
  };

  const insertLink = () => {
    const url = window.prompt(t('mailTemplates.editor.linkPrompt'), 'https://');
    if (url) run('createLink', url);
  };

  return (
    <div className="h-[600px] flex flex-col bg-white dark:bg-gray-950">
      <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-1">
        <ToolbarButton
          icon={Bold}
          label={t('mailTemplates.editor.bold')}
          onClick={() => run('bold')}
        />
        <ToolbarButton
          icon={Italic}
          label={t('mailTemplates.editor.italic')}
          onClick={() => run('italic')}
        />
        <ToolbarButton
          icon={Underline}
          label={t('mailTemplates.editor.underline')}
          onClick={() => run('underline')}
        />
        <span className="mx-1 w-px h-5 bg-gray-200 dark:bg-gray-700" aria-hidden />
        <ToolbarButton
          icon={AlignLeft}
          label={t('mailTemplates.editor.alignLeft')}
          onClick={() => run('justifyLeft')}
        />
        <ToolbarButton
          icon={AlignCenter}
          label={t('mailTemplates.editor.alignCenter')}
          onClick={() => run('justifyCenter')}
        />
        <ToolbarButton
          icon={AlignRight}
          label={t('mailTemplates.editor.alignRight')}
          onClick={() => run('justifyRight')}
        />
        <span className="mx-1 w-px h-5 bg-gray-200 dark:bg-gray-700" aria-hidden />
        <ToolbarButton
          icon={Link2}
          label={t('mailTemplates.editor.insertLink')}
          onClick={insertLink}
        />
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        aria-label={ariaLabel}
        onInput={emit}
        onBlur={() => {
          // Les variables saisies à la main deviennent des pastilles à la sortie du champ.
          const node = ref.current;
          if (!node) return;
          const next = fromPillHtml(node.innerHTML);
          node.innerHTML = toPillHtml(next);
          emitted.current = next;
          onChange(next);
        }}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes(VARIABLE_DND_TYPE)) {
            event.dataTransfer.dropEffect = 'copy';
          }
        }}
        onDrop={() => {
          // Le navigateur insère le texte au point de dépôt, on repasse ensuite en pastilles.
          requestAnimationFrame(() => {
            const node = ref.current;
            if (!node) return;
            const next = fromPillHtml(node.innerHTML);
            node.innerHTML = toPillHtml(next);
            emitted.current = next;
            onChange(next);
          });
        }}
        style={{ width, maxWidth: '100%' }}
        className="mx-auto mt-4 mb-4 bg-white px-6 py-5 text-sm leading-relaxed text-gray-900 shadow-sm outline-none"
      />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          // onMouseDown pour ne pas perdre la sélection courante avant la commande.
          onMouseDown={(event) => event.preventDefault()}
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
