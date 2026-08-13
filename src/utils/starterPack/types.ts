export type TemplateSectionKey =
  | 'accounts'
  | 'onboarding'
  | 'signature'
  | 'kyc'
  | 'payments'
  | 'capitalCalls'
  | 'distributions'
  | 'redemptions'
  | 'secondary'
  | 'documents'
  | 'partners'
  | 'communication';

export type TemplateRecipient = 'investor' | 'partner' | 'team';

/** Origine de l'envoi telle que qualifiée dans le référentiel. */
export type TemplateTrigger = 'auto' | 'manual' | 'mixed';

/** Variable qui enrichirait le mail mais n'est pas encore passée au point d'appel. */
export interface ProposedVariable {
  name: string;
  note: string;
}

export interface TemplateContent {
  subject: string;
  html: string;
}

export interface StarterPackTemplate {
  slug: string;
  name: string;
  section: TemplateSectionKey;
  recipient: TemplateRecipient;
  trigger: TemplateTrigger;
  /** Description du point d'envoi, reprise du référentiel. */
  origin: string;
  /** Variables vérifiées au point d'appel : réellement remplacées à l'envoi. */
  variables: string[];
  proposedVariables: ProposedVariable[];
  fr: TemplateContent;
  en: TemplateContent;
}
