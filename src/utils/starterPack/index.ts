import { SECTION_01_ACCOUNTS } from './section-01-accounts';
import { SECTION_02_ONBOARDING } from './section-02-onboarding';
import { SECTION_03_SIGNATURE } from './section-03-signature';
import { SECTION_04_KYC } from './section-04-kyc';
import { SECTION_05_PAYMENTS } from './section-05-payments';
import { SECTION_06_CAPITAL_CALLS } from './section-06-capital-calls';
import { SECTION_07_DISTRIBUTIONS } from './section-07-distributions';
import { SECTION_08_REDEMPTIONS } from './section-08-redemptions';
import { SECTION_09_SECONDARY } from './section-09-secondary';
import { SECTION_10_DOCUMENTS } from './section-10-documents';
import { SECTION_11_PARTNERS } from './section-11-partners';
import { SECTION_12_COMMUNICATION } from './section-12-communication';
import type { StarterPackTemplate, TemplateSectionKey } from './types';

export * from './types';

export const SECTION_ORDER: TemplateSectionKey[] = [
  'accounts',
  'onboarding',
  'signature',
  'kyc',
  'payments',
  'capitalCalls',
  'distributions',
  'redemptions',
  'secondary',
  'documents',
  'partners',
  'communication',
];

/** Numéro de section du Starter Pack, repris comme repère dans l'écran. */
export const SECTION_NUMBER: Record<TemplateSectionKey, number> = {
  accounts: 1,
  onboarding: 2,
  signature: 3,
  kyc: 4,
  payments: 5,
  capitalCalls: 6,
  distributions: 7,
  redemptions: 8,
  secondary: 9,
  documents: 10,
  partners: 11,
  communication: 12,
};

/** Volumétrie annoncée par le sommaire du Starter Pack. */
export const EXPECTED_SECTION_COUNTS: Record<TemplateSectionKey, number> = {
  accounts: 16,
  onboarding: 18,
  signature: 6,
  kyc: 13,
  payments: 3,
  capitalCalls: 7,
  distributions: 7,
  redemptions: 7,
  secondary: 9,
  documents: 5,
  partners: 12,
  communication: 9,
};

const SECTIONS: Record<TemplateSectionKey, StarterPackTemplate[]> = {
  accounts: SECTION_01_ACCOUNTS,
  onboarding: SECTION_02_ONBOARDING,
  signature: SECTION_03_SIGNATURE,
  kyc: SECTION_04_KYC,
  payments: SECTION_05_PAYMENTS,
  capitalCalls: SECTION_06_CAPITAL_CALLS,
  distributions: SECTION_07_DISTRIBUTIONS,
  redemptions: SECTION_08_REDEMPTIONS,
  secondary: SECTION_09_SECONDARY,
  documents: SECTION_10_DOCUMENTS,
  partners: SECTION_11_PARTNERS,
  communication: SECTION_12_COMMUNICATION,
};

export const STARTER_PACK_TEMPLATES: StarterPackTemplate[] = SECTION_ORDER.flatMap(
  (section) => SECTIONS[section],
);

/** Écarts entre la volumétrie annoncée et les sections réellement transcrites. */
export function starterPackGaps(): Array<{
  section: TemplateSectionKey;
  expected: number;
  actual: number;
}> {
  return SECTION_ORDER.map((section) => ({
    section,
    expected: EXPECTED_SECTION_COUNTS[section],
    actual: SECTIONS[section].length,
  })).filter((row) => row.expected !== row.actual);
}
