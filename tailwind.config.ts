import type { Config } from 'tailwindcss';

/**
 * NOTE: `src/index.css` is currently a precompiled Tailwind v4 output
 * (no PostCSS/Tailwind build step is wired in `vite.config.ts`).
 * This config exposes the `datahub` color namespace as the source of truth.
 * CSS custom properties (--datahub-*) are defined in `src/index.css` for
 * both light (`:root`) and dark (`.dark`) modes; consumers can either:
 *   - use inline styles via `style={{ backgroundColor: 'var(--datahub-...)' }}` (works today), or
 *   - use Tailwind classes like `bg-datahub-status-published-bg` once the
 *     Tailwind pipeline is re-enabled.
 */
const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        datahub: {
          status: {
            published: {
              bg: 'var(--datahub-status-published-bg)',
              fg: 'var(--datahub-status-published-fg)',
              border: 'var(--datahub-status-published-border)',
            },
            draft: {
              bg: 'var(--datahub-status-draft-bg)',
              fg: 'var(--datahub-status-draft-fg)',
              border: 'var(--datahub-status-draft-border)',
            },
            unpublished: {
              bg: 'var(--datahub-status-unpublished-bg)',
              fg: 'var(--datahub-status-unpublished-fg)',
              border: 'var(--datahub-status-unpublished-border)',
            },
            changes: {
              bg: 'var(--datahub-status-changes-bg)',
              fg: 'var(--datahub-status-changes-fg)',
              border: 'var(--datahub-status-changes-border)',
            },
          },
          mode: {
            manual: {
              bg: 'var(--datahub-mode-manual-bg)',
              fg: 'var(--datahub-mode-manual-fg)',
              border: 'var(--datahub-mode-manual-border)',
            },
            file: {
              bg: 'var(--datahub-mode-file-bg)',
              fg: 'var(--datahub-mode-file-fg)',
              border: 'var(--datahub-mode-file-border)',
            },
            api: {
              bg: 'var(--datahub-mode-api-bg)',
              fg: 'var(--datahub-mode-api-fg)',
              border: 'var(--datahub-mode-api-border)',
            },
            mcp: {
              bg: 'var(--datahub-mode-mcp-bg)',
              fg: 'var(--datahub-mode-mcp-fg)',
              border: 'var(--datahub-mode-mcp-border)',
            },
          },
          pivot: {
            timeseries: {
              bg: 'var(--datahub-pivot-timeseries-bg)',
              fg: 'var(--datahub-pivot-timeseries-fg)',
              border: 'var(--datahub-pivot-timeseries-border)',
            },
            reference: {
              bg: 'var(--datahub-pivot-reference-bg)',
              fg: 'var(--datahub-pivot-reference-fg)',
              border: 'var(--datahub-pivot-reference-border)',
            },
            event: {
              bg: 'var(--datahub-pivot-event-bg)',
              fg: 'var(--datahub-pivot-event-fg)',
              border: 'var(--datahub-pivot-event-border)',
            },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
