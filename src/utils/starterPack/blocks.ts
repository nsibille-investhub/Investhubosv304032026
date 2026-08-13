/**
 * Enveloppe standard du Starter Pack.
 *
 * Chaque contenu commence par le logo de la plateforme et se termine par le pied
 * standard : signature d'équipe, copyright et lien miroir. Ces fragments sont
 * identiques dans les 112 gabarits : ils sont définis une fois ici et assemblés
 * par `html()`, de façon à ce que la chaîne produite soit exactement celle du
 * référentiel.
 */

export const LOGO =
  '<p style="text-align:center;margin:0 0 24px"><img src="$logo" alt="$appname" style="max-height:56px"></p>';

export const SIGN_FR = "<p>Cordialement,<br>L'équipe $appname</p>";
export const SIGN_EN = '<p>Best regards,<br>The $appname team</p>';

const HR = '<hr style="border:none;border-top:1px solid #e0e0e0;margin:24px 0 12px">';

export const FOOTER_FR = `${HR}
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">Voir ce message dans votre navigateur</a></p>`;

export const FOOTER_EN = `${HR}
<p style="font-size:12px;color:#888888">&copy; $year $appname &middot; <a href="$mirror" style="color:#888888">View this message in your browser</a></p>`;

/** Bouton d'action principal. */
export function cta(href: string, label: string): string {
  return `<p style="text-align:center;margin:24px 0"><a href="${href}" style="background:#1a1a2e;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block">${label}</a></p>`;
}

/** Montant ou valeur mise en avant, centrée. */
export function highlight(content: string, fontSize = 22): string {
  return `<p style="text-align:center;font-size:${fontSize}px;margin:20px 0"><strong>${content}</strong></p>`;
}

/** Code à usage unique, très espacé. */
export function code(variable = '$code'): string {
  return `<p style="text-align:center;font-size:32px;letter-spacing:6px;margin:24px 0"><strong>${variable}</strong></p>`;
}

/** Bloc centré sans mise en exergue typographique. */
export function centered(content: string): string {
  return `<p style="text-align:center;margin:20px 0">${content}</p>`;
}

/** Citation du message libre saisi par l'expéditeur. */
export function quote(content: string): string {
  return `<p style="margin:16px 0;padding:12px 16px;border-left:3px solid #e0e0e0;color:#555555">${content}</p>`;
}

/** Reprise d'une question ou d'un message entrant, filet à gauche. */
export function quoteLeft(content: string): string {
  return `<p style="border-left:3px solid #e0e0e0;padding-left:12px;margin:20px 0">${content}</p>`;
}

/** Bloc centré à taille de police imposée, sans mise en gras automatique. */
export function centeredSize(content: string, fontSize: number): string {
  return `<p style="text-align:center;font-size:${fontSize}px;margin:20px 0">${content}</p>`;
}

/** Tableau récapitulatif libellé / valeur. */
export function table(rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#888888">${label}</td><td style="padding:6px 12px">${value}</td></tr>`,
    )
    .join('\n');
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0">
${body}
</table>`;
}

/**
 * Récapitulatif chiffré : libellé à gauche, valeur alignée à droite, filet
 * entre les lignes. La dernière ligne n'a pas de filet bas.
 */
export function recap(rows: Array<[string, string]>): string {
  const body = rows
    .map(([label, value], index) => {
      const rule = index === rows.length - 1 ? '' : ';border-bottom:1px solid #e0e0e0';
      return `<tr><td style="padding:6px 12px${rule}">${label}</td><td style="padding:6px 12px${rule};text-align:right">${value}</td></tr>`;
    })
    .join('\n');
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0">
${body}
</table>`;
}

/** Motif saisi par l'opérateur, mis en avant par un filet accentué. */
export function reason(content: string): string {
  return `<p style="margin:20px 0;padding:12px 16px;border-left:3px solid #1a1a2e"><strong>${content}</strong></p>`;
}

/** Encadré gris, utilisé pour reprendre un motif saisi par le gestionnaire. */
export function note(content: string): string {
  return `<p style="background:#f5f5f5;padding:12px 16px;border-radius:4px">${content}</p>`;
}

/**
 * Assemble logo, corps, signature et pied dans l'ordre du référentiel.
 *
 * Quelques gabarits de diffusion, comme la newsletter, n'ont pas de signature
 * d'équipe : le contenu porte déjà la sienne. `signature: false` les couvre.
 */
export function html(
  lang: 'fr' | 'en',
  body: string[],
  options: { signature?: boolean } = {},
): string {
  const { signature = true } = options;
  const parts = [LOGO, ...body];
  if (signature) parts.push(lang === 'fr' ? SIGN_FR : SIGN_EN);
  parts.push(lang === 'fr' ? FOOTER_FR : FOOTER_EN);
  return parts.join('\n');
}
