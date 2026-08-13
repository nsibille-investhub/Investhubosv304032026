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

/** Assemble logo, corps, signature et pied dans l'ordre du référentiel. */
export function html(lang: 'fr' | 'en', body: string[]): string {
  return [LOGO, ...body, lang === 'fr' ? SIGN_FR : SIGN_EN, lang === 'fr' ? FOOTER_FR : FOOTER_EN].join(
    '\n',
  );
}
