import React, { useMemo, useRef } from 'react';

import { tokenizeHtml, type TokenKind } from '../../utils/htmlFormat';
import { cn } from '../ui/utils';
import { VARIABLE_DND_TYPE } from './MailTemplateVariablePanel';

/**
 * Coloration posée derrière la zone de saisie : le texte du <textarea> est
 * transparent, la couche colorée reprend exactement les mêmes métriques.
 */
const TOKEN_CLASS: Record<TokenKind, string> = {
  tag: 'text-blue-700 dark:text-blue-300',
  attrName: 'text-purple-700 dark:text-purple-300',
  attrValue: 'text-emerald-700 dark:text-emerald-300',
  variable:
    'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-100 rounded-sm font-semibold',
  entity: 'text-orange-700 dark:text-orange-300',
  text: 'text-gray-800 dark:text-gray-300',
  punctuation: 'text-gray-400 dark:text-gray-500',
};

/** Métriques partagées par la couche colorée et la zone de saisie. */
const SHARED = 'p-3 font-mono text-[12px] whitespace-pre-wrap break-words';

export interface MailTemplateSourceEditorProps {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  editorRef?: React.MutableRefObject<HTMLTextAreaElement | null>;
}

export function MailTemplateSourceEditor({
  value,
  onChange,
  ariaLabel,
  editorRef,
}: MailTemplateSourceEditorProps) {
  const localRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = useRef<HTMLPreElement | null>(null);
  const textareaRef = editorRef ?? localRef;

  const tokens = useMemo(() => tokenizeHtml(value), [value]);

  // Le défilement de la couche colorée suit celui de la saisie.
  const syncScroll = () => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) return;
    overlay.scrollTop = textarea.scrollTop;
    overlay.scrollLeft = textarea.scrollLeft;
  };

  return (
    <div className="relative h-[600px] bg-gray-50 dark:bg-gray-900/60">
      <pre
        ref={overlayRef}
        aria-hidden
        className={cn('absolute inset-0 m-0 overflow-hidden pointer-events-none', SHARED)}
      >
        {tokens.map((token, index) => (
          <span key={index} className={TOKEN_CLASS[token.kind]}>
            {token.value}
          </span>
        ))}
        {'\n'}
      </pre>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes(VARIABLE_DND_TYPE)) {
            event.dataTransfer.dropEffect = 'copy';
          }
        }}
        spellCheck={false}
        aria-label={ariaLabel}
        style={{ caretColor: 'currentColor' }}
        className={cn(
          'absolute inset-0 w-full h-full resize-none border-0 bg-transparent text-transparent outline-none',
          SHARED,
        )}
      />
    </div>
  );
}
