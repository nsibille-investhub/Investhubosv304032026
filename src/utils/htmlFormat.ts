/**
 * Mise en forme et coloration du HTML des gabarits de mails.
 *
 * Le HTML des mails est du balisage plat avec des styles inline : pas besoin d'un
 * parseur complet. Le formatage réindente les blocs, la tokenisation alimente la
 * couche de coloration posée derrière la zone de saisie.
 */

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

/** Balises dont le contenu reste sur une seule ligne. */
const INLINE_TAGS = new Set([
  'a',
  'b',
  'br',
  'em',
  'i',
  'img',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'u',
]);

const INDENT = '  ';

/**
 * Réindente le balisage : un bloc par ligne, contenu inline conservé tel quel.
 * Les espaces à l'intérieur du texte ne sont pas touchés.
 */
export function formatHtml(html: string): string {
  const parts = html
    .replace(/>\s*\n\s*</g, '><')
    .split(/(<[^>]+>)/)
    .filter((part) => part !== '');

  const lines: string[] = [];
  let depth = 0;
  let buffer = '';
  let inlineDepth = 0;

  const flush = () => {
    if (buffer.trim() === '') {
      buffer = '';
      return;
    }
    lines.push(INDENT.repeat(Math.max(0, depth)) + buffer.trim());
    buffer = '';
  };

  for (const part of parts) {
    const tagMatch = /^<\/?([a-zA-Z][\w-]*)/.exec(part);

    if (!tagMatch) {
      buffer += part;
      continue;
    }

    const tag = tagMatch[1].toLowerCase();
    const isClosing = part.startsWith('</');
    const isSelfClosing = part.endsWith('/>') || VOID_TAGS.has(tag);
    const isInline = INLINE_TAGS.has(tag);

    if (isInline || inlineDepth > 0) {
      buffer += part;
      if (!isSelfClosing) {
        inlineDepth += isClosing ? -1 : 1;
        if (inlineDepth < 0) inlineDepth = 0;
      }
      continue;
    }

    if (isClosing) {
      flush();
      depth -= 1;
      lines.push(INDENT.repeat(Math.max(0, depth)) + part);
      continue;
    }

    flush();
    lines.push(INDENT.repeat(Math.max(0, depth)) + part);
    if (!isSelfClosing) depth += 1;
  }

  flush();
  return collapseShortBlocks(lines).join('\n');
}

/** Longueur au-delà de laquelle un bloc reste éclaté sur plusieurs lignes. */
const COLLAPSE_LIMIT = 120;

/**
 * Recolle sur une seule ligne les blocs dont le contenu tient d'un tenant :
 * un paragraphe court ne gagne rien à occuper trois lignes.
 */
function collapseShortBlocks(lines: string[]): string[] {
  const result: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const open = lines[index];
    const middle = lines[index + 1];
    const close = lines[index + 2];
    const openTag = /^\s*<([a-zA-Z][\w-]*)[^>]*>$/.exec(open ?? '');
    const closeTag = /^\s*<\/([a-zA-Z][\w-]*)>$/.exec(close ?? '');

    const collapsible =
      openTag &&
      closeTag &&
      openTag[1].toLowerCase() === closeTag[1].toLowerCase() &&
      middle !== undefined &&
      !/^\s*<\/?(p|div|table|tr|td|th|tbody|thead|ul|ol|li|hr|h[1-6])\b/i.test(middle);

    if (collapsible) {
      const indent = /^\s*/.exec(open)?.[0] ?? '';
      const single = `${open.trimEnd()}${middle.trim()}${close.trim()}`;
      if (single.length - indent.length <= COLLAPSE_LIMIT) {
        result.push(single);
        index += 3;
        continue;
      }
    }

    result.push(open);
    index += 1;
  }

  return result;
}

export type TokenKind =
  | 'tag'
  | 'attrName'
  | 'attrValue'
  | 'variable'
  | 'text'
  | 'entity'
  | 'punctuation';

export interface Token {
  kind: TokenKind;
  value: string;
}

const VARIABLE_RE = /\$[a-zA-Z_][\w]*(?:\.[a-zA-Z_][\w]*)*/g;
const ENTITY_RE = /&[a-zA-Z]+;|&#\d+;/g;

/** Découpe une portion de texte en variables, entités et texte brut. */
function splitInterpolated(value: string): Token[] {
  const tokens: Token[] = [];
  const markers: Array<{ start: number; end: number; kind: TokenKind }> = [];

  for (const re of [VARIABLE_RE, ENTITY_RE]) {
    const matcher = new RegExp(re.source, 'g');
    let match = matcher.exec(value);
    while (match) {
      markers.push({
        start: match.index,
        end: match.index + match[0].length,
        kind: re === VARIABLE_RE ? 'variable' : 'entity',
      });
      match = matcher.exec(value);
    }
  }

  markers.sort((a, b) => a.start - b.start);

  let cursor = 0;
  for (const marker of markers) {
    if (marker.start < cursor) continue;
    if (marker.start > cursor) {
      tokens.push({ kind: 'text', value: value.slice(cursor, marker.start) });
    }
    tokens.push({ kind: marker.kind, value: value.slice(marker.start, marker.end) });
    cursor = marker.end;
  }
  if (cursor < value.length) {
    tokens.push({ kind: 'text', value: value.slice(cursor) });
  }
  return tokens;
}

/** Tokenise le balisage pour la coloration. Le texte concaténé reste identique à l'entrée. */
export function tokenizeHtml(html: string): Token[] {
  const tokens: Token[] = [];
  const parts = html.split(/(<[^>]*>)/);

  for (const part of parts) {
    if (part === '') continue;

    if (!part.startsWith('<')) {
      tokens.push(...splitInterpolated(part));
      continue;
    }

    // <tag attr="value" attr2='value'>
    const inner = /^<\/?[a-zA-Z][\w-]*/.exec(part);
    if (!inner) {
      tokens.push({ kind: 'text', value: part });
      continue;
    }

    tokens.push({ kind: 'tag', value: inner[0] });
    let rest = part.slice(inner[0].length);

    const attrRe = /([\w:-]+)(\s*=\s*)("[^"]*"|'[^']*')?/g;
    let cursor = 0;
    let match = attrRe.exec(rest);
    while (match) {
      if (match.index > cursor) {
        tokens.push({ kind: 'punctuation', value: rest.slice(cursor, match.index) });
      }
      tokens.push({ kind: 'attrName', value: match[1] });
      tokens.push({ kind: 'punctuation', value: match[2] });
      if (match[3]) {
        const quote = match[3][0];
        tokens.push({ kind: 'punctuation', value: quote });
        tokens.push(...splitInterpolated(match[3].slice(1, -1)).map((token) => ({
          ...token,
          kind: token.kind === 'text' ? ('attrValue' as TokenKind) : token.kind,
        })));
        tokens.push({ kind: 'punctuation', value: quote });
      }
      cursor = match.index + match[0].length;
      match = attrRe.exec(rest);
    }
    if (cursor < rest.length) {
      tokens.push({ kind: 'punctuation', value: rest.slice(cursor) });
    }
    rest = '';
  }

  return tokens;
}
