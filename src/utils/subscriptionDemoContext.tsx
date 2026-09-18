import React, { createContext, useContext, useMemo, useState } from 'react';

/**
 * Etat de demonstration de la fiche souscription.
 *
 * La V1 fait dependre l'ecran de trois familles de conditions : l'etat du
 * dossier, le parametrage client / fonds et les droits back-office. La maquette
 * n'a pas de backend : ces conditions sont exposees ici pour rester lisibles,
 * un panneau masque le restant a travers le selecteur au lieu de disparaitre du
 * code.
 */
export type SubscriptionDemoStateId =
  | 'inProgress'
  | 'awaitingInternalValidation'
  | 'validatedAwaitingSignature'
  | 'signing'
  | 'active'
  | 'transferred';

export const SUBSCRIPTION_DEMO_STATES: SubscriptionDemoStateId[] = [
  'inProgress',
  'awaitingInternalValidation',
  'validatedAwaitingSignature',
  'signing',
  'active',
  'transferred',
];

export type IntegrationKey = 'dotfile' | 'dynamo' | 'flaminem' | 'dealfabric' | 'lemonway';

export const INTEGRATION_KEYS: IntegrationKey[] = [
  'dotfile',
  'dynamo',
  'flaminem',
  'dealfabric',
  'lemonway',
];

/** Parametrage client / fonds : chaque drapeau masque un panneau entier. */
export interface SubscriptionDemoSettings {
  internalValidation: boolean;
  riskEngine: boolean;
  externalRiskAnalysis: boolean;
  signatoriesPanel: boolean;
  partnerSignature: boolean;
  directSignaturePartner: boolean;
  screeningCommentRequired: boolean;
  scoreRefresh: boolean;
  counterSignatoryChoice: boolean;
  integrations: Record<IntegrationKey, boolean>;
}

/** Droits back-office de l'utilisateur connecte. */
export interface SubscriptionDemoRights {
  validateFund: boolean;
  validateCompliance: boolean;
  screening: boolean;
}

/** Contexte du dossier lui-meme, hors etat d'avancement. */
export interface SubscriptionDemoContextFlags {
  deferredProcessing: boolean;
  administered: boolean;
  subscriptionTypeSet: boolean;
  transferOrigin: boolean;
}

export interface SubscriptionDemoConfig {
  state: SubscriptionDemoStateId;
  settings: SubscriptionDemoSettings;
  rights: SubscriptionDemoRights;
  flags: SubscriptionDemoContextFlags;
}

export const DEFAULT_DEMO_CONFIG: SubscriptionDemoConfig = {
  state: 'inProgress',
  settings: {
    internalValidation: true,
    riskEngine: true,
    externalRiskAnalysis: true,
    signatoriesPanel: true,
    partnerSignature: true,
    directSignaturePartner: false,
    screeningCommentRequired: true,
    scoreRefresh: true,
    counterSignatoryChoice: true,
    integrations: {
      dotfile: true,
      dynamo: true,
      flaminem: true,
      dealfabric: true,
      lemonway: true,
    },
  },
  rights: {
    validateFund: true,
    validateCompliance: true,
    screening: true,
  },
  flags: {
    deferredProcessing: false,
    administered: false,
    subscriptionTypeSet: false,
    transferOrigin: false,
  },
};

export const SUBSCRIPTION_DEMO_STATE_LABEL_KEYS: Record<SubscriptionDemoStateId, string> = {
  inProgress: 'subscriptions.detail.demo.states.inProgress',
  awaitingInternalValidation: 'subscriptions.detail.demo.states.awaitingInternalValidation',
  validatedAwaitingSignature: 'subscriptions.detail.demo.states.validatedAwaitingSignature',
  signing: 'subscriptions.detail.demo.states.signing',
  active: 'subscriptions.detail.demo.states.active',
  transferred: 'subscriptions.detail.demo.states.transferred',
};

export const INTEGRATION_LABELS: Record<IntegrationKey, string> = {
  dotfile: 'Dotfile',
  dynamo: 'Dynamo',
  flaminem: 'Flaminem',
  dealfabric: 'DealFabric',
  lemonway: 'Lemonway',
};

/** Le type de souscription est pose d'office des que le dossier a avance. */
export function isSubscriptionTypeSet(config: SubscriptionDemoConfig): boolean {
  return config.flags.subscriptionTypeSet || config.state !== 'inProgress';
}

interface SubscriptionDemoContextValue {
  config: SubscriptionDemoConfig;
  setState: (state: SubscriptionDemoStateId) => void;
  setSetting: <K extends keyof SubscriptionDemoSettings>(
    key: K,
    value: SubscriptionDemoSettings[K],
  ) => void;
  setIntegration: (key: IntegrationKey, value: boolean) => void;
  setRight: (key: keyof SubscriptionDemoRights, value: boolean) => void;
  setFlag: (key: keyof SubscriptionDemoContextFlags, value: boolean) => void;
  reset: () => void;
}

const SubscriptionDemoContext = createContext<SubscriptionDemoContextValue | undefined>(undefined);

export function SubscriptionDemoProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SubscriptionDemoConfig>(DEFAULT_DEMO_CONFIG);

  const value = useMemo<SubscriptionDemoContextValue>(
    () => ({
      config,
      setState: state => setConfig(prev => ({ ...prev, state })),
      setSetting: (key, next) =>
        setConfig(prev => ({ ...prev, settings: { ...prev.settings, [key]: next } })),
      setIntegration: (key, next) =>
        setConfig(prev => ({
          ...prev,
          settings: { ...prev.settings, integrations: { ...prev.settings.integrations, [key]: next } },
        })),
      setRight: (key, next) =>
        setConfig(prev => ({ ...prev, rights: { ...prev.rights, [key]: next } })),
      setFlag: (key, next) =>
        setConfig(prev => ({ ...prev, flags: { ...prev.flags, [key]: next } })),
      reset: () => setConfig(DEFAULT_DEMO_CONFIG),
    }),
    [config],
  );

  return (
    <SubscriptionDemoContext.Provider value={value}>{children}</SubscriptionDemoContext.Provider>
  );
}

export function useSubscriptionDemo(): SubscriptionDemoContextValue {
  const context = useContext(SubscriptionDemoContext);
  if (!context) {
    throw new Error('useSubscriptionDemo must be used within a SubscriptionDemoProvider');
  }
  return context;
}
