#!/usr/bin/env node
/**
 * Le CSS Tailwind du projet est précompilé (src/index.css) : une classe absente de ce fichier
 * n'a aucun effet, sans erreur. Ce script liste, pour les fichiers donnés, les classes utilisées
 * dans className / cn(...) qui n'existent pas dans src/index.css.
 *
 * Usage : node scripts/check-tailwind-classes.mjs src/components/foo.tsx [autres fichiers...]
 *         node scripts/check-tailwind-classes.mjs --changed   (fichiers .tsx modifiés vs origin/main)
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');

let files = process.argv.slice(2);
if (files[0] === '--changed') {
  const base = process.argv[3] ?? 'origin/main';
  files = execSync(`git diff --name-only ${base} -- '*.tsx'`, { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean)
    .concat(execSync(`git ls-files --others --exclude-standard -- '*.tsx'`, { encoding: 'utf8' }).split('\n').filter(Boolean));
}

/** Classes propres au projet (définies hors Tailwind) ou marqueurs sans style. */
const IGNORE = new Set(['group', 'peer', 'rich-text', 'rich-text-surface', 'document-list-grid']);

const escapeSelector = (token) => token.replace(/([:[\]/.%(),#'!&>+~=*@])/g, '\\$1');

const extract = (source) => {
  const tokens = new Set();
  const strings = [];
  for (const match of source.matchAll(/className=\{?\s*["'`]([^"'`]*)["'`]/g)) strings.push(match[1]);
  for (const match of source.matchAll(/\bcn\(([^)]*)\)/g)) {
    for (const literal of match[1].matchAll(/["'`]([^"'`]*)["'`]/g)) strings.push(literal[1]);
  }
  for (const value of strings) {
    for (const token of value.split(/\s+/)) {
      if (!token || token.includes('${') || IGNORE.has(token)) continue;
      // Fragments d'expressions JS pris dans les littéraux (conditions, accès) : pas des classes.
      if (/[A-Z=?<>{}]|^[^a-z-]/.test(token) || (/\./.test(token) && !/-/.test(token))) continue;
      tokens.add(token);
    }
  }
  return tokens;
};

let missingTotal = 0;
for (const file of files) {
  const tokens = extract(readFileSync(file, 'utf8'));
  const missing = [...tokens].filter((token) => !css.includes(`.${escapeSelector(token)}`));
  if (missing.length > 0) {
    missingTotal += missing.length;
    console.log(`\n${file}`);
    for (const token of missing) console.log(`  ✗ ${token}`);
  }
}
if (missingTotal === 0) console.log('Toutes les classes existent dans src/index.css.');
process.exitCode = missingTotal > 0 ? 1 : 0;
