import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Module {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

export type AggregationCriterion = 'investor' | 'subscription' | 'fund';
export type AggregationScope = 'none' | 'generic' | 'nominative' | 'both';

export interface PublicationCenterSettings {
  teamsEnabled: boolean;
  aggregationCriteria: AggregationCriterion[];
  aggregationScope: AggregationScope;
}

export interface MailRedirectState {
  enabled: boolean;
  emails: string[];
}

interface AppStoreContextType {
  modules: Module[];
  isModuleActive: (moduleName: string) => boolean;
  toggleModule: (moduleId: string) => void;
  publicationCenterSettings: PublicationCenterSettings;
  updatePublicationCenterSettings: (patch: Partial<PublicationCenterSettings>) => void;
  mailRedirect: MailRedirectState;
  setMailRedirect: (state: MailRedirectState) => void;
}

const AppStoreContext = createContext<AppStoreContextType | undefined>(undefined);

const defaultModules: Module[] = [
  { id: '1', name: 'Compliance Plus', status: 'active' }, // Activé par défaut
  { id: '2', name: 'KYC Advanced', status: 'active' },
  { id: '3', name: 'Lemonway', status: 'active' },
  { id: '4', name: 'Harvest', status: 'inactive' },
  { id: '5', name: 'DocuSign', status: 'active' },
  { id: '6', name: 'Mailjet', status: 'active' },
  { id: '7', name: 'Analytics Pro', status: 'inactive' },
  { id: '8', name: 'WorldCheck', status: 'inactive' },
  { id: '9', name: 'Twilio SMS', status: 'inactive' },
  { id: '10', name: 'Document AI', status: 'active' },
  { id: '11', name: 'Centre de Publication', status: 'active' }
];

const defaultPublicationCenterSettings: PublicationCenterSettings = {
  teamsEnabled: true,
  aggregationCriteria: ['investor'],
  aggregationScope: 'nominative',
};

const defaultMailRedirect: MailRedirectState = {
  enabled: true,
  emails: ['test@investhub.cloud'],
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<Module[]>(defaultModules);
  const [publicationCenterSettings, setPublicationCenterSettings] =
    useState<PublicationCenterSettings>(defaultPublicationCenterSettings);
  const [mailRedirect, setMailRedirect] =
    useState<MailRedirectState>(defaultMailRedirect);

  const isModuleActive = (moduleName: string): boolean => {
    const module = modules.find(m => m.name === moduleName);
    return module?.status === 'active';
  };

  const toggleModule = (moduleId: string) => {
    setModules(prevModules =>
      prevModules.map(module =>
        module.id === moduleId
          ? { ...module, status: module.status === 'active' ? 'inactive' : 'active' }
          : module
      )
    );
  };

  const updatePublicationCenterSettings = (patch: Partial<PublicationCenterSettings>) => {
    setPublicationCenterSettings(prev => ({ ...prev, ...patch }));
  };

  return (
    <AppStoreContext.Provider
      value={{
        modules,
        isModuleActive,
        toggleModule,
        publicationCenterSettings,
        updatePublicationCenterSettings,
        mailRedirect,
        setMailRedirect,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppStoreContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
}
