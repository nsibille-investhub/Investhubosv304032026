# Project conventions for Claude

## i18n is mandatory

**Every user-facing string MUST be translated.** Never hardcode literals in
French (or any language) inside components. This applies to:

- Visible text, labels, placeholders, button captions
- Tooltip content, toast messages, dialog titles/descriptions
- `aria-label`, `title`, empty states, validation/error messages
- Option labels in selects, dropdowns, tabs, and table headers

Strings that are **not** user-facing (logs, internal `value` keys, test ids,
data-testid, technical enum values, route paths) stay untranslated.

### Translation system

- Locales live in `src/locales/en.json` and `src/locales/fr.json`.
- Both files MUST be updated together with the same key tree. Never add a key
  to one without the other.
- Components use the `useTranslation()` hook from `src/utils/languageContext`:

  ```tsx
  const { t } = useTranslation();
  return <Button>{t('namespace.subkey')}</Button>;
  ```

- Use dot-notation keys nested under the relevant feature namespace
  (e.g. `ged.dataRoom.massUpload.wizard.*`). Reuse existing namespaces before
  inventing a new one — `grep` the locales first.
- For interpolation, use `{{var}}` placeholders, e.g. `"Hello {{name}}"`.
- For pluralization, follow the existing `xxxOne` / `xxxMany` pattern already
  used in the codebase.

### Module-level static data

Arrays/maps defined at module scope cannot call `t()` (the hook isn't
available there). Store the **translation key** instead and translate at
render time:

```ts
// ❌ Wrong — hardcoded label
const items = [{ value: 'none', label: 'Aucun template' }];

// ✅ Right — labelKey resolved at render
const items = [{ value: 'none', labelKey: 'documents.templates.none' }];
// later, inside the component:
items.map(it => <span>{t(it.labelKey)}</span>);
```

### When adding a new feature

1. Add the English string to `src/locales/en.json` first.
2. Add the matching French string to `src/locales/fr.json` at the same key.
3. In the component, call `t('your.key')` — never inline the literal.
4. If you find existing hardcoded strings near your changes, translate them
   too (only the ones in the area you're touching — don't sweep the whole
   codebase unprompted).

### Verifying

After edits, run a quick check that no obvious French/English literals were
left behind in the JSX you touched:

```bash
grep -nE '>[A-Z][a-zà-ÿ]+ ' src/components/<file>.tsx | head
```

## Other conventions

- TypeScript-first: no `any` unless justified.
- Prefer editing existing files over creating new ones.
- Don't add comments that just describe what the code does.
