import type { CollectionColumnType } from '../types';

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const NUMBER_RE = /^-?\d+([.,]\d+)?$/;
const URL_RE = /^https?:\/\//i;

function isEmpty(v: unknown): boolean {
  return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
}

function looksBoolean(v: unknown): boolean {
  if (typeof v === 'boolean') return true;
  if (typeof v !== 'string') return false;
  const lower = v.trim().toLowerCase();
  return lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no';
}

function looksNumber(v: unknown): boolean {
  if (typeof v === 'number' && Number.isFinite(v)) return true;
  if (typeof v !== 'string') return false;
  return NUMBER_RE.test(v.trim());
}

function looksIsoDate(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  return ISO_DATE_RE.test(v.trim());
}

function looksIsoDatetime(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  return ISO_DATETIME_RE.test(v.trim());
}

function looksUrl(v: unknown): boolean {
  if (typeof v !== 'string') return false;
  return URL_RE.test(v.trim());
}

const CURRENCY_HINTS = /(amount|montant|price|prix|nav|value|valeur|€|eur|usd|commit)/i;
const PERCENT_HINTS = /(pct|percent|ratio|irr|tvpi|dpi|rate|taux|%)/i;

/**
 * Infer the most plausible `CollectionColumnType` from a column name and a
 * sample of values. Rules:
 *  - boolean-like values across the board → 'boolean'
 *  - numeric-like values → 'currency' / 'percentage' / 'number' based on name
 *  - ISO datetimes → 'datetime' ; ISO dates → 'date'
 *  - URL-shaped strings → 'url'
 *  - otherwise → 'text'
 *
 * Null / undefined / empty strings are ignored. If no non-empty sample is
 * provided, returns 'text'.
 */
export function inferColumnType(
  columnName: string,
  samples: ReadonlyArray<unknown>,
): CollectionColumnType {
  const nonEmpty = samples.filter((s) => !isEmpty(s));
  if (nonEmpty.length === 0) return 'text';

  if (nonEmpty.every(looksBoolean)) return 'boolean';
  if (nonEmpty.every(looksIsoDatetime)) return 'datetime';
  if (nonEmpty.every(looksIsoDate)) return 'date';
  if (nonEmpty.every(looksUrl)) return 'url';

  if (nonEmpty.every(looksNumber)) {
    if (PERCENT_HINTS.test(columnName)) return 'percentage';
    if (CURRENCY_HINTS.test(columnName)) return 'currency';
    return 'number';
  }

  return 'text';
}

/**
 * Humanize a snake_case technical name into a readable label
 * (e.g. "fund_id" → "Fund id", "period_end" → "Period end").
 */
export function humanizeLabel(technicalName: string): string {
  const trimmed = technicalName.trim().replace(/_+/g, ' ');
  if (trimmed.length === 0) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
