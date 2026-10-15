import type React from 'react';

/**
 * Tons sémantiques partagés par les pastilles, compteurs, points d'état et surfaces.
 * Chaque ton ne référence que des tokens de thème (clair et sombre).
 * Le bleu "info" s'appuie sur --primary : aucun token bleu dédié n'existe.
 */
export type Tone =
  | 'neutral'
  | 'outline'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'strong';

interface ToneTokens {
  fg: string;
  soft: string;
  border: string;
  dot: string;
}

const mix = (token: string, percent: number) =>
  `color-mix(in oklab, var(${token}) ${percent}%, transparent)`;

export const TONE_TOKENS: Record<Tone, ToneTokens> = {
  neutral: {
    fg: 'var(--muted-foreground)',
    soft: 'var(--muted)',
    border: 'var(--border)',
    dot: 'var(--border)',
  },
  outline: {
    fg: 'var(--muted-foreground)',
    soft: 'var(--card)',
    border: 'var(--border)',
    dot: 'var(--muted-foreground)',
  },
  info: {
    fg: 'var(--primary)',
    soft: mix('--primary', 10),
    border: mix('--primary', 25),
    dot: 'var(--primary)',
  },
  success: {
    fg: 'var(--success)',
    soft: 'var(--success-soft)',
    border: mix('--success', 25),
    dot: 'var(--success)',
  },
  warning: {
    fg: 'var(--warning)',
    soft: 'var(--warning-soft)',
    border: mix('--warning', 25),
    dot: 'var(--warning)',
  },
  danger: {
    fg: 'var(--danger)',
    soft: 'var(--danger-soft)',
    border: mix('--danger', 25),
    dot: 'var(--danger)',
  },
  strong: {
    fg: 'var(--foreground)',
    soft: mix('--foreground', 12),
    border: mix('--foreground', 30),
    dot: 'var(--foreground)',
  },
};

export const toneText = (tone: Tone): React.CSSProperties => ({
  color: TONE_TOKENS[tone].fg,
});

export const toneDot = (tone: Tone): React.CSSProperties => ({
  backgroundColor: TONE_TOKENS[tone].dot,
});

export const toneSurface = (tone: Tone): React.CSSProperties => ({
  backgroundColor: TONE_TOKENS[tone].soft,
  color: TONE_TOKENS[tone].fg,
  borderColor: TONE_TOKENS[tone].border,
});
