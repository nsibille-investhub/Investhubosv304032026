import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Module {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface AppStoreContextType {
  modules: Module[];
  isModuleActive: (moduleName: string) => boolean;
  toggleModule: (moduleId: string) => void;
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
  { id: '10', name: 'Document AI', status: 'active' }
];

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [modules, setModules] = useState<Module[]>(defaultModules);

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

  return (
    <AppStoreContext.Provider value={{ modules, isModuleActive, toggleModule }}>
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
